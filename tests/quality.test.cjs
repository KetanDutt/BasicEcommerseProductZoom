const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const zoom = require('../js/jqzoom.js');


test('zoom options are immutable, bounded and safe for malformed input', () => {
  const defaults = zoom.normalizeOptions();
  assert.deepEqual(defaults, { zoomFactor: 2.35, hoverToZoom: true, keyboard: true });
  assert.equal(Object.isFrozen(defaults), true);

  const custom = zoom.normalizeOptions({ zoomFactor: 2.8, hoverToZoom: false, keyboard: false });
  assert.deepEqual(custom, { zoomFactor: 2.8, hoverToZoom: false, keyboard: false });

  assert.equal(zoom.normalizeOptions({ zoom_factor: 40 }).zoomFactor, 4);
  assert.equal(zoom.normalizeOptions({ zoomFactor: 0 }).zoomFactor, defaults.zoomFactor);
  assert.equal(zoom.normalizeOptions({ zoomFactor: 'not-a-number' }).zoomFactor, defaults.zoomFactor);
  assert.equal(zoom.normalizeOptions({ source_image_width: 1200, thumb_image_width: 300 }).zoomFactor, 4);
  assert.equal(zoom.normalizeOptions({ source_image_width: 1200, thumb_image_width: 0 }).zoomFactor, defaults.zoomFactor);
});


test('pointer coordinates are converted to bounded percentages', () => {
  assert.equal(zoom.percentFromPointer(65, 15, 100), 50);
  assert.equal(zoom.percentFromPointer(-5, 0, 100), 0);
  assert.equal(zoom.percentFromPointer(200, 0, 100), 100);
  assert.equal(zoom.percentFromPointer(10, 0, 0), 50);
  assert.equal(zoom.percentFromPointer(Number.NaN, 0, 100), 50);
});


test('the module can be imported without a browser and rejects a missing gallery safely', () => {
  assert.equal(typeof zoom.init, 'function');
  assert.equal(typeof zoom.initAll, 'function');
  assert.equal(zoom.init(null), null);
  assert.deepEqual(zoom.initAll('[data-product-zoom]', {}, {}), []);
});


test('the static product page has a title, one primary heading and accessible images', () => {
  const html = read('index.html');
  assert.match(html, /<title>[^<]+<\/title>/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /data-product-zoom/);
  assert.match(html, /data-gallery-item/g);
  assert.match(html, /name="robots" content="noindex, nofollow"/);
  assert.match(html, /data-price-cents="\d+"/);

  const images = Array.from(html.matchAll(/<img\b([^>]*)>/g), (match) => match[1]);
  assert.ok(images.length >= 5, 'expected the main view, thumbnails, lightbox and editorial image');
  for (const attributes of images) {
    assert.match(attributes, /\balt="[^"]*"/, `image is missing an alt attribute: ${attributes}`);
  }
});


test('all referenced page assets exist with exact path casing', () => {
  const html = read('index.html');
  const references = Array.from(html.matchAll(/\b(?:src|href|data-src|data-zoom-src)="([^"]+)"/g), (match) => match[1]);

  for (const reference of references) {
    if (reference.startsWith('#') || /^(?:data:|mailto:|tel:|https?:)/i.test(reference)) continue;
    const filePath = path.resolve(root, decodeURIComponent(reference.split('#')[0]));
    assert.ok(fs.existsSync(filePath), `missing local reference: ${reference}`);
  }
});


test('in-page links and ARIA ID references resolve to unique elements', () => {
  const html = read('index.html');
  const ids = Array.from(html.matchAll(/\bid="([^"]+)"/g), (match) => match[1]);
  const uniqueIds = new Set(ids);
  assert.equal(uniqueIds.size, ids.length, 'HTML id attributes should be unique');

  for (const [, fragment] of html.matchAll(/\bhref="#([^"]+)"/g)) {
    assert.ok(uniqueIds.has(fragment), `in-page link target #${fragment} does not exist`);
  }
  for (const [, references] of html.matchAll(/\baria-(?:controls|labelledby|describedby)="([^"]+)"/g)) {
    for (const id of references.split(/\s+/)) {
      assert.ok(uniqueIds.has(id), `ARIA reference #${id} does not exist`);
    }
  }
});


test('runtime assets are local, syntax-valid and free of HTML string injection', () => {
  const html = read('index.html');
  const scripts = Array.from(html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g), (match) => match[1]);
  assert.deepEqual(scripts, ['js/jqzoom.js', 'js/storefront.js']);
  assert.doesNotMatch(html, /<script\b(?![^>]*\bsrc=)/i, 'page should not contain inline scripts');

  for (const file of scripts) {
    const source = read(file);
    assert.doesNotMatch(source, /\b(?:fetch|XMLHttpRequest)\s*\(/, `${file} should not make network calls`);
    assert.doesNotMatch(source, /\.innerHTML\s*=/, `${file} should not inject HTML strings`);
    assert.doesNotThrow(() => new vm.Script(source, { filename: file }));
  }

  const css = read('css/site.css');
  assert.match(css, /prefers-reduced-motion/);
  assert.doesNotMatch(css, /url\(\s*["']?https?:/i, 'stylesheet should not load remote assets');
});


test('optimized demo images stay within the per-file size budget', () => {
  const files = fs.readdirSync(path.join(root, 'assets')).filter((name) => name.endsWith('.jpg'));
  assert.equal(files.length, 6, 'expected three gallery images and three smaller thumbnails');
  for (const file of files) {
    const size = fs.statSync(path.join(root, 'assets', file)).size;
    assert.ok(size <= 200_000, `${file} is ${size} bytes; expected at most 200 KB`);
  }
});


test('all maintained documentation links point to project files', () => {
  const readme = read('README.md');
  const links = Array.from(readme.matchAll(/\]\((docs\/[^)]+)\)/g), (match) => match[1]);
  assert.ok(links.length >= 5);
  for (const link of links) {
    assert.ok(fs.existsSync(path.join(root, link)), `missing documentation: ${link}`);
  }
});
