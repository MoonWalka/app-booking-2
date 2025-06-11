/**
 * Fix temporaire pour la recherche d'artistes
 * 
 * Ce fichier patche temporairement le hook useEntitySearch pour
 * désactiver le filtre organizationId uniquement pour les artistes
 */

// Fonction pour patcher le hook
export function patchEntitySearchForArtistes() {
  // Sauvegarder la configuration originale
  window._originalEntitySearchConfig = window._originalEntitySearchConfig || {};
  
  // Flag pour activer/désactiver le patch
  window._artisteSearchPatchEnabled = true;
  
  console.log('🔧 Patch de recherche d\'artistes activé');
  console.log('Pour désactiver: window._artisteSearchPatchEnabled = false');
}

// Fonction pour vérifier si le patch est actif
export function isArtistSearchPatchEnabled() {
  return window._artisteSearchPatchEnabled === true;
}

// Message d'information
export function showPatchInfo() {
  console.log(`
🎭 Patch de recherche d'artistes
================================
Statut: ${isArtistSearchPatchEnabled() ? 'ACTIVÉ' : 'DÉSACTIVÉ'}

Ce patch permet de trouver TOUS les artistes, même sans organizationId.

Commandes disponibles:
- Activer:  window._artisteSearchPatchEnabled = true
- Désactiver: window._artisteSearchPatchEnabled = false
- Statut: window._artisteSearchPatchEnabled

Note: Ce patch est temporaire. Pour une solution permanente,
utilisez l'outil de debug pour corriger les organizationId.
  `);
}