/**
 * Service de mise en cache pour les données Firestore
 * Permet d'éviter des requêtes inutiles et d'améliorer les performances
 */

// Configuration des durées de cache par collection (en ms)
const CACHE_DURATIONS = {
  // Collections fréquemment utilisées avec cache court
  dates: 60000, // 1 minute
  form_submissions: 30000, // 30 secondes
  
  // Collections semi-statiques avec cache plus long
  lieux: 300000, // 5 minutes
  contacts: 300000, // 5 minutes
  artistes: 300000, // 5 minutes
  structures: 600000, // 10 minutes
  
  // Collections de référence très stables
  parametres: 1800000, // 30 minutes
  templates: 1800000, // 30 minutes
  
  // Durée par défaut
  default: 120000 // 2 minutes
};

class CacheService {
  constructor() {
    // Initialisation des caches
    this.entityCache = {}; // Cache par ID: { collection: { id: { data, timestamp } } }
    this.queryCache = {}; // Cache de requêtes: { key: { results, timestamp } }
    this.relationCache = {}; // Cache de relations: { sourceCollection_sourceId_targetCollection: { data, timestamp } }
    
    // Statistiques de performances
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      lastCleanup: Date.now()
    };
    
    // Limites de taille
    this.MAX_CACHE_ITEMS = 1000;
    
