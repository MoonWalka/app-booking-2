import React from 'react';
import styles from './ProgrammateurGeneralInfo.module.css';

const ProgrammateurGeneralInfo = ({ programmateur }) => {
  console.log('[DEBUG][ProgrammateurGeneralInfo] programmateur:', programmateur);
  return (
    <div className={styles.container}>
      <div className={styles.infoCard}>
        <div className={styles.infoHeader}>
          <h3 className={styles.name}>{programmateur?.nom}</h3>
          {programmateur?.structure && (
            <span className={styles.structureBadge}>{programmateur.structure}</span>
          )}
        </div>
        
        <div className={styles.infoDetails}>
          {programmateur?.email && (
            <div className={styles.infoItem}>
              <i className="bi bi-envelope"></i>
              <a href={`mailto:${programmateur.email}`}>{programmateur.email}</a>
            </div>
          )}
          
          {programmateur?.telephone && (
            <div className={styles.infoItem}>
              <i className="bi bi-telephone"></i>
              <a href={`tel:${programmateur.telephone}`}>{programmateur.telephone}</a>
            </div>
          )}
          
          {(programmateur?.structureVille || programmateur?.structureCodePostal) && (
            <div className={styles.infoItem}>
              <i className="bi bi-geo-alt"></i>
              <span>
                {programmateur?.structureVille}
                {programmateur?.structureCodePostal && ` (${programmateur.structureCodePostal})`}
              </span>
            </div>
          )}
        </div>
        
        {programmateur?.concertsAssocies?.length > 0 && (
          <div className={styles.concertCount}>
            <i className="bi bi-music-note-list"></i>
            <span>{programmateur.concertsAssocies.length} concert(s) associé(s)</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgrammateurGeneralInfo;
