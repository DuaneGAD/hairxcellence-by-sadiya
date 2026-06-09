// ============================================================================
//  app.js — UI wiring for the Hairxcellence character-select studio
// ============================================================================
import { CONFIG, COLORS, STYLES, SIGNATURE_WORDS } from './data.js';
// Three.js (mannequin.js) is imported lazily in init() so that a CDN/WebGL
// failure degrades to the SVG fallback instead of breaking the whole UI.

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const state = { index: 0, colorIndex: STYLES[0].defaultColor, cart: 0 };
let stage3d = null;        // Mannequin instance (or null in fallback mode)
let fallbackEl = null;

// Cheap WebGL probe (doesn't pull in Three.js)
function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext &&
      (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (e) { return false; }
}

// ---------------------------------------------------------------------------
//  WhatsApp link builder — reused by the FAB, order button & hero
// ---------------------------------------------------------------------------
function waLink(text) {
  if (CONFIG.whatsapp === '233000000000') {
    console.warn('[Hairxcellence] Set the real WhatsApp number in js/data.js (CONFIG.whatsapp).');
  }
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
}
function orderMessage() {
  const s = STYLES[state.index];
  const c = COLORS[state.colorIndex];
  return `Hi Sadiya! 👋 I'd love to order the ${s.name} — Length ${s.length}, ` +
    `Colour ${c.name}, Style ${s.styleTag} (${CONFIG.currency}${s.price}). Is it available?`;
}
const GENERIC_MSG = `Hi Sadiya! 👋 I'd like to enquire about your luxury wigs.`;

function refreshWaLinks() {
  const order = waLink(orderMessage());
  $('#order-wa').href = order;
  $('#fab').href = order;
}

// ---------------------------------------------------------------------------
//  Build roster + swatches
// ---------------------------------------------------------------------------
function miniBust(shape, hex) {
  // tiny silhouette for roster tiles; hair shape hinted via path set
  const hairByShape = {
    afro: `<circle cx="40" cy="33" r="27" fill="${hex}"/>`,
    pixie: `<path d="M16 36 Q16 12 40 12 Q64 12 64 36 Q64 22 40 22 Q16 22 16 36Z" fill="${hex}"/>`,
    bob: `<path d="M14 40 Q14 10 40 10 Q66 10 66 40 L66 56 Q60 50 58 40 Q58 22 40 22 Q22 22 22 40 Q20 50 14 56Z" fill="${hex}"/>`,
    long: `<path d="M14 44 Q14 10 40 10 Q66 10 66 44 L64 78 Q58 60 56 42 Q56 22 40 22 Q24 22 24 42 Q22 60 16 78Z" fill="${hex}"/>`,
  };
  const hair = hairByShape[shape] || hairByShape.long;
  return `<svg viewBox="0 0 80 84" class="mini">
    <ellipse cx="40" cy="60" rx="20" ry="22" fill="#c9c3c2"/>
    <rect x="34" y="40" width="12" height="18" rx="5" fill="#c9c3c2"/>
    <ellipse cx="40" cy="34" rx="20" ry="22" fill="#cdc7c6"/>
    ${hair}
  </svg>`;
}

function buildRoster() {
  const list = $('#roster');
  list.innerHTML = '';
  STYLES.forEach((s, i) => {
    const hex = COLORS[s.defaultColor].hex;
    const seg = Array.from({ length: 4 }, (_, k) =>
      `<i class="${k < s.signature ? 'on' : ''}"></i>`).join('');
    const tile = document.createElement('button');
    tile.className = 'tile';
    tile.type = 'button';
    tile.dataset.index = i;
    tile.setAttribute('role', 'option');
    tile.setAttribute('aria-selected', 'false');
    tile.innerHTML = `
      <span class="tile__num">${String(i + 1).padStart(2, '0')}</span>
      <span class="tile__bust">${miniBust(s.hair.shape, hex)}</span>
      <span class="tile__name">${s.name}</span>
      <span class="tile__meter">${seg}</span>
      <span class="tile__price">${CONFIG.currency}${s.price}</span>`;
    tile.addEventListener('click', () => select(i, true));
    list.appendChild(tile);
  });
}

function buildSwatches() {
  const wrap = $('#swatches');
  wrap.innerHTML = '';
  COLORS.forEach((c, i) => {
    const b = document.createElement('button');
    b.className = 'swatch';
    b.type = 'button';
    b.style.setProperty('--c', c.hex);
    b.dataset.index = i;
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', 'false');
    b.setAttribute('aria-label', c.name);
    b.title = c.name;
    b.addEventListener('click', () => setColor(i));
    wrap.appendChild(b);
  });
  // keyboard support for the radiogroup
  wrap.addEventListener('keydown', (e) => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault();
    const dir = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1;
    setColor((state.colorIndex + dir + COLORS.length) % COLORS.length, true);
  });
}

