import React from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, DownloadCloud, Sparkles, Smartphone, Laptop, Zap, ShieldCheck } from 'lucide-react';

export function Hero({ onSendClick, onReceiveClick }) {
  return (
    <section className="hero-section">
      <div className="container">
        {/* Animated Cyber Pill */}
        <motion.div
          className="hero-pill futuristic-pill"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="hero-pill-dot animate-pulse"></span>
          <span>Zero Server Hops &bull; 5 GB Slices &bull; Automatic 34h Self-Destruct</span>
        </motion.div>

        {/* Hero Title with Heavy Motion */}
        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          High-Velocity Transfers. <br />
          <span className="hero-title-gradient">Anywhere in Seconds.</span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          Direct cloud stream for 5 GB payloads between iPhone, Android, PC, and Mac. Connect with a 6-digit key, deep link, or instant camera scanner. Built-in 34-hour auto-purge.
        </motion.p>

        {/* Interactive CTA Buttons with Heavy Hover Physics */}
        <motion.div
          className="hero-cta-group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.button
            className="btn btn-primary btn-lg glow-btn"
            onClick={onSendClick}
            whileHover={{ scale: 1.05, y: -3, boxShadow: '0 0 30px var(--primary-glow)' }}
            whileTap={{ scale: 0.96 }}
          >
            <UploadCloud size={20} />
            <span>Send Files (5 GB)</span>
          </motion.button>

          <motion.button
            className="btn btn-secondary btn-lg"
            onClick={onReceiveClick}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.96 }}
          >
            <DownloadCloud size={20} />
            <span>Receive Files</span>
          </motion.button>
        </motion.div>

        {/* Dynamic Holographic Vector Illustration */}
        <motion.div
          style={{ margin: '3.5rem auto 1rem', maxWidth: '580px', position: 'relative' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="hero-graphic-halo"></div>

          <svg viewBox="0 0 520 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', position: 'relative', zIndex: 2 }}>
            <defs>
              <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#06B6D4" stopOpacity="1" />
                <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.2" />
              </linearGradient>
              <filter id="glowFilter" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="glow" />
                <feComposite in="SourceGraphic" in2="glow" operator="over" />
              </filter>
            </defs>

            {/* Laptop graphic on left */}
            <g transform="translate(60, 40)">
              <rect x="0" y="0" width="84" height="56" rx="8" fill="var(--bg-tertiary)" stroke="var(--primary)" strokeWidth="2" />
              <rect x="6" y="6" width="72" height="44" rx="4" fill="var(--bg-secondary)" />
              <rect x="-14" y="56" width="112" height="7" rx="3" fill="var(--border-strong)" />
              <circle cx="16" cy="18" r="4" fill="var(--accent-cyan)" />
              <rect x="26" y="15" width="40" height="5" rx="2.5" fill="var(--border-subtle)" />
              <rect x="14" y="27" width="52" height="4" rx="2" fill="var(--border-subtle)" />
              <rect x="14" y="36" width="34" height="4" rx="2" fill="var(--border-subtle)" />
            </g>

            {/* Transfer Beam Path */}
            <path
              d="M155 68 C 235 15, 285 15, 365 68"
              stroke="url(#beamGrad)"
              strokeWidth="4"
              strokeDasharray="8 8"
              strokeLinecap="round"
            >
              <animate attributeName="stroke-dashoffset" from="64" to="0" dur="1.8s" repeatCount="indefinite" />
            </path>

            {/* Floating File Packet */}
            <g filter="url(#glowFilter)">
              <rect x="236" y="22" width="48" height="34" rx="8" fill="var(--primary)" />
              <path d="M254 39L260 33L266 39M260 34V46" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0; 0 -6; 0 0"
                dur="2.5s"
                repeatCount="indefinite"
              />
            </g>

            {/* Mobile Phone graphic on right */}
            <g transform="translate(375, 30)">
              <rect x="0" y="0" width="48" height="84" rx="12" fill="var(--bg-tertiary)" stroke="var(--accent-cyan)" strokeWidth="2" />
              <rect x="5" y="8" width="38" height="68" rx="7" fill="var(--bg-secondary)" />
              <circle cx="24" cy="4.5" r="2" fill="var(--border-strong)" />
              <rect x="14" y="26" width="20" height="20" rx="6" fill="var(--primary-light)" />
              <path d="M21 37L24 33L27 37M24 34V43" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Device labels */}
            <text x="102" y="128" textAnchor="middle" fill="var(--text-muted)" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)">
              PC / MAC NODE
            </text>
            <text x="399" y="128" textAnchor="middle" fill="var(--text-muted)" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)">
              MOBILE / CAMERA
            </text>
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
