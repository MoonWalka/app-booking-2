import React from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../../config.js';
import styles from './Navbar.module.css';

const Navbar = () => {
  return (
    <nav className={`${styles.navbar} ${styles.navbarDark} ${styles.navbarExpand}`}>
      <div className={styles.containerFluid}>
        <Link className={styles.navbarBrand} to="/">{APP_NAME}</Link>
        <button 
          className={styles.navbarToggler} 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className={styles.navbarTogglerIcon}></span>
        </button>
        <div className={styles.navbarCollapse} id="navbarNav">
          <ul className={`${styles.navbarNav} ${styles.meAuto}`}>
            <li className={styles.navItem}>
              <Link className={styles.navLink} to="/">Dashboard</Link>
            </li>
            <li className={styles.navItem}>
              <Link className={styles.navLink} to="/concerts">Concerts</Link>
            </li>
            <li className={styles.navItem}>
              <Link className={styles.navLink} to="/programmateurs">Programmateurs</Link>
            </li>
            <li className={styles.navItem}>
              <Link className={styles.navLink} to="/lieux">Lieux</Link>
            </li>
            <li className={styles.navItem}>
              <Link className={styles.navLink} to="/contrats">Contrats</Link>
            </li>
          </ul>
          <div className={styles.dFlex}>
            <span className={`${styles.navbarText} ${styles.me3}`}>Utilisateur test</span>
            <Link className={styles.btnOutlineLight} to="/login">Déconnexion</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
