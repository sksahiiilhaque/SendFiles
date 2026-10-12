import crypto from 'node:crypto';
import { getDatabase } from '../config/database.js';
import { config } from '../config/index.js';
import { getStorageService } from './storage/storageInterface.js';
import { generateUniqueCode } from './codeGenerator.js';
import {
  generateTransferId,
  generateSenderToken,
  hashToken,
  verifyToken,
  sanitizeFilename
} from '../utils/cryptoUtils.js';
import { logger } from '../utils/logger.js';

class TransferService {
  get db() {
    return getDatabase();
  }

  get storage() {
    return getStorageService();
  }

  async createTransfer({ files, expiryHours = 34, serverOrigin = '' }) {
    const db = this.db;
    const transferId = generateTransferId();
    const code = generateUniqueCode(db);
    const senderToken = generateSenderToken();
    const senderTokenHash = hashToken(senderToken);

    const hours = Number(expiryHours) || config.transferExpirationHours;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();
    const nowIso = now.toISOString();

    const totalFiles = files.length;
    let totalSizeBytes = 0;

    const fileEntries = [];

    // Precalculate sizes and prepare file structures
    for (const f of files) {
      const fileId = `f_${crypto.randomBytes(8).toString('hex')}`;
      const sizeBytes = Number(f.size);
      totalSizeBytes += sizeBytes;
      const sanitizedName = sanitizeFilename(f.name);
      const storageKey = `${transferId}/${fileId}-${sanitizedName}`;
      const totalParts = Math.max(1, Math.ceil(sizeBytes / config.multipartChunkSizeBytes));

      fileEntries.push({
        id: fileId,
        originalName: f.name,
        sanitizedName,
        mimeType: f.type || 'application/octet-stream',
        sizeBytes,
        storageKey,
        totalParts
      });
    }

    // Insert transfer record
    const insertTransfer = db.prepare(`
      INSERT INTO transfers (
        id, code, sender_token_hash, status, total_files, total_size_bytes,
        expires_at, created_at, updated_at
      ) VALUES (?, ?, ?, 'uploading', ?, ?, ?, ?, ?)
    `);

    insertTransfer.run(
      transferId,
      code,
      senderTokenHash,
      totalFiles,
      totalSizeBytes,
      expiresAt,
      nowIso,
      nowIso
    );

    // Initialize multipart upload for each file in storage service
    const insertFile = db.prepare(`
      INSERT INTO files (
        id, transfer_id, original_name, sanitized_name, mime_type,
        size_bytes, storage_key, upload_id, status, total_parts,
        uploaded_parts, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'uploading', ?, 0, ?)
    `);

    const clientFiles = [];

    for (const f of fileEntries) {
      let uploadId = null;
      try {
        const initResult = await this.storage.initiateMultipartUpload({
          storageKey: f.storageKey,
          mimeType: f.mimeType,
          filename: f.sanitizedName
        });
        uploadId = initResult.uploadId;
      } catch (err) {
        logger.error('Failed to initiate multipart upload for file', {
          file: f.sanitizedName,
          error: err.message
        });
        throw new Error(`Failed to initialize upload session for "${f.originalName}": ${err.message}`);
      }

      insertFile.run(
        f.id,
        transferId,
        f.originalName,
        f.sanitizedName,
        f.mimeType,
        f.sizeBytes,
        f.storageKey,
        uploadId,
        f.totalParts,
        nowIso
      );

      clientFiles.push({
        id: f.id,
        name: f.sanitizedName,
        originalName: f.originalName,
        size: f.sizeBytes,
        mimeType: f.mimeType,
        uploadId,
        totalParts: f.totalParts,
        chunkSize: config.multipartChunkSizeBytes
      });
    }

    logger.info('Created new transfer session', { transferId, code, totalFiles, totalSizeBytes });

    return {
      transferId,
      code,
      senderToken, // Returned only once to sender for authorization
      expiresAt,
      totalFiles,
      totalSizeBytes,
      chunkSize: config.multipartChunkSizeBytes,
      files: clientFiles
    };
  }

