/**
 * Tests UI pour ParametresEmail.js
 * Teste l'interface de configuration email et les interactions utilisateur
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ParametresEmail from '../ParametresEmail';
import { useParametres } from '../../../context/ParametresContext';
import emailService from '../../../services/emailService';

// Mock des dépendances
jest.mock('../../../context/ParametresContext');
jest.mock('../../../services/emailService');
jest.mock('../../../utils/logUtils', () => ({
  debugLog: jest.fn()
}));
jest.mock('../../../utils/cryptoUtils', () => ({
  isEncrypted: jest.fn((data) => data && data.startsWith('ENC:')),
  validateEncryptedApiKey: jest.fn(() => true)
}));

// Mock des composants UI
jest.mock('../../../components/ui/Button', () => {
  return function MockButton({ children, onClick, disabled, type, variant, ...props }) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        type={type}
        className={`btn-${variant}`}
        {...props}
      >
        {children}
      </button>
    );
  };
});

describe('ParametresEmail', () => {
  const mockSauvegarderParametres = jest.fn();
  
  const defaultParametres = {
    email: {
      provider: 'smtp',
      smtp: {
        enabled: false,
        host: '',
        port: '587',
        secure: false,
        user: '',
        pass: '',
        from: '',
        fromName: 'TourCraft'
      },
      brevo: {
        enabled: false,
        apiKey: '',
        fromEmail: '',
        fromName: 'TourCraft',
        templates: {
          formulaire: '',
          relance: '',
          contrat: '',
          confirmation: ''
        }
      },
      templates: {
        useCustomTemplates: false,
        signatureName: '',
        signatureTitle: '',
        footerText: ''
      }
    }
  };

  beforeEach(() => {
    useParametres.mockReturnValue({
      parametres: defaultParametres,
      sauvegarderParametres: mockSauvegarderParametres,
      loading: false
    });
    
    emailService.validateEmail.mockReturnValue(true);
    emailService.sendTestEmail.mockResolvedValue({ success: true });
    emailService.validateBrevoApiKey.mockResolvedValue(true);
    emailService.getBrevoTemplates.mockResolvedValue([]);
    emailService.testBrevoTemplate.mockResolvedValue({ success: true });
    
    jest.clearAllMocks();
  });

  describe('Rendu initial', () => {
    it('devrait afficher le composant avec les éléments de base', () => {
      render(<ParametresEmail />);
      
      expect(screen.getByText('Configuration Email')).toBeInTheDocument();
      expect(screen.getByText('Fournisseur d\'email')).toBeInTheDocument();
      expect(screen.getByText('SMTP Classique')).toBeInTheDocument();
      expect(screen.getByText('Brevo (recommandé)')).toBeInTheDocument();
    });

    it('devrait afficher l\'état de chargement', () => {
      useParametres.mockReturnValue({
        parametres: defaultParametres,
        sauvegarderParametres: mockSauvegarderParametres,
        loading: true
      });

      render(<ParametresEmail />);
      
      expect(screen.getByText('Chargement...')).toBeInTheDocument();
    });

    it('devrait avoir SMTP sélectionné par défaut', () => {
      render(<ParametresEmail />);
      
      const smtpRadio = screen.getByLabelText('SMTP Classique');
      const brevoRadio = screen.getByLabelText('Brevo (recommandé)');
      
      expect(smtpRadio).toBeChecked();
      expect(brevoRadio).not.toBeChecked();
    });
  });

  describe('Sélection du provider', () => {
    it('devrait changer de provider quand on clique sur Brevo', async () => {
      const user = userEvent.setup();
      render(<ParametresEmail />);
      
      const brevoRadio = screen.getByLabelText('Brevo (recommandé)');
      await user.click(brevoRadio);
      
      expect(brevoRadio).toBeChecked();
      expect(screen.getByLabelText('SMTP Classique')).not.toBeChecked();
    });

    it('devrait afficher la configuration SMTP quand SMTP est sélectionné', () => {
      render(<ParametresEmail />);
      
      expect(screen.getByText('Serveur SMTP')).toBeInTheDocument();
      expect(screen.getByLabelText(/Activer l'envoi d'emails via SMTP/)).toBeInTheDocument();
    });

    it('devrait afficher la configuration Brevo quand Brevo est sélectionné', async () => {
      const user = userEvent.setup();
      render(<ParametresEmail />);
      
      await user.click(screen.getByLabelText('Brevo (recommandé)'));
      
      expect(screen.getByText('Configuration Brevo')).toBeInTheDocument();
      expect(screen.getByLabelText(/Activer l'envoi d'emails via Brevo/)).toBeInTheDocument();
    });
  });

  describe('Configuration SMTP', () => {
    it('devrait afficher les champs SMTP quand activé', async () => {
      const user = userEvent.setup();
      render(<ParametresEmail />);
      
      const smtpSwitch = screen.getByLabelText(/Activer l'envoi d'emails via SMTP/);
      await user.click(smtpSwitch);
      
      expect(screen.getByLabelText('Serveur SMTP')).toBeInTheDocument();
      expect(screen.getByLabelText('Port')).toBeInTheDocument();
      expect(screen.getByLabelText('Email d\'authentification')).toBeInTheDocument();
      expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
    });

    it('devrait permettre de sélectionner un provider SMTP prédéfini', async () => {
      const user = userEvent.setup();
      render(<ParametresEmail />);
      
      await user.click(screen.getByLabelText(/Activer l'envoi d'emails via SMTP/));
      
      const gmailButton = screen.getByText('Gmail');
      await user.click(gmailButton);
      
      const hostInput = screen.getByLabelText('Serveur SMTP');
      expect(hostInput.value).toBe('smtp.gmail.com');
    });

    it('devrait valider les champs requis SMTP', async () => {
      const user = userEvent.setup();
      render(<ParametresEmail />);
      
      await user.click(screen.getByLabelText(/Activer l'envoi d'emails via SMTP/));
      
      const hostInput = screen.getByLabelText('Serveur SMTP');
      const userInput = screen.getByLabelText('Email d\'authentification');
      const passInput = screen.getByLabelText('Mot de passe');
      const fromInput = screen.getByLabelText('Email d\'expédition');
      
      expect(hostInput).toHaveAttribute('required');
      expect(userInput).toHaveAttribute('required');
      expect(passInput).toHaveAttribute('required');
      expect(fromInput).toHaveAttribute('required');
    });

    it('devrait masquer/afficher le mot de passe SMTP', async () => {
      const user = userEvent.setup();
      render(<ParametresEmail />);
      
      await user.click(screen.getByLabelText(/Activer l'envoi d'emails via SMTP/));
      
      const passInput = screen.getByLabelText('Mot de passe');
      const toggleButton = screen.getByRole('button', { name: /eye/ });
      
      expect(passInput).toHaveAttribute('type', 'password');
      
      await user.click(toggleButton);
      expect(passInput).toHaveAttribute('type', 'text');
    });
  });

  describe('Configuration Brevo', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<ParametresEmail />);
      await user.click(screen.getByLabelText('Brevo (recommandé)'));
    });

    it('devrait afficher les champs Brevo quand activé', async () => {
      const user = userEvent.setup();
      
      await user.click(screen.getByLabelText(/Activer l'envoi d'emails via Brevo/));
      
      expect(screen.getByLabelText(/Clé API Brevo/)).toBeInTheDocument();
      expect(screen.getByLabelText('Email d\'expédition')).toBeInTheDocument();
      expect(screen.getByLabelText('Nom d\'expédition')).toBeInTheDocument();
    });

    it('devrait valider la clé API Brevo', async () => {
      const user = userEvent.setup();
      
      await user.click(screen.getByLabelText(/Activer l'envoi d'emails via Brevo/));
      
      const apiKeyInput = screen.getByPlaceholderText('xkeysib-...');
      const validateButton = screen.getByText('Valider');
      
      await user.type(apiKeyInput, 'xkeysib-test-key');
      await user.click(validateButton);
      
      expect(emailService.validateBrevoApiKey).toHaveBeenCalledWith('xkeysib-test-key');
    });

    it('devrait afficher un message de succès après validation API', async () => {
      const user = userEvent.setup();
      emailService.validateBrevoApiKey.mockResolvedValue(true);
      emailService.getBrevoTemplates.mockResolvedValue([
        { id: 1, name: 'Template 1' },
        { id: 2, name: 'Template 2' }
      ]);
      
      await user.click(screen.getByLabelText(/Activer l'envoi d'emails via Brevo/));
      
      const apiKeyInput = screen.getByPlaceholderText('xkeysib-...');
      await user.type(apiKeyInput, 'xkeysib-valid-key');
      
      const validateButton = screen.getByText('Valider');
      await user.click(validateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Clé API Brevo valide/)).toBeInTheDocument();
      });
    });

    it('devrait afficher une erreur pour une clé API invalide', async () => {
      const user = userEvent.setup();
      emailService.validateBrevoApiKey.mockResolvedValue(false);
      
      await user.click(screen.getByLabelText(/Activer l'envoi d'emails via Brevo/));
      
      const apiKeyInput = screen.getByPlaceholderText('xkeysib-...');
      await user.type(apiKeyInput, 'invalid-key');
      
      const validateButton = screen.getByText('Valider');
      await user.click(validateButton);
      
      await waitFor(() => {
        expect(screen.getByText('Clé API Brevo invalide')).toBeInTheDocument();
      });
    });

    it('devrait charger et afficher les templates Brevo', async () => {
      const user = userEvent.setup();
      const mockTemplates = [
        { id: 1, name: 'Template Formulaire' },
        { id: 2, name: 'Template Contrat' }
      ];
      
      emailService.validateBrevoApiKey.mockResolvedValue(true);
      emailService.getBrevoTemplates.mockResolvedValue(mockTemplates);
      
      await user.click(screen.getByLabelText(/Activer l'envoi d'emails via Brevo/));
      
      const apiKeyInput = screen.getByPlaceholderText('xkeysib-...');
      await user.type(apiKeyInput, 'xkeysib-valid-key');
      await user.click(screen.getByText('Valider'));
      
      await waitFor(() => {
        expect(screen.getByText('Association des templates')).toBeInTheDocument();
        expect(screen.getByText(/Template Formulaire/)).toBeInTheDocument();
        expect(screen.getByText(/Template Contrat/)).toBeInTheDocument();
      });
    });

    it('devrait masquer/afficher la clé API Brevo', async () => {
      const user = userEvent.setup();
      
      await user.click(screen.getByLabelText(/Activer l'envoi d'emails via Brevo/));
      
      const apiKeyInput = screen.getByPlaceholderText('xkeysib-...');
      const toggleButton = screen.getByRole('button', { name: /eye/ });
      
      expect(apiKeyInput).toHaveAttribute('type', 'password');
      
      await user.click(toggleButton);
      expect(apiKeyInput).toHaveAttribute('type', 'text');
    });
  });

  describe('Test d\'email', () => {
    it('devrait afficher la section de test quand un provider est activé', async () => {
      const user = userEvent.setup();
      render(<ParametresEmail />);
      
      await user.click(screen.getByLabelText(/Activer l'envoi d'emails via SMTP/));
      
      expect(screen.getByText('Test de configuration')).toBeInTheDocument();
      expect(screen.getByLabelText(/Envoyer un email de test à/)).toBeInTheDocument();
    });

    it('devrait envoyer un email de test', async () => {
      const user = userEvent.setup();
      render(<ParametresEmail />);
      
      await user.click(screen.getByLabelText(/Activer l'envoi d'emails via SMTP/));
      
      const emailInput = screen.getByPlaceholderText('test@example.com');
      const sendButton = screen.getByText('Envoyer');
      
      await user.type(emailInput, 'test@example.com');
      await user.click(sendButton);
      
      expect(emailService.sendTestEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('devrait valider l\'email de test avant envoi', async () => {
      const user = userEvent.setup();
      emailService.validateEmail.mockReturnValue(false);
      
      render(<ParametresEmail />);
      await user.click(screen.getByLabelText(/Activer l'envoi d'emails via SMTP/));
      
      const emailInput = screen.getByPlaceholderText('test@example.com');
      const sendButton = screen.getByText('Envoyer');
      
      await user.type(emailInput, 'invalid-email');
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Veuillez entrer une adresse email valide/)).toBeInTheDocument();
      });
    });

    it('devrait tester un template Brevo spécifique', async () => {
      const user = userEvent.setup();
      const mockTemplates = [
        { id: 1, name: 'Template Formulaire' }
      ];
      
      emailService.validateBrevoApiKey.mockResolvedValue(true);
      emailService.getBrevoTemplates.mockResolvedValue(mockTemplates);
      
      render(<ParametresEmail />);
      await user.click(screen.getByLabelText('Brevo (recommandé)'));
      await user.click(screen.getByLabelText(/Activer l'envoi d'emails via Brevo/));
      
      const apiKeyInput = screen.getByPlaceholderText('xkeysib-...');
      await user.type(apiKeyInput, 'xkeysib-valid-key');
      await user.click(screen.getByText('Valider'));
      
      // Attendre que les templates se chargent
      await waitFor(() => {
        expect(screen.getByText('Association des templates')).toBeInTheDocument();
      });
      
      // Sélectionner un template
      const formulaireSelect = screen.getAllByDisplayValue('')[0];
      await user.selectOptions(formulaireSelect, '1');
      
      // Ajouter un email de test
      const testEmailInput = screen.getByPlaceholderText('test@example.com');
      await user.type(testEmailInput, 'test@example.com');
      
      // Tester le template
      const testTemplateButton = screen.getByTitle('Tester le template formulaire');
      await user.click(testTemplateButton);
      
      expect(emailService.testBrevoTemplate).toHaveBeenCalledWith('formulaire', 'test@example.com');
    });
  });

  describe('Sauvegarde des paramètres', () => {
    it('devrait sauvegarder les paramètres au submit', async () => {
      const user = userEvent.setup();
      mockSauvegarderParametres.mockResolvedValue(true);
      
      render(<ParametresEmail />);
      
      const saveButton = screen.getByText('Enregistrer les paramètres');
      await user.click(saveButton);
      
      expect(mockSauvegarderParametres).toHaveBeenCalledWith('email', expect.any(Object));
    });

    it('devrait afficher un message de succès après sauvegarde', async () => {
      const user = userEvent.setup();
      mockSauvegarderParametres.mockResolvedValue(true);
      
      render(<ParametresEmail />);
      
      const saveButton = screen.getByText('Enregistrer les paramètres');
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Paramètres email sauvegardés avec succès/)).toBeInTheDocument();
      });
    });

    it('devrait afficher une erreur en cas d\'échec de sauvegarde', async () => {
      const user = userEvent.setup();
      mockSauvegarderParametres.mockRejectedValue(new Error('Erreur de sauvegarde'));
      
      render(<ParametresEmail />);
      
      const saveButton = screen.getByText('Enregistrer les paramètres');
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Erreur lors de la sauvegarde des paramètres/)).toBeInTheDocument();
      });
    });
  });

  describe('Templates personnalisés', () => {
    it('devrait afficher les options de templates personnalisés', async () => {
      const user = userEvent.setup();
      render(<ParametresEmail />);
      
      const customTemplatesSwitch = screen.getByLabelText(/Utiliser des templates personnalisés/);
      await user.click(customTemplatesSwitch);
      
      expect(screen.getByLabelText('Nom du signataire')).toBeInTheDocument();
      expect(screen.getByLabelText('Titre du signataire')).toBeInTheDocument();
      expect(screen.getByLabelText('Texte de pied de page')).toBeInTheDocument();
    });

    it('devrait permettre de saisir les informations de signature', async () => {
      const user = userEvent.setup();
      render(<ParametresEmail />);
      
      await user.click(screen.getByLabelText(/Utiliser des templates personnalisés/));
      
      const nameInput = screen.getByLabelText('Nom du signataire');
      const titleInput = screen.getByLabelText('Titre du signataire');
      const footerInput = screen.getByLabelText('Texte de pied de page');
      
      await user.type(nameInput, 'Jean Dupont');
      await user.type(titleInput, 'Directeur');
      await user.type(footerInput, 'Message automatique');
      
      expect(nameInput.value).toBe('Jean Dupont');
      expect(titleInput.value).toBe('Directeur');
      expect(footerInput.value).toBe('Message automatique');
    });
  });

  describe('États de chargement', () => {
    it('devrait afficher l\'état de chargement pendant la validation API', async () => {
      const user = userEvent.setup();
      emailService.validateBrevoApiKey.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(true), 100))
      );
      
      render(<ParametresEmail />);
      await user.click(screen.getByLabelText('Brevo (recommandé)'));
      await user.click(screen.getByLabelText(/Activer l'envoi d'emails via Brevo/));
      
      const apiKeyInput = screen.getByPlaceholderText('xkeysib-...');
      await user.type(apiKeyInput, 'xkeysib-test-key');
      
      const validateButton = screen.getByText('Valider');
      await user.click(validateButton);
      
      expect(screen.getByText('Validation...')).toBeInTheDocument();
    });

    it('devrait afficher l\'état de chargement pendant l\'envoi de test', async () => {
      const user = userEvent.setup();
      emailService.sendTestEmail.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );
      
      render(<ParametresEmail />);
      await user.click(screen.getByLabelText(/Activer l'envoi d'emails via SMTP/));
      
      const emailInput = screen.getByPlaceholderText('test@example.com');
      await user.type(emailInput, 'test@example.com');
      
      const sendButton = screen.getByText('Envoyer');
      await user.click(sendButton);
      
      expect(screen.getByText('Envoi...')).toBeInTheDocument();
    });

    it('devrait désactiver les boutons pendant les opérations', async () => {
      const user = userEvent.setup();
      emailService.validateBrevoApiKey.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(true), 100))
      );
      
      render(<ParametresEmail />);
      await user.click(screen.getByLabelText('Brevo (recommandé)'));
      await user.click(screen.getByLabelText(/Activer l'envoi d'emails via Brevo/));
      
      const apiKeyInput = screen.getByPlaceholderText('xkeysib-...');
      await user.type(apiKeyInput, 'xkeysib-test-key');
      
      const validateButton = screen.getByText('Valider');
      await user.click(validateButton);
      
      expect(validateButton).toBeDisabled();
    });
  });

  describe('Accessibilité', () => {
    it('devrait avoir les labels appropriés pour les champs de formulaire', () => {
      render(<ParametresEmail />);
      
      expect(screen.getByLabelText('SMTP Classique')).toBeInTheDocument();
      expect(screen.getByLabelText('Brevo (recommandé)')).toBeInTheDocument();
    });

    it('devrait avoir des textes d\'aide informatifs', async () => {
      const user = userEvent.setup();
      render(<ParametresEmail />);
      
      await user.click(screen.getByLabelText(/Activer l'envoi d'emails via SMTP/));
      
      expect(screen.getByText(/Pour Gmail: utilisez un mot de passe d'application/)).toBeInTheDocument();
      expect(screen.getByText(/L'adresse qui apparaîtra comme expéditeur/)).toBeInTheDocument();
    });

    it('devrait avoir des boutons avec des descriptions claires', async () => {
      const user = userEvent.setup();
      render(<ParametresEmail />);
      
      await user.click(screen.getByLabelText('Brevo (recommandé)'));
      await user.click(screen.getByLabelText(/Activer l'envoi d'emails via Brevo/));
      
      expect(screen.getByText('Valider')).toBeInTheDocument();
      expect(screen.getByText('Enregistrer les paramètres')).toBeInTheDocument();
    });
  });
});