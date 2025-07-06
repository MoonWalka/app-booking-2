/**
 * Tests d'intégration pour le workflow complet d'envoi d'emails via Brevo
 * Teste l'interaction entre UI, services et Cloud Functions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';

// Components à tester
import ParametresEmail from '../../components/parametres/ParametresEmail';
import { ParametresProvider } from '../../context/ParametresContext';
import { AuthContext } from '../../context/AuthContext';
import { OrganizationContext } from '../../context/OrganizationContext';

// Services
import emailService from '../../services/emailService';
import brevoTemplateService from '../../services/brevoTemplateService';

// Mock Firebase Functions
jest.mock('firebase/functions', () => ({
  httpsCallable: jest.fn()
}));

// Mock Firebase service
jest.mock('../../services/firebase-service', () => ({
  functions: {},
  db: {}
}));

// Mock crypto utils
jest.mock('../../utils/cryptoUtils', () => ({
  isEncrypted: jest.fn((data) => data && data.startsWith('ENC:')),
  validateEncryptedApiKey: jest.fn(() => true),
  encryptData: jest.fn((data) => `ENC:${data}`),
  decryptData: jest.fn((data) => data.replace('ENC:', ''))
}));

// Mock log utils
jest.mock('../../utils/logUtils', () => ({
  debugLog: jest.fn()
}));

describe('Intégration Email Brevo - Workflow Complet', () => {
  let mockCallable;
  let mockUser;
  let mockOrganization;

  beforeEach(() => {
    mockCallable = jest.fn();
    httpsCallable.mockReturnValue(mockCallable);

    mockUser = {
      uid: 'test-user-123',
      email: 'admin@test.com'
    };

    mockOrganization = {
      id: 'test-org-456',
      nom: 'Organisation Test'
    };

    jest.clearAllMocks();
  });

  const TestWrapper = ({ children }) => (
    <BrowserRouter>
      <AuthContext.Provider value={{ user: mockUser }}>
        <OrganizationContext.Provider value={{ 
          currentOrganization: mockOrganization,
          organizations: [mockOrganization]
        }}>
          <ParametresProvider>
            {children}
          </ParametresProvider>
        </OrganizationContext.Provider>
      </AuthContext.Provider>
    </BrowserRouter>
  );

  describe('Configuration Brevo Complète', () => {
    it('devrait permettre la configuration complète de Brevo avec templates', async () => {
      const user = userEvent.setup();

      // Mock des réponses Cloud Functions
      mockCallable
        .mockResolvedValueOnce({ // validateBrevoKey
          data: { valid: true }
        })
        .mockResolvedValueOnce({ // getBrevoTemplates
          data: {
            templates: [
              { id: 1, name: 'Formulaire Date' },
              { id: 2, name: 'Contrat Artiste' },
              { id: 3, name: 'Relance Documents' }
            ]
          }
        });

      render(
        <TestWrapper>
          <ParametresEmail />
        </TestWrapper>
      );

      // Étape 1: Sélectionner Brevo
      await user.click(screen.getByLabelText('Brevo (recommandé)'));
      expect(screen.getByText('Configuration Brevo')).toBeInTheDocument();

      // Étape 2: Activer Brevo
      await user.click(screen.getByLabelText(/Activer l'envoi d'emails via Brevo/));

      // Étape 3: Configurer la clé API
      const apiKeyInput = screen.getByPlaceholderText('xkeysib-...');
      await user.type(apiKeyInput, 'xkeysib-valid-test-key-123');

      const fromEmailInput = screen.getByLabelText('Email d\'expédition');
      await user.type(fromEmailInput, 'noreply@test.com');

      const fromNameInput = screen.getByLabelText('Nom d\'expédition');
      await user.clear(fromNameInput);
      await user.type(fromNameInput, 'TourCraft Test');

      // Étape 4: Valider la clé API
      const validateButton = screen.getByText('Valider');
      await user.click(validateButton);

      // Vérifier que les Cloud Functions sont appelées
      await waitFor(() => {
        expect(httpsCallable).toHaveBeenCalledWith(expect.any(Object), 'validateBrevoKey');
        expect(httpsCallable).toHaveBeenCalledWith(expect.any(Object), 'getBrevoTemplates');
      });

      // Vérifier que les templates apparaissent
      await waitFor(() => {
        expect(screen.getByText('Association des templates')).toBeInTheDocument();
        expect(screen.getByText(/Formulaire Date/)).toBeInTheDocument();
      });

      // Étape 5: Associer les templates
      const formulaireSelect = screen.getByDisplayValue('', { name: /Template formulaire/ });
      await user.selectOptions(formulaireSelect, '1');

      const contratSelect = screen.getAllByDisplayValue('')[1];
      await user.selectOptions(contratSelect, '2');

      const relanceSelect = screen.getAllByDisplayValue('')[2];
      await user.selectOptions(relanceSelect, '3');

      // Étape 6: Sauvegarder la configuration
      const saveButton = screen.getByText('Enregistrer les paramètres');
      await user.click(saveButton);

      // Vérifier que la sauvegarde est réussie
      await waitFor(() => {
        expect(screen.getByText(/Paramètres email sauvegardés avec succès/)).toBeInTheDocument();
      });
    });

    it('devrait tester l\'envoi d\'email après configuration', async () => {
      const user = userEvent.setup();

      // Mock configuration Brevo valide
      mockCallable
        .mockResolvedValueOnce({ data: { valid: true } })
        .mockResolvedValueOnce({ 
          data: { 
            templates: [{ id: 1, name: 'Test Template' }] 
          } 
        })
        .mockResolvedValueOnce({ // sendUnifiedEmail pour test
          data: {
            success: true,
            messageId: 'brevo-test-123',
            provider: 'brevo'
          }
        });

      render(
        <TestWrapper>
          <ParametresEmail />
        </TestWrapper>
      );

      // Configuration rapide
      await user.click(screen.getByLabelText('Brevo (recommandé)'));
      await user.click(screen.getByLabelText(/Activer l'envoi d'emails via Brevo/));
      
      const apiKeyInput = screen.getByPlaceholderText('xkeysib-...');
      await user.type(apiKeyInput, 'xkeysib-test-key');
      await user.click(screen.getByText('Valider'));

      // Attendre le chargement des templates
      await waitFor(() => {
        expect(screen.getByText('Test de configuration')).toBeInTheDocument();
      });

      // Test d'envoi
      const testEmailInput = screen.getByPlaceholderText('test@example.com');
      await user.type(testEmailInput, 'test.integration@example.com');

      const sendTestButton = screen.getByText('Envoyer');
      await user.click(sendTestButton);

      // Vérifier l'appel à sendUnifiedEmail
      await waitFor(() => {
        expect(httpsCallable).toHaveBeenCalledWith(expect.any(Object), 'sendUnifiedEmail');
        expect(mockCallable).toHaveBeenCalledWith(
          expect.objectContaining({
            to: 'test.integration@example.com',
            subject: expect.stringContaining('Test TourCraft'),
            isTest: true
          })
        );
      });

      // Vérifier le message de succès
      await waitFor(() => {
        expect(screen.getByText(/Email de test envoyé avec succès/)).toBeInTheDocument();
      });
    });
  });

  describe('Workflow d\'envoi de templates typés', () => {
    it('devrait envoyer un email de formulaire via brevoTemplateService', async () => {
      // Mock de réponse réussie
      mockCallable.mockResolvedValue({
        data: {
          success: true,
          messageId: 'brevo-formulaire-456',
          provider: 'brevo'
        }
      });

      const contactData = {
        email: 'artiste@test.com',
        nom: 'Jean Musicien'
      };

      const dateData = {
        nom: 'Festival Jazz 2024',
        date: new Date('2024-08-15T20:00:00Z')
      };

      const lienFormulaire = 'https://tourcraft.app/formulaire/abc123';
      const organizationId = mockOrganization.id;

      const result = await brevoTemplateService.sendFormulaireEmail(
        contactData,
        dateData,
        lienFormulaire,
        organizationId
      );

      // Vérifier l'appel à Cloud Function
      expect(httpsCallable).toHaveBeenCalledWith(expect.any(Object), 'sendUnifiedEmail');
      expect(mockCallable).toHaveBeenCalledWith({
        to: 'artiste@test.com',
        templateType: 'formulaire',
        templateData: {
          params: {
            nomContact: 'Jean Musicien',
            nomDate: 'Festival Jazz 2024',
            lienFormulaire: 'https://tourcraft.app/formulaire/abc123',
            dateEcheance: expect.any(String),
            dateDate: expect.any(String)
          }
        },
        organizationId: 'test-org-456'
      });

      expect(result.success).toBe(true);
      expect(result.provider).toBe('brevo');
    });

    it('devrait envoyer un email de contrat avec fallback SMTP', async () => {
      // Mock échec Brevo puis succès SMTP
      mockCallable.mockResolvedValue({
        data: {
          success: true,
          messageId: 'smtp-contrat-789',
          provider: 'smtp',
          fallbackUsed: true
        }
      });

      const contactData = {
        email: 'manager@test.com',
        nom: 'Marie Manager'
      };

      const dateData = {
        nom: 'Date Rock 2024',
        date: new Date('2024-09-20T21:00:00Z')
      };

      const result = await brevoTemplateService.sendContratEmail(
        contactData,
        dateData,
        mockOrganization.id
      );

      expect(result.success).toBe(true);
      expect(result.provider).toBe('smtp');
      expect(result.fallbackUsed).toBe(true);
    });

    it('devrait envoyer des emails en batch avec gestion d\'erreurs', async () => {
      // Mock réponses mixtes (succès/échec)
      mockCallable
        .mockResolvedValueOnce({
          data: { success: true, messageId: 'batch-1' }
        })
        .mockRejectedValueOnce(new Error('Erreur temporaire'))
        .mockResolvedValueOnce({
          data: { success: true, messageId: 'batch-3' }
        });

      const contacts = [
        { email: 'contact1@test.com', nom: 'Contact 1' },
        { email: 'contact2@test.com', nom: 'Contact 2' },
        { email: 'contact3@test.com', nom: 'Contact 3' }
      ];

      const results = await brevoTemplateService.sendBatchEmails(
        contacts,
        'relance',
        {
          sujet: 'Rappel important',
          message: 'Merci de nous retourner les documents.'
        },
        mockOrganization.id
      );

      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBe('Erreur temporaire');
      expect(results[2].success).toBe(true);
    });
  });

  describe('Gestion d\'erreurs et retry', () => {
    it('devrait gérer les erreurs de validation API Brevo', async () => {
      const user = userEvent.setup();

      // Mock erreur de validation
      mockCallable.mockRejectedValue({
        code: 'functions/invalid-argument',
        message: 'Clé API Brevo invalide'
      });

      render(
        <TestWrapper>
          <ParametresEmail />
        </TestWrapper>
      );

      await user.click(screen.getByLabelText('Brevo (recommandé)'));
      await user.click(screen.getByLabelText(/Activer l'envoi d'emails via Brevo/));

      const apiKeyInput = screen.getByPlaceholderText('xkeysib-...');
      await user.type(apiKeyInput, 'invalid-key');

      const validateButton = screen.getByText('Valider');
      await user.click(validateButton);

      await waitFor(() => {
        expect(screen.getByText(/Erreur validation Brevo/)).toBeInTheDocument();
      });
    });

    it('devrait gérer les timeouts de Cloud Functions', async () => {
      // Mock timeout
      mockCallable.mockRejectedValue(new Error('Request timeout'));

      await expect(
        emailService.sendUnifiedEmail({
          to: 'test@example.com',
          subject: 'Test Timeout',
          htmlContent: '<p>Test</p>',
          organizationId: mockOrganization.id
        })
      ).rejects.toThrow('Request timeout');
    });

    it('devrait retry automatiquement en cas d\'erreur temporaire', async () => {
      // Mock qui échoue puis réussit
      mockCallable
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce({
          data: {
            success: true,
            messageId: 'retry-success-123',
            attempts: 2
          }
        });

      const result = await emailService.sendUnifiedEmail({
        to: 'test@example.com',
        subject: 'Test Retry',
        htmlContent: '<p>Test retry</p>',
        organizationId: mockOrganization.id
      });

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(2);
    });
  });

  describe('Sécurité et validation', () => {
    it('devrait chiffrer la clé API avant sauvegarde', async () => {
      const user = userEvent.setup();

      mockCallable.mockResolvedValue({ data: { valid: true } });

      render(
        <TestWrapper>
          <ParametresEmail />
        </TestWrapper>
      );

      await user.click(screen.getByLabelText('Brevo (recommandé)'));
      await user.click(screen.getByLabelText(/Activer l'envoi d'emails via Brevo/));

      const apiKeyInput = screen.getByPlaceholderText('xkeysib-...');
      await user.type(apiKeyInput, 'xkeysib-secret-key');

      await user.click(screen.getByText('Valider'));
      await user.click(screen.getByText('Enregistrer les paramètres'));

      // Vérifier que la clé est chiffrée (mock encryptData)
      const { encryptData } = require('../../utils/cryptoUtils');
      expect(encryptData).toHaveBeenCalledWith('xkeysib-secret-key');
    });

    it('devrait valider les emails avant envoi', async () => {
      await expect(
        brevoTemplateService.sendFormulaireEmail(
          { email: 'invalid-email', nom: 'Test' },
          { nom: 'Date' },
          'https://example.com',
          mockOrganization.id
        )
      ).rejects.toThrow('Email contact invalide');
    });

    it('devrait vérifier les permissions utilisateur', async () => {
      // Mock erreur de permissions
      mockCallable.mockRejectedValue({
        code: 'functions/permission-denied',
        message: 'Insufficient permissions'
      });

      await expect(
        emailService.sendUnifiedEmail({
          to: 'test@example.com',
          subject: 'Test',
          htmlContent: '<p>Test</p>',
          organizationId: 'unauthorized-org'
        })
      ).rejects.toThrow('Insufficient permissions');
    });
  });

  describe('Performance et optimisation', () => {
    it('devrait charger les templates en cache', async () => {
      const user = userEvent.setup();

      mockCallable
        .mockResolvedValueOnce({ data: { valid: true } })
        .mockResolvedValueOnce({
          data: {
            templates: [{ id: 1, name: 'Cached Template' }]
          }
        });

      render(
        <TestWrapper>
          <ParametresEmail />
        </TestWrapper>
      );

      await user.click(screen.getByLabelText('Brevo (recommandé)'));
      await user.click(screen.getByLabelText(/Activer l'envoi d'emails via Brevo/));

      const apiKeyInput = screen.getByPlaceholderText('xkeysib-...');
      await user.type(apiKeyInput, 'xkeysib-test-key');
      await user.click(screen.getByText('Valider'));

      // Première validation charge les templates
      expect(httpsCallable).toHaveBeenCalledWith(expect.any(Object), 'getBrevoTemplates');

      // Deuxième validation ne devrait pas recharger
      jest.clearAllMocks();
      await user.click(screen.getByText('Valider'));

      // Vérifier qu'une seule requête de validation est faite
      expect(httpsCallable).toHaveBeenCalledWith(expect.any(Object), 'validateBrevoKey');
      expect(httpsCallable).not.toHaveBeenCalledWith(expect.any(Object), 'getBrevoTemplates');
    });

    it('devrait gérer les envois simultanés sans conflit', async () => {
      const promises = [];

      mockCallable.mockImplementation(() => 
        Promise.resolve({
          data: {
            success: true,
            messageId: `concurrent-${Math.random()}`,
            provider: 'brevo'
          }
        })
      );

      // Lancer 5 envois simultanés
      for (let i = 0; i < 5; i++) {
        promises.push(
          emailService.sendUnifiedEmail({
            to: `test${i}@example.com`,
            subject: `Test Concurrent ${i}`,
            htmlContent: `<p>Test ${i}</p>`,
            organizationId: mockOrganization.id
          })
        );
      }

      const results = await Promise.all(promises);

      // Tous les envois devraient réussir
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.messageId).toBeTruthy();
      });

      // 5 appels Cloud Function
      expect(mockCallable).toHaveBeenCalledTimes(5);
    });
  });
});