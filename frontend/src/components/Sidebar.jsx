import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, isAdmin, logout } = useAuth();

  return (
    <div className="admin-sidebar p-3 d-none d-lg-flex">
      <div className="px-3 py-3 mb-3 border-bottom border-secondary border-opacity-25">
        <div className="d-flex align-items-center gap-2">
          <div className="bg-primary text-white rounded p-1 fs-5">
            <i className="bi bi-shield-lock-fill"></i>
          </div>
          <div>
            <h6 className="mb-0 text-white fw-bold">Admin Console</h6>
            <small className="text-secondary" style={{ fontSize: '0.75rem' }}>Management & Control</small>
          </div>
        </div>
      </div>

      <div className="nav flex-column gap-1 flex-grow-1">
        <NavLink to="/admin" end className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-speedometer2"></i>
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/admin/queue" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-list-check"></i>
          <span>Live Queue</span>
        </NavLink>

        <NavLink to="/admin/services" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-gear-wide-connected"></i>
          <span>Services</span>
        </NavLink>

        <NavLink to="/admin/staff" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-people"></i>
          <span>Staff Accounts</span>
        </NavLink>

        <NavLink to="/admin/customers" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-person-lines-fill"></i>
          <span>Customers</span>
        </NavLink>

        <NavLink to="/admin/analytics" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-graph-up-arrow"></i>
          <span>Analytics</span>
        </NavLink>

        <div className="mt-4 pt-3 border-top border-secondary border-opacity-25 px-3">
          <small className="text-uppercase text-secondary fw-bold" style={{ fontSize: '0.7rem' }}>Quick Jump</small>
        </div>

        <NavLink to="/staff" className="sidebar-nav-link text-info">
          <i className="bi bi-headset"></i>
          <span>Staff Working Desk</span>
        </NavLink>

        <NavLink to="/display" target="_blank" className="sidebar-nav-link text-warning">
          <i className="bi bi-tv"></i>
          <span>TV Display Board</span>
        </NavLink>
      </div>

      <div className="pt-3 border-top border-secondary border-opacity-25 px-2">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2 overflow-hidden">
            <div className="rounded-circle bg-secondary bg-opacity-50 text-white d-flex align-items-center justify-content-center p-2" style={{ width: '32px', height: '32px' }}>
              <i className="bi bi-person-fill"></i>
            </div>
            <div className="text-truncate">
              <p className="mb-0 text-white small fw-semibold text-truncate">{user?.fullName}</p>
              <p className="mb-0 text-secondary" style={{ fontSize: '0.7rem' }}>{user?.username}</p>
            </div>
          </div>
          <button onClick={logout} className="btn btn-sm btn-outline-danger p-1 px-2" title="Sign Out">
            <i className="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
