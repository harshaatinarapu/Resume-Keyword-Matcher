import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext.jsx'
import Header from '../components/dashboard/Header.jsx'
import ResumeInput from '../components/dashboard/ResumeInput.jsx'
import JobDescriptionInput from '../components/dashboard/JobDescriptionInput.jsx'
import ResultsSection from '../components/dashboard/ResultsSection.jsx'
import LoadingSpinner from '../components/shared/LoadingSpinner.jsx'
import ErrorBanner from '../components/shared/ErrorBanner.jsx'
import { analyze, AnalyzerError } from '../utils/KeywordAnalyzer.js'

// Keeps the spinner on screen briefly even though analysis itself is
// near-instant - an instant flash reads as "did that even run?" to users.
const MIN_ANALYZE_MS = 500

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuthContext()

  const [resumeMode, setResumeMode] = useState('upload')
  const [resumeText, setResumeText] = useState('')
  const [fileName, setFileName] = useState(null)

  const [jdText, setJdText] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')

  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState(null)
  const [results, setResults] = useState(null)

  const handleSignOut = () => {
    signOut()
    navigate('/login')
  }

  const handleAnalyze = async () => {
    setAnalysisError(null)
    setAnalyzing(true)
    const start = Date.now()

    try {
      const output = analyze(resumeText, jdText)
      const elapsed = Date.now() - start
      if (elapsed < MIN_ANALYZE_MS) {
        await new Promise((r) => setTimeout(r, MIN_ANALYZE_MS - elapsed))
      }
      setResults(output)
    } catch (err) {
      setResults(null)
      setAnalysisError(
        err instanceof AnalyzerError
          ? err.message
          : 'Something went wrong analyzing these documents. Please try again.'
      )
    } finally {
      setAnalyzing(false)
    }
  }

  const canAnalyze = resumeText.trim().length > 0 && jdText.trim().length > 0 && !analyzing

  return (
    <div className="min-h-screen bg-paper">
      <Header user={user} onSignOut={handleSignOut} />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight">Analyze a match</h1>
          <p className="mt-1 text-sm text-ink/60">
            Add your resume and a job description to see how closely they line up.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ResumeInput
            mode={resumeMode}
            onModeChange={setResumeMode}
            resumeText={resumeText}
            onResumeTextChange={setResumeText}
            fileName={fileName}
            onFileNameChange={setFileName}
          />
          <JobDescriptionInput
            jdText={jdText}
            onJdTextChange={setJdText}
            jobTitle={jobTitle}
            onJobTitleChange={setJobTitle}
            company={company}
            onCompanyChange={setCompany}
          />
        </div>

        <div className="my-8 flex flex-col items-center gap-3">
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className="inline-flex items-center gap-2.5 rounded-md bg-brass px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brass-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            {analyzing ? (
              <>
                <LoadingSpinner label="Analyzing" size={16} />
                Analyzing&hellip;
              </>
            ) : (
              'Analyze resume'
            )}
          </button>
          {!canAnalyze && !analyzing && (
            <p className="text-xs text-ink/40">Add both a resume and a job description to continue.</p>
          )}
          <div className="w-full max-w-lg">
            <ErrorBanner message={analysisError} onDismiss={() => setAnalysisError(null)} />
          </div>
        </div>

        {results && <ResultsSection results={results} jobTitle={jobTitle} company={company} />}
      </main>
    </div>
  )
}
