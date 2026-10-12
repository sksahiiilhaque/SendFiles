import { api } from './api.js';

/**
 * Robust, memory-efficient Multipart Uploader with pause, resume, cancel,
 * retryable chunks, and real-time throughput / ETA calculation.
 */
export class MultipartUploader {
  constructor({ files, transferSession, onProgress, onFileComplete, onComplete, onError }) {
    this.domFiles = files; // Array of File objects
    this.session = transferSession;
    this.onProgress = onProgress || (() => {});
    this.onFileComplete = onFileComplete || (() => {});
    this.onComplete = onComplete || (() => {});
    this.onError = onError || (() => {});

    this.isPaused = false;
    this.isCancelled = false;
    this.currentXhr = null;

    // Track total bytes uploaded across all parts and files
    this.totalBytes = files.reduce((acc, f) => acc + f.size, 0);
    this.uploadedBytes = 0;
    this.fileUploadedBytes = {}; // fileId -> bytes uploaded so far
    this.currentPartProgress = 0; // Bytes of current in-flight chunk

    // Metrics for speed and ETA
    this.startTime = null;
    this.lastSpeedCheckTime = null;
    this.lastSpeedCheckBytes = 0;
    this.currentSpeed = 0; // bytes/sec

    // Queue state
    this.currentFileIndex = 0;
    this.currentPartNumber = 1;
    this.completedPartsByFile = {}; // fileId -> [{ PartNumber, ETag }]
  }

  start() {
    this.startTime = Date.now();
    this.lastSpeedCheckTime = this.startTime;
    this.lastSpeedCheckBytes = 0;
    this.isPaused = false;
    this.isCancelled = false;
    this.runUploadLoop();
  }

  pause() {
    if (this.isPaused || this.isCancelled) return;
    this.isPaused = true;
    if (this.currentXhr) {
      this.currentXhr.abort();
      this.currentXhr = null;
    }
    this.emitProgress();
  }

  resume() {
    if (!this.isPaused || this.isCancelled) return;
    this.isPaused = false;
    this.lastSpeedCheckTime = Date.now();
    this.lastSpeedCheckBytes = this.uploadedBytes;
    this.runUploadLoop();
  }

  cancel() {
    this.isCancelled = true;
    this.isPaused = false;
    if (this.currentXhr) {
      this.currentXhr.abort();
      this.currentXhr = null;
    }
    // Attempt backend cleanup
    api.revokeTransfer({
      transferId: this.session.transferId,
      senderToken: this.session.senderToken
    }).catch(() => {});
  }

  async runUploadLoop() {
    try {
      while (this.currentFileIndex < this.session.files.length) {
        if (this.isPaused || this.isCancelled) return;

        const fileMeta = this.session.files[this.currentFileIndex];
        const domFile = this.domFiles[this.currentFileIndex];

        if (!this.completedPartsByFile[fileMeta.id]) {
          this.completedPartsByFile[fileMeta.id] = [];
        }

        const partsList = this.completedPartsByFile[fileMeta.id];

        // Upload parts for this file
        while (this.currentPartNumber <= fileMeta.totalParts) {
          if (this.isPaused || this.isCancelled) return;

          const partNum = this.currentPartNumber;
          const chunkSize = this.session.chunkSize;
          const start = (partNum - 1) * chunkSize;
          const end = Math.min(start + chunkSize, domFile.size);
          const chunkBlob = domFile.slice(start, end);

          // Get presigned PUT URL
          const { uploadUrl } = await api.getPartUploadUrl({
            transferId: this.session.transferId,
            fileId: fileMeta.id,
            partNumber: partNum,
            senderToken: this.session.senderToken
          });

          // Upload chunk with retries
          const etag = await this.uploadChunkWithRetry(uploadUrl, chunkBlob, 3);
          partsList.push({ PartNumber: partNum, ETag: etag });

          // Chunk successfully finished
          this.uploadedBytes += chunkBlob.size;
          this.currentPartProgress = 0;
          this.currentPartNumber++;
          this.emitProgress();
        }

        // File is finished - call backend complete multipart
        await api.completeFile({
          transferId: this.session.transferId,
          fileId: fileMeta.id,
          parts: partsList,
          senderToken: this.session.senderToken
        });

        this.onFileComplete(this.currentFileIndex, fileMeta);

        // Move to next file
        this.currentFileIndex++;
        this.currentPartNumber = 1;
      }

      // All files finished! Finalize transfer
      const finalizeRes = await api.finalizeTransfer({
        transferId: this.session.transferId,
        senderToken: this.session.senderToken
      });

      this.onComplete(finalizeRes);
    } catch (err) {
      if (!this.isCancelled) {
        this.onError(err);
      }
    }
  }

