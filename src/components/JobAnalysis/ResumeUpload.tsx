import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import Icon from '../Icon'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED_EXTENSIONS = ['pdf', 'docx']
const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export type ResumeExtractionStatus = 'idle' | 'loading' | 'success' | 'error'

type ResumeUploadProps = {
  file: File | null
  extractedText: string
  extractionStatus: ResumeExtractionStatus
  extractionError: string
  onFileChange: (file: File | null) => void
}

function getFileExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() ?? ''
}

function getFileType(file: File) {
  return getFileExtension(file.name).toUpperCase()
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${size === 0 ? 0 : Math.max(1, Math.round(size / 1024))} KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function getFileError(file: File) {
  const extension = getFileExtension(file.name)
  const hasAcceptedExtension = ACCEPTED_EXTENSIONS.includes(extension)
  const hasAcceptedMimeType = ACCEPTED_MIME_TYPES.includes(file.type)

  if (
    !hasAcceptedExtension ||
    (file.type !== '' && !hasAcceptedMimeType)
  ) {
    return 'Choose a PDF or DOCX file to upload.'
  }

  if (file.size > MAX_FILE_SIZE) {
    return 'This file is larger than 10 MB. Choose a smaller resume.'
  }

  return ''
}

function ResumeUpload({
  file,
  extractedText,
  extractionStatus,
  extractionError,
  onFileChange,
}: ResumeUploadProps) {
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function selectFile(selectedFile?: File) {
    if (!selectedFile) {
      return
    }

    const fileError = getFileError(selectedFile)
    if (fileError) {
      setError(fileError)
      return
    }

    setError('')
    onFileChange(selectedFile)
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.currentTarget.files?.[0])
    event.currentTarget.value = ''
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    if (
      event.relatedTarget instanceof Node &&
      event.currentTarget.contains(event.relatedTarget)
    ) {
      return
    }

    setIsDragging(false)
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDragging(false)
    selectFile(event.dataTransfer.files[0])
  }

  function handleRemove() {
    setError('')
    onFileChange(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className="job-analysis-form__field">
      <span className="job-analysis-form__label" id="resume-upload-label">
        Resume <span className="job-analysis-form__optional">Optional</span>
      </span>
      {file ? (
        <div className="resume-upload__selected" aria-labelledby="resume-upload-label">
          <span className="resume-upload__file-icon">
            <Icon name="file" />
          </span>
          <span className="resume-upload__file-details">
            <span className="resume-upload__file-name">{file.name}</span>
            <span className="resume-upload__file-meta">
              {getFileType(file)} document · {formatFileSize(file.size)}
            </span>
          </span>
          <button
            className="resume-upload__remove"
            onClick={handleRemove}
            type="button"
            aria-label={`Remove ${file.name}`}
          >
            Remove
          </button>
        </div>
      ) : (
        <label
          className={`resume-upload${isDragging ? ' resume-upload--dragging' : ''}`}
          onDragEnter={handleDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="resume-upload__input"
            onChange={handleInputChange}
            ref={inputRef}
            type="file"
            aria-labelledby="resume-upload-label"
            aria-describedby={
              error
                ? 'resume-upload-help resume-upload-error'
                : 'resume-upload-help'
            }
            aria-invalid={Boolean(error)}
          />
          <span className="resume-upload__icon">
            <Icon name="upload" />
          </span>
          <span className="resume-upload__prompt">
            <strong>Drop your resume here</strong>
            <span>or <span className="resume-upload__browse">browse files</span></span>
          </span>
          <span className="resume-upload__help" id="resume-upload-help">
            PDF or DOCX · 10 MB max
          </span>
        </label>
      )}
      {error && (
        <p
          className="job-analysis-form__error"
          id="resume-upload-error"
          role="alert"
        >
          {error}
        </p>
      )}
      {extractionStatus === 'loading' && (
        <p className="resume-upload__status" role="status" aria-live="polite">
          Extracting resume text…
        </p>
      )}
      {extractionStatus === 'success' && (
        <p className="resume-upload__status resume-upload__status--success" role="status" aria-live="polite">
          Resume processed. {extractedText.length.toLocaleString()} characters of
          readable text extracted.
        </p>
      )}
      {extractionStatus === 'error' && (
        <p className="job-analysis-form__error" role="alert">
          {extractionError}
        </p>
      )}
    </div>
  )
}

export default ResumeUpload
