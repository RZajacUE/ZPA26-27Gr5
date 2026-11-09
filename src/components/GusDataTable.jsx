import React, { useState, useMemo } from 'react';
import { 
  FaSort, 
  FaSortUp, 
  FaSortDown, 
  FaMagnifyingGlass,
  FaCheck,
  FaCalendarWeek,
  FaBasketShopping,
  FaScaleBalanced,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa6';

export default function GusDataTable({
  chunks = [],
  selectedIds,
  onToggleChunk,
  onToggleAllVisible,
  allVisibleSelected,
  someVisibleSelected,
  activeProducts = []
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Filter chunks by search query
  const filteredChunks = useMemo(() => {
    if (!searchQuery.trim()) return chunks;
    const q = searchQuery.toLowerCase().trim();
    return chunks.filter(c => 
      c.date.toLowerCase().includes(q) ||
      c.label.toLowerCase().includes(q) ||
      String(c.basketTotal).includes(q) ||
      String(c.weakMedianPrice).includes(q)
    );
  }, [chunks, searchQuery]);

  // Sort chunks
  const sortedChunks = useMemo(() => {
    const list = [...filteredChunks];
    const { key, direction } = sortConfig;
    const factor = direction === 'asc' ? 1 : -1;

    list.sort((a, b) => {
      if (key === 'date') {
        return (a.dateObj.getTime() - b.dateObj.getTime()) * factor;
      }
      if (key === 'basketTotal') {
        return (a.basketTotal - b.basketTotal) * factor;
      }
      if (key === 'weakMedianPrice') {
        return (a.weakMedianPrice - b.weakMedianPrice) * factor;
      }
      if (key === 'percentChange') {
        return (a.percentChange - b.percentChange) * factor;
      }
      return 0;
    });

    return list;
  }, [filteredChunks, sortConfig]);

  // Pagination slicing
  const totalPages = Math.ceil(sortedChunks.length / pageSize) || 1;
  const paginatedChunks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedChunks.slice(start, start + pageSize);
  }, [sortedChunks, currentPage, pageSize]);

  // Handle header click for sorting
  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
    setCurrentPage(1);
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="sort-icon-neutral" size={11} />;
    return sortConfig.direction === 'asc' ? <FaSortUp className="sort-icon-active" size={11} /> : <FaSortDown className="sort-icon-active" size={11} />;
  };

  return (
    <div className="gus-table-card">
      {/* Table Toolbar */}
      <div className="gus-table-toolbar">
        <div className="toolbar-left">
          <div className="table-search-input-wrapper">
            <FaMagnifyingGlass className="search-icon" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filtruj wpisy (np. 2024, Tydzień, 75.20)..."
              className="table-search-input"
            />
          </div>
          <span className="results-count">
            Wyniki: <strong>{sortedChunks.length}</strong> okresów
          </span>
        </div>

        <div className="toolbar-right">
          <label className="page-size-label">
            Pokaż na stronę:
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="page-size-select"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="gus-table-wrapper">
        <table className="gus-data-table">
          <thead>
            <tr>
              {/* Checkbox Header */}
              <th className="th-checkbox">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  ref={el => { if (el) el.indeterminate = someVisibleSelected && !allVisibleSelected; }}
                  onChange={onToggleAllVisible}
                  title="Zaznacz/odznacz wszystkie widoczne"
                  className="gus-checkbox"
                />
              </th>

              {/* Date / Period Column */}
              <th className="th-sortable" onClick={() => handleSort('date')}>
                <div className="th-content">
                  <FaCalendarWeek size={12} />
                  <span>Data / Okres</span>
                  {renderSortIcon('date')}
                </div>
              </th>

              {/* Basket Total Column */}
              <th className="th-sortable" onClick={() => handleSort('basketTotal')}>
                <div className="th-content">
                  <FaBasketShopping size={12} />
                  <span>Wartość koszyka (PLN)</span>
                  {renderSortIcon('basketTotal')}
                </div>
              </th>

              {/* Weak / Weekly Median Price Column */}
              <th className="th-sortable th-highlight" onClick={() => handleSort('weakMedianPrice')}>
                <div className="th-content">
                  <FaScaleBalanced size={12} />
                  <span>Mediana Tygodniowa (PLN)</span>
                  {renderSortIcon('weakMedianPrice')}
                </div>
              </th>

              {/* Mean Price */}
              <th>
                <div className="th-content">
                  <span>Średnia cena</span>
                </div>
              </th>

              {/* Range Min - Max */}
              <th>
                <div className="th-content">
                  <span>Min – Max</span>
                </div>
              </th>

              {/* Percent Change */}
              <th className="th-sortable" onClick={() => handleSort('percentChange')}>
                <div className="th-content">
                  <span>Zmiana %</span>
                  {renderSortIcon('percentChange')}
                </div>
              </th>

              {/* Key Sample Products (Bread, Butter, Eggs, Fuel Pb95) */}
              <th title="Chleb pszenno-żytni">Chleb (0.6kg)</th>
              <th title="Masło ekstra 82%">Masło (200g)</th>
              <th title="Jaja kurze 10szt">Jaja (10szt)</th>
              <th title="Benzyna Pb95">Benzyna Pb95 (1l)</th>
            </tr>
          </thead>
          <tbody>
            {paginatedChunks.length === 0 ? (
              <tr>
                <td colSpan={11} className="gus-table-empty-row">
                  Brak wpisów spełniających wybrane kryteria wyszukiwania.
                </td>
              </tr>
            ) : (
              paginatedChunks.map(chunk => {
                const isSelected = selectedIds.has(chunk._id);
                const isPositiveChange = chunk.percentChange >= 0;

                const breadPrice = chunk.productPrices?.bread;
                const butterPrice = chunk.productPrices?.butter;
                const eggsPrice = chunk.productPrices?.eggs;
                const fuelPrice = chunk.productPrices?.gasoline_pb95;

                return (
                  <tr
                    key={chunk._id}
                    className={`gus-table-row ${isSelected ? 'row-selected' : ''}`}
                    onClick={() => onToggleChunk(chunk._id)}
                  >
                    {/* Checkbox cell */}
                    <td className="td-checkbox" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleChunk(chunk._id)}
                        className="gus-checkbox"
                      />
                    </td>

                    {/* Date / Label cell */}
                    <td className="td-date">
                      <span className="date-strong">{chunk.date}</span>
                      <span className="label-sub">{chunk.label}</span>
                    </td>

                    {/* Basket Total cell */}
                    <td className="td-basket-total">
                      <strong>{chunk.basketTotal.toFixed(2)} zł</strong>
                    </td>

                    {/* Weak Median Price cell (Hero column) */}
                    <td className="td-median-highlight">
                      <span className="median-badge">
                        {chunk.weakMedianPrice.toFixed(2)} zł
                      </span>
                    </td>

                    {/* Mean cell */}
                    <td className="td-mean">
                      {chunk.meanPrice.toFixed(2)} zł
                    </td>

                    {/* Min - Max cell */}
                    <td className="td-range">
                      <span className="range-text">{chunk.minPrice.toFixed(2)} – {chunk.maxPrice.toFixed(2)} zł</span>
                    </td>

                    {/* Percent change cell */}
                    <td className="td-change">
                      <span className={`change-tag ${isPositiveChange ? 'tag-pos' : 'tag-neg'}`}>
                        {isPositiveChange ? '+' : ''}{chunk.percentChange.toFixed(1)}%
                      </span>
                    </td>

                    {/* Sample Product Prices */}
                    <td className="td-sample-price">{breadPrice ? `${breadPrice.toFixed(2)} zł` : '—'}</td>
                    <td className="td-sample-price">{butterPrice ? `${butterPrice.toFixed(2)} zł` : '—'}</td>
                    <td className="td-sample-price">{eggsPrice ? `${eggsPrice.toFixed(2)} zł` : '—'}</td>
                    <td className="td-sample-price fuel-price-cell">{fuelPrice ? `${fuelPrice.toFixed(2)} zł` : '—'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="gus-table-pagination">
        <div className="pagination-info">
          Strona <strong>{currentPage}</strong> z <strong>{totalPages}</strong> (Łącznie {sortedChunks.length} wpisów)
        </div>

        <div className="pagination-controls">
          <button
            type="button"
            className="btn-page-nav"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            <FaChevronLeft size={12} />
            <span>Poprzednia</span>
          </button>

          <span className="page-indicator">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            className="btn-page-nav"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            <span>Następna</span>
            <FaChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

