import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { serviceApi } from '../api/serviceApi';
import { queueApi } from '../api/queueApi';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const QueueManagement = () => {
  const [tokens, setTokens] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [keyword, setKeyword] = useState('');
  const [cancelModal, setCancelModal] = useState({ show: false, tokenId: null, reason: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchTokens = async () => {
    try {
      const data = await adminApi.getTokens({
        serviceId: selectedServiceId || null,
        status: selectedStatus || null,
        keyword: keyword || null,
        page,
        size: 10,
      });
      setTokens(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Error fetching tokens:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    serviceApi.getAllServices().then(setServices).catch(console.error);
  }, []);

  useEffect(() => {
    fetchTokens();
  }, [page, selectedServiceId, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchTokens();
  };

  const handleOpenCancel = (tokenId) => {
    setCancelModal({ show: true, tokenId, reason: 'Cancelled by administrator' });
  };

  const handleConfirmCancel = async () => {
    if (!cancelModal.tokenId) return;
    try {
      await queueApi.cancelToken(cancelModal.tokenId, cancelModal.reason);
      setMessage({ type: 'success', text: 'Token cancelled successfully.' });
      setCancelModal({ show: false, tokenId: null, reason: '' });
      fetchTokens();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to cancel token' });
    }
  };

  return (
    <div className="container-fluid p-4">
      {/* Title */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom gap-3">
        <div>
          <span className="badge bg-primary-subtle text-primary fw-semibold px-3 py-1 rounded-pill small">
            AUDIT & OPERATIONS
          </span>
          <h2 className="fw-bold mb-0 mt-1">Live Queue Management</h2>
          <small className="text-muted">Monitor, search, filter and audit all customer queue tokens</small>
        </div>

        <button onClick={fetchTokens} className="btn btn-outline-secondary rounded-pill btn-sm px-3">
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh Queue
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show small`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="sq-card p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-md-3">
            <select
              className="form-select"
              value={selectedServiceId}
              onChange={(e) => { setSelectedServiceId(e.target.value); setPage(0); }}
            >
              <option value="">All Services</option>
              {services.map((svc) => (
                <option key={svc.id} value={svc.id.toString()}>
                  {svc.name} ({svc.prefix})
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setPage(0); }}
            >
              <option value="">All Statuses</option>
              <option value="WAITING">WAITING</option>
              <option value="SERVING">SERVING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="col-md-4">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search token #, name, or phone..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </div>

          <div className="col-md-2 text-end">
            <small className="text-muted">Total: <strong>{totalElements}</strong> records</small>
          </div>
        </form>
      </div>

      {/* Tokens Table */}
      <div className="sq-card p-4">
        {loading ? (
          <LoadingSpinner message="Searching queue records..." />
        ) : tokens.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-inbox fs-1 d-block mb-2 text-secondary"></i>
            <p className="fw-semibold">No tokens match the selected filters.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Token #</th>
                  <th>Customer</th>
                  <th>Service Desk</th>
                  <th>Status</th>
                  <th>Station</th>
                  <th>Assigned Staff</th>
                  <th>Registered</th>
                  <th>Completed / Cancelled</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((tok) => (
                  <tr key={tok.id}>
                    <td>
                      <strong className="font-monospace text-primary fs-6">{tok.tokenNumber}</strong>
                    </td>
                    <td>
                      <div className="fw-bold">{tok.customerName}</div>
                      <small className="text-muted">{tok.customerPhone}</small>
                    </td>
                    <td>{tok.serviceName}</td>
                    <td><StatusBadge status={tok.status} /></td>
                    <td>
                      {tok.counterName ? (
                        <span className="badge bg-light text-dark border">{tok.counterName}</span>
                      ) : (
                        <span className="text-muted small italic">--</span>
                      )}
                    </td>
                    <td>{tok.servedByUsername || <span className="text-muted small">--</span>}</td>
                    <td className="text-muted small">
                      {new Date(tok.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="text-muted small">
                      {tok.completedAt
                        ? new Date(tok.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : tok.cancelledAt
                        ? <span className="text-danger" title={tok.cancellationReason}>Cancelled</span>
                        : '--'}
                    </td>
                    <td className="text-end">
                      {['WAITING', 'SERVING'].includes(tok.status) && (
                        <button
                          className="btn btn-sm btn-outline-danger rounded-pill"
                          onClick={() => handleOpenCancel(tok.id)}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
            <span className="text-muted small">
              Page {page + 1} of {totalPages}
            </span>
            <div className="btn-group btn-group-sm">
              <button
                className="btn btn-outline-secondary"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </button>
              <button
                className="btn btn-outline-secondary"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {cancelModal.show && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Cancel Customer Token</h5>
                <button type="button" className="btn-close" onClick={() => setCancelModal({ show: false, tokenId: null, reason: '' })}></button>
              </div>
              <div className="modal-body">
                <label className="form-label small fw-semibold">Cancellation Reason</label>
                <input
                  type="text"
                  className="form-control"
                  value={cancelModal.reason}
                  onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })}
                  placeholder="e.g. Duplicate / Administrative cancellation"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary rounded-pill" onClick={() => setCancelModal({ show: false, tokenId: null, reason: '' })}>
                  Close
                </button>
                <button type="button" className="btn btn-danger rounded-pill fw-bold" onClick={handleConfirmCancel}>
                  Cancel Token
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueueManagement;
