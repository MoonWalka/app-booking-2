// src/components/contacts/desktop/sections/ContactGeneralInfoV2.js
import React from 'react';
import Card from '@/components/ui/Card';
import FormField from '@/components/ui/FormField';
import styles from './ContactGeneralInfo.module.css';

/**
 * Section des informations générales du contact - Version V2
 * Basée sur ConcertGeneralInfo avec mode édition intégré
 */
const ContactGeneralInfoV2 = ({
  contact,
  isEditMode,
  formData,
  onChange,
  formatValue
}) => {
  
  const displayData = isEditMode ? formData : contact;

  return (
    <Card
      title="Informations personnelles"
      icon={<i className="bi bi-person-vcard"></i>}
      className={styles.generalInfoCard}
    >
      <div className={styles.generalInfoContent}>
        {isEditMode ? (
          // Mode édition : Formulaire
          <div className={styles.formGrid}>
            <div className="row">
              <div className="col-md-6">
                <FormField
                  label="Nom *"
                  name="nom"
                  value={formData?.nom || ''}
                  onChange={onChange}
                  required
                  placeholder="Nom de famille"
                />
              </div>
              <div className="col-md-6">
                <FormField
                  label="Prénom"
                  name="prenom"
                  value={formData?.prenom || ''}
                  onChange={onChange}
                  placeholder="Prénom"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData?.email || ''}
                  onChange={onChange}
                  placeholder="email@exemple.com"
                />
              </div>
              <div className="col-md-6">
                <FormField
                  label="Téléphone"
                  name="telephone"
                  type="tel"
                  value={formData?.telephone || ''}
                  onChange={onChange}
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <FormField
                  label="Poste / Fonction"
                  name="poste"
                  value={formData?.poste || ''}
                  onChange={onChange}
                  placeholder="Directeur artistique, Chargé de production..."
                />
              </div>
              <div className="col-md-6">
                <FormField
                  label="Service"
                  name="service"
                  value={formData?.service || ''}
                  onChange={onChange}
                  placeholder="Production, Communication..."
                />
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <FormField
                  label="Notes"
                  name="notes"
                  type="textarea"
                  value={formData?.notes || ''}
                  onChange={onChange}
                  placeholder="Notes et commentaires sur ce contact..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        ) : (
          // Mode lecture : Affichage
          <div className={styles.displayGrid}>
            <div className="row">
              <div className="col-md-6">
                <div className={styles.infoGroup}>
                  <div className={styles.infoLabel}>
                    <i className="bi bi-person"></i>
                    Nom complet:
                  </div>
                  <div className={styles.infoValue}>
                    {displayData?.prenom ? 
                      `${displayData.prenom} ${displayData.nom}` : 
                      displayData?.nom || formatValue()}
                  </div>
                </div>

                <div className={styles.infoGroup}>
                  <div className={styles.infoLabel}>
                    <i className="bi bi-envelope"></i>
                    Email:
                  </div>
                  <div className={styles.infoValue}>
                    {displayData?.email ? (
                      <a href={`mailto:${displayData.email}`} className="contact-link">
                        {displayData.email}
                      </a>
                    ) : (
                      <span className="text-muted">{formatValue()}</span>
                    )}
                  </div>
                </div>

                <div className={styles.infoGroup}>
                  <div className={styles.infoLabel}>
                    <i className="bi bi-telephone"></i>
                    Téléphone:
                  </div>
                  <div className={styles.infoValue}>
                    {displayData?.telephone ? (
                      <a href={`tel:${displayData.telephone}`} className="contact-link">
                        {displayData.telephone}
                      </a>
                    ) : (
                      <span className="text-muted">{formatValue()}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className={styles.infoGroup}>
                  <div className={styles.infoLabel}>
                    <i className="bi bi-briefcase"></i>
                    Poste / Fonction:
                  </div>
                  <div className={styles.infoValue}>
                    {displayData?.poste || formatValue()}
                  </div>
                </div>

                <div className={styles.infoGroup}>
                  <div className={styles.infoLabel}>
                    <i className="bi bi-diagram-3"></i>
                    Service:
                  </div>
                  <div className={styles.infoValue}>
                    {displayData?.service || formatValue()}
                  </div>
                </div>

                <div className={styles.infoGroup}>
                  <div className={styles.infoLabel}>
                    <i className="bi bi-chat-dots"></i>
                    Statut:
                  </div>
                  <div className={styles.infoValue}>
                    <span className={`badge ${
                      displayData?.statut === 'actif' ? 'bg-success' :
                      displayData?.statut === 'inactif' ? 'bg-secondary' :
                      'bg-info'
                    }`}>
                      {displayData?.statut || 'Actif'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {displayData?.notes && (
              <div className="row mt-3">
                <div className="col-12">
                  <div className={styles.infoGroup}>
                    <div className={styles.infoLabel}>
                      <i className="bi bi-journal-text"></i>
                      Notes:
                    </div>
                    <div className={styles.infoValue}>
                      <div className={styles.notesContent}>
                        {displayData.notes}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ContactGeneralInfoV2;