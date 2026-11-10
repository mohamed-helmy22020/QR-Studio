import type { TemplateDefinition } from './types'

export const smsTemplate: TemplateDefinition = {
  kind: 'sms',
  label: 'SMS',
  description: 'Open a text message with a recipient and draft.',
  fields: [
    {
      id: 'phone',
      label: 'Phone number',
      type: 'tel',
      required: true,
      placeholder: '+1 555 123 4567',
      autoComplete: 'tel',
      maxLength: 50,
    },
    {
      id: 'message',
      label: 'Message',
      type: 'textarea',
      placeholder: 'Hi! …',
      maxLength: 1000,
    },
  ],
  defaults: { phone: '', message: '' },
  build: (values) => {
    const phone = (values.phone ?? '').replace(/[\s().-]/g, '')
    if (!phone) return ''
    const message = (values.message ?? '').trim()
    return `SMSTO:${phone}${message ? `:${message}` : ''}`
  },
}
