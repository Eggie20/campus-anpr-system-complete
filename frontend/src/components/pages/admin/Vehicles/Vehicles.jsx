import { useState } from 'react';
import './Vehicles.css';

// Mock data with enhanced fields
const initialVehicles = [
    { 
        id: 1, plate: 'ABC 1234', model: 'Toyota Vios • White', owner: 'Dr. Maria Santos', role: 'Faculty', 
        type: 'car', status: 'Registered', onCampus: true, lastSeen: { gate: 'Main Gate', time: '10:23 AM' }, 
        expiryDate: '2026-03-09', icon: 'directions_car' 
    },
    { 
        id: 2, plate: 'XYZ 5678', model: 'Honda Click 125i • Black', owner: 'John Dela Cruz', role: 'Student', 
        type: 'motorcycle', status: 'Registered', onCampus: false, lastSeen: { gate: 'Back Gate', time: '01:08 AM' }, 
        expiryDate: '2026-04-02', icon: 'motorcycle' 
    },
    { 
        id: 3, plate: 'DEF 9012', model: 'Honda Civic • Silver', owner: 'Prof. Jose Cruz', role: 'Faculty', 
        type: 'car', status: 'Expired', onCampus: false, lastSeen: { gate: 'Main Gate', time: 'Mar 16' }, 
        expiryDate: '2026-01-01', icon: 'directions_car' 
    },
    { 
        id: 4, plate: 'GHI 3456', model: 'Toyota Hiace • White', owner: 'Unassigned', role: 'None', 
        type: 'other', status: 'Pending', onCampus: false, lastSeen: { gate: 'Main Gate', time: 'Mar 15' }, 
        expiryDate: '2026-12-31', icon: 'airport_shuttle' 
    },
];

