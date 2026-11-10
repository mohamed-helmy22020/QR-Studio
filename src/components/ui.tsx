import {
  useEffect,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { cx } from '../lib/cx'
import { Icon, type IconName } from './Icon'

export function Section({
  id,
  title,
  description,
  children,
  action,
}: {
  id: string
  title: string
  description?: string
  children: ReactNode
  action?: ReactNode
}) {
  const headingId = `${id}-heading`
  return (
    <section
      aria-labelledby={headingId}
      className="rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6"
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2
            id={headingId}
            className="text-[15px] font-semibold tracking-[-0.01em] text-ink"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-[13px] leading-5 text-muted">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  )
}

const fieldLabelClass = 'block text-[13px] font-medium text-ink'

export function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string
  htmlFor?: string
  hint?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cx('space-y-2', className)}>
      <label htmlFor={htmlFor} className={fieldLabelClass}>
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs leading-5 text-muted">{hint}</p> : null}
    </div>
  )
}

const inputClass =
  'w-full rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-muted/70 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-60'

export function TextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(inputClass, className)} />
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  hint,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  hint?: string
}) {
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cx(inputClass, 'appearance-none pr-9')}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </Field>
  )
}

export function RangeField({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  suffix = '',
  onChange,
  hint,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  step?: number
  suffix?: string
  onChange: (value: number) => void
  hint?: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className={fieldLabelClass}>
          {label}
        </label>
        <output
          htmlFor={id}
          className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-xs tabular-nums text-muted"
        >
          {value}
          {suffix}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-5 w-full cursor-pointer"
      />
      {hint ? <p className="text-xs leading-5 text-muted">{hint}</p> : null}
    </div>
  )
}

export function SwitchField({
  id,
  label,
  checked,
  onChange,
  description,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  description?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className={fieldLabelClass}>
          {label}
        </label>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
        ) : null}
      </div>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        aria-hidden="true"
        className={cx(
          'relative mt-0.5 h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-colors',
          'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand',
          checked
            ? 'border-brand bg-brand'
            : 'border-line-strong bg-surface-2',
        )}
      >
        <span
          className={cx(
            'absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow-sm transition-transform',
            checked ? 'translate-x-5.5' : 'translate-x-0.5',
          )}
        />
      </label>
    </div>
  )
}

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

export function ColorField({
  id,
  label,
  value,
  onChange,
  hint,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
}) {
  const [text, setText] = useState(value)
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    setText(value)
    setInvalid(false)
  }, [value])

  const commit = (raw: string) => {
    if (HEX.test(raw)) {
      onChange(raw.toLowerCase())
      setText(raw.toLowerCase())
      setInvalid(false)
    } else {
      setInvalid(true)
    }
  }

  const inputId = `${id}-text`
  return (
    <Field label={label} htmlFor={inputId} hint={hint}>
      <div className="flex items-center gap-2">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-line">
          <input
            id={id}
            type="color"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            aria-label={`${label} color picker`}
            className="absolute -inset-2 h-14 w-14 cursor-pointer border-0 bg-transparent p-0"
          />
        </div>
        <input
          id={inputId}
          type="text"
          value={text}
          spellCheck={false}
          autoComplete="off"
          maxLength={7}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-error` : undefined}
          onChange={(event) => {
            setText(event.target.value)
            const next = event.target.value.startsWith('#')
              ? event.target.value
              : `#${event.target.value}`
            if (HEX.test(next)) commit(next)
            else setInvalid(true)
          }}
          onBlur={() => {
            if (!HEX.test(text)) {
              setText(value)
              setInvalid(false)
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commit(text)
            }
          }}
          className={cx(
            inputClass,
            'font-mono text-xs uppercase',
            invalid && 'border-danger focus:border-danger focus:ring-danger/20',
          )}
        />
      </div>
      {invalid ? (
        <p id={`${id}-error`} className="text-xs text-danger">
          Use a hex color, e.g. #4f46e5.
        </p>
      ) : null}
    </Field>
  )
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

export function Button({
  variant = 'secondary',
  icon,
  loading,
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  icon?: IconName
  loading?: boolean
}) {
  const variants: Record<ButtonVariant, string> = {
    primary:
      'border-transparent bg-brand text-brand-fg hover:bg-brand-hover shadow-sm',
    secondary:
      'border-line bg-surface text-ink hover:border-line-strong hover:bg-surface-2',
    ghost:
      'border-transparent bg-transparent text-muted hover:bg-surface-2 hover:text-ink',
    danger:
      'border-line bg-surface text-danger hover:border-danger/40 hover:bg-danger-soft',
  }
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || loading}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className,
      )}
    >
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : icon ? (
        <Icon name={icon} />
      ) : null}
      {children}
    </button>
  )
}

export function Alert({
  tone = 'warning',
  children,
  id,
}: {
  tone?: 'warning' | 'danger' | 'info'
  children: ReactNode
  id?: string
}) {
  const tones = {
    warning:
      'border-warning-line/60 bg-warning-soft text-warning',
    danger: 'border-danger/30 bg-danger-soft text-danger',
    info: 'border-brand/25 bg-brand-soft text-ink',
  }
  return (
    <div
      id={id}
      role={tone === 'info' ? 'status' : 'alert'}
      className={cx(
        'flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs leading-5',
        tones[tone],
      )}
    >
      <Icon name="alert" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <div>{children}</div>
    </div>
  )
}

/** Hidden file input + trigger used by logo upload and config import. */
export function FileButton({
  accept,
  label,
  icon = 'upload',
  onFile,
  variant = 'secondary',
  className,
}: {
  accept: string
  label: string
  icon?: IconName
  onFile: (file: File) => void
  variant?: ButtonVariant
  className?: string
}) {
  const inputId = useId()
  return (
    <>
      <input
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onFile(file)
          // Reset so selecting the same file again still fires onChange.
          event.target.value = ''
        }}
      />
      <label
        htmlFor={inputId}
        className={cx(
          'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition',
          variant === 'primary'
            ? 'border-transparent bg-brand text-brand-fg hover:bg-brand-hover shadow-sm'
            : 'border-line bg-surface text-ink hover:border-line-strong hover:bg-surface-2',
          className,
        )}
      >
        <Icon name={icon} />
        {label}
      </label>
    </>
  )
}
