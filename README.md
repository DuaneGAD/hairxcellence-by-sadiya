# HAIRXCELLENCE by Sadiya

An immersive, interactive site for **Hairxcellence by Sadiya** — a luxury wig brand & hair
salon in Accra, Ghana. Visitors browse styles like a **video-game character-select screen**:
each wig sits on a **procedural 3D mannequin** you can **drag to rotate** and **recolour live**
with a tap, then **order on WhatsApp** with the look pre-filled into the message.

> Design direction: blush liquid-glass macOS "app window" floating on a grainy pink gradient,
> high-contrast editorial serif (Playfair Display), flowing script accents (Dancing Script),
> clean UI sans (Manrope).

## ✨ Features

- **Character-select roster** — searchable, numbered style slots with a "signature" meter.
- **3D mannequin** — built procedurally in Three.js (no model files): matte bust + a parametric
  hair mesh per style, lit with a warm key + coral editorial rim light. Drag to rotate.
- **Live recolour** — six colour swatches tween the wig's colour in real time.
- **Smart WhatsApp CTA** — a single link builder injects the current style, length, colour and
  price into the chat message, reused by the floating button, the order button and the hero.
- **Graceful fallback** — if a device has no WebGL, an SVG bust takes over (still recolours + rotates).
- **Fully responsive** — the desktop "app window" restacks into a phone-friendly column with a
  swipeable roster filmstrip; honours `prefers-reduced-motion` and safe-area insets.

## 🗂 Project structure

```
index.html        # markup + Google Fonts + Three.js import map (no build step)
css/styles.css    # the whole design system
js/data.js        # ← EDIT ME: catalogue, colours, prices & contact details
js/mannequin.js   # Three.js procedural mannequin + wig
js/app.js         # UI wiring (roster, search, recolour, WhatsApp, window chrome)
```

## 🔧 Customise it (no coding needed for the basics)

Open **`js/data.js`** and edit the `CONFIG` block:

| Field        | What to put                                                              |
|--------------|--------------------------------------------------------------------------|
| `whatsapp`   | **Sadiya's real number**, digits only, intl format. `0244123456` → `233244123456` |
| `instagram`  | The handle, no `@`                                                        |
| `location`   | Studio address shown in the Visit section                                |
| `mapsUrl`    | A Google Maps link / plus-code                                           |
| `hours`      | Opening hours rows                                                       |

Then edit the `STYLES` array to add/rename wigs, set prices (in Ghana cedis), lengths, textures
and which colour each one defaults to. `COLORS` controls the swatch palette.

> ✅ The WhatsApp number is set to **0509949405** (`233509949405`). The Google Maps link is still a
> generic search — replace `CONFIG.mapsUrl` with the studio's real Maps place link / plus-code before launch.

**Adding real product photos later:** the mannequin is intentionally asset-free so it works out
of the box. When Sadiya has photos or 3D scans (`.glb`), they can be dropped into the stage in a
later pass — the catalogue and UI are already structured for it.

## ▶️ Run locally

Because it uses ES modules, open it via a tiny local server (not `file://`):

```bash
cd hairxcellence-by-sadiya
python3 -m http.server 8000
# then visit http://localhost:8000
```

(Three.js loads from a CDN, so you need to be online the first time.)

## 🚀 Deploy free on GitHub Pages

1. Push to GitHub (already done if you cloned this repo).
2. Repo **Settings → Pages → Build and deployment**.
3. Source: **Deploy from a branch** → Branch: **`main`** / **`/ (root)`** → **Save**.
4. Wait ~1 minute; your site is live at `https://<username>.github.io/hairxcellence-by-sadiya/`.

Or with the GitHub CLI:

```bash
gh api -X POST repos/<owner>/hairxcellence-by-sadiya/pages \
  -f 'source[branch]=main' -f 'source[path]=/'
```

It's a plain static site, so it also drops straight onto Netlify, Vercel or any host.

---

© Hairxcellence by Sadiya · Accra, Ghana. Built as a bespoke commission.
