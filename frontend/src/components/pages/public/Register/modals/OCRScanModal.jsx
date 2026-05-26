import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import '../../../../../assets/css/components/OCRScanModal/index.css';

const STEPS = [
  { id: 1, label: 'Upload', sub: 'Step 1 of 5 — Upload your ID photos' },
  { id: 2, label: 'Role', sub: 'Step 2 of 5 — Your relationship to CSUCC' },
  { id: 3, label: 'Scanning', sub: 'Step 3 of 5 — Scanning your documents' },
  { id: 4, label: 'Review', sub: 'Step 4 of 5 — Review extracted information' },
  { id: 5, label: 'Confirm', sub: 'Step 5 of 5 — Confirm & register vehicle' }
];

// ── PROFESSIONAL SVG ICONS ──
const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const IconSpinner = () => (
  <svg
    className="loading-spinner"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      animation: 'sp 1s linear infinite',
      display: 'inline-block',
      flexShrink: 0
    }}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
  </svg>
);

const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const IconPencil = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
  </svg>
);

const IconRotate = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6"></path>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
  </svg>
);

export default function OCRScanModal({ onClose, onConfirm, onManualInput, onNavigateLogin }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [frontPrev, setFrontPrev] = useState(null);
  const [backPrev, setBackPrev] = useState(null);

  // Scanned side statuses: 'waiting', 'scanning', 'captured'
  const [frontScanStatus, setFrontScanStatus] = useState('waiting');
  const [backScanStatus, setBackScanStatus] = useState('waiting');

  // Pre-validation state (between step 1 and 2)
  const [isPreValidating, setIsPreValidating] = useState(false);
  const [preValidationStep, setPreValidationStep] = useState('');

  // Draggable state
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const modalRef = useRef(null);

  // Scanning state
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStepText, setScanStepText] = useState('Initializing scan engine...');
  const [checklist, setChecklist] = useState([
    { id: 'upload', text: 'Document upload', status: 'pending' },
    { id: 'front', text: 'Front side scan', status: 'pending' },
    { id: 'back', text: 'Back side scan', status: 'pending' },
    { id: 'validate', text: 'Field validation', status: 'pending' },
    { id: 'summary', text: 'Summary preparation', status: 'pending' }
  ]);

  // Results state
  const [scannedData, setScannedData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    sex: '',
    nationality: '',
    birthDate: '',
    address: '',
    licenseNumber: '',
    plateNumber: '',
    expiryDate: ''
  });
  const [confidence, setConfidence] = useState({});
  const [scanMeta, setScanMeta] = useState({ scanId: '', rawText: '' });
  const [error, setError] = useState(null);
  const [isValidationError, setIsValidationError] = useState(false);

  // Duplicate detection state
  const [duplicateCheck, setDuplicateCheck] = useState({ loading: false, hasDuplicates: false, duplicates: [] });

  // Pre-scan data (full extraction done during Step 1 pre-validation)
  const [preScanData, setPreScanData] = useState(null);

  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);
  const [activeDragSlot, setActiveDragSlot] = useState(null); // 'front', 'back', or null

  const OCR_SAVE_KEY = 'campus_anpr_ocr_state';
  const REFRESH_TTL = 5 * 60 * 1000; // 5 mins

  // Persistence: Restore on mount
  useEffect(() => {
    const saved = localStorage.getItem(OCR_SAVE_KEY);
    if (saved) {
      try {
        const { 
          currentStep: savedStep, 
          scannedData: savedData, 
          selectedRole: savedRole, 
          confidence: savedConf, 
          scanMeta: savedMeta, 
          timestamp 
        } = JSON.parse(saved);

        if (Date.now() - timestamp < REFRESH_TTL && savedStep >= 4) {
          // Fast-forward to the Review step with saved details so they don't have to rescan
          setScannedData(savedData);
          setConfidence(savedConf || {});
          setScanMeta(savedMeta || { scanId: '', rawText: '' });
          setSelectedRole(savedRole);
          setCurrentStep(4);
          setScanProgress(100);
          setScanStepText('Draft safely restored from your previous session.');
          setChecklist([
            { id: 'upload', text: 'Document upload', status: 'done' },
            { id: 'front', text: 'Front side scan', status: 'done' },
            { id: 'back', text: 'Back side scan', status: 'done' },
            { id: 'validate', text: 'Field validation', status: 'done' },
            { id: 'summary', text: 'Summary preparation', status: 'done' }
          ]);
        } else {
          localStorage.removeItem(OCR_SAVE_KEY);
        }
      } catch (e) {
        localStorage.removeItem(OCR_SAVE_KEY);
      }
    }
  }, []);

  // Persistence: Save on change (Only tracks text/JSON, excludes file blobs)
  useEffect(() => {
    if (currentStep >= 4) {
      localStorage.setItem(OCR_SAVE_KEY, JSON.stringify({
        currentStep,
        scannedData,
        selectedRole,
        confidence,
        scanMeta,
        timestamp: Date.now()
      }));
    }
  }, [currentStep, scannedData, selectedRole, confidence, scanMeta]);

  // ── FILE VALIDATION ──
  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const minSize = 10 * 1024; // 10KB
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return { valid: false, message: "Invalid file type. Please upload a JPG or PNG image." };
    }
    if (file.size < minSize) {
      return { valid: false, message: "File is too small. Minimum size is 10KB." };
    }
    if (file.size > maxSize) {
      return { valid: false, message: "File is too large. Maximum size is 5MB." };
    }
    return { valid: true };
  };

  const handleFile = (side, file) => {
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (side === 'front') {
        setFrontFile(file);
        setFrontPrev(e.target.result);
      } else {
        setBackFile(file);
        setBackPrev(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const onFileChange = (e, side) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(side, e.target.files[0]);
    }
  };

  // ── DRAG & DROP HANDLERS ──
  const onDragOver = (e, slot) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDragSlot(slot);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDragSlot(null);
  };

  const onDrop = (e, slot) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDragSlot(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(slot, e.dataTransfer.files[0]);
    }
  };

  // ── DRAG LOGIC ──
  const handleMouseDown = (e) => {
    if (e.target.closest('.header-close')) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - offset.x,
      y: e.clientY - offset.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setOffset({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // ── CLOSE PREVENTION ──
  const tryClose = () => {
    if (currentStep > 1 && currentStep < 5) {
      if (!window.confirm("Scanning or selection is in progress. Are you sure you want to cancel?")) {
        return;
      }
    } else if (frontFile && currentStep === 1) {
      if (!window.confirm("You have uploaded files. Cancel and clear them?")) {
        return;
      }
    }
    onClose();
  };

  const handlePreValidate = async () => {
    if (!frontFile || !backFile) return;
    
    setIsPreValidating(true);
    setPreValidationStep('Connecting to engine...');
    setError(null);
    setDuplicateCheck({ loading: false, hasDuplicates: false, duplicates: [] });
    setPreScanData(null);

    const formData = new FormData();
    formData.append('front', frontFile);
    formData.append('back', backFile);

    try {
      const response = await fetch('http://localhost:8000/api/v1/ocr/scan-id-stream', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Could not connect to OCR engine');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let validationPassed = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          
          try {
            const data = JSON.parse(line.replace('data: ', ''));
            if (data.type === 'progress') {
              const msg = data.message;
              
              if (msg.includes('Processing Front ID')) {
                setPreValidationStep('Analyzing front side...');
              } else if (msg.includes('Validation Passed')) {
                validationPassed = true;
                setPreValidationStep('✓ Valid License — Extracting data...');
                // Continue stream — don't cancel, we need full extraction
              } else if (msg.includes('Validation Failed')) {
                setPreValidationStep(`✗ Validation Failed: ${msg.split(': ')[1] || 'Invalid ID'}`);
                reader.cancel();
                setIsPreValidating(false);
                return;
              } else if (validationPassed) {
                // Show extraction progress after validation passed
                if (msg.includes('Extracted') && msg.includes('front')) {
                  setPreValidationStep('✓ Front captured — Scanning back...');
                } else if (msg.includes('Processing Back ID')) {
                  setPreValidationStep('Scanning back side...');
                } else if (msg.includes('Extracted') && msg.includes('back')) {
                  setPreValidationStep('✓ Both sides captured — Parsing...');
                } else if (msg.includes('Parsing')) {
                  setPreValidationStep('Parsing extracted fields...');
                } else if (msg.includes('Filled')) {
                  setPreValidationStep('✓ Fields parsed — Verifying identity...');
                }
              } else {
                setPreValidationStep(msg);
              }
            } else if (data.type === 'result') {
              // Full extraction complete — store data
              const result = data.data;
              setPreScanData(result);
              setScannedData(prev => ({ ...prev, ...result.data }));
              setConfidence(result.confidence || {});
              setScanMeta({ scanId: result.scan_id || '', rawText: result.rawText || '' });

              // Now check for duplicates in the database
              setPreValidationStep('Checking registration database...');
              try {
                const resp = await fetch(`${API_BASE}/auth/check-duplicate`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    licenseNumber: result.data?.licenseNumber || '',
                    firstName: result.data?.firstName || '',
                    lastName: result.data?.lastName || '',
                  })
                });
                if (resp.ok) {
                  const dupResult = await resp.json();
                  if (dupResult.hasDuplicates) {
                    const dup = dupResult.duplicates[0];
                    setPreValidationStep(`🚫 ${dup.existingUser} is already registered`);
                    setDuplicateCheck({ loading: false, hasDuplicates: true, duplicates: dupResult.duplicates });
                    setIsPreValidating(false);
                    return; // Stay on Step 1, show duplicate warning
                  }
                }
              } catch (e) {
                console.error('Duplicate check failed:', e);
              }

              // No duplicates — proceed to Step 2
              setDuplicateCheck({ loading: false, hasDuplicates: false, duplicates: [] });
              setPreValidationStep('✓ Identity verified — No existing records');
              await sleep(800);
              setIsPreValidating(false);
              setCurrentStep(2);
              return;
            } else if (data.type === 'error') {
               setPreValidationStep(`✗ ${data.message}`);
               reader.cancel();
               setIsPreValidating(false);
               return;
            }
          } catch (e) {
            console.error('Error parsing validation stream:', e);
          }
        }
      }
    } catch (err) {
      setPreValidationStep(`✗ Error: ${err.message}`);
      setIsPreValidating(false);
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (preScanData) {
      // Data already extracted during pre-validation — skip Step 3 entirely
      setScanProgress(100);
      setScanStepText('Data restored from pre-scan.');
      setChecklist([
        { id: 'upload', text: 'Document upload', status: 'done' },
        { id: 'front', text: 'Front side scan', status: 'done' },
        { id: 'back', text: 'Back side scan', status: 'done' },
        { id: 'validate', text: 'Field validation', status: 'done' },
        { id: 'summary', text: 'Summary preparation', status: 'done' }
      ]);
      setFrontScanStatus('captured');
      setBackScanStatus('captured');
      setCurrentStep(4); // Jump straight to Review
    } else {
      startScan();
    }
  };

  const startScan = async () => {
    if (!frontFile || !backFile) return;

    setCurrentStep(3);
    setScanProgress(0);
    setScanStepText('Initializing real-time scan engine...');

    // Reset statuses
    setChecklist(prev => prev.map(item => ({ ...item, status: 'pending' })));
    setFrontScanStatus('waiting');
    setBackScanStatus('waiting');

    const formData = new FormData();
    formData.append('front', frontFile);
    formData.append('back', backFile);

    try {
      const response = await fetch('http://localhost:8000/api/v1/ocr/scan-id-stream', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Connection to scan engine failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Checklist mapping
      updateChecklist('upload', 'progress');
      setScanProgress(10);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          
          try {
            const data = JSON.parse(line.replace('data: ', ''));
            
            if (data.type === 'progress') {
              const msg = data.message;
              setScanStepText(msg);

              // Map messages to UI updates
              if (msg.includes('Processing Front ID')) {
                updateChecklist('upload', 'done');
                updateChecklist('front', 'progress');
                setFrontScanStatus('scanning');
                setScanProgress(25);
              } else if (msg.includes('Extracted') && msg.includes('front')) {
                updateChecklist('front', 'done');
                setFrontScanStatus('captured');
                setScanProgress(45);
              } else if (msg.includes('Processing Back ID')) {
                updateChecklist('back', 'progress');
                setBackScanStatus('scanning');
                setScanProgress(60);
              } else if (msg.includes('Extracted') && msg.includes('back')) {
                updateChecklist('back', 'done');
                setBackScanStatus('captured');
                setScanProgress(80);
              } else if (msg.includes('Parsing extracted text')) {
                updateChecklist('validate', 'progress');
                setScanProgress(90);
              } else if (msg.includes('Filled')) {
                updateChecklist('validate', 'done');
                updateChecklist('summary', 'progress');
                setScanProgress(95);
              }
            } else if (data.type === 'result') {
              const result = data.data;
              updateChecklist('summary', 'done');
              setScanProgress(100);
              setScanStepText('Scan complete! Data extracted.');
              
              setScannedData(prev => ({ ...prev, ...result.data }));
              setConfidence(result.confidence || {});
              setScanMeta({
                scanId: result.scan_id || '',
                rawText: result.rawText || ''
              });

              // Auto-check for duplicates
              checkForDuplicates(result.data);
              
              setTimeout(() => setCurrentStep(4), 1200);
            } else if (data.type === 'error') {
                throw new Error(data.message);
            }
          } catch (e) {
            console.error('Error parsing stream chunk:', e);
          }
        }
      }
    } catch (err) {
      setError(err.message);
      setScanStepText(`Error: ${err.message}`);
      if (err.message.includes("Philippine Driver's License") || err.message.includes("Valid Driver's License")) {
        setIsValidationError(true);
      }
    }
  };

  const sleep = (ms) => new Promise(res => setTimeout(res, ms));

  const updateChecklist = (id, status) => {
    setChecklist(prev => prev.map(item =>
      item.id === id ? { ...item, status } : item
    ));
  };

  const handleFieldChange = (field, value) => {
    setScannedData(prev => ({ ...prev, [field]: value }));
  };

  // ── DUPLICATE CHECK ──
  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:8000/api/v1';

  const checkForDuplicates = async (data) => {
    if (!data) return;
    setDuplicateCheck({ loading: true, hasDuplicates: false, duplicates: [] });
    try {
      const resp = await fetch(`${API_BASE}/auth/check-duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseNumber: data.licenseNumber || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
        })
      });
      if (resp.ok) {
        const result = await resp.json();
        setDuplicateCheck({ loading: false, hasDuplicates: result.hasDuplicates, duplicates: result.duplicates || [] });
      } else {
        setDuplicateCheck({ loading: false, hasDuplicates: false, duplicates: [] });
      }
    } catch (e) {
      console.error('Duplicate check failed:', e);
      setDuplicateCheck({ loading: false, hasDuplicates: false, duplicates: [] });
    }
  };

  // ── STEP 1: UPLOAD RENDER ──
  const renderUpload = () => (
    <div className="proc-panel">
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '42px', marginBottom: '14px' }}>📋</div>
        <h3 className="upload-title" style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'Syne, sans-serif' }}>Select ID Documents</h3>
        <p className="upload-sub" style={{ fontSize: '13px', color: 'var(--text-tertiary)', maxWidth: '300px', margin: '0 auto' }}>
          Please upload clear photos of both sides of your Driver's License
        </p>
      </div>

      <input
        type="file"
        ref={frontInputRef}
        onChange={(e) => onFileChange(e, 'front')}
        accept=".jpg,.jpeg,.png"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={backInputRef}
        onChange={(e) => onFileChange(e, 'back')}
        accept=".jpg,.jpeg,.png"
        style={{ display: 'none' }}
      />

      <div className="upload-grid">
        <UploadSlot
          label="FRONT OF ID"
          file={frontFile}
          preview={frontPrev}
          isDragging={activeDragSlot === 'front'}
          onClick={() => frontInputRef.current.click()}
          onDragOver={(e) => onDragOver(e, 'front')}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, 'front')}
        />
        <UploadSlot
          label="BACK OF ID"
          file={backFile}
          preview={backPrev}
          isDragging={activeDragSlot === 'back'}
          onClick={() => backInputRef.current.click()}
          onDragOver={(e) => onDragOver(e, 'back')}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, 'back')}
        />
      </div>

      {/* Duplicate Warning — shown when user is already registered */}
      {duplicateCheck.hasDuplicates && !isPreValidating && (
        <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '2px solid rgba(239, 68, 68, 0.35)', borderRadius: '12px', padding: '14px', marginTop: '10px', animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '20px' }}>🚫</span>
            <div>
              <div style={{ color: '#ef4444', fontWeight: '800', fontSize: '14px', fontFamily: 'Syne, sans-serif' }}>Already Registered</div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>This person is already in the system. Multiple registrations are not allowed.</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {duplicateCheck.duplicates.map((dup, idx) => (
              <div key={idx} style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '8px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontWeight: '700', color: '#ef4444', fontFamily: '"IBM Plex Mono", monospace', fontSize: '12px' }}>
                    {dup.label}: {dup.value}
                  </span>
                  <span style={{ color: 'var(--text-tertiary)' }}>
                    Registered to: <strong style={{ color: 'var(--text-secondary)' }}>{dup.existingUser}</strong>
                  </span>
                </div>
                <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', background: dup.status === 'active' ? 'rgba(34, 197, 94, 0.15)' : dup.status === 'pending' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(107, 114, 128, 0.15)', color: dup.status === 'active' ? '#22c55e' : dup.status === 'pending' ? '#eab308' : '#6b7280' }}>
                  {dup.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status / Tip Bar */}
      {!duplicateCheck.hasDuplicates && (
        <div style={{ 
          background: preValidationStep.includes('✗') ? 'rgba(239, 68, 68, 0.08)' : (preValidationStep.includes('✓') ? 'rgba(34, 197, 94, 0.08)' : 'rgba(59, 130, 246, 0.06)'), 
          padding: '14px', 
          borderRadius: '12px', 
          fontSize: '11px', 
          display: 'flex', 
          gap: '10px', 
          marginTop: '10px', 
          border: `1px solid ${preValidationStep.includes('✗') ? 'rgba(239, 68, 68, 0.3)' : (preValidationStep.includes('✓') ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.12)')}`, 
          color: 'var(--text-secondary)', 
          position: 'relative', 
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}>
          <span style={{ fontSize: '14px' }}>{preValidationStep.includes('✗') ? '❌' : (preValidationStep.includes('✓') ? '✅' : '💡')}</span>
          <span style={{ flex: 1, opacity: isPreValidating ? 0 : 1 }}>
            {preValidationStep.includes('✗') ? <strong>Access Denied: </strong> : null}
            {preValidationStep.includes('✗') ? 'This document is not recognized. Please scan an official Philippine Driver\'s License.' : 'Ensure your ID is on a flat surface with good lighting. All text must be clearly readable to the AI engine.'}
          </span>
          
          {isPreValidating && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '0 14px',
              zIndex: 10,
              animation: 'fadeIn 0.2s ease-out'
            }}>
              {preValidationStep.includes('✓') ? (
                <div className="cico ci-d" style={{ width: '18px', height: '18px', flexShrink: 0 }}><IconCheck /></div>
              ) : preValidationStep.includes('✗') ? (
                <div className="cico ci-e" style={{ width: '18px', height: '18px', flexShrink: 0, color: '#ef4444' }}><IconX /></div>
              ) : (
                <IconSpinner />
              )}
              <span style={{ 
                fontWeight: '600', 
                color: preValidationStep.includes('✓') ? '#22c55e' : (preValidationStep.includes('✗') ? '#ef4444' : 'var(--text-secondary)'),
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '11px'
              }}>
                {preValidationStep}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ── STEP 2: ROLE SELECTION RENDER ──
  const renderRoleSelection = () => (
    <div className="proc-panel">
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h3 className="upload-title" style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'Syne, sans-serif' }}>Who are you?</h3>
        <p className="upload-sub" style={{ fontSize: '14px', color: 'var(--text-tertiary)', maxWidth: '400px', margin: '0 auto' }}>
          This determines your registration fields and access level
        </p>
      </div>

      <div className="role-selection-grid">
        <RoleCard
          icon="🎓"
          name="Student"
          desc="Currently enrolled at CSUCC"
          active={selectedRole === 'student'}
          onClick={() => handleRoleSelect('student')}
        />
        <RoleCard
          icon="📚"
          name="Faculty"
          desc="Teaching staff and professors"
          active={selectedRole === 'faculty'}
          onClick={() => handleRoleSelect('faculty')}
        />
        <RoleCard
          icon="🏢"
          name="Staff"
          desc="Administrative & support personnel"
          active={selectedRole === 'staff'}
          onClick={() => handleRoleSelect('staff')}
        />
        <RoleCard
          icon="🪪"
          name="Visitor"
          desc="External guest or delivery"
          active={selectedRole === 'visitor'}
          onClick={() => handleRoleSelect('visitor')}
        />
      </div>

      <div className="role-tip">
        <div className="role-tip-icon">💡</div>
        <div className="role-tip-text">
          Your role determines what fields appear in your registration. Visitors must also provide entry reason and vehicle motive.
        </div>
      </div>
    </div>
  );

  // ── STEP 3: SCANNING RENDER ──
  const renderScanning = () => (
    <div className="proc-panel">
      <div className="scan-cards">
        <ScanPreview
          label="FRONT SIDE"
          status={frontScanStatus}
          img={frontPrev}
        />
        <ScanPreview
          label="BACK SIDE"
          status={backScanStatus}
          img={backPrev}
        />
      </div>

      <div className="sbox">
        <div className="sbox-title">
          {scanProgress < 100 ? <IconSpinner /> : <div className="cico ci-d" style={{ width: '16px', height: '16px' }}><IconCheck /></div>}
          <span style={{ marginLeft: '4px' }}>{scanProgress < 100 ? 'Verifying Documents...' : 'Scan Complete'}</span>
        </div>
        <div className="prog-wrap">
          <div className="prog-fill" style={{ width: `${scanProgress}%` }} />
        </div>
        <div className="prog-row">
          <span className="prog-step">{scanStepText.length > 40 ? scanStepText.substring(0, 40) + '...' : scanStepText}</span>
          <span className="prog-pct">{Math.round(scanProgress)}%</span>
        </div>

        <div className="checklist">
          {checklist.map(item => (
            <div key={item.id} className="crow">
              <div className={`cico ci-${item.status === 'done' ? 'd' : item.status === 'progress' ? 's' : 'w'}`}>
                {item.status === 'done' ? <IconCheck /> : item.status === 'progress' ? <IconSpinner /> : '—'}
              </div>
              <div style={{ flex: 1 }}>
                <div className={`ctxt ${item.status === 'pending' ? 'mu' : ''}`}>
                  {item.text}
                </div>
                {item.status === 'progress' && (
                  <div style={{ fontSize: '10px', color: '#3b82f6', fontFamily: '"IBM Plex Mono", monospace', marginTop: '4px', lineHeight: '1.4', maxWidth: '360px' }}>
                    {scanStepText}
                  </div>
                )}
              </div>
              <span className={`cbadge cb-${item.status === 'done' ? 'd' : item.status === 'progress' ? 's' : 'w'}`}>
                {item.status === 'done' ? 'Done' : item.status === 'progress' ? 'In progress' : 'Waiting'}
              </span>
            </div>
          ))}
        </div>

        {isValidationError && (
          <div className="validation-error-overlay">
            <div className="ve-content">
              <div className="ve-icon">⚠️</div>
              <div className="ve-title">Invalid Document</div>
              <div className="ve-msg">{error}</div>
              <button className="btn btn-prim" style={{ marginTop: '20px', width: '100%' }} onClick={() => {
                setIsValidationError(false);
                setError(null);
                setCurrentStep(1);
                setScanProgress(0);
                setScanStepText('Initializing scan engine...');
                setChecklist(checklist.map(i => ({ ...i, status: 'pending' })));
              }}>
                <IconRotate /> Try Different Photos
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="ocr-process-overlay">
      <div
        ref={modalRef}
        className="ocr-process-modal"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.15s ease-out'
        }}
      >
        <div className="ocr-proc-header" onMouseDown={handleMouseDown}>
          <div className="header-l">
            <div className="header-icon">🪪</div>
            <div>
              <div className="header-title">Scan Driver's License</div>
              <div className="header-sub">{STEPS.find(s => s.id === currentStep).sub}</div>
            </div>
          </div>
          <button className="header-close" onClick={tryClose}><IconX /></button>
        </div>

        <div className="steps-bar">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="proc-step-wrapper">
              <div className="proc-step">
                <div className={`sc-circle ${currentStep > s.id ? 'done' : currentStep === s.id ? 'active' : 'pending'}`}>
                  {currentStep > s.id ? <IconCheck /> : s.id}
                </div>
                <div className={`sl-label ${currentStep > s.id ? 'done' : currentStep === s.id ? 'active' : 'pending'}`}>
                  {s.label}
                </div>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="connector">
                  <div className="conn-fill" style={{ width: currentStep > s.id ? '100%' : '0%' }} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="proc-body">
          {currentStep === 1 && renderUpload()}
          {currentStep === 2 && renderRoleSelection()}
          {currentStep === 3 && renderScanning()}
          {currentStep === 4 && renderReview(scannedData, handleFieldChange, confidence, duplicateCheck)}
          {currentStep === 5 && renderConfirm(scannedData, handleFieldChange, confidence)}
        </div>

        <div className="ocr-proc-footer">
          <div className="f-info">
            <div className="f-dot" />
            <div className="f-text">
              {currentStep === 1 ? (duplicateCheck.hasDuplicates ? '⚠ Registration blocked — duplicate found' : (isPreValidating ? 'Scanning & verifying identity...' : 'Ready to process your documents')) :
                currentStep === 2 ? 'Select your role to continue' :
                  currentStep === 3 ? `Engine processing... ${scanProgress}%` :
                    currentStep === 4 ? 'Review and correct extracted data' : 'Final confirmation'}
            </div>
          </div>
          <div className="f-actions">
            <button className="btn btn-ghost" onClick={tryClose}>
              <IconX /> Cancel
            </button>
            {currentStep === 1 && (
              <>
                {duplicateCheck.hasDuplicates ? (
                  <>
                    <button className="btn btn-sec" onClick={() => { setDuplicateCheck({ loading: false, hasDuplicates: false, duplicates: [] }); setPreScanData(null); setPreValidationStep(''); }}>
                      <IconRotate /> Re-scan
                    </button>
                    <button
                      className="btn btn-prim"
                      onClick={() => { onClose(); if (onNavigateLogin) onNavigateLogin(); }}
                      style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
                    >
                      🔑 Go to Login
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-sec" onClick={onManualInput} disabled={isPreValidating}>
                      <IconPencil /> Manually
                    </button>
                    <button 
                      className="btn btn-prim" 
                      onClick={handlePreValidate} 
                      disabled={!frontFile || !backFile || isPreValidating}
                    >
                      {isPreValidating ? <><IconSpinner /> Scanning...</> : 'Next →'}
                    </button>
                  </>
                )}
              </>
            )}
            {currentStep === 2 && (
              <div style={{ color: 'var(--text-tertiary)', fontSize: '11px', fontWeight: '500' }}>
                Select a role to start automatic scanning
              </div>
            )}
            {currentStep === 4 && (
              <>
                <button className="btn btn-sec" onClick={() => setCurrentStep(1)}>
                  <IconRotate /> Re-scan
                </button>
                {duplicateCheck.loading ? (
                  <button className="btn btn-prim" disabled>
                    <IconSpinner /> Checking...
                  </button>
                ) : duplicateCheck.hasDuplicates ? (
                  <button
                    className="btn btn-prim"
                    onClick={() => { onClose(); if (onNavigateLogin) onNavigateLogin(); }}
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
                  >
                    🔑 Go to Login
                  </button>
                ) : (
                  <button className="btn btn-prim" onClick={() => setCurrentStep(5)}>
                    Confirm Data →
                  </button>
                )}
              </>
            )}
            {currentStep === 5 && (
              <button className="btn btn-prim" onClick={() => {
                localStorage.removeItem('campus_anpr_ocr_state'); // Clear cache on finish
                onConfirm({
                  ...scannedData,
                  role: selectedRole,
                  frontFile,
                  backFile,
                  scanId: scanMeta.scanId,
                  rawText: scanMeta.rawText,
                  confidence
                });
                onClose();
              }}>
                <IconCheck /> Proceed →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── EXTRACTED FIELD RENDERERS ──

// ── ROLE CARD COMPONENT ──
function RoleCard({ icon, name, desc, active, onClick }) {
  return (
    <div className={`role-card ${active ? 'active' : ''}`} onClick={onClick}>
      <div className="role-icon-wrap">{icon}</div>
      <div className="role-name">{name}</div>
      <div className="role-desc">{desc}</div>
    </div>
  );
}

// ── EXTRACTED FIELD RENDERERS ──

function renderReview(scannedData, onFieldChange, confidence, duplicateCheck) {
  return (
    <div className="proc-panel" style={{ padding: '20px' }}>
      {/* Duplicate Warning Banner */}
      {duplicateCheck && duplicateCheck.loading && (
        <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '12px', padding: '12px', display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
          <IconSpinner />
          <div>
            <div style={{ color: '#3b82f6', fontWeight: '700', fontSize: '13px', fontFamily: 'Syne, sans-serif' }}>Checking Database...</div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Verifying this license hasn't been registered before.</div>
          </div>
        </div>
      )}

      {duplicateCheck && duplicateCheck.hasDuplicates && !duplicateCheck.loading && (
        <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '2px solid rgba(239, 68, 68, 0.35)', borderRadius: '12px', padding: '14px', marginBottom: '16px', animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '20px' }}>🚫</span>
            <div>
              <div style={{ color: '#ef4444', fontWeight: '800', fontSize: '14px', fontFamily: 'Syne, sans-serif' }}>Duplicate Record Detected</div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>This person is already registered in the system. Multiple registrations are not allowed.</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {duplicateCheck.duplicates.map((dup, idx) => (
              <div key={idx} style={{
                background: 'rgba(239, 68, 68, 0.06)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: '8px',
                padding: '10px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '11px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontWeight: '700', color: '#ef4444', fontFamily: '"IBM Plex Mono", monospace', fontSize: '12px' }}>
                    {dup.label}: {dup.value}
                  </span>
                  <span style={{ color: 'var(--text-tertiary)' }}>
                    Already registered to: <strong style={{ color: 'var(--text-secondary)' }}>{dup.existingUser}</strong>
                  </span>
                </div>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: dup.status === 'active' ? 'rgba(34, 197, 94, 0.15)' : dup.status === 'pending' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                  color: dup.status === 'active' ? '#22c55e' : dup.status === 'pending' ? '#eab308' : '#6b7280'
                }}>
                  {dup.status}
                </span>
              </div>
            ))}
          </div>
          {/* Go to Login Button */}
          <button
            onClick={() => { onClose(); if (onNavigateLogin) onNavigateLogin(); }}
            style={{
              marginTop: '12px',
              width: '100%',
              padding: '10px 16px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              color: '#fff',
              fontWeight: '700',
              fontSize: '13px',
              fontFamily: 'Syne, sans-serif',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)'
            }}
          >
            🔑 Already Registered? Go to Login
          </button>
        </div>
      )}

      {/* Success banner — only show when no duplicates */}
      {(!duplicateCheck || (!duplicateCheck.hasDuplicates && !duplicateCheck.loading)) && (
        <div style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '12px', padding: '12px', display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div className="cico ci-d"><IconCheck /></div>
          <div>
            <div style={{ color: '#22c55e', fontWeight: '700', fontSize: '14px', fontFamily: 'Syne, sans-serif' }}>Scan Successful — No Duplicates Found</div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Review and fix any extraction errors below if necessary.</div>
          </div>
        </div>
      )}

      <div style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: '8px' }}>
        <SectionHeader title="Personal Information" />
        <EditableFieldRow label="First Name" field="firstName" value={scannedData?.firstName} conf={confidence?.firstName || 0} onChange={onFieldChange} />
        <EditableFieldRow label="Last Name" field="lastName" value={scannedData?.lastName} conf={confidence?.lastName || 0} onChange={onFieldChange} />
        <EditableFieldRow label="Middle Name" field="middleName" value={scannedData?.middleName} conf={confidence?.middleName || 0} onChange={onFieldChange} />
        <EditableFieldRow label="Sex" field="sex" value={scannedData?.sex} conf={confidence?.sex || 0} onChange={onFieldChange} />
        <EditableFieldRow label="Nationality" field="nationality" value={scannedData?.nationality} conf={confidence?.nationality || 0} onChange={onFieldChange} />
        <EditableFieldRow label="Date of Birth" field="birthDate" value={scannedData?.birthDate} conf={confidence?.birthDate || 0} onChange={onFieldChange} />
        <EditableFieldRow label="Home Address" field="address" value={scannedData?.address} conf={confidence?.address || 0} onChange={onFieldChange} />

        <SectionHeader title="Document Details" />
        <EditableFieldRow label="License No." field="licenseNumber" value={scannedData?.licenseNumber} conf={confidence?.licenseNumber || 0} onChange={onFieldChange} />
        <EditableFieldRow label="Serial Number" field="plateNumber" value={scannedData?.plateNumber} conf={confidence?.serialNumber || confidence?.plateNumber || 0} onChange={onFieldChange} />
        <EditableFieldRow label="Expiry Date" field="expiryDate" value={scannedData?.expiryDate} conf={confidence?.expiryDate || 0} onChange={onFieldChange} />
      </div>
    </div>
  );
}

