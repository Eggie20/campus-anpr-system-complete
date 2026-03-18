import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useNotification } from '../../../../contexts/NotificationContext';

export default function ForgotPassword() {
  const { toggleTheme, isDark } = useTheme();
  const { showNotification } = useNotification();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSent(true);
      showNotification(`If an account exists for ${email}, a reset link has been sent.`, 'success');
      
      // Reset form after showing success
      setTimeout(() => {
        setIsSent(false);
        setEmail('');
      }, 3000);
      
    } catch (error) {
      showNotification('Failed to send reset link', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper role-forgot">
      {/* Visual Panel */}
      <div className="visual-panel visual-panel--forgot">
        <div className="visual-content">
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
            <strong>Password Recovery</strong>
            <br />
            Forgot your credentials? Enter your registered email address and we'll send you a link to reset your password.
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="form-panel">
        <div className="header-controls">
          <button 
            className="theme-btn" 
            onClick={toggleTheme}
            aria-label="Toggle Dark Mode"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>

        <div className="form-container">
          <div className="welcome-text">
            <h2>Forgot Password?</h2>
            <p>Don't worry, it happens to the best of us.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-field">
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                spellCheck="false"
                placeholder=" "
              />
              <label>Registered Email Address</label>
            </div>

            <button 
              type="submit" 
              className={`btn-submit btn-submit--forgot ${isSent ? 'btn-submit--success' : ''}`}
              disabled={isLoading}
              style={{ marginTop: '1rem' }}
            >
              {isLoading ? 'Sending...' : isSent ? 'Sent!' : 'Send Reset Link'}
            </button>
            
            <div className="login-redirect">
              Remember your password? <Link to="/login">Back to Login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
