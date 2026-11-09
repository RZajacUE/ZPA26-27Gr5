import React from 'react';
import { 
  FaScaleBalanced, 
  FaBasketShopping, 
  FaArrowTrendUp, 
  FaArrowTrendDown,
  FaGasPump,
  FaCalendarWeek,
  FaUtensils
} from 'react-icons/fa6';

export default function GusStatsCards({ summary, frequency, startDate, endDate }) {
  if (!summary) return null;

  const {
    startBasketTotal = 0,
    endBasketTotal = 0,
    totalPercentChange = 0,
    avgWeakMedian = 0,
    highestMedian = 0,
    lowestMedian = 0,
    totalChunks = 0,
    fuelGrowthPct = 0,
    foodGrowthPct = 0
  } = summary;

  const isGrowth = totalPercentChange >= 0;
  const absDifference = Math.abs(endBasketTotal - startBasketTotal).toFixed(2);

  return (
    <div className="gus-stats-grid">
      {/* Card 1: Weak / Weekly Median Price (Highlighted Hero Card) */}
      <div className="gus-stat-card hero-median-card">
        <div className="stat-card-header">
          <div className="stat-icon-wrapper median-icon-bg">
            <FaScaleBalanced size={20} />
          </div>
          <div className="stat-title-group">
            <span className="stat-card-title">Mediana Tygodniowa Cen</span>
            <span className="stat-card-badge">Weak Median Price</span>
          </div>
        </div>
        <div className="stat-card-body">
          <div className="stat-value-main">
            <span className="number-large">{avgWeakMedian.toFixed(2)}</span>
            <span className="unit-label">zł / prod.</span>
          </div>
          <div className="stat-sub-info">
            <span className="info-item">
              Min: <strong>{lowestMedian.toFixed(2)} zł</strong>
            </span>
            <span className="bullet">•</span>
            <span className="info-item">
              Max: <strong>{highestMedian.toFixed(2)} zł</strong>
            </span>
          </div>
          <div className="stat-footer-hint">
            Środkowa wartość cen produktów w koszyku w próbie {totalChunks} okresów
          </div>
        </div>
      </div>

      {/* Card 2: Total Consumer Basket Value */}
      <div className="gus-stat-card">
        <div className="stat-card-header">
          <div className="stat-icon-wrapper basket-icon-bg">
            <FaBasketShopping size={20} />
          </div>
          <div className="stat-title-group">
            <span className="stat-card-title">Wartość Koszyka Konsumpcyjnego</span>
            <span className="stat-date-sub">{endDate}</span>
          </div>
        </div>
        <div className="stat-card-body">
          <div className="stat-value-main">
            <span className="number-large">{endBasketTotal.toFixed(2)}</span>
            <span className="unit-label">PLN</span>
          </div>
          <div className="stat-sub-info">
            <span className="info-item">
              Początek ({startDate}): <strong>{startBasketTotal.toFixed(2)} zł</strong>
            </span>
          </div>
          <div className={`stat-trend-indicator ${isGrowth ? 'trend-up' : 'trend-down'}`}>
            {isGrowth ? <FaArrowTrendUp size={13} /> : <FaArrowTrendDown size={13} />}
            <span>
              {isGrowth ? '+' : '-'}{absDifference} zł ({isGrowth ? '+' : ''}{totalPercentChange.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Card 3: Dynamic Price Change Over Years */}
      <div className="gus-stat-card">
        <div className="stat-card-header">
          <div className="stat-icon-wrapper trend-icon-bg">
            <FaArrowTrendUp size={20} />
          </div>
          <div className="stat-title-group">
            <span className="stat-card-title">Dynamika Zmian (Skumulowana)</span>
            <span className="stat-date-sub">{startDate.slice(0, 4)} – {endDate.slice(0, 4)}</span>
          </div>
        </div>
        <div className="stat-card-body">
          <div className="stat-value-main">
            <span className={`number-large ${totalPercentChange > 0 ? 'text-trend-red' : 'text-trend-green'}`}>
              {totalPercentChange > 0 ? `+${totalPercentChange.toFixed(1)}%` : `${totalPercentChange.toFixed(1)}%`}
            </span>
          </div>
          <div className="stat-sub-info">
            <span className="info-item">
              Wzrost kosztu utrzymania koszyka na przestrzeni lat
            </span>
          </div>
          <div className="stat-footer-hint">
            Dane z Banku Danych Lokalnych (BDL) GUS
          </div>
        </div>
      </div>

      {/* Card 4: Fuel vs Food Comparison (Answers research problem) */}
      <div className="gus-stat-card fuel-food-card">
        <div className="stat-card-header">
          <div className="stat-icon-wrapper fuel-food-icon-bg">
            <FaGasPump size={18} />
          </div>
          <div className="stat-title-group">
            <span className="stat-card-title">Paliwo vs Żywność</span>
            <span className="stat-card-badge">Analiza wpływu</span>
          </div>
        </div>
        <div className="stat-card-body">
          <div className="fuel-food-comparison-bars">
            <div className="comp-row">
              <div className="comp-label">
                <FaGasPump size={12} />
                <span>Paliwo (Pb95/ON):</span>
              </div>
              <span className="comp-val">+{fuelGrowthPct.toFixed(1)}%</span>
            </div>
            <div className="comp-progress-bar">
              <div 
                className="progress-fill fuel-fill" 
                style={{ width: `${Math.min(100, Math.max(10, fuelGrowthPct))}%` }}
              ></div>
            </div>

            <div className="comp-row" style={{ marginTop: '8px' }}>
              <div className="comp-label">
                <FaUtensils size={12} />
                <span>Koszyk żywności:</span>
              </div>
              <span className="comp-val">+{foodGrowthPct.toFixed(1)}%</span>
            </div>
            <div className="comp-progress-bar">
              <div 
                className="progress-fill food-fill" 
                style={{ width: `${Math.min(100, Math.max(10, foodGrowthPct))}%` }}
              ></div>
            </div>
          </div>
          <div className="stat-footer-hint">
            Korelacja cen transportu i produktów codziennego użytku
          </div>
        </div>
      </div>
    </div>
  );
}

