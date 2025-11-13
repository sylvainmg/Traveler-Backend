import requests
import os
import time
import urllib.parse

ACCESS_KEY = "mg5zMP9fgNAqfjDdeKo0ZIOFVUlFyB93RStJfTReP5U"  # crée un compte sur https://unsplash.com/developers

class UnsplashImageDownloader:
    def __init__(self, query):
        self.query = query
        self.url = "https://api.unsplash.com/search/photos"
        self.headers = {"Authorization": f"Client-ID {ACCESS_KEY}"}

    def get_links(self, pages, quality):
        all_links = []
        for page in range(1, pages + 1):
            params = {"query": self.query, "per_page": 20, "page": page}
            r = requests.get(self.url, headers=self.headers, params=params)
            data = r.json().get("results", [])
            for img in data:
                link = img["urls"].get(quality)
                if link:
                    all_links.append(link)
                    print(link)
        return all_links

if __name__ == "__main__":
    folder = "hotels"
    os.makedirs(folder, exist_ok=True)

    search = input("What do you want to search for? ")
    pages = int(input("How many pages (20 imgs per page)? "))
    quality = input("Quality (raw/full/regular/small/thumb): ")

    unsplash = UnsplashImageDownloader(search)
    links = unsplash.get_links(pages, quality)

    print(f"\nDownloading {len(links)} images...")
    for i, url in enumerate(links):
        img = requests.get(url).content
        with open(f"{folder}/{search}_{i+1}.jpg", "wb") as f:
            f.write(img)
    print("Done!")
