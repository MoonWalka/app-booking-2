import React from 'react';
import { Link } from 'react-router-dom';
import usePermissions from '@/hooks/usePermissions';
import styles from './ContactsListHeader.module.css';

const ContactsListHeader = () => {
  const { canCreate } = usePermissions();
  
  return (
    <div className={styles.headerContainer}>
      <h2 className={styles.headerTitle}>Liste des contacts</h2>
      {canCreate('contacts') && (
        <Link 
          to="/contacts/nouveau" 
          className={styles.addButton}
        >
          <i className="bi bi-plus-lg"></i>
          Ajouter un contact
        </Link>
      )}
    </div>
  );
};

export default ContactsListHeader; 