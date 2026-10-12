import { config } from '../config/index.js';

export function validateCreateTransfer(req, res, next) {
  const { files, expiryHours } = req.body;

  if (!files || !Array.isArray(files) || files.length === 0) {
    return res.status(400).json({
      error: 'Invalid request: "files" array is required and must contain at least one file.'
    });
  }

  if (files.length > 50) {
    return res.status(400).json({
      error: 'Cannot upload more than 50 files in a single transfer.'
    });
  }

  let totalBytes = 0;

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    if (!f.name || typeof f.name !== 'string' || f.name.trim() === '') {
      return res.status(400).json({
        error: `File at index ${i} has an invalid or missing filename.`
      });
    }

    const size = Number(f.size);
    if (isNaN(size) || size <= 0) {
      return res.status(400).json({
        error: `File "${f.name}" has an invalid size.`
      });
    }

    if (size > config.maxFileSizeBytes) {
      const maxGb = config.maxFileSizeBytes / (1024 * 1024 * 1024);
      return res.status(400).json({
        error: `File "${f.name}" exceeds the maximum allowed size of ${maxGb} GB.`
      });
    }

    totalBytes += size;
  }

  if (expiryHours !== undefined) {
    const parsedExpiry = Number(expiryHours);
    if (isNaN(parsedExpiry) || parsedExpiry < 1 || parsedExpiry > 168) {
      return res.status(400).json({
        error: 'Expiry hours must be an integer between 1 and 168 (7 days).'
      });
    }
  }

  next();
}

export function validateTransferCode(req, res, next) {
  const code = (req.params.code || req.body.code || '').trim().replace(/\s+/g, '');

  if (!code || code.length < 4 || code.length > 12 || !/^[a-zA-Z0-9]+$/.test(code)) {
    return res.status(400).json({
      error: 'Invalid transfer code format. Please enter a valid 6-character code.'
    });
  }

  req.cleanCode = code.toUpperCase();
  next();
}

export function validateSenderToken(req, res, next) {
  const token = req.headers['x-sender-token'] || req.query.senderToken || req.body.senderToken;

  if (!token || typeof token !== 'string') {
    return res.status(401).json({
      error: 'Sender authorization token is required for this action.'
    });
  }

  req.senderToken = token.trim();
  next();
}