export default function Vehicles() {
    const [vehicles, setVehicles] = useState(initialVehicles);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [onCampusOnly, setOnCampusOnly] = useState(false);
    const [gateFilter, setGateFilter] = useState('');

    // Stats based on mockups
    const stats = {
        total: { count: 89, breakdown: 'Cars: 54 • Bikes: 29 • Other: 6' },
        active: { count: 82, label: 'All valid' },
        pending: { count: 5, label: 'Awaiting review' },
        expiry: { expired: 2, expiringSoon: 7 },
        onCampus: { total: 27, main: 14, back: 13 }
    };

    const filteredVehicles = vehicles.filter(vehicle => {
        const matchesSearch = vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             vehicle.owner.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter ? vehicle.type === typeFilter : true;
        const matchesStatus = statusFilter ? vehicle.status.toLowerCase() === statusFilter.toLowerCase() : true;
        const matchesOnCampus = onCampusOnly ? vehicle.onCampus : true;
        const matchesGate = gateFilter ? vehicle.lastSeen.gate === gateFilter : true;
        
        return matchesSearch && matchesType && matchesStatus && matchesOnCampus && matchesGate;
    });

    const getExpiryColor = (dateStr) => {
        const today = new Date();
        const expiryDate = new Date(dateStr);
        const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'text-error';
        if (diffDays <= 30) return 'text-warning';
        return 'text-success';
    };

    const StatCard = ({ title, count, subtitle, variant, breakdown }) => (
        <div className={`stat-widget stat-widget--${variant}`}>
            <div className="stat-widget__label">{title}</div>
            <div className={`stat-widget__value ${variant === 'danger' ? 'text-error' : variant === 'success' ? 'text-success' : ''}`}>
                {count}
            </div>
            {breakdown ? (
                <div className="stat-widget__breakdown">{breakdown}</div>
            ) : (
                <div className={`stat-widget__subtitle ${subtitle.includes('expiring') ? 'text-warning' : subtitle.includes('valid') ? 'text-success' : 'text-warning'}`}>
                    {subtitle}
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* Page Header */}
            <div className="premium-page-header">
                <div>
                    <h1>Vehicle <span>Management</span> 🚗</h1>
                    <p>Monitor real-time campus occupancy and vehicle registrations.</p>
                </div>
                <div className="premium-header-meta">
                    <button className="premium-page-btn active" onClick={() => setShowModal(true)}>
                        <span className="material-symbols-rounded">add_circle</span>
                        Register Vehicle
                    </button>
                </div>
            </div>

            {/* Mockup-Accurate Stats Grid */}
            <div className="dashboard-grid dashboard-grid--5col mb-8">
                <StatCard title="Total registered" count={stats.total.count} breakdown={stats.total.breakdown} variant="info" />
                <StatCard title="Active permits" count={stats.active.count} subtitle={stats.active.label} variant="info" />
                <StatCard title="Pending approval" count={stats.pending.count} subtitle={stats.pending.label} variant="info" />
                <StatCard title="Expired / expiring" count={stats.expiry.expired} subtitle={`+${stats.expiry.expiringSoon} expiring in 30d`} variant="danger" />
                <StatCard title="On campus now" count={stats.onCampus.total} breakdown={`Main: ${stats.onCampus.main} • Back: ${stats.onCampus.back}`} variant="success" />
            </div>

            {/* Enhanced Filter Bar */}
            <div className="filter-bar mb-8">
                <div className="filter-row">
                    <div className="filter-item filter-item--large relative">
                        <span className="material-symbols-rounded filter-search-icon">search</span>
                        <input
                            type="text"
                            className="premium-editable search-with-icon"
                            placeholder="Search by plate, brand, or owner..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-item">
                        <select className="premium-editable" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                            <option value="">Vehicle type</option>
                            <option value="car">Car</option>
                            <option value="motorcycle">Motorcycle</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="filter-item">
                        <select className="premium-editable" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="">Status: All</option>
                            <option value="registered">Registered</option>
                            <option value="pending">Pending</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                    <div className="filter-item">
                        <select className="premium-editable" value={gateFilter} onChange={(e) => setGateFilter(e.target.value)}>
                            <option value="">All gates</option>
                            <option value="Main Gate">Main Gate</option>
                            <option value="Back Gate">Back Gate</option>
                        </select>
                    </div>
                    <div className="filter-item filter-item--toggle">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={onCampusOnly} 
                                onChange={(e) => setOnCampusOnly(e.target.checked)} 
                            />
                            <span className="text-sm">Currently on campus</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Vehicles Grid */}
            <div className="dashboard-grid dashboard-grid--auto mb-8">
                {filteredVehicles.map(vehicle => (
                    <div key={vehicle.id} className="stat-widget vehicle-card-premium">
                        <div className="flex justify-between items-start mb-6">
                            <span className="material-symbols-rounded" style={{ fontSize: '32px', color: 'var(--text-secondary)' }}>
                                {vehicle.icon}
                            </span>
                            <span className={`premium-pill ${vehicle.status === 'Registered' ? 'success' : vehicle.status === 'Pending' ? 'warning' : 'danger'}`}>
                                {vehicle.status}
                            </span>
                        </div>
                        
                        <div className="mb-4">
                            <div className="vehicle-plate-main">{vehicle.plate}</div>
                            <div className="vehicle-model-sub">{vehicle.model}</div>
                        </div>

                        <div className="stat-card-divider"></div>

                        <div className="vehicle-info-grid">
                            <div className="vehicle-info-row">
                                <span className="label">Owner</span>
                                <span className="value">{vehicle.owner}</span>
                            </div>
                            <div className="vehicle-info-row">
                                <span className="label">Role</span>
                                <span className="value">{vehicle.role}</span>
                            </div>
                            <div className="vehicle-info-row">
                                <span className="label">Status</span>
                                <span className="value flex items-center gap-2">
                                    <span className={`stat-dot ${vehicle.onCampus ? 'active' : 'inactive'}`}></span>
                                    {vehicle.onCampus ? 'On campus' : 'Not on campus'}
                                </span>
                            </div>
                            <div className="vehicle-info-row">
                                <span className="label">Last seen</span>
                                <span className="value">{vehicle.lastSeen.gate} • {vehicle.lastSeen.time}</span>
                            </div>
                            <div className="vehicle-info-row">
                                <span className="label">Permit expires</span>
                                <span className={`value ${getExpiryColor(vehicle.expiryDate)}`}>
                                    {new Date(vehicle.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    {getExpiryColor(vehicle.expiryDate) !== 'text-success' && (
                                        <span className="material-symbols-rounded" style={{ fontSize: '14px', marginLeft: '4px' }}>
                                            {getExpiryColor(vehicle.expiryDate) === 'text-error' ? 'close' : 'warning'}
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button className="premium-page-btn" style={{ flex: 1 }}>Logs</button>
                            <button className="premium-page-btn active" style={{ flex: 1 }}>Details</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Placeholder */}
            <div className="flex justify-between items-center mt-8">
                <span className="text-sm" style={{ color: 'var(--t-3)' }}>Current View: 1-6 of {stats.total.count} records</span>
                <div className="flex gap-2">
                    <button className="premium-page-btn" disabled><span className="material-symbols-rounded">chevron_left</span></button>
                    <button className="premium-page-btn active">1</button>
                    <button className="premium-page-btn">2</button>
                    <button className="premium-page-btn"><span className="material-symbols-rounded">chevron_right</span></button>
                </div>
            </div>

            {/* Add Vehicle Modal */}
            {showModal && (
                <div className="modal-backdrop active" onClick={() => setShowModal(false)}>
                    <div className="modal premium-glass-card" onClick={e => e.stopPropagation()} style={{ border: 'none', maxWidth: '500px' }}>
                        <header className="modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="premium-noti-icon-box premium-pill success" style={{ width: '40px', height: '40px' }}>
                                    <span className="material-symbols-rounded">add_circle</span>
                                </div>
                                <h2 className="modal-title">Register New Vehicle</h2>
                            </div>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </header>
                        <div className="modal-body" style={{ padding: '1.5rem 0' }}>
                            <form id="addVehicleForm" onSubmit={(e) => { e.preventDefault(); setShowModal(false); }} style={{ display: 'grid', gap: '1.25rem' }}>
                                <div className="form-group mb-0">
                                    <label className="form-label">Plate Number</label>
                                    <input type="text" className="form-input premium-editable" placeholder="e.g. ABC 1234" required />
                                </div>
                                <div className="form-group mb-0">
                                    <label className="form-label">Classification</label>
                                    <select className="form-select premium-editable" required>
                                        <option value="">Select vehicle type</option>
                                        <option value="car">Passenger Car</option>
                                        <option value="motorcycle">Motorcycle</option>
                                        <option value="van">Utility Van</option>
                                    </select>
                                </div>
                                <div className="premium-credential-grid" style={{ marginBottom: 0 }}>
                                    <div className="form-group mb-0">
                                        <label className="form-label">Brand/Make</label>
                                        <input type="text" className="form-input premium-editable" placeholder="Toyota / Honda" required />
                                    </div>
                                    <div className="form-group mb-0">
                                        <label className="form-label">Model Name</label>
                                        <input type="text" className="form-input premium-editable" placeholder="Vios / Click" required />
                                    </div>
                                </div>
                                <div className="form-group mb-0">
                                    <label className="form-label">Assigned Owner</label>
                                    <select className="form-select premium-editable" required>
                                        <option value="">Link to registered user</option>
                                        <option value="2">Dr. Maria Santos (Faculty)</option>
                                        <option value="3">John Dela Cruz (Student)</option>
                                        <option value="5">Anna Reyes (Student)</option>
                                        <option value="6">Prof. Jose Cruz (Faculty)</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <footer className="modal-footer" style={{ borderTop: 'none', padding: '1rem 0 0' }}>
                            <button className="premium-page-btn" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                            <button className="premium-page-btn active" type="submit" form="addVehicleForm" style={{ flex: 1 }}>Register Vehicle</button>
                        </footer>
                    </div>
                </div>
            )}
        </>
    );
}
