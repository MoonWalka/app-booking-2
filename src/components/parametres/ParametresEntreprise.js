import React, { useEffect } from 'react';
import { Card, Form } from 'react-bootstrap';
import styles from './ParametresEntreprise.module.css';

// Import custom hooks
import useEntrepriseForm from '@/hooks/parametres/useEntrepriseForm';
import { useCompanySearch, useAddressSearch } from '@/hooks/common';

// Import subcomponents
import EntrepriseHeader from './sections/EntrepriseHeader';
import EntrepriseSearchOptions from './sections/EntrepriseSearchOptions';
import EntrepriseSearchResults from './sections/EntrepriseSearchResults';
import EntrepriseFormFields from './sections/EntrepriseFormFields';
import EntrepriseContactFields from './sections/EntrepriseContactFields';
import EntrepriseLegalSection from './sections/EntrepriseLegalSection';
import EntrepriseSubmitActions from './sections/EntrepriseSubmitActions';

/**
 * Company settings component - Allows setting up company information
 * This is a refactored version using custom hooks and component composition
 */
const ParametresEntreprise = () => {
  // Form state and handlers hook
  const {
    formData,
    loading,
    success,
    updateFormData,
    handleChange,
    handleSelectCompany,
    handleSubmit
  } = useEntrepriseForm();

  // Company search hook
  const {
    searchType,
    setSearchType,
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    searchResultsRef
  } = useCompanySearch();

  // Address search hook - mise à jour pour utiliser le format d'options
  const addressSearch = useAddressSearch({
    formData,
    updateFormData
  });

  // Handle clicks outside of search results to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target)
      ) {
        // Close results if click is outside
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

            <EntrepriseLegalSection 
              formData={formData} 
              handleChange={handleChange} 
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

export default ParametresEntreprise;
