# ZPA26-27Gr5 - Portal Analityczny Notowań Paliw Hurtowych PKN ORLEN

Aplikacja webowa (React + Vite) do przeglądania, filtrowania, analizy oraz selektywnego eksportu danych o hurtowych cenach paliw PKN ORLEN (m.in. `data/csv/orlen_pb95_2026.csv`).

## Struktura katalogu `data/`

- `data/csv/` - pliki z danymi notowań cen paliw (`orlen_pb95_2026.csv`, `orlen_on_2026.csv`)
- `data/images/` - oficjalne logotypy PKN ORLEN (`Orlen_eagle_logo.svg`, `Orlen_wordmark_logo.svg`)

## Funkcjonalności

- **Wybór zbioru danych w menu głównym (na środku góry ekranu)**:
  - Przełącznik pomiędzy oficjalnymi notowaniami z `data/csv/`: `Orlen_pb95_2026.csv` (Eurosuper 95), `Orlen_on_2026.csv` (Ekodiesel ON)
  - Możliwość bezpośredniego wgrania dowolnego własnego pliku CSV z dysku
- **Karty podsumowań i statystyk**:
  - Ostatnia cena notowania wraz z przeliczeniem na zł/litr netto oraz dzienną zmianą
  - Średnia arytmetyczna cen hurtowych w całym analizowanym okresie
  - Wartość maksymalna i minimalna wraz z dokładnymi datami
  - Licznik zaznaczonych rekordów do eksportu
- **Interaktywna tabela danych**:
  - Kolumny z możliwością sortowania w obu kierunkach (data, nazwa produktu, symbol, cena w PLN/m³, cena za litr, data publikacji)
  - Dynamiczne wyszukiwanie z poziomu searchbara (po dacie, cenie, produkcie, linku itp.)
  - Szybkie reguły filtrowania (m.in. wysokie ceny > 6000 zł, zakresy cenowe, ostatnie notowania)
- **Zaawansowane zaznaczanie checkboxami**:
  - Zaznaczanie indywidualnych rekordów
  - **Przycisk "Zaznacz wszystkie widoczne"**: zaznacza wyłącznie wiersze aktualnie widoczne po zastosowaniu filtrów/wyszukiwania (nie zaznacza ukrytych rekordów z całego pliku CSV)
  - Przycisk "Odznacz widoczne" oraz "Wyczyść wszystko"
- **Eksport do nowego pliku CSV**:
  - Pobieranie zaznaczonych rekordów jednym kliknięciem przycisku "Pobierz zaznaczone"
  - Obsługa formatu UTF-8 z BOM (pełna kompatybilność z polskimi znakami w programie Microsoft Excel i LibreOffice) oraz separatora średnikowego (`;`)
- **Motyw graficzny PKN ORLEN**:
  - Oficjalna paleta barw (czerwień `#E11A27` i biel `#FFFFFF`)
  - Nowoczesna typografia, sticky header tabeli, subtelne animacje i pełna responsywność

## Uruchomienie projektu

```bash
# 1. Instalacja zależności
npm install

# 2. Uruchomienie lokalnego serwera deweloperskiego
npm run dev

# 3. Budowanie wersji produkcyjnej
npm run build
```

Serwer deweloperski uruchamia się domyślnie pod adresem: `http://localhost:5173/`.
