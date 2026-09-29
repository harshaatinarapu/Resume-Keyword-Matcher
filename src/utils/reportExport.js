function titleCase(skill) {
  return skill.replace(/\b\w/g, (c) => c.toUpperCase())
}

export function buildReportText(results, meta = {}) {
  const { jobTitle, company } = meta
  const lines = []

  lines.push('GAPLESS - RESUME MATCH REPORT')
  if (jobTitle || company) {
    lines.push([jobTitle, company].filter(Boolean).join(' at '))
  }
  lines.push(`Match score: ${results.score}%`)
  lines.push('')

  lines.push(`MATCHED KEYWORDS (${results.matched.length})`)
  results.matched.forEach((m) => lines.push(`  - ${titleCase(m.skill)} (JD x${m.jdCount}, resume x${m.resumeCount})`))
  lines.push('')

  lines.push(`PARTIAL / SEMANTIC MATCHES (${results.partial.length})`)
  results.partial.forEach((m) =>
    lines.push(`  - ${titleCase(m.skill)} - resume uses "${titleCase(m.matchedAs)}" (~${m.confidence}% similar)`)
  )
  lines.push('')

  lines.push(`MISSING KEYWORDS (${results.missing.length})`)
  results.missing.forEach((m) => lines.push(`  - ${titleCase(m.skill)} (appears x${m.jdCount} in the listing)`))
  lines.push('')

  lines.push('RECOMMENDATIONS')
  results.recommendations.forEach((r) => lines.push(`  - ${r}`))

  return lines.join('\n')
}

export async function copyReportToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function downloadReportAsFile(text, filename = 'resume-match-report.txt') {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
