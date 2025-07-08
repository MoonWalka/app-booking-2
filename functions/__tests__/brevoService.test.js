/**
 * Tests unitaires pour le service Brevo
 * Teste les fonctionnalités d'envoi d'email via l'API Brevo
 */

const { BrevoEmailService, UnifiedEmailService } = require('../brevoService');

// Mock du SDK Brevo
jest.mock('@getbrevo/brevo', () => ({
  TransactionalEmailsApi: jest.fn().mockImplementation(() => ({
    setApiKey: jest.fn(),
    sendTransacEmail: jest.fn(),
    getTemplates: jest.fn()
  })),
  TransactionalEmailsApiApiKeys: {
    apiKey: 'mock-api-key'
  },
  SendTransacEmail: jest.fn(),
  SendSmtpEmail: jest.fn(),
  SendSmtpEmailSender: jest.fn(),
  SendSmtpEmailTo: jest.fn()
}));

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn()
      }))
    }))
  }))
}));

// Mock Firebase Functions
jest.mock('firebase-functions', () => ({
  config: jest.fn(() => ({
    smtp: {
      host: 'smtp.test.com',
      port: '587',
      user: 'test@test.com',
      pass: 'testpass',
      from: 'noreply@test.com'
    }
  }))
}));

// Mock crypto utils
jest.mock('../cryptoUtils', () => ({
  decryptData: jest.fn((data) => {
    if (data.startsWith('ENC:')) {
      return data.replace('ENC:', '');
    }
    return data;
  })
}));

