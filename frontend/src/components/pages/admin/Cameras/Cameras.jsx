import { useState, useMemo } from 'react';
import './Cameras.css';

const cameraData = [
    { 
        id: 'cam1', 
        name: 'Main Gate - Front Left', 
        gate: 'Main Gate',
        position: 'Front Left',
        status: 'online', 
        isLive: true,
        lastPlate: 'XYZ 5678',
        lastPlateTime: '10:23 AM'
    },
    { 
        id: 'cam2', 
        name: 'Main Gate - Front Right', 
        gate: 'Main Gate',
        position: 'Front Right',
        status: 'online', 
        isLive: true,
        lastPlate: 'ABC 1234',
        lastPlateTime: '09:45 AM'
    },
    { 
        id: 'cam3', 
        name: 'Main Gate - Back Left', 
        gate: 'Main Gate',
        position: 'Back Left',
        status: 'online', 
        isLive: true,
        lastPlate: 'PQR 9012',
        lastPlateTime: '10:15 AM'
    },
    { 
        id: 'cam4', 
        name: 'Main Gate - Back Right', 
        gate: 'Main Gate',
        position: 'Back Right',
        status: 'online', 
        isLive: true,
        lastPlate: 'JKL 3456',
        lastPlateTime: '10:05 AM'
    },
    { 
        id: 'cam5', 
        name: '2nd Gate - Rear Left', 
        gate: 'Back Gate',
        position: 'Rear Left',
        status: 'online', 
        isLive: true,
        lastPlate: 'MNO 7890',
        lastPlateTime: '08:30 AM'
    },
    { 
        id: 'cam6', 
        name: '2nd Gate - Rear Right', 
        gate: 'Back Gate',
        position: 'Rear Right',
        status: 'online', 
        isLive: true,
        lastPlate: 'STU 2345',
        lastPlateTime: '09:12 AM'
    },
    { 
        id: 'cam7', 
        name: '2nd Gate - Front Left', 
        gate: 'Back Gate',
        position: 'Front Left',
        status: 'online', 
        isLive: true,
        lastPlate: 'VWX 6789',
        lastPlateTime: '07:55 AM'
    },
    { 
        id: 'cam8', 
        name: '2nd Gate - Front Right', 
        gate: 'Back Gate',
        position: 'Front Right',
        status: 'offline', 
        isLive: false,
        lastPlate: 'DEF 0123',
        lastPlateTime: '09:38 AM',
        offlineSince: '09:42 AM'
    }
];

const StatCard = ({ label, value, badgeText, badgeVariant, rows }) => (
    <div className="camera-stat-card">
        <div className={`stat-card-badge stat-card-badge--${badgeVariant}`}>{badgeText}</div>
        <div className="stat-card-label">{label}</div>
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-rows">
            {rows.map((row, idx) => (
                <div key={idx} className="stat-row">
                    <span className="stat-row__label">{row.label}</span>
                    <span className={`stat-row__value ${row.isOffline ? 'offline' : ''}`}>{row.value}</span>
                </div>
            ))}
        </div>
    </div>
);

