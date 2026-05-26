import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import api from '../../../../services/api';
import { usePrivacy } from '../../../../contexts/PrivacyContext';
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
        avatar: 'PG',
        status: 'Active'
    }
];

/* ------------------------------------------------------------------ */
/*  Custom Dropdown Component (Consistent with Vehicles Page)          */
/* ------------------------------------------------------------------ */
const FilterDropdown = ({ label, value, options, onChange, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value) || options[0];

    return (
        <div className="premium-filter-dropdown" ref={dropdownRef}>
            <button 
                className={`premium-filter-btn ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {icon && <span className="material-symbols-rounded btn-icon">{icon}</span>}
                <span className="btn-label">{selectedOption.label}</span>
                <span className="material-symbols-rounded chevron">
                    {isOpen ? 'expand_less' : 'expand_more'}
                </span>
            </button>

            {isOpen && (
                <div className="premium-filter-dropdown-menu">
                    {options.map((option) => (
                        <div 
                            key={option.value} 
                            className={`premium-dropdown-item ${value === option.value ? 'selected' : ''}`}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                        >
                            {option.label}
                            {value === option.value && (
                                <span className="material-symbols-rounded">check</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function SecurityStaff() {
    const { anonymizeName, anonymizeEmail, anonymizePhone } = usePrivacy();
    const [staff, setStaff] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [viewOfficer, setViewOfficer] = useState(null);
    const [disableTarget, setDisableTarget] = useState(null);
    const [showDisableModal, setShowDisableModal] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [formStep, setFormStep] = useState(1);
    const [showLogsModal, setShowLogsModal] = useState(false);
    const [selectedOfficerLogs, setSelectedOfficerLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [logsTarget, setLogsTarget] = useState(null);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [postFilter, setPostFilter] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [newOfficer, setNewOfficer] = useState({
        first_name: '', middle_name: '', last_name: '',
        email: '', phone: '', sex: '', birth_date: '',
        nationality: 'Filipino', badge_id: '', password: '',
        department: 'Security Department', address: ''
    });

    const StatCard = ({ label, value, badgeText, badgeVariant, rows }) => (
        <div className="security-metric-card">
            <div className={`security-stat-badge security-stat-badge--${badgeVariant}`}>{badgeText}</div>
            <div className="security-metric-card__label">{label}</div>
            <div className="security-metric-card__value">{value}</div>
            <div className="security-metric-card__footer">
                {rows && rows.map((row, i) => (
                    <div key={i} className="security-metric-card__sub-row">
                        <span>{row.label}</span>
                        <span className="val">{row.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    // ... (rest of functions remain same, just updating the return JSX)
    const resetForm = () => {
        setNewOfficer({
            first_name: '', middle_name: '', last_name: '',
            email: '', phone: '', sex: '', birth_date: '',
            nationality: 'Filipino', badge_id: '', password: '',
            department: 'Security Department', address: ''
        });
        setFormStep(1);
        setFormError('');
        setFormSuccess('');
    };

    const handleCloseAddModal = () => {
        setShowAddModal(false);
        resetForm();
    };

    const handleFormChange = (field, value) => {
        setNewOfficer(prev => ({ ...prev, [field]: value }));
        setFormError('');
    };

    const validateStep1 = () => {
        if (!newOfficer.first_name.trim()) return 'First name is required.';
        if (!newOfficer.last_name.trim()) return 'Last name is required.';
        if (!newOfficer.email.trim()) return 'Campus email is required.';
        if (!newOfficer.email.includes('@')) return 'Please enter a valid email address.';
        return null;
    };

    const validateStep2 = () => {
        if (!newOfficer.password.trim()) return 'Initial password is required.';
        if (newOfficer.password.length < 6) return 'Password must be at least 6 characters.';
        return null;
    };

    const handleNextStep = () => {
        const error = validateStep1();
        if (error) { setFormError(error); return; }
        setFormError('');
        setFormStep(2);
    };

    const handleSubmitOfficer = async (e) => {
        e.preventDefault();
        const error = validateStep2();
        if (error) { setFormError(error); return; }
        setIsSubmitting(true);
        setFormError('');
        try {
            const response = await api.post('/security-staff/create-officer', newOfficer);
            if (response.data.status === 'success') {
                const u = response.data.user;
                setStaff(prev => [{
                    id: u.id,
                    name: u.name,
                    badge: u.idNumber !== '\u2014' ? u.idNumber : newOfficer.badge_id || 'SEC-XXX',
                    email: u.email,
                    phone: newOfficer.phone || '+63 900 000 0000',
                    shift: '6:00 AM - 2:00 PM',
                    dutyStatus: 'on_duty',
                    status: u.status,
                    post: 'Main Gate',
                    vehiclesLogged: 0,
                    lastActivity: 'Just now',
                    avatar: u.avatar,
                    sex: newOfficer.sex || '\u2014',
                    birth_date: newOfficer.birth_date || '\u2014',
                    nationality: newOfficer.nationality || 'Filipino',
                    address: newOfficer.address || '\u2014',
                    department: newOfficer.department || '\u2014',
                    position: 'Security Officer',
                    employment_type: '\u2014',
                    drivers_license: '\u2014',
                    license_expiry: '\u2014',
                    registered: u.registered || 'Today',
                    username: u.username || '\u2014',
                    vehicles: [],
                    vehicle_count: 0,
                }, ...prev]);
                setFormSuccess(response.data.message);
                setTimeout(() => { handleCloseAddModal(); }, 1500);
            }
        } catch (err) {
            console.error('Error creating officer:', err);
            setFormError(err.response?.data?.detail || 'Failed to create officer account.');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const res = await api.get('/admin/users?role=security');
                if (res.data.users && res.data.users.length > 0) {
                    const mapped = res.data.users.map(u => ({
                        id: u.id,
                        name: u.name,
                        badge: u.idNumber !== '—' ? u.idNumber : 'SEC-XXX',
                        email: u.email,
                        phone: u.phone || '+63 900 000 0000',
                        shift: '6:00 AM - 2:00 PM',
                        dutyStatus: u.status.toLowerCase() === 'active' ? 'on_duty' : 'off_duty',
                        status: u.status,
                        post: 'Main Gate',
                        vehiclesLogged: 0,
                        lastActivity: u.last_login,
                        avatar: u.avatar,
                        sex: u.sex || '—',
                        birth_date: u.birth_date || '—',
                        nationality: u.nationality || '—',
                        address: u.address || '—',
                        department: u.department || '—',
                        position: u.position || '—',
                        employment_type: u.employment_type || '—',
                        drivers_license: u.drivers_license || '—',
                        license_expiry: u.license_expiry || '—',
                        registered: u.registered || '—',
                        username: u.username || '—',
                        vehicles: u.vehicles || [],
                        vehicle_count: u.vehicle_count || 0,
                    }));
                    setStaff(mapped);
                } else {
                    setStaff(initialStaff);
                }
            } catch (error) {
                console.error("Failed to fetch staff:", error);
                setStaff(initialStaff);
            } finally {
                setLoading(false);
            }
        };
        fetchStaff();
    }, []);

    const handleDisableClick = (officer) => {
        setDisableTarget(officer);
        setShowDisableModal(true);
    };

    const handleConfirmToggle = async () => {
        if (!disableTarget) return;
        setIsToggling(true);
        try {
            const response = await api.patch(`/admin/users/${disableTarget.id}/toggle-status`);
            if (response.data.status === 'success') {
                const updatedUser = response.data.user;
                setStaff(prev => prev.map(s => {
                    if (s.id === disableTarget.id) {
                        return {
                            ...s,
                            status: updatedUser.status,
                            dutyStatus: updatedUser.status.toLowerCase() === 'active' ? 'on_duty' : 'off_duty',
                        };
                    }
                    return s;
                }));
                
                Swal.fire({
                    title: 'Status Updated',
                    text: `Officer status changed to ${updatedUser.status}.`,
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e293b' : '#fff',
                    color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f8fafc' : '#0f172a'
                });
            }
        } catch (err) {
            console.error("Error toggling officer status:", err);
            Swal.fire({
                title: 'Error',
                text: err.response?.data?.detail || "Failed to update officer status",
                icon: 'error',
                background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e293b' : '#fff',
                color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f8fafc' : '#0f172a'
            });
        } finally {
            setIsToggling(false);
            setShowDisableModal(false);
            setDisableTarget(null);
        }
    };

    const handleViewLogs = async (officer) => {
        setLogsTarget(officer);
        setShowLogsModal(true);
        setLogsLoading(true);
        setSelectedOfficerLogs([]);
        try {
            const res = await api.get(`/security-staff/${officer.id}/logs`);
            if (res.data.status === 'success') {
                setSelectedOfficerLogs(res.data.logs);
            }
        } catch (error) {
            console.error("Failed to fetch officer logs:", error);
            // Optionally show error in modal
        } finally {
            setLogsLoading(false);
        }
    };

    // Stats calculation
    const totalStaff = staff.length;
    const onDutyList = staff.filter(s => s.dutyStatus === 'on_duty');
    const onDutyCount = onDutyList.length;
    const standbyCount = staff.filter(s => s.dutyStatus === 'standby').length;
    const offDutyCount = staff.filter(s => s.dutyStatus === 'off_duty').length;
    
    const postCounts = {
        Main: onDutyList.filter(s => s.post === 'Main Gate').length,
        Back: onDutyList.filter(s => s.post === 'Back Gate').length,
        Roving: onDutyList.filter(s => s.post === 'Roving').length
    };

    const filteredStaff = staff.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             s.badge.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || s.dutyStatus === statusFilter;
        const matchesPost = !postFilter || s.post === postFilter;
        return matchesSearch && matchesStatus && matchesPost;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStaff = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, postFilter, itemsPerPage]);

    return (
        <div className="premium-dashboard-container">
            {/* Page Header */}
            <div className="premium-page-header">
                <div>
                    <h1>Security <span>Personnel</span> 🛡️</h1>
                    <p>Roster management and shift coordination for active campus officers.</p>
                </div>
                <button className="premium-page-btn active" onClick={() => setShowAddModal(true)}>
                    <span className="material-symbols-rounded">person_add</span>
                    Officer Commission
                </button>
            </div>

            {/* Stats Grid */}
            <div className="security-stats-grid mb-8">
                <StatCard 
                    label="Total Enrolled" 
                    value={totalStaff} 
                    badgeText="Live" 
                    badgeVariant="info"
                    rows={[
                        { label: 'Morning Shift', value: staff.filter(s => s.shift.includes('6:00 AM')).length },
                        { label: 'Night Shift', value: staff.filter(s => s.shift.includes('10:00 PM')).length }
                    ]}
                />
                <StatCard 
                    label="On Duty Now" 
                    value={onDutyCount} 
                    badgeText="Synced" 
                    badgeVariant="success"
                    rows={[
                        { label: 'Main gate', value: postCounts.Main },
                        { label: 'Back gate', value: postCounts.Back }
                    ]}
                />
                <StatCard 
                    label="Standby Mode" 
                    value={standbyCount} 
                    badgeText={standbyCount > 0 ? 'Active' : 'Stable'} 
                    badgeVariant="warning"
                    rows={[
                        { label: 'Ready to deploy', value: standbyCount }
                    ]}
                />
                <StatCard 
                    label="Shifts Tracked" 
                    value="2" 
                    badgeText="Live" 
                    badgeVariant="info"
                    rows={[
                        { label: 'Active rotation', value: '24/7' }
                    ]}
                />
            </div>

            {/* Filters Section */}
            <div className="premium-filter-section" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
                <div className="search-group" style={{ flex: 1, maxWidth: '500px' }}>
                    <span className="material-symbols-rounded search-icon">search</span>
                    <input
                        type="text"
                        className="premium-search-input"
                        placeholder="Search by name or badge ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="search-shortcut">
                        <span className="key">⌘</span>
                        <span className="key">K</span>
                    </div>
                </div>
                
                <FilterDropdown 
                    label="Status" 
                    value={statusFilter} 
                    icon="clinical_notes"
                    options={[
                        { value: '', label: 'All Status' },
                        { value: 'on_duty', label: 'On Duty' },
                        { value: 'standby', label: 'Standby' },
                        { value: 'off_duty', label: 'Off Duty' }
                    ]} 
                    onChange={setStatusFilter} 
                />

                <FilterDropdown 
                    label="Post" 
                    value={postFilter} 
                    icon="location_on"
                    options={[
                        { value: '', label: 'All Posts' },
                        { value: 'Main Gate', label: 'Main Gate' },
                        { value: 'Back Gate', label: 'Back Gate' },
                        { value: 'Roving', label: 'Roving' }
                    ]} 
                    onChange={setPostFilter} 
                />
            </div>

            {/* Staff List - Tabular View */}
            <div className="premium-table-container">
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>Officer</th>
                            <th>Status</th>
                            <th>Current Post</th>
                            <th>Shift Schedule</th>
                            <th>Activity</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentStaff.map(officer => (
                            <tr key={officer.id} className={officer.dutyStatus !== 'on_duty' ? 'officer-row--muted' : ''}>
                                <td data-label="Officer">
                                    <div className="table-officer-cell">
                                        <div className="premium-avatar-section" style={{ width: '32px', height: '32px', margin: 0 }}>
                                            <div className="premium-avatar-inner" style={{ fontSize: '0.75rem', borderWidth: '2px' }}>{officer.avatar}</div>
                                        </div>
                                        <div className="table-officer-info">
                                            <span className="table-officer-name">{anonymizeName(officer.name)}</span>
                                            <span className="table-officer-badge">ID: {officer.badge}</span>
                                        </div>
                                    </div>
                                </td>
                                <td data-label="Status">
                                    <span className={`duty-badge-v2 ${officer.dutyStatus}`}>
                                        <span className="status-dot-v2"></span>
                                        {officer.dutyStatus.replace('_', ' ')}
                                    </span>
                                </td>
                                <td data-label="Current Post">
                                    <span className={`post-tag ${officer.post.toLowerCase().replace(' ', '-')}`}>
                                        {officer.post}
                                    </span>
                                </td>
                                <td data-label="Shift Schedule">
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{officer.shift}</span>
                                </td>
                                <td data-label="Activity">
                                    <div className="table-activity-info">
                                        <span className="activity-main">{officer.vehiclesLogged} vehicles today</span>
                                        <span className="activity-sub">Last: {officer.lastActivity}</span>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div className="table-actions">
                                        <button className="icon-btn-premium" onClick={() => setViewOfficer(officer)} title="View Details">
                                            <span className="material-symbols-rounded">visibility</span>
                                        </button>
                                        <button
                                            className={`icon-btn-premium ${officer.status === 'Active' ? 'text-warning' : 'text-success'}`}
                                            onClick={() => handleDisableClick(officer)}
                                            title={officer.status === 'Active' ? 'Disable Officer' : 'Enable Officer'}
                                        >
                                            <span className="material-symbols-rounded">
                                                {officer.status === 'Active' ? 'person_off' : 'person_check'}
                                            </span>
                                        </button>
                                        <button className="icon-btn-premium" title="Logs" onClick={() => handleViewLogs(officer)}>
                                            <span className="material-symbols-rounded">history</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredStaff.length === 0 && (
                            <tr>
                                <td colSpan="6" className="no-data-cell">
                                    <div className="no-data-content">
                                        <span className="material-symbols-rounded">search_off</span>
                                        <p>No security personnel found matching your filters</p>
                                        <button className="clear-filters-link" onClick={() => {
                                            setSearchTerm(''); setStatusFilter(''); setPostFilter('');
                                        }}>
                                            Reset Intelligence
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="premium-pagination">
                    <div className="pagination-info">
                        {filteredStaff.length > 0 ? (
                            <>Showing <span>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredStaff.length)}</span> of <span>{filteredStaff.length}</span> officers</>
                        ) : (
                            <span>No officers found</span>
                        )}
                    </div>
                    
                    <div className="pagination-controls">
                        <div className="limit-selector">
                            <span className="limit-label">Show:</span>
                            <select 
                                className="premium-select-compact"
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </div>

                        <div className="page-btns">
                            <button 
                                className="premium-page-btn icon-only" 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1 || filteredStaff.length === 0}
                            >
                                <span className="material-symbols-rounded">chevron_left</span>
                            </button>
                            
                            <div className="page-indicators">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button 
                                        key={i + 1}
                                        className={`page-indicator ${currentPage === i + 1 ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button 
                                className="premium-page-btn icon-only" 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || filteredStaff.length === 0}
                            >
                                <span className="material-symbols-rounded">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Commission New Officer Modal */}
            {showAddModal && (
                <div className="modal-backdrop active" onClick={handleCloseAddModal}>
                    <div className="modal premium-glass-card commission-modal" onClick={e => e.stopPropagation()} style={{ border: 'none', maxWidth: '640px', width: '92%' }}>
                        {/* Header */}
                        <header className="commission-modal__header">
                            <div className="commission-modal__header-left">
                                <div className="commission-modal__icon-box">
                                    <span className="material-symbols-rounded">shield_person</span>
                                </div>
                                <div>
                                    <h2 className="commission-modal__title">Commission New Officer</h2>
                                    <p className="commission-modal__subtitle">Step {formStep} of 2 — {formStep === 1 ? 'Personal Information' : 'Officer Assignment'}</p>
                                </div>
                            </div>
                            <button className="modal-close" onClick={handleCloseAddModal}>
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </header>

                        {/* Step Indicator */}
                        <div className="commission-modal__steps">
                            <div className={`commission-step ${formStep >= 1 ? 'commission-step--active' : ''}`}>
                                <div className="commission-step__dot">1</div>
                                <span>Identity</span>
                            </div>
                            <div className="commission-step__line"></div>
                            <div className={`commission-step ${formStep >= 2 ? 'commission-step--active' : ''}`}>
                                <div className="commission-step__dot">2</div>
                                <span>Assignment</span>
                            </div>
                        </div>

                        {/* Error / Success */}
                        {formError && (
                            <div className="commission-modal__alert commission-modal__alert--error">
                                <span className="material-symbols-rounded">error</span>
                                {formError}
                            </div>
                        )}
                        {formSuccess && (
                            <div className="commission-modal__alert commission-modal__alert--success">
                                <span className="material-symbols-rounded">check_circle</span>
                                {formSuccess}
                            </div>
                        )}

                        {/* Form Body */}
                        <div className="commission-modal__body">
                            <form id="commissionForm" onSubmit={formStep === 1 ? (e) => { e.preventDefault(); handleNextStep(); } : handleSubmitOfficer}>
                                {formStep === 1 && (
                                    <>
                                        <div className="commission-modal__section-label">
                                            <span className="material-symbols-rounded">badge</span>
                                            Legal Identity
                                        </div>
                                        <div className="commission-modal__grid commission-modal__grid--3col">
                                            <div className="commission-modal__field">
                                                <label className="commission-modal__label">First Name <span className="commission-req">*</span></label>
                                                <input type="text" className="form-input premium-editable" placeholder="Juan" value={newOfficer.first_name} onChange={e => handleFormChange('first_name', e.target.value)} required />
                                            </div>
                                            <div className="commission-modal__field">
                                                <label className="commission-modal__label">Middle Name</label>
                                                <input type="text" className="form-input premium-editable" placeholder="Dela" value={newOfficer.middle_name} onChange={e => handleFormChange('middle_name', e.target.value)} />
                                            </div>
                                            <div className="commission-modal__field">
                                                <label className="commission-modal__label">Last Name <span className="commission-req">*</span></label>
                                                <input type="text" className="form-input premium-editable" placeholder="Cruz" value={newOfficer.last_name} onChange={e => handleFormChange('last_name', e.target.value)} required />
                                            </div>
                                        </div>

                                        <div className="commission-modal__section-label">
                                            <span className="material-symbols-rounded">contact_mail</span>
                                            Contact Details
                                        </div>
                                        <div className="commission-modal__grid commission-modal__grid--2col">
                                            <div className="commission-modal__field">
                                                <label className="commission-modal__label">Campus Email <span className="commission-req">*</span></label>
                                                <input type="email" className="form-input premium-editable" placeholder="officer@csu.edu.ph" value={newOfficer.email} onChange={e => handleFormChange('email', e.target.value)} required />
                                            </div>
                                            <div className="commission-modal__field">
                                                <label className="commission-modal__label">Phone Number</label>
                                                <input type="tel" className="form-input premium-editable" placeholder="+63 9XX XXX XXXX" value={newOfficer.phone} onChange={e => handleFormChange('phone', e.target.value)} />
                                            </div>
                                        </div>

                                        <div className="commission-modal__section-label">
                                            <span className="material-symbols-rounded">person</span>
                                            Personal Details
                                        </div>
                                        <div className="commission-modal__grid commission-modal__grid--3col">
                                            <div className="commission-modal__field">
                                                <label className="commission-modal__label">Sex</label>
                                                <select className="form-select premium-editable" value={newOfficer.sex} onChange={e => handleFormChange('sex', e.target.value)}>
                                                    <option value="">Select</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                            </div>
                                            <div className="commission-modal__field">
                                                <label className="commission-modal__label">Date of Birth</label>
                                                <input type="date" className="form-input premium-editable" value={newOfficer.birth_date} onChange={e => handleFormChange('birth_date', e.target.value)} />
                                            </div>
                                            <div className="commission-modal__field">
                                                <label className="commission-modal__label">Nationality</label>
                                                <input type="text" className="form-input premium-editable" placeholder="Filipino" value={newOfficer.nationality} onChange={e => handleFormChange('nationality', e.target.value)} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {formStep === 2 && (
                                    <>
                                        <div className="commission-modal__section-label">
                                            <span className="material-symbols-rounded">shield</span>
                                            Officer Credentials
                                        </div>
                                        <div className="commission-modal__grid commission-modal__grid--2col">
                                            <div className="commission-modal__field">
                                                <label className="commission-modal__label">Badge ID</label>
                                                <input type="text" className="form-input premium-editable" placeholder="SEC-001" value={newOfficer.badge_id} onChange={e => handleFormChange('badge_id', e.target.value)} />
                                            </div>
                                            <div className="commission-modal__field">
                                                <label className="commission-modal__label">Initial Password <span className="commission-req">*</span></label>
                                                <input type="password" className="form-input premium-editable" placeholder="Min. 6 characters" value={newOfficer.password} onChange={e => handleFormChange('password', e.target.value)} required />
                                            </div>
                                        </div>

                                        <div className="commission-modal__section-label">
                                            <span className="material-symbols-rounded">apartment</span>
                                            Assignment Details
                                        </div>
                                        <div className="commission-modal__grid commission-modal__grid--1col">
                                            <div className="commission-modal__field">
                                                <label className="commission-modal__label">Department</label>
                                                <input type="text" className="form-input premium-editable" value={newOfficer.department} onChange={e => handleFormChange('department', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="commission-modal__grid commission-modal__grid--1col">
                                            <div className="commission-modal__field">
                                                <label className="commission-modal__label">Address</label>
                                                <input type="text" className="form-input premium-editable" placeholder="Street, City, Province" value={newOfficer.address} onChange={e => handleFormChange('address', e.target.value)} />
                                            </div>
                                        </div>

                                        {/* Preview Card */}
                                        <div className="commission-modal__section-label">
                                            <span className="material-symbols-rounded">preview</span>
                                            Officer Preview
                                        </div>
                                        <div className="commission-modal__preview">
                                            <div className="premium-avatar-section" style={{ width: '40px', height: '40px', margin: 0 }}>
                                                <div className="premium-avatar-inner" style={{ fontSize: '0.85rem', borderWidth: '2px' }}>
                                                    {(newOfficer.first_name[0] || '').toUpperCase()}{(newOfficer.last_name[0] || '').toUpperCase()}
                                                </div>
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                                                    {newOfficer.first_name} {newOfficer.middle_name} {newOfficer.last_name}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                    {newOfficer.email} {newOfficer.badge_id && `• ${newOfficer.badge_id}`}
                                                </div>
                                            </div>
                                            <span className="premium-pill badge-success" style={{ fontSize: '10px' }}>Security</span>
                                        </div>
                                    </>
                                )}
                            </form>
                        </div>

                        {/* Footer */}
                        <footer className="commission-modal__footer">
                            {formStep === 1 ? (
                                <>
                                    <button className="premium-page-btn" onClick={handleCloseAddModal} style={{ flex: 1 }}>Cancel</button>
                                    <button className="premium-page-btn active" type="submit" form="commissionForm" style={{ flex: 1 }}>
                                        Continue
                                        <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>arrow_forward</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="premium-page-btn" onClick={() => { setFormStep(1); setFormError(''); }} disabled={isSubmitting} style={{ flex: 1 }}>
                                        <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>arrow_back</span>
                                        Back
                                    </button>
                                    <button className="premium-page-btn btn-confirm-success" type="submit" form="commissionForm" disabled={isSubmitting} style={{ flex: 1 }}>
                                        {isSubmitting
                                            ? <span className="material-symbols-rounded spin-icon">progress_activity</span>
                                            : <><span className="material-symbols-rounded" style={{ fontSize: '18px' }}>how_to_reg</span> Commission Officer</>
                                        }
                                    </button>
                                </>
                            )}
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
                                ? <>You are about to <strong>disable</strong> officer <strong>{anonymizeName(disableTarget.name)}</strong>. This will revoke their system access and mark them as off-duty.</>
                                : <>You are about to <strong>re-enable</strong> officer <strong>{anonymizeName(disableTarget.name)}</strong>. This will restore their system access.</>
                            }
                        </p>
                        <div className="confirm-modal__user-card">
                            <div className="premium-avatar-section" style={{ width: '36px', height: '36px', margin: 0 }}>
                                <div className="premium-avatar-inner" style={{ fontSize: '0.8rem', borderWidth: '2px' }}>{disableTarget.avatar}</div>
                            </div>
                            <div className="confirm-modal__user-info">
                                <span className="confirm-modal__user-name">{anonymizeName(disableTarget.name)}</span>
                                <span className="confirm-modal__user-email">Badge: {disableTarget.badge}</span>
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

            {/* View Officer Detail Modal */}
            {viewOfficer && (
                <div className="modal-backdrop active" onClick={() => setViewOfficer(null)}>
                    <div className="modal premium-glass-card view-user-modal" onClick={e => e.stopPropagation()} style={{ border: 'none', maxWidth: '600px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
                        <header className="view-user-modal__header">
                            <div className="view-user-modal__profile">
                                <div className="premium-avatar-section" style={{ width: '56px', height: '56px', margin: 0 }}>
                                    <div className="premium-avatar-inner" style={{ fontSize: '1.2rem', borderWidth: '3px' }}>{viewOfficer.avatar}</div>
                                </div>
                                <div className="view-user-modal__identity">
                                    <h2 className="view-user-modal__name">{anonymizeName(viewOfficer.name)}</h2>
                                    <div className="view-user-modal__meta">
                                        <span className="premium-pill badge-success" style={{ fontSize: '11px' }}>Security</span>
                                        <span className={`premium-pill ${viewOfficer.status === 'Active' ? 'success' : 'danger'}`} style={{ fontSize: '11px' }}>{viewOfficer.status}</span>
                                        <span className={`duty-badge ${viewOfficer.dutyStatus === 'on_duty' ? 'duty-on' : viewOfficer.dutyStatus === 'standby' ? 'duty-standby' : 'duty-off'}`} style={{ fontSize: '10px' }}>
                                            {viewOfficer.dutyStatus.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button className="modal-close" onClick={() => setViewOfficer(null)}>
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </header>

                        <div className="view-user-modal__body">
                            {/* Personal Information */}
                            <div className="view-user-modal__section">
                                <h3 className="view-user-modal__section-title">
                                    <span className="material-symbols-rounded">person</span>
                                    Personal Information
                                </h3>
                                <div className="view-user-modal__grid">
                                    <div className="view-user-modal__field">
                                        <span className="view-user-modal__label">Full Name</span>
                                        <span className="view-user-modal__value">{anonymizeName(viewOfficer.name)}</span>
                                    </div>
                                    <div className="view-user-modal__field">
                                        <span className="view-user-modal__label">Email</span>
                                        <span className="view-user-modal__value view-user-modal__value--accent">{anonymizeEmail(viewOfficer.email)}</span>
                                    </div>
                                    <div className="view-user-modal__field">
                                        <span className="view-user-modal__label">Phone</span>
                                        <span className="view-user-modal__value">{anonymizePhone(viewOfficer.phone)}</span>
                                    </div>
                                    <div className="view-user-modal__field">
                                        <span className="view-user-modal__label">Sex</span>
                                        <span className="view-user-modal__value">{viewOfficer.sex}</span>
                                    </div>
                                    <div className="view-user-modal__field">
                                        <span className="view-user-modal__label">Birth Date</span>
                                        <span className="view-user-modal__value">{viewOfficer.birth_date}</span>
                                    </div>
                                    <div className="view-user-modal__field">
                                        <span className="view-user-modal__label">Nationality</span>
                                        <span className="view-user-modal__value">{viewOfficer.nationality}</span>
                                    </div>
                                    <div className="view-user-modal__field view-user-modal__field--full">
                                        <span className="view-user-modal__label">Address</span>
                                        <span className="view-user-modal__value">{viewOfficer.address}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Duty Information */}
                            <div className="view-user-modal__section">
                                <h3 className="view-user-modal__section-title">
                                    <span className="material-symbols-rounded">shield</span>
                                    Duty Information
                                </h3>
                                <div className="view-user-modal__grid">
                                    <div className="view-user-modal__field">
                                        <span className="view-user-modal__label">Badge ID</span>
                                        <span className="view-user-modal__value" style={{ fontFamily: 'monospace', fontWeight: 700 }}>{viewOfficer.badge}</span>
                                    </div>
                                    <div className="view-user-modal__field">
                                        <span className="view-user-modal__label">Deployment Post</span>
                                        <span className="view-user-modal__value">{viewOfficer.post}</span>
                                    </div>
                                    <div className="view-user-modal__field">
                                        <span className="view-user-modal__label">Shift Schedule</span>
                                        <span className="view-user-modal__value">{viewOfficer.shift}</span>
                                    </div>
                                    <div className="view-user-modal__field">
                                        <span className="view-user-modal__label">Vehicles Logged Today</span>
                                        <span className="view-user-modal__value">{viewOfficer.vehiclesLogged}</span>
                                    </div>
                                    <div className="view-user-modal__field">
                                        <span className="view-user-modal__label">Position</span>
                                        <span className="view-user-modal__value">{viewOfficer.position}</span>
                                    </div>
                                    <div className="view-user-modal__field">
                                        <span className="view-user-modal__label">Employment</span>
                                        <span className="view-user-modal__value">{viewOfficer.employment_type}</span>
                                    </div>
                                </div>
                            </div>

                            {/* License Information */}
                            <div className="view-user-modal__section">
                                <h3 className="view-user-modal__section-title">
                                    <span className="material-symbols-rounded">badge</span>
                                    License Information
                                </h3>
                                <div className="view-user-modal__grid">
                                    <div className="view-user-modal__field">
                                        <span className="view-user-modal__label">Driver's License No.</span>
                                        <span className="view-user-modal__value" style={{ fontFamily: 'monospace' }}>{viewOfficer.drivers_license}</span>
                                    </div>
                                    <div className="view-user-modal__field">
                                        <span className="view-user-modal__label">License Expiry</span>
                                        <span className="view-user-modal__value">{viewOfficer.license_expiry}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Registered Vehicles */}
                            <div className="view-user-modal__section">
                                <h3 className="view-user-modal__section-title">
                                    <span className="material-symbols-rounded">directions_car</span>
                                    Registered Vehicles
                                    <span className="view-user-modal__vehicle-count">{viewOfficer.vehicle_count}</span>
                                </h3>
                                {viewOfficer.vehicles && viewOfficer.vehicles.length > 0 ? (
                                    <div className="view-user-modal__vehicle-list">
                                        {viewOfficer.vehicles.map((v, i) => (
                                            <div key={i} className="view-user-modal__vehicle-card">
                                                <span className="material-symbols-rounded" style={{ fontSize: '20px', color: 'var(--text-secondary)' }}>
                                                    {v.type === 'motorcycle' ? 'two_wheeler' : v.type === 'van' ? 'airport_shuttle' : 'directions_car'}
                                                </span>
                                                <div className="view-user-modal__vehicle-info">
                                                    <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)' }}>{v.plate}</span>
                                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{v.brand} • {v.color}</span>
                                                </div>
                                                <span className={`premium-pill ${v.status === 'Approved' ? 'success' : v.status === 'Pending' ? 'badge-warning' : 'danger'}`} style={{ fontSize: '10px' }}>
                                                    {v.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="view-user-modal__empty">
                                        <span className="material-symbols-rounded">no_transfer</span>
                                        No vehicles registered
                                    </div>
                                )}
                            </div>

                            {/* Account Meta */}
                            <div className="view-user-modal__footer-meta">
                                <span>Registered: {viewOfficer.registered}</span>
                                <span>•</span>
                                <span>Last activity: {viewOfficer.lastActivity}</span>
                                <span>•</span>
                                <span>Username: {viewOfficer.username}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Officer Activity Logs Modal */}
            {showLogsModal && logsTarget && (
                <div className="modal-backdrop active" onClick={() => setShowLogsModal(false)}>
                    <div className="modal premium-glass-card logs-modal" onClick={e => e.stopPropagation()} style={{ border: 'none', maxWidth: '500px', width: '92%' }}>
                        <header className="logs-modal__header">
                            <div className="logs-modal__header-left">
                                <div className="logs-modal__icon-box">
                                    <span className="material-symbols-rounded">history</span>
                                </div>
                                <div>
                                    <h2 className="logs-modal__title">Activity Logs</h2>
                                    <p className="logs-modal__subtitle">Recent history for {anonymizeName(logsTarget.name)}</p>
                                </div>
                            </div>
                            <button className="modal-close" onClick={() => setShowLogsModal(false)}>
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </header>

                        <div className="logs-modal__body">
                            {logsLoading ? (
                                <div className="logs-modal__loading">
                                    <span className="material-symbols-rounded spin-icon">progress_activity</span>
                                    <p>Retrieving activity logs...</p>
                                </div>
                            ) : selectedOfficerLogs.length > 0 ? (
                                <div className="logs-modal__timeline">
                                    {selectedOfficerLogs.map((log, index) => (
                                        <div key={log.id || index} className="logs-modal__item">
                                            <div className="logs-modal__item-icon">
                                                <span className="material-symbols-rounded">{log.icon || 'history'}</span>
                                            </div>
                                            <div className="logs-modal__item-content">
                                                <div className="logs-modal__item-header">
                                                    <span className="logs-modal__item-type">{log.type}</span>
                                                    <span className="logs-modal__item-time">{log.timestamp}</span>
                                                </div>
                                                <p className="logs-modal__item-desc">{log.description}</p>
                                                <div className="logs-modal__item-status">
                                                    <span className={`premium-pill ${log.status === 'Success' ? 'success' : 'danger'}`} style={{ fontSize: '10px' }}>
                                                        {log.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="logs-modal__empty">
                                    <span className="material-symbols-rounded">history_toggle_off</span>
                                    <h3>No recent activity</h3>
                                    <p>This officer hasn't performed any logged actions in the current period.</p>
                                </div>
                            )}
                        </div>
                        
                        <footer className="logs-modal__footer">
                            <button className="premium-page-btn" onClick={() => setShowLogsModal(false)} style={{ width: '100%' }}>
                                Close History
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
}

