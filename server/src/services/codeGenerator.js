import crypto from 'node:crypto';
import { generateTransferCode } from '../utils/cryptoUtils.js';

/**
 * Generate a unique 6-digit transfer code that does not collide with active transfers
 */
export function generateUniqueCode(db) {
  const checkStmt = db.prepare(`
    SELECT id FROM transfers 
    WHERE code = ? AND status IN ('uploading', 'ready')
    LIMIT 1
  `);

  let code = '';
  let attempts = 0;
  const maxAttempts = 15;

  while (attempts < maxAttempts) {
    code = generateTransferCode();
    const existing = checkStmt.get(code);
    if (!existing) {
      return code;
    }
    attempts++;
  }

  // Fallback to 7-character alphanumeric if numeric space is unusually crowded
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let alphanumeric = '';
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    alphanumeric += chars[bytes[i] % chars.length];
  }
  return alphanumeric;
}
