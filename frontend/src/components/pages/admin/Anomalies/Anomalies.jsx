import { useState, useEffect, useRef } from 'react';
import api from '../../../../services/api';
import ReportGeneratorModal from '../../../widgets/ReportGenerator/ReportGeneratorModal';
import '../EntryLogs/EntryLogs.css';

// Reusable Filter Dropdown Component
const FilterDropdown = ({ icon, label, value, options, onChange, width = 'auto' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="premium-filter-dropdown" ref={dropdownRef}>
      <button
        className={`premium-filter-btn ${value ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: width, padding: '0.5rem 0.75rem' }}
      >
        {icon && <span className="material-symbols-rounded btn-icon" style={{ fontSize: '18px' }}>{icon}</span>}
        <div className="btn-text" style={{ flex: 1, overflow: 'hidden', textAlign: 'left' }}>
          {label && <span className="btn-label" style={{ fontSize: '0.65rem' }}>{label}</span>}
          <span className="btn-value" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{selectedOption.label}</span>
        </div>
        <span className="material-symbols-rounded chevron">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {isOpen && (
        <div className="premium-filter-dropdown-menu">
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`premium-dropdown-item ${value === opt.value ? 'selected' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              <div className="item-info">
                <span>{opt.label}</span>
              </div>
              {value === opt.value && (
                <span className="material-symbols-rounded">check</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Anomalies() {
  const [data, setData] = useState({ total: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [kindFilter, setKindFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [newTag, setNewTag] = useState('');
  const [tagLoading, setTagLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const skip = (page - 1) * limit;
      let url = `/anpr/anomalies?limit=${limit}&offset=${skip}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (kindFilter) url += `&kind=${kindFilter}`;
      if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
      if (startDate) url += `&start_date=${startDate}T00:00:00`;
      if (endDate) url += `&end_date=${endDate}T23:59:59`;
      if (roleFilter) url += `&role=${roleFilter}`;

      const res = await api.get(url);
      setData(res.data);
    } catch (error) {
      console.error('Failed to fetch anomalies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, [page, limit, statusFilter, kindFilter, debouncedSearch, startDate, endDate, roleFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddTag = async () => {
    if (!newTag.trim() || !selectedAnomaly) return;
    setTagLoading(true);
    try {
      const updatedTags = [...(selectedAnomaly.tags || []), newTag.trim()];
      const res = await api.patch(`/anpr/anomaly/${selectedAnomaly.id}/tags`, {
        tags: updatedTags
      });

      // Update local state
      setSelectedAnomaly({ ...selectedAnomaly, tags: res.data.tags });
      setData(prev => ({
        ...prev,
        items: prev.items.map(item => item.id === selectedAnomaly.id ? { ...item, tags: res.data.tags } : item)
      }));
      setNewTag('');
    } catch (err) {
      console.error('Failed to add tag', err);
    } finally {
      setTagLoading(false);
    }
  };

  const handleRemoveTag = async (tagToRemove) => {
    if (!selectedAnomaly) return;
    setTagLoading(true);
    try {
      const updatedTags = (selectedAnomaly.tags || []).filter(t => t !== tagToRemove);
      const res = await api.patch(`/anpr/anomaly/${selectedAnomaly.id}/tags`, {
        tags: updatedTags
      });

      setSelectedAnomaly({ ...selectedAnomaly, tags: res.data.tags });
      setData(prev => ({
        ...prev,
        items: prev.items.map(item => item.id === selectedAnomaly.id ? { ...item, tags: res.data.tags } : item)
      }));
    } catch (err) {
      console.error('Failed to remove tag', err);
    } finally {
      setTagLoading(false);
    }
  };

  const formatKind = (kind) => {
    return kind.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open': return <span className="badge badge-warning">Open</span>;
      case 'resolved': return <span className="badge badge-success">Resolved</span>;
      case 'escalated': return <span className="badge badge-error">Escalated</span>;
      case 'dismissed': return <span className="badge" style={{ backgroundColor: '#4b5563', color: 'white' }}>Dismissed</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const getKindBadge = (kind) => {
    if (kind.includes('breach')) return <span className="badge badge-error" style={{ fontSize: '0.7rem' }}>{formatKind(kind)}</span>;
    if (kind.includes('rapid_movement')) return <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Rapid Movement</span>;
    if (kind.includes('frequent')) return <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Frequent Visitor</span>;
    return <span className="badge" style={{ fontSize: '0.7rem', backgroundColor: '#374151', color: '#e5e7eb' }}>{formatKind(kind)}</span>;
  };

  return (
    <div className="premium-dashboard-container">
      <div className="premium-page-header">
        <div>
          <h1>Anomaly <span>Management</span> 🚨</h1>
          <p>Detect, track, and label suspicious vehicle behavior.</p>
        </div>
        <div className="premium-header-meta">
          <button
            className="premium-page-btn"
            onClick={() => setIsReportModalOpen(true)}
          >
            <span className="material-symbols-rounded">summarize</span>
            Generate Report
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Filter Section */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: '16px',
          padding: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          position: 'relative',
          zIndex: 10
        }}>
            {/* Top Row: Filters */}
            <div style={{ display: 'flex', width: '100%', gap: '1rem', alignItems: 'flex-end' }}>

                <div style={{ display: 'flex', flexDirection: 'column', width: '170px' }}>
                    <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                        <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>rule</span>
                        Status Filter
                    </label>
                    <FilterDropdown
                      width="170px"
                      value={statusFilter}
                      options={[
                        { value: '', label: 'All Statuses' },
                        { value: 'open', label: 'Open' },
                        { value: 'resolved', label: 'Resolved' },
                        { value: 'escalated', label: 'Escalated' },
                        { value: 'dismissed', label: 'Dismissed' }
                      ]}
                      onChange={(val) => { setStatusFilter(val); setPage(1); }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                        <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>category</span>
                        Anomaly Kind
                    </label>
                    <FilterDropdown
                      value={kindFilter}
                      options={[
                        { value: '', label: 'All Anomaly Kinds' },
                        { value: 'anomaly_unregistered', label: 'Unregistered' },
                        { value: 'anomaly_low_confidence', label: 'Low Confidence' },
                        { value: 'anomaly_rapid_movement', label: 'Rapid Movement' },
                        { value: 'anomaly_frequent_unregistered', label: 'Frequent Unregistered' },
                        { value: 'breach_blacklisted', label: 'Blacklisted' },
                        { value: 'breach_expired', label: 'Expired' }
                      ]}
                      onChange={(val) => { setKindFilter(val); setPage(1); }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', width: '170px' }}>
                    <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                        <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>badge</span>
                        Owner Role
                    </label>
                    <FilterDropdown
                      width="170px"
                      value={roleFilter}
                      options={[
                        { value: '', label: 'All Roles' },
                        { value: 'student', label: 'Student' },
                        { value: 'faculty', label: 'Faculty' },
                        { value: 'staff', label: 'Staff' },
                        { value: 'admin', label: 'Admin' },
                        { value: 'security', label: 'Security' }
                      ]}
                      onChange={(val) => { setRoleFilter(val); setPage(1); }}
                    />
                </div>

                <div style={{ flex: 1, minWidth: '180px', alignSelf: 'flex-end', display: 'flex' }}>
                    <input
                        className="form-input"
                        style={{ height: '44px', width: '100%' }}
                        type="text"
                        placeholder="Search by plate or gate..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                    />
                </div>
            </div>

            {/* Bottom Row: Distribution */}
            <div style={{ display: 'flex', width: '100%', gap: '1rem', alignItems: 'center', marginTop: '0.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em', paddingRight: '1rem', borderRight: '1px solid rgba(255, 255, 255, 0.05)', marginRight: '0.5rem' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '1rem', opacity: 0.6 }}>bar_chart_4_bars</span>
                    VEHICLE DISTRIBUTION
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    {[
                        { key: 'car', icon: 'directions_car', label: '11' },
                        { key: 'motorcycle', icon: 'two_wheeler', label: '10' },
                        { key: 'van', icon: 'airport_shuttle', label: '3' },
                        { key: 'truck', icon: 'local_shipping', label: '0' }
                    ].map(item => (
                        <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            <span className="material-symbols-rounded" style={{ fontSize: '1.15rem', color: '#8b5cf6' }}>{item.icon}</span>
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Main Content: Table */}
        <div className="premium-glass-card" style={{ padding: '0', overflow: 'visible', position: 'relative', zIndex: 1 }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>Loading anomalies...</div>
          ) : data.items.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
              No anomalies found matching your filters.
            </div>
          ) : (
            <div className="data-table-wrapper" style={{ margin: 0, border: 'none' }}>
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Plate Number</th>
                    <th>Vehicle Type</th>
                    <th>Type & Status</th>
                    <th>Gate</th>
                    <th>Tags</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.id} className="table-row-hover" onClick={() => setSelectedAnomaly(item)} style={{ cursor: 'pointer' }}>
                      <td data-label="Date & Time" style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                        {(() => {
                          const parts = item.time.split(' ');
                          const dateStr = parts.slice(0, 3).join(' ');
                          const timeStr = parts.slice(3).join(' ');
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span>{dateStr}</span>
                              <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>{timeStr}</span>
                            </div>
                          );
                        })()}
                      </td>
                      <td data-label="Plate Number">
                        <div style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '1rem', color: '#e5e7eb' }}>
                          {item.plate}
                        </div>
                      </td>
                      <td data-label="Vehicle Type">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e5e7eb' }}>
                          <span className="material-symbols-rounded" style={{ color: '#a855f7', fontSize: '18px' }}>
                            {item.vehicle_type === 'motorcycle' ? 'two_wheeler' : 
                             item.vehicle_type === 'van' ? 'airport_shuttle' : 
                             item.vehicle_type === 'truck' ? 'local_shipping' : 'directions_car'}
                          </span>
                          <span style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>{item.vehicle_type || 'Car'}</span>
                        </div>
                      </td>
                      <td data-label="Type & Status">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                          {getKindBadge(item.kind)}
                          {getStatusBadge(item.status)}
                        </div>
                      </td>
                      <td data-label="Gate" style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{item.gate_name}</td>
                      <td data-label="Tags">
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                          {item.tags && item.tags.length > 0 ? (
                            item.tags.slice(0, 2).map((tag, i) => (
                              <span key={i} className="badge" style={{ backgroundColor: '#1e3a8a', color: '#bfdbfe', fontSize: '0.7rem' }}>
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>No tags</span>
                          )}
                          {item.tags && item.tags.length > 2 && (
                            <span className="badge" style={{ backgroundColor: '#374151', fontSize: '0.7rem' }}>+{item.tags.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td data-label="Action">
                        <div className="table-actions">
                          <button className="icon-btn-premium" onClick={(e) => { e.stopPropagation(); setSelectedAnomaly(item); }}>
                            <span className="material-symbols-rounded">visibility</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="premium-pagination">
            <div className="pagination-info">
              {data.total > 0 ? (
                <>Showing <span>{(page - 1) * limit + 1}-{Math.min(page * limit, data.total)}</span> of <span>{data.total}</span> entries</>
              ) : (
                <span>No anomalies found</span>
              )}
            </div>

            <div className="pagination-controls">
              <div className="limit-selector">
                <span className="limit-label">Show:</span>
                <select
                  className="premium-select-compact"
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="page-btns">
                <button
                  className="premium-page-btn icon-only"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1 || loading}
                >
                  <span className="material-symbols-rounded">chevron_left</span>
                </button>

                <div className="page-indicators">
                  {[...Array(Math.ceil(data.total / limit))].map((_, i) => {
                    const pageNum = i + 1;
                    // Only show a few pages around current page
                    if (pageNum === 1 || pageNum === Math.ceil(data.total / limit) || (pageNum >= page - 2 && pageNum <= page + 2)) {
                      return (
                        <button
                          key={pageNum}
                          className={`page-indicator ${pageNum === page ? 'active' : ''}`}
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (pageNum === page - 3 || pageNum === page + 3) {
                      return <span key={`ellipsis-${pageNum}`} style={{ color: '#6b7280' }}>...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  className="premium-page-btn icon-only"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * limit >= data.total || loading}
                >
                  <span className="material-symbols-rounded">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail & Tag Modal */}
      {selectedAnomaly && (
        <div className="modal-backdrop active" onClick={() => setSelectedAnomaly(null)}>
          <div className="modal premium-glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px', width: '95%', padding: '0', overflow: 'hidden' }}>
            
            {/* Header */}
            <header style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(139, 92, 246, 0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-rounded" style={{ color: '#c084fc', fontSize: '24px' }}>warning</span>
                </div>
                <div>
                  <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Anomaly Details</h2>
                  <p style={{ color: '#6b7280', fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>Log ID: {selectedAnomaly.id.substring(0, 8)}</p>
                </div>
              </div>
              <button className="icon-btn-premium" onClick={() => setSelectedAnomaly(null)} style={{ padding: '0.5rem' }}>
                <span className="material-symbols-rounded">close</span>
              </button>
            </header>

            {/* Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Split View */}
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                
                {/* Left: Snapshot */}
                <div style={{ flex: 1 }}>
                  {selectedAnomaly.snapshot_url ? (
                    <img
                      src={selectedAnomaly.snapshot_url}
                      alt="Capture Evidence"
                      style={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', objectFit: 'cover', aspectRatio: '4/3' }}
                    />
                  ) : (
                    <div style={{ width: '100%', aspectRatio: '4/3', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#4b5563', gap: '0.5rem' }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '32px' }}>no_photography</span>
                      <span style={{ fontSize: '0.75rem' }}>No Snapshot Available</span>
                    </div>
                  )}
                </div>

                {/* Right: Info */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, marginBottom: '0.25rem' }}>Plate Number</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace', color: '#fff' }}>
                      {selectedAnomaly.plate}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, marginBottom: '0.25rem' }}>Status</div>
                      <div>{getStatusBadge(selectedAnomaly.status)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, marginBottom: '0.25rem' }}>Type</div>
                      <div>{getKindBadge(selectedAnomaly.kind)}</div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, marginBottom: '0.25rem' }}>Time & Location</div>
                    <div style={{ fontSize: '0.85rem', color: '#e5e7eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="material-symbols-rounded" style={{ fontSize: '14px', color: '#9ca3af' }}>schedule</span>
                        {selectedAnomaly.time}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#e5e7eb', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <span className="material-symbols-rounded" style={{ fontSize: '14px', color: '#9ca3af' }}>location_on</span>
                        {selectedAnomaly.gate_name}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags Section */}
              <div style={{ padding: '1.25rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Assigned Tags & Labels</h4>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {selectedAnomaly.tags && selectedAnomaly.tags.length > 0 ? (
                    selectedAnomaly.tags.map((tag, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.65rem', backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#c084fc', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                        {tag}
                        <span
                          className="material-symbols-rounded"
                          style={{ fontSize: '14px', cursor: 'pointer', opacity: 0.7 }}
                          onClick={() => handleRemoveTag(tag)}
                        >
                          close
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#4b5563', fontSize: '0.75rem', fontStyle: 'italic' }}>No tags assigned yet.</div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ height: '40px', flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', color: '#fff' }}
                    placeholder="E.g., Tailgating, Delivery, VIP"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    disabled={tagLoading}
                  />
                  <button 
                    className="premium-page-btn" 
                    style={{ padding: '0 1rem', borderRadius: '10px' }}
                    onClick={handleAddTag} 
                    disabled={tagLoading || !newTag.trim()}
                  >
                    Add Tag
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
            {/* Report Generator Modal */}
            <ReportGeneratorModal 
                isOpen={isReportModalOpen} 
                onClose={() => setIsReportModalOpen(false)} 
                data={data.items || []} 
                columns={[
                    { key: 'time', label: 'Date & Time' },
                    { key: 'plate', label: 'Plate Number' },
                    { key: 'vehicle_type', label: 'Vehicle Type' },
                    { key: 'kind', label: 'Anomaly Type' },
                    { key: 'status', label: 'Status' },
                    { key: 'gate_name', label: 'Gate' },
                    { key: 'owner', label: 'Owner' },
                    { key: 'confidence', label: 'Confidence' }
                ]}
                reportTitle="Security Anomalies Report"
            />
        </div>
    );
}
