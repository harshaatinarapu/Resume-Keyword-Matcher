export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-3 rounded-md border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
      <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0Zm-7-4a1 1 0 1 0-2 0v4a1 1 0 0 0 2 0V6Zm-1 7a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z"
          clipRule="evenodd"
        />
      </svg>
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 text-danger/70 hover:text-danger"
          aria-label="Dismiss"
        >
          &times;
        </button>
      )}
    </div>
  )
}
