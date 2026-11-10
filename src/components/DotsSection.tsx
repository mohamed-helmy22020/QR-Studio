import type {
  CornerDotStyle,
  CornerSquareStyle,
  DotStyle,
  QRConfig,
} from '../types'
import { Section, SelectField } from './ui'

const DOT_OPTIONS: Array<{ value: DotStyle; label: string }> = [
  { value: 'square', label: 'Square' },
  { value: 'dots', label: 'Dots' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy rounded' },
  { value: 'extra-rounded', label: 'Extra rounded' },
]

const CORNER_SQUARE_OPTIONS: Array<{ value: CornerSquareStyle; label: string }> =
  [
    { value: 'square', label: 'Square' },
    { value: 'dot', label: 'Dot' },
    { value: 'extra-rounded', label: 'Extra rounded' },
  ]

const CORNER_DOT_OPTIONS: Array<{ value: CornerDotStyle; label: string }> = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dot' },
]

interface DotsSectionProps {
  config: QRConfig
  update: (patch: Partial<QRConfig>) => void
}

export function DotsSection({ config, update }: DotsSectionProps) {
  return (
    <Section
      id="dots"
      title="Dots"
      description="Shape the data modules and the three finder corners independently."
    >
      <SelectField
        id="dot-style"
        label="Dot style"
        value={config.dotStyle}
        onChange={(value) => update({ dotStyle: value as DotStyle })}
        options={DOT_OPTIONS}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          id="corner-square-style"
          label="Corner square"
          value={config.cornerSquareStyle}
          onChange={(value) =>
            update({ cornerSquareStyle: value as CornerSquareStyle })
          }
          options={CORNER_SQUARE_OPTIONS}
          hint="The outer ring of the three finder patterns."
        />
        <SelectField
          id="corner-dot-style"
          label="Corner dot"
          value={config.cornerDotStyle}
          onChange={(value) => update({ cornerDotStyle: value as CornerDotStyle })}
          options={CORNER_DOT_OPTIONS}
          hint="The center of the finder patterns."
        />
      </div>
    </Section>
  )
}
