export type TemplateKind =
  | 'text'
  | 'wifi'
  | 'vcard'
  | 'email'
  | 'sms'
  | 'geo'
  | 'event'

export type TemplatePayloadKind = Exclude<TemplateKind, 'text'>

export type TemplateFieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'datetime'
  | 'email'
  | 'tel'
  | 'url'

export interface TemplateOption {
  value: string
  label: string
}

export interface TemplateField {
  id: string
  label: string
  type: TemplateFieldType
  placeholder?: string
  hint?: string
  required?: boolean
  options?: TemplateOption[]
  autoComplete?: string
  inputMode?: 'text' | 'tel' | 'email' | 'url' | 'numeric' | 'decimal'
  maxLength?: number
}

export type TemplateValues = Record<string, string>
export type TemplateValuesByKind = Partial<
  Record<TemplatePayloadKind, TemplateValues>
>

export interface TemplateDefinition {
  kind: TemplatePayloadKind
  label: string
  description: string
  fields: TemplateField[]
  defaults: TemplateValues
  build: (values: TemplateValues) => string
}

export interface TemplateConfig {
  kind: TemplateKind
  values: TemplateValuesByKind
}
