import type { FrameStyle, QRConfig } from '../types'
import {
  ColorField,
  Field,
  RangeField,
  Section,
  SelectField,
  SwitchField,
  TextInput,
} from './ui'

const FRAME_OPTIONS: Array<{ value: FrameStyle; label: string }> = [
  { value: 'rounded', label: 'Rounded' },
  { value: 'bordered', label: 'Bordered' },
  { value: 'label-bottom', label: 'Label bottom' },
  { value: 'label-top', label: 'Label top' },
  { value: 'none', label: 'None' },
]

interface FrameSectionProps {
  config: QRConfig
  update: (patch: Partial<QRConfig>) => void
}

export function FrameSection({ config, update }: FrameSectionProps) {
  const frame = config.frame
  const frameVisible = frame.enabled && frame.style !== 'none'
  const showLabel =
    frameVisible &&
    (frame.style === 'label-bottom' || frame.style === 'label-top')

  const patchFrame = (patch: Partial<QRConfig['frame']>) =>
    update({ frame: { ...frame, ...patch } })

  return (
    <Section
      id="frame"
      title="Frame"
      description="An optional decorative wrapper with a call-to-action label."
    >
      <SwitchField
        id="frame-enabled"
        label="Show frame"
        checked={frame.enabled}
        onChange={(enabled) => patchFrame({ enabled })}
        description="The exported image grows to fit the frame; the QR stays crisp."
      />

      {frame.enabled ? (
        <div className="space-y-5 border-t border-line pt-5">
          <SelectField
            id="frame-style"
            label="Frame style"
            value={frame.style}
            onChange={(value) => patchFrame({ style: value as FrameStyle })}
            options={FRAME_OPTIONS}
          />

          {frameVisible ? (
            <>
              <ColorField
                id="frame-color"
                label="Frame color"
                value={frame.color}
                onChange={(color) => patchFrame({ color })}
              />

              {showLabel ? (
                <div className="space-y-5 rounded-xl border border-line bg-surface-2/60 p-4">
                  <Field
                    label="Label text"
                    htmlFor="frame-label"
                    hint="Up to 40 characters. Leave empty to hide the label."
                  >
                    <TextInput
                      id="frame-label"
                      type="text"
                      maxLength={40}
                      value={frame.label}
                      placeholder="Scan me"
                      onChange={(event) =>
                        patchFrame({ label: event.target.value })
                      }
                    />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <ColorField
                      id="frame-label-color"
                      label="Label color"
                      value={frame.labelColor}
                      onChange={(labelColor) => patchFrame({ labelColor })}
                    />
                    <RangeField
                      id="frame-label-size"
                      label="Label size"
                      value={frame.labelFontSize}
                      min={10}
                      max={48}
                      suffix="px"
                      onChange={(labelFontSize) =>
                        patchFrame({ labelFontSize })
                      }
                      hint="At 512px output; scales with size."
                    />
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </Section>
  )
}
