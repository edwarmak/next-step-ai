import Icon from '../Icon/Icon'
import { Link } from 'react-router-dom'
import './RecentJobs.css'

function RecentJobs() {
  return (
    <section className="recent-section" id="recent-jobs" aria-labelledby="recent-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PICK UP WHERE YOU LEFT OFF</p>
          <h2 id="recent-title">Recently analyzed</h2>
        </div>
        <Link className="text-link" to="/applications">
          View all
          <Icon name="arrow-right" />
        </Link>
      </div>

      <div className="empty-state">
        <span className="empty-state__icon">
          <Icon name="file" />
          <span>
            <Icon name="sparkles" />
          </span>
        </span>
        <h3>Your next opportunity is waiting</h3>
        <p>
          Once you analyze a job, your tailored insights will show up here.
        </p>
        <Link to="/analyze" className="empty-state__link">
          Analyze your first job
          <Icon name="arrow-right" />
        </Link>
      </div>
    </section>
  )
}

export default RecentJobs
