// src/hooks/__tests__/useGenericEntityDetails.test.js
import { renderHook, act } from '@testing-library/react';
import useGenericEntityDetails from '../common/useGenericEntityDetails';

// Augmenter le timeout pour ces tests complexes
jest.setTimeout(30000);

// Mock des dépendances Firebase
jest.mock('../../firebaseInit', () => ({
  db: {},
  auth: {
    currentUser: { uid: 'test-user-id' }
  }
}));

// Mock des services Firebase avec fonctions mockées directement dans le mock
jest.mock('firebase/firestore', () => {
  return {
    addDoc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    getDoc: jest.fn().mockResolvedValue({
      exists: () => true,
      data: () => ({
        name: 'Test Entity',
        description: 'This is a test entity',
        active: true,
        createdAt: new Date().toISOString()
      }),
      id: 'test-id'
    }),
    doc: jest.fn().mockReturnValue({}),
    collection: jest.fn().mockReturnValue({}),
    serverTimestamp: () => new Date().toISOString(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn()
  };
});

// Variables pour accéder aux fonctions mockées
const { getDoc, doc, collection, addDoc, updateDoc, deleteDoc } = require('firebase/firestore');

// Mock des hooks utilisés à l'intérieur de useGenericEntityDetails
jest.mock('../forms/useFormValidation', () => () => ({
  validateForm: jest.fn().mockReturnValue({ isValid: true, errors: {} }),
  validateField: jest.fn().mockReturnValue(null)
}));

// Mock des hooks internes
jest.mock('../common/useCache', () => () => ({
  get: jest.fn(),
  set: jest.fn(),
  invalidate: jest.fn(),
  clear: jest.fn()
}));

jest.mock('../common/useFirestoreSubscription', () => ({
  __esModule: true,
  default: () => ({
    isActive: false,
    error: null,
    data: null
  })
}));

jest.mock('../../utils/logUtils', () => ({
  debugLog: jest.fn()
}));

jest.mock('../../services/InstanceTracker', () => ({
  register: jest.fn().mockReturnValue({ instanceId: 'mock-instance-id', instanceNumber: 1 }),
  updateMetadata: jest.fn()
}));

// Helper pour créer notre fichier d'utilitaires de test s'il n'existe pas déjà
const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));
const waitForHookToUpdate = async (callback) => {
  await act(async () => {
    await flushPromises();
    callback && callback();
  });
};
const cleanupAfterTests = async () => {
  // Nettoyer les timers et attendre que toutes les promesses soient résolues
  jest.clearAllTimers();
  await flushPromises();
};

// Configuration par défaut pour les tests
const defaultConfig = {
  entityType: 'testEntity',
  collectionName: 'testEntities',
  id: 'test-id',
  initialMode: 'view',
  cacheEnabled: false,
  onSaveSuccess: jest.fn(),
  onSaveError: jest.fn(),
  onModeChange: jest.fn()
};

// Helper pour configurer l'environnement de test
const setupTest = (config = {}) => {
  // Configuration combinée
  const finalConfig = { ...defaultConfig, ...config };

  // Utilisation de l'API @testing-library/react pour renderHook
  return renderHook(() => useGenericEntityDetails(finalConfig));
};

// Tests réduits en nombre et simplifiés
describe('useGenericEntityDetails', () => {
  let hookUtils;
  afterEach(async () => {
    jest.clearAllMocks();
    if (hookUtils && hookUtils.unmount) {
      hookUtils.unmount(); // cleanup listeners
    }
    await cleanupAfterTests();
  });

  // Test uniquement s'il se charge sans erreur
  test('devrait se charger sans erreur', async () => {
    hookUtils = setupTest();
    const { result } = hookUtils;
    
    // Vérifier l'état initial
    expect(result.current.loading).toBe(true);
    
    // Attendre la résolution des promesses
    await waitForHookToUpdate();
    expect(result.current.loading).toBe(false);
    expect(result.current.entity).toBeDefined();
  });

  // Test de mode d'édition simplifié  
  test('devrait pouvoir passer en mode édition', async () => {
    const onModeChange = jest.fn();
    hookUtils = setupTest({ onModeChange });
    const { result } = hookUtils;
    
    // Attendre la résolution des promesses
    await waitForHookToUpdate();
    
    // Passer en mode édition
    act(() => {
      result.current.toggleEditMode();
    });
    
    // Vérifier que le mode a été changé
    expect(result.current.isEditing).toBe(true);
    expect(onModeChange).toHaveBeenCalledWith('edit');
  });
});