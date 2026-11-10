import type { TemplateDefinition } from './types'

export const emailTemplate: TemplateDefinition = {
  kind: 'email',
  label: 'Email',
  description: 'Open a pre-filled email to a recipient.',
  fields: [
    {
      id: 'to',
      label: 'To',
      type: 'email',
      required: true,
      placeholder: 'hello@example.com',
      autoComplete: 'email',
      maxLength: 200,
    },
    {
      id: 'subject',
      label: 'Subject',
      type: 'text',
      placeholder: 'Hello!',
      maxLength: 300,
    },
    {
      id: 'body',
      label: 'Message',
      type: 'textarea',
      placeholder: 'Write your message…',
      maxLength: 1000,
    },
  ],
  defaults: { to: '', subject: '', body: '' },
  build: (values) => {
    const to = (values.to ?? '').trim()
    if (!to) return ''

    const query: string[] = []
    const subject = (values.subject ?? '').trim()
    const body = (values.body ?? '').trim()
    if (subject) query.push(`subject=${encodeURIComponent(subject)}`)
    if (body) query.push(`body=${encodeURIComponent(body)}`)

    return `mailto:${to}${query.length ? `?${query.join('&')}` : ''}`
  },
}
