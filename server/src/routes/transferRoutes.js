import express from 'express';
import { transferController } from '../controllers/transferController.js';
import {
  validateCreateTransfer,
  validateTransferCode
} from '../middleware/validator.js';
import {
  codeLookupLimiter,
  createTransferLimiter
} from '../middleware/rateLimiter.js';

const router = express.Router();

// 1. Create a transfer session
router.post('/', createTransferLimiter, validateCreateTransfer, transferController.createTransfer);

// 2. Lookup transfer by 6-digit code (rate limited against brute force)
router.get('/by-code/:code', codeLookupLimiter, validateTransferCode, transferController.getTransferByCode);

// 3. Lookup transfer metadata by secure transfer ID (e.g. from share link)
router.get('/:id', transferController.getTransferById);

// 4. Get upload URL for a specific multipart part (sender only)
router.get('/:id/files/:fileId/part-url', transferController.getPartUploadUrl);

// 5. Complete multipart upload for a specific file (sender only)
router.post('/:id/files/:fileId/complete', transferController.completeFile);

// 6. Finalize transfer session once all files are uploaded
router.post('/:id/finalize', transferController.finalizeTransfer);

// 7. Get authorized download URL for a file in a ready transfer
router.get('/:id/files/:fileId/download-url', transferController.getFileDownloadUrl);

// 8. Revoke / delete transfer (sender only)
router.delete('/:id', transferController.revokeTransfer);
router.post('/:id/revoke', transferController.revokeTransfer);

export default router;
