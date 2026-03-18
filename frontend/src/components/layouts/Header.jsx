import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Header - Sample design dashboard header (exact copy of sample)
 */
export default function Header({
  user = {},
  role = 'student',
  onMenuToggle,
  pageTitle = 'Overview'
}) {
  const { toggleTheme, isDark } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/me?limit=5');
      if (res.data) {
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.is_read).length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-menu') && !e.target.closest('.notification-dropdown')) {
        setUserMenuOpen(false);
        setNotificationOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      const updated = notifications.map(n => n.id === id ? { ...n, is_read: true } : n);
      setNotifications(updated);
      setUnreadCount(updated.filter(n => !n.is_read).length);
    } catch (err) {
      console.error(err);
    }
  };

  const userInitials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const getProfilePath = () => {
    switch (role) {
      case 'admin': return '/admin/profile';
      case 'staff': return '/staff/profile';
      case 'visitor': return '/visitor/profile';
      default: return '/profile';
    }
  };

  // Determine breadcrumb and portal title
  const getPortalTitle = () => {
    switch (role) {
      case 'admin': return 'Admin Portal';
      case 'faculty': return 'Faculty Portal';
      case 'staff': return 'Staff Portal';
      case 'visitor': return 'Visitor Portal';
      default: return 'Student Portal';
    }
  };

  const getBreadcrumb = () => {
    return pageTitle || 'Dashboard';
  };

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('header-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="premium-topbar">
        {/* HAMBURGER */}
        <button 
          className="ham" 
          onClick={onMenuToggle}
          title="Menu"
        >
          <span></span><span></span><span></span>
        </button>

        {/* PAGE CONTEXT */}
        <div className="premium-ctx">
          {/* Portal Title removed per user request */}
          <div className="premium-ctx-crumb">
            <span>Home</span><span className="sep">›</span><span className="cur">{getBreadcrumb()}</span>
          </div>
        </div>

        <div className="premium-vdiv"></div>

        {/* SEARCH */}
        <div className="premium-srch">
          <div className="premium-srch-inner">
            <span className="premium-srch-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style={{width:'14px',height:'14px'}}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </span>
            <input 
              id="header-search-input"
              className="premium-srch-input" 
              type="text" 
              placeholder="Search vehicles, logs…"
            />
            <div className="premium-srch-kbd">
              <span className="premium-kbd">⌘</span><span className="premium-kbd">K</span>
            </div>
          </div>
        </div>

        {/* SEARCH ICON (Mobile) */}
        <button 
          className="sico-btn" 
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)} 
          title="Search"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style={{width:'18px',height:'18px'}}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </button>

        {/* ACTIONS */}
        <div className="premium-actions">
          {/* Bell */}
          <button 
            className={`premium-ibtn ${notificationOpen ? 'on' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setNotificationOpen(!notificationOpen);
              setUserMenuOpen(false);
            }}
            title="Notifications"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unreadCount > 0 && (
              <span className="premium-ncount">{unreadCount}</span>
            )}
          </button>

          {/* Avatar */}
          <button 
            className={`premium-avbtn ${userMenuOpen ? 'on' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setUserMenuOpen(!userMenuOpen);
              setNotificationOpen(false);
            }}
            title="Account"
          >
            <div className="premium-av">
              {userInitials}
              <div className="premium-av-dot"></div>
            </div>
            <div className="premium-av-info">
              <span className="premium-av-name">{user.name || 'User'}</span>
              <span className="premium-av-sub">{role.toUpperCase()}</span>
            </div>
            <svg className="premium-av-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>

        {/* NOTIFICATION POP */}
        <div className={`premium-pop premium-npop ${notificationOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="premium-ph">
            <div className="premium-pt">Notifications<span className="premium-ptbadge">{unreadCount} new</span></div>
            <div className="premium-pact" onClick={() => {/* Mark all read logic */}}>Mark all read</div>
          </div>
          <div className="premium-ntabs">
            <div className="premium-ntab on">All <span className="premium-nbadge">{notifications.length}</span></div>
            <div className="premium-ntab">Unread <span className="premium-nbadge">{unreadCount}</span></div>
            <div className="premium-ntab">System</div>
          </div>
          <div className="premium-nlist">
            {notifications.length === 0 ? (
              <div style={{padding:'20px', textAlign:'center', color:'var(--t-3)', fontSize:'12px'}}>No notifications</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`premium-ni ${!n.is_read ? 'unread' : ''}`} onClick={() => handleMarkAsRead(n.id)}>
                  <div className={`premium-niico ${n.type === 'warning' ? 'warn' : n.type === 'success' ? 'ok' : 'info'}`}>
                    {n.type === 'warning' ? '⚠️' : n.type === 'success' ? '✅' : '🛠️'}
                  </div>
                  <div className="premium-nitext">
                    <div className="premium-nititle">{n.title || 'System Alert'}</div>
                    <div className="premium-nimsg">{n.message}</div>
                  </div>
                  <div className="premium-nitime">
                    {new Date(n.created_at).toLocaleDateString()}<br/>
                    {new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="premium-nfoot">
            <div className="premium-nfoot-btn" onClick={() => setNotificationOpen(false)}>
              View all notifications
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        </div>

        {/* AVATAR POP */}
        <div className={`premium-pop premium-apop ${userMenuOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="premium-ahero">
            <div className="premium-ahero-av">
              {userInitials}
              <div className="premium-ahero-dot"></div>
            </div>
            <div>
              <div className="premium-ahero-name">{user.name || 'User'}</div>
              <div className="premium-ahero-email">{user.email || 'user@example.com'}</div>
              <div className="premium-achip">🎓 {role.charAt(0).toUpperCase() + role.slice(1)}</div>
            </div>
          </div>

          <div className="premium-theme-row" onClick={toggleTheme}>
            <div className="premium-thleft">
              <div className="premium-thico">{isDark ? '🌙' : '☀️'}</div>
              <span className="premium-thlbl">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <div className="premium-tog"><div className="premium-tok"></div></div>
          </div>

          <div className="premium-pmenu">
            <Link to={getProfilePath()} className="premium-pmi" onClick={() => setUserMenuOpen(false)}>
              <div style={{fontSize:'13px'}}>👤</div><span className="premium-plbl">View Profile</span><span className="premium-parr">›</span>
            </Link>
            <div className="premium-pdiv"></div>
            <div className="premium-pmi red" onClick={handleLogout}>
              <div style={{fontSize:'13px'}}>↩</div><span className="premium-plbl">Sign Out</span>
            </div>
          </div>

          <div className="premium-afoot">
            <span className="premium-afoot-k">{role.toUpperCase()} ID</span>
            <span className="premium-afoot-v">{user.id || 'N/A'}</span>
          </div>
        </div>
      </header>

      {/* MOBILE SEARCH BAR */}
      <div className={`msrch ${mobileSearchOpen ? 'open' : ''}`}>
        <div className="premium-srch-inner">
          <span className="premium-srch-ico">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style={{width:'14px',height:'14px'}}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </span>
          <input 
            className="premium-srch-input" 
            type="text" 
            placeholder="Search vehicles, logs…"
            autoFocus={mobileSearchOpen}
          />
        </div>
      </div>
    </>
  );
}

Header.propTypes = {
  user: PropTypes.object,
  role: PropTypes.string,
  onMenuToggle: PropTypes.func,
  pageTitle: PropTypes.string
};
