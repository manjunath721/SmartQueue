import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import LoadingSpinner from '../components/LoadingSpinner';

const StaffManagementPage = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Create Staff Modal
  const [createModal, setCreateModal] = useState({
    show: false,
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'ROLE_STAFF',
  });

  const fetchStaff = async () => {
    try {
      const data = await adminApi.getStaff({ keyword: keyword || null, size: 50 });
      setStaffList(data.content || []);
    } catch (err) {
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createStaff(createModal);
      setMessage({ type: 'success', text: `Staff account @${createModal.username} created successfully!` });
      setCreateModal({
        show: false,
        username: '',
        email: '',
        password: '',
        fullName: '',
        phone: '',
        role: 'ROLE_STAFF',
      });
      fetchStaff();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to create staff account' });
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await adminApi.toggleStaffStatus(id);
      setMessage({ type: 'info', text: 'Staff account status toggled.' });
      fetchStaff();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Error: ' + err.message });
    }
  };

  return (
    <div className="container-fluid p-4">
      {/* Title */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom gap-3">
        <div>
          <span className="badge bg-primary-subtle text-primary fw-semibold px-3 py-1 rounded-pill small">
            ADMINISTRATION
          </span>
          <h2 className="fw-bold mb-0 mt-1">Staff Accounts Management</h2>
          <small className="text-muted">Create operator logins, toggle access privileges and inspect desk assignments</small>
        </div>

        <button
          className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
          onClick={() => setCreateModal({ ...createModal, show: true })}
        >
          <i className="bi bi-person-plus-fill me-2"></i> Register New Staff
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show small`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}

      {/* Staff Table */}
      <div className="sq-card p-4">
        {loading ? (
          <LoadingSpinner message="Loading staff accounts..." />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Staff Member</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th>Assigned Desks</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="fw-bold text-dark">{user.fullName}</div>
                      <small className="text-muted">{user.phone || 'No phone'}</small>
                    </td>
                    <td>
                      <code className="text-primary">@{user.username}</code>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      {user.roles?.map((r) => (
                        <span key={r} className="badge bg-secondary-subtle text-secondary me-1 small">
                          {r.replace('ROLE_', '')}
                        </span>
                      ))}
                    </td>
                    <td>
                      {user.assignedServices && user.assignedServices.length > 0 ? (
                        user.assignedServices.map((s) => (
                          <span key={s.id} className="badge bg-primary bg-opacity-10 text-primary me-1 mb-1">
                            {s.name} ({s.prefix})
                          </span>
                        ))
                      ) : (
                        <span className="text-muted small italic">All Desks (Default)</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${user.active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                        {user.active ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className={`btn btn-sm rounded-pill ${user.active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                        onClick={() => handleToggleStatus(user.id)}
                      >
                        {user.active ? 'Disable Access' : 'Enable Access'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {createModal.show && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <form onSubmit={handleCreateStaff}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Register Staff Account</h5>
                  <button type="button" className="btn-close" onClick={() => setCreateModal({ ...createModal, show: false })}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={createModal.fullName}
                      onChange={(e) => setCreateModal({ ...createModal, fullName: e.target.value })}
                      placeholder="e.g. Rachel Green"
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Username *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={createModal.username}
                        onChange={(e) => setCreateModal({ ...createModal, username: e.target.value })}
                        placeholder="e.g. staff_rachel"
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        value={createModal.phone}
                        onChange={(e) => setCreateModal({ ...createModal, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={createModal.email}
                      onChange={(e) => setCreateModal({ ...createModal, email: e.target.value })}
                      placeholder="rachel@smartqueue.com"
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Password *</label>
                      <input
                        type="password"
                        className="form-control"
                        value={createModal.password}
                        onChange={(e) => setCreateModal({ ...createModal, password: e.target.value })}
                        placeholder="Min. 6 chars"
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Role *</label>
                      <select
                        className="form-select"
                        value={createModal.role}
                        onChange={(e) => setCreateModal({ ...createModal, role: e.target.value })}
                      >
                        <option value="ROLE_STAFF">Staff Operator</option>
                        <option value="ROLE_ADMIN">Administrator</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary rounded-pill" onClick={() => setCreateModal({ ...createModal, show: false })}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill fw-bold">
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagementPage;
