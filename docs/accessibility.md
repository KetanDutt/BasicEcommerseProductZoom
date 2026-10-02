# Accessibility notes

The gallery keeps the image itself available as content and uses native buttons, native `<details>` disclosures and native `<dialog>` elements. Zoom is an enhancement; it is not the only way to learn which view is selected.

## Implemented

- A skip link, semantic page landmarks, one primary heading and named navigation / gallery groups.
- Descriptive `alt` text on the main and expanded product images. Thumbnail images are decorative; their buttons have distinct accessible names and pressed state.
- Keyboard-operable thumbnails, previous/next controls, quantity buttons, saved-item action and dialogs. When the main image button is focused, the left/right arrow keys change views and Escape exits a pinned zoom.
- `aria-pressed` communicates the current thumbnail and pinned zoom / saved-item state. A polite live region announces gallery changes and cart updates.
- Native dialogs provide modal focus management and Escape-to-close in modern browsers. Close buttons are labelled; the disabled checkout action is explicit.
- Focus indicators are visible, status is not conveyed by color alone, and animations/transitions are reduced for `prefers-reduced-motion: reduce`.
- On touch devices, tapping the image toggles zoom and a second tap returns to the fit view. Pinch zoom remains the browser's normal behavior outside the gallery's tap interaction.

## Manual checks

1. Use Tab / Shift+Tab from the top of the page; activate “Skip to product”.
2. Focus the gallery image and use Enter/Space to toggle zoom, arrow keys to change views, and Escape to leave pinned zoom.
3. Tab through every thumbnail and confirm the visible selection and live announcement update together.
4. Open the larger viewer, move between views with its buttons and arrow keys, and close with Escape and the labelled close button. Confirm focus returns to the opener.
5. Open the sample bag, add / remove the sample item, and confirm the quantity and total are announced.
6. Enable reduced motion in the operating system and verify the image switch and dialogs do not rely on long animation.
7. Test at 320 CSS pixels wide and at 200% browser zoom; confirm no horizontal page scrolling and all controls remain reachable.
8. With a screen reader, verify thumbnail labels distinguish views and image alternatives describe what is visible without repeating decorative thumbnail text.

These are implementation notes, not a formal WCAG conformance claim or a substitute for testing with assistive technology and representative users. Production content must supply accurate, useful image alternatives and verified product details.
