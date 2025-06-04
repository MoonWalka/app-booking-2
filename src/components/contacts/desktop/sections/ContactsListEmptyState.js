import React from 'react';
import styles from '../ContactsList.module.css';

const ContactsListEmptyState = ({ hasSearchQuery }) => {
  return (
    <div className={styles.emptyState}>
      <i className="bi bi-person-x display-4 text-muted mb-3"></i>
      <h5 className="text-muted">Aucun contact trouvé</h5>
      {hasSearchQuery ? (
        <p className="text-muted">Aucun résultat ne correspond à votre recherche.</p>
      ) : (
        <p className="text-muted">Ajoutez un contact pour commencer.</p>
      )}
    </div>
  );
};

export default ContactsListEmptyState; 