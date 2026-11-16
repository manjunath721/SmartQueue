import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import LoadingSpinner from '../components/LoadingSpinner';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fetchCustomers = async () => {
    try {
      const data = await adminApi.getCustomers({
        keyword: keyword || null,
        page,
        size: 10,
      });
      setCustomers(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchCustomers();
  };

  return (
    <div className="container-fluid p-4">
      {/* Title */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom gap-3">
        <div>
          <span className="badge bg-primary-subtle text-primary fw-semibold px-3 py-1 rounded-pill small">
            DIRECTORY
          </span>
          <h2 className="fw-bold mb-0 mt-1">Customer Directory</h2>
          <small className="text-muted">Registered customers, phone contacts and visit histories</small>
        </div>

        <form onSubmit={handleSearch} className="d-flex gap-2">
          <input
            type="text"
            className="form-control rounded-pill px-3"
            placeholder="Search name, phone, or email..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="submit" className="btn btn-primary rounded-pill px-4 fw-semibold">
            Search
          </button>
        </form>
      </div>

      {/* Customers Table */}
      <div className="sq-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0 text-dark">
            <i className="bi bi-people-fill me-2 text-primary"></i> Customer Records
          </h5>
          <span className="badge bg-light text-muted border">
            Total: {totalElements}
          </span>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading customer records..." />
        ) : customers.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-person-x fs-1 d-block mb-2 text-secondary"></i>
            <p className="fw-semibold">No customers found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Customer ID</th>
                  <th>Full Name</th>
                  <th>Mobile Phone</th>
                  <th>Email</th>
                  <th>First Registered</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className="badge bg-light text-dark border font-monospace">#{c.id}</span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: '36px', height: '36px' }}>
                          {c.name.charAt(0)}
                        </div>
                        <span className="fw-bold text-dark">{c.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="font-monospace text-muted">{c.phone}</span>
                    </td>
                    <td>{c.email || <span className="text-muted small italic">Not provided</span>}</td>
                    <td className="text-muted small">
                      {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
    </div>
  );
};

export default CustomerManagement;
