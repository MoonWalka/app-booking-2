import React from 'react';
import Card from '@components/ui/Card';
import ContactLieuxSection from '../ContactLieuxSection';
import styles from './ContactLieuxSectionWrapper.module.css';

/**
 * Wrapper pour ContactLieuxSection qui l'encapsule dans une Card
 */
const ContactLieuxSectionWrapper = ({
  contact,
  isEditMode,
  formData,
  onChange
}) => {
  return (
    <Card
      title="Lieux associés"
      icon={<i className="bi bi-geo-alt"></i>}
      variant="primary"
      className={styles.sectionCard}
    >
      <ContactLieuxSection
        contact={contact}
        isEditMode={isEditMode}
        formData={formData}
        onChange={onChange}
        showCardWrapper={false}
      />
    </Card>
  );
};

export default ContactLieuxSectionWrapper; 