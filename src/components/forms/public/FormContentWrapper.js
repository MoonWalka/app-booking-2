import React from 'react';
import styles from './FormContentWrapper.module.css';
import Card from '@/components/ui/Card';

/**
 * Wrapper component for form content sections
 * Provides consistent styling for form content blocks
 */
const FormContentWrapper = ({ 
  title, 
  subtitle,
  children, 
  className = ''
}) => {
  // Création d'un footer personnalisé si nécessaire (à commenter si non utilisé)
  // const footerContent = (
  //   <div className={styles.footerContent}>
  //     {/* Contenu de footer personnalisé si nécessaire */}
  //   </div>
  // );

  return (
    <Card
      title={title}
      className={`${styles.formContainer} ${className}`}
      // Passer le sous-titre comme headerActions
      headerActions={subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      // Décommenter si vous avez besoin d'un footer
      // footerContent={footerContent}
    >
      {children}
    </Card>
  );
};

export default FormContentWrapper;