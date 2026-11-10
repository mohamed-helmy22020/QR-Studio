import { PRESETS } from '../lib/defaults'
import type { Preset } from '../types'

interface PresetBarProps {
  onApply: (preset: Preset) => void
}

export function PresetBar({ onApply }: PresetBarProps) {
  return (
    <section aria-labelledby="presets-heading">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2
          id="presets-heading"
          className="text-[13px] font-semibold uppercase tracking-wider text-muted"
        >
          Presets
        </h2>
        <p className="text-xs text-muted">One click, fully restyled</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {PRESETS.map((preset) => {
          const fg = preset.patch.fgColor ?? '#0f172a'
          const bg = preset.patch.bgColor ?? '#ffffff'
          const swatch = preset.patch.gradientEnabled
            ? `linear-gradient(135deg, ${preset.patch.gradientFrom}, ${preset.patch.gradientTo})`
            : fg
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onApply(preset)}
              title={preset.description}
              className="group flex items-center gap-2.5 rounded-xl border border-line bg-surface p-2.5 text-left transition hover:border-brand/50 hover:bg-brand-soft/40 focus-visible:border-brand"
            >
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-black/5 shadow-inner"
                style={{ backgroundColor: bg }}
              >
                <span
                  className="h-4 w-4 rounded-[3px]"
                  style={{
                    background: swatch,
                    borderRadius: preset.patch.dotStyle === 'dots' ? '9999px' : 4,
                  }}
                />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium text-ink">
                  {preset.name}
                </span>
                <span className="block truncate text-[11px] text-muted">
                  {preset.description}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
