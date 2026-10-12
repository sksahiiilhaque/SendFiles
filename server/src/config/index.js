import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  // Storage
  storageProvider: (process.env.STORAGE_PROVIDER || 'local').toLowerCase(),
  localStorageDir: path.resolve(process.cwd(), process.env.LOCAL_STORAGE_DIR || './data/storage'),

  // Database
  databasePath: path.resolve(process.cwd(), process.env.DATABASE_PATH || './data/sendfiles.db'),

  // Cloudflare R2 / S3
  r2: {
    accountId: process.env.R2_ACCOUNT_ID || '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '',
    bucketName: process.env.R2_BUCKET_NAME || process.env.S3_BUCKET_NAME || 'sendfiles-bucket',
    customDomain: process.env.R2_CUSTOM_DOMAIN || '',
    region: process.env.S3_REGION || 'auto',
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    get endpoint() {
      if (process.env.S3_ENDPOINT) {
        return process.env.S3_ENDPOINT;
      }
      return this.accountId
        ? `https://${this.accountId}.r2.cloudflarestorage.com`
        : '';
    }
  },

  // Free Tier Keep-Alive / Self Ping (Keeps free instances like Render/Koyeb awake 24/7)
  selfPingUrl: process.env.SELF_PING_URL || '',
  selfPingIntervalMinutes: parseInt(process.env.SELF_PING_INTERVAL_MINUTES || '14', 10),

  // Limits & Defaults
  maxFileSizeBytes: parseInt(process.env.MAX_FILE_SIZE_BYTES || '5368709120', 10), // 5 GB
  multipartChunkSizeBytes: parseInt(process.env.MULTIPART_CHUNK_SIZE_BYTES || '10485760', 10), // 10 MB
  transferExpirationHours: parseInt(process.env.TRANSFER_EXPIRATION_HOURS || '34', 10),

  // Rate Limiting
  rateLimitCodeMax: parseInt(process.env.RATE_LIMIT_CODE_MAX || '20', 10),
  rateLimitCodeWindowMinutes: parseInt(process.env.RATE_LIMIT_CODE_WINDOW_MINUTES || '15', 10),

  // Security
  securitySecret: process.env.SECURITY_SECRET || 'default-sendfiles-secret-key-change-me'
};
