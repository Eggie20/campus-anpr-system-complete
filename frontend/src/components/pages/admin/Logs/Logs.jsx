import { useState, useEffect, useRef } from 'react';
import api from '../../../../services/api';
import ReportGeneratorModal from '../../../widgets/ReportGenerator/ReportGeneratorModal';
import './Logs.css';

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
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>{icon}</span>
                {label}
            </label>
            <div className="premium-filter-dropdown" ref={dropdownRef}>
                <button
                    className={`premium-filter-btn ${value ? 'active' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ height: '44px', width: '160px' }}
                >
                    <span className="btn-value" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedOption.label}</span>
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
                                <span>{opt.label}</span>
                            </div>
                            {value === opt.value && (
                                <span className="material-symbols-rounded">check</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
            </div>
        </div>
    );
};

export default function Logs() {
    const [logData, setLogData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [pagination, setPagination] = useState({
        total_items: 0,
        total_pages: 1,
        current_page: 1,
        items_per_page: 10,
        has_next: false,
        has_prev: false
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [stationFilter, setStationFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedAudit, setSelectedAudit] = useState(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        alerts_24h: 0,
        resolutions: 0,
        security_actions: 0
    });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); // Reset to first page on search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/admin/logs?page=${page}&limit=${limit}&search=${debouncedSearch}&category=${categoryFilter}&duty_station=${stationFilter}&start_date=${startDate}&end_date=${endDate}`);
                if (res.data.logs) {
                    setLogData(res.data.logs);
                    if (res.data.pagination) {
                        setPagination(res.data.pagination);
                    }
                    if (res.data.summary_stats) {
                        setStats(res.data.summary_stats);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch system logs:", e);
                setLogData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [page, limit, debouncedSearch, categoryFilter, stationFilter, startDate, endDate]);

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

    const pillClass = (badgeClass) => {
        if (badgeClass === 'badge-success') return 'success';
        if (badgeClass === 'badge-danger') return 'danger';
        if (badgeClass === 'badge-warning') return 'warning';
        if (badgeClass === 'badge-info') return 'info';
        return 'secondary';
    };

    const categoryIcon = (category) => {
        const icons = {
            'Alert': 'warning',
            'Escalation': 'emergency',
            'Resolution': 'check_circle',
            'Approval': 'verified_user',
            'Rejection': 'cancel',
            'Blacklist': 'block',
            'Reset': 'restart_alt',
            'Account': 'manage_accounts',
            'Suspension': 'person_off',
            'Login': 'login',
            'Config': 'settings',
        };
        return icons[category] || 'assignment';
    };

    return (
        <div className="premium-dashboard-container">
            {/* Page Header */}
            <div className="premium-page-header">
                <div>
                    <h1>System <span>Logs</span> 🛡️</h1>
                    <p>Audit trail of all administrative and security actions performed in the system.</p>
                </div>
                <div className="premium-header-meta">
                    <button className="premium-page-btn active" onClick={() => setIsReportModalOpen(true)}>
                        <span className="material-symbols-rounded">summarize</span>
                        Generate Report
                    </button>
                </div>
            </div>

            {/* Audit Metrics Grid */}
            <div className="audit-metrics-grid">
                <div className="audit-metric-card">
                    <div className="metric-icon total"><span className="material-symbols-rounded">analytics</span></div>
                    <div className="metric-info">
                        <div className="metric-label">Total Intelligence</div>
                        <div className="metric-value">{stats.total}</div>
                        <div className="metric-trend up">+12% from yesterday</div>
                    </div>
                </div>
                <div className="audit-metric-card">
                    <div className="metric-icon alert"><span className="material-symbols-rounded">warning</span></div>
                    <div className="metric-info">
                        <div className="metric-label">Active Alerts</div>
                        <div className="metric-value">{stats.alerts_24h}</div>
                        <div className="metric-trend down">-5% from yesterday</div>
                    </div>
                </div>
                <div className="audit-metric-card">
                    <div className="metric-icon resolution"><span className="material-symbols-rounded">task_alt</span></div>
                    <div className="metric-info">
                        <div className="metric-label">Forensic Resolutions</div>
                        <div className="metric-value">{stats.resolutions}</div>
                        <div className="metric-trend up">+8% efficiency</div>
                    </div>
                </div>
                <div className="audit-metric-card">
                    <div className="metric-icon action"><span className="material-symbols-rounded">security</span></div>
                    <div className="metric-info">
                        <div className="metric-label">Security Actions</div>
                        <div className="metric-value">{stats.security_actions}</div>
                        <div className="metric-trend">24h activity log</div>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="premium-filter-section">
                <FilterDropdown
                    icon="category"
                    label="Category"
                    value={categoryFilter}
                    options={[
                        { label: 'All Categories', value: '' },
                        { label: 'Alerts', value: 'Alert' },
                        { label: 'Account', value: 'Account' },
                        { label: 'Vehicle', value: 'Approval' },
                        { label: 'Config', value: 'Config' },
                        { label: 'Security', value: 'Escalation' }
                    ]}
                    onChange={setCategoryFilter}
                />

                <FilterDropdown
                    icon="security"
                    label="Duty Post"
                    value={stationFilter}
                    options={[
                        { label: 'All Posts', value: '' },
                        { label: 'Main Gate', value: 'Main' },
                        { label: 'Back Gate', value: 'Back' },
                        { label: 'Roving', value: 'Roving' }
                    ]}
                    onChange={setStationFilter}
                />

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                        <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>calendar_month</span>
                        Traffic Timeframe
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '0.3rem 0.75rem', borderRadius: '12px', border: '1px solid var(--border-primary)', height: '44px', width: 'fit-content' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.55rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '1px' }}>Start</span>
                            <input 
                                type="date" 
                                style={{ backgroundColor: 'transparent', border: 'none', color: '#e5e7eb', outline: 'none', fontSize: '0.75rem', fontFamily: 'inherit', padding: 0 }}
                                value={startDate}
                                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                            />
                        </div>
                        <span style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 700, margin: '0 2px' }}>-</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.55rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '1px' }}>End</span>
                            <input 
                                type="date" 
                                style={{ backgroundColor: 'transparent', border: 'none', color: '#e5e7eb', outline: 'none', fontSize: '0.75rem', fontFamily: 'inherit', padding: 0 }}
                                value={endDate}
                                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ flex: 'none', width: '280px', display: 'flex' }}>
                    <input 
                        className="form-input fi fi-search" 
                        style={{ height: '44px', width: '100%' }}
                        type="text" 
                        placeholder="Search logs..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Log Table Card */}
            <div className="premium-glass-card" style={{ padding: '0', overflow: 'visible' }}>
                <div className="data-table-wrapper" style={{ margin: 0, border: 'none' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '15%' }}>Timestamp</th>
                                <th style={{ width: '15%' }}>Category</th>
                                <th style={{ width: '20%' }}>Action</th>
                                <th style={{ width: '20%' }}>Details</th>
                                <th style={{ width: '15%' }}>Performed By</th>
                                <th style={{ width: '10%' }}>Duty Post</th>
                                <th style={{ width: '5%' }}>Insight</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && logData.length === 0 ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '4rem' }}>
                                    <div className="loading-spinner-container">
                                        <span className="material-symbols-rounded spin-icon">sync</span>
                                        <p>Fetching audit trail...</p>
                                    </div>
                                </td></tr>
                            ) : logData.length === 0 ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '4rem' }}>
                                    <div className="empty-state-container">
                                        <span className="material-symbols-rounded">history_toggle_off</span>
                                        <p>No audit events found matching your filters.</p>
                                    </div>
                                </td></tr>
                            ) : (
                                logData.map((log, i) => (
                                    <tr key={log.id || i}>
                                        <td>
                                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{log.date}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{log.time}</div>
                                        </td>
                                        <td>
                                            <span className={`premium-pill ${pillClass(log.badgeClass)}`}>
                                                <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>{categoryIcon(log.category)}</span>
                                                {log.category}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>{log.description}</div>
                                        </td>
                                        <td>
                                            {log.detail ? (
                                                <span className="log-detail-snippet">
                                                    {log.detail}
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{log.actor}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>{log.actorRole}</div>
                                        </td>
                                        <td>
                                            <div className={`post-badge ${log.duty_station?.toLowerCase().includes('main') ? 'main' : 'back'}`}>
                                                {log.duty_station}
                                            </div>
                                        </td>
                                        <td>
                                            <button className="btn-icon-only" onClick={() => setSelectedAudit(log)}>
                                                <span className="material-symbols-rounded">visibility</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="premium-pagination">
                <div className="pagination-info">
                    {pagination.total_items > 0 ? (
                        <>Showing <span>{(page - 1) * limit + 1}-{Math.min(page * limit, pagination.total_items)}</span> of <span>{pagination.total_items}</span> audit events</>
                    ) : (
                        <span>No audit events recorded</span>
                    )}
                </div>
                
                <div className="pagination-controls">
                    <div className="limit-selector">
                        <span className="limit-label">Show:</span>
                        <select 
                            className="premium-select-compact"
                            value={limit}
                            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
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
                            disabled={!pagination.has_prev}
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
                            disabled={!pagination.has_next}
                        >
                            <span className="material-symbols-rounded">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Audit Detail Modal */}
            {selectedAudit && (
                <div className="modal-backdrop active" onClick={() => setSelectedAudit(null)}>
                    <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                        <header className="modal-header">
                            <h2 className="modal-title">Audit Insight</h2>
                            <button className="modal-close" onClick={() => setSelectedAudit(null)}>&times;</button>
                        </header>
                        <div className="modal-body">
                            <div className="audit-detail-summary">
                                <div className="audit-icon-box">
                                    <span className="material-symbols-rounded">{categoryIcon(selectedAudit.category)}</span>
                                </div>
                                <div className="audit-summary-info">
                                    <h3>{selectedAudit.description}</h3>
                                    <p>{selectedAudit.date} at {selectedAudit.time}</p>
                                </div>
                            </div>

                            <div className="audit-grid-detailed">
                                <div className="audit-grid-item">
                                    <label>Performer</label>
                                    <div className="val">{selectedAudit.actor} ({selectedAudit.actorRole})</div>
                                </div>
                                <div className="audit-grid-item">
                                    <label>Duty Station</label>
                                    <div className="val">{selectedAudit.duty_station}</div>
                                </div>
                                <div className="audit-grid-item">
                                    <label>IP Address</label>
                                    <div className="val">{selectedAudit.ip}</div>
                                </div>
                                <div className="audit-grid-item">
                                    <label>Log ID</label>
                                    <div className="val" style={{ fontSize: '0.7rem', opacity: 0.7 }}>{selectedAudit.id}</div>
                                </div>
                            </div>

                            <div className="audit-raw-section" style={{ marginTop: '24px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'block' }}>Action Metadata Details</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {Object.keys(selectedAudit.details_raw || {}).length > 0 ? (
                                        Object.entries(selectedAudit.details_raw).map(([key, value]) => (
                                            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                                                <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 500, wordBreak: 'break-all', maxWidth: '60%', textAlign: 'right', fontFamily: 'monospace' }}>
                                                    {Array.isArray(value) && value.length === 0 ? 'None' : typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                            No additional metadata attached to this audit event.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <footer className="modal-footer">
                            <button className="premium-page-btn active" onClick={() => setSelectedAudit(null)} style={{ width: '100%', justifyContent: 'center' }}>
                                Close Insight
                            </button>
                        </footer>
                    </div>
                </div>
            )}
            {/* Report Generator Modal */}
            <ReportGeneratorModal 
                isOpen={isReportModalOpen} 
                onClose={() => setIsReportModalOpen(false)} 
                data={logData} 
                columns={[
                    { key: 'date', label: 'Date' },
                    { key: 'time', label: 'Time' },
                    { key: 'category', label: 'Category' },
                    { key: 'description', label: 'Action' },
                    { key: 'actor', label: 'Performed By' },
                    { key: 'actorRole', label: 'Role' },
                    { key: 'duty_station', label: 'Duty Post' }
                ]}
                reportTitle="System Audit Logs Report"
            />
        </div>
    );
}
