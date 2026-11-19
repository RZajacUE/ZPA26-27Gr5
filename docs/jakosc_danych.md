# Raport jakości danych

## Zbiór 1: Ceny hurtowe paliw Orlen - dane surowe

**Plik:** `data/fuel_prices.csv`  
**Liczba rekordów:** 9715  
**Liczba kolumn:** 8  
**Zakres dat:** 2019-01-01 - 2026-11-11

Raport przygotowano na podstawie kontroli jakości surowych danych paliwowych wykonanej w Google Colabie.

| Problem | Zakres | Planowane działanie | Kto |
|---|---|---|---|
| Braki w lokalizacji | 100% | Kolumny lokalizacji pominięto w zbiorze oczyszczonym [DONE] | Daniel |
| Braki w `unit` | 73,48% | W zbiorze oczyszczonym uzupełniono jednostki na PLN/m3 [DONE] | Daniel |
| Braki w `publishFrom` | 42% | Sprawdzono 4080 braków (42%). Wszystkie 5635 dostępnych dat publishFrom są zgodne z effectiveDate. Do analizy wykorzystano kompletną kolumnę effectiveDate, bez uzupełniania braków w publishFrom [DONE] | Daniel |
| Wartości odstające | 174 rekordy | Przeanalizowano 174 wartości odstające metodą IQR: 118 w 2022 r. i 56 w 2026 r. Odchylenia mogą być związane z wojną w Ukrainie w 2022 r. oraz konfliktem z Iranem w 2026 r., które wpływały na światowy rynek ropy. Nie potwierdzono bezpośredniego związku dla poszczególnych notowań. Wartości pozostawiono w zbiorze bez automatycznego usuwania [DONE] | Daniel |
| Przerwy czasowe | 437 na paliwo | Przeanalizowano 437 przerw na paliwo. Najczęstsze były przerwy 3-dniowe (351 przypadków), a dłuższe często przypadały na okresy świąteczne. Zdecydowano o pozostawieniu przerw bez sztucznego uzupełniania danych [DONE] | Daniel |
| Duplikaty i błędne wartości | 0 | Brak konieczności poprawiania duplikatów, dat i cen zerowych lub ujemnych [DONE] | Daniel |
| Daty z przyszłości | 0 rekordów | Brak konieczności korekty [DONE] | Daniel |
| Rodzaje paliw nieodpowiednie do analizy | ONArctic2 i OnEkoterm (3886 rekordów) | Wykluczono dwa rodzaje paliw ze zbioru oczyszczonego [DONE] | Michał |

## Uwagi

- Dane dotyczą cen hurtowych paliw, a nie cen detalicznych na stacjach.
- W kolumnie `unit` występuje 2576 wartości `PLN/m3` oraz 7139 braków.
- Wartości odstające wykryto metodą IQR. Nie oznacza to automatycznie błędnych danych.
- Najdłuższa przerwa między notowaniami wynosi 6 dni.
- Raport należy aktualizować po dodaniu kolejnych zbiorów danych.
- Z analizy wykluczono ONArctic2 i OnEkoterm (łącznie 3886 rekordów). W zbiorze oczyszczonym pozostawiono Pb95, Pb98 i ONEkodiesel.
- Przeprowadzono również kontrolę fuel_prices_clean.csv. Jej wyniki zostaną przedstawione w kolejnej sekcji raportu. Następnym etapem będzie kontrola CENY.csv.

## Zbiór 2: Ceny hurtowe paliw Orlen - dane oczyszczone

**Plik:** `data/fuel_prices_clean.csv`  
**Liczba rekordów:** 5829  
**Liczba kolumn:** 9  
**Zakres dat:** 2019-01-01 - 2026-11-11

Raport przygotowano na podstawie kontroli jakości oczyszczonych danych paliwowych wykonanej w Google Colabie.

