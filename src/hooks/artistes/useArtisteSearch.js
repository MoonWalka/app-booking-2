// src/hooks/artistes/useArtisteSearch.js
import { useNavigate } from 'react-router-dom';
import { useSearchAndFilter } from '@/hooks/search';

/**
 * Hook spécifique pour la recherche et le filtrage des artistes
 * @param {Array} artistes - Liste des artistes à filtrer
 * @returns {Object} - États et fonctions pour gérer la recherche et le filtrage des artistes
 */
const useArtisteSearch = (artistes = []) => {
  const navigate = useNavigate();
  
  // Définir les filtres spécifiques aux artistes
  const artisteFilters = {
    tous: () => true,
    avecConcerts: (artiste) => artiste.concertsAssocies?.length > 0,
    sansConcerts: (artiste) => !artiste.concertsAssocies || artiste.concertsAssocies.length === 0,
    actifs: (artiste) => artiste.statut === 'actif',
    inactifs: (artiste) => artiste.statut === 'inactif'
  };
  
  // Utiliser le hook générique
  const searchAndFilter = useSearchAndFilter({
    items: artistes,
    searchFields: ['nom', 'style', 'email', 'telephone'],
    filters: artisteFilters,
    defaultFilter: 'tous',
    defaultSortField: 'nom',
    defaultSortDirection: 'asc',
    onCreateItem: (searchTerm) => {
      // Navigation vers le formulaire de création d'artiste avec le nom pré-rempli
      navigate(`/artistes/nouveau?nom=${encodeURIComponent(searchTerm)}`);
    }
  });
  
  // Ajouter des statistiques spécifiques aux artistes
  const artistesStats = {
    total: artistes.length,
    avecConcerts: artistes.filter(artisteFilters.avecConcerts).length,
    sansConcerts: artistes.filter(artisteFilters.sansConcerts).length,
    actifs: artistes.filter(artisteFilters.actifs).length,
    inactifs: artistes.filter(artisteFilters.inactifs).length
  };
  
  return {
    ...searchAndFilter,
    artistesStats
  };
};

export default useArtisteSearch;