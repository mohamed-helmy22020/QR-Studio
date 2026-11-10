/** Hard limit for QR content; keeps payloads scannable and storage small. */
export const MAX_CONTENT_LENGTH = 4000

export function clampContent(value: string): string {
  return value.slice(0, MAX_CONTENT_LENGTH)
}
