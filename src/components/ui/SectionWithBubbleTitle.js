import React from 'react';
import classNames from 'classnames';
import styles from '../contacts/desktop/ContactForm.module.css';

/**
 * Composant de section avec titre dans une bulle à cheval
 */
const SectionWithBubbleTitle = ({ 
  title, 
  icon, 
  children, 
  className,
  headerClassName,
  bodyClassName 
}) => {
  return (
    <div className={classNames(styles.sectionWrapper, className)}>
      <div className={styles.sectionCard}>
        <div className={classNames(styles.sectionHeader, headerClassName)}>
          {icon && <span>{icon}</span>}
          {title && <h3 className={styles.sectionTitle}>{title}</h3>}
        </div>
        <div className={classNames(styles.sectionBody, bodyClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default SectionWithBubbleTitle;