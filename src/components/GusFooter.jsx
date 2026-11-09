import React from 'react';
import { GusEmblem, GusWordmark, GusBdlBadge } from './GusLogos';
import { FaShieldHalved, FaFileCsv } from 'react-icons/fa6';

export default function GusFooter({ onTogglePortal }) {
  return (
    <footer className="gus-footer">
      <div className="gus-footer-content">
        <div className="footer-left">
          <div className="footer-logo-group">
            <GusEmblem height={26} alt="GUS Logo" />
            <GusWordmark height={22} alt="GUS Wordmark" />
          </div>
          <div className="footer-text-group">
            <span className="footer-title">
              Bank Danych Lokalnych (BDL) • Główny Urząd Statystyczny
            </span>
            <span className="footer-subtitle">
              Portal analityczny cen detalicznych reprezentantów koszyka konsumpcyjnego i mediany tygodniowej
            </span>
          </div>
        </div>

        <div className="footer-center">
          <button
            type="button"
            className="footer-switch-btn"
            onClick={() => onTogglePortal('ORLEN')}
            title="Przełącz z powrotem do portalu PKN ORLEN"
          >
            ← Przejdź do Portalu Cen Hurtowych PKN ORLEN
          </button>
        </div>

        <div className="footer-right">
          <div className="footer-badge-item">
            <FaShieldHalved size={13} />
            <span>Klucz BDL API w .env: Aktywny</span>
          </div>
          <div className="footer-badge-item">
            <FaFileCsv size={13} />
            <span>Format eksportu: UTF-8 z BOM (Separator ;)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

