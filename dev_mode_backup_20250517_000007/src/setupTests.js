// filepath: /Users/meltinrecordz/Documents/TourCraft/code/app-booking-2/src/setupTests.js

// Configuration pour l'environnement de test Jest
// Ce fichier est exécuté avant chaque test

// Importation des polyfills et configurations nécessaires
import '@testing-library/jest-dom';

// Configuration globale de Jest pour les tests
import { configure } from '@testing-library/react';

// Augmenter le timeout par défaut pour les tests asynchrones
jest.setTimeout(10000);

// Configurer testing-library
configure({
  testIdAttribute: 'data-testid',
});

// Supprimer les avertissements des tests non pertinents
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    /Warning: ReactDOM.render is no longer supported in React 18/.test(args[0]) ||
    /Warning: The current testing environment is not configured to support act/.test(args[0])
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Désactiver les avertissements console dans les tests
global.console = {
  ...console,
  // Laissez les erreurs s'afficher mais supprimez les avertissements
  warn: jest.fn(),
  // Vous pouvez aussi commenter cette ligne pour voir les logs pendant les tests
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn()
};

// Mock global pour éviter les erreurs de window/document non définis
global.window = {
  location: {
    pathname: '/',
    search: '',
    hash: '',
    href: 'http://localhost/'
  },
  localStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  }
};

// Mock global pour localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Définir des mocks globaux pour Firebase
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  onSnapshot: jest.fn(),
  serverTimestamp: jest.fn(() => new Date())
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn()
}));