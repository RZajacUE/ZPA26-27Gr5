import React, { useRef } from 'react';
import { FaBars, FaChartPie, FaGasPump, FaFileCsv } from 'react-icons/fa6';
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

          <div className="brand-badge-container orlen-brand-badge" title="PKN ORLEN">
            <div className="brand-logos-wrapper">
              <OrlenAppLogo height={28} alt="ORLEN Logo" />
              <OrlenMainLogo height={24} alt="PKN ORLEN" />
            </div>
          </div>
        </div>
        <div className="header-center-col">
          <ModeToggle activePortal="ORLEN" onTogglePortal={onTogglePortal} />
        </div>
        <div className="header-right-col">
          {onToggleViewMode && (
            <ViewModeToggle 
              viewMode={viewMode} 
              onToggleViewMode={onToggleViewMode} 
              theme="orlen" 
            />
          )}
          <div className="header-dataset-pill" title={`Aktywny plik CSV: /data/csv/orlen_paliwa/${currentDataset?.id || ''}`}>
            <FaFileCsv size={12} className="dataset-icon" />
            <select
              value={currentDataset?.id}
              onChange={handleDropdownChange}
              className="header-dataset-select"
              aria-label="Zbiór danych CSV"
            >
              <option value="orlen_paliwa_pb95_2026.csv">Pb95 (Eurosuper 2026)</option>
              <option value="orlen_paliwa_on_2026.csv">ON (Ekodiesel 2026)</option>
              <option value="orlen_paliwa_analiza_2019_2026.csv">Historia 2019–2026 (Analiza)</option>
              <option value="orlen_paliwa_wydarzenia.csv">Wydarzenia i tarcza</option>
              <option value="CUSTOM_UPLOAD">+ Wgraj z dysku...</option>
              {currentDataset?.isCustom && (
                <option value={currentDataset.id}>{currentDataset.name}</option>
              )}
            </select>
            <span className="status-dot online"></span>
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
