import { getTemplate, TEMPLATE_DEFINITIONS, TEMPLATE_KINDS } from './definitions'
import type {
  TemplateConfig,
  TemplateField,
  TemplateKind,
  TemplateValues,
  TemplateValuesByKind,
} from './types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isTemplateKind(value: unknown): value is TemplateKind {
  return (
    typeof value === 'string' &&
    TEMPLATE_KINDS.includes(value as TemplateKind)
  )
}

function fieldLimit(field: TemplateField): number {
  if (field.maxLength) return field.maxLength
  return field.type === 'textarea' ? 1000 : 200
}

/**
 * Validates template state from localStorage or imported JSON. Only known
 * kinds and fields survive, so a bad config can never inject arbitrary data.
 */
export function normalizeTemplate(
  raw: unknown,
  fallback: TemplateConfig,
): TemplateConfig {
  if (!isRecord(raw)) return fallback

  const kind = isTemplateKind(raw.kind) ? raw.kind : fallback.kind
  const rawValues = isRecord(raw.values) ? raw.values : {}
  const values: TemplateValuesByKind = {}

  for (const definition of TEMPLATE_DEFINITIONS) {
    const entry = rawValues[definition.kind]
    if (!isRecord(entry)) continue

    const clean: TemplateValues = {}
    for (const field of definition.fields) {
      const value = entry[field.id]
      if (typeof value === 'string') {
        clean[field.id] = value.slice(0, fieldLimit(field))
      }
    }
    values[definition.kind] = { ...definition.defaults, ...clean }
  }

  const active = getTemplate(kind)
  if (active && !values[active.kind]) {
    values[active.kind] = { ...active.defaults }
  }

  return { kind, values }
}
