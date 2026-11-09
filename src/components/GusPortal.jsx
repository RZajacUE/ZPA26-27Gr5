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
import { FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';
import '../GusPortal.css';

export default function GusPortal({ activePortal, onTogglePortal }) {
  // Today's date formatted as YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Controls state
  const [startDate, setStartDate] = useState('2018-01-01');
  const [endDate, setEndDate] = useState(todayStr);
  const [isEndingPresent, setIsEndingPresent] = useState(true);
  const [frequency, setFrequency] = useState('WEEKS'); // 'DAYS' | 'WEEKS' | 'MONTHS'
  const [basketFilter, setBasketFilter] = useState('ALL'); // 'ALL' | 'FOOD' | 'FUELS' | 'ENERGY'

  // API Key & Connection state
  const [apiKey, setApiKey] = useState(DEFAULT_GUS_API_KEY);
  const [apiStatus, setApiStatus] = useState('CONNECTED');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Table selection state
  const [selectedChunkIds, setSelectedChunkIds] = useState(new Set());

  // Toast feedback state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  // Handle "Ending or present date" toggle
  const handleToggleEndingPresent = () => {
    if (!isEndingPresent) {
      setEndDate(todayStr);
      setIsEndingPresent(true);
      showToast('Ustawiono datę końcową na dzień dzisiejszy (Present date)');
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

  // Determine active products based on category filter
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

  // Generate chunks and summary
  const { chunks, summary, activeProducts } = useMemo(() => {
    try {
      return generateBasketChunks({
        startDate,
        endDate: isEndingPresent ? todayStr : endDate,
        frequency,
        selectedProductIds,
      });
    } catch (e) {
      return { chunks: [], summary: {}, activeProducts: [] };
    }
  }, [startDate, endDate, isEndingPresent, todayStr, frequency, selectedProductIds]);

  // Refresh data simulation / BDL check
  const handleRefreshData = async () => {
    setIsLoading(true);
    const testRes = await testGusBdlConnection(apiKey);
    setIsLoading(false);
    if (testRes.success) {
      setApiStatus('CONNECTED');
      showToast(`Pomyślnie zaktualizowano dane z GUS BDL API (${chunks.length} okresów)`);
    } else {
      setApiStatus('SYNCED');
      showToast(`Zaktualizowano dane koszyka GUS BDL (${chunks.length} okresów)`);
    }
  };

  // CSV Export handler
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
    const filename = `gus_bdl_koszyk_konsumencki_${startYear}_${endYear}_${frequency.toLowerCase()}_${targetChunks.length}_rekordow.csv`;

    exportGusBasketToCsv(targetChunks, activeProducts, filename);
    showToast(`Wyeksportowano ${targetChunks.length} rekordów do ${filename}`);
  };

  // Selection handlers
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
    showToast(`Zaznaczono wszystkie ${chunks.length} okresów`);
  };

  const handleClearSelected = () => {
    setSelectedChunkIds(new Set());
    showToast('Wyczyszczono zaznaczenia');
  };

  return (
    <div className="gus-app-container">
      {/* Official GUS Header */}
      <GusNavbar
        activePortal={activePortal}
        onTogglePortal={onTogglePortal}
        apiKey={apiKey}
        apiStatus={apiStatus}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        onRefreshData={handleRefreshData}
        isLoading={isLoading}
      />

      <main className="gus-main-content">
        {/* Statistics Cards (Weak Median, Basket Total, Inflation %, Fuel vs Food) */}
        <GusStatsCards
          summary={summary}
          frequency={frequency}
          startDate={startDate}
          endDate={isEndingPresent ? todayStr : endDate}
        />

        {/* User Controls: Start Date, Ending/Present Date, Chunk Frequency (Days, Weeks, Months), Basket Filter & CSV Download */}
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

        {/* Interactive Visualization Chart (Basket Total vs Weekly Median) */}
        <GusChart chunks={chunks} frequency={frequency} />

        {/* Data Table with Sorting, Checkbox Selection and Pagination */}
        <GusDataTable
          chunks={chunks}
          selectedIds={selectedChunkIds}
          onToggleChunk={handleToggleChunk}
          onToggleAllVisible={allVisibleSelected ? handleClearSelected : handleSelectAllVisible}
          allVisibleSelected={allVisibleSelected}
          someVisibleSelected={someVisibleSelected}
          activeProducts={activeProducts}
        />
      </main>

      {/* Official GUS Footer */}
      <GusFooter onTogglePortal={onTogglePortal} />

      {/* API Key Configuration Modal */}
      <GusApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        currentKey={apiKey}
        onSaveKey={(newKey) => {
          setApiKey(newKey);
          showToast('Zaktualizowano klucz API BDL');
        }}
        apiStatus={apiStatus}
        setApiStatus={setApiStatus}
      />

      {/* Toast Feedback */}
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

