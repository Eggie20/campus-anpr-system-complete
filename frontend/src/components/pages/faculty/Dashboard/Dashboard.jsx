import { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import api from '../../../../services/api';
import {
    DashboardWidget,
    ActivityFeed,
    QuickActions,
    VehicleCard
} from '../../../../components';

const quickActions = [
    { icon: '➕', iconClass: 'quick-action-icon--success', label: 'Add Vehicle', path: '/vehicles' },
    { icon: '📋', iconClass: 'quick-action-icon--info', label: 'View Logs', path: '/logs' },
    { icon: '👤', iconClass: 'quick-action-icon--primary', label: 'Edit Profile', path: '/profile' },
    { icon: '🔔', iconClass: 'quick-action-icon--warning', label: 'Notifications', path: '/notifications' }
];

export default function FacultyDashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [vehicles, setVehicles] = useState([]);
    const [logs, setLogs] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [stats, setStats] = useState({
        entriesThisMonth: 0,
        avgDuration: 'N/A'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vehiclesRes, logsRes, notifsRes] = await Promise.all([
                    api.get('/vehicles/me'),
                    api.get('/entry-logs/me?limit=5'),
                    api.get('/notifications/me?limit=5')
                ]);

                setVehicles(vehiclesRes.data || []);
                setLogs(logsRes.data || []);
                
                // Handle paginated notifications { items, total }
                const notifData = notifsRes.data;
                const notifItems = Array.isArray(notifData.items) ? notifData.items : (Array.isArray(notifData) ? notifData : []);
                setNotifications(notifItems);

                const entries = (logsRes.data || []).filter(l => l.direction === 'entry').length;
                setStats({
                    entriesThisMonth: entries * 4,
                    avgDuration: '5.5h'
                });

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formattedActivities = logs.slice(0, 4).map(log => ({
        type: log.direction,
        text: `<strong>${log.plate_number}</strong> ${log.direction === 'entry' ? 'entered' : 'exited'} via ${log.gate_name}`,
        time: new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }));

    const getVehicleIcon = (type) => {
        switch (type.toLowerCase()) {
            case 'motorcycle': return '🏍️';
            case 'car': return '🚗';
            case 'van': return '🚐';
            default: return '🚘';
        }
    };

    const primaryVehicle = vehicles.length > 0 ? vehicles[0] : null;

    return (
        <div className="premium-dashboard-container">
            {/* Page Header */}
            <div className="premium-page-header">
                <div>
                    <h1>Good morning, <span>{user?.first_name || 'Faculty'}</span> 👋</h1>
                    <p>Here's what's happening with your vehicles today.</p>
                </div>
                <div className="premium-header-meta">
                    <div className="premium-id-badge">ID: <strong>{user?.student_id || 'N/A'}</strong></div>
                    <div className="premium-status-active">Active</div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="premium-stats-grid">
                <div className="premium-stat-card c1">
                    <div className="premium-stat-header">
                        <span className="premium-stat-label">Registered Vehicles</span>
                        <div className="premium-stat-icon">🚗</div>
                    </div>
                    <div className="premium-stat-value">{vehicles.length}</div>
                    <div className="premium-stat-sub"><span className="neutral">Active registration</span></div>
                </div>

                <div className="premium-stat-card c2">
                    <div className="premium-stat-header">
                        <span className="premium-stat-label">Campus Entries</span>
                        <span className="premium-stat-badge-today">today</span>
                    </div>
                    <div className="premium-stat-value">{stats.entriesThisMonth || 0}</div>
                    <div className="premium-gate-breakdown">
                        <div className="gate-item">
                            <div className="gate-info">
                                <span className="gate-dot main"></span>
                                <span className="gate-name">Main gate</span>
                            </div>
                            <span className="gate-value">{Math.round((stats.entriesThisMonth || 0) * 0.6)}</span>
                        </div>
                        <div className="gate-item">
                            <div className="gate-info">
                                <span className="gate-dot back"></span>
                                <span className="gate-name">Back gate</span>
                            </div>
                            <span className="gate-value">{Math.round((stats.entriesThisMonth || 0) * 0.4)}</span>
                        </div>
                    </div>
                </div>

                <div className="premium-stat-card c3">
                    <div className="premium-stat-header">
                        <span className="premium-stat-label">Last entry</span>
                        <span className="premium-stat-badge-today">today</span>
                    </div>
                    <div className="premium-stat-value" style={{ fontSize: '1.8rem', letterSpacing: '0' }}>10:23 AM</div>
                    <div className="premium-gate-breakdown">
                        <div className="gate-item">
                            <div className="gate-info">
                                <span className="gate-dot main"></span>
                                <span className="gate-name">Main gate</span>
                            </div>
                            <span className="gate-time">10:23 AM</span>
                        </div>
                        <div className="gate-item">
                            <div className="gate-info">
                                <span className="gate-dot back"></span>
                                <span className="gate-name">Back gate</span>
                            </div>
                            <span className="gate-time">04:08 AM</span>
                        </div>
                    </div>
                </div>

                <div className="premium-stat-card c4">
                    <div className="premium-stat-header">
                        <span className="premium-stat-label">Notifications</span>
                        <div className="premium-stat-icon">🔔</div>
                    </div>
                    <div className="premium-stat-value">{notifications.filter(n => !n.is_read).length}</div>
                    <div className="premium-stat-sub"><span className="neutral">Unread messages</span></div>
                </div>
            </div>

            {/* Bottom Panels */}
            <div className="premium-dashboard-grid">
                {/* My Vehicle Panel */}
                <div className="premium-panel">
                    <div className="premium-panel-header">
                        <div className="premium-panel-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 16H9m10 0h3v-3.15a1 1 0 00-.84-.99L16 11l-2.7-3.6a1 1 0 00-.8-.4H5a2 2 0 00-2 2v7h3" /><circle cx="6.5" cy="16.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" /></svg>
                            My Vehicle
                        </div>
                        <a href="/vehicles" className="premium-panel-link">
                            Manage
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14m-7-7l7 7-7 7" /></svg>
                        </a>
                    </div>
                    <div className="premium-panel-body">
                        {primaryVehicle ? (
                            <div className="premium-vehicle-card">
                                <div className="premium-vehicle-card-top">
                                    <div className="premium-plate-icon">{getVehicleIcon(primaryVehicle.type)}</div>
                                    <div className="premium-approved-badge">{primaryVehicle.status}</div>
                                </div>
                                <div className="premium-plate-number">{primaryVehicle.plate_number}</div>
                                <div className="premium-vehicle-desc">{primaryVehicle.make} {primaryVehicle.model} • {primaryVehicle.color}</div>
                                <div className="premium-vehicle-meta">
                                    <div className="premium-meta-item">
                                        <label>Registered</label>
                                        <span>{new Date(primaryVehicle.registration_date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="premium-meta-item">
                                        <label>Expires</label>
                                        <span>Jun 30, 2027</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-8 bg-black/5 rounded-xl border border-dashed border-white/10">
                                <p className="text-muted mb-4">No vehicles registered.</p>
                                <a href="/vehicles" className="btn btn-primary btn-sm">Register Now</a>
                            </div>
                        )}
                        <a href="/vehicles" className="premium-register-tiny">
                            <div className="premium-register-tiny-info">
                                <div className="icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14m-7-7h14" /></svg>
                                </div>
                                <span>Register Another Vehicle</span>
                            </div>
                            <svg className="plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
                        </a>
                    </div>
                </div>

                {/* Recent Activity Panel */}
                <div className="premium-panel">
                    <div className="premium-panel-header">
                        <div className="premium-panel-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Recent Activity
                        </div>
                        <a href="/logs" className="premium-panel-link">
                            View All
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14m-7-7l7 7-7 7" /></svg>
                        </a>
                    </div>
                    <div className="premium-panel-body" style={{ padding: '10px 14px' }}>
                        <div className="premium-activity-list">
                            {formattedActivities.length > 0 ? (
                                formattedActivities.map((activity, idx) => (
                                    <div key={idx} className="premium-activity-item">
                                        <div className={`premium-activity-icon ${activity.type === 'entry' ? 'in' : 'out'}`}>
                                            {activity.type === 'entry' ? '🔵' : '🔴'}
                                        </div>
                                        <div className="premium-activity-info">
                                            <strong dangerouslySetInnerHTML={{ __html: activity.text }}></strong>
                                            <time>{activity.time}</time>
                                        </div>
                                        <span className={`premium-activity-chip ${activity.type === 'entry' ? 'premium-chip-in' : 'premium-chip-out'}`}>
                                            {activity.type === 'entry' ? 'Entry' : 'Exit'}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-muted">No recent activity.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
