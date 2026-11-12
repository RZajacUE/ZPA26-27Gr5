# Raport jakości danych

## Zbiór 1: Ceny hurtowe paliw Orlen

**Plik:** `data/fuel_prices.csv`  
**Liczba rekordów:** 9715  
**Liczba kolumn:** 8  
**Zakres dat:** 2019-01-01 – 2026-11-11

Raport przygotowano na podstawie kontroli jakości danych wykonanych w Google Colabie na aktualnym zbiorze cen paliw.

| Problem | Zakres | Planowane działanie | Kto |
|---|---|---|---|
| Braki w lokalizacji | 100% | Zweryfikować potrzebę kolumn lokalizacji; jeśli nie są używane, pominąć je w analizie | Daniel |
| Braki w `unit` | 73,48% | Potwierdzić jednostkę w źródle; następnie uzupełnić brakujące wartości jako PLN/m3 | Daniel |
| Braki w `publishFrom` | 42% | Sprawdzić znaczenie `publishFrom` i zdecydować, czy kolumna jest potrzebna | Daniel |
| Wartości odstające | 174 rekordy | Zweryfikować 174 wartości odstające; nie usuwać automatycznie | Daniel |
| Przerwy czasowe | 437 na paliwo | Sprawdzić przerwy względem harmonogramu publikacji i dni wolnych | Daniel |
| Duplikaty i błędne wartości | 0 | Brak konieczności poprawiania duplikatów, dat i cen zerowych lub ujemnych [DONE] | Daniel |
| Daty z przyszłości | 0 rekordów | Brak konieczności korekty [DONE] | Daniel |

## Uwagi

- Dane dotyczą cen hurtowych paliw, a nie cen detalicznych na stacjach.
- W kolumnie `unit` występuje 2576 wartości `PLN/m3` oraz 7139 braków.
- Wartości odstające wykryto metodą IQR. Nie oznacza to automatycznie błędnych danych.
- Najdłuższa przerwa między notowaniami wynosi 6 dni.
- Raport należy aktualizować po dodaniu kolejnych zbiorów danych, w szczególności cen produktów spożywczych.
