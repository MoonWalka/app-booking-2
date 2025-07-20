import React from 'react';
import AddressAutocompleteTest from '@/components/debug/AddressAutocompleteTest';
import TemplateMigrationTool from '@/components/contrats/TemplateMigrationTool';
// import DataStructureFixer from '@/components/debug/DataStructureFixer';
// import OrganizationIdDebug from '@/components/debug/OrganizationIdDebug'; // Supprimé
// import ListDebugger from '@/components/debug/ListDebugger';
// import ContactCreationTester from '@/components/debug/ContactCreationTester'; // Supprimé
// import EntityCreationTester from '@/components/debug/EntityCreationTester'; // Supprimé
// import LieuMapDebug from '@/components/debug/LieuMapDebug'; // Supprimé
// import RIBDebugger from '@/components/debug/RIBDebugger';
// import ContactEmailDebug from '@/components/debug/ContactEmailDebug'; // Supprimé
// import ArtisteSearchDebug from '@/components/debug/ArtisteSearchDebug'; // Supprimé
// import ArtisteSearchLiveDebug from '@/components/debug/ArtisteSearchLiveDebug';
// import ArtisteOrganizationMatcher from '@/components/debug/ArtisteOrganizationMatcher'; // Supprimé
// import OrphanArtistesDebug from '@/components/debug/OrphanArtistesDebug'; // Supprimé
// import EntrepriseContextDiagnostic from '@/components/debug/EntrepriseContextDiagnostic';
// import ArtisteFirestoreDiagnostic from '@/components/debug/ArtisteFirestoreDiagnostic';
// import SystemAuditTool from '@/components/debug/SystemAuditTool'; // Supprimé
// import EntityRelationsDebugger from '@/components/debug/EntityRelationsDebugger'; // Supprimé
// import BidirectionalRelationsFixer from '@/components/debug/BidirectionalRelationsFixer';
// import DateContactsDebug from '@/components/debug/DateContactsDebug'; // Supprimé
// import ContactsMigrationDiagnostic from '@/components/debug/ContactsMigrationDiagnostic'; // Supprimé
// import GenericDetailViewTest from '@/components/debug/GenericDetailViewTest'; // Supprimé
// import BrevoDiagnostic from '@/components/debug/BrevoDiagnostic';
// import ParametresMigration from '@/components/debug/ParametresMigration';
// import BrevoKeyRecovery from '@/components/debug/BrevoKeyRecovery';
// import BrevoKeyDiagnostic from '@/components/debug/BrevoKeyDiagnostic';
// import BrevoTemplateCreator from '@/components/debug/BrevoTemplateCreator';
// import BrevoTemplateCustomizer from '@/components/debug/BrevoTemplateCustomizer';
// import StructuresClickDebug from '@/components/debug/StructuresClickDebug'; // Supprimé
// import FestitestContactFinder from '@/components/debug/FestitestContactFinder'; // Supprimé
// import ContactMigrationTool from '@/components/debug/ContactMigrationTool'; // Supprimé
// import SophieMadetMigration from '@/components/debug/SophieMadetMigration'; // Supprimé
// import TagsHierarchyDebug from '@/components/debug/TagsHierarchyDebug';
// import HybridFormatNormalizer from '@/components/debug/HybridFormatNormalizer';
// import RelationalMigrationFixer from '@/components/debug/RelationalMigrationFixer';
// import CheckStructureMigration from '@/components/debug/CheckStructureMigration'; // Supprimé
// import TestDeleteContactDebug from '@/components/debug/TestDeleteContactDebug'; // Supprimé
// import StructureAddressMigration from '@/components/debug/StructureAddressMigration'; // Supprimé
// import FestivalsDebugger from '@/components/debug/FestivalsDebugger'; // Supprimé
// import MigrateContractTemplates from '@/components/debug/MigrateContractTemplates';
// import MigrateContractVariables from '@/components/debug/MigrateContractVariables';
// import CleanOldContractContent from '@/components/debug/CleanOldContractContent';
// import ContactsAuditTool from '@/components/debug/ContactsAuditTool';
// import ContactsFixTool from '@/components/debug/ContactsFixTool'; // Supprimé
// import UnusedFilesAnalyzer from '@/components/debug/UnusedFilesAnalyzer'; // Supprimé
// import ContactsMigrationFinal from '@/components/debug/ContactsMigrationFinal'; // Supprimé
// import QuickContactCreator from '@/components/debug/QuickContactCreator';
// import MigrationConcertToDate from '@/components/debug/MigrationConcertToDate'; // Supprimé
import styles from './DebugToolsPage.module.css';

const DebugToolsPage = () => {

  // Temporairement accessible en production pour corriger les problèmes
  // À retirer une fois les corrections appliquées
  /*
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className={styles.container}>
        <div className={styles.notAvailable}>
          <i className="bi bi-lock"></i>
          <h3>Outils de debug non disponibles</h3>
          <p>Cette page n'est accessible qu'en mode développement</p>
        </div>
      </div>
    );
  }
  */

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>
          <i className="bi bi-tools me-2"></i>
          Outils de debug
        </h1>
        <p className={styles.description}>
          Page de référence
        </p>
      </div>

      <div style={{ padding: '2rem' }}>
        <AddressAutocompleteTest />
        
        <div style={{ marginTop: '3rem' }}>
          <TemplateMigrationTool />
        </div>
        
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6', 
          borderRadius: '0.375rem', 
          padding: '2rem',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '2rem auto 0'
        }}>
          <i className="bi bi-info-circle" style={{ fontSize: '2rem', color: '#0dcaf0' }}></i>
          <p style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '1rem', marginBottom: '0' }}>
            Les autres outils de debug ont été retirés pour améliorer les performances.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DebugToolsPage;