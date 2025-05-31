import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import styles from './ConfirmationModal.module.css';

/**
 * Modal de confirmation générique pour toutes les entités
 * Remplace tous les DeleteModal spécifiques (DeleteConcertModal, DeleteProgrammateurModal, etc.)
 * 
 * @param {Object} props - Props du composant
 * @param {boolean} props.show - Affichage de la modal
 * @param {Function} props.onHide - Fonction de fermeture
 * @param {Function} props.onConfirm - Fonction de confirmation
 * @param {string} props.title - Titre de la modal
 * @param {string} props.message - Message principal
 * @param {string} props.entityName - Nom de l'entité à supprimer/modifier
 * @param {string} props.confirmText - Texte du bouton de confirmation
 * @param {string} props.cancelText - Texte du bouton d'annulation
 * @param {string} props.variant - Type d'action (danger, warning, primary)
 * @param {boolean} props.isLoading - État de chargement
 * @param {Array} props.warningItems - Liste d'éléments d'avertissement
 * @param {React.ReactNode} props.children - Contenu personnalisé
 */
const ConfirmationModal = ({
  show = false,
  onHide,
  onConfirm,
  title = "Confirmer l'action",
  message = "Êtes-vous sûr de vouloir effectuer cette action ?",
  entityName = "",
  confirmText = "Confirmer", 
  cancelText = "Annuler",
  variant = "danger", // danger, warning, primary
  isLoading = false,
  warningItems = [],
  children,
  ...props
}) => {
  const handleConfirm = () => {
    if (onConfirm && !isLoading) {
      onConfirm();
    }
  };

  const getIconByVariant = () => {
    switch (variant) {
      case 'danger':
        return 'bi bi-exclamation-triangle-fill';
      case 'warning':
        return 'bi bi-exclamation-circle-fill';
      case 'primary':
        return 'bi bi-question-circle-fill';
      default:
        return 'bi bi-exclamation-triangle-fill';
    }
  };

  const getButtonVariant = () => {
    switch (variant) {
      case 'danger':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'primary':
        return 'primary';
      default:
        return 'danger';
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered
      backdrop="static"
      keyboard={!isLoading}
      className={styles.confirmationModal}
      {...props}
    >
      <Modal.Header closeButton={!isLoading} className={styles.modalHeader}>
        <Modal.Title className={styles.modalTitle}>
          <i className={`${getIconByVariant()} ${styles.titleIcon} ${styles[`icon--${variant}`]}`}></i>
          {title}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className={styles.modalBody}>
        <div className={styles.messageContainer}>
          <p className={styles.mainMessage}>
            {message}
            {entityName && (
              <strong className={styles.entityName}> "{entityName}"</strong>
            )}
          </p>
          
          {warningItems.length > 0 && (
            <div className={styles.warningsContainer}>
              <div className={styles.warningHeader}>
                <i className="bi bi-exclamation-triangle text-warning"></i>
                <span className={styles.warningTitle}>Attention :</span>
              </div>
              <ul className={styles.warningList}>
                {warningItems.map((item, index) => (
                  <li key={index} className={styles.warningItem}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {children && (
            <div className={styles.customContent}>
              {children}
            </div>
          )}
        </div>
      </Modal.Body>
      
      <Modal.Footer className={styles.modalFooter}>
        <Button 
          variant="outline-secondary" 
          onClick={onHide}
          disabled={isLoading}
          className={styles.cancelButton}
        >
          {cancelText}
        </Button>
        <Button 
          variant={getButtonVariant()}
          onClick={handleConfirm}
          disabled={isLoading}
          className={styles.confirmButton}
        >
          {isLoading && (
            <span className={styles.loadingSpinner}>
              <i className="bi bi-arrow-clockwise spinner-border-sm"></i>
            </span>
          )}
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

ConfirmationModal.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  entityName: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  variant: PropTypes.oneOf(['danger', 'warning', 'primary']),
  isLoading: PropTypes.bool,
  warningItems: PropTypes.arrayOf(PropTypes.string),
  children: PropTypes.node,
};

export default ConfirmationModal;