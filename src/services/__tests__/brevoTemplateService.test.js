/**
 * Tests unitaires pour brevoTemplateService.js
 * Teste la gestion des templates Brevo et l'envoi d'emails typés
 */

import brevoTemplateService from '../brevoTemplateService';
import emailService from '../emailService';

// Mock du service email principal
jest.mock('../emailService', () => ({
  sendUnifiedEmail: jest.fn(),
  validateEmail: jest.fn(),
  testBrevoTemplate: jest.fn()
}));

describe('BrevoTemplateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    emailService.validateEmail.mockImplementation((email) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    });
  });

  describe('validateTemplateVariables()', () => {
    it('devrait valider les variables requises pour le template formulaire', () => {
      const validData = {
        nomContact: 'Jean Dupont',
        nomDate: 'Festival 2024',
        lienFormulaire: 'https://example.com/form/123',
        dateEcheance: '2024-12-31'
      };

      expect(() => {
        brevoTemplateService.validateTemplateVariables('formulaire', validData);
      }).not.toThrow();
    });

    it('devrait rejeter les données incomplètes pour formulaire', () => {
      const incompleteData = {
        nomContact: 'Jean Dupont'
        // manque: nomDate, lienFormulaire
      };

      expect(() => {
        brevoTemplateService.validateTemplateVariables('formulaire', incompleteData);
      }).toThrow('Variable requise manquante: nomDate');
    });

    it('devrait valider les variables pour le template contrat', () => {
      const validData = {
        nomContact: 'Marie Martin',
        nomDate: 'Date Jazz',
        dateSignature: '2024-11-15'
      };

      expect(() => {
        brevoTemplateService.validateTemplateVariables('contrat', validData);
      }).not.toThrow();
    });

    it('devrait valider les variables pour le template relance', () => {
      const validData = {
        nomContact: 'Pierre Durand',
        sujet: 'Documents manquants',
        message: 'Merci de nous renvoyer les documents.'
      };

      expect(() => {
        brevoTemplateService.validateTemplateVariables('relance', validData);
      }).not.toThrow();
    });

    it('devrait rejeter un type de template inconnu', () => {
      expect(() => {
        brevoTemplateService.validateTemplateVariables('inexistant', {});
      }).toThrow('Type de template inconnu: inexistant');
    });
  });

  describe('formatTemplateVariables()', () => {
    it('devrait formater les variables avec le préfixe params', () => {
      const rawData = {
        nomContact: 'Jean Dupont',
        nomDate: 'Festival 2024',
        lienFormulaire: 'https://example.com/form'
      };

      const formatted = brevoTemplateService.formatTemplateVariables(rawData);

      expect(formatted).toEqual({
        params: {
          nomContact: 'Jean Dupont',
          nomDate: 'Festival 2024',
          lienFormulaire: 'https://example.com/form'
        }
      });
    });

    it('devrait gérer les valeurs nulles et undefined', () => {
      const rawData = {
        nomContact: 'Jean Dupont',
        nomDate: null,
        lienFormulaire: undefined,
        dateEcheance: ''
      };

      const formatted = brevoTemplateService.formatTemplateVariables(rawData);

      expect(formatted.params).toEqual({
        nomContact: 'Jean Dupont',
        nomDate: '',
        lienFormulaire: '',
        dateEcheance: ''
      });
    });

    it('devrait préserver les objets imbriqués', () => {
      const rawData = {
        nomContact: 'Jean Dupont',
        concert: {
          nom: 'Festival 2024',
          date: '2024-12-31',
          lieu: {
            nom: 'Salle de concert',
            adresse: '123 Rue de la Musique'
          }
        }
      };

      const formatted = brevoTemplateService.formatTemplateVariables(rawData);

      expect(formatted.params.concert).toEqual(rawData.concert);
    });
  });

  describe('sendFormulaireEmail()', () => {
    it('devrait envoyer un email de formulaire avec les bonnes données', async () => {
      const mockResponse = {
        success: true,
        messageId: 'brevo-123',
        provider: 'brevo'
      };
      emailService.sendUnifiedEmail.mockResolvedValue(mockResponse);

      const contactData = {
        email: 'test@example.com',
        nom: 'Jean Dupont'
      };

      const dateData = {
        nom: 'Festival Summer 2024',
        date: new Date('2024-07-15')
      };

      const lienFormulaire = 'https://tourcraft.app/form/abc123';
      const entrepriseId = 'org-456';

      const result = await brevoTemplateService.sendFormulaireEmail(
        contactData,
        dateData,
        lienFormulaire,
        entrepriseId
      );

      expect(emailService.sendUnifiedEmail).toHaveBeenCalledWith({
        to: 'test@example.com',
        templateType: 'formulaire',
        templateData: {
          params: {
            nomContact: 'Jean Dupont',
            nomDate: 'Festival Summer 2024',
            lienFormulaire: 'https://tourcraft.app/form/abc123',
            dateEcheance: expect.any(String),
            dateDate: expect.any(String)
          }
        },
        entrepriseId: 'org-456'
      });

      expect(result).toEqual(mockResponse);
    });

    it('devrait valider les données requises', async () => {
      await expect(
        brevoTemplateService.sendFormulaireEmail(null, {}, '', '')
      ).rejects.toThrow('Données contact requises');

      await expect(
        brevoTemplateService.sendFormulaireEmail({}, null, '', '')
      ).rejects.toThrow('Données date requises');

      await expect(
        brevoTemplateService.sendFormulaireEmail(
          { email: 'test@example.com' },
          { nom: 'Date' },
          '',
          ''
        )
      ).rejects.toThrow('Lien formulaire requis');
    });

    it('devrait valider le format email', async () => {
      const contactData = { email: 'invalid-email', nom: 'Jean Dupont' };
      const dateData = { nom: 'Date' };

      emailService.validateEmail.mockReturnValue(false);

      await expect(
        brevoTemplateService.sendFormulaireEmail(
          contactData,
          dateData,
          'https://example.com',
          'org-123'
        )
      ).rejects.toThrow('Email contact invalide');
    });

    it('devrait calculer automatiquement la date d\'échéance', async () => {
      emailService.sendUnifiedEmail.mockResolvedValue({ success: true });

      const contactData = { email: 'test@example.com', nom: 'Jean Dupont' };
      const dateData = { 
        nom: 'Date', 
        date: new Date('2024-12-31') 
      };

      await brevoTemplateService.sendFormulaireEmail(
        contactData,
        dateData,
        'https://example.com',
        'org-123'
      );

      const callArgs = emailService.sendUnifiedEmail.mock.calls[0][0];
      const dateEcheance = callArgs.templateData.params.dateEcheance;
      
      expect(dateEcheance).toBeTruthy();
      expect(typeof dateEcheance).toBe('string');
      // Vérifier que c'est une date future mais avant le concert
      const echeanceDate = new Date(dateEcheance);
      const dateDate = new Date('2024-12-31');
      expect(echeanceDate.getTime()).toBeLessThan(dateDate.getTime());
    });
  });

  describe('sendContratEmail()', () => {
    it('devrait envoyer un email de contrat', async () => {
      const mockResponse = { success: true, messageId: 'contrat-456' };
      emailService.sendUnifiedEmail.mockResolvedValue(mockResponse);

      const contactData = { email: 'artist@example.com', nom: 'Artiste Pro' };
      const dateData = { nom: 'Date Gala', date: new Date('2024-11-20') };
      const entrepriseId = 'org-789';

      const result = await brevoTemplateService.sendContratEmail(
        contactData,
        dateData,
        entrepriseId
      );

      expect(emailService.sendUnifiedEmail).toHaveBeenCalledWith({
        to: 'artist@example.com',
        templateType: 'contrat',
        templateData: {
          params: {
            nomContact: 'Artiste Pro',
            nomDate: 'Date Gala',
            dateSignature: expect.any(String),
            dateDate: expect.any(String)
          }
        },
        entrepriseId: 'org-789'
      });

      expect(result).toEqual(mockResponse);
    });

    it('devrait calculer la date de signature limite', async () => {
      emailService.sendUnifiedEmail.mockResolvedValue({ success: true });

      const contactData = { email: 'test@example.com', nom: 'Test' };
      const dateData = { 
        nom: 'Date', 
        date: new Date('2024-12-25') 
      };

      await brevoTemplateService.sendContratEmail(
        contactData,
        dateData,
        'org-123'
      );

      const callArgs = emailService.sendUnifiedEmail.mock.calls[0][0];
      const dateSignature = callArgs.templateData.params.dateSignature;
      
      expect(dateSignature).toBeTruthy();
      // La date de signature devrait être avant le concert
      const signatureDate = new Date(dateSignature);
      const dateDate = new Date('2024-12-25');
      expect(signatureDate.getTime()).toBeLessThan(dateDate.getTime());
    });
  });

  describe('sendRelanceEmail()', () => {
    it('devrait envoyer un email de relance personnalisé', async () => {
      const mockResponse = { success: true, messageId: 'relance-789' };
      emailService.sendUnifiedEmail.mockResolvedValue(mockResponse);

      const contactData = { email: 'contact@example.com', nom: 'Contact Pro' };
      const sujet = 'Documents manquants pour votre concert';
      const message = 'Nous attendons encore vos documents techniques.';
      const entrepriseId = 'org-101';

      const result = await brevoTemplateService.sendRelanceEmail(
        contactData,
        sujet,
        message,
        entrepriseId
      );

      expect(emailService.sendUnifiedEmail).toHaveBeenCalledWith({
        to: 'contact@example.com',
        templateType: 'relance',
        templateData: {
          params: {
            nomContact: 'Contact Pro',
            sujet: 'Documents manquants pour votre concert',
            message: 'Nous attendons encore vos documents techniques.'
          }
        },
        entrepriseId: 'org-101'
      });

      expect(result).toEqual(mockResponse);
    });

    it('devrait valider les paramètres de relance', async () => {
      const contactData = { email: 'test@example.com', nom: 'Test' };

      await expect(
        brevoTemplateService.sendRelanceEmail(contactData, '', 'message', 'org')
      ).rejects.toThrow('Sujet de relance requis');

      await expect(
        brevoTemplateService.sendRelanceEmail(contactData, 'sujet', '', 'org')
      ).rejects.toThrow('Message de relance requis');
    });
  });

  describe('sendConfirmationEmail()', () => {
    it('devrait envoyer un email de confirmation', async () => {
      const mockResponse = { success: true, messageId: 'confirm-101' };
      emailService.sendUnifiedEmail.mockResolvedValue(mockResponse);

      const contactData = { email: 'confirmed@example.com', nom: 'Contact Confirmé' };
      const dateData = { nom: 'Date Final', date: new Date('2024-10-30') };
      const entrepriseId = 'org-202';

      const result = await brevoTemplateService.sendConfirmationEmail(
        contactData,
        dateData,
        entrepriseId
      );

      expect(emailService.sendUnifiedEmail).toHaveBeenCalledWith({
        to: 'confirmed@example.com',
        templateType: 'confirmation',
        templateData: {
          params: {
            nomContact: 'Contact Confirmé',
            nomDate: 'Date Final',
            dateDate: expect.any(String)
          }
        },
        entrepriseId: 'org-202'
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('sendBatchEmails()', () => {
    it('devrait envoyer des emails à plusieurs contacts', async () => {
      const mockResponse = { success: true, messageId: 'batch-123' };
      emailService.sendUnifiedEmail.mockResolvedValue(mockResponse);

      const contacts = [
        { email: 'contact1@example.com', nom: 'Contact 1' },
        { email: 'contact2@example.com', nom: 'Contact 2' },
        { email: 'contact3@example.com', nom: 'Contact 3' }
      ];

      const templateType = 'relance';
      const baseData = {
        sujet: 'Rappel important',
        message: 'Message de rappel'
      };
      const entrepriseId = 'org-batch';

      const results = await brevoTemplateService.sendBatchEmails(
        contacts,
        templateType,
        baseData,
        entrepriseId
      );

      expect(emailService.sendUnifiedEmail).toHaveBeenCalledTimes(3);
      expect(results).toHaveLength(3);
      
      // Vérifier que chaque email a les bonnes données personnalisées
      const calls = emailService.sendUnifiedEmail.mock.calls;
      
      expect(calls[0][0].to).toBe('contact1@example.com');
      expect(calls[0][0].templateData.params.nomContact).toBe('Contact 1');
      
      expect(calls[1][0].to).toBe('contact2@example.com');
      expect(calls[1][0].templateData.params.nomContact).toBe('Contact 2');
      
      expect(calls[2][0].to).toBe('contact3@example.com');
      expect(calls[2][0].templateData.params.nomContact).toBe('Contact 3');
    });

    it('devrait gérer les erreurs individuelles sans arrêter le batch', async () => {
      emailService.sendUnifiedEmail
        .mockResolvedValueOnce({ success: true, messageId: 'ok-1' })
        .mockRejectedValueOnce(new Error('Erreur email 2'))
        .mockResolvedValueOnce({ success: true, messageId: 'ok-3' });

      const contacts = [
        { email: 'ok1@example.com', nom: 'OK 1' },
        { email: 'error@example.com', nom: 'Error' },
        { email: 'ok3@example.com', nom: 'OK 3' }
      ];

      const results = await brevoTemplateService.sendBatchEmails(
        contacts,
        'relance',
        { sujet: 'Test', message: 'Test' },
        'org-batch'
      );

      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBe('Erreur email 2');
      expect(results[2].success).toBe(true);
    });

    it('devrait valider les contacts en batch', async () => {
      const invalidContacts = [
        { email: 'invalid-email', nom: 'Invalid' }
      ];

      emailService.validateEmail.mockReturnValue(false);

      const results = await brevoTemplateService.sendBatchEmails(
        invalidContacts,
        'relance',
        { sujet: 'Test', message: 'Test' },
        'org-test'
      );

      expect(results[0].success).toBe(false);
      expect(results[0].error).toContain('Email invalide');
      expect(emailService.sendUnifiedEmail).not.toHaveBeenCalled();
    });
  });

  describe('generateDemoData()', () => {
    it('devrait générer des données de démo pour formulaire', () => {
      const demoData = brevoTemplateService.generateDemoData('formulaire');

      expect(demoData).toHaveProperty('nomContact');
      expect(demoData).toHaveProperty('nomDate');
      expect(demoData).toHaveProperty('lienFormulaire');
      expect(demoData).toHaveProperty('dateEcheance');
      expect(demoData.lienFormulaire).toContain('https://');
    });

    it('devrait générer des données de démo pour contrat', () => {
      const demoData = brevoTemplateService.generateDemoData('contrat');

      expect(demoData).toHaveProperty('nomContact');
      expect(demoData).toHaveProperty('nomDate');
      expect(demoData).toHaveProperty('dateSignature');
    });

    it('devrait générer des données de démo pour relance', () => {
      const demoData = brevoTemplateService.generateDemoData('relance');

      expect(demoData).toHaveProperty('nomContact');
      expect(demoData).toHaveProperty('sujet');
      expect(demoData).toHaveProperty('message');
    });

    it('devrait générer des données de démo pour confirmation', () => {
      const demoData = brevoTemplateService.generateDemoData('confirmation');

      expect(demoData).toHaveProperty('nomContact');
      expect(demoData).toHaveProperty('nomDate');
      expect(demoData).toHaveProperty('dateDate');
    });

    it('devrait gérer un type de template inconnu', () => {
      expect(() => {
        brevoTemplateService.generateDemoData('inexistant');
      }).toThrow('Type de template inconnu: inexistant');
    });
  });

  describe('Utilitaires de date', () => {
    it('devrait formater les dates correctement', async () => {
      emailService.sendUnifiedEmail.mockResolvedValue({ success: true });

      const contactData = { email: 'test@example.com', nom: 'Test' };
      const dateData = { 
        nom: 'Date', 
        date: new Date('2024-12-31T20:00:00Z') 
      };

      await brevoTemplateService.sendFormulaireEmail(
        contactData,
        dateData,
        'https://example.com',
        'org-123'
      );

      const callArgs = emailService.sendUnifiedEmail.mock.calls[0][0];
      const dateDate = callArgs.templateData.params.dateDate;
      
      expect(dateDate).toBeTruthy();
      expect(typeof dateDate).toBe('string');
      // Vérifier le format de date française
      expect(dateDate).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('devrait gérer les dates nulles ou invalides', async () => {
      emailService.sendUnifiedEmail.mockResolvedValue({ success: true });

      const contactData = { email: 'test@example.com', nom: 'Test' };
      const dateData = { nom: 'Date', date: null };

      await brevoTemplateService.sendFormulaireEmail(
        contactData,
        dateData,
        'https://example.com',
        'org-123'
      );

      const callArgs = emailService.sendUnifiedEmail.mock.calls[0][0];
      const dateDate = callArgs.templateData.params.dateDate;
      
      expect(dateDate).toBe('Date à définir');
    });
  });
});