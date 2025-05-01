import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ConcertsListHeader.module.css';

const ConcertsListHeader = () => {
  return (
    <div className={`d-flex justify-content-between align-items-center mb-4 ${styles.headerContainer}`}>
      <h2 className="fs-4 fw-bold text-primary mb-0">Liste des concerts</h2>
      <Link to="/concerts/nouveau" className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 rounded-3">
        <i className="bi bi-plus-lg"></i>
        Ajouter un concert
      </Link>
    </div>
  );
};

export default ConcertsListHeader;