const EditableFieldRow = ({ label, field, value, conf, onChange }) => {
  const displayConf = conf <= 1 ? Math.round(conf * 100) : Math.round(conf);

  return (
    <div className="fr">
      <div className="fk">{label}</div>
      <div className="fv" style={{ padding: '0' }}>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(field, e.target.value)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: '11px',
            fontFamily: '"IBM Plex Mono", monospace',
            padding: '4px 0',
            outline: 'none'
          }}
          placeholder="..."
        />
      </div>
      <div className={`chip ${displayConf < 85 ? 'chw' : 'chi'}`}>{displayConf || 0}%</div>
    </div>
  );
};

function renderConfirm(scannedData, onFieldChange, confidence) {
  const confValues = Object.values(confidence || {});
  const avgConf = confValues.length > 0 
    ? (confValues.reduce((a, b) => a + (b <= 1 ? b * 100 : b), 0) / confValues.length).toFixed(1)
    : 0;

  return (
    <div className="proc-panel">
      <div className="confirm-card" style={{ border: '2px solid rgba(34, 197, 94, 0.3)', background: 'linear-gradient(to bottom, rgba(34,197,94,0.05), transparent)' }}>
        <div style={{ fontSize: '36px', marginBottom: '10px' }}>🚗</div>
        <div style={{ fontWeight: '800', color: '#22c55e', fontSize: '18px', fontFamily: 'Syne, sans-serif' }}>Ready to Register</div>

        <div className="confirm-plate-wrap" style={{ margin: '14px 0' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.05em' }}>
            SERIAL NUMBER
          </div>
          <input
            type="text"
            className="confirm-plate-input"
            value={scannedData?.plateNumber || ''}
            onChange={(e) => onFieldChange('plateNumber', e.target.value)}
            placeholder="ENTER SERIAL"
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '24px',
              fontWeight: '800',
              color: 'var(--text-primary)',
              background: 'var(--bg-tertiary)',
              border: '2px solid var(--border-color)',
              borderRadius: '8px',
              padding: '12px 24px',
              textAlign: 'center',
              width: '220px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              outline: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          />
          <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '8px', fontWeight: '600' }}>
            CLICK TO EDIT IF INCORRECT
          </div>
        </div>

        <div className="confirm-details">
          <DetailBox label="Owner" value={`${scannedData?.lastName}, ${scannedData?.firstName}`} />
          <DetailBox label="License No." value={scannedData?.licenseNumber} />
          <DetailBox label="ID Validity" value={scannedData?.expiryDate} />
          <DetailBox label="Conf. Score" value={`${avgConf}%`} />
        </div>
      </div>
    </div>
  );
}

