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
    uptime: Math.round((Date.now() - state.startTime) / 1000) // en secondes
  };
  
  // Calculer les stats par type d'entité
  for (const [instanceId, { entityType }] of state._instances.entries()) {
    stats.byEntityType[entityType] = (stats.byEntityType[entityType] || 0) + 1;
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

export default {
  register,
  unregister,
  updateMetadata,
  getStats,
  getInstance,
  getInstancesByType,
  reset
};