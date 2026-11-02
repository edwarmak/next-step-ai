import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import ResumeUpload from './ResumeUpload'

type JobDetails = {
  jobTitle: string
  companyName: string
  jobDescription: string
}

type FieldErrors = Partial<Record<keyof JobDetails, string>>

type JobAnalysisFormProps = {
  resumeFile: File | null
  onResumeFileChange: (file: File | null) => void
}

const fieldOrder: (keyof JobDetails)[] = [
  'jobTitle',
  'companyName',
  'jobDescription',
]

const fieldLabels: Record<keyof JobDetails, string> = {
  jobTitle: 'Job title',
  companyName: 'Company name',
  jobDescription: 'Job description',
}

function validateJobDetails(details: JobDetails): FieldErrors {
  return fieldOrder.reduce<FieldErrors>((errors, field) => {
    if (!details[field].trim()) {
      errors[field] = `${fieldLabels[field]} is required.`
    }

    return errors
  }, {})
}

function JobAnalysisForm({
  resumeFile,
  onResumeFileChange,
}: JobAnalysisFormProps) {
  const [jobDetails, setJobDetails] = useState<JobDetails>({
    jobTitle: '',
    companyName: '',
    jobDescription: '',
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [statusMessage, setStatusMessage] = useState('')
  const fieldRefs = useRef<
    Record<keyof JobDetails, HTMLInputElement | HTMLTextAreaElement | null>
  >({
    jobTitle: null,
    companyName: null,
    jobDescription: null,
  })

  function handleChange(
    field: keyof JobDetails,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const value = event.currentTarget.value
    setJobDetails((currentDetails) => ({
      ...currentDetails,
      [field]: value,
    }))
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validateJobDetails(jobDetails)
    setErrors(nextErrors)
    setStatusMessage('')

    const firstInvalidField = fieldOrder.find((field) => nextErrors[field])
    if (firstInvalidField) {
      fieldRefs.current[firstInvalidField]?.focus()
      return
    }

    setStatusMessage(
      'Your job details are ready. Analysis results will be available in a future update.',
    )
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

      <ResumeUpload file={resumeFile} onFileChange={onResumeFileChange} />

      <button
        className="primary-button job-analysis-form__submit"
        type="submit"
      >
        Analyze Job
      </button>
      {statusMessage && (
        <p className="job-analysis-form__status" role="status">
          {statusMessage}
        </p>
      )}
    </form>
  )
}

export default JobAnalysisForm