    // Planifier le nettoyage périodique du cache (toutes les 15 minutes)
    this.cleanupInterval = setInterval(() => this.cleanup(), 900000);
  }
  
  /**
   * Récupère une entité du cache ou null si non trouvée/expirée
   * @param {string} collection - Nom de la collection
   * @param {string} id - ID du document
   * @returns {Object|null} - Données mises en cache ou null
   */
  getEntity(collection, id) {
    if (!collection || !id) return null;
    
    const cacheKey = `${collection}/${id}`;
    const collectionCache = this.entityCache[collection];
    
    // Initialiser le logging des accès si pas encore fait
    if (!this.accessLog) {
      this.accessLog = {}; // Log des accès par clé
      this.debugMode = process.env.NODE_ENV === 'development';
    }
    
    // Enregistrer l'accès pour le debugging
    if (!this.accessLog[cacheKey]) {
      this.accessLog[cacheKey] = {
        collection,
        id,
        firstAccess: Date.now(),
        lastAccess: Date.now(),
        accessCount: 0,
        hitCount: 0,
        missCount: 0
      };
    }
    
    // Mettre à jour les statistiques d'accès
    this.accessLog[cacheKey].lastAccess = Date.now();
    this.accessLog[cacheKey].accessCount++;
    
    if (!collectionCache || !collectionCache[id]) {
      this.stats.misses++;
      this.accessLog[cacheKey].missCount++;
      
      // Debugging avancé en mode développement
      if (this.debugMode) {
      }
      
      return null;
    }
    
    const cachedItem = collectionCache[id];
    const cacheDuration = CACHE_DURATIONS[collection] || CACHE_DURATIONS.default;
    
    // Vérifier si le cache est encore valide
    if (Date.now() - cachedItem.timestamp > cacheDuration) {
      // Cache expiré
      this.stats.misses++;
      this.accessLog[cacheKey].missCount++;
      
      // Logging de l'expiration avec détails
      if (this.debugMode) {
        // const expired = Date.now() - cachedItem.timestamp; // Métrique de débogage - logs supprimés
      }
      
      return null;
    }
    
    // Cache hit
    this.stats.hits++;
    this.accessLog[cacheKey].hitCount++;
    
    // Logging du succès avec métriques
    if (this.debugMode) {
      // const hitRate = ((this.accessLog[cacheKey].hitCount / this.accessLog[cacheKey].accessCount) * 100).toFixed(1); // Métrique de débogage - logs supprimés
    }
    
    return cachedItem.data;
  }
  
  /**
   * Stocke une entité dans le cache
   * @param {string} collection - Nom de la collection
   * @param {string} id - ID du document
   * @param {Object} data - Données à mettre en cache
   */
  setEntity(collection, id, data) {
    if (!collection || !id || !data) return;
    
    // Initialiser le cache de collection s'il n'existe pas
    if (!this.entityCache[collection]) {
      this.entityCache[collection] = {};
    }
    
    // Stocker les données avec un timestamp
    this.entityCache[collection][id] = {
      data,
      timestamp: Date.now()
    };
    
    // Mettre à jour les stats
    this.stats.size++;
  }
  
  /**
   * Récupère les résultats d'une requête du cache
   * @param {string} queryKey - Clé unique de la requête
   * @returns {Array|null} - Résultats de la requête ou null
   */
  getQueryResults(queryKey) {
    if (!queryKey) return null;
    
    const cachedQuery = this.queryCache[queryKey];
    if (!cachedQuery) {
      this.stats.misses++;
      return null;
    }
    
    // Utilisez une durée de cache légèrement plus courte pour les requêtes
    const cacheDuration = 60000; // 1 minute
    
    // Vérifier si le cache est encore valide
    if (Date.now() - cachedQuery.timestamp > cacheDuration) {
      // Cache expiré
      this.stats.misses++;
      return null;
    }
    
    // Cache hit
    this.stats.hits++;
    return cachedQuery.results;
  }
  
  /**
   * Stocke les résultats d'une requête dans le cache
   * @param {string} queryKey - Clé unique de la requête
   * @param {Array} results - Résultats à mettre en cache
   */
  setQueryResults(queryKey, results) {
    if (!queryKey || !results) return;
    
    this.queryCache[queryKey] = {
      results,
      timestamp: Date.now()
    };
    
    // Mettre à jour les stats
    this.stats.size++;
  }
  
  /**
   * Récupère des données de relation du cache
   * @param {string} sourceCollection - Collection source
   * @param {string} sourceId - ID de la source
   * @param {string} targetCollection - Collection cible
   * @returns {Array|null} - Données de relation ou null
   */
  getRelation(sourceCollection, sourceId, targetCollection) {
    const key = `${sourceCollection}_${sourceId}_${targetCollection}`;
    const cachedRelation = this.relationCache[key];
    
    if (!cachedRelation) {
      this.stats.misses++;
      return null;
    }
    
    const cacheDuration = 120000; // 2 minutes
    
    if (Date.now() - cachedRelation.timestamp > cacheDuration) {
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    return cachedRelation.data;
  }
  
  /**
   * Stocke des données de relation dans le cache
   * @param {string} sourceCollection - Collection source
   * @param {string} sourceId - ID de la source
   * @param {string} targetCollection - Collection cible
   * @param {Array} data - Données à mettre en cache
   */
  setRelation(sourceCollection, sourceId, targetCollection, data) {
    if (!sourceCollection || !sourceId || !targetCollection || !data) return;
    
    const key = `${sourceCollection}_${sourceId}_${targetCollection}`;
    this.relationCache[key] = {
      data,
      timestamp: Date.now()
    };
    
    this.stats.size++;
  }
  
  /**
   * Invalide une entrée spécifique du cache
   * @param {string} collection - Nom de la collection
   * @param {string} id - ID du document (optionnel, si omis efface toute la collection)
   */
  invalidate(collection, id = null) {
    // Si un ID est fourni, effacer uniquement cette entrée
    if (id && this.entityCache[collection]) {
      delete this.entityCache[collection][id];
      
      // Invalider également les requêtes qui pourraient contenir cette entité
      this.queryCache = {};
      
      return;
    }
    
    // Sinon effacer toute la collection
    if (this.entityCache[collection]) {
      delete this.entityCache[collection];
    }
    
    // Invalider toutes les requêtes
    this.queryCache = {};
    
    // Invalider les relations associées
    Object.keys(this.relationCache).forEach(key => {
      if (key.startsWith(`${collection}_`) || key.endsWith(`_${collection}`)) {
        delete this.relationCache[key];
      }
    });
  }
  
  /**
   * Nettoie les entrées expirées du cache
   */
  cleanup() {
    const now = Date.now();
    let itemsRemoved = 0;
    
    // Nettoyer le cache d'entités
    Object.keys(this.entityCache).forEach(collection => {
      const cacheDuration = CACHE_DURATIONS[collection] || CACHE_DURATIONS.default;
      
      Object.keys(this.entityCache[collection]).forEach(id => {
        if (now - this.entityCache[collection][id].timestamp > cacheDuration) {
          delete this.entityCache[collection][id];
          itemsRemoved++;
        }
      });
      
      // Supprimer les collections vides
      if (Object.keys(this.entityCache[collection]).length === 0) {
        delete this.entityCache[collection];
      }
    });
    
    // Nettoyer le cache de requêtes (60 secondes)
    Object.keys(this.queryCache).forEach(key => {
      if (now - this.queryCache[key].timestamp > 60000) {
        delete this.queryCache[key];
        itemsRemoved++;
      }
    });
    
    // Nettoyer le cache de relations (2 minutes)
    Object.keys(this.relationCache).forEach(key => {
      if (now - this.relationCache[key].timestamp > 120000) {
        delete this.relationCache[key];
        itemsRemoved++;
      }
    });
    
    // Mettre à jour les stats
    this.stats.size -= itemsRemoved;
    this.stats.lastCleanup = now;
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Cache nettoyé: ${itemsRemoved} entrées supprimées. Taille actuelle: ${this.stats.size}`);
    }
    
    // Si le cache est toujours trop grand, supprimer les plus anciennes entrées
    if (this.stats.size > this.MAX_CACHE_ITEMS) {
      this.forceCleanup();
    }
  }
  
  /**
   * Force le nettoyage du cache si celui-ci est trop grand
   */
  forceCleanup() {
    // Si le cache est trop grand, on supprime les entrées les plus anciennes
    const allEntries = [];
    
    // Collecter toutes les entrées avec leurs timestamps
    Object.keys(this.entityCache).forEach(collection => {
      Object.keys(this.entityCache[collection]).forEach(id => {
        allEntries.push({
          type: 'entity',
          collection,
          id,
          timestamp: this.entityCache[collection][id].timestamp
        });
      });
    });
    
    Object.keys(this.queryCache).forEach(key => {
      allEntries.push({
        type: 'query',
        key,
        timestamp: this.queryCache[key].timestamp
      });
    });
    
    Object.keys(this.relationCache).forEach(key => {
      allEntries.push({
        type: 'relation',
        key,
        timestamp: this.relationCache[key].timestamp
      });
    });
    
    // Trier par timestamp (du plus ancien au plus récent)
    allEntries.sort((a, b) => a.timestamp - b.timestamp);
    
    // Supprimer les entrées les plus anciennes jusqu'à atteindre la limite
    const toRemove = Math.ceil(this.MAX_CACHE_ITEMS * 0.2); // Enlever 20%
    
    const entriesToRemove = allEntries.slice(0, toRemove);
    entriesToRemove.forEach(entry => {
      if (entry.type === 'entity') {
        delete this.entityCache[entry.collection][entry.id];
        
        // Supprimer les collections vides
        if (this.entityCache[entry.collection] && 
            Object.keys(this.entityCache[entry.collection]).length === 0) {
          delete this.entityCache[entry.collection];
        }
      } else if (entry.type === 'query') {
        delete this.queryCache[entry.key];
      } else if (entry.type === 'relation') {
        delete this.relationCache[entry.key];
      }
    });
    
    // Mettre à jour les stats
    this.stats.size -= entriesToRemove.length;
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Nettoyage forcé: ${entriesToRemove.length} entrées supprimées. Nouvelle taille: ${this.stats.size}`);
    }
  }
  
  /**
   * Réinitialise complètement le cache
   */
  clear() {
    this.entityCache = {};
    this.queryCache = {};
    this.relationCache = {};
    
    // Réinitialiser les stats
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      lastCleanup: Date.now()
    };
  }
  
  /**
   * Récupère une valeur du cache (méthode générique pour useCache hook)
   * @param {string} key - Clé de la valeur
   * @returns {*} - Valeur mise en cache ou undefined
   */
  get(key) {
    if (!key) return undefined;
    
    const cachedItem = this.queryCache[key];
    if (!cachedItem) {
      this.stats.misses++;
      return undefined;
    }
    
    // Utiliser le TTL personnalisé s'il existe, sinon utiliser la valeur par défaut
    const ttl = cachedItem.ttl || 120000;
    
    // Vérifier si le cache est encore valide
    if (Date.now() - cachedItem.timestamp > ttl) {
      // Cache expiré
      this.stats.misses++;
      delete this.queryCache[key];
      return undefined;
    }
    
    // Cache hit
    this.stats.hits++;
    return cachedItem.results;
  }
  
  /**
   * Stocke une valeur dans le cache (méthode générique pour useCache hook)
   * @param {string} key - Clé unique
   * @param {*} value - Valeur à mettre en cache
   * @param {Object} options - Options (ttl, etc.)
   * @returns {boolean} - true si réussite
   */
  set(key, value, options = {}) {
    if (!key) return false;
    
    const ttl = options.ttl || 120000; // Default to 2 minutes if not specified
    
    this.queryCache[key] = {
      results: value,
      timestamp: Date.now(),
      ttl: ttl
    };
    
    // Mettre à jour les stats
    this.stats.size++;
    return true;
  }
  
  /**
   * Supprime une valeur du cache (méthode générique pour useCache hook)
   * @param {string} key - Clé à supprimer
   * @returns {boolean} - true si la valeur existait
   */
  remove(key) {
    if (!key || !this.queryCache[key]) return false;
    
    delete this.queryCache[key];
    this.stats.size--;
    return true;
  }
  
  /**
   * Retourne les statistiques d'utilisation du cache
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? Math.round((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100) 
      : 0;
    
    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      timeSinceCleanup: Math.round((Date.now() - this.stats.lastCleanup) / 1000)
    };
  }

  // NOUVEAU: Méthodes de debugging avancé - Finalisation intelligente

  /**
   * Retourne les statistiques détaillées d'accès par clé
   * @param {string} collection - Filtrer par collection (optionnel)
   * @returns {Object} - Statistiques détaillées
   */
  getAccessStats(collection = null) {
    if (!this.accessLog) return { total: 0, keys: [] };
    
    const keys = Object.keys(this.accessLog);
    const filteredKeys = collection 
      ? keys.filter(key => this.accessLog[key].collection === collection)
      : keys;
    
    const stats = filteredKeys.map(cacheKey => ({
      cacheKey,
      ...this.accessLog[cacheKey],
      hitRate: ((this.accessLog[cacheKey].hitCount / this.accessLog[cacheKey].accessCount) * 100).toFixed(1),
      avgAccessTime: this.accessLog[cacheKey].accessCount > 0 
        ? Math.round((this.accessLog[cacheKey].lastAccess - this.accessLog[cacheKey].firstAccess) / this.accessLog[cacheKey].accessCount)
        : 0
    }));
    
    // Trier par taux de hit décroissant
    stats.sort((a, b) => parseFloat(b.hitRate) - parseFloat(a.hitRate));
    
    return {
      total: filteredKeys.length,
      totalAccesses: stats.reduce((sum, stat) => sum + stat.accessCount, 0),
      avgHitRate: stats.length > 0 
        ? (stats.reduce((sum, stat) => sum + parseFloat(stat.hitRate), 0) / stats.length).toFixed(1)
        : '0',
      keys: stats
    };
  }

  /**
   * Identifie les clés avec de mauvaises performances
   * @param {number} minAccesses - Nombre minimum d'accès pour être considéré
   * @param {number} maxHitRate - Taux de hit maximum pour être considéré comme problématique
   * @returns {Array} - Liste des clés problématiques
   */
  getProblematicKeys(minAccesses = 5, maxHitRate = 30) {
    if (!this.accessLog) return [];
    
    return Object.keys(this.accessLog)
      .filter(cacheKey => {
        const log = this.accessLog[cacheKey];
        const hitRate = (log.hitCount / log.accessCount) * 100;
        return log.accessCount >= minAccesses && hitRate <= maxHitRate;
      })
      .map(cacheKey => ({
        cacheKey,
        ...this.accessLog[cacheKey],
        hitRate: ((this.accessLog[cacheKey].hitCount / this.accessLog[cacheKey].accessCount) * 100).toFixed(1),
        recommendation: this.accessLog[cacheKey].hitCount === 0 
          ? 'Considérer la pré-charge ou l\'invalidation de cette clé'
          : 'Vérifier la durée de cache ou la logique d\'invalidation'
      }))
      .sort((a, b) => a.accessCount - b.accessCount);
  }

  /**
   * Retourne un rapport de performance détaillé
   * @returns {Object} - Rapport complet
   */
  getPerformanceReport() {
    const globalStats = this.getStats();
    const accessStats = this.getAccessStats();
    const problematicKeys = this.getProblematicKeys();
    
    // Top 10 des clés les plus utilisées
    const topKeys = accessStats.keys.slice(0, 10);
    
    // Collections les plus utilisées
    const collectionStats = {};
    Object.values(this.accessLog || {}).forEach(log => {
      if (!collectionStats[log.collection]) {
        collectionStats[log.collection] = { accessCount: 0, hitCount: 0, keys: 0 };
      }
      collectionStats[log.collection].accessCount += log.accessCount;
      collectionStats[log.collection].hitCount += log.hitCount;
      collectionStats[log.collection].keys++;
    });
    
    const collectionPerformance = Object.keys(collectionStats).map(collection => ({
      collection,
      ...collectionStats[collection],
      hitRate: ((collectionStats[collection].hitCount / collectionStats[collection].accessCount) * 100).toFixed(1)
    })).sort((a, b) => b.accessCount - a.accessCount);
    
    return {
      timestamp: new Date().toISOString(),
      globalStats,
      accessStats: {
        totalKeys: accessStats.total,
        totalAccesses: accessStats.totalAccesses,
        avgHitRate: accessStats.avgHitRate + '%'
      },
      topKeys,
      collectionPerformance,
      problematicKeys,
      recommendations: this.generateRecommendations(problematicKeys, collectionPerformance)
    };
  }

  /**
   * Génère des recommandations d'optimisation
   * @param {Array} problematicKeys - Clés problématiques
   * @param {Array} collectionPerformance - Performance par collection
   * @returns {Array} - Liste de recommandations
   */
  generateRecommendations(problematicKeys, collectionPerformance) {
    const recommendations = [];
    
    if (problematicKeys.length > 0) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: `${problematicKeys.length} clés ont un faible taux de hit. Considérer l'ajustement des durées de cache.`,
        keys: problematicKeys.slice(0, 5).map(k => k.cacheKey)
      });
    }
    
    const lowPerformanceCollections = collectionPerformance.filter(c => parseFloat(c.hitRate) < 50);
    if (lowPerformanceCollections.length > 0) {
      recommendations.push({
        type: 'configuration',
        priority: 'medium',
        message: `Collections avec faible performance : ${lowPerformanceCollections.map(c => c.collection).join(', ')}`,
        suggestion: 'Vérifier CACHE_DURATIONS ou implémenter une stratégie de pré-charge'
      });
    }
    
    const totalSize = this.stats.size;
    if (totalSize > this.MAX_CACHE_ITEMS * 0.8) {
      recommendations.push({
        type: 'memory',
        priority: 'medium',
        message: `Cache proche de la limite (${totalSize}/${this.MAX_CACHE_ITEMS}). Considérer l'augmentation de MAX_CACHE_ITEMS.`
      });
    }
    
    return recommendations;
  }

  /**
   * Active ou désactive le mode debug
   * @param {boolean} enabled - Activer le debug
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
  }

  /**
   * Exporte les logs d'accès pour analyse externe
   * @returns {Object} - Logs formatés pour export
   */
  exportAccessLogs() {
    return {
      exportTimestamp: new Date().toISOString(),
      cacheService: 'TourCraft Cache Service',
      version: '1.0',
      accessLogs: this.accessLog || {},
      globalStats: this.getStats()
    };
  }
}

// Exporter une instance unique du service
const cacheService = new CacheService();
export default cacheService;