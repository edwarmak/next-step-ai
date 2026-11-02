import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  deleteJobAnalysis,
  getJobAnalysis,
} from '../services/jobAnalysisService'
import type { SavedJobAnalysis } from '../types/jobAnalysis'

function formatDate(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(date))
}

function SavedJobDetails() {
  const { analysisId } = useParams()
  const navigate = useNavigate()
  const { user, isLoading: isAuthLoading } = useAuth()
  const [analysis, setAnalysis] = useState<SavedJobAnalysis | null>(null)
  const [loadedKey, setLoadedKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!user || !analysisId) {
      setAnalysis(null)
      setLoadedKey('')
      setIsLoading(false)
      setLoadError('')
      return
    }

    let active = true
    const requestKey = `${user.id}:${analysisId}`
    setAnalysis(null)
    setLoadedKey('')
    setIsLoading(true)
    setLoadError('')
    setDeleteError('')

    void getJobAnalysis(user.id, analysisId)
      .then((savedAnalysis) => {
        if (active) {
          setAnalysis(savedAnalysis)
          setLoadedKey(requestKey)
        }
      })
      .catch(() => {
        if (active) {
          setLoadError('We couldn’t load this saved job. It may have been deleted.')
          setLoadedKey(requestKey)
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
  }, [user?.id, analysisId])

  async function handleDelete() {
    if (!user || !analysis || isDeleting) {
      return
    }

    const confirmed = window.confirm(
      `Delete the saved job “${analysis.job_title}” at ${analysis.company_name}? This cannot be undone.`,
    )
    if (!confirmed) {
      return
    }

    setIsDeleting(true)
    setDeleteError('')
    try {
      await deleteJobAnalysis(user.id, analysis.id)
      navigate('/applications', { replace: true })
    } catch {
      setDeleteError('We couldn’t delete this saved job. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const isLoadedForCurrentUser =
    Boolean(user && analysisId) && loadedKey === `${user?.id}:${analysisId}`

  return (
    <div className="saved-job-details-page">
      <header className="job-analysis-page__heading">
        <p className="eyebrow">YOUR WORKSPACE</p>
        <h1 className="job-analysis-page__title">Saved Job</h1>
        <p className="job-analysis-page__description">
          Review the job information saved to your account.
        </p>
      </header>

      {isAuthLoading && (
        <p className="saved-resumes__message" role="status">
          Checking your account…
        </p>
      )}

      {!isAuthLoading && !user && (
        <div className="saved-resumes">
          <p className="saved-resumes__message">
            Sign in to view saved jobs in your account.
          </p>
          <Link to="/auth">Sign in</Link>
        </div>
      )}

      {user && isLoading && (
        <p className="saved-resumes__message" role="status">
          Loading saved job…
        </p>
      )}

      {user && isLoadedForCurrentUser && loadError && (
        <p className="saved-resumes__error" role="alert">
          {loadError}
        </p>
      )}

      {user && isLoadedForCurrentUser && analysis && (
        <article className="saved-job-details">
          <div className="saved-job-details__heading">
            <div>
              <h2>{analysis.job_title}</h2>
              <p>{analysis.company_name}</p>
            </div>
            <span className="saved-resumes__metadata">
              Saved {formatDate(analysis.created_at)}
            </span>
          </div>

          <section aria-labelledby="saved-job-description-title">
            <h3 id="saved-job-description-title">Job description</h3>
            <div className="saved-job-details__description">
              {analysis.job_description}
            </div>
          </section>

          <p className="saved-job-details__resume">
            <strong>Resume:</strong>{' '}
            {analysis.resume_name ?? 'No saved resume attached'}
          </p>

          <p className="saved-resumes__message">
            AI analysis results are not available yet.
          </p>

          {deleteError && (
            <p className="saved-resumes__error" role="alert">
              {deleteError}
            </p>
          )}

          <div className="saved-resumes__actions">
            <Link className="saved-resumes__action" to="/applications">
              Back to saved jobs
            </Link>
            <button
              className="saved-resumes__action saved-resumes__action--danger"
              disabled={isDeleting}
              onClick={() => void handleDelete()}
              type="button"
            >
              {isDeleting ? 'Deleting…' : 'Delete saved job'}
            </button>
          </div>
        </article>
      )}

      {user && isLoadedForCurrentUser && loadError && (
        <Link className="saved-job-details__back" to="/applications">
          Back to saved jobs
        </Link>
      )}
    </div>
  )
}

export default SavedJobDetails
