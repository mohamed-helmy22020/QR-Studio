import { normalizeConfig } from './config'
import { DEFAULT_CONFIG } from './defaults'
import type { QRConfig } from '../types'

const CONFIG_KEY = 'qr-studio:config:v1'
const THEME_KEY = 'qr-studio:theme'
const CONFIG_VERSION = 1

type Theme = 'light' | 'dark'

export function loadConfig(): QRConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG
  try {
    const raw = window.localStorage.getItem(CONFIG_KEY)
    if (!raw) return DEFAULT_CONFIG
    const parsed = JSON.parse(raw) as { version?: number; config?: unknown }
    if (parsed?.version !== CONFIG_VERSION) return normalizeConfig(parsed?.config ?? parsed)
    return normalizeConfig(parsed.config)
  } catch {
    return DEFAULT_CONFIG
  }
}

/**
 * Persists the config. Logos can be large data URLs, so if the first attempt
 * exceeds the storage quota we fall back to saving everything except the logo.
 */
export function saveConfig(config: QRConfig): void {
  if (typeof window === 'undefined') return
  const payload = JSON.stringify({ version: CONFIG_VERSION, config })
  try {
    window.localStorage.setItem(CONFIG_KEY, payload)
  } catch {
    try {
      window.localStorage.setItem(
        CONFIG_KEY,
        JSON.stringify({
          version: CONFIG_VERSION,
          config: { ...config, logo: { ...config.logo, dataUrl: null } },
        }),
      )
    } catch {
      // Storage is unavailable (private mode/quota); the app still works.
    }
  }
}

export function loadTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function saveTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_KEY, theme)
  } catch {
    // Ignore unavailable storage.
  }
}

export function getInitialTheme(): Theme {
  return loadTheme()
}

export type { Theme }
