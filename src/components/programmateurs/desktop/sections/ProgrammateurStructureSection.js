import React from 'react';
import Card from '@components/ui/Card';
import CompanySearchSection from '../../sections/CompanySearchSection';
import StructureInfoSection from '../../sections/StructureInfoSection';
import styles from './ProgrammateurStructureSection.module.css';

/**
 * ProgrammateurStructureSection - Section de structure et entreprise
 * Combine la recherche d'entreprise et les informations de structure
 */
const ProgrammateurStructureSection = ({
  programmateur,
  structure,
  isEditMode,
  formData,
  onChange,
  onStructureChange,
  companySearch,
  addressSearch,
  formatValue,
  errors
}) => {
  const renderEditMode = () => (
    <div className={styles.editContent}>
      {/* Options de recherche d'entreprise */}
      <CompanySearchSection 
        searchType={companySearch.searchType}
        setSearchType={companySearch.setSearchType}
        searchTerm={companySearch.searchTerm}
        setSearchTerm={companySearch.setSearchTerm}
        searchResults={companySearch.searchResults}
        isSearchingCompany={companySearch.isSearchingCompany}
        handleSelectCompany={companySearch.handleSelectCompany}
      />
      
      {/* Formulaire de structure juridique */}
      <StructureInfoSection 
        formData={formData}
        handleChange={onChange}
        errors={errors}
        addressSuggestions={addressSearch.addressSuggestions} 
        isSearchingAddress={addressSearch.isSearchingAddress}
        addressFieldActive={addressSearch.addressFieldActive}
        setAddressFieldActive={addressSearch.setAddressFieldActive}
        handleSelectAddress={addressSearch.handleSelectAddress}
        structure={structure}
        formatValue={formatValue}
      />
    </div>
  );

  const renderViewMode = () => (
    <div className={styles.viewContent}>
      <div className={styles.field}>
        <label className={styles.label}>Nom de la structure</label>
        <div className={styles.value}>
          {structure?.nom || 'Non renseigné'}
        </div>
      </div>
      
      <div className={styles.field}>
        <label className={styles.label}>SIRET</label>
        <div className={styles.value}>
          {structure?.siret || 'Non renseigné'}
        </div>
      </div>
      
      <div className={styles.field}>
        <label className={styles.label}>Adresse</label>
        <div className={styles.value}>
          {structure?.adresse ? (
            <>
              {structure.adresse}<br />
              {structure.codePostal} {structure.ville}
            </>
          ) : (
            'Non renseignée'
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Card
      title="Structure"
      icon={<i className="bi bi-building"></i>}
      variant="primary"
      className={styles.sectionCard}
    >
      {isEditMode ? renderEditMode() : renderViewMode()}
    </Card>
  );
};

export default ProgrammateurStructureSection; 