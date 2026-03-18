import { useState } from 'react';
import './SecurityStaff.css';

// Mock data for security staff with new performance metrics
const initialStaff = [
    {
        id: 1,
        name: 'Pedro Garcia',
        badge: 'SEC-001',
        email: 'p.garcia@campus.edu',
        phone: '+63 912 345 6789',
        shift: '6:00 AM - 2:00 PM',
        dutyStatus: 'on_duty',
        post: 'Main Gate',
        vehiclesLogged: 34,
        lastActivity: '10:41 AM',
        avatar: 'PG'
    },
    {
        id: 2,
        name: 'Juan Reyes',
        badge: 'SEC-002',
        email: 'j.reyes@campus.edu',
        phone: '+63 923 456 7890',
        shift: '6:00 AM - 2:00 PM',
        dutyStatus: 'on_duty',
        post: 'Back Gate',
        vehiclesLogged: 21,
        lastActivity: '10:23 AM',
        avatar: 'JR'
    },
    {
        id: 3,
        name: 'Mario Cruz',
        badge: 'SEC-003',
        email: 'm.cruz@campus.edu',
        phone: '+63 934 567 8901',
        shift: '2:00 PM - 10:00 PM',
        dutyStatus: 'standby',
        post: 'Roving',
        vehiclesLogged: 0,
        lastActivity: '—',
        avatar: 'MC'
    },
    {
        id: 4,
        name: 'Ricardo Santos',
        badge: 'SEC-004',
        email: 'r.santos@campus.edu',
        phone: '+63 945 678 9012',
        shift: '2:00 PM - 10:00 PM',
        dutyStatus: 'off_duty',
        post: 'Main Gate',
        vehiclesLogged: 0,
        lastActivity: 'Yesterday',
        avatar: 'RS'
    },
];

