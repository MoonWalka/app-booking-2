/**
 * Service pour suivre et gérer les instances de hooks dans l'application
 * Remplace la variable globale hookInstances pour une meilleure gestion du cycle de vie
 */

import { debugLog } from '@/utils/logUtils';
import { v4 as uuidv4 } from 'uuid';

// État interne du tracker
const state = {
  _instances: new Map(),
  _counts: {},
  startTime: Date.now()
};

/**
 * Enregistre une nouvelle instance de hook
 * 
 * @param {string} entityType - Le type d'entité (ex: 'artiste', 'lieu')
 * @param {Object} metadata - Métadonnées supplémentaires à stocker
 * @returns {Object} - Informations sur l'instance créée
 */
const register = (entityType, metadata = {}) => {
  // Générer un identifiant unique pour cette instance de hook
  const instanceId = uuidv4();
  
  // Incrémenter le compteur pour ce type d'entité
  state._counts[entityType] = (state._counts[entityType] || 0) + 1;
  const instanceNumber = state._counts[entityType];
  
  // Enregistrer l'instance
  state._instances.set(instanceId, {
    entityType,
    instanceNumber,
    createdAt: Date.now(),
    ...metadata
  });
  
  debugLog(`Enregistrement de l'instance #${instanceNumber} pour ${entityType}`, 'debug', 'InstanceTracker');
  return { instanceId, instanceNumber };
};

/**
 * Désenregistre une instance de hook
 * 
 * @param {string} instanceId - L'ID de l'instance à désenregistrer
 * @returns {boolean} - Succès de l'opération
 */
const unregister = (instanceId) => {
  if (state._instances.has(instanceId)) {
    const { entityType, instanceNumber } = state._instances.get(instanceId);
    state._instances.delete(instanceId);
    debugLog(`Désenregistrement de l'instance #${instanceNumber} pour ${entityType}`, 'debug', 'InstanceTracker');
    return true;
  }
  return false;
};

/**
 * Met à jour les métadonnées d'une instance
 * 
 * @param {string} instanceId - L'ID de l'instance à mettre à jour
 * @param {Object} metadata - Nouvelles métadonnées à fusionner
 * @returns {boolean} - Succès de l'opération
 */
const updateMetadata = (instanceId, metadata = {}) => {
  if (state._instances.has(instanceId)) {
    const instance = state._instances.get(instanceId);
    state._instances.set(instanceId, {
      ...instance,
      ...metadata,
      lastUpdated: Date.now()
    });
    return true;
  }
  return false;
};

/**
 * Obtient les statistiques sur les instances actives
 * 
 * @returns {Object} - Statistiques d'utilisation
 */
