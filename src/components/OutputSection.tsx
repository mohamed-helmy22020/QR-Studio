import { useEffect, useState } from 'react'
import type { ErrorCorrectionLevel, QRConfig } from '../types'
import { ConfigTools } from './ConfigTools'
import { Alert, Button, Field, RangeField, Section, SelectField, TextInput } from './ui'

const EC_OPTIONS: Array<{ value: ErrorCorrectionLevel; label: string }> = [
  { value: 'L', label: 'L — low (7%)' },
  { value: 'M', label: 'M — medium (15%)' },
  { value: 'Q', label: 'Q — quartile (25%)' },
  { value: 'H', label: 'H — high (30%)' },
]

type BusyAction = 'png' | 'svg' | 'copy' | null

interface OutputSectionProps {
  config: QRConfig
  update: (patch: Partial<QRConfig>) => void
  busy: BusyAction
  error: string | null
  onDownload: (extension: 'png' | 'svg') => void
  onCopyImage: () => void
  onCopyConfig: () => Promise<void>
  onLoadConfig: (config: QRConfig) => void
  onReset: () => void
}

function SizeInput({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  const [draft, setDraft] = useState(String(value))

  useEffect(() => setDraft(String(value)), [value])

  const commit = () => {
    const parsed = Math.round(Number(draft))
    if (!Number.isFinite(parsed)) {
      setDraft(String(value))
      return
    }
    const clamped = Math.min(2048, Math.max(128, parsed))
    setDraft(String(clamped))
    onChange(clamped)
  }

  return (
    <div className="flex items-center gap-2">
      <TextInput
        id="output-size"
        type="number"
        inputMode="numeric"
        min={128}
        max={2048}
        step={1}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            commit()
          }
        }}
        className="font-mono tabular-nums"
      />
      <span className="text-xs text-muted">px</span>
    </div>
  )
}

export function OutputSection({
  config,
  update,
  busy,
  error,
  onDownload,
  onCopyImage,
  onCopyConfig,
  onLoadConfig,
  onReset,
}: OutputSectionProps) {
  return (
    <Section
      id="output"
      title="Output"
      description="Export a print-ready file, or copy the image straight to your clipboard."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Image size"
          htmlFor="output-size"
          hint="128–2048 px. The whole image, frame included."
        >
          <SizeInput value={config.size} onChange={(size) => update({ size })} />
        </Field>
        <SelectField
          id="ec-level"
          label="Error correction"
          value={config.ecLevel}
          onChange={(value) =>
            update({ ecLevel: value as ErrorCorrectionLevel })
          }
          options={EC_OPTIONS}
          hint={
            config.logo.dataUrl
              ? 'H is recommended with a logo.'
              : 'Higher levels survive more damage.'
          }
        />
      </div>

      <RangeField
        id="quiet-zone"
        label="Margin (quiet zone)"
        value={config.margin}
        min={0}
        max={80}
        suffix="px"
        onChange={(margin) => update({ margin })}
        hint="Leave at least 16px for reliable scanning. Scales with image size."
      />

      <Field
        label="Filename"
        htmlFor="filename"
        hint="The extension is added automatically."
      >
        <TextInput
          id="filename"
          type="text"
          value={config.filename}
          maxLength={80}
          spellCheck={false}
          placeholder="qr-code"
          onChange={(event) => update({ filename: event.target.value })}
          className="font-mono"
        />
      </Field>

      <div className="grid gap-2 sm:grid-cols-2">
        <Button
          variant="primary"
          icon="download"
          loading={busy === 'png'}
          onClick={() => onDownload('png')}
          className="w-full"
        >
          {busy === 'png' ? 'Downloading…' : 'Download PNG'}
        </Button>
        <Button
          variant="secondary"
          icon="download"
          loading={busy === 'svg'}
          onClick={() => onDownload('svg')}
          className="w-full"
        >
          {busy === 'svg' ? 'Downloading…' : 'Download SVG'}
        </Button>
        <Button
          variant="secondary"
          icon="copy"
          loading={busy === 'copy'}
          onClick={onCopyImage}
          className="w-full sm:col-span-2"
        >
          {busy === 'copy' ? 'Copying…' : 'Copy image to clipboard'}
        </Button>
      </div>

      {error ? <Alert tone="danger">{error}</Alert> : null}

      <div className="border-t border-line pt-4">
        <ConfigTools
          onCopyConfig={onCopyConfig}
          onLoadConfig={onLoadConfig}
          onReset={onReset}
        />
      </div>
    </Section>
  )
}

export type { BusyAction }
