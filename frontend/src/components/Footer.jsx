import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-top py-4 mt-auto">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start mb-2 mb-md-0">
            <span className="fw-bold text-primary">SMART QUEUE</span> &copy; {new Date().getFullYear()} Digital Customer Queue & Service Platform. All rights reserved.
          </div>
          <div className="col-md-6 text-center text-md-end">
            <ul className="list-inline mb-0 small">
              <li className="list-inline-item me-3">
                <Link to="/take-token" className="text-decoration-none text-muted">Get Token</Link>
              </li>
              <li className="list-inline-item me-3">
                <Link to="/track" className="text-decoration-none text-muted">Track Token</Link>
              </li>
              <li className="list-inline-item me-3">
                <Link to="/display" className="text-decoration-none text-muted">Public Board</Link>
              </li>
              <li className="list-inline-item">
                <Link to="/login" className="text-decoration-none text-muted">Staff Portal</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
