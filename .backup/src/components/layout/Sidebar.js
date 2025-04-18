import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="bg-dark text-white p-3 sidebar">
      <h5 className="mb-3">App Booking</h5>
      <ul className="nav flex-column">
        <li className="nav-item">
          <Link className="nav-link text-white" to="/">
            <i className="bi bi-speedometer2 me-2"></i>
            Dashboard
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-white" to="/concerts">
            <i className="bi bi-music-note-list me-2"></i>
            Concerts
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-white" to="/programmateurs">
            <i className="bi bi-person-lines-fill me-2"></i>
            Programmateurs
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-white" to="/lieux">
            <i className="bi bi-geo-alt-fill me-2"></i>
            Lieux
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-white" to="/contrats">
            <i className="bi bi-file-earmark-text me-2"></i>
            Contrats
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