// ---------------------------------------------------------------------------
//  Selection
// ---------------------------------------------------------------------------
function select(i, fromUser = false) {
  const n = STYLES.length;
  state.index = (i + n) % n;
  const s = STYLES[state.index];
  state.colorIndex = s.defaultColor;

  pushStage();

  // roster
  $$('#roster .tile').forEach((t) => {
    const on = +t.dataset.index === state.index;
    t.classList.toggle('is-selected', on);
    t.setAttribute('aria-selected', String(on));
    if (on && fromUser) t.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  });

  // spec
  $('#spec-name').textContent = s.name;
  $('#spec-vibe').textContent = s.vibe;
  $('#f-length').textContent = s.length;
  $('#f-texture').textContent = s.texture;
  $('#f-style').textContent = s.styleTag;
  $('#price-amt').textContent = `${CONFIG.currency}${s.price}`;
  $('#counter-now').textContent = String(state.index + 1).padStart(2, '0');

  // signature meter
  $('#sig-bar').innerHTML = Array.from({ length: 4 }, (_, k) =>
    `<i class="${k < s.signature ? 'on' : ''}"></i>`).join('');
  $('#sig-word').textContent = SIGNATURE_WORDS[s.signature] || '';

  updateColorUI();
  refreshWaLinks();
  flashSelect();
  wobblePrice();
}

// Apply the current style + colour to whichever renderer is ready (3D or SVG)
function pushStage() {
  const s = STYLES[state.index];
  const hex = COLORS[state.colorIndex].hex;
  if (stage3d) { stage3d.setColor(hex); stage3d.setStyle(s); }
  else if (fallbackEl) updateFallback(s, hex);
}

function setColor(i, fromKey = false) {
  state.colorIndex = i;
  const c = COLORS[i];
  if (stage3d) stage3d.setColor(c.hex);
  else updateFallback(STYLES[state.index], c.hex);
  updateColorUI();
  refreshWaLinks();
  wobblePrice();
}

function updateColorUI() {
  $('#f-colour').textContent = COLORS[state.colorIndex].name;
  $$('#swatches .swatch').forEach((b) => {
    const on = +b.dataset.index === state.colorIndex;
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-checked', String(on));
    b.tabIndex = on ? 0 : -1;
  });
}

// ---------------------------------------------------------------------------
//  Micro-interactions
// ---------------------------------------------------------------------------
let stampT;
function flashSelect() {
  const el = $('#select-stamp');
  el.classList.remove('show');
  void el.offsetWidth;        // restart animation
  el.classList.add('show');
  clearTimeout(stampT);
  stampT = setTimeout(() => el.classList.remove('show'), 900);
}
let wobbleT;
function wobblePrice() {
  const el = $('#price-tag');
  el.classList.remove('wobble');
  void el.offsetWidth;
  el.classList.add('wobble');
  clearTimeout(wobbleT);
  wobbleT = setTimeout(() => el.classList.remove('wobble'), 600);
}
let toastT;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove('show'), 2400);
}

// ---------------------------------------------------------------------------
//  Search
// ---------------------------------------------------------------------------
function wireSearch() {
  const input = $('#search');
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    let shown = 0;
    $$('#roster .tile').forEach((t) => {
      const s = STYLES[+t.dataset.index];
      const hay = `${s.name} ${s.styleTag} ${s.texture} ${s.length}`.toLowerCase();
      const match = !q || hay.includes(q);
      t.hidden = !match;
      if (match) shown++;
    });
    $('#roster-empty').hidden = shown > 0;
  });
}

// ---------------------------------------------------------------------------
//  Navigation: arrows, keyboard
// ---------------------------------------------------------------------------
function wireNav() {
  $('#prev').addEventListener('click', () => select(state.index - 1, true));
  $('#next').addEventListener('click', () => select(state.index + 1, true));
  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName);
    if (typing) return;
    if (e.key === 'ArrowLeft') { select(state.index - 1, true); }
    else if (e.key === 'ArrowRight') { select(state.index + 1, true); }
  });
}

