import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './index.js';
import { logger } from '../utils/logger.js';

let dbInstance = null;

export function getDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  // Ensure directory exists
  const dbDir = path.dirname(config.databasePath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  logger.info(`Opening SQLite database at ${config.databasePath}`);
  dbInstance = new DatabaseSync(config.databasePath);

  // Performance and integrity settings
  dbInstance.exec('PRAGMA journal_mode = WAL;');
  dbInstance.exec('PRAGMA foreign_keys = ON;');
  dbInstance.exec('PRAGMA busy_timeout = 5000;');

  initializeSchema(dbInstance);

  return dbInstance;
}

function initializeSchema(db) {
  // Transfers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transfers (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      sender_token_hash TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'uploading', -- 'uploading', 'ready', 'expired', 'revoked'
      total_files INTEGER NOT NULL DEFAULT 0,
      total_size_bytes INTEGER NOT NULL DEFAULT 0,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      completed_at TEXT,
      failed_attempts INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_transfers_code ON transfers(code);
    CREATE INDEX IF NOT EXISTS idx_transfers_expires_at ON transfers(expires_at);
    CREATE INDEX IF NOT EXISTS idx_transfers_status ON transfers(status);
  `);

  // Files table
  db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      transfer_id TEXT NOT NULL,
      original_name TEXT NOT NULL,
      sanitized_name TEXT NOT NULL,
      mime_type TEXT,
      size_bytes INTEGER NOT NULL,
      storage_key TEXT NOT NULL,
      upload_id TEXT,
      status TEXT NOT NULL DEFAULT 'uploading', -- 'uploading', 'completed', 'aborted', 'failed'
      total_parts INTEGER NOT NULL DEFAULT 1,
      uploaded_parts INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      completed_at TEXT,
      FOREIGN KEY (transfer_id) REFERENCES transfers(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_files_transfer_id ON files(transfer_id);
    CREATE INDEX IF NOT EXISTS idx_files_status ON files(status);
  `);

  logger.info('Database schema verified.');
}
