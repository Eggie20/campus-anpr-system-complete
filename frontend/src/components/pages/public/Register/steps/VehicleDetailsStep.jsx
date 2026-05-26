import PropTypes from 'prop-types';
import { VEHICLE_TYPES, VEHICLE_BRANDS, VEHICLE_COLORS } from '../../../../../constants/vehicleConstants';

// Vehicle types from shared constants (type field uses 'value' for DB enum)
const REG_VEHICLE_TYPES = VEHICLE_TYPES.map(v => ({ type: v.value, icon: v.icon, label: v.label }));

const COURSES = [
  'BS in Information Technology (BSIT)',
  'BS in Computer Science (BSCS)',
  'BS in Computer Engineering (BSCpE)',
  'BS in Electrical Engineering (BSEE)',
  'BS in Electronics Engineering (BSECE)',
  'BS in Industrial Technology (BSIT)',
  'BS in Tourism Management (BSTM)',
  'BS in Hospitality Management (BSHM)',
  'Bachelor of Elementary Education (BEEd)',
  'Bachelor of Secondary Education (BSEd)',
  'BA in English Language (ABEL)',
  'BA in Political Science (AB PoS)',
  'Other Program'
];

const SECTIONS = ['Block A', 'Block B', 'Block C'];

const YEAR_LEVELS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  '5th Year'
];

const EMPLOYMENT_TYPES = ['Full-time', 'Contract Service'];
const STAFF_STATUS = ['Full-time', 'Contract Service'];

const VISITOR_PURPOSES = [
  'Official Business',
  'Personal Visit',
  'Delivery / Courier',
  'Maintenance / Service',
  'Event / Seminar',
  'Other'
];


