import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { useState } from 'react';

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
 * @param {boolean} props.collapsible - Whether the widget can be collapsed
 * @param {boolean} props.defaultCollapsed - Initial collapsed state
 * @param {React.ReactNode} props.children - Widget content
 */
export default function DashboardWidget({ 
  title, 
  icon, 
  actionText, 
  actionLink, 
  flush = false,
  className = '',
  collapsible = false,
  defaultCollapsed = false,
  children 
}) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div className={`dashboard-widget ${className}`}>
      <div className="dashboard-widget__header" style={collapsible ? { cursor: 'pointer' } : {}} onClick={() => collapsible && setIsCollapsed(!isCollapsed)}>
        <h3 className="dashboard-widget__title">
          {icon && <span className="dashboard-widget__title-icon">{icon}</span>}
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {actionText && actionLink && (
            <Link to={actionLink} className="dashboard-widget__action" onClick={(e) => e.stopPropagation()}>
              {actionText} →
            </Link>
          )}
          {collapsible && (
            <button className="text-muted hover:text-white transition-colors flex items-center justify-center p-1 rounded-md" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>
                {isCollapsed ? 'expand_more' : 'expand_less'}
              </span>
            </button>
          )}
        </div>
      </div>
      {!isCollapsed && (
        <div className={`dashboard-widget__body ${flush ? 'dashboard-widget__body--flush' : ''}`}>
          {children}
        </div>
      )}
    </div>
  );
}

DashboardWidget.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.node,
  actionText: PropTypes.string,
  actionLink: PropTypes.string,
  flush: PropTypes.bool,
  className: PropTypes.string,
  collapsible: PropTypes.bool,
  defaultCollapsed: PropTypes.bool,
  children: PropTypes.node
};
