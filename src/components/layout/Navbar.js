import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">App Booking</Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/concerts">Concerts</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/programmateurs">Programmateurs</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/lieux">Lieux</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contrats">Contrats</Link>
            </li>
          </ul>
          <div className="d-flex">
            <span className="navbar-text me-3">Utilisateur test</span>
            <Link className="btn btn-outline-light btn-sm" to="/login">Déconnexion</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
