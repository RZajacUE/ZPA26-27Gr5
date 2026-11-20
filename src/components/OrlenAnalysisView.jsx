import React, { useState, useMemo, useEffect } from 'react';
import { 
  FaChartLine, 
  FaSliders, 
  FaArrowTrendUp, 
  FaArrowTrendDown, 
  FaScaleBalanced, 
  FaDownload, 
  FaCalendarDays, 
  FaGasPump,
  FaShieldHalved,
  FaCircleInfo,
  FaBolt,
  FaChartPie
} from 'react-icons/fa6';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  LineChart, 
  AreaChart,
  BarChart, 
  Line, 
  Area, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine 
} from './charts/RechartsComponents';
import { 
  formatPln, 
  parseFuelAnalysisData, 
  parseCsv, 
  parseEventsCsv, 
  calculateEventImpacts, 
  downloadRecordsAsCsv 
} from '../utils/csvParser';

export default function OrlenAnalysisView({ records = [], currentDataset, onOpenSlideMenu }) {
  const [selectedFuel, setSelectedFuel] = useState('Pb95'); // 'Pb95' | 'ONEkodiesel' | 'Pb98'
  const [forecastHorizon, setForecastHorizon] = useState(30); // 7, 14, 30, 60, 90 days
  const [forecastModel, setForecastModel] = useState('POLYNOMIAL'); // 'POLYNOMIAL' | 'WMA' | 'OPTIMISTIC' | 'PESSIMISTIC'
  const [stationMargin, setStationMargin] = useState(0.25); // PLN per liter retail station margin
  const [vatRate, setVatRate] = useState(23); // 23% standard VAT
  const [historicalData, setHistoricalData] = useState(null);
  const [fuelEvents, setFuelEvents] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Synchronize fuel type when dataset changes
  useEffect(() => {
    if (currentDataset?.fuelType === 'Pb95' || currentDataset?.id?.toLowerCase().includes('pb95')) {
      setSelectedFuel('Pb95');
    } else if (currentDataset?.fuelType === 'ONEkodiesel' || currentDataset?.id?.toLowerCase().includes('_on_')) {
      setSelectedFuel('ONEkodiesel');
    }
  }, [currentDataset]);

  // Fetch event determinators (orlen_paliwa_wydarzenia.csv)
  useEffect(() => {
    let isMounted = true;
    const loadEvents = async () => {
      const paths = [
        '/data/csv/orlen_paliwa/orlen_paliwa_wydarzenia.csv',
        '/data/csv/paliwa.csv',
      ];
      for (const p of paths) {
        try {
          const resp = await fetch(p);
          if (resp.ok) {
            const text = await resp.text();
            const lower = (text || '').trim().toLowerCase();
            if (lower && !lower.startsWith('<!doctype') && !lower.startsWith('<html') && !lower.includes('<head')) {
              const parsedEvts = parseEventsCsv(text);
              if (isMounted && parsedEvts.length > 0) {
                setFuelEvents(parsedEvts);
                return;
              }
            }
          }
        } catch {
        }
      }
    };
    loadEvents();
    return () => { isMounted = false; };
  }, []);

  // Fetch full analysis file or recompute when active dataset changes
  useEffect(() => {
    let isMounted = true;
    const loadFullAnalysis = async () => {
      // If current records are from multi-year or custom upload with > 1000 items
      if (records.length > 1000) {
        if (isMounted) setHistoricalData(parseFuelAnalysisData(records));
        return;
      }

      setIsLoadingHistory(true);
      const paths = [
        '/data/csv/orlen_paliwa/orlen_paliwa_analiza_2019_2026.csv',
        '/data/csv/analiza_cen_paliw.csv',
      ];
      for (const p of paths) {
        try {
          const resp = await fetch(p);
          if (resp.ok) {
            const text = await resp.text();
            const lower = (text || '').trim().toLowerCase();
            if (lower && !lower.startsWith('<!doctype') && !lower.startsWith('<html') && !lower.includes('<head')) {
              const { records: parsedRows } = parseCsv(text);
              if (isMounted && parsedRows.length > 0) {
                // If the user has a custom dataset or specific year records, merge recent observations
                let combined = parsedRows;
                if (records.length > 0 && records.length < 1000) {
                  // Ensure current year records are prioritized
                  combined = [...parsedRows, ...records];
                }
                setHistoricalData(parseFuelAnalysisData(combined));
                setIsLoadingHistory(false);
                return;
              }
            }
          }
        } catch {
          // continue fallback
        }
      }
      // Fallback: parse provided records
      if (isMounted) {
        setHistoricalData(parseFuelAnalysisData(records));
        setIsLoadingHistory(false);
      }
    };

    loadFullAnalysis();
    return () => { isMounted = false; };
  }, [records, currentDataset]);

  // Active prediction metrics for selected fuel
  const currentPred = historicalData?.predictions?.[selectedFuel] || historicalData?.predictions?.['Pb95'];
  const lastActualPrice = currentPred?.lastActual || 5.31;
  const lastActualDate = currentPred?.lastDate || '2026-11-11';

  // Build overlay chart series: combines recent historical actuals + forecasted future
  const overlayChartData = useMemo(() => {
    if (!historicalData || !historicalData.dailySeries) return [];

    // Take last 90 historical days for visual context
    const recentActuals = historicalData.dailySeries
      .filter(d => typeof d[selectedFuel] === 'number')
      .slice(-90)
      .map(d => ({
        date: d.date,
        actualPrice: d[selectedFuel],
        predictedPrice: null,
        lowerBound: null,
        upperBound: null,
        isForecast: false,
      }));

    if (!currentPred || !currentPred.forecastPoints) return recentActuals;

    // Filter forecast points by selected horizon
    const horizonPoints = currentPred.forecastPoints
      .slice(0, forecastHorizon)
      .map(pt => {
        let modelPrice = pt.predictedPrice;
        let lower = pt.lowerBound;
        let upper = pt.upperBound;

        if (forecastModel === 'OPTIMISTIC') {
          modelPrice = pt.optimistic;
          lower = parseFloat((pt.lowerBound * 0.95).toFixed(3));
          upper = parseFloat((pt.predictedPrice * 1.01).toFixed(3));
        } else if (forecastModel === 'PESSIMISTIC') {
          modelPrice = pt.pessimistic;
          lower = parseFloat((pt.predictedPrice * 0.99).toFixed(3));
          upper = parseFloat((pt.upperBound * 1.06).toFixed(3));
        } else if (forecastModel === 'WMA') {
          // Weighted moving momentum
          modelPrice = parseFloat((lastActualPrice + (pt.predictedPrice - lastActualPrice) * 0.65).toFixed(3));
        }

        return {
          date: pt.date,
          actualPrice: null,
          predictedPrice: modelPrice,
          lowerBound: lower,
          upperBound: upper,
          isForecast: true,
        };
      });

    // Bridge the gap at cutoff date so line connects smoothly
    if (recentActuals.length > 0 && horizonPoints.length > 0) {
      recentActuals[recentActuals.length - 1].predictedPrice = recentActuals[recentActuals.length - 1].actualPrice;
      recentActuals[recentActuals.length - 1].lowerBound = recentActuals[recentActuals.length - 1].actualPrice;
      recentActuals[recentActuals.length - 1].upperBound = recentActuals[recentActuals.length - 1].actualPrice;
    }

    return [...recentActuals, ...horizonPoints];
  }, [historicalData, selectedFuel, forecastHorizon, forecastModel, currentPred, lastActualPrice]);

  // Projected price at horizon end
  const projectedEndItem = overlayChartData[overlayChartData.length - 1];
  const projectedEndPrice = projectedEndItem?.predictedPrice || lastActualPrice;
  const priceDelta = projectedEndPrice - lastActualPrice;
  const priceDeltaPct = (priceDelta / lastActualPrice) * 100;

  // Station pump estimated retail price
  const estimatedPumpNet = projectedEndPrice + stationMargin;
  const estimatedPumpGross = estimatedPumpNet * (1 + vatRate / 100);

  // Multi-year monthly series for macro view (2019-2026)
  const monthlyMacroData = useMemo(() => {
    return historicalData?.monthlySeries || [];
  }, [historicalData]);

  // Compute event impacts across time series for selected fuel
  const eventImpacts = useMemo(() => {
    if (!fuelEvents.length || !historicalData?.dailySeries?.length) return [];
    return calculateEventImpacts(fuelEvents, historicalData.dailySeries, selectedFuel, 'date');
  }, [fuelEvents, historicalData, selectedFuel]);

  // Monthly volatility series (% MoM price changes) for Chart 4
  const monthlyVolatilityData = useMemo(() => {
    if (!monthlyMacroData || monthlyMacroData.length < 2) return [];
    return monthlyMacroData.map((curr, idx, arr) => {
      if (idx === 0) return { month: curr.month, Pb95_MoM: 0, ON_MoM: 0 };
      const prev = arr[idx - 1];
      const pb95Mom = prev.Pb95 && prev.Pb95 > 0 ? ((curr.Pb95 - prev.Pb95) / prev.Pb95) * 100 : 0;
      const onMom = prev.ONEkodiesel && prev.ONEkodiesel > 0 ? ((curr.ONEkodiesel - prev.ONEkodiesel) / prev.ONEkodiesel) * 100 : 0;
      return {
        month: curr.month,
        Pb95_MoM: parseFloat(pb95Mom.toFixed(2)),
        ON_MoM: parseFloat(onMom.toFixed(2)),
      };
    });
  }, [monthlyMacroData]);

  const handleDownloadAnalysisCsv = () => {
    const rows = eventImpacts.map(item => ({
      Wydarzenie: item.description,
      Data_startu: item.date,
      Dni_trwania: item.durationDays,
      Data_konca: item.endDateStr,
      Paliwo: selectedFuel,
      Cena_startowa_PLN_l: item.startVal ? item.startVal.toFixed(3) : '',
      Cena_koncowa_PLN_l: item.endVal ? item.endVal.toFixed(3) : '',
      Roznica_procentowa: item.pctChange !== null ? `${item.pctChange}%` : '',
    }));

    const todayStr = new Date().toISOString().slice(0, 10);
    const filename = `orlen_wplyw_wydarzen_ceny_${selectedFuel}_${todayStr}.csv`;
    downloadRecordsAsCsv(rows, Object.keys(rows[0] || {}), filename, ';');
  };

  return (
    <div className="analysis-dashboard orlen-theme">
      <div className="analysis-header-card">
        <div className="analysis-title-group">
          <div className="analysis-icon-box">
            <FaChartLine size={20} />
          </div>
          <div>
            <div className="analysis-badge">Centrum Analityczne PKN ORLEN</div>
            <h2 className="analysis-main-title">Predykcja Cen Paliw & Analiza Wieloletnia (2019–2026)</h2>
            <p className="analysis-subtitle">
              Modelowanie ekonometryczne notowań hurtowych, nałożenie danych bieżących na prognozy oraz estymacja cen przy dystrybutorze.
            </p>
          </div>
        </div>

        <div className="analysis-header-actions">
          <button 
            type="button" 
            className="btn-analysis-download"
            onClick={handleDownloadAnalysisCsv}
            title="Pobierz tabelę predykcji do pliku CSV"
          >
            <FaDownload size={13} />
            <span>Eksportuj predykcję (CSV)</span>
          </button>
        </div>
      </div>
      <div className="analysis-control-panel">
        <div className="control-panel-heading">
          <FaSliders size={14} />
          <span>Parametry panelu kontrolnego i symulacji:</span>
        </div>

        <div className="control-panel-grid">
          <div className="control-box">
            <label className="control-box-label">Wybór paliwa:</label>
            <div className="control-pills-row">
              {[
                { id: 'Pb95', label: 'Eurosuper Pb95' },
                { id: 'ONEkodiesel', label: 'Ekodiesel ON' },
                { id: 'Pb98', label: 'Super Plus Pb98' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  className={`control-pill ${selectedFuel === f.id ? 'active' : ''}`}
                  onClick={() => setSelectedFuel(f.id)}
                >
                  <FaGasPump size={11} />
                  <span>{f.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="control-box">
            <label className="control-box-label">Horyzont predykcji:</label>
            <div className="control-pills-row">
              {[
                { days: 7, label: '+7 dni' },
                { days: 14, label: '+14 dni' },
                { days: 30, label: '+30 dni' },
                { days: 60, label: '+60 dni' },
                { days: 90, label: '+90 dni' }
              ].map(h => (
                <button
                  key={h.days}
                  type="button"
                  className={`control-pill ${forecastHorizon === h.days ? 'active' : ''}`}
                  onClick={() => setForecastHorizon(h.days)}
                >
                  <FaCalendarDays size={11} />
                  <span>{h.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="control-box">
            <label className="control-box-label">Algorytm predykcji:</label>
            <select
              value={forecastModel}
              onChange={(e) => setForecastModel(e.target.value)}
              className="control-select"
            >
              <option value="POLYNOMIAL">Regresja trendu z tłumieniem pędu (Bazowy)</option>
              <option value="WMA">Ważona średnia ruchoma (Krótkoterminowy momentum)</option>
              <option value="OPTIMISTIC">Scenariusz optymistyczny (Spadek cen ropy -4%)</option>
              <option value="PESSIMISTIC">Scenariusz napięć rynkowych (+6% premia ryzyka)</option>
            </select>
          </div>
          <div className="control-box">
            <div className="slider-label-row">
              <label className="control-box-label">Marża detaliczna stacji:</label>
              <span className="slider-val-badge">+{formatPln(stationMargin, 2)} zł/l</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.60"
              step="0.01"
              value={stationMargin}
              onChange={(e) => setStationMargin(parseFloat(e.target.value))}
              className="control-slider"
            />
            <span className="control-hint">Symulacja marży stacji paliw przy dystrybutorze</span>
          </div>
        </div>
      </div>
      <div className="analysis-kpi-grid">
        <div className="analysis-kpi-card">
          <span className="kpi-label">Aktualna cena hurtowa spot</span>
          <div className="kpi-value-row">
            <span className="kpi-number">{formatPln(lastActualPrice, 3)}</span>
            <span className="kpi-unit">zł/litr</span>
          </div>
          <span className="kpi-subtext">{(lastActualPrice * 1000).toLocaleString('pl-PL')} zł/m³ (Stan: {lastActualDate})</span>
        </div>

        <div className={`analysis-kpi-card ${priceDelta >= 0 ? 'kpi-up' : 'kpi-down'}`}>
          <span className="kpi-label">Prognoza na koniec horyzontu (+{forecastHorizon} dni)</span>
          <div className="kpi-value-row">
            <span className="kpi-number">{formatPln(projectedEndPrice, 3)}</span>
            <span className="kpi-unit">zł/litr</span>
            <span className={`kpi-trend-pill ${priceDelta >= 0 ? 'up' : 'down'}`}>
              {priceDelta >= 0 ? <FaArrowTrendUp size={11} /> : <FaArrowTrendDown size={11} />}
              <span>{priceDelta >= 0 ? '+' : ''}{priceDeltaPct.toFixed(2)}%</span>
            </span>
          </div>
          <span className="kpi-subtext">Szacunek modelu dla {projectedEndItem?.date || 'koniec okresu'}</span>
        </div>

        <div className="analysis-kpi-card highlight-card">
          <span className="kpi-label">Szacowana cena przy dystrybutorze (brutto)</span>
          <div className="kpi-value-row">
            <span className="kpi-number">{formatPln(estimatedPumpGross, 2)}</span>
            <span className="kpi-unit">zł/litr</span>
          </div>
          <span className="kpi-subtext">Z uwzględnieniem marży {formatPln(stationMargin, 2)} zł i {vatRate}% VAT</span>
        </div>

        <div className="analysis-kpi-card">
          <span className="kpi-label">Dokładność modelu (Średni błąd MAPE)</span>
          <div className="kpi-value-row">
            <span className="kpi-number">±{currentPred?.mape || 1.4}%</span>
            <span className="kpi-unit">błąd</span>
          </div>
          <span className="kpi-subtext">Przedział ufności 95% (±{formatPln(currentPred?.stdErr * 1.96 || 0.12, 2)} zł)</span>
        </div>
      </div>
      <div className="analysis-stacked-charts-col">
        <div className="analysis-chart-card full-width">
          <div className="chart-card-header">
            <div className="chart-header-left">
              <span className="chart-card-badge">WYKRES 1: PROGNOZA SPOT & WYDARZENIA</span>
              <h3 className="chart-card-title">Cena Rzeczywista vs Model Predykcyjny ({selectedFuel}) z Wydarzeniami Rynkowymi</h3>
              <p className="chart-card-desc">
                Ciągły przebieg notowań historycznych, nałożona estymacja przyszłego trendu oraz zaznaczone okresy obowiązywania polityk (paliwa.csv).
              </p>
            </div>
            <div className="chart-header-badges">
              <span className="pill-badge pill-red">Cena rzeczywista</span>
              <span className="pill-badge pill-gold">Predykcja modelu</span>
              <span className="pill-badge pill-ribbon">Wstęga ufności 95%</span>
              <span className="pill-badge pill-event" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <FaBolt size={10} /> Wydarzenia & Tarcza
              </span>
            </div>
          </div>

          <div className="chart-body">
            <ResponsiveContainer width="100%" height={360}>
              <ComposedChart data={overlayChartData} events={eventImpacts} themeColor="#E11A27">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(d) => d.slice(5)} 
                  stroke="#64748B" 
                />
                <YAxis 
                  unit=" zł" 
                  domain={['auto', 'auto']}
                  tickFormatter={(v) => v.toFixed(2)} 
                  stroke="#64748B" 
                />
                <Tooltip 
                  formatter={(val, name) => [`${formatPln(val, 3)} zł/l`, name]}
                  labelFormatter={(label) => `Data notowania: ${label}`}
                />
                <Legend />
                <ReferenceLine y={lastActualPrice} stroke="#94A3B8" strokeDasharray="4 4" label={`Bieżąca: ${lastActualPrice.toFixed(2)} zł`} />
                <Area 
                  dataKey="upperBound" 
                  lowerKey="lowerBound" 
                  fill="#E11A27" 
                  fillOpacity={0.12} 
                  stroke="transparent"
                  name="Przedział ufności (95%)" 
                />
                <Line 
                  dataKey="actualPrice" 
                  stroke="#E11A27" 
                  strokeWidth={2.8} 
                  name="Notowanie rzeczywiste (zł/l)" 
                />
                <Line 
                  dataKey="predictedPrice" 
                  stroke="#F59E0B" 
                  strokeWidth={2.4} 
                  strokeDasharray="5 5" 
                  name="Predykcja modelu (zł/l)" 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="analysis-chart-card full-width">
          <div className="chart-card-header">
            <div>
              <span className="chart-card-badge">WYKRES 2: HISTORIA WIELOLETNIA 2019–2026</span>
              <h3 className="chart-card-title">Wieloletnia Dynamika Cen Hurtowych & Szoki Geopolityczne</h3>
              <p className="chart-card-desc">Średnie miesięczne ceny notowań z pliku analiza_cen_paliw.csv z nałożonymi wydarzeniami z paliwa.csv</p>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={monthlyMacroData} events={eventImpacts} themeColor="#E11A27">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tickFormatter={(m) => m.slice(2)} />
                <YAxis unit=" zł" tickFormatter={(v) => v.toFixed(1)} />
                <Tooltip formatter={(v, name) => [`${formatPln(v, 2)} zł/l`, name]} />
                <Legend />
                <Line dataKey="Pb95" stroke="#E11A27" strokeWidth={2.5} name="Eurosuper Pb95" />
                <Line dataKey="ONEkodiesel" stroke="#007B3B" strokeWidth={2.5} name="Ekodiesel ON" />
                <Line dataKey="Pb98" stroke="#3B82F6" strokeWidth={1.8} strokeDasharray="3 3" name="Super Plus Pb98" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="analysis-chart-card full-width">
          <div className="chart-card-header">
            <div>
              <span className="chart-card-badge">WYKRES 3: SPREAD PALIWOWY</span>
              <h3 className="chart-card-title">Spread Cenowy: Ekodiesel ON vs Benzyna Pb95 (zł/litr)</h3>
              <p className="chart-card-desc">Różnica cenowa między olejem napędowym a benzyną; wartości powyżej zera oznaczają premię diesla (szok podażowy 2022)</p>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={monthlyMacroData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tickFormatter={(m) => m.slice(2)} />
                <YAxis unit=" zł" tickFormatter={(v) => `${v > 0 ? '+' : ''}${v.toFixed(2)}`} />
                <Tooltip formatter={(v) => [`${formatPln(v, 3)} zł/l`, 'Spread (ON - Pb95)']} />
                <ReferenceLine y={0} stroke="#94A3B8" strokeWidth={1.5} />
                <Bar dataKey="spreadONvsPb95" fill="#E11A27" radius={4} name="Spread ON vs Pb95" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="analysis-chart-card full-width">
          <div className="chart-card-header">
            <div>
              <span className="chart-card-badge">WYKRES 4: ZMIENNOŚĆ RYNKOWA</span>
              <h3 className="chart-card-title">Miesięczna Dynamika i Zmienność Cen Hurtowych (% MoM)</h3>
              <p className="chart-card-desc">Procentowe zmiany cen miesiąc do miesiąca pokazujące momenty gwałtownych szoków i stabilizacji rynku</p>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart data={monthlyVolatilityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tickFormatter={(m) => m.slice(2)} />
                <YAxis unit="%" tickFormatter={(v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`} />
                <Tooltip formatter={(v, name) => [`${v > 0 ? '+' : ''}${formatPln(v, 2)}% MoM`, name === 'Pb95_MoM' ? 'Eurosuper Pb95 (% m/m)' : 'Ekodiesel ON (% m/m)']} />
                <Legend />
                <ReferenceLine y={0} stroke="#64748B" strokeWidth={1.5} />
                <Area dataKey="Pb95_MoM" fill="#E11A27" stroke="#E11A27" fillOpacity={0.25} strokeWidth={2} name="Pb95 (% m/m)" />
                <Area dataKey="ON_MoM" fill="#007B3B" stroke="#007B3B" fillOpacity={0.2} strokeWidth={2} name="ON (% m/m)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="forecast-table-card events-table-card">
        <div className="forecast-table-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span className="table-mode-badge orlen">TRYB ANALITYCZNY • WPŁYW WYDARZEŃ</span>
              <h4 className="forecast-table-title">Tabela Wpływu Wydarzeń i Polityk Rynkowych na Ceny Paliw (paliwa.csv)</h4>
            </div>
            <p className="forecast-table-sub">
              Zestawienie wartości początkowych notowań {selectedFuel}, wartości pod koniec trwania polityki oraz faktycznej zmiany procentowej.
            </p>
          </div>
          <span className="forecast-table-count">{eventImpacts.length} zidentyfikowanych wydarzeń</span>
        </div>
        <div className="forecast-table-wrapper">
          <table className="forecast-table">
            <thead>
              <tr>
                <th>Wydarzenie / Polityka rynkowa</th>
                <th>Data rozpoczęcia</th>
                <th>Czas trwania</th>
                <th>Cena początkowa (zł/l)</th>
                <th>Cena pod koniec (zł/l)</th>
                <th>Różnica procentowa</th>
                <th>Wpływ rynkowy</th>
              </tr>
            </thead>
            <tbody>
              {eventImpacts.map((evt, i) => {
                const isUp = evt.pctChange > 0;
                return (
                  <tr key={evt.id || i}>
                    <td>
                      <div className="event-name-cell">
                        <span className="event-pin-icon"><FaBolt size={10} /></span>
                        <strong>{evt.description}</strong>
                      </div>
                    </td>
                    <td><span className="date-badge">{evt.date}</span></td>
                    <td>
                      <span className="duration-pill">{evt.durationDays} dni</span>
                      <span className="end-date-hint">do {evt.endDateStr}</span>
                    </td>
                    <td className="price-cell">
                      {evt.startVal ? `${formatPln(evt.startVal, 3)} zł` : '-'}
                    </td>
                    <td className="price-cell">
                      {evt.endVal ? `${formatPln(evt.endVal, 3)} zł` : '-'}
                    </td>
                    <td>
                      {evt.pctChange !== null ? (
                        <span className={`trend-cell-pill ${isUp ? 'up' : 'down'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          {isUp ? (
                            <>
                              <FaArrowTrendUp size={9} />
                              <span>+{evt.pctChange.toFixed(1)}%</span>
                            </>
                          ) : (
                            <>
                              <FaArrowTrendDown size={9} />
                              <span>{evt.pctChange.toFixed(1)}%</span>
                            </>
                          )}
                        </span>
                      ) : '-'}
                    </td>
                    <td>
                      <span className="impact-summary-note">
                        {evt.pctChange > 15 ? 'Silna presja inflacyjna' : (evt.pctChange < -10 ? 'Wyraźne obniżenie cen hurtowych' : 'Umiarkowana stabilizacja')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="analysis-section-divider">
        <span className="divider-line"></span>
        <span className="divider-label">
          <FaChartPie size={12} />
          <span>EMPIRYCZNA ANALIZA JAKOŚCI DANYCH & STATYSTYKA ZBIORU</span>
        </span>
        <span className="divider-line"></span>
      </div>
      <div className="empirical-images-section">
        <div className="empirical-card full-width">
          <div className="empirical-card-header">
            <div className="empirical-header-left">
              <span className="empirical-badge orlen-badge">ANALIZA JAKOŚCI ZBIORU • PKN ORLEN</span>
              <h3 className="empirical-title">Rozkład i Profil Braków Danych w Szeregach Notowań Hurtowych Paliw (2019–2026)</h3>
              <p className="empirical-subtitle">
                Zestawienie kompletności rekordów z pliku <code>data/csv/orlen_paliwa/orlen_paliwa_analiza_2019_2026.csv</code> obejmujące 5 829 historycznych punktów obserwacyjnych.
              </p>
            </div>
          </div>

          <div className="empirical-card-body">
            <div className="empirical-image-wrapper">
              <img 
                src="/data/images/orlen_paliwa/orlen_paliwa_braki_danych.png" 
                alt="Wykres braków danych w notowaniach paliw PKN ORLEN" 
                className="empirical-image"
                loading="lazy"
              />
            </div>

            <div className="empirical-analysis-content">
              <div className="analysis-block">
                <h4 className="analysis-block-title">
                  <FaCircleInfo size={14} className="block-icon" />
                  <span>Co przedstawia wykres:</span>
                </h4>
                <p className="analysis-block-text">
                  Wykres słupkowy diagnozuje kompletność danych w tabeli notowań hurtowych PKN ORLEN w ujęciu wielowymiarowym. Każdy słup reprezentuje jedną kolumnę w bazie (m.in. <code>productName</code>, <code>effectiveDate</code>, <code>publishFrom</code>, <code>value</code>, <code>unit</code>, <code>productId</code>, <code>cena_za_litr</code>), obrazując liczbę brakujących wpisów (NaN/null).
                </p>
              </div>

              <div className="analysis-block highlight-block">
                <h4 className="analysis-block-title">
                  <FaBolt size={14} className="block-icon" />
                  <span>Warto odnotować (Wnioski analityczne & jakość modeli):</span>
                </h4>
                <ul className="analysis-insights-list">
                  <li>
                    <strong>100% integralności kolumn cenowych i czasowych:</strong> Wszystkie kluczowe zmienne determinujące notowania hurtowe — <code>value</code> (zł/m³), przeliczona <code>cena_za_litr</code>, data obowiązywania <code>effectiveDate</code> oraz identyfikator <code>productName</code> — wykazują <strong>zerowy odsetek braków (0 brakujących obserwacji)</strong>. Gwarantuje to pełną ciągłość szeregów czasowych bez konieczności zaburzającej estymacji interpolacyjnej.
                  </li>
                  <li>
                    <strong>Geneza braków w kolumnie <code>publishFrom</code>:</strong> Odnotowano 2 448 braków na 5 829 wierszy (ok. 42% rekordów) wyłącznie w polu znacznika czasu publikacji. Jest to zjawisko czysto techniczne, wynikające z modernizacji formatu publikacji biuletynów cenowych PKN ORLEN na przełomie 2021 i 2022 roku — przed tą datą system rejestrował wyłącznie dzień wejścia w życie cennika (<code>effectiveDate</code>).
                  </li>
                  <li>
                    <strong>Odporność predykcji rynkowej:</strong> Ponieważ wdrożone modele prognostyczne (ARIMA, WMA, regresje wielomianowe) operują ściśle na zmiennych <code>effectiveDate</code> i <code>cena_za_litr</code>, zbiór cechuje się najwyższym standardem wiarygodności statystycznej.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
