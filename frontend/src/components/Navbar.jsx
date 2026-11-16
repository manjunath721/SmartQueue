import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isStaff, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark py-3 border-bottom border-secondary border-opacity-25 sticky-top">
      <div className="container-fluid px-4">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold fs-4" to="/">
          <div className="bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }}>
            <i className="bi bi-people-fill"></i>
          </div>
          <span>SMART<span className="text-primary">QUEUE</span></span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/take-token">
                <i className="bi bi-ticket-perforated me-1"></i> Get a Token
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/track">
                <i className="bi bi-search me-1"></i> Track Token
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/display" target="_blank" rel="noopener noreferrer">
                <i className="bi bi-display me-1"></i> Live Display Board <i className="bi bi-box-arrow-up-right small"></i>
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2 py-2 px-3 rounded-pill"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}>
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <span className="fw-medium small">{user?.fullName}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2 p-2" aria-labelledby="userDropdown">
                  <li className="px-3 py-2 border-bottom mb-2">
                    <p className="mb-0 fw-bold">{user?.fullName}</p>
                    <p className="mb-0 text-muted small">{user?.email}</p>
                    <span className="badge bg-secondary-subtle text-secondary small mt-1">
                      {isAdmin ? 'ADMINISTRATOR' : 'STAFF'}
                    </span>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link className="dropdown-item rounded py-2" to="/admin">
                        <i className="bi bi-speedometer2 me-2"></i> Admin Dashboard
                      </Link>
                    </li>
                  )}
                  {isStaff && (
                    <li>
                      <Link className="dropdown-item rounded py-2" to="/staff">
                        <i className="bi bi-person-workspace me-2"></i> Staff Console
                      </Link>
                    </li>
                  )}
                  <li><hr className="dropdown-divider my-2" /></li>
                  <li>
                    <button className="dropdown-item rounded py-2 text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i> Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-light px-4 py-2 rounded-pill fw-semibold small">
                  Portal Login
                </Link>
                <Link to="/take-token" className="btn btn-primary px-4 py-2 rounded-pill fw-semibold small shadow-sm">
                  Join Queue
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
