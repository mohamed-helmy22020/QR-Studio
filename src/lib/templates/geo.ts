import type { TemplateDefinition } from './types'

export const geoTemplate: TemplateDefinition = {
  kind: 'geo',
  label: 'Location',
  description: 'Open a map pin at a set of coordinates.',
  fields: [
    {
      id: 'latitude',
      label: 'Latitude',
      type: 'text',
      required: true,
      placeholder: '51.5074',
      inputMode: 'decimal',
      maxLength: 20,
    },
    {
      id: 'longitude',
      label: 'Longitude',
      type: 'text',
      required: true,
      placeholder: '-0.1278',
      inputMode: 'decimal',
      maxLength: 20,
    },
    {
      id: 'label',
      label: 'Place name',
      type: 'text',
      placeholder: 'London',
      maxLength: 200,
    },
  ],
  defaults: { latitude: '', longitude: '', label: '' },
  build: (values) => {
    const rawLat = (values.latitude ?? '').trim()
    const rawLng = (values.longitude ?? '').trim()
    if (!rawLat || !rawLng) return ''

    const lat = Number(rawLat)
    const lng = Number(rawLng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return ''
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return ''

    const base = `geo:${lat},${lng}`
    const label = (values.label ?? '').trim()
    return label ? `${base}?q=${lat},${lng}(${encodeURIComponent(label)})` : base
  },
}
