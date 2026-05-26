import PropTypes from 'prop-types';

/**
 * CameraTile - Camera status indicator tile
 *
 * @param {Object} props
 * @param {string} props.name - Camera name/location
 * @param {string} props.status - 'online' | 'offline' | 'recording'
 * @param {string} props.gate - Gate label (e.g. 'main', 'back')
 * @param {string} props.imageUrl - Optional camera preview image
 */
export default function CameraTile({ name, status = 'online', gate, imageUrl }) {
  const isOnline = status === 'online' || status === 'recording';
  const statusLabel = status === 'recording' ? 'Recording' : isOnline ? 'Online' : 'Offline';

  return (
    <div className="camera-tile" role="status" aria-live="polite">
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="camera-tile__image" />
      ) : (
        <div className="camera-tile__placeholder">📹</div>
      )}
      <div
        className={`camera-tile__status camera-tile__status--${status}`}
        aria-hidden="true"
      />
      <div className="camera-tile__label">{name}</div>
      {gate && (
        <div
          className="camera-tile__gate"
          style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}
        >
          {gate}
        </div>
      )}
      <div
        className="camera-tile__status-text"
        style={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: isOnline ? 'var(--color-success)' : 'var(--color-danger)',
          marginTop: '0.125rem'
        }}
      >
        {statusLabel}
      </div>
    </div>
  );
}

CameraTile.propTypes = {
  name: PropTypes.string.isRequired,
  status: PropTypes.oneOf(['online', 'offline', 'recording']),
  gate: PropTypes.string,
  imageUrl: PropTypes.string
};
