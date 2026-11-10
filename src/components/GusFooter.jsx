import React from 'react';
import { GusEmblem, GusBdlBadge } from './GusLogos';
import { FaShieldHalved, FaFileCsv } from 'react-icons/fa6';

export default function GusFooter() {
  return (
    <footer className="unified-footer gus-footer-unified">
      <div className="unified-footer-content">
        <div className="footer-brand-col">
          <div className="footer-logo-box">
            <GusEmblem height={28} alt="GUS" />
            <GusBdlBadge />
          </div>
          <span className="footer-desc-text">
            Bank Danych Lokalnych (BDL) • Reprezentanci koszyka konsumpcyjnego i mediana tygodniowa
          </span>
        </div>

        <div className="footer-meta-col">
          <div className="meta-pill">
            <FaShieldHalved size={12} />
            <span>Klucz BDL API: Zabezpieczony</span>
          </div>
          <div className="meta-pill">
            <FaFileCsv size={12} />
            <span>Format: UTF-8 z BOM (separator <b className="separator-bold">;</b>)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
