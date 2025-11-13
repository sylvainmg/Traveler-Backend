import json
from collections import Counter

# Charger le JSON
with open("cities.json", encoding="utf-8") as f:
    villes_json = json.load(f)

# Compter les occurrences
counter = Counter(villes_json)

# Filtrer les doublons
doublons = {ville: count for ville, count in counter.items() if count > 1}

if doublons:
    print("Doublons dans le JSON :")
    for ville, count in doublons.items():
        print(f"{ville} : {count} fois")
else:
    print("Aucun doublon trouvé dans le JSON.")
