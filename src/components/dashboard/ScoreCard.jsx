function scoreBand(score) {
  if (score < 50) {
    return { label: 'Needs work', badgeClass: 'bg-danger-soft text-danger', ring: '#C23B33' }
  }
  if (score < 75) {
    return { label: 'Getting there', badgeClass: 'bg-warn-soft text-warn', ring: '#C6821B' }
  }
  return { label: 'Strong match', badgeClass: 'bg-success-soft text-success', ring: '#1F8A5F' }
}

export default function ScoreCard({ score, jobTitle, company }) {
  const band = scoreBand(score)
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="mark-corners rounded-md border border-line-soft bg-white p-6">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <div className="relative h-32 w-32 shrink-0">
          <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#EDF0F6" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={band.ring}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl font-semibold tracking-tight">{score}%</span>
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <span className={`inline-block rounded-sm px-2.5 py-1 text-xs font-semibold ${band.badgeClass}`}>
            {band.label}
          </span>
          <h2 className="mt-3 font-display text-xl font-semibold tracking-tight">
            Match score{jobTitle ? ` for ${jobTitle}` : ''}
            {company ? ` at ${company}` : ''}
          </h2>
          <p className="mt-1.5 max-w-md text-sm text-ink/60">
            Weighted by how often each requirement shows up in the listing and
            whether your resume covers it exactly, closely, or not at all.
          </p>
        </div>
      </div>
    </div>
  )
}