export default function SecurityStaff() {
    const [staff, setStaff] = useState(initialStaff);
    const [showModal, setShowModal] = useState(false);
    const [currentStaff, setCurrentStaff] = useState(null);

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to remove this officer?')) {
            setStaff(prev => prev.filter(s => s.id !== id));
        }
    };

    const handleEdit = (officer) => {
        setCurrentStaff(officer);
        setShowModal(true);
    };

    const handleAdd = () => {
        setCurrentStaff(null);
        setShowModal(true);
    };

    // Stats calculation
    const totalStaff = staff.length;
    const onDuty = staff.filter(s => s.dutyStatus === 'on_duty');
    const standby = staff.filter(s => s.dutyStatus === 'standby').length;
    const offDuty = staff.filter(s => s.dutyStatus === 'off_duty').length;
    
    const postCounts = {
        Main: onDuty.filter(s => s.post === 'Main Gate').length,
        Back: onDuty.filter(s => s.post === 'Back Gate').length,
        Roving: onDuty.filter(s => s.post === 'Roving').length
    };

    return (
        <div className="premium-dashboard-container">
            {/* Page Header */}
            <div className="premium-page-header">
                <div>
                    <h1>Security <span>Personnel</span> 🛡️</h1>
                    <p>Roster management and shift coordination for active campus officers.</p>
                </div>
                <div className="premium-header-meta">
                    <div className="csucc-filter-search-mobile">
                        <input
                            type="text"
                            className="form-input premium-editable"
                            placeholder="Search by name or ID..."
                            onChange={() => { }}
                        />
                    </div>
                    <button className="premium-page-btn active" onClick={handleAdd}>
                        <span className="material-symbols-rounded">person_add</span>
                        Officer Commission
                    </button>
                </div>
            </div>

            {/* Stats Grid - 5 Column Rework */}
            <div className="dashboard-grid dashboard-grid--5col mb-8">
                {/* Total Enrolled */}
                <div className="stat-widget-security">
                    <div className="stat-widget__header">
                        <div className="stat-widget__icon-box" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                            <span className="material-symbols-rounded">shield_person</span>
                        </div>
                    </div>
                    <div className="stat-widget__value">{totalStaff}</div>
                    <div className="stat-widget__label">Total Enrolled</div>
                    <div className="stat-widget__meta">
                        <div className="stat-sub-row">All staff status accounted</div>
                    </div>
                </div>
                
                {/* On Duty */}
                <div className="stat-widget-security">
                    <div className="stat-widget__header">
                        <div className="stat-widget__icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                            <span className="material-symbols-rounded">how_to_reg</span>
                        </div>
                        <span className="duty-badge duty-on" style={{ fontSize: '9px', padding: '2px 8px' }}>Active</span>
                    </div>
                    <div className="stat-widget__value" style={{ color: '#10b981' }}>{onDuty.length}</div>
                    <div className="stat-widget__label">On Duty Now</div>
                    <div className="stat-widget__meta">
                        <div className="stat-sub-row">Main Gate <b>{postCounts.Main}</b></div>
                        <div className="stat-sub-row">Back Gate <b>{postCounts.Back}</b></div>
                        <div className="stat-sub-row">Roving <b>{postCounts.Roving}</b></div>
                    </div>
                </div>

                {/* Standby */}
                <div className="stat-widget-security">
                    <div className="stat-widget__header">
                        <div className="stat-widget__icon-box" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                            <span className="material-symbols-rounded">hourglass_empty</span>
                        </div>
                        <span className="duty-badge duty-standby" style={{ fontSize: '9px', padding: '2px 8px' }}>Waiting</span>
                    </div>
                    <div className="stat-widget__value" style={{ color: '#f59e0b' }}>{standby}</div>
                    <div className="stat-widget__label">Standby Mode</div>
                    <div className="stat-widget__meta">
                        <div className="stat-sub-row">Ready for deployment</div>
                    </div>
                </div>

                {/* Off Duty */}
                <div className="stat-widget-security" style={{ opacity: 0.7 }}>
                    <div className="stat-widget__header">
                        <div className="stat-widget__icon-box" style={{ background: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8' }}>
                            <span className="material-symbols-rounded">bedtime</span>
                        </div>
                    </div>
                    <div className="stat-widget__value">{offDuty}</div>
                    <div className="stat-widget__label">Off Duty</div>
                    <div className="stat-widget__meta">
                        <div className="stat-sub-row">All personnel accounted</div>
                    </div>
                </div>

                {/* Shifts Today */}
                <div className="stat-widget-security">
                    <div className="stat-widget__header">
                        <div className="stat-widget__icon-box" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                            <span className="material-symbols-rounded">schedule</span>
                        </div>
                        <div className="post-badge post-roving" style={{ fontSize: '9px', padding: '2px 6px' }}>2</div>
                    </div>
                    <div className="stat-widget__value">2</div>
                    <div className="stat-widget__label">Shifts Tracked</div>
                    <div className="stat-widget__meta">
                        <div className="stat-sub-row">Active: 6:00 AM - 10:00 PM</div>
                    </div>
                </div>
            </div>

            {/* Staff Grid */}
            <div className="dashboard-grid dashboard-grid--auto mb-8">
                {staff.map(officer => (
                    <div 
                        key={officer.id} 
                        className={`officer-card-premium ${officer.dutyStatus !== 'on_duty' ? 'officer-card--muted' : ''}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="premium-avatar-section" style={{ width: '48px', height: '48px', margin: 0 }}>
                                <div className="premium-avatar-inner" style={{ fontSize: '1.25rem', borderWidth: '3px' }}>{officer.avatar}</div>
                            </div>
                            <div className="flex gap-1">
                                <button className="premium-page-btn" style={{ minWidth: '36px', padding: '6px' }} onClick={() => handleEdit(officer)}>
                                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>edit</span>
                                </button>
                                <button className="premium-page-btn" style={{ minWidth: '36px', padding: '6px', color: '#ef4444' }} onClick={() => handleDelete(officer.id)}>
                                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete</span>
                                </button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--t-1)' }}>{officer.name}</div>
                            <div style={{ color: 'var(--t-3)', fontSize: '0.85rem', fontWeight: 500 }}>ID: {officer.badge}</div>
                        </div>

                        <div className="flex items-center gap-2 mb-6">
                            <span className={`duty-badge ${officer.dutyStatus === 'on_duty' ? 'duty-on' : officer.dutyStatus === 'standby' ? 'duty-standby' : 'duty-off'}`}>
                                <span className={`status-dot ${officer.dutyStatus === 'on_duty' ? 'status-dot--online' : officer.dutyStatus === 'standby' ? 'status-dot--away' : 'status-dot--offline'}`}></span>
                                {officer.dutyStatus.replace('_', ' ')}
                            </span>
                            <span className={`post-badge ${officer.post === 'Main Gate' ? 'post-main' : officer.post === 'Back Gate' ? 'post-back' : 'post-roving'}`}>
                                {officer.post}
                            </span>
                        </div>

                        <div className="metric-row">
                            <span className="metric-label">Shift Schedule</span>
                            <span className="metric-value">{officer.shift}</span>
                        </div>
                        <div className="metric-row">
                            <span className="metric-label">Logged today</span>
                            <span className={`metric-value ${officer.vehiclesLogged > 0 ? 'highlight' : ''}`}>{officer.vehiclesLogged} vehicles</span>
                        </div>
                        <div className="metric-row">
                            <span className="metric-label">Last activity</span>
                            <span className="metric-value">{officer.lastActivity}</span>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button className="premium-page-btn" style={{ flex: 1, justifyContent: 'center' }}>
                                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>call</span>
                                Contact
                            </button>
                            <button className="premium-page-btn active" style={{ flex: 1, justifyContent: 'center' }}>
                                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>history</span>
                                Logs
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-backdrop active" onClick={() => setShowModal(false)}>
                    <div className="modal premium-glass-card" onClick={e => e.stopPropagation()} style={{ border: 'none', maxWidth: '600px', width: '90%' }}>
                        <header className="modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="premium-noti-icon-box premium-pill active" style={{ width: '40px', height: '40px' }}>
                                    <span className="material-symbols-rounded">{currentStaff ? 'edit_square' : 'person_add'}</span>
                                </div>
                                <h2 className="modal-title">{currentStaff ? 'Modify Officer Record' : 'Commission New Officer'}</h2>
                            </div>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </header>
                        <div className="modal-body" style={{ padding: '1.5rem 0' }}>
                            <form id="staffForm" onSubmit={(e) => { e.preventDefault(); setShowModal(false); }} style={{ display: 'grid', gap: '1.25rem' }}>
                                <div className="form-group mb-0">
                                    <label className="form-label">Full Legal Name</label>
                                    <input type="text" className="form-input premium-editable" defaultValue={currentStaff?.name} placeholder="Officer Name" required />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group mb-0">
                                        <label className="form-label">Badge Identifier</label>
                                        <input type="text" className="form-input premium-editable" defaultValue={currentStaff?.badge || 'SEC-'} required />
                                    </div>
                                    <div className="form-group mb-0">
                                        <label className="form-label">Primary Contact</label>
                                        <input type="tel" className="form-input premium-editable" defaultValue={currentStaff?.phone} placeholder="+63 XXX" required />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group mb-0">
                                        <label className="form-label">Duty Status</label>
                                        <select className="form-select premium-editable" defaultValue={currentStaff?.dutyStatus || 'on_duty'}>
                                            <option value="on_duty">On Duty</option>
                                            <option value="standby">Standby</option>
                                            <option value="off_duty">Off Duty</option>
                                        </select>
                                    </div>
                                    <div className="form-group mb-0">
                                        <label className="form-label">Deployment Post</label>
                                        <select className="form-select premium-editable" defaultValue={currentStaff?.post || 'Main Gate'}>
                                            <option>Main Gate</option>
                                            <option>Back Gate</option>
                                            <option>Roving</option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <footer className="modal-footer" style={{ borderTop: 'none', padding: '1rem 0 0', display: 'flex', gap: '1rem' }}>
                            <button className="premium-page-btn" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Discard</button>
                            <button className="premium-page-btn active" type="submit" form="staffForm" style={{ flex: 1 }}>Confirm Record</button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
}
