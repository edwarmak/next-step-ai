import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  deleteSavedResume,
  listSavedResumes,
  renameSavedResume,
} from '../../services/resumeService'
import type { SavedResume } from '../../types/resume'

type SavedResumeManagerProps = {
  onSelect?: (resume: SavedResume) => void
  onDeleted?: (resumeId: string) => void
  selectedResumeId?: string
  refreshKey?: number
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  }).format(new Date(date))
}

function SavedResumeManager({
  onSelect,
  onDeleted,
  selectedResumeId,
  refreshKey = 0,
}: SavedResumeManagerProps) {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [resumes, setResumes] = useState<SavedResume[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [isRenaming, setIsRenaming] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setResumes([])
      setIsLoading(false)
      setLoadError('')
      return
    }

    let active = true
    setIsLoading(true)
    setLoadError('')

    void listSavedResumes(user.id)
      .then((savedResumes) => {
        if (active) {
          setResumes(savedResumes)
        }
      })
      .catch(() => {
        if (active) {
          setLoadError('We couldn’t load your saved resumes. Please try again.')
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
  }, [user, refreshKey])

  function startRename(resume: SavedResume) {
    setActionError('')
    setEditingId(resume.id)
    setDraftName(resume.display_name)
  }

  async function handleRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user || !editingId || isRenaming) {
      return
    }

    const displayName = draftName.trim()
    if (!displayName) {
      setActionError('Resume name cannot be empty.')
      return
    }

    setIsRenaming(true)
    setActionError('')
    try {
      const updatedResume = await renameSavedResume(
        user.id,
        editingId,
        displayName,
      )
      setResumes((current) =>
        current.map((resume) =>
          resume.id === updatedResume.id ? updatedResume : resume,
        ),
      )
      setEditingId(null)
    } catch {
      setActionError('We couldn’t rename that resume. Please try again.')
    } finally {
      setIsRenaming(false)
    }
  }

  async function handleDelete(resume: SavedResume) {
    if (!user || deletingId) {
      return
    }

    const confirmed = window.confirm(
      `Delete “${resume.display_name}”? Any job analyses using it will be kept without an attached resume.`,
    )
    if (!confirmed) {
      return
    }

    setDeletingId(resume.id)
    setActionError('')
    try {
      await deleteSavedResume(user.id, resume.id)
      setResumes((current) =>
        current.filter((savedResume) => savedResume.id !== resume.id),
      )
      onDeleted?.(resume.id)
    } catch {
      setActionError('We couldn’t delete that resume. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section
      className="saved-resumes"
      aria-labelledby="saved-resumes-title"
    >
      <div className="saved-resumes__heading">
        <div>
          <p className="eyebrow">YOUR LIBRARY</p>
          <h2 className="saved-resumes__title" id="saved-resumes-title">
            Saved resumes
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
          <p>Sign in to view and manage resumes saved to your account.</p>
          <Link to="/auth">Sign in</Link>
        </div>
      )}

      {user && isLoading && (
        <p className="saved-resumes__message" role="status">
          Loading saved resumes…
        </p>
      )}

      {user && loadError && (
        <p className="saved-resumes__error" role="alert">
          {loadError}
        </p>
      )}

      {user && actionError && (
        <p className="saved-resumes__error" role="alert">
          {actionError}
        </p>
      )}

      {user && !isLoading && !loadError && resumes.length === 0 && (
        <p className="saved-resumes__message">
          You haven’t saved any resumes yet.
        </p>
      )}

      {user && !isLoading && resumes.length > 0 && (
        <ul className="saved-resumes__list">
          {resumes.map((resume) => (
            <li className="saved-resumes__item" key={resume.id}>
              <div className="saved-resumes__details">
                {editingId === resume.id ? (
                  <form
                    className="saved-resumes__rename-form"
                    onSubmit={handleRename}
                  >
                    <label
                      className="saved-resumes__sr-only"
                      htmlFor={`resume-name-${resume.id}`}
                    >
                      Resume name
                    </label>
                    <input
                      autoFocus
                      className="job-analysis-form__input"
                      id={`resume-name-${resume.id}`}
                      maxLength={120}
                      onChange={(event) => setDraftName(event.currentTarget.value)}
                      value={draftName}
                    />
                    <button
                      className="saved-resumes__action"
                      disabled={isRenaming}
                      type="submit"
                    >
                      {isRenaming ? 'Saving…' : 'Save name'}
                    </button>
                    <button
                      className="saved-resumes__action saved-resumes__action--quiet"
                      disabled={isRenaming}
                      onClick={() => setEditingId(null)}
                      type="button"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <strong className="saved-resumes__name">
                      {resume.display_name}
                    </strong>
                    <span className="saved-resumes__metadata">
                      {resume.file_type.toUpperCase()} · Added{' '}
                      {formatDate(resume.created_at)}
                    </span>
                  </>
                )}
              </div>
              <div className="saved-resumes__actions">
                {onSelect && (
                  <button
                    className="saved-resumes__action"
                    disabled={selectedResumeId === resume.id}
                    onClick={() => onSelect(resume)}
                    type="button"
                  >
                    {selectedResumeId === resume.id ? 'Selected' : 'Use resume'}
                  </button>
                )}
                {editingId !== resume.id && (
                  <>
                    <button
                      className="saved-resumes__action saved-resumes__action--quiet"
                      onClick={() => startRename(resume)}
                      type="button"
                    >
                      Rename
                    </button>
                    <button
                      className="saved-resumes__action saved-resumes__action--danger"
                      disabled={deletingId !== null}
                      onClick={() => void handleDelete(resume)}
                      type="button"
                    >
                      {deletingId === resume.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default SavedResumeManager
