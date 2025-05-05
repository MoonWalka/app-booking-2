// src/hooks/__tests__/useGenericEntityDetails.test.js
import { renderHook, act } from '@testing-library/react';
import { useGenericEntityDetails } from '../common';
import { db } from '@/firebaseInit';

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

// Mock pour React Router
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn().mockReturnValue(jest.fn())
}));

describe('useGenericEntityDetails', () => {
  // Configuration de base pour les tests
  const mockEntityId = 'test-entity-123';
  const mockEntityData = {
    id: mockEntityId,
    nom: 'Test Entity',
    description: 'This is a test entity',
    status: 'active',
    createdAt: '2025-05-05T12:00:00.000Z',
    updatedAt: '2025-05-05T12:00:00.000Z'
  };
  
  const mockRelatedEntity = {
    id: 'related-123',
    nom: 'Related Entity',
    description: 'This is a related entity'
  };
  
  const defaultConfig = {
    entityType: 'testEntity',
    collectionName: 'testEntities',
    id: mockEntityId,
    relatedEntities: [
      {
        name: 'related',
        collection: 'relatedCollection',
        idField: 'relatedId',
        type: 'one-to-one'
      }
    ],
    onSaveSuccess: jest.fn(),
    onDeleteSuccess: jest.fn(),
    onLoadSuccess: jest.fn(),
    validateForm: jest.fn().mockReturnValue({ isValid: true })
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configuration par défaut des mocks Firebase pour chaque test
    require('@/firebaseInit').getDoc.mockResolvedValue({
      exists: () => true,
      id: mockEntityId,
      data: () => ({ ...mockEntityData })
    });
  });

  // Tests de chargement des données
  test('devrait charger correctement les données de l\'entité', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useGenericEntityDetails(defaultConfig));
    
    expect(result.current.loading).toBe(true);
    expect(result.current.entity).toBeNull();
    
    await waitForNextUpdate();
    
    expect(result.current.loading).toBe(false);
    expect(result.current.entity).toEqual(expect.objectContaining(mockEntityData));
    expect(defaultConfig.onLoadSuccess).toHaveBeenCalled();
  });

  test('devrait gérer les erreurs de chargement', async () => {
    const mockError = new Error('Failed to load entity');
    require('@/firebaseInit').getDoc.mockRejectedValue(mockError);
    
    const onError = jest.fn();
    const { result, waitForNextUpdate } = renderHook(() => 
      useGenericEntityDetails({
        ...defaultConfig,
        onLoadError: onError
      })
    );
    
    await waitForNextUpdate();
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeTruthy();
    expect(onError).toHaveBeenCalledWith(mockError);
  });

  // Tests des entités liées
  test('devrait charger correctement les entités liées', async () => {
    // Configuration du mock pour l'entité liée
    require('@/firebaseInit').getDoc
      .mockImplementationOnce(() => ({
        exists: () => true,
        id: mockEntityId,
        data: () => ({ 
          ...mockEntityData,
          relatedId: 'related-123' // Référence à l'entité liée
        })
      }))
      .mockImplementationOnce(() => ({
        exists: () => true,
        id: 'related-123',
        data: () => mockRelatedEntity
      }));
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useGenericEntityDetails({
        ...defaultConfig,
        autoLoadRelated: true
      })
    );
    
    await waitForNextUpdate();
    
    expect(result.current.relatedData).toHaveProperty('related');
    expect(result.current.relatedData.related).toEqual(
      expect.objectContaining(mockRelatedEntity)
    );
  });
  
  test('devrait pouvoir charger manuellement une entité liée', async () => {
    require('@/firebaseInit').getDoc
      .mockImplementationOnce(() => ({
        exists: () => true,
        id: mockEntityId,
        data: () => mockEntityData
      }))
      .mockImplementationOnce(() => ({
        exists: () => true,
        id: 'related-123',
        data: () => mockRelatedEntity
      }));
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useGenericEntityDetails({
        ...defaultConfig,
        autoLoadRelated: false
      })
    );
    
    await waitForNextUpdate();
    
    expect(result.current.relatedData).not.toHaveProperty('related');
    
    // Charger manuellement l'entité liée
    await act(async () => {
      await result.current.loadRelatedEntity('related', 'related-123');
    });
    
    expect(result.current.relatedData).toHaveProperty('related');
    expect(result.current.relatedData.related).toEqual(
      expect.objectContaining(mockRelatedEntity)
    );
  });

  // Tests de mise à jour et soumission du formulaire
  test('devrait mettre à jour correctement les champs du formulaire', () => {
    const { result } = renderHook(() => useGenericEntityDetails(defaultConfig));
    
    act(() => {
      result.current.handleChange({
        target: { name: 'nom', value: 'Updated Name', type: 'text' }
      });
    });
    
    expect(result.current.formData.nom).toBe('Updated Name');
    expect(result.current.isDirty).toBe(true);
    
    // Tester le changement de champ imbriqué
    act(() => {
      result.current.handleChange({
        target: { name: 'contact.email', value: 'test@example.com', type: 'text' }
      });
    });
    
    expect(result.current.formData.contact.email).toBe('test@example.com');
  });
  
  test('devrait soumettre correctement le formulaire', async () => {
    const onSaveSuccess = jest.fn();
    const { result, waitForNextUpdate } = renderHook(() => 
      useGenericEntityDetails({
        ...defaultConfig,
        onSaveSuccess
      })
    );
    
    await waitForNextUpdate();
    
    // Mettre à jour un champ
    act(() => {
      result.current.handleChange({
        target: { name: 'nom', value: 'Updated Name', type: 'text' }
      });
    });
    
    // Soumettre le formulaire
    await act(async () => {
      await result.current.handleSubmit();
    });
    
    expect(require('@/firebaseInit').updateDoc).toHaveBeenCalled();
    expect(onSaveSuccess).toHaveBeenCalled();
    expect(result.current.isSubmitting).toBe(false);
  });
  
  test('devrait gérer la validation du formulaire', async () => {
    const mockValidateForm = jest.fn().mockReturnValue({
      isValid: false,
      errors: { nom: 'Le nom est requis' }
    });
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useGenericEntityDetails({
        ...defaultConfig,
        validateForm: mockValidateForm
      })
    );
    
    await waitForNextUpdate();
    
    // Soumettre le formulaire avec des données invalides
    await act(async () => {
      await result.current.handleSubmit();
    });
    
    expect(require('@/firebaseInit').updateDoc).not.toHaveBeenCalled();
    expect(result.current.formErrors).toEqual({ nom: 'Le nom est requis' });
  });

  // Tests du mode d'édition
  test('devrait basculer correctement entre les modes d\'affichage et d\'édition', () => {
    const onModeChange = jest.fn();
    const { result } = renderHook(() => 
      useGenericEntityDetails({
        ...defaultConfig,
        initialMode: 'view',
        onModeChange
      })
    );
    
    expect(result.current.isEditing).toBe(false);
    
    // Basculer en mode édition
    act(() => {
      result.current.toggleEditMode();
    });
    
    expect(result.current.isEditing).toBe(true);
    expect(onModeChange).toHaveBeenCalledWith('edit');
    
    // Basculer en mode vue
    act(() => {
      result.current.toggleEditMode();
    });
    
    expect(result.current.isEditing).toBe(false);
    expect(onModeChange).toHaveBeenCalledWith('view');
  });

  // Tests de suppression d'entité
  test('devrait supprimer correctement l\'entité', async () => {
    const onDeleteSuccess = jest.fn();
    const mockNavigate = jest.fn();
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useGenericEntityDetails({
        ...defaultConfig,
        onDeleteSuccess,
        returnPath: '/test-entities'
      })
    );
    
    await waitForNextUpdate();
    
    // Supprimer l'entité
    await act(async () => {
      await result.current.handleDelete();
    });
    
    expect(require('@/firebaseInit').deleteDoc).toHaveBeenCalledWith('mock-doc-ref');
    expect(onDeleteSuccess).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/test-entities');
  });
  
  test('devrait vérifier les permissions avant la suppression', async () => {
    const checkDeletePermission = jest.fn().mockResolvedValue({ allowed: false, reason: 'Not allowed' });
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useGenericEntityDetails({
        ...defaultConfig,
        checkDeletePermission
      })
    );
    
    await waitForNextUpdate();
    
    // Tenter de supprimer l'entité
    await act(async () => {
      await result.current.handleDelete();
    });
    
    expect(checkDeletePermission).toHaveBeenCalled();
    expect(require('@/firebaseInit').deleteDoc).not.toHaveBeenCalled();
    expect(result.current.deleteError).toEqual(expect.objectContaining({
      message: 'Not allowed'
    }));
  });

  // Tests de gestion des entités liées
  test('devrait définir correctement une entité liée', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useGenericEntityDetails(defaultConfig));
    
    await waitForNextUpdate();
    
    // Définir une entité liée
    act(() => {
      result.current.setRelatedEntity('related', mockRelatedEntity);
    });
    
    expect(result.current.relatedData.related).toEqual(mockRelatedEntity);
    expect(result.current.formData.relatedId).toBe(mockRelatedEntity.id);
    expect(result.current.isDirty).toBe(true);
  });
  
  test('devrait supprimer correctement une entité liée', async () => {
    require('@/firebaseInit').getDoc
      .mockImplementationOnce(() => ({
        exists: () => true,
        id: mockEntityId,
        data: () => ({ 
          ...mockEntityData,
          relatedId: 'related-123'
        })
      }))
      .mockImplementationOnce(() => ({
        exists: () => true,
        id: 'related-123',
        data: () => mockRelatedEntity
      }));
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useGenericEntityDetails({
        ...defaultConfig,
        autoLoadRelated: true
      })
    );
    
    await waitForNextUpdate();
    
    // Vérifier que l'entité liée est chargée
    expect(result.current.relatedData.related).toEqual(
      expect.objectContaining(mockRelatedEntity)
    );
    
    // Supprimer l'entité liée
    act(() => {
      result.current.removeRelatedEntity('related');
    });
    
    expect(result.current.relatedData.related).toBeNull();
    expect(result.current.formData.relatedId).toBeNull();
    expect(result.current.isDirty).toBe(true);
  });

  // Tests de formatage des valeurs
  test('devrait formater correctement les valeurs pour l\'affichage', async () => {
    const formatValue = jest.fn((field, value) => {
      if (field === 'date') return `Formatted: ${value}`;
      return value;
    });
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useGenericEntityDetails({
        ...defaultConfig,
        formatValue
      })
    );
    
    await waitForNextUpdate();
    
    const formattedValue = result.current.getDisplayValue('date', '2025-05-05');
    expect(formattedValue).toBe('Formatted: 2025-05-05');
    expect(formatValue).toHaveBeenCalledWith('date', '2025-05-05');
  });

  // Tests de rafraîchissement des données
  test('devrait rafraîchir correctement les données', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useGenericEntityDetails(defaultConfig));
    
    await waitForNextUpdate();
    
    // Reset le mock pour changer la réponse
    require('@/firebaseInit').getDoc.mockResolvedValueOnce({
      exists: () => true,
      id: mockEntityId,
      data: () => ({
        ...mockEntityData,
        nom: 'Updated from server'
      })
    });
    
    // Rafraîchir les données
    await act(async () => {
      await result.current.refresh();
    });
    
    expect(result.current.entity.nom).toBe('Updated from server');
  });

  // Test de nettoyage
  test('devrait nettoyer correctement les listeners en temps réel', async () => {
    const mockUnsubscribe = jest.fn();
    require('@/firebaseInit').onSnapshot = jest.fn().mockReturnValue(mockUnsubscribe);
    
    const { unmount, waitForNextUpdate } = renderHook(() => 
      useGenericEntityDetails({
        ...defaultConfig,
        realtime: true
      })
    );
    
    await waitForNextUpdate();
    unmount();
    
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});