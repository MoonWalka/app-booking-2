// src/hooks/__tests__/useConcertDetailsMigrated.test.js
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import useConcertDetailsMigrated from '../concerts/useConcertDetailsMigrated';

// Mock des dépendances
jest.mock('@/hooks/common', () => ({
  useGenericEntityDetails: jest.fn()
}));

jest.mock('@/hooks/concerts/useConcertStatus', () => jest.fn());
jest.mock('@/hooks/concerts/useConcertFormsManagement', () => jest.fn());
jest.mock('@/hooks/concerts/useConcertAssociations', () => jest.fn());
jest.mock('@/utils/formatters', () => ({
  formatDate: jest.fn((date) => date ? `formatted-date-${date}` : ''),
  formatMontant: jest.fn((montant) => montant ? `formatted-montant-${montant}` : ''),
  isDatePassed: jest.fn((date) => false),
  copyToClipboard: jest.fn((text) => Promise.resolve()),
  getCacheKey: jest.fn((id) => `cache-key-${id}`)
}));

// Import du hook générique mocké
import { useGenericEntityDetails } from '@/hooks/common';
import useConcertStatus from '@/hooks/concerts/useConcertStatus';
import useConcertFormsManagement from '@/hooks/concerts/useConcertFormsManagement';
import useConcertAssociations from '@/hooks/concerts/useConcertAssociations';

// Wrapper pour fournir le contexte de routage
const wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

