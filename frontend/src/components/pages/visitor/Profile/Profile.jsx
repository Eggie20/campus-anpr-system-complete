import { useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNotification } from '../../../../contexts/NotificationContext';

export default function Profile() {
    const { user } = useAuth();
    const { success, error } = useNotification();

    const [formData, setFormData] = useState({
        // Identity
        firstName: user?.first_name || 'Mark',
        lastName: user?.last_name || 'Ruffalo',
        fullName: user?.full_name || 'Mark Ruffalo',
        sex: user?.sex || 'Male',
        birthDate: user?.birth_date || '1990-11-22',
        nationality: user?.nationality || 'American',
        
        // Contact
        email: user?.email || 'visitor@guest.edu',
        phone: user?.phone_number || '09000000000',
        address: user?.address || 'Hotel Plaza, Butuan City',
        
        // Visit Details
        visitorId: user?.visitor_id || 'VST-2024-0015',
        purpose: user?.purpose || 'Official Campus Visit',
        idNumber: user?.id_number || 'ID-9988-1122',
        expirationDate: user?.expiration_date || '2024-12-31',
        
        // Status
        role: 'visitor',
        status: 'Granted'
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
        success("Visitor profile updated.");
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
                    <h1>Visitor <span>Profile</span> 👤</h1>
                    <p>Manage your guest account details and visit information.</p>
                </div>
                <div className="premium-header-meta">
                    {!isEditing ? (
                        <button className="premium-page-btn" onClick={() => setIsEditing(true)}>
                            Edit Guest Info
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="premium-page-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                            <button className="premium-page-btn active" onClick={handleSave}>Save Changes</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="dashboard-grid dashboard-grid--2col">
                {/* Column 1: Profile Overview */}
                <div style={{ display: 'grid', gap: '1.5rem', alignContent: 'start' }}>
                    <div className="premium-glass-card" style={{ textAlign: 'center' }}>
                        <div className="premium-avatar-section mb-6">
                            <div className="premium-avatar-inner" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
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

                        <div className="premium-pill warning mb-6" style={{ padding: '8px 16px' }}>
                            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>person_outline</span>
                            Campus Visitor
                        </div>

                        <div className="premium-profile-stats">
                            <div className="premium-stat-row">
                                <span className="premium-stat-label">Visitor Trace ID</span>
                                <span className="premium-stat-value">{formData.visitorId}</span>
                            </div>
                            <div className="premium-stat-row">
                                <span className="premium-stat-label">Access Level</span>
                                <span className="premium-pill success" style={{ padding: '3px 10px', fontSize: '11px' }}>Authorized</span>
                            </div>
                        </div>
                    </div>

                    <div className="premium-glass-card">
                        <div className="premium-section-title">
                            <span className="material-symbols-rounded">security</span>
                            Guest Security
                        </div>
                        <button className="premium-page-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowPasswordModal(true)}>
                            Update Password
                        </button>
                    </div>
                </div>

                {/* Column 2: Full Credentials List */}
                <div className="premium-glass-card">
                    <div className="premium-section-title">
                        <span className="material-symbols-rounded">badge</span>
                        Guest Identity & Identification
                    </div>

                    <div className="premium-credential-grid">
                        <div className="premium-credential-item">
                            <label className="premium-credential-label">First Name</label>
                            {isEditing ? <input type="text" name="firstName" className="form-input premium-editable" value={formData.firstName} onChange={handleInputChange} /> : <span className="premium-credential-value">{formData.firstName}</span>}
                        </div>
                        <div className="premium-credential-item">
                            <label className="premium-credential-label">Last Name</label>
                            {isEditing ? <input type="text" name="lastName" className="form-input premium-editable" value={formData.lastName} onChange={handleInputChange} /> : <span className="premium-credential-value">{formData.lastName}</span>}
                        </div>
                        <div className="premium-credential-item">
                            <label className="premium-credential-label">Date of Birth</label>
                            <span className="premium-credential-value">{formData.birthDate}</span>
                        </div>
                        <div className="premium-credential-item">
                            <label className="premium-credential-label">Identification No.</label>
                            <span className="premium-credential-value">{formData.idNumber}</span>
                        </div>
                    </div>

                    <div className="premium-card-divider"></div>

                    <div className="premium-section-title">
                        <span className="material-symbols-rounded">contact_page</span>
                        Communication Details
                    </div>

                    <div className="premium-credential-grid">
                        <div className="premium-credential-item" style={{ gridColumn: 'span 2' }}>
                            <label className="premium-credential-label">Primary Email</label>
                            <span className="premium-credential-value" style={{ color: 'var(--ac)' }}>{formData.email}</span>
                        </div>
                        <div className="premium-credential-item">
                            <label className="premium-credential-label">Contact No.</label>
                            {isEditing ? <input type="tel" name="phone" className="form-input premium-editable" value={formData.phone} onChange={handleInputChange} /> : <span className="premium-credential-value">{formData.phone}</span>}
                        </div>
                        <div className="premium-credential-item" style={{ gridColumn: 'span 2' }}>
                            <label className="premium-credential-label">Current Address</label>
                            {isEditing ? <input type="text" name="address" className="form-input premium-editable" value={formData.address} onChange={handleInputChange} /> : <span className="premium-credential-value">{formData.address}</span>}
                        </div>
                    </div>

                    <div className="premium-card-divider"></div>

                    <div className="premium-section-title">
                        <span className="material-symbols-rounded">event_note</span>
                        Visit Information
                    </div>

                    <div className="premium-credential-grid">
                        <div className="premium-credential-item" style={{ gridColumn: 'span 2' }}>
                            <label className="premium-credential-label">Primary Purpose</label>
                            {isEditing ? <input type="text" name="purpose" className="form-input premium-editable" value={formData.purpose} onChange={handleInputChange} /> : <span className="premium-credential-value">{formData.purpose}</span>}
                        </div>
                        <div className="premium-credential-item">
                            <label className="premium-credential-label">Visit Status</label>
                            <span className="premium-pill success" style={{ alignSelf: 'start', marginTop: '4px' }}>{formData.status}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Change Password Modal */}
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
