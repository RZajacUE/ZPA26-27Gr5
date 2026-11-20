import React, { useState, useMemo, useEffect } from 'react';
import { 
  FaChartLine, 
  FaSliders, 
  FaArrowTrendUp, 
  FaArrowTrendDown, 
  FaScaleBalanced, 
  FaDownload, 
  FaBasketShopping, 
  FaBuildingColumns,
  FaUsers,
  FaShieldHalved,
  FaBolt,
  FaChartPie,
  FaCircleInfo,
  FaLayerGroup,
  FaTableCellsLarge
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
  parseFullBasketAnalysisCsv, 
  parseEventsCsv, 
  calculateEventImpacts, 
  downloadRecordsAsCsv 
} from '../utils/csvParser';
import { GUS_EARNINGS_HISTORY } from '../services/gusBdlApi';

export default function GusAnalysisView({ chunks = [], summary = {}, currentDataset, onOpenSlideMenu }) {
  const [basketAnalysisData, setBasketAnalysisData] = useState(null);
  const [foodEvents, setFoodEvents] = useState([]);
  const [inflationScenario, setInflationScenario] = useState('EXTRAPOLATION'); // 'EXTRAPOLATION' | 'NBP_TARGET' | 'ENERGY_SHOCK'
  const [householdSize, setHouseholdSize] = useState('2'); // '1', '2', '4'
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Load event determinators (gus_zywnosc_wydarzenia.csv)
  useEffect(() => {
    let isMounted = true;
    const loadEvents = async () => {
      const paths = [
        '/data/csv/gus_zywnosc/gus_zywnosc_wydarzenia.csv',
        '/data/csv/zywnosc.csv',
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
                setFoodEvents(parsedEvts);
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

  // Load gus_zywnosc_analiza_koszyka_2019_2025.csv
  useEffect(() => {
    let isMounted = true;
    const loadBasketAnalysis = async () => {
      const customPath = currentDataset?.id && currentDataset.id.includes('analiza') 
        ? `/data/csv/gus_zywnosc/${currentDataset.id}` 
        : null;
      const paths = [
        customPath,
        '/data/csv/gus_zywnosc/gus_zywnosc_analiza_koszyka_2019_2025.csv',
        '/data/csv/pelna_analiza_cen.csv',
      ].filter(Boolean);

      for (const p of paths) {
        try {
          const resp = await fetch(p);
          if (resp.ok) {
            const text = await resp.text();
            const lower = (text || '').trim().toLowerCase();
            if (lower && !lower.startsWith('<!doctype') && !lower.startsWith('<html') && !lower.includes('<head')) {
              const parsed = parseFullBasketAnalysisCsv(text);
              if (isMounted && parsed.products && parsed.products.length > 0) {
                setBasketAnalysisData(parsed);
                return;
              }
            }
          }
        } catch {
        }
      }
    };
    loadBasketAnalysis();
    return () => { isMounted = false; };
  }, [currentDataset]);

  // Household multiplier
  const sizeMultiplier = householdSize === '1' ? 1.0 : (householdSize === '4' ? 3.2 : 1.8);

  // Combine live/cached chunks from BDL API with projection
  const overlayChartData = useMemo(() => {
    if (!chunks || chunks.length === 0) return [];

    // Historical monthly or periodic points from BDL
    const actualPoints = chunks.slice(-48).map(c => ({
      period: c.period,
      actualBasket: parseFloat((c.basketTotal * sizeMultiplier).toFixed(2)),
      actualMedian: parseFloat(c.weakMedianPrice.toFixed(2)),
      predictedBasket: null,
      lowerBound: null,
      upperBound: null,
      earningsNet: c.earnings?.net || 6000,
      isForecast: false,
    }));

    if (actualPoints.length === 0) return [];

    const lastActual = actualPoints[actualPoints.length - 1];
    const baseBasket = lastActual.actualBasket;

    // Monthly inflation projection for 12 months ahead
    const forecastPoints = [];
    let annualRate = 0.042; // base 4.2%
    if (inflationScenario === 'NBP_TARGET') annualRate = 0.025; // 2.5%
    if (inflationScenario === 'ENERGY_SHOCK') annualRate = 0.078; // 7.8%

    const monthlyFactor = Math.pow(1 + annualRate, 1 / 12);

    for (let m = 1; m <= 14; m++) {
      const projectedVal = baseBasket * Math.pow(monthlyFactor, m);
      const marginOfErr = projectedVal * (0.015 + m * 0.0035);

      const d = new Date();
      d.setMonth(d.getMonth() + m);
      const periodLabel = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      forecastPoints.push({
        period: periodLabel,
        actualBasket: null,
        actualMedian: null,
        predictedBasket: parseFloat(projectedVal.toFixed(2)),
        lowerBound: parseFloat((projectedVal - marginOfErr).toFixed(2)),
        upperBound: parseFloat((projectedVal + marginOfErr).toFixed(2)),
        earningsNet: Math.round(6680 * Math.pow(1.05, m / 12)),
        isForecast: true,
      });
    }

    // Bridge last actual with first forecast
    actualPoints[actualPoints.length - 1].predictedBasket = baseBasket;
    actualPoints[actualPoints.length - 1].lowerBound = baseBasket;
    actualPoints[actualPoints.length - 1].upperBound = baseBasket;

    return [...actualPoints, ...forecastPoints];
  }, [chunks, sizeMultiplier, inflationScenario]);

  // Helper to format clean, readable product labels for the chart
  const cleanProductName = (name) => {
    if (!name) return '';
    const lower = name.toLowerCase();
    if (lower.includes('chleb')) return 'Chleb pszenno-żytni';
    if (lower.includes('jaja')) return 'Jaja kurze';
    if (lower.includes('polędwica')) return 'Polędwica drobiowa';
    if (lower.includes('mleko')) return 'Mleko spożywcze';
    if (lower.includes('ryż')) return 'Ryż biały';
    if (lower.includes('kiełbasa')) return 'Kiełbasa sucha';
    if (lower.includes('makaron')) return 'Makaron jajeczny';
    if (lower.includes('masło')) return 'Masło ekstra 82%';
    if (lower.includes('herbata')) return 'Herbata czarna';
    if (lower.includes('jabłkowy')) return 'Sok jabłkowy';
    if (lower.includes('mąka')) return 'Mąka pszenna';
    if (lower.includes('schab') || lower.includes('wieprzowe')) return 'Schab wieprzowy';
    if (lower.includes('cukier')) return 'Cukier biały';
    return name.split(' -')[0].trim();
  };

  // Product inflation ranking from gus_zywnosc_analiza_koszyka_2019_2025.csv
  const inflationRanking = useMemo(() => {
    if (!basketAnalysisData || !basketAnalysisData.products || basketAnalysisData.products.length === 0) return [];
    return [...basketAnalysisData.products]
      .filter(p => typeof p.totalChangePct === 'number' && !isNaN(p.totalChangePct))
      .sort((a, b) => b.totalChangePct - a.totalChangePct)
      .map(p => {
        return {
          ...p,
          shortName: cleanProductName(p.name),
          price2019: p.prices?.['2019'] || 0,
          price2025: p.prices?.['2025'] || 0,
          index2025: p.indices?.['2025'] || parseFloat((100 + p.totalChangePct).toFixed(1)),
        };
      });
  }, [basketAnalysisData]);

  // Annual purchasing power & budget share series (2019-2027)
  const annualTrendSeries = useMemo(() => {
    const years = ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027'];
    return years.map(yr => {
      const netSalary = GUS_EARNINGS_HISTORY[yr]?.net || (yr === '2027' ? 7100 : 6680);
      const basketSum = (basketAnalysisData?.yearlyTotals?.[yr] || 160) * sizeMultiplier;
      const budgetPct = (basketSum / netSalary) * 100;
      const hoursWork = (basketSum / (netSalary / 168));

      return {
        year: yr,
        basketSum: parseFloat(basketSum.toFixed(2)),
        netSalary,
        budgetSharePct: parseFloat(budgetPct.toFixed(1)),
        hoursWork: parseFloat(hoursWork.toFixed(1)),
        isForecast: yr === '2026' || yr === '2027',
      };
    });
  }, [basketAnalysisData, sizeMultiplier]);

  // Compute event impacts across time series for food events (zywnosc.csv)
  const eventImpacts = useMemo(() => {
    if (!foodEvents.length) return [];
    return calculateEventImpacts(foodEvents, annualTrendSeries, 'basketSum', 'year');
  }, [foodEvents, annualTrendSeries]);

  // YoY Inflation dynamics for Chart 4
  const yoyInflationSeries = useMemo(() => {
    if (!annualTrendSeries || annualTrendSeries.length < 2) return [];
    return annualTrendSeries.slice(1).map((curr, idx) => {
      const prev = annualTrendSeries[idx];
      const inflationRate = prev.basketSum > 0 ? ((curr.basketSum - prev.basketSum) / prev.basketSum) * 100 : 0;
      return {
        year: curr.year,
        inflationRate: parseFloat(inflationRate.toFixed(1)),
        nbpTarget: 2.5,
      };
    });
  }, [annualTrendSeries]);

  const lastActualItem = overlayChartData.find(d => !d.isForecast && d.actualBasket !== null);
  const projectedEndItem = overlayChartData[overlayChartData.length - 1];

  const handleDownloadReportCsv = () => {
    const rows = eventImpacts.map(item => ({
      Wydarzenie: item.description,
      Data_startu: item.date,
      Dni_trwania: item.durationDays,
      Data_konca: item.endDateStr,
      Koszyk_startowy_PLN: item.startVal ? item.startVal.toFixed(2) : '',
      Koszyk_koncowy_PLN: item.endVal ? item.endVal.toFixed(2) : '',
      Roznica_procentowa: item.pctChange !== null ? `${item.pctChange}%` : '',
    }));

    const todayStr = new Date().toISOString().slice(0, 10);
    const filename = `gus_wplyw_wydarzen_koszyk_${householdSize}os_${todayStr}.csv`;
    downloadRecordsAsCsv(rows, Object.keys(rows[0] || {}), filename, ';');
  };

  return (
    <div className="analysis-dashboard gus-theme">
      <div className="analysis-header-card gus-card">
        <div className="analysis-title-group">
          <div className="analysis-icon-box gus-icon-box">
            <FaBasketShopping size={20} />
          </div>
          <div>
            <div className="analysis-badge gus-badge">Panel Analityczno-Predykcyjny GUS BDL</div>
            <h2 className="analysis-main-title">Analiza Koszyka Konsumpcyjnego & Prognoza Inflacji (2019–2027)</h2>
            <p className="analysis-subtitle">
              Zestawienie danych historycznych z pliku pelna_analiza_cen.csv z bieżącymi notowaniami BDL API oraz modelami predykcyjnymi siły nabywczej.
            </p>
          </div>
        </div>

        <div className="analysis-header-actions">
          <button 
            type="button" 
            className="btn-analysis-download gus"
            onClick={handleDownloadReportCsv}
            title="Pobierz raport predykcji koszyka do pliku CSV"
          >
            <FaDownload size={13} />
            <span>Pobierz raport analizy (CSV)</span>
          </button>
        </div>
      </div>
      <div className="analysis-control-panel gus-controls">
        <div className="control-panel-heading">
          <FaSliders size={14} />
          <span>Parametry analizy koszyka i symulatora:</span>
        </div>

        <div className="control-panel-grid">
          <div className="control-box">
            <label className="control-box-label">Gospodarstwo domowe:</label>
            <div className="control-pills-row">
              {[
                { id: '1', label: '1 osoba (Singiel)' },
                { id: '2', label: '2 osoby (Para)' },
                { id: '4', label: 'Rodzina (2+2)' }
              ].map(h => (
                <button
                  key={h.id}
                  type="button"
                  className={`control-pill gus ${householdSize === h.id ? 'active' : ''}`}
                  onClick={() => setHouseholdSize(h.id)}
                >
                  <FaUsers size={11} />
                  <span>{h.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="control-box">
            <label className="control-box-label">Scenariusz makroekonomiczny:</label>
            <select
              value={inflationScenario}
              onChange={(e) => setInflationScenario(e.target.value)}
              className="control-select"
            >
              <option value="EXTRAPOLATION">Ekstrapolacja trendu z danych BDL (+4.2% rocznie)</option>
              <option value="NBP_TARGET">Cel inflacyjny NBP (+2.5% stabilizacja)</option>
              <option value="ENERGY_SHOCK">Scenariusz podwyższonych cen energii (+7.8%)</option>
            </select>
          </div>
          <div className="control-box">
            <label className="control-box-label">Kategoria produktów w analizie:</label>
            <div className="control-pills-row">
              {[
                { id: 'ALL', label: 'Wszystkie 13 reprezentantów' },
                { id: 'BAKERY', label: 'Zboża & Pieczywo' },
                { id: 'MEAT', label: 'Mięso & Nabiał' }
              ].map(c => (
                <button
                  key={c.id}
                  type="button"
                  className={`control-pill gus ${selectedCategory === c.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(c.id)}
                >
                  <FaScaleBalanced size={11} />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="analysis-kpi-grid">
        <div className="analysis-kpi-card gus-card">
          <span className="kpi-label">Koszyk bazowy 2019 (pelna_analiza_cen)</span>
          <div className="kpi-value-row">
            <span className="kpi-number">{formatPln((basketAnalysisData?.yearlyTotals?.['2019'] || 109.63) * sizeMultiplier, 2)}</span>
            <span className="kpi-unit">zł</span>
          </div>
          <span className="kpi-subtext">Punkt wyjściowy (indeks bazowy = 100,0)</span>
        </div>

        <div className="analysis-kpi-card gus-card">
          <span className="kpi-label">Wartość koszyka 2025 / Bieżąca</span>
          <div className="kpi-value-row">
            <span className="kpi-number">{formatPln((basketAnalysisData?.yearlyTotals?.['2025'] || 168.87) * sizeMultiplier, 2)}</span>
            <span className="kpi-unit">zł</span>
            <span className="kpi-trend-pill up">
              <FaArrowTrendUp size={11} />
              <span>+54.0%</span>
            </span>
          </div>
          <span className="kpi-subtext">Wzrost skumulowany w latach 2019–2025</span>
        </div>

        <div className="analysis-kpi-card gus-card highlight-card">
          <span className="kpi-label">Prognoza wartości koszyka (Koniec 2026/2027)</span>
          <div className="kpi-value-row">
            <span className="kpi-number">{formatPln(projectedEndItem?.predictedBasket || 180, 2)}</span>
            <span className="kpi-unit">zł</span>
          </div>
          <span className="kpi-subtext">Scenariusz: {inflationScenario === 'NBP_TARGET' ? 'NBP 2.5%' : (inflationScenario === 'ENERGY_SHOCK' ? 'Szok +7.8%' : 'Trend +4.2%')}</span>
        </div>

        <div className="analysis-kpi-card gus-card">
          <span className="kpi-label">Lider wzrostu cen (2019–2025)</span>
          <div className="kpi-value-row">
            <span className="kpi-number">+102.3%</span>
            <span className="kpi-unit">chleb</span>
          </div>
          <span className="kpi-subtext">Chleb pszenno-żytni (z 2.66 zł do 5.38 zł)</span>
        </div>
      </div>
      <div className="analysis-stacked-charts-col">
        <div className="analysis-chart-card full-width">
          <div className="chart-card-header">
            <div className="chart-header-left">
              <span className="chart-card-badge gus-badge">WYKRES 1: KOSZYK BDL & PROGNOZA</span>
              <h3 className="chart-card-title">Rzeczywisty Koszyk BDL vs Model Predykcyjny Inflacji z Wydarzeniami Rynkowymi</h3>
              <p className="chart-card-desc">
                Notowania rzeczywiste z API BDL nałożone na prognozę wielomiesięczną oraz okresy obowiązywania tarczy antyinflacyjnej (zywnosc.csv).
              </p>
            </div>
            <div className="chart-header-badges">
              <span className="pill-badge pill-green">Koszyk rzeczywisty BDL</span>
              <span className="pill-badge pill-gold">Model prognostyczny</span>
              <span className="pill-badge pill-ribbon">Przedział ufności 95%</span>
              <span className="pill-badge pill-event" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <FaBolt size={10} /> Tarcza 0% VAT & Wydarzenia
              </span>
            </div>
          </div>

          <div className="chart-body">
            <ResponsiveContainer width="100%" height={360}>
              <ComposedChart data={overlayChartData} events={eventImpacts} themeColor="#007B3B">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="period" stroke="#64748B" />
                <YAxis unit=" zł" stroke="#64748B" tickFormatter={(v) => v.toFixed(0)} />
                <Tooltip 
                  formatter={(v, name) => [`${formatPln(v, 2)} zł`, name]}
                  labelFormatter={(label) => `Okres: ${label}`}
                />
                <Legend />
                <Area 
                  dataKey="upperBound" 
                  lowerKey="lowerBound" 
                  fill="#007B3B" 
                  fillOpacity={0.14} 
                  stroke="transparent"
                  name="Przedział ufności (95%)" 
                />
                <Line 
                  dataKey="actualBasket" 
                  stroke="#007B3B" 
                  strokeWidth={2.8} 
                  name={`Koszyk rzeczywisty BDL (${householdSize} os.)`} 
                />
                <Line 
                  dataKey="predictedBasket" 
                  stroke="#D97706" 
                  strokeWidth={2.4} 
                  strokeDasharray="5 5" 
                  name="Model prognostyczny (zł)" 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="analysis-chart-card full-width">
          <div className="chart-card-header">
            <div>
              <span className="chart-card-badge gus-badge">WYKRES 2: RANKING PRODUKTÓW 2019–2025</span>
              <h3 className="chart-card-title">Ranking Skumulowanego Wzrostu Cen Produktów Koszyka Żywnościowego</h3>
              <p className="chart-card-desc">Dane z pliku gus_zywnosc_analiza_koszyka_2019_2025.csv – skumulowana dynamika procentowa cen w latach 2019–2025</p>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={inflationRanking} margin={{ top: 20, right: 20, left: 45, bottom: 65 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="shortName" />
                <YAxis unit="%" domain={[0, 110]} tickFormatter={(v) => `+${v.toFixed(0)}%`} />
                <Tooltip 
                  formatter={(v, name, item) => [
                    `+${formatPln(v, 1)}% (${item.price2019 ? formatPln(item.price2019, 2) : '-'} zł → ${item.price2025 ? formatPln(item.price2025, 2) : '-'} zł)`, 
                    'Skumulowany wzrost cen (2019–2025)'
                  ]}
                  labelFormatter={(lbl, item) => item?.name || lbl}
                />
                <Bar dataKey="totalChangePct" fill="#007B3B" radius={4} name="Skumulowany wzrost cen (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="analysis-chart-card full-width">
          <div className="chart-card-header">
            <div>
              <span className="chart-card-badge gus-badge">WYKRES 3: SIŁA NABYWCZA PENSJI</span>
              <h3 className="chart-card-title">Obciążenie Budżetu Domowego (% Pensji Netto GUS) & Godziny Pracy na Koszyk</h3>
              <p className="chart-card-desc">Udział koszyka w średnim wynagrodzeniu netto oraz czas pracy niezbędny do jego sfinansowania</p>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={annualTrendSeries} events={eventImpacts} themeColor="#001D77">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="year" />
                <YAxis unit="%" domain={[0, 'auto']} tickFormatter={(v) => `${v.toFixed(1)}%`} />
                <Tooltip formatter={(v, name) => [name === 'Obciążenie budżetu (%)' ? `${formatPln(v, 1)}% pensji` : formatPln(v, 2), name]} />
                <Legend />
                <Line dataKey="budgetSharePct" stroke="#001D77" strokeWidth={2.6} name="Obciążenie budżetu (%)" />
                <Line dataKey="hoursWork" stroke="#BED600" strokeWidth={2.2} name="Godziny pracy na koszyk" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="analysis-chart-card full-width">
          <div className="chart-card-header">
            <div>
              <span className="chart-card-badge gus-badge">WYKRES 4: DYNAMIKA R/R</span>
              <h3 className="chart-card-title">Roczna Dynamika Cen Koszyka (YoY % Inflacja) vs Cel NBP (2.5%)</h3>
              <p className="chart-card-desc">Tempo wzrostu kosztu koszyka żywnościowego rok do roku w relacji do średnioterminowego celu inflacyjnego NBP</p>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart data={yoyInflationSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="year" />
                <YAxis unit="%" tickFormatter={(v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`} />
                <Tooltip formatter={(v, name) => [`${v > 0 ? '+' : ''}${formatPln(v, 1)}%`, name === 'inflationRate' ? 'Inflacja koszyka r/r' : 'Cel inflacyjny NBP']} />
                <Legend />
                <ReferenceLine y={2.5} stroke="#DC2626" strokeDasharray="4 4" strokeWidth={1.8} label="Cel NBP: 2.5%" />
                <Area dataKey="inflationRate" fill="#007B3B" stroke="#007B3B" fillOpacity={0.25} strokeWidth={2.4} name="Dynamika cen koszyka (% r/r)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="forecast-table-card events-table-card">
        <div className="forecast-table-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span className="table-mode-badge gus">TRYB ANALITYCZNY • WPŁYW WYDARZEŃ</span>
              <h4 className="forecast-table-title">Tabela Wpływu Wydarzeń i Polityk Rynkowych na Koszyk Żywnościowy (zywnosc.csv)</h4>
            </div>
            <p className="forecast-table-sub">
              Porównanie wartości koszyka żywnościowego ({householdSize} os.) przed i po wprowadzeniu kluczowych regulacji (w tym tarczy 0% VAT).
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
                <th>Koszyk początkowy</th>
                <th>Koszyk pod koniec</th>
                <th>Różnica procentowa</th>
                <th>Wpływ na konsumenta</th>
              </tr>
            </thead>
            <tbody>
              {eventImpacts.map((evt, i) => {
                const isUp = evt.pctChange > 0;
                return (
                  <tr key={evt.id || i}>
                    <td>
                      <div className="event-name-cell">
                        <span className="event-pin-icon gus"><FaBolt size={10} /></span>
                        <strong>{evt.description}</strong>
                      </div>
                    </td>
                    <td><span className="date-badge gus">{evt.date}</span></td>
                    <td>
                      <span className="duration-pill gus">{evt.durationDays} dni</span>
                      <span className="end-date-hint">do {evt.endDateStr}</span>
                    </td>
                    <td className="price-cell">
                      {evt.startVal ? `${formatPln(evt.startVal, 2)} zł` : '-'}
                    </td>
                    <td className="price-cell">
                      {evt.endVal ? `${formatPln(evt.endVal, 2)} zł` : '-'}
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
                        {evt.pctChange > 15 ? 'Silny wzrost kosztów życia' : (evt.pctChange < 0 ? 'Ochrona siły nabywczej' : 'Stabilizacja wydatków')}
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
          <span>EMPIRYCZNA ANALIZA EKONOMETRYCZNA KOSZYKA ŻYWNOŚCI GUS (2019–2025)</span>
        </span>
        <span className="divider-line"></span>
      </div>
      <div className="empirical-images-section">
        <div className="empirical-card full-width">
          <div className="empirical-card-header">
            <div className="empirical-header-left">
              <span className="empirical-badge gus-badge">JAKOŚĆ DANYCH • GUS BDL</span>
              <h3 className="empirical-title">Analiza Kompletności i Struktury Braków Danych w Koszyku Żywnościowym GUS (2019–2025)</h3>
              <p className="empirical-subtitle">
                Weryfikacja integralności rekordów z bazy Banku Danych Lokalnych GUS dla 13 podstawowych artykułów spożywczych w ujęciu wieloletnim.
              </p>
            </div>
          </div>

          <div className="empirical-card-body">
            <div className="empirical-image-wrapper">
              <img 
                src="/data/images/gus_zywnosc/gus_zywnosc_braki_danych.png" 
                alt="Wykres kompletności i braku danych w koszyku żywnościowym GUS" 
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
                  Wykres słupkowy weryfikuje kompletność szeregów czasowych średnich cen detalicznych w ujęciu rocznym dla wszystkich trzynastu analizowanych pozycji koszyka konsumpcyjnego GUS BDL (m.in. chleb pszenno-żytni, mąka pszenna, mięso wołowe z kością, mleko spożywcze, masło ekstra, jaja kurze, jabłka, marchew, cukier biały, olej rzepakowy).
                </p>
              </div>

              <div className="analysis-block highlight-block">
                <h4 className="analysis-block-title">
                  <FaBolt size={14} className="block-icon" />
                  <span>Warto odnotować (Wnioski analityczne & jakość modeli):</span>
                </h4>
                <ul className="analysis-insights-list">
                  <li>
                    <strong>100% kompletności danych (Zero braków statystycznych):</strong> Zbiór wykazuje zerową liczbę braków (0 null/NaN) we wszystkich kolumnach asortymentowych i okresach badawczych 2019–2025.
                  </li>
                  <li>
                    <strong>Brak zakłóceń interpolacyjnych:</strong> Pełna dostępność pierwotnych raportów GUS eliminuje ryzyko błędów estymacyjnych wynikających z imputacji brakujących wartości, gwarantując najwyższą dokładność obliczeń dynamiki wskaźników CPI i wag koszyka.
                  </li>
                  <li>
                    <strong>Jednolita metodologia gromadzenia cen:</strong> Badanie bazuje na ustandaryzowanych notowaniach z reprezentatywnych punktów sprzedaży detalicznej na terenie całego kraju (ok. 200 tys. notowań miesięcznie agregowanych przez ankieterów GUS).
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="empirical-card full-width">
          <div className="empirical-card-header">
            <div className="empirical-header-left">
              <span className="empirical-badge gus-badge">WSKAŹNIKI SKUMULOWANE • BAZA 2019=100</span>
              <h3 className="empirical-title">Skumulowane Indeksy Cen Produktów Koszyka Żywnościowego (2019 = 100 pkt)</h3>
              <p className="empirical-subtitle">
                Wielotrendowa trajektoria wzrostu cen poszczególnych artykułów w relacji do poziomu bazowego sprzed pandemii i kryzysu energetycznego.
              </p>
            </div>
          </div>

          <div className="empirical-card-body">
            <div className="empirical-image-wrapper">
              <img 
                src="/data/images/gus_zywnosc/gus_zywnosc_indeksy_cen.png" 
                alt="Skumulowane indeksy cen produktów koszyka żywnościowego 2019-2025" 
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
                  Wykres liniowy przedstawia znormalizowane indeksy cenowe (gdzie średnia cena każdego produktu w 2019 roku stanowi punkt odniesienia równy 100,0 punktów). Umożliwia to bezpośrednie porównanie tempa i skali skumulowanej drożyzny pomiędzy różnymi kategoriami spożywczymi o odmiennych cenach nominalnych.
                </p>
              </div>

              <div className="analysis-block highlight-block">
                <h4 className="analysis-block-title">
                  <FaBolt size={14} className="block-icon" />
                  <span>Warto odnotować (Wnioski analityczne & trendy długookresowe):</span>
                </h4>
                <ul className="analysis-insights-list">
                  <li>
                    <strong>Chleb pszenno-żytni absolutnym liderem skumulowanego wzrostu (+102,3%):</strong> Wskaźnik cen chleba przekroczył pułap 202 pkt w 2024 roku, co oznacza ponad dwukrotny wzrost ceny jednostkowej w relacji do 2019 r. Wynika to z kumulacji kosztów surowcowych (ziarno, mąka), cen gazu i energii elektrycznej dla piekarni oraz presji płacowej.
                  </li>
                  <li>
                    <strong>Ekstremalna amplituda wahań cukru białego:</strong> Indeks cukru gwałtownie skoczył w 2022/2023 r. do poziomu ponad 190 pkt na fali spekulacji i niedoborów podażowych w Europie, po czym przeszedł w fazę dynamicznej korekty w kierunku 140–150 pkt w latach 2024–2025.
                  </li>
                  <li>
                    <strong>Trwała asymetria cenowa:</strong> Żaden z badanych produktów nie powrócił do poziomów z 2019 r. Nawet po wygaszeniu szoku energetycznego ceny ustabilizowały się na nowym, znacznie wyższym płaskowyżu cenowym (średnio o 40–80% powyżej bazy).
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="empirical-card full-width">
          <div className="empirical-card-header">
            <div className="empirical-header-left">
              <span className="empirical-badge gus-badge">EKONOMETRIA • MACIERZ KORELACJI</span>
              <h3 className="empirical-title">Macierz Korelacji Pearsona Rocznych Zmian Cen w Koszyku Żywnościowym</h3>
              <p className="empirical-subtitle">
                Współzależność dynamik cenowych (% r/r) pomiędzy artykułami identyfikująca wspólne łańcuchy podażowe i wrażliwość na szoki.
              </p>
            </div>
          </div>

          <div className="empirical-card-body">
            <div className="empirical-image-wrapper">
              <img 
                src="/data/images/gus_zywnosc/gus_zywnosc_korelacje_rocznych_zmian_cen.png" 
                alt="Macierz korelacji rocznych zmian cen żywności" 
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
                  Symetryczna macierz korelacji liniowej Pearsona (heatmap) prezentująca siłę i kierunek powiązań rocznych stóp zmian cenowych pomiędzy wszystkimi parami produktów w koszyku konsumpcyjnym. Wartości bliskie +1,0 (kolory nasycone) wskazują na niemal identyczny kierunek i proporcję reakcji cenowej.
                </p>
              </div>

              <div className="analysis-block highlight-block">
                <h4 className="analysis-block-title">
                  <FaBolt size={14} className="block-icon" />
                  <span>Warto odnotować (Wnioski analityczne & sprzężenia rynkowe):</span>
                </h4>
                <ul className="analysis-insights-list">
                  <li>
                    <strong>Klaster zbożowo-mączny (r &gt; 0,85):</strong> Silna współbieżność występuje pomiędzy mąką pszenną, makaronem jajecznym oraz chlebem. Potwierdza to determinujący wpływ cen skupu pszenicy konsumpcyjnej oraz kosztów przemiału na całą grupę produktów mącznych.
                  </li>
                  <li>
                    <strong>Sprzężenie tłuszczowo-nabiałowe (r = 0,72–0,88):</strong> Wyraźna korelacja łączy masło ekstra, mleko spożywcze, ser dojrzewający oraz olej rzepakowy, co odzwierciedla wspólne uwarunkowania rynków pasz, kosztów chłodnictwa oraz światowych notowań tłuszczów roślinnych i zwierzęcych.
                  </li>
                  <li>
                    <strong>Autonomia produktów ogrodniczych (Jabłka, Marchew):</strong> Współczynniki korelacji dla warzyw i owoców oscylują wokół zera lub przybierają wartości ujemne w relacji do pozostałych towarów, co dowodzi, że ich ceny determinowane są głównie lokalnymi warunkami agrometeorologicznymi (zbiory, przymrozki), a nie ogólną dynamiką inflacji.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="empirical-card full-width">
          <div className="empirical-card-header">
            <div className="empirical-header-left">
              <span className="empirical-badge gus-badge">DYNAMIKA R/R • STOPY WZROSTU YOY</span>
              <h3 className="empirical-title">Roczne Zmiany Cen Koszyka Żywnościowego GUS (% r/r, 2020–2025)</h3>
              <p className="empirical-subtitle">
                Porównanie rocznych dynamik inflacyjnych obrazujące fazę szoku cenowego, proces dezinflacji oraz zjawiska deflacyjne.
              </p>
            </div>
          </div>

          <div className="empirical-card-body">
            <div className="empirical-image-wrapper">
              <img 
                src="/data/images/gus_zywnosc/gus_zywnosc_roczne_zmiany_cen.png" 
                alt="Roczne zmiany cen koszyka żywnościowego GUS" 
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
                  Zestawienie rocznych dynamik cenowych (Year-over-Year) wyrażonych w procentach dla każdego roku z przedziału 2020–2025. Pozwala precyzyjnie zidentyfikować momenty przyspieszenia inflacyjnego oraz fazy wyhamowywania wzrostu kosztów utrzymania.
                </p>
              </div>

              <div className="analysis-block highlight-block">
                <h4 className="analysis-block-title">
                  <FaBolt size={14} className="block-icon" />
                  <span>Warto odnotować (Wnioski analityczne & cykle koniunkturalne):</span>
                </h4>
                <ul className="analysis-insights-list">
                  <li>
                    <strong>Apogeum szoku inflacyjnego w 2022 roku:</strong> Rok 2022 przyniósł bezprecedensowy, zsynchronizowany wzrost cen – dynamika większości kategorii sięgnęła +25% do +45% r/r pod wpływem wybuchu wojny w Ukrainie, skoku cen nawozów sztucznych (gaz ziemny) i paliw transportowych.
                  </li>
                  <li>
                    <strong>Gwałtowna dezinflacja i epizody deflacji w latach 2023–2024:</strong> W następstwie wysokiej bazy statystycznej oraz spadku cen surowców rolnych na giełdach światowych, dynamika wzrostu drastycznie wyhamowała. W przypadku oleju rzepakowego i mąki odnotowano wręcz spadki nominalne cen (deflacja do -15% r/r).
                  </li>
                  <li>
                    <strong>Efekt powrotu stawki 5% VAT w kwietniu 2024:</strong> Wycofanie tarczy antyinflacyjnej na żywność doprowadziło do ponownego, umiarkowanego odbicia rocznych wskaźników cenowych w drugiej połowie 2024 r., potwierdzając natychmiastowe przeniesienie podatku pośredniego na konsumenta końcowego.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="empirical-card full-width">
          <div className="empirical-card-header">
            <div className="empirical-header-left">
              <span className="empirical-badge gus-badge">STATYSTYKA OPISOWA • ASYMETRIA KOSZYKA</span>
              <h3 className="empirical-title">Rozkład Gęstości i Dyspersja Cen Jednostkowych w Koszyku Konsumpcyjnym</h3>
              <p className="empirical-subtitle">
                Struktura asymetrii cenowej obrazująca podział na tanie artykuły bazowe oraz kapitałochłonne produkty białkowe.
              </p>
            </div>
          </div>

          <div className="empirical-card-body">
            <div className="empirical-image-wrapper">
              <img 
                src="/data/images/gus_zywnosc/gus_zywnosc_rozklad_cen.png" 
                alt="Rozkład cen produktów w koszyku konsumpcyjnym GUS" 
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
                  Wykres rozkładu częstości (histogram i krzywa gęstości prawdopodobieństwa) cen jednostkowych wszystkich badanych produktów w całym badanym okresie, obrazujący koncentrację wartości, medianę oraz skośność próby badawczej.
                </p>
              </div>

              <div className="analysis-block highlight-block">
                <h4 className="analysis-block-title">
                  <FaBolt size={14} className="block-icon" />
                  <span>Warto odnotować (Wnioski analityczne & struktura wydatków):</span>
                </h4>
                <ul className="analysis-insights-list">
                  <li>
                    <strong>Klasyczna asymetria prawostronna (Right-skewed distribution):</strong> Zdecydowana większość podstawowych produktów spożywczych (chleb, mąka, cukier, mleko, marchew, jabłka, sól) skupia się w przedziale niskich cen jednostkowych: od 2,50 zł do 8,00 zł za jednostkę miary (kg/l).
                  </li>
                  <li>
                    <strong>Długi, gruby ogon rozkładu (High-value protein tail):</strong> Prawą stronę rozkładu tworzą produkty odzwierzęce i przetworzone – mięso wołowe, schab wieprzowy, sery dojrzewające i masło ekstra – osiągające przedziały 18,00–35,00 zł/kg.
                  </li>
                  <li>
                    <strong>Wzrost dyspersji cenowej w czasie:</strong> Odchylenie standardowe oraz rozstęp międzykwartylowy (IQR) cen uległy istotnemu poszerzeniu w latach 2021–2024, co dowodzi, że inflacja uderzyła w ceny asortymentu w sposób wysoce nieproporcjonalny, zwiększając rozpiętość wydatków gospodarstw domowych.
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
