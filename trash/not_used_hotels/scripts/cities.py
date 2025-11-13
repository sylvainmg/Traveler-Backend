import requests
import os
import time
import json

ACCESS_KEY = "68Uh2e1WAmOK08e_psbO7kiLo0qykTRTUuw5oVtYApg"  # remplace par ta clé Unsplash
FOLDER = "cities"
os.makedirs(FOLDER, exist_ok=True)

with open("cities.json", "r", encoding="utf-8") as f:
    cities = json.load(f)

for city in cities:
    query = f"{city} city"
    url = "https://api.unsplash.com/search/photos"
    params = {"query": query, "per_page": 1, "page": 1}
    headers = {"Authorization": f"Client-ID {ACCESS_KEY}"}

    r = requests.get(url, headers=headers, params=params)
    if r.status_code != 200:
        print(f"⛔ Erreur pour {city}: {r.status_code}")
        continue

    results = r.json().get("results", [])
    if not results:
        print(f"⚠️ Pas d'image trouvée pour {city}")
        continue

    link = results[0]["urls"]["regular"]
    img_data = requests.get(link).content
    path = f"{FOLDER}/{city.replace(' ', '_')}.jpg"
    with open(path, "wb") as f:
        f.write(img_data)
    print(f"✅ {city} téléchargée")
    time.sleep(1)  # pause pour éviter le blocage
