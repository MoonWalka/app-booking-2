// src/hooks/artistes/useSearchAndFilter.js
/**
 * ATTENTION: Ce fichier a été remplacé par un re-export vers la version commune
 * dans le cadre de la consolidation des hooks utilitaires.
 * 
 * L'ancienne implémentation était spécifique aux artistes.
 * Pour obtenir le même comportement avec le hook générique, utilisez:
 * 
 * ```javascript
 * // Au lieu de:
 * const {
 *   searchTerm, filteredArtistes, handleSearchChange, 
 *   filter, setFilter, 
 *   sortBy, sortDirection, handleSortChange,
 *   // ...
 * } = useSearchAndFilter(artistes);
 * 
 * // Utilisez maintenant:
 * const {
 *   searchTerm, filteredItems, handleSearchChange,
 *   filter, setFilter,
 *   sortBy, sortDirection, handleSortChange,
 *   // ...
 * } = useSearchAndFilter({
 *   items: artistes,
 *   searchFields: ['nom'],
 *   filters: {
 *     tous: () => true,
 *     avecDates: (artiste) => artiste.datesAssociees?.length > 0,
 *     sansDates: (artiste) => !artiste.datesAssociees || artiste.datesAssociees.length === 0
 *   },
 *   defaultFilter: 'tous',
 *   defaultSortField: 'nom',
 *   onCreateItem: (searchTerm) => navigate(`/artistes/nouveau?nom=${encodeURIComponent(searchTerm)}`)
 * });
 * ```
 * 
 * Note: Utilisez `filteredItems` au lieu de `filteredArtistes` avec la nouvelle version.
 */

import { useNavigate } from 'react-router-dom';
import useSearchAndFilterBase from '../common/useSearchAndFilter';

// Wrapper pour maintenir la compatibilité avec l'API existante
const useSearchAndFilter = (artistes) => {
  const navigate = useNavigate();
  
  return useSearchAndFilterBase({
    items: artistes || [],
    searchFields: ['nom'],
    filters: {
      tous: () => true,
      avecDates: (artiste) => artiste.datesAssociees?.length > 0,
      sansDates: (artiste) => !artiste.datesAssociees || artiste.datesAssociees.length === 0
    },
    defaultFilter: 'tous',
    defaultSortField: 'nom',
    onCreateItem: (searchTerm) => navigate(`/artistes/nouveau?nom=${encodeURIComponent(searchTerm)}`)
  });
};

export default useSearchAndFilter;