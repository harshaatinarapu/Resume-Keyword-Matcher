export default function Logo({ size = 28, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 11V5h6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28 21v6h-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 20 20 12" stroke="#B8752A" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="12" cy="20" r="2.2" fill="#B8752A" />
      <circle cx="20" cy="12" r="2.2" fill="#B8752A" />
    </svg>
  )
}
