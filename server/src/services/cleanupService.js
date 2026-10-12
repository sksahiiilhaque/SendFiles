import { getDatabase } from '../config/database.js';
import { getStorageService } from './storage/storageInterface.js';
import { logger } from '../utils/logger.js';

class CleanupService {
  get db() {
    return getDatabase();
  }

  get storage() {
    return getStorageService();
  }

  /**
   * Run full cleanup pass:
   * 1. Expire transfers that reached expires_at and delete their storage files
   * 2. Abort abandoned multipart upload sessions stuck in 'uploading' for > 4 hours
   */
  async runCleanup() {
    logger.info('Starting automated cleanup routine...');
    let expiredCount = 0;
    let abortedCount = 0;

    try {
      expiredCount = await this.cleanupExpiredTransfers();
      abortedCount = await this.cleanupAbandonedUploads();
      logger.info('Cleanup routine finished', { expiredTransfers: expiredCount, abortedUploads: abortedCount });
    } catch (err) {
      logger.error('Error during cleanup routine', { error: err.message });
    }

    return { expiredCount, abortedCount };
  }

  async cleanupExpiredTransfers() {
    const db = this.db;
    const nowIso = new Date().toISOString();

    // Find transfers that have expired but files haven't been purged
    const expiredTransfers = db.prepare(`
      SELECT id, code FROM transfers
      WHERE expires_at <= ? AND status NOT IN ('expired', 'purged')
      LIMIT 100
    `).all(nowIso);

    for (const t of expiredTransfers) {
      try {
        const files = db.prepare('SELECT id, storage_key, upload_id, status FROM files WHERE transfer_id = ?').all(t.id);

        for (const f of files) {
          if (f.status === 'completed') {
            await this.storage.deleteObject({ storageKey: f.storage_key });
          } else if (f.upload_id) {
            await this.storage.abortMultipartUpload({ storageKey: f.storage_key, uploadId: f.upload_id });
          }
        }

        // Mark as expired in DB
        db.prepare(`UPDATE transfers SET status = 'expired', updated_at = ? WHERE id = ?`).run(nowIso, t.id);
        logger.info('Purged expired transfer', { transferId: t.id, code: t.code });
      } catch (err) {
        logger.warn('Failed to clean up expired transfer files', { transferId: t.id, error: err.message });
      }
    }

    return expiredTransfers.length;
  }

  async cleanupAbandonedUploads() {
    const db = this.db;
    // Four hours ago
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();

    const abandonedTransfers = db.prepare(`
      SELECT id, code FROM transfers
      WHERE status = 'uploading' AND created_at <= ?
      LIMIT 50
    `).all(fourHoursAgo);

    for (const t of abandonedTransfers) {
      try {
        const files = db.prepare('SELECT id, storage_key, upload_id FROM files WHERE transfer_id = ? AND status = "uploading"').all(t.id);

        for (const f of files) {
          if (f.upload_id) {
            await this.storage.abortMultipartUpload({ storageKey: f.storage_key, uploadId: f.upload_id });
          }
        }

        db.prepare(`UPDATE transfers SET status = 'expired', updated_at = ? WHERE id = ?`).run(
          new Date().toISOString(),
          t.id
        );
        logger.info('Aborted abandoned upload session', { transferId: t.id });
      } catch (err) {
        logger.warn('Failed to abort abandoned transfer', { transferId: t.id, error: err.message });
      }
    }

    return abandonedTransfers.length;
  }

  startPeriodicCleanup(intervalMinutes = 15) {
    const intervalMs = intervalMinutes * 60 * 1000;
    logger.info(`Starting periodic cleanup scheduler (every ${intervalMinutes} minutes)`);

    // Run once on startup (after a short delay)
    setTimeout(() => {
      this.runCleanup().catch(() => {});
    }, 5000);

    // Then run on interval
    return setInterval(() => {
      this.runCleanup().catch(() => {});
    }, intervalMs);
  }
}

export const cleanupService = new CleanupService();
