import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Copy,
  Check,
  QrCode,
  Clock,
  Trash2,
  Share2,
  RotateCcw,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCode, formatExpiryCountdown } from '../utils/formatters';

export function TransferSuccess({
  transferData,
  onReset,
  onDeleteTransfer,
  onOpenQrModal,
  showToast
}) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { code, transferId, expiresAt, totalFiles, totalSizeBytes } = transferData;

  // Build direct receiver link
  const shareableUrl = `${window.location.origin}/?code=${code}`;

  useEffect(() => {
    // Fire celebratory holographic confetti
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B']
      });
    } catch {}
  }, []);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      showToast('6-Digit Code Copied!', 'success');
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      showToast(`Code: ${code}`, 'info');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopiedLink(true);
      showToast('Direct Link Copied!', 'success');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      showToast('Failed to copy link', 'error');
    }
  };

  return (
    <motion.div
      className="transfer-panel futuristic-card success-card"
      initial={{ opacity: 0, scale: 0.94, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="success-badge-icon futuristic-success-badge"
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
      >
        <CheckCircle size={40} />
      </motion.div>

      <h2 className="success-title">
        Quantum Upload <span className="text-gradient-cyan">Secured & Ready</span>
      </h2>
      <p className="success-subtitle">
        Your payload is staged. Share the 6-digit cryptographic key, direct link, or camera QR vector.
      </p>

      {/* Holographic 6-Digit Transfer Code Display Box */}
      <motion.div
        className="code-box-wrapper futuristic-code-box"
        whileHover={{ scale: 1.015 }}
        transition={{ duration: 0.2 }}
      >
        <div className="code-box-aura"></div>
        <div className="code-box-label">6-DIGIT ACCESS VECTOR</div>
        <div className="code-display neon-code">{formatCode(code)}</div>

        <div className="code-actions">
          <motion.button
            className="btn btn-primary glow-btn"
            onClick={handleCopyCode}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {copiedCode ? <Check size={18} /> : <Copy size={18} />}
            <span>{copiedCode ? 'Copied Key!' : 'Copy Code'}</span>
          </motion.button>

          <motion.button
            className="btn btn-secondary"
            onClick={onOpenQrModal}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <QrCode size={18} />
            <span>Optical QR Vector</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Share Link Input */}
      <div className="share-link-box futuristic-share-box">
        <input
          type="text"
          className="share-link-input"
          readOnly
          value={shareableUrl}
          onClick={(e) => e.target.select()}
        />
        <motion.button
          className="btn btn-secondary"
          onClick={handleCopyLink}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          style={{ padding: '0.45rem 0.95rem' }}
        >
          {copiedLink ? <Check size={16} /> : <Copy size={16} />}
          <span>{copiedLink ? 'Copied' : 'Copy'}</span>
        </motion.button>
      </div>

      {/* Built-in 34-Hour Retention Indicator */}
      <div className="expiry-countdown futuristic-countdown">
        <Clock size={16} className="text-cyan" />
        <span>Built-in 34h Protocol: {formatExpiryCountdown(expiresAt)}</span>
      </div>

      {/* Bottom Sender Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
        <motion.button
          className="btn btn-secondary"
          onClick={onReset}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <RotateCcw size={16} />
          <span>Stage New Transfer</span>
        </motion.button>

        <motion.button
          className="btn btn-danger"
          onClick={() => {
            if (window.confirm('Wipe and destroy this transfer immediately? Recipient will no longer be able to download.')) {
              onDeleteTransfer();
            }
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Trash2 size={16} />
          <span>Immediate Cryptographic Wipe</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