export default function VehicleDetailsStep({ formData, errors, updateFormData, onNext, onBack }) {
  return (
    <div className="form-step active">
      <div className="step-content-scroll">

        {/* ANPR ANOMALY BANNERS */}
        {formData.anprFlagged && (
          <div className="anomaly-banners">
            <div className="banner banner-orange">
              <span className="banner-icon">⚠️</span>
              <div className="banner-content">
                <div className="banner-title">ANPR SYSTEM FLAG</div>
                <div className="banner-msg">{formData.anprFlagMsg}</div>
              </div>
            </div>
            <div className="banner banner-green">
              <span className="banner-icon">✅</span>
              <div className="banner-content">
                <div className="banner-msg">This flag will be automatically resolved upon successful registration and security review.</div>
              </div>
            </div>
          </div>
        )}

        {/* ROLE SPECIFIC INFORMATION */}
        <div className="step-section">
          {formData.relationship === 'student' && (
            <>
              <div className="form-section-header">STUDENT DETAILS</div>
              <div className="form-grid">
                <div className="form-group col-3">
                  <label className="field-label required">STUDENT ID</label>
                  <input
                    type="text"
                    className={`field-input ${errors.studentId ? 'error' : ''}`}
                    placeholder="e.g. 2021-00001"
                    value={formData.studentId || ''}
                    onChange={(e) => updateFormData('studentId', e.target.value)}
                  />
                  {errors.studentId && <div className="field-error">{errors.studentId}</div>}
                </div>
                <div className="form-group col-3">
                  <label className="field-label required">COURSE / PROGRAM</label>
                  <select
                    className={`field-input ${errors.course ? 'error' : ''}`}
                    value={formData.course || ''}
                    onChange={(e) => updateFormData('course', e.target.value)}
                  >
                    <option value="" disabled>Select Course</option>
                    {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.course && <div className="field-error">{errors.course}</div>}
                </div>
                {formData.course === 'Other Program' && (
                  <div className="form-group col-3" style={{ animation: 'fadeIn 0.3s ease' }}>
                    <label className="field-label required">SPECIFY PROGRAM</label>
                    <input
                      type="text"
                      className="field-input"
                      placeholder="e.g. BS in Architecture"
                      value={formData.otherCourse || ''}
                      onChange={(e) => updateFormData('otherCourse', e.target.value)}
                      autoFocus
                    />
                  </div>
                )}
                <div className="form-group col-3">
                  <label className="field-label required">YEAR LEVEL</label>
                  <select
                    className={`field-input ${errors.yearLevel ? 'error' : ''}`}
                    value={formData.yearLevel || ''}
                    onChange={(e) => updateFormData('yearLevel', e.target.value)}
                  >
                    <option value="" disabled>Select Year</option>
                    {YEAR_LEVELS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  {errors.yearLevel && <div className="field-error">{errors.yearLevel}</div>}
                </div>
                <div className="form-group col-3">
                  <label className="field-label required">SECTION</label>
                  <select
                    className={`field-input ${errors.section ? 'error' : ''}`}
                    value={formData.section || ''}
                    onChange={(e) => updateFormData('section', e.target.value)}
                  >
                    <option value="" disabled>Select Section</option>
                    {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.section && <div className="field-error">{errors.section}</div>}
                </div>
              </div>
            </>
          )}

          {formData.relationship === 'faculty' && (
            <>
              <div className="form-section-header">FACULTY DETAILS</div>
              <div className="form-grid">
                <div className="form-group col-6">
                  <label className="field-label required">FACULTY ID</label>
                  <input
                    type="text"
                    className={`field-input ${errors.facultyId ? 'error' : ''}`}
                    placeholder="e.g. FAC-2023-001"
                    value={formData.facultyId || ''}
                    onChange={(e) => updateFormData('facultyId', e.target.value)}
                  />
                  {errors.facultyId && <div className="field-error">{errors.facultyId}</div>}
                </div>
                <div className="form-group col-6">
                  <label className="field-label required">DEPARTMENT</label>
                  <input
                    type="text"
                    className={`field-input ${errors.department ? 'error' : ''}`}
                    placeholder="e.g. CCIS"
                    value={formData.department || ''}
                    onChange={(e) => updateFormData('department', e.target.value)}
                  />
                  {errors.department && <div className="field-error">{errors.department}</div>}
                </div>
                <div className="form-group col-6">
                  <label className="field-label required">POSITION / RANK</label>
                  <input
                    type="text"
                    className={`field-input ${errors.position ? 'error' : ''}`}
                    placeholder="e.g. Assistant Professor"
                    value={formData.position || ''}
                    onChange={(e) => updateFormData('position', e.target.value)}
                  />
                  {errors.position && <div className="field-error">{errors.position}</div>}
                </div>
                <div className="form-group col-6">
                  <label className="field-label required">EMPLOYMENT TYPE</label>
                  <select
                    className={`field-input ${errors.employmentType ? 'error' : ''}`}
                    value={formData.employmentType || ''}
                    onChange={(e) => updateFormData('employmentType', e.target.value)}
                  >
                    <option value="" disabled>Select Type</option>
                    {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.employmentType && <div className="field-error">{errors.employmentType}</div>}
                </div>
              </div>
            </>
          )}

          {formData.relationship === 'staff' && (
            <>
              <div className="form-section-header">STAFF DETAILS</div>
              <div className="form-grid">
                <div className="form-group col-6">
                  <label className="field-label required">STAFF ID</label>
                  <input
                    type="text"
                    className={`field-input ${errors.staffId ? 'error' : ''}`}
                    placeholder="e.g. STF-2023-001"
                    value={formData.staffId || ''}
                    onChange={(e) => updateFormData('staffId', e.target.value)}
                  />
                  {errors.staffId && <div className="field-error">{errors.staffId}</div>}
                </div>
                <div className="form-group col-6">
                  <label className="field-label required">DEPARTMENT</label>
                  <input
                    type="text"
                    className={`field-input ${errors.staffDepartment ? 'error' : ''}`}
                    placeholder="e.g. Registrar's Office"
                    value={formData.staffDepartment || ''}
                    onChange={(e) => updateFormData('staffDepartment', e.target.value)}
                  />
                  {errors.staffDepartment && <div className="field-error">{errors.staffDepartment}</div>}
                </div>
                <div className="form-group col-6">
                  <label className="field-label required">JOB TITLE</label>
                  <input
                    type="text"
                    className={`field-input ${errors.jobTitle ? 'error' : ''}`}
                    placeholder="e.g. Office Assistant"
                    value={formData.jobTitle || ''}
                    onChange={(e) => updateFormData('jobTitle', e.target.value)}
                  />
                  {errors.jobTitle && <div className="field-error">{errors.jobTitle}</div>}
                </div>
                <div className="form-group col-6">
                  <label className="field-label required">STATUS</label>
                  <select
                    className={`field-input ${errors.employmentStatus ? 'error' : ''}`}
                    value={formData.employmentStatus || ''}
                    onChange={(e) => updateFormData('employmentStatus', e.target.value)}
                  >
                    <option value="" disabled>Select Status</option>
                    {STAFF_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.employmentStatus && <div className="field-error">{errors.employmentStatus}</div>}
                </div>
              </div>
            </>
          )}

          {formData.relationship === 'visitor' && (
            <>
              <div className="form-section-header">VISITOR DETAILS</div>
              <div className="form-grid">
                <div className="form-group col-6">
                  <label className="field-label required">MAIN PURPOSE</label>
                  <select
                    className={`field-input ${errors.visitorPurpose ? 'error' : ''}`}
                    value={formData.visitorPurpose || ''}
                    onChange={(e) => updateFormData('visitorPurpose', e.target.value)}
                  >
                    <option value="" disabled>Select Purpose</option>
                    {VISITOR_PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group col-6">
                  <label className="field-label required">PERSON TO VISIT (HOST)</label>
                  <input
                    type="text"
                    className={`field-input ${errors.visitorHost ? 'error' : ''}`}
                    placeholder="e.g. Dr. Juan Dela Cruz"
                    value={formData.visitorHost || ''}
                    onChange={(e) => updateFormData('visitorHost', e.target.value)}
                  />
                </div>
                <div className="form-group col-12">
                  <label className="field-label required">REASON FOR ENTRY</label>
                  <textarea
                    className={`field-input ${errors.visitorReason ? 'error' : ''}`}
                    placeholder={formData.visitorPurpose === 'Delivery / Courier' ? "Item to be delivered..." : "Briefly describe your reason for visiting..."}
                    rows="2"
                    value={formData.visitorReason || ''}
                    onChange={(e) => updateFormData('visitorReason', e.target.value)}
                  ></textarea>
                </div>
                <div className="form-group col-12">
                  <label className="field-label required">VALID ID TYPE</label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="e.g. National ID"
                    value={formData.visitorValidId || ''}
                    onChange={(e) => updateFormData('visitorValidId', e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* VEHICLE REGISTRATION */}
        <div className="step-section">
          <div className="form-section-header">VEHICLE REGISTRATION</div>

          <div className="vehicle-card-wrapper">
            <div className="vehicle-card-index">Vehicle #1</div>

            <div className="form-group">
              <label className="field-label required">VEHICLE TYPE</label>
              <div className="vehicle-type-grid">
                {REG_VEHICLE_TYPES.map((v) => (
                  <div
                    key={v.type}
                    className={`vehicle-opt ${formData.vehicleType === v.type ? 'active' : ''}`}
                    onClick={() => updateFormData('vehicleType', v.type)}
                  >
                    <div className="v-icon">{v.icon}</div>
                    <div className="v-label">{v.label}</div>
                    <div className="v-check">✓</div>
                  </div>
                ))}
              </div>
            </div>

            {/* DYNAMIC OTHERS FIELD */}
            {formData.vehicleType === 'other' && (
              <div className="form-group col-12" style={{ marginBottom: '24px', animation: 'fadeIn 0.3s ease' }}>
                <label className="field-label required">SPECIFY VEHICLE TYPE</label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="e.g. Tricycle, Bicycle, ATV"
                  value={formData.otherVehicleType || ''}
                  onChange={(e) => updateFormData('otherVehicleType', e.target.value)}
                  autoFocus
                />
              </div>
            )}

            <div className="form-grid">
              <div className="form-group col-3">
                <label className="field-label required">PLATE NUMBER</label>
                <input
                  type="text"
                  className={`field-input plate-input ${errors.plateNumber ? 'error' : ''}`}
                  placeholder="E.G. ABC 1234"
                  value={formData.plateNumber}
                  onChange={(e) => updateFormData('plateNumber', e.target.value.toUpperCase())}
                  style={{ textTransform: 'uppercase' }}
                />
                {errors.plateNumber && <div className="field-error">{errors.plateNumber}</div>}
              </div>

              <div className="form-group col-3">
                <label className="field-label required">VEHICLE BRAND</label>
                <select
                  className={`field-input ${errors.brand ? 'error' : ''}`}
                  value={formData.brand}
                  onChange={(e) => updateFormData('brand', e.target.value)}
                >
                  <option value="" disabled>Select Brand</option>
                  {VEHICLE_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  <option value="Other">Other (not listed)</option>
                </select>
                {errors.brand && <div className="field-error">{errors.brand}</div>}
              </div>

              {formData.brand === 'Other' && (
                <div className="form-group col-3" style={{ animation: 'fadeIn 0.3s ease' }}>
                  <label className="field-label required">SPECIFY BRAND</label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="e.g. Tesla, Rivian"
                    value={formData.otherBrand || ''}
                    onChange={(e) => updateFormData('otherBrand', e.target.value)}
                    autoFocus
                  />
                </div>
              )}

              <div className="form-group col-3">
                <label className="field-label required">COLOR</label>
                <select
                  className={`field-input ${errors.color ? 'error' : ''}`}
                  value={formData.color}
                  onChange={(e) => updateFormData('color', e.target.value)}
                >
                  <option value="" disabled>Select Color</option>
                  {VEHICLE_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="Other">Other (not listed)</option>
                </select>
                {errors.color && <div className="field-error">{errors.color}</div>}
              </div>
            </div>

            <div className="field-hint" style={{ marginTop: '16px', color: 'var(--text-tertiary)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-tertiary)', opacity: 0.5 }}></div>
              Enter plate number to check ANPR status
            </div>

            {/* OR/CR Upload (Optional) */}
            <div className="form-group col-12" style={{ marginTop: '24px' }}>
              <label className="field-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                OR/CR DOCUMENT
                <span style={{
                  fontSize: '9px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'var(--text-muted)',
                  fontWeight: 700,
                  letterSpacing: '0.1em'
                }}>OPTIONAL</span>
              </label>
              <div
                style={{
                  border: `1.5px dashed ${formData.orcrFile ? 'var(--green)' : 'var(--border)'}`,
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: formData.orcrFile ? 'rgba(16, 185, 129, 0.04)' : 'transparent'
                }}
                onClick={() => document.getElementById('orcr-file-input').click()}
              >
                <input
                  id="orcr-file-input"
                  type="file"
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    updateFormData('orcrFile', file);
                  }}
                />
                {formData.orcrFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <span style={{ color: 'var(--green)', fontSize: '16px' }}>✓</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {formData.orcrFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={(ev) => { ev.stopPropagation(); updateFormData('orcrFile', null); }}
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: 'none',
                        color: '#ef4444',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >Remove</button>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>📄</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      Upload OR/CR — Click or drag
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Accepted: JPG, PNG, PDF • Max 5MB
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onBack}>Back</button>
        <div className="form-actions-right">
          <button type="button" className="btn btn-next" onClick={onNext}>Continue</button>
        </div>
      </div>
    </div>
  );
}

VehicleDetailsStep.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired
};
