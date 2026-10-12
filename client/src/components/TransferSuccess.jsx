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
      style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}
    >
      <motion.div
        className="success-badge-icon futuristic-success-badge"
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
        style={{ margin: '0 auto 1rem' }}
      >
        <CheckCircle size={44} />
      </motion.div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>
        Transfer <span className="text-gradient-cyan">Code</span>
      </h2>

      {/* Clean 6-Digit Transfer Code Display Box */}
      <motion.div
        className="code-box-wrapper futuristic-code-box"
        whileHover={{ scale: 1.015 }}
        transition={{ duration: 0.2 }}
        style={{ maxWidth: '420px', margin: '0 auto 1.5rem', padding: '1.75rem 1rem' }}
      >
        <div className="code-box-aura"></div>
        <div className="code-display neon-code" style={{ fontSize: '3rem', letterSpacing: '0.18em', margin: '0.5rem 0 1.25rem' }}>
          {formatCode(code)}
        </div>

        <div className="code-actions" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <motion.button
            className="btn btn-primary glow-btn"
            onClick={handleCopyCode}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ minWidth: '150px' }}
          >
            {copiedCode ? <Check size={18} /> : <Copy size={18} />}
            <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
          </motion.button>

          {onOpenQrModal && (
            <motion.button
              className="btn btn-secondary"
              onClick={onOpenQrModal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Show QR Code"
            >
              <QrCode size={18} />
              <span>QR Code</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Clean Send Another Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
        <motion.button
          className="btn btn-secondary"
          onClick={onReset}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <RotateCcw size={16} />
          <span>Send Another File</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
