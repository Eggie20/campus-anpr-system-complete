import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNotification } from '../../../../contexts/NotificationContext';
import { LoadingOverlay } from '../../../common/Loading/Loading';
import isElectron from '../../../../utils/isElectron';

const SunIcon = () => (
  <svg className="icon-sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg className="icon-moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" width="20" height="20">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CameraIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="20" height="20">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const ShieldIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="20" height="20">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

export default function SecurityLogin() {
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();
  const { login } = useAuth();
  const { success, error: showError } = useNotification();

  const [formData, setFormData] = useState({ email: '', password: '', keepActive: false });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (localError) setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email) {
      setLocalError('Officer ID / Email is required.');
      return;
    }

    if (!formData.password) {
      setLocalError('Security Key / Password is required.');
      return;
    }

    const isEmail = formData.email.includes('@');
    if (isEmail && !validateEmail(formData.email)) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setLocalError('');

    try {
      const result = await login({ email: formData.email, password: formData.password }, 'security');

      if (result.success) {
        success('Login successful. Welcome, Security Officer!');
        setTimeout(() => {
          navigate('/security/dashboard', { replace: true });
        }, 1500);
      } else {
        setLocalError(result.error || 'Access denied. Incorrect credentials.');
      }
    } catch (err) {
      setLocalError('Connection error. Please check if the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper role-security">
      {isLoading && <LoadingOverlay message="Establishing secure connection..." />}
      
      {/* Visual Panel - Left Side */}
      <div className="visual-panel">
        <div className="visual-content">
          <div className="logo-container">
            <img src="/assets/images/school-logo.png" alt="CSUCC Logo" className="csucc-logo-main" />
          </div>

          <h2 className="uni-name">Caraga State University</h2>
          <h1 className="campus-name">Cabadbaran City<br />Campus</h1>

          <div className="desc-text">
            <strong>Integrated Real-time Security Monitor</strong>
            <br />
            Campus gates monitoring, alert management, and automated plate identification.
          </div>

          <div className="info-section">
            <p>Security Portal Features:</p>
            <ul>
              <li>
                <CameraIcon />
                <span>Live Camera Feed Monitor</span>
              </li>
              <li>
                <ShieldIcon />
                <span>Instant Alert Verification</span>
              </li>
              <li>
                <CheckCircleIcon />
                <span>Gate Entry/Exit Control</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Form Panel - Right Side */}
      <div className="form-panel">
        <div className="header-controls">
          <button className="theme-btn" onClick={toggleTheme} aria-label="Toggle Dark Mode">
            <SunIcon />
            <MoonIcon />
          </button>
        </div>

        <div className="form-container">
          <div className="security-badge-notice">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            AUTHORIZED PERSONNEL ONLY
          </div>

          <div className="welcome-text">
            <h2>Security Login</h2>
            <p>Access gate controls and live feeds.</p>
          </div>

          {localError && (
            <div className="alert alert-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {localError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-field">
              <input type="text" name="email" value={formData.email} onChange={handleChange} required spellCheck="false" placeholder=" " />
              <label>Officer ID / Email</label>
            </div>

            <div className="input-field">
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required spellCheck="false" placeholder=" " />
              <label>Secure Key</label>
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                <EyeIcon />
              </button>
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" name="keepActive" checked={formData.keepActive} onChange={handleChange} />
                <span>Keep Connection Active</span>
              </label>
            </div>

            <button type="submit" className="btn-submit btn-submit--security" disabled={isLoading}>
              {isLoading ? 'Connecting...' : 'Connect'}
            </button>
          </form>

          {!isElectron() && (
            <div className="footer-nav">
              <Link to="/login">← Back to Main Portal</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
