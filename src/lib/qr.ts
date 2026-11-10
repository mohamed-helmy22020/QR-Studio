import QRCodeStyling from 'qr-code-styling'
import type {
  CornerDotType,
  CornerSquareType,
  DotType,
  ErrorCorrectionLevel,
  FileExtension,
  Options,
} from 'qr-code-styling'
import type { FrameStyle, QRConfig } from '../types'

/** Reference size that slider values (margin, label size) are expressed in. */
const BASE_SIZE = 512

export interface FrameLayout {
  framed: boolean
  style: FrameStyle
  size: number
  /** Side length of the QR code itself, inside the frame. */
  qrSize: number
  qrX: number
  qrY: number
  pad: number
  border: number
  radius: number
  labelHeight: number
  labelTop: boolean
  /** Vertical center of the label text. */
  labelY: number
  /** Whether the style renders a label at all. */
  hasLabel: boolean
}

export function hasVisibleLabel(config: QRConfig): boolean {
  const { frame } = config
  return (
    frame.enabled &&
    (frame.style === 'label-bottom' || frame.style === 'label-top') &&
    frame.label.trim().length > 0
  )
}

/**
 * Computes the geometry of the optional decorative frame in output pixels.
 * All padding/label sizes are proportional to the requested image size so the
 * on-screen preview and the PNG/SVG export line up closely.
 *
 * The requested "Size" is the final image size. With a frame enabled, the QR
 * code is inset to leave room for the decorative border and label.
 */
export function computeFrameLayout(config: QRConfig, size: number): FrameLayout {
  const framed = config.frame.enabled && config.frame.style !== 'none'
  if (!framed) {
    return {
      framed: false,
      style: 'none',
      size,
      qrSize: size,
      qrX: 0,
      qrY: 0,
      pad: 0,
      border: 0,
      radius: 0,
      labelHeight: 0,
      labelTop: false,
      labelY: 0,
      hasLabel: false,
    }
  }

  const style = config.frame.style
  const hasLabel = hasVisibleLabel(config)
  const pad = Math.round(size * 0.05)
  const border = style === 'bordered' ? Math.max(2, Math.round(size * 0.018)) : 0
  const labelHeight = hasLabel ? Math.round(size * 0.14) : 0
  const inset = pad + border
  const qrSize = size - inset * 2 - labelHeight
  const labelTop = style === 'label-top'
  const qrY = inset + (labelTop ? labelHeight : 0)
  const labelY = labelTop
    ? inset + labelHeight / 2
    : size - inset - labelHeight / 2

  return {
    framed: true,
    style,
    size,
    qrSize,
    qrX: Math.round((size - qrSize) / 2),
    qrY: Math.round(qrY),
    pad,
    border,
    radius:
      style === 'bordered'
        ? Math.round(size * 0.04)
        : Math.round(size * 0.06),
    labelHeight,
    labelTop,
    labelY,
    hasLabel,
  }
}

/**
 * Builds the qr-code-styling options for a given content string and pixel size.
 * Note: the library's `margin` and `imageOptions.margin` are raw pixels, so we
 * scale them from the 512px baseline to keep exports visually consistent.
 */
