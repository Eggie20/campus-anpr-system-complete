import PropTypes from 'prop-types';

/**
 * MiniTable - Compact data table for dashboards with avatars
 * 
 * @param {Object} props
 * @param {Array} props.rows - Array of row data
 */
export default function MiniTable({ rows = [] }) {
  if (rows.length === 0) {
    return (
      <div className="widget-no-data">No data available</div>
    );
  }

  return (
    <div className="mini-table">
      {rows.map((row, index) => (
        <div key={index} className="mini-table__row">
          <div className={`mini-table__avatar ${row.avatarClass || ''}`}>
            {row.avatar}
          </div>
          <div className="mini-table__content">
            <div className="mini-table__primary">{row.primary}</div>
            <div className="mini-table__secondary">{row.secondary}</div>
          </div>
          {row.badge && (
            <div className="mini-table__meta">
              <span className={`badge ${row.badgeClass || 'badge-primary'}`}>
                {row.badge}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

MiniTable.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.shape({
    avatar: PropTypes.string.isRequired,
    avatarClass: PropTypes.string,
    primary: PropTypes.string.isRequired,
    secondary: PropTypes.string,
    badge: PropTypes.string,
    badgeClass: PropTypes.string
  }))
};
