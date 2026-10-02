# ProductZoom API

`js/jqzoom.js` is a plain browser script with no required library. It exposes `window.ProductZoom` and automatically initializes every `[data-product-zoom]` element once the document is ready.

## Markup contract

A gallery root needs a zoom region, a button containing the main image, and one or more view buttons:

```html
<div data-product-zoom data-zoom-factor="2.35" role="group" aria-label="Product image gallery">
  <div data-zoom-region>
    <button type="button" data-zoom-toggle aria-pressed="false" aria-label="Zoom in on the product">
      <img data-zoom-image src="images/product-large.jpg" alt="A clear description of the product">
    </button>
  </div>

  <div role="group" aria-label="Choose a product view">
    <button type="button" data-gallery-item
      data-src="images/product-large.jpg"
      data-zoom-src="images/product-large.jpg"
      data-alt="A clear description of this view"
      data-caption="Front view"
      data-tone="light"
      aria-label="View 1: Front view"
      aria-pressed="true">
      <img src="images/product-thumb.jpg" alt="">
    </button>
  </div>
  <span data-gallery-caption>Front view</span>
  <span data-gallery-index></span>
  <span data-gallery-count></span>
  <p data-gallery-status aria-live="polite" aria-atomic="true"></p>
</div>
```

The selectors are intentionally data attributes, so the visual class names are yours to choose. The stock site styles target the class names used in `index.html`.

### View attributes

| Attribute | Required | Meaning |
| --- | --- | --- |
| `data-gallery-item` | yes | Marks a selectable thumbnail button. |
| `data-src` | preferred | Source for the main image. |
| `data-zoom-src` | no | Higher-resolution source. Falls back to `data-src`. |
| `data-alt` | preferred | Descriptive alternative text for the selected view. |
| `data-caption` | no | Caption and live announcement. Falls back to the button label. |
| `data-tone="dark"` | no | Sets a dark image-frame treatment; all other values use the light treatment. |
| `aria-pressed` | no | Set `true` on the initial selected thumbnail. The module updates it on selection. |

The thumbnail's nested `<img>` is used as a preview in the legacy adapter. For native galleries, give that decorative thumbnail image `alt=""`; the button should have its own accessible label.

## Options and JavaScript API

```js
const gallery = document.querySelector('[data-product-zoom]');
const instance = ProductZoom.init(gallery, {
  zoomFactor: 2.5,
  hoverToZoom: true,
  keyboard: true
});

// Select the next view, wrapping at either end.
gallery.dispatchEvent(new CustomEvent('productzoom:select', {
  detail: { index: 1 }
}));

// Tear down listeners when removing the gallery from the page.
instance?.destroy();
```

`ProductZoom.initAll(selector, options, scope)` initializes matching elements and returns the created instances. Defaults are `zoomFactor: 2.35`, `hoverToZoom: true`, and `keyboard: true`.

- `zoomFactor` accepts a number from 1.25 through 4; values outside that range are clamped.
- `hoverToZoom: false` disables automatic hover zoom. Click/tap zoom remains available.
- `keyboard: false` disables left/right navigation while the image button is focused. Thumbnail buttons remain native keyboard controls.
- `data-zoom-factor` on the gallery root sets its zoom factor when no option is passed.

Invalid/missing markup returns `null` and emits a concise warning to the console rather than throwing into the page. Calling `init()` more than once for a root returns its existing instance.

## Events

- **`productzoom:change`** fires on the gallery root after selecting a view. `event.detail` contains `{ index, src, alt, caption, tone }`.
- **`productzoom:select`** is listened for on the gallery root. Set `event.detail.index` to an integer; indexes wrap around the view list.

Both events are local to the gallery. They do not send analytics or network requests.

## Legacy jQuery adapter

The former markup shape is accepted when `$.fn.zoom()` is called on its `<ul>`:

```html
<ul id="legacy-gallery">
  <li>
    <img class="bzoom_thumb_image" src="images/small.jpg" alt="Front view" title="Front view">
    <img class="bzoom_big_image" src="images/large.jpg" alt="">
  </li>
</ul>
```

Load jQuery **before** `js/jqzoom.js`, then initialize as before:

```js
$('#legacy-gallery').zoom({
  zoom_factor: 2.4,
  hover_to_zoom: true,
  keyboard: true
});
```

The adapter returns the jQuery collection for chaining. `source_image_width` plus `thumb_image_width` can be used to infer a zoom factor if one is not provided. `zoomFactor` / `zoom_factor`, `hoverToZoom` / `hover_to_zoom`, and `keyboard` are supported.

The old fixed-size `zoom_area_*`, `align`, animation `speed`, auto-play and `small_thumbs` options are intentionally not reproduced. The replacement uses a responsive in-frame zoom, manual controls and a user-controlled reduced-motion-friendly interaction. Migrate old galleries to the data-attribute markup above for full control over accessible names and captions.
