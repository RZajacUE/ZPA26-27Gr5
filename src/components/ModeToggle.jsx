import React from 'react';
import { FaGasPump, FaChartPie } from 'react-icons/fa6';

export default function ModeToggle({ activePortal, onTogglePortal }) {
  return (
    <div className="portal-mode-toggle-container">
      <div className="portal-mode-toggle" role="tablist" aria-label="Wybierz moduł analityczny">
        <button
          type="button"
          role="tab"
          aria-selected={activePortal === 'ORLEN'}
          className={`portal-toggle-btn ${activePortal === 'ORLEN' ? 'toggle-active orlen-active' : ''}`}
          onClick={() => onTogglePortal('ORLEN')}
        >
          <FaGasPump size={14} className="toggle-icon" />
          <span className="toggle-label">PKN ORLEN</span>
          <span className="toggle-sub">Ceny Paliw</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activePortal === 'GUS'}
          className={`portal-toggle-btn ${activePortal === 'GUS' ? 'toggle-active gus-active' : ''}`}
          onClick={() => onTogglePortal('GUS')}
        >
          <FaChartPie size={14} className="toggle-icon" />
          <span className="toggle-label">GUS BDL</span>
          <span className="toggle-sub">Koszyk Konsumencki</span>
        </button>
      </div>
    </div>
  );
}

