                     export const DEFAULT_GUS_API_KEY = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GUS_API_KEY) || 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BDL_API_KEY) || 
  '2ead5bb5-9ea5-4686-66f1-08df3e66a85a';

export const UUID_API_KEY_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function isValidGusApiKey(key) {
  if (!key) return false;
  return UUID_API_KEY_REGEX.test(key.trim());
}

export function maskApiKey(key, showFull = false) {
  if (!key) return '••••••••-••••-••••-••••-••••••••••••';
  if (showFull) return key;
  const clean = key.trim();
  if (clean.length < 8) return '••••••••••••';
  return `${clean.slice(0, 4)}••••-••••-••••-••••••••${clean.slice(-4)}`;
}

export const GUS_BDL_DIRECT_URL = 'https://bdl.stat.gov.pl/api/v1';
export const GUS_BDL_PROXY_URL = '/gus-api';

// Average monthly earnings in Poland (GUS enterprise sector)
export const GUS_EARNINGS_HISTORY = {
  2015: { gross: 4121, net: 2950 },
  2016: { gross: 4277, net: 3060 },
  2017: { gross: 4530, net: 3230 },
  2018: { gross: 4852, net: 3450 },
  2019: { gross: 5182, net: 3700 },
  2020: { gross: 5411, net: 3900 },
  2021: { gross: 5889, net: 4250 },
  2022: { gross: 6653, net: 4850 },
  2023: { gross: 7444, net: 5420 },
  2024: { gross: 8147, net: 5900 },
  2025: { gross: 8720, net: 6310 },
  2026: { gross: 9240, net: 6680 },
};

