import { NavLink, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Sidebar - Premium Dashboard navigation sidebar
 * Features: Profile Card, Premium styles, Collapsible, Integrated Theme Toggle
 */
export default function Sidebar({
  role = 'student',
  menuItems = [],
  isCollapsed = true,
  onToggle,
  isMobile = false
}) {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login', { replace: true });
  };

  const userInitials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email ? user.email.slice(0, 2).toUpperCase() : 'U';

  // Get display role
  const getDisplayRole = () => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'security': return 'Security';
      case 'faculty': return 'Faculty';
      case 'staff': return 'Staff';
      case 'visitor': return 'Visitor';
      default: return 'Student';
    }
  };

  // Icon mapping for premium look
  const getIcon = (item) => {
    if (item.premiumIcon) return <span className="material-symbols-rounded">{item.premiumIcon}</span>;
    
    // Map materialIcon names to Material Symbols
    const iconMap = {
      'dashboard': 'dashboard',
      'analytics': 'monitoring',
      'group': 'group',
      'directions_car': 'directions_car',
      'videocam': 'videocam',
      'security': 'admin_panel_settings',
      'trending_up': 'trending_up',
      'assignment': 'assignment',
      'history': 'history',
      'notifications': 'notifications',
      'person': 'person',
      'settings': 'settings',
      'lock': 'lock',
      'public': 'public'
    };

    const iconName = iconMap[item.materialIcon] || 'circle';
    return <span className="material-symbols-rounded">{iconName}</span>;
  };

  // Determine classes
  const sidebarClasses = `premium-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobile && !isCollapsed ? 'mobile-open' : ''}`;

  return (
    <>
      {/* ── MOBILE OVERLAY ── */}
      {isMobile && !isCollapsed && (
        <div 
          className="premium-sidebar-overlay active"
          onClick={onToggle}
        />
      )}

      <aside className={sidebarClasses}>
        {/* ── LOGO ── */}
        <div className="sidebar-logo">
          <div className="logo-left">
            <div className="logo-mark">
              <img 
                src="/src/assets/images/backgrounds/anpr-logo-2.png" 
                alt="CSUCC Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }} 
              />
            </div>
            {!isCollapsed && (
              <div className="logo-words">
                <div className="logo-title">CSUCC <em>ANPR</em></div>
                <div className="logo-sub">Smart Vehicle Logging</div>
              </div>
            )}
          </div>
        </div>

      {/* ── PROFILE CARD ── */}
      <div className="profile-card" onClick={() => navigate(role === 'admin' ? '/admin/profile' : '/profile')}>
        <div className="profile-card-banner"></div>
        <div className="profile-card-body">
          <div className="profile-avatar-row">
            <div className="profile-avatar">
              {userInitials}
              <div className="online-dot"></div>
            </div>
            {!isCollapsed && <span className="profile-badge">{getDisplayRole()}</span>}
          </div>
          {!isCollapsed && (
            <>
              <div className="profile-name">{user?.full_name || 'User Name'}</div>
              <div className="profile-email">{user?.email || 'user@example.com'}</div>
              <div className="profile-meta">
                <div className="profile-meta-chip">
                  <span className="dot dot-green"></span>
                  Active
                </div>
                {user?.student_id && (
                  <div className="profile-meta-chip">
                    <span className="dot dot-blue"></span>
                    {user.student_id}
                  </div>
                )}
                {user?.department && (
                  <div className="profile-meta-chip">
                    <span className="dot dot-purple"></span>
                    {user.department}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── NAV ── */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          {!isCollapsed && <div className="nav-section-label">Main Menu</div>}

          {menuItems.map((item, index) => {
            if (item.type === 'header') {
              return !isCollapsed ? (
                <div key={index} className="nav-divider"></div>
              ) : null;
            }

            return (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="nav-item-inner">
                  <div className="nav-icon-wrap">{getIcon(item)}</div>
                  {!isCollapsed && <span className="nav-item-label">{item.label}</span>}
                  {item.badge && !isCollapsed && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                  {!isCollapsed && !item.badge && <span className="nav-arrow">›</span>}
                </div>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* ── FOOTER ── */}
      <div className="sidebar-footer">
        {/* theme pill */}
        <div className="theme-pill" onClick={toggleTheme}>
          <div className="theme-pill-left">
            <span style={{ fontSize: '13px' }}>{isDark ? '☀︎' : '◑'}</span>
            {!isCollapsed && <span className="theme-pill-label">{isDark ? 'Dark Mode' : 'Light Mode'}</span>}
          </div>
          {!isCollapsed && (
            <div className="theme-switch">
              <div className="theme-switch-knob"></div>
            </div>
          )}
        </div>

        <button className="sign-out-btn" onClick={handleLogout}>
          <div className="sign-out-icon">↩</div>
          {!isCollapsed && <span className="sign-out-label">Sign Out</span>}
        </button>

        {!isCollapsed && <div className="footer-copy">© 2026 ALRIGHT SERVE · CSUCC SYSTEM V1.0</div>}
      </div>
    </aside>
    </>
  );
}

Sidebar.propTypes = {
  role: PropTypes.string,
  menuItems: PropTypes.arrayOf(PropTypes.shape({
    path: PropTypes.string.isRequired,
    materialIcon: PropTypes.string,
    premiumIcon: PropTypes.string,
    label: PropTypes.string.isRequired,
    badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    type: PropTypes.string
  })),
  isCollapsed: PropTypes.bool,
  onToggle: PropTypes.func,
  isMobile: PropTypes.bool,
  title: PropTypes.string
};
