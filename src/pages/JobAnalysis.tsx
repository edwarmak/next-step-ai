import { useRef, useState } from 'react'
import JobAnalysisForm from '../components/JobAnalysis/JobAnalysisForm'
import type { ResumeExtractionStatus } from '../components/JobAnalysis/ResumeUpload'

function JobAnalysis() {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [extractedResumeText, setExtractedResumeText] = useState('')
  const [extractionStatus, setExtractionStatus] =
    useState<ResumeExtractionStatus>('idle')
  const [extractionError, setExtractionError] = useState('')
  const extractionRequest = useRef(0)

  async function handleResumeFileChange(file: File | null) {
    const requestId = extractionRequest.current + 1
    extractionRequest.current = requestId
    setResumeFile(file)
    setExtractedResumeText('')
    setExtractionError('')

    if (!file) {
      setExtractionStatus('idle')
      return
    }

    setExtractionStatus('loading')

    try {
      const { extractResumeText } = await import('../services/resumeParser')
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
        resumeFile={resumeFile}
        extractedResumeText={extractedResumeText}
        extractionStatus={extractionStatus}
        extractionError={extractionError}
        onResumeFileChange={handleResumeFileChange}
      />
    </div>
  )
}

export default JobAnalysis