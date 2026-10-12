import React, { useEffect, useRef } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import QRCode from 'qrcode';
import { formatCode } from '../utils/formatters';

export function QrCodeModal({ code, isOpen, onClose }) {
  const canvasRef = useRef(null);
  const shareUrl = `${window.location.origin}/?code=${code}`;

  useEffect(() => {
    if (isOpen && canvasRef.current && code) {
      QRCode.toCanvas(
        canvasRef.current,
        shareUrl,
        {
          width: 240,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        },
        (error) => {
          if (error) console.error('Failed to render QR Code', error);
        }
      );
    }
  }, [isOpen, code, shareUrl]);

  if (!isOpen) return null;

  const downloadQrImage = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = `sendfiles-qr-${code}.png`;
    a.href = url;
    a.click();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="btn btn-ghost btn-icon"
          style={{ position: 'absolute', top: '1rem', right: '1rem' }}
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
          <Smartphone size={24} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Scan with Phone</h3>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Point your iPhone or Android camera at this QR code to download files directly.
        </p>

        <div className="qr-canvas-container">
          <canvas ref={canvasRef}></canvas>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.25rem' }}>
          {formatCode(code)}
        </div>

        <button className="btn btn-secondary" onClick={downloadQrImage} style={{ width: '100%' }}>
          <Download size={16} />
          <span>Save QR Code Image</span>
        </button>
      </div>
    </div>
  );
}