const getStats = () => {
  const stats = {
    totalInstances: state._instances.size,
    byEntityType: {},
    oldestInstanceAge: 0,
    uptime: Math.round((Date.now() - state.startTime) / 1000), // en secondes
    // NOUVEAU: Analyses avancées par instance - Finalisation intelligente
    detailedAnalysis: {},
    instancePerformance: [],
    hotspots: [],
    recommendations: []
  };
  
  // Calculer les stats par type d'entité et analyser chaque instance
  const currentTime = Date.now();
  const instanceAnalyses = [];
  
  for (const [instanceId, instanceData] of state._instances.entries()) { // NOUVEAU: instanceId utilisé
    const { entityType, createdAt, instanceNumber, lastUpdated } = instanceData;
    
    // Compteur par type
    stats.byEntityType[entityType] = (stats.byEntityType[entityType] || 0) + 1;
    
    // NOUVEAU: Analyse détaillée de chaque instance
    const instanceAge = currentTime - createdAt;
    const lastActivityAge = lastUpdated ? currentTime - lastUpdated : instanceAge;
    
    const instanceAnalysis = {
      instanceId, // NOUVEAU: Utilisation de instanceId pour l'analyse
      entityType,
      instanceNumber,
      ageInSeconds: Math.round(instanceAge / 1000),
      lastActivityAgeInSeconds: Math.round(lastActivityAge / 1000),
      isStale: lastActivityAge > 300000, // 5 minutes sans activité
      isLongRunning: instanceAge > 1800000, // 30 minutes de durée de vie
      activityRatio: lastUpdated ? (instanceAge - lastActivityAge) / instanceAge : 0,
      metadata: { ...instanceData }
    };
    
    instanceAnalyses.push(instanceAnalysis);
    
    // Identifier les hotspots (instances problématiques)
    if (instanceAnalysis.isStale && instanceAnalysis.isLongRunning) {
      stats.hotspots.push({
        instanceId,
        entityType,
        instanceNumber,
        issue: 'Stale long-running instance',
        severity: 'high',
        recommendation: 'Vérifier les fuites mémoire ou nettoyage incorrect'
      });
    } else if (instanceAnalysis.isStale) {
      stats.hotspots.push({
        instanceId,
        entityType,
        instanceNumber,
        issue: 'Stale instance',
        severity: 'medium',
        recommendation: 'Instance inactive - considérer le cleanup'
      });
    } else if (instanceAnalysis.isLongRunning) {
      stats.hotspots.push({
        instanceId,
        entityType,
        instanceNumber,
        issue: 'Long-running instance',
        severity: 'low',
        recommendation: 'Instance ancienne mais active'
      });
    }
  }
  
  // NOUVEAU: Performance analysis par instance
  stats.instancePerformance = instanceAnalyses
    .sort((a, b) => b.ageInSeconds - a.ageInSeconds) // Trier par âge décroissant
    .slice(0, 20); // Top 20 instances les plus anciennes
  
  // NOUVEAU: Analyse détaillée par type d'entité
  Object.keys(stats.byEntityType).forEach(entityType => {
    const typeInstances = instanceAnalyses.filter(i => i.entityType === entityType);
    const totalInstances = typeInstances.length;
    const staleInstances = typeInstances.filter(i => i.isStale).length;
    const longRunningInstances = typeInstances.filter(i => i.isLongRunning).length;
    const avgAge = totalInstances > 0 
      ? Math.round(typeInstances.reduce((sum, i) => sum + i.ageInSeconds, 0) / totalInstances)
      : 0;
    
    stats.detailedAnalysis[entityType] = {
      totalInstances,
      staleInstances,
      longRunningInstances,
      avgAgeInSeconds: avgAge,
      staleRatio: totalInstances > 0 ? Math.round((staleInstances / totalInstances) * 100) : 0,
      healthScore: totalInstances > 0 
        ? Math.max(0, 100 - (Math.round((staleInstances / totalInstances) * 100) * 0.8) - (longRunningInstances / totalInstances * 20))
        : 100
    };
  });
  
  // NOUVEAU: Générer des recommandations intelligentes
  const totalStaleInstances = instanceAnalyses.filter(i => i.isStale).length;
  const totalLongRunningInstances = instanceAnalyses.filter(i => i.isLongRunning).length;
  
  if (totalStaleInstances > stats.totalInstances * 0.3) {
    stats.recommendations.push({
      type: 'cleanup',
      priority: 'high',
      message: `${totalStaleInstances} instances inactives détectées (${Math.round((totalStaleInstances/stats.totalInstances)*100)}%)`,
      action: 'Implémenter un système de cleanup automatique'
    });
  }
  
  if (totalLongRunningInstances > 10) {
    stats.recommendations.push({
      type: 'memory',
      priority: 'medium',
      message: `${totalLongRunningInstances} instances long-running détectées`,
      action: 'Vérifier les fuites mémoire potentielles'
    });
  }
  
  if (stats.totalInstances > 50) {
    stats.recommendations.push({
      type: 'performance',
      priority: 'medium',
      message: `Nombre élevé d'instances actives (${stats.totalInstances})`,
      action: 'Considérer l\'optimisation du cycle de vie des hooks'
    });
  }
  
  // Trouver l'instance la plus ancienne
  let oldestTime = Date.now();
  for (const { createdAt } of state._instances.values()) {
    if (createdAt < oldestTime) {
      oldestTime = createdAt;
    }
  }
  
  stats.oldestInstanceAge = Math.round((Date.now() - oldestTime) / 1000); // en secondes
  
  return stats;
};

/**
 * Récupère les détails d'une instance spécifique
 * 
 * @param {string} instanceId - L'ID de l'instance
 * @returns {Object|null} - Détails de l'instance ou null si non trouvée
 */
const getInstance = (instanceId) => {
  if (state._instances.has(instanceId)) {
    return { ...state._instances.get(instanceId) };
  }
  return null;
};

/**
 * Récupère toutes les instances d'un type d'entité donné
 * 
 * @param {string} entityType - Le type d'entité à filtrer
 * @returns {Array} - Liste des instances de ce type
 */
const getInstancesByType = (entityType) => {
  const instances = [];
  
  for (const [instanceId, instance] of state._instances.entries()) {
    if (instance.entityType === entityType) {
      instances.push({
        instanceId,
        ...instance
      });
    }
  }
  
  return instances;
};

/**
 * Réinitialise toutes les statistiques et instances (utile pour les tests)
 */
const reset = () => {
  state._instances.clear();
  state._counts = {};
  state.startTime = Date.now();
  debugLog('Réinitialisation du tracker d\'instances', 'info', 'InstanceTracker');
};

// NOUVEAU: Méthodes d'analyse avancée - Finalisation intelligente

/**
 * Nettoie automatiquement les instances inactives
 * 
 * @param {number} maxInactiveTime - Temps maximum d'inactivité en millisecondes (défaut: 10 minutes)
 * @returns {Object} - Résultat du nettoyage
 */
const cleanupStaleInstances = (maxInactiveTime = 600000) => {
  const currentTime = Date.now();
  const removedInstances = [];
  
  for (const [instanceId, instanceData] of state._instances.entries()) {
    const { lastUpdated, createdAt, entityType, instanceNumber } = instanceData;
    const inactiveTime = currentTime - (lastUpdated || createdAt);
    
    if (inactiveTime > maxInactiveTime) {
      removedInstances.push({
        instanceId,
        entityType,
        instanceNumber,
        inactiveTimeInSeconds: Math.round(inactiveTime / 1000)
      });
      state._instances.delete(instanceId);
    }
  }
  
  debugLog(`Nettoyage automatique: ${removedInstances.length} instances supprimées`, 'info', 'InstanceTracker');
  
  return {
    removedCount: removedInstances.length,
    removedInstances,
    remainingCount: state._instances.size
  };
};