  async getPartUploadUrl({ transferId, fileId, partNumber, senderToken, serverOrigin }) {
    const db = this.db;
    const transfer = db.prepare('SELECT * FROM transfers WHERE id = ?').get(transferId);

    if (!transfer) {
      throw { statusCode: 404, userMessage: 'Transfer not found' };
    }

    if (!verifyToken(senderToken, transfer.sender_token_hash)) {
      throw { statusCode: 403, userMessage: 'Invalid sender authorization token' };
    }

    if (transfer.status !== 'uploading') {
      throw { statusCode: 400, userMessage: `Transfer is not in uploading state (current: ${transfer.status})` };
    }

    const file = db.prepare('SELECT * FROM files WHERE id = ? AND transfer_id = ?').get(fileId, transferId);
    if (!file) {
      throw { statusCode: 404, userMessage: 'File not found in this transfer' };
    }

    const pNum = Number(partNumber);
    if (isNaN(pNum) || pNum < 1 || pNum > file.total_parts) {
      throw { statusCode: 400, userMessage: `Invalid part number: ${partNumber} (total parts: ${file.total_parts})` };
    }

    const uploadUrl = await this.storage.getPartUploadUrl({
      storageKey: file.storage_key,
      uploadId: file.upload_id,
      partNumber: pNum,
      serverOrigin
    });

    return {
      partNumber: pNum,
      uploadUrl
    };
  }

  async completeFileUpload({ transferId, fileId, parts, senderToken }) {
    const db = this.db;
    const transfer = db.prepare('SELECT * FROM transfers WHERE id = ?').get(transferId);

    if (!transfer) {
      throw { statusCode: 404, userMessage: 'Transfer not found' };
    }

    if (!verifyToken(senderToken, transfer.sender_token_hash)) {
      throw { statusCode: 403, userMessage: 'Invalid sender authorization token' };
    }

    const file = db.prepare('SELECT * FROM files WHERE id = ? AND transfer_id = ?').get(fileId, transferId);
    if (!file) {
      throw { statusCode: 404, userMessage: 'File not found' };
    }

    if (file.status === 'completed') {
      return { success: true, message: 'File was already marked completed' };
    }

    // Complete in storage service
    await this.storage.completeMultipartUpload({
      storageKey: file.storage_key,
      uploadId: file.upload_id,
      parts
    });

    // Update database
    const nowIso = new Date().toISOString();
    db.prepare(`
      UPDATE files 
      SET status = 'completed', uploaded_parts = ?, completed_at = ?
      WHERE id = ?
    `).run(parts.length, nowIso, fileId);

    logger.info('File upload completed', { transferId, fileId, filename: file.sanitized_name });

    return { success: true, fileId };
  }

  async finalizeTransfer({ transferId, senderToken }) {
    const db = this.db;
    const transfer = db.prepare('SELECT * FROM transfers WHERE id = ?').get(transferId);

    if (!transfer) {
      throw { statusCode: 404, userMessage: 'Transfer not found' };
    }

    if (!verifyToken(senderToken, transfer.sender_token_hash)) {
      throw { statusCode: 403, userMessage: 'Invalid sender authorization token' };
    }

    // Verify all files are completed
    const pendingFiles = db.prepare(`
      SELECT count(*) as count FROM files 
      WHERE transfer_id = ? AND status != 'completed'
    `).get(transferId);

    if (pendingFiles.count > 0) {
      throw {
        statusCode: 400,
        userMessage: `Cannot finalize transfer: ${pendingFiles.count} file(s) are still uploading or unconfirmed.`
      };
    }

    const nowIso = new Date().toISOString();
    db.prepare(`
      UPDATE transfers 
      SET status = 'ready', completed_at = ?, updated_at = ?
      WHERE id = ?
    `).run(nowIso, nowIso, transferId);

    logger.info('Transfer finalized and ready for receivers', { transferId, code: transfer.code });

    return {
      success: true,
      status: 'ready',
      code: transfer.code,
      transferId: transfer.id,
      expiresAt: transfer.expires_at
    };
  }

  async getTransferByCode(code) {
    const db = this.db;
    const transfer = db.prepare('SELECT * FROM transfers WHERE code = ?').get(code);

    if (!transfer) {
      throw { statusCode: 404, userMessage: 'Transfer code not found. Please verify the code and try again.' };
    }

    return this.validateAndFormatTransfer(transfer);
  }

