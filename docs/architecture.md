# Architecture

## Scope

Fieldnote is a single-page static product-gallery demonstration. The repository has no server, build pipeline, third-party runtime dependency, account system, catalogue API or payment integration. `index.html` is the only shipped page.

The old root page requested jQuery over plain HTTP, initialized its plugin before the DOM existed, pointed at incorrectly cased image names, and depended on CSS-relative paths that did not exist. The larger copied page set contained PHP template expressions in `.html` files, stale remote dependencies and unrelated legacy site assets. Those unsupported mockups and unused bundles were removed; the maintained project is now the small, self-contained product-zoom example.

## Runtime pieces

- **`index.html`** supplies semantic product content and the gallery's view data. With JavaScript unavailable, the initial product image, product facts, native disclosure sections and page content remain visible.
- **`css/site.css`** owns the visual system, responsive layout, focus treatments, zoom transform states, reduced-motion rules and dialog presentation. It contains no remote font or image references.
- **`js/jqzoom.js`** is the standalone gallery module. It reads the gallery's thumbnail buttons, updates the active image and caption, tracks the pointer, and emits `productzoom:change` events. It auto-initializes `[data-product-zoom]` elements after the document is parsed.
- **`js/storefront.js`** owns demo-only page interactions: quantity, saved-item state, the sample bag and the native image/bag dialogs. It never sends cart data to a network service.
- **`assets/`** contains the local, optimized image derivatives and SVG favicon. Thumbnails are smaller than the main product image to avoid using full-size files in the rail.

## Gallery data flow

1. Each `[data-gallery-item]` button describes one view with `data-src` / `data-zoom-src`, `data-alt`, `data-caption`, and optional `data-tone` attributes.
2. `ProductZoom` uses the selected view to update the main image, its accessible name, tone, counter, active thumbnail and caption.
3. Pointer coordinates are converted to percentages and written to `transform-origin` (at most once per animation frame). CSS scales the already-loaded local image within its clipped frame.
4. Previous/next buttons and the focused image button use the same selection method. `productzoom:select` can request a view programmatically; `productzoom:change` announces the result to page consumers.
5. The full-screen dialog reads the selected thumbnail's data, so it stays in sync when opened from any view.

Each gallery owns its own instance and event listeners. There are no document-wide selectors for generated zoom elements. `ProductZoom.init()` is idempotent for an initialized root, and `destroy()` removes the gallery's listeners.

## Demo state

The quantity and wishlist are page controls. The sample bag stores only a product identifier and bounded integer quantity in `localStorage`; it has no user identity or personal data. Reads and writes are guarded because storage may be disabled or unavailable. State is also refreshed on cross-tab `storage` events. Clearing site data clears the saved demo state.

The amount, product name and sample image are defined in `js/storefront.js`. The product attributes displayed in the page are intentionally cautious: the supplied images do not establish gem identity, weight, origin, treatment or certification.

## Performance decisions

- No framework, CSS library, font download, remote script, tracker or analytics call.
- The image is preloaded and marked high priority; non-primary thumbnails and the lower-page editorial image are lazy loaded.
- Product images are cropped/resized locally; thumbnails are separately encoded at 320 × 320.
- Zoom uses a CSS transform rather than repeatedly creating magnifier nodes, cloning images or doing image-sized DOM updates.
- Pointer movement updates `transform-origin` in `requestAnimationFrame` rather than once per raw pointer event.
- Motion is short and disabled/reduced when the visitor requests reduced motion.

## Deliberate non-goals

There is no auto-rotating carousel: it can move content unexpectedly, adds timer work, and is less comfortable for many users. There is no purchase submission, search, user account, product review or real policy claim. See [production readiness](production-checklist.md) before adapting this demo for transactions.
