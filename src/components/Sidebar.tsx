import Icon, { type IconName } from './Icon'
import { Link, NavLink } from 'react-router-dom'

const navigationItems: { label: string; to: string; icon: IconName }[] = [
  { label: 'Dashboard', to: '/', icon: 'grid' },
  { label: 'Job Analysis', to: '/analyze', icon: 'sparkles' },
  { label: 'Saved Jobs', to: '/applications', icon: 'briefcase' },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <Link className="brand" to="/" aria-label="NextStep AI home">
        <span className="brand__mark">
          <Icon name="sparkles" />
        </span>
        <span>NextStep AI</span>
      </Link>

      <nav className="sidebar__nav" aria-label="Main navigation">
        <p className="sidebar__label">WORKSPACE</p>
        {navigationItems.map((item) => (
          <NavLink
            className={({ isActive }) =>
              `nav-link${isActive ? ' nav-link--active' : ''}`
            }
            end={item.to === '/'}
            to={item.to}
            key={item.label}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
            {item.label === 'Saved Jobs' && (
              <span className="nav-link__count" aria-label="0 saved jobs">
                0
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__bottom">
        <div className="sidebar__tip">
          <span className="sidebar__tip-icon">
            <Icon name="sparkles" />
          </span>
          <p>
            <strong>Make every move count.</strong>
            <span>Small steps lead to big opportunities.</span>
          </p>
        </div>
        <NavLink
          className={({ isActive }) =>
            `nav-link${isActive ? ' nav-link--active' : ''}`
          }
          to="/settings"
        >
          <Icon name="settings" />
          <span>Settings</span>
        </NavLink>
        <div className="sidebar__profile">
          <span className="profile-avatar" aria-hidden="true">
            RR
          </span>
          <span className="sidebar__profile-copy">
            <strong>Your workspace</strong>
            <span>Personal account</span>
          </span>
          <span className="profile-menu" aria-hidden="true">
            ···
          </span>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
