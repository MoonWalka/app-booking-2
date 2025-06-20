import React from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '@/config.js';
// import { mapTerm } from '@/utils/terminologyMapping'; // Non utilisé dans ce composant
import styles from './Sidebar.module.css';

const Sidebar = () => {
  console.log("Le composant Sidebar est rendu"); // Ce log devrait apparaître dans la console
  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h5>{APP_NAME}</h5>
      </div>
      <div className={styles.sidebarContent}>
        <ul className={styles.navLinks}>
          <li>
            <Link to="/" className={window.location.pathname === '/' ? styles.active : ''}>
              <i className="bi bi-speedometer2"></i>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/concerts" className={window.location.pathname.includes('/concerts') ? styles.active : ''}>
              <i className="bi bi-music-note-list"></i>
              Concerts
            </Link>
          </li>
          <li>
            <Link to="/contacts" className={window.location.pathname.includes('/contacts') ? styles.active : ''}>
              <i className="bi bi-person-lines-fill"></i>
              Contacts
            </Link>
          </li>
          <li>
            <Link to="/lieux" className={window.location.pathname.includes('/lieux') ? styles.active : ''}>
              <i className="bi bi-geo-alt-fill"></i>
              Lieux
            </Link>
          </li>
          <li>
            <Link to="/artistes" className={window.location.pathname.includes('/artistes') ? styles.active : ''}>
              <i className="bi bi-music-note-beamed"></i>
              Artistes
            </Link>
          </li>
          <li>
            <Link to="/structures" className={window.location.pathname.includes('/structures') ? styles.active : ''}>
              <i className="bi bi-building"></i>
              Structures
            </Link>
          </li>
          <li>
            <Link to="/contrats" className={window.location.pathname.includes('/contrats') ? styles.active : ''}>
              <i className="bi bi-file-earmark-text"></i>
              Contrats
            </Link>
          </li>
          <li>
            <Link to="/factures" className={window.location.pathname.includes('/factures') && !window.location.pathname.includes('/generate') ? styles.active : ''}>
              <i className="bi bi-receipt"></i>
              Factures
            </Link>
          </li>
          <li>
            <Link to="/parametres" className={window.location.pathname.includes('/parametres') ? styles.active : ''}>
              <i className="bi bi-gear"></i>
              Paramètres
            </Link>
          </li>
          {/* Temporairement visible pour tous les environnements */}
          <li>
            <Link to="/debug-tools" className={window.location.pathname.includes('/debug-tools') ? styles.active : ''}>
              <i className="bi bi-tools"></i>
              Debug
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
