import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import './SecurityDashboard.css';

// ── FIXED DATA ──
const CAMERA_DATA = [
  { id: 1, name: 'Camera 1', gate: 'Gate A – Main Entrance', ip: '192.168.1.101', live: true },
  { id: 2, name: 'Camera 2', gate: 'Gate B – Side Entrance', ip: '192.168.1.102', live: true },
  { id: 3, name: 'Camera 3', gate: 'Gate C – Faculty Parking', ip: '192.168.1.103', live: true },
  { id: 4, name: 'Camera 4', gate: 'Gate D – Service Entry', ip: '192.168.1.104', live: false },
];

const PLATES_POOL = ['ABC 1234', 'XYZ 5678', 'LMN 9012', 'PQR 3456', 'CSU 0001', 'DEF 7890', 'GHI 2345', 'JKL 6789', 'MNO 1122', 'STU 3344'];
const OWNERS_POOL = ['J*** D*** C***', 'M*** S***', 'P*** R***', 'A*** G***', 'J*** R***', 'Unknown Vehicle', 'C*** M***', 'L*** C***', 'M*** T***', 'UNREGISTERED'];
const VTYPES_POOL = ['Car', 'Van', 'Motorcycle', 'Truck'];
const ALERT_DEFS = [
  { icon: '✅', title: 'Authorized Access Granted', cls: 'ac', toastType: 'su', needsEdit: false },
  { icon: '⚠️', title: 'Speed Anomaly Detected', cls: 'an', toastType: 'wa', needsEdit: true },
  { icon: '🚨', title: 'Unregistered Vehicle', cls: 'br', toastType: 'da', needsEdit: true },
  { icon: '🔍', title: 'Unknown Plate Detected', cls: 'un', toastType: 'in', needsEdit: true },
  { icon: '⚠️', title: 'Tailgating Detected', cls: 'an', toastType: 'wa', needsEdit: false },
  { icon: '🚨', title: 'Blacklisted Plate Alert', cls: 'br', toastType: 'da', needsEdit: true },
];

const MAX_ALERTS = 5;

const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const getNow = () => new Date().toTimeString().slice(0, 8);

