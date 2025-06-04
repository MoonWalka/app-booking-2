import React from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import styles from './ContactFormHeader.module.css';

/**
 * ContactFormHeader - En-tête du formulaire de contact
 * Affiche le titre et les actions principales
 */
const ContactFormHeader = ({ 
  isEditMode, 
  handlePrint,
  handleViewContact,
  id
}) => {
  return (
    <div className={styles.formHeader}>
      <h2 className={styles.formTitle}>
        {isEditMode ? 'Modifier un contact' : 'Ajouter un contact'}
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
                onClick={() => handleViewContact(id)}
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

export default ContactFormHeader;
