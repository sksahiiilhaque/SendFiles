import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';

class LocalStorageService {
  constructor() {
    this.baseDir = config.localStorageDir;
    this.filesDir = path.join(this.baseDir, 'files');
    this.tempDir = path.join(this.baseDir, 'temp');

    this.ensureDirs();
  }

  ensureDirs() {
    if (!fs.existsSync(this.filesDir)) {
      fs.mkdirSync(this.filesDir, { recursive: true });
    }
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  getSafeKeyPath(storageKey) {
    // Sanitize storageKey to prevent path traversal
    const safeKey = path.basename(storageKey);
    return path.join(this.filesDir, safeKey);
  }

  async initiateMultipartUpload({ storageKey, mimeType, filename }) {
    this.ensureDirs();
    const uploadId = `loc_upl_${crypto.randomBytes(16).toString('hex')}`;
    const uploadTempDir = path.join(this.tempDir, uploadId);
    fs.mkdirSync(uploadTempDir, { recursive: true });

    // Store metadata
    fs.writeFileSync(
      path.join(uploadTempDir, 'meta.json'),
      JSON.stringify({ storageKey, mimeType, filename, createdAt: Date.now() })
    );

    return { uploadId };
  }

  async getPartUploadUrl({ storageKey, uploadId, partNumber, serverOrigin = '' }) {
    // Returns local API route where the browser can directly PUT or POST the binary part
    return `${serverOrigin}/api/local-storage/upload-part?uploadId=${encodeURIComponent(uploadId)}&partNumber=${partNumber}&storageKey=${encodeURIComponent(storageKey)}`;
  }

  async savePartStream(uploadId, partNumber, readableStream) {
    const uploadTempDir = path.join(this.tempDir, path.basename(uploadId));
    if (!fs.existsSync(uploadTempDir)) {
      throw new Error('Upload session expired or not found');
    }

    const partPath = path.join(uploadTempDir, `part_${partNumber}`);
    const hash = crypto.createHash('md5');
    const writeStream = fs.createWriteStream(partPath);

    // Pipe stream through hash and write to disk
    for await (const chunk of readableStream) {
      hash.update(chunk);
      writeStream.write(chunk);
    }
    await new Promise((resolve, reject) => {
      writeStream.end((err) => (err ? reject(err) : resolve()));
    });

    const etag = `"${hash.digest('hex')}"`;
    return { etag };
  }

  async completeMultipartUpload({ storageKey, uploadId, parts }) {
    const uploadTempDir = path.join(this.tempDir, path.basename(uploadId));
    if (!fs.existsSync(uploadTempDir)) {
      throw new Error('Upload session expired or not found');
    }

    const finalFilePath = this.getSafeKeyPath(storageKey);
    const writeStream = fs.createWriteStream(finalFilePath);

    // Sort parts by PartNumber ascending
    const sortedParts = [...parts].sort((a, b) => Number(a.PartNumber) - Number(b.PartNumber));

    for (const part of sortedParts) {
      const partPath = path.join(uploadTempDir, `part_${part.PartNumber}`);
      if (!fs.existsSync(partPath)) {
        writeStream.destroy();
        throw new Error(`Missing upload part #${part.PartNumber}`);
      }

      const readStream = fs.createReadStream(partPath);
      await pipeline(readStream, writeStream, { end: false });
    }

    await new Promise((resolve, reject) => {
      writeStream.end((err) => (err ? reject(err) : resolve()));
    });

    // Clean up temporary chunks
    try {
      fs.rmSync(uploadTempDir, { recursive: true, force: true });
    } catch (cleanupErr) {
      logger.warn('Failed to clean up temp parts dir', { uploadId, error: cleanupErr.message });
    }

    return { location: storageKey, key: storageKey };
  }

  async abortMultipartUpload({ storageKey, uploadId }) {
    if (!uploadId) return;
    const uploadTempDir = path.join(this.tempDir, path.basename(uploadId));
    if (fs.existsSync(uploadTempDir)) {
      try {
        fs.rmSync(uploadTempDir, { recursive: true, force: true });
      } catch (err) {
        logger.warn('Error aborting local multipart upload', { uploadId, error: err.message });
      }
    }
  }

  async getDownloadUrl({ storageKey, filename, mimeType, serverOrigin = '' }) {
    return `${serverOrigin}/api/local-storage/download/${encodeURIComponent(storageKey)}?filename=${encodeURIComponent(filename)}`;
  }

  async deleteObject({ storageKey }) {
    const filePath = this.getSafeKeyPath(storageKey);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        logger.info(`Deleted local storage file: ${storageKey}`);
      } catch (err) {
        logger.error(`Failed to delete local storage file: ${storageKey}`, { error: err.message });
      }
    }
  }

  getFilePath(storageKey) {
    const safePath = this.getSafeKeyPath(storageKey);
    if (fs.existsSync(safePath)) {
      return safePath;
    }
    return null;
  }
}

export const localStorageService = new LocalStorageService();
