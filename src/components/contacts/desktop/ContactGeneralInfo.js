import React from 'react';
import styles from './ContactGeneralInfo.module.css';
import Card from '../../../components/ui/Card';

const ContactGeneralInfo = ({ contact }) => {
  // Contenu des informations générales
  const infoContent = (
    <>
      <div className={styles.infoHeader}>
        <h3 className={styles.name}>{contact?.nom}</h3>
        {contact?.structure && (
          <span className={styles.structureBadge}>{contact.structure}</span>
        )}
      </div>
      
      <div className={styles.infoDetails}>
        {contact?.email && (
          <div className={styles.infoItem}>
            <i className="bi bi-envelope"></i>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </div>
        )}
        
        {contact?.telephone && (
          <div className={styles.infoItem}>
            <i className="bi bi-telephone"></i>
            <a href={`tel:${contact.telephone}`}>{contact.telephone}</a>
          </div>
        )}
        
        {(contact?.structureVille || contact?.structureCodePostal) && (
          <div className={styles.infoItem}>
            <i className="bi bi-geo-alt"></i>
            <span>
              {contact?.structureVille}
              {contact?.structureCodePostal && ` (${contact.structureCodePostal})`}
            </span>
          </div>
        )}
      </div>
      
      {contact?.concertsAssocies?.length > 0 && (
        <div className={styles.concertCount}>
          <i className="bi bi-music-note-list"></i>
          <span>{contact.concertsAssocies.length} concert(s) associé(s)</span>
        </div>
      )}
    </>
  );

  // Utilisation du composant Card standardisé
  return (
    <div className={styles.container}>
      <Card
        title="Informations générales"
        icon={<i className="bi bi-person"></i>}
        className={styles.generalInfoCard}
      >
        {infoContent}
      </Card>
    </div>
  );
};

export default ContactGeneralInfo;
