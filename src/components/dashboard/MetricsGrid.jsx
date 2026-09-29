function MetricCard({ label, value, sublabel, accent, children }) {
  return (
    <div className="mark-corners rounded-md border border-line-soft bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-ink/40">{label}</p>
      <p className={`mt-2 font-display text-3xl font-semibold tracking-tight ${accent || 'text-ink'}`}>
        {value}
      </p>
      {sublabel && <p className="mt-1 text-xs text-ink/50">{sublabel}</p>}
      {children}
    </div>
  )
}

export default function MetricsGrid({ matchedCount, missingCount, densityTerms }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <MetricCard
        label="Matched keywords"
        value={matchedCount}
        sublabel="Found in both documents"
        accent="text-success"
      />
      <MetricCard
        label="Missing keywords"
        value={missingCount}
        sublabel="In the listing, not your resume"
        accent="text-danger"
      />
      <MetricCard label="Keyword density" value={densityTerms.length ? `${densityTerms[0].skill}` : '—'} sublabel="Most-repeated requirement">
        <ul className="mt-3 space-y-1.5">
          {densityTerms.slice(0, 3).map((term) => (
            <li key={term.skill} className="flex items-center justify-between text-xs">
              <span className="truncate text-ink/70">{term.skill}</span>
              <span className="font-mono text-ink/40">
                JD &times;{term.jdCount} &middot; resume &times;{term.resumeCount}
              </span>
            </li>
          ))}
        </ul>
      </MetricCard>
    </div>
  )
}
