
import requests
import csv
import time

URL_POZYCJE = (
    "https://api-dbw.stat.gov.pl/api/variable/"
    "variable-section-position")

URL_CENY = (
    "https://api-dbw.stat.gov.pl/api/variable/"
    "variable-data-section")

# Zakres dat od 2019 do 2026
LATA = range(2019, 2027)

# Okres - styczeń 247, luty 248, ..., grudzień 258
OKRESY = range(247, 259)

PLIK_CSV = "ceny_zywnosci_gus_2019_2026.csv"

# kolumny w pliku CSV
KOLUMNY = ["id-pozycja", "symbol", "nazwa-pozycja", "wartosc", "precyzja", "id-daty", "id-okres", "id-pozycja-1", "id-wymiar", "nazwa-wymiar", "id-zmienna", "id-przekroj", "data-poczatku", "data-konca"]

print("Pobieranie listy pozycji...")

response = requests.get(URL_POZYCJE, params={"id-przekroj": 740}, timeout=30)
response.raise_for_status()
pozycje = response.json()

# Usuwanie pozycji należących do wymiaru województw
mapa_produktow = {item["id-pozycja"]: item for item in pozycje if item.get("nazwa-wymiar") != "Polska, województwa"}

print(f"Pobrano {len(mapa_produktow)} pozycji.")

# Liczenie liczby rekordów w zmiennej liczba_rekordow
liczba_rekordow = 0

with open(PLIK_CSV, "w", newline="", encoding="utf-8-sig") as file:

    writer = csv.DictWriter(file, fieldnames=KOLUMNY)
    writer.writeheader()

    # Pętla po latach i okresach
    for rok in LATA:
        for okres in OKRESY:

            # Parametry zapytania do API GUS
            params = {
                "id-zmienna": 303,    # Zmienna dotycząca cen
                "id-przekroj": 740,   # Przekrój danych
                "id-rok": rok,
                "id-okres": okres,
                "ile-na-stronie": 24,
                "numer-strony": 0,
                "lang": "pl"
            }

            # Zapytanie HTTP GET
            response = requests.get(URL_CENY, params=params, timeout=30)

            # Brak danych dla danego okresu
            if response.status_code == 404:
                print(f"Brak danych: rok {rok}, okres {okres}.")
                continue

            response.raise_for_status()

            # Przekształcanie formatu JSON na obiekty Pythona, pobieranie zawartości data
            rekordy = response.json().get("data", [])

            for rekord in rekordy:

                # Pobranie identyfikatora produktu
                id_poz = rekord.get("id-pozycja-2")

                # Słownik którym kluczem jest identyfikator a wartością pełen zestaw informacji o tym produkcie
                produkt = mapa_produktow.get(id_poz, {})

                # Słownik odpowiadający jednemu wierszowi CSV
                wiersz = {
                    "id-pozycja": id_poz,
                    "symbol": produkt.get("symbol"),
                    "nazwa-pozycja": produkt.get("nazwa-pozycja"),
                    "wartosc": rekord.get("wartosc"),
                    "precyzja": rekord.get("precyzja"),
                    "id-daty": rekord.get("id-daty"),
                    "id-okres": rekord.get("id-okres"),
                    "id-pozycja-1": rekord.get("id-pozycja-1"),
                    "id-wymiar": produkt.get("id-wymiar"),
                    "nazwa-wymiar": produkt.get("nazwa-wymiar"),
                    "id-zmienna": rekord.get("id-zmienna"),
                    "id-przekroj": rekord.get("id-przekroj"),
                    "data-poczatku": produkt.get("data-poczatku"),
                    "data-konca": produkt.get("data-konca"),}

                writer.writerow(wiersz)
                liczba_rekordow += 1

            print(f"Rok {rok}, okres {okres}: "
                  f"zapisano {len(rekordy)} rekordów")

            time.sleep(0.2)

print(f"Zapisano {liczba_rekordow} rekordów.")
print(f"Plik wynikowy: {PLIK_CSV}")
