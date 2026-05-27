# Happy Birthday Cutie

A cinematic, scroll-driven birthday microsite with a living cosmos background, interactive story panels, and a wish finale. Built as a personal gift and designed to feel like a guided journey rather than a single page.

## Highlights

- WebGL cosmos: animated starfield, nebula, ringed planet, comets, and mouse trail.
- Intro ritual: candle countdown, click-to-blow interaction, and background music.
- Interactive sections: gift reveal, wax-sealed love letter, relationship countdown, story timeline, and gallery lightbox.
- Wish finale: send a wish to Google Forms, trigger a star burst, and show the closing message.
- Performance-aware: adaptive pixel ratio based on FPS to keep motion smooth.

## Sections at a Glance

| Section       | What happens                                                       |
| ------------- | ------------------------------------------------------------------ |
| Intro         | Candle countdown, blow action, music start, constellation message. |
| Gift          | Tap to open the gift, reveal the opening message.                  |
| Love Letter   | Wax seal breaks, text reveals word-by-word with auto-scroll.       |
| Countdown     | Live time since a chosen date with ring progress and particles.    |
| Story         | Timeline cards with flip interactions and typewriter dates.        |
| Gallery       | Photo grid, hover parallax, keyboard and touch lightbox.           |
| Wish + Finale | Send wish to the stars, comet sweep, final greeting.               |

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
├── CometSystem.js
├── MouseTrail.js
├── Nebula.js
├── Planet.js
├── Starfield.js
├── style.css
├── css/
│   ├── 00-base-intro.css
│   ├── 05-shared-animations.css
│   ├── 10-gift.css
│   ├── 20-letter.css
│   ├── 30-countdown.css
│   ├── 40-story.css
│   ├── 50-gallery.css
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

### Update the Names and Text

- Main text lives in `index.html` (headings, letter content, story card copy).

### Change the Gallery

Edit the `items` array inside `initGallery()` in `main.js`:

- `src`: image path
- `alt`: accessibility text
- `title` and `text`: caption content
- `r`, `x`, `y`: rotation and layout offset

### Adjust the Countdown Date

In `main.js`, update:

```
const startDate = new Date(2018, 0, 24, 0, 0, 0);
```

### Replace the Wish Form

In `main.js`, update these constants:

```
const GOOGLE_FORM_ACTION_URL = "...";
const GOOGLE_FORM_WISH_FIELD = "entry.XXXX";
```

### Swap Music and Images

- Replace `bgm.mp3` in the project root.
- Replace images under `images/`.
- The global fallback image is `images/pic1.jpg`.

### Tweak the Cosmos

- Star count: `new Starfield(scene, 15000)`
- Planet size and position: `new Planet(scene, radius, position)`
- Comet behavior: `CometSystem.js`
- Nebula shader and speed: `Nebula.js`

## Performance Notes

- Dynamic pixel ratio scaling keeps the WebGL scene smooth on lower-end devices.
- Animated sections avoid heavy DOM work until they are revealed.

## Accessibility Notes

- Keyboard support for gift opening, story card flips, and gallery lightbox.
- Reduced motion preferences are respected in the gallery motion effects.
- Images include `alt` text for screen readers.

## Credits and Attributions

- Three.js for the WebGL scene.
- Google Fonts: Great Vibes and Lora.
- GIFs currently reference external sources; replace them with your own if needed.

## License

MIT License. See [LICENSE](LICENSE).
