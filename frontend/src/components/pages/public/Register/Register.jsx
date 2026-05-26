import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useNotification } from '../../../../contexts/NotificationContext';
import '../../../../assets/css/pages/Register/index.css';

// Step Components
import OwnerInfoStep from './steps/OwnerInfoStep';
import VehicleDetailsStep from './steps/VehicleDetailsStep';
import ReviewStep from './steps/ReviewStep';
import OCRScanModal from './modals/OCRScanModal';
import QRCodeModal from './modals/QRCodeModal';
import TermsModal from './modals/TermsModal';

const STEPS = [
  { number: 1, title: 'Owner Info', label: 'UPLOAD' },
  { number: 2, title: 'Vehicle', label: 'VEHICLE' },
  { number: 3, title: 'Review', label: 'REVIEW' }
];

const ANPR_ANOMALIES = {
  'ABC1234': 'This vehicle was previously flagged for a minor parking violation (Overstaying).',
  'XYZ5678': 'This vehicle is currently on the "Watch List" for unauthorized entry attempts.',
  'MMN999': 'Anomaly detected: This plate is linked to a different vehicle model in our database.',
  'BAD111': 'Warning: This vehicle has 3+ unpaid campus violation tickets.',
  'TST000': 'System Test Case: Anomaly detected for demonstration purposes.'
};

const SAVE_KEY = 'campus_anpr_reg_state';
const REFRESH_TTL = 5 * 60 * 1000; // 5 minutes

