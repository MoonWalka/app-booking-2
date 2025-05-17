import React from 'react';
import styles from './ConcertStatusTabs.module.css';

const ConcertStatusTabs = ({ statusFilter, setStatusFilter, statusDetailsMap }) => {
  return (
    <div className={styles.statusFilterTabs}>
      <button 
        className={`btn ${statusFilter === 'tous' ? 'btn-primary' : 'btn-light'} rounded-pill px-3 py-2`}
        onClick={() => setStatusFilter('tous')}
      >
        Tous les concerts
      </button>
      
      {Object.keys(statusDetailsMap).map(status => {
        const statusInfo = statusDetailsMap[status];
        return (
          <button 
            key={status}
            className={`btn ${statusFilter === status ? 'btn-primary' : 'btn-light'} rounded-pill px-3 py-2 d-flex align-items-center gap-2`}
            onClick={() => setStatusFilter(status)}
          >
            <span className={styles.statusIcon}>{statusInfo.icon}</span>
            {statusInfo.label}
          </button>
        );
      })}
    </div>
  );
};

export default ConcertStatusTabs;