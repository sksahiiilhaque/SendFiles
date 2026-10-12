import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Send, Sun, Moon, Zap, ShieldCheck, UploadCloud, DownloadCloud } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function Navbar({ activeTab, onTabChange }) {
  const { theme, toggleTheme } = useTheme();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <>
      <header className="navbar futuristic-navbar">
        {/* Heavy Top Scroll Progress Bar */}
        <motion.div className="scroll-progress-bar" style={{ scaleX }} />

        <div className="container nav-container">
          <a
            href="#"
            className="brand"
            onClick={(e) => {
              e.preventDefault();
              onTabChange('send');
            }}
          >
            <motion.div
              className="brand-icon futuristic-brand-icon"
              whileHover={{ rotate: 12, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send size={20} />
            </motion.div>
            <span className="brand-text">SendFiles</span>
            <span className="brand-badge futuristic-badge">5 GB &bull; 34H</span>
          </a>

          {/* Desktop Navigation Links */}
          <ul className="nav-links desktop-nav-links">
            <li>
              <button
                type="button"
                className={`nav-link-btn ${activeTab === 'send' ? 'active' : ''}`}
                onClick={() => onTabChange('send')}
              >
                <span>Send Files</span>
                {activeTab === 'send' && (
                  <motion.div layoutId="navIndicator" className="nav-active-pill" />
                )}
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`nav-link-btn ${activeTab === 'receive' ? 'active' : ''}`}
                onClick={() => onTabChange('receive')}
              >
                <span>Receive Files</span>
                {activeTab === 'receive' && (
                  <motion.div layoutId="navIndicator" className="nav-active-pill" />
                )}
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`nav-link-btn admin-nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => onTabChange('admin')}
              >
                <ShieldCheck size={16} className="admin-nav-icon" />
                <span>Admin Tab</span>
                {activeTab === 'admin' && (
                  <motion.div layoutId="navIndicator" className="nav-active-pill admin-pill" />
                )}
              </button>
            </li>
          </ul>

          <div className="nav-actions">
            <motion.button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              whileHover={{ scale: 1.1, rotate: 20 }}
              whileTap={{ scale: 0.9 }}
            >
              {theme === 'dark' ? <Sun size={19} className="text-amber" /> : <Moon size={19} className="text-cyan" />}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Futuristic Floating Mobile Bottom Navigation Dock (App-Like for Phone) */}
      <nav className="mobile-bottom-dock" aria-label="Mobile Navigation">
        <button
          type="button"
          className={`mobile-dock-btn ${activeTab === 'send' ? 'active' : ''}`}
          onClick={() => onTabChange('send')}
        >
          <UploadCloud size={19} />
          <span>Send</span>
          {activeTab === 'send' && (
            <motion.div layoutId="dockActivePill" className="dock-active-glow" />
          )}
        </button>

        <button
          type="button"
          className={`mobile-dock-btn ${activeTab === 'receive' ? 'active' : ''}`}
          onClick={() => onTabChange('receive')}
        >
          <DownloadCloud size={19} />
          <span>Receive</span>
          {activeTab === 'receive' && (
            <motion.div layoutId="dockActivePill" className="dock-active-glow" />
          )}
        </button>

        <button
          type="button"
          className={`mobile-dock-btn admin-dock-btn ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => onTabChange('admin')}
        >
          <ShieldCheck size={19} className="admin-dock-icon" />
          <span>Admin</span>
          {activeTab === 'admin' && (
            <motion.div layoutId="dockActivePill" className="dock-active-glow admin-dock-glow" />
          )}
        </button>
      </nav>
    </>
  );
}
