// src/hooks/concerts/useEntitySearch.js
/**
 * ATTENTION: Ce fichier a été remplacé par un re-export vers la version commune
 * dans le cadre de la consolidation des hooks utilitaires.
 * 
 * L'ancienne implémentation était spécifique aux concerts et gérait séparément:
 * - Les recherches de lieux
 * - Les recherches de programmateurs
 * - Les recherches d'artistes
 * 
 * Pour recréer cette fonctionnalité spécifique avec le hook générique:
 * 
 * ```
 * // Au lieu de:
 * const {
 *   lieuSearchTerm, setLieuSearchTerm,
 *   progSearchTerm, setProgSearchTerm,
 *   artisteSearchTerm, setArtisteSearchTerm,
 *   // ...autres états et fonctions spécifiques
 * } = useEntitySearch();
 * 
 * // Utilisez maintenant:
 * const lieuSearch = useEntitySearch({
 *   entityType: 'lieux',
 *   searchField: 'nom',
 *   onSelect: (selectedLieu) => {
 *     // Votre logique de sélection
 *   }
 * });
 * 
 * const programmateursSearch = useEntitySearch({
 *   entityType: 'programmateurs',
 *   searchField: 'nom',
 *   onSelect: (selectedProgrammateur) => {
 *     // Votre logique de sélection
 *   }
 * });
 * 
 * const artistesSearch = useEntitySearch({
 *   entityType: 'artistes',
 *   searchField: 'nom',
 *   onSelect: (selectedArtiste) => {
 *     // Votre logique de sélection
 *   }
 * });
 * 
 * // Puis utilisez les états et fonctions spécifiques à chaque recherche:
 * lieuSearch.searchTerm, lieuSearch.setSearchTerm, lieuSearch.results, etc.
 * ```
 */

// Re-export the common implementation
import useEntitySearch from '../common/useEntitySearch';
export default useEntitySearch;
