import React from 'react';
import { FaKey, FaArrowRotateRight, FaShieldHalved } from 'react-icons/fa6';
import { GusEmblem, GusWordmark } from './GusLogos';
import ModeToggle from './ModeToggle';

export default function GusNavbar({
  activePortal,
  onTogglePortal,
  apiKey,
  apiStatus,
  onOpenKeyModal,
  onRefreshData,
  isLoading
}) {
  const maskedKey = apiKey 
    ? `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`
    : 'Brak klucza';

  return (
    <header className="gus-header">
      <div className="gus-header-container">
        {/* Brand Left: Official GUS Emblem + Wordmark */}
        <div className="gus-brand">
          <div className="gus-logo-badge" title="Główny Urząd Statystyczny">
            <GusEmblem height={38} alt="GUS Logo" />
          </div>
          <div className="gus-wordmark-wrapper" title="Główny Urząd Statystyczny - Bank Danych Lokalnych">
            <GusWordmark height={34} alt="GUS Wordmark" />
          </div>
          <div className="gus-brand-divider"></div>
          <div className="gus-brand-text">
            <span className="gus-brand-title">Koszyk Konsumencki BDL</span>
            <span className="gus-brand-subtitle">Ceny Detaliczne & Mediana Tygodniowa</span>
          </div>
        </div>

        {/* Center: Portal Mode Toggle (PKN ORLEN vs GUS BDL) */}
        <div className="gus-header-center">
          <ModeToggle activePortal={activePortal} onTogglePortal={onTogglePortal} />
        </div>

        {/* Right: API Key Status & Actions */}
        <div className="gus-header-right">
          <button
            type="button"
            className="gus-api-key-badge"
            onClick={onOpenKeyModal}
            title={`Klucz API BDL z pliku .env: ${apiKey || 'Nieskonfigurowany'}`}
          >
            <FaShieldHalved className="gus-key-icon" size={13} />
            <div className="gus-key-info">
              <span className="gus-key-label">Klucz .env:</span>
              <span className="gus-key-val">{maskedKey}</span>
            </div>
            <span className={`gus-status-dot ${apiStatus === 'CONNECTED' ? 'status-connected' : 'status-cached'}`}></span>
          </button>

          <button
            type="button"
            className="btn-gus-refresh"
            onClick={onRefreshData}
            disabled={isLoading}
            title="Odśwież dane z GUS BDL API"
          >
            <FaArrowRotateRight size={13} className={isLoading ? 'gus-spin' : ''} />
            <span className="btn-text">{isLoading ? 'Ładowanie...' : 'Odśwież BDL'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

