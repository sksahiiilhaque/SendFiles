import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  Clock,
  Radio,
  Share2,
  CheckCircle2,
  Terminal,
  Activity,
  ArrowRight
} from 'lucide-react';

export function HowItWorks() {
  const [activeStage, setActiveStage] = useState(0);

  const stages = [
    {
      id: 'slice',
      step: '01',
      title: 'In-Browser Chunk Slicing',
      subtitle: 'Zero RAM Buffer & Multi-Threaded Hashing',
      desc: 'Large files up to 5 GB are instantly partitioned into 10 MB binary slices directly in the browser using the File API. The full file never loads into RAM, eliminating memory crashes even on mobile devices.',
      specs: [
        { label: 'Chunk Size', value: '10 MB Slices' },
        { label: 'RAM Footprint', value: '< 15 MB Fixed' },
        { label: 'Max File Cap', value: '5.0 GB / File' }
      ],
      terminalLogs: [
        'INIT_CLIENT_BUFFER: Stream attached',
        'PARTITION_ENGINE: 5 GB split into 500 parts',
        'MEMORY_INTEGRITY: Native Blob slices verified',
        'STATUS: READY_FOR_PARALLEL_STREAM'
      ]
    },
    {
      id: 'stream',
      step: '02',
      title: 'Direct Cloud Beam (0 Server Hops)',
      subtitle: 'Infinite Throughput, Zero Bottlenecks',
      desc: 'Chunks stream directly from your browser to high-speed Cloudflare R2 / S3 object storage via presigned URLs. The Express server only handles tiny cryptographic tokens (<1 KB), ensuring maximum speed with $0 bandwidth cost.',
      specs: [
        { label: 'Server Hop', value: '0 Hops (Direct R2)' },
        { label: 'Bandwidth Overhead', value: '0% Server Load' },
        { label: 'Parallel Streams', value: 'Auto-Recoverable' }
      ],
      terminalLogs: [
        'HANDSHAKE: Presigned PUT tickets issued',
        'DIRECT_BEAM: Browser -> Cloud Object Storage',
        'TRANSFER_RATE: Line-speed unthrottled',
        'STATUS: MULTIPART_CONCURRENT_UPLOAD'
      ]
    },
    {
      id: 'connect',
      step: '03',
      title: '6-Digit Code, QR & Camera Scan',
      subtitle: 'Cross-Device Vector Handshake',
      desc: 'Transfers are locked to a temporary 6-digit numeric key, a shareable deep link, and an interactive QR vector. Any device can claim files instantly via browser or using the built-in camera scanner with zero app installs.',
      specs: [
        { label: 'Code Entropy', value: '6-Digit Collision-Proof' },
        { label: 'Optical Scan', value: 'Real-time Camera Engine' },
        { label: 'Device Support', value: 'iOS, Android, PC, Mac' }
      ],
      terminalLogs: [
        'SECURITY_CORE: Sender HMAC token minted',
        'DISCOVERY_VECTOR: 6-Digit code published',
        'OPTICAL_MATRIX: QR payload rendered',
        'STATUS: AWAITING_RECEIVER_HANDSHAKE'
      ]
    },
    {
      id: 'purge',
      step: '04',
      title: 'Autonomous 34-Hour Auto-Purge',
      subtitle: 'Hardcoded Cryptographic Self-Destruct',
      desc: 'No manual deletion required. Every transfer has an automatic built-in 34-hour active lifespan. A persistent background scheduler purges storage objects and wipes database records when the 34-hour window concludes.',
      specs: [
        { label: 'Retention Limit', value: 'Strict 34.00 Hours' },
        { label: 'Purge Scheduler', value: 'Runs Every 15 Mins' },
        { label: 'Data Recovery', value: 'Zero Residue Left' }
      ],
      terminalLogs: [
        'AUTONOMOUS_CRON: 34h lifespan attached',
        'EXPIRY_TARGET: ISO_TIMESTAMP + 34h00m',
        'SWEEP_WORKER: Active background daemon',
        'STATUS: TIME_LOCKED_AND_EPHEMERAL'
      ]
    }
  ];

  const current = stages[activeStage];

  return (
    <section id="how-it-works" className="protocol-section">
      <div className="container">
        {/* Section Header */}
        <motion.div
          className="protocol-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="protocol-badge">
            <Activity size={14} className="pulse-icon" />
            <span>ARCHITECTURE SPECIFICATION</span>
            <span className="badge-sep">&bull;</span>
            <span className="badge-highlight">34H AUTONOMOUS PROTOCOL</span>
          </div>

          <h2 className="protocol-title">
            The High-Speed <span className="text-gradient-cyan">Quantum Transfer</span> Engine
          </h2>
          <p className="protocol-subtitle">
            Not your typical file transfer. Engineered with client-side chunk slicing, direct cloud object streams, optical camera scanning, and built-in 34-hour auto-purges.
          </p>
        </motion.div>

        {/* Interactive Protocol Matrix Cockpit */}
        <div className="protocol-cockpit">
          {/* Left Column: Interactive Stages Selector */}
          <div className="protocol-stages-col">
            {stages.map((stage, idx) => {
              const isActive = activeStage === idx;
              return (
                <motion.div
                  key={stage.id}
                  className={`protocol-stage-card ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveStage(idx)}
                  whileHover={{ scale: 1.015, x: 6 }}
                  whileTap={{ scale: 0.99 }}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <div className="stage-index-pill">
                    <span>{stage.step}</span>
                  </div>

                  <div className="stage-info">
                    <h3 className="stage-card-title">{stage.title}</h3>
                    <p className="stage-card-sub">{stage.subtitle}</p>
                  </div>

                  <div className="stage-indicator">
                    {isActive ? (
                      <span className="active-dot"></span>
                    ) : (
                      <ArrowRight size={16} className="stage-arrow" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right Column: Holographic Telemetry HUD Panel */}
          <div className="protocol-telemetry-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                className="telemetry-panel"
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -15 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Telemetry Header */}
                <div className="telemetry-header">
                  <div className="telemetry-tag">
                    <Radio size={14} className="pulse-icon text-cyan" />
                    <span>PHASE {current.step} / 04 ACTIVE</span>
                  </div>
                  <div className="telemetry-status">
                    <span className="status-live-dot"></span>
                    <span>ONLINE</span>
                  </div>
                </div>

                <h4 className="telemetry-title">{current.title}</h4>
                <p className="telemetry-desc">{current.desc}</p>

                {/* Specs Grid */}
                <div className="telemetry-specs-grid">
                  {current.specs.map((spec, i) => (
                    <div key={i} className="spec-item">
                      <span className="spec-label">{spec.label}</span>
                      <span className="spec-val">{spec.value}</span>
                    </div>
                  ))}
                </div>

                {/* Simulated Live Console Logs */}
                <div className="telemetry-terminal">
                  <div className="terminal-bar">
                    <Terminal size={13} />
                    <span>TELEMETRY CONSOLE &bull; PROTOCOL 34</span>
                  </div>
                  <div className="terminal-content">
                    {current.terminalLogs.map((log, i) => (
                      <div key={i} className="terminal-line">
                        <span className="term-prompt">&gt;</span>
                        <span className="term-text">{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
