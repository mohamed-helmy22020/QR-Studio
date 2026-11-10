import { useState } from 'react'
import type { QRConfig } from '../types'
import { Alert, Button, FileButton, RangeField, Section, SwitchField } from './ui'

const MAX_LOGO_BYTES = 2 * 1024 * 1024
const ACCEPTED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/svg+xml',
  'image/webp',
]

interface LogoSectionProps {
  config: QRConfig
  update: (patch: Partial<QRConfig>) => void
  onLogoSet: (dataUrl: string) => void
  onLogoClear: () => void
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string' && result.startsWith('data:image/')) {
        resolve(result)
      } else {
        reject(new Error('That file could not be read as an image.'))
      }
    }
    reader.onerror = () => reject(new Error('That file could not be read.'))
    reader.readAsDataURL(file)
  })
}

export function LogoSection({
  config,
  update,
  onLogoSet,
  onLogoClear,
}: LogoSectionProps) {
  const [error, setError] = useState<string | null>(null)
  const [reading, setReading] = useState(false)
  const logo = config.logo

  const handleFile = async (file: File) => {
    setError(null)
    const hasAcceptedType = ACCEPTED_TYPES.includes(file.type)
    const looksLikeSvg =
      file.name.toLowerCase().endsWith('.svg') && file.type === 'image/svg+xml'
    if (!hasAcceptedType && !looksLikeSvg) {
      setError('Unsupported file type. Use a PNG, JPG, or SVG image.')
      return
    }
    if (file.size > MAX_LOGO_BYTES) {
      setError('That image is larger than 2 MB. Please compress it and retry.')
      return
    }
    setReading(true)
    try {
      const dataUrl = await readFileAsDataUrl(file)
      onLogoSet(dataUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logo upload failed.')
    } finally {
      setReading(false)
    }
  }

  return (
    <Section
      id="logo"
      title="Logo"
      description="Center an image in the code. PNG, JPG and SVG up to 2 MB."
    >
      {logo.dataUrl ? (
        <>
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-3">
            <div className="checkerboard flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg">
              <img
                src={logo.dataUrl}
                alt="Current logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">Logo added</p>
              <p className="text-xs text-muted">
                {logo.size}% of the QR width, {logo.margin}px padding
              </p>
            </div>
            <Button variant="danger" icon="trash" onClick={onLogoClear}>
              Clear
            </Button>
          </div>

          <RangeField
            id="logo-size"
            label="Logo size"
            value={logo.size}
            min={10}
            max={40}
            suffix="%"
            onChange={(size) => update({ logo: { ...logo, size } })}
            hint="Larger logos hide more data. Keep error correction high."
          />
          <RangeField
            id="logo-margin"
            label="Logo margin"
            value={logo.margin}
            min={0}
            max={30}
            suffix="px"
            onChange={(margin) => update({ logo: { ...logo, margin } })}
            hint="Extra clear space around the logo."
          />
          <SwitchField
            id="logo-hide-dots"
            label="Hide dots behind logo"
            checked={logo.hideDots}
            onChange={(hideDots) => update({ logo: { ...logo, hideDots } })}
            description="Removes modules underneath the image for a cleaner look."
          />
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line-strong bg-surface-2/60 px-4 py-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-ink">No logo yet</p>
            <p className="mt-1 text-xs text-muted">
              Optional. Error correction switches to H for safety.
            </p>
          </div>
          <FileButton
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            label={reading ? 'Reading…' : 'Upload logo'}
            onFile={handleFile}
          />
        </div>
      )}

      {logo.dataUrl ? (
        <div className="flex flex-wrap gap-2">
          <FileButton
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            label={reading ? 'Reading…' : 'Replace logo'}
            onFile={handleFile}
          />
        </div>
      ) : null}

      {error ? <Alert tone="danger">{error}</Alert> : null}
    </Section>
  )
}
