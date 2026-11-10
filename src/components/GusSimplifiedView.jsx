import React, { useState } from 'react';
import { 
  FaArrowTrendUp, 
  FaArrowTrendDown, 
  FaClock, 
  FaSliders,
  FaFileCsv,
  FaCalculator,
  FaBasketShopping,
  FaWallet
} from 'react-icons/fa6';
import { exportGusBasketToCsv } from '../services/gusBdlApi';

export default function GusSimplifiedView({
  chunks = [],
  summary = {},
  activeProducts = [],
  onSwitchToAdvanced,
  onOpenSlideMenu
}) {
  const [basketsCount, setBasketsCount] = useState(4);

  if (!chunks || chunks.length === 0) {
    return (
      <div className="simple-empty-state">
        Brak danych o koszyku konsumenckim do wyświetlenia.
      </div>
    );
  }

  const latestChunk = chunks[chunks.length - 1];
  const previousChunk = chunks.length > 1 ? chunks[chunks.length - 2] : latestChunk;

  const earnings = latestChunk.earnings || { net: 5900, gross: 8147, hourlyWage: 35.12 };
  const prevEarnings = previousChunk.earnings || earnings;
  const momWageDiff = earnings.net - prevEarnings.net;
  const momWagePct = prevEarnings.net > 0 ? ((momWageDiff / prevEarnings.net) * 100).toFixed(1) : '0.0';

  const basketTotal = latestChunk.basketTotal;
  const weakMedian = latestChunk.weakMedianPrice;
  const standardMonthlyCost = basketTotal * 4;
  const standardBudgetShare = ((standardMonthlyCost / earnings.net) * 100).toFixed(1);
  const workHoursPerBasket = latestChunk.workHoursForBasket;

  // Custom calculation for interactive calculator
  const customCost = basketsCount * basketTotal;
  const customWorkHours = Math.round((customCost / earnings.hourlyWage) * 10) / 10;
  const customBudgetPct = ((customCost / earnings.net) * 100).toFixed(1);

  // Wage growth vs basket price inflation
  const wageGrowthPct = summary.totalEarningsGrowthPct || 0;
  const basketGrowthPct = summary.totalPercentChange || 0;
  const realPurchasingPowerGain = (wageGrowthPct - basketGrowthPct).toFixed(1);
  const isPurchasingPowerBetter = Number(realPurchasingPowerGain) >= 0;

  const handleDownloadCsv = () => {
    exportGusBasketToCsv(
      chunks, 
      activeProducts, 
      `gus_bdl_uproszczony_koszyk_${chunks.length}_okresow.csv`
    );
  };

  return (
    <div className="simple-view-container gus-simple-theme">
      {/* Header Banner */}
      <div className="simple-view-header">
        <div>
          <h2 className="simple-view-title">Szybki przegląd: Koszyk konsumencki i budżet domowy</h2>
          <p className="simple-view-desc">
            Przeliczenie cen reprezentantów koszyka GUS na realny udział w miesięcznych zarobkach Polaków ({earnings.net} zł netto).
          </p>
        </div>
        <div className="header-actions-group">
          {onOpenSlideMenu && (
            <button 
              type="button" 
              className="btn-open-options-simple"
              onClick={onOpenSlideMenu}
            >
              <FaSliders size={13} />
              <span>Opcje i filtry</span>
            </button>
          )}
          <button 
            type="button" 
            className="btn-switch-mode-outline gus-outline-btn"
            onClick={onSwitchToAdvanced}
          >
            <span>Widok zaawansowany →</span>
          </button>
        </div>
      </div>

      {/* 4 Cards: Basket Price, Budget Share, Earnings vs Other Months, Purchasing Power */}
      <div className="simple-cards-grid">
        {/* Card 1: Basket Value & Weak Median */}
        <div className="simple-card hero-gus-budget">
          <div className="simple-card-badge">Cena koszyka (GUS BDL)</div>
          <div className="simple-card-value">
            <span className="big-number">{basketTotal.toFixed(2)}</span>
            <span className="unit">zł / koszyk</span>
          </div>
          <div className="simple-card-sub">
            Mediana tygodniowa artykułów: <strong>{weakMedian.toFixed(2)} zł</strong> ({activeProducts.length} produktów)
          </div>
          <div className="hours-work-badge">
            <FaClock size={12} style={{ display: 'inline', marginRight: '4px' }} />
            Pojedynczy koszyk = <strong>{workHoursPerBasket} godz. pracy</strong>
          </div>
        </div>

        {/* Card 2: Consumer Budget Share */}
        <div className="simple-card hero-budget-card">
          <div className="simple-card-badge">Ile budżetu zjada koszyk?</div>
          <div className="simple-card-value">
            <span className="big-number">{standardBudgetShare}%</span>
            <span className="unit">pensji netto</span>
          </div>
          <div className="simple-card-sub">
            Miesięczny koszt (4 koszyki): <strong>{Math.round(standardMonthlyCost)} zł</strong> z pensji {earnings.net} zł
          </div>
          <div className="budget-bar-container">
            <div 
              className="budget-bar-fill gus-fill" 
              style={{ width: `${Math.min(100, Number(standardBudgetShare) * 3.5)}%` }}
            ></div>
          </div>
        </div>

        {/* Card 3: Consumer Earnings vs Other Months */}
        <div className="simple-card">
          <div className="simple-card-badge">Zarobki konsumenta</div>
          <div className="simple-card-value">
            <span className="big-number">{earnings.net}</span>
            <span className="unit">zł netto</span>
          </div>
          <div className="simple-card-sub">
            Średnia płaca brutto: <strong>{earnings.gross} zł</strong> ({earnings.hourlyWage} zł/godz.)
          </div>
          <div className={`simple-trend-pill ${momWageDiff >= 0 ? 'trend-up-wage' : 'trend-down'}`}>
            {momWageDiff >= 0 ? <FaArrowTrendUp size={12} /> : <FaArrowTrendDown size={12} />}
            <span>
              {momWageDiff >= 0 ? '+' : ''}{momWageDiff} zł ({momWageDiff >= 0 ? '+' : ''}{momWagePct}%) vs poprz. okres
            </span>
          </div>
        </div>

        {/* Card 4: Wage Growth vs Basket Inflation (Real Purchasing Power) */}
        <div className="simple-card">
          <div className="simple-card-badge">Siła nabywcza w czasie</div>
          <div className="simple-card-value">
            <span className={`big-number ${isPurchasingPowerBetter ? 'text-green' : 'text-red'}`}>
              {isPurchasingPowerBetter ? `+${realPurchasingPowerGain}%` : `${realPurchasingPowerGain}%`}
            </span>
          </div>
          <div className="simple-card-sub">
            Wzrost zarobków: <strong>+{wageGrowthPct}%</strong> | Wzrost cen: <strong>+{basketGrowthPct}%</strong>
          </div>
          <div className="mom-hint">
            {isPurchasingPowerBetter 
              ? 'Płace rosły szybciej niż ceny koszyka w analizowanym okresie.' 
              : 'Wzrost cen przewyższał tempo wzrostu wynagrodzeń.'}
          </div>
        </div>
      </div>

      {/* Interactive Consumer Basket Budget Calculator (Same as Orlen!) */}
      <div className="simple-calculator-card gus-calc">
        <div className="calc-header">
          <div className="calc-icon-title">
            <FaCalculator size={18} className="calc-icon gus-icon" />
            <div>
              <h3>Kalkulator budżetowy koszyka zakupowego</h3>
              <p>Wybierz ile koszyków miesięcznie kupuje Twoje gospodarstwo domowe, aby obliczyć realny koszt i czas pracy.</p>
            </div>
          </div>
          <div className="quick-presets">
            {[
              { count: 1, label: '1 koszyk (Singiel)' },
              { count: 2, label: '2 koszyki (Para)' },
              { count: 4, label: '4 koszyki (Standard)' },
              { count: 6, label: '6 koszyków (Rodzina)' },
              { count: 8, label: '8 koszyków (Duża)' },
            ].map(preset => (
              <button
                key={preset.count}
                type="button"
                className={`preset-btn gus-preset ${basketsCount === preset.count ? 'active' : ''}`}
                onClick={() => setBasketsCount(preset.count)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="calc-controls">
          <div className="calc-slider-wrapper">
            <label htmlFor="basket-count-slider" className="slider-label">
              <span>Liczba koszyków miesięcznie:</span>
              <strong>{basketsCount} szt. ({basketsCount * activeProducts.length} produktów)</strong>
            </label>
            <input
              id="basket-count-slider"
              type="range"
              min="1"
              max="12"
              step="1"
              value={basketsCount}
              onChange={(e) => setBasketsCount(Number(e.target.value))}
              className="calc-range gus-range"
            />
          </div>

          <div className="calc-result-boxes">
            <div className="result-box">
              <span className="res-label">Miesięczny koszt:</span>
              <span className="res-value">{customCost.toFixed(2)} zł</span>
            </div>
            <div className="result-box">
              <span className="res-label">Czas pracy:</span>
              <span className="res-value">{customWorkHours} godz.</span>
            </div>
            <div className="result-box">
              <span className="res-label">Udział w pensji:</span>
              <span className="res-value">{customBudgetPct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simplified Comparison Table of Key Essentials */}
      <div className="simple-recent-card gus-border-card">
        <div className="recent-header">
          <div>
            <h3>Kluczowe produkty w koszyku ({latestChunk.label})</h3>
            <p>Ceny podstawowych towarów konsumpcyjnych i ich udział w koszyku.</p>
          </div>
          <div className="recent-actions">
            <button
              type="button"
              className="btn-simple-csv gus-btn"
              onClick={handleDownloadCsv}
              title="Pobierz kompletny raport CSV"
            >
              <FaFileCsv size={14} />
              <span>Pobierz CSV</span>
            </button>
            <button
              type="button"
              className="btn-simple-more"
              onClick={onSwitchToAdvanced}
            >
              Przejdź do pełnej tabeli ({chunks.length} okresów) →
            </button>
          </div>
        </div>

        <div className="simple-table-wrapper">
          <table className="simple-table">
            <thead>
              <tr>
                <th>Produkt konsumpcyjny</th>
                <th>Kategoria</th>
                <th>Jednostka</th>
                <th>Cena bieżąca</th>
                <th>Czas pracy na zakup</th>
              </tr>
            </thead>
            <tbody>
              {activeProducts.slice(0, 8).map(prod => {
                const currentPrice = latestChunk.productPrices[prod.id] || 0;
                const minutesOfWork = Math.round((currentPrice / earnings.hourlyWage) * 60);
                return (
                  <tr key={prod.id}>
                    <td className="strong-cell">{prod.name}</td>
                    <td><span className="category-tag">{prod.category}</span></td>
                    <td>{prod.unit}</td>
                    <td className="font-mono strong-cell">{currentPrice.toFixed(2)} zł</td>
                    <td>{minutesOfWork < 60 ? `${minutesOfWork} min` : `${(minutesOfWork / 60).toFixed(1)} godz.`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
