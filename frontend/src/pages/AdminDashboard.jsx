import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/adminApi';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
);

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      const data = await adminApi.getDashboardSummary();
      setDashboard(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 6000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading live executive analytics..." />;
  }

  // Chart data: Tokens by Status
  const statusLabels = Object.keys(dashboard?.tokensByStatus || {});
  const statusCounts = Object.values(dashboard?.tokensByStatus || {});
  const doughnutData = {
    labels: statusLabels,
    datasets: [
      {
        data: statusCounts,
        backgroundColor: [
          '#f59e0b', // WAITING
          '#2563eb', // SERVING
          '#10b981', // COMPLETED
          '#ef4444', // CANCELLED
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  // Chart data: Service Distribution
  const serviceLabels = Object.keys(dashboard?.tokensByService || {});
  const serviceCounts = Object.values(dashboard?.tokensByService || {});
  const barData = {
    labels: serviceLabels,
    datasets: [
      {
        label: 'Total Tokens Generated',
        data: serviceCounts,
        backgroundColor: '#3b82f6',
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="container-fluid p-4">
      {/* Title Bar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom gap-3">
        <div>
          <span className="badge bg-primary-subtle text-primary fw-semibold px-3 py-1 rounded-pill small">
            ADMINISTRATION OVERVIEW
          </span>
          <h2 className="fw-bold mb-0 mt-1">Smart Queue Executive Dashboard</h2>
          <small className="text-muted">Live performance indicators, queue distributions and recent customer activity</small>
        </div>

        <div className="d-flex gap-2">
          <Link to="/admin/services" className="btn btn-outline-primary btn-sm rounded-pill px-3">
            <i className="bi bi-gear me-1"></i> Manage Services
          </Link>
          <Link to="/admin/staff" className="btn btn-outline-dark btn-sm rounded-pill px-3">
            <i className="bi bi-people me-1"></i> Staff Accounts
          </Link>
          <button onClick={fetchDashboard} className="btn btn-primary btn-sm rounded-pill px-3">
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small mb-4">{error}</div>
      )}

      {/* 6 Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-2">
          <div className="sq-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold">Customers</span>
              <div className="text-primary fs-5"><i className="bi bi-people"></i></div>
            </div>
            <h3 className="fw-extrabold mb-0">{dashboard?.totalCustomers || 0}</h3>
            <small className="text-muted">Registered all-time</small>
          </div>
        </div>

        <div className="col-sm-6 col-xl-2">
          <div className="sq-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold">Tokens</span>
              <div className="text-info fs-5"><i className="bi bi-ticket-perforated"></i></div>
            </div>
            <h3 className="fw-extrabold mb-0">{dashboard?.totalTokensGenerated || 0}</h3>
            <small className="text-muted">Total generated</small>
          </div>
        </div>

        <div className="col-sm-6 col-xl-2">
          <div className="sq-card p-3 h-100 border-warning border-opacity-50">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-warning small fw-bold">Waiting Now</span>
              <div className="text-warning fs-5"><i className="bi bi-hourglass-split"></i></div>
            </div>
            <h3 className="fw-extrabold mb-0 text-warning">{dashboard?.currentlyWaiting || 0}</h3>
            <small className="text-muted">Active queue</small>
          </div>
        </div>

        <div className="col-sm-6 col-xl-2">
          <div className="sq-card p-3 h-100 border-primary border-opacity-50">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-primary small fw-bold">Serving Now</span>
              <div className="text-primary fs-5"><i className="bi bi-bell-fill"></i></div>
            </div>
            <h3 className="fw-extrabold mb-0 text-primary">{dashboard?.currentlyServing || 0}</h3>
            <small className="text-muted">At active counters</small>
          </div>
        </div>

        <div className="col-sm-6 col-xl-2">
          <div className="sq-card p-3 h-100 border-success border-opacity-50">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-success small fw-bold">Completed Today</span>
              <div className="text-success fs-5"><i className="bi bi-check-circle-fill"></i></div>
            </div>
            <h3 className="fw-extrabold mb-0 text-success">{dashboard?.completedToday || 0}</h3>
            <small className="text-muted">Successfully served</small>
          </div>
        </div>

        <div className="col-sm-6 col-xl-2">
          <div className="sq-card p-3 h-100 border-danger border-opacity-50">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-danger small fw-bold">Cancelled Today</span>
              <div className="text-danger fs-5"><i className="bi bi-x-circle-fill"></i></div>
            </div>
            <h3 className="fw-extrabold mb-0 text-danger">{dashboard?.cancelledToday || 0}</h3>
            <small className="text-muted">Cancelled / no-shows</small>
          </div>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="row g-4 mb-4">
        {/* Doughnut: Status distribution */}
        <div className="col-lg-5">
          <div className="sq-card p-4 h-100">
            <h5 className="fw-bold mb-3 text-dark">
              <i className="bi bi-pie-chart-fill me-2 text-primary"></i> Queue Tokens by Status
            </h5>
            <div style={{ maxHeight: '280px', display: 'flex', justifyContent: 'center' }}>
              <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
        </div>

        {/* Bar Chart: Service Distribution */}
        <div className="col-lg-7">
          <div className="sq-card p-4 h-100">
            <h5 className="fw-bold mb-3 text-dark">
              <i className="bi bi-bar-chart-line-fill me-2 text-primary"></i> Token Volume by Service Desk
            </h5>
            <div style={{ maxHeight: '280px' }}>
              <Bar
                data={barData}
                options={{
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Service-wise queue overview */}
      <div className="sq-card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0">
            <i className="bi bi-grid-fill me-2 text-primary"></i> Service Counters Performance
          </h5>
          <Link to="/admin/services" className="btn btn-sm btn-link text-decoration-none">
            View All Services &rarr;
          </Link>
        </div>

        <div className="row g-3">
          {dashboard?.serviceSummaries?.map((svc) => (
            <div key={svc.id} className="col-md-6 col-xl-3">
              <div className="p-3 rounded-3 bg-light border">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="badge bg-primary rounded-pill">Zone {svc.prefix}</span>
                  <span className={`badge ${svc.active ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                    {svc.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <h6 className="fw-bold text-dark text-truncate mb-2" title={svc.name}>{svc.name}</h6>
                <div className="d-flex justify-content-between text-muted small">
                  <span>Waiting: <strong>{svc.waitingCount || 0}</strong></span>
                  <span>Serving: <strong className="text-primary">{svc.currentlyServingToken || 'None'}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Tokens Table */}
      <div className="sq-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0">
            <i className="bi bi-clock-history me-2 text-primary"></i> Recent Queue Activity
          </h5>
          <Link to="/admin/queue" className="btn btn-sm btn-outline-primary rounded-pill px-3">
            Full Queue Monitor
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Token #</th>
                <th>Customer</th>
                <th>Service Desk</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {dashboard?.recentTokens?.map((token) => (
                <tr key={token.id}>
                  <td>
                    <strong className="font-monospace text-primary">{token.tokenNumber}</strong>
                  </td>
                  <td>
                    <div className="fw-semibold">{token.customerName}</div>
                    <small className="text-muted">{token.customerPhone}</small>
                  </td>
                  <td>{token.serviceName}</td>
                  <td><StatusBadge status={token.status} /></td>
                  <td>{token.servedByUsername || <span className="text-muted italic">Unassigned</span>}</td>
                  <td className="text-muted small">{new Date(token.createdAt).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