describe('useConcertDetailsMigrated', () => {
  // Valeurs mockées pour les tests
  const mockId = 'concert-123';
  const mockConcert = {
    id: mockId,
    date: '2025-05-30',
    montant: 1000,
    statut: 'contact',
    lieuId: 'lieu-123',
    programmateurId: 'prog-123',
    artisteId: 'artiste-123',
    structureId: 'structure-123'
  };
  
  // Mocks pour les entités liées
  const mockLieu = { id: 'lieu-123', nom: 'Test Venue' };
  const mockProgrammateur = { id: 'prog-123', nom: 'Test Programmateur' };
  const mockArtiste = { id: 'artiste-123', nom: 'Test Artiste' };
  const mockStructure = { id: 'structure-123', nom: 'Test Structure' };
  
  // Mock pour les états de formulaire
  const mockFormData = { id: 'form-123', data: { test: 'value' } };
  
  // Configuration des mocks pour chaque test
  beforeEach(() => {
    // Reset tous les mocks
    jest.clearAllMocks();
    
    // Mock du hook générique
    useGenericEntityDetails.mockReturnValue({
      entity: mockConcert,
      relatedData: {
        lieu: mockLieu,
        programmateur: mockProgrammateur,
        artiste: mockArtiste,
        structure: mockStructure
      },
      loading: false,
      isSubmitting: false,
      error: null,
      formData: { ...mockConcert },
      isEditing: false,
      isDirty: false,
      handleChange: jest.fn(),
      toggleEditMode: jest.fn(),
      handleSubmit: jest.fn().mockResolvedValue(true),
      handleDelete: jest.fn(),
      refresh: jest.fn().mockResolvedValue(true),
      setRelatedEntity: jest.fn(),
      loadRelatedEntity: jest.fn(),
      formErrors: {}
    });
    
    // Mock des hooks annexes
    useConcertStatus.mockReturnValue({
      getStatusLabel: jest.fn((status) => `${status}-label`),
      getNextStatus: jest.fn((status) => status === 'contact' ? 'preaccord' : status),
      getStatusOptions: jest.fn(() => [
        { value: 'contact', label: 'Contact' },
        { value: 'preaccord', label: 'Préaccord' }
      ])
    });
    
    useConcertFormsManagement.mockReturnValue({
      formData: mockFormData,
      formDataStatus: 'pending',
      showFormGenerator: false,
      setShowFormGenerator: jest.fn(),
      generatedFormLink: null,
      setGeneratedFormLink: jest.fn(),
      handleFormGenerated: jest.fn(),
      validateForm: jest.fn(),
      fetchFormData: jest.fn().mockResolvedValue(true)
    });
    
    useConcertAssociations.mockReturnValue({
      updateProgrammateurAssociation: jest.fn().mockResolvedValue(true),
      updateArtisteAssociation: jest.fn().mockResolvedValue(true),
      updateStructureAssociation: jest.fn().mockResolvedValue(true)
    });
  });

  // Tests pour la compatibilité d'API
  test('devrait exposer la même API que l\'ancien hook useConcertDetails', () => {
    const { result } = renderHook(() => useConcertDetailsMigrated(mockId), { wrapper });
    
    // Vérifier que le hook expose les propriétés attendues
    expect(result.current).toHaveProperty('concert');
    expect(result.current).toHaveProperty('lieu');
    expect(result.current).toHaveProperty('programmateur');
    expect(result.current).toHaveProperty('artiste');
    expect(result.current).toHaveProperty('structure');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('isSubmitting');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('formState');
    expect(result.current).toHaveProperty('isEditMode');
    expect(result.current).toHaveProperty('formData');
    expect(result.current).toHaveProperty('formDataStatus');
    expect(result.current).toHaveProperty('handleChange');
    expect(result.current).toHaveProperty('toggleEditMode');
    expect(result.current).toHaveProperty('handleDelete');
    expect(result.current).toHaveProperty('handleSubmit');
    
    // Vérifier les fonctions spécifiques aux concerts
    expect(result.current).toHaveProperty('getStatusInfo');
    expect(result.current).toHaveProperty('refreshConcert');
    
    // Vérifier les fonctions de gestion des entités liées
    expect(result.current).toHaveProperty('setLieu');
    expect(result.current).toHaveProperty('setProgrammateur');
    expect(result.current).toHaveProperty('setArtiste');
    expect(result.current).toHaveProperty('setStructure');
    
    // Vérifier les objets de recherche (compatibilité d'API)
    expect(result.current).toHaveProperty('lieuSearch');
    expect(result.current).toHaveProperty('programmateurSearch');
    expect(result.current).toHaveProperty('artisteSearch');
    expect(result.current).toHaveProperty('structureSearch');
  });

  // Tests pour valider l'intégration avec useGenericEntityDetails
  test('devrait déléguer à useGenericEntityDetails avec les bons paramètres', () => {
    renderHook(() => useConcertDetailsMigrated(mockId), { wrapper });
    
    // Vérifier que useGenericEntityDetails est appelé avec les bons paramètres
    expect(useGenericEntityDetails).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'concert',
        collectionName: 'concerts',
        id: mockId,
        relatedEntities: expect.arrayContaining([
          expect.objectContaining({ name: 'lieu' }),
          expect.objectContaining({ name: 'programmateur' }),
          expect.objectContaining({ name: 'artiste' }),
          expect.objectContaining({ name: 'structure' })
        ]),
        useDeleteModal: true
      })
    );
  });

  // Tests pour les fonctionnalités spécifiques aux concerts
  test('devrait pouvoir gérer correctement les relations bidirectionnelles lors de la sauvegarde', async () => {
    const { result } = renderHook(() => useConcertDetailsMigrated(mockId), { wrapper });
    
    // Appeler handleSubmit pour tester la gestion des relations bidirectionnelles
    await act(async () => {
      await result.current.handleSubmit();
    });
    
    // Vérifier que la soumission a bien été déléguée au hook générique
    expect(useGenericEntityDetails().handleSubmit).toHaveBeenCalled();
    
    // Vérifier que les relations bidirectionnelles ont été mises à jour
    expect(useConcertAssociations().updateProgrammateurAssociation).toHaveBeenCalledWith(
      mockId,
      mockConcert,
      mockProgrammateur.id,
      null,
      mockLieu
    );
    
    expect(useConcertAssociations().updateArtisteAssociation).toHaveBeenCalledWith(
      mockId,
      mockConcert,
      mockArtiste.id,
      null,
      mockLieu
    );
    
    expect(useConcertAssociations().updateStructureAssociation).toHaveBeenCalledWith(
      mockId,
      mockConcert,
      mockStructure.id,
      null,
      mockLieu
    );
  });
  
  // Tests pour la gestion du statut du concert
  test('devrait retourner les informations de statut correctes', () => {
    const { result } = renderHook(() => useConcertDetailsMigrated(mockId), { wrapper });
    
    // Tester la fonction getStatusInfo avec un concert en statut 'contact'
    const statusInfo = result.current.getStatusInfo();
    expect(statusInfo).toEqual(expect.objectContaining({
      message: 'Formulaire à envoyer',
      actionNeeded: true,
      action: 'form'
    }));
  });
  
  // Test pour la fonction de rafraîchissement du concert
  test('devrait rafraîchir correctement les données du concert', async () => {
    const { result } = renderHook(() => useConcertDetailsMigrated(mockId), { wrapper });
    
    // Appeler la fonction refreshConcert
    await act(async () => {
      await result.current.refreshConcert();
    });
    
    // Vérifier que la fonction refresh du hook générique a été appelée
    expect(useGenericEntityDetails().refresh).toHaveBeenCalled();
    
    // Vérifier que les données du formulaire ont été actualisées
    expect(useConcertFormsManagement().fetchFormData).toHaveBeenCalledWith(mockConcert);
  });
  
  // Test pour la fonction de validation du formulaire
  test('devrait valider correctement le formulaire', () => {
    const { result } = renderHook(() => useConcertDetailsMigrated(mockId), { wrapper });
    
    // Cas 1: Formulaire valide
    const validFormData = {
      date: '2025-06-01',
      montant: 1000,
      lieuId: 'lieu-123'
    };
    
    expect(result.current.validateForm(validFormData)).toEqual({
      isValid: true,
      errors: {}
    });
    
    // Cas 2: Formulaire invalide
    const invalidFormData = {
      montant: 1000
      // Date et lieuId manquants
    };
    
    expect(result.current.validateForm(invalidFormData)).toEqual({
      isValid: false,
      errors: {
        date: 'La date est obligatoire',
        lieuId: 'Le lieu est obligatoire'
      }
    });
  });
  
  // Test pour les fonctions de gestion des entités liées
  test('devrait pouvoir associer correctement des entités liées', () => {
    const { result } = renderHook(() => useConcertDetailsMigrated(mockId), { wrapper });
    
    // Créer un nouveau lieu
    const newLieu = { id: 'new-lieu', nom: 'Nouveau Lieu' };
    
    // Associer le nouveau lieu
    act(() => {
      result.current.setLieu(newLieu);
    });
    
    // Vérifier que la fonction setRelatedEntity du hook générique a été appelée
    expect(useGenericEntityDetails().setRelatedEntity).toHaveBeenCalledWith('lieu', newLieu);
  });

  // Test pour le comportement avec différents statuts de concert
  test('devrait retourner les bonnes informations selon différents statuts', () => {
    // Configuration pour un concert avec statut 'preaccord' et formulaire validé
    useGenericEntityDetails.mockReturnValue({
      ...useGenericEntityDetails(),
      entity: { ...mockConcert, statut: 'preaccord' }
    });
    useConcertFormsManagement.mockReturnValue({
      ...useConcertFormsManagement(),
      formData: { ...mockFormData, status: 'validated' }
    });

    const { result: resultPreaccord } = renderHook(() => useConcertDetailsMigrated(mockId), { wrapper });
    const statusInfoPreaccord = resultPreaccord.current.getStatusInfo();
    
    expect(statusInfoPreaccord).toEqual({
      message: 'Contrat à envoyer',
      actionNeeded: true,
      action: 'send_contract'
    });

    // Configuration pour un concert avec statut 'acompte'
    useGenericEntityDetails.mockReturnValue({
      ...useGenericEntityDetails(),
      entity: { ...mockConcert, statut: 'acompte' }
    });

    const { result: resultAcompte } = renderHook(() => useConcertDetailsMigrated(mockId), { wrapper });
    const statusInfoAcompte = resultAcompte.current.getStatusInfo();
    
    expect(statusInfoAcompte).toEqual({
      message: 'En attente du concert',
      actionNeeded: false
    });
  });

  // Test pour la validation des formulaires de programmateurs
  test('devrait déléguer la validation de formulaire de programmateur', () => {
    const { result } = renderHook(() => useConcertDetailsMigrated(mockId), { wrapper });
    
    const mockProgrammatorFormData = {
      nom: 'Test',
      email: 'test@example.com'
    };
    
    result.current.validateProgrammatorForm(mockProgrammatorFormData);
    
    expect(useConcertFormsManagement().validateForm).toHaveBeenCalledWith(mockProgrammatorFormData);
  });

  // Test pour la gestion des événements personnalisés
  test('devrait émettre des événements personnalisés lors du rafraîchissement', async () => {
    const { result } = renderHook(() => useConcertDetailsMigrated(mockId), { wrapper });
    
    // Espionner la méthode dispatchEvent de window
    const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
    
    await act(async () => {
      await result.current.refreshConcert();
    });
    
    // Vérifier qu'un événement a été émis
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'concertDataRefreshed'
      })
    );
    
    dispatchEventSpy.mockRestore();
  });
});