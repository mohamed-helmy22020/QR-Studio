import type { QRConfig } from '../types'
import { ContentEditor } from './ContentEditor'
import { Section } from './ui'

interface ContentSectionProps {
  config: QRConfig
  update: (patch: Partial<QRConfig>) => void
}

export function ContentSection({ config, update }: ContentSectionProps) {
  return (
    <Section
      id="content"
      title="Content"
      description="Pick a template or type anything a QR code can hold."
      action={
        config.content ? (
          <button
            type="button"
            onClick={() =>
              update({
                content: '',
                template: { kind: 'text', values: {} },
              })
            }
            className="rounded-lg px-2 py-1 text-xs font-medium text-muted transition hover:bg-surface-2 hover:text-ink"
          >
            Clear
          </button>
        ) : null
      }
    >
      <ContentEditor
        content={config.content}
        template={config.template}
        onChange={({ content, template }) => update({ content, template })}
      />
    </Section>
  )
}
