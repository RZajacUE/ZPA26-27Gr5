import React, { useState, useMemo } from 'react';
import { FaChartLine, FaCircleInfo, FaScaleBalanced } from 'react-icons/fa6';

export default function GusChart({ chunks = [], frequency = 'WEEKS' }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Sample or slice points for smooth SVG rendering if there are too many (e.g. daily)
  const displayPoints = useMemo(() => {
    if (!chunks || chunks.length === 0) return [];
    if (chunks.length <= 150) return chunks;
    // Step down to at most 120 points for smooth canvas
    const step = Math.ceil(chunks.length / 120);
    return chunks.filter((_, idx) => idx % step === 0 || idx === chunks.length - 1);
  }, [chunks]);

  const {
    minBasket,
    maxBasket,
    minMedian,
    maxMedian,
    pointsCoords
  } = useMemo(() => {
    if (displayPoints.length === 0) {
      return { minBasket: 0, maxBasket: 100, minMedian: 0, maxMedian: 20, pointsCoords: [] };
    }

    const basketVals = displayPoints.map(p => p.basketTotal);
    const medianVals = displayPoints.map(p => p.weakMedianPrice);

    const minB = Math.floor(Math.min(...basketVals) * 0.9);
    const maxB = Math.ceil(Math.max(...basketVals) * 1.08);

    const minM = Math.floor(Math.min(...medianVals) * 0.85);
    const maxM = Math.ceil(Math.max(...medianVals) * 1.15);

    const width = 1000;
    const height = 300;
    const paddingX = 50;
    const paddingY = 30;

    const usableW = width - paddingX * 2;
    const usableH = height - paddingY * 2;

    const coords = displayPoints.map((item, idx) => {
      const x = paddingX + (idx / (displayPoints.length - 1 || 1)) * usableW;
      
      // Y for Basket Total
      const normBasket = (item.basketTotal - minB) / (maxB - minB || 1);
      const yBasket = height - paddingY - normBasket * usableH;

      // Y for Median Price (scaled proportionally for visibility on second axis)
      const normMedian = (item.weakMedianPrice - minM) / (maxM - minM || 1);
      const yMedian = height - paddingY - normMedian * (usableH * 0.7);

      return {
        x,
        yBasket,
        yMedian,
        raw: item
      };
    });

    return {
      minBasket: minB,
      maxBasket: maxB,
      minMedian: minM,
      maxMedian: maxM,
      pointsCoords: coords
    };
  }, [displayPoints]);

  if (!chunks || chunks.length === 0) {
    return (
      <div className="gus-chart-empty">
        Brak danych do wyświetlenia wykresu. Wybierz poprawny zakres dat.
      </div>
    );
  }

  // Build SVG path strings
  const basketPathStr = pointsCoords.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.yBasket}`).join(' ');
  const medianPathStr = pointsCoords.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.yMedian}`).join(' ');

  // Area under basket line
  const lastPt = pointsCoords[pointsCoords.length - 1] || { x: 0, yBasket: 300 };
  const firstPt = pointsCoords[0] || { x: 0, yBasket: 300 };
  const basketAreaStr = `${basketPathStr} L ${lastPt.x} 270 L ${firstPt.x} 270 Z`;

  return (
    <div className="gus-chart-card">
      <div className="gus-chart-header">
        <div className="chart-header-left">
          <FaChartLine className="chart-header-icon" size={18} />
          <div>
            <h3 className="chart-title">Ewolucja Koszyka Konsumpcyjnego i Mediany Cen w Czasie</h3>
            <p className="chart-subtitle">
              Zestawienie łącznej wartości koszyka (GUS BDL) oraz tygodniowej mediany cen (Weak Median) na przestrzeni lat
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="gus-chart-legend">
          <div className="legend-item">
            <span className="legend-line basket-line"></span>
            <span className="legend-text">Wartość koszyka (PLN)</span>
          </div>
          <div className="legend-item">
            <span className="legend-line median-line"></span>
            <span className="legend-text">Mediana tygodniowa / okresowa (PLN)</span>
          </div>
        </div>
      </div>

      <div className="gus-svg-container">
        <svg
          viewBox="0 0 1000 300"
          className="gus-chart-svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="gusBasketGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#007B3B" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#007B3B" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gusMedianGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D97706" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="50" y1="30" x2="950" y2="30" stroke="#E5E7EB" strokeDasharray="4 4" />
          <line x1="50" y1="110" x2="950" y2="110" stroke="#E5E7EB" strokeDasharray="4 4" />
          <line x1="50" y1="190" x2="950" y2="190" stroke="#E5E7EB" strokeDasharray="4 4" />
          <line x1="50" y1="270" x2="950" y2="270" stroke="#CBD5E1" />

          {/* Y Axis Labels (Left: Basket PLN) */}
          <text x="45" y="35" textAnchor="end" fill="#007B3B" fontSize="11" fontWeight="600">{maxBasket} zł</text>
          <text x="45" y="150" textAnchor="end" fill="#6B7280" fontSize="10">{Math.round((maxBasket + minBasket) / 2)} zł</text>
          <text x="45" y="270" textAnchor="end" fill="#6B7280" fontSize="10">{minBasket} zł</text>

          {/* Y Axis Labels (Right: Median PLN) */}
          <text x="955" y="35" textAnchor="start" fill="#D97706" fontSize="11" fontWeight="600">{maxMedian} zł (med)</text>
          <text x="955" y="270" textAnchor="start" fill="#D97706" fontSize="10">{minMedian} zł</text>

          {/* Area under basket curve */}
          <path d={basketAreaStr} fill="url(#gusBasketGrad)" />

          {/* Basket Total Line */}
          <path
            d={basketPathStr}
            fill="none"
            stroke="#007B3B"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Median Line (dashed amber) */}
          <path
            d={medianPathStr}
            fill="none"
            stroke="#D97706"
            strokeWidth="2.5"
            strokeDasharray="5 3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Hover Anchor Circles */}
          {pointsCoords.map((pt, idx) => (
            <g
              key={pt.raw._id || idx}
              className="chart-interactive-point"
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              {/* Invisible large target for easy hover */}
              <circle cx={pt.x} cy={pt.yBasket} r="10" fill="transparent" />
              
              {/* Visible points if hovered */}
              {hoveredPoint?.raw._id === pt.raw._id && (
                <>
                  <line x1={pt.x} y1="30" x2={pt.x} y2="270" stroke="#9CA3AF" strokeDasharray="3 3" />
                  <circle cx={pt.x} cy={pt.yBasket} r="6" fill="#007B3B" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx={pt.x} cy={pt.yMedian} r="5" fill="#D97706" stroke="#FFFFFF" strokeWidth="2" />
                </>
              )}
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div 
            className="gus-chart-tooltip"
            style={{
              left: `${Math.min(85, Math.max(15, (hoveredPoint.x / 1000) * 100))}%`,
              top: '15px'
            }}
          >
            <div className="tooltip-header">
              <span className="tooltip-date">{hoveredPoint.raw.label}</span>
              <span className="tooltip-badge">GUS BDL</span>
            </div>
            <div className="tooltip-row basket-row">
              <span className="dot dot-green"></span>
              <span className="tooltip-label">Wartość koszyka:</span>
              <strong className="tooltip-val">{hoveredPoint.raw.basketTotal.toFixed(2)} PLN</strong>
            </div>
            <div className="tooltip-row median-row">
              <span className="dot dot-amber"></span>
              <span className="tooltip-label">Mediana tygodniowa:</span>
              <strong className="tooltip-val">{hoveredPoint.raw.weakMedianPrice.toFixed(2)} PLN</strong>
            </div>
            <div className="tooltip-row change-row">
              <span className="tooltip-label">Zmiana od początku:</span>
              <span className={`change-pill ${hoveredPoint.raw.percentChange >= 0 ? 'positive' : 'negative'}`}>
                {hoveredPoint.raw.percentChange >= 0 ? '+' : ''}{hoveredPoint.raw.percentChange.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="gus-chart-footer">
        <span className="chart-tip">
          <FaCircleInfo size={12} />
          Wskaż kursorem dowolny punkt na wykresie, aby sprawdzić dokładne notowanie i medianę cen.
        </span>
        <span className="chart-source">Źródło: Główny Urząd Statystyczny (GUS) • Bank Danych Lokalnych (BDL)</span>
      </div>
    </div>
  );
}

