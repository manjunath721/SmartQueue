import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { serviceApi } from '../api/serviceApi';

const LandingPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingInput, setTrackingInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    serviceApi.getActiveServices()
      .then(data => setServices(data))
      .catch(err => console.error('Error fetching services:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackingInput.trim()) {
      navigate(`/track/${trackingInput.trim()}`);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient text-center py-5">
        <div className="container py-4">
          <span className="badge bg-primary-subtle text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill fw-semibold mb-3">
            Digital Waiting & Queuing Platform
          </span>
          <h1 className="display-4 fw-extrabold text-white mb-3">
            Eliminate Physical Queues.<br />
            <span className="text-info">Empower Every Customer.</span>
          </h1>
          <p className="lead text-light text-opacity-75 mx-auto mb-4" style={{ maxWidth: '680px' }}>
            Generate your digital service token on your phone, track your position in real-time,
            and step in only when it's your turn.
          </p>

          <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
            <Link to="/take-token" className="btn btn-primary btn-lg px-4 py-3 rounded-pill fw-bold shadow">
              <i className="bi bi-ticket-perforated-fill me-2"></i> Take a Digital Token
            </Link>
            <Link to="/display" target="_blank" className="btn btn-outline-light btn-lg px-4 py-3 rounded-pill fw-bold">
              <i className="bi bi-tv me-2"></i> View Waiting Board
            </Link>
          </div>

          {/* Quick Track Bar */}
          <div className="mx-auto" style={{ maxWidth: '540px' }}>
            <form onSubmit={handleTrackSubmit} className="input-group p-1 bg-white rounded-pill shadow-lg">
              <span className="input-group-text bg-transparent border-0 ps-3 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-0 shadow-none ps-2"
                placeholder="Already have a tracking ID? e.g. tr_..."
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
              />
              <button className="btn btn-dark rounded-pill px-4 fw-semibold" type="submit">
                Track
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark">Available Service Desks</h2>
            <p className="text-muted">Choose your desired counter to join the queue immediately</p>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : (
            <div className="row g-4">
              {services.map(svc => (
                <div key={svc.id} className="col-md-6 col-lg-3">
                  <div className="sq-card h-100 p-4 d-flex flex-column justify-content-between border-top border-4 border-primary">
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="badge bg-primary bg-opacity-10 text-primary fw-bold px-3 py-2 rounded-3">
                          Prefix: {svc.prefix}
                        </span>
                        <span className="badge bg-light text-muted border">
                          ~{svc.avgDurationMinutes} mins/person
                        </span>
                      </div>
                      <h5 className="fw-bold text-dark mb-2">{svc.name}</h5>
                      <p className="text-muted small mb-4">{svc.description || 'Standard customer service desk.'}</p>
                    </div>

                    <div className="pt-3 border-top">
                      <div className="d-flex justify-content-between text-muted small mb-3">
                        <span>Waiting in line:</span>
                        <strong className="text-dark">{svc.waitingCount || 0} people</strong>
                      </div>
                      <Link
                        to={`/take-token?serviceId=${svc.id}`}
                        className="btn btn-outline-primary w-100 rounded-pill fw-semibold py-2"
                      >
                        Join This Queue
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <div className="container py-4">
          <div className="row g-4 text-center">
            <div className="col-md-4">
              <div className="sq-card p-4 h-100">
                <div className="sq-stat-icon bg-primary bg-opacity-10 text-primary mx-auto mb-3">
                  <i className="bi bi-clock-history"></i>
                </div>
                <h5 className="fw-bold">Zero Physical Waiting</h5>
                <p className="text-muted small mb-0">
                  Customers register on mobile and keep an eye on dynamic position updates while shopping or relaxing.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="sq-card p-4 h-100">
                <div className="sq-stat-icon bg-success bg-opacity-10 text-success mx-auto mb-3">
                  <i className="bi bi-shield-check"></i>
                </div>
                <h5 className="fw-bold">Fair FIFO Processing</h5>
                <p className="text-muted small mb-0">
                  Strict First-In-First-Out queue management with concurrency locks guarantees transparent ordering.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="sq-card p-4 h-100">
                <div className="sq-stat-icon bg-warning bg-opacity-10 text-warning mx-auto mb-3">
                  <i className="bi bi-graph-up"></i>
                </div>
                <h5 className="fw-bold">Live Staff & Admin KPIs</h5>
                <p className="text-muted small mb-0">
                  Real-time throughput metrics, wait time analytics, counter performance and automated display boards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
