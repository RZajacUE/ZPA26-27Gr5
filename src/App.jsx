import React, { useState, useEffect, useMemo } from 'react';
import { FaCircleCheck, FaCircleXmark, FaTriangleExclamation } from 'react-icons/fa6';
import Navbar from './components/Navbar';
import StatsCards from './components/StatsCards';
import ControlsBar from './components/ControlsBar';
import DataTable from './components/DataTable';
import { OrlenMainLogo, OrlenAppLogo } from './components/OrlenLogos';
import { parseCsv, downloadRecordsAsCsv } from './utils/csvParser';
import './App.css';

export default function App() {
  // Dataset state
  const [currentDataset, setCurrentDataset] = useState({
    id: 'Orlen_pb95_2026.csv',
    name: 'Orlen_pb95_2026.csv',
    isCustom: false,
  });

  const [rawCsvText, setRawCsvText] = useState('');
  const [headers, setHeaders] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search, Filter, Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRule, setActiveRule] = useState('ALL');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState('50');

  // Selection state: Set of selected record _ids
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  // Load dataset when currentDataset changes
  useEffect(() => {
    if (currentDataset.isCustom) return; // handled separately in file upload

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
                setRawCsvText(text);
                const { headers: parsedHeaders, records: parsedRecords } = parseCsv(text);
                setHeaders(parsedHeaders);
                setAllRecords(parsedRecords);
                setIsLoading(false);
                return;
              }
            }
          }
        } catch (err) {
          // continue to next path
        }
      }

      if (isMounted) {
        setError(`Nie udało się załadować pliku ${currentDataset.id}. Upewnij się, że plik istnieje w katalogu.`);
        setIsLoading(false);
      }
    };

    tryFetch();

    return () => {
      isMounted = false;
    };
  }, [currentDataset.id, currentDataset.isCustom]);

  // Handle switching predefined datasets from dropdown
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

  // Handle custom file upload from disk
  const handleCustomFileUpload = (file) => {
    if (!file) return;
    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        const { headers: parsedHeaders, records: parsedRecords } = parseCsv(text);
        setRawCsvText(text);
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
        showToast(`Pomyślnie załadowano plik ${file.name} (${parsedRecords.length} wierszy)`);
      }
    };

    reader.onerror = () => {
      setError(`Błąd podczas odczytu pliku ${file.name}`);
      setIsLoading(false);
    };

    reader.readAsText(file, 'UTF-8');
  };

  // Filter records based on activeRule and searchQuery
  const filteredRecords = useMemo(() => {
    let result = [...allRecords];

    // Apply rule filter
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
      // Last 30 records
      result = result.slice(-30);
    }

    // Apply search query
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

  // Sort filtered records
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

  // Handle column header sort click
  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        if (prev.direction === 'desc') return { key: 'date', direction: 'desc' }; // default reset
      }
      return { key, direction: 'asc' };
    });
  };

  // Selection handlers:
  // Individual toggle
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

  // Selection strictly restricted to currently visible records (as requested!)
  const allVisibleSelected = sortedRecords.length > 0 && sortedRecords.every(r => selectedIds.has(r._id));
  const someVisibleSelected = sortedRecords.some(r => selectedIds.has(r._id));

  // "Select All Visible" -> selects ONLY records currently matching the search and active filter rule!
  const handleSelectAllVisible = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      sortedRecords.forEach(r => next.add(r._id));
      return next;
    });
    showToast(`Zaznaczono wszystkie ${sortedRecords.length} widoczne rekordy`);
  };

  // "Deselect Visible" -> unchecks only records in current view
  const handleDeselectVisible = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      sortedRecords.forEach(r => next.delete(r._id));
      return next;
    });
  };

  // Master checkbox toggle in table header
  const handleToggleAllVisible = () => {
    if (allVisibleSelected) {
      handleDeselectVisible();
    } else {
      handleSelectAllVisible();
    }
  };

  // Clear all selections entirely
  const handleClearAllSelected = () => {
    setSelectedIds(new Set());
    showToast('Wyczyszczono wszystkie zaznaczenia');
  };

  // Download selected records as a new CSV
  const handleDownloadSelected = () => {
    const selectedRecordsList = allRecords.filter(r => selectedIds.has(r._id));
    if (selectedRecordsList.length === 0) {
      showToast('Zaznacz przynajmniej jeden wiersz do pobrania', 'error');
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const filename = `orlen_${currentDataset.name.replace(/\.csv$/i, '')}_wybrane_${selectedRecordsList.length}_rekordow_${todayStr}.csv`;
    
    downloadRecordsAsCsv(selectedRecordsList, headers, filename, ';');
    showToast(`Pobrano ${selectedRecordsList.length} wybranych rekordów jako ${filename}`);
  };

  // Download currently visible records
  const handleDownloadVisible = () => {
    if (sortedRecords.length === 0) {
      showToast('Brak widocznych rekordów do pobrania', 'error');
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const filename = `orlen_${currentDataset.name.replace(/\.csv$/i, '')}_widok_${sortedRecords.length}_rekordow_${todayStr}.csv`;
    
    downloadRecordsAsCsv(sortedRecords, headers, filename, ';');
    showToast(`Pobrano ${sortedRecords.length} widocznych rekordów jako ${filename}`);
  };

  // Reset filters helper
  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveRule('ALL');
  };

  return (
    <div className="orlen-app-container">
      {/* Top Navigation with Dropdown in Center */}
      <Navbar
        currentDataset={currentDataset}
        onSelectDataset={handleSelectDataset}
        onCustomFileUpload={handleCustomFileUpload}
        recordCount={allRecords.length}
        isLoading={isLoading}
      />

      <main className="orlen-main-content">
        {/* Error Notice */}
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

        {/* Hero / Statistics Cards */}
        <StatsCards
          records={allRecords}
          selectedIds={selectedIds}
          visibleRecordsCount={sortedRecords.length}
        />

        {/* Controls: Search, Rule Pills, Select All Visible & Download Buttons */}
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

        {/* Table of Records with Sorting, Checkboxes and Pagination */}
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
      </main>

      {/* Polish Orlen Footer */}
      <footer className="orlen-footer">
        <div className="orlen-footer-content">
          <div className="footer-left">
            <div className="footer-logo-group">
              <OrlenAppLogo height={22} alt="ORLEN App Logo" />
              <OrlenMainLogo height={20} alt="ORLEN Main Logo" />
            </div>
            <span className="footer-copyright">Portal Cen Hurtowych Paliw • Rok 2026</span>
          </div>
          <div className="footer-right">
            <span>Standard kodowania: UTF-8 z BOM • Separator: Średnik (;)</span>
          </div>
        </div>
      </footer>

      {/* Floating Toast Feedback */}
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
