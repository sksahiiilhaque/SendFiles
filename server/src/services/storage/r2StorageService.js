import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  GetObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';

class R2StorageService {
  constructor() {
    this.client = null;
  }

  getClient() {
    if (!this.client) {
      if (!config.r2.endpoint || !config.r2.accessKeyId || !config.r2.secretAccessKey) {
        throw new Error('Cloudflare R2 / S3 credentials and endpoint are not configured');
      }

      this.client = new S3Client({
        region: config.r2.region || 'auto',
        endpoint: config.r2.endpoint,
        forcePathStyle: config.r2.forcePathStyle,
        credentials: {
          accessKeyId: config.r2.accessKeyId,
          secretAccessKey: config.r2.secretAccessKey
        }
      });
    }
    return this.client;
  }

  async initiateMultipartUpload({ storageKey, mimeType, filename }) {
    const client = this.getClient();
    const command = new CreateMultipartUploadCommand({
      Bucket: config.r2.bucketName,
      Key: storageKey,
      ContentType: mimeType || 'application/octet-stream',
      ContentDisposition: `attachment; filename="${encodeURIComponent(filename)}"`
    });

    const response = await client.send(command);
    logger.info('Initiated R2 multipart upload', { storageKey, uploadId: response.UploadId });
    return { uploadId: response.UploadId };
  }

  async getPartUploadUrl({ storageKey, uploadId, partNumber }) {
    const client = this.getClient();
    const command = new UploadPartCommand({
      Bucket: config.r2.bucketName,
      Key: storageKey,
      UploadId: uploadId,
      PartNumber: Number(partNumber)
    });

    // 1-hour presigned URL for uploading this part directly from the browser
    const url = await getSignedUrl(client, command, { expiresIn: 3600 });
    return url;
  }

  async completeMultipartUpload({ storageKey, uploadId, parts }) {
    const client = this.getClient();
    // Format and sort parts
    const formattedParts = parts
      .map((p) => ({
        PartNumber: Number(p.PartNumber || p.partNumber),
        ETag: p.ETag || p.etag
      }))
      .sort((a, b) => a.PartNumber - b.PartNumber);

    const command = new CompleteMultipartUploadCommand({
      Bucket: config.r2.bucketName,
      Key: storageKey,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: formattedParts
      }
    });

    const result = await client.send(command);
    logger.info('Completed R2 multipart upload', { storageKey, uploadId });
    return { location: result.Location, key: result.Key };
  }

  async abortMultipartUpload({ storageKey, uploadId }) {
    if (!uploadId) return;
    try {
      const client = this.getClient();
      const command = new AbortMultipartUploadCommand({
        Bucket: config.r2.bucketName,
        Key: storageKey,
        UploadId: uploadId
      });
      await client.send(command);
      logger.info('Aborted R2 multipart upload', { storageKey, uploadId });
    } catch (err) {
      logger.warn('Failed to abort R2 multipart upload', { storageKey, uploadId, error: err.message });
    }
  }

  async getDownloadUrl({ storageKey, filename, mimeType }) {
    const client = this.getClient();
    const command = new GetObjectCommand({
      Bucket: config.r2.bucketName,
      Key: storageKey,
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(filename)}"`,
      ResponseContentType: mimeType || 'application/octet-stream'
    });

    // 1-hour presigned direct download URL
    const url = await getSignedUrl(client, command, { expiresIn: 3600 });
    return url;
  }

  async deleteObject({ storageKey }) {
    try {
      const client = this.getClient();
      const command = new DeleteObjectCommand({
        Bucket: config.r2.bucketName,
        Key: storageKey
      });
      await client.send(command);
      logger.info('Deleted R2 object', { storageKey });
    } catch (err) {
      logger.error('Failed to delete R2 object', { storageKey, error: err.message });
    }
  }
}

export const r2StorageService = new R2StorageService();
