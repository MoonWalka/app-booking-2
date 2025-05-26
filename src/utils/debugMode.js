// Utilitaire pour activer le mode debug détaillé
export const enableDetailedDebug = () => {
  // Activer tous les niveaux de log
  localStorage.setItem('debug_level', 'debug');
  localStorage.setItem('debug_enabled', 'true');
  localStorage.setItem('debug_detailed_entity_flow', 'true');
  
  console.log('🔧 Mode debug détaillé activé');
  console.log('📊 Niveaux de log: debug, info, warn, error');
  console.log('🎯 Focus: flux d\'entité useGenericEntityDetails');
  
  // Recharger la page pour appliquer les paramètres
  window.location.reload();
};

export const disableDetailedDebug = () => {
  localStorage.removeItem('debug_level');
  localStorage.removeItem('debug_enabled');
  localStorage.removeItem('debug_detailed_entity_flow');
  
  console.log('🔧 Mode debug détaillé désactivé');
  window.location.reload();
};

// Fonction à appeler depuis la console pour activer le debug
window.enableDetailedDebug = enableDetailedDebug;
window.disableDetailedDebug = disableDetailedDebug;

// Auto-activation si paramètre URL présent
if (window.location.search.includes('debug=detailed')) {
  enableDetailedDebug();
} 