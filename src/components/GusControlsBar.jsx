import React from 'react';
import { 
  FaCalendarDays, 
  FaDownload, 
  FaSliders, 
  FaCheck, 
  FaClock, 
  FaBasketShopping,
  FaFileCsv,
  FaLayerGroup,
  FaUtensils,
  FaGasPump,
  FaBolt
} from 'react-icons/fa6';

export default function GusControlsBar({
  startDate,
  endDate,
  isEndingPresent,
  onStartDateChange,
  onEndDateChange,
  onToggleEndingPresent,
  frequency,
  onFrequencyChange,
  basketFilter,
  onBasketFilterChange,
  onDownloadCsv,
  totalChunks,
  selectedChunksCount,
  onSelectAllVisible,
  onClearSelected,
  allVisibleSelected,
  activeProductsCount
}) {
  const frequencies = [
    { id: 'DAYS', label: 'Dni (Days)', hint: 'Interpolacja dzienna' },
    { id: 'WEEKS', label: 'Tygodnie (Weeks)', hint: 'Mediana tygodniowa' },
    { id: 'MONTHS', label: 'Miesiące (Months)', hint: 'Notowania miesięczne' },
  ];

  const basketCategories = [
    { id: 'ALL', label: 'Pełny koszyk (Wszystko)', icon: <FaLayerGroup size={12} /> },
    { id: 'FOOD', label: 'Tylko Żywność', icon: <FaUtensils size={12} /> },
    { id: 'FUELS', label: 'Paliwa & Transport', icon: <FaGasPump size={12} /> },
    { id: 'ENERGY', label: 'Energia & Usługi', icon: <FaBolt size={12} /> },
  ];

  return (
    <div className="gus-controls-panel">
      {/* Top Row: Date controls and chunking frequency */}
      <div className="gus-controls-row-top">
        {/* Date Range Settings */}
        <div className="gus-date-range-group">
          <div className="gus-control-label">
            <FaCalendarDays size={14} className="control-icon" />
            <span>Zakres dat analizy:</span>
          </div>

          <div className="gus-inputs-pair">
            <div className="gus-input-field">
              <label htmlFor="gus-start-date" className="sub-label">Od:</label>
              <input
                id="gus-start-date"
                type="date"
                value={startDate}
                min="2015-01-01"
                max={endDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="gus-date-input"
              />
            </div>

            <span className="gus-date-arrow">→</span>

            <div className="gus-input-field">
              <label htmlFor="gus-end-date" className="sub-label">Do:</label>
              <input
                id="gus-end-date"
                type="date"
                value={endDate}
                min={startDate}
                max="2026-12-31"
                disabled={isEndingPresent}
                onChange={(e) => onEndDateChange(e.target.value)}
                className={`gus-date-input ${isEndingPresent ? 'input-disabled' : ''}`}
              />
            </div>

            {/* Present Date Toggle */}
            <button
              type="button"
              className={`gus-present-toggle-btn ${isEndingPresent ? 'toggle-active' : ''}`}
              onClick={onToggleEndingPresent}
              title="Automatycznie ustaw do dnia dzisiejszego"
            >
              <FaClock size={12} />
              <span>Do dziś (Present date)</span>
              {isEndingPresent && <span className="active-pip">✓</span>}
            </button>
          </div>
        </div>

        {/* Frequency Chunks Selector */}
        <div className="gus-frequency-group">
          <div className="gus-control-label">
            <FaSliders size={14} className="control-icon" />
            <span>Zbieranie danych (Chunking):</span>
          </div>

          <div className="gus-frequency-buttons" role="group" aria-label="Częstotliwość agregacji">
            {frequencies.map(f => (
              <button
                key={f.id}
                type="button"
                className={`gus-freq-btn ${frequency === f.id ? 'active' : ''}`}
                onClick={() => onFrequencyChange(f.id)}
                title={f.hint}
              >
                <span className="freq-label">{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CSV Download Action Button */}
        <div className="gus-download-action">
          <button
            type="button"
            className="btn-gus-download-csv"
            onClick={onDownloadCsv}
            title="Pobierz zagregowane dane koszyka GUS BDL jako plik CSV z kodowaniem UTF-8"
          >
            <FaFileCsv size={16} />
            <div className="download-text-group">
              <span className="download-title">Pobierz koszyk CSV</span>
              <span className="download-sub">{totalChunks} rekordów ({frequency.toLowerCase()})</span>
            </div>
            <FaDownload size={14} className="download-arrow" />
          </button>
        </div>
      </div>

      {/* Bottom Row: Basket category filter & Selection controls */}
      <div className="gus-controls-row-bottom">
        <div className="gus-basket-filter-group">
          <span className="gus-filter-label">
            <FaBasketShopping size={13} />
            <span>Skład koszyka:</span>
          </span>
          <div className="gus-category-pills">
            {basketCategories.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`gus-cat-pill ${basketFilter === cat.id ? 'active' : ''}`}
                onClick={() => onBasketFilterChange(cat.id)}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
          <span className="gus-products-count-badge">
            {activeProductsCount} reprezentantów w koszyku
          </span>
        </div>

        {/* Bulk table selection tools */}
        <div className="gus-selection-tools">
          <span className="selection-count-text">
            Zaznaczono: <strong>{selectedChunksCount}</strong> / {totalChunks}
          </span>
          <button
            type="button"
            className="btn-gus-select-toggle"
            onClick={allVisibleSelected ? onClearSelected : onSelectAllVisible}
          >
            <FaCheck size={12} />
            <span>{allVisibleSelected ? 'Odznacz widoczne' : 'Zaznacz widoczne'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

