import React from 'react';
import { Link } from 'react-router-dom';
import Card from '@/components/ui/Card';
import styles from './StructureAssociationsSection.module.css';

/**
 * Component for displaying contacts associated with a structure
 * 
 * @param {Object} props - Component props
 * @param {Array} props.contacts - List of contacts associated with the structure
 * @param {Boolean} props.loadingContacts - Whether contacts are currently loading
 */
const StructureAssociationsSection = ({ contacts, loadingContacts }) => {
  // Debug temporaire pour analyser les données reçues
  console.log('[DEBUG StructureAssociationsSection] Données reçues:', {
    contacts,
    loadingContacts,
    nombreContacts: contacts?.length || 0
  });

  return (
    <Card
      title={`Contacts associés (${contacts?.length || 0})`}
      icon={<i className="bi bi-person-badge"></i>}
    >
        {loadingContacts ? (
          <div className="text-center p-3">
            <div className={`${styles.spinner} ${styles.spinnerSmall}`} role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        ) : contacts.length > 0 ? (
          <div className={styles.contactsList}>
            {contacts.map(prog => {
              // Gérer les différentes structures de données possibles
              const nom = prog.nom || prog.contact?.nom || 'Nom non renseigné';
              const prenom = prog.prenom || prog.contact?.prenom || '';
              const email = prog.email || prog.contact?.email || '';
              const telephone = prog.telephone || prog.contact?.telephone || '';
              const fonction = prog.fonction || prog.contact?.fonction || '';
              
              const fullName = prenom ? `${prenom} ${nom}` : nom;
              
              return (
                <div key={prog.id} className={styles.contactCard}>
                  <div className={styles.contactInfo}>
                    <h4 className={styles.contactName}>
                      <i className="bi bi-person-badge me-2"></i>
                      <Link to={`/contacts/${prog.id}`}>{fullName}</Link>
                    </h4>
                    {fonction && (
                      <div className={styles.contactFunction}>
                        <i className="bi bi-briefcase me-2"></i>
                        {fonction}
                      </div>
                    )}
                    <div className={styles.contactDetails}>
                      {email && (
                        <div className={styles.detailItem}>
                          <i className="bi bi-envelope me-2"></i>
                          <a href={`mailto:${email}`}>{email}</a>
                        </div>
                      )}
                      {telephone && (
                        <div className={styles.detailItem}>
                          <i className="bi bi-telephone me-2"></i>
                          <a href={`tel:${telephone}`}>{telephone}</a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.alertInfo}>
            <i className="bi bi-info-circle me-2"></i>
            Aucun contact n'est associé à cette structure.
          </div>
        )}
    </Card>
  );
};

export default StructureAssociationsSection;