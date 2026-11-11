import type { QRConfig } from '../types'
import { normalizeConfig } from './config'

const SHARE_PREFIX = '#config='
const MAX_SHARE_URL_LENGTH = 8_000
const MAX_DECODED_LENGTH = 100_000

export interface ShareLink {
  url: string
  /** True when the logo was dropped so the link stays a practical length. */
  logoOmitted: boolean
}

/**
 * Share links carry styling and output settings only. The QR payload and its
 * template stay with the recipient, so links never expose Wi-Fi passwords,
 * vCard details, or other content in a URL.
 */
export type ShareConfig = Omit<QRConfig, 'content' | 'template'>

function toShareConfig(config: QRConfig): ShareConfig {
  return {
    fgColor: config.fgColor,
    bgColor: config.bgColor,
    transparentBg: config.transparentBg,
    gradientEnabled: config.gradientEnabled,
    gradientFrom: config.gradientFrom,
    gradientTo: config.gradientTo,
    gradientAngle: config.gradientAngle,
    dotStyle: config.dotStyle,
    cornerSquareStyle: config.cornerSquareStyle,
    cornerDotStyle: config.cornerDotStyle,
    logo: config.logo,
    frame: config.frame,
    size: config.size,
    ecLevel: config.ecLevel,
    margin: config.margin,
    filename: config.filename,
  }
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function compress(text: string): Promise<Uint8Array> {
  if (typeof CompressionStream === 'undefined') {
    throw new Error(
      'This browser cannot create compressed share links. Use Copy config instead.',
    )
  }
  const stream = new Blob([text])
    .stream()
    .pipeThrough(new CompressionStream('gzip'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function decompress(bytes: Uint8Array<ArrayBuffer>): Promise<string> {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error(
      'This browser cannot read compressed share links. Use Load config instead.',
    )
  }
  const stream = new Blob([bytes])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'))
  const text = await new Response(stream).text()
  if (text.length > MAX_DECODED_LENGTH) {
    throw new Error('That share link contains too much data.')
  }
  return text
}

async function encodeConfig(config: ShareConfig): Promise<string> {
  return toBase64Url(await compress(JSON.stringify(config)))
}

function buildUrl(payload: string): string {
  const url = new URL(window.location.href)
  url.hash = `${SHARE_PREFIX.slice(1)}${payload}`
  return url.toString()
}

/**
 * Compresses the shareable parts of the config into a URL hash. The QR content
 * and template are deliberately excluded. If the full config (including a logo
 * data URL) would make the link unwieldy, the logo is dropped and the caller is
 * told so the UI can explain what happened.
 */
export async function buildShareLink(config: QRConfig): Promise<ShareLink> {
  const share = toShareConfig(config)
  const fullUrl = buildUrl(await encodeConfig(share))
  if (fullUrl.length <= MAX_SHARE_URL_LENGTH) {
    return { url: fullUrl, logoOmitted: false }
  }

  if (share.logo.dataUrl) {
    const withoutLogo: ShareConfig = {
      ...share,
      logo: { ...share.logo, dataUrl: null },
    }
    const compactUrl = buildUrl(await encodeConfig(withoutLogo))
    if (compactUrl.length <= MAX_SHARE_URL_LENGTH) {
      return { url: compactUrl, logoOmitted: true }
    }
  }

  throw new Error(
    'This config is too large to fit in a share link. Use Copy config instead.',
  )
}

export function readShareHash(hash: string): string | null {
  if (!hash.startsWith(SHARE_PREFIX)) return null
  return hash.slice(SHARE_PREFIX.length) || null
}

export async function decodeSharePayload(payload: string): Promise<ShareConfig> {
  try {
    const text = await decompress(fromBase64Url(payload))
    return toShareConfig(normalizeConfig(JSON.parse(text)))
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.startsWith('This browser') ||
        error.message.startsWith('That share link contains'))
    ) {
      throw error
    }
    throw new Error('That share link could not be read.')
  }
}