// Calculate overall progress percentage
const calculateProgress = (step, completedSteps) => {
  const totalSteps = 3;
  const completedCount = completedSteps.length;
  // Each step is worth ~33%, current step adds partial progress
  return Math.round((completedCount / totalSteps) * 100);
};

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toggleTheme, isDark } = useTheme();
  const { success, error: showError } = useNotification();

  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Date.now() - parsed.timestamp < REFRESH_TTL) return parsed.currentStep || 1;
      } catch (e) {}
    }
    return 1;
  });

  const [completedSteps, setCompletedSteps] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);

  // Terms and Conditions gate — must accept EVERY visit (not persisted)
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsGate, setShowTermsGate] = useState(true);

  // OCR Modal States - auto-open on mount unless we are restoring a session
  const [showScanModal, setShowScanModal] = useState(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Date.now() - parsed.timestamp < REFRESH_TTL) return false;
      } catch (e) {}
    }
    return true;
  });

  const [scannedData, setScannedData] = useState(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Date.now() - parsed.timestamp < REFRESH_TTL) return parsed.savedScannedData || null;
      } catch (e) {}
    }
    return null;
  });

  const [ocrScanPayload, setOcrScanPayload] = useState(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Date.now() - parsed.timestamp < REFRESH_TTL) return parsed.savedOcrPayload || null;
      } catch (e) {}
    }
    return null;
  });

  // Form Data
  const [formData, setFormData] = useState(() => {
    const initialState = {
      // Owner Info
      firstName: '',
      middleName: '', 
      lastName: '',
      sex: '', 
      nationality: '', 
      birthDate: '', 
      email: '',
      phone: '',
      idNumber: '', 
      expirationDate: '', 
      address: '',
      relationship: '',
      driverLicense: null,
      driverLicenseBack: null,
      password: '',
      confirmPassword: '',

      // Vehicle Details
      vehicleType: 'car',
      otherVehicleType: '', 
      plateNumber: '',
      brand: '',
      color: '',

      // Role Specific Fields - Student
      studentId: '',
      course: '',
      yearLevel: '',
      section: '',

      // Role Specific Fields - Faculty
      facultyId: '',
      department: '',
      position: '',
      employmentType: '',

      // Role Specific Fields - Staff
      staffId: '',
      staffDepartment: '',
      jobTitle: '',
      employmentStatus: '', 

      // Role Specific Fields - Visitor
      visitorPurpose: '',
      visitorHost: '',
      visitorReason: '',
      visitorValidId: '',
      visitorDate: '',
      visitorDuration: '',
      entryMotive: '',

      // ANPR Status
      anprFlagged: false,
      anprFlagMsg: '',

      // Terms (always true since accepted upfront)
      acceptTerms: true,

      // OR/CR Upload (Optional)
      orcrFile: null
    };

    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Date.now() - parsed.timestamp < REFRESH_TTL) {
          return { ...initialState, ...parsed.formData };
        } else {
          localStorage.removeItem(SAVE_KEY);
        }
      } catch (e) {
        localStorage.removeItem(SAVE_KEY);
      }
    }
    return initialState;
  });

  const [errors, setErrors] = useState({});

  const fileToDataUrl = (file) => new Promise((resolve) => {
    if (!file) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result || null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });

  // Pre-fill plate from security dashboard (?plate=...)
  useEffect(() => {
    const plate = searchParams.get('plate');
    if (!plate) return;
    const decoded = decodeURIComponent(plate).trim();
    if (!decoded) return;
    setFormData(prev => ({ ...prev, plateNumber: decoded.toUpperCase() }));
  }, [searchParams]);

  // Initial prompt for restore success
  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Date.now() - parsed.timestamp < REFRESH_TTL) {
          success('Your registration draft was securely restored.');
        }
      } catch (e) {}
    }
  }, []);

  // Persistence: Save on change (Delete after 5 minutes timeout automatically via timestamp verification)
  useEffect(() => {
    // Exclude File objects because JSON.stringify fails on Blobs/Files
    const { driverLicense, driverLicenseBack, orcrFile, ...dataToSave } = formData;
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      formData: dataToSave,
      currentStep,
      savedOcrPayload: ocrScanPayload,
      savedScannedData: scannedData,
      timestamp: Date.now()
    }));
  }, [formData, currentStep, ocrScanPayload, scannedData]);

  // Live Inactivity Timeout: Clear session if idle for 5 minutes
  const idleTimeoutRef = useRef(null);
  
  useEffect(() => {
    const clearSessionOnIdle = () => {
      localStorage.removeItem(SAVE_KEY);
      window.location.reload();
    };

    const resetIdleTimer = () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = setTimeout(clearSessionOnIdle, 5 * 60 * 1000); // 5 minutes
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(evt => window.addEventListener(evt, resetIdleTimer));
    resetIdleTimer();

    return () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      events.forEach(evt => window.removeEventListener(evt, resetIdleTimer));
    };
  }, []);

  // Handle input changes
  const updateFormData = (field, value) => {
    // Auto-capitalization for names and address
    let processedValue = value;
    if (['firstName', 'middleName', 'lastName', 'address'].includes(field) && typeof value === 'string') {
      processedValue = value.toUpperCase();
    }

    setFormData(prev => {
      const newData = { ...prev, [field]: processedValue };

      // ANPR Anomaly Check
      if (field === 'plateNumber') {
        const platUpper = processedValue.toUpperCase().replace(/\s/g, '');
        const anomalyMsg = ANPR_ANOMALIES[platUpper];
        if (anomalyMsg) {
          newData.anprFlagged = true;
          newData.anprFlagMsg = anomalyMsg;
        } else {
          newData.anprFlagged = false;
          newData.anprFlagMsg = '';
        }
      }

      return newData;
    });

    // Live validation: Clear error when user types and field is valid
    if (errors[field]) {
      const newErrors = { ...errors };

      // Basic validation rules for live feedback
      let isValid = true;
      if (typeof value === 'string' && value.trim() === '') {
        isValid = false;
      } else if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        isValid = false;
      } else if (field === 'password' && value.length < 6) {
        isValid = false;
      } else if (field === 'confirmPassword' && value !== formData.password) {
        isValid = false;
      }

      if (isValid) {
        delete newErrors[field];
        setErrors(newErrors);
      }
    }
  };

  // Validate current step
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      // Helper for repetition check
      const hasRepetition = (val) => /(.)\1\1/.test(val);
      const hasWordRepetition = (val) => /\b(\w+)\b(?:\s+\1\b)+/i.test(val);

      // Names validation
      const nameRegex = /^[A-Z\sÑñ]+$/;
      const validateName = (val, fieldName) => {
        if (!val.trim()) return `${fieldName} is required`;
        if (!nameRegex.test(val)) return `${fieldName} must only contain letters and Ñ`;
        if (hasRepetition(val)) return `${fieldName} has too many repeated characters`;
        return null;
      };

      const firstNameErr = validateName(formData.firstName, 'First name');
      if (firstNameErr) newErrors.firstName = firstNameErr;

      const lastNameErr = validateName(formData.lastName, 'Last name');
      if (lastNameErr) newErrors.lastName = lastNameErr;

      if (formData.middleName && !nameRegex.test(formData.middleName)) {
        newErrors.middleName = 'Middle name must only contain letters and Ñ';
      } else if (hasRepetition(formData.middleName)) {
        newErrors.middleName = 'Middle name has too many repeated characters';
      }
      
      // Email Validation
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else {
        const isVisitor = formData.relationship === 'visitor';
        if (isVisitor) {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
          }
        } else {
          if (!/^[a-zA-Z0-9._%+-]+@csucc\.edu\.ph$/.test(formData.email)) {
            newErrors.email = 'Use your @csucc.edu.ph email';
          }
        }
      }

      // Password Validation
      const pass = formData.password || '';
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
      if (!pass) {
        newErrors.password = 'Password is required';
      } else if (!passwordRegex.test(pass)) {
        newErrors.password = 'Password does not meet requirements';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      // Phone format: 09XX XXX XXXX (Optional)
      if (formData.phone.trim()) {
        if (!/^09\d{2}\s\d{3}\s\d{4}$/.test(formData.phone)) {
          newErrors.phone = 'Use format: 0912 345 6789';
        }
      }

      if (!formData.idNumber.trim()) newErrors.idNumber = 'ID number is required';
      
      // Address Validation
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required';
      } else if (hasRepetition(formData.address)) {
        newErrors.address = 'Address has too many repeated characters';
      } else if (hasWordRepetition(formData.address)) {
        newErrors.address = 'Address has repeated words or numbers';
      }

      if (!formData.relationship) newErrors.relationship = 'Please select your relationship';
    }

    if (step === 2) {
      if (!formData.vehicleType) newErrors.vehicleType = 'Please select a vehicle type';
      if (formData.vehicleType === 'others' && !formData.otherVehicleType.trim()) {
        newErrors.otherVehicleType = 'Please specify the vehicle type';
      }
      if (!formData.plateNumber.trim()) newErrors.plateNumber = 'Plate number is required';
      if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
      if (!formData.color.trim()) newErrors.color = 'Color is required';

      // Role Specific Validation
      if (formData.relationship === 'student') {
        if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required';
        if (!formData.course) newErrors.course = 'Course is required';
        if (!formData.yearLevel) newErrors.yearLevel = 'Year level is required';
        if (!formData.section.trim()) newErrors.section = 'Section is required';
      } else if (formData.relationship === 'faculty') {
        if (!formData.facultyId.trim()) newErrors.facultyId = 'Faculty ID is required';
        if (!formData.department.trim()) newErrors.department = 'Department is required';
        if (!formData.position.trim()) newErrors.position = 'Position is required';
        if (!formData.employmentType) newErrors.employmentType = 'Employment type is required';
      } else if (formData.relationship === 'staff') {
        if (!formData.staffId.trim()) newErrors.staffId = 'Staff ID is required';
        if (!formData.staffDepartment.trim()) newErrors.staffDepartment = 'Department is required';
        if (!formData.jobTitle.trim()) newErrors.jobTitle = 'Job title is required';
        if (!formData.employmentStatus) newErrors.employmentStatus = 'Status is required';
      } else if (formData.relationship === 'visitor') {
        if (!formData.visitorPurpose) newErrors.visitorPurpose = 'Purpose is required';
        if (!formData.visitorHost.trim()) newErrors.visitorHost = 'Host person is required';
        if (!formData.visitorReason.trim()) newErrors.visitorReason = 'Reason is required';
        if (!formData.entryMotive) newErrors.entryMotive = 'Entry motive is required';
      }
    }

    // Terms already accepted upfront — no step 3 validation needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigate between steps
  const goToStep = (step) => {
    // Can only go to completed steps or current step + 1
    if (step <= currentStep || completedSteps.includes(step - 1)) {
      setCurrentStep(step);
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Handle form submission — builds FormData for multipart upload
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(3)) return;

    setIsSubmitting(true);

    try {
      const fd = new FormData();

      // Core owner fields
      fd.append('firstName', formData.firstName);
      fd.append('lastName', formData.lastName);
      fd.append('middleName', formData.middleName || '');
      fd.append('email', formData.email);
      fd.append('phone', formData.phone || '');
      fd.append('password', formData.password);
      fd.append('address', formData.address || '');
      fd.append('relationship', formData.relationship || 'student');
      fd.append('sex', formData.sex || '');
      fd.append('nationality', formData.nationality || '');
      fd.append('birthDate', formData.birthDate || '');
      fd.append('idNumber', formData.idNumber || '');

      // Vehicle fields
      fd.append('vehicleType', formData.vehicleType || 'car');
      fd.append('otherVehicleType', formData.otherVehicleType || '');
      fd.append('plateNumber', formData.plateNumber);
      fd.append('brand', formData.brand);
      fd.append('color', formData.color || '');

      // Role-specific fields
      if (formData.studentId) fd.append('studentId', formData.studentId);
      if (formData.course) fd.append('course', formData.course);
      if (formData.yearLevel) fd.append('yearLevel', formData.yearLevel);
      if (formData.section) fd.append('section', formData.section);
      if (formData.facultyId) fd.append('facultyId', formData.facultyId);
      if (formData.department) fd.append('department', formData.department);
      if (formData.position) fd.append('position', formData.position);
      if (formData.employmentType) fd.append('employmentType', formData.employmentType);
      if (formData.staffId) fd.append('staffId', formData.staffId);
      if (formData.staffDepartment) fd.append('staffDepartment', formData.staffDepartment);
      if (formData.jobTitle) fd.append('jobTitle', formData.jobTitle);
      if (formData.employmentStatus) fd.append('employmentStatus', formData.employmentStatus);
      if (formData.visitorPurpose) fd.append('visitorPurpose', formData.visitorPurpose);
      if (formData.visitorHost) fd.append('visitorHost', formData.visitorHost);
      if (formData.visitorReason) fd.append('visitorReason', formData.visitorReason);
      if (formData.visitorValidId) fd.append('visitorValidId', formData.visitorValidId);
      if (formData.visitorDate) fd.append('visitorDate', formData.visitorDate);
      if (formData.visitorDuration) fd.append('visitorDuration', formData.visitorDuration);
      if (formData.entryMotive) fd.append('entryMotive', formData.entryMotive);

      // ANPR flags
      fd.append('anprFlagged', formData.anprFlagged ? 'true' : 'false');
      fd.append('anprFlagMsg', formData.anprFlagMsg || '');

      // OCR scan data as JSON string
      let ocrPayload = ocrScanPayload;
      if (formData.driverLicense && !ocrPayload) {
        ocrPayload = {
          scanType: 'drivers_license',
          frontImageUrl: null,
          backImageUrl: null,
          extractedData: scannedData || {},
          confidenceScore: null,
          scanId: null,
          rawText: null
        };
      }
      if (ocrPayload) {
        fd.append('ocrScanJson', JSON.stringify(ocrPayload));
      }

      // File uploads: ID Photo (Government/School ID)
      if (formData.driverLicense instanceof File) {
        fd.append('idPhoto', formData.driverLicense);
      }

      // File uploads: OR/CR (Optional)
      if (formData.orcrFile instanceof File) {
        fd.append('orcrPhoto', formData.orcrFile);
      }

      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${apiBase}/auth/register`, {
        method: 'POST',
        body: fd  // No Content-Type header — browser sets it with boundary
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Registration failed');
      }

      // Store registration result for QR modal
      setRegistrationResult({
        qrCodeBase64: result.qr_code_base64,
        fullName: `${formData.firstName} ${formData.middleName} ${formData.lastName}`.replace('  ', ' ').trim(),
        plateNumber: formData.plateNumber,
        driversLicense: formData.idNumber,
        registrationToken: result.registration_token,
      });

      localStorage.removeItem(SAVE_KEY);
      setShowQRModal(true);
      success(`Registration successful! ${result.message || ''}`);

    } catch (err) {
      console.error('Registration error:', err);
      showError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OCR scan confirmation
  const handleScanConfirm = (verifiedData) => {
    let filledCount = 0;

    setFormData(prev => {
      const newData = { ...prev };

      // Map verified data to form fields
      if (verifiedData.role) { newData.relationship = verifiedData.role; filledCount++; }
      if (verifiedData.firstName) { newData.firstName = verifiedData.firstName; filledCount++; }
      if (verifiedData.lastName) { newData.lastName = verifiedData.lastName; filledCount++; }
      if (verifiedData.middleName) { newData.middleName = verifiedData.middleName; filledCount++; }
      if (verifiedData.sex) { newData.sex = verifiedData.sex; filledCount++; }
      if (verifiedData.nationality) { newData.nationality = verifiedData.nationality; filledCount++; }
      if (verifiedData.birthDate) { newData.birthDate = verifiedData.birthDate; filledCount++; }
      if (verifiedData.address) { newData.address = verifiedData.address; filledCount++; }
      if (verifiedData.idNumber || verifiedData.licenseNumber) {
        newData.idNumber = verifiedData.idNumber || verifiedData.licenseNumber;
        filledCount++;
      }
      if (verifiedData.plateNumber) { newData.plateNumber = verifiedData.plateNumber; filledCount++; }
      if (verifiedData.expiryDate) { newData.expirationDate = verifiedData.expiryDate; filledCount++; }
      if (verifiedData.phone || verifiedData.emergencyTel) {
        newData.phone = verifiedData.phone || verifiedData.emergencyTel;
        filledCount++;
      }

      // AUTO-STORE SCANNED DOCUMENTS
      if (verifiedData.frontFile) {
        newData.driverLicense = verifiedData.frontFile;
        filledCount++;
      }
      if (verifiedData.backFile) {
        newData.driverLicenseBack = verifiedData.backFile;
      }

      return newData;
    });

    setScannedData(verifiedData || null);
    setOcrScanPayload({
      scanType: 'drivers_license',
      frontImageUrl: verifiedData?.frontFile ? null : null,
      backImageUrl: verifiedData?.backFile ? null : null,
      extractedData: verifiedData || {},
      confidenceScore: (() => {
        const values = Object.values(verifiedData?.confidence || {}).filter((v) => Number.isFinite(Number(v)));
        if (!values.length) return null;
        const avg = values.reduce((a, b) => a + Number(b), 0) / values.length;
        return Number((avg <= 1 ? avg * 100 : avg).toFixed(2));
      })(),
      scanId: verifiedData?.scanId || null,
      rawText: verifiedData?.rawText || null
    });

    setShowScanModal(false);
    success(`✓ ${filledCount} fields & documents auto-filled from your ID!`);
  };

  // If terms not accepted, show ONLY the terms modal over a minimal page
  if (!termsAccepted) {
    return (
      <div className="registration-page-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        {showTermsGate && (
          <TermsModal
            onClose={() => navigate('/login')}
            onAgree={() => {
              setTermsAccepted(true);
              setShowTermsGate(false);
              updateFormData('acceptTerms', true);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="registration-page-body">
      {/* SIDEBAR - Desktop Only */}
      <aside className="sidebar">
        <div className="sidebar-content">
          <div className="sidebar-logo">
            <div style={{ textAlign: 'right' }}>
              <div className="logo-title">CAMPUS <span>ANPR</span></div>
              <div className="logo-sub">Registration Terminal</div>
            </div>
            <div className="logo-badge">
              <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="28" height="28" rx="6" stroke="#10b981" strokeWidth="2" />
                <rect x="9" y="9" width="8" height="8" rx="1.5" fill="#10b981" />
                <rect x="19" y="9" width="8" height="8" rx="1.5" fill="#10b981" opacity="0.5" />
                <rect x="9" y="19" width="8" height="8" rx="1.5" fill="#10b981" opacity="0.5" />
                <path d="M21 23l2 2 4-4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="sidebar-nav-info">
            <div className="nav-info-tag">Overview</div>
            <h2 className="nav-info-title">Vehicle<br />Registration</h2>
            <p className="nav-info-desc">Complete these steps to authorize your vehicle for campus access.</p>
          </div>

          <div className="sidebar-features">
            <div className="feat-item">
              <div className="feat-icon">⚡</div>
              <div className="feat-text">
                <div className="feat-label">Smart Access</div>
                <div className="feat-sub">Automated gate entry</div>
              </div>
            </div>
            <div className="feat-item">
              <div className="feat-icon">🛡️</div>
              <div className="feat-text">
                <div className="feat-label">Security First</div>
                <div className="feat-sub">Real-time monitoring</div>
              </div>
            </div>
            <div className="feat-item">
              <div className="feat-icon">🔍</div>
              <div className="feat-text">
                <div className="feat-label">AI OCR Scanning</div>
                <div className="feat-sub">Fast & Accurate data entry</div>
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="footer-copyright">© 2026 ALRIGHT SERVE · CSUCC SYSTEM</div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="main">
        {/* MOBILE HEADER */}
        <div className="mobile-header">
          <div className="sidebar-logo">
            <div className="logo-badge">
              <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="28" height="28" rx="6" stroke="#10b981" strokeWidth="2" />
                <rect x="9" y="9" width="8" height="8" rx="1.5" fill="#10b981" />
                <rect x="19" y="9" width="8" height="8" rx="1.5" fill="#10b981" opacity="0.5" />
                <rect x="9" y="19" width="8" height="8" rx="1.5" fill="#10b981" opacity="0.5" />
                <path d="M21 23l2 2 4-4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="logo-title">CAMPUS <span>ANPR</span></div>
            </div>
          </div>
          <div className="mobile-header-actions">
            <Link to="/login" className="mobile-login-link">Login</Link>
            <button className="theme-toggle" onClick={toggleTheme}>
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        <div className="main-topbar">
          <div className="topbar-nav">
            <Link to="/login" className="back-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              <span>Already have an account? <strong>Login here</strong></span>
            </Link>
          </div>
          <div className="topbar-actions">
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        <div className="main-body">
          <div className="registration-card">
            <div className="reg-header">
              <div className="reg-steps-row">
                {STEPS.map((step) => (
                  <div
                    key={step.number}
                    className={`reg-step ${currentStep === step.number ? 'active' : ''} ${completedSteps.includes(step.number) ? 'done' : ''}`}
                    onClick={() => step.number <= currentStep && goToStep(step.number)}
                  >
                    <div className="reg-step-num">{step.number}</div>
                    <div className="reg-step-label">{step.title}</div>
                    {step.number < 3 && <div className="reg-step-line" />}
                  </div>
                ))}
              </div>
              <div className="progress-row">
                <span className="progress-label">Registration Progress</span>
                <span className="progress-pct">{calculateProgress(currentStep, completedSteps)}%</span>
              </div>
              <div className="progress-bar-wrap">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${calculateProgress(currentStep, completedSteps)}%` }}
                ></div>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} noValidate>
              {/* Step 1: Owner Info */}
              {currentStep === 1 && (
                <OwnerInfoStep
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                  onOpenOCR={() => setShowScanModal(true)}
                  onNext={handleNext}
                />
              )}

              {/* Step 2: Vehicle Details */}
              {currentStep === 2 && (
                <VehicleDetailsStep
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}

              {/* Step 3: Review & Submit */}
              {currentStep === 3 && (
                <ReviewStep
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                  onBack={handleBack}
                  isSubmitting={isSubmitting}
                />
              )}
            </form>
          </div>
        </div>
      </div>

      {/* QR CODE MODAL — shown after successful registration */}
      {showQRModal && registrationResult && (
        <QRCodeModal
          data={registrationResult}
          onGoToLogin={() => {
            setShowQRModal(false);
            navigate('/login');
          }}
        />
      )}

      {/* OCR SCAN MODAL */}
      {showScanModal && (
        <OCRScanModal
          onClose={() => setShowScanModal(false)}
          onConfirm={handleScanConfirm}
          onManualInput={() => setShowScanModal(false)}
          onNavigateLogin={() => navigate('/login')}
        />
      )}
    </div>
  );
}
