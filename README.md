# Marinex Shipping Line

```
marinex-shipping/
├── index.html
├── download_images.py      <- run once to fetch the images
└── assets/
    ├── css/style.css
    ├── js/main.js
    ├── images/             <- photos (downloaded) + region-map.svg (included)
    └── fonts/              <- for self-hosted fonts (optional)
```

## Setup
1. Run `python download_images.py` (needs internet) to fill `assets/images/`.
   Or download the photos yourself / use your own and keep the filenames
   that `index.html` expects.
2. Open `index.html` in a browser (or use VS Code Live Server).

Fonts (Fraunces, IBM Plex Sans) still load from Google Fonts.
