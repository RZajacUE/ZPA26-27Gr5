import React from 'react';
import { FaGasPump, FaArrowTrendUp, FaArrowTrendDown, FaCheck } from 'react-icons/fa6';
import { formatPln } from '../utils/csvParser';

export default function StatsCards({ records, selectedIds, visibleRecordsCount }) {
  if (!records || records.length === 0) return null;

  // Calculate stats based on numerical prices
  const validPrices = records
    .map(r => ({ price: r._parsed?.price || 0, date: r._parsed?.date, product: r._parsed?.product }))
    .filter(r => r.price > 0);

  if (validPrices.length === 0) return null;

  const latestRecord = records[records.length - 1];
  const previousRecord = records.length > 1 ? records[records.length - 2] : null;

  const latestPrice = latestRecord._parsed?.price || 0;
  const prevPrice = previousRecord ? (previousRecord._parsed?.price || 0) : latestPrice;
  const priceDiff = latestPrice - prevPrice;

  let minRecord = validPrices[0];
  let maxRecord = validPrices[0];
  let sum = 0;

  validPrices.forEach(item => {
    sum += item.price;
    if (item.price < minRecord.price) minRecord = item;
    if (item.price > maxRecord.price) maxRecord = item;
  });

  const avgPrice = sum / validPrices.length;
  const selectedCount = selectedIds.size;

  return (
    <div className="stats-grid">
      {/* Latest Price Card */}
      <div className="stat-card stat-card-featured">
        <div className="stat-card-header">
          <span className="stat-badge-red">Ostatnie notowanie</span>
          <span className="stat-date">{latestRecord._parsed?.date}</span>
        </div>
        <div className="stat-card-body">
          <div className="stat-value-group">
            <span className="stat-value-main">{formatPln(latestPrice, 2)}</span>
            <span className="stat-unit">PLN/m³</span>
          </div>
          <div className="stat-subvalue">
            <span className="stat-per-liter">~{formatPln(latestPrice / 1000, 2)} zł / litr netto</span>
            {priceDiff !== 0 && (
              <span className={`stat-delta ${priceDiff > 0 ? 'delta-up' : 'delta-down'}`}>
                {priceDiff > 0 ? '+' : ''}{formatPln(priceDiff, 2)} zł
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Average Price */}
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-title">Średnia cena w okresie</span>
          <FaGasPump size={18} className="stat-icon-neutral" />
        </div>
        <div className="stat-card-body">
          <div className="stat-value-group">
            <span className="stat-value">{formatPln(avgPrice, 2)}</span>
            <span className="stat-unit">PLN/m³</span>
          </div>
          <span className="stat-footnote">z {validPrices.length} notowań hurtowych</span>
        </div>
      </div>

      {/* Max Price */}
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-title">Najwyższa cena</span>
          <FaArrowTrendUp size={18} className="stat-icon-up" />
        </div>
        <div className="stat-card-body">
          <div className="stat-value-group">
            <span className="stat-value text-red">{formatPln(maxRecord.price, 2)}</span>
            <span className="stat-unit">PLN/m³</span>
          </div>
          <span className="stat-footnote">Dnia {maxRecord.date}</span>
        </div>
      </div>

      {/* Min Price */}
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-title">Najniższa cena</span>
          <FaArrowTrendDown size={18} className="stat-icon-down" />
        </div>
        <div className="stat-card-body">
          <div className="stat-value-group">
            <span className="stat-value text-green">{formatPln(minRecord.price, 2)}</span>
            <span className="stat-unit">PLN/m³</span>
          </div>
          <span className="stat-footnote">Dnia {minRecord.date}</span>
        </div>
      </div>

      {/* Selection Card */}
      <div className={`stat-card stat-card-selection ${selectedCount > 0 ? 'has-selection' : ''}`}>
        <div className="stat-card-header">
          <span className="stat-title">Wybrane do eksportu</span>
          <FaCheck size={18} className={selectedCount > 0 ? 'stat-icon-checked' : 'stat-icon-neutral'} />
        </div>
        <div className="stat-card-body">
          <div className="stat-value-group">
            <span className="stat-value text-selection">{selectedCount}</span>
            <span className="stat-unit">z {visibleRecordsCount} widocznych</span>
          </div>
          <span className="stat-footnote">
            {selectedCount > 0 
              ? `${selectedCount} rekordów gotowych do pobrania` 
              : 'Zaznacz wiersze w tabeli'}
          </span>
        </div>
      </div>
    </div>
  );
}
