import { useRef, useState } from 'react'
import { extractTextFromFile, FileParseError } from '../../utils/fileParser.js'
import LoadingSpinner from '../shared/LoadingSpinner.jsx'
import ErrorBanner from '../shared/ErrorBanner.jsx'

export default function ResumeInput({
  mode,
  onModeChange,
  resumeText,
  onResumeTextChange,
  fileName,
  onFileNameChange,
}) {
  const inputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState(null)

  const handleFile = async (file) => {
    setParsing(true)
    setParseError(null)
    try {
      const text = await extractTextFromFile(file)
      onResumeTextChange(text)
      onFileNameChange(file.name)
    } catch (err) {
      onFileNameChange(null)
      onResumeTextChange('')
      setParseError(
        err instanceof FileParseError
          ? err.message
          : 'Something unexpected went wrong reading that file.'
      )
    } finally {
      setParsing(false)
    }
  }

  const clearFile = () => {
    onFileNameChange(null)
    onResumeTextChange('')
    setParseError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="mark-corners rounded-md border border-line-soft bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold tracking-tight">Your resume</h3>
        <button
          type="button"
          onClick={() => onModeChange(mode === 'upload' ? 'paste' : 'upload')}
          className="text-xs font-medium text-brass hover:text-brass-dark"
        >
          {mode === 'upload' ? 'Paste text instead' : 'Upload a file instead'}
        </button>
      </div>

      {mode === 'upload' ? (
        <>
          {!fileName && !parsing && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragActive(false)
                const file = e.dataTransfer.files?.[0]
                if (file) handleFile(file)
              }}
              onClick={() => inputRef.current?.click()}
              className={`flex h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed text-center transition-colors ${
                dragActive ? 'border-brass bg-warn-soft' : 'border-line-soft hover:border-line'
              }`}
            >
              <svg className="h-7 w-7 text-line" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 16V4m0 0 4 4m-4-4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-sm font-medium text-ink/70">Drop your resume here, or click to browse</p>
              <p className="text-xs text-ink/40">PDF, DOCX, or TXT &middot; up to 10MB</p>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                }}
              />
            </div>
          )}

          {parsing && (
            <div className="flex h-44 flex-col items-center justify-center gap-2 rounded-md border border-line-soft text-ink/60">
              <LoadingSpinner label="Reading file" size={22} />
              <p className="text-sm">Reading your file&hellip;</p>
            </div>
          )}

          {fileName && !parsing && (
            <div className="flex h-44 flex-col items-center justify-center gap-3 rounded-md border border-line-soft bg-success-soft">
              <svg className="h-7 w-7 text-success" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 12.5l2 2 4-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
              </svg>
              <div className="text-center">
                <p className="text-sm font-medium text-ink">{fileName}</p>
                <p className="text-xs text-ink/50">{resumeText.trim().split(/\s+/).length} words extracted</p>
              </div>
              <button
                type="button"
                onClick={clearFile}
                className="text-xs font-medium text-ink/50 underline hover:text-ink"
              >
                Remove and upload a different file
              </button>
            </div>
          )}

          <div className="mt-3">
            <ErrorBanner message={parseError} onDismiss={() => setParseError(null)} />
          </div>
        </>
      ) : (
        <textarea
          value={resumeText}
          onChange={(e) => onResumeTextChange(e.target.value)}
          placeholder="Paste your resume text here..."
          className="h-44 w-full resize-none rounded-md border border-line-soft bg-white p-3.5 text-sm text-ink placeholder:text-ink/35 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
        />
      )}
    </div>
  )
}
