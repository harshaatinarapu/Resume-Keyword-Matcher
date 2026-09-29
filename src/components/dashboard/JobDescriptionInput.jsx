export default function JobDescriptionInput({
  jdText,
  onJdTextChange,
  jobTitle,
  onJobTitleChange,
  company,
  onCompanyChange,
}) {
  return (
    <div className="mark-corners rounded-md border border-line-soft bg-white p-5">
      <h3 className="mb-4 font-display text-sm font-semibold tracking-tight">Job description</h3>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <input
          type="text"
          value={jobTitle}
          onChange={(e) => onJobTitleChange(e.target.value)}
          placeholder="Job title (optional)"
          className="rounded-md border border-line-soft bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
        />
        <input
          type="text"
          value={company}
          onChange={(e) => onCompanyChange(e.target.value)}
          placeholder="Company (optional)"
          className="rounded-md border border-line-soft bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
        />
      </div>

      <textarea
        value={jdText}
        onChange={(e) => onJdTextChange(e.target.value)}
        placeholder="Paste the job description here..."
        className="h-44 w-full resize-none rounded-md border border-line-soft bg-white p-3.5 text-sm text-ink placeholder:text-ink/35 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
      />
      <p className="mt-2 text-xs text-ink/40">
        {jdText.trim() ? `${jdText.trim().split(/\s+/).length} words` : 'Include the full requirements section for the most accurate match.'}
      </p>
    </div>
  )
}
