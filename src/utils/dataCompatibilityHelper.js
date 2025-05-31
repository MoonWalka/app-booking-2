/**
 * Utilitaire pour la compatibilité des données multi-organisation
 * Aide à la migration des données existantes vers le nouveau système
 */

import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '@/services/firebase-service';

/**
 * Vérifie si une collection organisationnelle existe et a des données
 * @param {string} entityType - Type d'entité (concerts, programmateurs, etc.)
 * @param {string} orgId - ID de l'organisation
 * @returns {Promise<boolean>} - True si la collection org existe et a des données
 */
export const checkOrganizationalCollection = async (entityType, orgId) => {
  try {
    const orgCollectionName = `${entityType}_org_${orgId}`;
    const orgCollection = collection(db, orgCollectionName);
    const snapshot = await getDocs(orgCollection);
    
    return snapshot.docs.length > 0;
  } catch (error) {
    console.error('Erreur lors de la vérification de la collection org:', error);
    return false;
  }
};

/**
 * Compte les données dans différentes sources
 * @param {string} entityType - Type d'entité
 * @param {string} orgId - ID de l'organisation (optionnel)
 * @returns {Promise<Object>} - Statistiques des données
 */
export const getDataStatistics = async (entityType, orgId = null) => {
  try {
    const stats = {
      organizational: 0,
      standardFiltered: 0,
      legacy: 0,
      total: 0
    };

    // Compter les données organisationnelles
    if (orgId) {
      const orgCollectionName = `${entityType}_org_${orgId}`;
      try {
        const orgCollection = collection(db, orgCollectionName);
        const orgSnapshot = await getDocs(orgCollection);
        stats.organizational = orgSnapshot.docs.length;
      } catch (error) {
        console.log('Collection organisationnelle non trouvée');
      }

      // Compter les données standard avec organizationId
      try {
        const standardCollection = collection(db, entityType);
        const filteredQuery = query(standardCollection, where('organizationId', '==', orgId));
        const filteredSnapshot = await getDocs(filteredQuery);
        stats.standardFiltered = filteredSnapshot.docs.length;
      } catch (error) {
        console.log('Données standard filtrées non trouvées');
      }
    }

    // Compter toutes les données legacy
    try {
      const legacyCollection = collection(db, entityType);
      const legacySnapshot = await getDocs(legacyCollection);
      stats.legacy = legacySnapshot.docs.length;
    } catch (error) {
      console.log('Données legacy non trouvées');
    }

    stats.total = stats.organizational + stats.standardFiltered + stats.legacy;

    return stats;
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    return { organizational: 0, standardFiltered: 0, legacy: 0, total: 0 };
  }
};

/**
 * Migre les données standard vers les collections organisationnelles
 * @param {string} entityType - Type d'entité
 * @param {string} orgId - ID de l'organisation
 * @param {boolean} dryRun - Mode test (ne fait pas les modifications)
 * @returns {Promise<Object>} - Résultat de la migration
 */
