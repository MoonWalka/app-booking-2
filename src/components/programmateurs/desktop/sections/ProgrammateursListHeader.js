import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProgrammateursListHeader.module.css';

const ProgrammateursListHeader = () => {
  const navigate = useNavigate();
  
  const handleNewProgrammateurClick = () => {
    // console.log('[DEBUG][ProgrammateursListHeader] Clic sur "Nouveau programmateur" détecté');
    // console.log('[DEBUG][ProgrammateursListHeader] Navigation vers: /programmateurs/nouveau');
    navigate('/programmateurs/nouveau');
    // console.log('[DEBUG][ProgrammateursListHeader] Commande navigate() exécutée');
  };
  
  return (
    <div className={styles.headerContainer}>
      <h2 className={styles.headerTitle}>Liste des programmateurs</h2>
      <button
        className={styles.addButton}
        onClick={handleNewProgrammateurClick}
      >
        <i className="bi bi-plus-lg"></i>
        Ajouter un programmateur
      </button>
    </div>
  );
};

export default ProgrammateursListHeader; 