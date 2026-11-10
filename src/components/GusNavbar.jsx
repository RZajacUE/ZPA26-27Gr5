import React from 'react';
import { FaBars, FaGasPump, FaShieldHalved } from 'react-icons/fa6';
import { GusLogo, GusBdlBadge } from './GusLogos';
import ModeToggle from './ModeToggle';
import ViewModeToggle from './ViewModeToggle';
import { maskApiKey } from '../services/gusBdlApi';

export default function GusNavbar({
  activePortal,
  onTogglePortal,
  apiKey,
  apiStatus,
  onOpenKeyModal,
  viewMode,
  onToggleViewMode,
  onOpenSlideMenu
}) {
  const maskedKey = maskApiKey(apiKey);

  return (
    <header className="unified-header gus-header-unified">
      <div className="unified-header-container">
        {/* Left Section: Menu trigger + Brand Logo in high-contrast box */}
        <div className="header-left-col">
          {onOpenSlideMenu && (
            <button
              type="button"
              className="btn-open-slide-menu gus-menu-btn"
              onClick={onOpenSlideMenu}
              title="Otwórz menu boczne (opcje, filtry, słownik pojęć)"
              aria-label="Otwórz menu boczne"
            >
              <FaBars size={14} />
              <span>Menu</span>
            </button>
          )}

          <div className="brand-badge-container gus-brand-badge" title="Główny Urząd Statystyczny — BDL">
            <GusLogo height={32} alt="GUS Logo" />
            <GusBdlBadge />
          </div>
        </div>

        {/* Center Section: Centered Portal Switcher [ PKN ORLEN | GUS BDL ] */}
        <div className="header-center-col">
          <ModeToggle activePortal="GUS" onTogglePortal={onTogglePortal} />
        </div>

        {/* Right Section: View Mode Toggle + Portal Switcher Button */}
        <div className="header-right-col">
          {onToggleViewMode && (
            <ViewModeToggle 
              viewMode={viewMode} 
              onToggleViewMode={onToggleViewMode} 
              theme="gus" 
            />
          )}

          {/* Masked API Key Indicator */}
          <button
            type="button"
            className="header-api-badge"
            onClick={onOpenKeyModal}
            title={`Klucz API BDL: ${maskedKey}. Kliknij, aby zmienić.`}
          >
            <FaShieldHalved size={12} className="api-icon" />
            <span className="api-text">BDL API</span>
            <span className={`status-dot ${apiStatus === 'CONNECTED' ? 'online' : 'cached'}`}></span>
          </button>
        </div>
      </div>
    </header>
  );
}
