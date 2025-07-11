import React, { useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
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

// Composant de remplacement pour les outils debug supprimés
const DebugToolRemoved = ({ title }) => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <i className="bi bi-exclamation-triangle" style={{ fontSize: '3rem', color: '#ffc107' }}></i>
    <h3 style={{ marginTop: '1rem' }}>Outil debug supprimé</h3>
    <p style={{ color: '#6c757d' }}>
      L'outil "{title}" a été supprimé du système.
    </p>
  </div>
);

const DebugToolsPage = () => {
  const [activeTab, setActiveTab] = useState('message');

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
          Outils de diagnostic et de correction des données
        </p>
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className={styles.tabs}
      >
        <Tab eventKey="message" title="ℹ️ Information">
          <div style={{ padding: '2rem' }}>
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              border: '1px solid #dee2e6', 
              borderRadius: '0.375rem', 
              padding: '2rem',
              textAlign: 'center' 
            }}>
              <i className="bi bi-info-circle" style={{ fontSize: '3rem', color: '#0dcaf0' }}></i>
              <h2 style={{ marginTop: '1rem', marginBottom: '1rem' }}>Outils de debug supprimés</h2>
              <p style={{ fontSize: '1.1rem', color: '#6c757d', marginBottom: '0' }}>
                Les outils de debug ont été retirés du système pour améliorer les performances et la sécurité.
              </p>
              <p style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '1rem' }}>
                Cette page reste accessible pour référence historique.
              </p>
            </div>
          </div>
        </Tab>
        
        {/* Tous les composants debug ont été supprimés */}
        {/* Les tabs suivants sont conservés pour référence mais utilisent le composant de remplacement */}
        
        <Tab eventKey="quick-contact" title="👤 Création Rapide Contact">
          <DebugToolRemoved title="Création Rapide Contact" />
        </Tab>
        
        <Tab eventKey="relations-fixer" title="🔧 Réparation Relations">
          <DebugToolRemoved title="Réparation Relations" />
        </Tab>
        
        <Tab eventKey="contacts-audit" title="🔍 Audit Contacts Manquants">
          <DebugToolRemoved title="Audit Contacts Manquants" />
        </Tab>
        
        <Tab eventKey="lists" title="Diagnostic des listes">
          <DebugToolRemoved title="Diagnostic des listes" />
        </Tab>
        
        <Tab eventKey="structure" title="Structure des données">
          <DebugToolRemoved title="Structure des données" />
        </Tab>
        
        <Tab eventKey="rib" title="Debug RIB">
          <DebugToolRemoved title="Debug RIB" />
        </Tab>
        
        <Tab eventKey="org-context" title="Diagnostic Organisation">
          <DebugToolRemoved title="Diagnostic Organisation" />
        </Tab>
        
        <Tab eventKey="firestore-diag" title="Diagnostic Firestore">
          <DebugToolRemoved title="Diagnostic Firestore" />
        </Tab>
        
        <Tab eventKey="artiste-live" title="Test Recherche Live">
          <DebugToolRemoved title="Test Recherche Live" />
        </Tab>
        
        <Tab eventKey="brevo-diagnostic" title="📧 Diagnostic Brevo">
          <DebugToolRemoved title="Diagnostic Brevo" />
        </Tab>
        
        <Tab eventKey="parametres-migration" title="🔄 Migration Paramètres">
          <DebugToolRemoved title="Migration Paramètres" />
        </Tab>
        
        <Tab eventKey="brevo-recovery" title="🔧 Récupération Brevo">
          <DebugToolRemoved title="Récupération Brevo" />
        </Tab>
        
        <Tab eventKey="brevo-key-diagnostic" title="🔍 Diagnostic Clé Brevo">
          <DebugToolRemoved title="Diagnostic Clé Brevo" />
        </Tab>
        
        <Tab eventKey="brevo-template-creator" title="🎨 Créateur Templates Brevo">
          <DebugToolRemoved title="Créateur Templates Brevo" />
        </Tab>
        
        <Tab eventKey="brevo-template-customizer" title="🖌️ Configurateur Templates Brevo">
          <DebugToolRemoved title="Configurateur Templates Brevo" />
        </Tab>
        
        <Tab eventKey="tags-hierarchy-debug" title="🏷️ Debug Tags Hiérarchie">
          <DebugToolRemoved title="Debug Tags Hiérarchie" />
        </Tab>
        
        <Tab eventKey="hybrid-format-normalizer" title="🔧 Normalisation Formats Hybrides">
          <DebugToolRemoved title="Normalisation Formats Hybrides" />
        </Tab>
        
        <Tab eventKey="relational-migration-fixer" title="🔗 Correction Migration Relationnelle">
          <DebugToolRemoved title="Correction Migration Relationnelle" />
        </Tab>
        
        <Tab eventKey="contract-templates" title="📄 Migration Modèles Contrat">
          <DebugToolRemoved title="Migration Modèles Contrat" />
        </Tab>
        
        <Tab eventKey="contract-variables" title="🔄 Migration Variables Contrat">
          <DebugToolRemoved title="Migration Variables Contrat" />
        </Tab>
        
        <Tab eventKey="clean-contracts" title="🧹 Nettoyage Contrats">
          <DebugToolRemoved title="Nettoyage Contrats" />
        </Tab>
      </Tabs>
    </div>
  );
};

export default DebugToolsPage;