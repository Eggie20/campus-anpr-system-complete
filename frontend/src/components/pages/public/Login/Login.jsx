import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useNotification } from '../../../../contexts/NotificationContext';
import { LoadingOverlay } from '../../../common/Loading/Loading';

// SVG Icons as components
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
  <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UserIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { success, error: showError } = useNotification();

  const [formData, setFormData] = useState({
    role: '',
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  // Email validation regex
  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  // ID Number validation (format: YYYY-NNNN or alphanumeric with minimum 4 chars)
  const validateIdNumber = (id) => {
    // Common ID formats: 2024-0001, ST-2024-001, EMP-001, etc.
    const idPatterns = [
      /^\d{4}-\d{4}$/, // Standard: 2024-0001
      /^[A-Z]{2,4}-\d{4}-\d{3,4}$/i, // Prefixed: ST-2024-001
      /^[A-Z]{2,4}-\d{3,6}$/i, // Short prefix: EMP-001
      /^[A-Za-z0-9]{4,20}$/ // General alphanumeric (fallback)
    ];
    return idPatterns.some(pattern => pattern.test(id.trim()));
  };

  // Password validation (minimum 8 characters)
  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error message once user starts correcting the input
    if (localError) setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Role selection required
    if (!formData.role) {
      setLocalError('Please select your profile type.');
      return;
    }

    // 2. Email/ID field empty
    if (!formData.email) {
      setLocalError('ID Number or Email is required.');
      return;
    }

    // 3. Password field empty
    if (!formData.password) {
      setLocalError('Password is required.');
      return;
    }

    // 4. Password minimum length check
    if (!validatePassword(formData.password)) {
      setLocalError('Password must be at least 8 characters long.');
      return;
    }

    // 5. Identification format validation (Email or ID Number)
    const identifier = formData.email.trim();
    const isEmail = identifier.includes('@');

    if (isEmail) {
      // Validate email format
      if (!validateEmail(identifier)) {
        setLocalError('Please enter a valid email address.');
        return;
      }
    } else {
      // Validate ID number format for students
      if (formData.role === 'student' && !validateIdNumber(identifier)) {
        setLocalError('Please enter a valid ID number (e.g., 2024-0001).');
        return;
      }
    }

    setIsLoading(true);
    setLocalError('');

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      if (result.success) {
        const userRole = result.user?.role || formData.role;
        success(`Login successful. Welcome, ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}!`);

        // Navigate based on role
        setTimeout(() => {
          switch (userRole) {
            case 'admin':
              navigate('/admin/dashboard');
              break;
            case 'security':
              navigate('/security/dashboard');
              break;
            case 'staff':
              navigate('/staff/dashboard');
              break;
            case 'visitor':
              navigate('/visitor/dashboard');
              break;
            default:
              navigate('/dashboard');
          }
        }, 1500);
      } else {
        // Here result.error contains the messages from the backend (4 and 5)
        setLocalError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setLocalError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {isLoading && <LoadingOverlay message="Authenticating credentials..." />}
      {/* Visual Panel - Left Side */}
      <div className="visual-panel">
        <div className="visual-content">
          {/* Logo */}
          <div className="logo-container">
            <img
              src="/assets/images/school-logo.png"
              alt="CSUCC Logo"
              className="csucc-logo-main"
            />
          </div>

          <h2 className="uni-name">Caraga State University</h2>
          <h1 className="campus-name">Cabadbaran City<br />Campus</h1>

          <div className="desc-text">
            <strong>Welcome to the CSUCC ANPR Portal</strong>
            <br />
            A secure automated system for vehicle identification and campus access management.
          </div>

          <div className="info-section">
            <p>Portal Features:</p>
            <ul>
              <li>
                <CheckCircleIcon />
                <span>Vehicle Registration & Management</span>
              </li>
              <li>
                <ClockIcon />
                <span>Real-time Entry/Exit Logs</span>
              </li>
              <li>
                <UserIcon />
                <span>Faculty & Student Profile Access</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Form Panel - Right Side */}
      <div className="form-panel">
        <div className="header-controls">
          <button
            className="theme-btn"
            onClick={toggleTheme}
            aria-label="Toggle Dark Mode"
          >
            <SunIcon />
            <MoonIcon />
          </button>
        </div>

        <div className="form-container">
          <div className="welcome-text">
            <h2>Portal Login</h2>
            <p>Please sign in to continue.</p>
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
            {/* Role Selector */}
            <div className="input-field">
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                data-valid={formData.role ? 'true' : 'false'}
              >
                <option value="" disabled hidden></option>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="staff">Staff</option>
                <option value="visitor">Visitor</option>
              </select>
              <label htmlFor="role">Select Your Profile</label>
            </div>

            {/* Email / ID Input */}
            <div className="input-field">
              <input
                type="text"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                spellCheck="false"
                autoComplete="email"
              />
              <label htmlFor="email">ID Number or Email</label>
            </div>

            {/* Password Input */}
            <div className="input-field">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                spellCheck="false"
                autoComplete="current-password"
              />
              <label htmlFor="password">Password</label>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon />
              </button>
            </div>

            {/* Remember Me & Recovery */}
            <div className="login-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="recovery-link">Recovery</Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-submit"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Register Link */}
            <div className="register-prompt">
              Don't have an account? <Link to="/register">Register here</Link>.
            </div>
          </form>

          {/* Footer Navigation */}
          <div className="footer-nav">
            <Link to="/admin-login">Admin</Link>
            <span className="divider">|</span>
            <Link to="/security-login">Security</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
