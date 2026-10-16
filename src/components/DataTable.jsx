import React, { useRef, useEffect } from 'react';
import { 
  FaSort, 
  FaSortUp, 
  FaSortDown, 
  FaArrowUpRightFromSquare, 
  FaXmark,
  FaMagnifyingGlass
} from 'react-icons/fa6';

export default function DataTable({
  records,
  selectedIds,
  onToggleRecord,
  onToggleAllVisible,
  sortConfig,
  onSort,
  allVisibleSelected,
  someVisibleSelected,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onResetFilters
}) {
  const masterCheckboxRef = useRef(null);

  // Set indeterminate state on master checkbox
  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate = someVisibleSelected && !allVisibleSelected;
    }
  }, [someVisibleSelected, allVisibleSelected]);

  // Pagination calculation
  const totalItems = records.length;
  const isAllPages = pageSize === 'ALL';
  const effectivePageSize = isAllPages ? totalItems : Number(pageSize);
  const totalPages = isAllPages ? 1 : Math.ceil(totalItems / effectivePageSize);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));

  const startIndex = isAllPages ? 0 : (safeCurrentPage - 1) * effectivePageSize;
  const endIndex = isAllPages ? totalItems : Math.min(startIndex + effectivePageSize, totalItems);
  const paginatedRecords = records.slice(startIndex, endIndex);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="sort-icon-neutral" size={12} />;
    if (sortConfig.direction === 'asc') return <FaSortUp className="sort-active" size={12} />;
    return <FaSortDown className="sort-active" size={12} />;
  };

  return (
    <div className="table-card">
      <div className="table-card-header">
        <div className="table-header-info">
          <h2 className="table-title">Notowania cen hurtowych PKN ORLEN</h2>
          <span className="table-records-badge">
            Wyświetlanie {totalItems > 0 ? `${startIndex + 1}-${endIndex}` : '0'} z {totalItems} rekordów
          </span>
        </div>

        {/* Rows per page selector */}
        <div className="table-pagination-size">
          <label htmlFor="page-size-select" className="page-size-label">Wierszy na stronę:</label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(e.target.value)}
            className="page-size-select"
          >
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="ALL">Wszystkie ({totalItems})</option>
          </select>
        </div>
      </div>

      <div className="table-responsive-wrapper">
        <table className="orlen-table">
          <thead>
            <tr>
              {/* Master Checkbox */}
              <th className="col-checkbox th-checkbox">
                <div className="checkbox-cell-wrapper">
                  <input
                    type="checkbox"
                    id="master-table-checkbox"
                    ref={masterCheckboxRef}
                    checked={allVisibleSelected && totalItems > 0}
                    onChange={onToggleAllVisible}
                    aria-label="Zaznacz wszystkie widoczne rekordy"
                    className="orlen-checkbox"
                  />
                </div>
              </th>

              {/* Sortable Column: Date */}
              <th 
                className={`col-sortable col-date ${sortConfig.key === 'date' ? 'sorted' : ''}`}
                onClick={() => onSort('date')}
                title="Sortuj po dacie notowania"
              >
                <div className="th-content">
                  <span>Data</span>
                  {getSortIcon('date')}
                </div>
              </th>

              {/* Sortable Column: Product */}
              <th 
                className={`col-sortable col-product ${sortConfig.key === 'product' ? 'sorted' : ''}`}
                onClick={() => onSort('product')}
                title="Sortuj po nazwie produktu"
              >
                <div className="th-content">
                  <span>Produkt</span>
                  {getSortIcon('product')}
                </div>
              </th>

              {/* Sortable Column: Symbol */}
              <th 
                className={`col-sortable col-symbol ${sortConfig.key === 'symbol' ? 'sorted' : ''}`}
                onClick={() => onSort('symbol')}
                title="Sortuj po symbolu paliwa"
              >
                <div className="th-content">
                  <span>Symbol</span>
                  {getSortIcon('symbol')}
                </div>
              </th>

              {/* Sortable Column: Price */}
              <th 
                className={`col-sortable col-price ${sortConfig.key === 'price' ? 'sorted' : ''}`}
                onClick={() => onSort('price')}
                title="Sortuj po cenie w PLN za metr sześcienny"
              >
                <div className="th-content price-th">
                  <span>Cena (PLN/m³)</span>
                  {getSortIcon('price')}
                </div>
              </th>

              {/* Computed: Price per Liter */}
              <th 
                className="col-sortable col-liter"
                onClick={() => onSort('price')}
                title="Przeliczenie na zł/litr netto"
              >
                <div className="th-content price-th">
                  <span>Cena za litr</span>
                  {getSortIcon('price')}
                </div>
              </th>

              {/* Column: Unit */}
              <th className="col-unit">Jednostka</th>

              {/* Sortable Column: Publish Date */}
              <th 
                className={`col-sortable col-publish ${sortConfig.key === 'publishFrom' ? 'sorted' : ''}`}
                onClick={() => onSort('publishFrom')}
                title="Sortuj po dacie publikacji"
              >
                <div className="th-content">
                  <span>Obowiązuje od</span>
                  {getSortIcon('publishFrom')}
                </div>
              </th>

              {/* Column: Source Link */}
              <th className="col-source">Źródło</th>
            </tr>
          </thead>

          <tbody>
            {paginatedRecords.length > 0 ? (
              paginatedRecords.map((row) => {
                const isSelected = selectedIds.has(row._id);
                const parsed = row._parsed;

                return (
                  <tr 
                    key={row._id} 
                    className={`orlen-table-row ${isSelected ? 'row-selected' : ''}`}
                    onClick={() => onToggleRecord(row._id)}
                  >
                    {/* Checkbox */}
                    <td className="col-checkbox" onClick={(e) => e.stopPropagation()}>
                      <div className="checkbox-cell-wrapper">
                        <input
                          type="checkbox"
                          id={`chk-${row._id}`}
                          checked={isSelected}
                          onChange={() => onToggleRecord(row._id)}
                          aria-label={`Zaznacz wiersz z dnia ${parsed.date}`}
                          className="orlen-checkbox"
                        />
                      </div>
                    </td>

                    {/* Date */}
                    <td className="col-date font-mono">
                      <span className="cell-date-badge">{parsed.date}</span>
                    </td>

                    {/* Product */}
                    <td className="col-product">
                      <span className="cell-product-name">{parsed.product}</span>
                    </td>

                    {/* Symbol */}
                    <td className="col-symbol">
                      <span className={`symbol-badge ${parsed.symbol === 'Pb95' ? 'badge-pb95' : 'badge-on'}`}>
                        {parsed.symbol}
                      </span>
                    </td>

                    {/* Price in PLN/m3 */}
                    <td className="col-price font-mono price-cell">
                      <span className="price-primary">{parsed.priceFormatted}</span>
                      <span className="price-unit-sub"> zł</span>
                    </td>

                    {/* Price per Liter */}
                    <td className="col-liter font-mono">
                      <span className="liter-pill">
                        {parsed.pricePerLiter} zł/l
                      </span>
                    </td>

                    {/* Unit */}
                    <td className="col-unit font-mono text-muted">
                      {parsed.unit}
                    </td>

                    {/* Publish From */}
                    <td className="col-publish font-mono text-muted">
                      {parsed.publishFrom}
                    </td>

                    {/* Source URL */}
                    <td className="col-source" onClick={(e) => e.stopPropagation()}>
                      {parsed.sourceUrl ? (
                        <a
                          href={parsed.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="source-link"
                          title="Zobacz źródłowe notowanie na tool.orlen.pl"
                        >
                          <span>tool.orlen.pl</span>
                          <FaArrowUpRightFromSquare size={11} />
                        </a>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="table-empty-cell">
                  <div className="empty-state">
                    <div className="empty-state-icon-wrapper">
                      <FaMagnifyingGlass size={36} className="empty-state-react-icon" />
                    </div>
                    <h3 className="empty-state-title">Brak rekordów dla wybranych kryteriów</h3>
                    <p className="empty-state-desc">
                      Żadne notowanie nie pasuje do aktualnego wyszukiwania lub wybranej reguły filtru.
                    </p>
                    <button
                      type="button"
                      onClick={onResetFilters}
                      className="btn-reset-filters"
                    >
                      <FaXmark size={14} />
                      <span>Wyczyść wyszukiwanie i filtry</span>
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {!isAllPages && totalPages > 1 && (
        <div className="table-card-footer">
          <div className="pagination-info">
            Strona <strong>{safeCurrentPage}</strong> z <strong>{totalPages}</strong>
          </div>
          <div className="pagination-controls">
            <button
              type="button"
              className="pagination-btn"
              disabled={safeCurrentPage === 1}
              onClick={() => onPageChange(1)}
              title="Pierwsza strona"
            >
              «
            </button>
            <button
              type="button"
              className="pagination-btn"
              disabled={safeCurrentPage === 1}
              onClick={() => onPageChange(safeCurrentPage - 1)}
              title="Poprzednia strona"
            >
              ‹ Poprzednia
            </button>

            {/* Page number indicators */}
            <div className="pagination-numbers">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (safeCurrentPage <= 3) {
                  pageNum = i + 1;
                } else if (safeCurrentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = safeCurrentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    type="button"
                    className={`pagination-num-btn ${safeCurrentPage === pageNum ? 'active' : ''}`}
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="pagination-btn"
              disabled={safeCurrentPage === totalPages}
              onClick={() => onPageChange(safeCurrentPage + 1)}
              title="Następna strona"
            >
              Następna ›
            </button>
            <button
              type="button"
              className="pagination-btn"
              disabled={safeCurrentPage === totalPages}
              onClick={() => onPageChange(totalPages)}
              title="Ostatnia strona"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
