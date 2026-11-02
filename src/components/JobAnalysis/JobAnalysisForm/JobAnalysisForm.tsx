import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import type { JobAnalysisDetails } from '../../../types/jobAnalysis'
import Icon from '../../Icon/Icon'
import ResumeUpload, {
  type ResumeExtractionStatus,
} from '../ResumeUpload/ResumeUpload'
import type { ResumeAttachment } from './resumeAttachment'
import './JobAnalysisForm.css'

type FieldErrors = Partial<Record<keyof JobAnalysisDetails, string>>

type JobAnalysisFormProps = {
  jobDetails: JobAnalysisDetails
  onJobDetailsChange: (details: JobAnalysisDetails) => void
  resumeFile: File | null
  extractedResumeText: string
  extractionStatus: ResumeExtractionStatus
  extractionError: string
  onResumeFileChange: (file: File | null) => void
  attachedResume: ResumeAttachment | null
  onRemoveResume: () => void
  onSaveJob?: (details: JobAnalysisDetails) => void
  saveJobLabel?: string
  isSavingJob?: boolean
  saveJobMessage?: string
  saveJobError?: string
}

const fieldOrder: (keyof JobAnalysisDetails)[] = [
  'jobTitle',
  'companyName',
  'jobDescription',
]

const fieldLabels: Record<keyof JobAnalysisDetails, string> = {
  jobTitle: 'Job title',
  companyName: 'Company name',
  jobDescription: 'Job description',
}

function validateJobDetails(details: JobAnalysisDetails): FieldErrors {
  return fieldOrder.reduce<FieldErrors>((errors, field) => {
    if (!details[field].trim()) {
      errors[field] = `${fieldLabels[field]} is required.`
    }

    return errors
  }, {})
}

