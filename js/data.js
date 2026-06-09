// ============================================================================
//  Hairxcellence by Sadiya — catalogue + business config
//  EDIT THIS FILE to change styles, prices, colours and contact details.
//  Everything else reads from here.
// ============================================================================

// ---- Business details ------------------------------------------------------
export const CONFIG = {
  brand: 'Hairxcellence by Sadiya',
  currency: '₵',                       // Ghana cedi symbol used on price tags
  whatsapp: '233509949405',            // Sadiya's WhatsApp (0509949405 in intl format)
  instagram: 'hairxcellence_bysadiya', // ← handle without the @
  location: 'Accra · Ghana',
  // Real Google Maps place link for the store (HairXcellence | Gia)
  mapsUrl: 'https://www.google.com/maps/place/HairXcellence+%7C+Gia/@5.6119529,-0.2015753,19.82z/data=!4m14!1m7!3m6!1s0xfdf9b006aeeb21b:0x8f7e175f967fca8a!2sHairXcellence+%7C+Gia!8m2!3d5.6121305!4d-0.2012946!16s%2Fg%2F11njwy3qqm!3m5!1s0xfdf9b006aeeb21b:0x8f7e175f967fca8a!8m2!3d5.6121305!4d-0.2012946!16s%2Fg%2F11njwy3qqm',
  hours: [
    ['Mon – Fri', '9:00 – 19:00'],
    ['Saturday', '9:00 – 18:00'],
    ['Sunday', 'By appointment'],
  ],
};

// ---- Colour swatches (recolour the wig live) -------------------------------
export const COLORS = [
  { name: 'Noir / Jet Black', hex: '#13110f' },
  { name: 'Espresso Brown',   hex: '#4a2c1a' },
  { name: 'Honey Blonde',     hex: '#c99a5b' },
  { name: 'Auburn / Ginger',  hex: '#9c3b16' },
  { name: 'Burgundy',         hex: '#5e1126' },
  { name: 'Platinum',         hex: '#e6e0d4' },
];

// ---- Length options (typeable dropdown). Sadiya stocks 16"–32" -------------
export const LENGTHS = ['16"', '18"', '20"', '22"', '24"', '26"', '28"', '30"', '32"'];

// ---- Signature meter wording (0–4) -----------------------------------------
export const SIGNATURE_WORDS = ['Subtle', 'Everyday', 'Elevated', 'Statement', 'Show-stopper'];

