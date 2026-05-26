import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function TermsModal({ onClose, onAgree }) {
    const [scrollProgress, setScrollProgress] = useState(0);
    const [canAgree, setCanAgree] = useState(false);
    const scrollRef = useRef(null);

    const handleScroll = (e) => {
        const element = e.target;
        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight - element.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

        setScrollProgress(progress);
        if (progress >= 95) {
            setCanAgree(true);
        }
    };

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="modal-overlay terms-overlay" onClick={onClose}>
            <div className="modal-content terms-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="m-title">Terms & Conditions</div>
                    <button className="m-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body terms-scroll-container" onScroll={handleScroll} ref={scrollRef}>
                    <div className="terms-content">
                        <h1>Campus ANPR System Vehicle Registration Terms & Conditions</h1>
                        <p className="last-updated">Last Updated: April 2026</p>
                        <p style={{ fontStyle: 'italic', color: 'var(--t-3)', marginBottom: '1.5rem' }}>
                            Caraga State University – Cabadbaran Campus (CSUCC)
                        </p>

                        <section>
                            <h2>1. Purpose of Registration</h2>
                            <p>The Campus ANPR System is implemented at CSUCC to automate vehicle monitoring, enhance campus security, and regulate vehicle access at designated entry and exit points.</p>
                        </section>

                        <section>
                            <h2>2. Data Collection & Privacy</h2>
                            <p>By registering, you authorize the University Security Office to collect and process the following information:</p>
                            <ul>
                                <li>Your personal details (Full Name, Sex, Date of Birth, Address, Contact Number, Email).</li>
                                <li>Institutional affiliation (Student ID / Faculty ID / Staff ID, Department, Course/Program).</li>
                                <li>Identification documents (Driver's License Number, Government/School ID scan).</li>
                                <li>Vehicle information (License Plate Number, Vehicle Brand, Vehicle Color, and Vehicle Type).</li>
                                <li>Real-time entry and exit timestamps, direction of travel, and gate location data.</li>
                            </ul>
                            <p>All collected data is stored in a secured, centralized database and is strictly used for campus security and vehicle access management. Data will not be shared with external parties or third-party organizations without legal authorization or your explicit consent.</p>
                        </section>

                        <section>
                            <h2>3. Automated Vehicle Detection & Authorization</h2>
                            <p>The Campus ANPR System uses computer vision and Optical Character Recognition (OCR) technology to automatically detect and recognize your license plate number in real time via CCTV cameras installed at campus gates. Upon detection:</p>
                            <ul>
                                <li><strong>Registered & Approved vehicles</strong> are granted automatic access and logged as an Entry or Exit.</li>
                                <li><strong>Unregistered, Expired, or Blacklisted vehicles</strong> are flagged as anomalies and require manual verification by security personnel before entry is allowed.</li>
                            </ul>
                        </section>

                        <section>
                            <h2>4. Entry-Exit Tracking & Cooldown Protection</h2>
                            <p>The system automatically tracks whether your vehicle is currently inside the campus. When your plate is first detected, it is logged as an <strong>Entry</strong>. When detected again after a cooldown period, it is logged as an <strong>Exit</strong>. A short time-based protection window prevents duplicate logs caused by repeated camera detections while your vehicle is stationary at the gate.</p>
                        </section>

                        <section>
                            <h2>5. Manual Verification & Plate Correction</h2>
                            <p>In cases where the system cannot accurately read a plate (due to poor lighting, weather, or obstructed plates), security personnel may manually verify and correct the detected plate number. This corrected information will be logged and reflected in the system's records accordingly.</p>
                        </section>

                        <section>
                            <h2>6. Parking Regulations</h2>
                            <p>Vehicle registration does not guarantee a parking slot. You must adhere to all parking signage, designated zones, speed limits, and traffic rules within university grounds. Violations may result in temporary suspension or permanent revocation of campus vehicle access privileges.</p>
                        </section>

                        <section>
                            <h2>7. Accuracy of Information</h2>
                            <p>You agree to provide true, accurate, and complete information during registration. Providing false data, using fraudulent license plates, or attempting to bypass security measures is a serious offense subject to disciplinary action in accordance with university policies.</p>
                        </section>

                        <section>
                            <h2>8. Account Responsibility</h2>
                            <p>You are solely responsible for the security of your account credentials. Any vehicle activity logged under your registered plate number is attributed to your account. Report any unauthorized use or discrepancies to the University Security Office immediately.</p>
                        </section>

                        <div style={{ height: '40px' }}></div> {/* Spacer to ensure scroll finish */}
                    </div>
                </div>

                <div className="modal-footer terms-footer">
                    <div className="scroll-hint">
                        {canAgree ? '✓ Ready to agree' : 'Please scroll to the bottom to agree'}
                    </div>
                    <div className="footer-actions">
                        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button
                            className={`btn btn-prim btn-agree ${canAgree ? 'ready' : 'disabled'}`}
                            disabled={!canAgree}
                            onClick={onAgree}
                        >
                            I Have Read and Agree
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="terms-progress-track">
                        <div
                            className="terms-progress-bar"
                            style={{ width: `${scrollProgress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

TermsModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    onAgree: PropTypes.func.isRequired
};
