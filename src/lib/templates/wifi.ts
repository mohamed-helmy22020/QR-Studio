import { escapeWifi } from './escape'
import type { TemplateDefinition } from './types'

export const wifiTemplate: TemplateDefinition = {
  kind: 'wifi',
  label: 'Wi-Fi',
  description: 'Let people join a network by scanning.',
  fields: [
    {
      id: 'ssid',
      label: 'Network name (SSID)',
      type: 'text',
      required: true,
      placeholder: 'Cafe guest',
      autoComplete: 'off',
      maxLength: 64,
    },
    {
      id: 'password',
      label: 'Password',
      type: 'text',
      placeholder: 'Leave empty for open networks',
      autoComplete: 'off',
      maxLength: 128,
    },
    {
      id: 'encryption',
      label: 'Security',
      type: 'select',
      options: [
        { value: 'WPA', label: 'WPA / WPA2 / WPA3' },
        { value: 'WEP', label: 'WEP' },
        { value: 'nopass', label: 'None (open)' },
      ],
    },
    {
      id: 'hidden',
      label: 'Hidden network',
      type: 'checkbox',
      hint: 'Include this if the SSID is not broadcast.',
    },
  ],
  defaults: { ssid: '', password: '', encryption: 'WPA', hidden: 'false' },
  build: (values) => {
    const ssid = values.ssid ?? ''
    if (!ssid.trim()) return ''
    const encryption = values.encryption || 'WPA'
    const parts = [`T:${encryption}`, `S:${escapeWifi(ssid)}`]
    const password = values.password ?? ''
    if (encryption !== 'nopass' && password) {
      parts.push(`P:${escapeWifi(password)}`)
    }
    if (values.hidden === 'true') parts.push('H:true')
    return `WIFI:${parts.join(';')};;`
  },
}
