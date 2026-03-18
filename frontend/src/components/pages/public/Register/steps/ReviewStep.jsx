import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

// Generate random CAPTCHA
function generateCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function ReviewStep({ formData, errors, updateFormData }) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [captchaCode, setCaptchaCode] = useState('');
  const termsRef = useRef(null);
  const canvasRef = useRef(null);

  // Generate CAPTCHA on mount
  useEffect(() => {
    const code = generateCaptcha();
    setCaptchaCode(code);
    drawCaptcha(code);
  }, []);

  // Draw CAPTCHA on canvas
  const drawCaptcha = (code) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Noise lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.2})`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
    
    // Text
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#374151';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i < code.length; i++) {
      const x = 20 + i * 28;
      const y = 30 + Math.random() * 10 - 5;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.4);
      ctx.fillText(code[i], 0, 0);
      ctx.restore();
    }
  };

  const refreshCaptcha = () => {
    const code = generateCaptcha();
    setCaptchaCode(code);
    drawCaptcha(code);
    updateFormData('captchaInput', '');
  };

  // Handle terms scroll
  const handleTermsScroll = (e) => {
    const element = e.target;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight - element.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    
    setScrollProgress(progress);
    
    if (progress >= 95) {
      setHasScrolledToBottom(true);
    }
  };

  // Get vehicle type label
  const getVehicleTypeLabel = (type) => {
    const types = { car: 'Car', motorcycle: 'Motorcycle', truck: 'Truck', van: 'Van' };
    return types[type] || type;
  };

  return (
    <div className="form-step active" data-step="3">
      <div className="step-header">
        <h2>Review & Terms</h2>
        <p>Please review your details and accept the terms</p>
      </div>

      {/* Review Content */}
      <div className="review-container">
        <div className="review-section">
          <h4 className="review-section-title">Owner Information</h4>
          <div className="review-grid">
            <div className="review-item">
              <span className="review-label">Name</span>
              <span className="review-value">{formData.firstName} {formData.lastName}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Email</span>
              <span className="review-value">{formData.email}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Phone</span>
              <span className="review-value">{formData.phone}</span>
            </div>
            <div className="review-item">
              <span className="review-label">ID Number</span>
              <span className="review-value">{formData.idNumber}</span>
            </div>
            <div className="review-item full-width">
              <span className="review-label">Address</span>
              <span className="review-value">{formData.address}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Relationship</span>
              <span className="review-value">{formData.relationship}</span>
            </div>
          </div>
        </div>

        <div className="review-section">
          <h4 className="review-section-title">Vehicle Information</h4>
          <div className="review-grid">
            <div className="review-item">
              <span className="review-label">Type</span>
              <span className="review-value">{getVehicleTypeLabel(formData.vehicleType)}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Plate Number</span>
              <span className="review-value plate-number">{formData.plateNumber}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Make</span>
              <span className="review-value">{formData.make}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Model</span>
              <span className="review-value">{formData.model}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Year</span>
              <span className="review-value">{formData.year}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Color</span>
              <span className="review-value">{formData.color}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <h3 className="terms-title">Terms and Conditions</h3>
      <div className="terms-wrapper">
        <div 
          ref={termsRef}
          className="terms-scroll-container"
          onScroll={handleTermsScroll}
        >
          <h4>1. Introduction</h4>
          <p>Welcome to the CSUCC Smart Vehicle Logging System. By registering your vehicle, you agree to comply with the university's parking and traffic regulations.</p>
          
          <h4>2. Vehicle Registration</h4>
          <p>All vehicles entering the campus must be registered. You are responsible for providing accurate and up-to-date information regarding your vehicle and personal details.</p>
          
          <h4>3. Parking Rules</h4>
          <p>Parking is permitted only in designated areas. Unauthorized parking may result in fines or towing.</p>
          
          <h4>4. Speed Limit</h4>
          <p>The maximum speed limit on campus is 20 km/h. Please drive carefully and watch for pedestrians.</p>
          
          <h4>5. Security Checks</h4>
          <p>Security personnel are authorized to inspect vehicles entering and leaving the campus premises for security purposes.</p>
          
          <h4>6. Data Privacy</h4>
          <p>Your personal data will be collected and processed in accordance with the Data Privacy Act. It will be used solely for security and vehicle management purposes.</p>
          
          <h4>7. Liability</h4>
          <p>The university is not liable for any loss or damage to vehicles or property left inside vehicles while parked on campus.</p>
          
          <h4>8. Violations</h4>
          <p>Repeated violations of traffic and parking rules may result in the revocation of your campus entry privileges.</p>
          
          <div className="terms-end-marker">--- End of Terms ---</div>
        </div>
        
        {!hasScrolledToBottom && (
          <div className="scroll-indicator">
            Scroll to the bottom to accept ↓
          </div>
        )}
        
        <div className="scroll-progress-track">
          <div 
            className="scroll-progress-bar" 
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>

      {/* Accept Terms Checkbox */}
      <div className="form-row">
        <div className="form-group">
          <div className="terms-section">
            <label className="terms-checkbox">
              <input
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) => updateFormData('acceptTerms', e.target.checked)}
                disabled={!hasScrolledToBottom}
              />
              <span className="checkmark" />
              <span className="terms-label-text">
                I have read and agree to the Terms and Conditions
              </span>
            </label>
          </div>
          {errors.acceptTerms && <div className="error-message show">{errors.acceptTerms}</div>}
        </div>
      </div>

      {/* CAPTCHA */}
      <div className="form-row captcha-section">
        <div className="form-group">
          <label className="form-label required">Security Verification</label>
          <div className="captcha-wrapper">
            <div className="captcha-display">
              <canvas ref={canvasRef} width="200" height="60" />
            </div>
            <button 
              type="button" 
              className="captcha-refresh" 
              onClick={refreshCaptcha}
              title="Refresh Code"
            >
              🔄
            </button>
            <input
              type="text"
              className={`form-input captcha-input ${errors.captchaInput ? 'error' : ''}`}
              placeholder="Type code"
              value={formData.captchaInput}
              onChange={(e) => updateFormData('captchaInput', e.target.value)}
              autoComplete="off"
            />
          </div>
          {errors.captchaInput && <div className="error-message show">{errors.captchaInput}</div>}
        </div>
      </div>
    </div>
  );
}

ReviewStep.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired
};
