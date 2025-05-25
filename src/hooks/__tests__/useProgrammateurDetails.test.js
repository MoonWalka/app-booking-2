// src/hooks/__tests__/useProgrammateurDetailsMigrated.test.js
import { renderHook, act } from '@testing-library/react';
import useProgrammateurDetails from '../programmateurs/useProgrammateurDetails';
import {  collection, query, where, getDocs  } from '@/services/firebase-service';

// Mocks
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn()
}));

// Mock pour firebase/firestore
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  arrayUnion: jest.fn((item) => ({ type: 'arrayUnion', item })),
  arrayRemove: jest.fn((item) => ({ type: 'arrayRemove', item })),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn()
}));

jest.mock('../../../src/firebaseInit', () => ({
  db: {}
}));

jest.mock('../../../src/hooks/common', () => {
  // Implémentation d'un mock pour updateFormData
  const updateFormDataMock = jest.fn();

  return {
    useGenericEntityDetails: (config) => {
      // Simuler un état et des fonctions basiques pour tester
      return {
        // États simulés
        entity: {
          id: 'prog-1',
          nom: 'Dupont',
          prenom: 'Jean',
          structureId: 'struct-1',
          structureIds: ['struct-1', 'struct-2'],
          contacts: [
            { id: '1', type: 'email', value: 'jean@example.com' },
            { id: '2', type: 'tel', value: '+33612345678' }
          ],
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-03-20')
        },
        loading: false,
        error: null,
        formData: {
          id: 'prog-1',
          nom: 'Dupont',
          prenom: 'Jean',
          structureId: 'struct-1',
          structureIds: ['struct-1', 'struct-2'],
          contacts: [
            { id: '1', type: 'email', value: 'jean@example.com' },
            { id: '2', type: 'tel', value: '+33612345678' }
          ]
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
        updateFormData: updateFormDataMock, // Mock spécifique pour tester
        refresh: jest.fn(),
        getRelatedEntityId: () => 'struct-1',
        formatDisplayValue: (field, value) => value,
        
        // Données liées simulées
        relatedData: {
          structure: {
            id: 'struct-1',
            nom: 'Structure Principale'
          },
          structures: [
            { id: 'struct-1', nom: 'Structure Principale' },
            { id: 'struct-2', nom: 'Structure Secondaire' }
          ]
        }
      };
    }
  };
});

jest.mock('../../../src/utils/validation', () => ({
  validateProgrammateurForm: jest.fn(() => ({ isValid: true }))
}));

jest.mock('../../../src/utils/toasts', () => ({
  showSuccessToast: jest.fn(),
  showErrorToast: jest.fn()
}));

describe('useProgrammateurDetailsMigrated', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configure default mock return values
    updateDoc.mockResolvedValue({});
    collection.mockReturnValue({});
    getDocs.mockResolvedValue({ empty: true });
  });

  test('devrait initialiser correctement avec l\'ID fourni', () => {
    const { result } = renderHook(() => useProgrammateurDetails('prog-1'));
    
    expect(result.current.entity).toBeDefined();
    expect(result.current.entity.id).toBe('prog-1');
    expect(result.current.loading).toBe(false);
  });

  test('devrait exposer les fonctions spécifiques aux programmateurs', () => {
    const { result } = renderHook(() => useProgrammateurDetails('prog-1'));
    
    // Vérifier que les fonctions spécifiques sont présentes
    expect(typeof result.current.handleStructureChange).toBe('function');
    expect(typeof result.current.addStructureSecondaire).toBe('function');
    expect(typeof result.current.removeStructureSecondaire).toBe('function');
    expect(typeof result.current.addContact).toBe('function');
    expect(typeof result.current.updateContact).toBe('function');
    expect(typeof result.current.removeContact).toBe('function');
  });

  test('handleStructureChange devrait mettre à jour la structure principale', () => {
    const { result } = renderHook(() => useProgrammateurDetails('prog-1'));
    
    const newStructure = {
      id: 'struct-3',
      nom: 'Nouvelle Structure Principale'
    };
    
    act(() => {
      result.current.handleStructureChange(newStructure);
    });
    
    // Vérifier l'appel à updateFormData avec les bonnes données
    expect(result.current.updateFormData).toHaveBeenCalledWith(expect.objectContaining({
      structureId: 'struct-3',
      structure: {
        id: 'struct-3',
        nom: 'Nouvelle Structure Principale'
      }
    }));
  });

  test('handleStructureChange devrait effacer la structure principale quand on passe null', () => {
    const { result } = renderHook(() => useProgrammateurDetails('prog-1'));
    
    act(() => {
      result.current.handleStructureChange(null);
    });
    
    // Vérifier l'appel à updateFormData avec les bonnes données
    expect(result.current.updateFormData).toHaveBeenCalledWith(expect.objectContaining({
      structureId: null,
      structure: null
    }));
  });

  test('addContact devrait ajouter un nouveau contact', () => {
    const { result } = renderHook(() => useProgrammateurDetails('prog-1'));
    
    const newContact = {
      type: 'email',
      value: 'nouveau@example.com'
    };
    
    act(() => {
      result.current.addContact(newContact);
    });
    
    // Vérifier l'appel à updateFormData avec un nouveau tableau de contacts
    expect(result.current.updateFormData).toHaveBeenCalled();
    const updateFormDataArg = result.current.updateFormData.mock.calls[0][0];
    expect(updateFormDataArg.contacts.length).toBe(3); // 2 contacts existants + 1 nouveau
    expect(updateFormDataArg.contacts[2].type).toBe('email');
    expect(updateFormDataArg.contacts[2].value).toBe('nouveau@example.com');
    expect(updateFormDataArg.contacts[2].id).toBeDefined(); // Devrait avoir un ID généré
  });

  test('updateContact devrait mettre à jour un contact existant', () => {
    const { result } = renderHook(() => useProgrammateurDetails('prog-1'));
    
    const updatedContact = {
      type: 'email',
      value: 'updated@example.com'
    };
    
    act(() => {
      result.current.updateContact('1', updatedContact);
    });
    
    // Vérifier l'appel à updateFormData avec le contact mis à jour
    expect(result.current.updateFormData).toHaveBeenCalled();
    const updateFormDataArg = result.current.updateFormData.mock.calls[0][0];
    expect(updateFormDataArg.contacts.length).toBe(2); // Même nombre de contacts
    expect(updateFormDataArg.contacts[0].value).toBe('updated@example.com'); // Premier contact mis à jour
    expect(updateFormDataArg.contacts[1].value).toBe('+33612345678'); // Deuxième contact inchangé
  });

  test('removeContact devrait supprimer un contact existant', () => {
    const { result } = renderHook(() => useProgrammateurDetails('prog-1'));
    
    act(() => {
      result.current.removeContact('1');
    });
    
    // Vérifier l'appel à updateFormData avec le contact supprimé
    expect(result.current.updateFormData).toHaveBeenCalled();
    const updateFormDataArg = result.current.updateFormData.mock.calls[0][0];
    expect(updateFormDataArg.contacts.length).toBe(1); // 1 contact supprimé
    expect(updateFormDataArg.contacts[0].id).toBe('2'); // Le contact restant a l'ID 2
  });

  test('devrait exposer toutes les fonctionnalités du hook générique', () => {
    const { result } = renderHook(() => useProgrammateurDetails('prog-1'));
    
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