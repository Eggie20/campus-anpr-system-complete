import { useState, useEffect, useRef } from 'react';
import api from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNotification } from '../../../../contexts/NotificationContext';
import { VEHICLE_TYPES, VEHICLE_BRANDS, VEHICLE_COLORS, getVehicleIcon } from '../../../../constants/vehicleConstants';

export default function StudentVehicles() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [removingVehicle, setRemovingVehicle] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [orcrFile, setOrcrFile] = useState(null);
  const [orcrPreview, setOrcrPreview] = useState(null);
  const fileInputRef = useRef(null);
  const { success, error } = useNotification();

  const [formData, setFormData] = useState({ plateNumber: '', type: '', brand: '', color: '' });

  const fetchVehicles = async () => {
    try { const res = await api.get('/vehicles/me'); setVehicles(res.data); }
    catch (err) { console.error(err); error("Could not load vehicles."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetModal = () => {
    setFormData({ plateNumber: '', type: '', brand: '', color: '' });
    setOrcrFile(null); setOrcrPreview(null);
    setShowModal(false); setShowEditModal(false);
    setEditingVehicle(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { error("File too large. Max 5MB."); return; }
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') { error("Only images or PDF allowed."); return; }
    setOrcrFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setOrcrPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else { setOrcrPreview('pdf'); }
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) { const fakeEvent = { target: { files: [file] } }; handleFileChange(fakeEvent); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('plateNumber', formData.plateNumber);
      fd.append('vehicleType', formData.type);
      fd.append('brand', formData.brand);
      fd.append('color', formData.color);
      if (orcrFile) fd.append('orcrPhoto', orcrFile);

      await api.post('/vehicles/register-with-docs', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      success("Vehicle registered! Pending approval.");
      resetModal(); fetchVehicles();
    } catch (err) {
      console.error(err);
      error(err.response?.data?.detail || "Failed to register vehicle.");
    } finally { setSubmitting(false); }
  };

  const handleEditClick = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({ plateNumber: vehicle.plate_number, type: vehicle.type, brand: vehicle.brand, color: vehicle.color || '' });
    setOrcrFile(null);
    setOrcrPreview(vehicle.orcr_photo_path ? 'existing' : null);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.patch(`/vehicles/${editingVehicle.id}`, {
        plate_number: formData.plateNumber, type: formData.type,
        brand: formData.brand, color: formData.color
      });
      if (orcrFile) {
        const fd = new FormData();
        fd.append('orcrPhoto', orcrFile);
        await api.post(`/vehicles/${editingVehicle.id}/upload-orcr`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      success("Vehicle updated!"); resetModal(); fetchVehicles();
    } catch (err) {
      console.error(err);
      error(err.response?.data?.detail || "Failed to update vehicle.");
    } finally { setSubmitting(false); }
  };

  const handleRemoveClick = (v) => { setRemovingVehicle(v); setShowDeleteModal(true); };
  const handleRemoveConfirm = async () => {
    setSubmitting(true);
    try {
      await api.delete(`/vehicles/${removingVehicle.id}`);
      success("Vehicle removed."); setShowDeleteModal(false); setRemovingVehicle(null); fetchVehicles();
    } catch (err) { error("Failed to remove vehicle."); }
    finally { setSubmitting(false); }
  };

  const maxVehicles = 2;
  const remainingSlots = maxVehicles - vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === 'approved').length;
  const pendingVehicles = vehicles.filter(v => v.status === 'pending').length;
  const getRoleID = () => user?.student_id || user?.staff_id || user?.visitor_id || 'N/A';

  /* ─── Shared Vehicle Form (used in both Register & Edit modals) ─── */
  const renderVehicleForm = (isEdit) => (
    <form id="vehicleForm" onSubmit={isEdit ? handleEditSubmit : handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
      {/* Plate Number */}
      <div className="form-group mb-0">
        <label className="form-label">Plate Number</label>
        <input type="text" name="plateNumber" className="form-input premium-editable"
          placeholder="e.g. ABC 1234" value={formData.plateNumber}
          onChange={handleInputChange} required style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }} />
      </div>

      {/* Vehicle Type Grid */}
      <div className="form-group mb-0">
        <label className="form-label">Vehicle Type</label>
        <div className="vehicle-type-grid">
          {VEHICLE_TYPES.map(v => (
            <div key={v.value} className={`vehicle-opt ${formData.type === v.value ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, type: v.value }))}>
              <div className="v-icon">{v.icon}</div>
              <div className="v-label">{v.label}</div>
              <div className="v-check">✓</div>
            </div>
          ))}
        </div>
      </div>

      {/* Brand & Color */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group mb-0">
          <label className="form-label">Brand</label>
          <select name="brand" className="form-input premium-editable" value={formData.brand} onChange={handleInputChange} required style={{ appearance: 'auto' }}>
            <option value="">Select Brand</option>
            {VEHICLE_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group mb-0">
          <label className="form-label">Color</label>
          <select name="color" className="form-input premium-editable" value={formData.color} onChange={handleInputChange} style={{ appearance: 'auto' }}>
            <option value="">Select Color</option>
            {VEHICLE_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* OR/CR Upload */}
      <div className="form-group mb-0">
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-rounded" style={{ fontSize: '18px', color: 'var(--ac)' }}>upload_file</span>
          OR / CR Document
          <span style={{ fontSize: '0.7rem', color: 'var(--t-3)', fontWeight: 400 }}>(Official Receipt / Certificate of Registration)</span>
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          style={{
            border: '2px dashed rgba(var(--ac-rgb, 45, 212, 191), 0.3)',
            borderRadius: '12px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer',
            background: 'rgba(var(--ac-rgb, 45, 212, 191), 0.03)',
            transition: 'all 0.2s ease', minHeight: '120px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFileChange} style={{ display: 'none' }} />
          {orcrPreview && orcrPreview !== 'pdf' && orcrPreview !== 'existing' ? (
            <div style={{ position: 'relative' }}>
              <img src={orcrPreview} alt="OR/CR Preview" style={{ maxHeight: '140px', borderRadius: '8px', objectFit: 'contain' }} />
              <button type="button" onClick={(e) => { e.stopPropagation(); setOrcrFile(null); setOrcrPreview(null); }}
                style={{ position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px', borderRadius: '50%',
                  background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
          ) : orcrPreview === 'pdf' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--t-2)' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '2rem', color: '#ef4444' }}>picture_as_pdf</span>
              <span>{orcrFile?.name || 'PDF Document'}</span>
              <button type="button" onClick={(e) => { e.stopPropagation(); setOrcrFile(null); setOrcrPreview(null); }}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>
          ) : orcrPreview === 'existing' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--ac)' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '2rem' }}>verified</span>
              <span style={{ fontSize: '0.85rem' }}>OR/CR already uploaded — click to replace</span>
            </div>
          ) : (
            <>
              <span className="material-symbols-rounded" style={{ fontSize: '2.5rem', color: 'var(--t-3)', opacity: 0.6 }}>cloud_upload</span>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--t-3)' }}>
                <strong style={{ color: 'var(--ac)' }}>Click to upload</strong> or drag and drop
              </p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--t-3)', opacity: 0.7 }}>PNG, JPG or PDF • Max 5MB</p>
            </>
          )}
        </div>
      </div>
    </form>
  );

  return (
    <div className="premium-dashboard-container">
      {/* Header */}
      <div className="premium-page-header">
        <div>
          <h1>My <span>Vehicles</span> 🚘</h1>
          <p>Manage your registered vehicles and campus access permissions.</p>
        </div>
        <div className="premium-header-meta">
          <div className="premium-id-badge">ID: <strong>{getRoleID()}</strong></div>
          <div className="premium-status-active">System Connected</div>
        </div>
      </div>

      {/* Stats */}
      <div className="premium-stats-grid">
        {[
          { label: 'Total Registered', value: vehicles.length, sub: `of ${maxVehicles} total slots`, cls: 'c1', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 16H9m10 0h3v-3.15a1 1 0 00-.84-.99L16 11l-2.7-3.6a1 1 0 00-.8-.4H5a2 2 0 00-2 2v7h3"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg> },
          { label: 'Active Permits', value: activeVehicles, sub: 'Verified', cls: 'c2', subCls: 'up', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg> },
          { label: 'Pending Approval', value: pendingVehicles, sub: 'Awaiting review', cls: 'c3', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> },
          { label: 'Available Slots', value: remainingSlots, sub: `Slot${remainingSlots !== 1 ? 's' : ''} left`, cls: 'c4', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m-7-7h14"/></svg> },
        ].map((s, i) => (
          <div key={i} className={`premium-stat-card ${s.cls}`}>
            <div className="premium-stat-header"><span className="premium-stat-label">{s.label}</span><div className="premium-stat-icon">{s.icon}</div></div>
            <div className="premium-stat-value">{s.value}</div>
            <div className="premium-stat-sub"><span className={s.subCls || 'neutral'}>{s.sub}</span></div>
          </div>
        ))}
      </div>

      {/* Vehicle Cards */}
      <div className="premium-dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="premium-vehicle-card-v2">
            <div className="premium-card-v2-header">
              <div className="premium-v2-icon">{getVehicleIcon(vehicle.type)}</div>
              <div className={`premium-v2-status ${vehicle.status === 'approved' ? 'approved' : 'pending'}`}>
                {vehicle.status === 'approved' ? 'Active' : 'Pending'}
              </div>
            </div>
            <div className="premium-v2-plate">{vehicle.plate_number}</div>
            <div className="premium-v2-info">{vehicle.brand} • {vehicle.color}</div>
            <div className="premium-v2-grid">
              <div className="premium-v2-item"><label>Registered On</label><span>{new Date(vehicle.registration_date).toLocaleDateString()}</span></div>
              <div className="premium-v2-item"><label>Expiry Date</label><span>{vehicle.expiry_date ? new Date(vehicle.expiry_date).toLocaleDateString() : 'Pending'}</span></div>
            </div>
            {vehicle.orcr_photo_path && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.5rem 0 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '16px', color: 'var(--ac)' }}>verified</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--ac)' }}>OR/CR Uploaded</span>
              </div>
            )}
            <div className="premium-v2-actions">
              <button className="premium-v2-btn edit" onClick={() => handleEditClick(vehicle)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit
              </button>
              <button className="premium-v2-btn remove" onClick={() => handleRemoveClick(vehicle)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                Remove
              </button>
            </div>
          </div>
        ))}
        {remainingSlots > 0 && (
          <div className="premium-v2-add-card" onClick={() => { resetModal(); setShowModal(true); }}>
            <div className="premium-v2-add-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14m-7-7h14"/></svg></div>
            <h3>Add New Vehicle</h3>
            <p>{remainingSlots} slot{remainingSlots > 1 ? 's' : ''} remaining</p>
          </div>
        )}
      </div>

      {/* Guidelines */}
      <div className="premium-info-panel">
        <div className="premium-info-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>
          <h3>Vehicle Registration Guidelines</h3>
        </div>
        <div className="premium-info-list">
          {['Students can register up to 2 vehicles', 'Vehicle registration is valid for one academic year', 'Please ensure plate number matches your OR/CR', 'Upload your OR/CR document for faster approval'].map((t, i) => (
            <div key={i} className="premium-info-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 5 5L20 7"/></svg>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* ── Register / Edit Modal ── */}
      {(showModal || showEditModal) && (
        <div className="modal-backdrop active" onClick={resetModal}>
          <div className="modal premium-glass-card" onClick={e => e.stopPropagation()} style={{ border: 'none', maxWidth: '560px', width: '95%' }}>
            <header className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="premium-noti-icon-box premium-pill primary" style={{ width: '40px', height: '40px' }}>
                  <span className="material-symbols-rounded">{showEditModal ? 'edit' : 'directions_car'}</span>
                </div>
                <div>
                  <h2 className="modal-title" style={{ margin: 0 }}>{showEditModal ? 'Edit Vehicle' : 'Register Vehicle'}</h2>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--t-3)' }}>{showEditModal ? 'Update your vehicle details below' : 'Fill in your vehicle information'}</p>
                </div>
              </div>
              <button className="modal-close" onClick={resetModal}><span className="material-symbols-rounded">close</span></button>
            </header>
            <div className="modal-body" style={{ padding: '1.5rem 0' }}>
              {renderVehicleForm(showEditModal)}
            </div>
            <footer className="modal-footer" style={{ borderTop: 'none', padding: '1rem 0 0' }}>
              <button className="premium-page-btn" onClick={resetModal} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button className="premium-page-btn active" type="submit" form="vehicleForm" disabled={submitting} style={{ flex: 1, justifyContent: 'center' }}>
                {submitting ? 'Processing...' : (showEditModal ? 'Save Changes' : 'Submit for Approval')}
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && (
        <div className="modal-backdrop active" onClick={() => setShowDeleteModal(false)}>
          <div className="modal premium-glass-card" onClick={e => e.stopPropagation()} style={{ border: 'none', maxWidth: '420px', width: '90%' }}>
            <header className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-rounded" style={{ color: '#ef4444', fontSize: '22px' }}>delete_forever</span>
                </div>
                <h2 className="modal-title" style={{ margin: 0 }}>Remove Vehicle</h2>
              </div>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}><span className="material-symbols-rounded">close</span></button>
            </header>
            <div className="modal-body" style={{ padding: '1.5rem 0' }}>
              <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1rem' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--t-2)' }}>
                  You are about to permanently remove <strong style={{ color: 'var(--t-1)' }}>{removingVehicle?.plate_number}</strong> ({removingVehicle?.brand} • {removingVehicle?.color}).
                </p>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--t-3)', margin: 0 }}>
                This action <strong>cannot be undone</strong> and will revoke all campus access permissions for this vehicle.
                {removingVehicle?.orcr_photo_path && ' The associated OR/CR document will also be deleted.'}
              </p>
            </div>
            <footer className="modal-footer" style={{ borderTop: 'none', padding: '1rem 0 0' }}>
              <button className="premium-page-btn" onClick={() => setShowDeleteModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button className="premium-page-btn active" onClick={handleRemoveConfirm} disabled={submitting}
                style={{ flex: 1, justifyContent: 'center', background: '#ef4444', color: 'white', borderColor: 'transparent' }}>
                {submitting ? 'Removing...' : 'Confirm Remove'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
