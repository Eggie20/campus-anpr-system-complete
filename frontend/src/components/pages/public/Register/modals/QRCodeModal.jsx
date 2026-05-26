import PropTypes from 'prop-types';

/**
 * QRCodeModal — Post-registration modal showing a scannable QR code
 * and digital access card with the user's registration details.
 */
export default function QRCodeModal({ data, onGoToLogin }) {
  const {
    qrCodeBase64,
    fullName,
    plateNumber,
    driversLicense,
    registrationToken,
  } = data;

  // Download QR code as PNG
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${qrCodeBase64}`;
    link.download = `ANPR_QR_${plateNumber || 'code'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="qr-overlay" id="qr-code-modal">
      <div className="qr-modal">
        {/* Header */}
        <div className="qr-modal-header">
          <div className="qr-modal-badge">
            <span className="badge-dot"></span>
            Registration Complete
          </div>
          <div className="qr-modal-title">Your Access QR Code</div>
          <div className="qr-modal-subtitle">
            Scan this code at the campus gate for vehicle verification
          </div>
        </div>

        {/* QR Code */}
        <div className="qr-code-container">
          <div className="qr-code-frame">
            <img
              src={`data:image/png;base64,${qrCodeBase64}`}
              alt="Registration QR Code"
              id="qr-code-image"
            />
          </div>
        </div>

        {/* Digital Access Card */}
        <div className="qr-access-card">
          <div className="qr-access-card-header">
            <div className="qr-access-icon">🛡️</div>
            <div>
              <div className="qr-access-label">Campus ANPR System</div>
              <div className="qr-access-sublabel">Digital Access Card</div>
            </div>
          </div>

          <div className="qr-access-fields">
            <div className="qr-field full">
              <div className="qr-field-label">Full Name</div>
              <div className="qr-field-value">{fullName}</div>
            </div>
            <div className="qr-field">
              <div className="qr-field-label">Plate Number</div>
              <div className="qr-field-value plate">{plateNumber}</div>
            </div>
            <div className="qr-field">
              <div className="qr-field-label">License No.</div>
              <div className="qr-field-value">{driversLicense || '—'}</div>
            </div>
            <div className="qr-field full">
              <div className="qr-field-label">Registration Token</div>
              <div className="qr-field-value token">{registrationToken}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="qr-modal-actions">
          <button
            type="button"
            className="qr-btn qr-btn-download"
            onClick={handleDownload}
            id="qr-download-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download QR
          </button>
          <button
            type="button"
            className="qr-btn qr-btn-login"
            onClick={onGoToLogin}
            id="qr-goto-login-btn"
          >
            Go to Login
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

QRCodeModal.propTypes = {
  data: PropTypes.shape({
    qrCodeBase64: PropTypes.string.isRequired,
    fullName: PropTypes.string.isRequired,
    plateNumber: PropTypes.string.isRequired,
    driversLicense: PropTypes.string,
    registrationToken: PropTypes.string.isRequired,
  }).isRequired,
  onGoToLogin: PropTypes.func.isRequired,
};
