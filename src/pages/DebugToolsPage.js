import React, { useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import DataStructureFixer from '@/components/debug/DataStructureFixer';
import OrganizationIdDebug from '@/components/debug/OrganizationIdDebug';
import ListDebugger from '@/components/debug/ListDebugger';
import ContactCreationTester from '@/components/debug/ContactCreationTester';
import EntityCreationTester from '@/components/debug/EntityCreationTester';
import LieuMapDebug from '@/components/debug/LieuMapDebug';
import RIBDebugger from '@/components/debug/RIBDebugger';
import RelancesAuditTool from '@/components/debug/RelancesAuditTool';
import ContactEmailDebug from '@/components/debug/ContactEmailDebug';
import ArtisteSearchDebug from '@/components/debug/ArtisteSearchDebug';
import ArtisteSearchLiveDebug from '@/components/debug/ArtisteSearchLiveDebug';
import ArtisteOrganizationMatcher from '@/components/debug/ArtisteOrganizationMatcher';
import OrphanArtistesDebug from '@/components/debug/OrphanArtistesDebug';
import OrganizationContextDiagnostic from '@/components/debug/OrganizationContextDiagnostic';
import ArtisteFirestoreDiagnostic from '@/components/debug/ArtisteFirestoreDiagnostic';
import SystemAuditTool from '@/components/debug/SystemAuditTool';
import EntityRelationsDebugger from '@/components/debug/EntityRelationsDebugger';
import BidirectionalRelationsFixer from '@/components/debug/BidirectionalRelationsFixer';
import ConcertContactsDebug from '@/components/debug/ConcertContactsDebug';
import ContactsMigrationDiagnostic from '@/components/debug/ContactsMigrationDiagnostic';
import UnifiedContactSelectorTest from '@/components/debug/UnifiedContactSelectorTest';
import GenericDetailViewTest from '@/components/debug/GenericDetailViewTest';
import RelancesCompleteDiagnostic from '@/components/debug/RelancesCompleteDiagnostic';
import BrevoDiagnostic from '@/components/debug/BrevoDiagnostic';
import ParametresMigration from '@/components/debug/ParametresMigration';
import BrevoKeyRecovery from '@/components/debug/BrevoKeyRecovery';
import BrevoKeyDiagnostic from '@/components/debug/BrevoKeyDiagnostic';
import BrevoTemplateCreator from '@/components/debug/BrevoTemplateCreator';
import BrevoTemplateCustomizer from '@/components/debug/BrevoTemplateCustomizer';
import StructuresClickDebug from '@/components/debug/StructuresClickDebug';
import FestitestContactFinder from '@/components/debug/FestitestContactFinder';
import ContactMigrationTool from '@/components/debug/ContactMigrationTool';
import SophieMadetMigration from '@/components/debug/SophieMadetMigration';
import TagsHierarchyDebug from '@/components/debug/TagsHierarchyDebug';
import HybridFormatNormalizer from '@/components/debug/HybridFormatNormalizer';
import RelationalMigrationFixer from '@/components/debug/RelationalMigrationFixer';
import CheckStructureMigration from '@/components/debug/CheckStructureMigration';
import TestDeleteContactDebug from '@/components/debug/TestDeleteContactDebug';
import StructureAddressMigration from '@/components/debug/StructureAddressMigration';
import FestivalsDebugger from '@/components/debug/FestivalsDebugger';
import MigrateContractTemplates from '@/components/debug/MigrateContractTemplates';
import styles from './DebugToolsPage.module.css';

const DebugToolsPage = () => {
  const [activeTab, setActiveTab] = useState('festivals-debug');

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
        <Tab eventKey="system-audit" title="🔬 Audit Système">
          <SystemAuditTool />
        </Tab>
        
        <Tab eventKey="entity-relations" title="🔗 Relations d'Entité">
          <EntityRelationsDebugger />
        </Tab>
        
        <Tab eventKey="relations-fixer" title="🔧 Réparation Relations">
          <BidirectionalRelationsFixer />
        </Tab>
        
        <Tab eventKey="concert-contacts" title="👥 Contacts Concerts">
          <ConcertContactsDebug />
        </Tab>
        
        <Tab eventKey="test-delete" title="🗑️ Test Suppression">
          <TestDeleteContactDebug />
        </Tab>
        
        <Tab eventKey="lists" title="Diagnostic des listes">
          <ListDebugger />
        </Tab>
        
        <Tab eventKey="structure" title="Structure des données">
          <DataStructureFixer />
        </Tab>
        
        <Tab eventKey="organization" title="Organisation ID">
          <OrganizationIdDebug />
        </Tab>
        
        <Tab eventKey="contacts" title="Test Contacts">
          <ContactCreationTester />
        </Tab>
        
        <Tab eventKey="entities" title="Test Entités Complètes">
          <EntityCreationTester />
        </Tab>
        
        <Tab eventKey="lieu-map" title="Debug Cartes Lieux">
          <LieuMapDebug />
        </Tab>
        
        <Tab eventKey="rib" title="Debug RIB">
          <RIBDebugger />
        </Tab>
        
        <Tab eventKey="relances" title="Audit Relances">
          <RelancesAuditTool />
        </Tab>
        
        <Tab eventKey="relances-diagnostic" title="🔍 Diagnostic Relances Complet">
          <RelancesCompleteDiagnostic />
        </Tab>
        
        <Tab eventKey="contact-email" title="Debug Email Contact">
          <ContactEmailDebug />
        </Tab>
        
        <Tab eventKey="org-context" title="Diagnostic Organisation">
          <OrganizationContextDiagnostic />
        </Tab>
        
        <Tab eventKey="firestore-diag" title="Diagnostic Firestore">
          <ArtisteFirestoreDiagnostic />
        </Tab>
        
        <Tab eventKey="artiste-search" title="Debug Recherche Artistes">
          <ArtisteSearchDebug />
        </Tab>
        
        <Tab eventKey="artiste-live" title="Test Recherche Live">
          <ArtisteSearchLiveDebug />
        </Tab>
        
        <Tab eventKey="artiste-org" title="Organisation d'Artiste">
          <ArtisteOrganizationMatcher />
        </Tab>
        
        <Tab eventKey="orphan-artistes" title="Artistes Orphelins">
          <OrphanArtistesDebug />
        </Tab>
        
        <Tab eventKey="contacts-migration" title="🔄 Migration Contacts">
          <ContactsMigrationDiagnostic />
        </Tab>
        
        <Tab eventKey="unified-selector-test" title="🧪 Test UnifiedContactSelector">
          <UnifiedContactSelectorTest />
        </Tab>
        
        <Tab eventKey="generic-detail-view-test" title="🎨 Test GenericDetailView">
          <GenericDetailViewTest />
        </Tab>
        
        <Tab eventKey="brevo-diagnostic" title="📧 Diagnostic Brevo">
          <BrevoDiagnostic />
        </Tab>
        
        <Tab eventKey="parametres-migration" title="🔄 Migration Paramètres">
          <ParametresMigration />
        </Tab>
        
        <Tab eventKey="brevo-recovery" title="🔧 Récupération Brevo">
          <BrevoKeyRecovery />
        </Tab>
        
        <Tab eventKey="brevo-key-diagnostic" title="🔍 Diagnostic Clé Brevo">
          <BrevoKeyDiagnostic />
        </Tab>
        
        <Tab eventKey="brevo-template-creator" title="🎨 Créateur Templates Brevo">
          <BrevoTemplateCreator />
        </Tab>
        
        <Tab eventKey="brevo-template-customizer" title="🖌️ Configurateur Templates Brevo">
          <BrevoTemplateCustomizer />
        </Tab>
        
        <Tab eventKey="structures-click-debug" title="🏢 Debug Clics Structures">
          <StructuresClickDebug />
        </Tab>
        
        <Tab eventKey="festitest-contact-finder" title="🔍 Recherche Contact Festitest">
          <FestitestContactFinder />
        </Tab>
        
        <Tab eventKey="contact-migration-tool" title="🔄 Migration Automatique Contacts">
          <ContactMigrationTool />
        </Tab>
        
        <Tab eventKey="sophie-madet-migration" title="👤 Migration Sophie Madet">
          <SophieMadetMigration />
        </Tab>
        
        <Tab eventKey="tags-hierarchy-debug" title="🏷️ Debug Tags Hiérarchie">
          <TagsHierarchyDebug />
        </Tab>
        
        <Tab eventKey="hybrid-format-normalizer" title="🔧 Normalisation Formats Hybrides">
          <HybridFormatNormalizer />
        </Tab>
        
        <Tab eventKey="relational-migration-fixer" title="🔗 Correction Migration Relationnelle">
          <RelationalMigrationFixer />
        </Tab>
        
        <Tab eventKey="check-structure-migration" title="🔍 Vérifier Migration Structure">
          <CheckStructureMigration />
        </Tab>
        
        <Tab eventKey="structure-address-migration" title="🏠 Migration Adresses Structures">
          <StructureAddressMigration />
        </Tab>
        
        <Tab eventKey="festivals-debug" title="🎪 Debug Festivals">
          <FestivalsDebugger />
        </Tab>
        
        <Tab eventKey="contract-templates" title="📄 Migration Modèles Contrat">
          <MigrateContractTemplates />
        </Tab>
      </Tabs>
    </div>
  );
};

export default DebugToolsPage;