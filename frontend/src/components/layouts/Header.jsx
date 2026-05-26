import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { usePrivacy } from '../../contexts/PrivacyContext';
import LogoutModal from '../common/Modal/LogoutModal';
import './PrivacyPasswordModal.css';

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
  const { logout, user: authUser } = useAuth();
  const { isConfidentialMode, toggleConfidentialMode } = usePrivacy();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handlePrivacyToggleClick = () => {
    if (isConfidentialMode) {
      // Currently masked (Confidential). We want to turn it off (reveal). Show password modal.
      setShowPasswordModal(true);
      setConfirmPassword('');
      setPasswordError('');
    } else {
      // Currently revealed (Normal). We want to turn it on (hide/close). Do NOT ask for password!
      toggleConfidentialMode();
    }
  };

  const handlePasswordSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!confirmPassword) return;

    setIsVerifying(true);
    setPasswordError('');
    try {
      await api.post('/auth/login', {
        identifier: authUser?.email || user?.email || 'admin@example.com',
        password: confirmPassword,
      });

      // Password verified! Toggle confidential mode
      toggleConfidentialMode();
      setShowPasswordModal(false);
      setConfirmPassword('');
    } catch (err) {
      console.error("Privacy Authorization Error:", err);
      setPasswordError('Invalid Unauthorize Access Password.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Automatic restore / auto-confidential if unattended (30 seconds)
  useEffect(() => {
    // Only run the timer if Privacy Mode is DISABLED (meaning sensitive data is REVEALED)
    if (isConfidentialMode) return;

    let timeoutId;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        // Automatically re-enable Privacy Mode (go back to confidential)
        if (!isConfidentialMode) {
          toggleConfidentialMode();
          console.log("System unattended. Privacy Mode automatically restored.");
        }
      }, 30000); // 30 seconds of inactivity
    };

    // Events to monitor for activity
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    
    // Register event listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Start initial timer
    resetTimer();

    // Cleanup
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isConfidentialMode, toggleConfidentialMode]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [globalSearchResults, setGlobalSearchResults] = useState({ users: [], vehicles: [], logs: [] });

  // Debounced System Search
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (globalSearchQuery.trim().length < 2) {
        setGlobalSearchResults({ users: [], vehicles: [], logs: [] });
        setIsSearching(false);
        return;
      }

      // We only run this deep backend search for admins to protect data privacy.
      if (role !== 'admin') return;

      setIsSearching(true);
      try {
        const res = await api.get(`/admin/search?q=${encodeURIComponent(globalSearchQuery)}`);
        if (res.data) {
          setGlobalSearchResults(res.data);
        }
      } catch (err) {
        console.error("Global search failed:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(timer);
  }, [globalSearchQuery, role]);

  const getSearchablePages = () => {
    const pages = [];
    if (role === 'admin') {
      pages.push(
        { title: 'Dashboard', path: '/admin/dashboard', icon: 'bar_chart', group: 'Pages' },
        { title: 'Users', path: '/admin/users', icon: 'people', group: 'Pages' },
        { title: 'Vehicles', path: '/admin/vehicles', icon: 'directions_car', group: 'Pages' },
        { title: 'Cameras', path: '/admin/cameras', icon: 'videocam', group: 'Pages' },
        { title: 'Security Staff', path: '/admin/security-staff', icon: 'admin_panel_settings', group: 'Pages' },
        { title: 'Analytics', path: '/admin/analytics', icon: 'insights', group: 'Pages' },
        { title: 'Entry-Exit Logs', path: '/admin/entry-logs', icon: 'history', group: 'Pages' },
        { title: 'Anomalies', path: '/admin/anomalies', icon: 'error', group: 'Pages' },
        { title: 'Settings', path: '/admin/settings', icon: 'settings', group: 'Pages' }
      );
    } else if (role === 'staff') {
      pages.push(
        { title: 'Dashboard', path: '/staff/dashboard', icon: 'bar_chart', group: 'Pages' },
        { title: 'My Vehicles', path: '/staff/vehicles', icon: 'directions_car', group: 'Pages' },
        { title: 'Entry Logs', path: '/staff/logs', icon: 'history', group: 'Pages' }
      );
    } else if (role === 'security') {
      pages.push(
        { title: 'Dashboard', path: '/security/dashboard', icon: 'security', group: 'Pages' }
      );
    } else {
      const basePath = role === 'visitor' ? '/visitor' : '';
      pages.push(
        { title: 'Dashboard', path: `${basePath}/dashboard`, icon: 'bar_chart', group: 'Pages' },
        { title: 'My Vehicles', path: `${basePath}/vehicles`, icon: 'directions_car', group: 'Pages' },
        { title: 'Entry Logs', path: `${basePath}/logs`, icon: 'history', group: 'Pages' }
      );
    }
    return pages;
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/me?limit=10');
      if (res.data) {
        // Handle paginated { items, total } or legacy array format
        const items = Array.isArray(res.data.items) ? res.data.items : (Array.isArray(res.data) ? res.data : []);
        setNotifications(items);
        
        // If the backend returns total in paginated mode, it might be more accurate for the badge
        // but for now we'll filter the fetched items to maintain existing badge behavior
        setUnreadCount(items.filter(n => !n.is_read).length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
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
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/login', { replace: true });
    setShowLogoutModal(false);
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

  const getLogsRoute = () => {
    if (role === 'admin') return '/admin/entry-logs';
    if (role === 'staff') return '/staff/logs';
    if (role === 'visitor') return '/visitor/logs';
    return '/logs';
  };

  const handleGlobalSearch = (e) => {
    if (e.key === 'Enter') {
      const query = globalSearchQuery.trim() || e.target.value.trim();
      if (query) {
        navigate(`${getLogsRoute()}?search=${encodeURIComponent(query)}`);
      } else {
        navigate(getLogsRoute());
      }
      setSearchFocused(false);
      setGlobalSearchQuery('');
    }
  };

  const filteredPages = getSearchablePages().filter(p => 
    p.title.toLowerCase().includes(globalSearchQuery.toLowerCase())
  );

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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:'14px',height:'14px'}}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </span>
            <input 
              id="header-search-input"
              className="premium-srch-input" 
              type="text" 
              placeholder="Search pages, vehicles, logs…"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              onKeyDown={handleGlobalSearch}
              autoComplete="off"
            />
            <div className="premium-srch-kbd">
              <span className="premium-kbd">⌘</span><span className="premium-kbd">K</span>
            </div>

            {/* OMNIBOX DROPDOWN */}
            {searchFocused && globalSearchQuery && (
              <div className="global-search-dropdown" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                
                {/* Pages */}
                {filteredPages.length > 0 && (
                  <>
                    <div className="global-search-section-title">Pages</div>
                    {filteredPages.map((page, idx) => (
                      <div 
                        key={`page-${idx}`} 
                        className="global-search-item"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          navigate(page.path);
                          setSearchFocused(false);
                          setGlobalSearchQuery('');
                        }}
                      >
                        <span className="material-symbols-rounded gs-icon">{page.icon}</span>
                        <span className="gs-title">{page.title}</span>
                      </div>
                    ))}
                  </>
                )}

                {/* Loading indicator */}
                {isSearching && (
                  <div className="global-search-item" style={{ justifyContent: 'center', opacity: 0.6 }}>
                    <span className="gs-title">Searching system...</span>
                  </div>
                )}

                {/* Users Results */}
                {!isSearching && globalSearchResults.users && globalSearchResults.users.length > 0 && (
                  <>
                    <div className="global-search-section-title" style={{ marginTop: '0.5rem' }}>Users</div>
                    {globalSearchResults.users.map((u) => (
                      <div 
                        key={`user-${u.id}`} 
                        className="global-search-item"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          navigate(u.path);
                          setSearchFocused(false);
                          setGlobalSearchQuery('');
                        }}
                      >
                        <span className="material-symbols-rounded gs-icon">person</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className="gs-title">{u.name}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--t-3)' }}>{u.email} • {u.role}</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Vehicles Results */}
                {!isSearching && globalSearchResults.vehicles && globalSearchResults.vehicles.length > 0 && (
                  <>
                    <div className="global-search-section-title" style={{ marginTop: '0.5rem' }}>Vehicles</div>
                    {globalSearchResults.vehicles.map((v) => (
                      <div 
                        key={`vehicle-${v.id}`} 
                        className="global-search-item"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          navigate(v.path);
                          setSearchFocused(false);
                          setGlobalSearchQuery('');
                        }}
                      >
                        <span className="material-symbols-rounded gs-icon">directions_car</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className="gs-title">{v.plate_number}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--t-3)' }}>{v.type} • Owner: {v.owner}</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Logs Results */}
                {!isSearching && globalSearchResults.logs && globalSearchResults.logs.length > 0 && (
                  <>
                    <div className="global-search-section-title" style={{ marginTop: '0.5rem' }}>Entry Logs</div>
                    {globalSearchResults.logs.map((l) => (
                      <div 
                        key={`log-${l.id}`} 
                        className="global-search-item"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          navigate(l.path);
                          setSearchFocused(false);
                          setGlobalSearchQuery('');
                        }}
                      >
                        <span className="material-symbols-rounded gs-icon">history</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className="gs-title">{l.plate_number}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--t-3)' }}>{l.direction} • {l.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                
                {/* Fallback Log Search (Global Text Search) */}
                <div className="global-search-section-title" style={{ marginTop: '0.5rem' }}>Deep Search</div>
                <div 
                  className="global-search-item gs-action-item"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    navigate(`${getLogsRoute()}?search=${encodeURIComponent(globalSearchQuery)}`);
                    setSearchFocused(false);
                    setGlobalSearchQuery('');
                  }}
                >
                  <span className="material-symbols-rounded gs-icon" style={{ color: 'var(--color-primary)' }}>search</span>
                  <span className="gs-title">Search all logs for "{globalSearchQuery}"</span>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* SEARCH ICON (Mobile) */}
        <button 
          className="sico-btn" 
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)} 
          title="Search"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:'18px',height:'18px'}}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </button>

        {/* ACTIONS */}
        <div className="premium-actions">
          {/* Privacy Toggle */}
          {role === 'admin' && (
            <button
              className={`premium-ibtn ${isConfidentialMode ? 'on' : ''}`}
              onClick={handlePrivacyToggleClick}
              title={isConfidentialMode ? "Disable Privacy Mode" : "Enable Privacy Mode"}
              style={{ fontSize: '1.2rem' }}
            >
              {isConfidentialMode ? '🙈' : '👁️'}
            </button>
          )}

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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
            <svg className="premium-av-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>

        {/* NOTIFICATION POP */}
        <div className={`premium-pop premium-npop ${notificationOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="premium-ph">
            <div className="premium-pt">Notifications<span className="premium-ptbadge">{unreadCount} new</span></div>
            <div className="premium-pact" onClick={handleMarkAllRead}>Mark all read</div>
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
              notifications.map(n => {
                const getIcon = () => {
                  if (n.title?.includes('Entered')) return '🟢';
                  if (n.title?.includes('Exited')) return '🔵';
                  if (n.title?.includes('Flagged')) return '⚠️';
                  if (n.type === 'warning' || n.type === 'WARNING') return '⚠️';
                  if (n.type === 'success' || n.type === 'SUCCESS') return '✅';
                  if (n.type === 'danger' || n.type === 'DANGER') return '🚨';
                  return 'ℹ️';
                };
                const getClass = () => {
                  if (n.type === 'warning' || n.type === 'WARNING') return 'warn';
                  if (n.type === 'success' || n.type === 'SUCCESS') return 'ok';
                  if (n.type === 'danger' || n.type === 'DANGER') return 'crit';
                  return 'info';
                };
                const timeAgo = (date) => {
                  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
                  if (diff < 60) return 'Just now';
                  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
                  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
                  return new Date(date).toLocaleDateString();
                };
                return (
                  <div key={n.id} className={`premium-ni ${!n.is_read ? 'unread' : ''}`} onClick={() => handleMarkAsRead(n.id)}>
                    <div className={`premium-niico ${getClass()}`}>
                      {getIcon()}
                    </div>
                    <div className="premium-nitext">
                      <div className="premium-nititle">{n.title || 'System Alert'}</div>
                      <div className="premium-nimsg">{n.message}</div>
                    </div>
                    <div className="premium-nitime">
                      {timeAgo(n.created_at)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="premium-nfoot">
            <div className="premium-nfoot-btn" onClick={() => setNotificationOpen(false)}>
              View all notifications
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:'14px',height:'14px'}}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </span>
          <input 
            className="premium-srch-input" 
            type="text" 
            placeholder="Search vehicles, logs…"
            autoFocus={mobileSearchOpen}
            onKeyDown={(e) => {
              handleGlobalSearch(e);
              if (e.key === 'Enter') setMobileSearchOpen(false);
            }}
          />
        </div>
      </div>

      <LogoutModal 
        isOpen={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      {showPasswordModal && (
        <div className={`modal-overlay ${isDark ? 'dark' : 'light'}`}>
          <div className="modal-content logout-modal privacy-modal-content">
            <div className="modal-icon-container">
              <div className="modal-icon-glow privacy-modal-glow"></div>
              <div className="modal-icon-box privacy-modal-icon-box">
                <span className="material-symbols-rounded" style={{ fontSize: '28px' }}>lock</span>
              </div>
            </div>
            <div className="modal-texts" style={{ marginBottom: '20px' }}>
              <h3 className="modal-title privacy-modal-title-text">Confirm Privacy Settings</h3>
              <p className="modal-desc privacy-modal-desc-text">
                Please enter your administrator password to authorize enabling/disabling Privacy Mode.
              </p>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="privacy-modal-form">
              <input
                type="password"
                placeholder="Enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoFocus
                disabled={isVerifying}
                className={`privacy-modal-input ${passwordError ? 'input-error' : ''}`}
              />
              {passwordError && (
                <div className="privacy-modal-error-text">
                  ⚠️ {passwordError}
                </div>
              )}
            </form>

            <div className="privacy-modal-actions">
              <button 
                className="privacy-modal-btn-cancel btn-premium-cancel" 
                onClick={() => setShowPasswordModal(false)}
                disabled={isVerifying}
              >
                Cancel
              </button>
              <button 
                className="privacy-modal-btn-authorize"
                onClick={handlePasswordSubmit}
                disabled={isVerifying || !confirmPassword}
              >
                {isVerifying ? 'Verifying...' : 'Authorize'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

Header.propTypes = {
  user: PropTypes.object,
  role: PropTypes.string,
  onMenuToggle: PropTypes.func,
  pageTitle: PropTypes.string
};
