# DESIGN.md — QR Studio design and implementation notes

## Product intent

A focused tool, not a dashboard. One page: style controls on the left, a sticky
live preview on the right. The user should be able to go from URL to branded,
scannable file in under a minute, with confidence that nothing is uploaded.

Tone: precise, calm, modern. The UI stays quiet so the QR code is the loudest
thing on screen.

## Layout

- Max content width: `1240px`, 16–24px page padding.
- Desktop (`lg` and up): two-column grid `1fr / 440px`; controls left, preview
  right and `position: sticky; top: 24px`.
- Mobile: single column; the preview renders **first** (order swap), then presets
  and the settings stack. No horizontal scrolling at 390px.
- Header is a slim bar with the brand mark, "No tracking" pill and theme toggle.
  Footer repeats the privacy statement and localStorage note.
- Section order: Presets → Content (text or template) → Colors → Dots → Logo →
  Frame → Output.

## Design tokens

All colors are CSS variables in `src/index.css`, exposed to Tailwind as semantic
utilities. Components must use tokens, never raw Tailwind palette classes, so the
dark theme keeps working.

| Token | Purpose |
| --- | --- |
| `--app-bg` / `bg-app` | page background |
| `--surface` / `bg-surface` | cards, header, footer |
| `--surface-2` / `bg-surface-2` | inset fields, preview backdrop |
| `--border` / `border-line` | hairlines |
| `--border-strong` / `border-line-strong` | hover/dashed emphasis |
| `--text` / `text-ink` | primary text |
| `--muted` / `text-muted` | secondary text |
| `--brand` / `bg-brand` | actions and focus |
| `--brand-soft` / `bg-brand-soft` | tinted surfaces |
| `--danger`, `--warning-*`, `--success` | feedback |

Light: `#f3f4f8` app, white surfaces, indigo `#4f46e5` brand, slate ink.
Dark: deep navy `#0a0f1c` app, `#121a2b` surfaces, lighter indigo `#818cf8`.

Type: system UI stack. Headings 15–28px with tight tracking; body 13–14px;
monospace for JSON, content, filenames and color values.

Radii: `12px` inputs/buttons (`rounded-xl`), `16px` cards (`rounded-2xl`).
Shadows are barely-there (`0 1px 2px` alpha black) except transient toasts.

Spacing: 4px scale. Cards use 20–24px padding and 20px vertical rhythm between
fields. Section headers carry a one-line description in muted text.

## Components and states

- **Section** — card with title, optional description, optional header action.
- **Field / RangeField / SelectField / SwitchField / ColorField** — labeled
  controls. Ranges show a live numeric `<output>`. Switches are real checkboxes
  with `role="switch"` plus a visual track.
- **Button** — primary (filled brand), secondary (bordered), ghost, danger.
  Loading swaps the icon for a spinner and disables the button.
- **Alert** — warning / danger / info, `role="alert"` except info (`status`).
- **Toast** — bottom-center, auto-dismisses after 3.5s, `aria-live="polite"`.
- **Preset cards** — swatch + name + description; 2 columns mobile, 5 desktop.
- **Content type picker** — pressed-state buttons for Text, Wi-Fi, vCard, Email,
  SMS, Location and Event. Templates show a guided form and a read-only payload;
  Text mode exposes the same payload as an editable textarea.

Color fields accept `#rgb`/`#rrggbb` text and a native picker. Invalid input is
marked with `aria-invalid`, a red border and a helper message, and reverts on
blur.

The preview panel uses a checkerboard backdrop to make transparent backgrounds
visible. A pulsing dot signals the live preview; a pill shows "Framed"/"Bare".

## QR rendering design

### Coordinate model
Everything is expressed relative to a **512px reference** and scaled:

- quiet zone: `margin` px at 512, scaled with output;
- logo size: % of QR width; logo margin: px at 512;
- frame padding: 5% of output; border: 1.8%; label band: 14%; radii 4–6%.

`computeFrameLayout()` (in `src/lib/qr.ts`) is the source of truth for export
geometry. `Preview.tsx` mirrors it with container-query units
(`padding: 5cqw`, `label height: 14cqw`, `border: 1.8cqw`) inside a
`container-type: inline-size` wrapper, so preview proportions match the export.

### Preview lifecycle
- One `QRCodeStyling` instance, updated in place on style changes.
- Content is debounced 300ms; style changes redraw immediately.
- The instance is tied to the container node and recreated if the node is
  remounted (the preview container unmounts while content is empty). Without
  this, updates draw into a detached node and the preview appears blank.
- Empty content renders an illustrated placeholder, never an error.

### Exports
- PNG: library renders the QR artwork at the inset size; app composes the frame,
  border and label onto a canvas at the exact requested pixel size.
- SVG: library returns SVG artwork; app wraps it in an outer `<svg>` with frame
  rect/text. The label stays selectable text. All text/colors are XML-escaped and
  colors sanitized.
- Filenames are sanitized (spaces → dashes, extension stripped, illegal
  characters replaced).

### Scannability design
- Low contrast (< 3:1) between dots/gradient stops and background → warning.
- Logo area vs EC budget (L 7, M 15, Q 25, H 30 percent): > budget → danger,
  > 70% of budget → caution.
- Uploading a logo automatically selects EC level H.
- Content overflow errors are translated into plain-language guidance.
- Upload validation: type (PNG/JPG/SVG/WebP) and 2MB limit, with inline alerts.

## Accessibility

- Skip link to the content settings.
- Native labels for every control; `aria-describedby` on hints; `aria-invalid`
  on bad colors.
- Focus-visible ring (2px brand, 2px offset) globally.
- Alerts and toasts are announced (`role="alert"`, `aria-live`).
- All interactions work by keyboard; the preview is exposed as an accessible
  image with a stable label.
- `prefers-reduced-motion` disables animations and smooth scrolling.
- Contrast meets WCAG AA for text in both UI themes.

## Privacy and tone

Footer: "100% client-side. No network calls, no analytics, no accounts, no
tracking." This is a product promise: do not add telemetry, remote fonts, or
network-loaded assets. The Branded preset uses an inline SVG data URL.

## Code organization rule (for future agents)

**Split code as small as possible.** One file = one responsibility. Extract
sub-controls into their own components when a section grows past ~150 lines,
keep pure math/validation in `src/lib/`, and prefer many small typed modules over
large multi-purpose ones. See `AGENTS.md` for the full rule and the
non-negotiables.

## Known limitations

- Logo rendering goes through the QR library; complex SVG logos rely on the
  browser's SVG support and are rasterized in the canvas preview.
- SVG export of embedded logos depends on the library's serialization; verify
  with a decoder when changing that path.
- Copy-image requires HTTPS/localhost and clipboard support; a 15s timeout
  prevents the UI from hanging when the browser withholds permission.
