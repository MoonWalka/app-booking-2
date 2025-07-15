import React, { useMemo } from 'react';
import styles from './ContactsMap.module.css';

const ContactsMap = ({ contacts, onContactClick }) => {
  // Préparer les adresses pour la carte
  const contactsWithAddresses = useMemo(() => {
    return contacts.filter(contact => {
      const adresse = contact.adresse || '';
      const ville = contact.ville || '';
      const codePostal = contact.codePostal || contact.cp || '';
      return adresse || ville || codePostal;
    }).slice(0, 100); // Limiter à 100 contacts pour la performance
  }, [contacts]);

  // Si aucun contact n'a d'adresse
  if (contactsWithAddresses.length === 0) {
    return (
      <div className={styles.mapPlaceholder}>
        <div className={styles.mapContent}>
          <i className="bi bi-geo-alt fs-1 text-muted mb-3"></i>
          <h4>Aucune adresse disponible</h4>
          <p className="text-muted">
            Les contacts n'ont pas d'adresses renseignées pour afficher la carte
          </p>
        </div>
      </div>
    );
  }

  // Construire la requête pour afficher plusieurs points
  // Pour simplifier, on affiche juste une carte centrée sur la France
  // Dans une vraie implémentation, on pourrait utiliser l'API Google Maps JavaScript
  const mapQuery = "France";
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=6&output=embed`;

  return (
    <div className={styles.mapContainer}>
      <div className={styles.mapHeader}>
        <h5>
          <i className="bi bi-geo-alt me-2"></i>
          {contactsWithAddresses.length} contact{contactsWithAddresses.length > 1 ? 's' : ''} avec adresse
        </h5>
        <small className="text-muted">
          Cliquez sur un marqueur pour voir les détails du contact
        </small>
      </div>
      
      <div className={styles.mapWrapper}>
        <iframe
          src={mapUrl}
          width="100%"
          height="600"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Carte des contacts"
        ></iframe>
      </div>

      {/* Liste des contacts avec adresse */}
      <div className={styles.contactsList}>
        <h6 className="mb-3">Contacts géolocalisés :</h6>
        <div className={styles.contactsGrid}>
          {contactsWithAddresses.map(contact => (
            <div 
              key={contact.id} 
              className={styles.contactCard}
              onClick={() => onContactClick && onContactClick(contact)}
            >
              <div className={styles.contactType}>
                <i className={`bi ${contact.type === 'structure' ? 'bi-building' : 'bi-person'} me-1`}></i>
                {contact.type === 'structure' ? 'Structure' : 'Personne'}
              </div>
              <h6 className={styles.contactName}>{contact.displayName || contact.nom}</h6>
              <p className={styles.contactAddress}>
                {contact.adresse && <span>{contact.adresse}<br /></span>}
                {(contact.codePostal || contact.cp) && <span>{contact.codePostal || contact.cp} </span>}
                {contact.ville && <span>{contact.ville}</span>}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactsMap;