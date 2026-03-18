import PropTypes from 'prop-types';

export default function OwnerInfoStep({ formData, errors, updateFormData, onOpenOCR }) {
  return (
    <div className="form-step active" data-step="1">
      <div className="step-header">
        <h2>Owner Information</h2>
        <p>Please provide your personal details and documents</p>
      </div>

      {/* Scan ID Trigger */}
      <div className="scan-id-action">
        <button type="button" className="btn-scan-id" onClick={onOpenOCR}>
          <span className="icon">📷</span> Scan Driver's License (Auto-Fill)
        </button>
        <p className="scan-helper-text">or fill details manually below</p>
      </div>

      {/* Basic Info Row */}
      <div className="form-row three-columns">
        <div className="form-group">
          <label htmlFor="firstName" className="form-label required">First Name</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="firstName"
              name="firstName"
              className={`form-input ${errors.firstName ? 'error' : ''}`}
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => updateFormData('firstName', e.target.value)}
              autoComplete="given-name"
            />
          </div>
          {errors.firstName && <div className="error-message show">{errors.firstName}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="middleName" className="form-label">Middle Name</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="middleName"
              name="middleName"
              className="form-input"
              placeholder="Middle Name"
              value={formData.middleName || ''}
              onChange={(e) => updateFormData('middleName', e.target.value)}
              autoComplete="additional-name"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="lastName" className="form-label required">Last Name</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="lastName"
              name="lastName"
              className={`form-input ${errors.lastName ? 'error' : ''}`}
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => updateFormData('lastName', e.target.value)}
              autoComplete="family-name"
            />
          </div>
          {errors.lastName && <div className="error-message show">{errors.lastName}</div>}
        </div>
      </div>

      {/* Personal Details Row */}
      <div className="form-row three-columns">
        <div className="form-group">
          <label htmlFor="sex" className="form-label">Sex</label>
          <select
            id="sex"
            name="sex"
            className="form-select"
            value={formData.sex || ''}
            onChange={(e) => updateFormData('sex', e.target.value)}
          >
            <option value="" disabled>Select Sex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {errors.sex && <div className="error-message show">{errors.sex}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="birthDate" className="form-label">Date of Birth</label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            className="form-input"
            value={formData.birthDate || ''}
            onChange={(e) => updateFormData('birthDate', e.target.value)}
            placeholder="YYYY-MM-DD"
          />
          {errors.birthDate && <div className="error-message show">{errors.birthDate}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="nationality" className="form-label">Nationality</label>
          <input
            type="text"
            id="nationality"
            name="nationality"
            className="form-input"
            placeholder="e.g. Philippines"
            value={formData.nationality || ''}
            onChange={(e) => updateFormData('nationality', e.target.value)}
          />
          {errors.nationality && <div className="error-message show">{errors.nationality}</div>}
        </div>
      </div>

      {/* Email */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="email" className="form-label required">Email Address</label>
          <div className="input-wrapper">
            <input
              type="email"
              id="email"
              name="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              autoComplete="email"
            />
          </div>
          {errors.email && <div className="error-message show">{errors.email}</div>}
        </div>
      </div>

      {/* Password */}
      <div className="form-row two-columns">
        <div className="form-group">
          <label htmlFor="password" className="form-label required">Password</label>
          <div className="input-wrapper">
            <input
              type="password"
              id="password"
              name="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Create a password"
              value={formData.password || ''}
              onChange={(e) => updateFormData('password', e.target.value)}
              autoComplete="new-password"
            />
          </div>
          {errors.password && <div className="error-message show">{errors.password}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label required">Confirm Password</label>
          <div className="input-wrapper">
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Confirm your password"
              value={formData.confirmPassword || ''}
              onChange={(e) => updateFormData('confirmPassword', e.target.value)}
              autoComplete="new-password"
            />
          </div>
          {errors.confirmPassword && <div className="error-message show">{errors.confirmPassword}</div>}
        </div>
      </div>

      {/* Phone & ID */}
      <div className="form-row two-columns">
        <div className="form-group">
          <label htmlFor="phone" className="form-label required">Phone Number</label>
          <div className="input-wrapper">
            <input
              type="tel"
              id="phone"
              name="phone"
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={(e) => updateFormData('phone', e.target.value)}
              autoComplete="tel"
            />
          </div>
          {errors.phone && <div className="error-message show">{errors.phone}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="idNumber" className="form-label required">ID Number</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="idNumber"
              name="idNumber"
              className={`form-input ${errors.idNumber ? 'error' : ''}`}
              placeholder="ID Number"
              value={formData.idNumber}
              onChange={(e) => updateFormData('idNumber', e.target.value)}
            />
          </div>
          {errors.idNumber && <div className="error-message show">{errors.idNumber}</div>}
        </div>
      </div>

      {/* Address */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="address" className="form-label required">Address</label>
          <textarea
            id="address"
            name="address"
            className={`form-textarea ${errors.address ? 'error' : ''}`}
            placeholder="Complete Address"
            value={formData.address}
            onChange={(e) => updateFormData('address', e.target.value)}
            rows="2"
          />
          {errors.address && <div className="error-message show">{errors.address}</div>}
        </div>
      </div>

      {/* Relationship */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="relationship" className="form-label required">Relationship to CSUCC</label>
          <select
            id="relationship"
            name="relationship"
            className={`form-select ${errors.relationship ? 'error' : ''}`}
            value={formData.relationship}
            onChange={(e) => updateFormData('relationship', e.target.value)}
          >
            <option value="">Select Relationship</option>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="staff">Staff</option>
          </select>
          {errors.relationship && <div className="error-message show">{errors.relationship}</div>}
        </div>
      </div>

      {/* Driver's License Upload */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="driverLicense" className="form-label required">Driver's License</label>
          <div className={`file-upload-wrapper ${formData.driverLicense ? 'has-file' : ''}`}>
            <input
              type="file"
              id="driverLicense"
              name="driverLicense"
              className="file-upload-input"
              accept="image/*,.pdf"
              onChange={(e) => updateFormData('driverLicense', e.target.files[0])}
            />
            <label htmlFor="driverLicense" className="file-upload-label">
              <div className="file-upload-icon-box">
                {formData.driverLicense && formData.driverLicense.type?.startsWith('image/') ? (
                   <img 
                     src={URL.createObjectURL(formData.driverLicense)} 
                     alt="License Preview" 
                     className="upload-preview-img"
                   />
                ) : (
                  <span>{formData.driverLicense ? '✅' : '📄'}</span>
                )}
              </div>
              <div className="file-upload-info">
                <div className="upload-title">
                  {formData.driverLicense ? formData.driverLicense.name || 'ID Document Attached' : 'Click to upload Driver\'s License'}
                </div>
                <div className="upload-desc">
                  {formData.driverLicense ? 'Auto-filled from scan' : 'SVG, PNG, JPG or PDF (max. 5MB)'}
                </div>
              </div>
            </label>
          </div>
          {errors.driverLicense && <div className="error-message show">{errors.driverLicense}</div>}
        </div>
      </div>
    </div>
  );
}

OwnerInfoStep.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired,
  onOpenOCR: PropTypes.func.isRequired
};
