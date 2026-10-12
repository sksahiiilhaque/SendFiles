import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { localStorageService } from '../services/storage/localStorageService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * Handle direct chunk upload for local storage adapter
 * Mirrors direct S3/R2 presigned PUT behavior
 */
router.put('/upload-part', async (req, res, next) => {
  try {
    const { uploadId, partNumber } = req.query;

    if (!uploadId || !partNumber) {
      return res.status(400).json({ error: 'Missing uploadId or partNumber query parameter' });
    }

    const { etag } = await localStorageService.savePartStream(uploadId, partNumber, req);

    // Provide ETag header exactly like S3 / Cloudflare R2
    res.setHeader('ETag', etag);
    res.setHeader('Access-Control-Expose-Headers', 'ETag');
    return res.status(200).json({ success: true, ETag: etag });
  } catch (err) {
    logger.error('Error in local upload part handler', { error: err.message });
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Handle direct file download for local storage adapter with Range support
 */
router.get('/download/:storageKey', (req, res, next) => {
  try {
    const { storageKey } = req.params;
    const requestedFilename = req.query.filename || path.basename(storageKey);

    const filePath = localStorageService.getFilePath(storageKey);
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on storage disk' });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(requestedFilename)}"`);
    res.setHeader('Accept-Ranges', 'bytes');

    if (range) {
      // Range support for pause/resume and large downloads
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        res.status(416).setHeader('Content-Range', `bytes */${fileSize}`);
        return res.end();
      }

      const chunksize = end - start + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Content-Length': chunksize,
        'Content-Type': 'application/octet-stream'
      });

      return fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'application/octet-stream'
      });

      return fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    logger.error('Error serving local download', { error: err.message });
    return res.status(500).json({ error: 'Failed to download file' });
  }
});

export default router;
