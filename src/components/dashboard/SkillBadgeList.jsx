const VARIANT_CLASSES = {
  success: 'bg-success-soft text-success border-success/20',
  danger: 'bg-danger-soft text-danger border-danger/20',
  warn: 'bg-warn-soft text-warn border-warn/20',
}

function titleCase(skill) {
  return skill.replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function SkillBadgeList({ items, variant, emptyMessage }) {
  if (!items.length) {
    return <p className="py-6 text-center text-sm text-ink/40">{emptyMessage}</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item.skill}
          title={item.matchedAs ? `Closest match in resume: "${titleCase(item.matchedAs)}"` : undefined}
          className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-xs font-medium ${VARIANT_CLASSES[variant]}`}
        >
          {titleCase(item.skill)}
          <span className="font-mono text-[10px] opacity-60">&times;{item.jdCount}</span>
        </span>
      ))}
    </div>
  )
}