  async getTransferById(transferId) {
    const db = this.db;
    const transfer = db.prepare('SELECT * FROM transfers WHERE id = ?').get(transferId);

    if (!transfer) {
      throw { statusCode: 404, userMessage: 'Transfer not found or has expired.' };
    }

    return this.validateAndFormatTransfer(transfer);
  }

  validateAndFormatTransfer(transfer) {
    const now = new Date();
    const expiresAt = new Date(transfer.expires_at);

    if (now > expiresAt || transfer.status === 'expired') {
      throw { statusCode: 410, userMessage: 'This transfer has expired and is no longer available.' };
    }

    if (transfer.status === 'revoked') {
      throw { statusCode: 410, userMessage: 'This transfer was revoked or cancelled by the sender.' };
    }

    if (transfer.status !== 'ready') {
      throw {
        statusCode: 400,
        userMessage: 'This transfer is still being uploaded by the sender. Please try again in a moment.'
      };
    }

    const files = this.db
      .prepare(`
        SELECT id, sanitized_name, original_name, mime_type, size_bytes 
        FROM files 
        WHERE transfer_id = ? AND status = 'completed'
      `)
      .all(transfer.id);

    return {
      transferId: transfer.id,
      code: transfer.code,
      expiresAt: transfer.expires_at,
      totalFiles: transfer.total_files,
      totalSizeBytes: transfer.total_size_bytes,
      files: files.map((f) => ({
        id: f.id,
        name: f.sanitized_name,
        originalName: f.original_name,
        size: f.size_bytes,
        mimeType: f.mime_type
      }))
    };
  }

  async getFileDownloadUrl({ transferId, fileId, serverOrigin }) {
    const db = this.db;
    const transfer = db.prepare('SELECT * FROM transfers WHERE id = ?').get(transferId);

    if (!transfer) {
      throw { statusCode: 404, userMessage: 'Transfer not found' };
    }

    const now = new Date();
    const expiresAt = new Date(transfer.expires_at);
    if (now > expiresAt || transfer.status !== 'ready') {
      throw { statusCode: 410, userMessage: 'This transfer is no longer available for download.' };
    }

    const file = db.prepare('SELECT * FROM files WHERE id = ? AND transfer_id = ?').get(fileId, transferId);
    if (!file || file.status !== 'completed') {
      throw { statusCode: 404, userMessage: 'File not found or upload was not completed' };
    }

    const downloadUrl = await this.storage.getDownloadUrl({
      storageKey: file.storage_key,
      filename: file.sanitized_name,
      mimeType: file.mime_type,
      serverOrigin
    });

    return {
      downloadUrl,
      filename: file.sanitized_name,
      size: file.size_bytes,
      mimeType: file.mime_type
    };
  }

  async revokeTransfer({ transferId, senderToken }) {
    const db = this.db;
    const transfer = db.prepare('SELECT * FROM transfers WHERE id = ?').get(transferId);

    if (!transfer) {
      throw { statusCode: 404, userMessage: 'Transfer not found' };
    }

    if (!verifyToken(senderToken, transfer.sender_token_hash)) {
      throw { statusCode: 403, userMessage: 'Invalid sender authorization token' };
    }

    const files = db.prepare('SELECT * FROM files WHERE transfer_id = ?').all(transferId);

    // Delete or abort all files in storage
    for (const f of files) {
      if (f.status === 'completed') {
        await this.storage.deleteObject({ storageKey: f.storage_key });
      } else if (f.upload_id) {
        await this.storage.abortMultipartUpload({ storageKey: f.storage_key, uploadId: f.upload_id });
      }
    }

    const nowIso = new Date().toISOString();
    db.prepare(`
      UPDATE transfers 
      SET status = 'revoked', updated_at = ?
      WHERE id = ?
    `).run(nowIso, transferId);

    logger.info('Transfer revoked by sender', { transferId, code: transfer.code });

    return { success: true, message: 'Transfer revoked and files deleted successfully.' };
  }
}

export const transferService = new TransferService();
