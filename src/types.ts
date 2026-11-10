import type { TemplateConfig } from './lib/templates/types'

/** Shapes of the style values supported by qr-code-styling. */
export type DotStyle =
  | 'square'
  | 'dots'
  | 'rounded'
  | 'classy'
  | 'classy-rounded'
  | 'extra-rounded'

export type CornerSquareStyle = 'square' | 'dot' | 'extra-rounded'
export type CornerDotStyle = 'square' | 'dot'
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'
export type FrameStyle =
  | 'none'
  | 'rounded'
  | 'bordered'
  | 'label-bottom'
  | 'label-top'

export interface LogoConfig {
  /** Data URL of the uploaded image, or null when no logo is set. */
  dataUrl: string | null
  /** Logo width as a percentage of the QR code (10–40). */
  size: number
  /** Space between the logo artwork and the dots, in px at 512px. */
  margin: number
  /** Remove dots underneath the logo so it stays readable. */
  hideDots: boolean
}

export interface FrameConfig {
  enabled: boolean
  style: FrameStyle
  color: string
  label: string
  labelColor: string
  /** Label font size in px at 512px output; scaled for other sizes. */
  labelFontSize: number
}

export interface QRConfig {
  content: string
  template: TemplateConfig
  fgColor: string
  bgColor: string
  transparentBg: boolean
  gradientEnabled: boolean
  gradientFrom: string
  gradientTo: string
  gradientAngle: number
  dotStyle: DotStyle
  cornerSquareStyle: CornerSquareStyle
  cornerDotStyle: CornerDotStyle
  logo: LogoConfig
  frame: FrameConfig
  size: number
  ecLevel: ErrorCorrectionLevel
  /** Quiet zone in px at 512px, scaled for other sizes. */
  margin: number
  filename: string
}

export type PresetPatch = Partial<
  Omit<QRConfig, 'logo' | 'frame'>
> & {
  logo?: Partial<LogoConfig>
  frame?: Partial<FrameConfig>
}

export interface Preset {
  id: string
  name: string
  description: string
  patch: PresetPatch
}
