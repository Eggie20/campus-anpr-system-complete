import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../../../services/api';
import ReportGeneratorModal from '../../../widgets/ReportGenerator/ReportGeneratorModal';
import { usePrivacy } from '../../../../contexts/PrivacyContext';
import './EntryLogs.css';

// Reusable Filter Dropdown Component
const FilterDropdown = ({ icon, label, value, options, onChange }) => {
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
                className={`premium-filter-btn ${value ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="material-symbols-rounded btn-icon">{icon}</span>
                <div className="btn-text">
                    <span className="btn-label">{label}</span>
                    <span className="btn-value">{selectedOption.label}</span>
                </div>
                <span className="material-symbols-rounded chevron">
                    {isOpen ? 'expand_less' : 'expand_more'}
                </span>
            </button>

            {isOpen && (
                <div className="premium-filter-dropdown-menu">
                    {options.map((opt) => (
                        <div 
                            key={opt.value}
                            className={`premium-dropdown-item ${value === opt.value ? 'selected' : ''}`}
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
                        >
                            <div className="item-info">
                                <span className="item-label">{opt.label}</span>
                            </div>
                            {value === opt.value && (
                                <span className="material-symbols-rounded check-icon">check</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Time Formatting Helper
const formatTime = (timeStr) => {
    if (!timeStr || timeStr === '—') return '—';
    if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
    try {
        const [h, m, s] = timeStr.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const h12 = hour % 12 || 12;
        return `${h12}:${m}:${s} ${ampm}`;
    } catch (e) {
        return timeStr;
    }
};

export default function EntryLogs() {
    const { anonymizePlate, anonymizeName } = usePrivacy();
    const location = useLocation();
    
    const [logData, setLogData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        total_items: 0,
        total_pages: 1,
        current_page: 1,
        items_per_page: 10,
        has_next: false,
        has_prev: false
    });
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Initialize search query from URL if present
    const queryParams = new URLSearchParams(location.search);
    const initialSearch = queryParams.get('search') || '';

    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [directionFilter, setDirectionFilter] = useState('');
    const [gateFilter, setGateFilter] = useState('');
    const [vehicleTypeFilter, setVehicleTypeFilter] = useState('');
    
    // Security Prompt State
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [targetLog, setTargetLog] = useState(null);
    const [verifyingPassword, setVerifyingPassword] = useState(false);

    // Report Generator State
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [loadingReportData, setLoadingReportData] = useState(false);

    const [selectedLog, setSelectedLog] = useState(null);
    const [suspiciousLog, setSuspiciousLog] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/admin/entry-logs?page=${page}&limit=${itemsPerPage}&search=${debouncedSearch}&type=${categoryFilter}&direction=${directionFilter}&gate=${gateFilter}&vehicle_type=${vehicleTypeFilter}`);
                if (res.data.logs) {
                    setLogData(res.data.logs);
                    if (res.data.pagination) {
                        setPagination(res.data.pagination);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch entry logs:", e);
                setLogData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [page, debouncedSearch, categoryFilter, directionFilter, gateFilter, vehicleTypeFilter, itemsPerPage]);

    // Fetch full matching dataset (limit=5000) for report preview
    useEffect(() => {
        if (!isReportModalOpen) return;

        const fetchAllLogsForReport = async () => {
            setLoadingReportData(true);
            try {
                // Request a large limit (e.g. 5000) to get all matching results
                const res = await api.get(`/admin/entry-logs?page=1&limit=5000&search=${debouncedSearch}&type=${categoryFilter}&direction=${directionFilter}&gate=${gateFilter}&vehicle_type=${vehicleTypeFilter}`);
                if (res.data.logs) {
                    setReportData(res.data.logs);
                }
            } catch (e) {
                console.error("Failed to fetch report logs:", e);
                setReportData([]);
            } finally {
                setLoadingReportData(false);
            }
        };
        fetchAllLogsForReport();
    }, [isReportModalOpen, debouncedSearch, categoryFilter, directionFilter, gateFilter, vehicleTypeFilter]);

    // Listen to URL search parameter changes (e.g. from global header search)
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const searchFromUrl = queryParams.get('search');
        if (searchFromUrl !== null && searchFromUrl !== searchQuery) {
            setSearchQuery(searchFromUrl);
            setDebouncedSearch(searchFromUrl);
        }
    }, [location.search]);

    const handleViewDetails = (log) => {
        setTargetLog(log);
        setPasswordInput('');
        setPasswordError('');
        setShowPasswordPrompt(true);
    };

    const verifyPasswordAndView = async (e) => {
        e.preventDefault();
        setVerifyingPassword(true);
        setPasswordError('');
        try {
            const res = await api.post('/admin/verify-password', { password: passwordInput });
            if (res.data.success) {
                setShowPasswordPrompt(false);
                setSelectedLog(targetLog);
                setTargetLog(null);
            }
        } catch (err) {
            setPasswordError(err.response?.data?.detail || "Invalid password");
        } finally {
            setVerifyingPassword(false);
        }
    };

    const handlePrev = () => {
        if (pagination.has_prev) setPage(p => p - 1);
    };

    const handleNext = () => {
        if (pagination.has_next) setPage(p => p + 1);
    };

    const getPageNumbers = () => {
        const maxPagesToShow = 5;
        const current = pagination.current_page;
        const total = pagination.total_pages;
        let start = Math.max(1, current - Math.floor(maxPagesToShow / 2));
        let end = start + maxPagesToShow - 1;

        if (end > total) {
            end = total;
            start = Math.max(1, end - maxPagesToShow + 1);
        }

        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="premium-dashboard-container">
            {/* Page Header */}
            <div className="premium-page-header">
                <div>
                    <h1>Entry-Exit <span>Logs</span> 📋</h1>
                    <p>Automated tracking module for all campus vehicle entries and exits.</p>
                </div>
                <div className="premium-header-meta">
                    <button className="premium-page-btn active" onClick={() => setIsReportModalOpen(true)}>
                        <span className="material-symbols-rounded">summarize</span>
                        Generate Report
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="entry-logs-filters mb-6">
                <div className="entry-logs-filter-row">
                    <FilterDropdown 
                        icon="category"
                        label="Status Category"
                        value={categoryFilter}
                        options={[
                            { value: '', label: 'All Statuses' },
                            { value: 'Authorized', label: 'Authorized Only' },
                            { value: 'Anomaly', label: 'Anomalies' },
                            { value: 'Breach', label: 'Security Breaches' },
                        ]}
                        onChange={(val) => { setCategoryFilter(val); setPage(1); }}
                    />

                    <FilterDropdown 
                        icon="swap_vert"
                        label="Traffic Flow"
                        value={directionFilter}
                        options={[
                            { value: '', label: 'In & Out' },
                            { value: 'Entry', label: 'Entry Only' },
                            { value: 'Exit', label: 'Exit Only' },
                        ]}
                        onChange={(val) => { setDirectionFilter(val); setPage(1); }}
                    />
                    
                    <FilterDropdown 
                        icon="gate"
                        label="Gate Filter"
                        value={gateFilter}
                        options={[
                            { value: '', label: 'All Gates' },
                            { value: 'Main Gate', label: 'Main Gate' },
                            { value: 'Back Gate', label: 'Back Gate' },
                        ]}
                        onChange={(val) => { setGateFilter(val); setPage(1); }}
                    />

                    <div className="search-box entry-logs-search">
                        <span className="material-symbols-rounded">search</span>
                        <input
                            type="text"
                            placeholder="Search plate or gate..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        />
                    </div>
                </div>
                <div className="vehicle-type-chips-wrapper">
                    <span className="chips-title">Vehicle Type:</span>
                    <div className="vehicle-type-chips">
                    {[
                        { value: '', label: 'All', icon: 'apps' },
                        { value: 'Car', label: 'Car', icon: '🚗' },
                        { value: 'Motorcycle', label: 'Motorcycle', icon: '🏍️' },
                        { value: 'Van', label: 'Van', icon: '🚐' },
                        { value: 'Truck', label: 'Truck', icon: '🚚' },
                        { value: 'Others', label: 'Others', icon: '🚙' }
                    ].map(vt => (
                        <button
                            key={vt.value}
                            className={`vt-chip ${vehicleTypeFilter === vt.value ? 'active' : ''}`}
                            onClick={() => { setVehicleTypeFilter(vt.value); setPage(1); }}
                        >
                            {vt.value === '' ? (
                                <span className="material-symbols-rounded">{vt.icon}</span>
                            ) : (
                                <span className="vt-emoji">{vt.icon}</span>
                            )}
                            {vt.label}
                        </button>
                    ))}
                    </div>
                </div>
            </div>

            <div className="premium-glass-card" style={{ padding: '0', overflow: 'visible' }}>
                <div className="data-table-wrapper" style={{ margin: 0, border: 'none' }}>
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>License Plate</th>
                                <th>Vehicle Type</th>
                                <th>IN</th>
                                <th>OUT</th>
                                <th>Frequency</th>
                                <th>Gate / Camera</th>
                                <th>Authorization</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && logData.length === 0 ? (
                                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '4rem' }}>
                                    <div className="loading-spinner-container">
                                        <span className="material-symbols-rounded spin-icon">progress_activity</span>
                                        <p>Fetching traffic logs...</p>
                                    </div>
                                </td></tr>
                            ) : logData.length === 0 ? (
                                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                                        <span className="material-symbols-rounded" style={{ fontSize: '3rem', color: 'var(--text-muted)', opacity: 0.5 }}>search_off</span>
                                        <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>No traffic logs match your filters</p>
                                        <button 
                                            onClick={() => {
                                                setSearchQuery(''); setCategoryFilter(''); setDirectionFilter('');
                                            }}
                                            style={{ 
                                                background: 'transparent', 
                                                border: 'none', 
                                                color: 'var(--color-primary)', 
                                                fontWeight: 700, 
                                                letterSpacing: '1px', 
                                                fontSize: '0.8rem', 
                                                cursor: 'pointer',
                                                textTransform: 'uppercase',
                                                marginTop: '0.5rem'
                                            }}
                                        >
                                            RESET INTELLIGENCE
                                        </button>
                                    </div>
                                </td></tr>
                            ) : (
                                logData.map((log, i) => (
                                    <tr key={log.id || i} className={log.type === 'Anomaly' ? 'log-row--anomaly' : log.type === 'Breach' ? 'log-row--breach' : ''}>
                                        <td data-label="Date">
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.date}</div>
                                        </td>
                                        <td data-label="License Plate" className="plate-cell">{anonymizePlate(log.plate)}</td>
                                        <td data-label="Vehicle Type">
                                            {log.vehicle_type === 'Unknown' ? (
                                                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>Unknown</span>
                                            ) : (
                                                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{log.vehicle_type}</span>
                                            )}
                                        </td>
                                        <td data-label="IN">
                                            <span className="log-time" style={{ color: log.direction === 'entry' ? 'var(--color-success)' : 'var(--text-muted)' }}>
                                                {log.direction === 'entry' ? formatTime(log.time) : '—'}
                                            </span>
                                        </td>
                                        <td data-label="OUT">
                                            <span className="log-time" style={{ color: log.direction === 'exit' ? 'var(--color-primary)' : 'var(--text-muted)' }}>
                                                {log.direction === 'exit' ? formatTime(log.time) : '—'}
                                            </span>
                                        </td>
                                        <td data-label="Frequency">
                                            <span className={`frequency-badge ${log.frequency > 5 ? 'frequency-badge--high' : ''}`}>
                                                <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>repeat</span>
                                                {log.frequency}x
                                            </span>
                                        </td>
                                        <td data-label="Gate / Camera">
                                            <div className="gate-cell">
                                                <span className="gate-name">{log.camera}</span>
                                                <span className={`gate-direction ${log.direction}`}>{log.direction} Gate</span>
                                            </div>
                                        </td>
                                        <td data-label="Authorization">
                                            <div className="flex items-center gap-2">
                                                <span className={`status-dot ${log.statusClass === 'badge-success' ? 'status-dot--online' : log.statusClass === 'badge-danger' ? 'status-dot--danger' : 'status-dot--away'}`}></span>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{log.status}</span>
                                            </div>
                                        </td>
                                        <td data-label="Actions">
                                            <div className="table-actions">
                                                <button className="icon-btn-premium" title="View Details" onClick={() => handleViewDetails(log)}>
                                                    <span className="material-symbols-rounded">visibility</span>
                                                </button>
                                                <button 
                                                    className={`icon-btn-premium ${log.type === 'Anomaly' && log.frequency > 3 ? 'active-suspicious' : ''}`} 
                                                    title="Flag as Suspicious"
                                                    onClick={() => setSuspiciousLog(log)}
                                                >
                                                    <span className="material-symbols-rounded">flag</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

                {/* Pagination Controls */}
                <div className="premium-pagination">
                    <div className="pagination-info">
                        {pagination.total_items > 0 ? (
                            <>Showing <span>{(page - 1) * itemsPerPage + 1}-{Math.min(page * itemsPerPage, pagination.total_items)}</span> of <span>{pagination.total_items}</span> entries</>
                        ) : (
                            <span>No logs found</span>
                        )}
                    </div>
                    
                    <div className="pagination-controls">
                        <div className="limit-selector">
                            <span className="limit-label">Show:</span>
                            <select 
                                className="premium-select-compact"
                                value={itemsPerPage}
                                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setPage(1); }}
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </div>

                        <div className="page-btns">
                            <button 
                                className="premium-page-btn icon-only" 
                                onClick={handlePrev}
                                disabled={!pagination.has_prev || loading}
                            >
                                <span className="material-symbols-rounded">chevron_left</span>
                            </button>
                            
                            <div className="page-indicators">
                                {getPageNumbers().map(pageNum => (
                                    <button 
                                        key={pageNum}
                                        className={`page-indicator ${pageNum === page ? 'active' : ''}`}
                                        onClick={() => setPage(pageNum)}
                                    >
                                        {pageNum}
                                    </button>
                                ))}
                            </div>

                            <button 
                                className="premium-page-btn icon-only" 
                                onClick={handleNext}
                                disabled={!pagination.has_next || loading}
                            >
                                <span className="material-symbols-rounded">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>

            {/* Password Prompt Modal */}
            {showPasswordPrompt && (
                <div className="modal-backdrop active" onClick={() => setShowPasswordPrompt(false)}>
                    <div className="modal premium-glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', width: '95%', textAlign: 'center' }}>
                        <header className="modal-header" style={{ justifyContent: 'center', borderBottom: 'none', paddingBottom: '0' }}>
                            <div className="logs-modal__icon-box bg-primary" style={{ width: '48px', height: '48px', margin: '0 auto 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="material-symbols-rounded" style={{ color: '#fff', fontSize: '24px' }}>lock</span>
                            </div>
                        </header>
                        
                        <div className="modal-body" style={{ padding: '0 2rem 2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Security Verification</h2>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                Please enter your administrator password to view sensitive vehicle logs.
                            </p>

                            <form onSubmit={verifyPasswordAndView}>
                                <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                                    <input 
                                        type="password" 
                                        className="form-input" 
                                        placeholder="Enter admin password"
                                        value={passwordInput}
                                        onChange={e => setPasswordInput(e.target.value)}
                                        style={{ width: '100%', height: '44px', boxSizing: 'border-box' }}
                                        autoFocus
                                    />
                                    {passwordError && (
                                        <div style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>error</span>
                                            {passwordError}
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button 
                                        type="button"
                                        className="premium-page-btn" 
                                        onClick={() => setShowPasswordPrompt(false)}
                                        style={{ flex: 1, justifyContent: 'center' }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="premium-page-btn active" 
                                        disabled={!passwordInput || verifyingPassword}
                                        style={{ flex: 1, justifyContent: 'center' }}
                                    >
                                        {verifyingPassword ? 'Verifying...' : 'Unlock Details'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Log Details Modal */}
            {selectedLog && (
                <div className="modal-backdrop active" onClick={() => setSelectedLog(null)}>
                    <div className="modal premium-glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '95%' }}>
                        <header className="modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className={`logs-modal__icon-box ${selectedLog.type === 'Breach' ? 'bg-danger' : selectedLog.type === 'Anomaly' ? 'bg-warning' : 'bg-primary'}`} style={{ width: '40px', height: '40px' }}>
                                    <span className="material-symbols-rounded" style={{ color: '#fff' }}>
                                        {selectedLog.type === 'Breach' ? 'report' : selectedLog.type === 'Anomaly' ? 'help' : 'verified'}
                                    </span>
                                </div>
                                <div>
                                    <h2 className="modal-title">Entry Log Detail</h2>
                                    <p className="modal-subtitle">Log ID: {selectedLog.id.substring(0, 8)}</p>
                                </div>
                            </div>
                            <button className="modal-close" onClick={() => setSelectedLog(null)}>
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </header>

                        <div className="modal-body" style={{ padding: '1.5rem' }}>
                            <div className="log-detail-modal__plate-box">
                                <div className="log-detail-modal__label">Detected License Plate</div>
                                <div className="log-detail-modal__plate-text">{anonymizePlate(selectedLog.plate)}</div>
                            </div>

                            {selectedLog.snapshot_url && (
                                <div className="log-detail-modal__snapshot">
                                    <img src={selectedLog.snapshot_url} alt="Vehicle Snapshot" />
                                </div>
                            )}

                            <div className="log-detail-modal__grid">
                                <div className="log-detail-modal__field">
                                    <span className="log-detail-modal__label">IN Time</span>
                                    <span className="log-detail-modal__value">{selectedLog.direction === 'entry' ? formatTime(selectedLog.time) : '—'}</span>
                                </div>
                                <div className="log-detail-modal__field">
                                    <span className="log-detail-modal__label">OUT Time</span>
                                    <span className="log-detail-modal__value">{selectedLog.direction === 'exit' ? formatTime(selectedLog.time) : '—'}</span>
                                </div>
                                <div className="log-detail-modal__field">
                                    <span className="log-detail-modal__label">Date</span>
                                    <span className="log-detail-modal__value">{selectedLog.date}</span>
                                </div>
                                <div className="log-detail-modal__field">
                                    <span className="log-detail-modal__label">Gate Entrance</span>
                                    <span className="log-detail-modal__value">{selectedLog.camera} ({selectedLog.direction})</span>
                                </div>
                                <div className="log-detail-modal__field">
                                    <span className="log-detail-modal__label">Authorization</span>
                                    <span className="log-detail-modal__value">
                                        <span className={`premium-pill ${selectedLog.statusClass === 'badge-success' ? 'success' : 'danger'}`}>
                                            {selectedLog.status}
                                        </span>
                                    </span>
                                </div>
                                <div className="log-detail-modal__field">
                                    <span className="log-detail-modal__label">Vehicle Frequency</span>
                                    <span className="log-detail-modal__value">{selectedLog.frequency} recorded detections</span>
                                </div>
                                {selectedLog.owner_name !== "Unknown" && (
                                    <>
                                        <div className="log-detail-modal__field">
                                            <span className="log-detail-modal__label">Vehicle Owner</span>
                                            <span className="log-detail-modal__value">{anonymizeName(selectedLog.owner_name)}</span>
                                        </div>
                                        <div className="log-detail-modal__field">
                                            <span className="log-detail-modal__label">Owner Role</span>
                                            <span className="log-detail-modal__value">{selectedLog.owner_role}</span>
                                        </div>
                                    </>
                                )}
                                {selectedLog.vehicle_type !== "Unknown" && (
                                    <div className="log-detail-modal__field">
                                        <span className="log-detail-modal__label">Vehicle Type</span>
                                        <span className="log-detail-modal__value">{selectedLog.vehicle_type}</span>
                                    </div>
                                )}
                                <div className="log-detail-modal__field">
                                    <span className="log-detail-modal__label">Activity Type</span>
                                    <span className="log-detail-modal__value">{selectedLog.type} Detection</span>
                                </div>
                            </div>
                        </div>

                        <footer className="modal-footer">
                            <button className="premium-page-btn" onClick={() => setSelectedLog(null)} style={{ width: '100%', justifyContent: 'center' }}>
                                Dismiss Detail
                            </button>
                        </footer>
                    </div>
                </div>
            )}

            {/* Suspicious Activity Report Modal */}
            {suspiciousLog && (
                <div className="modal-backdrop active" onClick={() => setSuspiciousLog(null)}>
                    <div className="modal premium-glass-card suspicious-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px', width: '95%' }}>
                        <header className="modal-header suspicious-header">
                            <div className="suspicious-alert-badge">
                                <span className="material-symbols-rounded">security</span>
                                SECURITY ALERT
                            </div>
                            <button className="modal-close" onClick={() => setSuspiciousLog(null)}>
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </header>

                        <div className="modal-body" style={{ padding: '2rem' }}>
                            {/* Intelligence Header */}
                            <h3 className="reasoning-title" style={{ marginBottom: '1.25rem' }}>
                                <span className="material-symbols-rounded">analytics</span>
                                Intelligence Analysis
                            </h3>

                            {/* Top Section: Intelligence Analysis Grid */}
                            <div className="suspicious-analysis-grid">
                                <div className="suspicious-reasoning">
                                    <div className="reasoning-card">
                                        <div className="reasoning-icon">
                                            <span className="material-symbols-rounded">error</span>
                                        </div>
                                        <div className="reasoning-content">
                                            <h4>Unregistered Frequency Alert</h4>
                                            <p>
                                                Detected <strong>{suspiciousLog.frequency} entries</strong> from an unregistered vehicle. This pattern suggests unauthorized recurring access.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="suspicious-reasoning-meta">
                                    <div className="reasoning-grid">
                                        <div className="reasoning-mini-item">
                                            <span className="label">Last Gate</span>
                                            <span className="val">{suspiciousLog.camera}</span>
                                        </div>
                                        <div className="reasoning-mini-item">
                                            <span className="label">Category</span>
                                            <span className="val">{suspiciousLog.type}</span>
                                        </div>
                                        <div className="reasoning-mini-item">
                                            <span className="label">Status</span>
                                            <span className="val">{suspiciousLog.status}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="security-notice-box">
                                        <span className="material-symbols-rounded">info</span>
                                        <p>Immediate inspection is recommended for this vehicle.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Section: Security Evidence */}
                            <div className="suspicious-evidence-section">
                                <div className="evidence-header">
                                    <span className="material-symbols-rounded">visibility</span>
                                    SECURITY EVIDENCE & IDENTIFICATION
                                </div>
                                <div className="evidence-content">
                                    <div className="evidence-info">
                                        <div className="suspicious-label">Suspicious Vehicle Identified</div>
                                        <div className="suspicious-plate">{anonymizePlate(suspiciousLog.plate)}</div>
                                        <div className="suspicious-meta">
                                            <span>{suspiciousLog.date}</span>
                                            <span className="dot"></span>
                                            <span>{suspiciousLog.time}</span>
                                        </div>
                                    </div>
                                    <div className="evidence-snapshot">
                                        {suspiciousLog.snapshot_url ? (
                                            <img src={suspiciousLog.snapshot_url} alt="Security Snapshot" />
                                        ) : (
                                            <div className="snapshot-placeholder">
                                                <span className="material-symbols-rounded">image_not_supported</span>
                                                <span>No Snapshot Available</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <footer className="modal-footer">
                            <button className="btn-suspicious-action secondary" onClick={() => setSuspiciousLog(null)}>
                                Dismiss Alert
                            </button>
                            <button className="btn-suspicious-action primary" onClick={() => setSuspiciousLog(null)}>
                                <span className="material-symbols-rounded">verified_user</span>
                                Dispatch Security
                            </button>
                        </footer>
                    </div>
                </div>
            )}

            {/* Report Generator Modal */}
            <ReportGeneratorModal 
                isOpen={isReportModalOpen} 
                onClose={() => setIsReportModalOpen(false)} 
                data={reportData} 
                loading={loadingReportData}
                columns={[
                    { key: 'date', label: 'Date' },
                    { key: 'time', label: 'Time' },
                    { key: 'plate', label: 'License Plate' },
                    { key: 'vehicle_type', label: 'Vehicle Type' },
                    { key: 'type', label: 'Flow Type' },
                    { key: 'direction', label: 'Direction' },
                    { key: 'camera', label: 'Gate' },
                    { key: 'status', label: 'Authorization' },
                    { key: 'frequency', label: 'Frequency' }
                ]}
                reportTitle="Campus Traffic Entry-Exit Log Report"
            />
        </div>
    );
}
