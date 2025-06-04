// src/components/contacts/desktop/sections/ContactLieuxSectionV2.js
import React from 'react';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';

/**
 * Section Lieux du contact - Version V2
 */
const ContactLieuxSectionV2 = ({ 
  contactId, 
  lieux, 
  isEditMode, 
  navigateToLieuDetails 
}) => {
  
  return (
    <Card
      title="Lieux associés"
      icon={<i className="bi bi-geo-alt"></i>}
    >
      {lieux && lieux.length > 0 ? (
        <div className="row">
          {lieux.map((lieu, index) => (
            <div key={lieu.id || index} className="col-md-6 mb-3">
              <div className="border rounded p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1">{lieu.nom || 'Sans nom'}</h6>
                    {lieu.adresse && (
                      <small className="text-muted">
                        {lieu.adresse}, {lieu.ville}
                      </small>
                    )}
                  </div>
                  {!isEditMode && (
                    <button
                      onClick={() => navigateToLieuDetails(lieu.id)}
                      className="tc-btn tc-btn-outline-primary tc-btn-sm"
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Alert variant="info">
          Aucun lieu n'est associé à ce contact.
        </Alert>
      )}
    </Card>
  );
};

export default ContactLieuxSectionV2;