  uploadChunkWithRetry(url, blob, maxRetries = 3) {
    let attempt = 0;

    const doUpload = () => {
      return new Promise((resolve, reject) => {
        if (this.isPaused || this.isCancelled) {
          return reject(new Error('Upload interrupted'));
        }

        const xhr = new XMLHttpRequest();
        this.currentXhr = xhr;

        xhr.open('PUT', url, true);

        // Track byte-level progress of current chunk
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            this.currentPartProgress = e.loaded;
            this.emitProgress();
          }
        };

        xhr.onload = () => {
          this.currentXhr = null;
          if (xhr.status >= 200 && xhr.status < 300) {
            let etag = xhr.getResponseHeader('ETag');
            if (!etag) {
              try {
                const parsed = JSON.parse(xhr.responseText);
                etag = parsed.ETag || parsed.etag;
              } catch {}
            }
            if (!etag) {
              etag = `"${Date.now()}"`;
            }
            resolve(etag);
          } else {
            reject(new Error(`Server responded with HTTP ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          this.currentXhr = null;
          reject(new Error('Network error uploading chunk'));
        };

        xhr.onabort = () => {
          this.currentXhr = null;
          reject(new Error('Upload aborted'));
        };

        xhr.send(blob);
      });
    };

    const tryAttempt = async () => {
      try {
        return await doUpload();
      } catch (err) {
        if (this.isPaused || this.isCancelled) {
          throw err;
        }
        attempt++;
        if (attempt < maxRetries) {
          // Exponential backoff wait
          await new Promise((res) => setTimeout(res, 1000 * Math.pow(2, attempt - 1)));
          return tryAttempt();
        }
        throw err;
      }
    };

    return tryAttempt();
  }

  emitProgress() {
    const totalCurrentUploaded = Math.min(
      this.totalBytes,
      this.uploadedBytes + this.currentPartProgress
    );

    const now = Date.now();
    const timeDelta = (now - this.lastSpeedCheckTime) / 1000;

    if (timeDelta >= 0.5) {
      const bytesDelta = totalCurrentUploaded - this.lastSpeedCheckBytes;
      this.currentSpeed = Math.max(0, bytesDelta / timeDelta);
      this.lastSpeedCheckTime = now;
      this.lastSpeedCheckBytes = totalCurrentUploaded;
    }

    const remainingBytes = Math.max(0, this.totalBytes - totalCurrentUploaded);
    const etaSeconds = this.currentSpeed > 0 ? remainingBytes / this.currentSpeed : 0;
    const percent = this.totalBytes > 0 ? Math.min(100, (totalCurrentUploaded / this.totalBytes) * 100) : 0;

    this.onProgress({
      uploadedBytes: totalCurrentUploaded,
      totalBytes: this.totalBytes,
      percent: Math.round(percent),
      speedBytesPerSec: this.currentSpeed,
      etaSeconds,
      currentFileIndex: this.currentFileIndex,
      totalFiles: this.domFiles.length,
      currentFileName: this.domFiles[this.currentFileIndex]?.name || '',
      isPaused: this.isPaused,
      isCancelled: this.isCancelled
    });
  }
}
