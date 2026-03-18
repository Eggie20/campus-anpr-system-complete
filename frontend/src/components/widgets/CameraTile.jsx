import PropTypes from 'prop-types';

/**
 * CameraTile - Camera status indicator tile
 * 
 * @param {Object} props
 * @param {string} props.name - Camera name/location
 * @param {string} props.status - 'online' | 'offline' | 'recording'
 * @param {string} props.imageUrl - Optional camera preview image
 */
export default function CameraTile({ name, status = 'online', imageUrl }) {
  return (
    <div className="camera-tile">
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="camera-tile__image" />
      ) : (
        <div className="camera-tile__placeholder">📹</div>
      )}
      <div className={`camera-tile__status camera-tile__status--${status}`} />
      <div className="camera-tile__label">{name}</div>
    </div>
  );
}

CameraTile.propTypes = {
  name: PropTypes.string.isRequired,
  status: PropTypes.oneOf(['online', 'offline', 'recording']),
  imageUrl: PropTypes.string
};
