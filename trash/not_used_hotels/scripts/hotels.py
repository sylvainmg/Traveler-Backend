import os

dossier_images = "hotels"
fichiers = sorted(os.listdir(dossier_images))

for i, fichier in enumerate(fichiers[:922], start=1):
    ancien_chemin = os.path.join(dossier_images, fichier)
    extension = os.path.splitext(fichier)[1]  # garder .jpg, .png, etc.
    nouveau_nom = f"{i}{extension}"
    nouveau_chemin = os.path.join(dossier_images, nouveau_nom)
    
    os.rename(ancien_chemin, nouveau_chemin)
    print(f"{fichier} → {nouveau_nom}")

print("Renommage terminé !")
