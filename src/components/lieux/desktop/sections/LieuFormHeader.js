import React from 'react';
import { Badge } from 'react-bootstrap';
import Button from '@/components/ui/Button';
import FormHeader from '@/components/ui/FormHeader';

const LieuFormHeader = ({ id, lieuNom, navigate, lieu, isSubmitting, onSave, onDelete, canSave = true, roundedTop = false }) => {
  const isNewLieu = id === 'nouveau';
  const title = isNewLieu ? 'Nouveau lieu' : (lieuNom || 'Lieu');

  return (
    <FormHeader
      title={
        <div>
          {title}
          {lieu?.type && (
            <Badge bg="secondary" style={{ marginLeft: '8px', fontSize: '0.7em' }}>
              {lieu.type}
            </Badge>
          )}
        </div>
      }
      icon={<i className="bi bi-geo-alt"></i>}
      subtitle={
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/lieux')}>
          ← Retour aux lieux
        </span>
      }
      isLoading={isSubmitting}
      roundedTop={roundedTop}
      actions={[
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
            isNewLieu ? 'Créer' : 'Enregistrer'
          )}
        </Button>,
        
        ...(isNewLieu || !onDelete ? [] : [
          <Button 
            key="delete"
            onClick={onDelete} 
            variant="danger"
            disabled={isSubmitting}
            icon={<i className="bi bi-trash"></i>}
          >
            Supprimer
          </Button>
        ]),
        
        <Button 
          key="cancel"
          onClick={() => navigate(isNewLieu ? '/lieux' : `/lieux/${id}`)} 
          variant="secondary"
          disabled={isSubmitting}
          icon={<i className="bi bi-x-circle"></i>}
        >
          Annuler
        </Button>
      ]}
    />
  );
};

export default LieuFormHeader;
