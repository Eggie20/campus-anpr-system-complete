import { useAuth } from '../../../../contexts/AuthContext';
import {
  StatWidget,
  DashboardWidget,
  MiniTable,
  ActivityFeed,
  QuickActions,
  CameraTile
} from '../../../../components';

// Admin navigation menu items
export const adminMenuItems = [
  { path: '/admin/dashboard', materialIcon: 'dashboard', label: 'Dashboard' },
  { path: '/admin/users', materialIcon: 'group', label: 'Users' },
  { path: '/admin/vehicles', materialIcon: 'directions_car', label: 'Vehicles' },
  { path: '/admin/cameras', materialIcon: 'videocam', label: 'Cameras' },
  { path: '/admin/security-staff', materialIcon: 'security', label: 'Security Staff' },
  { path: '/admin/analytics', materialIcon: 'trending_up', label: 'Analytics' },
  { path: '/admin/logs', materialIcon: 'assignment', label: 'System Logs' },
  { path: '/admin/settings', materialIcon: 'settings', label: 'Settings' }
];

// Mock data
const recentUsers = [
  { avatar: 'JD', avatarClass: 'role-student', primary: 'John Dela Cruz', secondary: 'student@csu.edu.ph', badge: 'Student', badgeClass: 'badge-primary' },
  { avatar: 'AR', avatarClass: 'role-student', primary: 'Anna Reyes', secondary: 'anna.r@csu.edu.ph', badge: 'Student', badgeClass: 'badge-primary' },
  { avatar: 'JC', avatarClass: 'role-faculty', primary: 'Prof. Jose Cruz', secondary: 'jose.c@csu.edu.ph', badge: 'Faculty', badgeClass: 'badge-secondary' },
  { avatar: 'PG', avatarClass: 'role-security', primary: 'Pedro Garcia', secondary: 'guard@csu.edu.ph', badge: 'Security', badgeClass: 'badge-success' }
];

const recentVehicles = [
  { avatar: '🚗', avatarClass: 'bg-success', primary: 'ABC 1234', secondary: 'Toyota Vios • Dr. Maria Santos', badge: 'Registered', badgeClass: 'badge-success' },
  { avatar: '🏍️', avatarClass: 'bg-success', primary: 'XYZ 5678', secondary: 'Honda Click 125i • John Dela Cruz', badge: 'Registered', badgeClass: 'badge-success' },
  { avatar: '🚗', avatarClass: 'bg-success', primary: 'DEF 9012', secondary: 'Honda Civic • Prof. Jose Cruz', badge: 'Registered', badgeClass: 'badge-success' },
  { avatar: '🚐', avatarClass: 'bg-warning', primary: 'GHI 3456', secondary: 'Toyota Hiace • Unassigned', badge: 'Pending', badgeClass: 'badge-warning' }
];

const recentActivity = [
  { type: 'entry', text: '<strong>ABC 1234</strong> entered via Main Gate', time: '2 minutes ago' },
  { type: 'alert', text: '<strong>UNK 0000</strong> - Unregistered vehicle detected', time: '15 minutes ago' },
  { type: 'exit', text: '<strong>XYZ 5678</strong> exited via Main Gate', time: '32 minutes ago' },
  { type: 'system', text: 'Camera <strong>Parking Lot B</strong> went offline', time: '1 hour ago' },
  { type: 'entry', text: '<strong>DEF 9012</strong> entered via Back Gate', time: '2 hours ago' }
];

const cameras = [
  { name: 'Main Gate - Entry', status: 'online' },
  { name: 'Main Gate - Exit', status: 'online' },
  { name: 'Parking Lot A', status: 'online' },
  { name: 'Parking Lot B', status: 'offline' },
  { name: 'Back Gate', status: 'online' },
  { name: 'Faculty Area', status: 'recording' }
];

