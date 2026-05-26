import PropTypes from 'prop-types';
import { useTheme } from '../../../contexts/ThemeContext';
import './LogoutModal.css';

export default function LogoutModal({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title = "Confirm Logout", 
  message = "Are you sure you want to end your secure session?" 
}) {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isDark ? 'dark' : 'light'}`}>
      <div className="modal-content logout-modal">
        <div className="modal-icon-container">
          <div className="modal-icon-glow"></div>
          <div className="modal-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </div>
        </div>
        <div className="modal-texts">
          <h3 className="modal-title">{title}</h3>
          <p className="modal-desc">{message}</p>
        </div>
        <div className="modal-actions-premium">
          <button className="btn-premium-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn-premium-logout" onClick={onConfirm}>End Session</button>
        </div>
      </div>
    </div>
  );
}

LogoutModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string
};
