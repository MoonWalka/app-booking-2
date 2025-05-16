// src/hooks/programmateurs/useLieuSearch.js
// ATTENTION: Ce fichier contenait auparavant une implémentation de recherche de concerts,
// malgré son nom qui suggère une recherche de lieux.
// Il a été remplacé par un re-export vers la version correcte de useLieuSearch.
// Si vous cherchez l'ancienne fonctionnalité de recherche de concerts pour les programmateurs,
// consultez ou créez le fichier useConcertSearch.js.

// Re-export the lieux implementation for backward compatibility
import useLieuSearch from '../lieux/useLieuSearch';
export default useLieuSearch;
