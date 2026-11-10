/** Escape characters that have meaning inside a WIFI: payload. */
export function escapeWifi(value: string): string {
  return value.replace(/([\\;,:"])/g, '\\$1')
}

/** Escape text for vCard and iCalendar property values. */
export function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/** Collapse a value to a single line for URI-like vCard fields. */
export function oneLine(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim()
}
