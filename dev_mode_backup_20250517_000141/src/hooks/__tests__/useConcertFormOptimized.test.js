/**
 * Test unitaire pour le hook useConcertFormOptimized
 */

import { renderHook, act } from '@testing-library/react';
import { useConcertFormOptimized } from '@/hooks/concerts';
import { useGenericEntityForm } from '@/hooks/common';
import { validateConcertForm } from '@/utils/validation';
import { generateConcertId } from '@/utils/idGenerators';

// Mock du hook générique
jest.mock('@/hooks/common', () => ({
  useGenericEntityForm: jest.fn(),
  debugLog: jest.fn()
}));

// Mock des dépendances Firebase
jest.mock('@/firebaseInit', () => ({
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
}));

// Mock des utilitaires
jest.mock('@/utils/validation', () => ({
  validateConcertForm: jest.fn().mockReturnValue({ isValid: true, errors: {} })
}));

jest.mock('@/utils/toasts', () => ({
  showSuccessToast: jest.fn(),
  showErrorToast: jest.fn()
}));

jest.mock('@/utils/idGenerators', () => ({
  generateConcertId: jest.fn().mockReturnValue('new-concert-id')
}));

// Mock de react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn().mockReturnValue(jest.fn())
}));

describe('useConcertFormOptimized', () => {
  // Configuration de base pour les tests
  const mockConcertId = 'test-concert-123';
  const mockConcertData = {
    id: mockConcertId,
    nom: 'Test Concert',
    date: '2025-06-15',
    heure: '20:00',
    statut: 'planifié',
    lieuId: 'lieu-123',
    artisteId: 'artiste-123',
    description: 'Concert de test',
    prix: 15,
    capacité: 250,
    isPublic: true,
    contacts: [{ nom: 'Contact Test', email: 'contact@test.com' }],
    createdAt: '2025-05-05T12:00:00.000Z',
    updatedAt: '2025-05-05T12:00:00.000Z'
  };

  // Mock du lieu associé
  const mockLieu = {
    id: 'lieu-123',
    nom: 'Salle de Test',
    adresse: { ville: 'Ville Test' }
  };

  // Mock de l'artiste associé
  const mockArtiste = {
    id: 'artiste-123',
    nom: 'Artiste Test'
  };

  // Mock du hook générique par défaut
  const mockFormHook = {
    loading: false,
    formData: mockConcertData,
    initialData: mockConcertData,
    relatedData: {
      lieu: mockLieu,
      artiste: mockArtiste
    },
    errors: {},
    isSubmitting: false,
    isNewEntity: false,
    isDirty: false,
    handleChange: jest.fn(),
    handleSubmit: jest.fn(),
    resetForm: jest.fn(),
    updateFormData: jest.fn(),
    loadRelatedEntity: jest.fn(),
    uploadFile: jest.fn(),
    removeFile: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useGenericEntityForm.mockReturnValue(mockFormHook);
  });

  test('devrait initialiser correctement le hook avec un ID existant', () => {
    // Rendu du hook avec un ID
    const { result } = renderHook(() => useConcertFormOptimized(mockConcertId));
    
    // Vérifier que useGenericEntityForm a été appelé avec les bons paramètres
    expect(useGenericEntityForm).toHaveBeenCalledWith(expect.objectContaining({
      entityType: 'concerts',
      entityId: mockConcertId,
      collectionName: 'concerts',
      validateForm: validateConcertForm
    }));
    
    // Vérifier que les propriétés sont correctement exposées
    expect(result.current).toHaveProperty('formData');
    expect(result.current).toHaveProperty('isNewConcert', false);
    expect(result.current).toHaveProperty('handleSubmit');
    expect(result.current).toHaveProperty('handleChange');
    expect(result.current).toHaveProperty('handleArtisteChange');
    expect(result.current).toHaveProperty('handleLieuChange');
    expect(result.current).toHaveProperty('handleAddContact');
    expect(result.current).toHaveProperty('handleRemoveContact');
    
    // Vérifier les données raccourcies
    expect(result.current.concert).toBe(mockConcertData);
    expect(result.current.lieu).toBe(mockLieu);
    expect(result.current.artiste).toBe(mockArtiste);
  });
  
  test('devrait initialiser correctement le hook pour un nouveau concert', () => {
    // Surcharger le mock pour simuler une nouvelle entité
    useGenericEntityForm.mockReturnValue({
      ...mockFormHook,
      isNewEntity: true,
      formData: { ...mockConcertData, id: null }
    });
    
    // Rendu du hook sans ID (nouveau concert)
    const { result } = renderHook(() => useConcertFormOptimized());
    
    // Vérifier que le hook générique a été appelé correctement
    expect(useGenericEntityForm).toHaveBeenCalledWith(expect.objectContaining({
      entityType: 'concerts',
      entityId: null,
      generateId: generateConcertId
    }));
    
    // Vérifier que l'état reflète un nouveau concert
    expect(result.current.isNewConcert).toBe(true);
  });
  
  test('handleArtisteChange devrait mettre à jour les données du formulaire', () => {
    // Rendu du hook
    const { result } = renderHook(() => useConcertFormOptimized(mockConcertId));
    
    const newArtiste = { id: 'new-artiste-456', nom: 'Nouvel Artiste' };
    
    // Simuler un changement d'artiste
    act(() => {
      result.current.handleArtisteChange(newArtiste);
    });
    
    // Vérifier que updateFormData a été appelé avec les bonnes données
    expect(mockFormHook.updateFormData).toHaveBeenCalled();
    
    // Appel de la fonction passée à updateFormData
    const updateFunction = mockFormHook.updateFormData.mock.calls[0][0];
    const updatedData = updateFunction(mockConcertData);
    
    expect(updatedData).toEqual(expect.objectContaining({
      artisteId: newArtiste.id,
      artisteNom: newArtiste.nom
    }));
    
    // Vérifier que le chargement de l'entité liée a été déclenché
    expect(mockFormHook.loadRelatedEntity).toHaveBeenCalledWith('artiste', newArtiste.id);
  });
  
  test('handleArtisteChange devrait réinitialiser les données quand artiste est null', () => {
    // Rendu du hook
    const { result } = renderHook(() => useConcertFormOptimized(mockConcertId));
    
    // Simuler une réinitialisation d'artiste
    act(() => {
      result.current.handleArtisteChange(null);
    });
    
    // Vérifier que updateFormData a été appelé
    expect(mockFormHook.updateFormData).toHaveBeenCalled();
    
    // Appel de la fonction passée à updateFormData
    const updateFunction = mockFormHook.updateFormData.mock.calls[0][0];
    const updatedData = updateFunction(mockConcertData);
    
    expect(updatedData).toEqual(expect.objectContaining({
      artisteId: null,
      artisteNom: ''
    }));
  });
  
  test('handleLieuChange devrait mettre à jour les données du formulaire', () => {
    // Rendu du hook
    const { result } = renderHook(() => useConcertFormOptimized(mockConcertId));
    
    const newLieu = { id: 'new-lieu-456', nom: 'Nouvelle Salle', adresse: { ville: 'Nouvelle Ville' } };
    
    // Simuler un changement de lieu
    act(() => {
      result.current.handleLieuChange(newLieu);
    });
    
    // Vérifier que updateFormData a été appelé
    expect(mockFormHook.updateFormData).toHaveBeenCalled();
    
    // Appel de la fonction passée à updateFormData
    const updateFunction = mockFormHook.updateFormData.mock.calls[0][0];
    const updatedData = updateFunction(mockConcertData);
    
    expect(updatedData).toEqual(expect.objectContaining({
      lieuId: newLieu.id,
      lieuNom: newLieu.nom,
      ville: newLieu.adresse.ville
    }));
    
    // Vérifier que le chargement de l'entité liée a été déclenché
    expect(mockFormHook.loadRelatedEntity).toHaveBeenCalledWith('lieu', newLieu.id);
  });
  
  test('handleAddContact devrait ajouter un contact à la liste', () => {
    // Rendu du hook
    const { result } = renderHook(() => useConcertFormOptimized(mockConcertId));
    
    const newContact = { nom: 'Nouveau Contact', email: 'nouveau@example.com' };
    
    // Simuler l'ajout d'un contact
    act(() => {
      result.current.handleAddContact(newContact);
    });
    
    // Vérifier que updateFormData a été appelé
    expect(mockFormHook.updateFormData).toHaveBeenCalled();
    
    // Appel de la fonction passée à updateFormData
    const updateFunction = mockFormHook.updateFormData.mock.calls[0][0];
    const updatedData = updateFunction({
      ...mockConcertData,
      contacts: mockConcertData.contacts
    });
    
    // Vérifier que le nouveau contact a été ajouté
    expect(updatedData.contacts).toHaveLength(mockConcertData.contacts.length + 1);
    expect(updatedData.contacts).toContainEqual(newContact);
  });
  
  test('handleAddContact ne devrait pas ajouter un contact invalide', () => {
    // Rendu du hook
    const { result } = renderHook(() => useConcertFormOptimized(mockConcertId));
    
    const invalidContact = { nom: '', email: '' };
    
    // Simuler l'ajout d'un contact invalide
    act(() => {
      result.current.handleAddContact(invalidContact);
    });
    
    // Vérifier que updateFormData n'a pas été appelé
    expect(mockFormHook.updateFormData).not.toHaveBeenCalled();
  });
  
  test('handleRemoveContact devrait supprimer un contact de la liste', () => {
    // Rendu du hook
    const { result } = renderHook(() => useConcertFormOptimized(mockConcertId));
    
    // Index du contact à supprimer
    const indexToRemove = 0;
    
    // Simuler la suppression d'un contact
    act(() => {
      result.current.handleRemoveContact(indexToRemove);
    });
    
    // Vérifier que updateFormData a été appelé
    expect(mockFormHook.updateFormData).toHaveBeenCalled();
    
    // Appel de la fonction passée à updateFormData
    const updateFunction = mockFormHook.updateFormData.mock.calls[0][0];
    const updatedData = updateFunction({
      ...mockConcertData,
      contacts: [...mockConcertData.contacts]
    });
    
    // Vérifier que le contact a été supprimé
    expect(updatedData.contacts).toHaveLength(mockConcertData.contacts.length - 1);
    expect(updatedData.contacts).not.toContainEqual(mockConcertData.contacts[indexToRemove]);
  });
});