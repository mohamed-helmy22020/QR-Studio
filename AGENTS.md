# AGENTS.md — working agreement for QR Studio

## Project in one paragraph

QR Studio is a **100% client-side** QR code generator built with React 19, Vite,
TypeScript and Tailwind CSS v4. QR rendering and styling come from
`qr-code-styling`; frames are composed by our own canvas/SVG export pipeline in
`src/lib/qr.ts`. There is no backend, no analytics, no accounts and no runtime
network access. Settings persist in `localStorage`.

## Commands

```bash
npm run dev      # Vite dev server on http://localhost:5173
npm run build    # tsc -b && vite build (must pass before finishing)
npm run preview  # serve dist/
npm run lint     # oxlint (0 errors expected)
```

## Non-negotiable rules

1. **Keep modules as small as reasonably possible.** This is a hard project
   convention. Split code aggressively:
   - one component per file, one concern per module;
   - aim for < 150 lines per file and treat ~250 as a ceiling that requires a
     reason;
   - move pure logic out of components into `src/lib/` (geometry, validation,
     formatting, storage) and reusable UI into focused components;
   - split sections further when a file starts handling multiple distinct
     controls (e.g. extract a `GradientControls` component instead of growing
     `ColorsSection`);
   - prefer small typed helpers over long inline blocks;
   - never add a second responsibility to an existing module just to avoid a new
     file.
2. **Stay client-only.** Do not add analytics, telemetry, remote fonts, remote
   images, CDN scripts, accounts, or API calls. All assets must be bundled or
   inlined. Logos and config are data URLs only.
3. **Do not introduce heavy dependencies.** No UI component libraries, icon
   packs or state managers; the app uses a tiny inline `Icon` set and React
   state. Any new dependency must be justified and preferably avoided.
4. **Keep exports working.** Any change to rendering must keep PNG and SVG
   downloads (including frames/labels) generating valid, decodable codes.
5. **Preserve accessibility.** Every control needs a label, keyboard access,
   visible focus, and appropriate ARIA (`role="switch"`, `role="alert"`,
   `aria-live`). Do not remove the skip link or reduced-motion handling.
6. **Preserve persistence behavior.** Config/theme changes must keep round-
   tripping through localStorage and JSON import/export. `normalizeConfig()` is
   the single gate for untrusted JSON — never bypass it.
7. **No silent failures.** Surface export/upload/clipboard errors in the UI.

## Architecture map

- `src/App.tsx` — app state, localStorage effects, export actions, layout shell.
- `src/components/Preview.tsx` — QR instance lifecycle, frame preview, warnings.
- `src/lib/qr.ts` — QR options, frame geometry, PNG/SVG composition, download and
  clipboard helpers. All new export math belongs here or in a new focused module.
- `src/lib/config.ts` — validation/normalization and scannability heuristics.
- `src/lib/defaults.ts` — default config, presets, inline brand logo.
- `src/lib/storage.ts` — safe localStorage access and quota fallback.
- `src/components/ui.tsx` — generic inputs/buttons/alerts. If it grows, split it
  by control type.
- `src/components/*Section.tsx` — one panel per settings group.

## Styling

- Tailwind CSS v4 with semantic tokens defined in `src/index.css`
  (`bg-surface`, `text-ink`, `text-muted`, `border-line`, `bg-brand`, …).
- Do **not** hardcode light/dark colors in components. Use the tokens so the UI
  theme toggle keeps working.
- Dark mode is applied via the `.dark` class on `<html>` and a custom
  `dark` variant, not by `prefers-color-scheme` inside components.
- The QR image theme is independent of the UI theme; never tie QR colors to the
  UI theme.

## Verification checklist

Before reporting a change as done:

1. `npm run build` passes.
2. `npm run lint` passes (warnings are acceptable but note them).
3. Interact with the affected control in the dev preview.
4. If rendering/export changed, generate a PNG (and SVG when relevant) and
   confirm it decodes to the expected content. A separate QR decoder in dev
   (`npm i --no-save --no-package-lock jsqr`, then load it from the page) works
   well; remove it afterwards.
5. Check the 390px layout for horizontal overflow when changing layout.

See `DESIGN.md` for visual and interaction design details.
