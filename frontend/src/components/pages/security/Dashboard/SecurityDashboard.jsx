import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import isElectron from '../../../../utils/isElectron';
import LogoutModal from '../../../common/Modal/LogoutModal';
import api from '../../../../services/api';
import { VEHICLE_TYPES } from '../../../../constants/vehicleConstants';
import './SecurityDashboard.Base.css';
import './SecurityDashboard.TopBar.css';
import './SecurityDashboard.Layout.css';
import './SecurityDashboard.Sidebar.css';
import './SecurityDashboard.Feed.css';
import './SecurityDashboard.Alerts.css';
import './SecurityDashboard.Detail.css';
import './SecurityDashboard.Stats.css';
import './SecurityDashboard.Toasts.css';
import './SecurityDashboard.Controls.css';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_ANPR_STREAM_URL || 'http://localhost:8003';
const SMART_ANPR_PUSH_MODE = import.meta.env.VITE_SMART_ANPR_PUSH_MODE || 'poll';
const BACKEND_BASE = import.meta.env.VITE_API_URL?.replace(/\/api\/v1\/?$/, '') || 'http://localhost:8000';
const ALERTS_WS_URL = `${BACKEND_BASE.replace(/^http/, 'ws')}/ws/alerts`;
const STREAM_URL = `${API_BASE}/api/v1/stream/video`;
const STATUS_URL = `${API_BASE}/api/v1/stream/status`;
const CAMERAS_URL = `${API_BASE}/api/v1/stream/cameras`;
const STABLE_HITS_REQUIRED = 4;
const MIN_STATUS_CONFIDENCE = 70;

const REGISTRATION_BROADCAST = 'campus-anpr';
const REGISTRATION_STORAGE_KEY = 'campus_anpr_last_registration';

const CAMERA_DATA_DEFAULT = [
  { id: 0, name: 'Camera 1', gate: 'Camera 1 – Front Left', gate_name: 'Main Gate', ip: '192.168.1.101', live: true },
  { id: 1, name: 'Camera 2', gate: 'Camera 2 – Front Right', gate_name: 'Main Gate', ip: '192.168.1.102', live: true },
  { id: 2, name: 'Camera 3', gate: 'Camera 3 – Back Left', gate_name: 'Back Gate', ip: '192.168.1.103', live: true },
  { id: 3, name: 'Camera 4', gate: 'Camera 4 – Back Right', gate_name: 'Back Gate', ip: '192.168.1.104', live: false },
];

const PLATES_POOL = ['ABC 1234', 'XYZ 5678', 'LMN 9012', 'PQR 3456', 'CSU 0001', 'DEF 7890', 'GHI 2345', 'JKL 6789', 'MNO 1122', 'STU 3344'];
const OWNERS_POOL = ['J*** D*** C***', 'M*** S***', 'P*** R***', 'A*** G***', 'J*** R***', 'Unknown Owner/Driver', 'C*** M***', 'L*** C***', 'M*** T***', 'UNREGISTERED'];
const VTYPES_POOL = ['Car', 'Van', 'Motorcycle', 'Truck'];
const ALERT_DEFS = [
  {
    cls: 'ac', icon: '✅', title: 'Access', toastType: 'su',
    reasons: [
      'Registered faculty/staff vehicle recognized and cleared',
      'Student vehicle with valid parking permit',
      'Pre-registered visitor vehicle granted entry',
      'Authorized delivery truck within permitted schedule'
    ],
    needsEdit: false
  },
  {
    cls: 'an', icon: '⚠️', title: 'Anomaly', toastType: 'wa',
    reasons: [
      'Plate number is partially unreadable or obscured',
      'Vehicle entered but never exited (overstay detected)',
      'Same plate detected at two different gates simultaneously',
      'License plate recognition confidence is too low'
    ],
    needsEdit: true
  },
  {
    cls: 'br', icon: '🚨', title: 'Breach', toastType: 'da',
    reasons: [
      'Blacklisted / banned vehicle attempted entry',
      'Vehicle forced through the gate without authorization',
      'Stolen vehicle plate detected',
      'Vehicle tailgated another through a closed gate',
      'Access attempted outside permitted hours',
      'Vehicle entered a restricted zone without clearance',
      'Expired access credential detected'
    ],
    needsEdit: true
  },
];
// Note: 'Unknown' category removed — all unknown alerts now fall under Anomaly.

const MAX_ALERTS = 50;

const mapApiKindToAlertDef = (kind) => {
  switch (kind) {
    case 'access':
      return ALERT_DEFS[0];
    case 'anomaly_unregistered':
    case 'anomaly_low_confidence':
      return ALERT_DEFS[1];
    case 'breach_blacklisted':
    case 'breach_expired':
    case 'breach_rejected':
      return ALERT_DEFS[2];
    default:
      return ALERT_DEFS[1]; // Unknown kinds fall under Anomaly
  }
};

/** Human-readable trigger text aligned with CSUCC spec (anpr_alert_kind). */
const TRIGGER_REASON_BY_KIND = {
  anomaly_unregistered: 'Rental or borrowed vehicle not in the system',
  breach_blacklisted: 'Blacklisted vehicle — access denied',
  breach_expired: 'Vehicle registration expired',
  anomaly_low_confidence: 'Low confidence OCR reading — manual check required',
  access: 'Registered vehicle — authorized entry',
  breach_rejected: 'Registration rejected — access denied',
};

function triggerReasonForKind(apiKind) {
  return TRIGGER_REASON_BY_KIND[apiKind] || 'See alert details';
}

function PlateZoomInset({ snapshotSrc, bbox, plate }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !snapshotSrc || !bbox || bbox.length < 4) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const xs = bbox.map((p) => p[0]);
      const ys = bbox.map((p) => p[1]);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      const pad = 10;
      const sx = Math.max(0, minX - pad);
      const sy = Math.max(0, minY - pad);
      const sw = Math.min(img.naturalWidth - sx, maxX - minX + pad * 2);
      const sh = Math.min(img.naturalHeight - sy, maxY - minY + pad * 2);
      const cw = 128;
      const ch = 52;
      canvas.width = cw;
      canvas.height = ch;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
    };
    img.src = snapshotSrc;
  }, [snapshotSrc, bbox, plate]);

  if (!bbox || bbox.length < 4) {
    return (
      <div className="cv-plate-crop">
        <span className="cv-plate-txt">{plate}</span>
      </div>
    );
  }
  return (
    <div className="cv-plate-crop cv-plate-crop-zoom">
      <canvas ref={canvasRef} className="cv-plate-zoom-canvas" width={128} height={52} />
      <span className="cv-plate-zoom-lbl">PLATE ZOOM</span>
    </div>
  );
}

const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const getNow = () => new Date().toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' });
const toImageSrc = (value) => {
  if (!value || typeof value !== 'string') return null;
  if (value.startsWith('data:image/')) return value;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `data:image/jpeg;base64,${value}`;
};

