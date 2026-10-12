import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, XCircle, Activity, Zap, Cpu } from 'lucide-react';
import { formatBytes, formatSpeed, formatETA } from '../utils/formatters';

export function UploadProgress({ progress, onPause, onResume, onCancel }) {
  const {
    percent,
    uploadedBytes,
    totalBytes,
    speedBytesPerSec,
    etaSeconds,
    currentFileName,
    currentFileIndex,
    totalFiles,
    isPaused
  } = progress;

  return (
    <motion.div
      className="transfer-panel futuristic-card progress-panel"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="progress-header">
        <div className="protocol-badge" style={{ margin: '0 auto 0.75rem', display: 'inline-flex' }}>
          <Activity size={14} className="pulse-icon text-cyan" />
          <span>{isPaused ? 'TRANSMISSION PAUSED' : 'ACTIVE DIRECT BEAM TRANSMISSION'}</span>
        </div>

        <h3 className="progress-title">
          {isPaused ? 'Transmission On Hold' : 'Streaming Payload to Cloud'}
        </h3>
        <p className="progress-subtitle">
          {currentFileName
            ? `Chunking and uploading [${currentFileIndex + 1}/${totalFiles}]: ${currentFileName}`
            : 'Initiating multipart handshake...'}
        </p>
      </div>

      {/* Cybernetic Progress Bar with Glow */}
      <div className="progress-bar-container futuristic-progress-bar">
        <motion.div
          className="progress-bar-fill futuristic-fill"
          style={{ width: `${percent}%` }}
          animate={{
            boxShadow: isPaused
              ? 'none'
              : ['0 0 10px rgba(6, 182, 212, 0.5)', '0 0 25px rgba(99, 102, 241, 0.8)', '0 0 10px rgba(6, 182, 212, 0.5)']
          }}
          transition={{ repeat: Infinity, duration: 2 }}
        ></motion.div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.92rem', fontWeight: 600 }}>
        <span className="text-cyan">{percent}% Synthesized</span>
        <span style={{ color: 'var(--text-secondary)' }}>
          {formatBytes(uploadedBytes)} <span style={{ opacity: 0.6 }}>/</span> {formatBytes(totalBytes)}
        </span>
      </div>

      {/* Futuristic Metrics HUD */}
      <div className="progress-metrics-grid futuristic-hud">
        <div className="metric-item">
          <div className="metric-label">Throughput Rate</div>
          <div className="metric-value">{isPaused ? 'Paused' : formatSpeed(speedBytesPerSec)}</div>
        </div>
        <div className="metric-item">
          <div className="metric-label">Estimated Horizon</div>
          <div className="metric-value">{isPaused ? '--' : formatETA(etaSeconds)}</div>
        </div>
        <div className="metric-item">
          <div className="metric-label">Payload Unit</div>
          <div className="metric-value">
            {currentFileIndex + 1} / {totalFiles}
          </div>
        </div>
      </div>

      {/* Heavy Interaction Controls */}
      <div className="progress-controls">
        {isPaused ? (
          <motion.button
            className="btn btn-primary"
            onClick={onResume}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <Play size={18} />
            <span>Resume Stream</span>
          </motion.button>
        ) : (
          <motion.button
            className="btn btn-secondary"
            onClick={onPause}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <Pause size={18} />
            <span>Pause Stream</span>
          </motion.button>
        )}

        <motion.button
          className="btn btn-danger"
          onClick={onCancel}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <XCircle size={18} />
          <span>Abort Transfer</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
