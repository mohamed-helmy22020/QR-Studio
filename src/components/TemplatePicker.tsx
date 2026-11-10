import { cx } from '../lib/cx'
import { TEMPLATE_DEFINITIONS } from '../lib/templates'
import type { TemplateKind } from '../lib/templates/types'

const OPTIONS: Array<{ kind: TemplateKind; label: string }> = [
  { kind: 'text', label: 'Text' },
  ...TEMPLATE_DEFINITIONS.map((definition) => ({
    kind: definition.kind,
    label: definition.label,
  })),
]

export function TemplatePicker({
  value,
  onChange,
}: {
  value: TemplateKind
  onChange: (kind: TemplateKind) => void
}) {
  return (
    <div role="group" aria-label="Content type" className="flex flex-wrap gap-1.5">
      {OPTIONS.map((option) => {
        const selected = option.kind === value
        return (
          <button
            key={option.kind}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.kind)}
            className={cx(
              'rounded-lg border px-2.5 py-1.5 text-xs font-medium transition',
              selected
                ? 'border-brand bg-brand-soft text-ink'
                : 'border-line bg-surface text-muted hover:border-line-strong hover:bg-surface-2 hover:text-ink',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
