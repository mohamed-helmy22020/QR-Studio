# QR Studio — Custom QR Code Generator

A polished, fully client-side QR code generator. Type a URL or any text, style
the dots, add a gradient, logo and frame, then export a scannable PNG or SVG.

Everything runs in your browser. There is no backend, no analytics, no accounts,
and no tracking. Generated images never leave the device.

![Stack](https://img.shields.io/badge/stack-React%2019%20%2B%20Vite%208%20%2B%20TypeScript-4f46e5)
![Styling](https://img.shields.io/badge/styles-Tailwind%20CSS%204-0ea5e9)
![QR engine](https://img.shields.io/badge/QR-qr--code--styling%201.9-111827)

**Contents:** [Quick start](#quick-start) · [Features](#features) ·
[Project structure](#project-structure) · [How it works](#how-it-works) ·
[Privacy by design](#privacy-by-design) · [Static hosting](#static-hosting) ·
[Browser support](#browser-support)

---

## Quick start

Requirements: Node.js 20.19+ (or 22.12+) and npm.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build locally
npm run lint     # oxlint
```

The production build is static: `dist/` contains only HTML, CSS, JS and one
favicon. No server code, no runtime environment variables, no API keys.

---

## Features

### Content
- **Templates** — guided forms for Wi-Fi, vCard, email, SMS, geo and calendar
  events. The generated payload stays visible and can be edited as plain text.
- Textarea for URLs, plain text or any other payload a QR code can hold.
- 4,000-character counter and a one-click **Clear** button.
- Live preview updates 300ms after typing stops, so large payloads stay smooth.

### Appearance
- **Colors** — foreground/dot color, background color, transparent background.
- **Gradient dots** — two color stops plus a 0–360° angle slider.
- **Dot styles** — square, dots, rounded, classy, classy-rounded, extra-rounded.
- **Corner styles** — corner square and corner dot styled independently.
- **Logo** — PNG/JPG/SVG/WebP up to 2 MB, sizes 10–40%, margin, and a
  "hide dots behind logo" switch. Uploading a logo raises error correction to H.
- **Frame** — rounded, bordered, label-bottom, label-top, or none, with frame
  color and a label (text, size, color).
- **Presets** — Classic, Neon, Minimal, Branded (inline SVG logo), Dark mode.

### Output
- 128–2048px output (default 512), whole image including frame.
- Error correction L/M/Q/H (default Q; H when a logo is added).
- Quiet-zone/margin slider, sanitized filename, PNG download, SVG download, and
  copy PNG to clipboard.
- Bounded clipboard timeout so the button never gets stuck on "Copying…".

### Sharing and portability
- **Share links** — compress the current style and output settings into the URL
  hash and copy it in one click. Nothing is uploaded, and the recipient's QR
  content and template are kept.
- **Copy config as JSON** — includes the content and logo data URL for an exact
  hand-off.
- **Load config from JSON** — validated and normalized before it touches state.
- **Reset all** — back to defaults in one click.

### Quality of life
- Debounced live preview, and style changes still redraw immediately.
- Scannability warnings for low contrast and for logos that exceed the error
  correction budget.
- Light/dark **UI** theme (independent of the QR colors).
- Settings persist in `localStorage`; logo data is dropped first if storage is full.
- Keyboard-navigable, labeled controls, skip link, visible focus rings, alerts
  announced via `aria-live`/`role="alert"`, reduced-motion support.

---

## Project structure

```
src/
  App.tsx                 app shell: state, persistence, export actions, layout
  types.ts                shared config types
  components/
    Header.tsx            brand + theme toggle
    Preview.tsx           live preview, frame wrapper, risk notices
    PresetBar.tsx         one-click styles
    ContentSection.tsx    content card shell + clear action
    ContentEditor.tsx     text/template mode switch, generated payload
    TemplatePicker.tsx    content-type buttons
    TemplateForm.tsx      guided template fields
    ColorsSection.tsx     colors + gradient
    DotsSection.tsx       dot/corner shape controls
    LogoSection.tsx       upload, validation, sizing
    FrameSection.tsx      frame + label controls
    OutputSection.tsx     size, EC level, export buttons
    ConfigTools.tsx       JSON copy/load, share links, reset
    ui.tsx                shared fields, buttons, alerts
    Icon.tsx              inline icon set (no icon library)
    Toast.tsx             transient feedback
  hooks/
    useDebouncedValue.ts  generic debounce hook
  lib/
    content.ts            content length limit and helpers
    templates/            Wi-Fi, vCard, email, SMS, geo, event payload builders
    defaults.ts           default config + presets
    qr.ts                 QR options, frame geometry, PNG/SVG render + downloads
    share.ts              compressed share-link encoding/decoding
    config.ts             validation/normalization, contrast and logo risk checks
    storage.ts            localStorage helpers with graceful fallbacks
    cx.ts                 className helper
  index.css               Tailwind import, design tokens, light/dark variables
```

Design and code-organization rules live in [`DESIGN.md`](./DESIGN.md) and
[`AGENTS.md`](./AGENTS.md).

---

## How it works

### Rendering
`src/lib/qr.ts → buildQROptions()` translates the app config into
`qr-code-styling` options. Dot/corner colors, gradients, logo size and margins
are scaled from a 512px reference so the preview and export match at any size.

`Preview.tsx` owns a single `QRCodeStyling` instance and updates it in place.
Content is debounced; style changes bypass the debounce. The instance is bound to
its container node so it is recreated if React remounts the preview (for example
after clearing the content).

### Templates
Each payload type lives in its own module under `src/lib/templates/`: fields,
defaults and a pure `build(values)` function. `ContentEditor` regenerates the
content string on every field change, so the live preview stays in sync.
`normalizeConfig()` sanitizes template state from localStorage or imported JSON
through `normalizeTemplate()`, keeping only known kinds and fields.

### Frames and export
The library draws the QR artwork only. Frames are composed by the app:

- **PNG** — `renderPng()` renders the QR to a PNG at the inset QR size, then draws
  it into a canvas with the frame, border and label, exporting at the requested
  size.
- **SVG** — `renderSvg()` requests the library's SVG artwork, nests it inside an
  outer `<svg>` with the frame and label, and returns it as a blob. Text stays
  real text, so it scales cleanly for print.
- **Clipboard** — `copyQrToClipboard()` reuses `renderPng()` and writes a
  `ClipboardItem`, with a 15s timeout for browsers that leave the permission
  prompt pending.

`computeFrameLayout()` keeps padding, border, radius and label height
proportional to the output size (5% padding, 1.8% border, 14% label band), and
`Preview.tsx` mirrors those values with container query units (`cqw`).

### Share links
`src/lib/share.ts` builds a style-only payload from the config, serializes it to
JSON, gzips it with the native `CompressionStream` API, and encodes the bytes as
base64url in the URL hash (`#config=…`). The QR content and template are
deliberately excluded, so a link can never leak a Wi-Fi password or vCard
details. Opening a link decodes the payload, validates it through
`normalizeConfig()`, merges the style fields into the current config, and then
removes the hash with `history.replaceState` so a reload falls back to local
settings.

If the share URL would exceed 8,000 characters, the link is rebuilt without
`logo.dataUrl` and the UI says the logo was omitted. If it still does not fit,
the app asks the user to use Copy config instead. Browsers without
`CompressionStream` get an actionable error rather than a broken link.

### Scannability safeguards
- `isLowContrast()` uses WCAG relative luminance to flag dot/background pairs
  below a 3:1 ratio.
- `logoRiskLevel()` compares logo area against the error-correction budget
  (L 7%, M 15%, Q 25%, H 30%) and warns at 70% of the budget or above.
- The content/EC combination is validated by the QR library; overflow errors are
  caught and shown as actionable messages.

### Persistence
`storage.ts` saves the full config (including the logo data URL) and the UI
theme. If `localStorage` is unavailable or a large logo exceeds the quota, the
logo is excluded and the rest of the settings still persist.

---

## Privacy by design

- No backend, analytics, accounts, telemetry, cookies, or runtime network calls.
- No remote fonts, images, CDNs, or third-party scripts; every asset is bundled
  or inlined.
- Logos and presets are data URLs; QR images are generated and downloaded
  entirely on-device.
- Settings live in `localStorage`.
- Share links carry style settings only — never the QR content — but the link
  itself is still data. Treat it like the style config it contains.
- The only network request is the initial page load.

---

## Static hosting

The app is a plain static bundle. Build with `npm run build` and publish `dist/`.
Share links work on any host because the payload lives after `#` and is never
sent to the server.

### Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- No redirects or functions are needed (single page, no client-side routing).
- `netlify.toml` is optional:

  ```toml
  [build]
    command = "npm run build"
    publish = "dist"
  ```

### Vercel
- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- No serverless functions are required.

### GitHub Pages
1. In `vite.config.ts`, set the base path to the repository name:

   ```ts
   export default defineConfig({
     base: '/your-repo-name/',
     plugins: [react(), tailwindcss()],
   })
   ```

2. Build (`npm run build`) and publish `dist/` to the `gh-pages` branch, e.g.
   with `npx gh-pages -d dist`, or add a GitHub Actions workflow that uploads
   `dist` as a Pages artifact.

For a user/organization site at the domain root (`username.github.io`), use
`base: '/'` instead.

### Other hosts
Cloudflare Pages, Render, S3 + CDN, or any static file server work the same way:
build once and serve `dist/`. The app uses no `History` API routing, so no
fallback rewrite is needed.

---

## Browser support

Latest Chrome, Edge, Firefox and Safari.

- PNG export uses `<canvas>` + `toBlob`.
- SVG export uses `DOMParser`/`XMLSerializer`, both widely supported.
- Copy-to-clipboard images require a secure context (HTTPS or localhost) and
  `ClipboardItem`; the button reports a friendly error where unsupported.
- Share links use `CompressionStream`/`DecompressionStream` (gzip) plus
  clipboard access; unsupported browsers show an actionable message and JSON
  copy/load still works.
- Safari needs a user gesture for downloads; the export buttons provide one.

---

## Verification performed

- `npm run build` (TypeScript project build + Vite production build) passes.
- `npm run lint` passes with 0 errors.
- Rendered and interacted with the dev build: content debounce, presets, logo
  upload (valid/invalid/oversized files), frame + label, theme toggle, clear and
  retype, persistence across reload, empty-content export guard, risk warnings,
  and the 390px stacked layout.
- Exercised every content template in the dev build and checked the generated
  payload for each (Wi-Fi escaping, vCard/iCalendar lines, mailto/SMS/geo
  prefixes) plus template persistence across reload.
- Round-tripped style configs through share links: content/template stayed out of
  the payload and survived on the receiving tab, styles applied, the hash was
  removed after load, oversized logos were omitted, and invalid links showed a
  danger toast.
- Exported PNG and SVG files (including logo + frame) were decoded back to the
  exact input string with a QR decoder during development, across all five
  presets. Phone-camera scanning was not performed in this environment.

---

## Possible future enhancements

- **Batch generation** from CSV/JSON with a ZIP download.
- **Richer logo support** — SVG-specific handling, auto-trimming, background
  shape (circle/square), and built-in icon library.
- **History** of recent codes with thumbnails, names and one-click restore.
- **PNG transparency and print bleed** controls, plus PDF/EPS export.
- **Auto-contrast suggestions** and a built-in "test scan" using the
  `BarcodeDetector` API where available.
