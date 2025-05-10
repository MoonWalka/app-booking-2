/**
 * Template de test pour les hooks optimisés de formulaire
 * Ce fichier sert de modèle et ne doit pas être exécuté directement
 * Pour créer un test pour un hook optimisé spécifique, copier ce fichier
 * et remplacer les variables suivantes:
 * - ENTITY_NAME: Nom de l'entité (ex: Concert, Structure, etc.)
 * - ENTITY_TYPE: Type de l'entité en minuscule (ex: concert, structure, etc.)
 * - HOOK_PATH: Chemin d'importation du hook (ex: @/hooks/concerts)
 * 
 * Exemple: Pour useConcertFormOptimized:
 * - ENTITY_NAME: Concert
 * - ENTITY_TYPE: concert
 * - HOOK_PATH: @/hooks/concerts
 */

import { renderHook, act } from '@testing-library/react';
import { useENTITY_NAMEFormOptimized } from 'HOOK_PATH';
import { useGenericEntityForm } from '@/hooks/common';

// Mock du hook générique
jest.mock('@/hooks/common', () => ({
  useGenericEntityForm: jest.fn(),
  debugLog: jest.fn()
}));

// Mock des dépendances Firebase
jest.mock('@/firebaseInit', () => {
  return {
    db: {},
    doc: jest.fn().mockReturnValue('mock-doc-ref'),
    collection: jest.fn(),
    getDoc: jest.fn(),
    updateDoc: jest.fn().mockResolvedValue({}),
    deleteDoc: jest.fn().mockResolvedValue({}),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(),
    serverTimestamp: jest.fn().mockReturnValue('mock-timestamp')
  };
});

// Mock des fonctions utilitaires de validation si nécessaire
jest.mock('@/utils/validation/validateENTITY_NAMEForm', () => jest.fn().mockReturnValue({
  isValid: true,
  errors: {}
}));

