import { useState } from 'react';
import PropTypes from 'prop-types';

export default function OwnerInfoStep({ formData, errors, updateFormData, onOpenOCR, onNext }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const password = formData.password || '';
  
  const criteria = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'At least one number', met: /\d/.test(password) },
    { label: 'At least one lowercase letter', met: /[a-z]/.test(password) },
    { label: 'At least one uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'At least one special character', met: /[!@#$%^&*(),.?":{}|<>_]/.test(password) }
  ];
  return (
    <div className="form-step active">
      <div className="step-content-scroll">
        <div className="step-section">
          <div className="step-info-header">
            <div className="step-info-title">Owner Information</div>
            <div className="step-info-desc">Please provide your personal details and identification documents.</div>
          </div>

          {/* SCAN CARD */}
          <div className="scan-card-trigger" onClick={onOpenOCR}>
            <div className="scan-card-icon">🪪</div>
            <div className="scan-card-content">
              <div className="scan-card-title">Auto-fill with OCR Scan</div>
              <div className="scan-card-text">Scan your Driver's License to automatically fill the fields below. Fast and accurate.</div>
            </div>
            <div className="scan-card-badge">RECOMMENDED</div>
          </div>

          <div className="form-section-divider">OR FILL MANUALLY</div>

          <div className="form-grid">
            <div className="form-group col-4">
              <label className="field-label required">First Name</label>
              <input
                type="text"
                className={`field-input ${errors.firstName ? 'error' : ''}`}
                placeholder="Juan"
                value={formData.firstName}
                onChange={(e) => updateFormData('firstName', e.target.value)}
              />
              {errors.firstName && <div className="field-error">{errors.firstName}</div>}
            </div>
            <div className="form-group col-4">
              <label className="field-label">Middle Name</label>
              <input
                type="text"
                className="field-input"
                placeholder="Ramos"
                value={formData.middleName || ''}
                onChange={(e) => updateFormData('middleName', e.target.value)}
              />
            </div>
            <div className="form-group col-4">
              <label className="field-label required">Last Name</label>
              <input
                type="text"
                className={`field-input ${errors.lastName ? 'error' : ''}`}
                placeholder="Dela Cruz"
                value={formData.lastName}
                onChange={(e) => updateFormData('lastName', e.target.value)}
              />
              {errors.lastName && <div className="field-error">{errors.lastName}</div>}
            </div>

            <div className="form-group col-4">
              <label className="field-label required">Sex</label>
              <select
                className={`field-input ${errors.sex ? 'error' : ''}`}
                value={formData.sex || ''}
                onChange={(e) => updateFormData('sex', e.target.value)}
              >
                <option value="" disabled>Select Sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.sex && <div className="field-error">{errors.sex}</div>}
            </div>
            <div className="form-group col-4">
              <label className="field-label required">Date of Birth</label>
              <input
                type="date"
                className={`field-input ${errors.birthDate ? 'error' : ''}`}
                value={formData.birthDate || ''}
                onChange={(e) => updateFormData('birthDate', e.target.value)}
              />
              {errors.birthDate && <div className="field-error">{errors.birthDate}</div>}
            </div>
            <div className="form-group col-4">
              <label className="field-label">Nationality</label>
              <input
                type="text"
                className="field-input"
                placeholder="Filipino"
                value={formData.nationality || ''}
                onChange={(e) => updateFormData('nationality', e.target.value)}
              />
            </div>

            <div className="form-group col-12">
              <label className="field-label required">Driver's License Number</label>
              <input
                type="text"
                className={`field-input ${errors.idNumber ? 'error' : ''}`}
                placeholder="N01-XX-XXXXXX"
                value={formData.idNumber}
                onChange={(e) => updateFormData('idNumber', e.target.value)}
              />
              {errors.idNumber && <div className="field-error">{errors.idNumber}</div>}
            </div>

            <div className="form-group col-12">
              <label className="field-label required">Home Address</label>
              <textarea
                className={`field-input ${errors.address ? 'error' : ''}`}
                placeholder="House No., Street, Barangay, City, Province"
                rows="2"
                value={formData.address}
                onChange={(e) => updateFormData('address', e.target.value)}
              ></textarea>
              {errors.address && <div className="field-error">{errors.address}</div>}
            </div>
          </div>

          <div className="form-section-header">Contact & Security</div>
          <div className="form-grid">
            <div className="form-group col-6">
              <label className="field-label required">Email Address</label>
              <div className="input-with-icon">
                <span className="icon">📧</span>
                <input
                  type="email"
                  className={`field-input ${errors.email ? 'error' : ''}`}
                  placeholder="juan.delacruz@csucc.edu.ph"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                />
              </div>
              {errors.email && <div className="field-error">{errors.email}</div>}
            </div>
            <div className="form-group col-6">
              <label className="field-label">Phone Number (Optional)</label>
              <div className="input-with-icon">
                <span className="icon">📱</span>
                <input
                  type="tel"
                  className={`field-input ${errors.phone ? 'error' : ''}`}
                  placeholder="0912 345 6789"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                />
              </div>
              {errors.phone && <div className="field-error">{errors.phone}</div>}
            </div>

            <div className="form-group col-6 password-group">
              <label className="field-label required">Password</label>
              <div className="input-with-icon">
                <span className="icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`field-input ${errors.password ? 'error' : ''}`}
                  placeholder="Create a strong password"
                  value={formData.password || ''}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                />
                <button 
                  type="button" 
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              
              <div className={`password-checklist ${isPasswordFocused ? 'visible' : ''}`}>
                {criteria.map((c, i) => (
                  <div key={i} className={`checklist-item ${c.met ? 'met' : ''}`}>
                    <div className="check-circle">
                      {c.met && <span className="check-mark">✓</span>}
                    </div>
                    <span>{c.label}</span>
                  </div>
                ))}
              </div>
              {errors.password && <div className="field-error">{errors.password}</div>}
            </div>
            <div className="form-group col-6">
              <label className="field-label required">Confirm Password</label>
              <input
                type="password"
                className={`field-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="••••••••"
                value={formData.confirmPassword || ''}
                onChange={(e) => updateFormData('confirmPassword', e.target.value)}
              />
              {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
            </div>
          </div>

          <div className="form-section-header">University Relationship</div>
          <div className="relationship-grid">
            {[
              { id: 'student', label: 'Student', icon: '🎓', desc: 'Currently enrolled student' },
              { id: 'faculty', label: 'Faculty', icon: '👨‍🏫', desc: 'Teaching & academic staff' },
              { id: 'staff', label: 'Staff', icon: '💼', desc: 'Administrative & support personnel' },
              { id: 'visitor', label: 'Visitor', icon: '🤝', desc: 'Guest or temporary visitor' }
            ].map(rel => (
              <div
                key={rel.id}
                className={`rel-opt ${formData.relationship === rel.id ? 'active' : ''}`}
                onClick={() => updateFormData('relationship', rel.id)}
              >
                <div className="rel-icon">{rel.icon}</div>
                <div className="rel-info">
                  <div className="rel-label">{rel.label}</div>
                  <div className="rel-desc">{rel.desc}</div>
                </div>
                <div className="rel-check">✓</div>
              </div>
            ))}
          </div>
          {errors.relationship && <div className="field-error" style={{ textAlign: 'center', marginTop: '10px' }}>{errors.relationship}</div>}
        </div>
      </div>

      <div className="form-actions">
        <div className="login-prompt" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Already have an account?</span>
          <a href="/login" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'rgba(16, 185, 129, 0.1)', 
              color: 'var(--green)', 
              padding: '6px 14px', 
              borderRadius: '8px', 
              fontWeight: 600, 
              fontSize: '13px', 
              textDecoration: 'none',
              transition: 'all 0.2s',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'; e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)' }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'; e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)' }}
          >
            <span>Login here</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
          </a>
        </div>
        <div className="form-actions-right">
          <button type="button" className="btn btn-next" onClick={onNext}>Continue</button>
        </div>
      </div>
    </div>
  );
}

OwnerInfoStep.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired,
  onOpenOCR: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired
};
