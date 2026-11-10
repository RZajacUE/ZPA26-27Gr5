import React from 'react';
import { OrlenAppLogo } from './OrlenLogos';
import { GusEmblem } from './GusLogos';

export default function ModeToggle({ activePortal, onTogglePortal, className = '' }) {
  return (
    <div className={`portal-mode-toggle-wrapper ${className}`}>
      <div className="portal-mode-toggle" role="tablist" aria-label="Wybierz portal">
        <button
          type="button"
          role="tab"
          aria-selected={activePortal === 'ORLEN'}
          className={`portal-toggle-pill ${activePortal === 'ORLEN' ? 'active-orlen' : ''}`}
          onClick={() => onTogglePortal('ORLEN')}
          title="Przełącz na portal notowań hurtowych PKN ORLEN"
        >
          <div className="toggle-brand-logo">
            <OrlenAppLogo height={18} alt="ORLEN" />
          </div>
          <span className="toggle-brand-name">ORLEN</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activePortal === 'GUS'}
          className={`portal-toggle-pill ${activePortal === 'GUS' ? 'active-gus' : ''}`}
          onClick={() => onTogglePortal('GUS')}
          title="Przełącz na portal Banku Danych Lokalnych GUS"
        >
          <div className="toggle-brand-logo">
            <GusEmblem height={18} alt="GUS" />
          </div>
          <span className="toggle-brand-name">GUS BDL</span>
        </button>
      </div>
    </div>
  );
}