describe('BrevoEmailService', () => {
  let brevoService;
  let mockBrevoApi;

  beforeEach(() => {
    const { TransactionalEmailsApi } = require('@getbrevo/brevo');
    mockBrevoApi = new TransactionalEmailsApi();
    brevoService = new BrevoEmailService();
    jest.clearAllMocks();
  });

  describe('init()', () => {
    it('devrait initialiser le service avec une clé API valide', () => {
      const apiKey = 'xkeysib-test-key';
      
      brevoService.init(apiKey);
      
      expect(brevoService.apiKey).toBe(apiKey);
      expect(brevoService.isInitialized).toBe(true);
      expect(mockBrevoApi.setApiKey).toHaveBeenCalledWith(
        expect.any(Object),
        apiKey
      );
    });

    it('devrait rejeter avec une clé API invalide', () => {
      expect(() => {
        brevoService.init('');
      }).toThrow('Clé API Brevo requise');

      expect(() => {
        brevoService.init(null);
      }).toThrow('Clé API Brevo requise');
    });
  });

  describe('validateEmail()', () => {
    it('devrait valider les emails corrects', () => {
      const validEmails = [
        'test@example.com',
        'user.name+tag@domain.co.uk',
        'x@example.com'
      ];

      validEmails.forEach(email => {
        expect(brevoService.validateEmail(email)).toBe(true);
      });
    });

    it('devrait rejeter les emails incorrects', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user@domain',
        '',
        null,
        undefined
      ];

      invalidEmails.forEach(email => {
        expect(brevoService.validateEmail(email)).toBe(false);
      });
    });
  });

  describe('htmlToText()', () => {
    it('devrait convertir HTML en texte simple', () => {
      const html = `
        <html>
          <body>
            <h1>Titre principal</h1>
            <p>Paragraphe avec <strong>texte en gras</strong></p>
            <ul>
              <li>Point 1</li>
              <li>Point 2</li>
            </ul>
            <a href="https://example.com">Lien</a>
          </body>
        </html>
      `;

      const result = brevoService.htmlToText(html);
      
      expect(result).toContain('Titre principal');
      expect(result).toContain('Paragraphe avec texte en gras');
      expect(result).toContain('Point 1');
      expect(result).toContain('Point 2');
      expect(result).toContain('Lien');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('devrait gérer le texte vide', () => {
      expect(brevoService.htmlToText('')).toBe('');
      expect(brevoService.htmlToText(null)).toBe('');
      expect(brevoService.htmlToText(undefined)).toBe('');
    });
  });

  describe('validateApiKey()', () => {
    beforeEach(() => {
      brevoService.init('xkeysib-test-key');
    });

    it('devrait valider une clé API correcte', async () => {
      mockBrevoApi.getTemplates.mockResolvedValue({
        body: { templates: [] }
      });

      const result = await brevoService.validateApiKey();
      
      expect(result).toBe(true);
      expect(mockBrevoApi.getTemplates).toHaveBeenCalled();
    });

    it('devrait rejeter une clé API incorrecte', async () => {
      mockBrevoApi.getTemplates.mockRejectedValue({
        response: { status: 401 }
      });

      const result = await brevoService.validateApiKey();
      
      expect(result).toBe(false);
    });

    it('devrait gérer les erreurs réseau', async () => {
      mockBrevoApi.getTemplates.mockRejectedValue(new Error('Network error'));

      await expect(brevoService.validateApiKey()).rejects.toThrow('Network error');
    });
  });

  describe('getTemplateList()', () => {
    beforeEach(() => {
      brevoService.init('xkeysib-test-key');
    });

    it('devrait récupérer la liste des templates', async () => {
      const mockTemplates = {
        body: {
          templates: [
            { id: 1, name: 'Template 1', isActive: true },
            { id: 2, name: 'Template 2', isActive: true },
            { id: 3, name: 'Template 3', isActive: false }
          ]
        }
      };

      mockBrevoApi.getTemplates.mockResolvedValue(mockTemplates);

      const result = await brevoService.getTemplateList();
      
      expect(result).toHaveLength(2); // Seulement les templates actifs
      expect(result[0]).toEqual({ id: 1, name: 'Template 1' });
      expect(result[1]).toEqual({ id: 2, name: 'Template 2' });
    });

    it('devrait gérer les erreurs API', async () => {
      mockBrevoApi.getTemplates.mockRejectedValue(new Error('API Error'));

      await expect(brevoService.getTemplateList()).rejects.toThrow('API Error');
    });
  });

  describe('sendTemplateEmail()', () => {
    beforeEach(() => {
      brevoService.init('xkeysib-test-key');
    });

    it('devrait envoyer un email avec template', async () => {
      const mockResponse = {
        body: { messageId: 'test-message-id' }
      };
      mockBrevoApi.sendTransacEmail.mockResolvedValue(mockResponse);

      const params = {
        to: 'test@example.com',
        templateId: 1,
        params: { name: 'John Doe' },
        from: { email: 'sender@example.com', name: 'Sender' }
      };

      const result = await brevoService.sendTemplateEmail(params);
      
      expect(result.success).toBe(true);
      expect(result.messageId).toBe('test-message-id');
      expect(mockBrevoApi.sendTransacEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: [{ email: 'test@example.com' }],
          templateId: 1,
          params: { name: 'John Doe' },
          sender: { email: 'sender@example.com', name: 'Sender' }
        })
      );
    });

    it('devrait valider les paramètres requis', async () => {
      await expect(brevoService.sendTemplateEmail({})).rejects.toThrow('Email destinataire requis');
      await expect(brevoService.sendTemplateEmail({ to: 'test@example.com' })).rejects.toThrow('Template ID requis');
    });

    it('devrait valider le format email', async () => {
      const params = {
        to: 'invalid-email',
        templateId: 1
      };

      await expect(brevoService.sendTemplateEmail(params)).rejects.toThrow('Format email invalide');
    });

    it('devrait gérer les erreurs Brevo', async () => {
      mockBrevoApi.sendTransacEmail.mockRejectedValue({
        response: { 
          status: 400,
          body: { message: 'Template not found' }
        }
      });

      const params = {
        to: 'test@example.com',
        templateId: 999
      };

      await expect(brevoService.sendTemplateEmail(params)).rejects.toThrow('Erreur Brevo');
    });
  });

  describe('sendTransactionalEmail()', () => {
    beforeEach(() => {
      brevoService.init('xkeysib-test-key');
    });

    it('devrait envoyer un email transactionnel', async () => {
      const mockResponse = {
        body: { messageId: 'test-message-id' }
      };
      mockBrevoApi.sendTransacEmail.mockResolvedValue(mockResponse);

      const params = {
        to: 'test@example.com',
        subject: 'Test Subject',
        htmlContent: '<h1>Test Content</h1>',
        from: { email: 'sender@example.com', name: 'Sender' }
      };

      const result = await brevoService.sendTransactionalEmail(params);
      
      expect(result.success).toBe(true);
      expect(result.messageId).toBe('test-message-id');
      expect(mockBrevoApi.sendTransacEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: [{ email: 'test@example.com' }],
          subject: 'Test Subject',
          htmlContent: '<h1>Test Content</h1>',
          textContent: 'Test Content', // Converti automatiquement
          sender: { email: 'sender@example.com', name: 'Sender' }
        })
      );
    });

    it('devrait valider les paramètres requis', async () => {
      await expect(brevoService.sendTransactionalEmail({})).rejects.toThrow('Email destinataire requis');
      
      await expect(brevoService.sendTransactionalEmail({ 
        to: 'test@example.com' 
      })).rejects.toThrow('Sujet requis');
      
      await expect(brevoService.sendTransactionalEmail({ 
        to: 'test@example.com',
        subject: 'Test'
      })).rejects.toThrow('Contenu HTML requis');
    });
  });

  describe('handleBrevoError()', () => {
    it('devrait gérer les erreurs avec statut HTTP', () => {
      const error = {
        response: {
          status: 401,
          body: { message: 'Unauthorized' }
        }
      };

      expect(() => brevoService.handleBrevoError(error)).toThrow('Erreur Brevo (401): Unauthorized');
    });

    it('devrait gérer les erreurs sans réponse', () => {
      const error = new Error('Network timeout');

      expect(() => brevoService.handleBrevoError(error)).toThrow('Network timeout');
    });

    it('devrait gérer les erreurs inconnues', () => {
      const error = { weird: 'format' };

      expect(() => brevoService.handleBrevoError(error)).toThrow('Erreur Brevo inconnue');
    });
  });
});

