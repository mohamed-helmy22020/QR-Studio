import { emailTemplate } from './email'
import { eventTemplate } from './event'
import { geoTemplate } from './geo'
import { smsTemplate } from './sms'
import type { TemplateDefinition, TemplateKind } from './types'
import { vcardTemplate } from './vcard'
import { wifiTemplate } from './wifi'

export const TEMPLATE_DEFINITIONS: TemplateDefinition[] = [
  wifiTemplate,
  vcardTemplate,
  emailTemplate,
  smsTemplate,
  geoTemplate,
  eventTemplate,
]

export const TEMPLATE_KINDS: TemplateKind[] = [
  'text',
  ...TEMPLATE_DEFINITIONS.map((definition) => definition.kind),
]

export function getTemplate(kind: TemplateKind): TemplateDefinition | null {
  return (
    TEMPLATE_DEFINITIONS.find((definition) => definition.kind === kind) ?? null
  )
}