function JobAnalysisForm({
  jobDetails,
  onJobDetailsChange,
  resumeFile,
  extractedResumeText,
  extractionStatus,
  extractionError,
  onResumeFileChange,
  attachedResume,
  onRemoveResume,
  onSaveJob,
  saveJobLabel = 'Save job',
  isSavingJob = false,
  saveJobMessage = '',
  saveJobError = '',
}: JobAnalysisFormProps) {
  const [errors, setErrors] = useState<FieldErrors>({})
  const [statusMessage, setStatusMessage] = useState('')
  const fieldRefs = useRef<
    Record<
      keyof JobAnalysisDetails,
      HTMLInputElement | HTMLTextAreaElement | null
    >
  >({
    jobTitle: null,
    companyName: null,
    jobDescription: null,
  })

  function handleChange(
    field: keyof JobAnalysisDetails,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const value = event.currentTarget.value
    onJobDetailsChange({
      ...jobDetails,
      [field]: value,
    })
    setStatusMessage('')
    setErrors((currentErrors) => {
      if (!currentErrors[field] || !value.trim()) {
        return currentErrors
      }

      const nextErrors = { ...currentErrors }
      delete nextErrors[field]
      return nextErrors
    })
  }

  function validateAndFocus() {
    const nextErrors = validateJobDetails(jobDetails)
    setErrors(nextErrors)

    const firstInvalidField = fieldOrder.find((field) => nextErrors[field])
    if (firstInvalidField) {
      fieldRefs.current[firstInvalidField]?.focus()
      return false
    }

    return true
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatusMessage('')

    if (!validateAndFocus()) {
      return
    }

    if (resumeFile && extractionStatus !== 'success') {
      return
    }

    setStatusMessage(
      'Your job details are ready. Analysis results will be available in a future update.',
    )
  }

  function handleSaveJob() {
    setStatusMessage('')
    if (validateAndFocus()) {
      onSaveJob?.(jobDetails)
    }
  }

  return (
    <form className="job-analysis-form" noValidate onSubmit={handleSubmit}>
      <div className="job-analysis-form__field">
        <label className="job-analysis-form__label" htmlFor="job-title">
          Job title <span className="job-analysis-form__required">Required</span>
        </label>
        <input
          autoComplete="organization-title"
          className="job-analysis-form__input"
          id="job-title"
          name="jobTitle"
          onChange={(event) => handleChange('jobTitle', event)}
          placeholder="e.g. Product Designer"
          ref={(element) => {
            fieldRefs.current.jobTitle = element
          }}
          required
          aria-invalid={Boolean(errors.jobTitle)}
          aria-describedby={errors.jobTitle ? 'job-title-error' : undefined}
          type="text"
          value={jobDetails.jobTitle}
        />
        {errors.jobTitle && (
          <p
            className="job-analysis-form__error"
            id="job-title-error"
            role="alert"
          >
            {errors.jobTitle}
          </p>
        )}
      </div>

      <div className="job-analysis-form__field">
        <label className="job-analysis-form__label" htmlFor="company-name">
          Company name{' '}
          <span className="job-analysis-form__required">Required</span>
        </label>
        <input
          autoComplete="organization"
          className="job-analysis-form__input"
          id="company-name"
          name="companyName"
          onChange={(event) => handleChange('companyName', event)}
          placeholder="e.g. Northstar Labs"
          ref={(element) => {
            fieldRefs.current.companyName = element
          }}
          required
          aria-invalid={Boolean(errors.companyName)}
          aria-describedby={
            errors.companyName ? 'company-name-error' : undefined
          }
          type="text"
          value={jobDetails.companyName}
        />
        {errors.companyName && (
          <p
            className="job-analysis-form__error"
            id="company-name-error"
            role="alert"
          >
            {errors.companyName}
          </p>
        )}
      </div>

      <div className="job-analysis-form__field">
        <label className="job-analysis-form__label" htmlFor="job-description">
          Job description{' '}
          <span className="job-analysis-form__required">Required</span>
        </label>
        <textarea
          className="job-analysis-form__input job-analysis-form__textarea"
          id="job-description"
          name="jobDescription"
          onChange={(event) => handleChange('jobDescription', event)}
          placeholder="Paste the job description here..."
          ref={(element) => {
            fieldRefs.current.jobDescription = element
          }}
          required
          aria-invalid={Boolean(errors.jobDescription)}
          aria-describedby={
            errors.jobDescription ? 'job-description-error' : undefined
          }
          value={jobDetails.jobDescription}
        />
        {errors.jobDescription && (
          <p
            className="job-analysis-form__error"
            id="job-description-error"
            role="alert"
          >
            {errors.jobDescription}
          </p>
        )}
      </div>

      {attachedResume ? (
        <div className="job-analysis-form__field">
          <span className="job-analysis-form__label" id="resume-upload-label">
            Resume <span className="job-analysis-form__optional">Optional</span>
          </span>
          <div
            className="resume-upload__attached"
            aria-labelledby="resume-upload-label"
          >
            <span className="resume-upload__file-icon">
              <Icon name="file" />
            </span>
            <span className="resume-upload__file-details">
              <span className="resume-upload__file-name">
                {attachedResume.fileName}
              </span>
              <span className="resume-upload__file-meta">
                {attachedResume.fileType} document
              </span>
            </span>
            <span className="resume-upload__attached-status">
              <Icon name="check" />
              Attached
            </span>
            <button
              className="resume-upload__remove"
              onClick={onRemoveResume}
              type="button"
              aria-label={`Remove ${attachedResume.fileName}`}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <ResumeUpload
          file={resumeFile}
          extractedText={extractedResumeText}
          extractionStatus={extractionStatus}
          extractionError={extractionError}
          onFileChange={onResumeFileChange}
        />
      )}

      <button
        className="primary-button job-analysis-form__submit"
        type="submit"
      >
        Analyze Job
      </button>
      {onSaveJob && (
        <button
          className="saved-resumes__action job-analysis-form__save"
          disabled={isSavingJob || Boolean(saveJobMessage)}
          onClick={handleSaveJob}
          type="button"
        >
          {isSavingJob
            ? 'Saving job…'
            : saveJobMessage
              ? 'Saved'
              : saveJobLabel}
        </button>
      )}
      {statusMessage && (
        <p className="job-analysis-form__status" role="status">
          {statusMessage}
        </p>
      )}
      {saveJobMessage && (
        <p className="job-analysis-form__status" role="status">
          {saveJobMessage}
        </p>
      )}
      {saveJobError && (
        <p className="job-analysis-form__error" role="alert">
          {saveJobError}
        </p>
      )}
    </form>
  )
}

export default JobAnalysisForm