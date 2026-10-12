import crypto from 'node:crypto';
import path from 'node:path';
import { config } from '../config/index.js';

/**
 * Generate a cryptographically secure unique transfer ID (e.g. tr_a83f9e2b0c1d)
 */
export function generateTransferId() {
  return `tr_${crypto.randomBytes(12).toString('hex')}`;
}

/**
 * Generate a 6-digit easy-to-share transfer code (e.g., 492817)
 */
export function generateTransferCode() {
  // Generate random integer between 100000 and 999999
  const num = crypto.randomInt(100000, 1000000);
  return String(num);
}

/**
 * Generate a cryptographically secure sender management token
 */
export function generateSenderToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a sender token using HMAC-SHA256
 */
export function hashToken(token) {
  return crypto
    .createHmac('sha256', config.securitySecret)
    .update(token)
    .digest('hex');
}

/**
 * Verify a token against a stored hash using timing-safe comparison
 */
export function verifyToken(token, storedHash) {
  if (!token || !storedHash) return false;
  try {
    const computedHash = hashToken(token);
    const computedBuf = Buffer.from(computedHash, 'hex');
    const storedBuf = Buffer.from(storedHash, 'hex');
    if (computedBuf.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(computedBuf, storedBuf);
  } catch {
    return false;
  }
}

/**
 * Sanitize filename to prevent path traversal and shell injection
 */
export function sanitizeFilename(originalName) {
  if (!originalName || typeof originalName !== 'string') {
    return 'unnamed_file';
  }

  // Remove any directory path indicators (both unix and windows)
  const baseName = path.basename(originalName);

  // Replace invalid/dangerous characters with underscore
  let safeName = baseName.replace(/[\/\\?%*:|"<>]/g, '_').trim();

  // Remove leading dots to prevent hidden file exploits
  safeName = safeName.replace(/^\.+/, '');

  if (!safeName) {
    safeName = `file_${Date.now()}`;
  }

  // Truncate to reasonable max length (200 chars) while preserving extension
  if (safeName.length > 200) {
    const ext = path.extname(safeName);
    const nameWithoutExt = safeName.slice(0, 200 - ext.length);
    safeName = `${nameWithoutExt}${ext}`;
  }

  return safeName;
}
