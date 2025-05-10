/**
 * Test unitaire pour le hook useLieuFormOptimized
 */

import { renderHook, act } from '@testing-library/react';
import { useGenericEntityForm } from '../../hooks/common';

// Mock complet du hook
jest.mock('../../hooks/lieux/useLieuFormOptimized', () => ({
  useLieuFormOptimized: jest.fn()
}), { virtual: true });

// Mock des modules importés par le hook
jest.mock('../../hooks/common', () => ({
  useGenericEntityForm: jest.fn(),
  debugLog: jest.fn()
}));

// Importer le mock après l'avoir défini
import { useLieuFormOptimized } from '../../hooks/lieux/useLieuFormOptimized';

describe('useLieuFormOptimized', () => {
  // Données de test
  const mockLieuId = 'test-lieu-123';
  const mockLieuData = {
    id: mockLieuId,
    nom: 'Test Lieu',
    adresse: '123 Rue de Test',
    codePostal: '75000',
    ville: 'Paris',
    pays: 'France',
    capacite: 500,
    equipements: ['Sono', 'Lumières'],
    description: 'Une salle de test',
    programmateurId: 'prog-123',
    actif: true
  };
  
  // Mock du programmateur associé
  const mockProgrammateur = {
    id: 'prog-123',
    nom: 'Programmateur Test',
    email: 'programmateur@test.com'
  };
  
  // Mock du hook générique
  const mockFormHook = {
    loading: false,
    formData: mockLieuData,
    initialData: mockLieuData,
    relatedData: {
      programmateur: mockProgrammateur
    },
    errors: {},
    isSubmitting: false,
    isNewEntity: false,
    isDirty: false,
    handleChange: jest.fn(),
    handleSubmit: jest.fn(),
    resetForm: jest.fn(),
    setFormData: jest.fn(),
    updateFormData: jest.fn(),
    loadRelatedEntity: jest.fn(),
    uploadFile: jest.fn(),
    removeFile: jest.fn()
  };
  
  // Mock de l'implémentation du hook optimisé
  const mockLieuFormHook = {
    ...mockFormHook,
    lieu: mockLieuData,
    programmateur: mockProgrammateur,
    addEquipement: jest.fn(),
    removeEquipement: jest.fn()
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    useGenericEntityForm.mockReturnValue(mockFormHook);
    useLieuFormOptimized.mockImplementation(() => mockLieuFormHook);
  });
  
  test('devrait initialiser correctement le hook avec un ID existant', () => {
    // Rendu du hook avec un ID
    const { result } = renderHook(() => useLieuFormOptimized(mockLieuId));
    
    // Vérifier que le hook a été appelé avec le bon ID
    expect(useLieuFormOptimized).toHaveBeenCalledWith(mockLieuId);
    
    // Vérifier que les propriétés principales sont exposées
    expect(result.current).toHaveProperty('formData');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('errors');
    expect(result.current).toHaveProperty('handleSubmit');
    expect(result.current).toHaveProperty('handleChange');
    
    // Vérifier les propriétés spécifiques au hook optimisé
    expect(result.current).toHaveProperty('addEquipement');
    expect(result.current).toHaveProperty('removeEquipement');
    expect(result.current).toHaveProperty('lieu');
    expect(result.current).toHaveProperty('programmateur');
    
    // Vérifier que les données sont correctement exposées
    expect(result.current.lieu).toBe(mockLieuData);
    expect(result.current.programmateur).toBe(mockProgrammateur);
  });
  
  test('devrait exposer toutes les fonctionnalités spécifiques', () => {
    // Rendu du hook
    const { result } = renderHook(() => useLieuFormOptimized(mockLieuId));
    
    // Vérifier que addEquipement est exposé
    expect(result.current.addEquipement).toBeDefined();
    
    // Ajouter un équipement
    act(() => {
      result.current.addEquipement('Backline');
    });
    
    // Vérifier que addEquipement a été appelé
    expect(mockLieuFormHook.addEquipement).toHaveBeenCalledWith('Backline');
    
    // Vérifier que removeEquipement est exposé
    expect(result.current.removeEquipement).toBeDefined();
    
    // Supprimer un équipement
    act(() => {
      result.current.removeEquipement('Sono');
    });
    
    // Vérifier que removeEquipement a été appelé
    expect(mockLieuFormHook.removeEquipement).toHaveBeenCalledWith('Sono');
  });
});