export default function SecurityDashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // ── STATE ──
  const [clock, setClock] = useState('--:--:--');
  const [dateStr, setDateStr] = useState('---');
  const [shiftSec, setShiftSec] = useState(7 * 3600 + 15 * 60);
  const [selectedCamId, setSelectedCamId] = useState('webcam');
  const [cameras, setCameras] = useState(CAMERA_DATA_DEFAULT);
  const [systemStatus, setSystemStatus] = useState('IDLE');
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [engineOnline, setEngineOnline] = useState(false);
  const lastPlateRef = useRef(null);
  const isApiLoadingRef = useRef(false);
  const processDetectedPlateRef = useRef(null);
  const [alerts, setAlerts] = useState([]); // Array of alert objects
  const [selectedUid, setSelectedUid] = useState(null);
  const [searchPlate, setSearchPlate] = useState('');
  const [dayTotals, setDayTotals] = useState({ an: 0, br: 0, un: 0, ac: 0 });
  const [totalCount, setTotalCount] = useState(0);
  const [onCampus, setOnCampus] = useState({ car: 0, van: 0, motorcycle: 0, truck: 0, other: 0 });
  const [vehicleNums, setVehicleNums] = useState({ car: 0, van: 0, motorcycle: 0, truck: 0, other: 0 });
  const [ratePerMin, setRatePerMin] = useState(0);
  const [othersCount, setOthersCount] = useState(0);
  const [tickerItems, setTickerItems] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [flashedPlate, setFlashedPlate] = useState(null);
  const webcamVideoRef = useRef(null);
  const webcamTileVideoRef = useRef(null);
  const webcamStreamRef = useRef(null);
  const [webcamReady, setWebcamReady] = useState(false);
  const stableDetectionRef = useRef({ plate: '', hits: 0, acceptedPlate: '' });
  const processingPlatesRef = useRef(new Set()); // plates currently being processed by polling — WS should skip these

  // ── RESIZING STATE ──
  const [sidebarWidth, setSidebarWidth] = useState(185);
  const [rightbarWidth, setRightbarWidth] = useState(250);
  const [bottomHeight, setBottomHeight] = useState(240);
  const [listWidth, setListWidth] = useState(280);
  const [cvHeight, setCvHeight] = useState(350);

  // ── ANPR CONTROLS STATE ──
  const [ctrlOpen, setCtrlOpen] = useState(false);
  const [anprRunning, setAnprRunning] = useState(false);
  const [anprCamera, setAnprCamera] = useState('0');
  const [anprCameraList, setAnprCameraList] = useState([]);
  const [anprYolo, setAnprYolo] = useState(() => localStorage.getItem('anprYolo') || 'v8');
  const [anprOcr, setAnprOcr] = useState(() => localStorage.getItem('anprOcr') || 'paddleocr');
  const [anprConfidence, setAnprConfidence] = useState(() => parseFloat(localStorage.getItem('anprConfidence') || '0.35'));

  // ── DETECTION ZONE STATE ──
  const [zoneDrawing, setZoneDrawing] = useState(false);
  const [zonePoints, setZonePoints] = useState([]);       // current drawing points (normalised)
  const [zoneSaved, setZoneSaved] = useState([]);          // last saved zone
  const [liveMousePt, setLiveMousePt] = useState(null);   // mouse position during drawing
  const [isStreamOk, setIsStreamOk] = useState(false);
  const [isStreamLoading, setIsStreamLoading] = useState(false);
  const [streamKey, setStreamKey] = useState(0);  // bumped to force img reload
  const feedBoxRef = useRef(null);
  const streamImgRef = useRef(null);

  const miniChartRef = useRef(null);
  const chartDataRef = useRef(Array(10).fill(0).map(() => rnd(1, 20)));

  // ── HELPERS ──
  const selectedCam = useMemo(() => {
    if (selectedCamId === 'webcam') {
      return { id: 'webcam', gate: 'WEBCAM - LIVE DETECTION', gate_name: 'Main Gate', ip: 'Local Device', live: webcamReady };
    }
    return cameras.find(c => c.id === selectedCamId) || cameras[0];
  }, [selectedCamId, cameras, webcamReady]);

  const cameraTiles = useMemo(() => ([
    { id: 'webcam', name: 'WEBCAM', gate: 'WEBCAM - LIVE DETECTION', gate_name: 'Main Gate', ip: 'Local Device', live: webcamReady, isWebcam: true },
    ...cameras.map((cam) => ({ ...cam, isWebcam: false })),
  ]), [cameras, webcamReady]);

  // ── CLOCK & SHIFT ──
  useEffect(() => {
    const timer = setInterval(() => {
      const n = new Date();
      setClock(n.toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' }));
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

  // ── ANPR CONTROLS: Fetch camera list (retry until engine is up) ──
  useEffect(() => {
    let cancelled = false;
    const fetchCameras = () => {
      if (cancelled) return;
      axios.get(`${API_BASE}/api/v1/detect/live/devices/named?include_integrated=true&include_virtual=false`)
        .then(res => {
          if (res.data?.devices) {
            setAnprCameraList(res.data.devices);
            if (res.data.recommended_name) setAnprCamera(res.data.recommended_name);
          }
        })
        .catch(() => {
          // Fallback: try numeric device listing
          axios.get(`${API_BASE}/api/v1/detect/live/devices?max_devices=5`)
            .then(res2 => {
              if (res2.data?.devices) {
                setAnprCameraList(res2.data.devices.map(d => ({ name: `Camera ${d.id}`, id: d.id })));
              }
            })
            .catch(() => {
              // Engine not reachable yet — retry after a delay
              if (!cancelled) setTimeout(fetchCameras, 5000);
            });
        });
    };
    fetchCameras();
    return () => { cancelled = true; };
  }, []);

  const showToast = useCallback((type, msg, plate) => {
    const id = Date.now();
    setToasts(prev => [{ id, type, msg, plate, time: getNow() }, ...prev].slice(0, 3));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const handleStartStopAnpr = useCallback(async () => {
    if (anprRunning) {
      try {
        await axios.post(`${API_BASE}/api/v1/stream/stop`);
        setAnprRunning(false);
        setIsStreamOk(false);
        setSystemStatus('IDLE');
        showToast('su', 'ANPR Engine Stopped', '');
      } catch (err) {
        showToast('wa', 'Failed to stop engine', '');
      }
    } else {
      try {
        const cam = anprCamera;
        const params = new URLSearchParams({
          camera_index: String(typeof cam === 'string' && cam.match(/^\d+$/) ? cam : '0'),
          quality: 'balanced',
          confidence: String(anprConfidence),
          capture_delay: '1.0',
          yolo_version: anprYolo,
          ocr_engine: anprOcr,
        });

        if (typeof cam === 'string' && !cam.match(/^\d+$/)) {
          try {
            const resolveRes = await axios.post(`${API_BASE}/api/v1/detect/live/resolve?camera_name=${encodeURIComponent(cam)}`);
            params.set('camera_index', String(resolveRes.data.index));
          } catch { /* keep default 0 */ }
        }

        setIsApiLoading(true);
        isApiLoadingRef.current = true;
        // Start engine (spins up YOLO/OCR into GPU memory)
        await axios.post(`${API_BASE}/api/v1/stream/start?${params.toString()}`);
        setAnprRunning(true);
        setIsStreamOk(false);
        setIsStreamLoading(true);
        setStreamKey(k => k + 1);
        showToast('su', 'ANPR Models Deployed. Camera booting...', '');
      } catch (err) {
        console.warn('ANPR start failed', err);
        showToast('wa', 'Failed to start engine', '');
      } finally {
        setIsApiLoading(false);
        isApiLoadingRef.current = false;
      }
    }
  }, [anprRunning, anprCamera, anprConfidence, anprYolo, anprOcr, showToast]);

  const handleAnprCameraChange = useCallback((val) => {
    setAnprCamera(val);
  }, []);

  const handleAnprYoloChange = useCallback((val) => {
    setAnprYolo(val);
    localStorage.setItem('anprYolo', val);
  }, []);

  const handleAnprOcrChange = useCallback((val) => {
    setAnprOcr(val);
    localStorage.setItem('anprOcr', val);
  }, []);

  const handleAnprConfidenceChange = useCallback((val) => {
    setAnprConfidence(val);
    localStorage.setItem('anprConfidence', String(val));
    if (anprRunning) {
      axios.post(`${API_BASE}/api/v1/stream/confidence?value=${val}`).catch(() => { });
    }
  }, [anprRunning]);

  const handleResetOcr = useCallback(() => {
    axios.post(`${API_BASE}/api/v1/stream/reset`)
      .then(() => showToast('su', 'OCR state machine reset', ''))
      .catch(() => showToast('wa', 'Reset failed', ''));
  }, [showToast]);

  // Reset stream status when camera changes
  useEffect(() => {
    setIsStreamOk(false);
    setStreamKey(k => k + 1); // force img to re-request
  }, [selectedCamId]);

  // When engine transitions to online, force the stream img to retry
  const prevEngineOnlineRef = useRef(false);
  useEffect(() => {
    if (engineOnline && !prevEngineOnlineRef.current) {
      // engine just came online — bump streamKey to force reload
      setStreamKey(k => k + 1);
    }
    prevEngineOnlineRef.current = engineOnline;
  }, [engineOnline]);

  // Periodic retry: if engine is online but stream failed, retry every 3s
  useEffect(() => {
    if (isStreamOk || !engineOnline) return;
    const retryTimer = setInterval(() => {
      setStreamKey(k => k + 1);
    }, 3000);
    return () => clearInterval(retryTimer);
  }, [isStreamOk, engineOnline]);

  // ── DETECTION ZONE: Load saved zone once engine is online ──
  useEffect(() => {
    if (!engineOnline) return;
    axios.get(`${API_BASE}/api/v1/stream/detection_zone?camera_index=0`)
      .then(res => {
        if (res.data?.points?.length >= 3) {
          setZoneSaved(res.data.points);
        }
      })
      .catch(() => { /* engine may not support zones yet */ });
  }, [engineOnline]);

  // Get normalised coordinates from a mouse event relative to the camera image (not the feed container)
  const getZoneCoords = useCallback((e) => {
    const el = streamImgRef.current || feedBoxRef.current;
    if (!el) return [0, 0];
    const rect = el.getBoundingClientRect();

    // Mathematically clamp clicks outside the image to the nearest edge (0 or 1)
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    return [x, y];
  }, []);

  const handleStartZoneDrawing = useCallback(() => {
    if (!engineOnline) {
      showToast('wa', 'Start the ANPR engine first', '');
      return;
    }
    setZoneDrawing(true);
    setZonePoints([]);
    setLiveMousePt(null);
    setCtrlOpen(false); // close controls panel to give full drawing space
    showToast('in', 'Click on the feed to place zone points. Click the first point to close.', '');
  }, [engineOnline, showToast]);

  const zoneSavingRef = useRef(false);
  const handleFinishZoneDrawing = useCallback(async (pts) => {
    if (zoneSavingRef.current) return; // prevent double-fire
    zoneSavingRef.current = true;
    // Immediately exit drawing mode synchronously
    setZoneDrawing(false);
    setZonePoints([]);
    setLiveMousePt(null);
    if (pts.length >= 3) {
      setZoneSaved([...pts]);
      try {
        await axios.post(`${API_BASE}/api/v1/stream/detection_zone`, {
          camera_index: 0,
          points: pts,
        });
        showToast('su', `Detection zone saved (${pts.length} points)`, '');
      } catch {
        showToast('wa', 'Failed to save zone', '');
      }
    } else {
      showToast('wa', 'Need at least 3 points. Zone not saved.', '');
    }
    setTimeout(() => { zoneSavingRef.current = false; }, 500);
  }, [showToast]);

  const handleClearZone = useCallback(async () => {
    setZoneDrawing(false);
    setZonePoints([]);
    setZoneSaved([]);
    setLiveMousePt(null);
    try {
      await axios.delete(`${API_BASE}/api/v1/stream/detection_zone?camera_index=0`);
      showToast('su', 'Detection zone cleared', '');
    } catch {
      showToast('wa', 'Clear zone failed', '');
    }
  }, [showToast]);

  // Zone drawing: handle clicks on the feed
  const handleFeedZoneClick = useCallback((e) => {
    if (!zoneDrawing) return;
    e.stopPropagation();
    const [x, y] = getZoneCoords(e);
    setZonePoints(prev => {
      // Check if clicking near the first point to close
      if (prev.length >= 3) {
        const [fx, fy] = prev[0];
        const dist = Math.sqrt((x - fx) ** 2 + (y - fy) ** 2);
        if (dist < 0.06) {
          // Auto-save: user closed the polygon by clicking near the first point
          handleFinishZoneDrawing(prev);
          return prev;
        }
      }
      return [...prev, [x, y]];
    });
  }, [zoneDrawing, getZoneCoords, handleFinishZoneDrawing]);

  // Zone drawing: track mouse for guide lines
  const handleFeedZoneMouseMove = useCallback((e) => {
    if (!zoneDrawing) return;
    const [x, y] = getZoneCoords(e);
    setLiveMousePt([x, y]);
  }, [zoneDrawing, getZoneCoords]);

  // Zone drawing: undo last point with right click
  const handleFeedZoneContextMenu = useCallback((e) => {
    if (!zoneDrawing) return;
    e.preventDefault();
    setZonePoints(prev => prev.slice(0, -1));
  }, [zoneDrawing]);

  // Generate SVG polygon elements for the zone
  const renderZoneSvgContent = useMemo(() => {
    const activePoints = zoneDrawing ? zonePoints : zoneSaved;
    if (activePoints.length === 0 && !liveMousePt) return null;

    const elements = [];

    // Filled polygon (3+ points)
    if (activePoints.length >= 3) {
      const pts = activePoints.map(p => `${p[0] * 100},${p[1] * 100}`).join(' ');
      elements.push(
        <polygon
          key="zone-poly"
          points={pts}
          fill={zoneDrawing ? 'rgba(255,0,255,0.08)' : 'rgba(255,0,255,0.06)'}
          stroke="none"
        />
      );
    }

    // Perimeter lines
    if (activePoints.length >= 2) {
      let pts = activePoints.map(p => `${p[0] * 100},${p[1] * 100}`).join(' ');
      if (!zoneDrawing && activePoints.length >= 3) {
        pts += ` ${activePoints[0][0] * 100},${activePoints[0][1] * 100}`;
      }
      elements.push(
        <polyline
          key="zone-line"
          points={pts}
          fill="none"
          stroke="#ff00ff"
          strokeWidth="0.4"
          strokeLinejoin="round"
          opacity={0.85}
        />
      );
    }

    // Guide lines during drawing
    if (zoneDrawing && activePoints.length > 0 && liveMousePt) {
      const last = activePoints[activePoints.length - 1];
      const first = activePoints[0];
      // Line from last point to mouse
      elements.push(
        <line
          key="guide-to-mouse"
          x1={last[0] * 100}
          y1={last[1] * 100}
          x2={liveMousePt[0] * 100}
          y2={liveMousePt[1] * 100}
          stroke="#ff00ff"
          strokeWidth="0.3"
          opacity={0.5}
        />
      );
      // Dashed line from mouse back to start
      if (activePoints.length >= 2) {
        elements.push(
          <line
            key="guide-to-start"
            x1={liveMousePt[0] * 100}
            y1={liveMousePt[1] * 100}
            x2={first[0] * 100}
            y2={first[1] * 100}
            stroke="#ff00ff"
            strokeWidth="0.2"
            strokeDasharray="1 1"
            opacity={0.35}
          />
        );
      }
      // Glow dot at mouse
      elements.push(
        <circle
          key="mouse-dot"
          cx={liveMousePt[0] * 100}
          cy={liveMousePt[1] * 100}
          r="1"
          fill="#ff00ff"
          opacity={0.5}
        />
      );
    }

    // Vertex dots
    activePoints.forEach((p, i) => {
      const isStart = i === 0 && zoneDrawing;
      elements.push(
        <circle
          key={`vert-${i}`}
          cx={p[0] * 100}
          cy={p[1] * 100}
          r={isStart ? '1.5' : '0.8'}
          fill={isStart ? 'rgba(255,0,255,0.3)' : '#ff00ff'}
          stroke="#fff"
          strokeWidth={isStart ? '0.4' : '0.2'}
          style={isStart ? { cursor: 'pointer' } : {}}
        />
      );
    });

    return elements;
  }, [zoneDrawing, zonePoints, zoneSaved, liveMousePt]);

  const refreshDashboardStats = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const [vc, ac] = await Promise.all([
        api.get('/anpr/stats/vehicle-counts'),
        api.get('/anpr/stats/alert-counts'),
      ]);
      const v = vc.data;
      const a = ac.data;

      setTotalCount(v.total_vehicles_today ?? 0);
      setOthersCount(v.others_count ?? 0);
      const t = v.today_entries_by_type || {};
      setVehicleNums({ car: t.car ?? 0, van: t.van ?? 0, motorcycle: t.motorcycle ?? 0, truck: t.truck ?? 0, other: t.other ?? 0 });
      const oc = v.on_campus_by_type || {};
      setOnCampus({ car: oc.car ?? 0, van: oc.van ?? 0, motorcycle: oc.motorcycle ?? 0, truck: oc.truck ?? 0, other: oc.other ?? 0 });
      setRatePerMin(v.rate_per_minute_recent ?? 0);
      setDayTotals({ an: (a.anomaly ?? 0) + (a.unknown ?? 0), br: a.breach ?? 0, ac: a.access ?? 0 });
    } catch (e) {
      if (e?.response?.status === 401 || e?.response?.status === 403) return;
      console.warn('Dashboard stats failed', e?.response?.data || e.message);
    }
  }, []);

  useEffect(() => {
    refreshDashboardStats();
    const id = setInterval(refreshDashboardStats, 10000);
    return () => clearInterval(id);
  }, [refreshDashboardStats]);

  // ── PERSISTENT ALERTS: Load today's alerts from DB on mount ──
  useEffect(() => {
    const loadTodayAlerts = async () => {
      try {
        const res = await api.get('/anpr/alerts/today?limit=50');
        const dbAlerts = res.data?.alerts;
        if (!dbAlerts || !Array.isArray(dbAlerts) || dbAlerts.length === 0) return;

        const mapped = dbAlerts.map((item, idx) => {
          const category = mapApiKindToAlertDef(item.kind);
          const brandStr = item.brand || 'Unknown';
          const rawColor = item.color || 'Unknown';
          const colorStr = rawColor !== 'Unknown' ? rawColor.charAt(0).toUpperCase() + rawColor.slice(1) : 'Unknown';
          const vtRaw = item.vehicle_type || 'Car';
          const vtypeDisplay = vtRaw.charAt(0).toUpperCase() + vtRaw.slice(1);
          const identityLabel = `${brandStr} · ${colorStr}`;
          const snapshotSrc = toImageSrc(item.snapshot_url);

          return {
            uid: `db${item.capture_id}`,
            a: category,
            plate: item.plate,
            owner: item.owner || 'Unknown Owner/Driver',
            vtype: vtypeDisplay,
            gate: item.gate_display || `${item.gate_name || 'Main Gate'}`,
            time: item.time || '--:--:--',
            currentPlate: item.plate,
            resolved: item.anomaly_status === 'resolved',
            dismissed: item.anomaly_status === 'dismissed',
            model: brandStr,
            brand: brandStr,
            color: colorStr,
            identityLabel,
            confidence: String(item.confidence || '0.0'),
            reason: triggerReasonForKind(item.kind),
            apiKind: item.kind,
            snapshotSrc,
            plateBbox: null,
            anomalyId: item.anomaly_id || null,
          };
        });

        // Show all alerts except dismissed — resolved alerts (e.g. corrected plates) should still appear
        // with their updated kind (e.g. anomaly→access)
        const activeAlerts = mapped.filter(a => !a.dismissed);

        setAlerts(activeAlerts);

        // Also update lastPlateRef so polling doesn't re-process loaded plates
        if (activeAlerts.length > 0) {
          lastPlateRef.current = activeAlerts[0].plate;
          stableDetectionRef.current.acceptedPlate = activeAlerts[0].plate;
        }
      } catch (err) {
        // Silently fail — fresh session with no alerts is fine
        console.warn('Could not load today alerts:', err?.response?.data || err.message);
      }
    };
    loadTodayAlerts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openRegisterForPlate = useCallback((plate) => {
    if (!plate) return;
    const q = encodeURIComponent(plate.trim());
    if (isElectron()) {
      const origin = import.meta.env.VITE_WEB_APP_ORIGIN || 'http://localhost:5173';
      window.open(`${origin}/register?plate=${q}`, '_blank', 'noopener,noreferrer');
    } else {
      navigate(`/register?plate=${q}`);
    }
  }, [navigate]);

  const processDetectedPlate = useCallback(async (apiData, camGate) => {
    const plate = (apiData.plate_text || '').trim();
    if (!plate) return;

    // Mark this plate as being processed so the WebSocket handler won't create a duplicate
    processingPlatesRef.current.add(plate);

    const vtypeRaw = apiData.vehicle_type || 'Car';
    const vtype = typeof vtypeRaw === 'string'
      ? (vtypeRaw.charAt(0).toUpperCase() + vtypeRaw.slice(1))
      : 'Car';
    const colorRaw = apiData.color || 'Unknown';
    const color = typeof colorRaw === 'string' && colorRaw.length > 0
      ? (colorRaw.charAt(0).toUpperCase() + colorRaw.slice(1))
      : 'Unknown';
    const brandRaw = apiData.brand || 'Unknown';
    const brand = typeof brandRaw === 'string' && brandRaw.length > 0
      ? (brandRaw.charAt(0).toUpperCase() + brandRaw.slice(1))
      : 'Unknown';
    const confRaw = Number(apiData.plate_confidence);
    const confidence = Number.isFinite(confRaw) ? Math.min(100, Math.max(0, Math.round(confRaw * 100))) : 0;
    const snapshotSrc = toImageSrc(
      apiData?.snapshot_base64
      || apiData?.frame_base64
      || apiData?.snapshot
      || apiData?.image_base64
      || apiData?.payload?.snapshot_base64
      || null
    );
    const plateBbox = apiData.bbox || apiData.plate_bbox || apiData?.payload?.bbox || null;

    let owner = 'Unknown Owner/Driver';
    let category = ALERT_DEFS[1]; // Anomaly (Unknown category was removed)
    let reason = category.reasons[0];
    let apiKind = 'anomaly_unregistered';
    let identityLabel = `${brand} · ${color}`.trim();
    let vtypeDisplay = vtype;

    try {
      const lookupRes = await api.get(`/anpr/lookup/${encodeURIComponent(plate)}`, {
        params: { confidence },
      });
      const d = lookupRes.data;
      apiKind = d.kind || 'anomaly_unregistered';
      category = mapApiKindToAlertDef(apiKind);
      owner = d.owner_name_masked || (d.vehicle ? 'Registered' : 'Unknown Owner/Driver');
      reason = d.message || category.reasons[0];
      if (d.vehicle) {
        const mk = d.vehicle.brand || '';
        identityLabel = `${mk || 'Unknown'} · ${d.vehicle.color || color}`;
        if (d.vehicle.type) {
          const vt = String(d.vehicle.type);
          vtypeDisplay = vt.charAt(0).toUpperCase() + vt.slice(1);
        }
      }
    } catch (err) {
      console.warn('Campus ANPR lookup failed:', err?.response?.data || err.message);
      owner = 'Unknown Owner/Driver';
      category = ALERT_DEFS[1]; // Anomaly (Unknown category was removed)
      reason = 'Could not reach campus API — check login or server';
    }

    const specReason = triggerReasonForKind(apiKind);
    reason = specReason || reason;

    let anomalyId = null;
    let captureConfidence = confidence.toFixed(1);
    const gateFormatStr = selectedCam.name === 'WEBCAM'
      ? `Webcam - ${selectedCam.gate_name || 'Main Gate'}`
      : `${selectedCam.name || 'Camera'} - ${selectedCam.gate_name || 'Main Gate'}`;

    if (SMART_ANPR_PUSH_MODE !== 'webhook') {
      try {
        const capRes = await api.post('/anpr/capture', {
          plate,
          confidence_score: Number.isFinite(confidence) ? confidence : null,
          brand: apiData.brand || null,
          color: apiData.color || null,
          vehicle_type: apiData.vehicle_type || null,
          gate_name: selectedCam.gate_name || 'Main Gate',
          camera_name: selectedCam.name || 'WEBCAM',
          gate_display: gateFormatStr,
          payload: {
            session_status: apiData.session_status,
            fps: apiData.fps,
            stream: API_BASE,
            snapshot_base64: apiData.snapshot_base64 || apiData.frame_base64 || null,
            plate_bbox: plateBbox,
          },
        });
        const cd = capRes.data;
        if (cd.anomaly_id) anomalyId = cd.anomaly_id;
        if (cd.kind) {
          apiKind = cd.kind;
          category = mapApiKindToAlertDef(apiKind);
          reason = triggerReasonForKind(apiKind);
        }
        if (cd.owner_name_masked) owner = cd.owner_name_masked;
        if (cd.confidence_score != null) captureConfidence = Number(cd.confidence_score).toFixed(1);
      } catch (capErr) {
        console.warn('ANPR capture ingest failed:', capErr?.response?.data || capErr.message);
      }
    }

    const time = getNow();
    const uid = 'api' + Date.now();
    const gate = gateFormatStr;

    setFlashedPlate(plate);
    setTimeout(() => setFlashedPlate(null), 3000);

    const newAlert = {
      uid,
      a: category,
      plate,
      owner,
      vtype: vtypeDisplay,
      gate,
      time,
      currentPlate: plate,
      resolved: false,
      model: brand,
      brand,
      color,
      identityLabel,
      confidence: captureConfidence,
      reason,
      apiKind,
      snapshotSrc,
      plateBbox,
      anomalyId,
    };

    setAlerts(prev => {
      // Remove any existing alert for the same plate (e.g. from DB-loaded alerts) to avoid duplication
      const filtered = prev.filter(a => a.plate !== plate);
      const newList = [newAlert, ...filtered];
      if (newList.length > MAX_ALERTS) newList.length = MAX_ALERTS;
      return newList;
    });

    refreshDashboardStats();

    // Clear the processing lock after a delay (give WS events time to arrive and be filtered)
    setTimeout(() => processingPlatesRef.current.delete(plate), 6000);

    if (['an', 'br', 'un'].includes(category.cls)) {
      setSelectedUid(uid);
      setTickerItems(prev => {
        const filtered = prev.filter(t => t.plate !== plate);
        return [{ uid, cls: category.cls, icon: category.icon, text: `${plate} – ${category.title}`, plate }, ...filtered].slice(0, 5);
      });
    }

    showToast(category.toastType, `${category.title}: ${plate}`, plate);
  }, [selectedCam.gate, showToast, refreshDashboardStats]);

  processDetectedPlateRef.current = processDetectedPlate;

  // ── CAMERAS LIST (only fetch when engine comes online) ──
  useEffect(() => {
    if (!engineOnline) return;
    axios.get(CAMERAS_URL).then(res => {
      if (res.data?.cameras?.length) {
        setCameras(prev => {
          let next = [...CAMERA_DATA_DEFAULT];
          next = next.map(c => ({ ...c, live: false }));
          res.data.cameras.forEach(hw => {
            const idx = hw.index;
            if (next[idx]) {
              next[idx].live = !hw.unverified;
              if (!hw.unverified) next[idx].ip = 'Local';
            } else if (idx !== undefined) {
              next.push({ id: idx, name: hw.name, gate: hw.name, ip: 'Unknown', live: true });
            }
          });
          return next;
        });
      }
    }).catch(() => { /* ANPR engine not reachable — will retry when it comes online */ });
  }, [engineOnline]);



  useEffect(() => {
    let timer = null;
    let cancelled = false;
    // Use faster polling (500ms) when engine is online, slower (3s) when offline
    // to avoid flooding the console with ERR_CONNECTION_REFUSED.
    const POLL_FAST = 500;
    const POLL_SLOW = 3000;
    let currentInterval = POLL_FAST;

    const poll = async () => {
      if (cancelled) return;
      try {
        const res = await axios.get(STATUS_URL);
        const data = res.data;
        setEngineOnline(true);
        currentInterval = POLL_FAST; // engine is up — poll fast

        setSystemStatus(data.session_status || 'IDLE');
        setAnprRunning(Boolean(data.running));

        if (!data.running) {
          const tracker = stableDetectionRef.current;
          tracker.plate = '';
          tracker.hits = 0;
        } else {

          const plateText = (data.plate_text || '').trim().toUpperCase();
          // Use plate_confidence directly since the backend sets it when a plate is committed.
          const pConfRaw = Number(data.plate_confidence);
          let statusConf = Number.isFinite(pConfRaw) ? pConfRaw * 100 : 100;

          const tracker = stableDetectionRef.current;

          // If the backend returned a plate text, it already passed backend tracking and validation.
          if (plateText && statusConf >= 15 && data.running) {
            if (tracker.plate === plateText) {
              tracker.hits += 1;
            } else {
              tracker.plate = plateText;
              tracker.hits = 1;
            }

            // Since the backend handles its own multi-frame tracking, 
            // 2 hits in polling (1.0s) is sufficient to pull the trigger.
            if (tracker.hits >= 2 && tracker.acceptedPlate !== plateText && plateText !== lastPlateRef.current) {
              tracker.acceptedPlate = plateText;
              lastPlateRef.current = plateText;
              // Build capture image URL from engine's last_capture_url
              if (data.last_capture_url) {
                data.snapshot_base64 = `${API_BASE}/webui/${data.last_capture_url}`;
              }
              const fn = processDetectedPlateRef.current;
              if (fn) await fn(data, selectedCam.gate);
            }
          } else {
            tracker.plate = '';
            tracker.hits = 0;
          }
        } // end else (data.running)
      } catch (_) {
        setEngineOnline(false);
        currentInterval = POLL_SLOW; // engine is down — back off
      }
      if (!cancelled) timer = setTimeout(poll, currentInterval);
    };

    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [selectedCam.gate, selectedCamId]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== REGISTRATION_STORAGE_KEY || !e.newValue) return;
      try {
        const { plate } = JSON.parse(e.newValue);
        if (plate) showToast('su', 'Vehicle is Registered', plate);
      } catch (_) { /* ignore */ }
    };
    window.addEventListener('storage', onStorage);
    let bc = null;
    try {
      bc = new BroadcastChannel(REGISTRATION_BROADCAST);
      bc.onmessage = (ev) => {
        if (ev.data?.type === 'registration' && ev.data.plate) {
          showToast('su', 'Vehicle is Registered', ev.data.plate);
        }
      };
    } catch (_) { /* BroadcastChannel unsupported */ }
    return () => {
      window.removeEventListener('storage', onStorage);
      if (bc) bc.close();
    };
  }, [showToast]);

  useEffect(() => {
    let ws = null;
    let reconnectTimer = null;
    let closed = false;
    let reconnectDelay = 1500; // start at 1.5s, back off up to 10s

    const connect = () => {
      if (closed) return;
      try {
        ws = new WebSocket(ALERTS_WS_URL);
        ws.onopen = () => {
          reconnectDelay = 1500; // reset on successful connection
        };
        ws.onmessage = (evt) => {
          try {
            const data = JSON.parse(evt.data || '{}');
            if (data.type === 'anomaly.created') {
              const category = mapApiKindToAlertDef(data.kind);
              const plate = data.plate_display || 'UNKNOWN';
              const anomalyId = data.anomaly_id || null;

              setAlerts((prev) => {
                if (anomalyId && prev.some((a) => a.anomalyId === anomalyId)) return prev;
                // Dedup: skip if this plate is currently being processed by the polling path
                if (processingPlatesRef.current.has(plate)) return prev;
                // Dedup: skip if same plate was added in the last 5 seconds
                const now = Date.now();
                if (prev.some((a) => a.plate === plate && (now - parseInt(a.uid.replace(/\D/g, '') || '0', 10)) < 5000)) return prev;
                const incoming = {
                  uid: `ws${Date.now()}`,
                  a: category,
                  plate,
                  owner: data.owner_name_masked || 'Unknown Owner/Driver',
                  vtype: 'Unknown',
                  gate: 'Live camera',
                  time: getNow(),
                  currentPlate: plate,
                  resolved: false,
                  model: data.brand || 'Unknown',
                  brand: data.brand || 'Unknown',
                  color: data.color || 'Unknown',
                  identityLabel: `${data.brand || 'Unknown'} · ${data.color || 'Unknown'}`,
                  confidence: '0.0',
                  reason: triggerReasonForKind(data.kind),
                  apiKind: data.kind || 'anomaly_unregistered',
                  snapshotSrc: null,
                  plateBbox: null,
                  anomalyId,
                };
                const next = [incoming, ...prev];
                if (next.length > MAX_ALERTS) next.pop();
                return next;
              });
              refreshDashboardStats();
            }
          } catch (_) {
            // Ignore malformed socket payloads.
          }
        };
        ws.onerror = () => {
          // Suppress browser console noise — onclose will handle reconnect.
        };
        ws.onclose = () => {
          if (closed) return;
          reconnectTimer = setTimeout(connect, reconnectDelay);
          reconnectDelay = Math.min(reconnectDelay * 1.5, 10000); // back off
        };
      } catch (_) {
        if (!closed) reconnectTimer = setTimeout(connect, reconnectDelay);
      }
    };

    connect();
    return () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null;  // prevent reconnect from cleanup
        ws.onerror = null;
        ws.close();
      }
    };
  }, [refreshDashboardStats]);

  useEffect(() => {
    // Phase 5: Removed frontend `getUserMedia` to prevent browser tracking from
    // locking the physical webcam. This allows the cv2.VideoCapture(0) running
    // on the SMART-PLATE backend to stream MJPEG loaded with YOLO bounding boxes!
    setWebcamReady(true);
  }, []);

  const simulateDetection = async () => {
    if (!engineOnline) {
      showToast('wa', 'ANPR engine offline — run scripts/run_anpr_engine.bat', '');
      return;
    }
    try {
      const { data } = await api.post('/anpr/simulate');
      const apiKind = data.kind || 'anomaly_unregistered';
      const category = mapApiKindToAlertDef(apiKind);
      const owner = data.owner_name_masked || 'Unknown';
      const plate = data.plate_display || PLATES_POOL[0];
      const gate = data.gate_label || cameras[0]?.gate || 'Gate';
      const time = getNow();
      const uid = 'sim' + Date.now();
      const anomalyId = data.anomaly_id || null;
      const confStr = data.confidence_score != null ? Number(data.confidence_score).toFixed(1) : `${rnd(88, 99)}.${rnd(1, 9)}`;
      const model = data.brand || 'Unknown';
      const color = data.color || 'Unknown';
      const identityLabel = `${model} · ${color}`;
      const vtRaw = (data.vehicle_type || 'car').toString();
      const vtype = vtRaw.charAt(0).toUpperCase() + vtRaw.slice(1);
      const reason = triggerReasonForKind(apiKind);

      setFlashedPlate(plate);
      setTimeout(() => setFlashedPlate(null), 2800);

      const newAlert = {
        uid,
        a: category,
        plate,
        owner,
        vtype,
        gate,
        time,
        currentPlate: plate,
        resolved: false,
        model,
        brand: model,
        color,
        identityLabel,
        confidence: confStr,
        reason,
        apiKind,
        snapshotSrc: null,
        plateBbox: null,
        anomalyId,
      };

      setAlerts(prev => {
        const newList = [newAlert, ...prev];
        if (newList.length > MAX_ALERTS) newList.pop();
        return newList;
      });

      refreshDashboardStats();

      showToast(category.toastType, `${category.title}: ${plate}`, plate);

      if (['an', 'br', 'un'].includes(category.cls)) {
        setSelectedUid(uid);
        setTickerItems(prev => {
          const filtered = prev.filter(t => t.plate !== plate);
          const next = [{ uid, cls: category.cls, icon: category.icon, text: `${plate} – ${reason}`, plate }, ...filtered];
          return next.slice(0, 5);
        });
      }
    } catch (err) {
      console.warn('Simulate detection failed:', err?.response?.data || err.message);
      showToast('da', 'Simulate failed — check API / login', '');
    }
  };

  const removeAlert = (uid) => {
    setAlerts(prev => prev.filter(al => al.uid !== uid));
    if (selectedUid === uid) setSelectedUid(null);
  };

  const patchAnomaly = async (anomalyId, action) => {
    if (!anomalyId) return;
    await api.patch(`/anpr/anomaly/${anomalyId}/${action}`);
  };

  const handleResolve = async (uid) => {
    const al = alerts.find((a) => a.uid === uid);
    try {
      if (al?.anomalyId) await patchAnomaly(al.anomalyId, 'resolve');
    } catch (e) {
      console.warn('Resolve failed', e?.response?.data || e.message);
    }
    setAlerts(prev => prev.map(a => (a.uid === uid ? { ...a, resolved: true } : a)));
    setTimeout(() => removeAlert(uid), 1000);
  };

  const handleEscalate = async (uid, plate) => {
    const al = alerts.find((a) => a.uid === uid);
    try {
      if (al?.anomalyId) await patchAnomaly(al.anomalyId, 'escalate');
    } catch (e) {
      console.warn('Escalate failed', e?.response?.data || e.message);
    }
    showToast('da', 'Alert escalated to supervisor!', plate);
    refreshDashboardStats(); // Update breach/anomaly counters immediately
    removeAlert(uid);
  };

  const handleDismiss = async (uid) => {
    const al = alerts.find((a) => a.uid === uid);
    try {
      if (al?.anomalyId) await patchAnomaly(al.anomalyId, 'dismiss');
    } catch (e) {
      console.warn('Dismiss failed', e?.response?.data || e.message);
    }
    removeAlert(uid);
  };

  const handleResetVehicleCounts = async () => {
    try {
      await api.post('/anpr/stats/reset-on-campus');
      await refreshDashboardStats();
    } catch (e) {
      console.warn('Reset on-campus failed', e?.response?.data || e.message);
    }
  };

  const handleUpdatePlate = (uid, newPlate) => {
    setAlerts(prev => prev.map(al => al.uid === uid ? { ...al, currentPlate: newPlate } : al));
  };

  const handleSavePlate = async (uid, newPlate) => {
    handleUpdatePlate(uid, newPlate);

    const al = alerts.find((a) => a.uid === uid);
    const anomalyId = al?.anomalyId;

    try {
      let data;

      if (anomalyId) {
        // ── Use the backend correct_plate endpoint which properly:
        //    1. Re-classifies the plate (access / anomaly / breach)
        //    2. Toggles is_on_campus (entry → exit or vice-versa)
        //    3. Updates the entry_log direction
        //    4. Resolves the anomaly if the corrected plate is registered
        const corrRes = await api.patch(`/anpr/anomaly/${anomalyId}/correct_plate`, {
          corrected_plate: newPlate.trim(),
        });
        data = corrRes.data?.data; // The backend nests the lookup payload inside "data"
      } else {
        // Fallback: no anomaly record — just do a read-only lookup
        const res = await api.get(`/anpr/lookup/${encodeURIComponent(newPlate.trim())}`);
        data = res.data;
      }

      if (data && data.kind) {
        const newCategory = mapApiKindToAlertDef(data.kind);
        const newReason = triggerReasonForKind(data.kind);
        const newOwner = data.owner_name_masked || 'Unknown';

        // Extract vehicle details if available
        const veh = data.vehicle || {};
        const newBrand = veh.brand
          ? veh.brand.charAt(0).toUpperCase() + veh.brand.slice(1)
          : undefined;
        const newColor = veh.color
          ? veh.color.charAt(0).toUpperCase() + veh.color.slice(1)
          : undefined;
        const newVtype = veh.type
          ? veh.type.charAt(0).toUpperCase() + veh.type.slice(1)
          : undefined;
        const newPlateDisplay = data.plate_display || newPlate;

        setAlerts(prev => prev.map(a => {
          if (a.uid !== uid) return a;
          return {
            ...a,
            currentPlate: newPlateDisplay,
            plate: newPlateDisplay,
            a: newCategory,
            apiKind: data.kind,
            reason: newReason,
            owner: newOwner,
            ...(newBrand && { brand: newBrand, model: newBrand }),
            ...(newColor && { color: newColor }),
            ...(newVtype && { vtype: newVtype }),
          };
        }));

        // Refresh vehicle counts immediately so the "currently inside" counter updates
        refreshDashboardStats();

        if (data.kind === 'access') {
          showToast('su', `✅ Plate corrected → ${newPlateDisplay} is REGISTERED`, newOwner);
        } else if (data.kind.startsWith('breach')) {
          showToast('da', `🚨 Plate corrected → ${newPlateDisplay} is FLAGGED`, newReason);
        } else {
          showToast('wa', `Plate corrected → ${newPlateDisplay} not found in registry`, '');
        }
      } else {
        showToast('wa', `Plate corrected: ${newPlate} — not found in registry`, '');
      }
    } catch (err) {
      console.warn('Plate correction failed:', err?.response?.data || err.message);
      showToast('wa', `Plate correction failed: ${err?.response?.data?.detail || err.message}`, '');
    }
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
    const startCVH = cvHeight;

    document.body.style.cursor = (type === 'bottom' || type === 'cvh') ? 'row-resize' : 'col-resize';
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
      } else if (isDragging.current === 'cvh') {
        const dy = m.clientY - startY;
        setCvHeight(Math.min(Math.max(startCVH + dy, 180), 550));
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

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null); // fullscreen snapshot viewer

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    const logoutTarget = isElectron() ? '/security-login' : '/login';
    navigate(logoutTarget, { replace: true });
    setShowLogoutModal(false);
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
          <div className="vdiv"></div>
          <div className="tb-chart">
            <div className="tb-chart-lbl">ACTIVITY - LAST 10 MIN</div>
            <canvas ref={miniChartRef} className="mini-chart-canvas-tb"></canvas>
          </div>
        </div>

        <div className="tb-center">
          <div className="sh-lbl">Shift Remaining</div>
          <div className="sh-box"><div className="sh-val">{shiftFormatted}</div></div>
        </div>

        <div className="tb-right">

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
                <span key={i} className={`t-item t-${item.cls}`} onClick={() => setSelectedUid(item.uid)} style={{ cursor: 'pointer' }}>
                  <span className="t-dot"></span>{item.icon} {item.text}
                </span>
              ))}
              {/* Duplicate for seamless scroll */}
              {tickerItems.map((item, i) => (
                <span key={`dup-${i}`} className={`t-item t-${item.cls}`} onClick={() => setSelectedUid(item.uid)} style={{ cursor: 'pointer' }}>
                  <span className="t-dot"></span>{item.icon} {item.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ZONE DRAWING FOCUS OVERLAY — dims everything, but forwards clicks to zone handler */}
      {zoneDrawing && (
        <div
          className="zone-focus-overlay"
          onClick={handleFeedZoneClick}
          onMouseMove={handleFeedZoneMouseMove}
          onContextMenu={handleFeedZoneContextMenu}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <div className="layout-main">
        {/* FEED AREA */}
        <div className="feed-area">
          <div
            className={`feed-box ${zoneDrawing ? 'zone-drawing-active' : ''}`}
            onClick={zoneDrawing ? handleFeedZoneClick : undefined}
            onMouseMove={zoneDrawing ? handleFeedZoneMouseMove : undefined}
            onContextMenu={zoneDrawing ? handleFeedZoneContextMenu : undefined}
            style={zoneDrawing ? { cursor: 'crosshair' } : {}}
          >
            <div className="feed-grid"></div>

            <div className="feed-info-overlay">
              <div className="fio-left">
                <div className="fio-gate">{selectedCam.gate}</div>
                <div className="fio-meta">IP: {selectedCam.ip} &nbsp;|&nbsp; {clock}</div>
              </div>
              <div className="fio-right">
                <span className={`lb ${systemStatus !== 'IDLE' ? 'anim' : 'live'}`}>
                  {systemStatus || 'Live Feed'}
                </span>
              </div>
            </div>

            <div className="det-overlay">
              <div className={`plate-flash ${flashedPlate ? 'show' : ''}`}>
                <div className="pf-num">{flashedPlate}</div>
                <div className="pf-lbl">Plate Detected</div>
              </div>
            </div>

            <div className="feed-view"
              ref={feedBoxRef}
              onClick={handleFeedZoneClick}
              onMouseMove={handleFeedZoneMouseMove}
              onContextMenu={handleFeedZoneContextMenu}
              style={zoneDrawing ? { cursor: 'crosshair' } : {}}
            >
              <>
                {anprRunning && (
                  <img
                    ref={streamImgRef}
                    src={`${STREAM_URL}?_t=${selectedCamId}&_k=${streamKey}`}
                    alt="Camera Stream"
                    className="live-stream-img"
                    style={{ display: isStreamOk ? 'block' : 'none' }}
                    onError={() => { setIsStreamOk(false); setIsStreamLoading(false); }}
                    onLoad={() => { setIsStreamOk(true); setIsStreamLoading(false); }}
                  />
                )}
                {(!isStreamOk || !anprRunning) && (
                  <div className="feed-ph" style={{ display: 'flex', position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', zIndex: 2, flexDirection: 'column' }}>
                    <span className="feed-ph-icon">📹</span>
                    <div className="feed-ph-title">
                      {isApiLoading ? 'LOADING AI MODELS...' :
                        (!engineOnline ? 'BACKGROUND SERVER OFFLINE' :
                          (!anprRunning ? 'ANPR ENGINE STOPPED. CLICK START ENGINE.' :
                            (isStreamLoading ? 'INITIALIZING CAMERA FEED...' : 'STREAM CONNECTION BUG / LOST')))}
                    </div>
                    <div className="feed-ph-sub">{selectedCam.gate} — {API_BASE}</div>
                  </div>
                )}
              </>

              {/* Detection Zone SVG Overlay — only during active drawing, not for saved zones
                 (the ANPR engine already renders saved zones on the MJPEG frames) */}
              {(renderZoneSvgContent && zoneDrawing) && (
                <svg
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: zoneDrawing ? 'none' : 'none',
                    zIndex: 15,
                  }}
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {renderZoneSvgContent}
                </svg>
              )}

              {/* Zone Drawing Status Bar */}
              {zoneDrawing && (
                <div style={{
                  position: 'absolute',
                  bottom: 10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 30,
                  background: 'rgba(0,0,0,0.75)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,0,255,0.4)',
                  borderRadius: 6,
                  padding: '6px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  pointerEvents: 'auto',
                }}>
                  <span style={{ color: '#ff00ff', fontSize: 10, fontFamily: 'var(--mono)', fontWeight: 700 }}>
                    ✏ DRAWING ZONE — {zonePoints.length} point{zonePoints.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setZonePoints(prev => prev.slice(0, -1)); }}
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff',
                      fontSize: 9,
                      padding: '3px 8px',
                      borderRadius: 3,
                      cursor: 'pointer',
                      fontFamily: 'var(--mono)',
                    }}
                    disabled={zonePoints.length === 0}
                  >
                    ↩ Undo
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleFinishZoneDrawing(zonePoints); }}
                    style={{
                      background: zonePoints.length >= 3 ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${zonePoints.length >= 3 ? 'rgba(0,255,136,0.4)' : 'rgba(255,255,255,0.1)'}`,
                      color: zonePoints.length >= 3 ? '#00ff88' : 'var(--muted)',
                      fontSize: 9,
                      padding: '3px 8px',
                      borderRadius: 3,
                      cursor: zonePoints.length >= 3 ? 'pointer' : 'not-allowed',
                      fontFamily: 'var(--mono)',
                      fontWeight: 700,
                    }}
                    disabled={zonePoints.length < 3}
                  >
                    ✔ Save ({zonePoints.length >= 3 ? 'ready' : 'need 3+'})
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setZoneDrawing(false); setZonePoints([]); setLiveMousePt(null); }}
                    style={{
                      background: 'rgba(255,60,60,0.1)',
                      border: '1px solid rgba(255,60,60,0.3)',
                      color: '#ff3c3c',
                      fontSize: 9,
                      padding: '3px 8px',
                      borderRadius: 3,
                      cursor: 'pointer',
                      fontFamily: 'var(--mono)',
                    }}
                  >
                    ✕ Cancel
                  </button>
                </div>
              )}
            </div>

            {/* ANPR Controls Toggle + Panel */}
            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, pointerEvents: 'none', zIndex: 22 }}>
              <button
                className={`anpr-ctrl-toggle ${ctrlOpen ? 'open' : ''}`}
                onClick={() => setCtrlOpen(o => !o)}
              >
                <span className={`anpr-engine-dot ${engineOnline ? '' : 'offline'}`}></span>
                <span className="ctrl-gear">⚙</span>
                <span>Controls</span>
              </button>

              <div className={`anpr-controls-panel ${ctrlOpen ? 'visible' : ''}`}>
                <div className="acp-header">
                  <span className="acp-title">Engine Controls</span>
                  <span className={`acp-engine-tag ${engineOnline ? '' : 'offline'}`}>
                    {engineOnline ? '● ONLINE' : '● OFFLINE'}
                  </span>
                </div>

                {/* Start/Stop Toggle */}
                <div className="acp-section" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 15, marginBottom: 5 }}>
                  <div className="acp-label" style={{ marginBottom: 10 }}>ANPR Status</div>
                  <button
                    className={`dp-btn ${anprRunning ? 'dismiss' : 'resolve'} ${isApiLoading ? 'loading' : ''}`}
                    style={{ width: '100%', padding: '8px', fontWeight: 'bold', position: 'relative', overflow: 'hidden' }}
                    onClick={handleStartStopAnpr}
                    disabled={isApiLoading || !engineOnline}
                  >
                    {isApiLoading ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'ap-spin 1s linear infinite' }}>
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        <span>LOADING AI MODELS...</span>
                        <style>{`
                          @keyframes ap-spin { 100% { transform: rotate(360deg); } }
                          .dp-btn.loading { opacity: 0.8; cursor: wait !important; background: repeating-linear-gradient(45deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1) 10px, transparent 10px, transparent 20px) var(--accent); background-size: 200% 200%; animation: pulse-bg 2s linear infinite; }
                          @keyframes pulse-bg { 100% { background-position: 100% 100%; } }
                        `}</style>
                      </div>
                    ) : (anprRunning ? '■ STOP ANPR ENGINE' : '▶ START ANPR ENGINE')}
                  </button>
                </div>

                {/* Camera */}
                <div className="acp-section">
                  <div className="acp-label">Camera</div>
                  <select
                    className="acp-select"
                    value={anprCamera}
                    onChange={(e) => handleAnprCameraChange(e.target.value)}
                    disabled={anprRunning}
                  >
                    {anprCameraList.length > 0 ? (
                      anprCameraList.map((cam, i) => (
                        <option key={i} value={cam.name || String(cam.id)}>
                          {cam.name || `Camera ${cam.id}`}
                        </option>
                      ))
                    ) : (
                      <option value="0">Default Camera (0)</option>
                    )}
                  </select>
                </div>

                {/* YOLO + OCR */}
                <div className="acp-section">
                  <div className="acp-row">
                    <div className="acp-col">
                      <div className="acp-label">YOLO Engine</div>
                      <select
                        className="acp-select"
                        value={anprYolo}
                        onChange={(e) => handleAnprYoloChange(e.target.value)}
                        disabled={anprRunning}
                      >
                        <option value="v26">YOLO26 (v26)</option>
                        <option value="v8">YOLOv8</option>
                        <option value="hybrid">Hybrid (v8+v26)</option>
                      </select>
                    </div>
                    <div className="acp-col">
                      <div className="acp-label">OCR Engine</div>
                      <select
                        className="acp-select"
                        value={anprOcr}
                        onChange={(e) => handleAnprOcrChange(e.target.value)}
                        disabled={anprRunning}
                      >
                        <option value="paddleocr">PaddleOCR</option>
                        <option value="easyocr">EasyOCR</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Confidence Sensitivity */}
                <div className="acp-section">
                  <div className="acp-label">Detection Sensitivity</div>
                  <div className="acp-slider-wrap">
                    <input
                      type="range"
                      className="acp-slider"
                      min="0.05"
                      max="0.90"
                      step="0.05"
                      value={anprConfidence}
                      onChange={(e) => handleAnprConfidenceChange(parseFloat(e.target.value))}
                    />
                    <span className="acp-slider-val">{(anprConfidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="acp-slider-labels">
                    <span>SENSITIVE</span>
                    <span>STRICT</span>
                  </div>
                </div>



                {/* Detection Zone */}
                <div className="acp-section">
                  <div className="acp-label">
                    Detection Zone
                    {zoneSaved.length >= 3 && (
                      <span style={{ color: 'var(--green)', marginLeft: 6, fontWeight: 400, fontSize: 7 }}>● {zoneSaved.length}pt zone active</span>
                    )}
                  </div>
                  <div className="acp-zone-btns">
                    <button
                      className="acp-zone-btn"
                      onClick={handleStartZoneDrawing}
                      disabled={!anprRunning || !isStreamOk || zoneDrawing || zoneSaved.length >= 3}
                      style={(!anprRunning || !isStreamOk || zoneSaved.length >= 3) ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                      title={!anprRunning ? 'Start the ANPR engine first' : (!isStreamOk ? 'Waiting for camera feed...' : '')}
                    >
                      ⬡ {zoneDrawing ? 'Drawing...' : 'Set Zone'}
                    </button>
                    <button
                      className="acp-zone-btn clear"
                      onClick={handleClearZone}
                      disabled={!anprRunning || !isStreamOk}
                      style={(!anprRunning || !isStreamOk) ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                      title={!anprRunning ? 'Start the ANPR engine first' : (!isStreamOk ? 'Waiting for camera feed...' : '')}
                    >
                      ✕ Clear
                    </button>
                  </div>
                </div>

                {/* Reset OCR */}
                <div className="acp-section">
                  <button className="acp-reset-btn" onClick={handleResetOcr}>↻ Reset OCR State</button>
                </div>
              </div>
            </div>
          </div>

          <div className="resizer-h" onMouseDown={startResizing('bottom')}></div>

          {/* BOTTOM STRIP (Alerts & detail) */}
          <div className="bstrip" style={{ height: bottomHeight }}>
            {/* CAMERA GRID RELOCATED (PHASE 2) */}
            <div className="cam-panel">
              <div className="sb-section-label">Live Cameras</div>
              <div className="cam-grid">
                {cameraTiles.map((cam) => {
                  return (
                    <div
                      key={cam.id}
                      className={`cam-tile ${selectedCamId === cam.id ? 'active' : ''}`}
                      onClick={() => setSelectedCamId(cam.id)}
                    >
                      {cam.isWebcam && selectedCamId !== 'webcam' ? (
                        <div className="cam-webcam-video" style={{ backgroundColor: '#0f172a' }}></div>
                      ) : null}
                      {cam.live && <div className="scan-line"></div>}
                      <div className={`cam-status-badge ${cam.live ? 'live' : 'offline'} ${cam.isWebcam ? 'pulse' : ''}`}>
                        {cam.live ? 'LIVE' : 'OFFLINE'}
                      </div>
                      <svg className="cam-icon-svg" viewBox="0 0 24 24">
                        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                      </svg>
                      <div className="cam-pos-label">{cam.gate || cam.name}</div>
                      {cam.isWebcam ? <div className="cam-webcam-status ready">● LIVE DETECTION ACTIVE</div> : null}
                    </div>
                  );
                })}
              </div>
              <div className="sb-footer">
                <div className="sb-gate-name">{cameras[0].gate}</div>
                <div className="sb-ip-addr">IP: {cameras[0].ip}</div>
              </div>
            </div>

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

                  <div className="ph-counter ac" title="Access"><span className="ph-counter-icon">✅</span><span className="ph-counter-val">{dayTotals.ac}</span><span className="ph-counter-tag">Access</span></div>
                </div>
                <button className="ph-btn" onClick={() => { setAlerts([]); setSelectedUid(null); setTickerItems([]); }}>Clear All</button>
              </div>

              <div className="max5-bar">
                <div className="max5-dots">
                  {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} className={`max5-dot ${i < alerts.length ? `filled ${alerts[i]?.a?.cls || ''}` : ''}`}></div>
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
                        <div className="ar-sub">{al.owner} · {al.model || al.brand || 'Unknown'} · {al.color || 'Unknown'} · {al.gate}</div>
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
                          <div className="dp-cell"><div className="dp-cell-lbl">Vehicle Brand</div><div className="dp-cell-val">{activeAlertData.model || activeAlertData.brand || 'Unknown'}</div></div>
                          <div className="dp-cell"><div className="dp-cell-lbl">Vehicle Color</div><div className="dp-cell-val">{activeAlertData.color || 'Unknown'}</div></div>
                          <div className="dp-cell"><div className="dp-cell-lbl">Vehicle Type</div><div className="dp-cell-val">{activeAlertData.vtype}</div></div>
                          <div className="dp-cell"><div className="dp-cell-lbl">Gate / Location</div><div className="dp-cell-val">{activeAlertData.gate}</div></div>
                          <div className="dp-cell"><div className="dp-cell-lbl">Timestamp</div><div className="dp-cell-val" style={{ fontFamily: 'var(--mono)', fontSize: '9px' }}>{activeAlertData.time}</div></div>
                        </div>

                        <div>
                          {activeAlertData.a.cls === 'ac' && <span className="status-chip sc-ok">✔ Verified Access</span>}
                          {activeAlertData.a.cls === 'an' && <span className="status-chip sc-warn">⚠ Anomaly Detected</span>}
                          {activeAlertData.a.cls === 'br' && <span className="status-chip sc-breach">🚨 Breach / Unregistered</span>}

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

        {/* VEHICLE COUNT PANEL (SWAPPED LAYOUT) */}
        <div className="vc-panel" style={{ width: rightbarWidth }}>
          {/* CAPTURED VEHICLE INFO PANEL (PHASE 4) */}
          <div className="cv-resizable-section" style={{ height: cvHeight, flexShrink: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {activeAlertData ? (
              <div className="captured-vehicle-panel-in pfade" style={{ flex: 1, margin: '10px 10px 5px' }}>
                <div className="cv-hdr">
                  <span className="cv-hdr-title">Captured Vehicle Info</span>
                  <button className="cv-close" onClick={() => setSelectedUid(null)}>✕</button>
                </div>

                <div className="cv-body" style={{ flex: 1, overflowY: 'auto' }}>
                  <div className="cv-visuals cv-visuals-single">
                    <div className="cv-thumb-box cv-thumb-box--inset">
                      {activeAlertData.snapshotSrc ? (
                        <>
                          <img
                            src={activeAlertData.snapshotSrc}
                            alt="Captured Vehicle"
                            className="cv-snapshot-img"
                            style={{ cursor: 'pointer' }}
                            title="Click to view full size"
                            onClick={() => setLightboxSrc(activeAlertData.snapshotSrc)}
                          />
                          <div className="cv-plate-inset">
                            <PlateZoomInset
                              snapshotSrc={activeAlertData.snapshotSrc}
                              bbox={activeAlertData.plateBbox}
                              plate={activeAlertData.currentPlate}
                            />
                          </div>
                        </>
                      ) : (
                        <div className="cv-img-placeholder">
                          <span className="cv-ico-lg">🚗</span>
                          <div className="cv-scan"></div>
                        </div>
                      )}
                      <span className="cv-img-lbl">Full Snapshot</span>
                    </div>
                  </div>

                  <div className="cv-info-grid">
                    <div className="cv-item">
                      <span className="cv-lbl">Plate Number</span>
                      <span className="cv-val" style={{ fontFamily: 'var(--mono)', fontWeight: 700, letterSpacing: '1px' }}>{activeAlertData.currentPlate || '---'}</span>
                    </div>
                    <div className="cv-item">
                      <span className="cv-lbl">Vehicle Brand</span>
                      <span className="cv-val">{activeAlertData.model || activeAlertData.brand || 'Unknown'}</span>
                    </div>
                    <div className="cv-item">
                      <span className="cv-lbl">Vehicle Color</span>
                      <span className="cv-val">{activeAlertData.color || 'Unknown'}</span>
                    </div>
                    <div className="cv-item">
                      <span className="cv-lbl">Vehicle Type</span>
                      <span className="cv-val">{activeAlertData.vtype || 'Unknown'}</span>
                    </div>
                    <div className="cv-item">
                      <span className="cv-lbl">Detected Owner</span>
                      <span className="cv-val">{activeAlertData.owner}</span>
                    </div>
                    <div className="cv-item">
                      <span className="cv-lbl">Plate OCR Confidence</span>
                      <div className="cv-conf-bar">
                        <div className="cv-conf-fill" style={{ width: `${Math.min(100, Number.parseFloat(activeAlertData.confidence) || 0)}%` }}></div>
                        <span className="cv-conf-val">{activeAlertData.confidence}%</span>
                      </div>
                    </div>
                    <div className="cv-item">
                      <span className="cv-lbl">Alert Category</span>
                      <span className={`cv-status-chip ${activeAlertData.a.cls}`}>
                        {activeAlertData.a.icon} {activeAlertData.a.title}
                      </span>
                    </div>
                    <div className="cv-item-full">
                      <span className="cv-lbl">Trigger Reason</span>
                      <span className="cv-reason-text">{triggerReasonForKind(activeAlertData.apiKind) || activeAlertData.reason}</span>
                    </div>
                  </div>

                  <div className="cv-actions">
                    {activeAlertData.a.cls === 'br' ? (
                      <div className="cv-triage-btns">
                        <button type="button" className="cv-btn dismiss" onClick={() => handleDismiss(activeAlertData.uid)}>Dismiss</button>
                        <button type="button" className="cv-btn escalate" onClick={() => handleEscalate(activeAlertData.uid, activeAlertData.currentPlate)}>Escalate</button>
                        <button type="button" className="cv-btn resolve-br" onClick={() => handleResolve(activeAlertData.uid)}>Resolve</button>
                      </div>
                    ) : (
                      <button type="button" className="cv-btn resolve-std" onClick={() => handleResolve(activeAlertData.uid)}>Mark as Resolved</button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="cv-empty-placeholder" style={{ flex: 1, margin: '10px 10px 5px' }}>
                <div className="cv-empty-msg">
                  <span className="cv-empty-icon">🚗</span>
                  <div>Select an alert to view<br />captured info</div>
                </div>
              </div>
            )}
          </div>

          <div className="resizer-h" onMouseDown={startResizing('cvh')} style={{ background: 'var(--border)', height: '3px', opacity: 0.5 }}></div>

          <div className="vc-hdr">
            <div className="vc-hdr-top">
              <div className="vc-hdr-left">
                <div className="vc-ico">🚦</div>
                <div>
                  <div className="vc-title">Vehicle Count</div>
                  <div className="vc-sub">Today's traffic summary</div>
                  <div className="vc-sub" style={{ color: 'var(--accent)', marginTop: '1px' }}>
                    {Object.values(onCampus).reduce((s, v) => s + v, 0)} currently inside
                  </div>
                </div>
              </div>
              <div className="vc-hdr-right">
                <span className="vc-rate">▲ {ratePerMin}/min</span>
                <button type="button" className="vc-reset" onClick={handleResetVehicleCounts}>↺ Reset</button>
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
            {VEHICLE_TYPES.map(vt => (
              <div key={vt.value} className={`vc-cell-row ${vt.value}`}>
                <div className="vc-cr-left">
                  <span className="vc-emoji">{vt.icon}</span>
                  <span className="vc-lbl">{vt.label}</span>
                </div>
                <div className="vc-cr-mid">
                  <div className="vc-num">{vehicleNums[vt.value] || 0}</div>
                </div>
                <div className="vc-cr-right">
                  <span className="vc-campus-lbl">In:</span>
                  <span className="vc-campus-val">{onCampus[vt.value] || 0}</span>
                </div>
              </div>
            ))}
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

      {/* LOGOUT MODAL */}
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
      {/* SNAPSHOT LIGHTBOX MODAL */}
      {lightboxSrc && (
        <div
          className="snapshot-lightbox-overlay"
          onClick={() => setLightboxSrc(null)}
          onKeyDown={(e) => e.key === 'Escape' && setLightboxSrc(null)}
          tabIndex={-1}
          ref={(el) => el && el.focus()}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxSrc(null); }}
            style={{
              position: 'absolute',
              top: 18,
              right: 24,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 18,
              cursor: 'pointer',
              fontFamily: 'var(--mono)',
              transition: 'background 0.2s',
              zIndex: 10000,
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,60,60,0.4)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            title="Close"
          >
            ✕
          </button>
          <div style={{ textAlign: 'center', maxWidth: '92vw', maxHeight: '92vh' }}>
            <img
              src={lightboxSrc}
              alt="Full Snapshot"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '90vw',
                maxHeight: '85vh',
                objectFit: 'contain',
                borderRadius: 8,
                border: '1px solid rgba(0,229,255,0.25)',
                boxShadow: '0 0 60px rgba(0,229,255,0.15), 0 20px 60px rgba(0,0,0,0.5)',
              }}
            />
            <div style={{
              marginTop: 10,
              color: 'rgba(255,255,255,0.45)',
              fontSize: 10,
              fontFamily: 'var(--mono)',
              letterSpacing: 1.5,
              textTransform: 'uppercase',
            }}>
              Full Resolution Snapshot · Click anywhere or press ESC to close
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
