import { useCallback, useEffect, useRef, useState } from 'react'
import { ContentSection } from './components/ContentSection'
import { ColorsSection } from './components/ColorsSection'
import { DotsSection } from './components/DotsSection'
import { LogoSection } from './components/LogoSection'
import { FrameSection } from './components/FrameSection'
import { OutputSection, type BusyAction } from './components/OutputSection'
import { PresetBar } from './components/PresetBar'
import { Preview } from './components/Preview'
import { Header } from './components/Header'
import { Toast, type ToastMessage } from './components/Toast'
import { Icon } from './components/Icon'
import { serializeConfig } from './lib/config'
import { DEFAULT_CONFIG } from './lib/defaults'
import { copyQrToClipboard, downloadQr } from './lib/qr'
import {
  getInitialTheme,
  loadConfig,
  saveConfig,
  saveTheme,
  type Theme,
} from './lib/storage'
import type { Preset, QRConfig } from './types'

function App() {
  const [config, setConfig] = useState<QRConfig>(loadConfig)
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [busy, setBusy] = useState<BusyAction>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const toastId = useRef(0)

  const showToast = useCallback(
    (text: string, tone: ToastMessage['tone'] = 'success') => {
      toastId.current += 1
      setToast({ id: toastId.current, text, tone })
    },
    [],
  )

  /** Shallow merge; callers pass whole nested objects for logo/frame. */
  const update = useCallback((patch: Partial<QRConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }))
  }, [])

  /** Presets merge one level deep so they can carry partial logo/frame data. */
  const applyPreset = useCallback((preset: Preset) => {
    setConfig((prev) => ({
      ...prev,
      ...preset.patch,
      logo: { ...prev.logo, ...preset.patch.logo },
      frame: { ...prev.frame, ...preset.patch.frame },
    }))
    showToast(`Applied the ${preset.name} preset.`)
  }, [showToast])

  const handleLogoSet = useCallback((dataUrl: string) => {
    // A logo always ships with high error correction unless the user changes it.
    setConfig((prev) => ({
      ...prev,
      logo: { ...prev.logo, dataUrl },
      ecLevel: 'H',
    }))
    showToast('Logo added. Error correction set to H.')
  }, [showToast])

  const handleLogoClear = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      logo: { ...prev.logo, dataUrl: null },
    }))
    showToast('Logo removed.')
  }, [showToast])

  const handleDownload = async (extension: 'png' | 'svg') => {
    if (!config.content.trim()) {
      setExportError('Add some content before downloading.')
      showToast('Nothing to export yet.', 'danger')
      return
    }
    setBusy(extension)
    setExportError(null)
    try {
      await downloadQr(config, config.content, extension)
      showToast(`Saved ${extension.toUpperCase()} file.`)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'The file could not be generated.'
      setExportError(message)
      showToast('Export failed. See the message under the buttons.', 'danger')
    } finally {
      setBusy(null)
    }
  }

  const handleCopyImage = async () => {
    if (!config.content.trim()) {
      setExportError('Add some content before copying.')
      showToast('Nothing to copy yet.', 'danger')
      return
    }
    setBusy('copy')
    setExportError(null)
    try {
      await copyQrToClipboard(config, config.content)
      showToast('QR image copied to the clipboard.')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Copying the image failed.'
      setExportError(message)
      showToast('Copy failed.', 'danger')
    } finally {
      setBusy(null)
    }
  }

  const handleCopyConfig = async () => {
    const text = serializeConfig(config)
    if (!navigator.clipboard?.writeText) {
      throw new Error('Clipboard access is unavailable in this browser.')
    }
    await navigator.clipboard.writeText(text)
    showToast('Config JSON copied to the clipboard.')
  }

  const handleLoadConfig = (next: QRConfig) => {
    setConfig(next)
    setExportError(null)
    showToast('Config loaded.')
  }

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG)
    setExportError(null)
    showToast('Everything reset to defaults.')
  }

  // Apply the UI theme to <html> so Tailwind's dark variant and CSS tokens line up.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    saveTheme(theme)
  }, [theme])

  // Persist settings after a short idle period to avoid writing on every keystroke.
  useEffect(() => {
    const timer = window.setTimeout(() => saveConfig(config), 400)
    return () => window.clearTimeout(timer)
  }, [config])

  return (
    <div className="min-h-dvh bg-app">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:shadow-lg"
      >
        Skip to content settings
      </a>

      <Header
        theme={theme}
        onToggleTheme={() =>
          setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
        }
      />

      <main className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-[28px]">
            Design a QR code that fits your brand.
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Style the dots, drop in a logo, add a frame, then export a crisp PNG
            or SVG. Everything is generated on your device.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-start">
          <div className="order-2 space-y-4 lg:order-1">
            <PresetBar onApply={applyPreset} />
            <ContentSection
              content={config.content}
              onChange={(content) => update({ content })}
            />
            <ColorsSection config={config} update={update} />
            <DotsSection config={config} update={update} />
            <LogoSection
              config={config}
              update={update}
              onLogoSet={handleLogoSet}
              onLogoClear={handleLogoClear}
            />
            <FrameSection config={config} update={update} />
            <OutputSection
              config={config}
              update={update}
              busy={busy}
              error={exportError}
              onDownload={handleDownload}
              onCopyImage={handleCopyImage}
              onCopyConfig={handleCopyConfig}
              onLoadConfig={handleLoadConfig}
              onReset={handleReset}
            />
          </div>

          <div className="order-1 lg:order-2 lg:sticky lg:top-6">
            <Preview config={config} />
          </div>
        </div>
      </main>

      <footer className="mt-6 border-t border-line bg-surface/60">
        <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted sm:flex-row sm:px-6">
          <p className="flex items-center gap-1.5 text-center sm:text-left">
            <Icon name="check" className="h-3.5 w-3.5 text-success" />
            100% client-side. No network calls, no analytics, no accounts, no
            tracking.
          </p>
          <p className="font-mono text-[11px]">
            Settings stay in your browser's localStorage.
          </p>
        </div>
      </footer>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}

export default App
