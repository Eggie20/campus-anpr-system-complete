import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNotification } from '../../../../contexts/NotificationContext';
import { LoadingOverlay } from '../../../common/Loading/Loading';

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

const SettingsIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="20" height="20">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ChartBarIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="20" height="20">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

export default function AdminLogin() {
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();
  const { login } = useAuth();
  const { success, error: showError } = useNotification();

  const [formData, setFormData] = useState({ email: '', password: '' });
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (localError) setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email) {
      setLocalError('Email is required.');
      return;
    }

    if (!formData.password) {
      setLocalError('Password is required.');
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
      const result = await login({ email: formData.email, password: formData.password }, 'admin');

      if (result.success) {
        success('Login successful. Welcome, Admin!');
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1500);
      } else {
        setLocalError(result.error || 'Authentication failed');
      }
    } catch (error) {
      setLocalError('Authentication error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper role-admin">
      {isLoading && <LoadingOverlay message="Authenticating admin session..." />}
      
      {/* Visual Panel - Left Side */}
      <div className="visual-panel">
        <div className="visual-content">
          <div className="logo-container">
            <img src="/assets/images/school-logo.png" alt="CSUCC Logo" className="csucc-logo-main" />
          </div>

          <h2 className="uni-name">Caraga State University</h2>
          <h1 className="campus-name">Cabadbaran City<br />Campus</h1>

          <div className="desc-text">
            <strong>Restricted Administrative Access</strong>
            <br />
            System control, user management, and comprehensive campus-wide reports.
          </div>

          <div className="info-section">
            <p>Admin Functions:</p>
            <ul>
              <li>
                <CheckCircleIcon />
                <span>User & Access Management</span>
              </li>
              <li>
                <SettingsIcon />
                <span>System Configuration & Tools</span>
              </li>
              <li>
                <ChartBarIcon />
                <span>Advanced Data Analytics</span>
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
          <div className="admin-badge-notice">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            ADMINISTRATOR ONLY
          </div>

          <div className="welcome-text">
            <h2>Admin Login</h2>
            <p>Please authenticate your session.</p>
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
              <label>Admin ID or Email</label>
            </div>

            <div className="input-field">
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required spellCheck="false" placeholder=" " />
              <label>Secure Password</label>
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                <EyeIcon />
              </button>
            </div>

            <button type="submit" className="btn-submit btn-submit--admin" disabled={isLoading}>
              {isLoading ? 'Authenticating...' : 'Authenticate'}
            </button>
          </form>

          <div className="footer-nav">
            <Link to="/login">← Back to Main Portal</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
