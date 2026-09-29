import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext.jsx'
import Logo from '../components/shared/Logo.jsx'
import ErrorBanner from '../components/shared/ErrorBanner.jsx'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn, signUp, continueAsGuest } = useAuthContext()

  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const result =
      mode === 'signin'
        ? signIn(email, password)
        : signUp(email, password, confirmPassword)

    setSubmitting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    navigate('/dashboard')
  }

  const handleGuest = () => {
    continueAsGuest()
    navigate('/dashboard')
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: brand panel */}
      <div className="relative hidden overflow-hidden bg-ink px-14 py-16 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              'linear-gradient(90deg, #fff 1px, transparent 1px), linear-gradient(#fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <Logo size={26} className="text-white" />
          <span className="font-display text-lg font-semibold tracking-tight">Gapless</span>
        </div>

        <div className="relative max-w-md">
          <h1 className="font-display text-4xl font-semibold leading-[1.15] tracking-tight">
            Bridge the gap between your resume and the job description.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-white/70">
            Paste a listing, upload your resume, and see exactly which
            requirements you already meet, which are missing, and what to fix
            first &mdash; before a recruiter or an ATS filter ever does.
          </p>
        </div>

        <div className="relative flex gap-8 text-sm text-white/50">
          <div>
            <div className="font-display text-2xl font-semibold text-white">1,000+</div>
            keyword variants recognized
          </div>
          <div>
            <div className="font-display text-2xl font-semibold text-white">0</div>
            resumes stored on a server
          </div>
        </div>
      </div>

      {/* Right: auth form */}
      <div className="flex items-center justify-center bg-paper px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <Logo size={24} />
            <span className="font-display text-lg font-semibold tracking-tight">Gapless</span>
          </div>

          <div className="mb-7">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="mt-1.5 text-sm text-ink/60">
              {mode === 'signin'
                ? 'Sign in to pick up where you left off.'
                : 'Takes about ten seconds. No credit card, no verification email.'}
            </p>
          </div>

          <div className="mb-6 inline-flex rounded-md border border-line-soft bg-white p-1 text-sm">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null) }}
              className={`rounded-sm px-4 py-1.5 font-medium transition-colors ${
                mode === 'signin' ? 'bg-ink text-white' : 'text-ink/60 hover:text-ink'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null) }}
              className={`rounded-sm px-4 py-1.5 font-medium transition-colors ${
                mode === 'signup' ? 'bg-ink text-white' : 'text-ink/60 hover:text-ink'
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink/80">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md border border-line-soft bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink/80">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-md border border-line-soft bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-ink/80">
                  Confirm password
                </label>
                <input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full rounded-md border border-line-soft bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
                />
              </div>
            )}

            <ErrorBanner message={error} />

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-brass py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brass-dark disabled:opacity-60"
            >
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-ink/35">
            <div className="h-px flex-1 bg-line-soft" />
            or
            <div className="h-px flex-1 bg-line-soft" />
          </div>

          <button
            type="button"
            onClick={handleGuest}
            className="w-full rounded-md border border-line-soft bg-white py-2.5 text-sm font-medium text-ink transition-colors hover:border-line hover:bg-paper"
          >
            Continue as guest
          </button>
          <p className="mt-3 text-center text-xs text-ink/40">
            Guest sessions stay on this device and aren't saved anywhere else.
          </p>
        </div>
      </div>
    </div>
  )
}
