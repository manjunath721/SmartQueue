import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(username, password);
      if (user.roles.includes('ROLE_ADMIN')) {
        navigate('/admin');
      } else {
        navigate('/staff');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="container py-5 my-auto">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="sq-card p-4 p-md-5">
            <div className="text-center mb-4">
              <div className="bg-primary text-white rounded-3 p-3 d-inline-flex mb-3">
                <i className="bi bi-shield-lock fs-2"></i>
              </div>
              <h3 className="fw-bold">Staff & Admin Portal</h3>
              <p className="text-muted small">Sign in to manage service queues and live counters</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small d-flex align-items-center gap-2" role="alert">
                <i className="bi bi-exclamation-triangle-fill"></i>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Username or Email</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted border-end-0">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="e.g. admin or staff_sarah"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted border-end-0">
                    <i className="bi bi-key"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control border-start-0"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 rounded-pill fw-bold shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Authenticating...
                  </>
                ) : (
                  'Sign In to Dashboard'
                )}
              </button>
            </form>

            {/* Quick Demo Credentials */}
            <div className="mt-4 pt-3 border-top text-center">
              <small className="text-muted fw-semibold d-block mb-2">⚡ One-Click Demo Credentials:</small>
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-dark rounded-pill"
                  onClick={() => fillCredentials('admin', 'AdminPassword123!')}
                >
                  <i className="bi bi-shield-check me-1"></i> Admin
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary rounded-pill"
                  onClick={() => fillCredentials('staff_sarah', 'StaffPassword123!')}
                >
                  <i className="bi bi-person-badge me-1"></i> Staff Sarah
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-info rounded-pill"
                  onClick={() => fillCredentials('staff_david', 'StaffPassword123!')}
                >
                  <i className="bi bi-person-badge me-1"></i> Staff David
                </button>
              </div>
            </div>

            <div className="text-center mt-4">
              <Link to="/register" className="small text-decoration-none">
                Don't have an account? Register here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