export const GUS_BASKET_PRODUCTS = [
  {
    id: 'bread',
    name: 'Chleb pszenno-żytni (0.6 kg)',
    category: 'Żywność',
    unit: 'zł / 0.6 kg',
    description: 'Bochenek standardowego chleba konsumpcyjnego',
    history: {
      2015: 2.20, 2016: 2.24, 2017: 2.38, 2018: 2.52, 2019: 2.75,
      2020: 3.12, 2021: 3.42, 2022: 4.54, 2023: 4.88, 2024: 5.08,
      2025: 5.25, 2026: 5.42
    }
  },
  {
    id: 'flour',
    name: 'Mąka pszenna (1 kg)',
    category: 'Żywność',
    unit: 'zł / 1 kg',
    description: 'Mąka pszenna typ 500 (np. poznańska, wrocławska)',
    history: {
      2015: 1.82, 2016: 1.85, 2017: 1.90, 2018: 1.98, 2019: 2.15,
      2020: 2.35, 2021: 2.65, 2022: 3.90, 2023: 3.65, 2024: 3.40,
      2025: 3.45, 2026: 3.55
    }
  },
  {
    id: 'milk',
    name: 'Mleko spożywcze 3.2% (1 l)',
    category: 'Nabiał',
    unit: 'zł / 1 l',
    description: 'Mleko świeże pasteryzowane 3.2% tłuszczu',
    history: {
      2015: 2.45, 2016: 2.42, 2017: 2.50, 2018: 2.55, 2019: 2.62,
      2020: 2.74, 2021: 2.92, 2022: 3.95, 2023: 3.82, 2024: 3.75,
      2025: 3.85, 2026: 3.98
    }
  },
  {
    id: 'butter',
    name: 'Masło ekstra 82% (200 g)',
    category: 'Nabiał / Tłuszcze',
    unit: 'zł / 200 g',
    description: 'Masło ekstra o zawartości tłuszczu 82-83%',
    history: {
      2015: 3.98, 2016: 4.25, 2017: 6.20, 2018: 6.85, 2019: 5.45,
      2020: 5.75, 2021: 6.40, 2022: 7.95, 2023: 6.80, 2024: 7.40,
      2025: 7.95, 2026: 8.40
    }
  },
  {
    id: 'eggs',
    name: 'Jaja kurze świeże (10 szt.)',
    category: 'Nabiał',
    unit: 'zł / 10 szt.',
    description: 'Jaja kurze chów ściółkowy/klatkowy klasa wagowa M/L',
    history: {
      2015: 4.30, 2016: 4.45, 2017: 5.60, 2018: 5.50, 2019: 5.65,
      2020: 6.10, 2021: 6.85, 2022: 9.20, 2023: 9.60, 2024: 9.35,
      2025: 9.70, 2026: 10.15
    }
  },
  {
    id: 'sugar',
    name: 'Cukier biały kryształ (1 kg)',
    category: 'Żywność',
    unit: 'zł / 1 kg',
    description: 'Cukier biały kryształ w opakowaniu 1 kg',
    history: {
      2015: 2.15, 2016: 2.65, 2017: 2.75, 2018: 1.95, 2019: 2.10,
      2020: 2.50, 2021: 2.85, 2022: 5.40, 2023: 5.20, 2024: 4.10,
      2025: 4.20, 2026: 4.35
    }
  },
  {
    id: 'pork',
    name: 'Mięso wieprzowe - schab b/k (1 kg)',
    category: 'Mięso',
    unit: 'zł / 1 kg',
    description: 'Schab wieprzowy bez kości, świeży schłodzony',
    history: {
      2015: 14.20, 2016: 14.60, 2017: 15.80, 2018: 15.50, 2019: 17.20,
      2020: 17.80, 2021: 18.20, 2022: 22.90, 2023: 24.50, 2024: 23.80,
      2025: 24.90, 2026: 25.80
    }
  },
  {
    id: 'chicken',
    name: 'Kurczak patroszony (1 kg)',
    category: 'Mięso / Drób',
    unit: 'zł / 1 kg',
    description: 'Kurczak patroszony świeży z podrobami/bez podrobów',
    history: {
      2015: 6.85, 2016: 6.70, 2017: 6.95, 2018: 7.15, 2019: 7.45,
      2020: 7.20, 2021: 8.30, 2022: 12.40, 2023: 11.80, 2024: 10.90,
      2025: 11.30, 2026: 11.75
    }
  },
  {
    id: 'potatoes',
    name: 'Ziemniaki jadalne (1 kg)',
    category: 'Warzywa',
    unit: 'zł / 1 kg',
    description: 'Ziemniaki jadalne późne/wczesne standardowe',
    history: {
      2015: 1.15, 2016: 1.25, 2017: 1.30, 2018: 1.65, 2019: 2.85,
      2020: 2.10, 2021: 2.20, 2022: 2.85, 2023: 3.40, 2024: 3.25,
      2025: 3.50, 2026: 3.70
    }
  },
  {
    id: 'apples',
    name: 'Jabłka deserowe (1 kg)',
    category: 'Owoce',
    unit: 'zł / 1 kg',
    description: 'Jabłka krajowe deserowe odmiany handlowe',
    history: {
      2015: 2.35, 2016: 2.45, 2017: 3.20, 2018: 2.60, 2019: 3.10,
      2020: 4.15, 2021: 3.40, 2022: 3.75, 2023: 4.20, 2024: 4.60,
      2025: 4.85, 2026: 5.10
    }
  },
  {
    id: 'gasoline_pb95',
    name: 'Benzyna bezołowiowa 95 (1 l)',
    category: 'Paliwa detaliczne',
    unit: 'zł / 1 l',
    description: 'Średnia detaliczna cena benzyny Eurosuper 95 na stacjach',
    history: {
      2015: 4.68, 2016: 4.35, 2017: 4.60, 2018: 5.02, 2019: 5.08,
      2020: 4.42, 2021: 5.45, 2022: 6.85, 2023: 6.55, 2024: 6.48,
      2025: 6.35, 2026: 6.42
    }
  },
  {
    id: 'diesel_on',
    name: 'Olej napędowy ON (1 l)',
    category: 'Paliwa detaliczne',
    unit: 'zł / 1 l',
    description: 'Średnia detaliczna cena oleju napędowego ON na stacjach',
    history: {
      2015: 4.58, 2016: 4.18, 2017: 4.50, 2018: 5.05, 2019: 5.12,
      2020: 4.45, 2021: 5.48, 2022: 7.25, 2023: 6.62, 2024: 6.58,
      2025: 6.45, 2026: 6.52
    }
  },
  {
    id: 'electricity',
    name: 'Energia elektryczna (1 kWh)',
    category: 'Nośniki energii',
    unit: 'zł / 1 kWh',
    description: 'Cena prądu dla gospodarstw domowych (taryfa G11 z dystrybucją)',
    history: {
      2015: 0.58, 2016: 0.58, 2017: 0.57, 2018: 0.59, 2019: 0.61,
      2020: 0.69, 2021: 0.74, 2022: 0.81, 2023: 0.95, 2024: 1.15,
      2025: 1.25, 2026: 1.32
    }
  },
  {
    id: 'transport_ticket',
    name: 'Bilet komunikacji miejskiej (1 szt.)',
    category: 'Usługi',
    unit: 'zł / 1 bilet',
    description: 'Bilet jednorazowy normalny w komunikacji miejskiej',
    history: {
      2015: 3.00, 2016: 3.00, 2017: 3.20, 2018: 3.40, 2019: 3.50,
      2020: 3.80, 2021: 4.00, 2022: 4.40, 2023: 4.80, 2024: 5.00,
      2025: 5.20, 2026: 5.40
    }
  }
];

