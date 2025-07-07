import { 
  db, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  getDocs, 
  addDoc 
} from './firebase-service';
import { searchFieldsMapping } from '../config/searchFieldsMapping';

/**
 * Service principal pour la recherche multi-critères
 * Gère la construction et l'exécution des requêtes Firestore
 */
class SearchService {
  constructor() {
    this.pageSize = 50;
    this.operators = {
      contient: this.handleContains,
      egal: this.handleEquals,
      entre: this.handleBetween,
      parmi: this.handleIn,
      commence: this.handleStartsWith,
      termine: this.handleEndsWith,
      non_renseigne: this.handleEmpty,
      different: this.handleNotEquals,
      superieur: this.handleGreaterThan,
      inferieur: this.handleLessThan
    };
  }

  /**
   * Exécute une recherche multi-critères
   * @param {Object} params - Paramètres de recherche
   * @param {string} params.organizationId - ID de l'organisation
   * @param {Array} params.criteria - Liste des critères de recherche
   * @param {string} params.collection - Collection cible (contacts, lieux, dates, structures)
   * @param {Object} params.pagination - Infos de pagination
   * @returns {Promise<Object>} Résultats avec données et infos de pagination
   */
  async executeSearch({ organizationId, criteria = [], collection: collectionName = 'contacts', pagination = {} }) {
    try {
      // Validation des paramètres
      if (!organizationId) {
        throw new Error('organizationId requis pour la recherche');
      }

      // Construction de la requête de base
      let q = query(
        collection(db, collectionName),
        where('organizationId', '==', organizationId)
      );

      // Application des critères de recherche
      const processedCriteria = this.processCriteria(criteria, collectionName);
      
      // Firestore limite à 10 clauses where, donc on groupe les critères
      const firestoreCriteria = processedCriteria.filter(c => c.type === 'firestore');
      const localCriteria = processedCriteria.filter(c => c.type === 'local');

      // Application des critères Firestore (max 9 car on a déjà organizationId)
      firestoreCriteria.slice(0, 9).forEach(criterion => {
        q = this.applyFirestoreCriterion(q, criterion);
      });

      // Tri et pagination
      q = this.applyOrdering(q, pagination.orderBy || 'updatedAt', pagination.orderDirection || 'desc');
      q = this.applyPagination(q, pagination);

      // Exécution de la requête
      const snapshot = await getDocs(q);
      let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Application des filtres locaux (pour les critères non supportés par Firestore)
      results = this.applyLocalFilters(results, localCriteria);
      results = this.applyLocalFilters(results, firestoreCriteria.slice(9)); // Critères au-delà de la limite

      // Calcul des infos de pagination
      const hasMore = results.length === this.pageSize;
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];

      return {
        data: results,
        pagination: {
          hasMore,
          lastDoc,
          total: results.length
        },
        appliedCriteria: criteria,
        warnings: this.generateWarnings(criteria, processedCriteria)
      };

    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      throw new Error(`Erreur de recherche: ${error.message}`);
    }
  }

  /**
   * Traite les critères pour déterminer s'ils peuvent être appliqués côté Firestore ou localement
   */
  processCriteria(criteria, collectionName) {
    return criteria.map(criterion => {
      const fieldMapping = searchFieldsMapping[collectionName]?.[criterion.field];
      
      if (!fieldMapping) {
        return { ...criterion, type: 'unknown', valid: false };
      }

      const canUseFirestore = this.canUseFirestoreOperator(criterion.operator, fieldMapping.type);
      
      return {
        ...criterion,
        fieldPath: fieldMapping.path || criterion.field,
        fieldType: fieldMapping.type,
        type: canUseFirestore ? 'firestore' : 'local',
        valid: true
      };
    });
  }

  /**
   * Détermine si un opérateur peut être utilisé avec Firestore
   */
  canUseFirestoreOperator(operator, fieldType) {
    const firestoreOperators = {
      egal: true,
      different: true,
      superieur: true,
      inferieur: true,
      entre: true,
      parmi: true,
      non_renseigne: true
    };

    // Les opérateurs de texte nécessitent un traitement local
    if (fieldType === 'string' && ['contient', 'commence', 'termine'].includes(operator)) {
      return false;
    }

    return firestoreOperators[operator] || false;
  }

  /**
   * Applique un critère Firestore à la requête
   */
  applyFirestoreCriterion(q, criterion) {
    const { fieldPath, operator, value } = criterion;

    switch (operator) {
      case 'egal':
        return query(q, where(fieldPath, '==', value));
      
      case 'different':
        return query(q, where(fieldPath, '!=', value));
      
      case 'superieur':
        return query(q, where(fieldPath, '>', value));
      
      case 'inferieur':
        return query(q, where(fieldPath, '<', value));
      
      case 'entre':
        if (value.min !== undefined && value.max !== undefined) {
          return query(q, where(fieldPath, '>=', value.min), where(fieldPath, '<=', value.max));
        }
        return q;
      
      case 'parmi':
        if (Array.isArray(value) && value.length > 0) {
          return query(q, where(fieldPath, 'in', value.slice(0, 10))); // Limite Firestore
        }
        return q;
      
      case 'non_renseigne':
        return query(q, where(fieldPath, '==', null));
      
      default:
        return q;
    }
  }

  /**
   * Applique les filtres locaux sur les résultats
   */
  applyLocalFilters(results, criteria) {
    return results.filter(item => {
      return criteria.every(criterion => {
        const value = this.getNestedValue(item, criterion.fieldPath);
        return this.evaluateLocalCriterion(value, criterion);
      });
    });
  }

  /**
   * Évalue un critère localement
   */
  evaluateLocalCriterion(value, criterion) {
    const { operator, value: criterionValue } = criterion;
    const handler = this.operators[operator];
    
    if (!handler) {
      console.warn(`Opérateur non supporté: ${operator}`);
      return true;
    }

    return handler.call(this, value, criterionValue);
  }

  // Handlers pour les opérateurs
  handleContains(value, search) {
    if (!value || !search) return false;
    return String(value).toLowerCase().includes(String(search).toLowerCase());
  }

  handleEquals(value, target) {
    return value === target;
  }

  handleBetween(value, range) {
    if (!range.min || !range.max) return true;
    return value >= range.min && value <= range.max;
  }

  handleIn(value, options) {
    if (!Array.isArray(options)) return false;
    return options.includes(value);
  }

  handleStartsWith(value, prefix) {
    if (!value || !prefix) return false;
    return String(value).toLowerCase().startsWith(String(prefix).toLowerCase());
  }

  handleEndsWith(value, suffix) {
    if (!value || !suffix) return false;
    return String(value).toLowerCase().endsWith(String(suffix).toLowerCase());
  }

  handleEmpty(value) {
    return value === null || value === undefined || value === '';
  }

  handleNotEquals(value, target) {
    return value !== target;
  }

  handleGreaterThan(value, target) {
    return value > target;
  }

  handleLessThan(value, target) {
    return value < target;
  }

  /**
   * Récupère une valeur imbriquée dans un objet
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((curr, prop) => curr?.[prop], obj);
  }

  /**
   * Applique le tri à la requête
   */
  applyOrdering(q, orderByField, direction = 'desc') {
    return query(q, orderBy(orderByField, direction));
  }

  /**
   * Applique la pagination à la requête
   */
  applyPagination(q, pagination) {
    q = query(q, limit(this.pageSize));
    
    if (pagination.lastDoc) {
      q = query(q, startAfter(pagination.lastDoc));
    }
    
    return q;
  }

  /**
   * Génère des avertissements pour l'utilisateur
   */
  generateWarnings(originalCriteria, processedCriteria) {
    const warnings = [];
    
    // Critères invalides
    const invalidCriteria = processedCriteria.filter(c => !c.valid);
    if (invalidCriteria.length > 0) {
      warnings.push({
        type: 'invalid_criteria',
        message: `${invalidCriteria.length} critère(s) ignoré(s) car non reconnu(s)`,
        fields: invalidCriteria.map(c => c.field)
      });
    }

    // Limite Firestore dépassée
    const firestoreCriteria = processedCriteria.filter(c => c.type === 'firestore');
    if (firestoreCriteria.length > 9) {
      warnings.push({
        type: 'firestore_limit',
        message: `Seuls les 9 premiers critères Firestore ont été appliqués (limite: 10 avec organizationId)`,
        count: firestoreCriteria.length
      });
    }

    return warnings;
  }

  /**
   * Recherche avec agrégation de plusieurs collections
   */
  async searchAcrossCollections({ organizationId, criteria, collections = ['contacts', 'lieux', 'dates', 'structures'] }) {
    const results = {};
    const errors = {};

    await Promise.all(
      collections.map(async (collectionName) => {
        try {
          const searchResults = await this.executeSearch({
            organizationId,
            criteria,
            collection: collectionName
          });
          results[collectionName] = searchResults;
        } catch (error) {
          errors[collectionName] = error.message;
        }
      })
    );

    return { results, errors };
  }

  /**
   * Sauvegarde une recherche
   */
  async saveSearch({ organizationId, userId, name, criteria, description }) {
    const searchData = {
      organizationId,
      userId,
      name,
      criteria,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
      type: 'saved_search'
    };

    const docRef = await addDoc(collection(db, 'selections'), searchData);
    return { id: docRef.id, ...searchData };
  }

  /**
   * Charge les recherches sauvegardées
   */
  async loadSavedSearches({ organizationId, userId }) {
    const q = query(
      collection(db, 'selections'),
      where('organizationId', '==', organizationId),
      where('userId', '==', userId),
      where('type', '==', 'saved_search'),
      orderBy('updatedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

// Export d'une instance unique
export const searchService = new SearchService();

// Export de la classe pour les tests
export default SearchService;