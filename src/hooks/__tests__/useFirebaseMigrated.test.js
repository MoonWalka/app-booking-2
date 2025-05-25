import { renderHook, act } from '@testing-library/react';
import useFirebaseMigrated from '../firebase/useFirebaseMigrated';

// Mock des dépendances
jest.mock('../../firebaseInit', () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        set: jest.fn()
      })),
      add: jest.fn(),
      where: jest.fn(() => ({
        get: jest.fn()
      })),
      orderBy: jest.fn(() => ({
        get: jest.fn()
      })),
      get: jest.fn()
    }))
  }
}));

// Import des dépendances mockées
import { db } from '../../services/firebase-service';

// ...existing code...