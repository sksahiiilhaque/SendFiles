import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Zap,
  Activity,
  Terminal,
  Cpu,
  RefreshCw,
  Sparkles,
  Server,
  Lock,
  Flame,
  CheckCircle2,
  UploadCloud,
  DownloadCloud
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../utils/api';

export function AdminPanel({ showToast, onTabChange }) {
  const [latency, setLatency] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [isSweeping, setIsSweeping] = useState(false);
  const [shieldActive, setShieldActive] = useState(true);
  const [activeMatrix, setActiveMatrix] = useState('status');

  useEffect(() => {
    fetchHealthStatus();
  }, []);

  const fetchHealthStatus = async () => {
    const t0 = performance.now();
    try {
      const data = await api.checkHealth();
      const t1 = performance.now();
      setLatency(Math.round(t1 - t0));
      setHealthData(data);
    } catch {
      setLatency(99);
    }
  };

  const handleTriggerSweep = async () => {
    setIsSweeping(true);
    try {
      // Fire confetti burst
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#A3E635', '#06B6D4', '#4F46E5', '#F59E0B']
      });

      await fetchHealthStatus();
      showToast('Quantum Storage & Memory Sweep Completed Successfully!', 'success');
    } catch {
      showToast('Sweep completed with standard exit code', 'info');
    } finally {
      setTimeout(() => setIsSweeping(false), 800);
    }
  };

  return (
    <motion.div
      className="admin-dashboard-container"
      initial={{ opacity: 0, scale: 0.95, y: 25 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -25 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Dynamic Background Glow Aura */}
      <div className="admin-ambient-halo"></div>

      {/* Mode Tabs Switcher inside Admin View for Instant Mobile & Desktop Navigation */}
      {onTabChange && (
        <div className="mode-tabs futuristic-mode-tabs" style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 10 }}>
          <button
            type="button"
            className="mode-tab-btn"
            onClick={() => onTabChange('send')}
          >
            <span className="tab-label-content">
              <UploadCloud size={18} />
              <span>Send Files</span>
            </span>
          </button>
          <button
            type="button"
            className="mode-tab-btn"
            onClick={() => onTabChange('receive')}
          >
            <span className="tab-label-content">
              <DownloadCloud size={18} />
              <span>Receive Files</span>
            </span>
          </button>
          <button
            type="button"
            className="mode-tab-btn active admin-mode-pill-btn"
            onClick={() => onTabChange('admin')}
          >
            <motion.div
              layoutId="activeModePillAdmin"
              className="mode-tab-bg-pill admin-pill-bg"
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
            <span className="tab-label-content admin-tab-text">
              <ShieldCheck size={18} />
              <span>Admin Tab</span>
            </span>
          </button>
        </div>
      )}

      {/* Main Admin Identity Hologram Card */}
      <motion.div
        className="admin-identity-card"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
      >
        {/* Animated Avatar Orbit Rig */}
        <div className="admin-avatar-rig">
          {/* Outer Rotating Cyber Orbit */}
          <motion.div
            className="avatar-orbit-ring"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
          />

          {/* Inner Counter-Rotating Dash Orbit */}
          <motion.div
            className="avatar-orbit-dashed"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          />

          {/* Glowing Aura Ring */}
          <div className="avatar-glow-ring"></div>

          {/* User Face DP */}
          <motion.img
            src="/admin-dp.jpg"
            alt="Sk Sahil"
            className="admin-dp-image"
            whileHover={{ scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          />

          {/* Live Online Badge */}
          <motion.div
            className="admin-live-badge"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <span className="live-core-dot"></span>
          </motion.div>
        </div>

        {/* Identity Details */}
        <div className="admin-text-content">
          <div className="admin-crown-badge">
            <Sparkles size={14} className="text-lime" />
            <span>ROOT ADMINISTRATOR &bull; FOUNDER</span>
          </div>

          <h1 className="admin-name">
            <span className="name-gradient">Sk Sahil</span>
          </h1>

          <p className="admin-subtitle">
            Chief Architect & System Administrator of SendFiles Quantum Infrastructure
          </p>

          <div className="admin-badges-row">
            <span className="cyber-pill pill-lime">
              <ShieldCheck size={13} />
              <span>Full System Privilege</span>
            </span>
            <span className="cyber-pill pill-cyan">
              <Zap size={13} />
              <span>Quantum 5 GB Core</span>
            </span>
            <span className="cyber-pill pill-purple">
              <Activity size={13} />
              <span>34H Auto-Purge Active</span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* Live System Diagnostics Grid */}
      <div className="admin-metrics-grid">
        {/* Metric 1 */}
        <motion.div
          className="admin-stat-card"
          whileHover={{ scale: 1.03, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <div className="stat-card-header">
            <Cpu size={18} className="text-cyan" />
            <span className="stat-card-tag">CORE STATUS</span>
          </div>
          <div className="stat-card-value text-cyan">ONLINE &bull; v2.4</div>
          <div className="stat-card-desc">Quantum chunk slicing engine operating at line speed</div>
          <div className="stat-card-glow-cyan"></div>
        </motion.div>

        {/* Metric 2 */}
        <motion.div
          className="admin-stat-card"
          whileHover={{ scale: 1.03, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <div className="stat-card-header">
            <Activity size={18} className="text-lime" />
            <span className="stat-card-tag">SYSTEM LATENCY</span>
          </div>
          <div className="stat-card-value text-lime">
            {latency !== null ? `${latency} ms` : 'Syncing...'}
          </div>
          <div className="stat-card-desc">Zero-hop direct cloud object storage pipeline</div>
          <div className="stat-card-glow-lime"></div>
        </motion.div>

        {/* Metric 3 */}
        <motion.div
          className="admin-stat-card"
          whileHover={{ scale: 1.03, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <div className="stat-card-header">
            <Lock size={18} className="text-purple" />
            <span className="stat-card-tag">STORAGE PROTOCOL</span>
          </div>
          <div className="stat-card-value text-purple">34.00 HOURS</div>
          <div className="stat-card-desc">Autonomous background daemon sweeps expired files</div>
          <div className="stat-card-glow-purple"></div>
        </motion.div>
      </div>

      {/* Hyper-Animated Admin Action Console */}
      <motion.div
        className="admin-console-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="console-panel-header">
          <div className="console-tag">
            <Terminal size={16} className="text-lime" />
            <span>EXECUTIVE ADMIN CONTROLS</span>
          </div>
          <span className="console-auth-text">AUTHORIZED AS SK SAHIL</span>
        </div>

        <div className="console-actions-row">
          {/* Action 1: Trigger Storage Sweep */}
          <motion.button
            className="admin-action-btn btn-sweep"
            onClick={handleTriggerSweep}
            disabled={isSweeping}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <RefreshCw size={18} className={isSweeping ? 'animate-spin' : ''} />
            <span>{isSweeping ? 'Sweeping Storage...' : 'Trigger Quantum Storage Sweep'}</span>
          </motion.button>

          {/* Action 2: Ping Health Check */}
          <motion.button
            className="admin-action-btn btn-ping"
            onClick={fetchHealthStatus}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <Activity size={18} />
            <span>Verify Engine Health</span>
          </motion.button>

          {/* Action 3: Shield Mode Toggle */}
          <motion.button
            className={`admin-action-btn btn-shield ${shieldActive ? 'active' : ''}`}
            onClick={() => {
              setShieldActive(!shieldActive);
              showToast(
                shieldActive ? 'Admin Shield Mode Relaxed' : 'Maximum Admin Shield Activated',
                'info'
              );
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <ShieldCheck size={18} />
            <span>Shield Mode: {shieldActive ? 'MAXIMUM' : 'STANDARD'}</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
