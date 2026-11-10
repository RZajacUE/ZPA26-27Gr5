import React from 'react';
import { FaTableColumns, FaTableList } from 'react-icons/fa6';

export default function ViewModeToggle({ viewMode, onToggleViewMode, theme = 'orlen' }) {
  const isSimplified = viewMode === 'SIMPLIFIED';

  return (
    <div className={`view-mode-toggle-group ${theme === 'gus' ? 'theme-gus' : 'theme-orlen'}`}>
      <button
        type="button"
        className={`view-mode-btn ${isSimplified ? 'active' : ''}`}
        onClick={() => onToggleViewMode('SIMPLIFIED')}
        title="Widok uproszczony: podsumowanie budżetowe, kluczowe wskaźniki i szybki eksport"
      >
        <FaTableColumns size={12} />
        <span>Uproszczony</span>
      </button>

      <button
        type="button"
        className={`view-mode-btn ${!isSimplified ? 'active' : ''}`}
        onClick={() => onToggleViewMode('ADVANCED')}
        title="Widok zaawansowany: pełna tabela, zaawansowane filtry, multi-selekcja i szczegółowe wykresy"
      >
        <FaTableList size={12} />
        <span>Zaawansowany</span>
      </button>
    </div>
  );
}

