import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import JobAnalysisForm from '../../components/JobAnalysis/JobAnalysisForm/JobAnalysisForm'
import SavedResumeManager from '../../components/JobAnalysis/SavedResumeManager/SavedResumeManager'
import type { ResumeExtractionStatus } from '../../components/JobAnalysis/ResumeUpload/ResumeUpload'
import type { JobAnalysisDetails } from '../../types/jobAnalysis'
import { saveJobAnalysis } from '../../services/jobAnalysisService'
import { saveResume } from '../../services/resumeService'
import {
  JobAnalysisPersistenceError,
  persistJobAnalysis,
} from '../../services/jobAnalysisWorkflow'
import type { SavedResume } from '../../types/resume'
import './JobAnalysis.css'

function JobAnalysis() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [jobDetails, setJobDetails] = useState<JobAnalysisDetails>({
    jobTitle: '',
    companyName: '',
    jobDescription: '',
  })
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [extractedResumeText, setExtractedResumeText] = useState('')
  const [extractionStatus, setExtractionStatus] =
    useState<ResumeExtractionStatus>('idle')
  const [extractionError, setExtractionError] = useState('')
  const [selectedSavedResume, setSelectedSavedResume] =
    useState<SavedResume | null>(null)
  const [isSavingResume, setIsSavingResume] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const [savedResumesRefreshKey, setSavedResumesRefreshKey] = useState(0)
  const [isSavingAnalysis, setIsSavingAnalysis] = useState(false)
  const [saveAnalysisError, setSaveAnalysisError] = useState('')
  const [saveAnalysisMessage, setSaveAnalysisMessage] = useState('')
  const saveRequest = useRef(false)
  const saveAnalysisRequest = useRef(false)
  const extractionRequest = useRef(0)

  useEffect(() => {
    if (!selectedSavedResume || selectedSavedResume.user_id === user?.id) {
      return
    }

    extractionRequest.current += 1
    setSelectedSavedResume(null)
    setExtractedResumeText('')
    setExtractionStatus('idle')
    setExtractionError('')
    setSaveError('')
    setSaveMessage('')
    setSaveAnalysisError('')
    setSaveAnalysisMessage('')
  }, [selectedSavedResume, user?.id])

  async function handleResumeFileChange(file: File | null) {
    const requestId = extractionRequest.current + 1
    extractionRequest.current = requestId
    setResumeFile(file)
    setSelectedSavedResume(null)
    setExtractedResumeText('')
    setExtractionError('')
    setSaveError('')
    setSaveMessage('')
    setSaveAnalysisError('')
    setSaveAnalysisMessage('')

    if (!file) {
      setExtractionStatus('idle')
      return
    }

    setExtractionStatus('loading')

    try {
      const { extractResumeText } = await import('../../services/resumeParser')
      const text = await extractResumeText(file)
      if (extractionRequest.current !== requestId) {
        return
      }

      setExtractedResumeText(text)
      setExtractionStatus('success')
    } catch (error) {
      if (extractionRequest.current !== requestId) {
        return
      }

      setExtractionError(
        error instanceof Error
          ? error.message
          : 'We couldn’t read this document. Try another PDF or DOCX file.',
      )
      setExtractionStatus('error')
    }
  }

  function handleSelectSavedResume(resume: SavedResume) {
    extractionRequest.current += 1
    setResumeFile(null)
    setSelectedSavedResume(resume)
    setExtractedResumeText(resume.extracted_text)
    setExtractionStatus('success')
    setExtractionError('')
    setSaveError('')
    setSaveMessage('')
    setSaveAnalysisError('')
    setSaveAnalysisMessage('')
  }

  function handleSavedResumeDeleted(resumeId: string) {
    if (selectedSavedResume?.id !== resumeId) {
      return
    }

    extractionRequest.current += 1
    setSelectedSavedResume(null)
    setExtractedResumeText('')
    setExtractionStatus('idle')
    setExtractionError('')
    setSaveError('')
    setSaveMessage('')
    setSaveAnalysisError('')
    setSaveAnalysisMessage('')
  }

  function handleJobDetailsChange(details: JobAnalysisDetails) {
    setJobDetails(details)
    setSaveAnalysisError('')
    setSaveAnalysisMessage('')
  }

  async function handleSaveAnalysis(details: JobAnalysisDetails) {
    if (!user || saveAnalysisRequest.current) {
      return
    }

    saveAnalysisRequest.current = true
    setIsSavingAnalysis(true)
    setSaveAnalysisError('')
    setSaveAnalysisMessage('')
    setSaveError('')
    setSaveMessage('')

    try {
      if (
        (resumeFile || selectedSavedResume) &&
        extractionStatus !== 'success'
      ) {
        throw new Error(
          'Wait for the resume to finish processing before saving the job analysis.',
        )
      }

      const activeResume =
        selectedSavedResume?.user_id === user.id
          ? { kind: 'saved' as const, id: selectedSavedResume.id }
          : resumeFile
            ? {
                kind: 'uploaded' as const,
                fileName: resumeFile.name,
                extractedText: extractedResumeText,
              }
            : null

      const { savedResume } = await persistJobAnalysis(
        user.id,
        details,
        activeResume,
        {
          saveResume,
          saveJobAnalysis,
        },
      )
      if (savedResume) {
        setSelectedSavedResume(savedResume)
        setResumeFile(null)
        setSavedResumesRefreshKey((key) => key + 1)
        setSaveMessage('Resume saved to your account.')
      }
      setSaveAnalysisMessage('Job analysis saved to your account.')
    } catch (error) {
      if (error instanceof JobAnalysisPersistenceError) {
        if (error.savedResume) {
          setSelectedSavedResume(error.savedResume)
          setResumeFile(null)
          setSavedResumesRefreshKey((key) => key + 1)
          setSaveMessage('Resume saved to your account.')
        }

        const causeMessage =
          error.originalError instanceof Error
            ? ` ${error.originalError.message}`
            : ''
        setSaveAnalysisError(
          error.stage === 'resume'
            ? `${error.message}${causeMessage}`
            : error.resumeIsSaved
              ? `Your resume is saved to your account, but the job analysis was not saved.${causeMessage}`
              : `${error.message}${causeMessage}`,
        )
      } else {
        setSaveAnalysisError(
          error instanceof Error
            ? error.message
            : 'We couldn’t save this job analysis. Please try again.',
        )
      }
    } finally {
      saveAnalysisRequest.current = false
      setIsSavingAnalysis(false)
    }
  }

  async function handleSaveResume() {
    if (
      !user ||
      !resumeFile ||
      extractionStatus !== 'success' ||
      saveRequest.current
    ) {
      return
    }

    if (extractedResumeText.length > 100_000) {
      setSaveError(
        'This resume’s extracted text is over the 100,000 character limit and cannot be saved.',
      )
      return
    }

    saveRequest.current = true
    setIsSavingResume(true)
    setSaveError('')
    setSaveMessage('')

    try {
      const fileType = resumeFile.name.split('.').pop()?.toLowerCase()
      if (fileType !== 'pdf' && fileType !== 'docx') {
        throw new Error('Only PDF and DOCX resumes can be saved.')
      }

      const savedResume = await saveResume({
        user_id: user.id,
        file_name: resumeFile.name,
        display_name: resumeFile.name,
        file_type: fileType,
        extracted_text: extractedResumeText,
      })

      setSelectedSavedResume(savedResume)
      setSaveMessage('Resume saved to your account.')
      setSavedResumesRefreshKey((key) => key + 1)
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'We couldn’t save this resume. Please try again.',
      )
    } finally {
      saveRequest.current = false
      setIsSavingResume(false)
    }
  }

  const activeSavedResume =
    selectedSavedResume?.user_id === user?.id ? selectedSavedResume : null
  const activeExtractedResumeText =
    selectedSavedResume && !activeSavedResume ? '' : extractedResumeText
  const activeExtractionStatus =
    selectedSavedResume && !activeSavedResume ? 'idle' : extractionStatus

  return (
    <div className="job-analysis-page">
      <header className="job-analysis-page__heading">
        <p className="eyebrow">YOUR NEXT OPPORTUNITY</p>
        <h1 className="job-analysis-page__title">Job Analysis</h1>
        <p className="job-analysis-page__description">
          Share the details of a role you’re interested in. Your job information
          will be ready for a future analysis.
        </p>
      </header>
      <JobAnalysisForm
        jobDetails={jobDetails}
        onJobDetailsChange={handleJobDetailsChange}
        resumeFile={resumeFile}
        extractedResumeText={activeExtractedResumeText}
        extractionStatus={activeExtractionStatus}
        extractionError={extractionError}
        onResumeFileChange={handleResumeFileChange}
        onSaveAnalysis={
          user && !isAuthLoading ? handleSaveAnalysis : undefined
        }
        isSavingAnalysis={isSavingAnalysis}
        saveAnalysisMessage={saveAnalysisMessage}
        saveAnalysisError={saveAnalysisError}
      />
      {resumeFile && extractionStatus === 'success' && !isAuthLoading && (
        <div className="resume-save">
          {user ? (
            activeSavedResume ? (
              <p className="resume-save__message" role="status">
                Resume saved to your account.{' '}
                <Link to="/resumes">Manage saved resumes</Link>
              </p>
            ) : (
              <button
                className="primary-button resume-save__button"
                disabled={isSavingResume}
                onClick={() => void handleSaveResume()}
                type="button"
              >
                {isSavingResume ? 'Saving resume…' : 'Save resume to account'}
              </button>
            )
          ) : (
            <p className="resume-save__message">
              Want to reuse this resume on another device?{' '}
              <Link to="/auth">Sign in</Link> to save it to your account.
            </p>
          )}
          {saveError && (
            <p className="saved-resumes__error" role="alert">
              {saveError}
            </p>
          )}
          {saveMessage && !activeSavedResume && (
            <p className="resume-save__message" role="status">
              {saveMessage}
            </p>
          )}
        </div>
      )}
      {activeSavedResume && (
        <p className="resume-save__message resume-save__selected" role="status">
          Using “{activeSavedResume.display_name}” from your account.
        </p>
      )}
      <SavedResumeManager
        onSelect={handleSelectSavedResume}
        onDeleted={handleSavedResumeDeleted}
        selectedResumeId={activeSavedResume?.id}
        refreshKey={savedResumesRefreshKey}
      />
    </div>
  )
}

export default JobAnalysis