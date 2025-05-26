import React from 'react';
import Card from '@components/ui/Card';
import ProgrammateurLieuxSection from '../ProgrammateurLieuxSection';
import styles from './ProgrammateurLieuxSectionWrapper.module.css';

/**
 * Wrapper pour ProgrammateurLieuxSection qui l'encapsule dans une Card
 */
const ProgrammateurLieuxSectionWrapper = ({
  programmateur,
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
      <ProgrammateurLieuxSection
        programmateur={programmateur}
        isEditMode={isEditMode}
        formData={formData}
        onChange={onChange}
        showCardWrapper={false}
      />
    </Card>
  );
};

export default ProgrammateurLieuxSectionWrapper; 