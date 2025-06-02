import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from 'react-bootstrap';
import Button from '@/components/ui/Button';
import FormHeader from '@/components/ui/FormHeader';
import styles from './LieuHeader.module.css';

/**
 * Type badge component for a venue
 */
const TypeBadge = ({ type }) => {
  if (!type) return null;
  
  let variant = 'secondary';
  
  switch (type.toLowerCase()) {
    case 'bar':
      variant = 'info';
      break;
    case 'festival':
      variant = 'danger';
      break;
    case 'salle':
      variant = 'success';
      break;
    case 'plateau':
      variant = 'warning';
      break;
    default:
      variant = 'secondary';
  }
  
  return <Badge bg={variant} className={styles.typeBadge}>{type}</Badge>;
};

/**
 * Header component for venue details
 * Style imité de la version qui te plaisait (ccdebb12)
 */
const LieuHeader = ({ 
  lieu, 
  isEditMode, 
  isSubmitting, 
  onEdit, 
  onSave, 
  onCancel, 
  onDelete,
  canSave = true,
  navigateToList
}) => {
  const navigate = useNavigate();

  const handleNavigateToList = () => {
    if (navigateToList) {
      navigateToList();
    } else {
      navigate('/lieux');
    }
  };

  return (
    <FormHeader
      title={
        <div>
          {lieu?.nom || 'Lieu'}
          {lieu?.type && <TypeBadge type={lieu.type} />}
        </div>
      }
      icon={<i className="bi bi-geo-alt"></i>}
      subtitle={
        <span style={{ cursor: 'pointer' }} onClick={handleNavigateToList}>
          ← Retour aux lieux
        </span>
      }
      isLoading={isSubmitting}
      roundedTop={true}
      actions={isEditMode ? [
        <Button 
          key="save"
          onClick={onSave} 
          variant="success"
          disabled={isSubmitting || !canSave}
          icon={<i className="bi bi-check-circle"></i>}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Enregistrement...
            </>
          ) : (
            'Enregistrer'
          )}
        </Button>,
        
        <Button 
          key="delete"
          onClick={onDelete} 
          variant="danger"
          disabled={isSubmitting}
          icon={<i className="bi bi-trash"></i>}
        >
          Supprimer
        </Button>,
        
        <Button 
          key="cancel"
          onClick={onCancel} 
          variant="secondary"
          disabled={isSubmitting}
          icon={<i className="bi bi-x-circle"></i>}
        >
          Annuler
        </Button>
      ] : [
        <Button 
          key="back"
          onClick={handleNavigateToList} 
          variant="secondary"
          icon={<i className="bi bi-arrow-left"></i>}
        >
          Retour
        </Button>,
        
        <Button 
          key="edit"
          onClick={onEdit} 
          variant="outline-primary"
          icon={<i className="bi bi-pencil"></i>}
        >
          Modifier
        </Button>
      ]}
    />
  );
};

export { LieuHeader, TypeBadge };