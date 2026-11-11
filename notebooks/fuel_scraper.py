import requests
import csv
import json
import time

URL = "https://tool.orlen.pl/api/wholesalefuelprices/ByProduct"

# informacja idąca do serwera - oczekiwana odpowiedź, z jakiego klienta korzysta
HEADERS = {
    "Accept": "application/json",
    "Referer": "https://www.orlen.pl/pl/dla-biznesu/hurtowe-ceny-paliw",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36"}

all_data = []

# wszystkie produkty mają ID od 41 do 47
for product_id in range(41, 48):
    print(f"Scraping product {product_id}...")
    params = {"from": "2019-01-01", "to": "2026-11-11", "productId": product_id}

    try:
        # zapytanie HTTP GET do serwera
        response = requests.get(URL, params=params, headers=HEADERS, timeout=60)
        # sprawdzanie statusu 200
        response.raise_for_status()

        # usuwanie znacznika BOM pojawiającego się czasem na początku odpowiedzi
        data = json.loads(response.content.decode("utf-8-sig"))

        # dodanie productId
        for row in data:
            row["productId"] = product_id

        all_data.extend(data)
        print(f"Scraped {len(data)} records")

    except (requests.RequestException, ValueError) as e:
        print(f"Error: {e}")

    time.sleep(3)

if all_data:
    # nagłówki CSV
    columns = list(dict.fromkeys(key for row in all_data for key in row))

    # tworzenie CSV
    with open("../data/fuel_prices.csv", "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=columns, delimiter=";")
        writer.writeheader()
        writer.writerows(all_data)

    print(f"\nSaved {len(all_data)} records.")
else:
    print("\nNo data has been saved.")
