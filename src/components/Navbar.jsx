import React, { useRef } from 'react';
import { FaBars, FaChartPie, FaGasPump } from 'react-icons/fa6';
import { OrlenAppLogo, OrlenMainLogo } from './OrlenLogos';
import ModeToggle from './ModeToggle';
import ViewModeToggle from './ViewModeToggle';

export default function Navbar({ 
  currentDataset, 
  onSelectDataset, 
  onCustomFileUpload,
  recordCount,
  isLoading,
  onTogglePortal,
  viewMode,
  onToggleViewMode,
  onOpenSlideMenu
}) {
  const fileInputRef = useRef(null);

  const handleDropdownChange = (e) => {
    const val = e.target.value;
    if (val === 'CUSTOM_UPLOAD') {
      fileInputRef.current?.click();
    } else {
      onSelectDataset(val);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onCustomFileUpload(file);
      e.target.value = '';
    }
  };

  return (
    <header className="unified-header orlen-header-unified">
      <div className="unified-header-container">
        {/* Left Section: Menu trigger + Brand Logo in high-contrast box */}
        <div className="header-left-col">
          {onOpenSlideMenu && (
            <button
              type="button"
              className="btn-open-slide-menu"
              onClick={onOpenSlideMenu}
              title="Otwórz menu boczne (opcje, filtry, słownik pojęć)"
              aria-label="Otwórz menu boczne"
            >
              <FaBars size={14} />
              <span>Menu</span>
            </button>
          )}

          <div className="brand-badge-container orlen-brand-badge" title="PKN ORLEN — Portal Cen Paliw">
            <div className="brand-logos-wrapper">
              <OrlenAppLogo height={28} alt="ORLEN Logo" />
              <OrlenMainLogo height={24} alt="PKN ORLEN" />
            </div>
            <span className="brand-system-badge">PORTAL PALIW</span>
          </div>
        </div>

        {/* Center Section: Centered Portal Switcher [ PKN ORLEN | GUS BDL ] */}
        <div className="header-center-col">
          <ModeToggle activePortal="ORLEN" onTogglePortal={onTogglePortal} />
        </div>

        {/* Right Section: View Mode Toggle + Portal Switcher Button */}
        <div className="header-right-col">
          {onToggleViewMode && (
            <ViewModeToggle 
              viewMode={viewMode} 
              onToggleViewMode={onToggleViewMode} 
              theme="orlen" 
            />
          )}

          {/* Quick Dataset Selector Dropdown (compact) */}
          <div className="header-dataset-pill" title="Aktualny zbiór notowań">
            <FaGasPump size={12} className="dataset-icon" />
            <select
              value={currentDataset?.id}
              onChange={handleDropdownChange}
              className="header-dataset-select"
              aria-label="Zbiór danych"
            >
              <option value="Orlen_pb95_2026.csv">Pb95 (Eurosuper)</option>
              <option value="Orlen_on_2026.csv">ON (Ekodiesel)</option>
              <option value="CUSTOM_UPLOAD">+ Wgraj z dysku...</option>
              {currentDataset?.isCustom && (
                <option value={currentDataset.id}>{currentDataset.name}</option>
              )}
            </select>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,text/csv"
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
