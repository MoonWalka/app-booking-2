import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ConcertsListHeader.module.css';

const ConcertsListHeader = () => {
  return (
    <div className={`flex items-center justify-between mb-6 ${styles.headerContainer}`}>
      <h1 className="text-xl font-semibold text-[var(--tc-primary-color)]">Liste des concerts</h1>
      <Link to="/concerts/nouveau" className="bg-[var(--tc-primary-color)] hover:bg-[var(--tc-primary-color-hover)] text-[var(--tc-on-primary-color)] px-4 py-2 rounded-md flex items-center gap-2">
        <span className="text-lg font-bold">＋</span>
        Ajouter un concert
      </Link>
    </div>
  );
};

export default ConcertsListHeader;