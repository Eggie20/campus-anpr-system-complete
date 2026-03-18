import { useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNotification } from '../../../../contexts/NotificationContext';

export default function Profile() {
    const { user } = useAuth();
    const { success, error } = useNotification();

    const [formData, setFormData] = useState({
        // Identity
        firstName: user?.first_name || 'Juan',
        middleName: user?.middle_name || 'Ramos',
        lastName: user?.last_name || 'Dela Cruz',
        fullName: user?.full_name || 'Juan Ramos Dela Cruz',
        sex: user?.sex || 'Male',
        birthDate: user?.birth_date || '1995-05-15',
        nationality: user?.nationality || 'Filipino',
        
        // Contact
        email: user?.email || 'student@campus.edu',
        phone: user?.phone_number || '09170000002',
        address: user?.address || '123 University Ave, Butuan City',
        
        // Professional/Institution
        studentId: user?.student_id || 'STU-2024-0001',
        department: user?.department || 'Computer Science',
        idNumber: user?.id_number || 'L02-24-001234', // License Number
        expirationDate: user?.expiration_date || '2028-05-15',
        
        // Status
        role: user?.role || 'student',
        status: user?.status || 'Active'
    });

    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        setIsEditing(false);
        success("Profile credentials updated successfully!");
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        
        // Premium Validation
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            error("Passwords do not match. Please verify your new password.");
            return;
        }

        if (passwordForm.newPassword.length < 8) {
            error("Security requirement: Password must be at least 8 characters.");
            return;
        }

        // Logic for backend integration would go here
        
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        success("Security credentials updated. Your password has been changed.");
    };

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="premium-dashboard-container">
            {/* Page Header */}
            <div className="premium-page-header">
                <div>
                    <h1>User <span>Profile</span> 👤</h1>
                    <p>Comprehensive overview of your account credentials and identity.</p>
                </div>
                <div className="premium-header-meta">
                    {!isEditing ? (
                        <button className="premium-page-btn" onClick={() => setIsEditing(true)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            Modify Details
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="premium-page-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                            <button className="premium-page-btn active" onClick={handleSave}>Apply Changes</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="dashboard-grid dashboard-grid--2col">
                {/* Column 1: Profile Overview */}
                <div style={{ display: 'grid', gap: '1.5rem', alignContent: 'start' }}>
                    <div className="premium-glass-card" style={{ textAlign: 'center' }}>
                        <div className="premium-avatar-section mb-6">
                            <div className="premium-avatar-inner" style={{ fontSize: '2.5rem' }}>
                                {getInitials(formData.fullName)}
                            </div>
                            <div className="premium-online-status">
                                <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>check</span>
                            </div>
                        </div>

                        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--t-1)', marginBottom: '0.25rem' }}>
                            {formData.fullName}
                        </h2>
                        <p style={{ color: 'var(--t-3)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>{formData.email}</p>

                        <div className="premium-pill primary mb-6" style={{ padding: '8px 16px' }}>
                            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>
                                {formData.role === 'faculty' ? 'assignment_ind' : 'school'}
                            </span>
                            {formData.role === 'faculty' ? 'Faculty Member' : 'Student'}
                        </div>

                        <div className="premium-profile-stats">
                            <div className="premium-stat-row">
                                <span className="premium-stat-label">Institutional ID</span>
                                <span className="premium-profile-stat-value">{formData.studentId}</span>
                            </div>
                            <div className="premium-stat-row">
                                <span className="premium-stat-label">Department</span>
                                <span className="premium-profile-stat-value">{formData.department}</span>
                            </div>
                            <div className="premium-stat-row">
                                <span className="premium-stat-label">Security Tier</span>
                                <span className="premium-pill success" style={{ padding: '3px 10px', fontSize: '11px' }}>Level 1 Verified</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Security Card */}
                    <div className="premium-glass-card">
                        <div className="premium-section-title">
                            <span className="material-symbols-rounded">security</span>
                            Security & Access
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--t-3)', marginBottom: '1.25rem' }}>
                            Keep your account credentials secure. We recommend updating your password every 90 days.
                        </p>
                        <button className="premium-page-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowPasswordModal(true)}>
                            Change Account Password
                        </button>
                    </div>
                </div>

                {/* Column 2: Full Credentials List */}
                <div className="premium-glass-card">
                    <div className="premium-section-title">
                        <span className="material-symbols-rounded">badge</span>
                        Legal Identity & Credentials
                    </div>

                    <div className="premium-credential-grid">
                        <div className="premium-credential-item">
                            <label className="premium-credential-label">First Name</label>
                            {isEditing ? (
                                <input type="text" name="firstName" className="form-input premium-editable" value={formData.firstName} onChange={handleInputChange} />
                            ) : (
                                <span className="premium-credential-value">{formData.firstName}</span>
                            )}
                        </div>
                        <div className="premium-credential-item">
                            <label className="premium-credential-label">Middle Name</label>
                            {isEditing ? (
                                <input type="text" name="middleName" className="form-input premium-editable" value={formData.middleName} onChange={handleInputChange} />
                            ) : (
                                <span className="premium-credential-value">{formData.middleName || 'N/A'}</span>
                            )}
                        </div>
                        <div className="premium-credential-item">
                            <label className="premium-credential-label">Last Name</label>
                            {isEditing ? (
                                <input type="text" name="lastName" className="form-input premium-editable" value={formData.lastName} onChange={handleInputChange} />
                            ) : (
                                <span className="premium-credential-value">{formData.lastName}</span>
                            )}
                        </div>
                        <div className="premium-credential-item">
                            <label className="premium-credential-label">Sex</label>
                            <span className="premium-credential-value">{formData.sex}</span>
                        </div>
                        <div className="premium-credential-item">
                            <label className="premium-credential-label">Date of Birth</label>
                            <span className="premium-credential-value">{formData.birthDate}</span>
                        </div>
                        <div className="premium-credential-item">
                            <label className="premium-credential-label">Nationality</label>
                            <span className="premium-credential-value">{formData.nationality}</span>
                        </div>
                    </div>

                    <div className="premium-card-divider"></div>

                    <div className="premium-section-title">
                        <span className="material-symbols-rounded">contact_mail</span>
                        Contact & Communications
                    </div>

                    <div className="premium-credential-grid">
                        <div className="premium-credential-item" style={{ gridColumn: 'span 2' }}>
                            <label className="premium-credential-label">Email Address (Primary)</label>
                            <span className="premium-credential-value" style={{ color: 'var(--ac)' }}>{formData.email}</span>
                        </div>
                        <div className="premium-credential-item">
                            <label className="premium-credential-label">Phone Number</label>
                            {isEditing ? (
                                <input type="tel" name="phone" className="form-input premium-editable" value={formData.phone} onChange={handleInputChange} />
                            ) : (
                                <span className="premium-credential-value">{formData.phone}</span>
                            )}
                        </div>
                        <div className="premium-credential-item">
                            <label className="premium-credential-label">Institutional Status</label>
                            <span className="premium-pill info" style={{ alignSelf: 'start', marginTop: '4px' }}>{formData.status}</span>
                        </div>
                        <div className="premium-credential-item" style={{ gridColumn: 'span 2' }}>
                            <label className="premium-credential-label">Residential Address</label>
                            {isEditing ? (
                                <input type="text" name="address" className="form-input premium-editable" value={formData.address} onChange={handleInputChange} />
                            ) : (
                                <span className="premium-credential-value">{formData.address}</span>
                            )}
                        </div>
                    </div>

                    <div className="premium-card-divider"></div>

                    <div className="premium-section-title">
                        <span className="material-symbols-rounded">app_registration</span>
                        Permits & Identifiers
                    </div>

                    <div className="premium-credential-grid">
                        <div className="premium-credential-item">
                            <label className="premium-credential-label">Driver's License No.</label>
                            <span className="premium-credential-value">{formData.idNumber}</span>
                        </div>
                        <div className="premium-credential-item">
                            <label className="premium-credential-label">ID Expiration</label>
                            <span className="premium-credential-value" style={{ borderBottom: '2px solid rgba(239, 68, 68, 0.2)', paddingBottom: '4px' }}>{formData.expirationDate}</span>
                        </div>
                        <div className="premium-credential-item">
                            <label className="premium-credential-label">Academic Program</label>
                            <span className="premium-credential-value">BS Computer Science</span>
                        </div>
                        <div className="premium-credential-item">
                            <label className="premium-credential-label">Year Level</label>
                            <span className="premium-credential-value">4th Year</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal (Re-used from previous, updated for design) */}
            {showPasswordModal && (
                <div className="modal-backdrop active" onClick={() => setShowPasswordModal(false)}>
                    <div className="modal premium-glass-card" onClick={e => e.stopPropagation()} style={{ border: 'none', maxWidth: '450px' }}>
                        <header className="modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="premium-noti-icon-box premium-pill warning" style={{ width: '40px', height: '40px' }}>
                                    <span className="material-symbols-rounded">lock_reset</span>
                                </div>
                                <h2 className="modal-title">Security Settings</h2>
                            </div>
                            <button className="modal-close" onClick={() => setShowPasswordModal(false)}>
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </header>
                        <div className="modal-body" style={{ padding: '1.5rem 0' }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--t-3)', marginBottom: '1.5rem' }}>Enter your current password to authorize this sensitive change.</p>
                            
                            <form id="passwordForm" onSubmit={handlePasswordChange} style={{ display: 'grid', gap: '1.25rem' }}>
                                <div className="form-group mb-0">
                                    <label className="form-label">Current Password</label>
                                    <input
                                        type="password"
                                        className="form-input premium-editable"
                                        placeholder="Enter current password"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="form-group mb-0">
                                    <label className="form-label">New Password</label>
                                    <input
                                        type="password"
                                        className="form-input premium-editable"
                                        placeholder="Min. 8 characters"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                        required
                                        minLength={8}
                                    />
                                </div>
                                <div className="form-group mb-0">
                                    <label className="form-label">Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="form-input premium-editable"
                                        placeholder="Repeat new password"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        required
                                    />
                                </div>
                            </form>
                        </div>
                        <footer className="modal-footer" style={{ borderTop: 'none', padding: '1rem 0 0' }}>
                            <button className="premium-page-btn" onClick={() => setShowPasswordModal(false)} style={{ flex: 1 }}>Cancel</button>
                            <button className="premium-page-btn active" type="submit" form="passwordForm" style={{ flex: 1 }}>Update Password</button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
}
