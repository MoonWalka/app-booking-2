/**
 * Utilitaire de débogage pour tracer le flux des tags et commentaires
 */

// Couleurs pour les logs
const COLORS = {
  start: '#4CAF50',
  data: '#2196F3',
  error: '#F44336',
  warning: '#FF9800',
  success: '#8BC34A',
  info: '#00BCD4'
};

// Helper pour créer des logs stylisés
const logStyled = (label, message, data, color = COLORS.info) => {
  console.log(
    `%c[${label}]%c ${message}`,
    `background: ${color}; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;`,
    'color: inherit;',
    data || ''
  );
};

/**
 * Tracer l'ajout de tags
 */
export const debugTagsUpdate = {
  // 1. Début du flux
  start: (currentTags, newTags) => {
    logStyled('TAGS', '🏁 Début de mise à jour des tags', {
      avant: currentTags,
      après: newTags,
      changement: {
        ajoutés: newTags.filter(t => !currentTags.includes(t)),
        supprimés: currentTags.filter(t => !newTags.includes(t))
      }
    }, COLORS.start);
  },

  // 2. Appel au service
  serviceCall: (contactId, contactType, tags) => {
    logStyled('TAGS', '📤 Appel au service de mise à jour', {
      contactId,
      contactType,
      tags,
      timestamp: new Date().toISOString()
    }, COLORS.data);
  },

  // 3. Réponse du service
  serviceResponse: (result) => {
    if (result.success) {
      logStyled('TAGS', '✅ Mise à jour réussie dans Firebase', result, COLORS.success);
    } else {
      logStyled('TAGS', '❌ Échec de la mise à jour', result, COLORS.error);
    }
  },

  // 4. Listener Firebase déclenché
  firebaseListener: (contactId, data) => {
    logStyled('TAGS', '🔥 Listener Firebase déclenché', {
      contactId,
      tags: data.tags || [],
      timestamp: new Date().toISOString()
    }, COLORS.info);
  },

  // 5. Données dans le hook
  hookData: (contactId, extractedData) => {
    logStyled('TAGS', '🪝 Données dans useUnifiedContact', {
      contactId,
      tags: extractedData?.qualification?.tags || extractedData?.tags || [],
      source: extractedData ? 'Cache/Service' : 'Non trouvé'
    }, COLORS.data);
  },

  // 6. Rendu du composant
  componentRender: (tags) => {
    logStyled('TAGS', '🎨 Rendu du composant ContactTagsSection', {
      tagsCount: tags.length,
      tags: tags
    }, COLORS.info);
  }
};

/**
 * Tracer l'ajout de commentaires
 */
export const debugCommentsUpdate = {
  // 1. Début du flux
  start: (currentComments, newComment) => {
    logStyled('COMMENTS', '🏁 Début d\'ajout de commentaire', {
      existants: currentComments.length,
      nouveau: {
        contenu: newComment.contenu?.substring(0, 50) + '...',
        auteur: newComment.auteur
      }
    }, COLORS.start);
  },

  // 2. Appel au service
  serviceCall: (contactId, contactType, comments) => {
    logStyled('COMMENTS', '📤 Appel au service de mise à jour', {
      contactId,
      contactType,
      totalComments: comments.length,
      timestamp: new Date().toISOString()
    }, COLORS.data);
  },

  // 3. Réponse du service
  serviceResponse: (result) => {
    if (result.success) {
      logStyled('COMMENTS', '✅ Commentaire ajouté dans Firebase', result, COLORS.success);
    } else {
      logStyled('COMMENTS', '❌ Échec de l\'ajout', result, COLORS.error);
    }
  },

  // 4. Listener Firebase déclenché
  firebaseListener: (contactId, data) => {
    logStyled('COMMENTS', '🔥 Listener Firebase déclenché', {
      contactId,
      commentairesCount: (data.commentaires || []).length,
      timestamp: new Date().toISOString()
    }, COLORS.info);
  },

  // 5. Données dans le hook
  hookData: (contactId, extractedData) => {
    logStyled('COMMENTS', '🪝 Données dans useUnifiedContact', {
      contactId,
      commentairesCount: (extractedData?.commentaires || []).length,
      source: extractedData ? 'Cache/Service' : 'Non trouvé'
    }, COLORS.data);
  },

  // 6. Rendu du composant
  componentRender: (commentaires) => {
    logStyled('COMMENTS', '🎨 Rendu du composant ContactCommentsSection', {
      count: commentaires.length,
      dernierCommentaire: commentaires[commentaires.length - 1]
    }, COLORS.info);
  }
};

/**
 * Tracer les problèmes de cache
 */
export const debugCache = {
  // Cache miss
  cacheMiss: (contactId, source) => {
    logStyled('CACHE', '⚠️ Cache miss - chargement direct', {
      contactId,
      source,
      timestamp: new Date().toISOString()
    }, COLORS.warning);
  },

  // Cache hit
  cacheHit: (contactId, data) => {
    logStyled('CACHE', '✅ Cache hit', {
      contactId,
      hasData: !!data,
      tags: data?.tags?.length || 0,
      commentaires: data?.commentaires?.length || 0
    }, COLORS.success);
  },

  // Cache update
  cacheUpdate: (contactId, oldData, newData) => {
    logStyled('CACHE', '🔄 Mise à jour du cache', {
      contactId,
      changes: {
        tags: {
          avant: oldData?.tags?.length || 0,
          après: newData?.tags?.length || 0
        },
        commentaires: {
          avant: oldData?.commentaires?.length || 0,
          après: newData?.commentaires?.length || 0
        }
      }
    }, COLORS.info);
  }
};

/**
 * Analyser la structure des données
 */
export const analyzeDataStructure = (contact) => {
  console.group('%c📊 Analyse de la structure des données', 'color: #9C27B0; font-weight: bold;');
  
  console.log('ID:', contact?.id);
  console.log('Entity Type:', contact?.entityType);
  
  console.group('Tags locations:');
  console.log('contact.tags:', contact?.tags);
  console.log('contact.qualification.tags:', contact?.qualification?.tags);
  console.log('contact.structure.tags:', contact?.structure?.tags);
  console.groupEnd();
  
  console.group('Comments locations:');
  console.log('contact.commentaires:', contact?.commentaires);
  console.log('contact.structure.commentaires:', contact?.structure?.commentaires);
  console.groupEnd();
  
  console.groupEnd();
};

/**
 * Wrapper pour tracer automatiquement les mises à jour
 */
export const withDebugTracing = (fn, type = 'tags') => {
  return async (...args) => {
    const debug = type === 'tags' ? debugTagsUpdate : debugCommentsUpdate;
    
    try {
      debug.start(...args);
      const result = await fn(...args);
      debug.serviceResponse({ success: true, result });
      return result;
    } catch (error) {
      debug.serviceResponse({ success: false, error: error.message });
      throw error;
    }
  };
};

// Export par défaut pour usage facile
const debugUtils = {
  tags: debugTagsUpdate,
  comments: debugCommentsUpdate,
  cache: debugCache,
  analyze: analyzeDataStructure,
  withTracing: withDebugTracing
};

export default debugUtils;