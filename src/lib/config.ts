import { DEFAULT_CONFIG } from './defaults'
import type {
  CornerDotStyle,
  CornerSquareStyle,
  DotStyle,
  ErrorCorrectionLevel,
  FrameStyle,
  LogoConfig,
  QRConfig,
} from '../types'

const DOT_STYLES: DotStyle[] = [
  'square',
  'dots',
  'rounded',
  'classy',
  'classy-rounded',
  'extra-rounded',
]
const CORNER_SQUARE_STYLES: CornerSquareStyle[] = [
  'square',
  'dot',
  'extra-rounded',
]
const CORNER_DOT_STYLES: CornerDotStyle[] = ['square', 'dot']
const FRAME_STYLES: FrameStyle[] = [
  'none',
  'rounded',
  'bordered',
  'label-bottom',
  'label-top',
]
const EC_LEVELS: ErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H']

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function numberInRange(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, Math.round(n)))
}

function hexColor(value: unknown, fallback: string): string {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)
    ? value
    : fallback
}

function oneOf<T extends string>(
  value: unknown,
  allowed: T[],
  fallback: T,
): T {
  return typeof value === 'string' && allowed.includes(value as T)
    ? (value as T)
    : fallback
}

function pickLogo(raw: unknown, fallback: LogoConfig): LogoConfig {
  if (!isRecord(raw)) return fallback
  const dataUrl =
    typeof raw.dataUrl === 'string' &&
    /^data:image\/(png|jpe?g|svg\+xml|webp);base64,/i.test(raw.dataUrl)
      ? raw.dataUrl
      : typeof raw.dataUrl === 'string' &&
          /^data:image\/svg\+xml;charset=utf-8,/i.test(raw.dataUrl)
        ? raw.dataUrl
        : null
  return {
    dataUrl,
    size: numberInRange(raw.size, fallback.size, 10, 40),
    margin: numberInRange(raw.margin, fallback.margin, 0, 30),
    hideDots:
      typeof raw.hideDots === 'boolean' ? raw.hideDots : fallback.hideDots,
  }
}

/**
 * Validates imported/saved JSON and fills in any missing or malformed fields.
 * Keeping this strict means a bad config file can never break the renderer.
 */
export function normalizeConfig(raw: unknown): QRConfig {
  const fallback = DEFAULT_CONFIG
  if (!isRecord(raw)) return fallback

  const rawLogo = isRecord(raw.logo) ? raw.logo : {}
  const rawFrame = isRecord(raw.frame) ? raw.frame : {}

  return {
    content:
      typeof raw.content === 'string' ? raw.content.slice(0, 4000) : fallback.content,
    fgColor: hexColor(raw.fgColor, fallback.fgColor),
    bgColor: hexColor(raw.bgColor, fallback.bgColor),
    transparentBg:
      typeof raw.transparentBg === 'boolean'
        ? raw.transparentBg
        : fallback.transparentBg,
    gradientEnabled:
      typeof raw.gradientEnabled === 'boolean'
        ? raw.gradientEnabled
        : fallback.gradientEnabled,
    gradientFrom: hexColor(raw.gradientFrom, fallback.gradientFrom),
    gradientTo: hexColor(raw.gradientTo, fallback.gradientTo),
    gradientAngle: numberInRange(raw.gradientAngle, fallback.gradientAngle, 0, 360),
    dotStyle: oneOf(raw.dotStyle, DOT_STYLES, fallback.dotStyle),
    cornerSquareStyle: oneOf(
      raw.cornerSquareStyle,
      CORNER_SQUARE_STYLES,
      fallback.cornerSquareStyle,
    ),
    cornerDotStyle: oneOf(
      raw.cornerDotStyle,
      CORNER_DOT_STYLES,
      fallback.cornerDotStyle,
    ),
    logo: pickLogo(rawLogo, fallback.logo),
    frame: {
      enabled:
        typeof rawFrame.enabled === 'boolean'
          ? rawFrame.enabled
          : fallback.frame.enabled,
      style: oneOf(rawFrame.style, FRAME_STYLES, fallback.frame.style),
      color: hexColor(rawFrame.color, fallback.frame.color),
      label:
        typeof rawFrame.label === 'string'
          ? rawFrame.label.slice(0, 40)
          : fallback.frame.label,
      labelColor: hexColor(rawFrame.labelColor, fallback.frame.labelColor),
      labelFontSize: numberInRange(
        rawFrame.labelFontSize,
        fallback.frame.labelFontSize,
        10,
        48,
      ),
    },
    size: numberInRange(raw.size, fallback.size, 128, 2048),
    ecLevel: oneOf(raw.ecLevel, EC_LEVELS, fallback.ecLevel),
    margin: numberInRange(raw.margin, fallback.margin, 0, 80),
    filename:
      typeof raw.filename === 'string' && raw.filename.trim()
        ? raw.filename.slice(0, 80)
        : fallback.filename,
  }
}

export function serializeConfig(config: QRConfig): string {
  return JSON.stringify(config, null, 2)
}

export function parseConfigJson(text: string): QRConfig {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('That file is not valid JSON.')
  }
  if (!isRecord(parsed)) {
    throw new Error('The config must be a JSON object.')
  }
  return normalizeConfig(parsed)
}

/** True when two colors would likely be hard for a scanner to tell apart. */
export function isLowContrast(fg: string, bg: string): boolean {
  const luminance = (hex: string): number => {
    const value = hex.replace('#', '')
    const channels = [0, 2, 4].map((i) => {
      const c = parseInt(value.slice(i, i + 2), 16) / 255
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
  }
  const a = luminance(fg)
  const b = luminance(bg)
  const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
  return ratio < 3
}

/**
 * Rough scannability check for logos. Error correction reserves a percentage of
 * codewords; a logo larger than that budget can make the code unreadable.
 */
export function logoRiskLevel(
  config: QRConfig,
): 'safe' | 'caution' | 'danger' {
  if (!config.logo.dataUrl) return 'safe'
  const budgets: Record<ErrorCorrectionLevel, number> = {
    L: 7,
    M: 15,
    Q: 25,
    H: 30,
  }
  const coverage = (config.logo.size * config.logo.size) / 100
  const budget = budgets[config.ecLevel]
  if (coverage > budget) return 'danger'
  if (coverage > budget * 0.7) return 'caution'
  return 'safe'
}
