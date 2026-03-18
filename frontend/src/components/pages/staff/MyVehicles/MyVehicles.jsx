import { useState, useEffect } from 'react';
import api from '../../../../services/api';
import { useNotification } from '../../../../contexts/NotificationContext';

export default function StaffVehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { success, error } = useNotification();

    const [formData, setFormData] = useState({
        plateNumber: '',
        type: '',
        make: '',
        model: '',
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
                make: formData.make,
                model: formData.model,
                color: formData.color
            });
            success("Vehicle registered successfully! Pending approval.");
            setShowModal(false);
            setFormData({ plateNumber: '', type: '', make: '', model: '', color: '' });
            fetchVehicles();
        } catch (err) {
            console.error(err);
            error(err.response?.data?.detail || "Failed to register vehicle.");
        } finally {
            setSubmitting(false);
        }
    };

    const maxVehicles = 5;
    const remainingSlots = maxVehicles - vehicles.length;
    const activeVehicles = vehicles.filter(v => v.status === 'approved').length;
    const pendingVehicles = vehicles.filter(v => v.status === 'pending').length;

    const getVehicleIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'motorcycle': return '🏍️';
            case 'car': return '🚗';
            case 'van': return '🚐';
            case 'truck': return '🚚';
            default: return '🚘';
        }
    };

    return (
        <div className="premium-dashboard-container">
            {/* Page Header */}
            <div className="premium-page-header">
                <div>
                    <h1>Staff <span>Vehicles</span> 🚘</h1>
                    <p>Manage your registered vehicles and campus access permissions.</p>
                </div>
                <div className="premium-header-meta">
                    <div className="premium-id-badge">ID: <strong>{vehicles.length > 0 ? vehicles[0].plate_number : 'System Ready'}</strong></div>
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
                            {vehicle.make} {vehicle.model} • {vehicle.color}
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
                            <button className="premium-v2-btn edit">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                Edit
                            </button>
                            <button className="premium-v2-btn remove">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                Remove
                            </button>
                        </div>
                    </div>
                ))}

                {/* Add New Vehicle Premium Card */}
                {remainingSlots > 0 && (
                    <div className="premium-v2-add-card" onClick={() => setShowModal(true)}>
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
                    <h3>Staff Vehicle Registration Guidelines</h3>
                </div>
                <div className="premium-info-list">
                    <div className="premium-info-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 5 5L20 7"/></svg>
                        Staff can register up to {maxVehicles} vehicles
                    </div>
                    <div className="premium-info-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 5 5L20 7"/></svg>
                        Vehicle registration is valid for duration of employment
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

            {/* Add Vehicle Modal */}
            {showModal && (
                <div className="modal-backdrop active" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <header className="modal-header">
                            <h2 className="modal-title">Register New Vehicle</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </header>
                        <div className="modal-body">
                            <form id="addVehicleForm" onSubmit={handleSubmit}>
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
                                    <select
                                        name="type"
                                        className="form-select"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select type</option>
                                        <option value="car">Car</option>
                                        <option value="motorcycle">Motorcycle</option>
                                        <option value="van">Van</option>
                                    </select>
                                </div>
                                <div className="dashboard-grid dashboard-grid--2col">
                                    <div className="form-group">
                                        <label className="form-label">Brand</label>
                                        <input
                                            type="text"
                                            name="make"
                                            className="form-input"
                                            placeholder="Honda"
                                            value={formData.make}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Model</label>
                                        <input
                                            type="text"
                                            name="model"
                                            className="form-input"
                                            placeholder="Click 125i"
                                            value={formData.model}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Color</label>
                                    <input
                                        type="text"
                                        name="color"
                                        className="form-input"
                                        placeholder="Black"
                                        value={formData.color}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </form>
                        </div>
                        <footer className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowModal(false)} type="button">Cancel</button>
                            <button className="btn btn-primary" type="submit" form="addVehicleForm" disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit for Approval'}
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
}
