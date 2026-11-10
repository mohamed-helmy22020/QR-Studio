import type { QRConfig } from '../types'
import { ColorField, RangeField, Section, SwitchField } from './ui'

interface ColorsSectionProps {
  config: QRConfig
  update: (patch: Partial<QRConfig>) => void
}

export function ColorsSection({ config, update }: ColorsSectionProps) {
  return (
    <Section
      id="colors"
      title="Colors"
      description="Keep strong contrast between dots and background for reliable scanning."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <ColorField
          id="fg-color"
          label="Foreground"
          value={config.fgColor}
          onChange={(fgColor) => update({ fgColor })}
        />
        <ColorField
          id="bg-color"
          label="Background"
          value={config.bgColor}
          onChange={(bgColor) => update({ bgColor })}
          hint={config.transparentBg ? 'Background is currently transparent.' : undefined}
        />
      </div>

      <SwitchField
        id="transparent-bg"
        label="Transparent background"
        checked={config.transparentBg}
        onChange={(transparentBg) => update({ transparentBg })}
        description="Exports with an alpha channel. Useful for overlaying on artwork."
      />

      <div className="rounded-xl border border-line bg-surface-2/60 p-4">
        <SwitchField
          id="gradient-enabled"
          label="Gradient dots"
          checked={config.gradientEnabled}
          onChange={(gradientEnabled) => update({ gradientEnabled })}
          description="A smooth linear gradient across the QR pattern."
        />
        {config.gradientEnabled ? (
          <div className="mt-4 space-y-4 border-t border-line pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField
                id="gradient-from"
                label="From"
                value={config.gradientFrom}
                onChange={(gradientFrom) => update({ gradientFrom })}
              />
              <ColorField
                id="gradient-to"
                label="To"
                value={config.gradientTo}
                onChange={(gradientTo) => update({ gradientTo })}
              />
            </div>
            <RangeField
              id="gradient-angle"
              label="Angle"
              value={config.gradientAngle}
              min={0}
              max={360}
              suffix="°"
              onChange={(gradientAngle) => update({ gradientAngle })}
            />
          </div>
        ) : null}
      </div>
    </Section>
  )
}
