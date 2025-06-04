import React from 'react';
import Card from '@components/ui/Card';
import ContactConcertsSection from '../ContactConcertsSection';
import styles from './ContactConcertsSectionWrapper.module.css';

/**
 * Wrapper pour ContactConcertsSection qui l'encapsule dans une Card
 */
const ContactConcertsSectionWrapper = ({
  contact,
  isEditMode,
  concertsAssocies
}) => {
  return (
    <Card
      title="Concerts associés"
      icon={<i className="bi bi-calendar-event"></i>}
      variant="primary"
      className={styles.sectionCard}
    >
      <ContactConcertsSection
        contact={contact}
        isEditMode={isEditMode}
        concertsAssocies={concertsAssocies}
        showCardWrapper={false}
      />
    </Card>
  );
};

export default ContactConcertsSectionWrapper; 