// ---- The roster ------------------------------------------------------------
//  All styles are available 16"–32"; `defaultLength` is just the starting pick.
//  ⚠️ PRICES below are placeholders — set Sadiya's real prices (in cedis).
//  hair.shape drives the procedural 3D mesh:
//    'afro'  — big round volume, no fall
//    'pixie' — close-cropped cap, no fall
//    'bob'   — cap + short jaw-length fall with a slight flare
//    'long'  — cap + long fall (wave/flare/length/volume tune the silhouette)
export const STYLES = [
  {
    id: 'bone-straight', name: 'Bone Straight', defaultLength: '24"',
    texture: 'Bone Straight', styleTag: 'Straight', price: 650, signature: 4,
    vibe: 'Liquid, mirror-flat length with a razor finish.', defaultColor: 0,
    hair: { shape: 'long', capRadius: 1.07, capTheta: 1.5, volume: 0.06, length: 2.05, wave: 0.04, flare: -0.02, gap: 1.9 },
  },
  {
    id: 'raw-hair', name: 'Raw Hair', defaultLength: '22"',
    texture: 'Raw · Unprocessed', styleTag: 'Natural', price: 900, signature: 4,
    vibe: 'Unprocessed, full-cuticle hair with natural body.', defaultColor: 1,
    hair: { shape: 'long', capRadius: 1.08, capTheta: 1.52, volume: 0.1, length: 1.95, wave: 0.08, flare: 0.04, gap: 2.0 },
  },
  {
    id: 'bodywave', name: 'Bodywave', defaultLength: '22"',
    texture: 'Body Wave', styleTag: 'Wavy', price: 600, signature: 3,
    vibe: 'Soft, directional S-waves with easy movement.', defaultColor: 0,
    hair: { shape: 'long', capRadius: 1.1, capTheta: 1.52, volume: 0.13, length: 1.95, wave: 0.17, flare: 0.06, gap: 2.0 },
  },
  {
    id: 'deepwave', name: 'Deepwave', defaultLength: '22"',
    texture: 'Deep Wave', styleTag: 'Wavy', price: 650, signature: 4,
    vibe: 'Deep, defined waves with rich volume.', defaultColor: 0,
    hair: { shape: 'long', capRadius: 1.12, capTheta: 1.54, volume: 0.16, length: 1.8, wave: 0.24, flare: 0.07, gap: 2.0 },
  },
  {
    id: 'bouncy-curl', name: 'Bouncy Curl', defaultLength: '20"',
    texture: 'Bouncy Curls', styleTag: 'Curly', price: 700, signature: 4,
    vibe: 'Springy, full curls with plenty of bounce.', defaultColor: 0,
    hair: { shape: 'long', capRadius: 1.16, capTheta: 1.58, volume: 0.24, length: 1.5, wave: 0.3, flare: 0.12, gap: 2.0 },
  },
  {
    id: 'loose-wave', name: 'Loose Wave', defaultLength: '22"',
    texture: 'Loose Wave', styleTag: 'Wavy', price: 620, signature: 3,
    vibe: 'Relaxed, beachy waves that fall soft.', defaultColor: 0,
    hair: { shape: 'long', capRadius: 1.09, capTheta: 1.53, volume: 0.12, length: 1.7, wave: 0.12, flare: 0.08, gap: 2.05 },
  },
  {
    id: 'ocean-wave', name: 'Ocean Wave', defaultLength: '24"',
    texture: 'Ocean Wave', styleTag: 'Wavy', price: 640, signature: 3,
    vibe: 'Rolling, even waves from root to tip.', defaultColor: 0,
    hair: { shape: 'long', capRadius: 1.11, capTheta: 1.54, volume: 0.14, length: 1.85, wave: 0.2, flare: 0.07, gap: 2.0 },
  },
  {
    id: 'mi-bundles', name: 'Mi Bundles', defaultLength: '26"',
    texture: 'Sew-in Bundles', styleTag: 'Bundles', price: 800, signature: 3,
    vibe: 'Premium wefted bundles for a custom sew-in.', defaultColor: 0,
    hair: { shape: 'long', capRadius: 1.08, capTheta: 1.5, volume: 0.1, length: 2.0, wave: 0.1, flare: 0.03, gap: 1.95 },
  },
  {
    id: 'miss-k-unit', name: 'Miss K Unit', defaultLength: '20"',
    texture: 'Styled Lace Unit', styleTag: 'Unit', price: 1200, signature: 4,
    vibe: 'A signature pre-styled lace unit, ready to wear.', defaultColor: 4,
    hair: { shape: 'long', capRadius: 1.12, capTheta: 1.56, volume: 0.13, length: 1.6, wave: 0.15, flare: 0.09, gap: 2.0 },
  },
  {
    id: 'pixie-curl', name: 'Pixie Curl', defaultLength: '16"',
    texture: 'Curly Pixie', styleTag: 'Pixie', price: 480, signature: 2,
    vibe: 'Cropped, curly and effortlessly bold.', defaultColor: 0,
    hair: { shape: 'pixie', capRadius: 1.08, capTheta: 1.52, volume: 0.14 },
  },
  {
    id: 'virgin-hair', name: 'Virgin Hair', defaultLength: '24"',
    texture: 'Virgin · Natural', styleTag: 'Natural', price: 1100, signature: 4,
    vibe: 'Single-donor virgin hair, soft and long-lasting.', defaultColor: 1,
    hair: { shape: 'long', capRadius: 1.08, capTheta: 1.5, volume: 0.1, length: 2.0, wave: 0.07, flare: 0.03, gap: 1.95 },
  },
  {
    id: 'burmese', name: 'Burmese', defaultLength: '22"',
    texture: 'Burmese Curly', styleTag: 'Curly', price: 950, signature: 4,
    vibe: 'Luxe Burmese curls with deep, glossy texture.', defaultColor: 0,
    hair: { shape: 'long', capRadius: 1.15, capTheta: 1.57, volume: 0.18, length: 1.7, wave: 0.22, flare: 0.08, gap: 2.0 },
  },
];
