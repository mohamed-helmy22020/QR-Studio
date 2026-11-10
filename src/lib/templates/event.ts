import { escapeText } from './escape'
import type { TemplateDefinition } from './types'

/** Convert a datetime-local value (YYYY-MM-DDTHH:mm) to an iCalendar stamp. */
function toICalDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value)
  if (!match) return ''
  return `${match[1]}${match[2]}${match[3]}T${match[4]}${match[5]}00`
}

export const eventTemplate: TemplateDefinition = {
  kind: 'event',
  label: 'Event',
  description: 'Add a calendar event with a title, time and place.',
  fields: [
    {
      id: 'title',
      label: 'Event title',
      type: 'text',
      required: true,
      placeholder: 'Product launch',
      maxLength: 200,
    },
    {
      id: 'location',
      label: 'Location',
      type: 'text',
      placeholder: 'Studio 2',
      maxLength: 300,
    },
    {
      id: 'start',
      label: 'Starts',
      type: 'datetime',
      required: true,
      maxLength: 30,
    },
    {
      id: 'end',
      label: 'Ends',
      type: 'datetime',
      maxLength: 30,
    },
    {
      id: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'What is happening?',
      maxLength: 1000,
    },
  ],
  defaults: { title: '', location: '', start: '', end: '', description: '' },
  build: (values) => {
    const title = (values.title ?? '').trim()
    const start = toICalDate(values.start ?? '')
    if (!title || !start) return ''

    const lines = ['BEGIN:VEVENT', `SUMMARY:${escapeText(title)}`]

    const location = (values.location ?? '').trim()
    if (location) lines.push(`LOCATION:${escapeText(location)}`)

    lines.push(`DTSTART:${start}`)

    const end = toICalDate(values.end ?? '')
    if (end) lines.push(`DTEND:${end}`)

    const description = (values.description ?? '').trim()
    if (description) lines.push(`DESCRIPTION:${escapeText(description)}`)

    lines.push('END:VEVENT')
    return lines.join('\n')
  },
}
