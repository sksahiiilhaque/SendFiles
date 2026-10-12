import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, DownloadCloud } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { UploadArea } from './components/UploadArea';
import { UploadProgress } from './components/UploadProgress';
import { TransferSuccess } from './components/TransferSuccess';
import { ReceiveFiles } from './components/ReceiveFiles';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { QrCodeModal } from './components/QrCodeModal';
import { Toast } from './components/Toast';
import { MultipartUploader } from './utils/multipartUploader';
import { api } from './utils/api';

export function App() {
  const [activeTab, setActiveTab] = useState('send'); // 'send' | 'receive'
  const [initialReceiveCode, setInitialReceiveCode] = useState('');

  // Upload workflow state: 'idle' | 'uploading' | 'success'
  const [uploadState, setUploadState] = useState('idle');
  const [uploadProgress, setUploadProgress] = useState({
    percent: 0,
    uploadedBytes: 0,
    totalBytes: 0,
    speedBytesPerSec: 0,
    etaSeconds: 0,
    currentFileName: '',
    currentFileIndex: 0,
    totalFiles: 0,
    isPaused: false
  });
  const [completedTransfer, setCompletedTransfer] = useState(null);
  const uploaderRef = useRef(null);

  // QR Code Modal
  const [qrModalCode, setQrModalCode] = useState(null);

  // Toast Notification state
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Inspect URL query params on mount for shared codes (e.g. ?code=839210) or ?tab=receive/admin
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    const tabParam = params.get('tab');
    if (codeParam) {
      setInitialReceiveCode(codeParam);
      setActiveTab('receive');
    } else if (tabParam === 'receive' || window.location.pathname.includes('/receive')) {
      setActiveTab('receive');
    } else if (tabParam === 'admin' || window.location.pathname.includes('/admin')) {
      setActiveTab('admin');
    }
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    try {
      const url = new URL(window.location.href);
      if (tab === 'receive') {
        url.searchParams.set('tab', 'receive');
      } else if (tab === 'admin') {
        url.searchParams.set('tab', 'admin');
        url.searchParams.delete('code');
      } else {
        url.searchParams.delete('tab');
        url.searchParams.delete('code');
      }
      window.history.replaceState(null, '', url.pathname + url.search);
    } catch {}
  };

  // Upload Lifecycle Handlers
  const handleStartUpload = async ({ files, expiryHours }) => {
    try {
      setUploadState('uploading');
      showToast('Initiating secure transfer session...', 'info');

      // 1. Create transfer on backend
      const fileMetas = files.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type
      }));

      const session = await api.createTransfer({
        files: fileMetas,
        expiryHours
      });

      // 2. Initialize Multipart Uploader
      const uploader = new MultipartUploader({
        files,
        transferSession: session,
        onProgress: (prog) => {
          setUploadProgress(prog);
        },
        onFileComplete: (fIndex, fMeta) => {
          showToast(`Uploaded "${fMeta.name}"`, 'success');
        },
        onComplete: (finalizeRes) => {
          setCompletedTransfer({
            ...session,
            ...finalizeRes
          });
          setUploadState('success');
          showToast('All files uploaded successfully!', 'success');
        },
        onError: (err) => {
          showToast(err.message || 'Upload encountered an error', 'error');
          setUploadState('idle');
        }
      });

      uploaderRef.current = uploader;
      uploader.start();
    } catch (err) {
      showToast(err.message || 'Failed to start upload session', 'error');
      setUploadState('idle');
    }
  };

  const handlePauseUpload = () => {
    if (uploaderRef.current) {
      uploaderRef.current.pause();
    }
  };

  const handleResumeUpload = () => {
    if (uploaderRef.current) {
      uploaderRef.current.resume();
    }
  };

  const handleCancelUpload = () => {
    if (window.confirm('Are you sure you want to cancel this upload?')) {
      if (uploaderRef.current) {
        uploaderRef.current.cancel();
      }
      setUploadState('idle');
      showToast('Upload cancelled', 'info');
    }
  };

  const handleDeleteTransfer = async () => {
    if (!completedTransfer) return;
    try {
      await api.revokeTransfer({
        transferId: completedTransfer.transferId,
        senderToken: completedTransfer.senderToken
      });
      showToast('Transfer deleted and files purged.', 'success');
      handleResetUpload();
    } catch (err) {
      showToast(err.message || 'Failed to delete transfer', 'error');
    }
  };

  const handleResetUpload = () => {
    uploaderRef.current = null;
    setCompletedTransfer(null);
    setUploadState('idle');
  };

  const scrollToTransfer = () => {
    const el = document.getElementById('transfer-area');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div className="bg-ambient"></div>
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          handleTabChange(tab);
          if (tab !== 'admin') {
            scrollToTransfer();
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      />

      <main>
        <AnimatePresence mode="wait">
          {activeTab === 'admin' ? (
            <motion.div
              key="admin-page-view"
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ minHeight: '80vh', padding: '2rem 0 4rem' }}
            >
              <div className="container">
                <AdminPanel showToast={showToast} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="main-transfer-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <Hero
                onSendClick={() => {
                  handleTabChange('send');
                  scrollToTransfer();
                }}
                onReceiveClick={() => {
                  handleTabChange('receive');
                  scrollToTransfer();
                }}
              />

              <section id="transfer-area" style={{ padding: '1rem 0 3rem' }}>
                <div className="container">
                  {/* Mode Tabs Switcher with Sliding Spring Pill */}
                  <div className="mode-tabs futuristic-mode-tabs">
                    <button
                      type="button"
                      className={`mode-tab-btn ${activeTab === 'send' ? 'active' : ''}`}
                      onClick={() => handleTabChange('send')}
                    >
                      {activeTab === 'send' && (
                        <motion.div
                          layoutId="activeModePill"
                          className="mode-tab-bg-pill"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                      <span className="tab-label-content">
                        <UploadCloud size={18} />
                        <span>Send Files</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`mode-tab-btn ${activeTab === 'receive' ? 'active' : ''}`}
                      onClick={() => handleTabChange('receive')}
                    >
                      {activeTab === 'receive' && (
                        <motion.div
                          layoutId="activeModePill"
                          className="mode-tab-bg-pill"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                      <span className="tab-label-content">
                        <DownloadCloud size={18} />
                        <span>Receive Files</span>
                      </span>
                    </button>
                  </div>

                  {/* Active Mode Content with Smooth Presence Transitions */}
                  <AnimatePresence mode="wait">
                    {activeTab === 'send' ? (
                      <motion.div
                        key="send-mode-view"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3 }}
                      >
                        {uploadState === 'idle' && (
                          <UploadArea onStartUpload={handleStartUpload} showToast={showToast} />
                        )}
                        {uploadState === 'uploading' && (
                          <UploadProgress
                            progress={uploadProgress}
                            onPause={handlePauseUpload}
                            onResume={handleResumeUpload}
                            onCancel={handleCancelUpload}
                          />
                        )}
                        {uploadState === 'success' && completedTransfer && (
                          <TransferSuccess
                            transferData={completedTransfer}
                            onReset={handleResetUpload}
                            onDeleteTransfer={handleDeleteTransfer}
                            onOpenQrModal={() => setQrModalCode(completedTransfer.code)}
                            showToast={showToast}
                          />
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="receive-mode-view"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ReceiveFiles initialCode={initialReceiveCode} showToast={showToast} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />

      {/* QR Code Scan Modal */}
      <QrCodeModal
        code={qrModalCode}
        isOpen={Boolean(qrModalCode)}
        onClose={() => setQrModalCode(null)}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
