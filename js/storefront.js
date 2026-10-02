/* Small, browser-only interactions for the product-page demonstration. */
(function () {
  'use strict';

  const priceElement = document.querySelector('[data-product-price]');
  const rawPrice = priceElement && priceElement.getAttribute('data-price-cents');
  const configuredPrice = typeof rawPrice === 'string' && rawPrice.trim() ? Number(rawPrice) : Number.NaN;
  const PRODUCT = Object.freeze({
    id: 'fieldnote-green-stone-demo',
    name: 'Oval green gemstone',
    priceCents: Number.isSafeInteger(configuredPrice) && configuredPrice >= 0 ? configuredPrice : 42000,
    image: 'assets/green-stone-light-thumb.jpg'
  });
  const MAX_QUANTITY = 9;
  const BAG_KEY = 'fieldnote-sample-bag-v1';
  const WISHLIST_KEY = 'fieldnote-sample-wishlist-v1';
  const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const quantityInput = document.querySelector('[data-quantity]');
  const bagDialog = document.querySelector('[data-bag-dialog]');
  const lightboxDialog = document.querySelector('[data-lightbox-dialog]');
  const gallery = document.querySelector('[data-product-zoom]');
  const bagLines = document.querySelector('[data-bag-lines]');
  const bagEmpty = document.querySelector('[data-bag-empty]');
  const bagSummary = document.querySelector('[data-bag-summary]');
  const status = document.querySelector('[data-store-status]');
  let bag = loadBag();

  function safeGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function safeSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      return false;
    }
  }

  function formatPrice(cents) {
    return currency.format(cents / 100);
  }

  function normalizeQuantity(value) {
    const quantity = Number.parseInt(value, 10);
    if (!Number.isFinite(quantity)) return 1;
    return Math.min(MAX_QUANTITY, Math.max(1, quantity));
  }

  function loadBag() {
    const stored = safeGet(BAG_KEY);
    if (!stored) return [];

    try {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((item) => item && item.id === PRODUCT.id)
        .slice(0, 1)
        .map((item) => ({ id: PRODUCT.id, quantity: normalizeQuantity(item.quantity) }));
    } catch (error) {
      return [];
    }
  }

  function saveBag() {
    return safeSet(BAG_KEY, JSON.stringify(bag));
  }

  function getBagQuantity() {
    return bag.reduce((sum, item) => sum + item.quantity, 0);
  }

  function announce(message) {
    if (status) status.textContent = message;
  }

  function openDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  }

  function closeDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.close === 'function' && dialog.open) {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }
  }

  function makeElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function renderBag() {
    const quantity = getBagQuantity();
    document.querySelectorAll('[data-bag-count]').forEach((counter) => {
      counter.textContent = quantity > 99 ? '99+' : String(quantity);
      counter.setAttribute('aria-label', `${quantity} ${quantity === 1 ? 'item' : 'items'} in sample bag`);
    });

    const dialogCount = document.querySelector('[data-dialog-bag-count]');
    if (dialogCount) dialogCount.textContent = `(${quantity})`;

    const hasItems = quantity > 0;
    if (bagEmpty) bagEmpty.hidden = hasItems;
    if (bagSummary) bagSummary.hidden = !hasItems;
    if (!bagLines) return;

    bagLines.replaceChildren();
    if (!hasItems) return;

    const line = makeElement('article', 'bag-line');
    const image = makeElement('img');
    image.src = PRODUCT.image;
    image.alt = '';
    image.width = 86;
    image.height = 86;
    image.loading = 'lazy';

    const details = makeElement('div', 'bag-line__details');
    details.appendChild(makeElement('p', 'bag-line__name', PRODUCT.name));
    details.appendChild(makeElement('p', 'bag-line__quantity', `Sample quantity: ${quantity}`));
    const remove = makeElement('button', 'bag-remove', 'Remove');
    remove.type = 'button';
    remove.setAttribute('data-remove-item', '');
    remove.setAttribute('aria-label', `Remove ${PRODUCT.name} from the sample bag`);
    details.appendChild(remove);

    const price = makeElement('strong', 'bag-line__price', formatPrice(PRODUCT.priceCents * quantity));
    line.append(image, details, price);
    bagLines.appendChild(line);

    const total = document.querySelector('[data-bag-total]');
    if (total) total.textContent = formatPrice(PRODUCT.priceCents * quantity);
  }

  function currentView() {
    if (!gallery) return null;
    const active = gallery.querySelector('[data-gallery-item][aria-pressed="true"]');
    if (!active) return null;
    return {
      src: active.getAttribute('data-zoom-src') || active.getAttribute('data-src'),
      alt: active.getAttribute('data-alt') || '',
      caption: active.getAttribute('data-caption') || active.getAttribute('aria-label') || '',
      tone: active.getAttribute('data-tone') || 'light'
    };
  }

  function updateLightbox(force) {
    if (!lightboxDialog || (!force && !lightboxDialog.open)) return;
    const view = currentView();
    if (!view) return;

    const image = lightboxDialog.querySelector('[data-lightbox-image]');
    const caption = lightboxDialog.querySelector('[data-lightbox-caption]');
    const count = lightboxDialog.querySelector('[data-lightbox-count]');
    const activeIndex = Array.from(gallery.querySelectorAll('[data-gallery-item]'))
      .findIndex((item) => item.getAttribute('aria-pressed') === 'true');
    const total = gallery.querySelectorAll('[data-gallery-item]').length;

    if (image) {
      image.src = view.src;
      image.alt = view.alt;
      image.dataset.tone = view.tone;
    }
    if (caption) caption.textContent = view.caption;
    if (count) count.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  }

  function selectViewByOffset(offset) {
    if (!gallery) return;
    const items = Array.from(gallery.querySelectorAll('[data-gallery-item]'));
    const activeIndex = items.findIndex((item) => item.getAttribute('aria-pressed') === 'true');
    if (!items.length) return;
    gallery.dispatchEvent(new CustomEvent('productzoom:select', {
      detail: { index: activeIndex + offset }
    }));
  }

  function addToBag() {
    const requested = normalizeQuantity(quantityInput ? quantityInput.value : 1);
    if (quantityInput) quantityInput.value = String(requested);
    const existing = bag.find((item) => item.id === PRODUCT.id);
    const added = existing ? Math.min(MAX_QUANTITY, existing.quantity + requested) : requested;
    bag = [{ id: PRODUCT.id, quantity: added }];
    const saved = saveBag();
    renderBag();
    announce(`${PRODUCT.name} added to the sample bag. ${added} ${added === 1 ? 'item' : 'items'} total.${saved ? '' : ' This browser does not allow local storage; the bag will reset when this page is closed.'}`);
    openDialog(bagDialog);
  }

  function initialiseQuantity() {
    if (!quantityInput) return;

    document.querySelectorAll('[data-quantity-step]').forEach((button) => {
      button.addEventListener('click', () => {
        const step = Number(button.getAttribute('data-quantity-step')) || 0;
        quantityInput.value = String(normalizeQuantity(Number(quantityInput.value) + step));
      });
    });

    quantityInput.addEventListener('change', () => {
      quantityInput.value = String(normalizeQuantity(quantityInput.value));
    });
  }

  function initialiseDialogs() {
    document.querySelectorAll('[data-dialog-close]').forEach((button) => {
      button.addEventListener('click', () => closeDialog(button.closest('dialog')));
    });

    document.querySelectorAll('dialog').forEach((dialog) => {
      dialog.addEventListener('click', (event) => {
        if (event.target === dialog) closeDialog(dialog);
      });
    });

    document.querySelectorAll('[data-open-bag]').forEach((button) => {
      button.addEventListener('click', () => {
        renderBag();
        openDialog(bagDialog);
      });
    });

    document.querySelectorAll('[data-add-to-bag]').forEach((button) => {
      button.addEventListener('click', addToBag);
    });

    if (bagLines) {
      bagLines.addEventListener('click', (event) => {
        if (!event.target.closest('[data-remove-item]')) return;
        bag = [];
        saveBag();
        renderBag();
        announce('The sample item was removed from the bag.');
      });
    }

    const fullscreenButton = document.querySelector('[data-lightbox-open]');
    if (fullscreenButton) {
      fullscreenButton.addEventListener('click', () => {
        updateLightbox(true);
        openDialog(lightboxDialog);
      });
    }

    const lightboxPrevious = document.querySelector('[data-lightbox-prev]');
    const lightboxNext = document.querySelector('[data-lightbox-next]');
    if (lightboxPrevious) lightboxPrevious.addEventListener('click', () => selectViewByOffset(-1));
    if (lightboxNext) lightboxNext.addEventListener('click', () => selectViewByOffset(1));

    if (lightboxDialog) {
      lightboxDialog.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          selectViewByOffset(-1);
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          selectViewByOffset(1);
        }
      });
    }

    if (gallery) gallery.addEventListener('productzoom:change', updateLightbox);
  }

  function initialiseWishlist() {
    const button = document.querySelector('[data-wishlist]');
    if (!button) return;

    const label = button.querySelector('[data-wishlist-label]');
    let saved = safeGet(WISHLIST_KEY) === 'true';
    const update = () => {
      button.setAttribute('aria-pressed', saved ? 'true' : 'false');
      if (label) label.textContent = saved ? 'Saved for later' : 'Save for later';
    };

    update();
    button.addEventListener('click', () => {
      saved = !saved;
      const persisted = safeSet(WISHLIST_KEY, String(saved));
      update();
      if (saved) {
        announce(persisted
          ? 'This sample item is saved on this device.'
          : 'This sample item is saved for this session only because browser storage is unavailable.');
      } else {
        announce('This sample item was removed from saved items.');
      }
    });
  }

  window.addEventListener('storage', (event) => {
    if (event.key === BAG_KEY) {
      bag = loadBag();
      renderBag();
    }
    if (event.key === WISHLIST_KEY) {
      const button = document.querySelector('[data-wishlist]');
      const label = button && button.querySelector('[data-wishlist-label]');
      const saved = event.newValue === 'true';
      if (button) button.setAttribute('aria-pressed', saved ? 'true' : 'false');
      if (label) label.textContent = saved ? 'Saved for later' : 'Save for later';
    }
  });

  const addButtonPrice = document.querySelector('[data-add-button-price]');
  if (priceElement) priceElement.textContent = formatPrice(PRODUCT.priceCents);
  if (addButtonPrice) addButtonPrice.textContent = formatPrice(PRODUCT.priceCents);

  renderBag();
  initialiseQuantity();
  initialiseDialogs();
  initialiseWishlist();
})();
