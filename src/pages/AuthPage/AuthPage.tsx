import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../contexts/AuthContext'
import './AuthPage.css'

type AuthMode = 'login' | 'signup'

function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isLoading: isSessionLoading, user } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')

    const normalizedEmail = email.trim()
    if (!normalizedEmail || !password) {
      setError('Enter your email and password to continue.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address.')
      return
    }

    if (mode === 'signup' && password.length < 6) {
      setError('Your password must be at least 6 characters.')
      return
    }

    setIsSubmitting(true)
    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
        })
        if (signUpError) {
          throw signUpError
        }

        if (data.session) {
          navigate('/', { replace: true })
        } else {
          setMessage(
            'Check your email for a confirmation link. You can sign in after confirming your address.',
          )
        }
      } else {
        const { error: signInError } =
          await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          })
        if (signInError) {
          throw signInError
        }

        navigate('/', { replace: true })
      }
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : 'Authentication failed. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode)
    setError('')
    setMessage('')
  }

  if (!isSessionLoading && user) {
    return (
      <section className="auth-page" aria-labelledby="auth-title">
        <p className="eyebrow">YOUR ACCOUNT</p>
        <h1 className="auth-page__title" id="auth-title">
          You’re signed in
        </h1>
        <p className="auth-page__description">
          Signed in as <strong>{user.email}</strong>. Your dashboard and job
          analysis are ready to use.
        </p>
        <Link className="primary-button auth-page__guest-link" to="/">
          Continue to dashboard
        </Link>
      </section>
    )
  }

  return (
    <section className="auth-page" aria-labelledby="auth-title">
      <p className="eyebrow">YOUR NEXT OPPORTUNITY</p>
      <h1 className="auth-page__title" id="auth-title">
        {mode === 'login' ? 'Welcome back' : 'Create your account'}
      </h1>
      <p className="auth-page__description">
        {mode === 'login'
          ? 'Sign in to your NextStep AI account. Or continue as a guest anytime.'
          : 'Create an account to make it easier to return to your workspace.'}
      </p>

      <form className="auth-form" noValidate onSubmit={handleSubmit}>
        <div className="job-analysis-form__field">
          <label className="job-analysis-form__label" htmlFor="auth-email">
            Email
          </label>
          <input
            autoComplete="email"
            className="job-analysis-form__input"
            id="auth-email"
            name="email"
            onChange={(event) => setEmail(event.currentTarget.value)}
            required
            type="email"
            value={email}
          />
        </div>
        <div className="job-analysis-form__field">
          <label className="job-analysis-form__label" htmlFor="auth-password">
            Password
          </label>
          <input
            autoComplete={
              mode === 'login' ? 'current-password' : 'new-password'
            }
            className="job-analysis-form__input"
            id="auth-password"
            name="password"
            onChange={(event) => setPassword(event.currentTarget.value)}
            required
            type="password"
            value={password}
          />
          {mode === 'signup' && (
            <span className="auth-form__hint">
              Use at least 6 characters.
            </span>
          )}
        </div>

        {error && (
          <p className="auth-form__message auth-form__message--error" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="auth-form__message" role="status">
            {message}
          </p>
        )}

        <button
          className="primary-button auth-form__submit"
          disabled={isSubmitting || isSessionLoading}
          type="submit"
        >
          {isSubmitting
            ? mode === 'login'
              ? 'Signing in…'
              : 'Creating account…'
            : mode === 'login'
              ? 'Sign in'
              : 'Create account'}
        </button>
      </form>

      <p className="auth-page__switch">
        {mode === 'login' ? 'New to NextStep AI?' : 'Already have an account?'}{' '}
        <button
          className="auth-page__text-button"
          onClick={() => changeMode(mode === 'login' ? 'signup' : 'login')}
          type="button"
        >
          {mode === 'login' ? 'Create an account' : 'Sign in'}
        </button>
      </p>
      <Link className="auth-page__guest-link" to="/">
        Continue as a guest
      </Link>
    </section>
  )
}

export default AuthPage
