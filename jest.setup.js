// Global mock pour les modules fréquemment utilisés
// Ce fichier centralise les mocks pour éviter les répétitions dans chaque fichier de test

// Mock pour le module utils/logUtils
jest.mock('@/utils/logUtils', () => ({
  debugLog: jest.fn(),
  errorLog: jest.fn(),
  infoLog: jest.fn(),
}));

// Mock pour le module firebaseInit
jest.mock('@/firebaseInit', () => {
  const mockDocuments = {
    concerts: [
      { id: 'concert-1', titre: 'Concert de jazz', date: '2025-05-10', statut: 'confirme', montant: 1000 },
      { id: 'concert-2', titre: 'Festival rock', date: '2025-06-15', statut: 'contact', montant: 2000 }
    ],
    lieux: [
      { id: 'lieu-1', nom: 'Salle de concert A', ville: 'Paris', type: 'salle' },
      { id: 'lieu-2', nom: 'Festival ground B', ville: 'Lyon', type: 'extérieur' }
    ],
    programmateurs: [
      { id: 'prog-1', nom: 'John Doe', email: 'john@example.com', telephone: '0123456789' }
    ]
  };
  
  return {
    db: {},
    collection: jest.fn().mockImplementation((collectionName) => {
      return {
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        startAfter: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          docs: (mockDocuments[collectionName] || []).map(doc => ({
            id: doc.id,
            data: () => doc,
            exists: true
          }))
        })
      };
    }),
    doc: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({
        exists: true,
        id: 'mock-id',
        data: () => ({ title: 'Mock Document' })
      })
    }),
    query: jest.fn().mockImplementation((baseQuery) => baseQuery),
    orderBy: jest.fn().mockReturnValue({}),
    where: jest.fn().mockReturnValue({}),
    limit: jest.fn().mockReturnValue({}),
    startAfter: jest.fn().mockReturnValue({})
  };
});

// Mock pour les hooks communs
jest.mock('@/hooks/common', () => ({
  useNotification: jest.fn().mockReturnValue({
    showNotification: jest.fn(),
    hideNotification: jest.fn(),
    notificationVisible: false,
    notificationType: 'info',
    notificationMessage: ''
  }),
  useLoading: jest.fn().mockReturnValue({
    isLoading: false,
    setIsLoading: jest.fn(),
    showLoading: jest.fn(),
    hideLoading: jest.fn()
  }),
  useAuth: jest.fn().mockReturnValue({
    user: { 
      uid: 'test-user-123', 
      email: 'test@example.com', 
      displayName: 'Test User' 
    },
    isAuthenticated: true,
    isAdmin: true,
    checkPermission: jest.fn().mockReturnValue(true),
    login: jest.fn().mockResolvedValue(true),
    logout: jest.fn().mockResolvedValue()
  })
}));

// Configuration globale pour supprimer les avertissements dans les tests
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});

// Configuration pour React Testing Library
import '@testing-library/jest-dom';