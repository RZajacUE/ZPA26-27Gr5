import React, { useState, useMemo } from 'react';
import { 
  DEFAULT_GUS_API_KEY, 
  generateBasketChunks, 
  exportGusBasketToCsv,
  testGusBdlConnection, 
  GUS_BASKET_PRODUCTS 
} from '../services/gusBdlApi';
import GusNavbar from './GusNavbar';
import GusStatsCards from './GusStatsCards';
import GusControlsBar from './GusControlsBar';
import GusChart from './GusChart';
import GusDataTable from './GusDataTable';
import GusFooter from './GusFooter';
import GusApiKeyModal from './GusApiKeyModal';
import GusSimplifiedView from './GusSimplifiedView';
import SlideMenu from './SlideMenu';
import TableOfContents from './TableOfContents';
import { FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';

export default function GusPortal({ activePortal, onTogglePortal }) {
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [viewMode, setViewMode] = useState('SIMPLIFIED');
  const [isSlideMenuOpen, setIsSlideMenuOpen] = useState(false);
  const [activeTocSection, setActiveTocSection] = useState('sec-gus-stats');
  const [startDate, setStartDate] = useState('2018-01-01');
  const [endDate, setEndDate] = useState(todayStr);
  const [isEndingPresent, setIsEndingPresent] = useState(true);
  const [frequency, setFrequency] = useState('WEEKS');
  const [basketFilter, setBasketFilter] = useState('ALL');

  const [apiKey, setApiKey] = useState(DEFAULT_GUS_API_KEY);
  const [apiStatus, setApiStatus] = useState('CONNECTED');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedChunkIds, setSelectedChunkIds] = useState(new Set());
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  const handleToggleEndingPresent = () => {
    if (!isEndingPresent) {
      setEndDate(todayStr);
      setIsEndingPresent(true);
      showToast('Ustawiono datę końcową na dzień dzisiejszy');
    } else {
      setIsEndingPresent(false);
    }
  };

  const handleStartDateChange = (val) => {
    setStartDate(val);
  };

  const handleEndDateChange = (val) => {
    setEndDate(val);
    setIsEndingPresent(false);
  };

  const selectedProductIds = useMemo(() => {
    if (basketFilter === 'ALL') return 'ALL';
    if (basketFilter === 'FOOD') {
      return GUS_BASKET_PRODUCTS.filter(p => p.category === 'Żywność' || p.category === 'Nabiał' || p.category === 'Mięso' || p.category === 'Warzywa' || p.category === 'Owoce').map(p => p.id);
    }
    if (basketFilter === 'FUELS') {
      return GUS_BASKET_PRODUCTS.filter(p => p.category === 'Paliwa detaliczne' || p.category === 'Usługi').map(p => p.id);
    }
    if (basketFilter === 'ENERGY') {
      return GUS_BASKET_PRODUCTS.filter(p => p.category === 'Nośniki energii' || p.category === 'Usługi').map(p => p.id);
    }
    return 'ALL';
  }, [basketFilter]);

  const { chunks, summary, activeProducts } = useMemo(() => {
    try {
      return generateBasketChunks({
        startDate,
        endDate: isEndingPresent ? todayStr : endDate,
        frequency,
        selectedProductIds,
      });
    } catch {
      return { chunks: [], summary: {}, activeProducts: [] };
    }
  }, [startDate, endDate, isEndingPresent, todayStr, frequency, selectedProductIds]);

  const handleRefreshData = async () => {
    setIsLoading(true);
    const testRes = await testGusBdlConnection(apiKey);
    setIsLoading(false);
    if (testRes.success) {
      setApiStatus('CONNECTED');
      showToast(`Zaktualizowano dane z GUS BDL API (${chunks.length} okresów)`);
    } else {
      setApiStatus('SYNCED');
      showToast(`Zaktualizowano dane koszyka GUS BDL (${chunks.length} okresów)`);
    }
  };

  const handleDownloadCsv = () => {
    if (!chunks || chunks.length === 0) {
      showToast('Brak danych do wyeksportowania', 'error');
      return;
    }

    const targetChunks = selectedChunkIds.size > 0
      ? chunks.filter(c => selectedChunkIds.has(c._id))
      : chunks;

    const startYear = startDate.slice(0, 4);
    const endYear = (isEndingPresent ? todayStr : endDate).slice(0, 4);
    const filename = `gus_bdl_koszyk_${startYear}_${endYear}_${frequency.toLowerCase()}_${targetChunks.length}_rekordow.csv`;

    exportGusBasketToCsv(targetChunks, activeProducts, filename);
    showToast(`Pobrano plik ${filename}`);
  };

  const handleToggleChunk = (id) => {
    setSelectedChunkIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const allVisibleSelected = chunks.length > 0 && chunks.every(c => selectedChunkIds.has(c._id));
  const someVisibleSelected = chunks.some(c => selectedChunkIds.has(c._id));

  const handleSelectAllVisible = () => {
    setSelectedChunkIds(prev => {
      const next = new Set(prev);
      chunks.forEach(c => next.add(c._id));
      return next;
    });
    showToast(`Zaznaczono ${chunks.length} okresów`);
  };

  const handleClearSelected = () => {
    setSelectedChunkIds(new Set());
    showToast('Wyczyszczono zaznaczenia');
  };

  const gusSections = [
    { id: 'sec-gus-stats', type: 'stats', label: '1. Wskaźniki koszyka' },
    { id: 'sec-gus-controls', type: 'filters', label: '2. Filtry & Chunking' },
    { id: 'sec-gus-chart', type: 'chart', label: '3. Wykres mediany' },
    { id: 'sec-gus-table', type: 'table', label: '4. Tabela agregacji', badge: `${chunks.length}` },
  ];

  return (
    <div className="gus-app-container">
      <GusNavbar
        activePortal={activePortal}
        onTogglePortal={onTogglePortal}
        apiKey={apiKey}
        apiStatus={apiStatus}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        onOpenSlideMenu={() => setIsSlideMenuOpen(true)}
      />

      <main className="gus-main-content">
        {viewMode === 'SIMPLIFIED' ? (
          <GusSimplifiedView
            chunks={chunks}
            summary={summary}
            activeProducts={activeProducts}
            onSwitchToAdvanced={() => setViewMode('ADVANCED')}
            onOpenSlideMenu={() => setIsSlideMenuOpen(true)}
          />
        ) : (
          <>
            <TableOfContents 
              sections={gusSections} 
              activeSection={activeTocSection} 
              onSelectSection={setActiveTocSection} 
              theme="gus" 
            />

            <section id="sec-gus-stats" className="portal-section">
              <GusStatsCards
                summary={summary}
                frequency={frequency}
                startDate={startDate}
                endDate={isEndingPresent ? todayStr : endDate}
              />
            </section>

            <section id="sec-gus-controls" className="portal-section">
              <GusControlsBar
                startDate={startDate}
                endDate={endDate}
                isEndingPresent={isEndingPresent}
                onStartDateChange={handleStartDateChange}
                onEndDateChange={handleEndDateChange}
                onToggleEndingPresent={handleToggleEndingPresent}
                frequency={frequency}
                onFrequencyChange={setFrequency}
                basketFilter={basketFilter}
                onBasketFilterChange={setBasketFilter}
                onDownloadCsv={handleDownloadCsv}
                totalChunks={chunks.length}
                selectedChunksCount={selectedChunkIds.size}
                onSelectAllVisible={handleSelectAllVisible}
                onClearSelected={handleClearSelected}
                allVisibleSelected={allVisibleSelected}
                activeProductsCount={activeProducts.length}
              />
            </section>

            <section id="sec-gus-chart" className="portal-section">
              <GusChart chunks={chunks} frequency={frequency} />
            </section>

            <section id="sec-gus-table" className="portal-section">
              <GusDataTable
                chunks={chunks}
                selectedIds={selectedChunkIds}
                onToggleChunk={handleToggleChunk}
                onToggleAllVisible={allVisibleSelected ? handleClearSelected : handleSelectAllVisible}
                allVisibleSelected={allVisibleSelected}
                someVisibleSelected={someVisibleSelected}
                activeProducts={activeProducts}
              />
            </section>
          </>
        )}
      </main>

      <GusFooter />

      {/* Slide Menu Drawer */}
      <SlideMenu
        isOpen={isSlideMenuOpen}
        onClose={() => setIsSlideMenuOpen(false)}
        activePortal={activePortal}
        onTogglePortal={onTogglePortal}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        startDate={startDate}
        endDate={endDate}
        isEndingPresent={isEndingPresent}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        onToggleEndingPresent={handleToggleEndingPresent}
        frequency={frequency}
        onFrequencyChange={setFrequency}
        basketFilter={basketFilter}
        onBasketFilterChange={setBasketFilter}
        onRefreshGusData={handleRefreshData}
        onDownloadGusCsv={handleDownloadCsv}
        apiKey={apiKey}
        onSaveApiKey={(newKey) => {
          setApiKey(newKey);
          showToast('Zaktualizowano klucz API BDL');
        }}
        apiStatus={apiStatus}
        gusChunksCount={chunks.length}
      />

      <GusApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        currentKey={apiKey}
        onSaveKey={(newKey) => {
          setApiKey(newKey);
          showToast('Zaktualizowano klucz API BDL');
        }}
        setApiStatus={setApiStatus}
      />

      {toast && (
        <div className={`gus-toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          <span className="toast-icon">
            {toast.type === 'error' ? <FaCircleXmark size={18} /> : <FaCircleCheck size={18} />}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
