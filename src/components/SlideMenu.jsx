import React, { useState } from 'react';
import { 
  FaXmark, 
  FaGasPump, 
  FaChartPie, 
  FaTableColumns, 
  FaTableList, 
  FaUpload, 
  FaCalendarDays, 
  FaFileCsv, 
  FaShieldHalved, 
  FaArrowRotateRight,
  FaClock,
  FaBookOpen,
  FaSliders,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaTriangleExclamation,
  FaRotateLeft
} from 'react-icons/fa6';
import { OrlenAppLogo } from './OrlenLogos';
import { GusLogo, GusEmblem } from './GusLogos';
import { 
  DEFAULT_GUS_API_KEY, 
  isValidGusApiKey, 
  maskApiKey 
} from '../services/gusBdlApi';

export default function SlideMenu({
  isOpen,
  onClose,
  activePortal,
  onTogglePortal,
  viewMode,
  onToggleViewMode,
  // Orlen props
  currentDataset,
  onSelectDataset,
  onUploadCsvClick,
  activeRule,
  onSelectRule,
  onDownloadOrlenCsv,
  orlenRecordsCount,
  // Gus props
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
  onRefreshGusData,
  onDownloadGusCsv,
  apiKey,
  onSaveApiKey,
  apiStatus,
  gusChunksCount
}) {
  const [activeTab, setActiveTab] = useState('SETTINGS'); // 'SETTINGS' | 'GLOSSARY'
  const [isKeyRevealed, setIsKeyRevealed] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [keySaveMessage, setKeySaveMessage] = useState(null);

  if (!isOpen) return null;

  const isCustomKeyValid = isValidGusApiKey(customKeyInput);

  const handleApplyCustomKey = () => {
    if (isCustomKeyValid && onSaveApiKey) {
      onSaveApiKey(customKeyInput.trim());
      setKeySaveMessage({ type: 'success', text: 'Klucz API został pomyślnie zaktualizowany!' });
      setCustomKeyInput('');
      setTimeout(() => setKeySaveMessage(null), 3000);
    }
  };

  const handleResetToDefaultKey = () => {
    if (onSaveApiKey) {
      onSaveApiKey(DEFAULT_GUS_API_KEY);
      setKeySaveMessage({ type: 'info', text: 'Przywrócono domyślny klucz z pliku .env' });
      setCustomKeyInput('');
      setTimeout(() => setKeySaveMessage(null), 3000);
    }
  };

  const orlenRules = [
    { id: 'ALL', label: 'Wszystkie rekordy' },
    { id: 'PB95', label: 'Tylko Pb95' },
    { id: 'ON', label: 'Tylko ON Ekodiesel' },
    { id: 'HIGH_PRICE', label: 'Cena > 6 000 zł' },
    { id: 'MID_PRICE', label: 'Cena 4 500 - 6 000 zł' },
    { id: 'LOW_PRICE', label: 'Cena < 4 500 zł' },
    { id: 'RECENT_30', label: 'Ostatnie 30 notowań' },
  ];

  const gusFrequencies = [
    { id: 'DAYS', label: 'Dni' },
    { id: 'WEEKS', label: 'Tygodnie' },
    { id: 'MONTHS', label: 'Miesiące' },
  ];

  const gusCategories = [
    { id: 'ALL', label: 'Pełny koszyk' },
    { id: 'FOOD', label: 'Żywność' },
    { id: 'FUELS', label: 'Paliwa' },
    { id: 'ENERGY', label: 'Energia' },
  ];

  const glossaryTerms = [
    {
      term: 'Koszyk konsumencki (Consumer Basket)',
      category: 'GUS BDL',
      definition: 'Reprezentatywny zestaw dóbr i usług nabywanych przez przeciętne gospodarstwo domowe w Polsce (żywność, nośniki energii, paliwa, usługi). Ceny reprezentantów są monitorowane przez Główny Urząd Statystyczny w Banku Danych Lokalnych (BDL) w celu określania inflacji konsumenckiej (CPI) i dynamiki kosztów życia.'
    },
    {
      term: 'Słaba mediana cenowa (Weak Median Price)',
      category: 'Statystyka cen',
      definition: 'Okresowa (tygodniowa lub miesięczna) mediana cenowa reprezentantów koszyka. W odróżnieniu od średniej arytmetycznej, mediana jest odporna na anomalie rynkowe i skrajne wartości odstające (outliery), dając stabilny wskaźnik rynkowego środka cen.'
    },
    {
      term: 'Obciążenie budżetu konsumenta (% pensji)',
      category: 'Budżet gospodarstwa domowego',
      definition: 'Wskaźnik określający, jaki odsetek średniego miesięcznego wynagrodzenia netto pochłania zakup standardowego wolumenu towaru (np. 50 litrów paliwa lub miesięcznego bazowego koszyka towarów). Niższy procent oznacza wyższą dostępność ekonomiczną dobra.'
    },
    {
      term: 'Przeciętne wynagrodzenie (GUS)',
      category: 'Rynek pracy',
      definition: 'Średnie miesięczne wynagrodzenie w sektorze przedsiębiorstw bez wypłat z zysku publikowane cyklicznie przez GUS. W aplikacji uwzględniono stawki brutto oraz oszacowane wynagrodzenie netto (po potrąceniu składek ZUS i zaliczki na PIT) dla lat 2015–2026.'
    },
    {
      term: 'Cena hurtowa paliw (PKN ORLEN Spot)',
      category: 'Paliwa',
      definition: 'Cena bazowa za 1 m³ (1000 litrów) paliwa w notowaniach hurtowych PKN ORLEN. Stanowi podstawę wyznaczania cen detalicznych na stacjach paliw po doliczeniu podatku VAT, akcyzy, opłaty paliwowej, opłaty emisyjnej i marży stacji.'
    },
    {
      term: 'Realna siła nabywcza wynagrodzenia',
      category: 'Wskaźnik ekonomiczny',
      definition: 'Liczba fizycznych jednostek towaru (np. litrów paliwa lub pełnych koszyków konsumpcyjnych), którą pracownik może nabyć za jedną przeciętną pensję miesięczną netto w danym roku.'
    },
    {
      term: 'Agregacja danych (Chunki czasowe)',
      category: 'Metodologia',
      definition: 'Podział ciągłych notowań cen na stałe okresy (Dni, Tygodnie, Miesiące). Umożliwia wygładzenie szumów jednodniowych i porównywanie trendów w skali krótko- i długoterminowej.'
    },
    {
      term: 'Klucz API BDL (X-ClientId)',
      category: 'Bezpieczeństwo & API',
      definition: 'Indywidualny identyfikator UUID (format: 8-4-4-4-12 znaków szesnastkowych) autoryzujący zapytania do oficjalnego interfejsu REST Banku Danych Lokalnych GUS (bdl.stat.gov.pl).'
    },
    {
      term: 'Format eksportu CSV i separator',
      category: 'Format danych',
      definition: 'Pliki tabelaryczne generowane przez aplikację kodowane są w standardzie UTF-8 z BOM, a separatorem kolumn jest średnik (<b className="separator-bold">;</b>), co zapewnia natywną zgodność z polską wersją MS Excel i LibreOffice Calc.'
    }
  ];

  return (
    <div className="slide-menu-backdrop" onClick={onClose}>
      <aside 
        className={`slide-menu-panel slide-from-left ${activePortal === 'GUS' ? 'gus-theme' : 'orlen-theme'}`} 
        onClick={(e) => e.stopPropagation()}
        aria-label="Panel boczny opcji i słownika"
      >
        {/* Header with Dual-Portal Toggle */}
        <div className="slide-menu-header">
          <div className="menu-portal-toggle-group" role="tablist" aria-label="Przełącznik portalu">
            <button
              type="button"
              className={`menu-portal-toggle-btn ${activePortal === 'ORLEN' ? 'active-orlen' : ''}`}
              onClick={() => onTogglePortal('ORLEN')}
              title="Przełącz do portalu PKN ORLEN"
            >
              <div className="toggle-logo-box">
                <OrlenAppLogo height={20} alt="ORLEN" />
              </div>
              <span className="toggle-label">PKN ORLEN</span>
            </button>
            <button
              type="button"
              className={`menu-portal-toggle-btn ${activePortal === 'GUS' ? 'active-gus' : ''}`}
              onClick={() => onTogglePortal('GUS')}
              title="Przełącz do portalu GUS BDL"
            >
              <div className="toggle-logo-box">
                <GusEmblem height={20} alt="GUS" />
              </div>
              <span className="toggle-label">GUS BDL</span>
            </button>
          </div>

          <button 
            type="button" 
            className="btn-close-drawer" 
            onClick={onClose}
            aria-label="Zamknij menu"
          >
            <FaXmark size={18} />
          </button>
        </div>

        {/* Top Tab Navigator: Settings vs Terms Glossary */}
        <div className="slide-menu-tabs">
          <button
            type="button"
            className={`slide-tab-btn ${activeTab === 'SETTINGS' ? 'active' : ''}`}
            onClick={() => setActiveTab('SETTINGS')}
          >
            <FaSliders size={13} />
            <span>Opcje i ustawienia</span>
          </button>
          <button
            type="button"
            className={`slide-tab-btn ${activeTab === 'GLOSSARY' ? 'active' : ''}`}
            onClick={() => setActiveTab('GLOSSARY')}
          >
            <FaBookOpen size={13} />
            <span>Słownik pojęć</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="slide-menu-content">
          {activeTab === 'GLOSSARY' ? (
            /* GLOSSARY / TERMS EXPLANATION VIEW */
            <div className="glossary-container">
              <div className="glossary-header-card">
                <h4>Baza wiedzy i słownik pojęć</h4>
                <p>
                  Przewodnik po terminach ekonomicznych, metodologii koszyka konsumpcyjnego GUS oraz notowaniach PKN ORLEN.
                </p>
              </div>

              <div className="glossary-list">
                {glossaryTerms.map((item, idx) => (
                  <div key={idx} className="glossary-item-card">
                    <div className="glossary-item-top">
                      <span className="glossary-term-badge">{item.category}</span>
                      <h5 className="glossary-term-title">{item.term}</h5>
                    </div>
                    <p 
                      className="glossary-term-desc"
                      dangerouslySetInnerHTML={{ __html: item.definition }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* SETTINGS / FILTERS VIEW */
            <>
              {/* Section: View Mode Switcher */}
              <div className="drawer-section">
                <label className="section-label">Tryb prezentacji:</label>
                <div className="drawer-btn-grid">
                  <button
                    type="button"
                    className={`drawer-choice-btn ${viewMode === 'SIMPLIFIED' ? 'active' : ''}`}
                    onClick={() => onToggleViewMode('SIMPLIFIED')}
                  >
                    <FaTableColumns size={13} />
                    <span>Uproszczony (Budżet)</span>
                  </button>
                  <button
                    type="button"
                    className={`drawer-choice-btn ${viewMode === 'ADVANCED' ? 'active' : ''}`}
                    onClick={() => onToggleViewMode('ADVANCED')}
                  >
                    <FaTableList size={13} />
                    <span>Zaawansowany (Tabela)</span>
                  </button>
                </div>
              </div>

              {/* Section 2: Portal Specific Options */}
              {activePortal === 'ORLEN' ? (
                <>
                  {/* ORLEN Dataset Selector */}
                  <div className="drawer-section">
                    <label className="section-label" htmlFor="drawer-dataset-select">
                      Zbiór danych notowań paliw:
                    </label>
                    <select
                      id="drawer-dataset-select"
                      value={currentDataset?.id}
                      onChange={(e) => onSelectDataset?.(e.target.value)}
                      className="drawer-select"
                    >
                      <option value="Orlen_pb95_2026.csv">Orlen_pb95_2026.csv (Eurosuper 95)</option>
                      <option value="Orlen_on_2026.csv">Orlen_on_2026.csv (Ekodiesel ON)</option>
                      {currentDataset?.isCustom && (
                        <option value={currentDataset.id}>{currentDataset.name} (Własny plik)</option>
                      )}
                    </select>

                    <button
                      type="button"
                      className="btn-drawer-action"
                      onClick={onUploadCsvClick}
                    >
                      <FaUpload size={13} />
                      <span>Wgraj inny plik CSV z dysku</span>
                    </button>
                  </div>

                  {/* ORLEN Filter Rules */}
                  {onSelectRule && (
                    <div className="drawer-section">
                      <label className="section-label">Filtry reguł cenowych:</label>
                      <div className="drawer-pills-list">
                        {orlenRules.map(rule => (
                          <button
                            key={rule.id}
                            type="button"
                            className={`drawer-pill ${activeRule === rule.id ? 'active' : ''}`}
                            onClick={() => onSelectRule(rule.id)}
                          >
                            {rule.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ORLEN Export Action */}
                  <div className="drawer-section">
                    <label className="section-label">Eksport danych:</label>
                    <button
                      type="button"
                      className="btn-drawer-download"
                      onClick={onDownloadOrlenCsv}
                    >
                      <FaFileCsv size={15} />
                      <span>Pobierz dane notowań (CSV)</span>
                    </button>
                    <span className="section-hint">Dostępne wpisy: {orlenRecordsCount} notowań</span>
                  </div>
                </>
              ) : (
                <>
                  {/* GUS Date Range */}
                  <div className="drawer-section">
                    <label className="section-label">Zakres dat analizy:</label>
                    <div className="drawer-dates-row">
                      <div className="date-col">
                        <span className="date-sub">Od:</span>
                        <input
                          type="date"
                          value={startDate}
                          min="2015-01-01"
                          max={endDate}
                          onChange={(e) => onStartDateChange?.(e.target.value)}
                          className="drawer-date-input"
                        />
                      </div>
                      <div className="date-col">
                        <span className="date-sub">Do:</span>
                        <input
                          type="date"
                          value={endDate}
                          min={startDate}
                          max="2026-12-31"
                          disabled={isEndingPresent}
                          onChange={(e) => onEndDateChange?.(e.target.value)}
                          className={`drawer-date-input ${isEndingPresent ? 'disabled' : ''}`}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`btn-drawer-toggle-present ${isEndingPresent ? 'active' : ''}`}
                      onClick={onToggleEndingPresent}
                    >
                      <FaClock size={12} />
                      <span>Ustaw do dnia dzisiejszego</span>
                    </button>
                  </div>

                  {/* GUS Frequency Chunking */}
                  <div className="drawer-section">
                    <label className="section-label">Częstotliwość danych (Chunking):</label>
                    <div className="drawer-btn-grid triple">
                      {gusFrequencies.map(f => (
                        <button
                          key={f.id}
                          type="button"
                          className={`drawer-choice-btn ${frequency === f.id ? 'active' : ''}`}
                          onClick={() => onFrequencyChange?.(f.id)}
                        >
                          <span>{f.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* GUS Basket Category Filter */}
                  <div className="drawer-section">
                    <label className="section-label">Kategorie w koszyku:</label>
                    <div className="drawer-pills-list">
                      {gusCategories.map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          className={`drawer-pill ${basketFilter === cat.id ? 'active' : ''}`}
                          onClick={() => onBasketFilterChange?.(cat.id)}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* GUS API Key Management with Regex Validation */}
                  <div className="drawer-section">
                    <label className="section-label">Klucz API BDL (GUS):</label>
                    
                    {/* Masked Active Key */}
                    <div className="drawer-api-info-box">
                      <div className="api-key-row">
                        <FaShieldHalved size={14} className="key-icon" />
                        <span className="key-text" title={isKeyRevealed ? apiKey : 'Klucz ukryty'}>
                          {isKeyRevealed ? apiKey : maskApiKey(apiKey)}
                        </span>
                        <button
                          type="button"
                          className="btn-key-eye"
                          onClick={() => setIsKeyRevealed(!isKeyRevealed)}
                          title={isKeyRevealed ? 'Ukryj klucz' : 'Pokaż klucz'}
                        >
                          {isKeyRevealed ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                        </button>
                        <span 
                          className={`api-status-pip ${apiStatus === 'CONNECTED' ? 'online' : 'cached'}`}
                          title={apiStatus === 'CONNECTED' ? 'Połączono z BDL API' : 'Dane zsynchronizowane'}
                        ></span>
                      </div>

                      {/* Custom Key Input verified with Regex */}
                      <div className="custom-key-entry">
                        <label htmlFor="custom-key-field" className="custom-key-label">
                          Wprowadź własny klucz API:
                        </label>
                        <div className="custom-key-row">
                          <input
                            id="custom-key-field"
                            type="text"
                            value={customKeyInput}
                            onChange={(e) => setCustomKeyInput(e.target.value)}
                            placeholder="8-4-4-4-12 hex (np. 2ead5bb5-...)"
                            className={`custom-key-input ${
                              customKeyInput 
                                ? (isCustomKeyValid ? 'valid-format' : 'invalid-format') 
                                : ''
                            }`}
                          />
                          <button
                            type="button"
                            className="btn-apply-key"
                            onClick={handleApplyCustomKey}
                            disabled={!isCustomKeyValid}
                            title="Zastosuj wprowadzony klucz"
                          >
                            <FaCheck size={12} />
                            <span>Zapisz</span>
                          </button>
                        </div>

                        {/* Regex validation feedback */}
                        {customKeyInput && (
                          <div className={`key-regex-feedback ${isCustomKeyValid ? 'valid' : 'invalid'}`}>
                            {isCustomKeyValid ? (
                              <>
                                <FaCheck size={11} />
                                <span>Prawidłowy format klucza UUID v4 (GUS BDL)</span>
                              </>
                            ) : (
                              <>
                                <FaTriangleExclamation size={11} />
                                <span>Format musi mieć postać 8-4-4-4-12 znaków (UUID)</span>
                              </>
                            )}
                          </div>
                        )}

                        <div className="key-sub-actions">
                          <button
                            type="button"
                            className="btn-sub-link"
                            onClick={handleResetToDefaultKey}
                            title="Przywróć domyślny klucz zdefiniowany w środowisku .env"
                          >
                            <FaRotateLeft size={11} />
                            <span>Przywróć domyślny klucz (.env)</span>
                          </button>
                          <button
                            type="button"
                            className="btn-sub-link refresh"
                            onClick={onRefreshGusData}
                            title="Odśwież połączenie z danymi GUS BDL"
                          >
                            <FaArrowRotateRight size={11} />
                            <span>Odśwież API</span>
                          </button>
                        </div>

                        {keySaveMessage && (
                          <div className={`key-save-banner ${keySaveMessage.type}`}>
                            {keySaveMessage.text}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* GUS Export CSV */}
                  <div className="drawer-section">
                    <label className="section-label">Eksport raportu:</label>
                    <button
                      type="button"
                      className="btn-drawer-download gus"
                      onClick={onDownloadGusCsv}
                    >
                      <FaFileCsv size={15} />
                      <span>Pobierz koszyk konsumencki (CSV)</span>
                    </button>
                    <span className="section-hint">Zagregowane rekordy: {gusChunksCount}</span>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="slide-menu-footer">
          <button 
            type="button" 
            className="btn-drawer-done" 
            onClick={onClose}
          >
            Zastosuj i zamknij
          </button>
        </div>
      </aside>
    </div>
  );
}
