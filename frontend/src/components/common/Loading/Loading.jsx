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
            <div className="pulse-logo">
                <img src="/assets/images/anpr-logo.png" alt="ANPR Logo" />
            </div>
            <div className="loading-spinner"></div>
            <p className="loading-message">{message}</p>
        </div>
    </div>
);

export default LoadingSpinner;
