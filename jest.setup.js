// Global mock pour les modules fréquemment utilisés
// Ce fichier centralise les mocks pour éviter les répétitions dans chaque fichier de test

// Mock pour le module utils/logUtils
jest.mock('@/utils/logUtils', () => ({
  debugLog: jest.fn(),
  errorLog: jest.fn(),
  infoLog: jest.fn(),
}));

// Mock pour les services Firebase
jest.mock('@/services/firebase-service', () => ({
  db: {},
  functions: {},
  collection: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  where: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn()
}));

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