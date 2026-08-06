# Happy Birthday Cutie

A cinematic, scroll-driven birthday microsite with a living cosmos background, a wax-sealed love letter, an interactive story timeline, and a wish finale. Built as a personal gift and designed to feel like a guided journey rather than a single page.

> **BASIC build** — this variant intentionally omits the gift reveal, relationship countdown, and photo gallery. See "What's Removed" below for details.

## Highlights

- WebGL cosmos: animated starfield, nebula, ringed planet, comets, and mouse trail.
- Intro ritual: candle countdown, click-to-blow interaction, and background music.
- Interactive sections: wax-sealed love letter and an animated story timeline with flip cards.
- Wish finale: send a wish to Google Forms, trigger a star burst, and show the closing message.
- Performance-aware: adaptive pixel ratio based on FPS to keep motion smooth.

## Sections at a Glance

| Section       | What happens                                                       |
| ------------- | ------------------------------------------------------------------ |
| Intro         | Candle countdown, blow action, music start, constellation message. |
| Love Letter   | Wax seal breaks, text reveals word-by-word with auto-scroll.       |
| Story         | Timeline cards with flip interactions and typewriter dates.        |
| Wish + Finale | Write a wish, send it to the stars, star-burst comet, final greeting. |

## What's Removed (vs Full)

The full version included three sections that the Basic variant drops:

| Removed           | Location removed from                          |
| ----------------- | ---------------------------------------------- |
| Gift Reveal       | `index.html` markup, `main.js` handlers, `site-config.js` block, `css/10-gift.css` import |
| Relationship Countdown | `index.html` markup, `main.js` logic, `site-config.js` block, `css/30-countdown.css` import |
| Photo Gallery/Lightbox | `index.html` markup, `main.js` logic, `site-config.js` block, `css/50-gallery.css` import |

The CSS files themselves still exist in `css/` on disk, but they are **no longer imported** — `style.css` only pulls in the active section manifests: `00-base-intro`, `05-shared-animations`, `20-letter`, `40-story`, `60-wish-finale`.

## Tech Stack

- HTML5, CSS3 (modular section styles via a single import manifest)
- JavaScript (ES modules)
- Three.js 0.160 via CDN import maps
- Google Fonts: Great Vibes, Lora

## Project Structure

```
.
├── index.html
├── main.js
├── site-config.js
├── CometSystem.js
├── MouseTrail.js
├── Nebula.js
├── Planet.js
├── Starfield.js
├── style.css            # import manifest for the active section styles
├── css/
│   ├── 00-base-intro.css
│   ├── 05-shared-animations.css   # shared scroll-wrapper + keyframes
│   ├── 20-letter.css
│   ├── 40-story.css
│   └── 60-wish-finale.css
└── images/
```

## Run Locally

You can run it by directly opening `index.html` in a browser.

### Option 1: Open the file

- Double-click `index.html` or use a browser File Open dialog.

### Option 2: Python

```
python -m http.server 5173
```

### Option 3: Node

```
npx serve .
```

Then open:

```
http://localhost:5173
```

## Customization Guide

All user-visible content (texts, headings, images, audio, dates) lives in one place: `site-config.js`. Structure and layout live in `index.html` and the section stylesheets.

### Update the Names and Text

- Edit `site-config.js` — intro, letter, story, wish, and finale texts.
- `index.html` only holds the structural markup with `data-config` hooks that read from the config.

### Change the Story Photos

Edit the `items` array inside `story` in `site-config.js`:

- `imageSrc`: front photo
- `backGifSrc`: back-of-card image/GIF
- `date`, `title`, `description`, `backMessage`: card content
- `side`: `"left"` or `"right"` placement on the timeline
- `nodeEmoji`: emoji on the timeline node

Photos in `images/` (`pic1.jpg` … `pic8.jpg`) can be freely mixed across the story cards.

### Replace the Wish Form

In `site-config.js`, update `wish.googleFormUrl` and `wish.googleFormField`.

### Swap Music and Images

- Replace `bgm.mp3` in the project root.
- Replace images under `images/` (referenced from `site-config.js`).
- The global fallback image is `images/pic1.jpg` (`fallbacks.image`).

### Tweak the Cosmos

- Star count: `new Starfield(scene, 15000)` in `main.js`
- Planet size and position: `new Planet(scene, radius, position)`
- Comet behavior: `CometSystem.js`
- Nebula shader and speed: `Nebula.js`

## Performance Notes

- Dynamic pixel ratio scaling keeps the canvas scene smooth on lower-end devices.
- Animated sections avoid heavy DOM work until they are revealed.

## Accessibility Notes

- Keyboard support for story card flips and the wax seal.
- Reduced motion preferences are respected in the animated sections.
- Images include `alt` text for screen readers.

## Credits and Attributions

- Three.js for the WebGL scene.
- Google Fonts: Great Vibes and Lora.
- GIFs currently reference external sources; replace them with your own if needed.

## License

MIT License. See [LICENSE](LICENSE).