// ── SHARED UI COMPONENTS ──

const UploadSlot = ({ label, file, preview, isDragging, onClick, onDragOver, onDragLeave, onDrop }) => (
  <div
    className={`upload-slot ${file ? 'has-file' : ''} ${isDragging ? 'is-dragging' : ''}`}
    onClick={onClick}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onDrop={onDrop}
  >
    <div className="slot-check">{file ? <IconCheck /> : ''}</div>
    {preview ? (
      <>
        <img src={preview} className="slot-preview" alt="Preview" />
        <div className="slot-name" style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {file.name}
        </div>
      </>
    ) : (
      <>
        <div style={{ fontSize: '32px', transition: 'transform 0.2s', transform: isDragging ? 'scale(1.1)' : 'scale(1)' }}>
          {isDragging ? '📥' : '🪪'}
        </div>
        <div className="sl-label" style={{ color: isDragging ? 'var(--blue)' : 'var(--text-tertiary)', marginTop: '6px', fontWeight: isDragging ? '700' : '500' }}>
          {isDragging ? 'Drop Image Here' : label}
        </div>
      </>
    )}
  </div>
);

const ScanPreview = ({ label, status, img }) => {
  const isScanning = status === 'scanning';
  const isCaptured = status === 'captured';

  return (
    <div className="scan-preview-wrapper">
      <div className="scan-slot-lbl">
        {label}
        <span className={`sbadge ${isCaptured ? 'sb-done' : isScanning ? 'sb-scan' : 'sb-wait'}`}>
          {isCaptured ? <><IconCheck /> CAPTURED</> :
            isScanning ? <><IconSpinner /> SCANNING</> :
              <>WAITING</>}
        </span>
      </div>
      <div className={`id-frame ${isCaptured ? 'done-frame' : isScanning ? 'scan-frame' : 'wait-frame'}`} style={{ height: '110px' }}>
        {img ? <img src={img} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="ID" /> :
          <div className="id-placeholder">NO IMAGE</div>}
        {isScanning && <div className="scan-line-anim" />}
      </div>
    </div>
  );
};

const SectionHeader = ({ title }) => (
  <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.12em', paddingTop: '12px', paddingBottom: '6px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px', fontFamily: 'Syne, sans-serif' }}>
    {title}
  </div>
);

const FieldRow = ({ label, value, conf, isHi, isWarn }) => {
  const displayConf = conf <= 1 ? Math.round(conf * 100) : Math.round(conf);

  return (
    <div className="fr">
      <div className="fk"><div style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--text-tertiary)' }} /> {label}</div>
      <div className={`fv ${isHi ? 'hi' : ''}`} style={{ color: isWarn ? 'var(--color-warning)' : 'inherit' }}>{value || '—'}</div>
      <div className={`chip ${isWarn ? 'chw' : 'chi'}`}>{displayConf || 85}%</div>
    </div>
  );
};

const DetailBox = ({ label, value }) => (
  <div className="cd-box">
    <div className="cd-label">{label}</div>
    <div className="cd-val">{value || '—'}</div>
  </div>
);

OCRScanModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onManualInput: PropTypes.func.isRequired,
  onNavigateLogin: PropTypes.func
};
