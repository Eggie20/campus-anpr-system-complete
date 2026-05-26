import PropTypes from 'prop-types';

/**
 * ActivityFeed - Timeline of recent activities
 * 
 * @param {Object} props
 * @param {Array} props.activities - Array of activity items
 */
export default function ActivityFeed({ activities = [] }) {
  const getIconClass = (type) => {
    switch (type) {
      case 'entry': return 'activity-item__icon--entry';
      case 'exit': return 'activity-item__icon--exit';
      case 'alert': return 'activity-item__icon--alert';
      case 'system': return 'activity-item__icon--system';
      default: return '';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'entry': return '📥';
      case 'exit': return '📤';
      case 'alert': return '⚠️';
      case 'system': return '⚙️';
      default: return '📌';
    }
  };

  if (activities.length === 0) {
    return (
      <div className="widget-no-data">No recent activity</div>
    );
  }

  return (
    <div className="activity-feed">
      {activities.map((activity, index) => (
        <div key={index} className="activity-item">
          <div className={`activity-item__icon ${getIconClass(activity.type)}`}>
            {activity.icon || getIcon(activity.type)}
          </div>
          <div className="activity-item__content">
            <div
              className="activity-item__text"
              dangerouslySetInnerHTML={{ __html: activity.text }}
            />
            <div className="activity-item__time">{activity.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

ActivityFeed.propTypes = {
  activities: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.oneOf(['entry', 'exit', 'alert', 'system']),
    icon: PropTypes.string,
    text: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired
  }))
};