describe('useENTITY_NAMEFormOptimized', () => {
  // Configuration de base pour les tests
  const mockEntityId = 'test-ENTITY_TYPE-123';
  const mockEntityData = {
    id: mockEntityId,
    nom: 'Test ENTITY_NAME',
    description: 'This is a test ENTITY_TYPE',
    status: 'active',
    createdAt: '2025-05-05T12:00:00.000Z',
    updatedAt: '2025-05-05T12:00:00.000Z'
  };

  // Mock du hook générique par défaut
  const mockFormHook = {
    loading: false,
    formData: mockEntityData,
    initialData: mockEntityData,
    errors: {},
    isSubmitting: false,
    isNewEntity: false,
    isDirty: false,
    handleChange: jest.fn(),
    handleSubmit: jest.fn(),
    resetForm: jest.fn(),
    uploadFile: jest.fn(),
    removeFile: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useGenericEntityForm.mockReturnValue(mockFormHook);
  });

  test('devrait initialiser correctement le hook avec un ID existant', () => {
    // Rendu du hook avec un ID
    const { result } = renderHook(() => useENTITY_NAMEFormOptimized(mockEntityId));
    
    // Vérifier que useGenericEntityForm a été appelé avec les bons paramètres
    expect(useGenericEntityForm).toHaveBeenCalledWith(expect.objectContaining({
      entityType: 'ENTITY_TYPE',
      collectionName: 'ENTITY_TYPEs',
      id: mockEntityId
    }));
    
    // Vérifier que les propriétés sont correctement exposées
    expect(result.current).toHaveProperty('formData');
    expect(result.current).toHaveProperty('isNewEntity', false);
    expect(result.current).toHaveProperty('handleSubmit');
    expect(result.current).toHaveProperty('handleChange');
  });
  
  test('devrait initialiser correctement le hook pour une nouvelle entité', () => {
    // Surcharger le mock pour simuler une nouvelle entité
    useGenericEntityForm.mockReturnValue({
      ...mockFormHook,
      isNewEntity: true,
      formData: { ...mockEntityData, id: null }
    });
    
    // Rendu du hook sans ID (nouvelle entité)
    const { result } = renderHook(() => useENTITY_NAMEFormOptimized());
    
    // Vérifier que le paramètre d'ID est correct
    expect(useGenericEntityForm).toHaveBeenCalledWith(expect.objectContaining({
      entityType: 'ENTITY_TYPE',
      id: null
    }));
    
    // Vérifier que l'état reflète une nouvelle entité
    expect(result.current.isNewEntity).toBe(true);
  });
  
  test('devrait propager correctement les changements de champs', () => {
    // Rendu du hook
    const { result } = renderHook(() => useENTITY_NAMEFormOptimized(mockEntityId));
    
    // Simuler un changement de champ
    act(() => {
      result.current.handleChange({
        target: { name: 'nom', value: 'Nouveau nom', type: 'text' }
      });
    });
    
    // Vérifier que handleChange du hook générique a été appelé
    expect(mockFormHook.handleChange).toHaveBeenCalled();
  });
  
  test('devrait gérer correctement la soumission du formulaire', async () => {
    // Préparer le mock de handleSubmit
    const mockHandleSubmit = jest.fn().mockResolvedValue({
      success: true,
      data: { id: mockEntityId, ...mockEntityData }
    });
    
    useGenericEntityForm.mockReturnValue({
      ...mockFormHook,
      handleSubmit: mockHandleSubmit
    });
    
    // Rendu du hook
    const { result } = renderHook(() => useENTITY_NAMEFormOptimized(mockEntityId));
    
    // Simuler une soumission du formulaire
    await act(async () => {
      await result.current.handleSubmit();
    });
    
    // Vérifier que handleSubmit du hook générique a été appelé
    expect(mockHandleSubmit).toHaveBeenCalled();
  });
  
  test('devrait gérer les erreurs de validation', async () => {
    // Importer directement la fonction de validation pour la mocker
    const validateENTITY_NAMEForm = require('@/utils/validation/validateENTITY_NAMEForm');
    
    // Configurer le mock pour retourner une erreur
    validateENTITY_NAMEForm.mockReturnValue({
      isValid: false,
      errors: { nom: 'Le nom est obligatoire' }
    });
    
    // Rendu du hook
    const { result } = renderHook(() => useENTITY_NAMEFormOptimized(mockEntityId));
    
    // Simuler une soumission du formulaire avec des données invalides
    await act(async () => {
      await result.current.handleSubmit();
    });
    
    // Vérifier que la validation a été appelée
    expect(validateENTITY_NAMEForm).toHaveBeenCalled();
  });
  
  test('devrait transformer correctement les données avant soumission', () => {
    // Configurer le mock pour capturer les transformations
    const mockHandleSubmit = jest.fn().mockImplementation((transformFn) => {
      if (transformFn) {
        const transformedData = transformFn(mockEntityData);
        return Promise.resolve({ success: true, data: transformedData });
      }
      return Promise.resolve({ success: true, data: mockEntityData });
    });
    
    useGenericEntityForm.mockReturnValue({
      ...mockFormHook,
      handleSubmit: mockHandleSubmit
    });
    
    // Rendu du hook
    const { result } = renderHook(() => useENTITY_NAMEFormOptimized(mockEntityId));
    
    // Simuler une soumission du formulaire
    act(() => {
      result.current.handleSubmit();
    });
    
    // Vérifier que handleSubmit a été appelé avec une fonction de transformation
    expect(mockHandleSubmit).toHaveBeenCalledWith(expect.any(Function));
  });
  
  test('devrait gérer correctement l\'annulation du formulaire', () => {
    // Rendu du hook
    const { result } = renderHook(() => useENTITY_NAMEFormOptimized(mockEntityId));
    
    // Simuler une annulation
    act(() => {
      result.current.resetForm();
    });
    
    // Vérifier que resetForm du hook générique a été appelé
    expect(mockFormHook.resetForm).toHaveBeenCalled();
  });
});