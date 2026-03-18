export default function Logs() {
    const logData = [
        { time: '08:15:32 AM', date: 'Dec 16, 2024', type: 'Entry', typeClass: 'badge-success', plate: 'ABC 1234', camera: 'Main Gate - Entry', status: 'Authorized', statusClass: 'badge-success', owner: 'Dr. Maria Santos' },
        { time: '08:30:15 AM', date: 'Dec 16, 2024', type: 'Entry', typeClass: 'badge-success', plate: 'XYZ 5678', camera: 'Main Gate - Entry', status: 'Authorized', statusClass: 'badge-success', owner: 'John Dela Cruz' },
        { time: '09:00:45 AM', date: 'Dec 16, 2024', type: 'Alert', typeClass: 'badge-danger', plate: 'UNK 0000', camera: 'Main Gate - Entry', status: 'Unregistered', statusClass: 'badge-danger', owner: '—' },
        { time: '12:00:22 PM', date: 'Dec 16, 2024', type: 'Exit', typeClass: 'badge-info', plate: 'ABC 1234', camera: 'Main Gate - Exit', status: 'Authorized', statusClass: 'badge-success', owner: 'Dr. Maria Santos' },
        { time: '01:00:18 PM', date: 'Dec 16, 2024', type: 'Entry', typeClass: 'badge-success', plate: 'DEF 9012', camera: 'Back Gate', status: 'Authorized', statusClass: 'badge-success', owner: 'Prof. Jose Cruz' },
        { time: '01:45:33 PM', date: 'Dec 16, 2024', type: 'System', typeClass: 'badge-secondary', plate: '—', camera: 'Parking Lot B', status: 'Camera Offline', statusClass: 'badge-warning', owner: '—' }
    ];

    return (
        <div className="premium-dashboard-container">
            {/* Page Header */}
            <div className="premium-page-header">
                <div>
                    <h1>System <span>Logs</span> 📋</h1>
                    <p>Comprehensive audit trail of campus entry, exit, and system events.</p>
                </div>
                <div className="premium-header-meta">
                    <button className="premium-page-btn active">
                        <span className="material-symbols-rounded">cloud_download</span>
                        Export Manifest
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="premium-glass-card mb-6" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center' }}>
                    <div className="csucc-filter-search-mobile" style={{ margin: 0 }}>
                        <span className="material-symbols-rounded" style={{ position: 'absolute', left: '12px', color: 'var(--t-3)' }}>search</span>
                        <input
                            type="text"
                            className="form-input premium-editable"
                            style={{ paddingLeft: '40px' }}
                            placeholder="Filter by plate, node, or status code..."
                        />
                    </div>
                    <div className="flex gap-2">
                        <select className="form-select premium-editable" style={{ minWidth: '150px' }}>
                            <option>All Events</option>
                            <option>Traffic</option>
                            <option>Alerts</option>
                            <option>System</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="premium-glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="data-table-wrapper" style={{ margin: 0, border: 'none' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Temporal Data</th>
                                <th>Category</th>
                                <th>Resource ID</th>
                                <th>Node Context</th>
                                <th>Authorization</th>
                                <th>Stakeholder</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logData.map((log, i) => (
                                <tr key={i} style={{ borderBottom: i === logData.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
                                    <td>
                                        <div style={{ fontWeight: 600, color: 'var(--t-1)' }}>{log.date}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--t-3)' }}>{log.time}</div>
                                    </td>
                                    <td>
                                        <span className={`premium-pill ${log.type === 'Alert' ? 'danger' : log.type === 'Entry' ? 'success' : log.type === 'Exit' ? 'info' : 'secondary'}`}>
                                            {log.type}
                                        </span>
                                    </td>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '1px' }}>{log.plate}</td>
                                    <td style={{ color: 'var(--t-2)' }}>{log.camera}</td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <span className={`status-dot ${log.statusClass === 'badge-success' ? 'status-dot--online' : log.statusClass === 'badge-danger' ? 'status-dot--danger' : 'status-dot--away'}`}></span>
                                            <span style={{ fontSize: '0.85rem' }}>{log.status}</span>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 500 }}>{log.owner}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-between items-center mt-6">
                <span style={{ fontSize: '0.85rem', color: 'var(--t-3)' }}>Showing 1 - 6 of 1,247 audited events</span>
                <div className="flex gap-2">
                    <button className="premium-page-btn" disabled>
                        <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>chevron_left</span>
                    </button>
                    <button className="premium-page-btn active">1</button>
                    <button className="premium-page-btn">2</button>
                    <button className="premium-page-btn">
                        <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>chevron_right</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
