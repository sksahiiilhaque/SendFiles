import React from 'react';
import { Send, ShieldCheck, Clock, Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brand" style={{ marginBottom: '0.5rem' }}>
              <div className="brand-icon">
                <Send size={18} />
              </div>
              <span>SendFiles</span>
            </div>
            <p className="footer-brand-desc">
              Fast, temporary, direct file transfer designed for cross-platform sharing between phones, laptops, and tablets.
            </p>
          </div>

          <div>
            <h4 className="footer-col-title">Privacy & Storage</h4>
            <ul className="footer-links">
              <li>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} color="var(--accent-green)" />
                  <span>Temporary storage only</span>
                </span>
              </li>
              <li>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} color="var(--accent-amber)" />
                  <span>Auto-deleted after expiry</span>
                </span>
              </li>
              <li>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={14} color="var(--primary)" />
                  <span>No user tracking or cookies</span>
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="footer-col-title">Legal & Contact</h4>
            <ul className="footer-links">
              <li>
                <a href="#terms" className="footer-link" onClick={(e) => { e.preventDefault(); alert('Terms of Use: SendFiles is intended for lawful personal file sharing. Content that infringes copyrights or violates applicable laws is strictly prohibited.'); }}>
                  Terms of Use
                </a>
              </li>
              <li>
                <a href="#privacy" className="footer-link" onClick={(e) => { e.preventDefault(); alert('Privacy Policy: Uploaded files are stored temporarily in private object storage until expiration or sender deletion, after which they are permanently removed from all systems.'); }}>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="mailto:support@sendfiles.local" className="footer-link">
                  support@sendfiles.app
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>&copy; {new Date().getFullYear()} SendFiles. All rights reserved.</div>
          <div>Files are permanently wiped after 34 hours. Max 5 GB per file.</div>
        </div>
      </div>
    </footer>
  );
}
