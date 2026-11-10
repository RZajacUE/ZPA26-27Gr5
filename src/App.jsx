import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FaCircleCheck, FaCircleXmark, FaTriangleExclamation } from 'react-icons/fa6';
import Navbar from './components/Navbar';
import StatsCards from './components/StatsCards';
import ControlsBar from './components/ControlsBar';
import DataTable from './components/DataTable';
import OrlenSimplifiedView from './components/OrlenSimplifiedView';
import SlideMenu from './components/SlideMenu';
import TableOfContents from './components/TableOfContents';
import { OrlenMainLogo, OrlenAppLogo } from './components/OrlenLogos';
import { parseCsv, downloadRecordsAsCsv } from './utils/csvParser';
import GusPortal from './components/GusPortal';
import './App.css';

export default function App() {
  const [activePortal, setActivePortal] = useState('ORLEN');
  const [isSlideMenuOpen, setIsSlideMenuOpen] = useState(false);

  const handleTogglePortal = (mode) => {
    setActivePortal(mode);
  };

  if (activePortal === 'GUS') {
    return (
      <GusPortal
        activePortal={activePortal}
        onTogglePortal={handleTogglePortal}
        isSlideMenuOpen={isSlideMenuOpen}
        setIsSlideMenuOpen={setIsSlideMenuOpen}
      />
    );
  }

  return (
    <OrlenApp 
      onTogglePortal={handleTogglePortal} 
      isSlideMenuOpen={isSlideMenuOpen}
      setIsSlideMenuOpen={setIsSlideMenuOpen}
    />
  );
}

