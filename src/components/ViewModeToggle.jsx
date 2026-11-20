import React from 'react';
import { FaTableColumns, FaTableList, FaChartLine } from 'react-icons/fa6';

export default function ViewModeToggle({ viewMode, onToggleViewMode, theme = 'orlen' }) {
  return (
    <div className={`view-mode-toggle-group ${theme === 'gus' ? 'theme-gus' : 'theme-orlen'}`}>
      <button
        type="button"
        className={`view-mode-btn ${viewMode === 'SIMPLIFIED' ? 'active' : ''}`}
        onClick={() => onToggleViewMode('SIMPLIFIED')}
        title="Widok uproszczony: podsumowanie budżetowe, kalkulator siły nabywczej"
      >
        <FaTableColumns size={12} />
        <span>Uproszczony</span>
      </button>

      <button
        type="button"
        className={`view-mode-btn ${viewMode === 'ADVANCED' ? 'active' : ''}`}
        onClick={() => onToggleViewMode('ADVANCED')}
        title="Widok zaawansowany: pełna tabela notowań, filtry reguł, multi-selekcja i eksport"
      >
        <FaTableList size={12} />
        <span>Zaawansowany</span>
      </button>

      <button
        type="button"
        className={`view-mode-btn ${viewMode === 'ANALYSIS' ? 'active' : ''}`}
        onClick={() => onToggleViewMode('ANALYSIS')}
        title="Panel analityczny: wykresy porównawcze, predykcja cen, symulacja trendów"
      >
        <FaChartLine size={12} />
        <span>Analiza</span>
      </button>
    </div>
  );
}
