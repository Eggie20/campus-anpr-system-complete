import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivacy } from '../../../contexts/PrivacyContext';
import './ReportGeneratorModal.css';

export default function ReportGeneratorModal({ isOpen, onClose, data = [], columns = [], reportTitle = "System Report", loading = false }) {
    const navigate = useNavigate();
    const { isConfidentialMode: globalConfidential } = usePrivacy();

    const [format, setFormat] = useState('pdf');
    const [layout, setLayout] = useState('table');
    const [localConfidential, setLocalConfidential] = useState(false);
    const [paperSize, setPaperSize] = useState('A4');
    const [orientation, setOrientation] = useState('portrait');
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Dynamic filter options
    const availableStatuses = useMemo(() => [...new Set(data.map(i => i.status).filter(Boolean))], [data]);
    const availableTypes = useMemo(() => [...new Set(data.map(i => i.type || i.event_type || i.anomaly_type).filter(Boolean))], [data]);

    // Filtered data
    const filteredData = useMemo(() => data.filter(item => {
        const matchSearch = searchTerm === '' || Object.values(item).some(v =>
            String(v).toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchStatus = statusFilter === '' || item.status === statusFilter;
        const itemType = item.type || item.event_type || item.anomaly_type;
        const matchType = typeFilter === '' || itemType === typeFilter;

        // Date range filter — works with 'date' or 'time' fields
        let matchDate = true;
        if (startDate || endDate) {
            const dateStr = item.date || item.time || '';
            // Parse dates like "May 17, 2026" or "May 17, 2026 02:59:26 AM"
            const itemDate = new Date(dateStr);
            if (!isNaN(itemDate.getTime())) {
                if (startDate) {
                    const start = new Date(startDate + 'T00:00:00');
                    if (itemDate < start) matchDate = false;
                }
                if (endDate) {
                    const end = new Date(endDate + 'T23:59:59');
                    if (itemDate > end) matchDate = false;
                }
            }
        }

        return matchSearch && matchStatus && matchType && matchDate;
    }), [data, searchTerm, statusFilter, typeFilter, startDate, endDate]);

    const activeCols = useMemo(() => columns.filter(c => selectedColumns.includes(c.key)), [columns, selectedColumns]);

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setSelectedColumns(columns.map(c => c.key));
            setSearchTerm('');
            setStatusFilter('');
            setTypeFilter('');
            setStartDate('');
            setEndDate('');
            setLocalConfidential(globalConfidential);
            if (reportTitle.toLowerCase().includes('traffic') || reportTitle.toLowerCase().includes('entry') || reportTitle.toLowerCase().includes('roster')) {
                setLayout('timeline');
                setOrientation('landscape');
            } else {
                setLayout('table');
                setOrientation('portrait');
            }
        }
    }, [isOpen, columns, globalConfidential, reportTitle]);

    if (!isOpen) return null;

    const handleToggleColumn = (key) => {
        setSelectedColumns(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    /* ── CSV Generator ──────────────────────────────────────────── */
    const generateCSV = () => {
        const csvRows = [activeCols.map(c => `"${c.label}"`).join(',')];
        filteredData.forEach(row => {
            csvRows.push(activeCols.map(c => {
                let val = row[c.key];
                if (val === null || val === undefined) val = '';
                val = String(val).replace(/"/g, '""');
                return `"${val}"`;
            }).join(','));
        });
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${reportTitle.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        onClose();
    };

    /* ── Printable PDF Generator ────────────────────────────────── */
    const generatePrintableDocument = () => {
        navigate('/admin/report-preview', {
            state: {
                reportTitle,
                columns: activeCols,
                data: filteredData,
                isConfidential: localConfidential,
                paperSize,
                orientation,
                layout
            }
        });
        onClose();
    };

    const handleGenerate = () => format === 'csv' ? generateCSV() : generatePrintableDocument();

    /* ── Render ──────────────────────────────────────────────────── */
    return (
        <div className="report-modal-backdrop active" onClick={onClose}>
            <div className="report-modal" onClick={e => e.stopPropagation()}>

                {/* ─── Header ───────────────────────────────────── */}
                <header className="report-modal-header">
                    <div className="header-title">
                        <span className="material-symbols-rounded">summarize</span>
                        <div>
                            <h2>Generate Report</h2>
                            <p className="report-subtitle">{reportTitle}</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <span className="material-symbols-rounded">close</span>
                    </button>
                </header>

                {/* ─── Scrollable Content ────────────────────────── */}
                <div className="report-modal-scroll-area">

                    {/* ─── Config Grid (2 Columns) ──────────────── */}
                    <div className="report-config-grid">

                        {/* Left: Search, Filters, Format */}
                        <div className="config-column">
                            <div>
                                <div className="rg-section-label">
                                    <span className="material-symbols-rounded">filter_alt</span>
                                    Refine Data
                                </div>
                                <div className="rg-search-box">
                                    <span className="material-symbols-rounded">search</span>
                                    <input
                                        type="text"
                                        className="rg-search-input"
                                        placeholder="Search by name, plate, ID..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                {(availableStatuses.length > 0 || availableTypes.length > 0) && (
                                    <div className="rg-filter-row rg-mt">
                                        {availableStatuses.length > 0 && (
                                            <select className="rg-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                                <option value="">All Statuses</option>
                                                {availableStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        )}
                                        {availableTypes.length > 0 && (
                                            <select className="rg-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                                                <option value="">All Types</option>
                                                {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        )}
                                    </div>
                                )}
                                <div className="rg-date-range rg-mt">
                                    <div>
                                        <span className="rg-mini-label">From</span>
                                        <input
                                            type="date"
                                            className="rg-date-input"
                                            value={startDate}
                                            onChange={e => setStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <span className="rg-mini-label">To</span>
                                        <input
                                            type="date"
                                            className="rg-date-input"
                                            value={endDate}
                                            onChange={e => setEndDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="rg-section-label">
                                    <span className="material-symbols-rounded">description</span>
                                    Report Format
                                </div>
                                <div className="rg-format-row">
                                    <button className={`rg-format-btn ${format === 'pdf' ? 'active' : ''}`} onClick={() => setFormat('pdf')}>
                                        <span className="material-symbols-rounded">picture_as_pdf</span>
                                        PDF
                                    </button>
                                    <button className={`rg-format-btn ${format === 'csv' ? 'active' : ''}`} onClick={() => setFormat('csv')}>
                                        <span className="material-symbols-rounded">table_chart</span>
                                        CSV
                                    </button>
                                </div>
                                {format === 'pdf' && (
                                    <div className="rg-print-settings rg-mt">
                                        <div>
                                            <span className="rg-mini-label">Layout</span>
                                            <select 
                                                value={layout} 
                                                onChange={e => {
                                                    const newLayout = e.target.value;
                                                    setLayout(newLayout);
                                                    if (newLayout === 'timeline') {
                                                        setOrientation('landscape');
                                                    } else if (newLayout === 'table') {
                                                        setOrientation('portrait');
                                                    }
                                                }} 
                                                className="rg-select"
                                            >
                                                <option value="table">Standard Table</option>
                                                {reportTitle.includes('Traffic') || reportTitle.includes('Analytics') ? (
                                                    <option value="timeline">Activity Timeline</option>
                                                ) : null}
                                            </select>
                                        </div>
                                        <div>
                                            <span className="rg-mini-label">Paper Size</span>
                                            <select value={paperSize} onChange={e => setPaperSize(e.target.value)} className="rg-select">
                                                <option value="A4">A4 (8.27" x 11.69")</option>
                                                <option value="letter">Letter (8.5" x 11")</option>
                                                <option value="legal">Legal (8.5" x 14")</option>
                                            </select>
                                        </div>
                                        <div>
                                            <span className="rg-mini-label">Orientation</span>
                                            <select value={orientation} onChange={e => setOrientation(e.target.value)} className="rg-select">
                                                <option value="portrait">Portrait</option>
                                                <option value="landscape">Landscape</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="rg-mt" style={{ padding: '1rem', background: 'rgba(56, 189, 248, 0.05)', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)', marginTop: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', fontWeight: 600 }}>
                                        <span className="material-symbols-rounded" style={{ color: '#38bdf8' }}>{localConfidential ? 'visibility_off' : 'visibility'}</span>
                                        Confidential Format
                                    </div>
                                    <div 
                                        className={`premium-tog ${localConfidential ? 'active' : ''}`} 
                                        onClick={() => setLocalConfidential(!localConfidential)}
                                        style={{ background: localConfidential ? '#38bdf8' : 'rgba(255,255,255,0.1)' }}
                                    >
                                        <div className="premium-tok" style={{ transform: localConfidential ? 'translateX(16px)' : 'translateX(0)' }}></div>
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                                    Automatically mask sensitive identities (names, contacts) in the generated document.
                                </p>
                            </div>
                        </div>

                        {/* Right: Column Selection & Summary */}
                        <div className="config-column">
                            <div>
                                <div className="rg-section-label">
                                    <span className="material-symbols-rounded">view_column</span>
                                    Columns to Include
                                </div>
                                <div className="rg-columns-grid">
                                    {columns.map(col => (
                                        <label
                                            key={col.key}
                                            className={`rg-col-chip ${selectedColumns.includes(col.key) ? 'selected' : ''}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedColumns.includes(col.key)}
                                                onChange={() => handleToggleColumn(col.key)}
                                            />
                                            {col.label}
                                        </label>
                                    ))}
                                </div>
                                <div className="rg-columns-actions">
                                    <button type="button" onClick={() => setSelectedColumns(columns.map(c => c.key))}>Select All</button>
                                    <button type="button" onClick={() => setSelectedColumns([])}>Deselect All</button>
                                </div>
                            </div>

                            <div className="rg-export-summary">
                                <div className="summary-icon">
                                    <span className="material-symbols-rounded">dataset</span>
                                </div>
                                <div className="summary-text">
                                    <h4>{loading ? 'Fetching records...' : `${filteredData.length} Records Ready`}</h4>
                                    <p>{selectedColumns.length} of {columns.length} columns selected • {format.toUpperCase()}{format === 'pdf' ? ` (${layout})` : ''}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─── Data Preview ──────────────────────────── */}
                    <div className="rg-preview-section">
                        <div className="rg-section-label">
                            <span className="material-symbols-rounded">visibility</span>
                            Data Preview {!loading && filteredData.length > 0 && `(Showing ${Math.min(filteredData.length, 10)} of ${filteredData.length})`}
                        </div>
                        <div className="rg-preview-wrapper">
                            <div className="rg-preview-scroll">
                                {loading ? (
                                    <div className="rg-preview-empty">
                                        <span className="material-symbols-rounded spinner-slow" style={{ animation: 'spin 2s linear infinite', color: '#38bdf8' }}>sync</span>
                                        Loading comprehensive report data...
                                    </div>
                                ) : filteredData.length > 0 && activeCols.length > 0 ? (
                                    <table className="rg-preview-table">
                                        <thead>
                                            <tr>
                                                <th className="rg-th-num">#</th>
                                                {activeCols.map(col => (
                                                    <th key={col.key}>{col.label}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredData.slice(0, 10).map((row, idx) => (
                                                <tr key={idx}>
                                                    <td className="rg-td-num">{idx + 1}</td>
                                                    {activeCols.map(col => (
                                                        <td key={col.key}>{row[col.key] ?? '—'}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="rg-preview-empty">
                                        <span className="material-symbols-rounded">search_off</span>
                                        {activeCols.length === 0
                                            ? 'Select at least one column to preview data.'
                                            : 'No records match your current filters.'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Footer ───────────────────────────────────── */}
                <footer className="report-modal-footer">
                    <div className="rg-footer-info">
                        <span className="material-symbols-rounded">info</span>
                        {format === 'pdf' ? `${paperSize.toUpperCase()} • ${orientation}` : 'CSV Spreadsheet'} • {loading ? '...' : `${filteredData.length} records`}
                    </div>
                    <div className="rg-footer-actions">
                        <button className="rg-btn" onClick={onClose}>Cancel</button>
                        <button
                            className="rg-btn primary"
                            onClick={handleGenerate}
                            disabled={selectedColumns.length === 0 || filteredData.length === 0 || loading}
                        >
                            <span className="material-symbols-rounded">{format === 'pdf' ? 'preview' : 'download'}</span>
                            {format === 'pdf' ? 'Preview & Print' : 'Download CSV'}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
