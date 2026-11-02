import SavedResumeManager from '../components/JobAnalysis/SavedResumeManager'

function SavedResumes() {
  return (
    <div className="saved-resumes-page">
      <header className="job-analysis-page__heading">
        <p className="eyebrow">YOUR WORKSPACE</p>
        <h1 className="job-analysis-page__title">Saved Jobs</h1>
        <p className="job-analysis-page__description">
          View and manage your saved resumes. You can rename, remove, or reuse a
          resume when preparing another job analysis.
        </p>
      </header>
      <SavedResumeManager />
    </div>
  )
}

export default SavedResumes
