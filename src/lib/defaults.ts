import type { Preset, QRConfig } from '../types'

/**
 * Inline SVG so the "Branded" preset works without any network request.
 * Data URLs are also safe to draw onto a canvas (no tainting).
 */
export function makeBrandLogo(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6366f1"/>
      <stop offset="1" stop-color="#db2777"/>
    </linearGradient>
  </defs>
  <rect width="160" height="160" rx="38" fill="url(#g)"/>
  <text x="80" y="112" text-anchor="middle" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="92" font-weight="700" fill="#ffffff">Q</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export const DEFAULT_CONFIG: QRConfig = {
  content: 'https://example.com',
  template: { kind: 'text', values: {} },
  fgColor: '#0f172a',
  bgColor: '#ffffff',
  transparentBg: false,
  gradientEnabled: false,
  gradientFrom: '#6366f1',
  gradientTo: '#ec4899',
  gradientAngle: 45,
  dotStyle: 'square',
  cornerSquareStyle: 'square',
  cornerDotStyle: 'square',
  logo: {
    dataUrl: null,
    size: 24,
    margin: 6,
    hideDots: true,
  },
  frame: {
    enabled: false,
    style: 'label-bottom',
    color: '#4f46e5',
    label: 'Scan me',
    labelColor: '#ffffff',
    labelFontSize: 24,
  },
  size: 512,
  ecLevel: 'Q',
  margin: 20,
  filename: 'qr-code',
}

const BRAND_LOGO = makeBrandLogo()

export const PRESETS: Preset[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Black squares on white',
    patch: {
      fgColor: '#0f172a',
      bgColor: '#ffffff',
      transparentBg: false,
      gradientEnabled: false,
      dotStyle: 'square',
      cornerSquareStyle: 'square',
      cornerDotStyle: 'square',
      ecLevel: 'Q',
      frame: { enabled: false, style: 'none' },
      logo: { dataUrl: null },
    },
  },
  {
    id: 'neon',
    name: 'Neon',
    description: 'Gradient dots on midnight',
    patch: {
      fgColor: '#22d3ee',
      bgColor: '#0b1020',
      transparentBg: false,
      gradientEnabled: true,
      gradientFrom: '#22d3ee',
      gradientTo: '#a855f7',
      gradientAngle: 45,
      dotStyle: 'extra-rounded',
      cornerSquareStyle: 'extra-rounded',
      cornerDotStyle: 'dot',
      ecLevel: 'Q',
      frame: { enabled: false, style: 'none' },
      logo: { dataUrl: null },
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Soft dots, lots of air',
    patch: {
      fgColor: '#334155',
      bgColor: '#ffffff',
      transparentBg: false,
      gradientEnabled: false,
      dotStyle: 'dots',
      cornerSquareStyle: 'dot',
      cornerDotStyle: 'dot',
      margin: 36,
      ecLevel: 'Q',
      frame: { enabled: false, style: 'none' },
      logo: { dataUrl: null },
    },
  },
  {
    id: 'branded',
    name: 'Branded',
    description: 'Logo, label and rounded frame',
    patch: {
      fgColor: '#1e1b4b',
      bgColor: '#ffffff',
      transparentBg: false,
      gradientEnabled: false,
      dotStyle: 'classy-rounded',
      cornerSquareStyle: 'extra-rounded',
      cornerDotStyle: 'square',
      ecLevel: 'H',
      logo: { dataUrl: BRAND_LOGO, size: 24, margin: 6, hideDots: true },
      frame: {
        enabled: true,
        style: 'label-bottom',
        color: '#4f46e5',
        label: 'Scan me',
        labelColor: '#ffffff',
        labelFontSize: 24,
      },
    },
  },
  {
    id: 'dark',
    name: 'Dark mode',
    description: 'Light dots on dark ink',
    patch: {
      fgColor: '#f8fafc',
      bgColor: '#0f172a',
      transparentBg: false,
      gradientEnabled: false,
      dotStyle: 'rounded',
      cornerSquareStyle: 'extra-rounded',
      cornerDotStyle: 'dot',
      ecLevel: 'Q',
      frame: { enabled: false, style: 'none' },
      logo: { dataUrl: null },
    },
  },
]
