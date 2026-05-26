import { useState, useEffect } from 'react';
import api from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNotification } from '../../../../contexts/NotificationContext';
import { VEHICLE_TYPES, VEHICLE_BRANDS, VEHICLE_COLORS, getVehicleIcon } from '../../../../constants/vehicleConstants';

export default function VisitorVehicles() {
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [removingVehicle, setRemovingVehicle] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const { success, error } = useNotification();

    const [formData, setFormData] = useState({
        plateNumber: '',
        type: '',
        brand: '',
        color: ''
    });

    const fetchVehicles = async () => {
        try {
            const res = await api.get('/vehicles/me');
            setVehicles(res.data);
        } catch (err) {
            console.error("Failed to fetch vehicles", err);
            error("Could not load vehicles.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/vehicles/', {
                plate_number: formData.plateNumber,
                type: formData.type,
                brand: formData.brand,
                color: formData.color
            });
            success("Vehicle registered successfully! Pending approval.");
            setShowModal(false);
            setFormData({ plateNumber: '', type: '', brand: '', color: '' });
            fetchVehicles();
        } catch (err) {
            console.error(err);
            error(err.response?.data?.detail || "Failed to register vehicle.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditClick = (vehicle) => {
        setEditingVehicle(vehicle);
        setFormData({
            plateNumber: vehicle.plate_number,
            type: vehicle.type,
            brand: vehicle.brand,
            color: vehicle.color || ''
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.patch(`/vehicles/${editingVehicle.id}`, {
                plate_number: formData.plateNumber,
                type: formData.type,
                brand: formData.brand,
                color: formData.color
            });
            success("Vehicle updated successfully!");
            setShowEditModal(false);
            setEditingVehicle(null);
            setFormData({ plateNumber: '', type: '', brand: '', color: '' });
            fetchVehicles();
        } catch (err) {
            console.error(err);
            error(err.response?.data?.detail || "Failed to update vehicle.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveClick = (vehicle) => {
        setRemovingVehicle(vehicle);
        setShowDeleteModal(true);
    };

    const handleRemoveConfirm = async () => {
        setSubmitting(true);
        try {
            await api.delete(`/vehicles/${removingVehicle.id}`);
            success("Vehicle removed successfully.");
            setShowDeleteModal(false);
            setRemovingVehicle(null);
            fetchVehicles();
        } catch (err) {
            console.error(err);
            error("Failed to remove vehicle.");
        } finally {
            setSubmitting(false);
        }
    };

    const maxVehicles = 1; // Visitors typically 1
    const remainingSlots = maxVehicles - vehicles.length;
    const activeVehicles = vehicles.filter(v => v.status === 'approved').length;
    const pendingVehicles = vehicles.filter(v => v.status === 'pending').length;

    const getRoleID = () => {
        return user?.visitor_id || user?.student_id || user?.staff_id || 'N/A';
    };

    return (
        <div className="premium-dashboard-container">
            {/* Page Header */}
            <div className="premium-page-header">
                <div>
                    <h1>Visitor <span>Vehicles</span> 🚘</h1>
                    <p>Manage your registered vehicles and campus access permissions.</p>
                </div>
                <div className="premium-header-meta">
                    <div className="premium-id-badge">ID: <strong>{getRoleID()}</strong></div>
                    <div className="premium-status-active">System Connected</div>
                </div>
            </div>

            {/* Vehicle Stats Grid */}
            <div className="premium-stats-grid">
                <div className="premium-stat-card c1">
                    <div className="premium-stat-header">
                        <span className="premium-stat-label">Total Registered</span>
                        <div className="premium-stat-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 16H9m10 0h3v-3.15a1 1 0 00-.84-.99L16 11l-2.7-3.6a1 1 0 00-.8-.4H5a2 2 0 00-2 2v7h3"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>
                        </div>
                    </div>
                    <div className="premium-stat-value">{vehicles.length}</div>
                    <div className="premium-stat-sub">
                        <span className="neutral">of {maxVehicles} total slots</span>
                    </div>
                </div>

                <div className="premium-stat-card c2">
                    <div className="premium-stat-header">
                        <span className="premium-stat-label">Active Permits</span>
                        <div className="premium-stat-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                        </div>
                    </div>
                    <div className="premium-stat-value">{activeVehicles}</div>
                    <div className="premium-stat-sub">
                        <span className="up">Verified</span>
                    </div>
                </div>

                <div className="premium-stat-card c3">
                    <div className="premium-stat-header">
                        <span className="premium-stat-label">Pending Approval</span>
                        <div className="premium-stat-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        </div>
                    </div>
                    <div className="premium-stat-value">{pendingVehicles}</div>
                    <div className="premium-stat-sub">
                        <span className="neutral">Awaiting review</span>
                    </div>
                </div>

                <div className="premium-stat-card c4">
                    <div className="premium-stat-header">
                        <span className="premium-stat-label">Available Slots</span>
                        <div className="premium-stat-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m-7-7h14"/></svg>
                        </div>
                    </div>
                    <div className="premium-stat-value">{remainingSlots}</div>
                    <div className="premium-stat-sub">
                        <span className="neutral">Slot{remainingSlots !== 1 ? 's' : ''} left</span>
                    </div>
                </div>
            </div>

            {/* Main Grid for Vehicles */}
            <div className="premium-dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="premium-vehicle-card-v2">
                        <div className="premium-card-v2-header">
                            <div className="premium-v2-icon">
                                {getVehicleIcon(vehicle.type)}
                            </div>
                            <div className={`premium-v2-status ${vehicle.status === 'approved' ? 'approved' : 'pending'}`}>
                                {vehicle.status === 'approved' ? 'Active' : 'Pending'}
                            </div>
                        </div>

                        <div className="premium-v2-plate">{vehicle.plate_number}</div>
                        <div className="premium-v2-info">
                            {vehicle.brand} • {vehicle.color}
                        </div>

                        <div className="premium-v2-grid">
                            <div className="premium-v2-item">
                                <label>Registered On</label>
                                <span>{new Date(vehicle.registration_date).toLocaleDateString()}</span>
                            </div>
                            <div className="premium-v2-item">
                                <label>Expiry Date</label>
                                <span>{vehicle.expiry_date ? new Date(vehicle.expiry_date).toLocaleDateString() : 'Pending Approval'}</span>
                            </div>
                        </div>

                        <div className="premium-v2-actions">
                            <button className="premium-v2-btn edit" onClick={() => handleEditClick(vehicle)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                Edit
                            </button>
                            <button className="premium-v2-btn remove" onClick={() => handleRemoveClick(vehicle)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                Remove
                            </button>
                        </div>
                    </div>
                ))}

                {/* Add New Vehicle Premium Card */}
                {remainingSlots > 0 && (
                    <div className="premium-v2-add-card" onClick={() => {
                        setFormData({ plateNumber: '', type: '', brand: '', color: '' });
                        setShowModal(true);
                    }}>
                        <div className="premium-v2-add-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14m-7-7h14"/></svg>
                        </div>
                        <h3>Add New Vehicle</h3>
                        <p>{remainingSlots} slot{remainingSlots > 1 ? 's' : ''} remaining</p>
                    </div>
                )}
            </div>

            {/* Guidelines Panel Premium */}
            <div className="premium-info-panel">
                <div className="premium-info-header">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>
                    <h3>Visitor Vehicle Registration Guidelines</h3>
                </div>
                <div className="premium-info-list">
                    <div className="premium-info-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 5 5L20 7"/></svg>
                        Visitors can register up to {maxVehicles} vehicles
                    </div>
                    <div className="premium-info-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 5 5L20 7"/></svg>
                        Vehicle registration is valid for duration of visit
                    </div>
                    <div className="premium-info-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 5 5L20 7"/></svg>
                        Please ensure plate number matches your OR/CR
                    </div>
                    <div className="premium-info-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 5 5L20 7"/></svg>
                        Vehicle registrations require admin approval
                    </div>
                </div>
            </div>

            {/* Register/Edit Vehicle Modal */}
            {(showModal || showEditModal) && (
                <div className="modal-backdrop active" onClick={() => { setShowModal(false); setShowEditModal(false); }}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '95%' }}>
                        <header className="modal-header">
                            <h2 className="modal-title">{showEditModal ? 'Edit Vehicle Details' : 'Register New Vehicle'}</h2>
                            <button className="modal-close" onClick={() => { setShowModal(false); setShowEditModal(false); }}>✕</button>
                        </header>
                        <div className="modal-body">
                            <form id="vehicleForm" onSubmit={showEditModal ? handleEditSubmit : handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Plate Number</label>
                                    <input
                                        type="text"
                                        name="plateNumber"
                                        className="form-input"
                                        placeholder="ABC 1234"
                                        value={formData.plateNumber}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Vehicle Type</label>
                                    <div className="vehicle-type-grid">
                                      {VEHICLE_TYPES.map(v => (
                                        <div
                                          key={v.value}
                                          className={`vehicle-opt ${formData.type === v.value ? 'active' : ''}`}
                                          onClick={() => setFormData(prev => ({ ...prev, type: v.value }))}
                                        >
                                          <div className="v-icon">{v.icon}</div>
                                          <div className="v-label">{v.label}</div>
                                          <div className="v-check">✓</div>
                                        </div>
                                      ))}
                                    </div>
                                </div>
                                <div className="dashboard-grid dashboard-grid--2col">
                                    <div className="form-group">
                                        <label className="form-label">Brand</label>
                                        <select
                                            name="brand"
                                            className="form-input"
                                            value={formData.brand}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select Brand</option>
                                            {VEHICLE_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                                            <option value="Other">Other (not listed)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Color</label>
                                        <select
                                            name="color"
                                            className="form-input"
                                            value={formData.color}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select Color</option>
                                            {VEHICLE_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                                            <option value="Other">Other (not listed)</option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <footer className="modal-footer" style={{ background: 'transparent', borderTop: 'none', padding: '1.5rem 0 0', display: 'flex', gap: '1rem' }}>
                            <button type="button" className="premium-page-btn" onClick={() => { setShowModal(false); setShowEditModal(false); }} style={{ flex: 1, padding: '12px', justifyContent: 'center' }}>Cancel</button>
                            <button className="premium-page-btn active" type="submit" form="vehicleForm" disabled={submitting} style={{ flex: 1, padding: '12px', justifyContent: 'center' }}>
                                {submitting ? 'Processing...' : (showEditModal ? 'Save Changes' : 'Submit for Approval')}
                            </button>
                        </footer>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-backdrop active" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px', width: '90%' }}>
                        <header className="modal-header">
                            <h2 className="modal-title">Remove Vehicle</h2>
                            <button className="modal-close" onClick={() => setShowDeleteModal(false)}>✕</button>
                        </header>
                        <div className="modal-body">
                            <p style={{ color: 'var(--t-2)', textAlign: 'center', margin: '1rem 0' }}>
                                Are you sure you want to remove vehicle <strong style={{ color: 'var(--t-1)' }}>{removingVehicle?.plate_number}</strong>?
                                <br /><br />
                                This action cannot be undone and will revoke campus access for this vehicle.
                            </p>
                        </div>
                        <footer className="modal-footer" style={{ background: 'transparent', borderTop: 'none', padding: '1rem 0 0', display: 'flex', gap: '1rem' }}>
                            <button className="premium-page-btn" onClick={() => setShowDeleteModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                            <button className="premium-page-btn danger active" onClick={handleRemoveConfirm} disabled={submitting} style={{ flex: 1, justifyContent: 'center', background: '#ef4444', color: 'white', borderColor: 'transparent' }}>
                                {submitting ? 'Removing...' : 'Confirm Remove'}
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
}
