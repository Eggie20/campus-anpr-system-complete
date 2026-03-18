import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    BarElement
} from 'chart.js';
import { DashboardWidget } from '../../../../components';
import './Analytics.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function Analytics() {
    const [timeRange, setTimeRange] = useState('7d');
    const [searchTerm, setSearchTerm] = useState('');
    const [gateFilter, setGateFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Expanded Mock Data
    const allTrafficLogs = [
        { plate: 'ABC 1234', owner: 'Dr. Maria Santos', role: 'Faculty', type: 'Car', gate: 'Main Gate', status: 'Entry', time: '10:23 AM', date: '2026-03-18' },
        { plate: 'XYZ 5678', owner: 'John Dela Cruz', role: 'Student', type: 'Motorcycle', gate: 'Back Gate', status: 'Exit', time: '10:18 AM', date: '2026-03-18' },
        { plate: 'DEF 9012', owner: 'Prof. Jose Cruz', role: 'Faculty', type: 'Car', gate: 'Main Gate', status: 'Entry', time: '09:55 AM', date: '2026-03-18' },
        { plate: 'GHI 3456', owner: 'Anna Reyes', role: 'Student', type: 'Motorcycle', gate: 'Back Gate', status: 'Entry', time: '09:42 AM', date: '2026-03-18' },
        { plate: 'JKL 7890', owner: 'Engr. Sam Tan', role: 'Faculty', type: 'Utility', gate: 'Main Gate', status: 'Entry', time: '09:30 AM', date: '2026-03-18' },
        { plate: 'MNO 2468', owner: 'Liza Sober', role: 'Staff', type: 'Car', gate: 'Back Gate', status: 'Exit', time: '09:15 AM', date: '2026-03-18' },
        { plate: 'PQR 1357', owner: 'Ken Chan', role: 'Student', type: 'Car', gate: 'Main Gate', status: 'Entry', time: '08:50 AM', date: '2026-03-18' },
        { plate: 'STU 8642', owner: 'Bella Po', role: 'Staff', type: 'Motorcycle', gate: 'Back Gate', status: 'Entry', time: '08:30 AM', date: '2026-03-18' },
        { plate: 'VWX 9753', owner: 'Coco Mart', role: 'Faculty', type: 'Utility', gate: 'Main Gate', status: 'Exit', time: '08:15 AM', date: '2026-03-18' },
        { plate: 'YZA 0246', owner: 'Nadine Lu', role: 'Student', type: 'Car', gate: 'Back Gate', status: 'Entry', time: '08:00 AM', date: '2026-03-18' },
    ];

    // Filtering Logic
    const filteredLogs = allTrafficLogs.filter(log => {
        const matchesSearch = log.plate.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             log.owner.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGate = gateFilter === '' || log.gate === gateFilter;
        const matchesType = typeFilter === '' || log.type === typeFilter;
        const matchesDate = (startDate === '' || log.date >= startDate) && 
                           (endDate === '' || log.date <= endDate);
        return matchesSearch && matchesGate && matchesType && matchesDate;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

    const handleClearFilters = () => {
        setSearchTerm('');
        setGateFilter('');
        setTypeFilter('');
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
    };

    // Chart Data Config
    const chartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Vehicles In',
                data: [210, 188, 245, 198, 260, 120, 95],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
            {
                label: 'Vehicles Out',
                data: [195, 176, 230, 185, 248, 110, 88],
                borderColor: '#f43f5e',
                backgroundColor: 'rgba(244, 63, 94, 0.05)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 12,
                cornerRadius: 8,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1
            }
        },
        scales: {
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: 'var(--t-3)', font: { size: 11 } }
            },
            x: {
                grid: { display: false },
                ticks: { color: 'var(--t-3)', font: { size: 11 } }
            }
        }
    };

    const peakHours = [
        { label: '6-8AM', val: 78, split: 'M:48 · B:30', peak: false },
        { label: '8-10AM', val: 156, split: 'M:98 · B:58', peak: false },
        { label: '10-12PM', val: 92, split: 'M:60 · B:32', peak: false },
        { label: '12-2PM', val: 124, split: 'M:80 · B:44', peak: false },
        { label: '2-4PM', val: 98, split: 'M:62 · B:36', peak: false },
        { label: '4-6PM', val: 189, split: 'M:121 · B:68', peak: true },
    ];

    return (
        <div className="premium-dashboard-container">
            {/* Page Header */}
            <div className="premium-page-header">
                <div>
                    <h1>System <span>Intelligence</span> 📊</h1>
                    <p>Advanced traffic patterns, occupancy analytics, and security insights.</p>
                </div>
                <div className="premium-header-meta">
                    <select 
                        className="form-select premium-editable" 
                        style={{ width: 'auto', marginRight: '12px' }}
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="1d">Today</option>
                        <option value="30d">Last 30 Days</option>
                    </select>
                    <button className="premium-page-btn">
                        <span className="material-symbols-rounded">file_download</span>
                        Export Dataset
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="analytics-cards-grid">
                <div className="scard scard--success">
                    <div className="scard-badge"><span className="duty-badge duty-on" style={{ fontSize: '10px' }}>↑ 15%</span></div>
                    <div className="scard-label">Vehicles In</div>
                    <div className="scard-val">1,247</div>
                    <div className="scard-sub">
                        <div className="scard-sub-row"><span>Main gate</span><span className="scard-sub-val">780</span></div>
                        <div className="scard-sub-row"><span>Back gate</span><span className="scard-sub-val">467</span></div>
                    </div>
                </div>
                <div className="scard scard--info">
                    <div className="scard-badge"><span className="duty-badge duty-on" style={{ fontSize: '10px' }}>↑ 12%</span></div>
                    <div className="scard-label">Vehicles Out</div>
                    <div className="scard-val">1,198</div>
                    <div className="scard-sub">
                        <div className="scard-sub-row"><span>Main gate</span><span className="scard-sub-val">741</span></div>
                        <div className="scard-sub-row"><span>Back gate</span><span className="scard-sub-val">457</span></div>
                    </div>
                </div>
                <div className="scard scard--purple">
                    <div className="scard-badge"><span className="duty-badge duty-on" style={{ fontSize: '10px', background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7' }}>Live</span></div>
                    <div className="scard-label">On Campus Now</div>
                    <div className="scard-val">49</div>
                    <div className="scard-sub">
                        <div className="scard-sub-row"><span>Main gate</span><span className="scard-sub-val">27</span></div>
                        <div className="scard-sub-row"><span>Back gate</span><span className="scard-sub-val">22</span></div>
                    </div>
                </div>
                <div className="scard scard--warning">
                    <div className="scard-label">Avg. Time on Campus</div>
                    <div className="scard-val">2.4h</div>
                    <div className="scard-sub">
                        <div className="scard-sub-row"><span>Per visit</span><span className="scard-sub-val">last 7 days</span></div>
                    </div>
                </div>
                <div className="scard scard--danger">
                    <div className="scard-badge"><span className="duty-badge duty-off" style={{ fontSize: '10px' }}>↓ 25%</span></div>
                    <div className="scard-label">Anomaly Alerts</div>
                    <div className="scard-val">23</div>
                    <div className="scard-sub">
                        <div className="scard-sub-row"><span>Unregistered</span><span className="scard-sub-val">12</span></div>
                        <div className="scard-sub-row"><span>Offline cam</span><span className="scard-sub-val">3</span></div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="dashboard-grid dashboard-grid--2col mb-8" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
                <DashboardWidget title="Temporal Traffic Flow" icon={<span className="material-symbols-rounded">show_chart</span>}>
                    <div className="h-64 mt-4">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                    <div className="flex gap-4 mt-6 justify-center">
                        <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--t-3)' }}>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3b82f6' }}></div>
                            Vehicles In
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--t-3)' }}>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f43f5e' }}></div>
                            Vehicles Out
                        </div>
                    </div>
                </DashboardWidget>

                <DashboardWidget title="Occupancy Peak Profile" icon={<span className="material-symbols-rounded">analytics</span>}>
                    <div className="peak-grid">
                        {peakHours.map((hour, i) => (
                            <div key={i} className="peak-cell">
                                {hour.peak && <span className="peak-badge">Peak</span>}
                                <div className="peak-time">{hour.label}</div>
                                <div className="peak-val">{hour.val}</div>
                                <div className="peak-split">{hour.split}</div>
                            </div>
                        ))}
                    </div>
                    <p style={{ fontSize: '0.8rem', textAlign: 'center', color: 'var(--t-3)', marginTop: '1.5rem' }}>Dynamic peak detected at 16:00 - 18:00 interval.</p>
                </DashboardWidget>
            </div>

            {/* Distribution Section */}
            <div className="dashboard-grid dashboard-grid--2col mb-8">
                <DashboardWidget title="Categorical Distribution" icon={<span className="material-symbols-rounded">pie_chart</span>}>
                    <div className="bar-row">
                        <div className="bar-top"><span>Passenger cars</span><span style={{ color: 'var(--ac)' }}>62%</span></div>
                        <div className="bar-wrap"><div className="bar-fill" style={{ width: '62%', background: 'var(--ac)' }}></div></div>
                        <span className="bar-count">55 vehicles</span>
                    </div>
                    <div className="bar-row">
                        <div className="bar-top"><span>Two-wheelers</span><span style={{ color: '#3b82f6' }}>28%</span></div>
                        <div className="bar-wrap"><div className="bar-fill" style={{ width: '28%', background: '#3b82f6' }}></div></div>
                        <span className="bar-count">25 vehicles</span>
                    </div>
                    <div className="bar-row">
                        <div className="bar-top"><span>Utility vehicles</span><span style={{ color: '#f59e0b' }}>7%</span></div>
                        <div className="bar-wrap"><div className="bar-fill" style={{ width: '7%', background: '#f59e0b' }}></div></div>
                        <span className="bar-count">6 vehicles</span>
                    </div>
                </DashboardWidget>

                <DashboardWidget title="Resident Demographic" icon={<span className="material-symbols-rounded">groups</span>}>
                    <div className="bar-row">
                        <div className="bar-top"><span>Students</span><span style={{ color: 'var(--ac)' }}>68%</span></div>
                        <div className="bar-wrap"><div className="bar-fill" style={{ width: '68%', background: 'var(--ac)' }}></div></div>
                        <span className="bar-count">107 residents</span>
                    </div>
                    <div className="bar-row">
                        <div className="bar-top"><span>Faculty</span><span style={{ color: '#a855f7' }}>24%</span></div>
                        <div className="bar-wrap"><div className="bar-fill" style={{ width: '24%', background: '#a855f7' }}></div></div>
                        <span className="bar-count">38 residents</span>
                    </div>
                    <div className="bar-row">
                        <div className="bar-top"><span>Staff</span><span style={{ color: '#f59e0b' }}>5%</span></div>
                        <div className="bar-wrap"><div className="bar-fill" style={{ width: '5%', background: '#f59e0b' }}></div></div>
                        <span className="bar-count">8 residents</span>
                    </div>
                </DashboardWidget>
            </div>

            {/* Traffic Log Table */}
            <div className="analytics-table-section">
                <div className="analytics-table-header">
                    <div className="analytics-table-title-row">
                        <div className="analytics-table-title">Traffic Log</div>
                        <div className="analytics-table-count">
                            Showing {Math.min(startIndex + 1, filteredLogs.length)} to {Math.min(startIndex + itemsPerPage, filteredLogs.length)} of {filteredLogs.length} entries
                        </div>
                    </div>
                    <div className="filters-bar">
                        <input 
                            className="form-input fi fi-search" 
                            type="text" 
                            placeholder="Search plate, owner..." 
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                        <div className="date-group">
                            <input 
                                type="date" 
                                placeholder="From" 
                                value={startDate}
                                onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                            />
                            <span style={{ color: 'var(--t-3)' }}>→</span>
                            <input 
                                type="date" 
                                placeholder="To" 
                                value={endDate}
                                onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                        <select 
                            className="form-select fi fi-select"
                            value={gateFilter}
                            onChange={(e) => { setGateFilter(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="">All Gates</option>
                            <option>Main Gate</option>
                            <option>Back Gate</option>
                        </select>
                        <select 
                            className="form-select fi fi-select"
                            value={typeFilter}
                            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="">All Types</option>
                            <option>Car</option>
                            <option>Motorcycle</option>
                            <option>Utility</option>
                        </select>
                        <button 
                            className="premium-page-btn" 
                            style={{ padding: '0 12px' }}
                            onClick={handleClearFilters}
                            title="Clear Filters"
                        >
                            <span className="material-symbols-rounded">filter_alt_off</span>
                        </button>
                    </div>
                </div>
                <div className="premium-table-container">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Plate</th>
                                <th>Owner</th>
                                <th>Role</th>
                                <th>Vehicle Type</th>
                                <th>Gate</th>
                                <th>Status</th>
                                <th>Time</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedLogs.map((log, i) => (
                                <tr key={i}>
                                    <td><b style={{ fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>{log.plate}</b></td>
                                    <td>{log.owner}</td>
                                    <td>
                                        <span className={`post-badge ${log.role === 'Faculty' ? 'post-roving' : 'post-main'}`} style={{ fontSize: '10px' }}>
                                            {log.role}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--t-3)' }}>{log.type}</td>
                                    <td>
                                        <span className={`post-badge ${log.gate === 'Main Gate' ? 'post-main' : 'post-back'}`} style={{ fontSize: '10px' }}>
                                            {log.gate}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`duty-badge ${log.status === 'Entry' ? 'duty-on' : 'duty-off'}`} style={{ fontSize: '10px' }}>
                                            {log.status === 'Entry' ? '↓' : '↑'} {log.status}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--t-3)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{log.time}</td>
                                    <td style={{ color: 'var(--t-3)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{log.date}</td>
                                </tr>
                            ))}
                            {paginatedLogs.length === 0 && (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--t-3)' }}>
                                        No traffic logs found matching the selected filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-between items-center p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--t-3)' }}>
                        Page {currentPage} of {Math.max(1, totalPages)}
                    </div>
                    <div className="pagination-wrap">
                        <button 
                            className="premium-page-btn" 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        >
                            ‹
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button 
                                key={page}
                                className={`premium-page-btn ${currentPage === page ? 'active' : ''}`} 
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}
                        <button 
                            className="premium-page-btn" 
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        >
                            ›
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
