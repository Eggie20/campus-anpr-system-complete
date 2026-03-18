import { useState } from 'react';
import './Users.css';

// Enhanced Mock data
const initialUsers = [
    { id: 1, name: 'Admin User', email: 'admin@csu.edu.ph', role: 'Admin', idNumber: 'ADM-001', status: 'Active', registered: 'Jan 15, 2024', last_login: 'Today 08:42 AM', vehicle_count: 2, registered_today: false, is_active: true, avatar: 'AU', roleClass: 'role-admin', badgeClass: 'badge-warning' },
    { id: 2, name: 'Dr. Maria Santos', email: 'faculty@csu.edu.ph', role: 'Faculty', idNumber: 'FAC-2024-001', status: 'Active', registered: 'Feb 1, 2024', last_login: 'Today 09:15 AM', vehicle_count: 1, registered_today: false, is_active: true, avatar: 'MS', roleClass: 'role-faculty', badgeClass: 'badge-secondary' },
    { id: 3, name: 'John Dela Cruz', email: 'student@csu.edu.ph', role: 'Student', idNumber: '2024-0001', status: 'Active', registered: 'Mar 17, 2024', last_login: 'Mar 17, 10:23 AM', vehicle_count: 1, registered_today: true, is_active: true, avatar: 'JD', roleClass: 'bg-student', badgeClass: 'badge-primary' },
    { id: 4, name: 'Pedro Garcia', email: 'guard@csu.edu.ph', role: 'Security', idNumber: 'SEC-001', status: 'Active', registered: 'Jan 20, 2024', last_login: 'Yesterday 11:30 PM', vehicle_count: 0, registered_today: false, is_active: true, avatar: 'PG', roleClass: 'bg-security', badgeClass: 'badge-success' },
    { id: 5, name: 'Anna Reyes', email: 'anna.r@csu.edu.ph', role: 'Student', idNumber: '2024-0002', status: 'Active', registered: 'Mar 12, 2024', last_login: 'Mar 16, 04:05 PM', vehicle_count: 1, registered_today: false, is_active: true, avatar: 'AR', roleClass: 'bg-student', badgeClass: 'badge-primary' },
    { id: 6, name: 'Prof. Jose Cruz', email: 'jose.c@csu.edu.ph', role: 'Faculty', idNumber: 'FAC-2024-002', status: 'Inactive', registered: 'Feb 15, 2024', last_login: 'Mar 01, 02:15 PM', vehicle_count: 1, registered_today: false, is_active: false, avatar: 'JC', roleClass: 'role-faculty', badgeClass: 'badge-secondary' },
];

