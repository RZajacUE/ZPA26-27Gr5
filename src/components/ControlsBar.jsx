import React from 'react';
import { 
  FaMagnifyingGlass, 
  FaDownload, 
  FaCheck, 
  FaXmark,
  FaGasPump,
  FaOilCan,
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaScaleBalanced,
  FaCalendarDays,
  FaLayerGroup
} from 'react-icons/fa6';

export default function ControlsBar({
  searchQuery,
  onSearchChange,
  activeRule,
  onSelectRule,
  onSelectAllVisible,
  onDeselectVisible,
  onClearAllSelected,
  onDownloadSelected,
  onDownloadVisible,
  selectedCount,
  visibleCount,
  totalCount,
  allVisibleSelected,
  someVisibleSelected
}) {
  const rules = [
    { id: 'ALL', label: 'Wszystkie rekordy', icon: <FaLayerGroup size={13} /> },
    { id: 'PB95', label: 'Tylko Pb95', icon: <FaGasPump size={13} /> },
    { id: 'ON', label: 'Tylko ON Ekodiesel', icon: <FaOilCan size={13} /> },
    { id: 'HIGH_PRICE', label: 'Cena > 6 000 zł', icon: <FaArrowTrendUp size={13} /> },
    { id: 'MID_PRICE', label: 'Cena 4 500 - 6 000 zł', icon: <FaScaleBalanced size={13} /> },
    { id: 'LOW_PRICE', label: 'Cena < 4 500 zł', icon: <FaArrowTrendDown size={13} /> },
    { id: 'RECENT_30', label: 'Ostatnie 30 notowań', icon: <FaCalendarDays size={13} /> },
  ];

  return (
    <div className="controls-panel">
      {/* Top row: Search and Export Buttons */}
      <div className="controls-row-main">
        {/* Search bar */}
        <div className="search-bar-wrapper">
          <FaMagnifyingGlass className="search-icon" size={16} />
          <input
            type="text"
            id="orlen-table-search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Szukaj w danych (np. 6080, wrzesień, Pb95, 2026, tool.orlen.pl)..."
            className="search-input"
            aria-label="Wyszukaj w danych"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="search-clear-btn"
              title="Wyczyść wyszukiwanie"
            >
              <FaXmark size={14} />
            </button>
          )}
        </div>

        {/* Download Buttons */}
        <div className="export-actions-group">
          <button
            type="button"
            className={`btn-export-primary ${selectedCount > 0 ? 'btn-active' : 'btn-disabled'}`}
            onClick={onDownloadSelected}
            disabled={selectedCount === 0}
            title={selectedCount > 0 ? `Pobierz ${selectedCount} zaznaczonych rekordów do nowego pliku CSV` : 'Zaznacz przynajmniej jeden wiersz'}
          >
            <FaDownload size={15} />
            <span className="btn-label">Pobierz zaznaczone</span>
            <span className="btn-badge">{selectedCount}</span>
          </button>

          <button
            type="button"
            className="btn-export-secondary"
            onClick={onDownloadVisible}
            title={`Pobierz wszystkie ${visibleCount} aktualnie widoczne rekordy do CSV`}
          >
            <FaDownload size={14} />
            <span className="btn-label">Pobierz widoczne ({visibleCount})</span>
          </button>
        </div>
      </div>

      {/* Middle row: Rule Filters with React Icons */}
      <div className="rules-filter-bar">
        <span className="rules-label">Filtruj wg reguły:</span>
        <div className="rules-pills-list">
          {rules.map((rule) => (
            <button
              key={rule.id}
              type="button"
              className={`rule-pill ${activeRule === rule.id ? 'active' : ''}`}
              onClick={() => onSelectRule(rule.id)}
            >
              <span className="rule-icon">{rule.icon}</span>
              <span>{rule.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom row: Selection Toolbar */}
      <div className="selection-toolbar">
        <div className="selection-info">
          <span className="selection-text">
            Wybrano: <strong>{selectedCount}</strong> rekordów (z <strong>{visibleCount}</strong> widocznych, łączna baza: {totalCount})
          </span>
          {activeRule !== 'ALL' || searchQuery ? (
            <span className="filter-active-indicator">
              Filtrowanie aktywne (widok ograniczony)
            </span>
          ) : null}
        </div>

        <div className="selection-buttons">
          <button
            type="button"
            onClick={onSelectAllVisible}
            className={`btn-select-action ${allVisibleSelected ? 'btn-select-highlight' : ''}`}
            title="Zaznacza tylko rekordy spełniające bieżące kryteria wyszukiwania i filtru"
          >
            <FaCheck size={13} />
            <span>Zaznacz wszystkie widoczne ({visibleCount})</span>
          </button>

          {selectedCount > 0 && (
            <>
              <button
                type="button"
                onClick={onDeselectVisible}
                className="btn-select-action"
                title="Odznacza rekordy widoczne w tabeli"
              >
                <span>Odznacz widoczne</span>
              </button>

              <button
                type="button"
                onClick={onClearAllSelected}
                className="btn-select-action btn-clear"
                title="Czyści zaznaczenie wszystkich rekordów"
              >
                <FaXmark size={13} />
                <span>Wyczyść wszystko</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
