// src/hooks/__tests__/useConcertStatusMigrated.test.js
import { renderHook, act } from '@testing-library/react';
import useConcertStatusMigrated from '../concerts/useConcertStatusMigrated';

// Mock des modules et services externes
jest.mock('../../../src/utils/logUtils', () => ({
  debugLog: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => 'mockedDocRef'),
  updateDoc: jest.fn(() => Promise.resolve()),
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date() }))
  }
}));

jest.mock('@/firebaseInit', () => ({
  db: {}
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('useConcertStatusMigrated', () => {
  // Données de test
  const testConcert = {
    id: 'concert-123',
    status: 'draft',
    titre: 'Concert de test',
    date: new Date().toISOString(),
    lieu: { nom: 'Salle de test' },
    historique: []
  };

  const testCallback = jest.fn();

  beforeEach(() => {
    // Réinitialiser les mocks entre les tests
    jest.clearAllMocks();
  });

  test('devrait initialiser correctement l\'état et les fonctions', () => {
    const { result } = renderHook(() => useConcertStatusMigrated());

    // Vérifier la structure de retour
    expect(result.current).toHaveProperty('isUpdating');
    expect(result.current).toHaveProperty('statusOptions');
    expect(result.current).toHaveProperty('isStatusChangeAllowed');
    expect(result.current).toHaveProperty('handleStatusChange');
    expect(result.current).toHaveProperty('getStatusLabel');
    expect(result.current).toHaveProperty('getStatusColor');
    
    // Vérifier l'état initial
    expect(result.current.isUpdating).toBe(false);
    expect(Array.isArray(result.current.statusOptions)).toBe(true);
    expect(result.current.statusOptions.length).toBeGreaterThan(0);
  });

  test('devrait fournir les options de statut correctes', () => {
    const { result } = renderHook(() => useConcertStatusMigrated());
    
    // Vérifier que toutes les options de statut sont présentes
    const requiredStatuses = ['draft', 'confirmed', 'cancelled', 'completed'];
    requiredStatuses.forEach(status => {
      expect(result.current.statusOptions.some(opt => opt.value === status)).toBe(true);
    });
    
    // Vérifier qu'il y a un label pour chaque statut
    result.current.statusOptions.forEach(option => {
      expect(option).toHaveProperty('value');
      expect(option).toHaveProperty('label');
    });
  });

  test('devrait fournir des fonctions utilitaires pour le statut', () => {
    const { result } = renderHook(() => useConcertStatusMigrated());
    
    // Tester getStatusLabel
    expect(result.current.getStatusLabel('draft')).toBe('Brouillon');
    expect(result.current.getStatusLabel('confirmed')).toBe('Confirmé');
    expect(result.current.getStatusLabel('nonExistentStatus')).toBe('Inconnu');
    
    // Tester getStatusColor
    expect(result.current.getStatusColor('draft')).toBe('gray');
    expect(result.current.getStatusColor('confirmed')).toBe('green');
    expect(result.current.getStatusColor('cancelled')).toBe('red');
    expect(result.current.getStatusColor('nonExistentStatus')).toBe('gray');
  });

  test('devrait vérifier correctement si un changement de statut est autorisé', () => {
    const { result } = renderHook(() => useConcertStatusMigrated());
    
    // Les règles basiques de transition de statut
    expect(result.current.isStatusChangeAllowed('draft', 'confirmed')).toBe(true);
    expect(result.current.isStatusChangeAllowed('draft', 'cancelled')).toBe(true);
    expect(result.current.isStatusChangeAllowed('confirmed', 'completed')).toBe(true);
    expect(result.current.isStatusChangeAllowed('confirmed', 'cancelled')).toBe(true);
    
    // Les transitions interdites
    expect(result.current.isStatusChangeAllowed('cancelled', 'completed')).toBe(false);
    expect(result.current.isStatusChangeAllowed('completed', 'draft')).toBe(false);
    expect(result.current.isStatusChangeAllowed('confirmed', 'draft')).toBe(false);
  });

  test('devrait gérer le changement de statut d\'un concert', async () => {
    // Importer les modules mockés
    const { updateDoc } = require('firebase/firestore');
    const { toast } = require('react-toastify');
    
    const { result } = renderHook(() => useConcertStatusMigrated());
    
    // Exécuter le changement de statut
    await act(async () => {
      await result.current.handleStatusChange(testConcert, 'confirmed', 'Confirmation du concert', testCallback);
    });
    
    // Vérifier que updateDoc a été appelé
    expect(updateDoc).toHaveBeenCalledTimes(1);
    
    // Vérifier que le toast de succès a été affiché
    expect(toast.success).toHaveBeenCalledTimes(1);
    
    // Vérifier que le callback a été appelé
    expect(testCallback).toHaveBeenCalledTimes(1);
  });

  test('devrait gérer les erreurs lors du changement de statut', async () => {
    // Simuler une erreur dans updateDoc
    const { updateDoc } = require('firebase/firestore');
    const { toast } = require('react-toastify');
    
    updateDoc.mockImplementationOnce(() => Promise.reject(new Error('Test error')));
    
    const { result } = renderHook(() => useConcertStatusMigrated());
    
    // Exécuter le changement de statut qui va échouer
    await act(async () => {
      await result.current.handleStatusChange(testConcert, 'confirmed', 'Confirmation du concert', testCallback);
    });
    
    // Vérifier que updateDoc a été appelé
    expect(updateDoc).toHaveBeenCalledTimes(1);
    
    // Vérifier que le toast d'erreur a été affiché
    expect(toast.error).toHaveBeenCalledTimes(1);
    
    // Vérifier que le callback n'a pas été appelé
    expect(testCallback).not.toHaveBeenCalled();
  });

  test('ne devrait pas permettre le changement vers le même statut', async () => {
    const { updateDoc } = require('firebase/firestore');
    
    const { result } = renderHook(() => useConcertStatusMigrated());
    
    // Tenter de changer vers le même statut
    await act(async () => {
      await result.current.handleStatusChange(
        { ...testConcert, status: 'confirmed' }, 
        'confirmed', 
        'Aucun changement', 
        testCallback
      );
    });
    
    // Vérifier qu'aucune mise à jour n'a été tentée
    expect(updateDoc).not.toHaveBeenCalled();
    expect(testCallback).not.toHaveBeenCalled();
  });
});