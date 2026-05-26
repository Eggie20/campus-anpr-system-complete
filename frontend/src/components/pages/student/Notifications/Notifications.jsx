import { useState, useEffect, useMemo, useRef, useCallback } from 'react'; // Build Trigger v2

import api from '../../../../services/api';
import { useNotification } from '../../../../contexts/NotificationContext';
import { useAuth } from '../../../../contexts/AuthContext';
import './Notifications.css';

export default function Notifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 10;
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    
    const { success: showSuccess, error: showError } = useNotification();
    
    // Use refs to avoid infinite re-render from context functions in useCallback
    const showSuccessRef = useRef(showSuccess);
    const showErrorRef = useRef(showError);
    useEffect(() => { showSuccessRef.current = showSuccess; }, [showSuccess]);
    useEffect(() => { showErrorRef.current = showError; }, [showError]);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const skip = (currentPage - 1) * limit;
            const res = await api.get(`/notifications/me`, {
                params: {
                    limit,
                    skip,
                    unread_only: statusFilter === 'unread',
                    type: typeFilter !== 'all' ? typeFilter : undefined,
                    search: searchTerm || undefined
                }
            });
            const data = res.data;
            
            if (data && Array.isArray(data.items)) {
                setNotifications(data.items);
                setTotalItems(data.total || 0);
            } else {
                setNotifications([]);
                setTotalItems(0);
            }
        } catch (err) {
            console.error("Fetch error:", err);
            showErrorRef.current("Failed to load notifications.");
        } finally {
            setLoading(false);
        }
    }, [currentPage, statusFilter, typeFilter, searchTerm]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const filteredItems = useMemo(() => {
        return notifications; // Filtering now handled by backend
    }, [notifications]);

    const totalPages = Math.max(1, Math.ceil(totalItems / limit));


    const toggleReadStatus = async (notif) => {
        const newStatus = !notif.is_read;
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: newStatus } : n));
        try {
            await api.put(newStatus ? `/notifications/${notif.id}/read` : `/notifications/${notif.id}/unread`);
            showSuccessRef.current(newStatus ? "Marked as read" : "Marked as unread");
        } catch (err) {
            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: !newStatus } : n));
            showErrorRef.current("Failed to update");
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            showSuccessRef.current("All marked as read.");
        } catch (err) {
            showErrorRef.current("Failed to mark all as read.");
        }
    };

    const dismissNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        showSuccessRef.current("Dismissed.");
    };

    const getNotificationIcon = (type, title) => {
        const t = (type || '').toLowerCase();
        const tt = (title || '').toLowerCase();
        if (tt.includes('approved') || t === 'success') return { icon: 'check_circle', color: '#10b981' };
        if (tt.includes('renew') || tt.includes('expir') || t === 'warning') return { icon: 'warning', color: '#f59e0b' };
        if (tt.includes('denied') || tt.includes('reject') || t === 'danger') return { icon: 'error', color: '#ef4444' };
        return { icon: 'notifications', color: 'var(--p-accent)' };
    };

    return (
        <div className="premium-dashboard-container">
            <div className="premium-page-header">
                <div>
                    <h1>Notifications <span>Archive</span> 📂</h1>
                    <p>Manage your alerts and system messages.</p>
                </div>
                <div className="premium-header-meta">
                    <div className="premium-id-badge">Total: <strong>{totalItems}</strong></div>
                    <button className="premium-page-btn active" onClick={markAllAsRead}>
                        <span className="material-symbols-rounded">done_all</span>
                        Mark All Read
                    </button>
                </div>
            </div>

            {/* Minimalist Functional Filters (Reference Photo 2 Style) */}
            <div className="minimalist-filter-row mb-6">
                <div className="filter-field">
                    <label className="filter-label">Search Alerts</label>
                    <input 
                        type="text" 
                        className="filter-input-minimal" 
                        placeholder="Search subject..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-field">
                    <label className="filter-label">Status</label>
                    <select className="filter-input-minimal" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                        <option value="all">All Status</option>
                        <option value="unread">Unread Only</option>
                    </select>
                </div>
                <div className="filter-field">
                    <label className="filter-label">Category</label>
                    <select className="filter-input-minimal" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}>
                        <option value="all">Any Category</option>
                        <option value="info">Info</option>
                        <option value="success">Success</option>
                        <option value="warning">Warning</option>
                        <option value="danger">High Priority</option>
                    </select>
                </div>
                <div className="filter-actions-minimal">
                    <button className="btn-minimal-apply" onClick={() => { setCurrentPage(1); fetchNotifications(); }}>
                        Apply
                    </button>
                    <button className="btn-minimal-clear" onClick={() => { setSearchTerm(''); setStatusFilter('all'); setTypeFilter('all'); setCurrentPage(1); }}>
                        Clear
                    </button>
                </div>

            </div>



            <div className="premium-glass-card notifications-container">
                <div className="table-responsive">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th style={{ width: '50px' }}></th>
                                <th>Subject</th>
                                <th>Message</th>
                                <th>Category</th>
                                <th>Time</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="notif-empty-state">
                                        <div className="premium-loader" style={{ margin: '0 auto' }}></div>
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="notif-empty-state">
                                        <h3>No notifications found</h3>
                                        <p style={{ color: 'var(--t-3)' }}>Try adjusting your filters.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map(n => {
                                    const { icon, color } = getNotificationIcon(n.type, n.title);
                                    const isWarning = (n.type || '').toLowerCase() === 'warning' || (n.title || '').toLowerCase().includes('renew');
                                    return (
                                        <tr key={n.id} className={`user-row-premium ${!n.is_read ? 'unread-row' : ''}`} style={{ opacity: n.is_read ? 0.7 : 1 }}>

                                            <td>
                                                <div className="notif-icon-box" style={{ background: isWarning ? '#f59e0b20' : `${color}15`, color: isWarning ? '#f59e0b' : color, border: isWarning ? '1px solid #f59e0b30' : 'none' }}>
                                                    <span className="material-symbols-rounded" style={{ fontSize: isWarning ? '22px' : '18px' }}>{icon}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <strong style={{ color: isWarning ? '#f59e0b' : '#ffffff' }}>{n.title}</strong>
                                                {!n.is_read && <span className="new-tag-glow" style={{ marginLeft: '8px', fontSize: '0.6rem' }}>NEW</span>}
                                            </td>
                                            <td><p className="notif-message-text" style={{ color: '#ffffff' }}>{n.message}</p></td>
                                            <td><span className={`role-pill-modern ${(n.type || '').toLowerCase()}`} style={{ fontSize: '0.7rem' }}>{n.type}</span></td>
                                            <td>
                                                <div className="login-cell">
                                                    <span className="login-date" style={{ color: '#ffffff' }}>{new Date(n.created_at).toLocaleDateString()}</span>
                                                    <span className="login-time" style={{ opacity: 0.7, color: '#ffffff' }}>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div className="user-actions-group">
                                                    <button className="action-btn" onClick={() => toggleReadStatus(n)} title={n.is_read ? "Mark Unread" : "Mark Read"}>
                                                        <span className="material-symbols-rounded" style={{ color: '#ffffff' }}>{n.is_read ? 'mark_as_unread' : 'visibility'}</span>
                                                    </button>
                                                    <button className="action-btn disable" onClick={() => dismissNotification(n.id)} title="Dismiss">
                                                        <span className="material-symbols-rounded" style={{ color: '#ff4d4d' }}>close</span>
                                                    </button>
                                                </div>
                                            </td>

                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer (Reference Screenshot Style) */}
                <div className="premium-pagination">
                    <span style={{ fontSize: '0.85rem', color: 'var(--t-3)' }}>
                        Showing <strong>{((currentPage - 1) * limit) + 1}</strong> to <strong>{Math.min(currentPage * limit, totalItems)}</strong> of <strong>{totalItems}</strong> records
                    </span>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            className="premium-page-btn"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>chevron_left</span>
                            Previous
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', fontSize: '0.9rem', color: '#ffffff', fontWeight: '600' }}>
                            {currentPage} / {totalPages || 1}
                        </div>
                        <button
                            className="premium-page-btn"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage >= totalPages}
                        >
                            Next
                            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>chevron_right</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
