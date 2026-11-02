import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { deleteJobAnalysis, listJobAnalyses } from '../../services/jobAnalysisService'
import type { SavedJobAnalysis } from '../../types/jobAnalysis'
import './SavedJobs.css'

function formatDate(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  }).format(new Date(date))
}

function SavedJobs() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [analyses, setAnalyses] = useState<SavedJobAnalysis[]>([])
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setAnalyses([])
      setLoadedUserId(null)
      setIsLoading(false)
      setLoadError('')
      setActionError('')
      return
    }

    let active = true
    setAnalyses([])
    setLoadedUserId(null)
    setIsLoading(true)
    setLoadError('')
    setActionError('')

    void listJobAnalyses(user.id)
      .then((savedAnalyses) => {
        if (active) {
          setAnalyses(savedAnalyses)
          setLoadedUserId(user.id)
        }
      })
      .catch(() => {
        if (active) {
          setLoadError('We couldn’t load your saved jobs. Please try again.')
          setLoadedUserId(user.id)
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [user?.id])

  async function handleDelete(analysis: SavedJobAnalysis) {
    if (!user || deletingId) {
      return
    }

    const confirmed = window.confirm(
      `Delete the saved job “${analysis.job_title}” at ${analysis.company_name}? This cannot be undone.`,
    )
    if (!confirmed) {
      return
    }

    setDeletingId(analysis.id)
    setActionError('')
    try {
      await deleteJobAnalysis(user.id, analysis.id)
      setAnalyses((current) =>
        current.filter((savedAnalysis) => savedAnalysis.id !== analysis.id),
      )
    } catch {
      setActionError('We couldn’t delete that saved job. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const hasLoadedForCurrentUser = user?.id === loadedUserId

  return (
    <div className="saved-jobs-page">
      <header className="job-analysis-page__heading">
        <p className="eyebrow">YOUR WORKSPACE</p>
        <h1 className="job-analysis-page__title">Saved Jobs</h1>
        <p className="job-analysis-page__description">
          Review the job details you’ve saved and return to them whenever you’re
          ready.
        </p>
      </header>

      <section className="saved-jobs" aria-labelledby="saved-jobs-title">
        <div className="saved-resumes__heading">
          <div>
            <p className="eyebrow">YOUR LIBRARY</p>
            <h2 className="saved-resumes__title" id="saved-jobs-title">
              Saved jobs
            </h2>
          </div>
        </div>

        {isAuthLoading && (
          <p className="saved-resumes__message" role="status">
            Checking your account…
          </p>
        )}

        {!isAuthLoading && !user && (
          <div className="saved-resumes__message">
            <p>
              Saved Jobs can be permanently stored in your account, so you can
              return to them whenever you sign in. Jobs kept for a guest account are temporary and do not appear here.
            </p>
            <Link className="saved-resumes__action" to="/auth">
              Sign in or create an account
            </Link>
          </div>
        )}

        {user && isLoading && (
          <p className="saved-resumes__message" role="status">
            Loading saved jobs…
          </p>
        )}

        {user && hasLoadedForCurrentUser && loadError && (
          <p className="saved-resumes__error" role="alert">
            {loadError}
          </p>
        )}

        {user && hasLoadedForCurrentUser && actionError && (
          <p className="saved-resumes__error" role="alert">
            {actionError}
          </p>
        )}

        {user &&
          hasLoadedForCurrentUser &&
          !isLoading &&
          !loadError &&
          analyses.length === 0 && (
            <p className="saved-resumes__message">
              You haven’t saved any jobs yet.{' '}
              <Link to="/analyze">Analyze a job</Link> to get started.
            </p>
          )}

        {user &&
          hasLoadedForCurrentUser &&
          !isLoading &&
          !loadError &&
          analyses.length > 0 && (
            <ul className="saved-jobs__list">
              {analyses.map((analysis) => (
                <li className="saved-jobs__item" key={analysis.id}>
                  <div className="saved-jobs__details">
                    <strong className="saved-resumes__name">
                      {analysis.job_title}
                    </strong>
                    <span className="saved-resumes__metadata">
                      {analysis.company_name} · Saved{' '}
                      {formatDate(analysis.created_at)}
                    </span>
                    <span className="saved-resumes__metadata">
                      {analysis.resume_name
                        ? `Resume: ${analysis.resume_name}`
                        : 'No saved resume attached'}
                    </span>
                  </div>
                  <div className="saved-resumes__actions">
                    <Link
                      className="saved-resumes__action saved-jobs__view"
                      to={`/applications/${analysis.id}`}
                    >
                      View details
                    </Link>
                    <button
                      className="saved-resumes__action saved-resumes__action--danger"
                      disabled={deletingId !== null}
                      onClick={() => void handleDelete(analysis)}
                      type="button"
                    >
                      {deletingId === analysis.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
      </section>
    </div>
  )
}

export default SavedJobs
