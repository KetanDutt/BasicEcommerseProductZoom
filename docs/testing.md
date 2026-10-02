# Testing

## Automated checks

Requires Node.js with the built-in `node:test` runner (Node 18+):

```sh
node --test tests/*.test.cjs
node --check js/jqzoom.js
node --check js/storefront.js
```

The tests cover zoom option normalization, pointer-to-image positioning, root markup and asset references, and guardrails for the static-only page. No package manager or third-party test library is required.

## Browser checklist

Run the page with a local static server (see [deployment](deployment.md)) and check:

| Area | Check |
| --- | --- |
| Startup | Page loads without failed local requests, console errors, external scripts or blocked-image placeholders. |
| Gallery | Selecting each thumbnail and using previous/next updates image, tone, caption, selected state and count. Navigation wraps from first to last and last to first. |
| Zoom | Hover moves the zoom origin on a fine pointer. Click/tap pins zoom, click/tap again resets it, and leaving the image resets hover-only zoom. |
| Lightbox | Opens on the selected view; buttons and arrow keys change views; Escape and the close control close it. |
| Bag | Quantity is limited to 1–9, add-to-bag increments without exceeding the limit, removal clears the item, and state survives reload when storage is allowed. |
| Saved item | Toggle state updates its accessible pressed state and survives reload when storage is allowed. |
| Failure paths | Disable local storage and confirm the page continues working for the current session with an understandable note. Block one image and confirm the remaining controls/content remain usable. |
| Responsive | Check narrow mobile, tablet and desktop widths, browser zoom and touch input. No clipped controls or horizontal page overflow. |
| Accessibility | Follow [accessibility.md](accessibility.md) with keyboard-only and screen-reader checks; verify reduced-motion behavior. |

## Scope limits

The automated suite is a smoke/unit suite, not a full browser integration, visual regression, load, security or accessibility audit. Before a public transactional deployment, add browser automation (for example, Playwright in the deployment environment), supported-device testing, performance budgets and an accessibility audit.
