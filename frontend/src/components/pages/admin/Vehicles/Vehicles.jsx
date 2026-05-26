import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import api from '../../../../services/api';
import { VEHICLE_TYPES, VEHICLE_BRANDS, VEHICLE_COLORS } from '../../../../constants/vehicleConstants';
import styles from './Vehicles.module.css';
import { usePrivacy } from '../../../../contexts/PrivacyContext';
import Swal from 'sweetalert2';
import ReportGeneratorModal from '../../../widgets/ReportGenerator/ReportGeneratorModal';

/* ------------------------------------------------------------------ */
/*  Custom Dropdown Component                                          */
/* ------------------------------------------------------------------ */
function FilterDropdown({ label, value, options, onChange, icon, isLarge = false }) {
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

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className={`premium-filter-dropdown ${isLarge ? 'is-large' : ''}`} ref={dropdownRef}>
            <button
                type="button"
                className={`premium-filter-btn ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    {icon && <span className="material-symbols-rounded btn-icon">{icon}</span>}
                    <span className="btn-label">{selectedOption ? selectedOption.label : label}</span>
                </div>
                <span className="material-symbols-rounded chevron">
                    {isOpen ? 'expand_less' : 'expand_more'}
                </span>
            </button>

            {isOpen && (
                <ul className="premium-filter-dropdown-menu">
                    {options.map((opt) => (
                        <li
                            key={opt.value}
                            className={`premium-dropdown-item ${value === opt.value ? 'selected' : ''}`}
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
                        >
                            <div className="flex items-center gap-2">
                                {opt.icon && <span style={{ fontSize: '1.1rem' }}>{opt.icon}</span>}
                                <span>{opt.label}</span>
                            </div>
                            {value === opt.value && <span className="material-symbols-rounded">check</span>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Skeleton helpers                                                   */
/* ------------------------------------------------------------------ */
function SkeletonLine({ width = '60%', height = '1.25rem' }) {
    return <div className={styles.skeleton} style={{ height, width }} />;
}

function SkeletonBlock({ width = '80%', height = '3rem' }) {
    return <div className={styles.skeleton} style={{ height, width }} />;
}

export default function Vehicles() {
    const { anonymizePlate, anonymizeName } = usePrivacy();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [onCampusOnly, setOnCampusOnly] = useState(false);
    const [gateFilter, setGateFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    // Sort state
    const [sortBy, setSortBy] = useState('last_seen');
    const [sortOrder, setSortOrder] = useState('desc');

    const loadVehicles = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/vehicles');
            setVehicles(res.data.vehicles || []);
            setLoadError(null);
        } catch (e) {
            setLoadError(e.response?.data?.detail || e.message || 'Failed to load vehicles');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadVehicles();
    }, [loadVehicles]);

    const MetricCard = ({ label, value, badgeText, badgeVariant, rows, subtext, isPending, children }) => (
        <div className={`${styles.metricCard} ${isPending ? styles.pendingCard : ''}`}>
            <div className={`vehicle-stat-badge vehicle-stat-badge--${badgeVariant}`}>
                {badgeText || 'Live'}
            </div>
            <div className={styles.metricCardLabel}>{label}</div>
            <div className={styles.metricCardValue}>{value}</div>
            <div className={styles.metricCardFooter}>
                {children ? children : (
                    rows ? (
                        rows.map((row, i) => (
                            <div key={i} className={styles.metricCardSubRow}>
                                <span>{row.label}</span>
                                <span className={styles.val}>{row.value}</span>
                            </div>
                        ))
                    ) : (
                        <div className={styles.metricCardSub}>
                            {subtext}
                        </div>
                    )
                )}
            </div>
        </div>
    );

    const stats = useMemo(() => {
        const total = vehicles.length;
        const pending = vehicles.filter(v => v.status === 'Pending').length;
        const active = vehicles.filter(v => v.status === 'Registered').length;
        const expired = vehicles.filter(v => v.status === 'Expired').length;
        const onCampus = vehicles.filter(v => v.onCampus).length;

        // Calculate expiring soon (within 30 days)
        const now = new Date();
        const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const expiringSoon = vehicles.filter(v => {
            if (v.status !== 'Registered' || !v.expiryDate) return false;
            const exp = new Date(v.expiryDate);
            return exp > now && exp <= thirtyDaysLater;
        }).length;

        const byType = vehicles.reduce((acc, v) => {
            const t = (v.type || 'other').toLowerCase();
            acc[t] = (acc[t] || 0) + 1;
            return acc;
        }, { car: 0, motorcycle: 0, van: 0, truck: 0, other: 0 });

        return {
            total: { count: total, byType },
            active: { count: active, label: 'Approved' },
            pending: { count: pending, label: 'Awaiting review' },
            expiry: { expired, expiringSoon },
            onCampus: { total: onCampus, main: onCampus, back: 0 }
        };
    }, [vehicles]);

    const handleApprove = (vehicleId) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (vehicle) initiateApprove(vehicle);
    };

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [vehicleToApprove, setVehicleToApprove] = useState(null);
    const [approving, setApproving] = useState(false);
    const [denying, setDenying] = useState(false);

    const initiateApprove = (vehicle) => {
        setVehicleToApprove(vehicle);
        setShowConfirmModal(true);
    };

    const handleConfirmApprove = async () => {
        if (!vehicleToApprove) return;
        setApproving(true);
        try {
            await api.patch(`/admin/vehicles/${vehicleToApprove.id}/approve`);
            await loadVehicles();
            setShowConfirmModal(false);

            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

            Swal.fire({
                title: 'Approved!',
                text: `Vehicle ${vehicleToApprove.plate} has been successfully registered.`,
                icon: 'success',
                background: isDark ? '#1e293b' : '#fff',
                color: isDark ? '#f8fafc' : '#0f172a',
                confirmButtonColor: '#3b82f6',
                iconColor: '#10b981',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            });

            setVehicleToApprove(null);
        } catch (e) {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            Swal.fire({
                title: 'Error',
                text: e.response?.data?.detail || e.message || 'Approve failed',
                icon: 'error',
                background: isDark ? '#1e293b' : '#fff',
                color: isDark ? '#f8fafc' : '#0f172a',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setApproving(false);
        }
    };

    const handleConfirmDeny = async () => {
        if (!vehicleToApprove) return;
        setDenying(true);
        try {
            await api.patch(`/admin/vehicles/${vehicleToApprove.id}/reject`);
            await loadVehicles();
            setShowConfirmModal(false);

            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

            Swal.fire({
                title: 'Rejected',
                text: `Registration for ${vehicleToApprove.plate} has been denied.`,
                icon: 'info',
                background: isDark ? '#1e293b' : '#fff',
                color: isDark ? '#f8fafc' : '#0f172a',
                confirmButtonColor: '#ef4444',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            });

            setVehicleToApprove(null);
        } catch (e) {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            Swal.fire({
                title: 'Error',
                text: e.response?.data?.detail || e.message || 'Action failed',
                icon: 'error',
                background: isDark ? '#1e293b' : '#fff',
                color: isDark ? '#f8fafc' : '#0f172a',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setDenying(false);
        }
    };

    const filteredVehicles = useMemo(() => {
        let results = vehicles.filter(vehicle => {
            const matchesSearch = vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vehicle.owner.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter ? vehicle.type === typeFilter : true;
            let matchesStatus = true;
            if (statusFilter) {
                const sf = statusFilter.toLowerCase();
                const st = vehicle.status.toLowerCase();
                matchesStatus = sf === 'registered' ? st === 'registered' : st === sf;
            }
            const matchesOnCampus = onCampusOnly ? vehicle.onCampus : true;
            return matchesSearch && matchesType && matchesStatus && matchesOnCampus;
        });

        if (gateFilter) {
            results = results.filter(v => v.last_gate === gateFilter);
        }
        if (roleFilter) {
            results = results.filter(v => v.owner_role?.toLowerCase() === roleFilter.toLowerCase());
        }

        // Sorting logic
        results.sort((a, b) => {
            let valA = a[sortBy];
            let valB = b[sortBy];

            // Handle nested or special fields
            if (sortBy === 'owner') valA = a.owner_name;
            if (sortBy === 'owner') valB = b.owner_name;
            if (sortBy === 'info') valA = a.brand;
            if (sortBy === 'info') valB = b.brand;

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return results;
    }, [vehicles, searchTerm, typeFilter, statusFilter, onCampusOnly, gateFilter, roleFilter, sortBy, sortOrder]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, typeFilter, statusFilter, onCampusOnly, gateFilter, roleFilter]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
    const currentVehicles = filteredVehicles.slice(startIndex, startIndex + itemsPerPage);

    const getVehicleIcon = (type) => {
        const map = {
            car: 'directions_car',
            motorcycle: 'two_wheeler',
            van: 'airport_shuttle',
            truck: 'local_shipping',
            other: 'commute',
        };
        return map[(type || 'other').toLowerCase()] || 'directions_car';
    };

    const getExpiryColor = (dateStr) => {
        const today = new Date();
        const expiryDate = new Date(dateStr);
        const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'var(--color-danger)';
        if (diffDays <= 30) return 'var(--color-warning)';
        return 'var(--color-success)';
    };

    const getDaysRemaining = (dateStr) => {
        const today = new Date();
        const expiryDate = new Date(dateStr);
        const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
        if (diffDays === 0) return 'Expires today';
        if (diffDays <= 30) return `${diffDays}d left`;
        const months = Math.floor(diffDays / 30);
        return `${months}mo ${diffDays % 30}d left`;
    };

    return (
        <>
            {/* ===== HEADER ===== */}
            <div className="premium-page-header">
                <div>
                    <h1>
                        Vehicle <span>Management</span> 🚗
                    </h1>
                    <p>
                        Monitor real-time campus occupancy and vehicle registrations.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        className={`premium-page-btn ${loading ? styles.isRefreshing : ''}`}
                        onClick={loadVehicles}
                        title="Refresh vehicle data"
                    >
                        <span className={`material-symbols-rounded ${loading ? styles.spinIcon : ''}`}>refresh</span>
                    </button>
                </div>
            </div>

            {/* ===== STAT CARDS ROW ===== */}
            <section className={styles.statCardsRow}>
                <MetricCard 
                    label="Total Registered" 
                    value={stats.total.count} 
                    badgeText="Live" 
                    badgeVariant="info"
                    subtext="Total unique plate records"
                />

                {/* -- Approved -- */}
                <MetricCard 
                    label="Approved Vehicles" 
                    value={stats.active.count} 
                    badgeText="Active" 
                    badgeVariant="success"
                    subtext="Regular access authorized"
                />

                {/* -- Pending -- */}
                <MetricCard 
                    label="Pending Approval" 
                    value={stats.pending.count} 
                    badgeText={stats.pending.count > 0 ? 'Awaiting' : 'Stable'} 
                    badgeVariant="warning"
                    subtext="Awaiting coordinator review"
                    isPending={stats.pending.count > 0}
                />

                {/* -- Expiring -- */}
                <MetricCard 
                    label="Expiring Soon" 
                    value={stats.expiry.expired} 
                    badgeText={stats.expiry.expired > 0 ? 'Action' : 'All Clear'} 
                    badgeVariant={stats.expiry.expired > 0 ? 'danger' : 'success'}
                    subtext={`+${stats.expiry.expiringSoon} next 30 days`}
                />

                {/* -- On Campus -- */}
                <MetricCard 
                    label="On Campus Now" 
                    value={stats.onCampus.total} 
                    badgeText="Live" 
                    badgeVariant="info"
                    subtext="Currently within perimeter"
                />
            </section>

            {/* ===== FILTERS ===== */}
            <div className={styles.filterSection}>
                <div className={styles.filterTop}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                            <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>commute</span>
                            Vehicle Type
                        </label>
                        <FilterDropdown
                            label="All Types"
                            value={typeFilter}
                            options={[{ value: '', label: 'All Types' }, ...VEHICLE_TYPES]}
                            onChange={setTypeFilter}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                            <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>rule</span>
                            Permit Status
                        </label>
                        <FilterDropdown
                            label="All Statuses"
                            value={statusFilter}
                            options={[
                                { value: '', label: 'All Statuses' },
                                { value: 'registered', label: 'Registered' },
                                { value: 'pending', label: 'Pending' },
                                { value: 'expired', label: 'Expired' }
                            ]}
                            onChange={setStatusFilter}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                            <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>gate</span>
                            Last Gate
                        </label>
                        <FilterDropdown
                            label="All Gates"
                            value={gateFilter}
                            options={[
                                { value: '', label: 'All Gates' },
                                { value: 'Main Gate', label: 'Main Gate' },
                                { value: 'Back Gate', label: 'Back Gate' }
                            ]}
                            onChange={setGateFilter}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                            <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>badge</span>
                            Owner Role
                        </label>
                        <FilterDropdown
                            label="All Roles"
                            value={roleFilter}
                            options={[
                                { value: '', label: 'All Roles' },
                                { value: 'student', label: 'Students' },
                                { value: 'faculty', label: 'Faculty' },
                                { value: 'staff', label: 'Staff' },
                                { value: 'visitor', label: 'Visitors' }
                            ]}
                            onChange={setRoleFilter}
                        />
                    </div>

                    <div style={{ flex: 'none', width: '280px', marginLeft: 'auto', alignSelf: 'flex-end', display: 'flex' }}>
                        <input
                            className="form-input fi fi-search"
                            style={{ height: '44px', width: '100%' }}
                            type="text"
                            placeholder="Search by plate, brand, or owner..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.filterBottom}>
                    <div className={styles.filterLabel}>
                        <span className="material-symbols-rounded">bar_chart_4_bars</span>
                        VEHICLE DISTRIBUTION
                    </div>
                    <div className={styles.typeGridCompact}>
                        {[
                            { key: 'car', icon: 'directions_car' },
                            { key: 'motorcycle', icon: 'two_wheeler' },
                            { key: 'van', icon: 'airport_shuttle' },
                            { key: 'truck', icon: 'local_shipping' },
                            { key: 'other', icon: 'commute' }
                        ].map(item => (
                            <div key={item.key} className={styles.typeItemCompact}>
                                <span className="material-symbols-rounded">{item.icon}</span>
                                <span>{stats.total.byType[item.key] || 0}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginLeft: 'auto' }}>
                        <button
                            className={`${styles.togglePill} ${onCampusOnly ? styles.active : ''}`}
                            onClick={() => setOnCampusOnly(!onCampusOnly)}
                        >
                            <span className="material-symbols-rounded" style={{ fontSize: '1.1rem' }}>
                                {onCampusOnly ? 'location_on' : 'location_off'}
                            </span>
                            Currently on campus
                        </button>
                    </div>
                </div>
            </div>

            {/* ===== VEHICLES TABLE ===== */}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {[
                                { key: 'plate_no', label: 'PLATE NO.' },
                                { key: 'info', label: 'VEHICLE INFO' },
                                { key: 'owner', label: 'OWNER' },
                                { key: 'owner_role', label: 'ROLE' },
                                { key: 'status', label: 'STATUS' },
                                { key: 'last_seen', label: 'LAST SEEN' },
                                { key: 'permit_valid', label: 'PERMIT VALID' }
                            ].map(header => (
                                <th 
                                    key={header.key} 
                                    className={styles.sortableHeader}
                                    onClick={() => {
                                        if (sortBy === header.key) {
                                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                        } else {
                                            setSortBy(header.key);
                                            setSortOrder('asc');
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-1">
                                        {header.label}
                                        <span className="material-symbols-rounded" style={{ fontSize: '14px', opacity: sortBy === header.key ? 1 : 0.2 }}>
                                            {sortBy === header.key ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                                        </span>
                                    </div>
                                </th>
                            ))}
                            <th className={styles.th} style={{ textAlign: 'right', paddingRight: '1.5rem' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className={styles.tr}>
                                    <td className={styles.td}><SkeletonLine width="80%" /></td>
                                    <td className={styles.td}><SkeletonLine width="60%" /></td>
                                    <td className={styles.td}><SkeletonLine width="70%" /></td>
                                    <td className={styles.td}><SkeletonLine width="40%" /></td>
                                    <td className={styles.td}><SkeletonLine width="50%" /></td>
                                    <td className={styles.td}><SkeletonLine width="60%" /></td>
                                    <td className={styles.td}><SkeletonLine width="50%" /></td>
                                    <td className={styles.td} style={{ textAlign: 'right' }}>
                                        <div className="flex justify-end gap-1">
                                            <div className={styles.skeleton} style={{ width: '2rem', height: '2rem', borderRadius: '4px' }} />
                                            <div className={styles.skeleton} style={{ width: '2rem', height: '2rem', borderRadius: '4px' }} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : currentVehicles.length > 0 ? (
                            currentVehicles.map(vehicle => (
                                <tr key={vehicle.id} className={styles.tr}>
                                    <td className={styles.td}>
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-rounded" style={{ color: 'var(--color-primary)' }}>
                                                {getVehicleIcon(vehicle.type)}
                                            </span>
                                            <span style={{ fontWeight: 800 }}>{anonymizePlate(vehicle.plate)}</span>
                                        </div>
                                    </td>
                                    <td className={styles.td}>
                                        <div style={{ fontSize: '0.8125rem', opacity: 0.8 }}>{vehicle.description}</div>
                                    </td>
                                    <td className={styles.td}>{anonymizeName(vehicle.owner)}</td>
                                    <td className={styles.td}>
                                        <span className={`${styles.badge} ${styles.badgeInfo}`}>{vehicle.role}</span>
                                    </td>
                                    <td className={styles.td}>
                                        <span className={`
                                            ${styles.badge} 
                                            ${vehicle.status === 'Registered' ? styles.badgeSuccess :
                                                vehicle.status === 'Pending' ? styles.badgeWarning : styles.badgeDanger}
                                        `}>
                                            {vehicle.status}
                                        </span>
                                    </td>
                                    <td className={styles.td}>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="status-dot"
                                                style={{
                                                    width: '6px', height: '6px', borderRadius: '50%',
                                                    background: vehicle.onCampus ? 'var(--color-success)' : 'var(--text-muted)'
                                                }}
                                            />
                                            <span style={{ fontSize: '0.8125rem' }}>
                                                {(vehicle.lastSeen?.gate) || '—'} {vehicle.lastSeen?.time ? `• ${vehicle.lastSeen.time}` : ''}
                                            </span>
                                        </div>
                                    </td>
                                    <td className={styles.td}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: getExpiryColor(vehicle.expiryDate) }}>
                                                {new Date(vehicle.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            <span style={{ fontSize: '0.6875rem', color: getExpiryColor(vehicle.expiryDate), opacity: 0.7, marginTop: '2px' }}>
                                                {getDaysRemaining(vehicle.expiryDate)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className={styles.td}>
                                        <div className="flex justify-end gap-1">
                                            {vehicle.status === 'Pending' && (
                                                <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} title="Approve" onClick={() => handleApprove(vehicle.id)}>
                                                    <span className="material-symbols-rounded">check</span>
                                                </button>
                                            )}
                                            <button className={styles.actionBtn} title="View Logs" onClick={() => { setSelectedVehicle(vehicle); setShowDetailModal('logs'); }}>
                                                <span className="material-symbols-rounded">manage_search</span>
                                            </button>
                                            <button className={styles.actionBtn} title="View Details" onClick={() => { setSelectedVehicle(vehicle); setShowDetailModal('details'); }}>
                                                <span className="material-symbols-rounded">info</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8">
                                    <div className={styles.noDataCell}>
                                        <div className={styles.noDataContent}>
                                            <span className="material-symbols-rounded">search_off</span>
                                            <p>No vehicles match your current filters</p>
                                            <button className="text-btn" onClick={() => {
                                                setSearchTerm('');
                                                setTypeFilter('');
                                                setStatusFilter('');
                                                setOnCampusOnly(false);
                                                setGateFilter('');
                                            }}>Clear all filters</button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ===== PAGINATION AREA ===== */}
            <div className="premium-pagination">
                <div className="pagination-info">
                    {filteredVehicles.length > 0 ? (
                        <>Showing <span>{startIndex + 1}</span>-<span>{Math.min(startIndex + itemsPerPage, filteredVehicles.length)}</span> of <span>{filteredVehicles.length}</span> records</>
                    ) : (
                        <span>No records found</span>
                    )}
                </div>
                
                <div className="pagination-controls">
                    <div className="limit-selector">
                        <span className="limit-label">Show:</span>
                        <select 
                            className="premium-select-compact"
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>

                    <div className="page-btns">
                        <button 
                            className="premium-page-btn icon-only" 
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
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
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            <span className="material-symbols-rounded">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ===== MODALS (Kept minimal changes for logic stability) ===== */}

            {showDetailModal && selectedVehicle && (
                <div className="modal-backdrop active" onClick={() => setShowDetailModal(false)}>
                    <div className="modal premium-glass-card" onClick={e => e.stopPropagation()} style={{ border: 'none', maxWidth: '480px' }}>
                        <header className="modal-header">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-rounded" style={{ fontSize: '28px', color: 'var(--color-primary)' }}>
                                    {getVehicleIcon(selectedVehicle.type)}
                                </span>
                                <div>
                                    <h2 className="modal-title" style={{ marginBottom: '2px' }}>
                                        {showDetailModal === 'logs' ? 'Entry Logs' : 'Vehicle Details'}
                                    </h2>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedVehicle.plate}</div>
                                </div>
                            </div>
                            <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </header>
                        <div className="modal-body" style={{ padding: '1.5rem 0' }}>
                            {showDetailModal === 'details' ? (
                                <div className="grid gap-2">
                                    {[
                                        ['Plate Number', anonymizePlate(selectedVehicle.plate)],
                                        ['Description', selectedVehicle.description],
                                        ['Owner', anonymizeName(selectedVehicle.owner)],
                                        ['Role', selectedVehicle.role],
                                        ['Type', (selectedVehicle.type || 'car').charAt(0).toUpperCase() + (selectedVehicle.type || 'car').slice(1)],
                                        ['Status', selectedVehicle.status],
                                        ['On Campus', selectedVehicle.onCampus ? 'Yes' : 'No'],
                                        ['Last Gate', selectedVehicle.lastSeen?.gate || '—'],
                                        ['Last Seen', selectedVehicle.lastSeen?.time || '—'],
                                        ['Permit Expires', new Date(selectedVehicle.expiryDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })],
                                    ].map(([label, val]) => (
                                        <div key={label} className="flex justify-between py-2 border-b border-white/5">
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label}</span>
                                            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{val}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                                    <span className="material-symbols-rounded" style={{ fontSize: '48px', display: 'block', marginBottom: '1rem', opacity: 0.4 }}>manage_search</span>
                                    <p style={{ fontWeight: 600 }}>Entry logs for <strong style={{ color: 'var(--color-primary)' }}>{anonymizePlate(selectedVehicle.plate)}</strong></p>
                                    <p style={{ fontSize: '0.82rem', marginTop: '0.5rem', opacity: 0.6 }}>Full log history will appear here once the camera feed records entries.</p>
                                </div>
                            )}
                        </div>
                        <footer className="modal-footer" style={{ background: 'transparent', borderTop: 'none', padding: '1rem 0 0', display: 'flex', gap: '0.75rem' }}>
                            <button className="premium-page-btn" onClick={() => setShowDetailModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Close</button>
                            {selectedVehicle.status === 'Pending' && showDetailModal === 'details' && (
                                <button className="premium-page-btn active" onClick={() => { handleApprove(selectedVehicle.id); setShowDetailModal(false); }} style={{ flex: 1, justifyContent: 'center' }}>Approve</button>
                            )}
                        </footer>
                    </div>
                </div>
            )}
            {showConfirmModal && vehicleToApprove && (
                <div className="modal-backdrop active" onClick={() => !approving && setShowConfirmModal(false)}>
                    <div className="modal premium-glass-card" onClick={e => e.stopPropagation()} style={{ border: 'none', maxWidth: '420px' }}>
                        <header className="modal-header flex-col items-center text-center gap-3" style={{ paddingBottom: '0.5rem' }}>
                            <div className="premium-noti-icon-box premium-pill info" style={{ width: '56px', height: '56px', background: 'var(--color-info-light)', margin: '0 auto' }}>
                                <span className="material-symbols-rounded" style={{ color: 'var(--color-info)', fontSize: '2rem' }}>verified_user</span>
                            </div>
                            <h2 className="modal-title" style={{ fontSize: '1.25rem' }}>Double Check Approval</h2>
                        </header>
                        <div className="modal-body" style={{ padding: '1.5rem 0' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                                Are you sure you want to approve this vehicle? <br />
                                Please verify the registrant's details.
                            </p>
                            <div className="grid gap-4" style={{ background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                                <div className="flex flex-col gap-1">
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Plate Number</span>
                                    <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.15rem' }}>{vehicleToApprove.plate}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Full Name / Owner</span>
                                    <span style={{ fontWeight: 600, fontSize: '1rem', lineHeight: '1.4', color: 'var(--text-primary)' }}>{vehicleToApprove.owner}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Designated Role</span>
                                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{vehicleToApprove.role}</span>
                                </div>
                            </div>
                        </div>
                        <footer className="modal-footer" style={{ background: 'transparent', borderTop: 'none', padding: '1.5rem 0 0', display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
                            <div className="flex gap-3 w-full">
                                <button
                                    className="premium-page-btn"
                                    onClick={handleConfirmDeny}
                                    style={{ flex: 1, justifyContent: 'center', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
                                    disabled={approving || denying}
                                >
                                    {denying ? 'Denying...' : 'Deny Approval'}
                                </button>
                                <button
                                    className="premium-page-btn active"
                                    onClick={handleConfirmApprove}
                                    style={{ flex: 1.5, justifyContent: 'center' }}
                                    disabled={approving || denying}
                                >
                                    {approving ? (
                                        <div className="flex items-center gap-2">
                                            <div className="spinner-small" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                            <span>Approving...</span>
                                        </div>
                                    ) : 'Confirm Approval'}
                                </button>
                            </div>
                            <button
                                className="text-btn"
                                onClick={() => !approving && !denying && setShowConfirmModal(false)}
                                style={{ width: '100%', padding: '0.5rem', opacity: 0.6 }}
                                disabled={approving || denying}
                            >
                                Cancel
                            </button>
                        </footer>
                    </div>
                </div>
            )}
            
            {/* Report Generator Modal */}
            <ReportGeneratorModal 
                isOpen={isReportModalOpen} 
                onClose={() => setIsReportModalOpen(false)} 
                data={vehicles} 
                columns={[
                    { key: 'plate', label: 'Plate Number' },
                    { key: 'description', label: 'Brand & Color' },
                    { key: 'type', label: 'Vehicle Type' },
                    { key: 'owner', label: 'Owner Name' },
                    { key: 'role', label: 'Owner Role' },
                    { key: 'status', label: 'Registration Status' }
                ]}
                reportTitle="Registered Vehicles Report"
            />
        </>
    );
}
