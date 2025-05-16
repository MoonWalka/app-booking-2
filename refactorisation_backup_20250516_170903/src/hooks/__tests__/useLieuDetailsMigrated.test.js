// src/hooks/__tests__/useLieuDetailsMigrated.test.js
import { renderHook, act } from '@testing-library/react';
import useLieuDetailsMigrated from '../lieux/useLieuDetailsMigrated';

// Mocks
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn()
}));

jest.mock('@/hooks/common', () => ({
  useGenericEntityDetails: (config) => {
    // Simuler un état et des fonctions basiques pour tester
    return {
      // États simulés
      entity: {
        id: 'lieu-1',
        nom: 'Salle Pleyel',
        ville: 'Paris',
        type: 'salle',
        capacite: 1000,
        programmateurId: 'prog-1',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-03-20')
      },
      loading: false,
      error: null,
      formData: {
        id: 'lieu-1',
        nom: 'Salle Pleyel',
        ville: 'Paris',
        type: 'salle',
        capacite: 1000,
        programmateurId: 'prog-1'
      },
      isEditing: false,
      isDirty: false,
      isSubmitting: false,
      
      // Actions simulées
      toggleEditMode: jest.fn(),
      handleChange: jest.fn(),
      handleSubmit: jest.fn(),
      handleDelete: jest.fn(),
      setRelatedEntity: jest.fn(),
      updateFormData: jest.fn(),
      getRelatedEntityId: () => 'prog-1',
      formatDisplayValue: (field, value) => value,
      
      // Données liées simulées
      relatedData: {
        programmateur: {
          id: 'prog-1',
          nom: 'Dupont',
          prenom: 'Jean'
        }
      }
    };
  }
}));

jest.mock('@/utils/validation', () => ({
  validateLieuForm: jest.fn(() => ({ isValid: true }))
}));

jest.mock('@/utils/toasts', () => ({
  showSuccessToast: jest.fn(),
  showErrorToast: jest.fn()
}));

describe('useLieuDetailsMigrated', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('devrait initialiser correctement avec l\'ID fourni', () => {
    const { result } = renderHook(() => useLieuDetailsMigrated('lieu-1'));
    
    expect(result.current.entity).toBeDefined();
    expect(result.current.entity.id).toBe('lieu-1');
    expect(result.current.loading).toBe(false);
  });

  test('devrait exposer les fonctions spécifiques aux lieux', () => {
    const { result } = renderHook(() => useLieuDetailsMigrated('lieu-1'));
    
    // Vérifier que les fonctions spécifiques sont présentes
    expect(typeof result.current.handleProgrammateurChange).toBe('function');
    expect(typeof result.current.updateCoordinates).toBe('function');
  });

  test('handleProgrammateurChange devrait appeler updateFormData avec les bonnes données', () => {
    const { result } = renderHook(() => useLieuDetailsMigrated('lieu-1'));
    
    const newProgrammateur = {
      id: 'prog-2',
      nom: 'Martin',
      prenom: 'Sophie'
    };
    
    act(() => {
      result.current.handleProgrammateurChange(newProgrammateur);
    });
    
    expect(result.current.updateFormData).toHaveBeenCalledWith(expect.objectContaining({
      programmateurId: 'prog-2',
      programmateur: {
        id: 'prog-2',
        nom: 'Martin',
        prenom: 'Sophie'
      }
    }));
  });

  test('handleProgrammateurChange devrait effacer le programmateur quand on passe null', () => {
    const { result } = renderHook(() => useLieuDetailsMigrated('lieu-1'));
    
    act(() => {
      result.current.handleProgrammateurChange(null);
    });
    
    expect(result.current.updateFormData).toHaveBeenCalledWith(expect.objectContaining({
      programmateurId: null,
      programmateur: null
    }));
  });

  test('updateCoordinates devrait appeler handleChange avec les bonnes données', () => {
    const { result } = renderHook(() => useLieuDetailsMigrated('lieu-1'));
    
    act(() => {
      result.current.updateCoordinates(48.8566, 2.3522);
    });
    
    expect(result.current.handleChange).toHaveBeenCalledWith({
      target: {
        name: 'coordinates',
        value: { lat: 48.8566, lng: 2.3522 }
      }
    });
  });

  test('devrait exposer toutes les fonctionnalités du hook générique', () => {
    const { result } = renderHook(() => useLieuDetailsMigrated('lieu-1'));
    
    // Vérifier que les fonctions génériques sont présentes
    expect(result.current.toggleEditMode).toBeDefined();
    expect(result.current.handleSubmit).toBeDefined();
    expect(result.current.handleDelete).toBeDefined();
    expect(result.current.entity).toBeDefined();
    expect(result.current.formData).toBeDefined();
    expect(result.current.loading).toBeDefined();
    expect(result.current.error).toBeDefined();
  });
});