const quickActions = [
  { icon: '➕', iconClass: 'quick-action-icon--info', label: 'Add User', onClick: () => { } },
  { icon: '🚗', iconClass: 'quick-action-icon--success', label: 'Add Vehicle', onClick: () => { } },
  { icon: '📊', iconClass: 'quick-action-icon--warning', label: 'Reports', path: '/admin/analytics' },
  { icon: '⚙️', iconClass: 'quick-action-icon--secondary', label: 'Settings', path: '/admin/settings' }
];

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
      <>
        <div className="dashboard-header-banner" style={{ border: 'none', background: 'transparent' }}>
          <div className="premium-page-header" style={{ marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem' }}>Administrator <span>Command Center</span> 🛡️</h1>
              <p>System status: <span className="text-success-glow" style={{ color: '#10b981', fontWeight: 600 }}>● Operational</span> • All campus nodes are synchronized.</p>
            </div>
            <div className="premium-header-meta">
              <div className="premium-glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="material-symbols-rounded" style={{ color: 'var(--ac)' }}>calendar_today</span>
                <span style={{ fontWeight: 600, color: 'var(--t-1)' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Complex Stats Row */}
        <section className="dashboard-grid dashboard-grid--2col mb-8">
          {/* Node Connectivity Card */}
          <div className="complex-stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Node connectivity</span>
              <span className="stat-card-badge stat-card-badge--online">8 / 8 online</span>
            </div>
            <div className="stat-card-grid">
              <div className="stat-card-column">
                <div className="stat-card-column-title">
                  <span className="dot main"></span>
                  Main gate <span style={{ opacity: 0.6, marginLeft: '4px', fontWeight: 400 }}>4 cameras</span>
                </div>
                <div className="stat-list-item">
                  <div className="stat-item-info"><span className="stat-item-dot online"></span>Front left</div>
                  <span className="stat-item-status online">Online</span>
                </div>
                <div className="stat-list-item">
                  <div className="stat-item-info"><span className="stat-item-dot online"></span>Front right</div>
                  <span className="stat-item-status online">Online</span>
                </div>
                <div className="stat-list-item">
                  <div className="stat-item-info"><span className="stat-item-dot online"></span>Rear left</div>
                  <span className="stat-item-status online">Online</span>
                </div>
                <div className="stat-list-item">
                  <div className="stat-item-info"><span className="stat-item-dot online"></span>Rear right</div>
                  <span className="stat-item-status online">Online</span>
                </div>
              </div>
              <div className="stat-card-column">
                <div className="stat-card-column-title">
                  <span className="dot back"></span>
                  Back gate <span style={{ opacity: 0.6, marginLeft: '4px', fontWeight: 400 }}>4 cameras</span>
                </div>
                <div className="stat-list-item">
                  <div className="stat-item-info"><span className="stat-item-dot online"></span>Front left</div>
                  <span className="stat-item-status online">Online</span>
                </div>
                <div className="stat-list-item">
                  <div className="stat-item-info"><span className="stat-item-dot online"></span>Front right</div>
                  <span className="stat-item-status online">Online</span>
                </div>
                <div className="stat-list-item">
                  <div className="stat-item-info"><span className="stat-item-dot online"></span>Rear left</div>
                  <span className="stat-item-status online">Online</span>
                </div>
                <div className="stat-list-item">
                  <div className="stat-item-info"><span className="stat-item-dot online"></span>Rear right</div>
                  <span className="stat-item-status online">Online</span>
                </div>
              </div>
            </div>
            <div className="stat-card-footer">
              <span className="footer-label">Total nodes online</span>
              <span className="footer-value" style={{ color: '#10b981' }}>8 / 8</span>
            </div>
          </div>

          {/* Active Residents Card */}
          <div className="complex-stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Active residents</span>
              <span className="stat-card-badge stat-card-badge--online">↑ 12% today</span>
            </div>
            <div className="stat-card-value-display">
              <div className="stat-card-value">156</div>
            </div>
            <div className="resident-role-list">
              <div className="resident-role-item">
                <div className="flex items-center gap-2">
                  <span className="stat-item-dot" style={{ background: '#3b82f6' }}></span>
                  <span style={{ fontSize: '0.85rem' }}>Student</span>
                </div>
                <span style={{ fontWeight: 700 }}>98</span>
              </div>
              <div className="resident-role-item">
                <div className="flex items-center gap-2">
                  <span className="stat-item-dot" style={{ background: '#10b981' }}></span>
                  <span style={{ fontSize: '0.85rem' }}>Faculty</span>
                </div>
                <span style={{ fontWeight: 700 }}>32</span>
              </div>
              <div className="resident-role-item">
                <div className="flex items-center gap-2">
                  <span className="stat-item-dot" style={{ background: '#f59e0b' }}></span>
                  <span style={{ fontSize: '0.85rem' }}>Staff</span>
                </div>
                <span style={{ fontWeight: 700 }}>18</span>
              </div>
              <div className="resident-role-item">
                <div className="flex items-center gap-2">
                  <span className="stat-item-dot" style={{ background: '#8b5cf6' }}></span>
                  <span style={{ fontSize: '0.85rem' }}>Security</span>
                </div>
                <span style={{ fontWeight: 700 }}>8</span>
              </div>
            </div>
          </div>

          {/* Tracked Vehicles Card */}
          <div className="complex-stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Tracked vehicles</span>
              <span className="stat-card-badge stat-card-badge--online">↑ 8% today</span>
            </div>
            <div className="stat-card-value">89</div>
            <div className="stat-card-grid">
              <div className="stat-card-column">
                <div className="stat-card-column-title"><span className="dot main"></span>Main gate</div>
                <div className="vehicle-stat-row">
                  <span className="vehicle-stat-label">Entered</span>
                  <span className="vehicle-stat-value entered">52</span>
                </div>
                <div className="vehicle-stat-row">
                  <span className="vehicle-stat-label">Exited</span>
                  <span className="vehicle-stat-value exited">38</span>
                </div>
                <div className="vehicle-stat-row vehicle-stat-row--highlight">
                  <span className="vehicle-stat-label">On campus</span>
                  <span className="vehicle-stat-value">14</span>
                </div>
              </div>
              <div className="stat-card-column">
                <div className="stat-card-column-title"><span className="dot back"></span>Back gate</div>
                <div className="vehicle-stat-row">
                  <span className="vehicle-stat-label">Entered</span>
                  <span className="vehicle-stat-value entered">37</span>
                </div>
                <div className="vehicle-stat-row">
                  <span className="vehicle-stat-label">Exited</span>
                  <span className="vehicle-stat-value exited">24</span>
                </div>
                <div className="vehicle-stat-row vehicle-stat-row--highlight">
                  <span className="vehicle-stat-label">On campus</span>
                  <span className="vehicle-stat-value">13</span>
                </div>
              </div>
            </div>
            <div className="stat-card-footer">
              <span className="footer-label">Currently on campus</span>
              <span className="footer-value">27</span>
            </div>
          </div>

          {/* Critical Alerts Card */}
          <div className="complex-stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Critical alerts</span>
              <span className="stat-card-badge stat-card-badge--danger">3 unresolved</span>
            </div>
            <div className="alert-list">
              <div className="alert-list-item">
                <div className="alert-icon-box critical"><span className="material-symbols-rounded" style={{ fontSize: '18px' }}>close</span></div>
                <div className="alert-content">
                  <div className="alert-title">Offline camera</div>
                  <div className="alert-meta">Main gate - Rear left</div>
                </div>
                <span style={{ fontWeight: 800, color: '#ef4444' }}>1</span>
              </div>
              <div className="alert-list-item">
                <div className="alert-icon-box warning"><span className="material-symbols-rounded" style={{ fontSize: '18px' }}>warning</span></div>
                <div className="alert-content">
                  <div className="alert-title">Unregistered vehicle</div>
                  <div className="alert-meta">Back gate • 10:45 AM</div>
                </div>
                <span style={{ fontWeight: 800, color: '#f59e0b' }}>1</span>
              </div>
              <div className="alert-list-item">
                <div className="alert-icon-box warning"><span className="material-symbols-rounded" style={{ fontSize: '18px' }}>report</span></div>
                <div className="alert-content">
                  <div className="alert-title">Expired registration</div>
                  <div className="alert-meta">Main gate • 09:12 AM</div>
                </div>
                <span style={{ fontWeight: 800, color: '#f59e0b' }}>1</span>
              </div>
            </div>
            <div className="stat-card-footer">
              <span className="footer-label">Total unresolved</span>
              <span className="footer-value" style={{ color: '#ef4444' }}>3</span>
            </div>
          </div>
        </section>

      {/* Recent Users & Vehicles */}
      <div className="dashboard-grid dashboard-grid--2col mb-6">
        <DashboardWidget
          title="Recent Users"
          icon="👥"
          actionText="View All"
          actionLink="/admin/users"
          flush
          className="fade-in-up delay-100"
        >
          <MiniTable rows={recentUsers} />
        </DashboardWidget>

        <DashboardWidget
          title="Recent Vehicles"
          icon="🚗"
          actionText="View All"
          actionLink="/admin/vehicles"
          flush
          className="fade-in-up delay-150"
        >
          <MiniTable rows={recentVehicles} />
        </DashboardWidget>
      </div>

      {/* Camera Status & Activity Feed */}
      <div className="dashboard-grid dashboard-grid--2col mb-6">
        <DashboardWidget
          title="Camera Status"
          icon="📹"
          actionText="Manage"
          actionLink="/admin/cameras"
          className="fade-in-up delay-200"
        >
          <div className="camera-grid">
            {cameras.map((camera, index) => (
              <CameraTile key={index} name={camera.name} status={camera.status} />
            ))}
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Recent Activity"
          icon="📋"
          actionText="View All"
          actionLink="/admin/logs"
          flush
          className="fade-in-up delay-250"
        >
          <ActivityFeed activities={recentActivity} />
        </DashboardWidget>
      </div>

      {/* Analytics Preview & Quick Actions */}
      <div className="dashboard-grid dashboard-grid--2col mb-6">
        <DashboardWidget
          title="This Week's Traffic"
          icon="📈"
          actionText="Full Report"
          actionLink="/admin/analytics"
          className="fade-in-up delay-300"
        >
          <div className="traffic-stats-grid">
            <div className="traffic-stat-item">
              <div className="traffic-stat-value text-success">247</div>
              <div className="traffic-stat-label">Total Entries</div>
            </div>
            <div className="traffic-stat-item">
              <div className="traffic-stat-value text-info">231</div>
              <div className="traffic-stat-label">Total Exits</div>
            </div>
            <div className="traffic-stat-item">
              <div className="traffic-stat-value text-warning">16</div>
              <div className="traffic-stat-label">Still Inside</div>
            </div>
          </div>
          <div className="mini-chart" style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '60px' }}>
            {[32, 45, 38, 52, 41, 28, 11].map((value, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${value}%`,
                  background: i === 6 ? 'rgba(16, 185, 129, 0.3)' : 'var(--color-success)',
                  borderRadius: '4px 4px 0 0'
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Quick Actions"
          icon="⚡"
          className="fade-in-up delay-350"
        >
          <QuickActions actions={quickActions} />
        </DashboardWidget>
      </div>
      </>
  );
}
