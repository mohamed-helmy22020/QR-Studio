import { useEffect } from 'react'
import { Icon } from './Icon'

export interface ToastMessage {
  id: number
  text: string
  tone: 'success' | 'danger'
}

interface ToastProps {
  toast: ToastMessage | null
  onDismiss: () => void
}

export function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(onDismiss, 3500)
    return () => window.clearTimeout(timer)
  }, [toast, onDismiss])

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4"
    >
      {toast ? (
        <div
          key={toast.id}
          className={
            toast.tone === 'success'
              ? 'pointer-events-auto flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink shadow-lg'
              : 'pointer-events-auto flex items-center gap-2 rounded-xl border border-danger/40 bg-danger-soft px-4 py-2.5 text-sm text-danger shadow-lg'
          }
        >
          <Icon name={toast.tone === 'success' ? 'check' : 'alert'} />
          {toast.text}
        </div>
      ) : null}
    </div>
  )
}
