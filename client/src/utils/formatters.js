/**
 * Format bytes into human-readable size (e.g., 4.2 MB, 1.8 GB)
 */
export function formatBytes(bytes, decimals = 1) {
  if (bytes === 0 || bytes === undefined || bytes === null) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const idx = Math.min(i, sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, idx)).toFixed(dm))} ${sizes[idx]}`;
}

/**
 * Format speed in bytes per second (e.g., 14.2 MB/s)
 */
export function formatSpeed(bytesPerSec) {
  if (!bytesPerSec || bytesPerSec <= 0) return '0 KB/s';
  return `${formatBytes(bytesPerSec, 1)}/s`;
}

/**
 * Format seconds remaining into friendly ETA string
 */
export function formatETA(seconds) {
  if (!seconds || !isFinite(seconds) || seconds < 0) return '--';
  const sec = Math.round(seconds);
  if (sec < 60) return `${sec}s remaining`;
  const mins = Math.floor(sec / 60);
  const remSec = sec % 60;
  if (mins < 60) return `${mins}m ${remSec}s remaining`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours}h ${remMins}m remaining`;
}

/**
 * Format expiry countdown from ISO date string
 */
export function formatExpiryCountdown(expiresAt) {
  if (!expiresAt) return '';
  const now = Date.now();
  const exp = new Date(expiresAt).getTime();
  const diffSec = Math.floor((exp - now) / 1000);

  if (diffSec <= 0) return 'Expired';
  const hours = Math.floor(diffSec / 3600);
  const mins = Math.floor((diffSec % 3600) / 60);
  if (hours > 0) return `Expires in ${hours}h ${mins}m`;
  return `Expires in ${mins}m`;
}

/**
 * Format 6-digit code with a middle space for readability (e.g. 583 912)
 */
export function formatCode(code) {
  if (!code) return '';
  const cleaned = String(code).trim().replace(/\s+/g, '');
  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  }
  return cleaned;
}

/**
 * Determine high-level file category for icons
 */
export function getFileCategory(name = '', mime = '') {
  const ext = name.split('.').pop().toLowerCase();
  const mimeLower = mime.toLowerCase();

  if (mimeLower.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
    return 'image';
  }
  if (mimeLower.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) {
    return 'video';
  }
  if (mimeLower.startsWith('audio/') || ['mp3', 'wav', 'flac', 'aac', 'm4a'].includes(ext)) {
    return 'audio';
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return 'archive';
  }
  if (ext === 'pdf' || mimeLower.includes('pdf')) {
    return 'pdf';
  }
  if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'java', 'c', 'cpp'].includes(ext)) {
    return 'code';
  }
  return 'file';
}
