import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
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

const AnalyticsPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboardSummary()
      .then(setDashboard)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner message="Generating real-time operational reports..." />;
  }

  // Completion vs Cancellation vs Waiting
  const statusLabels = Object.keys(dashboard?.tokensByStatus || {});
  const statusValues = Object.values(dashboard?.tokensByStatus || {});

  const doughnutData = {
    labels: statusLabels,
    datasets: [
      {
        data: statusValues,
        backgroundColor: ['#f59e0b', '#2563eb', '#10b981', '#ef4444'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const serviceLabels = Object.keys(dashboard?.tokensByService || {});
  const serviceValues = Object.values(dashboard?.tokensByService || {});

  const barData = {
    labels: serviceLabels,
    datasets: [
      {
        label: 'Cumulative Volume',
        data: serviceValues,
        backgroundColor: '#6366f1',
        borderRadius: 8,
      },
    ],
  };

  const completionRate = dashboard?.totalTokensGenerated > 0
    ? Math.round(((dashboard.completedToday || 0) / dashboard.totalTokensGenerated) * 100)
    : 0;

  return (
    <div className="container-fluid p-4">
      {/* Title */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom gap-3">
        <div>
          <span className="badge bg-primary-subtle text-primary fw-semibold px-3 py-1 rounded-pill small">
            INTELLIGENCE & AUDIT
          </span>
          <h2 className="fw-bold mb-0 mt-1">Queue Analytics & Performance</h2>
          <small className="text-muted">Throughput rates, wait times, completion metrics and service volume distribution</small>
        </div>

        <button onClick={() => window.print()} className="btn btn-outline-dark rounded-pill btn-sm px-4">
          <i className="bi bi-printer me-1"></i> Print Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="sq-card p-4 h-100">
            <span className="text-muted small fw-bold text-uppercase">Average Wait Duration</span>
            <h2 className="fw-extrabold text-primary mb-1 mt-2">
              ~{dashboard?.avgWaitTimeMinutes || 0} <span className="fs-5 text-muted fw-normal">min</span>
            </h2>
            <small className="text-success"><i className="bi bi-arrow-down-short"></i> Based on completed visits</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="sq-card p-4 h-100">
            <span className="text-muted small fw-bold text-uppercase">Total Service Desks</span>
            <h2 className="fw-extrabold text-dark mb-1 mt-2">
              {dashboard?.serviceSummaries?.length || 0}
            </h2>
            <small className="text-muted">Configured queue zones</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="sq-card p-4 h-100">
            <span className="text-muted small fw-bold text-uppercase">Completion Rate Today</span>
            <h2 className="fw-extrabold text-success mb-1 mt-2">
              {dashboard?.completedToday || 0}
            </h2>
            <small className="text-muted">Customers served successfully</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="sq-card p-4 h-100">
            <span className="text-muted small fw-bold text-uppercase">Total Queued Customers</span>
            <h2 className="fw-extrabold text-dark mb-1 mt-2">
              {dashboard?.totalCustomers || 0}
            </h2>
            <small className="text-muted">Unique customer identities</small>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="sq-card p-4 h-100">
            <h5 className="fw-bold mb-3 text-dark">
              <i className="bi bi-pie-chart-fill me-2 text-primary"></i> Queue Token Status Breakdown
            </h5>
            <div style={{ maxHeight: '300px', display: 'flex', justifyContent: 'center' }}>
              <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="sq-card p-4 h-100">
            <h5 className="fw-bold mb-3 text-dark">
              <i className="bi bi-bar-chart-fill me-2 text-primary"></i> Customer Distribution by Desk
            </h5>
            <div style={{ maxHeight: '300px' }}>
              <Bar
                data={barData}
                options={{
                  maintainAspectRatio: false,
                  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Service Efficiency Table */}
      <div className="sq-card p-4">
        <h5 className="fw-bold mb-3 text-dark">
          <i className="bi bi-speedometer me-2 text-primary"></i> Service Desk Efficiency Metrics
        </h5>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Service Name</th>
                <th>Prefix</th>
                <th>Target Duration</th>
                <th>Currently Waiting</th>
                <th>Currently Serving</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboard?.serviceSummaries?.map((s) => (
                <tr key={s.id}>
                  <td className="fw-bold">{s.name}</td>
                  <td><span className="badge bg-primary rounded-pill">{s.prefix}</span></td>
                  <td>~{s.avgDurationMinutes} mins</td>
                  <td>
                    <span className="badge bg-warning-subtle text-dark px-2 py-1">
                      {s.waitingCount || 0}
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-primary-subtle text-primary px-2 py-1">
                      {s.currentlyServingToken || 'None'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${s.active ? 'bg-success-subtle text-success' : 'bg-secondary'}`}>
                      {s.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