describe('UnifiedEmailService', () => {
  let unifiedService;
  let mockFirestore;

  beforeEach(() => {
    const admin = require('firebase-admin');
    mockFirestore = {
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          get: jest.fn()
        }))
      }))
    };
    admin.firestore.mockReturnValue(mockFirestore);
    
    unifiedService = new UnifiedEmailService();
    jest.clearAllMocks();
  });

  describe('getEmailConfig()', () => {
    it('devrait récupérer la configuration email', async () => {
      const mockConfig = {
        provider: 'brevo',
        brevo: {
          enabled: true,
          apiKey: 'ENC:encrypted-key',
          fromEmail: 'noreply@example.com',
          fromName: 'Test App'
        },
        smtp: {
          enabled: false
        }
      };

      mockFirestore.collection().doc().get.mockResolvedValue({
        exists: true,
        data: () => ({ email: mockConfig })
      });

      const result = await unifiedService.getEmailConfig('org-id');
      
      expect(result.provider).toBe('brevo');
      expect(result.brevo.apiKey).toBe('encrypted-key'); // Décrypté
    });

    it('devrait retourner une configuration par défaut si non trouvée', async () => {
      mockFirestore.collection().doc().get.mockResolvedValue({
        exists: false
      });

      const result = await unifiedService.getEmailConfig('org-id');
      
      expect(result.provider).toBe('smtp');
      expect(result.brevo.enabled).toBe(false);
      expect(result.smtp.enabled).toBe(false);
    });
  });

  describe('sendUnifiedEmail()', () => {
    it('devrait utiliser Brevo si configuré et actif', async () => {
      const mockConfig = {
        provider: 'brevo',
        brevo: {
          enabled: true,
          apiKey: 'test-key',
          fromEmail: 'noreply@example.com',
          fromName: 'Test App'
        }
      };

      mockFirestore.collection().doc().get.mockResolvedValue({
        exists: true,
        data: () => ({ email: mockConfig })
      });

      // Mock du service Brevo pour réussir
      const mockBrevoSend = jest.fn().mockResolvedValue({
        success: true,
        messageId: 'brevo-message-id',
        provider: 'brevo'
      });
      
      unifiedService.brevoService = {
        init: jest.fn(),
        sendTransactionalEmail: mockBrevoSend
      };

      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        htmlContent: '<p>Test</p>',
        entrepriseId: 'org-id'
      };

      const result = await unifiedService.sendUnifiedEmail(emailData);
      
      expect(result.success).toBe(true);
      expect(result.provider).toBe('brevo');
      expect(result.messageId).toBe('brevo-message-id');
    });

    it('devrait faire un fallback vers SMTP si Brevo échoue', async () => {
      const mockConfig = {
        provider: 'brevo',
        brevo: {
          enabled: true,
          apiKey: 'test-key',
          fromEmail: 'noreply@example.com',
          fromName: 'Test App'
        },
        smtp: {
          enabled: true,
          host: 'smtp.test.com',
          user: 'test@test.com',
          pass: 'testpass'
        }
      };

      mockFirestore.collection().doc().get.mockResolvedValue({
        exists: true,
        data: () => ({ email: mockConfig })
      });

      // Mock Brevo pour échouer
      const mockBrevoSend = jest.fn().mockRejectedValue(new Error('Brevo error'));
      unifiedService.brevoService = {
        init: jest.fn(),
        sendTransactionalEmail: mockBrevoSend
      };

      // Mock SMTP pour réussir
      const mockSmtpSend = jest.fn().mockResolvedValue({
        success: true,
        messageId: 'smtp-message-id',
        provider: 'smtp'
      });
      unifiedService.smtpService = {
        sendMail: mockSmtpSend
      };

      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        htmlContent: '<p>Test</p>',
        entrepriseId: 'org-id'
      };

      const result = await unifiedService.sendUnifiedEmail(emailData);
      
      expect(result.success).toBe(true);
      expect(result.provider).toBe('smtp');
      expect(result.messageId).toBe('smtp-message-id');
      expect(result.fallbackUsed).toBe(true);
    });

    it('devrait faire des retry avec backoff exponentiel', async () => {
      const mockConfig = {
        provider: 'brevo',
        brevo: {
          enabled: true,
          apiKey: 'test-key',
          fromEmail: 'noreply@example.com'
        }
      };

      mockFirestore.collection().doc().get.mockResolvedValue({
        exists: true,
        data: () => ({ email: mockConfig })
      });

      // Mock pour échouer 2 fois puis réussir
      const mockBrevoSend = jest.fn()
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockRejectedValueOnce(new Error('Another temporary error'))
        .mockResolvedValueOnce({
          success: true,
          messageId: 'final-success-id',
          provider: 'brevo'
        });

      unifiedService.brevoService = {
        init: jest.fn(),
        sendTransactionalEmail: mockBrevoSend
      };

      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        htmlContent: '<p>Test</p>',
        entrepriseId: 'org-id'
      };

      const result = await unifiedService.sendUnifiedEmail(emailData);
      
      expect(result.success).toBe(true);
      expect(result.provider).toBe('brevo');
      expect(result.messageId).toBe('final-success-id');
      expect(result.attempts).toBe(3);
      expect(mockBrevoSend).toHaveBeenCalledTimes(3);
    });
  });
});