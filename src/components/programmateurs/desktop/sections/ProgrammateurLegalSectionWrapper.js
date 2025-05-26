import React from 'react';
import Card from '@components/ui/Card';
import ProgrammateurLegalSection from '../ProgrammateurLegalSection';
import styles from './ProgrammateurLegalSectionWrapper.module.css';

/**
 * Wrapper pour ProgrammateurLegalSection qui l'encapsule dans une Card
 */
const ProgrammateurLegalSectionWrapper = ({
  programmateur,
  isEditMode,
  formData,
  onChange,
  errors
}) => {
  return (
    <Card
      title="Informations légales"
      icon={<i className="bi bi-file-earmark-text"></i>}
      variant="primary"
      className={styles.sectionCard}
    >
      <ProgrammateurLegalSection
        programmateur={programmateur}
        isEditMode={isEditMode}
        formData={formData}
        handleChange={onChange}
        errors={errors}
        showCardWrapper={false}
      />
    </Card>
  );
};

export default ProgrammateurLegalSectionWrapper; 