import React from 'react';
import Card from '@components/ui/Card';
import ProgrammateurConcertsSection from '../ProgrammateurConcertsSection';
import styles from './ProgrammateurConcertsSectionWrapper.module.css';

/**
 * Wrapper pour ProgrammateurConcertsSection qui l'encapsule dans une Card
 */
const ProgrammateurConcertsSectionWrapper = ({
  programmateur,
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
      <ProgrammateurConcertsSection
        programmateur={programmateur}
        isEditMode={isEditMode}
        concertsAssocies={concertsAssocies}
        showCardWrapper={false}
      />
    </Card>
  );
};

export default ProgrammateurConcertsSectionWrapper; 