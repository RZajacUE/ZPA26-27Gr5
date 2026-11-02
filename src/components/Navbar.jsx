import React, { useRef } from 'react';
import { FaUpload, FaGasPump, FaFolderOpen } from 'react-icons/fa6';
import { OrlenAppLogo, OrlenMainLogo } from './OrlenLogos';

export default function Navbar({ 
  currentDataset, 
  onSelectDataset, 
  onCustomFileUpload,
  recordCount,
  isLoading
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
    <header className="orlen-header">
      <div className="orlen-header-container">
        {/* Brand Left: App Logo (Eagle) + Main Logo (Wordmark) */}
        <div className="orlen-brand">
          <div className="orlen-app-logo-badge" title="Logo aplikacji ORLEN (Orzeł)">
            <OrlenAppLogo height={34} alt="ORLEN App Logo" />
          </div>
          <div className="orlen-main-logo-wrapper" title="Główne logo ORLEN (Wordmark)">
            <OrlenMainLogo height={32} alt="ORLEN Main Logo" />
          </div>
          <div className="orlen-brand-divider"></div>
          <div className="orlen-brand-text">
            <span className="orlen-brand-subtitle">Portal Hurtowy Paliw</span>
          </div>
        </div>

        {/* Middle Top Menu: Dropdown to Choose CSV Data */}
        <div className="orlen-menu-center">
          <label htmlFor="csv-dataset-select" className="dataset-label">
            <FaGasPump className="dataset-icon-prefix" />
            <span className="label-text">Zbiór CSV:</span>
          </label>
          <div className="dataset-select-wrapper">
            <select
              id="csv-dataset-select"
              value={currentDataset.id}
              onChange={handleDropdownChange}
              className="dataset-select"
              aria-label="Wybierz zbiór danych CSV"
            >
              <optgroup label="Notowania PKN ORLEN 2026">
                <option value="Orlen_pb95_2026.csv">
                  Orlen_pb95_2026.csv (Benzyna Eurosuper 95)
                </option>
                <option value="Orlen_on_2026.csv">
                  Orlen_on_2026.csv (Olej Napędowy Ekodiesel)
                </option>
              </optgroup>
              <optgroup label="Własne pliki">
                <option value="CUSTOM_UPLOAD">
                  Wgraj inny plik CSV z dysku...
                </option>
                {currentDataset.isCustom && (
                  <option value={currentDataset.id}>
                    {currentDataset.name} (Wgrany z pliku)
                  </option>
                )}
              </optgroup>
            </select>
            <div className="dataset-select-badge">
              {isLoading ? (
                <span className="spinner-inline"></span>
              ) : (
                <span className="badge-count">{recordCount} wpisów</span>
              )}
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,text/csv"
            style={{ display: 'none' }}
          />
        </div>

        {/* Right Info & Actions */}
        <div className="orlen-header-right">
          <div className="header-status-pill">
            <span className="status-dot"></span>
            <span className="status-text">Notowania 2026</span>
          </div>
          <button 
            type="button" 
            className="btn-upload-direct"
            onClick={() => fileInputRef.current?.click()}
            title="Wgraj własny plik CSV z dysku"
          >
            <FaUpload size={14} />
            <span className="btn-text">Wgraj CSV</span>
          </button>
        </div>
      </div>
    </header>
  );
}
