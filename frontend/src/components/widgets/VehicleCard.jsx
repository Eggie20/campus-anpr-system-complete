import PropTypes from 'prop-types';

/**
 * VehicleCard - Enhanced vehicle display card
 * 
 * @param {Object} props
 * @param {string} props.type - Vehicle type icon
 * @param {string} props.plateNumber - License plate
 * @param {string} props.model - Vehicle make/model
 * @param {string} props.status - 'active' | 'pending' | 'expired'
 * @param {Object} props.details - Additional details {registered, expires}
 */
export default function VehicleCard({ type, plateNumber, model, status = 'active', details = {} }) {
  const getStatusBadge = () => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'expired': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="vehicle-card-enhanced">
      <div className="vehicle-card-enhanced__header">
        <div className="vehicle-card-enhanced__icon widget-icon--success">{type}</div>
        <span className={`badge ${getStatusBadge()}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
      <div className="vehicle-card-enhanced__plate">{plateNumber}</div>
      <div className="vehicle-card-enhanced__model">{model}</div>
      {(details.registered || details.expires) && (
        <div className="vehicle-card-enhanced__details">
          {details.registered && (
            <div className="vehicle-card-enhanced__detail">
              <span className="vehicle-card-enhanced__detail-label">Registered</span>
              <span className="vehicle-card-enhanced__detail-value">{details.registered}</span>
            </div>
          )}
          {details.expires && (
            <div className="vehicle-card-enhanced__detail">
              <span className="vehicle-card-enhanced__detail-label">Expires</span>
              <span className="vehicle-card-enhanced__detail-value">{details.expires}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

VehicleCard.propTypes = {
  type: PropTypes.string.isRequired,
  plateNumber: PropTypes.string.isRequired,
  model: PropTypes.string.isRequired,
  status: PropTypes.oneOf(['active', 'pending', 'expired']),
  details: PropTypes.shape({
    registered: PropTypes.string,
    expires: PropTypes.string
  })
};
