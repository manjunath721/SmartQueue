import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { queueApi } from '../api/queueApi';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const TokenTrackingPage = () => {
  const { trackingId } = useParams();
  const navigate = useNavigate();

  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);

  const prevStatusRef = useRef(null);

  const fetchTokenStatus = async (isInitial = false) => {
    if (!trackingId) return;
    try {
      const data = await queueApi.trackToken(trackingId);
      setTokenData(data);
      setLastRefreshed(new Date());
      setError('');

      // Play alert chime if status transitioned to SERVING
      if (prevStatusRef.current === 'WAITING' && data.status === 'SERVING' && soundEnabled) {
        playCallingChime();
      }
      prevStatusRef.current = data.status;
    } catch (err) {
      if (isInitial) {
        setError(err.response?.data?.message || 'Token not found. Please verify your tracking ID.');
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenStatus(true);
    // Auto-refresh interval every 4.5 seconds
    const interval = setInterval(() => {
      fetchTokenStatus(false);
    }, 4500);

    return () => clearInterval(interval);
  }, [trackingId]);

  const playCallingChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn('AudioContext prevented or unsupported', e);
    }
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/track/${searchQuery.trim()}`);
    }
  };

  if (!trackingId) {
    return (
      <div className="container py-5 my-auto">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="sq-card p-5">
              <i className="bi bi-search fs-1 text-primary mb-3"></i>
              <h3 className="fw-bold mb-2">Track Your Digital Token</h3>
              <p className="text-muted small mb-4">
                Enter your unique tracking reference to check live queue position and estimated waiting time.
              </p>
              <form onSubmit={handleManualSearch} className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter tracking ID (e.g. tr_...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary px-4 fw-bold">
                  Track
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Retrieving real-time queue status..." />;
  }

  if (error) {
    return (
      <div className="container py-5 my-auto">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="sq-card p-5">
              <div className="text-danger mb-3">
                <i className="bi bi-exclamation-octagon fs-1"></i>
              </div>
              <h4 className="fw-bold text-dark">Ticket Reference Not Found</h4>
              <p className="text-muted small mb-4">{error}</p>
              <div className="d-flex justify-content-center gap-2">
                <Link to="/take-token" className="btn btn-primary rounded-pill px-4 fw-semibold">
                  Get a New Token
                </Link>
                <Link to="/track" className="btn btn-outline-secondary rounded-pill px-4 fw-semibold">
                  Search Another
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isServingNow = tokenData?.status === 'SERVING';
  const isCompleted = tokenData?.status === 'COMPLETED';
  const isCancelled = tokenData?.status === 'CANCELLED';

  return (
    <div className="container py-5 my-auto">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          {/* Real-time Calling Banner */}
          {isServingNow && (
            <div className="alert alert-primary shadow-lg border-2 border-primary text-center mb-4 p-4 rounded-4 animate__animated animate__pulse animate__infinite">
              <div className="display-6 mb-2">🔔</div>
              <h3 className="fw-bold text-primary mb-1">It's Your Turn Now!</h3>
              <p className="lead mb-0 text-dark fw-semibold">
                Please proceed immediately to{' '}
                <span className="badge bg-primary fs-5 px-3 py-2 rounded-pill">
                  {tokenData.counterName || 'Counter 1'}
                </span>
              </p>
            </div>
          )}

          {/* Digital Ticket Card */}
          <div className="digital-ticket">
            {/* Header */}
            <div className="ticket-header">
              <span className="badge bg-white bg-opacity-25 text-white mb-2 px-3 py-1 rounded-pill small">
                SMART QUEUE TICKET
              </span>
              <h4 className="fw-bold mb-0">{tokenData.serviceName}</h4>
              <small className="text-white-50">Public Service Pass</small>
            </div>

            {/* Ticket Body */}
            <div className="p-4 text-center">
              <div className="mb-3">
                <span className="text-muted small text-uppercase fw-bold d-block mb-1">
                  Your Token Number
                </span>
                <div className="token-big-badge shadow-sm">
                  {tokenData.tokenNumber}
                </div>
              </div>

              <div className="mb-4">
                <StatusBadge status={tokenData.status} />
              </div>

              {/* Dynamic Stats for Waiting Customer */}
              {tokenData.status === 'WAITING' && (
                <div className="row g-2 mb-4 bg-light p-3 rounded-4 border">
                  <div className="col-4 border-end">
                    <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>YOUR POSITION</small>
                    <span className="fs-4 fw-extrabold text-primary">#{tokenData.peopleAhead + 1}</span>
                  </div>
                  <div className="col-4 border-end">
                    <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>PEOPLE AHEAD</small>
                    <span className="fs-4 fw-extrabold text-dark">{tokenData.peopleAhead}</span>
                  </div>
                  <div className="col-4">
                    <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>EST. WAIT</small>
                    <span className="fs-4 fw-extrabold text-success">~{tokenData.estimatedWaitMinutes}m</span>
                  </div>
                </div>
              )}

              {/* Currently Serving Counter Info */}
              <div className="p-3 bg-primary bg-opacity-10 rounded-3 mb-4 text-start">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-muted small">Current Serving Token:</span>
                  <strong className="text-primary fs-5">
                    {tokenData.currentlyServingToken || 'None Active'}
                  </strong>
                </div>
                {tokenData.counterName && (
                  <div className="d-flex justify-content-between align-items-center small">
                    <span className="text-muted">Serving at:</span>
                    <strong className="text-dark">{tokenData.counterName}</strong>
                  </div>
                )}
              </div>

              {/* Ticket Details List */}
              <div className="text-start border-top pt-3 text-muted small">
                <div className="d-flex justify-content-between py-1">
                  <span>Customer Name:</span>
                  <strong className="text-dark">{tokenData.customerName}</strong>
                </div>
                <div className="d-flex justify-content-between py-1">
                  <span>Registered At:</span>
                  <span className="text-dark">{new Date(tokenData.createdAt).toLocaleTimeString()}</span>
                </div>
                {tokenData.calledAt && (
                  <div className="d-flex justify-content-between py-1">
                    <span>Called At:</span>
                    <span className="text-dark">{new Date(tokenData.calledAt).toLocaleTimeString()}</span>
                  </div>
                )}
                {tokenData.completedAt && (
                  <div className="d-flex justify-content-between py-1">
                    <span>Completed At:</span>
                    <span className="text-success fw-bold">{new Date(tokenData.completedAt).toLocaleTimeString()}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between py-1">
                  <span>Tracking Ref:</span>
                  <code className="text-secondary small">{tokenData.trackingId.substring(0, 16)}...</code>
                </div>
              </div>
            </div>

            {/* Ticket Footer */}
            <div className="p-3 bg-light border-top d-flex justify-content-between align-items-center small">
              <span className="text-muted d-flex align-items-center gap-1">
                <span className="spinner-grow spinner-grow-sm text-success" role="status"></span>
                Live updating ({lastRefreshed.toLocaleTimeString()})
              </span>
              <button
                className={`btn btn-sm ${soundEnabled ? 'btn-outline-primary' : 'btn-outline-secondary'}`}
                onClick={() => setSoundEnabled(!soundEnabled)}
                title="Toggle Audio Notifications"
              >
                <i className={`bi ${soundEnabled ? 'bi-volume-up-fill' : 'bi-volume-mute-fill'}`}></i>
              </button>
            </div>
          </div>

          {/* Action Links */}
          <div className="text-center mt-4">
            <button
              onClick={() => window.print()}
              className="btn btn-outline-dark rounded-pill px-4 me-2 small fw-semibold"
            >
              <i className="bi bi-printer me-1"></i> Print Ticket
            </button>
            <Link to="/take-token" className="btn btn-link text-decoration-none small">
              Get Another Token
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenTrackingPage;
