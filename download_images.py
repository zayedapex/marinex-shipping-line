"""Download the site images into assets/images/ (run once: python download_images.py)."""
import os, urllib.request

IMAGES = {
    "red-and-blue-cargo-ship.jpg": "https://images.unsplash.com/photo-1583342426869-91ba1e67e142?auto=format&fit=crop&w=2000&q=80",
    "colorful-blue-red-and-yellow.jpg": "https://images.unsplash.com/photo-1601897690942-bcacbad33e55?auto=format&fit=crop&w=2000&q=80",
    "large-container-ship-with-cranes.jpg": "https://images.unsplash.com/photo-1760165385839-a87ebb370ab5?auto=format&fit=crop&w=2000&q=80",
    "shipping-containers-stacked-at-a.jpg": "https://images.unsplash.com/photo-1758146296671-0e46a91739a8?auto=format&fit=crop&w=1200&q=80",
    "container-ship-at-sea-on.jpg": "https://images.unsplash.com/photo-1725399490099-51b3c4d3edbb?auto=format&fit=crop&w=800&q=75",
    "warehouse-worker-coordinating-logistics-and.jpg": "https://images.unsplash.com/photo-1740914994657-f1cdffdc418e?auto=format&fit=crop&w=800&q=75",
    "cargo-aircraft-flying-at-sunset.jpg": "https://images.unsplash.com/photo-1725651548905-55ed85f8df00?auto=format&fit=crop&w=800&q=75",
    "feeder-vessel-crossing-open-water.jpg": "https://images.unsplash.com/photo-1720761735305-025bd44521b2?auto=format&fit=crop&w=1600&q=70",
    "delivery-truck-for-inland-distribution.jpg": "https://images.unsplash.com/photo-1768638687895-b5ee4a586c7f?auto=format&fit=crop&w=800&q=75",
    "aerial-view-of-a-container.jpg": "https://images.unsplash.com/photo-1724597500306-a4cbb7d1324e?auto=format&fit=crop&w=900&q=80",
}

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "images")
os.makedirs(out, exist_ok=True)
for name, url in IMAGES.items():
    path = os.path.join(out, name)
    if os.path.exists(path):
        print("skip", name); continue
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as r, open(path, "wb") as f:
        f.write(r.read())
    print("saved", name)
print("Done.")