export default function Cameras() {
    const [selectedCamera, setSelectedCamera] = useState(null);
    const [isMatrixView, setIsMatrixView] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [gateFilter, setGateFilter] = useState('');
    const [positionFilter, setPositionFilter] = useState('');
    const [isAddNodeModalOpen, setIsAddNodeModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(null);

    const stats = useMemo(() => {
        const total = cameraData.length;
        const mainGateNodes = cameraData.filter(c => c.gate === 'Main Gate');
        const backGateNodes = cameraData.filter(c => c.gate === 'Back Gate');
        
        const onlineCount = cameraData.filter(c => c.status === 'online').length;
        const mainOnline = mainGateNodes.filter(c => c.status === 'online').length;
        const backOnline = backGateNodes.filter(c => c.status === 'online').length;

        const offlineCount = cameraData.filter(c => c.status === 'offline').length;
        const lastFailure = cameraData.find(c => c.status === 'offline');

        const streamingCount = cameraData.filter(c => c.isLive).length;
        const mainStreaming = mainGateNodes.filter(c => c.isLive).length;
        const backStreaming = backGateNodes.filter(c => c.isLive).length;

        return {
            total: {
                count: total,
                main: mainGateNodes.length,
                back: backGateNodes.length
            },
            online: {
                count: onlineCount,
                main: `${mainOnline} / ${mainGateNodes.length}`,
                back: `${backOnline} / ${backGateNodes.length}`
            },
            offline: {
                count: offlineCount,
                last: lastFailure ? `${lastFailure.gate} · ${lastFailure.position} · ${lastFailure.offlineSince}` : 'None'
            },
            streaming: {
                count: streamingCount,
                main: `${mainStreaming} / ${mainGateNodes.length}`,
                back: `${backStreaming} / ${backGateNodes.length}`
            }
        };
    }, []);

    const filteredCameras = useMemo(() => {
        return cameraData.filter(camera => {
            const matchesStatus = !statusFilter || 
                (statusFilter === 'online' && camera.status === 'online') ||
                (statusFilter === 'offline' && camera.status === 'offline') ||
                (statusFilter === 'streaming' && camera.isLive);
            
            const matchesGate = !gateFilter || camera.gate === gateFilter;
            const matchesPosition = !positionFilter || camera.position === positionFilter;

            return matchesStatus && matchesGate && matchesPosition;
        });
    }, [statusFilter, gateFilter, positionFilter]);

    return (
        <div className="premium-dashboard-container">
            {/* Page Header */}
            <div className="premium-page-header">
                <div>
                    <h1>Surveillance <span>Nodes</span> 📹</h1>
                    <p>Monitor live campus camera feeds and manage network connectivity.</p>
                </div>
                <div className="premium-header-meta">
                    <button className={`premium-page-btn ${isMatrixView ? 'active' : ''}`} onClick={() => setIsMatrixView(!isMatrixView)}>
                        <span className="material-symbols-rounded">{isMatrixView ? 'grid_view' : 'fullscreen'}</span>
                        {isMatrixView ? 'Standard View' : 'Matrix Mode'}
                    </button>
                    <button className="premium-page-btn active" onClick={() => setIsAddNodeModalOpen(true)}>
                        <span className="material-symbols-rounded">add_circle</span>
                        Add Node
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            {!isMatrixView && (
                <section className="camera-stats-grid">
                    <StatCard 
                        label="Total nodes" 
                        value={stats.total.count} 
                        badgeText={`${stats.total.count} / ${stats.total.count}`} 
                        badgeVariant="info"
                        rows={[
                            { label: 'Main gate', value: stats.total.main },
                            { label: 'Back gate', value: stats.total.back }
                        ]}
                    />
                    <StatCard 
                        label="Online" 
                        value={stats.online.count} 
                        badgeText="all synced" 
                        badgeVariant="success"
                        rows={[
                            { label: 'Main gate', value: stats.online.main },
                            { label: 'Back gate', value: stats.online.back }
                        ]}
                    />
                    <StatCard 
                        label="Offline" 
                        value={stats.offline.count} 
                        badgeText={stats.offline.count > 0 ? `${stats.offline.count} down` : 'stable'} 
                        badgeVariant="danger"
                        rows={[
                            { label: 'Last failure', value: stats.offline.last, isOffline: stats.offline.count > 0 }
                        ]}
                    />
                    <StatCard 
                        label="Streaming now" 
                        value={stats.streaming.count} 
                        badgeText="live" 
                        badgeVariant="info"
                        rows={[
                            { label: 'Main gate', value: stats.streaming.main },
                            { label: 'Back gate', value: stats.streaming.back }
                        ]}
                    />
                </section>
            )}

            {/* Filter Row */}
            {!isMatrixView && (
                <div className="camera-filters-bar mb-6">
                    <div className="filter-group">
                        <select 
                            className="form-select premium-editable" 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">Status: All</option>
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                            <option value="streaming">Streaming</option>
                        </select>
                        <select 
                            className="form-select premium-editable" 
                            value={gateFilter}
                            onChange={(e) => setGateFilter(e.target.value)}
                        >
                            <option value="">Gate: All</option>
                            <option value="Main Gate">Main Gate</option>
                            <option value="Back Gate">Back Gate</option>
                        </select>
                        <select 
                            className="form-select premium-editable" 
                            value={positionFilter}
                            onChange={(e) => setPositionFilter(e.target.value)}
                        >
                            <option value="">Position: All</option>
                            <option value="Front Left">Front Left</option>
                            <option value="Front Right">Front Right</option>
                            <option value="Back Left">Back Left</option>
                            <option value="Back Right">Back Right</option>
                            <option value="Rear Left">Rear Left</option>
                            <option value="Rear Right">Rear Right</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Camera Grid */}
            <div className={`dashboard-grid ${isMatrixView ? 'dashboard-grid--4col' : 'dashboard-grid--4col'}`} style={{ gap: isMatrixView ? '10px' : '1.5rem' }}>
                {filteredCameras.map((camera, index) => (
                    <div key={index} className={`premium-glass-card camera-card-premium ${isMatrixView ? 'admin-compact-card' : ''}`} style={{ padding: isMatrixView ? '0.75rem' : '1.25rem' }}>
                        <div className="camera-feed-container mb-4" style={{ position: 'relative', borderRadius: '12px', background: '#000', height: isMatrixView ? '120px' : '160px', overflow: 'hidden' }}>
                            {camera.status === 'offline' && (
                                <div className="offline-overlay">
                                    <div className="offline-text">Offline</div>
                                </div>
                            )}
                            
                            {camera.status !== 'offline' && <div className="scan-line"></div>}
                            
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, #1a1c22 0%, #000 100%)' }}>
                                <span className="material-symbols-rounded" style={{ fontSize: '2.5rem', color: camera.status === 'offline' ? '#ef4444' : 'rgba(255,255,255,0.05)' }}>
                                    {camera.status === 'offline' ? 'videocam_off' : 'play_arrow'}
                                </span>
                            </div>

                            {/* HUD Data Overlay */}
                            <div style={{ position: 'absolute', inset: 0, padding: '10px', pointerEvents: 'none' }}>
                                <div className="flex justify-between items-start">
                                    <span style={{ fontSize: '10px', color: camera.status === 'offline' ? '#ff4d4d' : '#00e5b4', fontFamily: 'monospace', fontWeight: 700 }}>
                                        {camera.status === 'offline' ? 'BUFF: —' : `BUFF: 104ms`}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <div className={`status-dot ${camera.status === 'online' ? 'status-dot--online' : 'status-dot--offline'}`}></div>
                                        <span style={{ fontSize: '10px', color: '#fff', fontWeight: 700 }}>{camera.status === 'offline' ? 'OFFLINE' : 'LIVE'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="camera-info mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: isMatrixView ? '0.85rem' : '1rem' }}>{camera.name}</div>
                                <span className="gate-badge">{camera.gate}</span>
                            </div>
                            
                            <div className="plate-info-row">
                                <span className="label">Status</span>
                                <span className="value" style={{ color: camera.status === 'offline' ? '#ef4444' : '#10b981' }}>
                                    {camera.status === 'offline' ? `Offline since ${camera.offlineSince}` : 'Online'}
                                </span>
                            </div>
                            <div className="plate-info-row">
                                <span className="label">Last plate</span>
                                <span className="plate-value">{camera.lastPlate} · {camera.lastPlateTime}</span>
                            </div>
                            <div className="plate-info-row" style={{ borderBottom: 'none' }}>
                                <span className="label">CAM ID</span>
                                <span className="value" style={{ color: 'var(--text-muted)' }}>{camera.id.toUpperCase()} · 2024-12-16</span>
                            </div>
                        </div>
                        
                        {!isMatrixView && (
                            <div className="flex gap-2 mt-auto">
                                <button className="premium-page-btn" style={{ flex: 1, padding: '8px' }} onClick={() => setIsSettingsModalOpen(camera)}>
                                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>settings</span>
                                </button>
                                <button 
                                    className={`premium-page-btn active`} 
                                    style={{ flex: 3, padding: '8px' }} 
                                    disabled={camera.status === 'offline'}
                                    onClick={() => setSelectedCamera(camera)}
                                >
                                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>monitor_heart</span>
                                    Monitor Feed
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Monitor Modal */}
            {selectedCamera && (
                <div className="modal-backdrop active" onClick={() => setSelectedCamera(null)}>
                    <div className="modal premium-glass-card" onClick={e => e.stopPropagation()} style={{ border: 'none', maxWidth: '900px', width: '90%' }}>
                        <header className="modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="status-dot status-dot--online"></div>
                                <h2 className="modal-title">Live Node Stream: {selectedCamera.name}</h2>
                            </div>
                            <button className="modal-close" onClick={() => setSelectedCamera(null)}>
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </header>
                        
                        <div className="modal-body" style={{ padding: '1.5rem 0' }}>
                            <div style={{ position: 'relative', background: '#000', borderRadius: '16px', aspectVideo: '16/9', overflow: 'hidden', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {/* AI Scanning Overlay Elements */}
                                <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(0, 229, 180, 0.2)', pointerEvents: 'none' }}>
                                    {/* Corners */}
                                    <div style={{ position: 'absolute', top: 20, left: 20, width: 40, height: 40, borderTop: '4px solid #00e5b4', borderLeft: '4px solid #00e5b4' }}></div>
                                    <div style={{ position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderTop: '4px solid #00e5b4', borderRight: '4px solid #00e5b4' }}></div>
                                    <div style={{ position: 'absolute', bottom: 20, left: 20, width: 40, height: 40, borderBottom: '4px solid #00e5b4', borderLeft: '4px solid #00e5b4' }}></div>
                                    <div style={{ position: 'absolute', bottom: 20, right: 20, width: 40, height: 40, borderBottom: '4px solid #00e5b4', borderRight: '4px solid #00e5b4' }}></div>
                                    
                                    {/* Detection Box Simulation */}
                                    <div className="detection-box" style={{ 
                                        position: 'absolute', 
                                        top: '40%', 
                                        left: '35%', 
                                        width: '120px', 
                                        height: '60px', 
                                        border: '2px solid #a855f7', 
                                        background: 'rgba(168, 85, 247, 0.1)',
                                        animation: 'pulse 2s infinite'
                                    }}>
                                        <div style={{ position: 'absolute', top: '-25px', left: 0, background: '#a855f7', color: '#fff', fontSize: '10px', padding: '2px 6px', fontWeight: 800 }}>PLATE DETECTED: {selectedCamera.lastPlate}</div>
                                    </div>
                                </div>
                                
                                <span className="material-symbols-rounded" style={{ fontSize: '5rem', color: 'rgba(255,255,255,0.05)' }}>videocam</span>
                                
                                <div className="scan-line"></div>
                            </div>
                            
                            <div className="flex justify-between items-center mt-6">
                                <div className="flex gap-4">
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>FPS</div>
                                        <div style={{ color: 'var(--color-primary)', fontWeight: 800 }}>30.4</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>BITRATE</div>
                                        <div style={{ color: 'var(--color-primary)', fontWeight: 800 }}>4.2 MBPS</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>ISO</div>
                                        <div style={{ color: 'var(--color-primary)', fontWeight: 800 }}>800</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="premium-page-btn"><span className="material-symbols-rounded">zoom_in</span></button>
                                    <button className="premium-page-btn"><span className="material-symbols-rounded">zoom_out</span></button>
                                    <button className="premium-page-btn active"><span className="material-symbols-rounded">screenshot_region</span> CAPTURE</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Node Modal */}
            {isAddNodeModalOpen && (
                <div className="modal-backdrop active" onClick={() => setIsAddNodeModalOpen(false)}>
                    <div className="modal premium-glass-card" onClick={e => e.stopPropagation()} style={{ border: 'none', maxWidth: '500px', width: '90%' }}>
                        <header className="modal-header">
                            <h2 className="modal-title">Provision New Node</h2>
                            <button className="modal-close" onClick={() => setIsAddNodeModalOpen(false)}>
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </header>
                        <div className="modal-body">
                            <div className="form-group mb-4">
                                <label className="form-label">Node Name</label>
                                <input type="text" className="form-control premium-editable" placeholder="e.g. Main Gate - North Entrance" />
                            </div>
                            <div className="form-group mb-4">
                                <label className="form-label">Gate Location</label>
                                <select className="form-select premium-editable">
                                    <option>Main Gate</option>
                                    <option>Back Gate</option>
                                </select>
                            </div>
                            <div className="form-group mb-6">
                                <label className="form-label">RTSP/Stream URL</label>
                                <input type="text" className="form-control premium-editable" placeholder="rtsp://192.168.1.100:554/live" />
                            </div>
                            <div className="flex gap-3">
                                <button className="premium-page-btn" style={{ flex: 1 }} onClick={() => setIsAddNodeModalOpen(false)}>Cancel</button>
                                <button className="premium-page-btn active" style={{ flex: 2 }} onClick={() => setIsAddNodeModalOpen(false)}>Initialize Node</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {isSettingsModalOpen && (
                <div className="modal-backdrop active" onClick={() => setIsSettingsModalOpen(null)}>
                    <div className="modal premium-glass-card" onClick={e => e.stopPropagation()} style={{ border: 'none', maxWidth: '500px', width: '90%' }}>
                        <header className="modal-header">
                            <h2 className="modal-title">Node Configuration: {isSettingsModalOpen.id}</h2>
                            <button className="modal-close" onClick={() => setIsSettingsModalOpen(null)}>
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </header>
                        <div className="modal-body">
                            <div className="form-group mb-4">
                                <label className="form-label">Detection Threshold</label>
                                <input type="range" className="form-range" min="0" max="100" defaultValue="85" />
                                <div className="flex justify-between mt-1"><span style={{fontSize: '10px'}}>Performance</span><span style={{fontSize: '10px'}}>Accuracy (85%)</span></div>
                            </div>
                            <div className="form-group mb-4">
                                <label className="form-label">Recording Mode</label>
                                <select className="form-select premium-editable" defaultValue="motion">
                                    <option value="always">Always Record</option>
                                    <option value="motion">Motion Detection Only</option>
                                    <option value="plate">Plate Detection Only</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-3 mb-6">
                                <input type="checkbox" id="ai-enhance" defaultChecked />
                                <label htmlFor="ai-enhance" className="form-label mb-0">AI Night Vision Enhancement</label>
                            </div>
                            <div className="flex gap-3">
                                <button className="premium-page-btn danger-btn" style={{ flex: 1 }} onClick={() => setIsSettingsModalOpen(null)}>Decommission</button>
                                <button className="premium-page-btn active" style={{ flex: 2 }} onClick={() => setIsSettingsModalOpen(null)}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