// ---------------------------------------------------------------------------
//  Window chrome (the playful macOS traffic lights)
// ---------------------------------------------------------------------------
function wireChrome() {
  const win = $('#appwin');
  $('.light--close').addEventListener('click', () =>
    toast('You can\'t close perfection 💅 — scroll on.'));
  $('.light--min').addEventListener('click', () => {
    win.classList.toggle('is-min');
    if (win.classList.contains('is-min')) {
      win.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  });
  $('.light--max').addEventListener('click', () => win.classList.toggle('is-max'));
}

// ---------------------------------------------------------------------------
//  CTAs
// ---------------------------------------------------------------------------
function wireCtas() {
  $('#add-cart').addEventListener('click', () => {
    state.cart++;
    const chip = $('#cart-chip');
    chip.hidden = false;
    chip.textContent = state.cart;
    chip.classList.remove('bump'); void chip.offsetWidth; chip.classList.add('bump');
    toast(`${STYLES[state.index].name} added ✓`);
  });
  $('#apple-pay').addEventListener('click', () =>
    toast('Apple Pay is coming soon — tap “Order on WhatsApp” 💬'));

  // generic enquiry links
  $$('.js-wa[data-wa-generic]').forEach((a) => { a.href = waLink(GENERIC_MSG); });
}

// ---------------------------------------------------------------------------
//  Contact section content
// ---------------------------------------------------------------------------
function fillContact() {
  $('#v-location').textContent = CONFIG.location;
  $('#v-maps').href = CONFIG.mapsUrl;
  $('#v-ig').href = `https://instagram.com/${CONFIG.instagram}`;
  $('#v-ig').textContent = `@${CONFIG.instagram} →`;
  $('#v-hours').innerHTML = CONFIG.hours
    .map(([d, h]) => `<li><span>${d}</span><span>${h}</span></li>`).join('');
  $('#year').textContent = new Date().getFullYear();
}

// ---------------------------------------------------------------------------
//  Scroll reveal
// ---------------------------------------------------------------------------
function wireReveal() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.18 });
  $$('.about, .visit, .section-head').forEach((el) => io.observe(el));
}

// ---------------------------------------------------------------------------
//  Fallback bust (no WebGL)
// ---------------------------------------------------------------------------
function setupFallback() {
  const host = $('#stage-fallback');
  host.hidden = false;
  $('#stage-canvas').hidden = true;
  host.innerHTML = `<div class="fb-rot" id="fb-rot"><div class="fb-svg" id="fb-svg"></div></div>`;
  fallbackEl = { rot: $('#fb-rot'), svg: $('#fb-svg'), ry: -12 };

  // drag to "rotate" via rotateY + auto-spin until first drag
  let drag = false, lastX = 0, auto = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const apply = () => { fallbackEl.rot.style.transform = `rotateY(${fallbackEl.ry}deg)`; };
  const tick = () => { if (auto) { fallbackEl.ry += 0.25; apply(); } requestAnimationFrame(tick); };
  host.addEventListener('pointerdown', (e) => {
    drag = true; auto = false; lastX = e.clientX;
    host.setPointerCapture(e.pointerId); $('#rotate-hint').classList.add('gone');
  });
  host.addEventListener('pointermove', (e) => {
    if (!drag) return; fallbackEl.ry += (e.clientX - lastX) * 0.5; lastX = e.clientX; apply();
  });
  host.addEventListener('pointerup', () => { drag = false; });
  requestAnimationFrame(tick);
}

function updateFallback(s, hex) {
  if (!fallbackEl) return;
  const shape = s.hair.shape;
  const hairByShape = {
    afro: `<circle cx="120" cy="120" r="92" fill="${hex}"/>`,
    pixie: `<path d="M40 128 Q40 40 120 40 Q200 40 200 128 Q200 76 120 76 Q40 76 40 128Z" fill="${hex}"/>`,
    bob: `<path d="M36 150 Q36 36 120 36 Q204 36 204 150 L204 210 Q188 188 184 150 Q184 84 120 84 Q56 84 56 150 Q52 188 36 210Z" fill="${hex}"/>`,
    long: `<path d="M36 160 Q36 36 120 36 Q204 36 204 160 L196 300 Q180 230 178 150 Q178 84 120 84 Q62 84 62 150 Q60 230 44 300Z" fill="${hex}"/>`,
  };
  const hair = hairByShape[shape] || hairByShape.long;
  fallbackEl.svg.innerHTML = `<svg viewBox="0 0 240 320" class="fb-bust">
    <ellipse cx="120" cy="300" rx="84" ry="18" fill="rgba(0,0,0,.22)"/>
    <path d="M62 320 Q62 246 120 232 Q178 246 178 320Z" fill="#c9c3c2"/>
    <rect x="104" y="206" width="32" height="44" rx="13" fill="#c9c3c2"/>
    <ellipse cx="120" cy="150" rx="64" ry="76" fill="#cdc7c6"/>
    ${hair}
  </svg>`;
}

// ---------------------------------------------------------------------------
//  Boot
// ---------------------------------------------------------------------------
async function init() {
  buildRoster();
  buildSwatches();
  wireSearch();
  wireNav();
  wireChrome();
  wireCtas();
  fillContact();
  wireReveal();

  // Reveal the UI immediately; the 3D stage streams in when ready.
  select(0);
  document.body.classList.add('booted');

  const canvas = $('#stage-canvas');
  let ready3d = false;
  if (hasWebGL()) {
    try {
      const { Mannequin } = await import('./mannequin.js');
      stage3d = new Mannequin(canvas, {
        onFirstInteract: () => $('#rotate-hint').classList.add('gone'),
      });
      ready3d = true;
    } catch (err) {
      console.warn('[Hairxcellence] 3D unavailable, using SVG fallback.', err);
      stage3d = null;
    }
  }
  if (!ready3d) setupFallback();
  pushStage();   // push current style/colour into the now-ready stage
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
