import { useState } from 'react'
import ScoreCard from './ScoreCard.jsx'
import MetricsGrid from './MetricsGrid.jsx'
import SkillBadgeList from './SkillBadgeList.jsx'
import FrequencyTable from './FrequencyTable.jsx'
import Recommendations from './Recommendations.jsx'
import { buildReportText, copyReportToClipboard, downloadReportAsFile } from '../../utils/reportExport.js'

const TABS = [
  { id: 'found', label: 'Found skills' },
  { id: 'missing', label: 'Missing skills' },
  { id: 'partial', label: 'Partial matches' },
  { id: 'frequency', label: 'Keyword frequency' },
  { id: 'recommendations', label: 'Recommendations' },
]

export default function ResultsSection({ results, jobTitle, company }) {
  const [tab, setTab] = useState('found')
  const [copyStatus, setCopyStatus] = useState('idle')

  const handleCopy = async () => {
    const text = buildReportText(results, { jobTitle, company })
    const ok = await copyReportToClipboard(text)
    setCopyStatus(ok ? 'copied' : 'failed')
    setTimeout(() => setCopyStatus('idle'), 2000)
  }

  const handleDownload = () => {
    const text = buildReportText(results, { jobTitle, company })
    downloadReportAsFile(text)
  }

  return (
    <div className="space-y-6">
      <ScoreCard score={results.score} jobTitle={jobTitle} company={company} />

      <MetricsGrid
        matchedCount={results.totals.matchedCount}
        missingCount={results.totals.missingCount}
        densityTerms={results.frequencyTable}
      />

      <div className="mark-corners rounded-md border border-line-soft bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-5 pt-4">
          <div className="flex flex-wrap gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-t-md px-3 py-2 text-sm font-medium transition-colors ${
                  tab === t.id
                    ? 'border-b-2 border-brass text-ink'
                    : 'text-ink/45 hover:text-ink/70'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="mb-2 flex gap-2">
            <button
              onClick={handleCopy}
              className="rounded-md border border-line-soft px-3 py-1.5 text-xs font-medium text-ink/70 hover:border-line hover:text-ink"
            >
              {copyStatus === 'copied' ? 'Copied!' : copyStatus === 'failed' ? "Couldn't copy" : 'Copy summary'}
            </button>
            <button
              onClick={handleDownload}
              className="rounded-md bg-brass px-3 py-1.5 text-xs font-medium text-white hover:bg-brass-dark"
            >
              Download report
            </button>
          </div>
        </div>

        <div className="p-5">
          {tab === 'found' && (
            <SkillBadgeList items={results.matched} variant="success" emptyMessage="No exact matches found yet." />
          )}
          {tab === 'missing' && (
            <SkillBadgeList items={results.missing} variant="danger" emptyMessage="Nothing missing - great coverage." />
          )}
          {tab === 'partial' && (
            <SkillBadgeList items={results.partial} variant="warn" emptyMessage="No partial or related matches detected." />
          )}
          {tab === 'frequency' && <FrequencyTable rows={results.frequencyTable} />}
          {tab === 'recommendations' && <Recommendations items={results.recommendations} />}
        </div>
      </div>
    </div>
  )
}
