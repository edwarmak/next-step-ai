import { useState } from 'react'
import JobAnalysisForm from '../components/JobAnalysis/JobAnalysisForm'

function JobAnalysis() {
  const [resumeFile, setResumeFile] = useState<File | null>(null)

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
        onResumeFileChange={setResumeFile}
      />
    </div>
  )
}

export default JobAnalysis