export const migrateToOrganizationalCollections = async (entityType, orgId, dryRun = true) => {
  try {
    const result = {
      success: false,
      migrated: 0,
      errors: [],
      dryRun
    };

    console.log(`${dryRun ? '🧪 TEST' : '🚀 MIGRATION'}: ${entityType} vers organisation ${orgId}`);

    // 1. Récupérer les données à migrer
    const standardCollection = collection(db, entityType);
    
    // Récupérer d'abord les données avec organizationId
    let dataToMigrate = [];
    
    try {
      const filteredQuery = query(standardCollection, where('organizationId', '==', orgId));
      const filteredSnapshot = await getDocs(filteredQuery);
      dataToMigrate = filteredSnapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data(),
        source: 'standard-filtered'
      }));
    } catch (error) {
      console.log('Pas de données avec organizationId trouvées');
    }

    // Si pas de données avec organizationId, proposer toutes les données legacy
    if (dataToMigrate.length === 0) {
      console.log('🔄 Tentative de migration des données legacy...');
      const legacySnapshot = await getDocs(standardCollection);
      dataToMigrate = legacySnapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data(),
        source: 'legacy'
      }));
    }

    console.log(`📊 ${dataToMigrate.length} éléments à migrer`);

    if (dataToMigrate.length === 0) {
      result.success = true;
      result.message = 'Aucune donnée à migrer';
      return result;
    }

    // 2. Créer la collection organisationnelle
    const orgCollectionName = `${entityType}_org_${orgId}`;
    
    if (!dryRun) {
      for (const item of dataToMigrate) {
        try {
          const orgCollection = collection(db, orgCollectionName);
          const dataToAdd = {
            ...item.data,
            organizationId: orgId,
            migratedAt: new Date(),
            migratedFrom: item.source
          };
          
          await addDoc(orgCollection, dataToAdd);
          result.migrated++;
          
        } catch (error) {
          console.error(`Erreur migration item ${item.id}:`, error);
          result.errors.push({
            itemId: item.id,
            error: error.message
          });
        }
      }
    } else {
      result.migrated = dataToMigrate.length; // Simulation
    }

    result.success = result.errors.length === 0;
    result.message = `${result.migrated} éléments ${dryRun ? 'seraient migrés' : 'migrés'}`;

    console.log(`✅ Migration ${dryRun ? 'testée' : 'terminée'}: ${result.message}`);
    
    return result;

  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    return {
      success: false,
      migrated: 0,
      errors: [{ error: error.message }],
      dryRun
    };
  }
};

/**
 * Analyse la compatibilité des données pour une organisation
 * @param {string} orgId - ID de l'organisation
 * @returns {Promise<Object>} - Rapport de compatibilité
 */
export const analyzeDataCompatibility = async (orgId) => {
  const entityTypes = ['concerts', 'programmateurs', 'artistes', 'lieux', 'structures'];
  const report = {
    organizationId: orgId,
    timestamp: new Date(),
    entities: {},
    recommendations: []
  };

  for (const entityType of entityTypes) {
    const stats = await getDataStatistics(entityType, orgId);
    const hasOrgCollection = await checkOrganizationalCollection(entityType, orgId);
    
    report.entities[entityType] = {
      ...stats,
      hasOrganizationalCollection: hasOrgCollection,
      recommendedAction: getRecommendedAction(stats, hasOrgCollection)
    };
  }

  // Générer les recommandations globales
  report.recommendations = generateGlobalRecommendations(report.entities);

  return report;
};

/**
 * Détermine l'action recommandée pour un type d'entité
 */
function getRecommendedAction(stats, hasOrgCollection) {
  if (hasOrgCollection && stats.organizational > 0) {
    return 'ready'; // Prêt à utiliser
  }
  
  if (stats.standardFiltered > 0) {
    return 'migrate-filtered'; // Migrer les données avec organizationId
  }
  
  if (stats.legacy > 0) {
    return 'migrate-legacy'; // Migrer les données legacy
  }
  
  return 'no-data'; // Pas de données
}

/**
 * Génère les recommandations globales
 */
function generateGlobalRecommendations(entities) {
  const recommendations = [];
  
  const readyEntities = Object.keys(entities).filter(
    key => entities[key].recommendedAction === 'ready'
  );
  
  const migrateNeeded = Object.keys(entities).filter(
    key => entities[key].recommendedAction.startsWith('migrate')
  );
  
  if (readyEntities.length > 0) {
    recommendations.push({
      type: 'success',
      message: `${readyEntities.length} entités prêtes à utiliser: ${readyEntities.join(', ')}`
    });
  }
  
  if (migrateNeeded.length > 0) {
    recommendations.push({
      type: 'action',
      message: `${migrateNeeded.length} entités nécessitent une migration: ${migrateNeeded.join(', ')}`,
      action: 'migrate'
    });
  }
  
  return recommendations;
}

export default {
  checkOrganizationalCollection,
  getDataStatistics,
  migrateToOrganizationalCollections,
  analyzeDataCompatibility
};