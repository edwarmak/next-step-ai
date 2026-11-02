import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import type { JobAnalysisDetails } from '../../types/jobAnalysis'
import ResumeUpload, {
  type ResumeExtractionStatus,
} from './ResumeUpload'

type FieldErrors = Partial<Record<keyof JobAnalysisDetails, string>>

type JobAnalysisFormProps = {
  jobDetails: JobAnalysisDetails
  onJobDetailsChange: (details: JobAnalysisDetails) => void
  resumeFile: File | null
  extractedResumeText: string
  extractionStatus: ResumeExtractionStatus
  extractionError: string
  onResumeFileChange: (file: File | null) => void
  onSaveAnalysis?: (details: JobAnalysisDetails) => void
  isSavingAnalysis?: boolean
  saveAnalysisMessage?: string
  saveAnalysisError?: string
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
  onSaveAnalysis,
  isSavingAnalysis = false,
  saveAnalysisMessage = '',
  saveAnalysisError = '',
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

  function handleSaveAnalysis() {
    setStatusMessage('')
    if (validateAndFocus()) {
      onSaveAnalysis?.(jobDetails)
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

      <ResumeUpload
        file={resumeFile}
        extractedText={extractedResumeText}
        extractionStatus={extractionStatus}
        extractionError={extractionError}
        onFileChange={onResumeFileChange}
      />

      <button
        className="primary-button job-analysis-form__submit"
        type="submit"
      >
        Analyze Job
      </button>
      {onSaveAnalysis && (
        <button
          className="saved-resumes__action job-analysis-form__save"
          disabled={isSavingAnalysis || Boolean(saveAnalysisMessage)}
          onClick={handleSaveAnalysis}
          type="button"
        >
          {isSavingAnalysis
            ? 'Saving job…'
            : saveAnalysisMessage
              ? 'Saved'
              : 'Save job analysis'}
        </button>
      )}
      {statusMessage && (
        <p className="job-analysis-form__status" role="status">
          {statusMessage}
        </p>
      )}
      {saveAnalysisMessage && (
        <p className="job-analysis-form__status" role="status">
          {saveAnalysisMessage}
        </p>
      )}
      {saveAnalysisError && (
        <p className="job-analysis-form__error" role="alert">
          {saveAnalysisError}
        </p>
      )}
    </form>
  )
}

export default JobAnalysisForm