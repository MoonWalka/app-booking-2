/**
 * Tableau de bord pour la compatibilité et migration des données multi-organisation
 */

import React, { useState, useEffect } from 'react';
import { useOrganization } from '@/context/OrganizationContext';
import { 
  analyzeDataCompatibility, 
  migrateToOrganizationalCollections,
  getDataStatistics 
} from '@/utils/dataCompatibilityHelper';
import styles from './DataCompatibilityDashboard.module.css';

const DataCompatibilityDashboard = () => {
  const { currentOrg } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [migrationProgress, setMigrationProgress] = useState({});
  const [activeTab, setActiveTab] = useState('overview');

  // Charger l'analyse de compatibilité
  const loadCompatibilityReport = async () => {
    if (!currentOrg) return;
    
    setLoading(true);
    try {
      const compatibilityReport = await analyzeDataCompatibility(currentOrg.id);
      setReport(compatibilityReport);
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
    } finally {
      setLoading(false);
    }
  };

  // Effectuer une migration test
  const performTestMigration = async (entityType) => {
    if (!currentOrg) return;
    
    setMigrationProgress(prev => ({
      ...prev,
      [entityType]: { status: 'testing', progress: 0 }
    }));

    try {
      const result = await migrateToOrganizationalCollections(entityType, currentOrg.id, true);
      
      setMigrationProgress(prev => ({
        ...prev,
        [entityType]: { 
          status: 'test-complete', 
          progress: 100,
          result: result
        }
      }));
    } catch (error) {
      setMigrationProgress(prev => ({
        ...prev,
        [entityType]: { 
          status: 'error', 
          progress: 0,
          error: error.message
        }
      }));
    }
  };

  // Effectuer la migration réelle
  const performRealMigration = async (entityType) => {
    if (!currentOrg) return;
    
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir migrer les données ${entityType} vers la collection organisationnelle ?\n\n` +
      `Cette action créera de nouveaux enregistrements dans la collection ${entityType}_org_${currentOrg.id}.\n\n` +
      `Les données originales ne seront pas supprimées.`
    );

    if (!confirmed) return;

    setMigrationProgress(prev => ({
      ...prev,
      [entityType]: { status: 'migrating', progress: 0 }
    }));

    try {
      const result = await migrateToOrganizationalCollections(entityType, currentOrg.id, false);
      
      setMigrationProgress(prev => ({
        ...prev,
        [entityType]: { 
          status: 'migration-complete', 
          progress: 100,
          result: result
        }
      }));
      
      // Recharger le rapport après migration
      await loadCompatibilityReport();
    } catch (error) {
      setMigrationProgress(prev => ({
        ...prev,
        [entityType]: { 
          status: 'error', 
          progress: 0,
          error: error.message
        }
      }));
    }
  };

  // Charger le rapport au montage du composant
  useEffect(() => {
    if (currentOrg) {
      loadCompatibilityReport();
    }
  }, [currentOrg]);

  // Rendu du statut d'une entité
  const renderEntityStatus = (entityType, entityData) => {
    const progress = migrationProgress[entityType];
    
    return (
      <div key={entityType} className={styles.entityCard}>
        <div className={styles.entityHeader}>
          <h3>{entityType}</h3>
          <div className={styles.entityBadge}>
            {getStatusBadge(entityData.recommendedAction)}
          </div>
        </div>

        <div className={styles.entityStats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Collection org:</span>
            <span className={styles.statValue}>{entityData.organizational}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Standard filtrée:</span>
            <span className={styles.statValue}>{entityData.standardFiltered}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Legacy:</span>
            <span className={styles.statValue}>{entityData.legacy}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total:</span>
            <span className={styles.statValue}>{entityData.total}</span>
          </div>
        </div>

        {progress && (
          <div className={styles.progressSection}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${progress.progress}%` }}
              />
            </div>
            <span className={styles.progressText}>
              {getProgressText(progress)}
            </span>
          </div>
        )}

        <div className={styles.entityActions}>
          {entityData.recommendedAction.startsWith('migrate') && (
            <>
              <button 
                className={styles.testButton}
                onClick={() => performTestMigration(entityType)}
                disabled={progress?.status === 'testing' || progress?.status === 'migrating'}
              >
                🧪 Test Migration
              </button>
              <button 
                className={styles.migrateButton}
                onClick={() => performRealMigration(entityType)}
                disabled={progress?.status === 'testing' || progress?.status === 'migrating'}
              >
                🚀 Migrer
              </button>
            </>
          )}
          {entityData.recommendedAction === 'ready' && (
            <span className={styles.readyIndicator}>✅ Prêt à utiliser</span>
          )}
          {entityData.recommendedAction === 'no-data' && (
            <span className={styles.noDataIndicator}>ℹ️ Pas de données</span>
          )}
        </div>
      </div>
    );
  };

  // Obtenir le badge de statut
  const getStatusBadge = (action) => {
    switch (action) {
      case 'ready':
        return <span className={styles.statusReady}>Prêt</span>;
      case 'migrate-filtered':
        return <span className={styles.statusMigrate}>Migration standard</span>;
      case 'migrate-legacy':
        return <span className={styles.statusMigrateLegacy}>Migration legacy</span>;
      case 'no-data':
        return <span className={styles.statusNoData}>Vide</span>;
      default:
        return <span className={styles.statusUnknown}>Inconnu</span>;
    }
  };

  // Obtenir le texte de progression
  const getProgressText = (progress) => {
    switch (progress.status) {
      case 'testing':
        return 'Test en cours...';
      case 'test-complete':
        return `Test terminé: ${progress.result?.migrated || 0} éléments seraient migrés`;
      case 'migrating':
        return 'Migration en cours...';
      case 'migration-complete':
        return `Migration terminée: ${progress.result?.migrated || 0} éléments migrés`;
      case 'error':
        return `Erreur: ${progress.error}`;
      default:
        return '';
    }
  };

  if (!currentOrg) {
    return (
      <div className={styles.container}>
        <div className={styles.noOrg}>
          <h2>Tableau de bord de compatibilité des données</h2>
          <p>Veuillez sélectionner une organisation pour analyser la compatibilité des données.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Compatibilité des données - {currentOrg.name}</h1>
        <button 
          className={styles.refreshButton}
          onClick={loadCompatibilityReport}
          disabled={loading}
        >
          {loading ? '🔄 Analyse...' : '🔄 Actualiser'}
        </button>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Vue d'ensemble
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'details' ? styles.active : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Détails techniques
        </button>
      </div>

      {loading && (
        <div className={styles.loading}>
          <p>Analyse de la compatibilité des données en cours...</p>
        </div>
      )}

      {report && !loading && (
        <>
          {activeTab === 'overview' && (
            <div className={styles.overview}>
              {report.recommendations.length > 0 && (
                <div className={styles.recommendations}>
                  <h2>Recommandations</h2>
                  {report.recommendations.map((rec, index) => (
                    <div key={index} className={`${styles.recommendation} ${styles[rec.type]}`}>
                      <p>{rec.message}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.entitiesGrid}>
                {Object.entries(report.entities).map(([entityType, entityData]) =>
                  renderEntityStatus(entityType, entityData)
                )}
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className={styles.details}>
              <h2>Détails techniques</h2>
              <pre className={styles.jsonReport}>
                {JSON.stringify(report, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DataCompatibilityDashboard;