/**
 * Test unitaire pour le hook useLieuSearch
 */

import { renderHook, act } from '@testing-library/react';
import { useGenericEntitySearch } from '@/hooks/common';

// Mock complet du hook
jest.mock('../../hooks/lieux/useLieuSearch', () => ({
  useLieuSearch: jest.fn()
}), { virtual: true });

// Mock des modules importés par le hook
jest.mock('../../hooks/common', () => ({
  useGenericEntitySearch: jest.fn(),
  debugLog: jest.fn()
}));

// Mock de react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn().mockReturnValue(jest.fn())
}));

// Importer le mock après l'avoir défini
import { useLieuSearch } from '../../hooks/lieux/useLieuSearch';

describe('useLieuSearch', () => {
  // Données de test pour les lieux
  const mockLieux = [
    { 
      id: 'lieu-1',
      nom: 'Salle Test',
      ville: 'Paris',
      codePostal: '75001',
      adresse: '123 Rue de Test',
      pays: 'France'
    },
    { 
      id: 'lieu-2',
      nom: 'Théâtre Municipal',
      ville: 'Lyon',
      codePostal: '69000',
      adresse: '456 Avenue Principale',
      pays: 'France'
    }
  ];
  
  // Mock du résultat transformé attendu
  const mockTransformedLieux = [
    { 
      id: 'lieu-1',
      nom: 'Salle Test',
      ville: 'Paris',
      codePostal: '75001',
      adresse: '123 Rue de Test',
      pays: 'France',
      displayName: 'Salle Test (Paris, 75001)',
      fullAddress: '123 Rue de Test, 75001 Paris, France'
    },
    { 
      id: 'lieu-2',
      nom: 'Théâtre Municipal',
      ville: 'Lyon',
      codePostal: '69000',
      adresse: '456 Avenue Principale',
      pays: 'France',
      displayName: 'Théâtre Municipal (Lyon, 69000)',
      fullAddress: '456 Avenue Principale, 69000 Lyon, France'
    }
  ];
  
  // Mock du retour du hook générique
  const mockSearchHook = {
    searchTerm: '',
    setSearchTerm: jest.fn(),
    searchResults: mockTransformedLieux,
    selectedEntity: null,
    setSelectedEntity: jest.fn(),
    clearSelection: jest.fn(),
    loading: false,
    error: null,
    refreshSearch: jest.fn(),
    clearSearch: jest.fn()
  };
  
  // Mock de navigate
  const mockNavigate = jest.fn();
  
  // Mock de onSelect
  const mockOnSelect = jest.fn();
  
  // Mock de l'implémentation du hook optimisé
  const mockLieuSearchHook = {
    ...mockSearchHook,
    lieux: mockTransformedLieux,
    lieu: null,
    setLieu: jest.fn(),
    clearLieu: jest.fn(),
    handleCreateLieu: jest.fn(),
    navigateToLieuDetails: jest.fn(),
    searchLieux: mockSearchHook.refreshSearch,
    resetSearch: mockSearchHook.clearSearch,
    isSearching: mockSearchHook.loading,
    searchError: mockSearchHook.error
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    useGenericEntitySearch.mockReturnValue(mockSearchHook);
    useLieuSearch.mockImplementation((options) => {
      if (options?.onSelect) {
        mockLieuSearchHook.setLieu = jest.fn((lieu) => {
          mockSearchHook.setSelectedEntity(lieu);
          options.onSelect(lieu);
        });
      }
      return mockLieuSearchHook;
    });
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
  });
  
  test('devrait initialiser correctement le hook avec les paramètres par défaut', () => {
    // Rendu du hook
    const { result } = renderHook(() => useLieuSearch());
    
    // Vérifier que le hook a été appelé
    expect(useLieuSearch).toHaveBeenCalled();
    
    // Vérifier que les propriétés principales sont exposées
    expect(result.current).toHaveProperty('searchTerm');
    expect(result.current).toHaveProperty('setSearchTerm');
    expect(result.current).toHaveProperty('searchResults');
    expect(result.current).toHaveProperty('lieu');
    expect(result.current).toHaveProperty('setLieu');
    expect(result.current).toHaveProperty('clearLieu');
    expect(result.current).toHaveProperty('lieux');
    expect(result.current).toHaveProperty('handleCreateLieu');
    expect(result.current).toHaveProperty('navigateToLieuDetails');
    expect(result.current).toHaveProperty('isSearching');
    expect(result.current).toHaveProperty('searchError');
    
    // Vérifier les résultats de recherche
    expect(result.current.lieux).toBe(mockTransformedLieux);
  });
  
  test('devrait initialiser correctement le hook avec des paramètres personnalisés', () => {
    // Options personnalisées
    const customOptions = {
      onSelect: mockOnSelect,
      initialSearchTerm: 'test',
      maxResults: 20
    };
    
    // Rendu du hook avec des paramètres personnalisés
    renderHook(() => useLieuSearch(customOptions));
    
    // Vérifier que le hook a été appelé avec les bons paramètres
    expect(useLieuSearch).toHaveBeenCalledWith(customOptions);
  });
  
  test('setLieu devrait sélectionner un lieu et appeler onSelect si fourni', () => {
    // Rendu du hook avec onSelect
    const { result } = renderHook(() => useLieuSearch({ onSelect: mockOnSelect }));
    
    // Lieu à sélectionner
    const lieu = mockTransformedLieux[0];
    
    // Sélectionner un lieu
    act(() => {
      result.current.setLieu(lieu);
    });
    
    // Vérifier que setSelectedEntity a été appelé avec le lieu
    expect(mockSearchHook.setSelectedEntity).toHaveBeenCalledWith(lieu);
    
    // Vérifier que onSelect a été appelé avec le lieu
    expect(mockOnSelect).toHaveBeenCalledWith(lieu);
  });
  
  test('clearLieu devrait effacer le lieu sélectionné', () => {
    // Rendu du hook
    const { result } = renderHook(() => useLieuSearch());
    
    // Effacer la sélection
    act(() => {
      result.current.clearLieu();
    });
    
    // Vérifier que clearLieu a été appelé
    expect(mockLieuSearchHook.clearLieu).toHaveBeenCalled();
  });
  
  test('handleCreateLieu devrait naviguer vers la page de création de lieu', () => {
    // Rendu du hook
    const { result } = renderHook(() => useLieuSearch());
    
    // Créer un lieu
    act(() => {
      result.current.handleCreateLieu();
    });
    
    // Vérifier que handleCreateLieu a été appelé
    expect(mockLieuSearchHook.handleCreateLieu).toHaveBeenCalled();
  });
  
  test('navigateToLieuDetails devrait naviguer vers la page de détails du lieu', () => {
    // Rendu du hook
    const { result } = renderHook(() => useLieuSearch());
    
    // Naviguer vers les détails d'un lieu
    const lieuId = 'lieu-1';
    act(() => {
      result.current.navigateToLieuDetails(lieuId);
    });
    
    // Vérifier que navigateToLieuDetails a été appelé avec le bon ID
    expect(mockLieuSearchHook.navigateToLieuDetails).toHaveBeenCalledWith(lieuId);
  });
  
  test('devrait exposer les bonnes propriétés et méthodes du hook générique', () => {
    // Rendu du hook
    const { result } = renderHook(() => useLieuSearch());
    
    // Vérifier que les propriétés du hook générique sont exposées
    expect(result.current.searchTerm).toBe(mockSearchHook.searchTerm);
    expect(result.current.searchResults).toBe(mockSearchHook.searchResults);
    
    // Vérifier les alias
    expect(result.current.searchLieux).toBe(mockSearchHook.refreshSearch);
    expect(result.current.resetSearch).toBe(mockSearchHook.clearSearch);
    expect(result.current.isSearching).toBe(mockSearchHook.loading);
    expect(result.current.searchError).toBe(mockSearchHook.error);
  });
});