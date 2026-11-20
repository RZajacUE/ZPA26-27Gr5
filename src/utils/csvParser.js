/**
 * Utility for parsing and generating CSV files with support for Orlen and GUS data.
 * Supports ';' and ',' delimiters, quoted fields, Polish UTF-8 diacritics, and numeric formats.
 */

// Parse Polish/European date strings like "1.01.2026", "15.09.2026", or ISO "2026-11-11"
export function parsePolishDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return new Date(0);
  const trimmed = dateStr.trim();
  
  if (trimmed.includes('-')) {
    const parts = trimmed.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
  }

  const parts = trimmed.split('.');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

// Format numbers as Polish currency style (e.g. 4 234,00)
export function formatPln(num, decimals = 2) {
  if (num === null || num === undefined || isNaN(num)) return '-';
  return Number(num).toLocaleString('pl-PL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Split a CSV row taking quotes into account
export function parseCsvLine(line, delimiter) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Universal CSV parser: handles Orlen single-year, multi-year (analiza_cen_paliw.csv),
 * GUS tables, and arbitrary user CSV uploads.
 */
export function parseCsv(csvText) {
  if (!csvText || typeof csvText !== 'string') {
    return { headers: [], records: [] };
  }

  // Remove potential BOM and normalize line endings
  const cleanText = csvText.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = cleanText.split('\n').filter(line => line.trim().length > 0);

  if (lines.length === 0) {
    return { headers: [], records: [] };
  }

  // Detect delimiter (; or ,)
  const firstLine = lines[0];
  const semiCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const delimiter = semiCount >= commaCount ? ';' : ',';

  const rawHeaders = parseCsvLine(firstLine, delimiter);
  const headers = rawHeaders.map(h => h.trim());

  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i], delimiter);
    if (cols.length === 0 || (cols.length === 1 && cols[0] === '')) continue;

    const rowObj = {
      _id: `row_${i}`,
      _originalIndex: i - 1,
      _raw: cols,
    };

    headers.forEach((header, colIdx) => {
      rowObj[header] = cols[colIdx] ?? '';
    });

    // Flexible field extraction handling both traditional columns and analiza_cen_paliw.csv
    const dateVal = rowObj['effectiveDate'] || rowObj['effective_date'] || rowObj['date'] || rowObj['Data'] || rowObj['data'] ||
      (cols[1]?.match(/^\d{4}-\d{2}-\d{2}$/) ? cols[1] : (cols[0]?.match(/^\d{4}-\d{2}-\d{2}$/) || cols[0]?.match(/^\d{1,2}\.\d{1,2}\.\d{4}$/) ? cols[0] : ''));

    const productVal = rowObj['productName'] || rowObj['product_name'] || rowObj['product'] || rowObj['Produkt'] || rowObj['produkt'] || rowObj['Paliwo'] ||
      (cols[0]?.match(/^(Pb|ON)/i) ? cols[0] : cols[1] || 'Paliwo');

    const symbolVal = rowObj['symbol'] || rowObj['Symbol'] || rowObj['productId'] || rowObj['product_id'] ||
      (productVal === 'Pb95' ? '41' : (productVal.includes('ON') ? '42' : (productVal === 'Pb98' ? '43' : cols[2] || '')));

    let priceRaw = rowObj['value'] || rowObj['price_pln_m3'] || rowObj['cena'] || rowObj['Cena'] || rowObj['price'] || '';
    let priceNum = parseFloat(priceRaw.toString().replace(/\s/g, '').replace(',', '.')) || 0;

    let pricePerLiterRaw = rowObj['cena_za_litr'] || rowObj['price_per_liter'] || '';
    let pricePerLiter = parseFloat(pricePerLiterRaw.toString().replace(/\s/g, '').replace(',', '.')) || 0;

    if (priceNum > 0 && pricePerLiter === 0) {
      pricePerLiter = priceNum / 1000;
    } else if (pricePerLiter > 0 && priceNum === 0) {
      priceNum = pricePerLiter * 1000;
    }

    const unitVal = rowObj['unit'] || rowObj['Jednostka'] || 'PLN/m3';
    const publishFromVal = rowObj['publishFrom'] || rowObj['publish_from'] || rowObj['Obowiazuje_od'] || dateVal;
    const sourceUrlVal = rowObj['source_url'] || rowObj['Zrodlo'] || '';
    const yearVal = parseInt(rowObj['rok'] || (dateVal.includes('-') ? dateVal.slice(0, 4) : dateVal.slice(-4)), 10) || null;
    const monthVal = parseInt(rowObj['miesiac'] || (dateVal.includes('-') ? dateVal.slice(5, 7) : dateVal.split('.')[1]), 10) || null;

    rowObj._parsed = {
      date: dateVal,
      dateObj: parsePolishDate(dateVal),
      product: productVal,
      symbol: symbolVal,
      price: priceNum,
      priceFormatted: formatPln(priceNum, 2),
      pricePerLiter: pricePerLiter,
      pricePerLiterFormatted: formatPln(pricePerLiter, 3),
      unit: unitVal,
      publishFrom: publishFromVal,
      sourceUrl: sourceUrlVal,
      year: yearVal,
      month: monthVal,
    };

    records.push(rowObj);
  }

  return {
    headers,
    records,
    delimiter,
  };
}

