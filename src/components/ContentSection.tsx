import { Section } from './ui'

const MAX_LENGTH = 4000

interface ContentSectionProps {
  content: string
  onChange: (content: string) => void
}

export function ContentSection({ content, onChange }: ContentSectionProps) {
  return (
    <Section
      id="content"
      title="Content"
      description="A URL, plain text, Wi-Fi string, vCard — anything a QR code can hold."
      action={
        content ? (
          <button
            type="button"
            onClick={() => onChange('')}
            className="rounded-lg px-2 py-1 text-xs font-medium text-muted transition hover:bg-surface-2 hover:text-ink"
          >
            Clear
          </button>
        ) : null
      }
    >
      <div>
        <label htmlFor="qr-content" className="sr-only">
          QR code content
        </label>
        <textarea
          id="qr-content"
          value={content}
          onChange={(event) => onChange(event.target.value.slice(0, MAX_LENGTH))}
          rows={5}
          placeholder="https://example.com"
          aria-describedby="qr-content-meta"
          spellCheck={false}
          className="w-full resize-y rounded-xl border border-line bg-surface-2 px-3.5 py-3 font-mono text-sm leading-6 text-ink placeholder:text-muted/70 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
        />
        <div
          id="qr-content-meta"
          className="mt-2 flex items-center justify-between gap-3 text-xs text-muted"
        >
          <span>Updates 300ms after you stop typing.</span>
          <span
            className={
              content.length > MAX_LENGTH * 0.9 ? 'font-medium text-warning' : ''
            }
          >
            {content.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
          </span>
        </div>
      </div>
    </Section>
  )
}
