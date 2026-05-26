import { useState, useEffect } from 'react';
import api from '../../../../services/api';
import { Line, Doughnut } from 'react-chartjs-2';
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
    BarElement,
    ArcElement
} from 'chart.js';
import { DashboardWidget } from '../../../../components';
import { useTheme } from '../../../../contexts/ThemeContext';
import { usePrivacy } from '../../../../contexts/PrivacyContext';
import ReportGeneratorModal from '../../../widgets/ReportGenerator/ReportGeneratorModal';
import './Analytics.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function Analytics() {
    const { isDark } = useTheme();
    const { anonymizeName, anonymizePlate } = usePrivacy();
    const [timeRange, setTimeRange] = useState('7d');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [gateFilter, setGateFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [hiddenCategories, setHiddenCategories] = useState([]);
    const [hiddenDemographics, setHiddenDemographics] = useState([]);
    const [demoFilter, setDemoFilter] = useState('all');
    const [temporalTypeFilter, setTemporalTypeFilter] = useState('');
    const [temporalRoleFilter, setTemporalRoleFilter] = useState('');
    const [topVehiclesTimeframe, setTopVehiclesTimeframe] = useState('7d');

    // Color palettes for distribution sections
    const categoryColors = {
        'Car': '#3b82f6',
        'Van': '#f59e0b',
        'Motorcycle': '#10b981',
        'Truck': '#ef4444',
        'Utility': '#8b5cf6',
        'Suv': '#ec4899',
        'Bus': '#06b6d4',
    };
    const defaultCatColor = '#6366f1';

    const demographicColors = {
        'Faculty': '#3b82f6',
        'Visitor': '#f59e0b',
        'Admin': '#ef4444',
        'Staff': '#8b5cf6',
        'Security': '#10b981',
        'Student': '#ec4899',
    };
    const defaultDemoColor = '#06b6d4';

    const getCatColor = (label) => categoryColors[label] || defaultCatColor;
    const getDemoColor = (label) => {
        const key = Object.keys(demographicColors).find(k => label.toLowerCase().startsWith(k.toLowerCase()));
        return key ? demographicColors[key] : defaultDemoColor;
    };

    const toggleCategory = (label) => {
        setHiddenCategories(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
    };
    const toggleDemographic = (label) => {
        setHiddenDemographics(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
    };

    const chartGridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const chartTextColor = isDark ? '#94a3b8' : '#64748b';

    const [stats, setStats] = useState(null);
    const [chartDataState, setChartDataState] = useState(null);
    const [distributions, setDistributions] = useState(null);
    const [peakHours, setPeakHours] = useState([]);
    const [allTrafficLogs, setAllTrafficLogs] = useState([]);
    const [topVehicles, setTopVehicles] = useState([]);
    const [pagination, setPagination] = useState({ total: 0 });
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const [sRes, cRes, dRes, pRes, lRes] = await Promise.all([
                api.get('/analytics/stats'),
                api.get(`/analytics/temporal?days=${timeRange === '30d' ? 30 : timeRange === '1d' ? 1 : 7}${temporalTypeFilter ? `&vehicle_type=${temporalTypeFilter}` : ''}${temporalRoleFilter ? `&user_role=${temporalRoleFilter}` : ''}`),
                api.get('/analytics/distributions'),
                api.get('/analytics/peak-profile'),
                api.get(`/admin/entry-logs?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}&direction=${gateFilter}&type=${typeFilter}`)
            ]);

            setStats(sRes.data);
            setChartDataState({
                labels: cRes.data.labels,
                datasets: cRes.data.datasets.map(ds => ({
                    ...ds,
                    borderColor: ds.color,
                    backgroundColor: ds.label.includes('In') ? 'rgba(59, 130, 246, 0.1)' : 'rgba(244, 63, 94, 0.05)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                }))
            });
            setDistributions(dRes.data);
            setPeakHours(pRes.data.intervals);
            setAllTrafficLogs(lRes.data.logs);
            setPagination({ total: lRes.data.pagination?.total_items || lRes.data.total || 0 });
        } catch (err) {
            console.error("Failed to load analytics:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange, currentPage, searchTerm, gateFilter, typeFilter, itemsPerPage, temporalTypeFilter, temporalRoleFilter]);

    useEffect(() => {
        const fetchTopVehicles = async () => {
            try {
                let days = 7;
                if (topVehiclesTimeframe === '1d') days = 1;
                else if (topVehiclesTimeframe === '30d') days = 30;
                else if (topVehiclesTimeframe === '365d') days = 365;
                
                const res = await api.get(`/analytics/top-vehicles?days=${days}&limit=10`);
                setTopVehicles(res.data);
            } catch (err) {
                console.error("Failed to load top vehicles:", err);
            }
        };
        fetchTopVehicles();
    }, [topVehiclesTimeframe]);

    const filteredLogsCount = pagination.total;
    const totalPages = Math.ceil(filteredLogsCount / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;

    const handleClearFilters = () => {
        setSearchTerm('');
        setGateFilter('');
        setTypeFilter('');
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255,255,255,0.97)',
                titleColor: isDark ? '#fff' : '#111',
                bodyColor: isDark ? '#cdd6f4' : '#444',
                padding: 12,
                cornerRadius: 8,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                borderWidth: 1
            }
        },
        scales: {
            y: {
                grid: { color: chartGridColor },
                ticks: { color: chartTextColor, font: { size: 11 } }
            },
            x: {
                grid: { display: false },
                ticks: { color: chartTextColor, font: { size: 11 } }
            }
        }
    };

    const MetricCard = ({ label, value, subRows, variant, change, subtext, badgeText }) => (
        <div className={`metric-intelligence-card metric-intelligence-card--${variant}`}>
            <div className={`intel-stat-badge intel-stat-badge--${variant}`}>
                {badgeText || (change !== undefined ? `${change >= 0 ? '↑' : '↓'} ${Math.abs(change)}%` : 'Synced')}
            </div>
            <div className="metric-intelligence-card__label">{label}</div>
            <div className="metric-intelligence-card__value">{value}</div>
            <div className="metric-intelligence-card__footer">
                {subRows ? (
                    subRows.map((row, i) => (
                        <div key={i} className="metric-intelligence-card__sub-row">
                            <span>{row.label}</span>
                            <span className="val">{row.value}</span>
                        </div>
                    ))
                ) : (
                    <div className="metric-intelligence-card__sub-row">
                        <span>{variant === 'warning' ? 'Per visit' : 'Real-time'}</span>
                        <span className="val">{subtext || 'Registry'}</span>
                    </div>
                )}
            </div>
        </div>
    );

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
                    <button className="premium-page-btn" onClick={() => setIsReportModalOpen(true)}>
                        <span className="material-symbols-rounded">summarize</span>
                        Generate Report
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            {loading ? (
                <div className="flex items-center justify-center p-20" style={{ gridColumn: '1/-1' }}>
                    <div className="loading-spinner-container">
                        <span className="material-symbols-rounded spin-icon">sync</span>
                        <p>Aggregating campus intelligence...</p>
                    </div>
                </div>
            ) : (
                <div className="analytics-metrics-grid mb-8">
                    <MetricCard 
                        label="Vehicles In" 
                        value={stats?.vehiclesIn?.value || 0} 
                        change={stats?.vehiclesIn?.change}
                        subRows={stats?.vehiclesIn?.breakdown}
                        variant="success"
                    />
                    <MetricCard 
                        label="Vehicles Out" 
                        value={stats?.vehiclesOut?.value || 0} 
                        change={stats?.vehiclesOut?.change}
                        subRows={stats?.vehiclesOut?.breakdown}
                        variant="info"
                    />
                    <MetricCard 
                        label="On Campus Now" 
                        value={stats?.onCampusNow?.value || 0} 
                        variant="purple"
                    />

                    <MetricCard 
                        label="Anomaly Alerts" 
                        value={stats?.anomalyAlerts?.value || 0} 
                        change={stats?.anomalyAlerts?.change}
                        subRows={stats?.anomalyAlerts?.breakdown}
                        variant="danger"
                    />
                </div>
            )}

            {/* Charts Section */}
            <div className="dashboard-grid dashboard-grid--2col mb-8" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
                <DashboardWidget title="Temporal Traffic Flow" icon={<span className="material-symbols-rounded">show_chart</span>}>
                    <div className="flex gap-2 mb-2" style={{ justifyContent: 'flex-end' }}>
                        <select 
                            className="dist-filter-select"
                            value={temporalTypeFilter}
                            onChange={(e) => setTemporalTypeFilter(e.target.value)}
                        >
                            <option value="">All Vehicle Types</option>
                            <option value="car">Car</option>
                            <option value="motorcycle">Motorcycle</option>
                            <option value="van">Van</option>
                            <option value="truck">Truck</option>
                            <option value="other">Other</option>
                        </select>
                        <select 
                            className="dist-filter-select"
                            value={temporalRoleFilter}
                            onChange={(e) => setTemporalRoleFilter(e.target.value)}
                        >
                            <option value="">All Roles</option>
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                            <option value="security">Security</option>
                            <option value="visitor">Visitor</option>
                        </select>
                    </div>
                    <div className="h-64 mt-2">
                        {chartDataState ? (
                            <Line data={chartDataState} options={chartOptions} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted">Loading chart...</div>
                        )}
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
                            <div key={i} className={`peak-cell ${hour.peak ? 'active' : ''}`}>
                                {hour.peak && <span className="peak-badge">Peak</span>}
                                <div className="peak-time">{hour.label}</div>
                                <div className="peak-val">{hour.val}</div>
                                <div className="peak-split">{hour.split}</div>
                            </div>
                        ))}
                    </div>
                    <p style={{ fontSize: '0.8rem', textAlign: 'center', color: 'var(--t-3)', marginTop: '1.5rem' }}>
                        {peakHours.some(h => h.peak) ? `Dynamic peak detected at ${peakHours.find(h => h.peak).label} interval.` : 'Analyzing traffic patterns...'}
                    </p>
                </DashboardWidget>
            </div>

            {/* Distribution Section */}
            <div className="dashboard-grid dashboard-grid--2col mb-8">
                <DashboardWidget title="Categorical Distribution" icon={<span className="material-symbols-rounded">pie_chart</span>} collapsible={true}>
                    {distributions?.categorical && (
                        <div className="h-48 mb-6 flex justify-center">
                            <Doughnut 
                                data={{
                                    labels: distributions.categorical.filter(d => !hiddenCategories.includes(d.label)).map(d => d.label),
                                    datasets: [{
                                        data: distributions.categorical.filter(d => !hiddenCategories.includes(d.label)).map(d => d.count),
                                        backgroundColor: distributions.categorical.filter(d => !hiddenCategories.includes(d.label)).map(d => getCatColor(d.label)),
                                        borderWidth: 0,
                                        cutout: '70%'
                                    }]
                                }} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: {
                                            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255,255,255,0.97)',
                                            titleColor: isDark ? '#fff' : '#111',
                                            bodyColor: isDark ? '#cdd6f4' : '#444',
                                            padding: 12,
                                            cornerRadius: 8,
                                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                            borderWidth: 1
                                        }
                                    }
                                }}
                            />
                        </div>
                    )}
                    {distributions?.categorical?.filter(d => !hiddenCategories.includes(d.label)).map((d, i) => (
                        <div key={i} className="bar-row">
                            <div className="bar-top">
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: getCatColor(d.label), display: 'inline-block', flexShrink: 0 }}></span>
                                    {d.label}
                                </span>
                                <span style={{ color: getCatColor(d.label), fontWeight: 700 }}>{d.percentage}%</span>
                            </div>
                            <div className="bar-wrap"><div className="bar-fill" style={{ width: `${d.percentage}%`, background: `linear-gradient(90deg, ${getCatColor(d.label)}, ${getCatColor(d.label)}88)` }}></div></div>
                            <span className="bar-count">{d.count} vehicles</span>
                        </div>
                    ))}
                    {/* Clickable Legend */}
                    <div className="dist-legend">
                        {distributions?.categorical?.map((d, i) => (
                            <button
                                key={i}
                                className={`dist-legend-item ${hiddenCategories.includes(d.label) ? 'dist-legend-item--hidden' : ''}`}
                                onClick={() => toggleCategory(d.label)}
                                title={hiddenCategories.includes(d.label) ? `Show ${d.label}` : `Hide ${d.label}`}
                            >
                                <span className="dist-legend-dot" style={{ background: hiddenCategories.includes(d.label) ? 'rgba(255,255,255,0.15)' : getCatColor(d.label) }}></span>
                                <span className="dist-legend-label">{d.label}</span>
                            </button>
                        ))}
                    </div>
                </DashboardWidget>

                <DashboardWidget title="Resident Demographic" icon={<span className="material-symbols-rounded">groups</span>} collapsible={true}>
                    {/* Filter Dropdown */}
                    <div className="dist-filter-bar">
                        <select
                            className="dist-filter-select"
                            value={demoFilter}
                            onChange={(e) => setDemoFilter(e.target.value)}
                        >
                            <option value="all">All Roles</option>
                            <option value="top3">Top 3</option>
                            <option value="top5">Top 5</option>
                        </select>
                    </div>
                    {distributions?.demographic && (
                        <div className="h-48 mb-6 flex justify-center">
                            <Doughnut 
                                data={{
                                    labels: distributions.demographic
                                        .filter(d => !hiddenDemographics.includes(d.label + 's'))
                                        .sort((a, b) => b.percentage - a.percentage)
                                        .slice(0, demoFilter === 'top3' ? 3 : demoFilter === 'top5' ? 5 : undefined)
                                        .map(d => d.label + 's'),
                                    datasets: [{
                                        data: distributions.demographic
                                            .filter(d => !hiddenDemographics.includes(d.label + 's'))
                                            .sort((a, b) => b.percentage - a.percentage)
                                            .slice(0, demoFilter === 'top3' ? 3 : demoFilter === 'top5' ? 5 : undefined)
                                            .map(d => d.count),
                                        backgroundColor: distributions.demographic
                                            .filter(d => !hiddenDemographics.includes(d.label + 's'))
                                            .sort((a, b) => b.percentage - a.percentage)
                                            .slice(0, demoFilter === 'top3' ? 3 : demoFilter === 'top5' ? 5 : undefined)
                                            .map(d => getDemoColor(d.label)),
                                        borderWidth: 0,
                                        cutout: '70%'
                                    }]
                                }} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: {
                                            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255,255,255,0.97)',
                                            titleColor: isDark ? '#fff' : '#111',
                                            bodyColor: isDark ? '#cdd6f4' : '#444',
                                            padding: 12,
                                            cornerRadius: 8,
                                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                            borderWidth: 1
                                        }
                                    }
                                }}
                            />
                        </div>
                    )}
                    {distributions?.demographic
                        ?.filter(d => !hiddenDemographics.includes(d.label + 's'))
                        .sort((a, b) => b.percentage - a.percentage)
                        .slice(0, demoFilter === 'top3' ? 3 : demoFilter === 'top5' ? 5 : undefined)
                        .map((d, i) => {
                            const color = getDemoColor(d.label);
                            return (
                                <div key={i} className="bar-row">
                                    <div className="bar-top">
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }}></span>
                                            {d.label}s
                                        </span>
                                        <span style={{ color: color, fontWeight: 700 }}>{d.percentage}%</span>
                                    </div>
                                    <div className="bar-wrap"><div className="bar-fill" style={{ width: `${d.percentage}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }}></div></div>
                                    <span className="bar-count">{d.count} residents</span>
                                </div>
                            );
                        })
                    }
                    {/* Clickable Legend */}
                    <div className="dist-legend">
                        {distributions?.demographic?.map((d, i) => {
                            const lbl = d.label + 's';
                            return (
                                <button
                                    key={i}
                                    className={`dist-legend-item ${hiddenDemographics.includes(lbl) ? 'dist-legend-item--hidden' : ''}`}
                                    onClick={() => toggleDemographic(lbl)}
                                    title={hiddenDemographics.includes(lbl) ? `Show ${lbl}` : `Hide ${lbl}`}
                                >
                                    <span className="dist-legend-dot" style={{ background: hiddenDemographics.includes(lbl) ? 'rgba(255,255,255,0.15)' : getDemoColor(d.label) }}></span>
                                    <span className="dist-legend-label">{lbl}</span>
                                </button>
                            );
                        })}
                    </div>
                </DashboardWidget>
            </div>

            {/* Top 10 Active Vehicles */}
            <div className="mb-8">
                <DashboardWidget title="Top 10 Active Vehicles" icon={<span className="material-symbols-rounded">local_taxi</span>} collapsible={true}>
                    <div className="flex justify-end mb-2 pr-4 pt-2">
                        <select 
                            className="dist-filter-select"
                            value={topVehiclesTimeframe}
                            onChange={(e) => setTopVehiclesTimeframe(e.target.value)}
                        >
                            <option value="1d">Today</option>
                            <option value="7d">This Week</option>
                            <option value="30d">This Month</option>
                            <option value="365d">This Year</option>
                        </select>
                    </div>
                    <div className="premium-table-container mt-0" style={{ boxShadow: 'none', border: 'none', background: 'transparent' }}>
                        <table className="premium-table" style={{ margin: 0 }}>
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: '0.5rem', background: 'transparent' }}>Plate Number</th>
                                    <th style={{ background: 'transparent' }}>Owner</th>
                                    <th style={{ background: 'transparent' }}>Role</th>
                                    <th style={{ background: 'transparent' }}>Vehicle Type</th>
                                    <th style={{ textAlign: 'right', paddingRight: '0.5rem', background: 'transparent' }}>Total Activity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topVehicles.map((v, i) => (
                                    <tr key={i}>
                                        <td style={{ paddingLeft: '0.5rem' }}>
                                            <div className="flex items-center gap-3">
                                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>
                                                    #{i + 1}
                                                </div>
                                                <b style={{ fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>{anonymizePlate(v.plate)}</b>
                                            </div>
                                        </td>
                                        <td>{anonymizeName(v.owner_name)}</td>
                                        <td>
                                            <span className={`post-badge ${v.owner_role.toLowerCase() === 'faculty' ? 'post-roving' : 'post-main'}`} style={{ fontSize: '10px' }}>
                                                {v.owner_role}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--t-3)' }}>{v.vehicle_type}</td>
                                        <td style={{ textAlign: 'right', paddingRight: '0.5rem' }}>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(168, 85, 247, 0.1)', padding: '4px 10px', borderRadius: '12px' }}>
                                                <span style={{ color: '#a855f7', fontWeight: 800 }}>{v.activity_count}</span>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--t-3)' }}>entries/exits</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {topVehicles.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="no-data-cell" style={{ padding: '3rem 1rem !important' }}>
                                            <div className="no-data-content">
                                                <p style={{ fontSize: '0.9rem', color: 'var(--t-3)' }}>No vehicle activity recorded in this period</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </DashboardWidget>
            </div>

            {/* Traffic Log Table */}
            <div className="analytics-table-section">
                <div className="analytics-table-header">
                    <div className="analytics-table-title-row">
                        <div className="analytics-table-title">Traffic Log</div>
                    </div>
                    <div className="filters-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>calendar_month</span>
                                Traffic Timeframe
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '0.3rem 0.75rem', borderRadius: '12px', border: '1px solid var(--border-color)', height: '44px', width: 'fit-content' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.55rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '1px' }}>Start</span>
                                    <input 
                                        type="date" 
                                        style={{ backgroundColor: 'transparent', border: 'none', color: '#e5e7eb', outline: 'none', fontSize: '0.75rem', fontFamily: 'inherit', padding: 0 }}
                                        value={startDate}
                                        onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                                    />
                                </div>
                                <span style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 700, margin: '0 2px' }}>-</span>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.55rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '1px' }}>End</span>
                                    <input 
                                        type="date" 
                                        style={{ backgroundColor: 'transparent', border: 'none', color: '#e5e7eb', outline: 'none', fontSize: '0.75rem', fontFamily: 'inherit', padding: 0 }}
                                        value={endDate}
                                        onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>gate</span>
                                Entry Point
                            </label>
                            <select 
                                className="form-select fi fi-select"
                                style={{ height: '44px', maxWidth: '170px' }}
                                value={gateFilter}
                                onChange={(e) => { setGateFilter(e.target.value); setCurrentPage(1); }}
                            >
                                <option value="">All Gates</option>
                                <option>Main Gate</option>
                                <option>Back Gate</option>
                            </select>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>commute</span>
                                Vehicle Type
                            </label>
                            <select 
                                className="form-select fi fi-select"
                                style={{ height: '44px', maxWidth: '170px' }}
                                value={typeFilter}
                                onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                            >
                                <option value="">All Types</option>
                                <option>Car</option>
                                <option>Motorcycle</option>
                                <option>Utility</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '200px', gap: '0.25rem' }}>
                            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>search</span>
                                Search
                            </label>
                            <input 
                                className="form-input fi fi-search" 
                                style={{ height: '44px', boxSizing: 'border-box' }}
                                type="text" 
                                placeholder="Search plate, owner..." 
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            />
                        </div>

                        <button 
                            className="premium-page-btn" 
                            style={{ padding: '0 12px', height: '44px' }}
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
                            {allTrafficLogs.map((log, i) => (
                                <tr key={i}>
                                    <td><b style={{ fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>{anonymizePlate(log.plate)}</b></td>
                                    <td>{anonymizeName(log.owner_name)}</td>
                                    <td>
                                        <span className={`post-badge ${log.owner_role === 'faculty' ? 'post-roving' : 'post-main'}`} style={{ fontSize: '10px' }}>
                                            {log.owner_role}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--t-3)' }}>{log.vehicle_type}</td>
                                    <td>
                                        <span className={`post-badge ${log.gate_name?.includes('Main') ? 'post-main' : 'post-back'}`} style={{ fontSize: '10px' }}>
                                            {log.gate_name}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`duty-badge ${log.direction === 'entry' ? 'duty-on' : 'duty-off'}`} style={{ fontSize: '10px' }}>
                                            {log.direction === 'entry' ? '↓' : '↑'} {log.direction}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--t-3)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{log.time}</td>
                                    <td style={{ color: 'var(--t-3)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{log.date}</td>
                                </tr>
                            ))}
                            {allTrafficLogs.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="no-data-cell">
                                        <div className="no-data-content">
                                            <span className="material-symbols-rounded">{loading ? 'sync' : 'search_off'}</span>
                                            <p>{loading ? 'Fetching traffic logs...' : 'No traffic logs found matching your filters'}</p>
                                            {!loading && (
                                                <button className="clear-filters-link" onClick={handleClearFilters}>
                                                    Reset Intelligence
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination Controls */}
                <div className="premium-pagination">
                    <div className="pagination-info">
                        {pagination.total > 0 ? (
                            <>Showing <span>{startIndex + 1}-{Math.min(startIndex + itemsPerPage, pagination.total)}</span> of <span>{pagination.total}</span> entries</>
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
                                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
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
                                disabled={currentPage === 1 || loading}
                            >
                                <span className="material-symbols-rounded">chevron_left</span>
                            </button>
                            
                            <div className="page-indicators">
                                {(() => {
                                    const maxVisible = 5;
                                    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                                    let end = Math.min(totalPages, start + maxVisible - 1);
                                    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
                                    const pages = [];
                                    for (let i = start; i <= end; i++) pages.push(i);
                                    return pages.map(pageNum => (
                                        <button
                                            key={pageNum}
                                            className={`page-indicator ${pageNum === currentPage ? 'active' : ''}`}
                                            onClick={() => setCurrentPage(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    ));
                                })()}
                            </div>

                            <button 
                                className="premium-page-btn icon-only" 
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages || totalPages === 0 || loading}
                            >
                                <span className="material-symbols-rounded">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Generator Modal */}
            <ReportGeneratorModal 
                isOpen={isReportModalOpen} 
                onClose={() => setIsReportModalOpen(false)} 
                data={allTrafficLogs} 
                columns={[
                    { key: 'date', label: 'Date' },
                    { key: 'time', label: 'Time' },
                    { key: 'plate', label: 'License Plate' },
                    { key: 'owner_name', label: 'Owner Name' },
                    { key: 'owner_role', label: 'Owner Role' },
                    { key: 'vehicle_type', label: 'Vehicle Type' },
                    { key: 'gate_name', label: 'Gate' },
                    { key: 'direction', label: 'Direction' },
                    { key: 'type', label: 'Event Type' },
                    { key: 'status', label: 'Authorization' }
                ]}
                reportTitle="Campus Traffic Analytics Report"
            />
        </div>
    );
}
