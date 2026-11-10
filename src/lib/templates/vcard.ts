import { escapeText, oneLine } from './escape'
import type { TemplateDefinition } from './types'

export const vcardTemplate: TemplateDefinition = {
  kind: 'vcard',
  label: 'vCard',
  description: 'Share contact details that save straight to an address book.',
  fields: [
    {
      id: 'firstName',
      label: 'First name',
      type: 'text',
      autoComplete: 'given-name',
      maxLength: 100,
    },
    {
      id: 'lastName',
      label: 'Last name',
      type: 'text',
      autoComplete: 'family-name',
      maxLength: 100,
    },
    {
      id: 'organization',
      label: 'Organization',
      type: 'text',
      autoComplete: 'organization',
      maxLength: 200,
    },
    {
      id: 'title',
      label: 'Job title',
      type: 'text',
      autoComplete: 'organization-title',
      maxLength: 200,
    },
    {
      id: 'phone',
      label: 'Phone',
      type: 'tel',
      autoComplete: 'tel',
      maxLength: 50,
    },
    {
      id: 'email',
      label: 'Email',
      type: 'email',
      autoComplete: 'email',
      maxLength: 200,
    },
    {
      id: 'website',
      label: 'Website',
      type: 'url',
      autoComplete: 'url',
      maxLength: 300,
    },
    {
      id: 'address',
      label: 'Address',
      type: 'textarea',
      autoComplete: 'street-address',
      maxLength: 300,
    },
  ],
  defaults: {
    firstName: '',
    lastName: '',
    organization: '',
    title: '',
    phone: '',
    email: '',
    website: '',
    address: '',
  },
  build: (values) => {
    const first = (values.firstName ?? '').trim()
    const last = (values.lastName ?? '').trim()
    const organization = (values.organization ?? '').trim()
    if (!first && !last && !organization) return ''

    const fullName = [first, last].filter(Boolean).join(' ') || organization
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${escapeText(last)};${escapeText(first)};;;`,
      `FN:${escapeText(fullName)}`,
    ]

    if (organization) lines.push(`ORG:${escapeText(organization)}`)

    const title = (values.title ?? '').trim()
    if (title) lines.push(`TITLE:${escapeText(title)}`)

    const phone = oneLine(values.phone ?? '')
    if (phone) lines.push(`TEL;TYPE=CELL:${phone}`)

    const email = oneLine(values.email ?? '')
    if (email) lines.push(`EMAIL:${email}`)

    const website = oneLine(values.website ?? '')
    if (website) lines.push(`URL:${website}`)

    const address = (values.address ?? '').trim()
    if (address) lines.push(`ADR;TYPE=WORK:;;${escapeText(address)};;;;`)

    lines.push('END:VCARD')
    return lines.join('\n')
  },
}
