import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

/**
 * DashboardWidget - Container component for dashboard widgets
 * 
 * @param {Object} props
 * @param {string} props.title - Widget title
 * @param {string} props.icon - Title icon
 * @param {string} props.actionText - Action link text
 * @param {string} props.actionLink - Action link path
 * @param {boolean} props.flush - Remove body padding
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Widget content
 */
export default function DashboardWidget({ 
  title, 
  icon, 
  actionText, 
  actionLink, 
  flush = false,
  className = '',
  children 
}) {
  return (
    <div className={`dashboard-widget ${className}`}>
      <div className="dashboard-widget__header">
        <h3 className="dashboard-widget__title">
          {icon && <span className="dashboard-widget__title-icon">{icon}</span>}
          {title}
        </h3>
        {actionText && actionLink && (
          <Link to={actionLink} className="dashboard-widget__action">
            {actionText} →
          </Link>
        )}
      </div>
      <div className={`dashboard-widget__body ${flush ? 'dashboard-widget__body--flush' : ''}`}>
        {children}
      </div>
    </div>
  );
}

DashboardWidget.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string,
  actionText: PropTypes.string,
  actionLink: PropTypes.string,
  flush: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node
};
