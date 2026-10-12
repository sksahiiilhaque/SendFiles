import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, AlertCircle, RefreshCw } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

export function QrScannerModal({ isOpen, onClose, onCodeScanned }) {
  const [errorMsg, setErrorMsg] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    setErrorMsg(null);
    setIsScanning(true);

    const scannerId = 'qr-reader-viewfinder';
    const html5QrCode = new Html5Qrcode(scannerId);
    scannerRef.current = html5QrCode;

    const qrConfig = {
      fps: 12,
      qrbox: (viewfinderWidth, viewfinderHeight) => {
        const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
        const edge = Math.max(180, Math.floor(minEdge * 0.72));
        return { width: edge, height: edge };
      },
      aspectRatio: 1.0
    };

    const handleSuccess = (decodedText) => {
      // Extract code if the decoded text is a full URL or a raw code
      let parsedCode = decodedText.trim();
      try {
        if (decodedText.includes('code=')) {
          const url = new URL(decodedText);
          const c = url.searchParams.get('code');
          if (c) parsedCode = c;
        } else if (decodedText.includes('/t/')) {
          const parts = decodedText.split('/t/');
          if (parts[1]) parsedCode = parts[1].split('/')[0];
        }
      } catch {}

      // Clean code
      parsedCode = parsedCode.replace(/\s+/g, '').toUpperCase();

      // Stop scanner and notify parent
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current = null;
            setIsScanning(false);
            onCodeScanned(parsedCode);
          });
      } else {
        onCodeScanned(parsedCode);
      }
    };

    const handleError = (err) => {
      // Normal frame-by-frame non-match, ignore
    };

    // Start scanner with rear camera if available, fallback to user camera
    html5QrCode
      .start({ facingMode: 'environment' }, qrConfig, handleSuccess, handleError)
      .catch((err) => {
        // Fallback to any available camera
        html5QrCode
          .start({ facingMode: 'user' }, qrConfig, handleSuccess, handleError)
          .catch((finalErr) => {
            setErrorMsg(
              'Unable to access camera. Please allow camera permissions in your browser or enter the 6-digit code manually.'
            );
            setIsScanning(false);
          });
      });

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().catch(() => {});
        } catch {}
        scannerRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .catch(() => {})
        .finally(() => {
          scannerRef.current = null;
          onClose();
        });
    } else {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <button
          className="btn btn-ghost btn-icon"
          style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}
          onClick={handleClose}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
          <Camera size={24} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Scan Transfer QR Code</h3>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1rem' }}>
          Point your camera at the QR code displayed on the sender's screen.
        </p>

        {errorMsg ? (
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: 'var(--accent-red)',
              fontSize: '0.9rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              margin: '1rem 0'
            }}
          >
            <AlertCircle size={24} />
            <span>{errorMsg}</span>
          </div>
        ) : (
          <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000000', margin: '0.5rem 0' }}>
            <div id="qr-reader-viewfinder" style={{ width: '100%' }}></div>
          </div>
        )}

        <button className="btn btn-secondary" onClick={handleClose} style={{ width: '100%', marginTop: '0.75rem' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
