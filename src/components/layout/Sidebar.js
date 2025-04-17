import React from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../../config';

const Sidebar = () => {
  console.log("Le composant Sidebar est rendu"); // Ce log devrait apparaître dans la console
  return (
    <div className="bg-dark text-white p-3 sidebar">
      <h5 className="mb-3">{APP_NAME}</h5>
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
          <Link className="nav-link text-white" to="/artistes">
            <i className="bi bi-music-note-beamed me-2"></i>
            Artistes
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-white" to="/contrats">
            <i className="bi bi-file-earmark-text me-2"></i>
            Contrats
          </Link>
        </li>
        {/* Nouvel élément de menu pour les paramètres */}
        <li className="nav-item">
          <Link className="nav-link text-white" to="/parametres">
            <i className="bi bi-gear me-2"></i>
            Paramètres
          </Link>
        </li>
        {/* Élément Paramètres avec style distinctif pour vérifier s'il est rendu */}
        <li className="nav-item" style={{border: '2px solid red'}}>
          <Link className="nav-link text-white" to="/parametres">
            <i className="bi bi-gear me-2"></i>
            Paramètres
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
