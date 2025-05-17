/**
 * Configuration pour les tests unitaires des hooks
 * Ce fichier est automatiquement exécuté avant les tests dans ce dossier
 */

// Mock des hooks génériques
// jest.mock('../../hooks/common', () => ({
//   useGenericEntityForm: jest.fn(),
//   useGenericEntityList: jest.fn(),
//   useGenericEntitySearch: jest.fn(),
//   useGenericEntityDetails: jest.fn(),
//   debugLog: jest.fn()
// }));

// Mock des imports avec alias
// jest.mock('@/hooks/common', () => ({
//   useGenericEntityForm: jest.fn(),
//   useGenericEntityList: jest.fn(),
//   useGenericEntitySearch: jest.fn(),
//   useGenericEntityDetails: jest.fn(),
//   debugLog: jest.fn()
// }));

// jest.mock('@/utils/logUtils', () => ({
//   debugLog: jest.fn()
// }));

// Mock de Firebase
// jest.mock('../../firebaseInit', () => ({
//   db: {},
//   doc: jest.fn().mockReturnValue('mock-doc-ref'),
//   collection: jest.fn(),
//   getDoc: jest.fn(),
//   updateDoc: jest.fn().mockResolvedValue({}),
//   addDoc: jest.fn().mockResolvedValue({ id: 'new-entity-id' }),
//   deleteDoc: jest.fn().mockResolvedValue({}),
//   query: jest.fn(),
//   where: jest.fn(),
//   getDocs: jest.fn(),
//   serverTimestamp: jest.fn().mockReturnValue('mock-timestamp')
// }));

// Mock des modules qui peuvent être requise dans les hooks
// jest.mock('react-router-dom', () => ({
//   useNavigate: jest.fn().mockReturnValue(jest.fn())
// }));