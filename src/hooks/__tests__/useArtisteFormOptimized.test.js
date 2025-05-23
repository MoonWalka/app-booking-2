/**
 * Test unitaire pour le hook useArtisteForm
 */

import { renderHook, act } from '@testing-library/react';
import { useArtisteForm } from '@/hooks/artistes';
import { useGenericEntityForm } from '@/hooks/common';
import { validateArtisteForm } from '@/utils/validation';
import { generateArtisteId } from '@/utils/idGenerators';

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
  validateArtisteForm: jest.fn().mockReturnValue({ isValid: true, errors: {} })
}));

jest.mock('@/utils/toasts', () => ({
  showSuccessToast: jest.fn(),
  showErrorToast: jest.fn()
}));

jest.mock('@/utils/idGenerators', () => ({
  generateArtisteId: jest.fn().mockReturnValue('new-artiste-id')
}));

// Mock de react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn().mockReturnValue(jest.fn())
}));

describe('useArtisteForm', () => {
  // Configuration de base pour les tests
  const mockArtisteId = 'test-artiste-123';
  const mockArtisteData = {
    id: mockArtisteId,
    nom: 'Artiste Test',
    genre: 'Rock',
    biographie: 'Biographie de test',
    photos: ['photo1.jpg', 'photo2.jpg'],
    réseauxSociaux: {
      facebook: 'https://facebook.com/artistetest',
      instagram: 'https://instagram.com/artistetest'
    },
    contacts: [{ nom: 'Manager Test', email: 'manager@test.com' }],
    tarifMinimum: 1000,
    styleScénique: 'Énergique',
    besoinsLogistiques: 'Matériel de test',
    createdAt: '2025-05-05T12:00:00.000Z',
    updatedAt: '2025-05-05T12:00:00.000Z'
  };

  // Mock de l'agent associé (si applicable)
  const mockAgent = {
    id: 'agent-123',
    nom: 'Agent Test',
    email: 'agent@test.com'
  };

  // Mock du hook générique par défaut
  const mockFormHook = {
    loading: false,
    formData: mockArtisteData,
    initialData: mockArtisteData,
    relatedData: {
      agent: mockAgent
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
    const { result } = renderHook(() => useArtisteForm(mockArtisteId));
    
    // Vérifier que useGenericEntityForm a été appelé avec les bons paramètres
    expect(useGenericEntityForm).toHaveBeenCalledWith(expect.objectContaining({
      entityType: 'artistes',
      entityId: mockArtisteId,
      collectionName: 'artistes',
      validateForm: validateArtisteForm
    }));
    
    // Vérifier que les propriétés sont correctement exposées
    expect(result.current).toHaveProperty('formData');
    expect(result.current).toHaveProperty('isNewArtiste', false);
    expect(result.current).toHaveProperty('handleSubmit');
    expect(result.current).toHaveProperty('handleChange');
    expect(result.current).toHaveProperty('handleAgentChange');
    expect(result.current).toHaveProperty('handleAddContact');
    expect(result.current).toHaveProperty('handleRemoveContact');
    expect(result.current).toHaveProperty('handlePhotoUpload');
    expect(result.current).toHaveProperty('handleRemovePhoto');
    
    // Vérifier les données raccourcies
    expect(result.current.artiste).toBe(mockArtisteData);
    expect(result.current.agent).toBe(mockAgent);
  });
  
  test('devrait initialiser correctement le hook pour un nouvel artiste', () => {
    // Surcharger le mock pour simuler une nouvelle entité
    useGenericEntityForm.mockReturnValue({
      ...mockFormHook,
      isNewEntity: true,
      formData: { ...mockArtisteData, id: null }
    });
    
    // Rendu du hook sans ID (nouvel artiste)
    const { result } = renderHook(() => useArtisteForm('nouveau'));
    
    // Vérifier que le hook générique a été appelé correctement
    expect(useGenericEntityForm).toHaveBeenCalledWith(expect.objectContaining({
      entityType: 'artistes',
      entityId: null,
      generateId: generateArtisteId
    }));
    
    // Vérifier que l'état reflète un nouvel artiste
    expect(result.current.isNewArtiste).toBe(true);
  });
  
  test('handleAgentChange devrait mettre à jour les données du formulaire', () => {
    // Rendu du hook
    const { result } = renderHook(() => useArtisteForm(mockArtisteId));
    
    const newAgent = { id: 'new-agent-456', nom: 'Nouvel Agent', email: 'nouvel.agent@example.com' };
    
    // Simuler un changement d'agent
    act(() => {
      result.current.handleAgentChange(newAgent);
    });
    
    // Vérifier que updateFormData a été appelé
    expect(mockFormHook.updateFormData).toHaveBeenCalled();
    
    // Appel de la fonction passée à updateFormData
    const updateFunction = mockFormHook.updateFormData.mock.calls[0][0];
    const updatedData = updateFunction(mockArtisteData);
    
    expect(updatedData).toEqual(expect.objectContaining({
      agentId: newAgent.id,
      agentNom: newAgent.nom,
      agentEmail: newAgent.email
    }));
    
    // Vérifier que le chargement de l'entité liée a été déclenché
    expect(mockFormHook.loadRelatedEntity).toHaveBeenCalledWith('agent', newAgent.id);
  });
  
  test('handleAddContact devrait ajouter un contact à la liste', () => {
    // Rendu du hook
    const { result } = renderHook(() => useArtisteForm(mockArtisteId));
    
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
      ...mockArtisteData,
      contacts: [...mockArtisteData.contacts]
    });
    
    // Vérifier que le nouveau contact a été ajouté
    expect(updatedData.contacts).toHaveLength(mockArtisteData.contacts.length + 1);
    expect(updatedData.contacts).toContainEqual(newContact);
  });
  
  test('handleRemoveContact devrait supprimer un contact de la liste', () => {
    // Rendu du hook
    const { result } = renderHook(() => useArtisteForm(mockArtisteId));
    
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
      ...mockArtisteData,
      contacts: [...mockArtisteData.contacts]
    });
    
    // Vérifier que le contact a été supprimé
    expect(updatedData.contacts).toHaveLength(mockArtisteData.contacts.length - 1);
    expect(updatedData.contacts).not.toContainEqual(mockArtisteData.contacts[indexToRemove]);
  });
  
  test('handlePhotoUpload devrait ajouter une photo à la liste', () => {
    // Rendu du hook
    const { result } = renderHook(() => useArtisteForm(mockArtisteId));
    
    // Simuler un téléchargement de photo réussi
    const mockPhotoURL = 'https://example.com/photos/new-photo.jpg';
    mockFormHook.uploadFile.mockResolvedValue(mockPhotoURL);
    
    // Simuler le téléchargement d'une photo
    act(() => {
      const mockFile = new File(['photo content'], 'test-photo.jpg', { type: 'image/jpeg' });
      result.current.handlePhotoUpload(mockFile);
    });
    
    // Vérifier que uploadFile a été appelé
    expect(mockFormHook.uploadFile).toHaveBeenCalled();
  });
  
  test('handleRemovePhoto devrait supprimer une photo de la liste', () => {
    // Rendu du hook
    const { result } = renderHook(() => useArtisteForm(mockArtisteId));
    
    // URL de la photo à supprimer
    const photoToRemove = mockArtisteData.photos[0];
    
    // Simuler la suppression d'une photo
    act(() => {
      result.current.handleRemovePhoto(photoToRemove);
    });
    
    // Vérifier que updateFormData et removeFile ont été appelés
    expect(mockFormHook.updateFormData).toHaveBeenCalled();
    expect(mockFormHook.removeFile).toHaveBeenCalledWith(photoToRemove);
    
    // Appel de la fonction passée à updateFormData
    const updateFunction = mockFormHook.updateFormData.mock.calls[0][0];
    const updatedData = updateFunction({
      ...mockArtisteData,
      photos: [...mockArtisteData.photos]
    });
    
    // Vérifier que la photo a été supprimée
    expect(updatedData.photos).not.toContain(photoToRemove);
  });
});