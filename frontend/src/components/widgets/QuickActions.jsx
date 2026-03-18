import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

/**
 * QuickActions - Grid of quick action buttons/links
 * 
 * @param {Object} props
 * @param {Array} props.actions - Array of action items
 */
export default function QuickActions({ actions = [] }) {
  return (
    <div className="quick-actions-grid">
      {actions.map((action, index) => {
        const content = (
          <>
            <div className={`quick-action__icon ${action.iconClass || ''}`}>
              {action.icon}
            </div>
            <span className="quick-action__label">{action.label}</span>
          </>
        );

        // Render as Link if path provided, otherwise as button
        if (action.path) {
          return (
            <Link key={index} to={action.path} className="quick-action">
              {content}
            </Link>
          );
        }

        return (
          <button 
            key={index} 
            className="quick-action"
            onClick={action.onClick}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}

QuickActions.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.shape({
    icon: PropTypes.string.isRequired,
    iconClass: PropTypes.string,
    label: PropTypes.string.isRequired,
    path: PropTypes.string,
    onClick: PropTypes.func
  }))
};