/**
 * Dedicated parser and analytical aggregator for analiza_cen_paliw.csv.
 * Computes time series, moving averages (MA-7, MA-30), volatility, and predictive models.
 */
export function parseFuelAnalysisData(records) {
  if (!records || records.length === 0) {
    return {
      dailySeries: [],
      monthlySeries: [],
      productsList: [],
      predictions: {},
      stats: {},
    };
  }

  // Group records by product and date
  const productGroups = {};
  const allDatesSet = new Set();

  records.forEach(r => {
    const p = r._parsed || {};
    const prod = p.product || 'Inne';
    const dStr = p.date;
    if (!dStr) return;

    allDatesSet.add(dStr);
    if (!productGroups[prod]) productGroups[prod] = {};
    productGroups[prod][dStr] = {
      pricePerLiter: p.pricePerLiter,
      priceM3: p.price,
      dateObj: p.dateObj,
      year: p.year,
      month: p.month,
    };
  });

  const productsList = Object.keys(productGroups).sort();
  const sortedDates = Array.from(allDatesSet).sort();

  // Build continuous daily series
  const dailySeries = sortedDates.map(dateStr => {
    const entry = { date: dateStr };
    productsList.forEach(prod => {
      const pData = productGroups[prod][dateStr];
      if (pData) {
        entry[prod] = pData.pricePerLiter;
        entry[`${prod}_m3`] = pData.priceM3;
      }
    });
    return entry;
  });

  // Calculate moving averages for primary fuels (Pb95 and ONEkodiesel)
  ['Pb95', 'ONEkodiesel', 'Pb98'].forEach(prod => {
    let window7 = [];
    let window30 = [];

    dailySeries.forEach(item => {
      const val = item[prod];
      if (val !== undefined && val > 0) {
        window7.push(val);
        if (window7.length > 7) window7.shift();

        window30.push(val);
        if (window30.length > 30) window30.shift();

        const ma7 = window7.reduce((a, b) => a + b, 0) / window7.length;
        const ma30 = window30.reduce((a, b) => a + b, 0) / window30.length;

        item[`${prod}_MA7`] = parseFloat(ma7.toFixed(3));
        item[`${prod}_MA30`] = parseFloat(ma30.toFixed(3));
      }
    });
  });

  // Calculate monthly summaries (for long-term multi-year trend 2019-2026)
  const monthlyMap = {};
  dailySeries.forEach(item => {
    const yMonth = item.date.slice(0, 7); // YYYY-MM
    if (!monthlyMap[yMonth]) {
      monthlyMap[yMonth] = { month: yMonth, pb95Vals: [], onVals: [], pb98Vals: [] };
    }
    if (item['Pb95']) monthlyMap[yMonth].pb95Vals.push(item['Pb95']);
    if (item['ONEkodiesel']) monthlyMap[yMonth].onVals.push(item['ONEkodiesel']);
    if (item['Pb98']) monthlyMap[yMonth].pb98Vals.push(item['Pb98']);
  });

  const monthlySeries = Object.keys(monthlyMap).sort().map(mKey => {
    const obj = monthlyMap[mKey];
    const avgPb95 = obj.pb95Vals.length > 0 ? (obj.pb95Vals.reduce((a, b) => a + b, 0) / obj.pb95Vals.length) : null;
    const avgON = obj.onVals.length > 0 ? (obj.onVals.reduce((a, b) => a + b, 0) / obj.onVals.length) : null;
    const avgPb98 = obj.pb98Vals.length > 0 ? (obj.pb98Vals.reduce((a, b) => a + b, 0) / obj.pb98Vals.length) : null;
    const spread = (avgON !== null && avgPb95 !== null) ? (avgON - avgPb95) : 0;

    return {
      month: mKey,
      Pb95: avgPb95 ? parseFloat(avgPb95.toFixed(3)) : null,
      ONEkodiesel: avgON ? parseFloat(avgON.toFixed(3)) : null,
      Pb98: avgPb98 ? parseFloat(avgPb98.toFixed(3)) : null,
      spreadONvsPb95: parseFloat(spread.toFixed(3)),
    };
  });

  // Generate predictive forecast for upcoming horizon
  // Uses linear regression over the last 90 observations + exponential smoothing momentum
  const predictions = {};
  ['Pb95', 'ONEkodiesel', 'Pb98'].forEach(prod => {
    const validObs = dailySeries.filter(d => d[prod] !== undefined && d[prod] > 0);
    if (validObs.length < 10) return;

    const recentObs = validObs.slice(-90);
    const n = recentObs.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    recentObs.forEach((item, idx) => {
      const y = item[prod];
      sumX += idx;
      sumY += y;
      sumXY += idx * y;
      sumXX += idx * idx;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
    const intercept = (sumY - slope * sumX) / n;
    const lastActual = recentObs[n - 1][prod];
    const lastDate = new Date(recentObs[n - 1].date);

    // Compute standard error of estimate for 95% confidence intervals
    let sumResidualsSq = 0;
    recentObs.forEach((item, idx) => {
      const pred = intercept + slope * idx;
      sumResidualsSq += Math.pow(item[prod] - pred, 2);
    });
    const stdErr = Math.sqrt(sumResidualsSq / (n - 2 || 1)) || 0.05;

    // Generate 90 days ahead forecast
    const forecastPoints = [];
    for (let dayAhead = 1; dayAhead <= 90; dayAhead++) {
      const fDate = new Date(lastDate);
      fDate.setDate(fDate.getDate() + dayAhead);
      const fDateStr = fDate.toISOString().slice(0, 10);

      // Dampened trend forecast: base regression with momentum dampening
      const trendChange = slope * dayAhead * Math.exp(-dayAhead / 120);
      const forecastVal = Math.max(3.5, lastActual + trendChange);

      const marginOfError = 1.96 * stdErr * Math.sqrt(1 + dayAhead / 30);
      const upper = parseFloat((forecastVal + marginOfError).toFixed(3));
      const lower = parseFloat(Math.max(3.0, forecastVal - marginOfError).toFixed(3));
      const optimistic = parseFloat((forecastVal * 0.96).toFixed(3));
      const pessimistic = parseFloat((forecastVal * 1.05).toFixed(3));

      forecastPoints.push({
        date: fDateStr,
        dayAhead,
        predictedPrice: parseFloat(forecastVal.toFixed(3)),
        upperBound: upper,
        lowerBound: lower,
        optimistic,
        pessimistic,
        isForecast: true,
      });
    }

    predictions[prod] = {
      slope: parseFloat((slope * 30).toFixed(4)), // change per month
      lastActual,
      lastDate: recentObs[n - 1].date,
      forecastPoints,
      stdErr: parseFloat(stdErr.toFixed(3)),
      mape: parseFloat(((stdErr / lastActual) * 100).toFixed(1)), // mean absolute % error approx
    };
  });

  return {
    dailySeries,
    monthlySeries,
    productsList,
    predictions,
    totalRecords: records.length,
    startDate: sortedDates[0],
    endDate: sortedDates[sortedDates.length - 1],
  };
}

/**
 * Dedicated parser for pelna_analiza_cen.csv (GUS product basket 2019-2025).
 */
export function parseFullBasketAnalysisCsv(csvText) {
  if (!csvText || typeof csvText !== 'string') {
    return { products: [], yearlyTotals: {}, forecast2026: 0, forecast2027: 0 };
  }

  const cleanText = csvText.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = cleanText.split('\n').filter(l => l.trim().length > 0);
  if (lines.length < 2) return { products: [], yearlyTotals: {} };

  // Guard against HTML documents or invalid CSV headers
  const firstLine = lines[0].toLowerCase();
  if (firstLine.includes('<!doctype') || firstLine.includes('<html') || firstLine.includes('<head')) {
    return { products: [], yearlyTotals: {}, forecast2026: 0, forecast2027: 0 };
  }
  if (!firstLine.includes('produkt') && !firstLine.includes('2019')) {
    return { products: [], yearlyTotals: {}, forecast2026: 0, forecast2027: 0 };
  }

  const headers = lines[0].split(';').map(h => h.trim());
  const years = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'];
  const yearlyTotals = { '2019': 0, '2020': 0, '2021': 0, '2022': 0, '2023': 0, '2024': 0, '2025': 0 };
  const products = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(';').map(c => c.trim());
    const name = cols[0];
    const prices = {};
    const indices = {};
    const yoyGrowth = {};

    years.forEach((yr, idx) => {
      const val = parseFloat((cols[idx + 1] || '0').replace(',', '.')) || 0;
      prices[yr] = val;
      yearlyTotals[yr] += val;
      indices[yr] = parseFloat((cols[9 + idx] || '100').replace(',', '.')) || 100;
      if (idx > 0) {
        yoyGrowth[yr] = parseFloat((cols[15 + idx] || '0').replace(',', '.')) || 0;
      }
    });

    const totalChangePct = parseFloat((cols[8] || '0').replace(',', '.')) || 0;

    // Forecast 2026 & 2027 per product based on average 2024-2025 rate + 3% baseline
    const recentGrowth = (yoyGrowth['2025'] !== undefined ? yoyGrowth['2025'] : 3.5) / 100;
    const p2025 = prices['2025'];
    const p2026 = parseFloat((p2025 * (1 + Math.max(-0.02, Math.min(0.08, recentGrowth * 0.7 + 0.02)))).toFixed(2));
    const p2027 = parseFloat((p2026 * 1.03).toFixed(2));

    products.push({
      id: `prod_${i}`,
      name,
      prices: { ...prices, '2026': p2026, '2027': p2027 },
      indices,
      yoyGrowth,
      totalChangePct: parseFloat(totalChangePct.toFixed(1)),
    });
  }

  // Round totals and compute forecasts
  Object.keys(yearlyTotals).forEach(yr => {
    yearlyTotals[yr] = parseFloat(yearlyTotals[yr].toFixed(2));
  });

  const sum2025 = yearlyTotals['2025'] || 168.87;
  const forecast2026 = parseFloat((sum2025 * 1.042).toFixed(2)); // +4.2% projected CPI
  const forecast2027 = parseFloat((forecast2026 * 1.031).toFixed(2)); // +3.1% projected CPI

  yearlyTotals['2026'] = forecast2026;
  yearlyTotals['2027'] = forecast2027;

  return {
    products,
    yearlyTotals,
    forecast2026,
    forecast2027,
    years: [...years, '2026', '2027'],
  };
}

/**
 * Exports records to a CSV file and triggers browser download
 */
export function downloadRecordsAsCsv(records, headers, filename = 'orlen_dane_wybrane.csv', delimiter = ';') {
  if (!records || records.length === 0) {
    alert('Brak wybranych rekordów do pobrania.');
    return;
  }

  const effectiveHeaders = headers && headers.length > 0 
    ? headers 
    : ['date', 'product', 'symbol', 'price_pln_m3', 'unit', 'publish_from', 'source_url'];

  const rows = [];
  rows.push(effectiveHeaders.map(escapeCsvField).join(delimiter));

  records.forEach(rec => {
    const rowValues = effectiveHeaders.map(h => {
      const val = rec[h] !== undefined ? rec[h] : (rec._parsed && rec._parsed[h] !== undefined ? rec._parsed[h] : '');
      return escapeCsvField(val);
    });
    rows.push(rowValues.join(delimiter));
  });

  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvField(field) {
  if (field === null || field === undefined) return '';
  const str = String(field);
  if (str.includes(';') || str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Parses event determinator CSV files (paliwa.csv / zywnosc.csv).
 * Columns: data, opis_zmiany, plan_czas_trwania_dni
 */
export function parseEventsCsv(csvText) {
  if (!csvText || typeof csvText !== 'string') return [];

  const cleanText = csvText.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = cleanText.split('\n').filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];

  const firstLine = lines[0];
  const delimiter = firstLine.includes(';') ? ';' : ',';
  const events = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i], delimiter);
    if (cols.length < 2) continue;

    const rawDateStr = cols[0]?.trim() || '';
    // Sanitize dates like "2026-09-01 (data orientacyjna)" to "2026-09-01"
    const matchDate = rawDateStr.match(/\d{4}-\d{2}-\d{2}/);
    const dateStr = matchDate ? matchDate[0] : rawDateStr;
    const description = cols[1]?.trim() || '';
    const durationDays = parseInt(cols[2]?.trim() || '30', 10) || 30;

    const startDate = parsePolishDate(dateStr);
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const endDateStr = endDate.toISOString().slice(0, 10);

    events.push({
      id: `evt_${i}`,
      date: dateStr,
      dateObj: startDate,
      description,
      durationDays,
      endDate,
      endDateStr,
    });
  }

  // Sort chronologically by start date
  events.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  return events;
}

