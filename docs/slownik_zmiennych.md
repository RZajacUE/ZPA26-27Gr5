| Nazwa kolumny  | Typ      | Opis                       | Wartości / jednostka  | Źródło     |
| -------------- | -------- | -------------------------- | --------------------- | ---------- |
| productName	 | string   | Typ paliwa                 | 5 unikalnych wartości |	Orlen API |
| effectiveDate	 | datetime | Data obowiązywania ceny    | YYYY-MM-DDT00:00:01   |	Orlen API |
| publishFrom	 | datetime | Data publikacji            | YYYY-MM-DDT00:00:00   |	Orlen API |
| value	         | float    | Cena	                     | > 0                   |	Orlen API |
| locationName	 | string   | Nazwa województwa	         | null                  | 	Orlen API |
| locationSymbol |	string  | Symbol województwa         | null                  |	Orlen API |
| unit       	 | string   | Jednostka                  | PLN/m3                |	Orlen API |
| productId	     | int      | Identyfikator typu         | 41-44, 46             |	Orlen API |
| Produkt	     | string   | Nazwa produktu spożywczego | Nazwa + ilość         |	CENY.csv  |
| 2019	         | int      | Średnia cena w roku 2019   | zł                    |	CENY.csv  |
| 2020	         | int      | Średnia cena w roku 2020   | zł                    |	CENY.csv  |
| 2021	         | int      | Średnia cena w roku 2021   | zł                    |	CENY.csv  |
| 2022	         | int      | Średnia cena w roku 2022   | zł                    |	CENY.csv  |
| 2023	         | int      | Średnia cena w roku 2023   | zł                    |	CENY.csv  |
| 2024	         | int      | Średnia cena w roku 2024   | zł                    |	CENY.csv  |
| 2025	         | int      | Średnia cena w roku 2025   | zł                    |	CENY.csv  |