import Logo from '../shared/Logo.jsx'

export default function Header({ user, onSignOut }) {
  const initial = (user?.email || '?').trim().charAt(0).toUpperCase()

  return (
    <header className="border-b border-line-soft bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <Logo size={22} />
          <span className="font-display text-base font-semibold tracking-tight">Gapless</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
              {initial}
            </span>
            <span className="hidden text-sm text-ink/70 sm:inline">{user?.email}</span>
          </div>
          <button
            onClick={onSignOut}
            className="rounded-md border border-line-soft px-3 py-1.5 text-sm font-medium text-ink/70 transition-colors hover:border-line hover:text-ink"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  )
}
