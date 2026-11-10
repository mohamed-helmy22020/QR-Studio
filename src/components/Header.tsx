import type { Theme } from '../lib/storage'
import { Icon } from './Icon'

interface HeaderProps {
  theme: Theme
  onToggleTheme: () => void
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  const nextTheme = theme === 'dark' ? 'light' : 'dark'

  return (
    <header className="border-b border-line bg-surface/80 backdrop-blur">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 text-white shadow-sm"
          >
            <Icon name="qr" className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-[-0.01em] text-ink">
              QR Studio
            </h1>
            <p className="text-xs text-muted">Custom QR codes, made locally</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 py-1.5 text-xs text-muted sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
            No tracking
          </span>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${nextTheme} theme`}
            title={`Switch to ${nextTheme} theme`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-muted transition hover:border-line-strong hover:text-ink"
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>
        </div>
      </div>
    </header>
  )
}
