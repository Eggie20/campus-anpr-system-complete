import { useState, useEffect } from 'react';
import api from '../../../../services/api';
import ReportGeneratorModal from '../../../widgets/ReportGenerator/ReportGeneratorModal';
import { usePrivacy } from '../../../../contexts/PrivacyContext';
import './Users.css';

export default function Users() {
    const { anonymizeName, anonymizeEmail, anonymizePhone, anonymizeId, anonymizePlate, isConfidentialMode } = usePrivacy();
    const [users, setUsers] = useState([]);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        total: { count: 0, active: 0, inactive: 0, today: 0 },
        students: { count: 0, active: 0, inactive: 0, today: 0 },
        faculty: { count: 0, active: 0, inactive: 0, today: 0 },
        staff: { count: 0, active: 0, inactive: 0, today: 0 },
        security: { count: 0, active: 0, inactive: 0, today: 0 }
    });
    
    const [showModal, setShowModal] = useState(false);
    const [showDisableModal, setShowDisableModal] = useState(false);
    const [disableTarget, setDisableTarget] = useState(null);
    const [isToggling, setIsToggling] = useState(false);
    const [viewUser, setViewUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [idSearch, setIdSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [gateFilter, setGateFilter] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [showConfidential, setShowConfidential] = useState(false);
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const params = new URLSearchParams();
                if (roleFilter) params.append('role', roleFilter);
                if (statusFilter) params.append('status', statusFilter);

                const response = await api.get(`/admin/users?${params.toString()}`);
                setUsers(response.data.users);
                if (response.data.stats) {
                    setStats(response.data.stats);
                }
            } catch (err) {
                console.error("Error fetching users:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [roleFilter, statusFilter]);

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesId = user.idNumber.toLowerCase().includes(idSearch.toLowerCase());
        const matchesRole = roleFilter ? user.role.toLowerCase() === roleFilter.toLowerCase() : true;
        const matchesStatus = statusFilter ? user.status.toLowerCase() === statusFilter.toLowerCase() : true;
        // Gate activity and date range filtering would typically be handled by API or complex backend query
        return matchesSearch && matchesId && matchesRole && matchesStatus;
    });

    const displayedUsers = filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const handlePrev = () => {
        if (page > 1) setPage(p => p - 1);
    };

    const handleNext = () => {
        if (page < Math.ceil(filteredUsers.length / itemsPerPage)) setPage(p => p + 1);
    };

    const getPageNumbers = () => {
        const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
        const maxPagesToShow = 5;
        let start = Math.max(1, page - Math.floor(maxPagesToShow / 2));
        let end = start + maxPagesToShow - 1;

        if (end > totalPages) {
            end = totalPages;
            start = Math.max(1, end - maxPagesToShow + 1);
        }

        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    const handleDisableClick = (user) => {
        setDisableTarget(user);
        setShowDisableModal(true);
    };

    const handleConfirmToggle = async () => {
        if (!disableTarget) return;
        setIsToggling(true);
        try {
            const response = await api.patch(`/admin/users/${disableTarget.id}/toggle-status`);
            if (response.data.status === 'success') {
                // Update the user in our local state
                setUsers(prev => prev.map(u =>
                    u.id === disableTarget.id ? response.data.user : u
                ));
            }
        } catch (err) {
            console.error("Error toggling user status:", err);
            alert(err.response?.data?.detail || "Failed to update user status");
        } finally {
            setIsToggling(false);
            setShowDisableModal(false);
            setDisableTarget(null);
        }
    };

    const StatCard = ({ title, count, icon, active, inactive, today, badgeVariant = 'info' }) => (
        <div className="user-metric-card">
            <div className={`user-stat-badge user-stat-badge--${badgeVariant}`}>
                {today > 0 ? `+${today} today` : 'Synced'}
            </div>
            <div className="user-metric-card__label">{title}</div>
            <div className="user-metric-card__value">{count}</div>
            <div className="user-metric-card__footer">
                <div className="user-metric-card__sub-row">
                    <span>Active Users</span>
                    <span className="val success">{active}</span>
                </div>
                <div className="user-metric-card__sub-row">
                    <span>Inactive</span>
                    <span className="val danger">{inactive}</span>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Page Header */}
            <div className="premium-page-header">
                <div>
                    <h1>User <span>Management</span> 👥</h1>
                    <p>Review and manage campus residents, faculty, and security staff.</p>
                </div>

            </div>

            {/* Intelligent Stats Grid */}
            <div className="users-stats-grid mb-8">
                <StatCard 
                    title="Total Registered" 
                    count={stats.total.count} 
                    active={stats.total.active} 
                    inactive={stats.total.inactive} 
                    today={stats.total.today} 
                    variant="info" 
                    icon="group"
                />
                <StatCard 
                    title="Students" 
                    count={stats.students.count} 
                    active={stats.students.active} 
                    inactive={stats.students.inactive} 
                    today={stats.students.today} 
                    variant="student" 
                    icon="school"
                />
                <StatCard 
                    title="Faculty" 
                    count={stats.faculty.count} 
                    active={stats.faculty.active} 
                    inactive={stats.faculty.inactive} 
                    today={stats.faculty.today} 
                    variant="faculty" 
                    icon="workspace_premium"
                />
                <StatCard 
                    title="Staff" 
                    count={stats.staff.count} 
                    active={stats.staff.active} 
                    inactive={stats.staff.inactive} 
                    today={stats.staff.today} 
                    variant="staff" 
                    icon="badge"
                />
                <StatCard 
                    title="Security" 
                    count={stats.security.count} 
                    active={stats.security.active} 
                    inactive={stats.security.inactive} 
                    today={stats.security.today} 
                    variant="security" 
                    icon="shield_person"
                />
            </div>

            {/* Premium Multi-Tier Filter Engine */}
            <div className="premium-filter-container mb-8">
                <div className="filter-header-row">
                    <div className="search-group">
                        <span className="material-symbols-rounded search-icon">search</span>
                        <input
                            type="text"
                            className="premium-search-input"
                            placeholder="Search users, identifiers, or status..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="search-shortcut">
                            <span className="key">⌘</span>
                            <span className="key">K</span>
                        </div>
                    </div>
                    <div className="action-group">
                        <button className="premium-page-btn active" onClick={() => setIsReportModalOpen(true)}>
                            <span className="material-symbols-rounded">summarize</span>
                            Generate Report
                        </button>
                    </div>
                </div>

                <div className="filter-options-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'flex-start' }}>
                    <div className="filter-select-group">
                        <label>
                            <span className="material-symbols-rounded" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '4px' }}>badge</span>
                            Institutional Role
                        </label>
                        <select className="premium-select" style={{ maxWidth: '170px' }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                            <option value="">All Roles</option>
                            <option value="admin">Administrator</option>
                            <option value="student">Student</option>
                            <option value="faculty">Faculty Member</option>
                            <option value="staff">Campus Staff</option>
                            <option value="security">Security Force</option>
                        </select>
                    </div>

                    <div className="filter-select-group">
                        <label>
                            <span className="material-symbols-rounded" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '4px' }}>verified_user</span>
                            Account Status
                        </label>
                        <select className="premium-select" style={{ maxWidth: '170px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="">All Statuses</option>
                            <option value="active">Active Users</option>
                            <option value="inactive">Suspended/Inactive</option>
                        </select>
                    </div>

                    <div className="filter-select-group">
                        <label>
                            <span className="material-symbols-rounded" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '4px' }}>gate</span>
                            Campus Entry Point
                        </label>
                        <select className="premium-select" style={{ maxWidth: '170px' }} value={gateFilter} onChange={(e) => setGateFilter(e.target.value)}>
                            <option value="">Any Gate History</option>
                            <option value="main">Main Gate Activity</option>
                            <option value="back">Back Gate Activity</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>calendar_month</span>
                            Registration Window
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '0.3rem 0.75rem', borderRadius: '12px', border: '1px solid var(--border-color)', height: '44px', width: 'fit-content' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.55rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '1px' }}>Start</span>
                                <input 
                                    type="date" 
                                    style={{ backgroundColor: 'transparent', border: 'none', color: '#e5e7eb', outline: 'none', fontSize: '0.75rem', fontFamily: 'inherit', padding: 0 }}
                                    value={fromDate} 
                                    onChange={(e) => setFromDate(e.target.value)} 
                                />
                            </div>
                            <span style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 700, margin: '0 2px' }}>-</span>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.55rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '1px' }}>End</span>
                                <input 
                                    type="date" 
                                    style={{ backgroundColor: 'transparent', border: 'none', color: '#e5e7eb', outline: 'none', fontSize: '0.75rem', fontFamily: 'inherit', padding: 0 }}
                                    value={toDate} 
                                    onChange={(e) => setToDate(e.target.value)} 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="active-filters-row">
                    <div className="filter-summary">
                        <span className="label">Active Intelligence:</span>
                        {searchTerm && <span className="active-pill">Name/Email: {searchTerm}</span>}
                        {idSearch && <span className="active-pill">ID: {idSearch}</span>}
                        {roleFilter && <span className="active-pill">Role: {roleFilter}</span>}
                        {statusFilter && <span className="active-pill">Status: {statusFilter}</span>}
                    </div>
                    <button className="clear-filters-btn" onClick={() => {
                        setSearchTerm(''); setIdSearch(''); setRoleFilter(''); setStatusFilter(''); setGateFilter(''); setFromDate(''); setToDate('');
                    }}>
                        Clear Intelligence
                    </button>
                </div>
            </div>

            {/* Updated User List Table */}
            <div className="premium-glass-card table-overflow admin-compact-table" style={{ padding: 0 }}>
                <table className="premium-table" style={{ minWidth: '760px' }}>
                    <thead>
                        <tr>
                            <th style={{ minWidth: '160px' }}>USER</th>
                            <th style={{ minWidth: '180px' }}>EMAIL</th>
                            <th style={{ width: '90px' }}>ROLE</th>
                            <th style={{ width: '110px' }}>ID NUMBER</th>
                            <th style={{ width: '90px' }}>STATUS</th>
                            <th style={{ width: '100px' }}>LAST LOGIN</th>
                            <th style={{ width: '80px', textAlign: 'center' }}>VEHICLES</th>
                            <th style={{ width: '110px', textAlign: 'right' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            displayedUsers.map(user => (
                                <tr key={user.id} className="user-row-premium">
                                    <td>
                                        <div className="user-identity-cell">
                                            <div className={`user-avatar-premium ${user.status === 'Active' ? 'pulse-active' : ''}`}>
                                                <div className="avatar-gradient">{user.avatar}</div>
                                                {user.status === 'Active' && <span className="status-indicator"></span>}
                                            </div>
                                            <div className="user-name-group">
                                                <div className="user-primary-name">
                                                    {anonymizeName(user.name)}
                                                    {user.role === 'Admin' && <span className="admin-badge">Admin</span>}
                                                </div>
                                                <div className="user-secondary-id">UID: {user.id.substring(0, 8)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="email-cell" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span className="email-text" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{anonymizeEmail(user.email)}</span>
                                            <button className="copy-btn" onClick={() => navigator.clipboard.writeText(anonymizeEmail(user.email))} style={{ background: 'transparent', border: 'none', padding: '4px', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                                                <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>content_copy</span>
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`role-badge role-${user.role.toLowerCase()}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="id-number-cell">{anonymizeId(user.idNumber)}</span>
                                    </td>
                                    <td>
                                        <div className="status-cell-premium">
                                            <span className={`status-dot-premium ${user.status.toLowerCase()}`}></span>
                                            <span className={`status-text-premium ${user.status.toLowerCase()}`}>
                                                {user.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="login-cell">
                                            <div className="login-date">{user.lastLoginDate}</div>
                                            <div className="login-time">{user.lastLoginTime}</div>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div className="vehicle-count-badge">
                                            <span className="material-symbols-rounded">directions_car</span>
                                            {user.vehicleCount}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="action-group-premium">
                                            <button className="action-btn view" title="View User" onClick={() => setViewUser(user)}>
                                                <span className="material-symbols-rounded">analytics</span>
                                            </button>
                                            <button
                                                className={`action-btn toggle ${user.status === 'Active' ? 'disable' : 'enable'}`}
                                                title={user.status === 'Active' ? 'Disable User' : 'Enable User'}
                                                onClick={() => handleDisableClick(user)}
                                            >
                                                <span className="material-symbols-rounded">
                                                    {user.status === 'Active' ? 'lock_open' : 'lock'}
                                                </span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8">
                                    <div className="no-data-cell">
                                        <div className="no-data-content">
                                            <span className="material-symbols-rounded">person_search</span>
                                            <p>No residents match your search criteria</p>
                                            <button className="clear-filters-link" onClick={() => {
                                                setSearchTerm(''); setIdSearch(''); setRoleFilter(''); setStatusFilter(''); setGateFilter(''); setFromDate(''); setToDate('');
                                            }}>
                                                Reset Intelligence
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* High-Density Pagination Area */}
            <div className="premium-pagination">
                <div className="pagination-info">
                    {filteredUsers.length > 0 ? (
                        <>Showing <span>{(page - 1) * itemsPerPage + 1}-{Math.min(page * itemsPerPage, filteredUsers.length)}</span> of <span>{filteredUsers.length}</span> residents</>
                    ) : (
                        <span>No residents found</span>
                    )}
                </div>
                
                <div className="pagination-controls">
                    <div className="limit-selector">
                        <span className="limit-label">Show:</span>
                        <select 
                            className="premium-select-compact"
                            value={itemsPerPage}
                            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setPage(1); }}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>

                    <div className="page-btns">
                        <button 
                            className="premium-page-btn icon-only" 
                            onClick={handlePrev}
                            disabled={page === 1}
                        >
                            <span className="material-symbols-rounded">chevron_left</span>
                        </button>
                        
                        <div className="page-indicators">
                            {getPageNumbers().map(pageNum => (
                                <button 
                                    key={pageNum}
                                    className={`page-indicator ${pageNum === page ? 'active' : ''}`}
                                    onClick={() => setPage(pageNum)}
                                >
                                    {pageNum}
                                </button>
                            ))}
                        </div>

                        <button 
                            className="premium-page-btn icon-only" 
                            onClick={handleNext}
                            disabled={page === Math.ceil(filteredUsers.length / itemsPerPage)}
                        >
                            <span className="material-symbols-rounded">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Add User Modal Placeholder */}
            {showModal && (
                <div className="modal-backdrop active" onClick={() => setShowModal(false)}>
                    <div className="modal premium-glass-card" onClick={e => e.stopPropagation()} style={{ border: 'none', maxWidth: '500px' }}>
                        <header className="modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="premium-noti-icon-box premium-pill active" style={{ width: '40px', height: '40px' }}>
                                    <span className="material-symbols-rounded">person_add</span>
                                </div>
                                <h2 className="modal-title">Provision New User</h2>
                            </div>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </header>
                        <div className="modal-body" style={{ padding: '1.5rem 0' }}>
                            <form id="addUserForm" onSubmit={(e) => { e.preventDefault(); setShowModal(false); }} style={{ display: 'grid', gap: '1.25rem' }}>
                                <div className="form-group mb-0">
                                    <label className="form-label">Legal Full Name</label>
                                    <input type="text" className="form-input premium-editable" placeholder="Full name for record" required />
                                </div>
                                <div className="form-group mb-0">
                                    <label className="form-label">Campus Email</label>
                                    <input type="email" className="form-input premium-editable" placeholder="email@csu.edu.ph" required />
                                </div>
                                <div className="premium-credential-grid" style={{ marginBottom: 0 }}>
                                    <div className="form-group mb-0">
                                        <label className="form-label">Institutional Role</label>
                                        <select className="form-select premium-editable" required>
                                            <option value="">Select role</option>
                                            <option value="student">Student</option>
                                            <option value="faculty">Faculty</option>
                                            <option value="staff">Staff</option>
                                            <option value="security">Security</option>
                                        </select>
                                    </div>
                                    <div className="form-group mb-0">
                                        <label className="form-label">Assigned ID No.</label>
                                        <input type="text" className="form-input premium-editable" placeholder="2024-XXXX" />
                                    </div>
                                </div>
                            </form>
                        </div>
                        <footer className="modal-footer" style={{ borderTop: 'none', padding: '1rem 0 0' }}>
                            <button className="premium-page-btn" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                            <button className="premium-page-btn active" type="submit" form="addUserForm" style={{ flex: 1 }}>Provision Account</button>
                        </footer>
                    </div>
                </div>
            )}

            {/* Disable/Enable Confirmation Modal */}
            {showDisableModal && disableTarget && (
                <div className="modal-backdrop active" onClick={() => { setShowDisableModal(false); setDisableTarget(null); }}>
                    <div className="modal premium-glass-card confirm-modal" onClick={e => e.stopPropagation()} style={{ border: 'none', maxWidth: '440px' }}>
                        <div className="confirm-modal__icon-wrapper">
                            <div className={`confirm-modal__icon ${disableTarget.status === 'Active' ? 'confirm-modal__icon--danger' : 'confirm-modal__icon--success'}`}>
                                <span className="material-symbols-rounded">
                                    {disableTarget.status === 'Active' ? 'person_off' : 'person_check'}
                                </span>
                            </div>
                        </div>
                        <h2 className="confirm-modal__title">Are you sure?</h2>
                        <p className="confirm-modal__desc">
                            {disableTarget.status === 'Active'
                                ? <>You are about to <strong>disable</strong> the account for <strong>{anonymizeName(disableTarget.name)}</strong>. This person will lose access to the system and their vehicles will not be recognized by the ANPR.</>
                                : <>You are about to <strong>re-enable</strong> the account for <strong>{anonymizeName(disableTarget.name)}</strong>. This person will regain access to the system.</>
                            }
                        </p>
                        <div className="confirm-modal__user-card">
                            <div className="premium-avatar-section" style={{ width: '36px', height: '36px', margin: 0 }}>
                                <div className="premium-avatar-inner" style={{ fontSize: '0.8rem', borderWidth: '2px' }}>{disableTarget.avatar}</div>
                            </div>
                            <div className="confirm-modal__user-info">
                                <span className="confirm-modal__user-name">{anonymizeName(disableTarget.name)}</span>
                                <span className="confirm-modal__user-email">{anonymizeEmail(disableTarget.email)}</span>
                            </div>
                            <span className={`premium-pill ${disableTarget.status === 'Active' ? 'success' : 'danger'}`} style={{ fontSize: '11px' }}>
                                {disableTarget.status}
                            </span>
                        </div>
                        <div className="confirm-modal__actions">
                            <button
                                className="premium-page-btn"
                                onClick={() => { setShowDisableModal(false); setDisableTarget(null); }}
                                disabled={isToggling}
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button
                                className={`premium-page-btn ${disableTarget.status === 'Active' ? 'btn-confirm-danger' : 'btn-confirm-success'}`}
                                onClick={handleConfirmToggle}
                                disabled={isToggling}
                                style={{ flex: 1 }}
                            >
                                {isToggling
                                    ? <span className="material-symbols-rounded spin-icon">progress_activity</span>
                                    : disableTarget.status === 'Active' ? 'Yes, Disable' : 'Yes, Enable'
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Forensic User Dossier Modal */}
            {viewUser && (
                <div className="modal-backdrop active" onClick={() => setViewUser(null)}>
                    <div className="modal forensic-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <header className="modal-header">
                            <div className="modal-header-content">
                                <h2 className="modal-title">Resident Dossier</h2>
                                <span className="modal-subtitle">Biometric & Institutional Intelligence</span>
                            </div>
                            <div className="modal-actions">
                                {!isConfidentialMode && (
                                    <button 
                                        className={`confidential-toggle ${showConfidential ? 'active' : ''}`}
                                        onClick={() => setShowConfidential(!showConfidential)}
                                        title={showConfidential ? "Mask Sensitive Data" : "Reveal Sensitive Data"}
                                    >
                                        <span className="material-symbols-rounded">
                                            {showConfidential ? 'visibility' : 'visibility_off'}
                                        </span>
                                    </button>
                                )}
                                <button className="modal-close" onClick={() => setViewUser(null)}>&times;</button>
                            </div>
                        </header>

                        <div className="modal-body forensic-body">
                            <div className="forensic-identity-card">
                                <div className="user-dossier-profile">
                                    <div className={`user-avatar-premium large ${viewUser.status === 'Active' ? 'pulse-active' : ''}`}>
                                        <div className="avatar-gradient">{viewUser.avatar}</div>
                                    </div>
                                    <div className="user-dossier-main">
                                        <h3>{anonymizeName(viewUser.name)}</h3>
                                        <div className="user-dossier-meta">
                                            <span className={`role-pill-modern ${viewUser.role?.toLowerCase()}`}>{viewUser.role}</span>
                                            <span className={`status-pill-modern ${viewUser.status === 'Active' ? 'active' : 'inactive'}`}>{viewUser.status}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="user-dossier-stats">
                                    <div className="dossier-stat">
                                        <span className="val">{viewUser.vehicle_count || 0}</span>
                                        <span className="lbl">Vehicles</span>
                                    </div>
                                    <div className="dossier-stat">
                                        <span className="val">12</span>
                                        <span className="lbl">Entries</span>
                                    </div>
                                </div>
                            </div>

                            <div className="forensic-grid">
                                <div className="forensic-section">
                                    <h4><span className="material-symbols-rounded">person</span> Personal Data</h4>
                                    <div className="forensic-data-grid">
                                        <div className="forensic-item">
                                            <label>Full Name</label>
                                            <div className="val">{anonymizeName(viewUser.name)}</div>
                                        </div>
                                        <div className="forensic-item">
                                            <label>Email Address</label>
                                            <div className={`val accent ${(!showConfidential || isConfidentialMode) ? 'blurred' : ''}`}>{anonymizeEmail(viewUser.email)}</div>
                                        </div>
                                        <div className="forensic-item">
                                            <label>Birth Date</label>
                                            <div className={`val ${(!showConfidential || isConfidentialMode) ? 'blurred' : ''}`}>{isConfidentialMode ? '****-**-**' : (viewUser.birth_date || '—')}</div>
                                        </div>
                                        <div className="forensic-item">
                                            <label>Phone Number</label>
                                            <div className={`val ${(!showConfidential || isConfidentialMode) ? 'blurred' : ''}`}>{anonymizePhone(viewUser.phone) || '—'}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="forensic-section">
                                    <h4><span className="material-symbols-rounded">account_balance</span> Institutional Intelligence</h4>
                                    <div className="forensic-data-grid">
                                        <div className="forensic-item">
                                            <label>Institutional ID</label>
                                            <div className={`val mono ${(!showConfidential || isConfidentialMode) ? 'blurred' : ''}`}>{anonymizeId(viewUser.idNumber) || '—'}</div>
                                        </div>
                                        <div className="forensic-item">
                                            <label>Department</label>
                                            <div className="val">{viewUser.department || '—'}</div>
                                        </div>
                                        {viewUser.role === 'Student' && (
                                            <>
                                                <div className="forensic-item">
                                                    <label>Academic Program</label>
                                                    <div className="val">{viewUser.program || '—'}</div>
                                                </div>
                                                <div className="forensic-item">
                                                    <label>Year / Section</label>
                                                    <div className="val">{viewUser.year_level} - {viewUser.section}</div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="forensic-section full-width mt-6">
                                <h4><span className="material-symbols-rounded">directions_car</span> Vehicle Registry</h4>
                                <div className="dossier-vehicle-list">
                                    {viewUser.vehicles && viewUser.vehicles.length > 0 ? (
                                        viewUser.vehicles.map((v, i) => (
                                            <div key={i} className="dossier-vehicle-card">
                                                <div className="vehicle-icon-box">
                                                    <span className="material-symbols-rounded">
                                                        {v.type === 'motorcycle' ? 'two_wheeler' : 'directions_car'}
                                                    </span>
                                                </div>
                                                <div className="vehicle-details">
                                                    <div className="plate">{anonymizePlate(v.plate)}</div>
                                                    <div className="desc">{v.brand} • {v.color}</div>
                                                </div>
                                                <span className={`status-badge ${v.status?.toLowerCase()}`}>{v.status}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-dossier-state">
                                            No vehicles linked to this digital identity.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <footer className="modal-footer">
                            <button className="premium-page-btn" onClick={() => setViewUser(null)} style={{ width: '100%', justifyContent: 'center' }}>
                                Close
                            </button>
                        </footer>
                    </div>
                </div>
            )}
            {/* Report Generator Modal */}
            <ReportGeneratorModal 
                isOpen={isReportModalOpen} 
                onClose={() => setIsReportModalOpen(false)} 
                data={users} 
                columns={[
                    { key: 'name', label: 'Full Name' },
                    { key: 'idNumber', label: 'ID Number' },
                    { key: 'email', label: 'Email' },
                    { key: 'role', label: 'Role' },
                    { key: 'department', label: 'Department' },
                    { key: 'status', label: 'Status' },
                    { key: 'registered', label: 'Registered' },
                    { key: 'last_login', label: 'Last Login' }
                ]}
                reportTitle="System Users Report"
            />
        </>
    );
}
