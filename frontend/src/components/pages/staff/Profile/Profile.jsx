import { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNotification } from '../../../../contexts/NotificationContext';
import ConfirmChangesModal from '../../../common/Modal/ConfirmChangesModal';

const FIELD_LABELS = {
    firstName: 'First Name',
    middleName: 'Middle Name',
    lastName: 'Last Name',
    sex: 'Sex',
    birthDate: 'Date of Birth',
    nationality: 'Nationality',
    phone: 'Phone Number',
    address: 'Address',
    staffId: 'Employee ID',
    department: 'Department',
    jobTitle: 'Job Title',
    idNumber: 'ID Number',
    expirationDate: 'ID Expiry',
};

const COOLDOWN_DAYS = 30;

export default function Profile() {
    const { user } = useAuth();
    const { success, error } = useNotification();

    const [formData, setFormData] = useState({
        firstName: '', middleName: '', lastName: '',
        fullName: 'N/A', sex: 'Not Specified', birthDate: 'N/A', nationality: 'Filipino',
        email: 'N/A', phone: 'N/A', address: 'N/A',
        staffId: 'N/A', department: 'N/A', jobTitle: 'N/A',
        idNumber: 'N/A', expirationDate: 'N/A',
        role: 'staff', status: 'Permanent'
    });

    const [originalData, setOriginalData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    useEffect(() => {
        if (!user) return;
        const hydrateData = (data) => {
            setFormData({
                firstName: data.first_name || '',
                middleName: data.middle_name || '',
                lastName: data.last_name || '',
                fullName: data.full_name || 'N/A',
                sex: data.sex || 'Not Specified',
                birthDate: data.birth_date || 'N/A',
                nationality: data.nationality || 'Filipino',
                email: data.email || 'N/A',
                phone: data.phone_number || 'N/A',
                address: data.address || 'N/A',
                staffId: data.staff_id || 'N/A',
                department: data.staff_department || data.department || 'N/A',
                jobTitle: data.job_title || 'N/A',
                idNumber: data.id_number || 'N/A',
                expirationDate: data.expiration_date || 'N/A',
                role: data.role || 'staff',
                status: data.status || 'Permanent'
            });
        };
        const token = localStorage.getItem('token');
        if (token) {
            fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => { if (data?.full_name) hydrateData(data); else hydrateData(user); })
            .catch(() => hydrateData(user));
        } else {
            hydrateData(user);
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;
        const key = `profileLastEdited_${user.id || user.email}`;
        const lastEdit = localStorage.getItem(key);
        if (lastEdit) {
            const remaining = (COOLDOWN_DAYS * 86400000) - (Date.now() - parseInt(lastEdit, 10));
            setCooldownRemaining(remaining > 0 ? Math.ceil(remaining / 86400000) : 0);
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const startEditing = () => { setOriginalData({ ...formData }); setIsEditing(true); };
    const cancelEditing = () => { if (originalData) setFormData({ ...originalData }); setIsEditing(false); setOriginalData(null); };
    const handleApplyChanges = () => setShowConfirmModal(true);

    const handleConfirmSave = () => {
        setShowConfirmModal(false);
        setIsEditing(false);
        const key = `profileLastEdited_${user?.id || user?.email}`;
        localStorage.setItem(key, Date.now().toString());
        setCooldownRemaining(COOLDOWN_DAYS);
        setOriginalData(null);
        success("Professional credentials updated successfully!");
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) { error("Passwords do not match."); return; }
        if (passwordForm.newPassword.length < 8) { error("Password must be at least 8 characters."); return; }
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        success("Security credentials updated. Your password has been changed.");
    };

    const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const renderField = (name, label, opts = {}) => {
        const { type = 'text', readOnly = false, selectOptions, span2 = false } = opts;
        const value = formData[name];
        const isNA = !value || value === 'N/A' || value === 'Not Specified';
        return (
            <div className="premium-credential-item" style={span2 ? { gridColumn: 'span 2' } : {}}>
                <label className="premium-credential-label">{label}</label>
                {isEditing && !readOnly ? (
                    selectOptions ? (
                        <select name={name} className="form-input premium-editable" value={value} onChange={handleInputChange} style={{ appearance: 'auto', cursor: 'pointer' }}>
                            {selectOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    ) : (
                        <input type={type} name={name} className="form-input premium-editable"
                            value={isNA ? '' : value} placeholder={`Enter ${label.toLowerCase()}`} onChange={handleInputChange} />
                    )
                ) : (
                    <span className="premium-credential-value" style={isNA ? { opacity: 0.4, fontStyle: 'italic' } : {}}>
                        {value || 'N/A'}
                    </span>
                )}
            </div>
        );
    };

    return (
        <div className="premium-dashboard-container">
            <div className="premium-page-header">
                <div>
                    <h1>Staff <span>Profile</span> 👤</h1>
                    <p>Professional account overview and institutional credentials.</p>
                </div>
                <div className="premium-header-meta">
                    {!isEditing ? (
                        <button className="premium-page-btn" onClick={startEditing} disabled={cooldownRemaining > 0}
                            title={cooldownRemaining > 0 ? `Locked for ${cooldownRemaining} more days` : 'Edit your profile'}>
                            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>edit</span>
                            {cooldownRemaining > 0 ? `Locked (${cooldownRemaining}d)` : 'Modify Profile'}
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="premium-page-btn" onClick={cancelEditing}>Cancel</button>
                            <button className="premium-page-btn active" onClick={handleApplyChanges}>Apply Changes</button>
                        </div>
                    )}
                </div>
            </div>

            {cooldownRemaining > 0 && !isEditing && (
                <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', padding: '0.75rem 1.25rem', display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '1.25rem', color: '#f59e0b' }}>lock_clock</span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--t-2)', margin: 0 }}>
                        Profile editing is locked. You can modify your credentials again in <strong style={{ color: '#f59e0b' }}>{cooldownRemaining} days</strong>.
                    </p>
                </div>
            )}

            <div className="dashboard-grid dashboard-grid--2col">
                <div style={{ display: 'grid', gap: '1.5rem', alignContent: 'start' }}>
                    <div className="premium-glass-card" style={{ textAlign: 'center' }}>
                        <div className="premium-avatar-section mb-6">
                            <div className="premium-avatar-inner" style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}>
                                {getInitials(formData.fullName)}
                            </div>
                            <div className="premium-online-status">
                                <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>check</span>
                            </div>
                        </div>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--t-1)', marginBottom: '0.25rem' }}>{formData.fullName}</h2>
                        <p style={{ color: 'var(--t-3)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>{formData.email}</p>
                        <div className="premium-pill secondary mb-6" style={{ padding: '8px 16px' }}>
                            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>badge</span>
                            Staff Member
                        </div>
                        <div className="premium-profile-stats">
                            <div className="premium-stat-row">
                                <span className="premium-stat-label">Employee ID</span>
                                <span className="premium-stat-value">{formData.staffId}</span>
                            </div>
                            <div className="premium-stat-row">
                                <span className="premium-stat-label">Department</span>
                                <span className="premium-stat-value">{formData.department}</span>
                            </div>
                            <div className="premium-stat-row">
                                <span className="premium-stat-label">Security Tier</span>
                                <span className="premium-pill success" style={{ padding: '3px 10px', fontSize: '11px' }}>Level 2 Verified</span>
                            </div>
                        </div>
                    </div>
                    <div className="premium-glass-card">
                        <div className="premium-section-title">
                            <span className="material-symbols-rounded">security</span>
                            Account Security
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--t-3)', marginBottom: '1.25rem' }}>
                            Keep your account credentials secure. Update your password regularly.
                        </p>
                        <button className="premium-page-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowPasswordModal(true)}>
                            Update Password
                        </button>
                    </div>
                </div>

                <div className="premium-glass-card">
                    <div className="premium-section-title">
                        <span className="material-symbols-rounded">person_search</span>
                        Legal & Civil Identity
                    </div>
                    <div className="premium-credential-grid">
                        {renderField('firstName', 'First Name')}
                        {renderField('middleName', 'Middle Name')}
                        {renderField('lastName', 'Last Name')}
                        {renderField('sex', 'Sex', { selectOptions: ['Male', 'Female', 'Not Specified'] })}
                        {renderField('birthDate', 'Date of Birth', { type: 'date' })}
                        {renderField('nationality', 'Nationality')}
                    </div>

                    <div className="premium-card-divider"></div>

                    <div className="premium-section-title">
                        <span className="material-symbols-rounded">alternate_email</span>
                        Professional Contacts
                    </div>
                    <div className="premium-credential-grid">
                        <div className="premium-credential-item" style={{ gridColumn: 'span 2' }}>
                            <label className="premium-credential-label">Campus Email</label>
                            <span className="premium-credential-value" style={{ color: 'var(--ac)' }}>{formData.email}</span>
                        </div>
                        {renderField('phone', 'Primary Phone', { type: 'tel' })}
                        {renderField('address', 'Address', { span2: true })}
                    </div>

                    <div className="premium-card-divider"></div>

                    <div className="premium-section-title">
                        <span className="material-symbols-rounded">admin_panel_settings</span>
                        Institutional Records
                    </div>
                    <div className="premium-credential-grid">
                        {renderField('staffId', 'Employment ID')}
                        {renderField('jobTitle', 'Job Title')}
                        {renderField('department', 'Department')}
                        {renderField('idNumber', 'ID Number')}
                        {renderField('expirationDate', 'ID Expiry', { type: 'date' })}
                        <div className="premium-credential-item">
                            <label className="premium-credential-label">Contract Term</label>
                            <span className="premium-credential-value">{formData.status}</span>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmChangesModal isOpen={showConfirmModal} original={originalData} updated={formData}
                fieldLabels={FIELD_LABELS} onConfirm={handleConfirmSave} onCancel={() => setShowConfirmModal(false)} cooldownDays={COOLDOWN_DAYS} />

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
                                <div className="form-group mb-0"><label className="form-label">Current Password</label>
                                    <input type="password" className="form-input premium-editable" placeholder="Enter current password"
                                        value={passwordForm.currentPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))} required />
                                </div>
                                <div className="form-group mb-0"><label className="form-label">New Password</label>
                                    <input type="password" className="form-input premium-editable" placeholder="Min. 8 characters"
                                        value={passwordForm.newPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))} required minLength={8} />
                                </div>
                                <div className="form-group mb-0"><label className="form-label">Confirm New Password</label>
                                    <input type="password" className="form-input premium-editable" placeholder="Repeat new password"
                                        value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))} required />
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
