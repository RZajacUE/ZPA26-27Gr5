import React, { useState, useMemo } from 'react';
import { 
  FaClock, 
  FaArrowTrendUp, 
  FaArrowTrendDown, 
  FaDownload, 
  FaSliders, 
  FaCalculator
} from 'react-icons/fa6';
import { formatPln, downloadRecordsAsCsv } from '../utils/csvParser';
import { getEarningsForDate } from '../services/gusBdlApi';

export default function OrlenSimplifiedView({ 
  records, 
  headers, 
  currentDataset, 
  onSwitchToAdvanced,
  onOpenSlideMenu
}) {
  const [litersToCalculate, setLitersToCalculate] = useState(50);

  const stats = useMemo(() => {
    if (!records || records.length === 0) return null;

    const valid = records
      .map(r => ({
        price: r._parsed?.price || 0,
        date: r._parsed?.date,
        dateObj: r._parsed?.dateObj || new Date(r._parsed?.date || '2026-01-01'),
        product: r._parsed?.product,
        raw: r
      }))
      .filter(r => r.price > 0);

    if (valid.length === 0) return null;

    const latest = valid[valid.length - 1];
    const previous = valid.length > 1 ? valid[valid.length - 2] : latest;
    const monthAgo = valid.length > 30 ? valid[valid.length - 30] : valid[0];

    const priceM3 = latest.price;
    const pricePerLiterNet = priceM3 / 1000;
    const pricePerLiterGross = pricePerLiterNet * 1.23;

    const prevPricePerLiterGross = (previous.price / 1000) * 1.23;
    const monthAgoPriceGross = (monthAgo.price / 1000) * 1.23;

    const dailyDiff = pricePerLiterGross - prevPricePerLiterGross;
    const monthlyDiff = pricePerLiterGross - monthAgoPriceGross;
    const monthlyPercentChange = monthAgoPriceGross > 0 
      ? ((pricePerLiterGross - monthAgoPriceGross) / monthAgoPriceGross) * 100 
      : 0;

    // Consumer earnings for this date
    const earnings = getEarningsForDate(latest.dateObj);
    const netSalary = earnings.net;
    const hourlyWage = earnings.hourlyWage;

    // Tank calculation for default 50L tank
    const tank50L = 50 * pricePerLiterGross;
    const monthlyFuelCost = 100 * pricePerLiterGross; // ~100L monthly commute
    const budgetShare = (monthlyFuelCost / netSalary) * 100;
    const litersPerSalary = Math.round(netSalary / pricePerLiterGross);
    const workHoursForTank = Math.round((tank50L / hourlyWage) * 10) / 10;

    // Last 7 days records for simplified table
    const recentList = valid.slice(-7).reverse();

    return {
      latest,
      priceM3,
      pricePerLiterNet,
      pricePerLiterGross,
      dailyDiff,
      monthlyDiff,
      monthlyPercentChange,
      earnings,
      tank50L,
      monthlyFuelCost,
      budgetShare,
      litersPerSalary,
      workHoursForTank,
      recentList
    };
  }, [records]);

  if (!stats) {
    return (
      <div className="simple-empty-state">
        Brak danych o notowaniach do wyświetlenia.
      </div>
    );
  }

  const customTankCost = litersToCalculate * stats.pricePerLiterGross;
  const customTankWorkHours = Math.round((customTankCost / stats.earnings.hourlyWage) * 10) / 10;
  const customTankBudgetPct = ((customTankCost / stats.earnings.net) * 100).toFixed(1);

  const handleDownloadRecent = () => {
    const subset = stats.recentList.map(item => item.raw);
    downloadRecordsAsCsv(
      subset, 
      headers, 
      `orlen_${currentDataset.name.replace(/\.csv$/i, '')}_podsumowanie_7dni.csv`, 
      ';'
    );
  };

  return (
    <div className="simple-view-container">
      {/* Top Banner introducing simplified mode */}
      <div className="simple-view-header">
        <div>
          <h2 className="simple-view-title">Szybki przegląd cen paliw i budżetu kierowcy</h2>
          <p className="simple-view-desc">
            Przeliczenie cen hurtowych PKN ORLEN na realny koszt dla portfela konsumenta przy średniej pensji krajowej ({stats.earnings.net} zł netto).
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
            className="btn-switch-mode-outline"
            onClick={onSwitchToAdvanced}
          >
            <span>Widok zaawansowany →</span>
          </button>
        </div>
      </div>

      {/* Hero Cards: Budget impact + Price */}
      <div className="simple-cards-grid">
        {/* Card 1: Fuel Price per liter */}
        <div className="simple-card hero-fuel-card">
          <div className="simple-card-badge">Cena detaliczna szacunkowa</div>
          <div className="simple-card-value">
            <span className="big-number">{stats.pricePerLiterGross.toFixed(2)}</span>
            <span className="unit">zł / litr</span>
          </div>
          <div className="simple-card-sub">
            Cena hurtowa netto: <strong>{formatPln(stats.priceM3, 2)} zł / m³</strong> ({stats.pricePerLiterNet.toFixed(2)} zł/l)
          </div>
          <div className={`simple-trend-pill ${stats.dailyDiff >= 0 ? 'trend-up' : 'trend-down'}`}>
            {stats.dailyDiff >= 0 ? <FaArrowTrendUp size={12} /> : <FaArrowTrendDown size={12} />}
            <span>{stats.dailyDiff >= 0 ? '+' : ''}{stats.dailyDiff.toFixed(2)} zł vs wczoraj</span>
          </div>
        </div>

        {/* Card 2: Consumer Budget Consumption */}
        <div className="simple-card hero-budget-card">
          <div className="simple-card-badge">Wpływ na budżet domowy</div>
          <div className="simple-card-value">
            <span className="big-number">{stats.budgetShare.toFixed(1)}%</span>
            <span className="unit">pensji netto</span>
          </div>
          <div className="simple-card-sub">
            Przeciętne dojazdy (~100 l/mies.): <strong>{Math.round(stats.monthlyFuelCost)} zł</strong> z pensji {stats.earnings.net} zł
          </div>
          <div className="budget-bar-container">
            <div className="budget-bar-fill" style={{ width: `${Math.min(100, stats.budgetShare * 3)}%` }}></div>
          </div>
        </div>

        {/* Card 3: Full Tank Cost & Hours of Work */}
        <div className="simple-card">
          <div className="simple-card-badge">Zatankowanie baku (50 litrów)</div>
          <div className="simple-card-value">
            <span className="big-number">{Math.round(stats.tank50L)}</span>
            <span className="unit">PLN</span>
          </div>
          <div className="simple-card-sub">
            <FaClock size={12} style={{ display: 'inline', marginRight: '4px' }} />
            Odpowiada <strong>{stats.workHoursForTank} godz. pracy</strong> przy średniej stawce {stats.earnings.hourlyWage} zł/h
          </div>
          <div className="salary-liters-badge">
            Za całą pensję kupisz: <strong>{stats.litersPerSalary} litrów</strong>
          </div>
        </div>

        {/* Card 4: Month-over-Month Comparison */}
        <div className="simple-card">
          <div className="simple-card-badge">Zmiana w ciągu 30 dni</div>
          <div className="simple-card-value">
            <span className={`big-number ${stats.monthlyPercentChange > 0 ? 'text-red' : 'text-green'}`}>
              {stats.monthlyPercentChange > 0 ? `+${stats.monthlyPercentChange.toFixed(1)}%` : `${stats.monthlyPercentChange.toFixed(1)}%`}
            </span>
          </div>
          <div className="simple-card-sub">
            Różnica na litrze: <strong>{stats.monthlyDiff > 0 ? '+' : ''}{stats.monthlyDiff.toFixed(2)} zł</strong>
          </div>
          <div className="mom-hint">
            Średnie zarobki w tym czasie: <strong>{stats.earnings.net} zł netto</strong>
          </div>
        </div>
      </div>

      {/* Interactive Quick Tank Calculator */}
      <div className="simple-calculator-card">
        <div className="calc-header">
          <div className="calc-icon-title">
            <FaCalculator size={18} className="calc-icon" />
            <div>
              <h3>Kalkulator kosztu tankowania</h3>
              <p>Wybierz ile litrów planujesz zatankować, aby zobaczyć koszt i czas pracy potrzebny na pokrycie rachunku.</p>
            </div>
          </div>
          <div className="quick-presets">
            {[20, 35, 50, 70, 100].map(amt => (
              <button
                key={amt}
                type="button"
                className={`preset-btn ${litersToCalculate === amt ? 'active' : ''}`}
                onClick={() => setLitersToCalculate(amt)}
              >
                {amt} L
              </button>
            ))}
          </div>
        </div>

        <div className="calc-controls">
          <div className="calc-slider-wrapper">
            <label htmlFor="fuel-liters-slider" className="slider-label">
              <span>Liczba litrów:</span>
              <strong>{litersToCalculate} L</strong>
            </label>
            <input
              id="fuel-liters-slider"
              type="range"
              min="5"
              max="150"
              step="5"
              value={litersToCalculate}
              onChange={(e) => setLitersToCalculate(Number(e.target.value))}
              className="calc-range"
            />
          </div>

          <div className="calc-result-boxes">
            <div className="result-box">
              <span className="res-label">Szacowany koszt:</span>
              <span className="res-value">{customTankCost.toFixed(2)} zł</span>
            </div>
            <div className="result-box">
              <span className="res-label">Czas pracy:</span>
              <span className="res-value">{customTankWorkHours} godz.</span>
            </div>
            <div className="result-box">
              <span className="res-label">Udział w pensji:</span>
              <span className="res-value">{customTankBudgetPct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent 7 Days Table + Fast CSV Download */}
      <div className="simple-recent-card">
        <div className="recent-header">
          <div>
            <h3>Ostatnie notowania hurtowe ({stats.latest.product})</h3>
            <p>Zestawienie ostatnich dni z wyliczonym kosztem litra paliwa.</p>
          </div>
          <div className="recent-actions">
            <button
              type="button"
              className="btn-simple-csv"
              onClick={handleDownloadRecent}
              title="Pobierz ostatnie notowania w formacie CSV"
            >
              <FaDownload size={13} />
              <span>Pobierz CSV (7 dni)</span>
            </button>
            <button
              type="button"
              className="btn-simple-more"
              onClick={onSwitchToAdvanced}
            >
              Zobacz całą bazę ({records.length} notowań) →
            </button>
          </div>
        </div>

        <div className="simple-table-wrapper">
          <table className="simple-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Cena hurtowa (m³)</th>
                <th>Cena netto / litr</th>
                <th>Cena brutto / litr</th>
                <th>Bak (50L)</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentList.map(item => {
                const literNet = item.price / 1000;
                const literGross = literNet * 1.23;
                const tank = 50 * literGross;
                return (
                  <tr key={item.date}>
                    <td className="font-mono date-cell">{item.date}</td>
                    <td>{formatPln(item.price, 2)} zł</td>
                    <td>{literNet.toFixed(2)} zł</td>
                    <td className="strong-cell">{literGross.toFixed(2)} zł</td>
                    <td>{tank.toFixed(2)} zł</td>
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
