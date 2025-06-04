import React from 'react';
import Card from '@/components/ui/Card';

/**
 * Section des informations générales du contact
 */
const ContactGeneralInfo = ({ contact, isEditMode, formData, onChange }) => {
  const displayData = isEditMode ? formData : contact;

  return (
    <Card
      title="Informations du contact"
      icon={<i className="bi bi-person-vcard"></i>}
    >
      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <div className="fw-bold">Nom:</div>
            <div>{displayData?.nom || 'Non spécifié'}</div>
          </div>
          <div className="mb-3">
            <div className="fw-bold">Prénom:</div>
            <div>{displayData?.prenom || 'Non spécifié'}</div>
          </div>
          <div className="mb-3">
            <div className="fw-bold">Email:</div>
            <div>
              {displayData?.email ? (
                <a href={`mailto:${displayData.email}`} className="contact-link">
                  <i className="bi bi-envelope"></i>
                  {displayData.email}
                </a>
              ) : (
                <span className="text-muted">Non spécifié</span>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <div className="fw-bold">Téléphone:</div>
            <div>
              {displayData?.telephone ? (
                <a href={`tel:${displayData.telephone}`} className="contact-link">
                  <i className="bi bi-telephone"></i>
                  {displayData.telephone}
                </a>
              ) : (
                <span className="text-muted">Non spécifié</span>
              )}
            </div>
          </div>
          <div className="mb-3">
            <div className="fw-bold">Poste:</div>
            <div>{displayData?.poste || 'Non spécifié'}</div>
          </div>
          <div className="mb-3">
            <div className="fw-bold">Notes:</div>
            <div>{displayData?.notes || 'Non spécifié'}</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ContactGeneralInfo;