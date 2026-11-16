import React, { useState, useEffect } from 'react';
import { queueApi } from '../api/queueApi';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const StaffDashboard = () => {
  const { user } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [counterName, setCounterName] = useState('Counter 1');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [cancelModal, setCancelModal] = useState({ show: false, tokenId: null, reason: '' });
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchDashboard = async (isInitial = false) => {
    try {
      const data = await queueApi.getStaffDashboard();
      setDashboardData(data);

      if (isInitial && data.assignedServices?.length > 0) {
        setSelectedServiceId(data.assignedServices[0].id.toString());
      }
    } catch (err) {
      console.error('Error fetching staff dashboard:', err);
      if (isInitial) {
        setMessage({ type: 'danger', text: 'Failed to load staff dashboard: ' + err.message });
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(true);
    let interval = null;
    if (autoRefresh) {
      interval = setInterval(() => fetchDashboard(false), 4500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const handleCallNext = async () => {
    if (!selectedServiceId) {
      setMessage({ type: 'warning', text: 'Please select a service desk to call next customer.' });
      return;
    }

    setActionLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const called = await queueApi.callNext(Number(selectedServiceId), counterName);
      setMessage({ type: 'success', text: `Called Token ${called.tokenNumber} for ${called.customerName}!` });
      await fetchDashboard(false);
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Could not call next customer. Check if queue is empty or you are already serving someone.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteService = async () => {
    if (!dashboardData?.currentlyServingToken) return;

    setActionLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await queueApi.completeService(dashboardData.currentlyServingToken.id);
      setMessage({ type: 'success', text: `Service completed for Token ${dashboardData.currentlyServingToken.tokenNumber}!` });
      await fetchDashboard(false);
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to complete service.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenCancel = (tokenId) => {
    setCancelModal({ show: true, tokenId, reason: 'Customer did not show up' });
  };

  const handleConfirmCancel = async () => {
    if (!cancelModal.tokenId) return;

    setActionLoading(true);
    try {
      await queueApi.cancelToken(cancelModal.tokenId, cancelModal.reason);
      setMessage({ type: 'info', text: 'Token cancelled successfully.' });
      setCancelModal({ show: false, tokenId: null, reason: '' });
      await fetchDashboard(false);
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to cancel token.' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Setting up your service station..." />;
  }

  const activeServing = dashboardData?.currentlyServingToken;
  const filteredWaitingTokens = dashboardData?.waitingTokens?.filter((t) =>
    selectedServiceId ? t.serviceId.toString() === selectedServiceId : true
  ) || [];

  return (
    <div className="container-fluid p-4">
      {/* Header bar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom gap-3">
        <div>
          <span className="badge bg-primary-subtle text-primary fw-semibold px-3 py-1 rounded-pill small">
            STAFF CONSOLE
          </span>
          <h2 className="fw-bold mb-0 mt-1">Service Station: {user?.fullName}</h2>
          <small className="text-muted">Manage active queues, call next customers and record completions</small>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="form-check form-switch mb-0">
            <input
              className="form-check-input"
              type="checkbox"
              id="autoRefreshSwitch"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <label className="form-check-label small fw-semibold text-muted" htmlFor="autoRefreshSwitch">
              Auto-poll (4s)
            </label>
          </div>

          <button onClick={() => fetchDashboard(false)} className="btn btn-outline-secondary btn-sm rounded-pill px-3">
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show small`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}

      {/* Station Settings & Currently Serving Hero */}
      <div className="row g-4 mb-4">
        {/* Desk Controls */}
        <div className="col-lg-4">
          <div className="sq-card p-4 h-100">
            <h5 className="fw-bold text-dark mb-3">
              <i className="bi bi-sliders me-2 text-primary"></i> Station Configuration
            </h5>

            <div className="mb-3">
              <label className="form-label small fw-semibold">Select Assigned Service Desk</label>
              <select
                className="form-select"
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
              >
                {dashboardData?.assignedServices?.map((svc) => (
                  <option key={svc.id} value={svc.id.toString()}>
                    {svc.name} ({svc.prefix}) - {svc.waitingCount || 0} waiting
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold">Counter / Desk Name</label>
              <input
                type="text"
                className="form-control"
                value={counterName}
                onChange={(e) => setCounterName(e.target.value)}
                placeholder="e.g. Counter 1, Desk A"
              />
            </div>

            <div className="d-grid gap-2">
              <button
                className="btn btn-primary btn-lg rounded-pill fw-bold shadow-sm"
                onClick={handleCallNext}
                disabled={actionLoading || !!activeServing}
              >
                {actionLoading ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : (
                  <i className="bi bi-megaphone-fill me-2"></i>
                )}
                CALL NEXT CUSTOMER
              </button>
              {activeServing && (
                <small className="text-danger text-center">
                  Finish serving current customer before calling next.
                </small>
              )}
            </div>
          </div>
        </div>

        {/* Active Serving Card */}
        <div className="col-lg-8">
          <div className={`sq-card p-4 h-100 border-2 ${activeServing ? 'border-primary bg-primary bg-opacity-10' : 'bg-white'}`}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0 text-dark">
                <i className="bi bi-person-bounding-box me-2 text-primary"></i> Currently Serving Customer
              </h5>
              {activeServing && (
                <span className="badge bg-primary text-white px-3 py-2 rounded-pill fs-6">
                  IN PROGRESS
                </span>
              )}
            </div>

            {activeServing ? (
              <div className="row align-items-center g-4 py-2">
                <div className="col-md-5 text-center text-md-start">
                  <small className="text-muted text-uppercase fw-bold d-block mb-1">Active Token</small>
                  <div className="token-big-badge mb-2">{activeServing.tokenNumber}</div>
                  <div>
                    <span className="badge bg-dark px-3 py-1 rounded-pill">{activeServing.counterName || counterName}</span>
                  </div>
                </div>

                <div className="col-md-7">
                  <div className="bg-white p-3 rounded-3 shadow-sm mb-3">
                    <h5 className="fw-bold text-dark mb-1">{activeServing.customerName}</h5>
                    <p className="text-muted small mb-1">
                      <i className="bi bi-telephone me-1"></i> {activeServing.customerPhone}
                    </p>
                    <p className="text-muted small mb-0">
                      <i className="bi bi-clock me-1"></i> Called At: {new Date(activeServing.calledAt).toLocaleTimeString()}
                    </p>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success flex-grow-1 py-2 rounded-pill fw-bold"
                      onClick={handleCompleteService}
                      disabled={actionLoading}
                    >
                      <i className="bi bi-check-circle-fill me-1"></i> Complete Service
                    </button>
                    <button
                      className="btn btn-outline-danger py-2 px-3 rounded-pill fw-semibold"
                      onClick={() => handleOpenCancel(activeServing.id)}
                      disabled={actionLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-pause-circle fs-1 text-secondary opacity-50 mb-2 d-block"></i>
                <h5 className="fw-bold text-dark">No Active Customer at This Station</h5>
                <p className="small mb-0">Click "CALL NEXT CUSTOMER" above to bring the next waiting person in line.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="sq-card sq-stat-card">
            <div className="sq-stat-icon bg-warning bg-opacity-10 text-warning">
              <i className="bi bi-people-fill"></i>
            </div>
            <div>
              <h3 className="fw-bold mb-0">{dashboardData?.totalWaiting || 0}</h3>
              <small className="text-muted fw-semibold">Waiting in Your Queues</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="sq-card sq-stat-card">
            <div className="sq-stat-icon bg-success bg-opacity-10 text-success">
              <i className="bi bi-check2-circle"></i>
            </div>
            <div>
              <h3 className="fw-bold mb-0">{dashboardData?.completedToday || 0}</h3>
              <small className="text-muted fw-semibold">Completed Today</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="sq-card sq-stat-card">
            <div className="sq-stat-icon bg-danger bg-opacity-10 text-danger">
              <i className="bi bi-x-circle"></i>
            </div>
            <div>
              <h3 className="fw-bold mb-0">{dashboardData?.cancelledToday || 0}</h3>
              <small className="text-muted fw-semibold">Cancelled Today</small>
            </div>
          </div>
        </div>
      </div>

      {/* Waiting Queue Table */}
      <div className="sq-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0">
            <i className="bi bi-list-ol me-2 text-primary"></i> Waiting Customers (FIFO Line)
          </h5>
          <span className="badge bg-secondary rounded-pill">
            {filteredWaitingTokens.length} waiting
          </span>
        </div>

        {filteredWaitingTokens.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-check-all fs-1 text-success d-block mb-2"></i>
            <p className="mb-0 fw-semibold">All caught up! No waiting customers for this service.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Order</th>
                  <th>Token #</th>
                  <th>Customer Name</th>
                  <th>Phone</th>
                  <th>Registered</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWaitingTokens.map((token, index) => (
                  <tr key={token.id}>
                    <td>
                      <span className="badge bg-light text-dark border">
                        #{index + 1}
                      </span>
                    </td>
                    <td>
                      <strong className="font-monospace text-primary fs-6">{token.tokenNumber}</strong>
                    </td>
                    <td className="fw-semibold">{token.customerName}</td>
                    <td>{token.customerPhone}</td>
                    <td className="text-muted small">
                      {new Date(token.createdAt).toLocaleTimeString()}
                    </td>
                    <td>
                      <StatusBadge status={token.status} />
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-danger rounded-pill"
                        onClick={() => handleOpenCancel(token.id)}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancel Token Modal */}
      {cancelModal.show && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Cancel Queue Token</h5>
                <button type="button" className="btn-close" onClick={() => setCancelModal({ show: false, tokenId: null, reason: '' })}></button>
              </div>
              <div className="modal-body">
                <p className="text-muted small">
                  Provide a cancellation reason. The token record will be preserved for auditing.
                </p>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Reason</label>
                  <select
                    className="form-select mb-2"
                    value={cancelModal.reason}
                    onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })}
                  >
                    <option value="Customer did not show up">Customer did not show up</option>
                    <option value="Customer requested cancellation">Customer requested cancellation</option>
                    <option value="Duplicate token">Duplicate token</option>
                    <option value="Wrong service desk">Wrong service desk</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill"
                  onClick={() => setCancelModal({ show: false, tokenId: null, reason: '' })}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-danger rounded-pill fw-bold"
                  onClick={handleConfirmCancel}
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
