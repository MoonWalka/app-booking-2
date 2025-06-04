import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ContactsListHeader.module.css';

const ContactsListHeader = () => {
  
  return (
    <div className={styles.headerContainer}>
      <h2 className={styles.headerTitle}>Liste des contacts</h2>
      <Link 
        to="/contacts/nouveau" 
        className={styles.addButton}
      >
        <i className="bi bi-plus-lg"></i>
        Ajouter un contact
      </Link>
    </div>
  );
};

export default ContactsListHeader; 