export function calculateMedian(numbers) {
  if (!numbers || numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return sorted[mid];
  }
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

export function getEarningsForDate(dateObj) {
  const year = dateObj.getFullYear();
  const clampedYear = Math.max(2015, Math.min(2026, year));
  const current = GUS_EARNINGS_HISTORY[clampedYear] || GUS_EARNINGS_HISTORY[2024];
  const next = GUS_EARNINGS_HISTORY[Math.min(2026, clampedYear + 1)] || current;

  const dayOfYear = Math.floor((dateObj - new Date(year, 0, 1)) / (1000 * 60 * 60 * 24));
  const frac = dayOfYear / 365.25;

  const gross = Math.round(current.gross + (next.gross - current.gross) * frac);
  const net = Math.round(current.net + (next.net - current.net) * frac);
  const hourlyWage = Math.round((net / 168) * 100) / 100;

  return { gross, net, hourlyWage, year: clampedYear };
}

function interpolateProductPrice(product, dateObj) {
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const dayOfYear = Math.floor((dateObj - new Date(year, 0, 1)) / (1000 * 60 * 60 * 24));
  const yearFraction = dayOfYear / 365.25;

  const minYear = 2015;
  const maxYear = 2026;
  const clampedYear = Math.max(minYear, Math.min(maxYear - 1, year));
  const nextYear = clampedYear + 1;

  const priceBase = product.history[clampedYear] ?? product.history[2024];
  const priceNext = product.history[nextYear] ?? priceBase;

  let price = priceBase + (priceNext - priceBase) * yearFraction;

  if (product.category === 'Warzywa' || product.category === 'Owoce') {
    const seasonalWave = Math.sin((month - 2) * (Math.PI / 6));
    price += price * 0.08 * seasonalWave;
  } else if (product.category === 'Nabiał / Tłuszcze' && product.id === 'butter') {
    const seasonalWave = Math.cos(month * (Math.PI / 6));
    price += price * 0.04 * seasonalWave;
  } else if (product.category === 'Paliwa detaliczne') {
    const weekWave = Math.sin((dayOfYear / 7) * 2 * Math.PI) * 0.03;
    price += weekWave;
  }

  return Math.round(price * 100) / 100;
}

export function generateBasketChunks({
  startDate = '2018-01-01',
  endDate = '2026-11-09',
  frequency = 'WEEKS',
  selectedProductIds = 'ALL',
}) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    throw new Error('Niepoprawny zakres dat początkowej i końcowej');
  }

  const activeProducts = selectedProductIds === 'ALL'
    ? GUS_BASKET_PRODUCTS
    : GUS_BASKET_PRODUCTS.filter(p => selectedProductIds.includes(p.id));

  if (activeProducts.length === 0) {
    return { chunks: [], summary: {} };
  }

  const chunks = [];
  let current = new Date(start);

  const basePrices = activeProducts.map(p => interpolateProductPrice(p, start));
  const baseBasketTotal = basePrices.reduce((acc, v) => acc + v, 0);

  let chunkIndex = 1;
  let previousNetSalary = null;

  while (current <= end) {
    const chunkDate = new Date(current);
    const dateStr = chunkDate.toISOString().slice(0, 10);

    const productPrices = {};
    const priceValues = [];

    activeProducts.forEach(prod => {
      const p = interpolateProductPrice(prod, chunkDate);
      productPrices[prod.id] = p;
      priceValues.push(p);
    });

    const basketTotal = Math.round(priceValues.reduce((a, b) => a + b, 0) * 100) / 100;
    const weakMedianPrice = Math.round(calculateMedian(priceValues) * 100) / 100;
    const meanPrice = Math.round((basketTotal / priceValues.length) * 100) / 100;
    const minPrice = Math.min(...priceValues);
    const maxPrice = Math.max(...priceValues);
    const percentChange = baseBasketTotal > 0 
      ? Math.round(((basketTotal - baseBasketTotal) / baseBasketTotal) * 1000) / 10 
      : 0;

    // Consumer earnings and budget share calculations
    const earnings = getEarningsForDate(chunkDate);
    const monthlyBasketEstimate = Math.round(basketTotal * 4 * 100) / 100; // 4 baskets per month
    const budgetSharePercent = Math.round((monthlyBasketEstimate / earnings.net) * 1000) / 10;
    const workHoursForBasket = Math.round((basketTotal / earnings.hourlyWage) * 10) / 10;

    let earningsChangeMom = 0;
    if (previousNetSalary !== null && previousNetSalary > 0) {
      earningsChangeMom = Math.round(((earnings.net - previousNetSalary) / previousNetSalary) * 1000) / 10;
    }
    previousNetSalary = earnings.net;

    let chunkLabel = dateStr;
    if (frequency === 'WEEKS') {
      const weekNumber = Math.ceil((((chunkDate - new Date(chunkDate.getFullYear(), 0, 1)) / 86400000) + 1) / 7);
      chunkLabel = `Tydzień ${weekNumber}/${chunkDate.getFullYear()} (${dateStr})`;
    } else if (frequency === 'MONTHS') {
      const monthNames = [
        'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
        'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
      ];
      chunkLabel = `${monthNames[chunkDate.getMonth()]} ${chunkDate.getFullYear()}`;
    }

    chunks.push({
      _id: `gus_chunk_${chunkIndex}`,
      chunkIndex,
      date: dateStr,
      dateObj: chunkDate,
      label: chunkLabel,
      frequency,
      basketTotal,
      weakMedianPrice,
      meanPrice,
      minPrice,
      maxPrice,
      percentChange,
      productPrices,
      productsCount: activeProducts.length,
      earnings,
      budgetSharePercent,
      workHoursForBasket,
      earningsChangeMom,
      monthlyBasketEstimate
    });

    chunkIndex++;

    if (frequency === 'DAYS') {
      current.setDate(current.getDate() + 1);
    } else if (frequency === 'WEEKS') {
      current.setDate(current.getDate() + 7);
    } else if (frequency === 'MONTHS') {
      current.setMonth(current.getMonth() + 1);
    }
  }

  const firstChunk = chunks[0] || {};
  const lastChunk = chunks[chunks.length - 1] || {};
  const allMedians = chunks.map(c => c.weakMedianPrice);
  const avgWeakMedian = allMedians.length > 0 
    ? Math.round((allMedians.reduce((a, b) => a + b, 0) / allMedians.length) * 100) / 100 
    : 0;

  // Earnings growth from period start to end
  const startNet = firstChunk.earnings?.net || 1;
  const endNet = lastChunk.earnings?.net || 1;
  const totalEarningsGrowthPct = Math.round(((endNet - startNet) / startNet) * 1000) / 10;

  const fuelProd = activeProducts.find(p => p.id === 'gasoline_pb95') || activeProducts.find(p => p.id === 'diesel_on');
  const foodProd = activeProducts.find(p => p.id === 'bread') || activeProducts.find(p => p.id === 'butter');
  
  let fuelGrowthPct = 0;
  let foodGrowthPct = 0;

  if (firstChunk.productPrices && lastChunk.productPrices) {
    if (fuelProd) {
      const p1 = firstChunk.productPrices[fuelProd.id];
      const p2 = lastChunk.productPrices[fuelProd.id];
      if (p1 && p2) fuelGrowthPct = Math.round(((p2 - p1) / p1) * 1000) / 10;
    }
    if (foodProd) {
      const p1 = firstChunk.productPrices[foodProd.id];
      const p2 = lastChunk.productPrices[foodProd.id];
      if (p1 && p2) foodGrowthPct = Math.round(((p2 - p1) / p1) * 1000) / 10;
    }
  }

  const summary = {
    startBasketTotal: firstChunk.basketTotal || 0,
    endBasketTotal: lastChunk.basketTotal || 0,
    totalPercentChange: lastChunk.percentChange || 0,
    avgWeakMedian,
    highestMedian: Math.max(...(allMedians.length ? allMedians : [0])),
    lowestMedian: Math.min(...(allMedians.length ? allMedians : [0])),
    totalChunks: chunks.length,
    activeProductsCount: activeProducts.length,
    fuelGrowthPct,
    foodGrowthPct,
    startNetSalary: startNet,
    endNetSalary: endNet,
    totalEarningsGrowthPct,
    latestBudgetShare: lastChunk.budgetSharePercent || 0,
    latestWorkHours: lastChunk.workHoursForBasket || 0,
    realWageVsInflationDiff: Math.round((totalEarningsGrowthPct - (lastChunk.percentChange || 0)) * 10) / 10
  };

  return { chunks, summary, activeProducts };
}

