import React, { useState, useEffect } from 'react';
import { serviceApi } from '../api/serviceApi';
import { adminApi } from '../api/adminApi';
import LoadingSpinner from '../components/LoadingSpinner';

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Modal states
  const [serviceModal, setServiceModal] = useState({
    show: false,
    isEdit: false,
    id: null,
    name: '',
    code: '',
    prefix: '',
    description: '',
    avgDurationMinutes: 15,
    active: true,
  });

  const [assignModal, setAssignModal] = useState({
    show: false,
    serviceId: null,
    serviceName: '',
    userId: '',
    counterName: 'Counter 1',
  });

  const fetchServices = async () => {
    try {
      const [serviceData, staffData] = await Promise.all([
        serviceApi.getAllServices(),
        adminApi.getStaff({ size: 50 }),
      ]);
      setServices(serviceData);
      setStaffList(staffData.content || []);
    } catch (err) {
      setMessage({ type: 'danger', text: 'Error loading services: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenCreate = () => {
    setServiceModal({
      show: true,
      isEdit: false,
      id: null,
      name: '',
      code: '',
      prefix: '',
      description: '',
      avgDurationMinutes: 15,
      active: true,
    });
  };

  const handleOpenEdit = (svc) => {
    setServiceModal({
      show: true,
      isEdit: true,
      id: svc.id,
      name: svc.name,
      code: svc.code,
      prefix: svc.prefix,
      description: svc.description || '',
      avgDurationMinutes: svc.avgDurationMinutes,
      active: svc.active,
    });
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      if (serviceModal.isEdit) {
        await serviceApi.updateService(serviceModal.id, {
          name: serviceModal.name,
          code: serviceModal.code,
          prefix: serviceModal.prefix,
          description: serviceModal.description,
          avgDurationMinutes: Number(serviceModal.avgDurationMinutes),
          active: serviceModal.active,
        });
        setMessage({ type: 'success', text: 'Service updated successfully!' });
      } else {
        await serviceApi.createService({
          name: serviceModal.name,
          code: serviceModal.code,
          prefix: serviceModal.prefix,
          description: serviceModal.description,
          avgDurationMinutes: Number(serviceModal.avgDurationMinutes),
          active: serviceModal.active,
        });
        setMessage({ type: 'success', text: 'Service created successfully!' });
      }
      setServiceModal({ ...serviceModal, show: false });
      fetchServices();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to save service' });
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await serviceApi.toggleServiceStatus(id);
      fetchServices();
      setMessage({ type: 'info', text: 'Service status toggled.' });
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to toggle status: ' + err.message });
    }
  };

  const handleOpenAssign = (svc) => {
    setAssignModal({
      show: true,
      serviceId: svc.id,
      serviceName: svc.name,
      userId: staffList.length > 0 ? staffList[0].id.toString() : '',
      counterName: 'Counter 1',
    });
  };

  const handleConfirmAssign = async (e) => {
    e.preventDefault();
    if (!assignModal.userId) return;

    try {
      await adminApi.assignStaff({
        userId: Number(assignModal.userId),
        serviceId: assignModal.serviceId,
        counterName: assignModal.counterName,
      });
      setMessage({ type: 'success', text: 'Staff assigned successfully!' });
      setAssignModal({ ...assignModal, show: false });
      fetchServices();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to assign staff' });
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading services configuration..." />;
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom gap-3">
        <div>
          <span className="badge bg-primary-subtle text-primary fw-semibold px-3 py-1 rounded-pill small">
            ADMINISTRATION
          </span>
          <h2 className="fw-bold mb-0 mt-1">Service Desks & Queues</h2>
          <small className="text-muted">Configure active services, token prefixes, durations and staff desk assignments</small>
        </div>

        <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" onClick={handleOpenCreate}>
          <i className="bi bi-plus-circle me-2"></i> Add New Service Desk
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show small`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}

      {/* Services Table */}
      <div className="sq-card p-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Service Name</th>
                <th>Code</th>
                <th>Token Prefix</th>
                <th>Avg. Duration</th>
                <th>Status</th>
                <th>Waiting</th>
                <th>Active Serving</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((svc) => (
                <tr key={svc.id}>
                  <td>
                    <div className="fw-bold text-dark">{svc.name}</div>
                    <small className="text-muted">{svc.description || 'No description provided'}</small>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border font-monospace">{svc.code}</span>
                  </td>
                  <td>
                    <span className="badge bg-primary fs-6 px-3 py-1 rounded-pill">{svc.prefix}</span>
                  </td>
                  <td>~{svc.avgDurationMinutes} mins</td>
                  <td>
                    <span className={`badge ${svc.active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                      {svc.active ? 'ACTIVE' : 'DEACTIVATED'}
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-warning-subtle text-dark px-2 py-1 rounded-pill">
                      {svc.waitingCount || 0} waiting
                    </span>
                  </td>
                  <td>
                    <strong className="text-primary font-monospace">
                      {svc.currentlyServingToken || 'None'}
                    </strong>
                  </td>
                  <td className="text-end">
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-outline-dark"
                        onClick={() => handleOpenAssign(svc)}
                        title="Assign Staff Desk"
                      >
                        <i className="bi bi-person-plus"></i>
                      </button>
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => handleOpenEdit(svc)}
                        title="Edit Service"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className={`btn ${svc.active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                        onClick={() => handleToggleStatus(svc.id)}
                        title={svc.active ? 'Deactivate' : 'Activate'}
                      >
                        <i className={`bi ${svc.active ? 'bi-pause-circle' : 'bi-play-circle'}`}></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Service Modal */}
      {serviceModal.show && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <form onSubmit={handleSaveService}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">
                    {serviceModal.isEdit ? 'Edit Service Desk' : 'Create New Service Desk'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setServiceModal({ ...serviceModal, show: false })}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Service Desk Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={serviceModal.name}
                      onChange={(e) => setServiceModal({ ...serviceModal, name: e.target.value })}
                      placeholder="e.g. Loan & Mortgage Advisory"
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Unique Code *</label>
                      <input
                        type="text"
                        className="form-control text-uppercase font-monospace"
                        value={serviceModal.code}
                        onChange={(e) => setServiceModal({ ...serviceModal, code: e.target.value })}
                        placeholder="e.g. LOAN"
                        required
                        maxLength={15}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Token Prefix *</label>
                      <input
                        type="text"
                        className="form-control text-uppercase font-monospace"
                        value={serviceModal.prefix}
                        onChange={(e) => setServiceModal({ ...serviceModal, prefix: e.target.value })}
                        placeholder="e.g. C"
                        required
                        maxLength={5}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Average Duration (Minutes) *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={serviceModal.avgDurationMinutes}
                      onChange={(e) => setServiceModal({ ...serviceModal, avgDurationMinutes: e.target.value })}
                      min="1"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Description</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={serviceModal.description}
                      onChange={(e) => setServiceModal({ ...serviceModal, description: e.target.value })}
                      placeholder="Brief summary of services provided at this counter..."
                    ></textarea>
                  </div>

                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="activeStatusSwitch"
                      checked={serviceModal.active}
                      onChange={(e) => setServiceModal({ ...serviceModal, active: e.target.checked })}
                    />
                    <label className="form-check-label small fw-semibold" htmlFor="activeStatusSwitch">
                      Service Active & Accepting Customers
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary rounded-pill" onClick={() => setServiceModal({ ...serviceModal, show: false })}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill fw-bold px-4">
                    {serviceModal.isEdit ? 'Update Service' : 'Create Service'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assign Staff Modal */}
      {assignModal.show && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <form onSubmit={handleConfirmAssign}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Assign Staff to {assignModal.serviceName}</h5>
                  <button type="button" className="btn-close" onClick={() => setAssignModal({ ...assignModal, show: false })}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Staff Member *</label>
                    <select
                      className="form-select"
                      value={assignModal.userId}
                      onChange={(e) => setAssignModal({ ...assignModal, userId: e.target.value })}
                      required
                    >
                      {staffList.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.fullName} (@{st.username})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Station / Desk Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={assignModal.counterName}
                      onChange={(e) => setAssignModal({ ...assignModal, counterName: e.target.value })}
                      placeholder="e.g. Counter 1, Desk A"
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary rounded-pill" onClick={() => setAssignModal({ ...assignModal, show: false })}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill fw-bold">
                    Assign Station
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

export default ServiceManagement;
