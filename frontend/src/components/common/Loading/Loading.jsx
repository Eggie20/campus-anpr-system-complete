import React from 'react';
import './Loading.css';

export const LoadingSpinner = ({ size = 'medium', color = 'primary' }) => (
    <div className={`spinner-container ${size} ${color}`}>
        <div className="spinner"></div>
    </div>
);

export const LoadingOverlay = ({ message = 'Loading...' }) => (
    <div className="loading-overlay">
        <div className="loading-card">
            {/* Animated Shield Logo */}
            <div className="loading-shield">
                <div className="loading-shield__ring loading-shield__ring--outer"></div>
                <div className="loading-shield__ring loading-shield__ring--inner"></div>
                <div className="loading-shield__icon">
                    <span className="material-symbols-rounded">shield</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="loading-progress">
                <div className="loading-progress__track">
                    <div className="loading-progress__bar"></div>
                </div>
            </div>

            {/* Message */}
            <p className="loading-message">{message}</p>
            <p className="loading-submessage">Please wait while we verify your session</p>
        </div>
    </div>
);

export default LoadingSpinner;
