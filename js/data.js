// ============================================================================
//  Hairxcellence by Sadiya — catalogue + business config
//  EDIT THIS FILE to change styles, prices, colours and contact details.
//  Everything else reads from here.
// ============================================================================

// ---- Business details ------------------------------------------------------
// ⚠️  REPLACE the WhatsApp number with Sadiya's real number in full
//     international format, digits only, no "+" / spaces (Ghana = 233...).
//     e.g. 0244 123 456  ->  '233244123456'
export const CONFIG = {
  brand: 'Hairxcellence by Sadiya',
  currency: '₵',                       // Ghana cedi symbol used on price tags
  whatsapp: '233509949405',            // Sadiya's WhatsApp (0509949405 in intl format)
  instagram: 'hairxcellence_bysadiya', // ← handle without the @
  location: 'East Legon, Accra · Ghana',
  // ← replace with a real Google Maps place link / plus-code for the studio
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hairxcellence+by+Sadiya+East+Legon+Accra',
  hours: [
    ['Mon – Fri', '9:00 – 19:00'],
    ['Saturday', '9:00 – 18:00'],
    ['Sunday', 'By appointment'],
  ],
};

// ---- Colour swatches (recolour the wig live) -------------------------------
// Order = display order. `hex` is the actual rendered colour.
export const COLORS = [
  { name: 'Noir / Jet Black', hex: '#13110f' },
  { name: 'Espresso Brown',   hex: '#4a2c1a' },
  { name: 'Honey Blonde',     hex: '#c99a5b' },
  { name: 'Auburn / Ginger',  hex: '#9c3b16' },
  { name: 'Burgundy',         hex: '#5e1126' },
  { name: 'Platinum',         hex: '#e6e0d4' },
];

// ---- Signature meter wording (0–4) -----------------------------------------
export const SIGNATURE_WORDS = ['Subtle', 'Everyday', 'Elevated', 'Statement', 'Show-stopper'];

// ---- The roster ------------------------------------------------------------
//  hair.shape drives the procedural 3D mesh:
//    'afro'  — big round volume, no fall
//    'pixie' — close-cropped cap, no fall
//    'bob'   — cap + short jaw-length fall with a slight flare
//    'long'  — cap + long fall (wave/flare/length tune the silhouette)
//  Tuning fields (all optional, sensible defaults applied in mannequin.js):
//    capRadius, capTheta, volume, length (fall), wave, flare, gap (front opening rad)
export const STYLES = [
  {
    id: 'afro-crown',
    name: 'Afro Crown',
    length: 'Natural',
    texture: 'Kinky Coily',
    styleTag: 'Afro',
    price: 450,
    signature: 4,
    vibe: 'A round, sculptural halo — the crown that turns every head.',
    defaultColor: 0,
    hair: { shape: 'afro', capRadius: 1.46, capTheta: 2.2, volume: 0.46 },
  },
  {
    id: 'body-wave-32',
    name: 'Body Wave 32"',
    length: '32"',
    texture: 'Body Wave',
    styleTag: 'Wavy',
    price: 500,
    signature: 4,
    vibe: 'Statement length with soft, directional movement.',
    defaultColor: 0,
    hair: { shape: 'long', capRadius: 1.1, capTheta: 1.52, volume: 0.13, length: 1.95, wave: 0.17, flare: 0.06, gap: 2.0 },
  },
  {
    id: 'blunt-bob',
    name: 'Blunt Bob',
    length: '12"',
    texture: 'Straight · Bangs',
    styleTag: 'Bob',
    price: 350,
    signature: 3,
    vibe: 'A sharp, glossy line that frames the jaw.',
    defaultColor: 0,
    hair: { shape: 'bob', capRadius: 1.12, capTheta: 1.66, volume: 0.07, length: 0.72, wave: 0.03, flare: 0.13, gap: 1.5 },
  },
  {
    id: 'honey-lob',
    name: 'Honey Lob',
    length: '16"',
    texture: 'Soft Waves',
    styleTag: 'Lob',
    price: 420,
    signature: 3,
    vibe: 'Sun-warmed waves that fall just past the shoulder.',
    defaultColor: 2, // Honey Blonde
    hair: { shape: 'long', capRadius: 1.09, capTheta: 1.55, volume: 0.13, length: 1.15, wave: 0.13, flare: 0.09, gap: 2.05 },
  },
  {
    id: 'pixie-crop',
    name: 'Pixie Crop',
    length: '4"',
    texture: 'Tapered Cut',
    styleTag: 'Pixie',
    price: 280,
    signature: 2,
    vibe: 'Cropped, tapered and effortlessly bold.',
    defaultColor: 0,
    hair: { shape: 'pixie', capRadius: 1.05, capTheta: 1.5, volume: 0.06 },
  },
  {
    id: 'sleek-straight-28',
    name: 'Sleek Straight 28"',
    length: '28"',
    texture: 'Bone Straight',
    styleTag: 'Straight',
    price: 480,
    signature: 4,
    vibe: 'Liquid, mirror-flat length with a razor finish.',
    defaultColor: 0,
    hair: { shape: 'long', capRadius: 1.07, capTheta: 1.5, volume: 0.06, length: 2.05, wave: 0.04, flare: -0.02, gap: 1.9 },
  },
];
