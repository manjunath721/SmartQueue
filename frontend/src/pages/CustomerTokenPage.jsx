import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { serviceApi } from '../api/serviceApi';
import { queueApi } from '../api/queueApi';

const CustomerTokenPage = () => {
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get('serviceId');

  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(preselectedServiceId || '');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    serviceApi.getActiveServices()
      .then((data) => {
        setServices(data);
        if (data.length > 0 && !selectedServiceId) {
          setSelectedServiceId(data[0].id.toString());
        }
      })
      .catch((err) => setError('Could not load service counters: ' + err.message))
      .finally(() => setServicesLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedServiceId) {
      setError('Please select a service desk.');
      return;
    }

    setLoading(true);
    try {
      const response = await queueApi.generateToken({
        serviceId: Number(selectedServiceId),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || null,
      });

      // Navigate straight to digital tracking ticket
      navigate(`/track/${response.trackingId}`, {
        state: { newGenerated: true, tokenData: response },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate queue token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedService = services.find((s) => s.id.toString() === selectedServiceId);

  return (
    <div className="container py-5 my-auto">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-xl-7">
          <div className="sq-card p-4 p-md-5">
            <div className="text-center mb-4">
              <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-bold mb-2">
                Fast & Touchless Queue
              </span>
              <h2 className="fw-bold">Get Your Digital Token</h2>
              <p className="text-muted">Enter your contact info to join the queue and track your position live</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small d-flex align-items-center gap-2" role="alert">
                <i className="bi bi-exclamation-triangle-fill"></i>
                <div>{error}</div>
              </div>
            )}

            {servicesLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="text-muted small mt-2">Loading active services...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Service Selection */}
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark mb-2">
                    1. Select Service Desk *
                  </label>
                  <div className="row g-2">
                    {services.map((svc) => {
                      const isSelected = selectedServiceId === svc.id.toString();
                      return (
                        <div key={svc.id} className="col-md-6">
                          <div
                            onClick={() => setSelectedServiceId(svc.id.toString())}
                            className={`p-3 rounded-3 border cursor-pointer h-100 transition ${
                              isSelected
                                ? 'border-primary bg-primary bg-opacity-10 shadow-sm'
                                : 'border-light-subtle bg-white'
                            }`}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="fw-bold text-dark">{svc.name}</span>
                              <span className="badge bg-primary rounded-pill">
                                {svc.prefix}
                              </span>
                            </div>
                            <div className="d-flex justify-content-between text-muted small">
                              <span>~{svc.avgDurationMinutes} mins/person</span>
                              <span>Waiting: <strong>{svc.waitingCount || 0}</strong></span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Customer Information */}
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark mb-2">
                    2. Customer Details *
                  </label>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Full Name *</label>
                      <input
                        type="text"
                        className="form-control py-2"
                        placeholder="e.g. Michael Scott"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Mobile Phone Number *</label>
                      <input
                        type="tel"
                        className="form-control py-2"
                        placeholder="e.g. +1 (555) 234-5678"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        required
                      />
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                        Used to notify and verify your token
                      </small>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Email (Optional)</label>
                      <input
                        type="email"
                        className="form-control py-2"
                        placeholder="e.g. customer@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Estimated preview info */}
                {selectedService && (
                  <div className="bg-light p-3 rounded-3 mb-4 border d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted d-block">Current Line</small>
                      <strong className="text-dark">
                        {selectedService.waitingCount || 0} waiting ahead
                      </strong>
                    </div>
                    <div className="text-end">
                      <small className="text-muted d-block">Est. Wait Time</small>
                      <strong className="text-primary">
                        ~{((selectedService.waitingCount || 0) + 1) * selectedService.avgDurationMinutes} mins
                      </strong>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-3 rounded-pill fw-bold fs-5 shadow"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Generating Token...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-ticket-perforated-fill me-2"></i> Generate Queue Token Now
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerTokenPage;
