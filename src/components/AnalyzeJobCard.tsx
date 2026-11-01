import Icon from './Icon'
import { Link } from 'react-router-dom'

function AnalyzeJobCard() {
  return (
    <section className="analyze-card" id="job-analysis" aria-labelledby="analyze-title">
      <div className="analyze-card__content">
        <span className="feature-label">
          <Icon name="sparkles" />
          AI-POWERED JOB ANALYSIS
        </span>
        <h2 id="analyze-title">
          Find your fit.
          <br />
          Show them you’re ready.
        </h2>
        <p>
          Bring a job description and your resume. Get a clear picture of where
          you shine and what to highlight.
        </p>
        <Link className="primary-button" to="/analyze">
          Start your first analysis
          <Icon name="arrow-right" />
        </Link>
        <span className="analyze-card__note">
          <Icon name="check" />
          Your resume stays yours. Always.
        </span>
      </div>

      <div className="analysis-visual" aria-hidden="true">
        <div className="analysis-visual__glow" />
        <div className="analysis-visual__orbit analysis-visual__orbit--outer" />
        <div className="analysis-visual__orbit analysis-visual__orbit--inner" />
        <div className="analysis-document analysis-document--resume">
          <div className="analysis-document__heading">
            <span className="document-avatar">JD</span>
            <span className="document-lines">
              <i />
              <i />
            </span>
          </div>
          <span className="document-section">EXPERIENCE</span>
          <span className="document-line document-line--long" />
          <span className="document-line" />
          <span className="document-line document-line--short" />
          <span className="document-section document-section--second">SKILLS</span>
          <div className="document-tags">
            <i />
            <i />
            <i />
          </div>
        </div>
        <div className="analysis-sparkle">
          <Icon name="sparkles" />
        </div>
        <div className="analysis-match">
          <span className="analysis-match__icon">
            <Icon name="check" />
          </span>
          <span>
            <strong>Strong match</strong>
            <small>Your experience stands out</small>
          </span>
          <b>92%</b>
        </div>
        <div className="analysis-visual__caption">
          YOUR NEXT OPPORTUNITY, IN FOCUS
        </div>
      </div>
    </section>
  )
}

export default AnalyzeJobCard
