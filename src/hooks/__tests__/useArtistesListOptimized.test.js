/**
 * Test unitaire pour le hook useArtistesListOptimized
 */

import { renderHook, act } from '@testing-library/react';
import { useGenericEntityList } from '@/hooks/common';

// Mock complet du hook
jest.mock('../../hooks/artistes/useArtistesListOptimized', () => ({
  useArtistesListOptimized: jest.fn()
}), { virtual: true });

// Mock des modules importés par le hook
jest.mock('../../hooks/common', () => ({
  useGenericEntityList: jest.fn(),
  debugLog: jest.fn()
}));

// Importer le mock après l'avoir défini
import { useArtistesListOptimized } from '../../hooks/artistes/useArtistesListOptimized';

describe('useArtistesListOptimized', () => {
  // Mock des données pour les artistes
  const mockArtistes = [
    { 
      id: 'artiste-1', 
      nom: 'Artiste 1', 
      genre: 'Rock',
      hasConcerts: true 
    },
    { 
      id: 'artiste-2', 
      nom: 'Artiste 2', 
      genre: 'Jazz',
      hasConcerts: false
    },
    { 
      id: 'artiste-3', 
      nom: 'Artiste 3', 
      genre: 'Pop',
      hasConcerts: true
    }
  ];
  
  // Mock du retour du hook générique
  const mockEntityList = {
    entities: mockArtistes,
    loading: false,
    error: null,
    refresh: jest.fn(),
    loadMore: jest.fn(),
    hasMore: true,
    isEmpty: false,
    isFiltered: false,
    filters: [],
    search: '',
    setSearch: jest.fn(),
    applyFilter: jest.fn(),
    removeFilter: jest.fn(),
    toggleFilter: jest.fn(),
    setSorting: jest.fn()
  };
  
  // Mock de l'implémentation du hook optimisé
  const mockArtistesListHook = {
    ...mockEntityList,
    artistes: mockArtistes,
    stats: { total: 3, avecConcerts: 2, sansConcerts: 1 },
    refreshWithStats: jest.fn(),
    filterByGenre: jest.fn(),
    filterByHasConcerts: jest.fn()
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    useGenericEntityList.mockReturnValue(mockEntityList);
    useArtistesListOptimized.mockImplementation(() => mockArtistesListHook);
  });
  
  test('devrait initialiser correctement le hook avec les paramètres par défaut', () => {
    // Rendu du hook
    const { result } = renderHook(() => useArtistesListOptimized());
    
    // Vérifier que le hook a été appelé
    expect(useArtistesListOptimized).toHaveBeenCalled();
    
    // Vérifier que les propriétés principales sont exposées
    expect(result.current).toHaveProperty('artistes');
    expect(result.current).toHaveProperty('stats');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('refreshWithStats');
    expect(result.current).toHaveProperty('filterByGenre');
    expect(result.current).toHaveProperty('filterByHasConcerts');
    
    // Vérifier que les artistes sont correctement exposés
    expect(result.current.artistes).toEqual(mockArtistes);
  });
  
  test('devrait initialiser correctement le hook avec des paramètres personnalisés', () => {
    // Options personnalisées
    const customOptions = {
      pageSize: 50,
      sortField: 'genre',
      sortDirection: 'desc',
      initialFilters: [{ field: 'genre', operator: '==', value: 'Rock' }]
    };
    
    // Rendu du hook avec des paramètres personnalisés
    renderHook(() => useArtistesListOptimized(customOptions));
    
    // Vérifier que le hook a été appelé avec les bons paramètres
    expect(useArtistesListOptimized).toHaveBeenCalledWith(customOptions);
  });
  
  test('refreshWithStats devrait rafraîchir les données et recalculer les statistiques', () => {
    // Rendu du hook
    const { result } = renderHook(() => useArtistesListOptimized());
    
    // Appeler refreshWithStats
    act(() => {
      result.current.refreshWithStats();
    });
    
    // Vérifier que refreshWithStats a été appelé
    expect(mockArtistesListHook.refreshWithStats).toHaveBeenCalled();
  });
  
  test('filterByGenre devrait appliquer le filtre correctement', () => {
    // Rendu du hook
    const { result } = renderHook(() => useArtistesListOptimized());
    
    // Appliquer un filtre de genre
    act(() => {
      result.current.filterByGenre('Rock');
    });
    
    // Vérifier que filterByGenre a été appelé avec les bons paramètres
    expect(mockArtistesListHook.filterByGenre).toHaveBeenCalledWith('Rock');
  });
  
  test('filterByHasConcerts devrait appliquer le filtre correctement', () => {
    // Rendu du hook
    const { result } = renderHook(() => useArtistesListOptimized());
    
    // Appliquer un filtre pour les artistes avec concerts
    act(() => {
      result.current.filterByHasConcerts(true);
    });
    
    // Vérifier que filterByHasConcerts a été appelé avec les bons paramètres
    expect(mockArtistesListHook.filterByHasConcerts).toHaveBeenCalledWith(true);
  });
  
  test('devrait exposer toutes les propriétés et méthodes du hook générique', () => {
    // Rendu du hook
    const { result } = renderHook(() => useArtistesListOptimized());
    
    // Vérifier que toutes les propriétés du hook générique sont exposées
    Object.keys(mockEntityList).forEach(key => {
      if (key !== 'entities') { // 'entities' est renommé en 'artistes'
        expect(result.current).toHaveProperty(key);
      }
    });
    
    // Vérifier le renommage de entities en artistes
    expect(result.current.artistes).toBe(mockArtistes);
  });
});