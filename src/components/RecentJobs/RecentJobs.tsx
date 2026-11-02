import { useEffect, useState } from 'react'
import Icon from '../Icon/Icon'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { listRecentSavedJobs } from '../../services/jobAnalysisService'
import type { SavedJobAnalysis } from '../../types/jobAnalysis'
import {
  listGuestSavedJobs,
  type GuestSavedJob,
} from '../../services/guestSavedJobService'
import {
  loadRecentJobsForViewer,
  getRecentJobDisplay,
} from './recentAnalysisView'
import './RecentJobs.css'

function RecentJobs() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [savedJobs, setSavedJobs] = useState<SavedJobAnalysis[]>([])
  const [guestJobs, setGuestJobs] = useState<GuestSavedJob[]>([])
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null)
  const [guestJobsLoaded, setGuestJobsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (isAuthLoading) {
      return
    }

    if (!user) {
      let active = true
      setSavedJobs([])
      setLoadedUserId(null)
      setIsLoading(false)
      setLoadError('')
      setGuestJobsLoaded(false)

      function loadGuestJobs() {
        setGuestJobsLoaded(false)
        try {
          void loadRecentJobsForViewer(
            null,
            listRecentSavedJobs,
            listGuestSavedJobs,
          )
            .then((savedJobsForSession) => {
              if (active) {
                setGuestJobs(savedJobsForSession)
                setGuestJobsLoaded(true)
                setLoadError('')
              }
            })
            .catch(() => {
              if (active) {
                setLoadError(
                  'We couldn’t load your saved jobs from this session.',
                )
                setGuestJobsLoaded(true)
              }
            })
        } catch {
          if (active) {
            setLoadError('We couldn’t load your saved jobs from this session.')
            setGuestJobsLoaded(true)
          }
        }
      }

      function handleJobSaved() {
        loadGuestJobs()
      }

      loadGuestJobs()
      window.addEventListener('job-saved', handleJobSaved)

      return () => {
        active = false
        window.removeEventListener('job-saved', handleJobSaved)
      }
    }

    setGuestJobs([])
    setGuestJobsLoaded(false)

    let active = true
    const userId = user.id

    async function loadSavedJobs() {
      setIsLoading(true)
      setLoadError('')

      try {
        const jobs = await loadRecentJobsForViewer(
          userId,
          listRecentSavedJobs,
          listGuestSavedJobs,
        )
        if (active) {
          setSavedJobs(jobs)
          setLoadedUserId(userId)
        }
      } catch {
        if (active) {
          setLoadError('We couldn’t load your recent saved jobs. Please try again.')
          setLoadedUserId(userId)
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    function handleJobSaved() {
      void loadSavedJobs()
    }

    void loadSavedJobs()
    window.addEventListener('job-saved', handleJobSaved)

    return () => {
      active = false
      window.removeEventListener('job-saved', handleJobSaved)
    }
  }, [isAuthLoading, user?.id])

  const hasLoadedForCurrentUser = user?.id === loadedUserId
  const hasLoadedCurrentGuestJobs = !user && guestJobsLoaded
  const visibleJobs = user ? savedJobs : guestJobs
  const isCurrentViewerLoading =
    isAuthLoading ||
    (user
      ? isLoading || !hasLoadedForCurrentUser
      : !guestJobsLoaded && !loadError)
  const hasCurrentViewerError =
    !isAuthLoading &&
    (user
      ? hasLoadedForCurrentUser && Boolean(loadError)
      : hasLoadedCurrentGuestJobs && Boolean(loadError))
  const isEmpty =
    !isAuthLoading &&
    (user
      ? hasLoadedForCurrentUser &&
        !isLoading &&
        !loadError &&
        savedJobs.length === 0
      : hasLoadedCurrentGuestJobs && !loadError && guestJobs.length === 0)

  return (
    <section className="recent-section" id="recent-jobs" aria-labelledby="recent-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            {user ? 'PICK UP WHERE YOU LEFT OFF' : 'CURRENT BROWSER SESSION'}
          </p>
          <h2 id="recent-title">Recent Jobs</h2>
        </div>
        {user && (
          <Link className="text-link" to="/applications">
            View all
            <Icon name="arrow-right" />
          </Link>
        )}
      </div>

      {isCurrentViewerLoading && (
        <div className="empty-state" role="status">
          <p>{isAuthLoading ? 'Checking your account…' : 'Loading saved jobs…'}</p>
        </div>
      )}

      {hasCurrentViewerError && (
        <div className="empty-state" role="alert">
          <p>{loadError}</p>
        </div>
      )}

      {isEmpty && (
        <div className="empty-state">
          <span className="empty-state__icon">
            <Icon name="file" />
            <span>
              <Icon name="sparkles" />
            </span>
          </span>
          <h3>Your next opportunity is waiting</h3>
          <p>Jobs you save will show up here.</p>
          <Link to="/analyze" className="empty-state__link">
            Save your first job
            <Icon name="arrow-right" />
          </Link>
        </div>
      )}

      {!isCurrentViewerLoading && !hasCurrentViewerError && !user && (
        <p className="recent-jobs__session-note">
          These jobs are kept only for this browser session.
        </p>
      )}

      {!isCurrentViewerLoading &&
        !hasCurrentViewerError &&
        visibleJobs.length > 0 && (
          <ul className="recent-analyses__list">
            {visibleJobs.map((job) => {
              const display = getRecentJobDisplay(job)

              return (
                <li className="recent-analyses__item" key={display.id}>
                  <div className="recent-analyses__details">
                    <strong>{display.title}</strong>
                    <span>{display.company}</span>
                  </div>
                  <div className="recent-analyses__actions">
                    <span>Saved {display.date}</span>
                    <Link to={display.detailsPath}>View details</Link>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
    </section>
  )
}

export default RecentJobs
