import Icon, { type IconName } from '../Icon/Icon'
import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import './Sidebar.css'

const navigationItems: { label: string; to: string; icon: IconName }[] = [
  { label: 'Dashboard', to: '/', icon: 'grid' },
  { label: 'Job Analysis', to: '/analyze', icon: 'sparkles' },
  { label: 'Saved Jobs', to: '/applications', icon: 'briefcase' },
  { label: 'Saved Resumes', to: '/resumes', icon: 'file' },
]

function Sidebar() {
  const { user, isLoading: isAuthLoading, error: sessionError } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState('')

  async function handleSignOut() {
    setSignOutError('')
    setIsSigningOut(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
    } catch (error) {
      setSignOutError(
        error instanceof Error
          ? error.message
          : 'We couldn’t sign you out. Please try again.',
      )
    } finally {
      setIsSigningOut(false)
    }
  }

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
        <Link className="nav-link" to="/auth">
          <Icon name="sparkles" />
          <span>{user ? 'Account' : 'Sign in'}</span>
        </Link>
        {user && (
          <button
            className="sidebar__mobile-sign-out"
            disabled={isSigningOut}
            onClick={handleSignOut}
            type="button"
          >
            {isSigningOut ? 'Signing out…' : 'Log out'}
          </button>
        )}
        {(sessionError || signOutError) && (
          <p className="sidebar__auth-error" role="alert">
            {signOutError || sessionError}
          </p>
        )}
        <div className="sidebar__profile">
          <span className="profile-avatar" aria-hidden="true">
            {user?.email?.slice(0, 2).toUpperCase() ?? 'RR'}
          </span>
          <span className="sidebar__profile-copy">
            <strong>
              {isAuthLoading
                ? 'Checking session…'
                : user
                  ? user.email
                  : 'Guest workspace'}
            </strong>
            <span>{user ? 'Signed in' : 'Personal account'}</span>
          </span>
          {user ? (
            <button
              className="sidebar__sign-out"
              disabled={isSigningOut}
              onClick={handleSignOut}
              type="button"
            >
              {isSigningOut ? '…' : 'Log out'}
            </button>
          ) : (
            <span className="profile-menu" aria-hidden="true">
              ···
            </span>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
