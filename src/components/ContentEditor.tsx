import { useMemo } from 'react'
import { clampContent, MAX_CONTENT_LENGTH } from '../lib/content'
import { getTemplate } from '../lib/templates'
import type {
  TemplateConfig,
  TemplateKind,
  TemplateValues,
} from '../lib/templates/types'
import { TemplateForm } from './TemplateForm'
import { TemplatePicker } from './TemplatePicker'

interface ContentEditorProps {
  content: string
  template: TemplateConfig
  onChange: (next: { content: string; template: TemplateConfig }) => void
}

const textareaClass =
  'w-full resize-y rounded-xl border border-line bg-surface-2 px-3.5 py-3 font-mono text-sm leading-6 text-ink placeholder:text-muted/70 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 read-only:text-muted'

export function ContentEditor({
  content,
  template,
  onChange,
}: ContentEditorProps) {
  const definition = getTemplate(template.kind)

  const values = useMemo<TemplateValues>(() => {
    if (!definition) return {}
    return { ...definition.defaults, ...template.values[definition.kind] }
  }, [definition, template.values])

  const changeKind = (kind: TemplateKind) => {
    if (kind === template.kind) return
    const nextDefinition = getTemplate(kind)
    if (!nextDefinition) {
      onChange({ content, template: { ...template, kind } })
      return
    }

    const nextValues = {
      ...nextDefinition.defaults,
      ...template.values[nextDefinition.kind],
    }
    onChange({
      content: clampContent(nextDefinition.build(nextValues)),
      template: {
        ...template,
        kind,
        values: { ...template.values, [nextDefinition.kind]: nextValues },
      },
    })
  }

  const changeValue = (id: string, value: string) => {
    if (!definition) return

    const nextValues: TemplateValues = { ...values, [id]: value }
    onChange({
      content: clampContent(definition.build(nextValues)),
      template: {
        ...template,
        values: { ...template.values, [definition.kind]: nextValues },
      },
    })
  }

  return (
    <div className="space-y-4">
      <TemplatePicker value={template.kind} onChange={changeKind} />

      {definition ? (
        <>
          <p className="text-xs leading-5 text-muted">
            {definition.description} Switching templates replaces the current
            content.
          </p>
          <TemplateForm
            definition={definition}
            values={values}
            onChange={changeValue}
          />
          <div>
            <label
              htmlFor="qr-template-payload"
              className="block text-[13px] font-medium text-ink"
            >
              Generated payload
            </label>
            <textarea
              id="qr-template-payload"
              value={content}
              readOnly
              rows={5}
              spellCheck={false}
              aria-describedby="qr-content-meta"
              className={textareaClass}
            />
          </div>
        </>
      ) : (
        <div>
          <label htmlFor="qr-content" className="sr-only">
            QR code content
          </label>
          <textarea
            id="qr-content"
            value={content}
            onChange={(event) =>
              onChange({
                content: clampContent(event.target.value),
                template,
              })
            }
            rows={5}
            placeholder="https://example.com"
            aria-describedby="qr-content-meta"
            spellCheck={false}
            className={textareaClass}
          />
        </div>
      )}

      <div
        id="qr-content-meta"
        className="flex items-center justify-between gap-3 text-xs text-muted"
      >
        <span>
          {definition
            ? 'Generated from the form. Choose Text to edit it by hand.'
            : 'Updates 300ms after you stop typing.'}
        </span>
        <span
          className={
            content.length > MAX_CONTENT_LENGTH * 0.9
              ? 'font-medium text-warning'
              : ''
          }
        >
          {content.length.toLocaleString()} /{' '}
          {MAX_CONTENT_LENGTH.toLocaleString()}
        </span>
      </div>
    </div>
  )
}
