// src/components/contacts/desktop/sections/ContactStructureSectionV2.js
import React from 'react';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';

/**
 * Section Structure du contact - Version V2
 */
const ContactStructureSectionV2 = ({ 
  contactId, 
  structure, 
  isEditMode, 
  navigateToStructureDetails 
}) => {
  
  return (
    <Card
      title="Structure"
      icon={<i className="bi bi-building"></i>}
      headerActions={
        structure && !isEditMode && (
          <button
            onClick={() => navigateToStructureDetails(structure.id)}
            className="tc-btn tc-btn-outline-primary tc-btn-sm"
          >
            <i className="bi bi-eye"></i>
            <span>Voir détails</span>
          </button>
        )
      }
    >
      {structure ? (
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <div className="fw-bold">Nom:</div>
              <div>{structure.nom || structure.raisonSociale || 'Sans nom'}</div>
            </div>
            <div className="mb-3">
              <div className="fw-bold">Type:</div>
              <div>{structure.type || 'Non spécifié'}</div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <div className="fw-bold">Email:</div>
              <div>
                {structure.email ? (
                  <a href={`mailto:${structure.email}`}>
                    {structure.email}
                  </a>
                ) : (
                  <span className="text-muted">Non spécifié</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Alert variant="info">
          Aucune structure n'est associée à ce contact.
        </Alert>
      )}
    </Card>
  );
};

export default ContactStructureSectionV2;