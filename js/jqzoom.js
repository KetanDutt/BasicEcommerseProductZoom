/*
 * Product Zoom — dependency-free, accessible product gallery.
 * The historical $.fn.zoom entry point remains available when jQuery is loaded first.
 */
;(function (host, factory) {
  'use strict';

  const api = factory(host);

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }

  if (host) {
    host.ProductZoom = api;

    if (host.jQuery && host.jQuery.fn) {
      host.jQuery.fn.zoom = function (options) {
        this.each(function () {
          api.init(this, options);
        });
        return this;
      };
    }

    if (host.document) {
      const initialise = function () {
        api.initAll('[data-product-zoom]');
      };

      if (host.document.readyState === 'loading') {
        host.document.addEventListener('DOMContentLoaded', initialise, { once: true });
      } else {
        initialise();
      }
    }
  }
})(typeof window !== 'undefined' ? window : globalThis, function (host) {
  'use strict';

  const DEFAULTS = Object.freeze({
    zoomFactor: 2.35,
    hoverToZoom: true,
    keyboard: true
  });
  const MIN_ZOOM = 1.25;
  const MAX_ZOOM = 4;
  const instances = new WeakMap();

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function finitePositive(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : null;
  }

  function normalizeOptions(options) {
    const input = options && typeof options === 'object' ? options : {};
    const thumbWidth = finitePositive(input.thumb_image_width);
    const sourceWidth = finitePositive(input.source_image_width);
    const legacyFactor = thumbWidth && sourceWidth ? sourceWidth / thumbWidth : null;
    const suppliedFactor = input.zoomFactor ?? input.zoom_factor ?? legacyFactor ?? DEFAULTS.zoomFactor;
    const parsedFactor = Number(suppliedFactor);

    const usableFactor = Number.isFinite(parsedFactor) && parsedFactor > 0 ? parsedFactor : DEFAULTS.zoomFactor;

    return Object.freeze({
      zoomFactor: clamp(usableFactor, MIN_ZOOM, MAX_ZOOM),
      hoverToZoom: input.hoverToZoom !== undefined
        ? Boolean(input.hoverToZoom)
        : input.hover_to_zoom !== undefined
          ? Boolean(input.hover_to_zoom)
          : DEFAULTS.hoverToZoom,
      keyboard: input.keyboard !== false
    });
  }

  function percentFromPointer(coordinate, start, length) {
    if (!Number.isFinite(coordinate) || !Number.isFinite(start) || !Number.isFinite(length) || length <= 0) {
      return 50;
    }
    return clamp(((coordinate - start) / length) * 100, 0, 100);
  }

  function getItemData(button, index) {
    const preview = button.querySelector('img');
    const previewSource = preview ? (preview.currentSrc || preview.getAttribute('src')) : '';
    const imageSource = button.getAttribute('data-src')
      || button.getAttribute('data-image')
      || button.getAttribute('data-zoom-src')
      || previewSource;

    return {
      src: button.getAttribute('data-zoom-src') || imageSource,
      alt: button.getAttribute('data-alt') || (preview && preview.getAttribute('alt')) || button.getAttribute('aria-label') || `Product view ${index + 1}`,
      caption: button.getAttribute('data-caption') || button.getAttribute('aria-label') || `View ${index + 1}`,
      tone: button.getAttribute('data-tone') || 'light'
    };
  }

  function createElement(document, tagName, className) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    return element;
  }

  function buildLegacyGallery(list) {
    const document = list.ownerDocument;
    const images = Array.from(list.children)
      .filter((child) => child.tagName && child.tagName.toLowerCase() === 'li')
      .map((slide, index) => {
        const thumb = slide.querySelector('.bzoom_thumb_image') || slide.querySelector('img');
        const large = slide.querySelector('.bzoom_big_image') || thumb;
        if (!thumb || !large) return null;

        return {
          thumbnail: thumb.currentSrc || thumb.getAttribute('src'),
          source: large.currentSrc || large.getAttribute('src'),
          alt: thumb.getAttribute('alt') || thumb.getAttribute('title') || `Product view ${index + 1}`,
          caption: thumb.getAttribute('title') || `Product view ${index + 1}`,
          tone: thumb.getAttribute('data-tone') || 'light'
        };
      })
      .filter((image) => image && image.source);

    if (!images.length || !list.parentNode) return null;

    const gallery = createElement(document, 'div', 'product-gallery bzoom_wrap');
    gallery.setAttribute('data-product-zoom', '');
    gallery.setAttribute('role', 'group');
    gallery.setAttribute('aria-label', 'Product image gallery');
    if (list.id) gallery.id = list.id;

    const frame = createElement(document, 'div', 'gallery-frame');
    const thumbnails = createElement(document, 'div', 'gallery-thumbnails');
    thumbnails.setAttribute('role', 'group');
    thumbnails.setAttribute('aria-label', 'Choose a product view');

    images.forEach((image, index) => {
      const button = createElement(document, 'button', 'gallery-thumbnail');
      button.type = 'button';
      button.setAttribute('data-gallery-item', '');
      button.setAttribute('data-src', image.source);
      button.setAttribute('data-zoom-src', image.source);
      button.setAttribute('data-alt', image.alt);
      button.setAttribute('data-caption', image.caption);
      button.setAttribute('data-tone', image.tone);
      button.setAttribute('aria-label', `View ${index + 1}: ${image.caption}`);
      button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');

      const thumbnailImage = createElement(document, 'img');
      thumbnailImage.src = image.thumbnail || image.source;
      thumbnailImage.alt = '';
      thumbnailImage.loading = index === 0 ? 'eager' : 'lazy';
      button.appendChild(thumbnailImage);
      thumbnails.appendChild(button);
    });

    const media = createElement(document, 'div', 'gallery-media');
    media.setAttribute('data-zoom-region', '');
    const stage = createElement(document, 'button', 'gallery-image-button');
    stage.type = 'button';
    stage.setAttribute('data-zoom-toggle', '');
    stage.setAttribute('aria-pressed', 'false');
    stage.setAttribute('aria-label', 'Zoom in on the product image');

    const mainImage = createElement(document, 'img', 'gallery-image');
    mainImage.setAttribute('data-zoom-image', '');
    mainImage.src = images[0].source;
    mainImage.alt = images[0].alt;
    mainImage.decoding = 'async';
    stage.appendChild(mainImage);

    const hint = createElement(document, 'span', 'zoom-hint');
    hint.textContent = 'Hover or tap to inspect';
    stage.appendChild(hint);
    media.appendChild(stage);
    frame.append(thumbnails, media);
    gallery.appendChild(frame);

    const galleryFooter = createElement(document, 'div', 'gallery-footer');
    const captionBlock = createElement(document, 'div', 'gallery-caption-block');
    const caption = createElement(document, 'span', 'gallery-caption');
    caption.setAttribute('data-gallery-caption', '');
    caption.textContent = images[0].caption;
    captionBlock.appendChild(caption);

    const pagination = createElement(document, 'div', 'gallery-pagination');
    pagination.setAttribute('role', 'group');
    pagination.setAttribute('aria-label', 'Gallery navigation');
    const previous = createElement(document, 'button', 'round-control');
    previous.type = 'button';
    previous.setAttribute('data-gallery-prev', '');
    previous.setAttribute('aria-label', 'Previous image');
    previous.textContent = '‹';
    const count = createElement(document, 'span', 'gallery-count');
    count.setAttribute('data-gallery-count', '');
    const next = createElement(document, 'button', 'round-control');
    next.type = 'button';
    next.setAttribute('data-gallery-next', '');
    next.setAttribute('aria-label', 'Next image');
    next.textContent = '›';
    pagination.append(previous, count, next);
    galleryFooter.append(captionBlock, pagination);
    gallery.appendChild(galleryFooter);

    const status = createElement(document, 'p', 'visually-hidden');
    status.setAttribute('data-gallery-status', '');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    gallery.appendChild(status);

    list.parentNode.replaceChild(gallery, list);
    return gallery;
  }

  class ProductZoom {
    constructor(root, options) {
      if (!root || typeof root.querySelector !== 'function') {
        throw new TypeError('ProductZoom expects a gallery element.');
      }

      this.root = root;
      this.document = root.ownerDocument;
      this.window = (this.document && this.document.defaultView) || host;
      this.media = root.querySelector('[data-zoom-region]');
      this.stage = root.querySelector('[data-zoom-toggle]');
      this.image = root.querySelector('[data-zoom-image]');
      this.items = Array.from(root.querySelectorAll('[data-gallery-item]'));
      this.caption = root.querySelector('[data-gallery-caption]');
      this.indexLabel = root.querySelector('[data-gallery-index]');
      this.countLabel = root.querySelector('[data-gallery-count]');
      this.status = root.querySelector('[data-gallery-status]');
      this.abortController = new this.window.AbortController();
      this.signal = this.abortController.signal;
      this.options = normalizeOptions(Object.assign({}, options, {
        zoomFactor: (options && (options.zoomFactor ?? options.zoom_factor))
          ?? root.getAttribute('data-zoom-factor')
          ?? (options && options.source_image_width && options.thumb_image_width
            ? options.source_image_width / options.thumb_image_width
            : DEFAULTS.zoomFactor)
      }));
      this.index = 0;
      this.pinned = false;
      this.hovering = false;
      this.frame = 0;
      this.pendingOrigin = null;
      this.canHover = true;

      if (!this.media || !this.stage || !this.image || !this.items.length) {
        this.abortController.abort();
        throw new TypeError('ProductZoom requires a zoom region, main image and at least one [data-gallery-item].');
      }

      if (this.window.matchMedia) {
        this.canHover = this.window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      }

      root.style.setProperty('--zoom-factor', String(this.options.zoomFactor));
      this.bindEvents();
      const initialIndex = Math.max(0, this.items.findIndex((item) => item.getAttribute('aria-pressed') === 'true'));
      this.select(initialIndex, false);
    }

    bindEvents() {
      this.items.forEach((item, index) => {
        item.addEventListener('click', () => this.select(index), { signal: this.signal });
      });

      const previous = this.root.querySelector('[data-gallery-prev]');
      const next = this.root.querySelector('[data-gallery-next]');
      if (previous) previous.addEventListener('click', () => this.select(this.index - 1), { signal: this.signal });
      if (next) next.addEventListener('click', () => this.select(this.index + 1), { signal: this.signal });

      this.media.addEventListener('pointerenter', (event) => {
        if (this.options.hoverToZoom && this.isHoverPointer(event)) {
          this.hovering = true;
          this.updateZoomState();
        }
      }, { signal: this.signal });

      this.media.addEventListener('pointermove', (event) => this.trackPointer(event), { signal: this.signal });
      this.media.addEventListener('pointerleave', () => {
        this.hovering = false;
        if (!this.pinned) this.updateZoomState();
      }, { signal: this.signal });

      this.stage.addEventListener('click', (event) => {
        this.pinned = !this.pinned;
        if (event.detail !== 0) this.trackPointer(event, true);
        this.updateZoomState();
      }, { signal: this.signal });

      this.stage.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && this.pinned) {
          event.preventDefault();
          this.pinned = false;
          this.updateZoomState();
        } else if (this.options.keyboard && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
          event.preventDefault();
          this.select(this.index + (event.key === 'ArrowRight' ? 1 : -1));
        }
      }, { signal: this.signal });

      this.root.addEventListener('productzoom:select', (event) => {
        const requested = Number(event.detail && event.detail.index);
        if (Number.isInteger(requested)) this.select(requested);
      }, { signal: this.signal });

      this.image.addEventListener('error', () => {
        this.media.dataset.imageError = 'true';
        if (this.status) this.status.textContent = 'This product image could not be loaded.';
      }, { signal: this.signal });

      this.image.addEventListener('load', () => {
        delete this.media.dataset.imageError;
      }, { signal: this.signal });
    }

    isHoverPointer(event) {
      return this.canHover && event.pointerType !== 'touch';
    }

    trackPointer(event, force) {
      if (event.pointerType === 'touch' && !this.pinned && !force) return;
      if (!force && event.pointerType !== 'touch' && this.options.hoverToZoom && this.canHover) this.hovering = true;

      const rect = this.media.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      this.pendingOrigin = {
        x: percentFromPointer(event.clientX, rect.left, rect.width),
        y: percentFromPointer(event.clientY, rect.top, rect.height)
      };

      if (!this.frame) {
        const requestFrame = this.window.requestAnimationFrame || ((callback) => this.window.setTimeout(callback, 16));
        this.frame = requestFrame.call(this.window, () => {
          this.frame = 0;
          if (!this.pendingOrigin) return;
          this.image.style.transformOrigin = `${this.pendingOrigin.x}% ${this.pendingOrigin.y}%`;
          this.pendingOrigin = null;
        });
      }
      this.updateZoomState();
    }

    updateZoomState() {
      const zoomed = this.pinned || this.hovering;
      this.media.classList.toggle('is-zoomed', zoomed);
      this.media.dataset.zoomed = zoomed ? 'true' : 'false';
      this.stage.setAttribute('aria-pressed', this.pinned ? 'true' : 'false');
      const label = this.image.alt ? ` on ${this.image.alt}` : ' on the product image';
      this.stage.setAttribute('aria-label', `${this.pinned ? 'Zoom active; activate to reset' : 'Zoom in'}${label}`);
    }

    select(requestedIndex, announce) {
      const length = this.items.length;
      const index = ((requestedIndex % length) + length) % length;
      const item = this.items[index];
      const imageData = getItemData(item, index);
      if (!imageData.src) return;

      this.index = index;
      delete this.media.dataset.imageError;
      this.image.src = imageData.src;
      this.image.alt = imageData.alt;
      this.image.dataset.fullSrc = imageData.src;
      this.image.dataset.tone = imageData.tone;
      this.media.dataset.tone = imageData.tone;
      this.pinned = false;
      this.hovering = false;
      this.image.style.transformOrigin = '50% 50%';
      this.updateZoomState();

      this.items.forEach((button, buttonIndex) => {
        button.setAttribute('aria-pressed', buttonIndex === index ? 'true' : 'false');
      });

      const formattedIndex = String(index + 1).padStart(2, '0');
      const formattedTotal = String(length).padStart(2, '0');
      if (this.caption) this.caption.textContent = imageData.caption;
      if (this.indexLabel) this.indexLabel.textContent = `${formattedIndex} / ${formattedTotal}`;
      if (this.countLabel) this.countLabel.textContent = `${formattedIndex} / ${formattedTotal}`;
      this.root.dataset.currentIndex = String(index);

      if (announce !== false && this.status) {
        this.status.textContent = `${imageData.caption}, view ${index + 1} of ${length}.`;
      }

      const EventConstructor = this.window.CustomEvent;
      if (EventConstructor) {
        this.root.dispatchEvent(new EventConstructor('productzoom:change', {
          detail: { index, ...imageData }
        }));
      }
    }

    destroy() {
      this.abortController.abort();
      if (this.frame) {
        const cancelFrame = this.window.cancelAnimationFrame || this.window.clearTimeout;
        cancelFrame.call(this.window, this.frame);
      }
      this.media.classList.remove('is-zoomed');
      delete this.media.dataset.zoomed;
      this.stage.setAttribute('aria-pressed', 'false');
      this.image.style.transformOrigin = '50% 50%';
      instances.delete(this.root);
      delete this.root.__productZoom;
    }
  }

  function init(element, options) {
    if (!element) return null;
    let root = element;
    if (typeof root.matches !== 'function') return null;

    if (root.matches('ul')) {
      root = buildLegacyGallery(root);
      if (!root) return null;
    }

    const existing = instances.get(root) || root.__productZoom;
    if (existing) return existing;

    try {
      const instance = new ProductZoom(root, options);
      instances.set(root, instance);
      root.__productZoom = instance;
      return instance;
    } catch (error) {
      if (host && host.console && typeof host.console.warn === 'function') {
        host.console.warn(error.message);
      }
      return null;
    }
  }

  function initAll(selector, options, scope) {
    const context = scope || (host && host.document);
    if (!context || typeof context.querySelectorAll !== 'function') return [];
    return Array.from(context.querySelectorAll(selector || '[data-product-zoom]'))
      .map((element) => init(element, options))
      .filter(Boolean);
  }

  return Object.freeze({
    defaults: DEFAULTS,
    clamp,
    percentFromPointer,
    normalizeOptions,
    init,
    initAll,
    ProductZoom
  });
});
