import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';
import { localStorageService } from './localStorageService.js';
import { r2StorageService } from './r2StorageService.js';

let storageInstance = null;

export function getStorageService() {
  if (storageInstance) {
    return storageInstance;
  }

  const provider = config.storageProvider;

  if (provider === 'r2' || provider === 's3' || provider === 'b2') {
    if (!config.r2.endpoint || !config.r2.accessKeyId || !config.r2.secretAccessKey) {
      logger.warn(
        'Cloudflare R2 / S3 credentials or endpoint are missing or incomplete in environment. Falling back to local storage adapter.'
      );
      storageInstance = localStorageService;
    } else {
      logger.info('Initializing S3/R2-compatible cloud object storage service');
      storageInstance = r2StorageService;
    }
  } else {
    logger.info('Using Local File System storage service for development');
    storageInstance = localStorageService;
  }

  return storageInstance;
}
