import React from 'react';
import { FaBars, FaShieldHalved, FaFileCsv } from 'react-icons/fa6';
import { GusEmblem, GusBdlBadge } from './GusLogos';
import ModeToggle from './ModeToggle';
import ViewModeToggle from './ViewModeToggle';
import { maskApiKey } from '../services/gusBdlApi';

export default function GusNavbar({
  activePortal,
  onTogglePortal,
  apiKey,
  apiStatus,
  viewMode,
  onToggleViewMode,
  onOpenSlideMenu,
  dataSourceMode = 'API',
  onToggleDataSourceMode
}) {
  const maskedKey = maskApiKey(apiKey);

  return (
    <header className="unified-header gus-header-unified">
      <div className="unified-header-container">
        <div className="header-left-col">
          {onOpenSlideMenu && (
            <button
              type="button"
              className="btn-open-slide-menu gus-menu-btn"
              onClick={onOpenSlideMenu}
              title="Otwórz menu boczne (opcje, filtry, słownik pojęć, klucz API)"
              aria-label="Otwórz menu boczne"
            >
              <FaBars size={14} />
              <span>Menu</span>
            </button>
          )}

          <div className="brand-badge-container gus-brand-badge" title="Główny Urząd Statystyczny">
            <div className="brand-logos-wrapper gus-brand-logos-wrapper">
              <GusEmblem height={26} alt="GUS Logo" />
              <div className="gus-brand-name-group">
                <span className="gus-brand-title">GUS</span>
                <span className="gus-brand-subtitle">Główny Urząd Statystyczny</span>
              </div>
            </div>
            <GusBdlBadge />
          </div>
        </div>
        <div className="header-center-col">
          <ModeToggle activePortal="GUS" onTogglePortal={onTogglePortal} />
        </div>
        <div className="header-right-col">
          {onToggleViewMode && (
            <ViewModeToggle 
              viewMode={viewMode} 
              onToggleViewMode={onToggleViewMode} 
              theme="gus" 
            />
          )}
          <div className="header-source-switch-container">
            <div className="header-source-switch" role="group" aria-label="Wybierz źródło danych GUS">
              <button
                type="button"
                className={`source-badge-btn ${dataSourceMode === 'API' ? 'active-api' : ''}`}
                onClick={() => onToggleDataSourceMode && onToggleDataSourceMode('API')}
                title={`Tryb API BDL: pobieranie na żywo z Banku Danych Lokalnych (klucz: ${maskedKey}, zarządzany w Menu bocznym)`}
              >
                <FaShieldHalved size={11} className="badge-icon" />
                <span className="badge-text">API BDL</span>
                <span className={`status-dot ${apiStatus === 'CONNECTED' ? 'online' : 'cached'}`}></span>
              </button>

              <button
                type="button"
                className={`source-badge-btn ${dataSourceMode === 'CSV' ? 'active-csv' : ''}`}
                onClick={() => onToggleDataSourceMode && onToggleDataSourceMode('CSV')}
                title="Tryb Statyczny CSV: ładowanie danych bezpośrednio z katalogu /data/csv/gus_zywnosc/"
              >
                <FaFileCsv size={11} className="badge-icon" />
                <span className="badge-text">Plik CSV</span>
                <span className="status-dot csv-dot"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
