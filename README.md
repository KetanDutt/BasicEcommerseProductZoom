# Fieldnote — product image zoom demo

A lightweight, dependency-free product-detail demo built around a responsive image gallery. It turns the repository's broken zoom example into a usable static storefront sample, with pointer, keyboard and touch zoom, a full-screen viewer, gallery navigation and a browser-only sample bag.

> **This is a UI demonstration, not a live store.** The product facts and sample price are placeholders. No inventory, customer account, payment, shipping or returns service is connected.

## Run locally

No build step, package installation, CDN, analytics or backend is required. From the repository root, start any static file server. For example:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Then open <http://localhost:8000>. Hosting the folder as a static site works too. A local server is recommended over opening `index.html` directly because browser storage policies vary for `file://` pages.

## Features

- Responsive product page with a polished, mobile-first layout.
- Three gallery views: two supplied background treatments and a close crop of the same source photograph.
- Magnification on hover, tap or click; pointer position controls the zoom origin.
- Thumbnail selection, previous/next controls, keyboard navigation and an expanded image dialog.
- Accessible names, live announcements, visible focus, native disclosure controls and reduced-motion support.
- Quantity control, saved-item toggle and a sample bag persisted in `localStorage` where available. The bag can be updated or cleared; checkout is deliberately disabled.
- Local product assets, no third-party runtime requests and no framework dependency.
- A compatibility adapter for the historical `$.fn.zoom()` call when jQuery is loaded before `js/jqzoom.js`.

## Quality checks

The smoke/unit checks use Node's built-in test runner and have no npm dependencies:

```sh
node --test tests/*.test.cjs
node --check js/jqzoom.js
node --check js/storefront.js
```

See [the manual test checklist](docs/testing.md) for mouse, keyboard, touch, responsive and dialog checks.

## Project map

```text
.
├── assets/              # Cropped, optimized product views and favicon
├── css/site.css         # Site layout, responsive styles and zoom states
├── docs/                # Architecture, API, accessibility, deployment and production notes
├── index.html           # Standalone product-page demonstration
├── js/jqzoom.js         # Dependency-free gallery and legacy jQuery adapter
├── js/storefront.js     # Sample bag, quantity, wishlist and image dialog
└── tests/               # Node built-in smoke/unit tests
```

## Gallery integration

The page is the working example. For the expected markup, initialization options, events and legacy jQuery usage, see [docs/zoom-api.md](docs/zoom-api.md). The gallery is initialized automatically on elements marked `data-product-zoom`; it can also be initialized with `ProductZoom.init(element, options)`.

## Important limitations before production use

This repository is front-end-only. A live commerce experience still needs a trusted product catalogue, verified gemmological details, real pricing and stock, a server-backed cart, a secure payment provider, tax/shipping/returns logic, order handling, privacy and consumer disclosures, plus production monitoring. The displayed price and item description are sample data, not an offer to sell. A browser-only cart is not an order system.

The supplied photographs do not include a certificate, carat weight, origin or treatment record. The three gallery views are variations/crops of the same original source images, not independent camera angles. Do not use the demonstration copy as a product claim.

Further guidance:

- [Architecture and data flow](docs/architecture.md)
- [Zoom API and migration notes](docs/zoom-api.md)
- [Accessibility notes](docs/accessibility.md)
- [Testing checklist](docs/testing.md)
- [Static deployment](docs/deployment.md)
- [Production readiness checklist](docs/production-checklist.md)

## License

See [LICENSE](LICENSE). The repository currently reserves all rights; API documentation is not a grant of permission to reuse or distribute the code.
