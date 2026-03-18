import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useNotification } from '../../../../contexts/NotificationContext';

// Step Components
import OwnerInfoStep from './steps/OwnerInfoStep';
import VehicleDetailsStep from './steps/VehicleDetailsStep';
import ReviewStep from './steps/ReviewStep';
import OCRScanModal from './modals/OCRScanModal';

const STEPS = [
  { number: 1, title: 'Owner Info' },
  { number: 2, title: 'Vehicle' },
  { number: 3, title: 'Review' }
];

// Calculate overall progress percentage
const calculateProgress = (step, completedSteps) => {
  const totalSteps = 3;
  const completedCount = completedSteps.length;
  // Each step is worth ~33%, current step adds partial progress
  return Math.round((completedCount / totalSteps) * 100);
};

export default function Register() {
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();
  const { success, error: showError } = useNotification();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // OCR Modal States - auto-open on mount
  const [showScanModal, setShowScanModal] = useState(true);
  const [scannedData, setScannedData] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    // Owner Info
    firstName: '',
    middleName: '', // Added
    lastName: '',
    sex: '', // Added
    nationality: '', // Added
    birthDate: '', // Added
    email: '',
    phone: '',
    idNumber: '', // License Number
    expirationDate: '', // License Expiration
    address: '',
    relationship: '',
    driverLicense: null,
    password: '',
    confirmPassword: '',

    // Vehicle Details
    vehicleType: '',
    plateNumber: '',
    make: '',
    model: '',
    year: '',
    color: '',
    engineNumber: '',

    // Terms
    acceptTerms: false,
    captchaInput: ''
  });

  const [errors, setErrors] = useState({});

  // Handle input changes
  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

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
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      if (!formData.password || formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!formData.idNumber.trim()) newErrors.idNumber = 'ID number is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.relationship) newErrors.relationship = 'Please select your relationship';
    }

    if (step === 2) {
      if (!formData.vehicleType) newErrors.vehicleType = 'Please select a vehicle type';
      if (!formData.plateNumber.trim()) newErrors.plateNumber = 'Plate number is required';
      if (!formData.make.trim()) newErrors.make = 'Make is required';
      if (!formData.model.trim()) newErrors.model = 'Model is required';
      if (!formData.year) newErrors.year = 'Year is required';
      if (!formData.color.trim()) newErrors.color = 'Color is required';
    }

    if (step === 3) {
      if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms';
      if (!formData.captchaInput.trim()) newErrors.captchaInput = 'Please enter the security code';
    }

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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(3)) return;

    setIsSubmitting(true);

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || '',
        email: formData.email,
        phone: formData.phone,
        idNumber: formData.idNumber,
        address: formData.address,
        relationship: formData.relationship,
        sex: formData.sex || '',
        nationality: formData.nationality || '',
        birthDate: formData.birthDate || '',
        expirationDate: formData.expirationDate || '',
        password: formData.password,
        vehicleType: formData.vehicleType,
        plateNumber: formData.plateNumber,
        make: formData.make,
        model: formData.model,
        year: formData.year || '',
        color: formData.color || '',
        engineNumber: formData.engineNumber || ''
      };

      const response = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Registration failed');
      }

      setShowSuccess(true);
      success(`Registration successful! ${result.message || 'Redirecting to login...'}`);

      setTimeout(() => {
        navigate('/login');
      }, 3000);

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

      return newData;
    });

    setShowScanModal(false);
    success(`✓ ${filledCount} fields & documents auto-filled from your ID!`);
  };

  return (
    <div className="registration-wrapper">
      {/* Premium Minimalist Sidebar */}
      <div className="registration-sidebar">
        <div className="sidebar-glass-overlay"></div>
        <div className="sidebar-content">
          <div className="sidebar-brand">
            <div className="brand-logo">
              <img src="/assets/images/anpr-logo.png" alt="ANPR" />
              <div className="logo-sparkle"></div>
            </div>
            <div className="brand-info">
              <h1>CAMPUS <span className="text-emerald">ANPR</span></h1>
              <span>Registration Terminal</span>
            </div>
          </div>

          <div className="system-overview">
            <div className="overview-section">
              <span className="section-tag">About the System</span>
              <h2>Automated License Plate Recognition</h2>
              <p>
                Campus ANPR is a high-performance security initiative designed to enhance 
                vehicular monitoring and campus safety through intelligent automation.
              </p>
            </div>

            <div className="feature-nodes">
              <div className="feature-node">
                <div className="node-icon">⚡</div>
                <div className="node-text">
                  <strong>Smart Access</strong>
                  <p>Automatic gate clearance for registered owners.</p>
                </div>
              </div>
              <div className="feature-node">
                <div className="node-icon">🛡️</div>
                <div className="node-text">
                  <strong>Enhanced Security</strong>
                  <p>Real-time vehicle identification and alerts.</p>
                </div>
              </div>
              <div className="feature-node">
                <div className="node-icon">📊</div>
                <div className="node-text">
                  <strong>Traffic Analytics</strong>
                  <p>Monitored campus entry and exit patterns.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="sidebar-footer">
            <div className="support-badge">
              <span className="pulse"></span>
              System Online & Secure
            </div>
            <div className="footer-links">
              <a href="#" className="footer-link">Support Hub</a>
              <span className="divider"></span>
              <a href="#" className="footer-link">Privacy</a>
            </div>
            <div className="footer-copyright">
              <p>© 2026 CSUCC Security Division</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="registration-main">
        {/* Top Floating Actions */}
        <div className="form-floating-actions">
          {!showScanModal && (
            <Link to="/login" className="back-to-login-btn" title="Back to Login">
              <span className="btn-icon">⬅️</span>
              <span className="btn-text">Back to Login</span>
            </Link>
          )}

          {!showScanModal && (
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          )}
        </div>

        <div className="form-container">
          <div className="form-header-mobile">
            <h2>Vehicle Registration</h2>
            <p>Create your account</p>
          </div>

          <div className="registration-card-content">
            {/* Progress Indicator */}
            <div className="progress-indicator">
              {STEPS.map((step, index) => (
                <div
                  key={step.number}
                  className={`progress-step ${currentStep === step.number ? 'active' : ''
                    } ${completedSteps.includes(step.number) ? 'completed' : ''} ${step.number <= currentStep ? 'clickable' : ''
                    }`}
                  onClick={() => step.number <= currentStep && goToStep(step.number)}
                >
                  <span className="step-number">
                    {completedSteps.includes(step.number) ? '✓' : step.number}
                  </span>
                  <span className="step-title">{step.title}</span>
                </div>
              ))}
            </div>

            {/* Overall Progress Bar */}
            <div className="overall-progress">
              <div className="progress-header">
                <span className="progress-label">Registration Progress</span>
                <span className="progress-percentage">{calculateProgress(currentStep, completedSteps)}%</span>
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{ width: `${calculateProgress(currentStep, completedSteps)}%` }}
                />
              </div>
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div className="success-message show">
                <div className="success-icon">🎉</div>
                <div className="success-content">
                  <strong>Registration Successful!</strong>
                  <p>Your vehicle is now registered. Redirecting to login...</p>
                </div>
              </div>
            )}

            {/* Registration Form */}
            <form className="registration-form" onSubmit={handleSubmit} noValidate>
              {/* Step 1: Owner Info */}
              {currentStep === 1 && (
                <OwnerInfoStep
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                  onOpenOCR={() => setShowScanModal(true)}
                />
              )}

              {/* Step 2: Vehicle Details */}
              {currentStep === 2 && (
                <VehicleDetailsStep
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />
              )}

              {/* Step 3: Review & Submit */}
              {currentStep === 3 && (
                <ReviewStep
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />
              )}

              {/* Form Actions */}
              <div className="form-actions">
                <div className="form-actions-left">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      className="btn btn-back"
                      onClick={handleBack}
                    >
                      Back
                    </button>
                  )}
                </div>

                <div className="login-prompt">
                  <span>Do you have an account? </span>
                  <Link to="/login" className="login-link-action">Login here</Link>
                </div>

                <div className="form-actions-right">
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      className="btn btn-next"
                      onClick={handleNext}
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="btn btn-submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Complete Registration'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Unified OCR Scan Modal */}
      {showScanModal && (
        <OCRScanModal
          onClose={() => setShowScanModal(false)}
          onConfirm={handleScanConfirm}
          onManualInput={() => setShowScanModal(false)}
        />
      )}
    </div>
  );
}
