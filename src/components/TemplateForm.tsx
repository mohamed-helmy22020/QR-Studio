import type {
  TemplateDefinition,
  TemplateField,
  TemplateValues,
} from '../lib/templates/types'
import { Field, SelectField, SwitchField, TextInput } from './ui'

const textareaClass =
  'w-full resize-y rounded-xl border border-line bg-surface-2 px-3 py-2 font-mono text-sm leading-6 text-ink placeholder:text-muted/70 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25'

function fieldId(definition: TemplateDefinition, field: TemplateField): string {
  return `template-${definition.kind}-${field.id}`
}

function fieldWidth(field: TemplateField): string | undefined {
  return field.type === 'textarea' || field.type === 'checkbox'
    ? 'sm:col-span-2'
    : undefined
}

export function TemplateForm({
  definition,
  values,
  onChange,
}: {
  definition: TemplateDefinition
  values: TemplateValues
  onChange: (id: string, value: string) => void
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {definition.fields.map((field) => {
        const id = fieldId(definition, field)
        const value = values[field.id] ?? ''

        if (field.type === 'checkbox') {
          return (
            <div key={field.id} className={fieldWidth(field)}>
              <SwitchField
                id={id}
                label={field.label}
                checked={value === 'true'}
                onChange={(checked) =>
                  onChange(field.id, checked ? 'true' : 'false')
                }
                description={field.hint}
              />
            </div>
          )
        }

        if (field.type === 'select') {
          return (
            <SelectField
              key={field.id}
              id={id}
              label={field.label}
              value={value}
              onChange={(next) => onChange(field.id, next)}
              options={field.options ?? []}
              hint={field.hint}
            />
          )
        }

        const input =
          field.type === 'textarea' ? (
            <textarea
              id={id}
              value={value}
              onChange={(event) => onChange(field.id, event.target.value)}
              rows={3}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              required={field.required}
              className={textareaClass}
            />
          ) : (
            <TextInput
              id={id}
              type={field.type === 'datetime' ? 'datetime-local' : field.type}
              value={value}
              onChange={(event) => onChange(field.id, event.target.value)}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              required={field.required}
              autoComplete={field.autoComplete}
              inputMode={field.inputMode}
            />
          )

        return (
          <Field
            key={field.id}
            label={field.label}
            htmlFor={id}
            hint={field.hint}
            className={fieldWidth(field)}
          >
            {input}
          </Field>
        )
      })}
    </div>
  )
}