function OrlenApp({ onTogglePortal, isSlideMenuOpen: propSlideMenuOpen, setIsSlideMenuOpen: propSetSlideMenuOpen }) {
  const [viewMode, setViewMode] = useState('SIMPLIFIED');
  const [internalSlideMenuOpen, setInternalSlideMenuOpen] = useState(false);
  const isSlideMenuOpen = propSlideMenuOpen !== undefined ? propSlideMenuOpen : internalSlideMenuOpen;
  const setIsSlideMenuOpen = propSetSlideMenuOpen || setInternalSlideMenuOpen;
  const fileInputRef = useRef(null);

  const [currentDataset, setCurrentDataset] = useState({
    id: 'Orlen_pb95_2026.csv',
    name: 'Orlen_pb95_2026.csv',
    isCustom: false,
  });

  const [headers, setHeaders] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeRule, setActiveRule] = useState('ALL');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState('50');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  useEffect(() => {
    if (currentDataset.isCustom) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const tryFetch = async () => {
      const pathsToTry = [
        `/data/csv/${currentDataset.id}`,
        `/data/csv/${currentDataset.id.toLowerCase()}`,
        `/csv/${currentDataset.id}`,
        `/csv/${currentDataset.id.toLowerCase()}`,
        `/data/${currentDataset.id}`,
        `/data/${currentDataset.id.toLowerCase()}`,
        `/${currentDataset.id}`,
        `/${currentDataset.id.toLowerCase()}`,
        `./data/csv/${currentDataset.id}`,
        `./csv/${currentDataset.id}`,
        `./${currentDataset.id}`,
      ];

      for (const path of pathsToTry) {
        try {
          const resp = await fetch(path);
          if (resp.ok) {
            const text = await resp.text();
            if (text && !text.trim().startsWith('<!DOCTYPE') && !text.trim().startsWith('<html')) {
              if (isMounted) {
                const { headers: parsedHeaders, records: parsedRecords } = parseCsv(text);
                setHeaders(parsedHeaders);
                setAllRecords(parsedRecords);
                setIsLoading(false);
                return;
              }
            }
          }
        } catch {
          // fallback to next path
        }
      }

      if (isMounted) {
        setError(`Nie udało się załadować pliku ${currentDataset.id}.`);
        setIsLoading(false);
      }
    };

    tryFetch();

    return () => {
      isMounted = false;
    };
  }, [currentDataset.id, currentDataset.isCustom]);

  const handleSelectDataset = (datasetId) => {
    if (datasetId === currentDataset.id) return;
    setCurrentDataset({
      id: datasetId,
      name: datasetId,
      isCustom: false,
    });
    setSearchQuery('');
    setActiveRule('ALL');
    setSelectedIds(new Set());
    setCurrentPage(1);
  };

  const handleCustomFileUpload = (file) => {
    if (!file) return;
    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        const { headers: parsedHeaders, records: parsedRecords } = parseCsv(text);
        setHeaders(parsedHeaders);
        setAllRecords(parsedRecords);
        setCurrentDataset({
          id: `custom_${file.name}`,
          name: file.name,
          isCustom: true,
        });
        setSelectedIds(new Set());
        setSearchQuery('');
        setActiveRule('ALL');
        setCurrentPage(1);
        setIsLoading(false);
        showToast(`Załadowano plik ${file.name} (${parsedRecords.length} wierszy)`);
      }
    };

    reader.onerror = () => {
      setError(`Błąd podczas odczytu pliku ${file.name}`);
      setIsLoading(false);
    };

    reader.readAsText(file, 'UTF-8');
  };

  const filteredRecords = useMemo(() => {
    let result = [...allRecords];

    if (activeRule === 'PB95') {
      result = result.filter(r => r._parsed?.symbol?.toLowerCase() === 'pb95' || r._parsed?.product?.toLowerCase().includes('eurosuper'));
    } else if (activeRule === 'ON') {
      result = result.filter(r => r._parsed?.symbol?.toLowerCase() === 'on' || r._parsed?.product?.toLowerCase().includes('ekodiesel') || r._parsed?.product?.toLowerCase().includes('napędowy'));
    } else if (activeRule === 'HIGH_PRICE') {
      result = result.filter(r => (r._parsed?.price || 0) > 6000);
    } else if (activeRule === 'MID_PRICE') {
      result = result.filter(r => (r._parsed?.price || 0) >= 4500 && (r._parsed?.price || 0) <= 6000);
    } else if (activeRule === 'LOW_PRICE') {
      result = result.filter(r => (r._parsed?.price || 0) < 4500 && (r._parsed?.price || 0) > 0);
    } else if (activeRule === 'RECENT_30') {
      result = result.slice(-30);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(row => {
        const p = row._parsed;
        return (
          p.date.toLowerCase().includes(q) ||
          p.product.toLowerCase().includes(q) ||
          p.symbol.toLowerCase().includes(q) ||
          String(p.price).includes(q) ||
          p.priceFormatted.toLowerCase().includes(q) ||
          p.unit.toLowerCase().includes(q) ||
          p.publishFrom.toLowerCase().includes(q) ||
          p.sourceUrl.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [allRecords, activeRule, searchQuery]);

  const sortedRecords = useMemo(() => {
    if (!sortConfig.key) return filteredRecords;

    const sorted = [...filteredRecords];
    const { key, direction } = sortConfig;
    const factor = direction === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      const parsedA = a._parsed;
      const parsedB = b._parsed;

      if (key === 'date') {
        const timeA = parsedA.dateObj ? parsedA.dateObj.getTime() : 0;
        const timeB = parsedB.dateObj ? parsedB.dateObj.getTime() : 0;
        return (timeA - timeB) * factor;
      }

      if (key === 'price') {
        return (parsedA.price - parsedB.price) * factor;
      }

      if (key === 'publishFrom') {
        const timeA = parsedA.publishFrom ? new Date(parsedA.publishFrom).getTime() : 0;
        const timeB = parsedB.publishFrom ? new Date(parsedB.publishFrom).getTime() : 0;
        return (timeA - timeB) * factor;
      }

      const valA = String(parsedA[key] || a[key] || '');
      const valB = String(parsedB[key] || b[key] || '');
      return valA.localeCompare(valB, 'pl') * factor;
    });

    return sorted;
  }, [filteredRecords, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        if (prev.direction === 'desc') return { key: 'date', direction: 'desc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleToggleRecord = (recordId) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(recordId)) {
        next.delete(recordId);
      } else {
        next.add(recordId);
      }
      return next;
    });
  };

  const allVisibleSelected = sortedRecords.length > 0 && sortedRecords.every(r => selectedIds.has(r._id));
  const someVisibleSelected = sortedRecords.some(r => selectedIds.has(r._id));

  const handleSelectAllVisible = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      sortedRecords.forEach(r => next.add(r._id));
      return next;
    });
    showToast(`Zaznaczono ${sortedRecords.length} widocznych rekordów`);
  };

  const handleDeselectVisible = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      sortedRecords.forEach(r => next.delete(r._id));
      return next;
    });
  };

  const handleToggleAllVisible = () => {
    if (allVisibleSelected) {
      handleDeselectVisible();
    } else {
      handleSelectAllVisible();
    }
  };

  const handleClearAllSelected = () => {
    setSelectedIds(new Set());
    showToast('Wyczyszczono zaznaczenia');
  };

  const handleDownloadSelected = () => {
    const selectedRecordsList = allRecords.filter(r => selectedIds.has(r._id));
    if (selectedRecordsList.length === 0) {
      showToast('Zaznacz przynajmniej jeden wiersz do pobrania', 'error');
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const filename = `orlen_${currentDataset.name.replace(/\.csv$/i, '')}_wybrane_${selectedRecordsList.length}_rekordow_${todayStr}.csv`;

    downloadRecordsAsCsv(selectedRecordsList, headers, filename, ';');
    showToast(`Pobrano ${selectedRecordsList.length} wybranych rekordów`);
  };

  const handleDownloadVisible = () => {
    if (sortedRecords.length === 0) {
      showToast('Brak widocznych rekordów do pobrania', 'error');
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const filename = `orlen_${currentDataset.name.replace(/\.csv$/i, '')}_widok_${sortedRecords.length}_rekordow_${todayStr}.csv`;

    downloadRecordsAsCsv(sortedRecords, headers, filename, ';');
    showToast(`Pobrano ${sortedRecords.length} widocznych rekordów`);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveRule('ALL');
  };

  const [activeTocSection, setActiveTocSection] = useState('sec-orlen-stats');

  const orlenSections = [
    { id: 'sec-orlen-stats', type: 'stats', label: '1. Wskaźniki statystyczne' },
    { id: 'sec-orlen-filters', type: 'filters', label: '2. Filtry i wyszukiwanie' },
    { id: 'sec-orlen-table', type: 'table', label: '3. Tabela notowań', badge: `${sortedRecords.length}` },
  ];

  return (
    <div className="orlen-app-container">
      <Navbar
        currentDataset={currentDataset}
        onSelectDataset={handleSelectDataset}
        onCustomFileUpload={handleCustomFileUpload}
        recordCount={allRecords.length}
        isLoading={isLoading}
        onTogglePortal={onTogglePortal}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        onOpenSlideMenu={() => setIsSlideMenuOpen(true)}
      />

      <main className="orlen-main-content">
        {error && (
          <div className="orlen-alert orlen-alert-error">
            <span className="alert-icon">
              <FaTriangleExclamation size={20} />
            </span>
            <div className="alert-content">
              <strong>Błąd wczytywania:</strong> {error}
            </div>
          </div>
        )}

        {viewMode === 'SIMPLIFIED' ? (
          <OrlenSimplifiedView
            records={allRecords}
            headers={headers}
            currentDataset={currentDataset}
            onSwitchToAdvanced={() => setViewMode('ADVANCED')}
            onOpenSlideMenu={() => setIsSlideMenuOpen(true)}
          />
        ) : (
          <>
            <TableOfContents 
              sections={orlenSections}
              activeSection={activeTocSection}
              onSelectSection={setActiveTocSection}
              theme="orlen"
            />

            <section id="sec-orlen-stats" className="portal-section">
              <StatsCards
                records={allRecords}
                selectedIds={selectedIds}
                visibleRecordsCount={sortedRecords.length}
              />
            </section>

            <section id="sec-orlen-filters" className="portal-section">
              <ControlsBar
                searchQuery={searchQuery}
                onSearchChange={(q) => {
                  setSearchQuery(q);
                  setCurrentPage(1);
                }}
                activeRule={activeRule}
                onSelectRule={(ruleId) => {
                  setActiveRule(ruleId);
                  setCurrentPage(1);
                }}
                onSelectAllVisible={handleSelectAllVisible}
                onDeselectVisible={handleDeselectVisible}
                onClearAllSelected={handleClearAllSelected}
                onDownloadSelected={handleDownloadSelected}
                onDownloadVisible={handleDownloadVisible}
                selectedCount={selectedIds.size}
                visibleCount={sortedRecords.length}
                totalCount={allRecords.length}
                allVisibleSelected={allVisibleSelected}
                someVisibleSelected={someVisibleSelected}
              />
            </section>

            <section id="sec-orlen-table" className="portal-section">
              <DataTable
                records={sortedRecords}
                selectedIds={selectedIds}
                onToggleRecord={handleToggleRecord}
                onToggleAllVisible={handleToggleAllVisible}
                sortConfig={sortConfig}
                onSort={handleSort}
                allVisibleSelected={allVisibleSelected}
                someVisibleSelected={someVisibleSelected}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
                onResetFilters={handleResetFilters}
              />
            </section>
          </>
        )}
      </main>

      <footer className="unified-footer orlen-footer-unified">
        <div className="unified-footer-content">
          <div className="footer-brand-col">
            <div className="footer-logo-box">
              <OrlenAppLogo height={24} alt="ORLEN Logo" />
              <OrlenMainLogo height={20} alt="PKN ORLEN" />
            </div>
            <span className="footer-desc-text">
              Portal Cen Hurtowych Paliw PKN ORLEN • Notowania spotowe
            </span>
          </div>

          <div className="footer-meta-col">
            <div className="meta-pill">
              <span>Standard: UTF-8 z BOM (separator <b className="separator-bold">;</b>)</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Hidden file input for slide menu upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleCustomFileUpload(file);
            e.target.value = '';
          }
        }}
        accept=".csv,text/csv"
        style={{ display: 'none' }}
      />

      {/* Slide Menu Drawer */}
      <SlideMenu
        isOpen={isSlideMenuOpen}
        onClose={() => setIsSlideMenuOpen(false)}
        activePortal="ORLEN"
        onTogglePortal={onTogglePortal}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        currentDataset={currentDataset}
        onSelectDataset={handleSelectDataset}
        onUploadCsvClick={() => {
          setIsSlideMenuOpen(false);
          fileInputRef.current?.click();
        }}
        activeRule={activeRule}
        onSelectRule={setActiveRule}
        onDownloadOrlenCsv={handleDownloadSelected}
        orlenRecordsCount={allRecords.length}
      />

      {toast && (
        <div className={`orlen-toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          <span className="toast-icon">
            {toast.type === 'error' ? <FaCircleXmark size={18} /> : <FaCircleCheck size={18} />}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