| Problem | Zakres | Planowane działanie | Kto |
|---|---|---|---|
| Braki w `publishFrom` | 2448 rekordów (42%) | W danych oczyszczonych występuje 2448 braków (42%). Na podstawie kontroli danych surowych ustalono, że dostępne daty publishFrom są zgodne z effectiveDate. Do analizy wykorzystano kompletną kolumnę effectiveDate, bez uzupełniania braków [DONE] | Daniel |
| Wartości odstające (IQR) | 127 rekordów (2,18%) | Wykryto 127 wartości odstających metodą IQR (2,18%). W analizie danych surowych stwierdzono, że odchylenia mogły być związane z sytuacją geopolityczną i zmianami cen ropy. Wartości odstające w zbiorze oczyszczonym pozostawiono bez automatycznego usuwania, ponieważ nie stanowią one same w sobie błędów danych [DONE] | Daniel |
| Przerwy czasowe | 437 na paliwo, maksymalnie 6 dni | Na podstawie kontroli danych surowych przeanalizowano 437 przerw na paliwo. Ponieważ w zbiorze oczyszczonym zachowano te same daty notowań, zdecydowano o pozostawieniu przerw bez sztucznego uzupełniania danych [DONE] | Daniel |
| Braki w `unit` | 0 rekordów | Wszystkie rekordy mają jednostkę PLN/m3 [DONE] | Michał |
| Duplikaty | 0 rekordów | Brak konieczności usuwania duplikatów [DONE] | Daniel |
| Nieprawidłowe daty i ceny | 0 rekordów | Brak konieczności korekty [DONE] | Daniel |
| Daty z przyszłości | 0 rekordów | Brak konieczności korekty [DONE] | Daniel |
| Błędne przeliczenie ceny za litr | 0 rekordów | Potwierdzono poprawność przeliczenia PLN/m3 na PLN/litr [DONE] | Daniel |

### Uwagi do danych oczyszczonych

- W zbiorze pozostawiono trzy rodzaje paliw: Pb95, Pb98 i ONEkodiesel.
- Każdy rodzaj paliwa zawiera 1943 obserwacje.
- W porównaniu z danymi surowymi usunięto 3886 rekordów.
- Wszystkie wartości w kolumnie `unit` mają jednostkę `PLN/m3`.
- W kolumnie `publishFrom` nadal występują braki (42%).
- Wartości odstające wykryto metodą IQR. Nie oznaczają one automatycznie błędnych danych.
- Najdłuższa przerwa między notowaniami wynosi 6 dni.
- Wszystkie 5829 wartości w kolumnie `cena_za_litr` zostały poprawnie przeliczone.

## Zbiór 3: Ceny produktów spożywczych - dane surowe

**Plik:** `data/CENY.csv`  
**Liczba rekordów:** 64  
**Liczba kolumn:** 8  
**Zakres lat:** 2019-2025

Raport przygotowano na podstawie kontroli jakości danych o cenach produktów spożywczych wykonanej w Google Colabie.

| Problem | Zakres | Planowane działanie | Kto |
|---|---|---|---|
| Całkowicie pusty rekord | 1 rekord | Wykryto jeden wiersz bez nazwy produktu i bez cen. Usunąć pusty rekord podczas przygotowywania danych do analizy. | Daniel |
| Brakujące ceny produktów | 16-18 braków w każdym roku (2019-2025) | Sprawdzić dostępność cen poszczególnych produktów. Nie zastępować brakujących wartości zerami. Przy budowie stałego koszyka rozważyć wykorzystanie produktów z kompletnymi danymi. | Daniel |
| Brak nazwy produktu | 1 rekord | Brak nazwy dotyczy całkowicie pustego wiersza. Usunąć go podczas czyszczenia danych. | Daniel |
| Duplikaty | 0 rekordów | Nie wykryto identycznych wierszy ani powtarzających się nazw produktów. Brak konieczności usuwania duplikatów [DONE] | Daniel |
| Nieprawidłowe ceny | 0 cen zerowych, 0 ujemnych | Sprawdzono poprawność dostępnych cen. Wszystkie można przekształcić na wartości liczbowe. Nie wykryto cen zerowych ani ujemnych [DONE] | Daniel |
| Niekompletność danych historycznych | Nie wszystkie produkty mają ceny ze wszystkich 7 lat | Przy analizie zmian kosztu stałego koszyka uwzględnić produkty posiadające ceny w całym okresie 2019-2025. | Daniel |

### Uwagi do danych o cenach produktów spożywczych

- Dane obejmują ceny produktów spożywczych w latach 2019-2025.
- W zbiorze znajduje się jeden całkowicie pusty wiersz.
- Brakujące ceny mogą wynikać z niepełnej dostępności danych historycznych dla poszczególnych produktów. Przyczyna nie została jeszcze potwierdzona.
- Brakujących cen nie należy automatycznie zastępować zerami.
- Nie wykryto duplikatów, cen zerowych, ujemnych ani wartości cenowych o nieprawidłowym formacie.
- Część produktów posiada komplet cen ze wszystkich siedmiu lat i może posłużyć do budowy stałego koszyka zakupowego.
- Przed dalszą analizą należy zdecydować, które produkty zostaną uwzględnione w koszyku.