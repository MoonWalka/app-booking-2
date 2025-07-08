/**
 * Tests unitaires pour emailService.js
 * Teste les appels vers Cloud Functions et la gestion des erreurs
 */

import emailService from '../emailService';
import { httpsCallable } from 'firebase/functions';

// Mock Firebase Functions
jest.mock('firebase/functions', () => ({
  httpsCallable: jest.fn()
}));

// Mock Firebase service
jest.mock('../firebase-service', () => ({
  httpsCallable: jest.fn(),
  functions: {},
  auth: {
    currentUser: {
      uid: 'test-user-123',
      organizationId: 'test-org-456'
    }
  }
}));

describe('EmailService', () => {
  let mockCallable;

  beforeEach(() => {
    mockCallable = jest.fn();
    httpsCallable.mockReturnValue(mockCallable);
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'test-org-456'),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });
    
    jest.clearAllMocks();
  });

  describe('sendMail()', () => {
    it('devrait appeler la Cloud Function sendUnifiedEmail par défaut', async () => {
      const mockResponse = {
        data: {
          success: true,
          messageId: 'test-message-id',
          provider: 'brevo'
        }
      };
      mockCallable.mockResolvedValue(mockResponse);

      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>'
      };

      const result = await emailService.sendMail(emailData);

      expect(httpsCallable).toHaveBeenCalledWith(expect.any(Object), 'sendUnifiedEmail');
      expect(mockCallable).toHaveBeenCalledWith({
        ...emailData,
        userId: 'test-user-123',
        organizationId: 'test-org-456'
      });
      expect(result.success).toBe(true);
    });

    it('devrait utiliser sendEmail si useUnified=false', async () => {
      const mockResponse = {
        data: {
          success: true,
          messageId: 'smtp-message-id',
          provider: 'smtp'
        }
      };
      mockCallable.mockResolvedValue(mockResponse);

      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
        useUnified: false
      };

      const result = await emailService.sendMail(emailData);

      expect(httpsCallable).toHaveBeenCalledWith(expect.any(Object), 'sendEmail');
      expect(result.success).toBe(true);
    });

    it('devrait gérer les erreurs d\'authentification', async () => {
      // Mock user non authentifié temporairement
      const originalUser = require('../firebase-service').auth.currentUser;
      require('../firebase-service').auth.currentUser = null;

      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>'
      };

      await expect(emailService.sendMail(emailData))
        .rejects.toThrow('Utilisateur non authentifié');
      
      // Restaurer le user
      require('../firebase-service').auth.currentUser = originalUser;
    });

    it('devrait gérer les erreurs de Cloud Function', async () => {
      const error = new Error('Cloud Function error');
      mockCallable.mockRejectedValue(error);

      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>'
      };

      await expect(emailService.sendMail(emailData))
        .rejects.toThrow('Cloud Function error');
    });
  });

  describe('sendTemplatedMail()', () => {
    it('devrait envoyer un email avec template via service unifié', async () => {
      const mockResponse = {
        data: {
          success: true,
          messageId: 'template-message-id',
          provider: 'brevo'
        }
      };
      mockCallable.mockResolvedValue(mockResponse);

      const templateData = {
        nomContact: 'Jean Dupont',
        nomDate: 'Festival 2024'
      };

      const result = await emailService.sendTemplatedMail(
        'formulaire',
        templateData,
        'test@example.com'
      );

      expect(httpsCallable).toHaveBeenCalledWith(expect.any(Object), 'sendUnifiedEmail');
      expect(mockCallable).toHaveBeenCalledWith({
        templateName: 'formulaire',
        variables: templateData,
        to: 'test@example.com',
        userId: 'test-user-123',
        organizationId: 'test-org-456'
      });
      expect(result.success).toBe(true);
    });

    it('devrait utiliser sendEmail si useUnified=false', async () => {
      const mockResponse = {
        data: {
          success: true,
          messageId: 'smtp-template-id',
          provider: 'smtp'
        }
      };
      mockCallable.mockResolvedValue(mockResponse);

      const templateData = { nomContact: 'Test' };

      const result = await emailService.sendTemplatedMail(
        'formulaire',
        templateData,
        'test@example.com',
        false
      );

      expect(httpsCallable).toHaveBeenCalledWith(expect.any(Object), 'sendEmail');
      expect(result.success).toBe(true);
    });
  });

  describe('Gestion d\'erreurs', () => {
    it('devrait propager les erreurs Firebase', async () => {
      const firebaseError = {
        code: 'functions/permission-denied',
        message: 'Missing or insufficient permissions.'
      };
      mockCallable.mockRejectedValue(firebaseError);

      const emailData = {
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>'
      };

      await expect(emailService.sendMail(emailData))
        .rejects.toThrow('Missing or insufficient permissions.');
    });

    it('devrait gérer les erreurs réseau', async () => {
      const networkError = new Error('Network request failed');
      mockCallable.mockRejectedValue(networkError);

      const emailData = {
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>'
      };

      await expect(emailService.sendMail(emailData))
        .rejects.toThrow('Network request failed');
    });
  });
});