import os
import json

# Charger les villes depuis le JSON
with open("cities.json", encoding="utf-8") as f:
    villes_json = json.load(f)

# Récupérer les fichiers du dossier
folder_path = "cities"  # <-- ton dossier
files_array = os.listdir(folder_path)

# Retirer l'extension .jpg pour la comparaison
files_clean = [f.replace(".jpg", "") for f in files_array]

# Déterminer les villes manquantes
missing = [ville for ville in villes_json if ville not in files_clean]

print(f"Nombre de villes dans le JSON : {len(villes_json)}")
print(f"Nombre de fichiers dans le dossier : {len(files_array)}")
print(f"Nombre de villes sans image : {len(missing)}")

# Créer l'output côte à côte
max_len = max(len(villes_json), len(files_array))
with open("text.txt", "w", encoding="utf-8") as f:
    f.write(f"{'Ville JSON':40} | {'Fichier dossier':40}\n")
    f.write(f"{'-'*40} | {'-'*40}\n")
    for i in range(max_len):
        ville_name = villes_json[i] if i < len(villes_json) else ""
        file_name = files_array[i] if i < len(files_array) else ""
        f.write(f"{ville_name:40} | {file_name:40}\n")

print("Fichier text.txt généré avec succès !")
