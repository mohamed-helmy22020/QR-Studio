import { useState } from 'react'
import { parseConfigJson } from '../lib/config'
import type { QRConfig } from '../types'
import { Alert, Button, FileButton } from './ui'

interface ConfigToolsProps {
  onCopyConfig: () => Promise<void>
  onCopyShareLink: () => Promise<void>
  onLoadConfig: (config: QRConfig) => void
  onReset: () => void
}

export function ConfigTools({
  onCopyConfig,
  onCopyShareLink,
  onLoadConfig,
  onReset,
}: ConfigToolsProps) {
  const [error, setError] = useState<string | null>(null)
  const [copying, setCopying] = useState(false)
  const [sharing, setSharing] = useState(false)

  const handleImport = async (file: File) => {
    setError(null)
    try {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('That file is too large to be a config.')
      }
      const text = await file.text()
      onLoadConfig(parseConfigJson(text))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load config.')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="ghost"
          icon="json"
          loading={copying}
          onClick={async () => {
            setCopying(true)
            setError(null)
            try {
              await onCopyConfig()
            } catch (err) {
              setError(
                err instanceof Error ? err.message : 'Could not copy config.',
              )
            } finally {
              setCopying(false)
            }
          }}
        >
          Copy config
        </Button>
        <Button
          variant="ghost"
          icon="link"
          loading={sharing}
          onClick={async () => {
            setSharing(true)
            setError(null)
            try {
              await onCopyShareLink()
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : 'Could not create a share link.',
              )
            } finally {
              setSharing(false)
            }
          }}
        >
          Copy share link
        </Button>
        <FileButton
          variant="secondary"
          icon="upload"
          accept="application/json,.json"
          label="Load config"
          onFile={handleImport}
          className="px-3 py-2 text-xs"
        />
        <Button variant="ghost" icon="reset" onClick={onReset}>
          Reset all
        </Button>
      </div>
      {error ? <Alert tone="danger">{error}</Alert> : null}
      <p className="text-xs leading-5 text-muted">
        Config JSON includes everything, logos and content too. Share links are
        compressed into the URL and carry style settings only, so the
        recipient&apos;s content stays untouched. The logo is dropped if it
        would make the link too long.
      </p>
    </div>
  )
}
