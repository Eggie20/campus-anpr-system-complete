import PropTypes from 'prop-types';

/**
 * StatWidget - Statistics display card with icon, value, label, and trend
 * 
 * @param {Object} props
 * @param {string} props.icon - Emoji icon
 * @param {string|number} props.value - Main value to display
 * @param {string} props.label - Description label
 * @param {string} props.trend - Trend indicator (e.g., "↑ 12%")
 * @param {string} props.trendDirection - 'up' | 'down' | 'neutral'
 * @param {string} props.variant - 'info' | 'success' | 'warning' | 'danger' | 'secondary'
 * @param {boolean} props.animate - Whether to animate count
 */
export default function StatWidget({ 
  icon, 
  value, 
  label, 
  trend, 
  trendDirection = 'up',
  variant = 'info',
  animate = false 
}) {
  return (
    <div className={`stat-widget stat-widget--${variant}`}>
      <div className="stat-widget__header">
        <div className="stat-widget__icon">{icon}</div>
        {trend && (
          <span className={`stat-widget__trend stat-widget__trend--${trendDirection}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="stat-widget__value" data-count={animate ? value : undefined}>
        {value}
      </div>
      <div className="stat-widget__label">{label}</div>
    </div>
  );
}

StatWidget.propTypes = {
  icon: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
  trend: PropTypes.string,
  trendDirection: PropTypes.oneOf(['up', 'down', 'neutral']),
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'danger', 'secondary']),
  animate: PropTypes.bool
};