export default function Users() {
    const [users, setUsers] = useState(initialUsers);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [idSearch, setIdSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [gateFilter, setGateFilter] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    // Enhanced Stats
    const stats = {
        total: { count: 156, active: 142, inactive: 14, today: 3 },
        students: { count: 120, active: 112, inactive: 8, today: 2 },
        faculty: { count: 28, active: 26, inactive: 2, today: 1 },
        staff: { count: 8, active: 8, inactive: 0, today: 0 },
        security: { count: 8, active: 8, inactive: 0, today: 0 }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesId = user.idNumber.toLowerCase().includes(idSearch.toLowerCase());
        const matchesRole = roleFilter ? user.role.toLowerCase() === roleFilter.toLowerCase() : true;
        const matchesStatus = statusFilter ? user.status.toLowerCase() === statusFilter.toLowerCase() : true;
        // Gate activity and date range filtering would typically be handled by API or complex backend query
        return matchesSearch && matchesId && matchesRole && matchesStatus;
    });

    const StatCard = ({ title, count, active, inactive, today, variant }) => (
        <div className={`stat-widget stat-widget--${variant}`}>
            <div className="stat-widget__header">
                <div className="stat-widget__label">{title}</div>
                {today > 0 && <span className="stat-badge-today">+{today} today</span>}
            </div>
            <div className="stat-widget__value">{count}</div>
            <div className="stat-card-divider"></div>
            <div className="stat-breakdown-row">
                <div className="stat-dot-label">
                    <span className="stat-dot active"></span>
                    Active
                </div>
                <div className="stat-breakdown-value active">{active}</div>
            </div>
            <div className="stat-breakdown-row">
                <div className="stat-dot-label">
                    <span className="stat-dot inactive"></span>
                    Inactive
                </div>
                <div className="stat-breakdown-value inactive">{inactive}</div>
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
                <div className="premium-header-meta">
                    <button className="premium-page-btn active" onClick={() => setShowModal(true)}>
                        <span className="material-symbols-rounded">person_add</span>
                        Add New User
                    </button>
                </div>
            </div>

            {/* Mockup-Accurate Stats Grid */}
            <div className="dashboard-grid dashboard-grid--5col mb-8">
                <StatCard title="Total registered" count={stats.total.count} active={stats.total.active} inactive={stats.total.inactive} today={stats.total.today} variant="info" />
                <StatCard title="Students" count={stats.students.count} active={stats.students.active} inactive={stats.students.inactive} today={stats.students.today} variant="student" />
                <StatCard title="Faculty" count={stats.faculty.count} active={stats.faculty.active} inactive={stats.faculty.inactive} today={stats.faculty.today} variant="faculty" />
                <StatCard title="Staff" count={stats.staff.count} active={stats.staff.active} inactive={stats.staff.inactive} today={stats.staff.today} variant="staff" />
                <StatCard title="Security" count={stats.security.count} active={stats.security.active} inactive={stats.security.inactive} today={stats.security.today} variant="security" />
            </div>

            {/* Mockup-Accurate Filter Bar */}
            <div className="filter-bar mb-8">
                <div className="filter-row">
                    <div className="filter-item filter-item--large">
                        <input
                            type="text"
                            className="premium-editable"
                            placeholder="Find by name, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-item">
                        <input
                            type="text"
                            className="premium-editable"
                            placeholder="Search by ID number"
                            value={idSearch}
                            onChange={(e) => setIdSearch(e.target.value)}
                        />
                    </div>
                    <div className="filter-item">
                        <select className="premium-editable" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                            <option value="">All roles</option>
                            <option value="admin">Admin</option>
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="security">Security</option>
                        </select>
                    </div>
                    <div className="filter-item">
                        <select className="premium-editable" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="">Status: all</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="filter-item">
                        <select className="premium-editable" value={gateFilter} onChange={(e) => setGateFilter(e.target.value)}>
                            <option value="">All gates</option>
                            <option value="main">Main Gate</option>
                            <option value="back">Back Gate</option>
                        </select>
                    </div>
                    <div className="filter-item">
                        <input 
                            type="text" 
                            className="premium-editable" 
                            placeholder="From date" 
                            onFocus={(e) => e.target.type = 'date'} 
                            onBlur={(e) => !e.target.value && (e.target.type = 'text')}
                            value={fromDate} 
                            onChange={(e) => setFromDate(e.target.value)} 
                        />
                    </div>
                    <div className="filter-item">
                        <input 
                            type="text" 
                            className="premium-editable" 
                            placeholder="To date" 
                            onFocus={(e) => e.target.type = 'date'} 
                            onBlur={(e) => !e.target.value && (e.target.type = 'text')}
                            value={toDate} 
                            onChange={(e) => setToDate(e.target.value)} 
                        />
                    </div>
                </div>

                <div className="filter-info-row">
                    <span>New filters added:</span>
                    <span className="filter-badge filter-badge--id">Search by ID</span>
                    <span className="filter-badge filter-badge--gate">Gate activity</span>
                    <span className="filter-badge filter-badge--date">Date range</span>
                </div>
            </div>

            {/* Updated User List Table */}
            <div className="premium-glass-card table-overflow admin-compact-table" style={{ padding: 0 }}>
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>IDENTIFIER</th>
                            <th>EMAIL</th>
                            <th>ROLE</th>
                            <th>ID NUMBER</th>
                            <th>STATUS</th>
                            <th>LAST LOGIN</th>
                            <th>VEHICLES</th>
                            <th style={{ textAlign: 'right' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className={`premium-avatar-section`} style={{ width: '32px', height: '32px', margin: 0 }}>
                                            <div className="premium-avatar-inner" style={{ fontSize: '0.75rem', borderWidth: '2px' }}>{user.avatar}</div>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center">
                                                <span style={{ fontWeight: 700, color: 'var(--t-1)', fontSize: '0.9rem' }}>{user.name}</span>
                                                {user.registered_today && <span className="new-tag">new</span>}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ color: 'var(--ac)' }}>{user.email}</td>
                                <td><span className={`premium-pill ${user.badgeClass}`} style={{ fontSize: '11px' }}>{user.role}</span></td>
                                <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{user.idNumber}</td>
                                <td>
                                    <span className={`premium-pill ${user.status === 'Active' ? 'success' : 'danger'}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--t-2)' }}>{user.last_login.split(' ')[0]}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--t-3)' }}>{user.last_login.split(' ').slice(1).join(' ')}</div>
                                </td>
                                <td style={{ textAlign: 'center', fontWeight: 800, fontSize: '1.1rem' }}>{user.vehicle_count}</td>
                                <td>
                                    <div className="flex justify-end gap-2">
                                        <button className="premium-page-btn icon-only" title="View Details">
                                            <span className="material-symbols-rounded">visibility</span>
                                        </button>
                                        <button className="premium-page-btn icon-only" title="Edit Record">
                                            <span className="material-symbols-rounded">edit_square</span>
                                        </button>
                                        <button className="premium-page-btn icon-only text-danger" title="Archive User">
                                            <span className="material-symbols-rounded">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination remains same structural but styled */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Showing 1-{filteredUsers.length} of {stats.total.count} users</span>
                <div className="flex gap-2">
                    <button className="premium-page-btn icon-only" disabled><span className="material-symbols-rounded">chevron_left</span></button>
                    <button className="premium-page-btn active">1</button>
                    <button className="premium-page-btn">2</button>
                    <button className="premium-page-btn icon-only"><span className="material-symbols-rounded">chevron_right</span></button>
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
        </>
    );
}
