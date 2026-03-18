import PropTypes from 'prop-types';

const VEHICLE_TYPES = [
  { type: 'car', icon: '🚗', label: 'Car' },
  { type: 'motorcycle', icon: '🏍️', label: 'Motorcycle' },
  { type: 'truck', icon: '🚚', label: 'Truck' },
  { type: 'van', icon: '🚐', label: 'Van' }
];

export default function VehicleDetailsStep({ formData, errors, updateFormData }) {
  return (
    <div className="form-step active" data-step="2">
      <div className="step-header">
        <h2>Vehicle Details</h2>
        <p>Tell us about your vehicle</p>
      </div>

      {/* Vehicle Type Grid */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label required">Vehicle Type</label>
          <div className="vehicle-type-grid">
            {VEHICLE_TYPES.map((vehicle) => (
              <div
                key={vehicle.type}
                className={`vehicle-type-option ${formData.vehicleType === vehicle.type ? 'selected' : ''}`}
                onClick={() => updateFormData('vehicleType', vehicle.type)}
              >
                <div className="vehicle-type-icon">{vehicle.icon}</div>
                <div className="vehicle-type-label">{vehicle.label}</div>
              </div>
            ))}
          </div>
          {errors.vehicleType && <div className="error-message show">{errors.vehicleType}</div>}
        </div>
      </div>

      {/* Plate Number */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="plateNumber" className="form-label required">License Plate Number</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="plateNumber"
              name="plateNumber"
              className={`form-input plate-input ${errors.plateNumber ? 'error' : ''}`}
              placeholder="ABC 1234"
              value={formData.plateNumber}
              onChange={(e) => updateFormData('plateNumber', e.target.value.toUpperCase())}
              style={{ textTransform: 'uppercase' }}
            />
            <div className="plate-badge">LTO</div>
          </div>
          <div className="form-help">Standard format</div>
          {errors.plateNumber && <div className="error-message show">{errors.plateNumber}</div>}
        </div>
      </div>

      {/* Make & Model */}
      <div className="form-row two-columns">
        <div className="form-group">
          <label htmlFor="make" className="form-label required">Make</label>
          <input
            type="text"
            id="make"
            name="make"
            className={`form-input ${errors.make ? 'error' : ''}`}
            placeholder="e.g. Toyota"
            value={formData.make}
            onChange={(e) => updateFormData('make', e.target.value)}
          />
          {errors.make && <div className="error-message show">{errors.make}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="model" className="form-label required">Model</label>
          <input
            type="text"
            id="model"
            name="model"
            className={`form-input ${errors.model ? 'error' : ''}`}
            placeholder="e.g. Vios"
            value={formData.model}
            onChange={(e) => updateFormData('model', e.target.value)}
          />
          {errors.model && <div className="error-message show">{errors.model}</div>}
        </div>
      </div>

      {/* Year, Color, Engine Number */}
      <div className="form-row three-columns">
        <div className="form-group">
          <label htmlFor="year" className="form-label required">Year</label>
          <input
            type="number"
            id="year"
            name="year"
            className={`form-input ${errors.year ? 'error' : ''}`}
            placeholder="2024"
            value={formData.year}
            onChange={(e) => updateFormData('year', e.target.value)}
            min="1900"
            max="2030"
          />
          {errors.year && <div className="error-message show">{errors.year}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="color" className="form-label required">Color</label>
          <input
            type="text"
            id="color"
            name="color"
            className={`form-input ${errors.color ? 'error' : ''}`}
            placeholder="e.g. Arctic White"
            value={formData.color}
            onChange={(e) => updateFormData('color', e.target.value)}
          />
          {errors.color && <div className="error-message show">{errors.color}</div>}
          {errors.color && <div className="error-message show">{errors.color}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="engineNumber" className="form-label">Engine No.</label>
          <input
            type="text"
            id="engineNumber"
            name="engineNumber"
            className={`form-input ${errors.engineNumber ? 'error' : ''}`}
            placeholder="e.g. 1NZ-FE-XXXXXX"
            value={formData.engineNumber}
            onChange={(e) => updateFormData('engineNumber', e.target.value)}
          />
          {errors.engineNumber && <div className="error-message show">{errors.engineNumber}</div>}
        </div>
      </div>
    </div>
  );
}

VehicleDetailsStep.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired
};
