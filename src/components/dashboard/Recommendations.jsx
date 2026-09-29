export default function Recommendations({ items }) {
  return (
    <ul className="space-y-3">
      {items.map((text, i) => (
        <li key={i} className="flex gap-3 text-sm text-ink/80">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  )
}
