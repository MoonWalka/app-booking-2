import React from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import styles from './ProgrammateurFormHeader.module.css';

/**
 * ProgrammateurFormHeader - En-tête du formulaire de programmateur
 * Affiche le titre et les actions principales
 */
const ProgrammateurFormHeader = ({ 
  isEditMode, 
  handlePrint,
  handleViewProgrammateur,
  id
}) => {
  return (
    <div className={styles.formHeader}>
      <h2 className={styles.formTitle}>
        {isEditMode ? 'Modifier un programmateur' : 'Ajouter un programmateur'}
      </h2>
      
      <div className={styles.headerActions}>
        {isEditMode && (
          <>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="print-tooltip">Imprimer la fiche</Tooltip>}
            >
              <Button 
                variant="outline-secondary"
                onClick={handlePrint}
                className={styles.actionButton}
              >
                <i className="bi bi-printer"></i>
              </Button>
            </OverlayTrigger>
            
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="view-tooltip">Voir la fiche complète</Tooltip>}
            >
              <Button 
                variant="outline-secondary"
                onClick={() => handleViewProgrammateur(id)}
                className={styles.actionButton}
              >
                <i className="bi bi-eye"></i>
              </Button>
            </OverlayTrigger>
          </>
        )}
      </div>
    </div>
  );
};

export default ProgrammateurFormHeader;
