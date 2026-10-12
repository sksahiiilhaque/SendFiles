import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DownloadCloud,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileArchive,
  FileCode,
  FileAudio,
  Clock,
  ArrowRight,
  Download,
  AlertCircle,
  CheckCircle,
  Loader2,
  Camera,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { api } from '../utils/api';
import { formatBytes, formatExpiryCountdown, getFileCategory } from '../utils/formatters';
import { QrScannerModal } from './QrScannerModal';

export function ReceiveFiles({ initialCode, showToast }) {
  const [codeInput, setCodeInput] = useState(initialCode || '');
  const [loading, setLoading] = useState(false);
  const [transferData, setTransferData] = useState(null);
  const [error, setError] = useState(null);
  const [downloadingFileId, setDownloadingFileId] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    if (initialCode) {
      handleLookup(initialCode);
    }
  }, [initialCode]);

  const handleLookup = async (codeToSearch) => {
    const target = (codeToSearch || codeInput).trim().replace(/\s+/g, '');
    if (!target) {
      setError('Please enter a 6-digit transfer code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await api.getTransferByCode(target);
      setTransferData(data);
      setCodeInput(data.code);
    } catch (err) {
      setTransferData(null);
      setError(err.message || 'Failed to locate transfer. Please verify the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeScanned = (scannedCode) => {
    setIsScannerOpen(false);
    setCodeInput(scannedCode);
    showToast(`Scanned Code: ${scannedCode}`, 'success');
    handleLookup(scannedCode);
  };

  const downloadSingleFile = async (file) => {
    try {
      setDownloadingFileId(file.id);
      const { downloadUrl, filename } = await api.getFileDownloadUrl({
        transferId: transferData.transferId,
        fileId: file.id
      });

      // Trigger download via anchor element
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Downloading "${filename}"...`, 'info');
    } catch (err) {
      showToast(err.message || 'Download failed', 'error');
    } finally {
      setDownloadingFileId(null);
    }
  };

  const downloadAllFiles = async () => {
    if (!transferData || !transferData.files) return;
    showToast(`Starting download of ${transferData.files.length} files...`, 'info');

    for (let i = 0; i < transferData.files.length; i++) {
      const file = transferData.files[i];
      await downloadSingleFile(file);
      // Small pause between downloads to prevent browser blocking multiple downloads
      await new Promise((r) => setTimeout(r, 600));
    }
  };

  const renderFileIcon = (file) => {
    const cat = getFileCategory(file.name, file.mimeType);
    switch (cat) {
      case 'image':
        return <FileImage size={18} />;
      case 'video':
        return <FileVideo size={18} />;
      case 'audio':
        return <FileAudio size={18} />;
      case 'archive':
        return <FileArchive size={18} />;
      case 'code':
        return <FileCode size={18} />;
      case 'pdf':
        return <FileText size={18} />;
      default:
        return <File size={18} />;
    }
  };

  return (
    <motion.div
      className="transfer-panel futuristic-card"
      initial={{ opacity: 0, y: 25, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Code Input Header */}
      <form
        className="receive-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleLookup();
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
          <div className="protocol-badge" style={{ margin: '0 auto 0.75rem', display: 'inline-flex' }}>
            <Radio size={14} className="pulse-icon text-cyan" />
            <span>DISCOVERY VECTOR</span>
          </div>

          <h3 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            Retrieve <span className="text-gradient-cyan">Inbound Payload</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Enter the 6-digit access key or activate your camera to scan the optical QR vector.
          </p>
        </div>

        <div className="code-input-wrapper futuristic-input-wrapper">
          <input
            type="text"
            className="code-input futuristic-code-input"
            maxLength={10}
            placeholder="000 000"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9\s]*"
            value={codeInput}
            onChange={(e) => {
              setCodeInput(e.target.value);
              setError(null);
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <motion.button
            type="submit"
            className="btn btn-primary btn-lg glow-btn"
            disabled={loading || !codeInput.trim()}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <DownloadCloud size={20} />}
            <span>{loading ? 'Locating Vector...' : 'Retrieve Files'}</span>
          </motion.button>

          <motion.button
            type="button"
            className="btn btn-secondary btn-lg"
            onClick={() => setIsScannerOpen(true)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            title="Scan QR Code using device camera"
          >
            <Camera size={20} className="text-cyan" />
            <span>Scan QR Code</span>
          </motion.button>
        </div>
      </form>

      {/* Error state */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              marginTop: '1.5rem',
              padding: '1.1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: 'var(--accent-red)'
            }}
          >
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transfer Found State */}
      <AnimatePresence>
        {transferData && (
          <motion.div
            style={{ marginTop: '2rem' }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="receive-meta-card futuristic-meta-card">
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                  Payload Vector #{transferData.code}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                  {transferData.totalFiles} {transferData.totalFiles === 1 ? 'file' : 'files'} &bull;{' '}
                  {formatBytes(transferData.totalSizeBytes)}
                </div>
              </div>

              {/* Automatic 34h Protocol Countdown */}
              <div className="expiry-countdown futuristic-countdown" style={{ margin: 0 }}>
                <Clock size={15} className="text-cyan" />
                <span>Auto-Purge in {formatExpiryCountdown(transferData.expiresAt)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Decrypted Payload Files ({transferData.files.length})
              </span>
              {transferData.files.length > 1 && (
                <motion.button
                  className="btn btn-secondary"
                  onClick={downloadAllFiles}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem' }}
                >
                  <Download size={15} />
                  <span>Download All Payload</span>
                </motion.button>
              )}
            </div>

            <div>
              {transferData.files.map((file) => (
                <motion.div
                  key={file.id}
                  className="receive-file-item futuristic-receive-item"
                  whileHover={{ x: 4, borderColor: 'var(--primary)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', overflow: 'hidden' }}>
                    <div className="file-icon-box">{renderFileIcon(file)}</div>
                    <div style={{ overflow: 'hidden' }}>
                      <div className="file-name" title={file.originalName || file.name}>
                        {file.originalName || file.name}
                      </div>
                      <div className="file-meta">{formatBytes(file.size)}</div>
                    </div>
                  </div>

                  <motion.button
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    disabled={downloadingFileId === file.id}
                    onClick={() => downloadSingleFile(file)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {downloadingFileId === file.id ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Download size={15} />
                    )}
                    <span>{downloadingFileId === file.id ? 'Streaming...' : 'Download'}</span>
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera QR Scanner Modal */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onCodeScanned={handleCodeScanned}
      />
    </motion.div>
  );
}