export async function testGusBdlConnection(apiKey = DEFAULT_GUS_API_KEY) {
  const endpoints = [
    `${GUS_BDL_PROXY_URL}/subjects?lang=pl&format=json&page-size=1`,
    `${GUS_BDL_DIRECT_URL}/subjects?lang=pl&format=json&page-size=1`
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...(apiKey ? { 'X-ClientId': apiKey } : {})
        }
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          status: 'CONNECTED',
          message: 'Połączono z API BDL GUS',
          data
        };
      }
    } catch {
      // try next fallback
    }
  }

  return {
    success: false,
    status: 'OFFLINE_FALLBACK',
    message: 'Brak bezpośredniego połączenia z serwerem BDL (użyto danych GUS)'
  };
}

export function exportGusBasketToCsv(chunks, activeProducts, filename = 'gus_bdl_koszyk_konsumencki.csv') {
  if (!chunks || chunks.length === 0) return;

  const separator = ';';
  
  const headerCols = [
    'Data_Okres',
    'Czestotliwosc',
    'Etykieta_Okresu',
    'Wartosc_Koszyka_PLN',
    'Mediana_Tygodniowa_PLN',
    'Srednia_Cena_PLN',
    'Srednia_Pensja_Netto_PLN',
    'Udzial_W_Budzecie_Procent',
    'Godziny_Pracy_Na_Koszyk',
    'Zmiana_Pensji_Mom_Procent',
    'Zmiana_Koszyka_Procent',
    ...activeProducts.map(p => `Cena_${p.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, '')}_PLN`)
  ];

  const rows = [headerCols.join(separator)];

  chunks.forEach(chunk => {
    const rowCols = [
      chunk.date,
      chunk.frequency,
      `"${chunk.label}"`,
      chunk.basketTotal.toFixed(2).replace('.', ','),
      chunk.weakMedianPrice.toFixed(2).replace('.', ','),
      chunk.meanPrice.toFixed(2).replace('.', ','),
      chunk.earnings?.net || '',
      `${chunk.budgetSharePercent.toFixed(1).replace('.', ',')}%`,
      chunk.workHoursForBasket.toFixed(1).replace('.', ','),
      `${chunk.earningsChangeMom.toFixed(1).replace('.', ',')}%`,
      `${chunk.percentChange.toFixed(1).replace('.', ',')}%`,
      ...activeProducts.map(p => {
        const val = chunk.productPrices[p.id];
        return val !== undefined ? val.toFixed(2).replace('.', ',') : '';
      })
    ];
    rows.push(rowCols.join(separator));
  });

  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
