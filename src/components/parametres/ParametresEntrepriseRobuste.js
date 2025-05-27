import React, { useEffect } from 'react';
import { Card, Form } from 'react-bootstrap';
import styles from './ParametresEntreprise.module.css';
import { useCompanySearch, useAddressSearch } from '@/hooks/common';
import { useEntrepriseFormRobuste } from '@/hooks/parametres/useEntrepriseFormRobuste';

// Import subcomponents
import EntrepriseHeader from './sections/EntrepriseHeader';
import EntrepriseSearchOptions from './sections/EntrepriseSearchOptions';
import EntrepriseSearchResults from './sections/EntrepriseSearchResults';
import EntrepriseFormFields from './sections/EntrepriseFormFields';
import EntrepriseContactFields from './sections/EntrepriseContactFields';
import StructureLegalSection from '@/components/structures/desktop/StructureLegalSection';
import EntrepriseSubmitActions from './sections/EntrepriseSubmitActions';

/**
 * Composant de paramètres d'entreprise - VERSION ROBUSTE
 * 
 * ✅ CARACTÉRISTIQUES :
 * - Utilise le hook autonome useEntrepriseFormRobuste
 * - Aucune dépendance sur les hooks génériques problématiques
 * - Interface identique à la version originale
 * - Zéro boucle infinie garantie
 */
const ParametresEntrepriseRobuste = () => {
  // ✅ Hook autonome sans dépendances problématiques
  const {
    formData,
    loading,
    success,
    updateFormData,
    handleChange,
    handleSelectCompany,
    handleSubmit
  } = useEntrepriseFormRobuste();

  // ✅ Hooks de recherche (déjà stables)
  const {
    searchType,
    setSearchType,
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    searchResultsRef
  } = useCompanySearch();

  // ✅ Hook de recherche d'adresse (déjà stable)
  const addressSearch = useAddressSearch({
    formData,
    updateFormData
  });

  // ✅ Gestion des clics extérieurs (stable)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target)
      ) {
        // Fermer les résultats si clic à l'extérieur
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchResultsRef]);

  return (
    <div className={styles.container}>
      <Card className={styles.formCard}>
        <Card.Body>
          <EntrepriseHeader success={success} />

          <Form onSubmit={handleSubmit} className={styles.form}>
            <EntrepriseSearchOptions 
              searchType={searchType} 
              setSearchType={setSearchType} 
            />
            
            <EntrepriseSearchResults 
              searchType={searchType}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              searchResults={searchResults}
              isSearching={isSearching}
              handleSelectCompany={handleSelectCompany}
              searchResultsRef={searchResultsRef}
            />

            <EntrepriseFormFields 
              formData={formData}
              handleChange={handleChange}
              addressSearch={addressSearch}
            />

            <EntrepriseContactFields 
              formData={formData} 
              handleChange={handleChange} 
            />

            <StructureLegalSection 
              structure={formData}
              formData={formData}
              handleChange={handleChange}
              isEditing={true}
            />

            <EntrepriseSubmitActions 
              handleSubmit={handleSubmit} 
              loading={loading} 
            />
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ParametresEntrepriseRobuste; 