import { useEffect, useMemo, useRef, useState } from 'react'
import QRCodeStyling from 'qr-code-styling'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { isLowContrast, logoRiskLevel } from '../lib/config'
import { buildQROptions } from '../lib/qr'
import { cx } from '../lib/cx'
import type { QRConfig } from '../types'
import { Alert } from './ui'
import { Icon } from './Icon'

const PREVIEW_SIZE = 512

interface PreviewProps {
  config: QRConfig
}

function FrameLabel({ config }: { config: QRConfig }) {
  const { frame } = config
  if (!frame.label.trim()) return null
  return (
    <div
      aria-hidden="true"
      className="flex items-center justify-center overflow-hidden whitespace-nowrap px-[2cqw] font-semibold"
      style={{
        height: '14cqw',
        color: frame.labelColor,
        fontSize: `${(frame.labelFontSize * 100) / PREVIEW_SIZE}cqw`,
        lineHeight: 1,
        textOverflow: 'ellipsis',
      }}
    >
      {frame.label}
    </div>
  )
}

export function Preview({ config }: PreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const qrRef = useRef<QRCodeStyling | null>(null)
  const qrContainerRef = useRef<HTMLElement | null>(null)
  const debouncedContent = useDebouncedValue(config.content, 300)
  const [error, setError] = useState<string | null>(null)

  // Excludes content so that typing does not re-render the QR code before the
  // debounce fires; only real style changes trigger an immediate redraw.
  const styleSignature = useMemo(
    () => JSON.stringify({ ...config, content: '' }),
    [config],
  )
  // Keep the latest config in a ref so the render effect can skip content-only
  // changes while still drawing with current styles.
  const configRef = useRef(config)
  useEffect(() => {
    configRef.current = config
  })

  useEffect(() => {
    const container = containerRef.current
    // The node unmounts while the preview is empty; drop the stale instance so
    // the next non-empty update draws into the freshly mounted node.
    if (!container) {
      qrRef.current = null
      qrContainerRef.current = null
      return
    }
    const current = configRef.current
    const content = debouncedContent

    if (!content.trim()) {
      container.replaceChildren()
      qrRef.current = null
      qrContainerRef.current = null
      setError(null)
      return
    }

    try {
      const options = buildQROptions(current, content, PREVIEW_SIZE)
      if (!qrRef.current || qrContainerRef.current !== container) {
        const qr = new QRCodeStyling(options)
        container.replaceChildren()
        qr.append(container)
        qrRef.current = qr
        qrContainerRef.current = container
      } else {
        qrRef.current.update(options)
      }
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(
        message.includes('overflow')
          ? 'This content is too long for a QR code. Shorten it or lower the error correction level.'
          : 'The QR code could not be rendered. Try different content or settings.',
      )
      container.replaceChildren()
      qrRef.current = null
      qrContainerRef.current = null
    }
  }, [styleSignature, debouncedContent])

  const frame = config.frame
  const framed = frame.enabled && frame.style !== 'none'
  const bordered = framed && frame.style === 'bordered'
  const showLabel =
    framed &&
    (frame.style === 'label-bottom' || frame.style === 'label-top') &&
    frame.label.trim().length > 0

  const risk = logoRiskLevel(config)
  const contrastIssue =
    !config.transparentBg &&
    (isLowContrast(config.fgColor, config.bgColor) ||
      (config.gradientEnabled &&
        (isLowContrast(config.gradientFrom, config.bgColor) ||
          isLowContrast(config.gradientTo, config.bgColor))))

  return (
    <section
      aria-labelledby="preview-heading"
      className="rounded-2xl border border-line bg-surface p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-5"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2
            id="preview-heading"
            className="flex items-center gap-2 text-[15px] font-semibold text-ink"
          >
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span
                className={cx(
                  'absolute inline-flex h-full w-full rounded-full bg-success',
                  debouncedContent.trim() && 'animate-ping opacity-60',
                )}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            Live preview
          </h2>
          <p className="mt-1 text-[13px] text-muted">
            {config.size}×{config.size}px · Error correction {config.ecLevel}
          </p>
        </div>
        <span className="rounded-full border border-line bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-muted">
          {framed ? 'Framed' : 'Bare'}
        </span>
      </div>

      <div className="checkerboard flex items-center justify-center rounded-xl border border-line p-4 sm:p-5">
        {debouncedContent.trim() && !error ? (
          <div
            className="mx-auto w-full max-w-[320px]"
            style={{ containerType: 'inline-size' }}
          >
            <div
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                padding: framed ? '5cqw' : undefined,
                border: bordered ? '1.8cqw solid' : undefined,
                borderColor: bordered ? frame.color : undefined,
                borderRadius: framed
                  ? bordered
                    ? '4cqw'
                    : '6cqw'
                  : undefined,
                backgroundColor:
                  framed && !bordered ? frame.color : undefined,
              }}
            >
              {showLabel && frame.style === 'label-top' ? (
                <FrameLabel config={config} />
              ) : null}
              <div
                ref={containerRef}
                role="img"
                aria-label="QR code preview"
                className="qr-canvas"
                style={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  overflow: 'hidden',
                  backgroundColor: config.transparentBg
                    ? 'transparent'
                    : config.bgColor,
                }}
              />
              {showLabel && frame.style === 'label-bottom' ? (
                <FrameLabel config={config} />
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex min-h-[240px] w-full flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-muted">
              <Icon name="qr" className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">
                {error ? 'Preview unavailable' : 'Your QR code appears here'}
              </p>
              <p className="mx-auto mt-1 max-w-[260px] text-xs leading-5 text-muted">
                {error
                  ? 'Fix the issue below and the preview will return.'
                  : 'Add some content on the left to get started.'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {error ? <Alert tone="danger">{error}</Alert> : null}
        {risk === 'danger' ? (
          <Alert tone="danger">
            This logo covers about {Math.round((config.logo.size ** 2) / 100)}% of
            the code, more than level {config.ecLevel} can recover. Lower the logo
            size or switch to error correction H.
          </Alert>
        ) : risk === 'caution' ? (
          <Alert tone="warning">
            Large logo for error correction {config.ecLevel}. Test-scan before
            printing; level H is safer.
          </Alert>
        ) : null}
        {contrastIssue ? (
          <Alert tone="warning">
            Low contrast between the dots and background may stop phones from
            scanning. Darken the dots or lighten the background.
          </Alert>
        ) : null}
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 border-t border-line pt-3 text-[11px] text-muted">
        <Icon name="check" className="h-3 w-3 text-success" />
        100% in your browser. Nothing is uploaded or tracked.
      </p>
    </section>
  )
}
