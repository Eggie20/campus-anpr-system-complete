import { useState } from 'react';
import PropTypes from 'prop-types';

export default function ReviewStep({ formData, errors, updateFormData, onBack, isSubmitting }) {
  const [activeAccordion, setActiveAccordion] = useState('owner');

  const toggleAccordion = (id) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  // Helper to format relationship/role labels
  const getRoleLabel = (role) => {
    const labels = { student: 'Student', faculty: 'Faculty', staff: 'Staff', visitor: 'Visitor' };
    return labels[role] || role;
  };

  // Get uploaded file display names
  const idFileName = formData.driverLicense?.name || (formData.driverLicense ? 'ID Photo (scanned)' : null);
  const orcrFileName = formData.orcrFile?.name || null;

  // Check if all required fields are complete for the button to be active
    formData.email && formData.plateNumber && formData.brand;

  return (
    <div className="form-step active">
      <div className="step-content-scroll">
        <div className="step-section">
          <div className="step-info-header">
            <div className="step-info-title">Final Review</div>
            <div className="step-info-desc">Verify your details before completing the registration process.</div>
          </div>

          <div className="review-accordions">
            {/* 1. OWNER INFORMATION */}
            <div className={`review-acc-item ${activeAccordion === 'owner' ? 'open' : ''}`}>
              <div className="review-acc-header" onClick={() => toggleAccordion('owner')}>
                <div className="acc-info">
                  <span className="acc-icon">👤</span>
                  <div className="acc-text">
                    <div className="acc-title">Owner Information</div>
                    <div className="acc-subtitle">Personal details & {getRoleLabel(formData.relationship)} status</div>
                  </div>
                </div>
                <div className="acc-arrow"></div>
              </div>
              <div className="review-acc-body">
                <div className="review-data-grid">
                  <div className="data-item"><div className="data-label">FULL NAME</div><div className="data-val">{formData.firstName} {formData.middleName} {formData.lastName}</div></div>
                  <div className="data-item"><div className="data-label">SEX / BIRTHDATE</div><div className="data-val">{formData.sex} • {formData.birthDate}</div></div>
                  <div className="data-item"><div className="data-label">CONTACT</div><div className="data-val">{formData.phone} • {formData.email}</div></div>
                  <div className="data-item"><div className="data-label">LICENSE NO.</div><div className="data-val">{formData.idNumber || '—'}</div></div>
                  <div className="data-item col-12"><div className="data-label">ADDRESS</div><div className="data-val">{formData.address || '—'}</div></div>

                  {/* ROLE SPECIFIC DATA */}
                  {formData.relationship === 'student' && (
                    <>
                      <div className="data-item"><div className="data-label">STUDENT ID</div><div className="data-val">{formData.studentId}</div></div>
                      <div className="data-item"><div className="data-label">COURSE & YEAR</div><div className="data-val">{formData.course} - {formData.yearLevel}</div></div>
                    </>
                  )}
                  {formData.relationship === 'faculty' && (
                    <>
                      <div className="data-item"><div className="data-label">FACULTY ID</div><div className="data-val">{formData.facultyId}</div></div>
                      <div className="data-item"><div className="data-label">DEPT / POSITION</div><div className="data-val">{formData.department} • {formData.position}</div></div>
                    </>
                  )}
                  {formData.relationship === 'staff' && (
                    <>
                      <div className="data-item"><div className="data-label">STAFF ID</div><div className="data-val">{formData.staffId}</div></div>
                      <div className="data-item"><div className="data-label">DEPT / TITLE</div><div className="data-val">{formData.staffDepartment} • {formData.jobTitle}</div></div>
                    </>
                  )}
                  {formData.relationship === 'visitor' && (
                    <>
                      <div className="data-item"><div className="data-label">PURPOSE</div><div className="data-val">{formData.visitorPurpose}</div></div>
                      <div className="data-item"><div className="data-label">HOST / REASON</div><div className="data-val">{formData.visitorHost} • {formData.visitorReason}</div></div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 2. VEHICLE DETAILS */}
            <div className={`review-acc-item ${activeAccordion === 'vehicle' ? 'open' : ''}`}>
              <div className="review-acc-header" onClick={() => toggleAccordion('vehicle')}>
                <div className="acc-info">
                  <span className="acc-icon">🚗</span>
                  <div className="acc-text">
                    <div className="acc-title">Vehicle Details</div>
                    <div className="acc-subtitle">1 Vehicle registered • ANPR: {formData.anprFlagged ? '⚠️ FLAG DETECTED' : '✅ CLEAN'}</div>
                  </div>
                </div>
                <div className="acc-arrow"></div>
              </div>
              <div className="review-acc-body">
                <div className="review-data-grid">
                  <div className="data-item"><div className="data-label">PLATE NUMBER</div><div className="data-val plate-highlight">{formData.plateNumber}</div></div>
                  <div className="data-item"><div className="data-label">BRAND / COLOR</div><div className="data-val">{formData.brand} ({formData.color})</div></div>
                  <div className="data-item col-12">
                    <div className="data-label">ANPR SECURITY STATUS</div>
                    {formData.anprFlagged ? (
                      <div className="status-badge flagged">
                        <span className="s-icon">⚠️</span>
                        <div className="s-text">
                          <div className="s-title">Anomaly Flagged</div>
                          <div className="s-desc">{formData.anprFlagMsg} (Auto-resolve on submit)</div>
                        </div>
                      </div>
                    ) : (
                      <div className="status-badge clean">
                        <span className="s-icon">✅</span>
                        <div className="s-text">
                          <div className="s-title">Security Verified</div>
                          <div className="s-desc">Vehicle is cleared for campus registration.</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. UPLOADED DOCUMENTS */}
            <div className={`review-acc-item ${activeAccordion === 'documents' ? 'open' : ''}`}>
              <div className="review-acc-header" onClick={() => toggleAccordion('documents')}>
                <div className="acc-info">
                  <span className="acc-icon">📄</span>
                  <div className="acc-text">
                    <div className="acc-title">Uploaded Documents</div>
                    <div className="acc-subtitle">
                      {idFileName ? '✅' : '❌'} Gov/School ID
                      {' • '}
                      {orcrFileName ? '✅' : '—'} OR/CR
                    </div>
                  </div>
                </div>
                <div className="acc-arrow"></div>
              </div>
              <div className="review-acc-body">
                <div className="review-data-grid">
                  <div className="data-item col-12">
                    <div className="data-label">GOVERNMENT / SCHOOL ID</div>
                    <div className="data-val" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {idFileName ? (
                        <>
                          <span style={{ color: 'var(--green)', fontSize: '14px' }}>✓</span>
                          <span>{idFileName}</span>
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Not uploaded</span>
                      )}
                    </div>
                  </div>
                  <div className="data-item col-12">
                    <div className="data-label">
                      OR/CR DOCUMENT
                      <span style={{
                        marginLeft: '8px',
                        fontSize: '9px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text-muted)',
                        fontWeight: 600
                      }}>OPTIONAL</span>
                    </div>
                    <div className="data-val" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {orcrFileName ? (
                        <>
                          <span style={{ color: 'var(--green)', fontSize: '14px' }}>✓</span>
                          <span>{orcrFileName}</span>
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Not uploaded — optional</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onBack}>Back</button>
        <div className="form-actions-right">
          <button
            type="submit"
            className="btn btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Complete Registration'}
          </button>
        </div>
      </div>
    </div>
  );
}

ReviewStep.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired
};
