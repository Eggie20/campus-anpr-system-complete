import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { usePrivacy } from '../../../../contexts/PrivacyContext';
import api from '../../../../services/api';
import {
  StatWidget,
  DashboardWidget,
  MiniTable,
  ActivityFeed,
  QuickActions,
  CameraTile
} from '../../../../components';
import styles from './Dashboard.module.css';

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

const quickActions = [
  { icon: '➕', iconClass: 'quick-action-icon--info', label: 'Add User', path: '/admin/users' },
  { icon: '🚗', iconClass: 'quick-action-icon--success', label: 'Add Vehicle', path: '/admin/vehicles' },
  { icon: '📊', iconClass: 'quick-action-icon--warning', label: 'Reports', path: '/admin/analytics' },
  { icon: '⚙️', iconClass: 'quick-action-icon--secondary', label: 'Settings', path: '/admin/settings' }
];

const EMPTY_WEEKLY = { days: [], entries: 0, exits: 0, onCampus: 0 };
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/* ------------------------------------------------------------------ */
/*  Skeleton helpers                                                   */
/* ------------------------------------------------------------------ */
function SkeletonLine({ width = '60%', height = '1.25rem' }) {
  return <div className={styles.skeleton} style={{ height, width }} />;
}

function SkeletonBlock({ width = '80%', height = '3rem' }) {
  return <div className={styles.skeleton} style={{ height, width }} />;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function AdminDashboard() {
  const { user } = useAuth();
  const { anonymizeName, anonymizePlate, isConfidentialMode } = usePrivacy();

  const anonymizeActivityText = (text) => {
    return text;
  };

  const [data, setData] = useState({
    stats: {
      users: { total: 0, students: 0, faculty: 0, staff: 0, security: 0 },
      vehicles: { total: 0, on_campus: 0, entered_main: 0, exited_main: 0, entered_back: 0, exited_back: 0 }
    },
    recentUsers: [],
    recentVehicles: [],
    recentActivity: [],
    cameras: [],
    alerts: [],
    weekly: EMPTY_WEEKLY
  });
  const [loading, setLoading] = useState(true);
  const [resolvingIds, setResolvingIds] = useState(new Set());
  const [resolveErrors, setResolveErrors] = useState({});

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/admin/dashboard/summary');
        const raw = res.data;
        setData({
          stats: raw.stats ?? data.stats,
          recentUsers: raw.recentUsers ?? [],
          recentVehicles: raw.recentVehicles ?? [],
          recentActivity: raw.recentActivity ?? [],
          cameras: raw.cameras ?? [],
          alerts: raw.alerts ?? [],
          weekly: raw.weekly ?? EMPTY_WEEKLY
        });
      } catch (e) {
        console.error('Dashboard fetch error', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- Alert resolve handler ---- */
  const handleResolve = useCallback(async (alertId) => {
    setResolvingIds(prev => new Set(prev).add(alertId));
    setResolveErrors(prev => { const n = { ...prev }; delete n[alertId]; return n; });

    try {
      await api.patch(`/admin/alerts/${alertId}/resolve`);
      setData(prev => ({
        ...prev,
        alerts: prev.alerts.filter(a => a.id !== alertId)
      }));
    } catch (e) {
      setResolveErrors(prev => ({
        ...prev,
        [alertId]: e.response?.data?.detail || 'Failed'
      }));
    } finally {
      setResolvingIds(prev => {
        const n = new Set(prev);
        n.delete(alertId);
        return n;
      });
    }
  }, []);

  /* ---- Derived values ---- */
  const cameras = data.cameras;
  const onlineCameras = cameras.filter(c => c.status === 'online').length;
  const totalCameras = cameras.length;
  const allOnline = totalCameras > 0 && onlineCameras === totalCameras;
  const systemStatus = allOnline ? 'Operational' : 'Degraded';

  const alerts = data.alerts;
  const criticalCount = alerts.filter(a => a.type === 'critical').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;

  const weekly = data.weekly;
  const weeklyDays = weekly.days ?? [];
  const maxDay = weeklyDays.length > 0 ? Math.max(...weeklyDays, 1) : 1;

  const { users: userStats, vehicles: vehicleStats } = data.stats;

  return (
    <>
      {/* ===== HEADER ===== */}
      <div className="premium-page-header">
        <div>
          <h1>Command <span>Management</span> 🛡️</h1>
          <p className={styles.headerStatus} style={{ marginTop: '4px' }}>
            System status:{' '}
            <span
              className={allOnline ? styles.statusDotOnline : styles.statusDotDegraded}
              style={{ display: 'inline-block', width: '0.5rem', height: '0.5rem', borderRadius: '50%', marginRight: '0.25rem', verticalAlign: 'middle' }}
            />
            <strong style={{ color: allOnline ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {loading ? '...' : systemStatus}
            </strong>
            {allOnline && !loading && ' • All campus nodes are synchronized.'}
            {!allOnline && !loading && ` • ${totalCameras - onlineCameras} node(s) offline.`}
          </p>
        </div>
        <div className={styles.dateBadge}>
          <span className="material-symbols-rounded" style={{ color: 'var(--color-primary)' }}>calendar_today</span>
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* ===== STAT CARDS ROW ===== */}
      <section className={styles.statCardsRow}>
        {/* -- Total Residents -- */}
        <div className={styles.metricCard}>
          {loading ? (
            <>
              <SkeletonLine width="50%" height="0.75rem" />
              <div style={{ marginTop: '0.75rem' }}><SkeletonBlock width="40%" height="2.5rem" /></div>
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.25rem' }}>
                <SkeletonLine width="3rem" height="1rem" />
                <SkeletonLine width="3rem" height="1rem" />
              </div>
            </>
          ) : (
            <>
              <div className={styles.metricCardHeader}>
                <span className={styles.metricCardLabel}>Total Residents</span>
                <span className={styles.badgeUpdated} role="status" aria-live="polite">Updated</span>
              </div>
              <div className={styles.metricCardValue}>{userStats.total}</div>
              <div className={styles.rolePills}>
                <span className={styles.rolePill}>
                  <span className={styles.rolePillDot} style={{ background: 'var(--role-student)' }} />
                  Student {userStats.students}
                </span>
                <span className={styles.rolePill}>
                  <span className={styles.rolePillDot} style={{ background: 'var(--role-faculty)' }} />
                  Faculty {userStats.faculty}
                </span>
                <span className={styles.rolePill}>
                  <span className={styles.rolePillDot} style={{ background: 'var(--role-staff)' }} />
                  Staff {userStats.staff}
                </span>
                <span className={styles.rolePill}>
                  <span className={styles.rolePillDot} style={{ background: 'var(--role-security)' }} />
                  Security {userStats.security}
                </span>
              </div>
            </>
          )}
        </div>

        {/* -- On Campus Now -- */}
        <div className={styles.metricCard}>
          {loading ? (
            <>
              <SkeletonLine width="50%" height="0.75rem" />
              <div style={{ marginTop: '0.75rem' }}><SkeletonBlock width="40%" height="2.5rem" /></div>
              <div style={{ marginTop: '0.5rem' }}><SkeletonLine width="80%" height="0.75rem" /></div>
            </>
          ) : (
            <>
              <div className={styles.metricCardHeader}>
                <span className={styles.metricCardLabel}>On Campus Now</span>
                <span className={styles.badgeUpdated} role="status" aria-live="polite">Updated</span>
              </div>
              <div className={styles.metricCardValue}>{vehicleStats.on_campus}</div>
              <div className={styles.metricCardSub}>
                Main gate {vehicleStats.entered_main} in / {vehicleStats.exited_main} out
                {' · '}
                Back gate {vehicleStats.entered_back} in / {vehicleStats.exited_back} out
              </div>
            </>
          )}
        </div>

        {/* -- Camera Nodes -- */}
        <div className={styles.metricCard}>
          {loading ? (
            <>
              <SkeletonLine width="50%" height="0.75rem" />
              <div style={{ marginTop: '0.75rem' }}><SkeletonBlock width="50%" height="2.5rem" /></div>
              <div style={{ marginTop: '0.5rem' }}><SkeletonLine width="65%" height="0.75rem" /></div>
            </>
          ) : (
            <>
              <div className={styles.metricCardHeader}>
                <span className={styles.metricCardLabel}>Camera Nodes</span>
                <span
                  className={allOnline ? styles.badgeOnline : styles.badgeDanger}
                  role="status"
                  aria-live="polite"
                >
                  {onlineCameras} / {totalCameras} online
                </span>
              </div>
              <div className={styles.metricCardValue}>{onlineCameras} / {totalCameras}</div>
              <div className={styles.metricCardSub} style={{ color: allOnline ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {allOnline ? 'All nodes online' : `${totalCameras - onlineCameras} offline`}
              </div>
            </>
          )}
        </div>

        {/* -- Unresolved Alerts -- */}
        <div className={styles.metricCard}>
          {loading ? (
            <>
              <SkeletonLine width="50%" height="0.75rem" />
              <div style={{ marginTop: '0.75rem' }}><SkeletonBlock width="30%" height="2.5rem" /></div>
              <div style={{ marginTop: '0.5rem' }}><SkeletonLine width="70%" height="0.75rem" /></div>
            </>
          ) : (
            <>
              <div className={styles.metricCardHeader}>
                <span className={styles.metricCardLabel}>Unresolved Alerts</span>
                {alerts.length > 0 ? (
                  <span className={styles.badgeDanger} role="status" aria-live="polite">
                    {alerts.length} unresolved
                  </span>
                ) : (
                  <span className={styles.badgeOnline} role="status" aria-live="polite">
                    All clear
                  </span>
                )}
              </div>
              <div className={styles.metricCardValue}>{alerts.length}</div>
              <div className={styles.metricCardSub}>
                {criticalCount > 0 && <>{criticalCount} critical</>}
                {criticalCount > 0 && warningCount > 0 && ' · '}
                {warningCount > 0 && <>{warningCount} warnings</>}
                {alerts.length === 0 && 'No active alerts'}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ===== CAMERA STATUS & ALERTS ===== */}
      <div className={styles.widgetGrid}>
        <DashboardWidget
          title="Camera Status"
          icon="📹"
          actionText="Manage"
          actionLink="/admin/cameras"
        >
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.5rem', padding: '1rem' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={styles.skeleton} style={{ height: '4.5rem', borderRadius: 'var(--border-radius-md)' }} />
              ))}
            </div>
          ) : cameras.length === 0 ? (
            <div className={styles.noData}>No cameras configured</div>
          ) : (
            <div className={styles.cameraNodeGrid} style={{ padding: '1rem' }}>
              {cameras.map((cam, i) => (
                <CameraTile key={i} name={cam.name} status={cam.status} gate={cam.gate} />
              ))}
            </div>
          )}
        </DashboardWidget>

        <DashboardWidget
          title="Critical Alerts"
          icon="🚨"
          actionText="View All"
          actionLink="/admin/logs"
        >
          {loading ? (
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div className={styles.skeleton} style={{ width: '2rem', height: '2rem', borderRadius: '50%' }} />
                  <div style={{ flex: 1 }}>
                    <SkeletonLine width="70%" height="0.8rem" />
                    <div style={{ marginTop: '0.25rem' }}><SkeletonLine width="50%" height="0.6rem" /></div>
                  </div>
                </div>
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className={styles.noData}>No unresolved alerts — system clear ✓</div>
          ) : (
            <div style={{ padding: '0 1rem' }}>
              {alerts.map(alert => {
                const isCritical = alert.type === 'critical';
                const isResolving = resolvingIds.has(alert.id);
                return (
                  <div key={alert.id} className={styles.alertItem}>
                    <div className={`${styles.alertIconBox} ${isCritical ? styles.alertIconCritical : styles.alertIconWarning}`}>
                      <span className="material-symbols-rounded" style={{ fontSize: '1rem' }}>
                        {isCritical ? 'close' : 'warning'}
                      </span>
                    </div>
                    <div className={styles.alertContent}>
                      <div className={styles.alertTitle}>{anonymizeActivityText(alert.title)}</div>
                      <div className={styles.alertMeta}>{anonymizeActivityText(alert.meta)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <button
                        className={styles.resolveBtn}
                        disabled={isResolving}
                        aria-busy={isResolving}
                        aria-label={`Resolve alert: ${alert.title}`}
                        onClick={() => handleResolve(alert.id)}
                      >
                        {isResolving ? <span className={styles.resolveSpinner} /> : 'Resolve'}
                      </button>
                      {resolveErrors[alert.id] && (
                        <span className={styles.resolveError}>{resolveErrors[alert.id]}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DashboardWidget>
      </div>

      {/* ===== RECENT USERS & VEHICLES ===== */}
      <div className={styles.widgetGrid}>
        <DashboardWidget
          title="Recent Users"
          icon="👥"
          actionText="View All"
          actionLink="/admin/users"
          flush
        >
          {loading ? (
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div className={styles.skeleton} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%' }} />
                  <div style={{ flex: 1 }}>
                    <SkeletonLine width="60%" height="0.8rem" />
                    <div style={{ marginTop: '0.25rem' }}><SkeletonLine width="40%" height="0.6rem" /></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <MiniTable rows={data.recentUsers.map(u => ({ ...u, title: anonymizeName(u.title), name: anonymizeName(u.name) }))} />
          )}
        </DashboardWidget>

        <DashboardWidget
          title="Recent Vehicles"
          icon="🚗"
          actionText="View All"
          actionLink="/admin/vehicles"
          flush
        >
          {loading ? (
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div className={styles.skeleton} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%' }} />
                  <div style={{ flex: 1 }}>
                    <SkeletonLine width="55%" height="0.8rem" />
                    <div style={{ marginTop: '0.25rem' }}><SkeletonLine width="45%" height="0.6rem" /></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <MiniTable rows={data.recentVehicles.map(v => ({
              ...v,
              primary: anonymizePlate(v.primary),
              secondary: anonymizeName(v.secondary)
            }))} />
          )}
        </DashboardWidget>
      </div>

      {/* ===== ACTIVITY FEED & TRAFFIC ===== */}
      <div className={styles.widgetGrid}>
        <DashboardWidget
          title="This Week's Traffic"
          icon="📈"
          actionText="Full Report"
          actionLink="/admin/analytics"
        >
          {loading ? (
            <div style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} className={styles.skeleton} style={{ flex: 1, height: '3.5rem', borderRadius: 'var(--border-radius-md)' }} />
                ))}
              </div>
              <div className={styles.skeleton} style={{ width: '100%', height: '3.75rem', borderRadius: 'var(--border-radius-md)' }} />
            </div>
          ) : weeklyDays.length === 0 ? (
            <div className={styles.noData}>No traffic data available this week</div>
          ) : (
            <>
              <div className="traffic-stats-grid">
                <div className="traffic-stat-item">
                  <div className="traffic-stat-value" style={{ color: 'var(--color-success)' }}>{weekly.entries}</div>
                  <div className="traffic-stat-label">Total Entries</div>
                </div>
                <div className="traffic-stat-item">
                  <div className="traffic-stat-value" style={{ color: 'var(--color-info)' }}>{weekly.exits}</div>
                  <div className="traffic-stat-label">Total Exits</div>
                </div>
                <div className="traffic-stat-item">
                  <div className="traffic-stat-value" style={{ color: 'var(--color-warning)' }}>{weekly.onCampus}</div>
                  <div className="traffic-stat-label">Still Inside</div>
                </div>
              </div>
              <div className={styles.miniChart}>
                {weeklyDays.map((value, i) => (
                  <div
                    key={i}
                    className={`${styles.miniChartBar} ${i === weeklyDays.length - 1 ? styles.miniChartBarCurrent : ''}`}
                    style={{ height: `${(value / maxDay) * 100}%` }}
                  />
                ))}
              </div>
              <div className={styles.miniChartLabels}>
                {DAY_LABELS.slice(0, weeklyDays.length).map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
            </>
          )}
        </DashboardWidget>

        <DashboardWidget
          title="Quick Actions"
          icon="⚡"
        >
          <QuickActions actions={quickActions} />
        </DashboardWidget>
      </div>

      {/* ===== RECENT ACTIVITY ===== */}
      <div className={styles.widgetGrid}>
        <DashboardWidget
          title="Recent Activity"
          icon="📋"
          actionText="View All"
          actionLink="/admin/logs"
          flush
        >
          {loading ? (
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div className={styles.skeleton} style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%' }} />
                  <div style={{ flex: 1 }}>
                    <SkeletonLine width="80%" height="0.75rem" />
                    <div style={{ marginTop: '0.2rem' }}><SkeletonLine width="30%" height="0.6rem" /></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ActivityFeed activities={data.recentActivity.map(act => ({
              ...act,
              text: anonymizeActivityText(act.text)
            }))} />
          )}
        </DashboardWidget>
      </div>
    </>
  );
}
