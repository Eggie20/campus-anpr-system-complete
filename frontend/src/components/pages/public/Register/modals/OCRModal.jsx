import { useState, useRef } from 'react';
import PropTypes from 'prop-types';

export default function OCRModal({ onClose, onManualInput, onScanComplete }) {
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [frontPreview, setFrontPreview] = useState('');
  const [backPreview, setBackPreview] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  const handleFileSelect = (file, type) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'front') {
        setFrontFile(file);
        setFrontPreview(e.target.result);
      } else {
        setBackFile(file);
        setBackPreview(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file, type);
    }
  };

  const removeFile = (type) => {
    if (type === 'front') {
      setFrontFile(null);
      setFrontPreview('');
    } else {
      setBackFile(null);
      setBackPreview('');
    }
  };

  const handleScanVerify = async () => {
    if (!frontFile || !backFile) return;

    setIsProcessing(true);

    try {
      // Create FormData to send files to backend
      const formData = new FormData();
      formData.append('front', frontFile);
      formData.append('back', backFile);

      // Call the OCR API
      const response = await fetch('http://localhost:8000/api/v1/ocr/scan-id', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'OCR processing failed');
      }

      if (result.success) {
        // Map all Philippine Driver's License fields
        const extractedData = {
          // Personal Information
          firstName: result.data.firstName || '',
          lastName: result.data.lastName || '',
          middleName: result.data.middleName || '',
          fullName: result.data.fullName || '',
          nationality: result.data.nationality || '',
          sex: result.data.sex || '',
          birthDate: result.data.birthDate || '',

          // Physical Details
          weight: result.data.weight || '',
          height: result.data.height || '',
          bloodType: result.data.bloodType || '',
          eyesColor: result.data.eyesColor || '',

          // Address
          address: result.data.address || '',

          // License Details
          licenseNumber: result.data.licenseNumber || '',
          plateNumber: result.data.plateNumber || '',
          expiryDate: result.data.expiryDate || '',
          dlCodes: result.data.dlCodes || '',
          conditions: result.data.conditions || '',
          serialNumber: result.data.serialNumber || '',

          // Emergency Contact (Back ID)
          emergencyName: result.data.emergencyName || '',
          emergencyAddress: result.data.emergencyAddress || '',
          emergencyTel: result.data.emergencyTel || '',

          // Images & Meta
          frontImage: frontPreview,
          backImage: backPreview,
          frontFile: frontFile,
          backFile: backFile,
          confidence: result.confidence || {},
          rawText: result.rawText || ''
        };

        onScanComplete(extractedData);
      } else {
        throw new Error(result.error || 'Could not extract information from ID');
      }
    } catch (error) {
      console.error('OCR Error:', error);

      // Show error but still allow user to proceed with manual entry
      const fallbackData = {
        firstName: '',
        lastName: '',
        address: '',
        licenseNumber: '',
        birthDate: '',
        expiryDate: '',
        frontImage: frontPreview,
        backImage: backPreview,
        error: error.message,
        confidence: {}
      };

      onScanComplete(fallbackData);
    } finally {
      setIsProcessing(false);
    }
  };

  const canScan = frontFile && backFile;

  return (
    <div className="ocr-modal" onClick={(e) => e.target.className === 'ocr-modal' && onClose()}>
      <div className="ocr-modal-content enhanced-ocr-content">
        <button
          type="button"
          className="ocr-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>

        <div className="ocr-modal-header">
          <div className="ocr-icon-wrapper">
            <span className="ocr-header-icon">🆔</span>
          </div>
          <h2>Scan Driver's License</h2>
          <p>Upload the front and back of your ID for verification</p>
        </div>

        <div className="ocr-dual-upload-container">
          {/* Front ID Upload */}
          <div className="ocr-upload-section">
            <label className="ocr-upload-label">Front of Driver's License</label>
            <div
              className={`ocr-drop-zone small-zone ${frontFile ? 'has-file' : ''}`}
              onClick={() => frontInputRef.current?.click()}
              onDrop={(e) => handleDrop(e, 'front')}
              onDragOver={(e) => e.preventDefault()}
            >
              <input
                ref={frontInputRef}
                type="file"
                className="ocr-file-input"
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files[0], 'front')}
                hidden
              />
              {!frontPreview ? (
                <div className="ocr-zone-content">
                  <img
                    src="/assets/images/registration/Front-Driver_License.png"
                    alt="Front ID"
                    className="id-placeholder-img"
                  />
                  <span className="upload-text">Front ID</span>
                </div>
              ) : (
                <>
                  <img
                    src={frontPreview}
                    className="zone-preview"
                    alt="Front ID Preview"
                  />
                  <button
                    type="button"
                    className="remove-file-btn"
                    onClick={(e) => { e.stopPropagation(); removeFile('front'); }}
                  >
                    ×
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Back ID Upload */}
          <div className="ocr-upload-section">
            <label className="ocr-upload-label">Back of Driver's License</label>
            <div
              className={`ocr-drop-zone small-zone ${backFile ? 'has-file' : ''}`}
              onClick={() => backInputRef.current?.click()}
              onDrop={(e) => handleDrop(e, 'back')}
              onDragOver={(e) => e.preventDefault()}
            >
              <input
                ref={backInputRef}
                type="file"
                className="ocr-file-input"
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files[0], 'back')}
                hidden
              />
              {!backPreview ? (
                <div className="ocr-zone-content">
                  <img
                    src="/assets/images/registration/Back-Driver_License.png"
                    alt="Back ID"
                    className="id-placeholder-img"
                  />
                  <span className="upload-text">Back ID</span>
                </div>
              ) : (
                <>
                  <img
                    src={backPreview}
                    className="zone-preview"
                    alt="Back ID Preview"
                  />
                  <button
                    type="button"
                    className="remove-file-btn"
                    onClick={(e) => { e.stopPropagation(); removeFile('back'); }}
                  >
                    ×
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="ocr-processing-overlay">
            <div className="scanning-animation">
              <div className="scan-line" />
            </div>
            <h3>Verifying Documents...</h3>
            <p>Please wait while we extract your information</p>
          </div>
        )}

        <div className="ocr-modal-footer">
          <button
            type="button"
            className="btn-text"
            onClick={onManualInput}
          >
            Enter Manually
          </button>
          <button
            type="button"
            className="btn-verify-ocr"
            onClick={handleScanVerify}
            disabled={!canScan || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Scan & Verify'}
          </button>
        </div>
      </div>
    </div>
  );
}

OCRModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onManualInput: PropTypes.func.isRequired,
  onScanComplete: PropTypes.func.isRequired
};