export function buildQROptions(
  config: QRConfig,
  data: string,
  qrSize: number,
  renderType: 'canvas' | 'svg' = 'canvas',
): Options {
  const scale = qrSize / BASE_SIZE

  const gradient = config.gradientEnabled
    ? {
        type: 'linear' as const,
        rotation: (config.gradientAngle * Math.PI) / 180,
        colorStops: [
          { offset: 0, color: config.gradientFrom },
          { offset: 1, color: config.gradientTo },
        ],
      }
    : undefined

  return {
    type: renderType,
    shape: 'square',
    width: qrSize,
    height: qrSize,
    data,
    margin: Math.round(config.margin * scale),
    qrOptions: {
      errorCorrectionLevel: config.ecLevel as ErrorCorrectionLevel,
    },
    image: config.logo.dataUrl ?? undefined,
    imageOptions: {
      imageSize: config.logo.size / 100,
      margin: Math.round(config.logo.margin * scale),
      hideBackgroundDots: config.logo.hideDots,
      saveAsBlob: true,
    },
    dotsOptions: {
      type: config.dotStyle as DotType,
      color: config.fgColor,
      gradient,
      roundSize: true,
    },
    cornersSquareOptions: {
      type: config.cornerSquareStyle as CornerSquareType,
      color: config.fgColor,
      gradient,
    },
    cornersDotOptions: {
      type: config.cornerDotStyle as CornerDotType,
      color: config.fgColor,
      gradient,
    },
    backgroundOptions: {
      color: config.transparentBg ? 'transparent' : config.bgColor,
    },
  }
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function sanitizeColor(value: string): string {
  return /^#[0-9a-f]{3,8}$/i.test(value) || value === 'transparent'
    ? value
    : '#000000'
}

/** Rounded-rectangle path, avoiding reliance on ctx.roundRect for older Safari. */
function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2))
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function frameFontSize(config: QRConfig, layout: FrameLayout): number {
  const scaled = config.frame.labelFontSize * (layout.size / BASE_SIZE)
  const max = layout.labelHeight * 0.72
  return Math.max(6, Math.min(Math.round(scaled), Math.round(max)))
}

function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read the generated QR image.'))
    }
    img.src = url
  })
}

async function getQrBlob(
  config: QRConfig,
  data: string,
  qrSize: number,
  extension: FileExtension,
): Promise<Blob> {
  const qr = new QRCodeStyling(
    buildQROptions(config, data, qrSize, extension === 'svg' ? 'svg' : 'canvas'),
  )
  const raw = await qr.getRawData(extension)
  if (!raw) throw new Error('QR image could not be generated.')
  if (raw instanceof Blob) return raw
  return new Blob([raw as unknown as BlobPart], {
    type: extension === 'svg' ? 'image/svg+xml' : 'image/png',
  })
}

/**
 * Renders the final PNG, including the decorative frame and label, by drawing
 * the QR artwork onto a canvas at the requested size.
 */
