function titleCase(skill) {
  return skill.replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function FrequencyTable({ rows }) {
  if (!rows.length) {
    return <p className="py-6 text-center text-sm text-ink/40">No recognized keywords to compare yet.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line-soft text-left text-xs uppercase tracking-wider text-ink/40">
            <th className="py-2 pr-4 font-medium">Term</th>
            <th className="py-2 pr-4 font-medium">Category</th>
            <th className="py-2 pr-4 font-medium">In job description</th>
            <th className="py-2 font-medium">In resume</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {rows.map((row) => (
            <tr key={row.skill} className="border-b border-line-soft/60 last:border-0">
              <td className="py-2 pr-4 font-body text-ink">{titleCase(row.skill)}</td>
              <td className="py-2 pr-4 font-body capitalize text-ink/50">{row.category}</td>
              <td className="py-2 pr-4 text-ink/80">{row.jdCount}</td>
              <td className={row.resumeCount === 0 ? 'py-2 text-danger' : 'py-2 text-ink/80'}>
                {row.resumeCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