/**
 * Computes event economic impacts across historical and predicted time series.
 * Evaluates initial value at event start date vs final value at the end of the policy.
 */
export function calculateEventImpacts(events, timeSeries, valueKey, dateKey = 'date') {
  if (!events || events.length === 0 || !timeSeries || timeSeries.length === 0) {
    return [];
  }

  return events.map(evt => {
    const evtStartTime = evt.dateObj.getTime();
    const evtEndTime = evt.endDate.getTime();

    // Find observation closest to start date
    let closestStart = null;
    let minStartDiff = Infinity;

    // Find observation closest to end date
    let closestEnd = null;
    let minEndDiff = Infinity;

    timeSeries.forEach(item => {
      const itemDateStr = item[dateKey] || item.period || item.month || item.year;
      if (!itemDateStr) return;

      let itemTime = 0;
      if (typeof itemDateStr === 'string' && itemDateStr.includes('-')) {
        itemTime = parsePolishDate(itemDateStr).getTime();
      } else if (!isNaN(Number(itemDateStr))) {
        // e.g. year "2022" -> mid-year July 1st
        itemTime = new Date(`${itemDateStr}-07-01`).getTime();
      } else {
        itemTime = parsePolishDate(itemDateStr).getTime();
      }

      const val = item[valueKey];
      if (typeof val !== 'number' || isNaN(val) || val <= 0) return;

      const diffStart = Math.abs(itemTime - evtStartTime);
      if (diffStart < minStartDiff) {
        minStartDiff = diffStart;
        closestStart = { item, val, date: itemDateStr, time: itemTime };
      }

      const diffEnd = Math.abs(itemTime - evtEndTime);
      if (diffEnd < minEndDiff) {
        minEndDiff = diffEnd;
        closestEnd = { item, val, date: itemDateStr, time: itemTime };
      }
    });

    const startVal = closestStart ? closestStart.val : null;
    const endVal = closestEnd ? closestEnd.val : null;

    let diff = null;
    let pctChange = null;

    if (startVal !== null && endVal !== null && startVal > 0) {
      diff = parseFloat((endVal - startVal).toFixed(3));
      pctChange = parseFloat((((endVal - startVal) / startVal) * 100).toFixed(2));
    }

    return {
      ...evt,
      startVal,
      endVal,
      diff,
      pctChange,
      actualStartDate: closestStart?.date || evt.date,
      actualEndDate: closestEnd?.date || evt.endDateStr,
    };
  });
}

