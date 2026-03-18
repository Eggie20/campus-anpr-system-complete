import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../../../../../assets/css/components/verification-modal.css';

export default function VerificationModal({ scannedData, scanId, onClose, onConfirm, onRescan }) {
  const [activeTab, setActiveTab] = useState('info'); // 'docs' or 'info' for mobile
  const [animateHeader, setAnimateHeader] = useState(false);

  useEffect(() => {
    // Small delay to trigger entry animations if needed
    setAnimateHeader(true);
  }, []);

  // Check if scan had errors or empty results
  const hasError = scannedData?.error || (!scannedData?.firstName && !scannedData?.licenseNumber);

  // Helper to get confidence percentage
  const getConf = (field) => {
    const val = scannedData?.confidence?.[field];
    return val ? Math.round(val * 100) : 0;
  };

  // Overall confidence average
  const getOverallConf = () => {
    if (!scannedData?.confidence) return 0;
    const values = Object.values(scannedData.confidence);
    if (values.length === 0) return 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return Math.round(avg * 100);
  };

  const overallScore = getOverallConf();

  // Field Renderer
  const FieldRow = ({ label, value, fieldName, isHeader = false }) => {
    const confidence = getConf(fieldName);
    const isHigh = confidence >= 85;
    
    // Skip if no value and not a placeholder we want to show
    if (!value && !['middleName', 'nationality', 'plateNumber'].includes(fieldName)) return null;

    return (
      <div className="field-row">
        <div className="field-key">
          <span className="fk-dot"></span>
          {label}
        </div>
        <div className={`field-val ${isHeader ? 'hi' : ''}`}>
          {value || <em style={{ opacity: 0.3, fontStyle: 'normal' }}>Not detected</em>}
        </div>
        <div className={`conf-chip ${isHigh ? 'cc-hi' : 'cc-mid'}`}>
          {isHigh ? '✓' : '⚠'} {confidence}%
        </div>
      </div>
    );
  };

  return (
    <div className="ocr-modal" onClick={(e) => e.target.className === 'ocr-modal' && onClose()}>
      <div className="verification-content verification-compact">
        
        {/* ── MODAL HEADER ── */}
        <header className="modal-header">
          <div className="modal-header-left">
            <div className="modal-icon">🔍</div>
            <div className="modal-title-wrap">
              <div className="modal-title">Identity Verification</div>
              <div className="modal-sub">AI-Powered Document Analysis v2.0</div>
            </div>
          </div>
          <div className="modal-header-right">
            <button className="modal-close" onClick={onClose} title="Discard Scan">×</button>
          </div>
        </header>

        {/* ── SUCCESS/ERROR BANNER ── */}
        <div className="success-banner" style={{ borderLeft: `4px solid ${hasError ? 'var(--color-error)' : 'var(--color-success)'}` }}>
          <div className="banner-left">
            <div className="banner-icon" style={{ color: hasError ? 'var(--color-error)' : 'var(--color-success)' }}>
              {hasError ? '⚠' : '✦'}
            </div>
            <div>
              <div className="banner-title" style={{ color: hasError ? 'var(--color-error)' : 'var(--color-success)' }}>
                {hasError ? 'Refinement Required' : 'Scan Analysis Complete'}
              </div>
              <div className="banner-sub">
                {hasError 
                  ? 'Some fields were not clearly detected. Please verify manually.' 
                  : 'Document data extracted with high confidence across most fields.'}
              </div>
            </div>
          </div>
          <button className="banner-dismiss" onClick={onClose}>Dismiss</button>
        </div>

        {/* ── CONFIDENCE STRIP ── */}
        <div className="conf-strip">
          <div className="conf-label">SCAN ACCURACY</div>
          <div className="conf-track">
            <div className="conf-fill" style={{ width: `${overallScore}%` }}></div>
          </div>
          <div className="conf-score" style={{ color: overallScore >= 80 ? 'var(--color-success)' : 'var(--color-warning)' }}>
            {overallScore}%
          </div>
          <div className="conf-pills">
            <span className={`cpill ${overallScore >= 85 ? 'cpill-hi' : 'cpill-mid'}`}>
              {overallScore >= 85 ? 'OPTIMAL' : 'STABLE'}
            </span>
          </div>
        </div>

        {/* ── MOBILE TABS ── */}
        <div className="mobile-tabs">
          <button 
            className={`mtab ${activeTab === 'docs' ? 'active' : ''}`}
            onClick={() => setActiveTab('docs')}
          >
            DOCUMENTS
          </button>
          <button 
            className={`mtab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            INFORMATION
          </button>
        </div>

        {/* ── MODAL BODY ── */}
        <div className="modal-body">
          <div className="body-grid">
            
            {/* Left Col: Documents */}
            <aside className={`doc-col ${activeTab === 'docs' ? 'tab-active' : ''}`}>
              <div className="sec-label">
                <span>SOURCE DOCUMENTS</span>
                <span className="sec-badge">ENCRYPTED</span>
              </div>
              
              <div className="doc-frame">
                <div className="id-card-sim">
                  {scannedData?.frontImage ? (
                    <img src={scannedData.frontImage} className="id-thumb-img" alt="Front" />
                  ) : (
                    <div className="id-placeholder">FRONT ID</div>
                  )}
                  <div className="scan-overlay">
                    <div className="scan-corner sc-tl"></div>
                    <div className="scan-corner sc-tr"></div>
                    <div className="scan-corner sc-bl"></div>
                    <div className="scan-corner sc-br"></div>
                    <div className="scan-line"></div>
                  </div>
                </div>
              </div>

              <div className="doc-frame">
                <div className="id-card-sim">
                  {scannedData?.backImage ? (
                    <img src={scannedData.backImage} className="id-thumb-img" alt="Back" />
                  ) : (
                    <div className="id-placeholder">BACK ID</div>
                  )}
                  <div className="scan-overlay">
                    <div className="scan-corner sc-tl"></div>
                    <div className="scan-corner sc-tr"></div>
                    <div className="scan-corner sc-bl"></div>
                    <div className="scan-corner sc-br"></div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'auto', fontSize: '10px', color: 'var(--text-tertiary)', lineHeight: '1.4' }}>
                <div style={{ marginBottom: '4px' }}><strong>Analysis Tip:</strong></div>
                Check for glare or blur if data quality is low. Ensure the ID is well-lit and centered.
              </div>
            </aside>

            {/* Right Col: Fields */}
            <main className={`info-col ${activeTab === 'info' ? 'tab-active' : ''}`}>
              <div className="field-divider">PERSONAL INFORMATION</div>
              <FieldRow label="Last Name" value={scannedData?.lastName} fieldName="lastName" isHeader={true} />
              <FieldRow label="First Name" value={scannedData?.firstName} fieldName="firstName" isHeader={true} />
              <FieldRow label="Middle Name" value={scannedData?.middleName} fieldName="middleName" />
              <FieldRow label="Nationality" value={scannedData?.nationality} fieldName="nationality" />
              <FieldRow label="Gender" value={scannedData?.sex} fieldName="sex" />
              <FieldRow label="Date of Birth" value={scannedData?.birthDate} fieldName="birthDate" />
              <FieldRow label="Home Address" value={scannedData?.address} fieldName="address" />
              
              <div className="field-divider">DOCUMENT DETAILS</div>
              <FieldRow label="License Number" value={scannedData?.licenseNumber} fieldName="licenseNumber" isHeader={true} />
              <FieldRow label="Expiration Date" value={scannedData?.expiryDate} fieldName="expiryDate" />
              <FieldRow label="Plate Number" value={scannedData?.plateNumber} fieldName="plateNumber" />
              
              <div className="field-divider">EMERGENCY CONTACT</div>
              <FieldRow label="Contact Name" value={scannedData?.emergencyName} fieldName="emergencyName" />
              <FieldRow label="Address" value={scannedData?.emergencyAddress} fieldName="emergencyAddress" />
              <FieldRow label="Telephone" value={scannedData?.emergencyTel} fieldName="emergencyTel" />

              <div className="review-notice">
                <span style={{ fontSize: '14px' }}>i</span>
                <div>
                  <strong>Manual Review:</strong> Please check all data against the source image. Click fields in the main form to correct any errors after confirming.
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* ── MODAL FOOTER ── */}
        <footer className="modal-footer">
          <div className="footer-note">
            <div className="footer-dot"></div>
            <div className="footer-text">
              System Ready: <strong>Verified by OCR Engine</strong>
            </div>
          </div>
          <div className="footer-actions">
            <button className="btn btn-ghost" onClick={onRescan}>
              <span>🔄</span> RE-SCAN
            </button>
            <button className="btn btn-sec" onClick={onClose}>
              <span>✏️</span> DISCARD
            </button>
            <button className="btn btn-prim" onClick={() => onConfirm(scannedData)}>
              <span>✦</span> CONFIRM DATA
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
}

VerificationModal.propTypes = {
  scannedData: PropTypes.object,
  scanId: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onRescan: PropTypes.func.isRequired
};

