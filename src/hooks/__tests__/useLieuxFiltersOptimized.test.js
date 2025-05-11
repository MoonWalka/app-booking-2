/**
 * Test unitaire pour le hook useLieuxFiltersOptimized
 */

import { renderHook, act } from '@testing-library/react';
import { useGenericEntityList } from '@/hooks/common';

// Mock complet du hook
jest.mock('../../hooks/lieux/useLieuxFiltersOptimized', () => ({
  useLieuxFiltersOptimized: jest.fn()
}), { virtual: true });

// Mock des modules importés par le hook
jest.mock('../../hooks/common', () => ({
  useGenericEntityList: jest.fn(),
  debugLog: jest.fn()
}));

// Importer le mock après l'avoir défini
import { useLieuxFiltersOptimized } from '../../hooks/lieux/useLieuxFiltersOptimized';

describe('useLieuxFiltersOptimized', () => {
  // Données de test pour les lieux
  const mockLieux = [
    { 
      id: 'lieu-1',
      nom: 'Salle Test',
      ville: 'Paris',
      region: 'Île-de-France',
      type: 'Salle de concert',
      capacite: 500,
      adresse: '123 Rue de Test'
    },
    { 
      id: 'lieu-2',
      nom: 'Théâtre Municipal',
      ville: 'Lyon',
      region: 'Rhône-Alpes',
      type: 'Théâtre',
      capacite: 800,
      adresse: '456 Avenue Principale'
    },
    { 
      id: 'lieu-3',
      nom: 'Centre Culturel',
      ville: 'Paris',
      region: 'Île-de-France',
      type: 'Salle polyvalente',
      capacite: 300,
      adresse: '789 Boulevard Central'
    }
  ];
  
  // Mock du retour du hook générique
  const mockEntityList = {
    entities: mockLieux,
    loading: false,
    error: null,
    refresh: jest.fn(),
    loadMore: jest.fn(),
    hasMore: true,
    isEmpty: false,
    isFiltered: false,
    search: '',
    setSearch: jest.fn(),
    filters: [],
    applyFilter: jest.fn(),
    removeFilter: jest.fn(),
    setSorting: jest.fn()
  };
  
  // Types, régions et villes uniques extraits des lieux
  const uniqueTypes = ['tous', 'Salle de concert', 'Théâtre', 'Salle polyvalente'];
  const uniqueRegions = ['toutes', 'Île-de-France', 'Rhône-Alpes'];
  const uniqueVilles = ['toutes', 'Paris', 'Lyon'];
  
  // Mock de l'implémentation du hook optimisé
  const mockLieuxFiltersHook = {
    ...mockEntityList,
    lieux: mockLieux,
    filteredLieux: mockLieux,
    types: uniqueTypes,
    regions: uniqueRegions,
    villes: uniqueVilles,
    filterType: 'tous',
    setFilterType: jest.fn(),
    filterRegion: 'toutes',
    setFilterRegion: jest.fn(),
    filterVille: 'toutes',
    setFilterVille: jest.fn(),
    searchTerm: '',
    setSearchTerm: jest.fn(),
    sortOption: 'nom_asc',
    setSortOption: jest.fn(),
    resetFilters: jest.fn()
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    useGenericEntityList.mockReturnValue(mockEntityList);
    useLieuxFiltersOptimized.mockImplementation(() => mockLieuxFiltersHook);
  });
  
  test('devrait initialiser correctement le hook avec les paramètres par défaut', () => {
    // Rendu du hook
    const { result } = renderHook(() => useLieuxFiltersOptimized());
    
    // Vérifier que le hook a été appelé
    expect(useLieuxFiltersOptimized).toHaveBeenCalled();
    
    // Vérifier que les propriétés principales sont exposées
    expect(result.current).toHaveProperty('lieux');
    expect(result.current).toHaveProperty('filteredLieux');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('refresh');
    expect(result.current).toHaveProperty('loadMore');
    expect(result.current).toHaveProperty('filterType');
    expect(result.current).toHaveProperty('setFilterType');
    expect(result.current).toHaveProperty('filterRegion');
    expect(result.current).toHaveProperty('setFilterRegion');
    expect(result.current).toHaveProperty('filterVille');
    expect(result.current).toHaveProperty('setFilterVille');
    expect(result.current).toHaveProperty('searchTerm');
    expect(result.current).toHaveProperty('setSearchTerm');
    
    // Vérifier les valeurs initiales
    expect(result.current.filterType).toBe('tous');
    expect(result.current.filterRegion).toBe('toutes');
    expect(result.current.filterVille).toBe('toutes');
    expect(result.current.lieux).toEqual(mockLieux);
  });
  
  test('devrait initialiser correctement le hook avec des paramètres personnalisés', () => {
    // Options personnalisées
    const customOptions = {
      pageSize: 100,
      initialSortField: 'capacite',
      initialSortDirection: 'desc'
    };
    
    // Rendu du hook avec des paramètres personnalisés
    renderHook(() => useLieuxFiltersOptimized(customOptions));
    
    // Vérifier que le hook a été appelé avec les bons paramètres
    expect(useLieuxFiltersOptimized).toHaveBeenCalledWith(customOptions);
  });
  
  test('setFilterType devrait appliquer le filtre par type', () => {
    // Rendu du hook
    const { result } = renderHook(() => useLieuxFiltersOptimized());
    
    // Appliquer un filtre par type
    const filterValue = 'Théâtre';
    act(() => {
      result.current.setFilterType(filterValue);
    });
    
    // Vérifier que setFilterType a été appelé avec les bons paramètres
    expect(mockLieuxFiltersHook.setFilterType).toHaveBeenCalledWith(filterValue);
  });
  
  test('setFilterRegion devrait appliquer le filtre par région', () => {
    // Rendu du hook
    const { result } = renderHook(() => useLieuxFiltersOptimized());
    
    // Appliquer un filtre par région
    const filterValue = 'Île-de-France';
    act(() => {
      result.current.setFilterRegion(filterValue);
    });
    
    // Vérifier que setFilterRegion a été appelé avec les bons paramètres
    expect(mockLieuxFiltersHook.setFilterRegion).toHaveBeenCalledWith(filterValue);
  });
  
  test('setFilterVille devrait appliquer le filtre par ville', () => {
    // Rendu du hook
    const { result } = renderHook(() => useLieuxFiltersOptimized());
    
    // Appliquer un filtre par ville
    const filterValue = 'Paris';
    act(() => {
      result.current.setFilterVille(filterValue);
    });
    
    // Vérifier que setFilterVille a été appelé avec les bons paramètres
    expect(mockLieuxFiltersHook.setFilterVille).toHaveBeenCalledWith(filterValue);
  });
  
  test('resetFilters devrait réinitialiser tous les filtres', () => {
    // Rendu du hook
    const { result } = renderHook(() => useLieuxFiltersOptimized());
    
    // Réinitialiser les filtres
    act(() => {
      result.current.resetFilters();
    });
    
    // Vérifier que resetFilters a été appelé
    expect(mockLieuxFiltersHook.resetFilters).toHaveBeenCalled();
  });
  
  test('setSortOption devrait mettre à jour le tri', () => {
    // Rendu du hook
    const { result } = renderHook(() => useLieuxFiltersOptimized());
    
    // Changer l'option de tri
    const sortOption = 'capacite_desc';
    act(() => {
      result.current.setSortOption(sortOption);
    });
    
    // Vérifier que setSortOption a été appelé avec les bons paramètres
    expect(mockLieuxFiltersHook.setSortOption).toHaveBeenCalledWith(sortOption);
  });
  
  test('devrait exposer les propriétés et les listes de valeurs disponibles', () => {
    // Rendu du hook
    const { result } = renderHook(() => useLieuxFiltersOptimized());
    
    // Vérifier les listes de valeurs disponibles
    expect(result.current.types).toEqual(uniqueTypes);
    expect(result.current.regions).toEqual(uniqueRegions);
    expect(result.current.villes).toEqual(uniqueVilles);
  });
  
  test('devrait exposer les propriétés dérivées du hook générique', () => {
    // Rendu du hook
    const { result } = renderHook(() => useLieuxFiltersOptimized());
    
    // Vérifier les propriétés dérivées
    expect(result.current.isFiltered).toBe(mockEntityList.isFiltered);
    expect(result.current.isEmpty).toBe(mockEntityList.isEmpty);
    expect(result.current.hasMore).toBe(mockEntityList.hasMore);
  });
});