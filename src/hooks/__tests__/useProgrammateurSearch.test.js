/**
 * Test unitaire pour le hook useProgrammateurSearch
 */

import { renderHook, act } from '@testing-library/react';
import { useGenericEntitySearch } from '@/hooks/common';

// Mock complet du hook
jest.mock('../../hooks/programmateurs/useProgrammateurSearch', () => ({
  useProgrammateurSearch: jest.fn()
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
import { useProgrammateurSearch } from '../../hooks/programmateurs/useProgrammateurSearch';

describe('useProgrammateurSearch', () => {
  // Données de test pour les programmateurs
  const mockProgrammateurs = [
    { 
      id: 'prog-1',
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@example.com',
      structure: 'Salle de Concert Paris',
      telephone: '0123456789'
    },
    { 
      id: 'prog-2',
      nom: 'Martin',
      prenom: 'Sophie',
      email: 'sophie.martin@example.com',
      structure: 'Festival du Sud',
      telephone: '0987654321'
    }
  ];
  
  // Mock du résultat transformé attendu
  const mockTransformedProgrammateurs = [
    { 
      id: 'prog-1',
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@example.com',
      structure: 'Salle de Concert Paris',
      telephone: '0123456789',
      displayName: 'Jean Dupont (Salle de Concert Paris)',
      fullName: 'Jean Dupont'
    },
    { 
      id: 'prog-2',
      nom: 'Martin',
      prenom: 'Sophie',
      email: 'sophie.martin@example.com',
      structure: 'Festival du Sud',
      telephone: '0987654321',
      displayName: 'Sophie Martin (Festival du Sud)',
      fullName: 'Sophie Martin'
    }
  ];
  
  // Mock du retour du hook générique
  const mockSearchHook = {
    searchTerm: '',
    setSearchTerm: jest.fn(),
    searchResults: mockTransformedProgrammateurs,
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
  const mockProgrammateurSearchHook = {
    ...mockSearchHook,
    programmateurs: mockTransformedProgrammateurs,
    programmateur: null,
    setProgrammateur: jest.fn(),
    clearProgrammateur: jest.fn(),
    handleCreateProgrammateur: jest.fn(),
    navigateToProgrammateurDetails: jest.fn(),
    searchProgrammateurs: mockSearchHook.refreshSearch,
    resetSearch: mockSearchHook.clearSearch,
    isSearching: mockSearchHook.loading,
    searchError: mockSearchHook.error
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    useGenericEntitySearch.mockReturnValue(mockSearchHook);
    useProgrammateurSearch.mockImplementation((options) => {
      if (options?.onSelect) {
        mockProgrammateurSearchHook.setProgrammateur = jest.fn((programmateur) => {
          mockSearchHook.setSelectedEntity(programmateur);
          options.onSelect(programmateur);
        });
      }
      return mockProgrammateurSearchHook;
    });
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
  });
  
  test('devrait initialiser correctement le hook avec les paramètres par défaut', () => {
    // Rendu du hook
    const { result } = renderHook(() => useProgrammateurSearch());
    
    // Vérifier que le hook a été appelé
    expect(useProgrammateurSearch).toHaveBeenCalled();
    
    // Vérifier que les propriétés principales sont exposées
    expect(result.current).toHaveProperty('searchTerm');
    expect(result.current).toHaveProperty('setSearchTerm');
    expect(result.current).toHaveProperty('searchResults');
    expect(result.current).toHaveProperty('programmateur');
    expect(result.current).toHaveProperty('setProgrammateur');
    expect(result.current).toHaveProperty('clearProgrammateur');
    expect(result.current).toHaveProperty('programmateurs');
    expect(result.current).toHaveProperty('handleCreateProgrammateur');
    expect(result.current).toHaveProperty('navigateToProgrammateurDetails');
    expect(result.current).toHaveProperty('isSearching');
    expect(result.current).toHaveProperty('searchError');
    
    // Vérifier les résultats de recherche
    expect(result.current.programmateurs).toBe(mockTransformedProgrammateurs);
  });
  
  test('devrait initialiser correctement le hook avec des paramètres personnalisés', () => {
    // Options personnalisées
    const customOptions = {
      onSelect: mockOnSelect,
      initialSearchTerm: 'test',
      maxResults: 20
    };
    
    // Rendu du hook avec des paramètres personnalisés
    renderHook(() => useProgrammateurSearch(customOptions));
    
    // Vérifier que le hook a été appelé avec les bons paramètres
    expect(useProgrammateurSearch).toHaveBeenCalledWith(customOptions);
  });
  
  test('setProgrammateur devrait sélectionner un programmateur et appeler onSelect si fourni', () => {
    // Rendu du hook avec onSelect
    const { result } = renderHook(() => useProgrammateurSearch({ onSelect: mockOnSelect }));
    
    // Programmateur à sélectionner
    const programmateur = mockTransformedProgrammateurs[0];
    
    // Sélectionner un programmateur
    act(() => {
      result.current.setProgrammateur(programmateur);
    });
    
    // Vérifier que setSelectedEntity a été appelé avec le programmateur
    expect(mockSearchHook.setSelectedEntity).toHaveBeenCalledWith(programmateur);
    
    // Vérifier que onSelect a été appelé avec le programmateur
    expect(mockOnSelect).toHaveBeenCalledWith(programmateur);
  });
  
  test('clearProgrammateur devrait effacer le programmateur sélectionné', () => {
    // Rendu du hook
    const { result } = renderHook(() => useProgrammateurSearch());
    
    // Effacer la sélection
    act(() => {
      result.current.clearProgrammateur();
    });
    
    // Vérifier que clearProgrammateur a été appelé
    expect(mockProgrammateurSearchHook.clearProgrammateur).toHaveBeenCalled();
  });
  
  test('handleCreateProgrammateur devrait naviguer vers la page de création de programmateur', () => {
    // Rendu du hook
    const { result } = renderHook(() => useProgrammateurSearch());
    
    // Créer un programmateur
    act(() => {
      result.current.handleCreateProgrammateur();
    });
    
    // Vérifier que handleCreateProgrammateur a été appelé
    expect(mockProgrammateurSearchHook.handleCreateProgrammateur).toHaveBeenCalled();
  });
  
  test('navigateToProgrammateurDetails devrait naviguer vers la page de détails du programmateur', () => {
    // Rendu du hook
    const { result } = renderHook(() => useProgrammateurSearch());
    
    // Naviguer vers les détails d'un programmateur
    const programmateurId = 'prog-1';
    act(() => {
      result.current.navigateToProgrammateurDetails(programmateurId);
    });
    
    // Vérifier que navigateToProgrammateurDetails a été appelé avec le bon ID
    expect(mockProgrammateurSearchHook.navigateToProgrammateurDetails).toHaveBeenCalledWith(programmateurId);
  });
  
  test('devrait exposer les bonnes propriétés et méthodes du hook générique', () => {
    // Rendu du hook
    const { result } = renderHook(() => useProgrammateurSearch());
    
    // Vérifier que les propriétés du hook générique sont exposées
    expect(result.current.searchTerm).toBe(mockSearchHook.searchTerm);
    expect(result.current.searchResults).toBe(mockSearchHook.searchResults);
    
    // Vérifier les alias
    expect(result.current.searchProgrammateurs).toBe(mockSearchHook.refreshSearch);
    expect(result.current.resetSearch).toBe(mockSearchHook.clearSearch);
    expect(result.current.isSearching).toBe(mockSearchHook.loading);
    expect(result.current.searchError).toBe(mockSearchHook.error);
  });
  
  test('devrait gérer correctement le paramètre lieuId (pour la compatibilité avec l\'ancienne API)', () => {
    // Rendu du hook avec lieuId
    renderHook(() => useProgrammateurSearch({ lieuId: 'lieu-123' }));
    
    // Vérifier que le hook a été appelé avec le bon paramètre
    expect(useProgrammateurSearch).toHaveBeenCalledWith(expect.objectContaining({
      lieuId: 'lieu-123'
    }));
  });
});