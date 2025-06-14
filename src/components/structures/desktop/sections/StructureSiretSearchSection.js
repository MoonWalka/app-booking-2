import React from 'react';
import EntrepriseSearchOptions from '@/components/parametres/sections/EntrepriseSearchOptions';
import EntrepriseSearchResults from '@/components/parametres/sections/EntrepriseSearchResults';
import styles from './StructureSiretSearchSection.module.css';

/**
 * Section component for SIRET/Company search in Structure form
 * Uses existing EntrepriseSearch components for consistency
 * 
 * @param {Object} props - Component props
 * @param {Object} props.companySearch - Company search hook object
 */
const StructureSiretSearchSection = ({ companySearch }) => {
  return (
    <div className={styles.formSection}>
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <i className="bi bi-search section-icon"></i>
          <h3 className={styles.sectionTitle}>Rechercher une structure existante</h3>
        </div>
        <div className={styles.sectionBody}>
          {/* Options de recherche */}
          <EntrepriseSearchOptions 
            searchType={companySearch.searchType} 
            setSearchType={companySearch.setSearchType} 
          />
          
          {/* Interface de recherche et résultats */}
          <EntrepriseSearchResults 
            searchType={companySearch.searchType}
            searchTerm={companySearch.searchTerm}
            setSearchTerm={companySearch.setSearchTerm}
            searchResults={companySearch.searchResults}
            isSearching={companySearch.isSearchingCompany}
            handleSelectCompany={companySearch.handleSelectCompany}
            searchResultsRef={companySearch.searchResultsRef}
          />
        </div>
      </div>
    </div>
  );
};

export default StructureSiretSearchSection;