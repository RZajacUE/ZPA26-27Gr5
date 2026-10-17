/**
 * Utility for parsing and generating CSV files with support for Orlen data.
 * Supports both ';' and ',' delimiters, quoted fields, and Polish UTF-8 diacritics.
 */

// Parse Polish/European date strings like "1.01.2026" or "15.09.2026"
export function parsePolishDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return new Date(0);
  const parts = dateStr.trim().split('.');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  const parsed = new Date(dateStr);
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
function parseCsvLine(line, delimiter) {
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
 * Parses raw CSV text into structured records
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

    // Extract common fields specifically for Orlen data
    const dateVal = rowObj['date'] || rowObj['Data'] || cols[0] || '';
    const productVal = rowObj['product'] || rowObj['Produkt'] || cols[1] || '';
    const symbolVal = rowObj['symbol'] || rowObj['Symbol'] || cols[2] || '';
    const priceRaw = rowObj['price_pln_m3'] || rowObj['cena'] || rowObj['Cena'] || cols[3] || '0';
    const unitVal = rowObj['unit'] || rowObj['Jednostka'] || cols[4] || 'PLN/m3';
    const publishFromVal = rowObj['publish_from'] || rowObj['Obowiazuje_od'] || cols[5] || dateVal;
    const sourceUrlVal = rowObj['source_url'] || rowObj['Zrodlo'] || cols[6] || '';

    const priceNum = parseFloat(priceRaw.toString().replace(',', '.')) || 0;
    const pricePerLiter = priceNum > 0 ? (priceNum / 1000) : 0;

    rowObj._parsed = {
      date: dateVal,
      dateObj: parsePolishDate(dateVal),
      product: productVal,
      symbol: symbolVal,
      price: priceNum,
      priceFormatted: formatPln(priceNum, 2),
      pricePerLiter: formatPln(pricePerLiter, 3),
      unit: unitVal,
      publishFrom: publishFromVal,
      sourceUrl: sourceUrlVal,
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
  
  // Header row
  rows.push(effectiveHeaders.map(escapeCsvField).join(delimiter));

  // Data rows
  records.forEach(rec => {
    const rowValues = effectiveHeaders.map(h => {
      const val = rec[h] !== undefined ? rec[h] : (rec._parsed && rec._parsed[h] !== undefined ? rec._parsed[h] : '');
      return escapeCsvField(val);
    });
    rows.push(rowValues.join(delimiter));
  });

  const csvContent = '\uFEFF' + rows.join('\r\n'); // UTF-8 BOM for Excel compatibility
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
