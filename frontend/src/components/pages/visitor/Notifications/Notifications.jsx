import { useState, useEffect } from 'react';
import api from '../../../../services/api';
import { useNotification } from '../../../../contexts/NotificationContext';

export default function VisitorNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const { success, error } = useNotification();

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications/me?limit=50');
            setNotifications(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.is_read;
        return n.type === filter;
    });

    const markAsRead = async (id) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, is_read: true } : n
        ));
        try {
            await api.put(`/notifications/${id}/read`);
        } catch (err) {
            console.error(err);
        }
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        try {
            await api.put('/notifications/read-all');
            success("All notifications marked as read.");
        } catch (err) {
            console.error(err);
        }
    };

    const deleteNotification = async (id) => {
        const originalValue = notifications;
        setNotifications(prev => prev.filter(n => n.id !== id));
        try {
            // Logic for deletion if API supports it
        } catch (err) {
            setNotifications(originalValue);
            error("Failed to delete notification.");
        }
    };

    const getNotificationStyle = (notification) => {
        const title = notification.title?.toLowerCase() || '';
        const type = notification.type?.toLowerCase() || 'info';

        if (title.includes('approved') || type === 'success') {
            return { icon: 'check_circle', variant: 'success' };
        } else if (title.includes('renew') || title.includes('expir') || type === 'warning') {
            return { icon: 'warning', variant: 'warning' };
        } else if (title.includes('denied') || title.includes('reject') || type === 'danger' || type === 'error') {
            return { icon: 'error', variant: 'danger' };
        } else if (title.includes('maintenance') || title.includes('system')) {
            return { icon: 'engineering', variant: 'info' };
        } else {
            return { icon: 'notifications', variant: 'primary' };
        }
    };

    const formatRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
        const dateKey = formatRelativeTime(notification.created_at);
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(notification);
        return groups;
    }, {});

    return (
        <div className="premium-dashboard-container">
            {/* Page Header */}
            <div className="premium-page-header">
                <div>
                    <h1>Visitor <span>Notifications</span> 🔔</h1>
                    <p>Stay updated with your vehicle status and campus announcements.</p>
                </div>
                <div className="premium-header-meta">
                    {unreadCount > 0 && (
                        <button className="premium-page-btn" onClick={markAllAsRead}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3"/></svg>
                            Mark All Read
                        </button>
                    )}
                    <a href="/visitor/profile" className="premium-page-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                        Settings
                    </a>
                </div>
            </div>

            {/* Filter Tabs Premium */}
            <div className="premium-glass-card mb-6" style={{ padding: '0.5rem', display: 'inline-flex', gap: '0.5rem' }}>
                <button
                    className={`premium-page-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                    style={filter === 'all' ? { background: 'var(--p-accent)', color: 'white', borderColor: 'transparent' } : {}}
                >
                    All Notifications
                </button>
                <button
                    className={`premium-page-btn ${filter === 'unread' ? 'active' : ''}`}
                    onClick={() => setFilter('unread')}
                    style={filter === 'unread' ? { background: 'var(--p-accent)', color: 'white', borderColor: 'transparent' } : {}}
                >
                    Unread
                    {unreadCount > 0 && <span className="premium-pill danger" style={{ marginLeft: '0.5rem', background: 'white', color: 'var(--p-accent)', padding: '0.1rem 0.5rem' }}>{unreadCount}</span>}
                </button>
            </div>

            {/* Notification List Premium */}
            <div className="premium-noti-list">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <div className="premium-loader"></div>
                        <p style={{ marginTop: '1rem', color: 'var(--t-3)' }}>Reviewing your inbox...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="premium-glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                        <h3 style={{ color: 'var(--t-1)', fontWeight: '700' }}>You're all caught up!</h3>
                        <p style={{ color: 'var(--t-3)' }}>No notifications to display at the moment.</p>
                    </div>
                ) : (
                    Object.entries(groupedNotifications).map(([dateLabel, groupInfos]) => (
                        <div key={dateLabel} className="mb-8">
                            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>
                                {dateLabel}
                            </div>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {groupInfos.map((notification) => {
                                    const style = getNotificationStyle(notification);
                                    return (
                                        <div
                                            key={notification.id}
                                            className={`premium-noti-card ${!notification.is_read ? 'unread' : ''}`}
                                            onClick={() => !notification.is_read && markAsRead(notification.id)}
                                        >
                                            <div className={`premium-noti-icon-box premium-pill ${style.variant}`}>
                                                <span className="material-symbols-rounded">{style.icon}</span>
                                            </div>

                                            <div className="premium-noti-content">
                                                <div className="premium-noti-header">
                                                    <h4 className="premium-noti-title">{notification.title}</h4>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <span className="premium-noti-time">
                                                            {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <button
                                                            className="premium-page-btn"
                                                            style={{ padding: '4px', border: 'none', background: 'transparent' }}
                                                            onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                                                            title="Dismiss"
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="premium-noti-body">{notification.message}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