export default function SecurityDashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // ── STATE ──
  const [clock, setClock] = useState('--:--:--');
  const [dateStr, setDateStr] = useState('---');
  const [shiftSec, setShiftSec] = useState(7 * 3600 + 15 * 60);
  const [selectedCamId, setSelectedCamId] = useState(1);
  const [alerts, setAlerts] = useState([]); // Array of alert objects
  const [selectedUid, setSelectedUid] = useState(null);
  const [searchPlate, setSearchPlate] = useState('');
  const [dayTotals, setDayTotals] = useState({ an: 0, br: 0, un: 0, ac: 0 });
  const [totalCount, setTotalCount] = useState(524);
  const [onCampus, setOnCampus] = useState({ ca: 147, va: 62, mo: 31, tr: 9 });
  const [vehicleNums, setVehicleNums] = useState({ ca: 247, va: 87, mo: 156, tr: 34 });
  const [othersCount, setOthersCount] = useState(0);
  const [tickerItems, setTickerItems] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [flashedPlate, setFlashedPlate] = useState(null);
  
  // ── RESIZING STATE ──
  const [sidebarWidth, setSidebarWidth] = useState(185);
  const [rightbarWidth, setRightbarWidth] = useState(250);
  const [bottomHeight, setBottomHeight] = useState(240);
  const [listWidth, setListWidth] = useState(280);

  const miniChartRef = useRef(null);
  const chartDataRef = useRef(Array(10).fill(0).map(() => rnd(1, 20)));

  // ── HELPERS ──
  const selectedCam = useMemo(() => CAMERA_DATA.find(c => c.id === selectedCamId), [selectedCamId]);

  // ── CLOCK & SHIFT ──
  useEffect(() => {
    const timer = setInterval(() => {
      const n = new Date();
      setClock(n.toTimeString().slice(0, 8));
      setDateStr(n.toDateString().toUpperCase());
      setShiftSec(s => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const shiftFormatted = useMemo(() => {
    const h = String(Math.floor(shiftSec / 3600)).padStart(2, '0');
    const m = String(Math.floor((shiftSec % 3600) / 60)).padStart(2, '0');
    const s = String(shiftSec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }, [shiftSec]);

  // ── CHART DRAWING ──
  useEffect(() => {
    const draw = () => {
      const c = miniChartRef.current;
      if (!c) return;
      const ctx = c.getContext('2d');
      const W = c.clientWidth;
      const H = c.clientHeight;
      c.width = W; c.height = H;
      ctx.clearRect(0, 0, W, H);
      const data = chartDataRef.current;
      const max = Math.max(...data, 1);
      const step = W / (data.length - 1);
      ctx.beginPath(); ctx.strokeStyle = 'rgba(0,229,255,.7)'; ctx.lineWidth = 1.5; ctx.lineJoin = 'round';
      data.forEach((v, i) => { const x = i * step, y = H - 3 - (v / max) * (H - 9); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
      ctx.stroke();
      ctx.lineTo((data.length - 1) * step, H); ctx.lineTo(0, H); ctx.closePath();
      ctx.fillStyle = 'rgba(0,229,255,.05)'; ctx.fill();
      data.forEach((v, i) => { const x = i * step, y = H - 3 - (v / max) * (H - 9); ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fillStyle = '#00e5ff'; ctx.fill(); });
    };
    draw();
    const int = setInterval(() => {
      chartDataRef.current.shift();
      chartDataRef.current.push(rnd(1, 20));
      draw();
    }, 3000);
    return () => clearInterval(int);
  }, []);

  // ── ON-CAMPUS FLUCTUATIONS ──
  useEffect(() => {
    const int = setInterval(() => {
      const keys = ['ca', 'va', 'mo', 'tr'];
      const k = keys[rnd(0, 3)];
      setOnCampus(prev => ({ ...prev, [k]: Math.max(0, prev[k] - rnd(0, 1)) }));
    }, 8000);
    return () => clearInterval(int);
  }, []);

  // ── ALERT ACTIONS ──
  const showToast = (type, msg, plate) => {
    const id = Date.now();
    setToasts(prev => [{ id, type, msg, plate, time: getNow() }, ...prev].slice(0, 3));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const simulateDetection = () => {
    const idx = rnd(0, PLATES_POOL.length - 1);
    const plate = PLATES_POOL[idx];
    const owner = OWNERS_POOL[idx];
    const a = ALERT_DEFS[rnd(0, ALERT_DEFS.length - 1)];
    const vtype = VTYPES_POOL[rnd(0, 3)];
    const gate = 'Gate ' + ['A', 'B', 'C'][rnd(0, 2)];
    const time = getNow();
    const uid = 'u' + Date.now() + rnd(0, 999);

    // Flash plate
    setFlashedPlate(plate);
    setTimeout(() => setFlashedPlate(null), 2800);

    // Update Alert List (Max 5)
    setAlerts(prev => {
      const newAlert = { uid, a, plate, owner, vtype, gate, time, currentPlate: plate, resolved: false };
      const newList = [newAlert, ...prev];
      if (newList.length > MAX_ALERTS) newList.pop();
      return newList;
    });

    // Update Day Totals
    setDayTotals(prev => ({ ...prev, [a.cls]: prev[a.cls] + 1 }));

    // Toast
    showToast(a.toastType, a.title, plate);

    // Ticker
    if (['an', 'br', 'un'].includes(a.cls)) {
      setTickerItems(prev => {
        const filtered = prev.filter(t => t.plate !== plate);
        const next = [{ cls: a.cls, icon: a.icon, text: `${plate} – ${a.title}`, plate }, ...filtered];
        return next.slice(0, 5);
      });
    }

    // Vehicle Counts
    const typeKey = vtype === 'Car' ? 'ca' : vtype === 'Van' ? 'va' : vtype === 'Motorcycle' ? 'mo' : 'tr';
    setVehicleNums(prev => ({ ...prev, [typeKey]: prev[typeKey] + 1 }));
    setTotalCount(c => c + 1);

    if (a.cls === 'ac' || Math.random() < 0.6) {
      setOnCampus(prev => ({ ...prev, [typeKey]: prev[typeKey] + 1 }));
    }

    if (Math.random() < 0.15) setOthersCount(c => c + 1);
  };

  const removeAlert = (uid) => {
    setAlerts(prev => prev.filter(al => al.uid !== uid));
    if (selectedUid === uid) setSelectedUid(null);
  };

  const handleResolve = (uid) => {
    setAlerts(prev => prev.map(al => al.uid === uid ? { ...al, resolved: true } : al));
    setTimeout(() => removeAlert(uid), 1000);
  };

  const handleEscalate = (uid, plate) => {
    showToast('da', 'Alert escalated to supervisor!', plate);
    removeAlert(uid);
  };

  const handleDismiss = (uid) => {
    removeAlert(uid);
  };

  const handleUpdatePlate = (uid, newPlate) => {
    setAlerts(prev => prev.map(al => al.uid === uid ? { ...al, currentPlate: newPlate } : al));
  };

  const handleSavePlate = (uid, newPlate) => {
    handleUpdatePlate(uid, newPlate);
    showToast('su', `Plate corrected: ${newPlate}`, '');
  };

  // ── RESIZER LOGIC ──
  const isDragging = useRef(null); // 'sidebar', 'rightbar', 'bottom', 'list'

  const startResizing = (type) => (e) => {
    isDragging.current = type;
    const startX = e.clientX;
    const startY = e.clientY;
    const startSW = sidebarWidth;
    const startRW = rightbarWidth;
    const startBH = bottomHeight;
    const startLW = listWidth;

    document.body.style.cursor = (type === 'bottom') ? 'row-resize' : 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (m) => {
      if (!isDragging.current) return;
      if (isDragging.current === 'sidebar') {
        const dx = m.clientX - startX;
        setSidebarWidth(Math.min(Math.max(startSW + dx, 120), 400));
      } else if (isDragging.current === 'rightbar') {
        const dx = startX - m.clientX;
        setRightbarWidth(Math.min(Math.max(startRW + dx, 180), 450));
      } else if (isDragging.current === 'bottom') {
        const dy = startY - m.clientY;
        setBottomHeight(Math.min(Math.max(startBH + dy, 120), 500));
      } else if (isDragging.current === 'list') {
        const dx = m.clientX - startX;
        setListWidth(Math.min(Math.max(startLW + dx, 160), 520));
      }
    };

    const stopResizing = () => {
      isDragging.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', stopResizing);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', stopResizing);
  };

  // ── FILTERED ALERTS ──
  const filteredAlerts = useMemo(() => {
    if (!searchPlate.trim()) return alerts;
    const term = searchPlate.trim().toUpperCase();
    return alerts.filter(al => al.currentPlate.toUpperCase().includes(term));
  }, [alerts, searchPlate]);

  const activeAlertData = useMemo(() => alerts.find(al => al.uid === selectedUid), [alerts, selectedUid]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="security-dashboard-container" data-theme={theme}>
      {/* TOPBAR */}
      <div className="topbar">
        <div className="tb-left">
          <div className="logo">CSU</div>
          <div>
            <div className="brand-name">Security Monitor</div>
            <div className="brand-stat">
              <span className="pdot"></span>
              <span className="brand-stat-txt" style={{ color: alerts.length > 0 ? 'var(--amber)' : 'var(--green)' }}>
                {alerts.length > 0 ? `${alerts.length} ALERT(S) ACTIVE` : 'SYSTEM ONLINE'}
              </span>
            </div>
          </div>
          <div className="vdiv"></div>
          <div className="tb-clk">
            <div className="t-time">{clock}</div>
            <div className="t-date">{dateStr}</div>
          </div>
        </div>

        <div className="tb-center">
          <div className="sh-lbl">Shift Remaining</div>
          <div className="sh-box"><div className="sh-val">{shiftFormatted}</div></div>
        </div>

        <div className="tb-right">
          <button className="btn-sim" onClick={simulateDetection}>▶ Simulate Detection</button>
          <div className="guard-blk">
            <div className="guard-name">{user?.full_name || 'Security Guard SEC-001'}</div>
            <div className="guard-sub">{selectedCam.gate}</div>
          </div>
          <button className="btn-theme" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="btn-out" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* TICKER */}
      <div className={`ticker-wrap ${tickerItems.length > 0 ? 'on' : ''}`}>
        <div className="ticker-inner">
          <span className="t-lbl">⚠ Alerts</span>
          <div className="t-track">
            <div className="t-scroll">
              {tickerItems.map((item, i) => (
                <span key={i} className={`t-item t-${item.cls}`}>
                  <span className="t-dot"></span>{item.icon} {item.text}
                </span>
              ))}
              {/* Duplicate for seamless scroll */}
              {tickerItems.map((item, i) => (
                <span key={`dup-${i}`} className={`t-item t-${item.cls}`}>
                  <span className="t-dot"></span>{item.icon} {item.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="layout-main">
        {/* CAMERA SIDEBAR */}
        <div className="sidebar" style={{ width: sidebarWidth }}>
          {CAMERA_DATA.map(cam => (
            <div key={cam.id} className={`cam-card ${selectedCamId === cam.id ? 'active' : ''}`} onClick={() => setSelectedCamId(cam.id)}>
              <div className="cam-thumb" style={{ opacity: cam.live ? 0.28 : 0.1 }}>📷</div>
              <div className="cam-foot">
                <span className="cam-lbl">{cam.name}</span>
                <span className={`lb ${cam.live ? 'live' : 'off'}`}>{cam.live ? 'Live' : 'Offline'}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="resizer-v" onMouseDown={startResizing('sidebar')}></div>

        {/* FEED AREA */}
        <div className="feed-area">
          <div className="feed-box">
            <div className="feed-grid"></div>
            
            <div className="feed-info-overlay">
              <div className="fio-left">
                <div className="fio-gate">{selectedCam.gate}</div>
                <div className="fio-meta">IP: {selectedCam.ip} &nbsp;|&nbsp; {clock}</div>
              </div>
              <div className="fio-right">
                <span className="lb live">Live Feed</span>
              </div>
            </div>

            <div className="det-overlay">
              <div className={`plate-flash ${flashedPlate ? 'show' : ''}`}>
                <div className="pf-num">{flashedPlate}</div>
                <div className="pf-lbl">Plate Detected</div>
              </div>
            </div>
            <div className="feed-ph">
              <span className="feed-ph-icon">📹</span>
              <div className="feed-ph-title">Camera Feed Content</div>
              <div className="feed-ph-sub">{selectedCam.gate}</div>
            </div>
          </div>

          <div className="resizer-h" onMouseDown={startResizing('bottom')}></div>

          {/* BOTTOM STRIP (Alerts & detail) */}
          <div className="bstrip" style={{ height: bottomHeight }}>
            <div className="alert-panel">
              <div className="ph">
                <div className="ph-ico">⚠️</div>
                <span className="ph-title">Live Alerts</span>
                <span className={`ph-badge ${alerts.length === 5 ? 'b-red' : alerts.length > 0 ? 'b-amber' : 'b-green'}`}>
                  {alerts.length} / {MAX_ALERTS}
                </span>
                <div className="ph-sep"></div>
                <div className="ph-search">
                  <span className="ph-search-icon">🔎</span>
                  <input type="text" placeholder="Search plate…" value={searchPlate} onChange={(e) => setSearchPlate(e.target.value)} />
                  {searchPlate && <button className="ph-search-clear vis" onClick={() => setSearchPlate('')}>✕</button>}
                </div>
                <div className="ph-sep"></div>
                <div className="ph-counters">
                  <div className="ph-counter an" title="Anomalies"><span className="ph-counter-icon">⚠️</span><span className="ph-counter-val">{dayTotals.an}</span><span className="ph-counter-tag">Anomaly</span><span className="ph-counter-live"></span></div>
                  <div className="ph-counter br" title="Breaches"><span className="ph-counter-icon">🚨</span><span className="ph-counter-val">{dayTotals.br}</span><span className="ph-counter-tag">Breach</span></div>
                  <div className="ph-counter un" title="Unknowns"><span className="ph-counter-icon">🔍</span><span className="ph-counter-val">{dayTotals.un}</span><span className="ph-counter-tag">Unknown</span></div>
                  <div className="ph-counter ac" title="Access"><span className="ph-counter-icon">✅</span><span className="ph-counter-val">{dayTotals.ac}</span><span className="ph-counter-tag">Access</span></div>
                </div>
                <button className="ph-btn" onClick={() => { setAlerts([]); setSelectedUid(null); setTickerItems([]); }}>Clear All</button>
              </div>

              <div className="max5-bar">
                <div className="max5-dots">
                  {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} className={`max5-dot ${i < alerts.length ? `filled ${alerts[i].a.cls}` : ''}`}></div>
                  ))}
                </div>
                <span className="max5-lbl">Max <span>5</span> active anomalies — oldest auto-dismissed when full</span>
              </div>

              <div className="alert-split">
                <div className="alert-list-col" style={{ width: listWidth }}>
                  {filteredAlerts.length === 0 ? (
                    <div className="al-empty">
                      {searchPlate ? 'No matching plate found' : 'No active alerts'}<br />
                      <span style={{ fontSize: '7px', opacity: .45 }}>Click an alert row to open detail &amp; plate editor</span>
                    </div>
                  ) : (
                    filteredAlerts.map(al => (
                      <div key={al.uid} className={`arow ${al.a.cls} ${selectedUid === al.uid ? 'sel' : ''}`} onClick={() => setSelectedUid(al.uid)}>
                        <div className="ar-top">
                          <span className="ar-icon">{al.a.icon}</span>
                          <span className="ar-title">{al.a.title}</span>
                          <span className="ar-time">{al.time}</span>
                        </div>
                        <div className="ar-sub">{al.owner} · {al.vtype} · {al.gate}</div>
                        <div className="ar-foot">
                          <span className="ar-plate">{al.currentPlate}</span>
                          <span className="ar-edit-hint">{al.a.needsEdit ? '↗ edit plate' : ''}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="resizer" onMouseDown={startResizing('list')}></div>

                <div className="detail-col">
                  {!activeAlertData ? (
                    <div className="dp-empty">
                      <span className="dp-empty-icon">🔍</span>
                      <div className="dp-empty-txt">Click an alert row to view<br />details &amp; edit plate number</div>
                    </div>
                  ) : (
                    <div className="dp-filled show">
                      <div className={`dp-hdr ${activeAlertData.a.cls}`}>
                        <span className="dp-hdr-icon">{activeAlertData.a.icon}</span>
                        <span className="dp-hdr-title">{activeAlertData.a.title}</span>
                        <button className="dp-close" onClick={() => setSelectedUid(null)}>✕</button>
                      </div>
                      <div className="dp-body">
                        <div className="dp-grid">
                          <div className="dp-cell"><div className="dp-cell-lbl">Owner / Driver</div><div className="dp-cell-val" title={activeAlertData.owner}>{activeAlertData.owner}</div></div>
                          <div className="dp-cell"><div className="dp-cell-lbl">Vehicle Type</div><div className="dp-cell-val">{activeAlertData.vtype}</div></div>
                          <div className="dp-cell"><div className="dp-cell-lbl">Gate / Location</div><div className="dp-cell-val">{activeAlertData.gate}</div></div>
                          <div className="dp-cell"><div className="dp-cell-lbl">Timestamp</div><div className="dp-cell-val" style={{ fontFamily: 'var(--mono)', fontSize: '9px' }}>{activeAlertData.time}</div></div>
                        </div>
                        
                        <div>
                          {activeAlertData.a.cls === 'ac' && <span className="status-chip sc-ok">✔ Verified Access</span>}
                          {activeAlertData.a.cls === 'an' && <span className="status-chip sc-warn">⚠ Anomaly Detected</span>}
                          {activeAlertData.a.cls === 'br' && <span className="status-chip sc-breach">🚨 Breach / Unregistered</span>}
                          {activeAlertData.a.cls === 'un' && <span className="status-chip sc-unk">🔍 Unknown Vehicle</span>}
                        </div>

                        {activeAlertData.a.needsEdit ? (
                          <>
                            <div className="dp-sec">License Plate Verification</div>
                            <div>
                              <div className="pe-lbl-row">
                                <span className="pe-lbl">Detected Plate Number</span>
                                <span className="pe-verify">⚠ Verify if Unclear</span>
                              </div>
                              <div className="pe-row">
                                <input
                                  className={`pe-input ${activeAlertData.currentPlate !== activeAlertData.plate ? 'edited' : ''}`}
                                  type="text"
                                  value={activeAlertData.currentPlate}
                                  onChange={(e) => handleUpdatePlate(activeAlertData.uid, e.target.value.toUpperCase())}
                                />
                                <button className="pe-save" onClick={() => handleSavePlate(activeAlertData.uid, activeAlertData.currentPlate)}>✔ Save</button>
                              </div>
                              <div className={`pe-hint ${activeAlertData.currentPlate !== activeAlertData.plate ? 'warn' : ''}`}>
                                {activeAlertData.currentPlate !== activeAlertData.plate ? '⚠ Plate changed — press Save to confirm' : 'Type the correct plate if camera capture was blocked'}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="dp-sec">Plate Verification</div>
                            <div style={{ fontSize: '9px', color: 'var(--green)', fontFamily: 'var(--mono)', padding: '3px 0' }}>✔ Plate verified — no correction needed</div>
                          </>
                        )}

                        <div className="dp-resolved" style={{ display: activeAlertData.resolved ? 'block' : 'none' }}>✔ Alert resolved and logged</div>

                        <div className="dp-actions">
                          <button className="dp-btn dismiss" onClick={() => handleDismiss(activeAlertData.uid)}>Dismiss</button>
                          <button className="dp-btn escalate" onClick={() => handleEscalate(activeAlertData.uid, activeAlertData.currentPlate)}>🚨 Escalate</button>
                          <button className="dp-btn resolve" onClick={() => handleResolve(activeAlertData.uid)}>✔ Resolve</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="resizer-v" onMouseDown={startResizing('rightbar')}></div>

        {/* VEHICLE COUNT PANEL */}
        <div className="vc-panel" style={{ width: rightbarWidth }}>
          <div className="vc-hdr">
            <div className="vc-hdr-top">
              <div className="vc-hdr-left">
                <div className="vc-ico">🚦</div>
                <div>
                  <div className="vc-title">Vehicle Count</div>
                  <div className="vc-sub">Today's traffic summary</div>
                  <div className="vc-sub" style={{ color: 'var(--accent)', marginTop: '1px' }}>
                    {onCampus.ca + onCampus.va + onCampus.mo + onCampus.tr} currently inside
                  </div>
                </div>
              </div>
              <div className="vc-hdr-right">
                <span className="vc-others">Others: {othersCount}</span>
                <button className="vc-reset" onClick={() => { setVehicleNums({ ca: 0, va: 0, mo: 0, tr: 0 }); setOnCampus({ ca: 0, va: 0, mo: 0, tr: 0 }); setTotalCount(0); setOthersCount(0); }}>↺ Reset</button>
              </div>
            </div>
            <div className="vc-totals">
              <div>
                <div className="vc-total-lbl">Total Vehicles Today</div>
                <div className="vc-total-val">{totalCount}</div>
              </div>
              <div className="vc-live"><span className="vc-ldot"></span>Live</div>
            </div>
          </div>
          <div className="vc-grid">
            <div className="vc-cell ca">
              <div className="vc-ct"><span className="vc-emoji">🚗</span><span className="vc-trend up">▲</span></div>
              <div className="vc-num">{vehicleNums.ca}</div><div className="vc-lbl">Cars</div>
              <div className="vc-foot"><span className="vc-delta">▲ {rnd(1, 14)}/min</span></div>
              <div className="vc-campus-row"><span className="vc-campus-lbl">On campus:</span><span className="vc-campus-val">{onCampus.ca}</span></div>
            </div>
            <div className="vc-cell va">
              <div className="vc-ct"><span className="vc-emoji">🚐</span><span className="vc-trend up">▲</span></div>
              <div className="vc-num">{vehicleNums.va}</div><div className="vc-lbl">Vans</div>
              <div className="vc-foot"><span className="vc-delta">▲ {rnd(1, 4)}/min</span></div>
              <div className="vc-campus-row"><span className="vc-campus-lbl">On campus:</span><span className="vc-campus-val">{onCampus.va}</span></div>
            </div>
            <div className="vc-cell mo">
              <div className="vc-ct"><span className="vc-emoji">🏍️</span><span className="vc-trend up">▲</span></div>
              <div className="vc-num">{vehicleNums.mo}</div><div className="vc-lbl">Motors</div>
              <div className="vc-foot"><span className="vc-delta">▲ {rnd(1, 8)}/min</span></div>
              <div className="vc-campus-row"><span className="vc-campus-lbl">On campus:</span><span className="vc-campus-val">{onCampus.mo}</span></div>
            </div>
            <div className="vc-cell tr">
              <div className="vc-ct"><span className="vc-emoji">🚛</span><span className="vc-trend up">▲</span></div>
              <div className="vc-num">{vehicleNums.tr}</div><div className="vc-lbl">Trucks</div>
              <div className="vc-foot"><span className="vc-delta">▲ {rnd(1, 2)}/min</span></div>
              <div className="vc-campus-row"><span className="vc-campus-lbl">On campus:</span><span className="vc-campus-val">{onCampus.tr}</span></div>
            </div>
          </div>
          <div className="vc-chart">
            <div className="vc-chart-lbl">Activity – Last 10 Minutes</div>
            <canvas ref={miniChartRef} className="mini-chart-canvas"></canvas>
          </div>
        </div>
      </div>

      {/* TOASTS */}
      <div className="inline-toasts">
        {toasts.map(t => (
          <div key={t.id} className={`it ${t.type}`}>
            <div className="it-body">
              <span className="it-badge">
                {t.type === 'su' ? 'ACCESS' : t.type === 'wa' ? 'WARNING' : t.type === 'da' ? 'BREACH' : 'UNKNOWN'}
              </span>
              <div className="it-msg">{t.msg}</div>
              {t.plate && <div className="it-plate">{t.plate}</div>}
              <div className="it-time">{t.time}</div>
              <div className="it-tick"></div>
            </div>
            <button className="it-x" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