export async function renderPng(
  config: QRConfig,
  data: string,
  size: number,
): Promise<Blob> {
  const layout = computeFrameLayout(config, size)
  const qrBlob = await getQrBlob(config, data, layout.qrSize, 'png')
  const qrImage = await loadImage(qrBlob)

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available in this browser.')

  const frameColor = sanitizeColor(config.frame.color)

  if (layout.framed) {
    if (layout.style !== 'bordered') {
      ctx.fillStyle = frameColor
      roundedRectPath(ctx, 0, 0, size, size, layout.radius)
      ctx.fill()
    }

    ctx.drawImage(qrImage, layout.qrX, layout.qrY, layout.qrSize, layout.qrSize)

    if (layout.style === 'bordered' && layout.border > 0) {
      ctx.lineWidth = layout.border
      ctx.strokeStyle = frameColor
      const offset = layout.border / 2
      roundedRectPath(
        ctx,
        offset,
        offset,
        size - layout.border,
        size - layout.border,
        layout.radius,
      )
      ctx.stroke()
    }

    if (layout.hasLabel) {
      ctx.fillStyle = sanitizeColor(config.frame.labelColor)
      ctx.font = `600 ${frameFontSize(config, layout)}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(config.frame.label.trim(), size / 2, layout.labelY)
    }
  } else {
    ctx.drawImage(qrImage, 0, 0, size, size)
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('PNG export failed.'))
    }, 'image/png')
  })
}

/**
 * Builds the final SVG. The QR artwork is generated as an SVG by the library and
 * nested inside an outer SVG that supplies the frame and label. Text stays as
 * real text, so the file is crisp at any scale.
 */
export async function renderSvg(
  config: QRConfig,
  data: string,
  size: number,
): Promise<Blob> {
  const layout = computeFrameLayout(config, size)
  const qrBlob = await getQrBlob(config, data, layout.qrSize, 'svg')
  const qrSvgText = await qrBlob.text()

  const parsed = new DOMParser().parseFromString(qrSvgText, 'image/svg+xml')
  const qrElement = parsed.documentElement
  if (!qrElement || qrElement.nodeName.toLowerCase() !== 'svg') {
    throw new Error('The QR artwork could not be serialized to SVG.')
  }
  qrElement.setAttribute('x', String(layout.qrX))
  qrElement.setAttribute('y', String(layout.qrY))
  qrElement.setAttribute('width', String(layout.qrSize))
  qrElement.setAttribute('height', String(layout.qrSize))
  const nestedQr = new XMLSerializer().serializeToString(qrElement)

  let frame = ''
  if (layout.framed) {
    if (layout.style === 'bordered') {
      const offset = layout.border / 2
      frame += `<rect x="${offset}" y="${offset}" width="${size - layout.border}" height="${size - layout.border}" rx="${layout.radius}" fill="none" stroke="${escapeXml(sanitizeColor(config.frame.color))}" stroke-width="${layout.border}"/>`
    } else {
      frame += `<rect width="${size}" height="${size}" rx="${layout.radius}" fill="${escapeXml(sanitizeColor(config.frame.color))}"/>`
    }

    if (layout.hasLabel) {
      frame += `<text x="${size / 2}" y="${layout.labelY}" text-anchor="middle" dominant-baseline="central" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="${frameFontSize(config, layout)}" font-weight="600" fill="${escapeXml(sanitizeColor(config.frame.labelColor))}">${escapeXml(config.frame.label.trim())}</text>`
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${frame}${nestedQr}</svg>`
  return new Blob([svg], { type: 'image/svg+xml' })
}

export function exportBlob(
  config: QRConfig,
  data: string,
  extension: 'png' | 'svg',
): Promise<Blob> {
  const size = config.size
  return extension === 'png'
    ? renderPng(config, data, size)
    : renderSvg(config, data, size)
}

/** Converts the filename field into a safe, extension-less base name. */
export function sanitizeFilename(name: string): string {
  const cleaned = name
    .trim()
    .replace(/\.(png|svg|jpe?g|webp)$/i, '')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return cleaned || 'qr-code'
}

/** Generates the file and triggers a browser download. */
export async function downloadQr(
  config: QRConfig,
  data: string,
  extension: 'png' | 'svg',
): Promise<void> {
  const blob = await exportBlob(config, data, extension)
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${sanitizeFilename(config.filename)}.${extension}`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  // Revoke after the click has been handled by the browser.
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

/**
 * Copies a PNG of the QR to the clipboard. Requires a secure context
 * (https or localhost) and browser support for clipboard images.
 */
export async function copyQrToClipboard(
  config: QRConfig,
  data: string,
): Promise<void> {
  if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) {
    throw new Error(
      'Copying images is not supported in this browser. Use Download PNG instead.',
    )
  }
  const blob = await renderPng(config, data, config.size)
  const write = navigator.clipboard.write([
    new ClipboardItem({ 'image/png': blob }),
  ])
  // Some browsers keep the permission promise pending forever when the tab is
  // not focused, which would leave the UI stuck on "Copying…".
  let timer: number | undefined
  try {
    await Promise.race([
      write,
      new Promise<never>((_, reject) => {
        timer = window.setTimeout(
          () =>
            reject(
              new Error(
                'The browser did not grant clipboard access. Use Download PNG instead.',
              ),
            ),
          15000,
        )
      }),
    ])
  } finally {
    window.clearTimeout(timer)
    // A late rejection must not surface as an unhandled promise rejection.
    write.catch(() => {})
  }
}

export { BASE_SIZE }
