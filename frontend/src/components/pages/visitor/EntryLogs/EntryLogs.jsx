import { useState, useEffect } from 'react';
import api from '../../../../services/api';

export default function VisitorEntryLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const entriesPerPage = 10;
    const [stats, setStats] = useState({
        entryCount: 0,
        exitCount: 0,
        mostUsedGate: 'N/A'
    });

    const fetchLogs = async () => {
        setLoading(true);
        try {
            let url = '/entry-logs/me?limit=100';
            if (filter !== 'all') {
                url += `&direction=${filter}`;
            }

            const res = await api.get(url);
            setLogs(res.data);
            setCurrentPage(1);

            const entries = res.data.filter(l => l.direction === 'entry').length;
            const exits = res.data.filter(l => l.direction === 'exit').length;

            const gates = res.data.map(l => l.gate_name);
            const modeGate = gates.sort((a, b) =>
                gates.filter(v => v === a).length - gates.filter(v => v === b).length
            ).pop() || "N/A";

            setStats({
                entryCount: entries,
                exitCount: exits,
                mostUsedGate: modeGate
            });

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [filter]);

    const totalPages = Math.ceil(logs.length / entriesPerPage);
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    const currentLogs = logs.slice(startIndex, endIndex);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const exportToCSV = () => {
        const headers = ['Direction', 'Plate Number', 'Gate', 'Timestamp', 'Confidence'];
        const csvContent = [
            headers.join(','),
            ...logs.map(log => [
                log.direction,
                log.plate_number,
                log.gate_name,
                new Date(log.timestamp).toLocaleString(),
                log.confidence_score ? `${log.confidence_score.toFixed(1)}%` : 'N/A'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `visitor_entry_logs_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getConfidenceColor = (score) => {
        if (!score) return 'var(--t-3)';
        if (score >= 95) return '#22c55e';
        if (score >= 85) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="premium-dashboard-container">
            {/* Page Header */}
            <div className="premium-page-header">
                <div>
                    <h1>Visitor <span>Logs</span> 🗂</h1>
                    <p>Review your vehicle entry and exit history across campus gates.</p>
                </div>
                <div className="premium-header-meta">
                    <button className="premium-page-btn" onClick={exportToCSV}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filters Section Premium */}
            <div className="premium-glass-card mb-6" style={{ padding: '1.5rem' }}>
                <div className="premium-dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div className="form-group mb-0">
                        <label className="form-label" style={{ color: 'var(--t-1)', fontWeight: '600' }}>Direction</label>
                        <select
                            className="form-select"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            style={{ background: 'var(--p-bg)', borderColor: 'var(--p-border)' }}
                        >
                            <option value="all">All Directions</option>
                            <option value="entry">Entry Only</option>
                            <option value="exit">Exit Only</option>
                        </select>
                    </div>
                    <div className="form-group mb-0">
                        <label className="form-label" style={{ color: 'var(--t-1)', fontWeight: '600' }}>From Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            style={{ background: 'var(--p-bg)', borderColor: 'var(--p-border)' }}
                        />
                    </div>
                    <div className="form-group mb-0">
                        <label className="form-label" style={{ color: 'var(--t-1)', fontWeight: '600' }}>To Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            style={{ background: 'var(--p-bg)', borderColor: 'var(--p-border)' }}
                        />
                    </div>
                    <div className="form-group mb-0" style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                        <button className="premium-page-btn" style={{ flex: 1, height: '42px', justifyContent: 'center', background: 'var(--p-accent)', color: 'white', borderColor: 'transparent' }} onClick={fetchLogs}>
                            Apply
                        </button>
                        <button className="premium-page-btn" style={{ flex: 1, height: '42px', justifyContent: 'center' }} onClick={() => { setFilter('all'); setDateFrom(''); setDateTo(''); }}>
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Summary Premium */}
            <div className="premium-stats-grid mb-6">
                <div className="premium-stat-card c1">
                    <div className="premium-stat-header">
                        <span className="premium-stat-label">Total Entries</span>
                        <div className="premium-stat-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M13.8 12H3"/></svg>
                        </div>
                    </div>
                    <div className="premium-stat-value">{stats.entryCount}</div>
                    <div className="premium-stat-sub"><span className="up">Records found</span></div>
                </div>
                <div className="premium-stat-card c2">
                    <div className="premium-stat-header">
                        <span className="premium-stat-label">Total Exits</span>
                        <div className="premium-stat-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M19.8 12H9"/></svg>
                        </div>
                    </div>
                    <div className="premium-stat-value">{stats.exitCount}</div>
                    <div className="premium-stat-sub"><span className="neutral">Records found</span></div>
                </div>
                <div className="premium-stat-card c3">
                    <div className="premium-stat-header">
                        <span className="premium-stat-label">Most Used Gate</span>
                        <div className="premium-stat-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                        </div>
                    </div>
                    <div className="premium-stat-value" style={{ fontSize: '1.25rem' }}>{stats.mostUsedGate}</div>
                    <div className="premium-stat-sub"><span className="neutral">Primary Access Point</span></div>
                </div>
                <div className="premium-stat-card c4">
                    <div className="premium-stat-header">
                        <span className="premium-stat-label">Security Status</span>
                        <div className="premium-stat-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        </div>
                    </div>
                    <div className="premium-stat-value" style={{ fontSize: '1.25rem' }}>Verified</div>
                    <div className="premium-stat-sub"><span className="up">All Clear</span></div>
                </div>
            </div>

            {/* Logs Table Premium */}
            <div className="premium-table-container">
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>Direction</th>
                            <th>Plate Number</th>
                            <th>Gate</th>
                            <th>Timestamp</th>
                            <th>Confidence</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                                <div className="premium-loader"></div>
                                <p style={{ marginTop: '1rem', color: 'var(--t-3)' }}>Syncing records...</p>
                            </td></tr>
                        ) : currentLogs.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--t-3)' }}>No activity logs found for the selected period.</td></tr>
                        ) : currentLogs.map((log) => (
                            <tr key={log.id}>
                                <td>
                                    <span className={`premium-pill ${log.direction === 'entry' ? 'success' : 'warning'}`}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            {log.direction === 'entry' 
                                                ? <path d="m19 14-7 7-7-7M12 21V3"/> 
                                                : <path d="m5 10 7-7 7 7M12 3v18"/>
                                            }
                                        </svg>
                                        {log.direction === 'entry' ? 'Entry' : 'Exit'}
                                    </span>
                                </td>
                                <td><strong style={{ color: 'var(--t-1)' }}>{log.plate_number}</strong></td>
                                <td>{log.gate_name}</td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: '600', color: 'var(--t-1)' }}>{new Date(log.timestamp).toLocaleDateString()}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--t-3)' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                </td>
                                <td>
                                    <span style={{
                                        color: getConfidenceColor(log.confidence_score),
                                        fontWeight: '700',
                                        fontSize: '0.9rem'
                                    }}>
                                        {log.confidence_score ? `${log.confidence_score.toFixed(1)}%` : 'N/A'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination Premium */}
                <div className="premium-pagination">
                    <span style={{ fontSize: '0.85rem', color: 'var(--t-3)' }}>
                        Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(endIndex, logs.length)}</strong> of <strong>{logs.length}</strong> records
                    </span>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            className="premium-page-btn"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                            Previous
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', fontSize: '0.9rem', color: 'var(--t-1)', fontWeight: '600' }}>
                            {currentPage} / {totalPages || 1}
                        </div>
                        <button
                            className="premium-page-btn"
                            onClick={handleNextPage}
                            disabled={currentPage >= totalPages}
                        >
                            Next
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
