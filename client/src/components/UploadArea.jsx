import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileArchive,
  FileCode,
  FileAudio,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Send
} from 'lucide-react';
import { formatBytes, getFileCategory } from '../utils/formatters';

const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5 GB

export function UploadArea({ onStartUpload, showToast }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFilesAdded = (filesList) => {
    const newFiles = Array.from(filesList);
    const validFiles = [];

    for (const file of newFiles) {
      if (file.size > MAX_FILE_SIZE) {
        showToast(`"${file.name}" exceeds the 5 GB file limit.`, 'error');
        continue;
      }
      // Check duplicate
      const exists = selectedFiles.some(
        (f) => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified
      );
      if (!exists) {
        validFiles.push(file);
      }
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = () => {
    if (selectedFiles.length === 0) {
      showToast('Please select at least one file to upload.', 'error');
      return;
    }
    // Hardcoded built-in 34 hours automatic expiration!
    onStartUpload({ files: selectedFiles, expiryHours: 34 });
  };

  const totalSize = selectedFiles.reduce((acc, f) => acc + f.size, 0);

  const renderFileIcon = (file) => {
    const cat = getFileCategory(file.name, file.type);
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
      {/* Hidden native file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files) handleFilesAdded(e.target.files);
        }}
        multiple
        style={{ display: 'none' }}
      />

      {/* Drag & Drop Area */}
      <motion.div
        className={`dropzone futuristic-dropzone ${isDragActive ? 'drag-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.995 }}
      >
        <div className="dropzone-glow-aura"></div>

        <motion.div
          className="dropzone-icon-wrapper futuristic-icon-wrapper"
          animate={isDragActive ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <UploadCloud size={40} />
        </motion.div>

        <h3 className="dropzone-title">
          Drop Files to <span className="text-gradient-cyan">Stream Quantum Chunks</span>
        </h3>
        <p className="dropzone-sub">
          Click to browse or drag high-res videos, raw assets, archives up to 5 GB
        </p>

        <div className="dropzone-limits">
          <span className="limit-pill">5 GB Per File</span>
          <span className="dot-sep">&bull;</span>
          <span className="limit-pill">Multi-Part Chunking</span>
          <span className="dot-sep">&bull;</span>
          <span className="limit-pill highlight-cyan">Automatic 34h Purge</span>
        </div>
      </motion.div>

      {/* Selected Files Queue */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            className="files-queue"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="queue-list" style={{ marginTop: '1rem' }}>
              <AnimatePresence>
                {selectedFiles.map((file, idx) => (
                  <motion.div
                    key={`${file.name}-${file.size}-${idx}`}
                    className="queue-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="queue-item-info">
                      <div className="file-icon-box">{renderFileIcon(file)}</div>
                      <div className="file-text">
                        <div className="file-name" title={file.name}>
                          {file.name}
                        </div>
                        <div className="file-meta">{formatBytes(file.size)}</div>
                      </div>
                    </div>
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(idx);
                      }}
                      title="Remove file"
                    >
                      <Trash2 size={16} color="var(--accent-red)" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Clean Send Button */}
            <div className="queue-controls" style={{ display: 'flex', justifyContent: 'center', marginTop: '1.25rem' }}>
              <motion.button
                className="btn btn-primary btn-lg glow-btn"
                onClick={handleSend}
                whileHover={{ scale: 1.03, boxShadow: '0 0 25px var(--primary-glow)' }}
                whileTap={{ scale: 0.97 }}
                style={{ width: '100%', maxWidth: '280px', fontSize: '1.15rem', fontWeight: 800, padding: '0.9rem 2rem' }}
              >
                <Send size={20} />
                <span>Send</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
