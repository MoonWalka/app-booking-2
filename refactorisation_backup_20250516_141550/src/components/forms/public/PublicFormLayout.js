import React from 'react';
import styles from './PublicFormLayout.module.css';

/**
 * Layout component for public forms
 * Provides a standardized container with header and footer
 */
const PublicFormLayout = ({ children }) => {
  return (
    <div className={styles.formIsolatedContainer}>
      <header className={styles.formHeader}>
        <div className={styles.formLogo}>
          <h2>Label Musical</h2>
        </div>
      </header>
      
      <main className={styles.formContent}>
        {children}
      </main>
      
      <footer className={styles.formFooter}>
        <p>© {new Date().getFullYear()} Label Musical - Formulaire sécurisé</p>
      </footer>
    </div>
  );
};

export default PublicFormLayout;