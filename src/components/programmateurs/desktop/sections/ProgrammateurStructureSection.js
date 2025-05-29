import React, { useState, useEffect, useMemo } from 'react';
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
  // État pour gérer le mode (recherche ou manuel)
  const [inputMode, setInputMode] = useState('search');
  // État pour gérer si l'utilisateur a manuellement désélectionné l'entreprise
  const [hasManuallyCleared, setHasManuallyCleared] = useState(false);

  // Dériver selectedCompany directement des données du formulaire
  const selectedCompany = useMemo(() => {
    const hasStructureData = formData?.structure?.siret && formData?.structure?.raisonSociale;
    
    // Si l'utilisateur a manuellement effacé ou si pas de données, retourner null
    if (hasManuallyCleared || !hasStructureData) {
      return null;
    }
    
    // Sinon, créer l'objet company depuis les données du formulaire
    return {
      id: formData.structureId || '',
      nom: formData.structure.raisonSociale,
      siret: formData.structure.siret,
      adresse: formData.structure.adresse || '',
      codePostal: formData.structure.codePostal || '',
      ville: formData.structure.ville || '',
      statutJuridique: formData.structure.type || ''
    };
  }, [
    formData?.structure?.siret, 
    formData?.structure?.raisonSociale, 
    formData?.structure?.adresse,
    formData?.structure?.codePostal,
    formData?.structure?.ville,
    formData?.structure?.type,
    formData?.structureId,
    hasManuallyCleared
  ]);

  // Réinitialiser hasManuallyCleared quand les données changent
  useEffect(() => {
    if (formData?.structure?.siret && formData?.structure?.raisonSociale) {
      setHasManuallyCleared(false);
    }
  }, [formData?.structure?.siret, formData?.structure?.raisonSociale]);

  // Handler pour changer de mode
  const handleInputModeChange = (mode) => {
    setInputMode(mode);
    if (mode === 'manual') {
      // Si on passe en mode manuel, on efface la sélection d'entreprise
      setHasManuallyCleared(true);
      // Et on efface les champs de structure
      if (onStructureChange) {
        onStructureChange(null);
      }
    }
  };

  // Handler pour sélectionner une entreprise 
  const handleSelectCompany = (company) => {
    if (company === null) {
      // Si on "désélectionne" (bouton "changer"), on remet en mode recherche vide
      setHasManuallyCleared(true);
      setInputMode('search');
      // Effacer les données du formulaire
      if (onStructureChange) {
        onStructureChange(null);
      }
    } else {
      // Sélection d'une nouvelle entreprise
      setHasManuallyCleared(false);
      setInputMode('search'); // S'assurer qu'on reste en mode recherche
    }
    
    // Appeler le handler original qui met à jour le formulaire
    if (companySearch.handleSelectCompany) {
      companySearch.handleSelectCompany(company);
    }
  };

  const renderEditMode = () => (
    <div className={styles.editContent}>
      {/* Options de recherche d'entreprise avec mode selector */}
      <CompanySearchSection 
        searchType={companySearch.searchType}
        setSearchType={companySearch.setSearchType}
        searchTerm={companySearch.searchTerm}
        setSearchTerm={companySearch.setSearchTerm}
        searchResults={companySearch.searchResults}
        isSearchingCompany={companySearch.isSearchingCompany}
        handleSelectCompany={handleSelectCompany}
        searchCompany={companySearch.searchCompany}
        inputMode={inputMode}
        onInputModeChange={handleInputModeChange}
        selectedCompany={selectedCompany}
      />
      
      {/* Formulaire de structure juridique - affiché en mode manuel OU quand une entreprise est sélectionnée */}
      {(inputMode === 'manual' || selectedCompany) && (
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
          showCardWrapper={false}
          isReadOnly={selectedCompany && inputMode === 'search'} // Lecture seule si entreprise sélectionnée via recherche
        />
      )}
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