/**
 * Génère un rapport de santé détaillé du système
 * 
 * @returns {Object} - Rapport de santé complet
 */
const getHealthReport = () => {
  const stats = getStats();
  const currentTime = Date.now();
  
  // Calculer le score de santé global
  let healthScore = 100;
  const issues = [];
  
  // NOUVEAU: Utilisation de currentTime pour des métriques temporelles
  const systemUptimeHours = Math.round((currentTime - state.startTime) / 3600000);
  const avgInstanceAge = stats.totalInstances > 0 
    ? Math.round(Array.from(state._instances.values())
        .reduce((sum, instance) => sum + (currentTime - instance.createdAt), 0) 
        / stats.totalInstances / 1000)
    : 0;
  
  // Pénalités pour les problèmes détectés
  if (stats.hotspots.length > 0) {
    const highSeverityCount = stats.hotspots.filter(h => h.severity === 'high').length;
    const mediumSeverityCount = stats.hotspots.filter(h => h.severity === 'medium').length;
    
    healthScore -= (highSeverityCount * 15) + (mediumSeverityCount * 8);
    issues.push(`${stats.hotspots.length} instances problématiques détectées`);
  }
  
  if (stats.totalInstances > 100) {
    healthScore -= 20;
    issues.push('Nombre très élevé d\'instances actives');
  } else if (stats.totalInstances > 50) {
    healthScore -= 10;
    issues.push('Nombre élevé d\'instances actives');
  }
  
  if (stats.oldestInstanceAge > 3600) { // Plus d'1 heure
    healthScore -= 15;
    issues.push('Instances très anciennes détectées');
  }
  
  healthScore = Math.max(0, healthScore);
  
  // Déterminer le statut général
  let status = 'excellent';
  if (healthScore < 50) status = 'critique';
  else if (healthScore < 70) status = 'dégradé';
  else if (healthScore < 85) status = 'moyen';
  else if (healthScore < 95) status = 'bon';
  
  return {
    timestamp: new Date().toISOString(),
    overallHealthScore: healthScore,
    status,
    totalInstances: stats.totalInstances,
    uptimeInSeconds: stats.uptime,
    // NOUVEAU: Métriques temporelles utilisant currentTime
    systemUptimeHours,
    avgInstanceAgeInSeconds: avgInstanceAge,
    reportGeneratedAt: currentTime,
    issues,
    recommendations: stats.recommendations,
    hotspots: stats.hotspots,
    detailedAnalysis: stats.detailedAnalysis,
    topOldestInstances: stats.instancePerformance.slice(0, 5),
    summary: {
      criticalIssues: stats.hotspots.filter(h => h.severity === 'high').length,
      warningIssues: stats.hotspots.filter(h => h.severity === 'medium').length,
      totalRecommendations: stats.recommendations.length
    }
  };
};

/**
 * Active le monitoring automatique avec cleanup périodique
 * 
 * @param {Object} options - Options de configuration
 * @returns {Object} - Contrôles du monitoring
 */
const startMonitoring = (options = {}) => {
  const {
    cleanupInterval = 600000, // 10 minutes
    maxInactiveTime = 1800000, // 30 minutes
    reportInterval = 3600000,  // 1 heure
    enableLogging = true
  } = options;
  
  let cleanupIntervalId, reportIntervalId;
  
  // Cleanup automatique
  cleanupIntervalId = setInterval(() => {
    const result = cleanupStaleInstances(maxInactiveTime);
    if (enableLogging && result.removedCount > 0) {
      debugLog(`Monitoring: ${result.removedCount} instances nettoyées automatiquement`, 'info', 'InstanceTracker');
    }
  }, cleanupInterval);
  
  // Rapport de santé périodique
  if (enableLogging) {
    reportIntervalId = setInterval(() => {
      const healthReport = getHealthReport();
      debugLog(`Rapport de santé: Score ${healthReport.overallHealthScore}%, Status: ${healthReport.status}`, 'info', 'InstanceTracker');
    }, reportInterval);
  }
  
  debugLog('Monitoring automatique activé', 'info', 'InstanceTracker');
  
  return {
    stop: () => {
      if (cleanupIntervalId) clearInterval(cleanupIntervalId);
      if (reportIntervalId) clearInterval(reportIntervalId);
      debugLog('Monitoring automatique arrêté', 'info', 'InstanceTracker');
    },
    getStatus: () => ({
      active: true,
      cleanupInterval,
      maxInactiveTime,
      reportInterval,
      enableLogging
    })
  };
};

const instanceTracker = {
  register,
  unregister,
  updateMetadata,
  getStats,
  getInstance,
  getInstancesByType,
  reset,
  // NOUVEAU: Méthodes d'analyse avancée
  cleanupStaleInstances,
  getHealthReport,
  startMonitoring
};

export default instanceTracker;
