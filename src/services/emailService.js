/**
 * Service d'envoi d'emails
 * Utilise une Cloud Function pour envoyer des emails via SMTP
 */

import { httpsCallable } from 'firebase/functions';
import { functions, auth } from './firebase-service';
import { debugLog } from '@/utils/logUtils';

// Import du service Brevo pour les nouvelles fonctionnalités
import brevoTemplateService from './brevoTemplateService';

// Référence aux fonctions Cloud
const sendEmailFunction = httpsCallable(functions, 'sendEmail');
const sendUnifiedEmailFunction = httpsCallable(functions, 'sendUnifiedEmail');

/**
 * Service principal pour l'envoi d'emails
 */
class EmailService {
  /**
   * Récupère l'ID de l'utilisateur courant et son entreprise
   * @returns {Object} - { userId, entrepriseId }
   */
  getCurrentUserInfo() {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    // Récupérer l'entreprise ID depuis localStorage ou le contexte
    const entrepriseId = localStorage.getItem('currentEntrepriseId') || 
                          user.entrepriseId || 
                          'default';

    return {
      userId: user.uid,
      entrepriseId
    };
  }

  /**
   * Envoie un email simple via le service unifié (SMTP/Brevo avec fallback)
   * @param {Object} emailData - Données de l'email
   * @param {string|Array<string>} emailData.to - Adresse email du/des destinataire(s)
   * @param {string} emailData.subject - Sujet de l'email
   * @param {string} emailData.html - Contenu HTML de l'email
   * @param {string} [emailData.text] - Contenu texte de l'email (fallback)
   * @param {string} [emailData.from] - Expéditeur (optionnel)
   * @param {Array} [emailData.attachments] - Pièces jointes (optionnel)
   * @param {boolean} [emailData.useUnified=true] - Utiliser le service unifié (Brevo/SMTP)
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendMail(emailData) {
    try {
      const { userId, entrepriseId } = this.getCurrentUserInfo();

      debugLog('[EmailService] Envoi d\'email:', {
        to: emailData.to,
        subject: emailData.subject,
        useUnified: emailData.useUnified !== false,
        userId,
        entrepriseId
      }, 'info');

      // Utiliser le service unifié par défaut (avec fallback Brevo/SMTP)
      if (emailData.useUnified !== false) {
        const result = await sendUnifiedEmailFunction({
          ...emailData,
          userId,
          entrepriseId: entrepriseId
        });
        
        debugLog('[EmailService] Email unifié envoyé:', result.data, 'success');
        
        return {
          success: true,
          ...result.data
        };
      } else {
        // Fallback sur l'ancien service SMTP uniquement si explicitement demandé
        const result = await sendEmailFunction({
          ...emailData,
          userId,
          entrepriseId: entrepriseId
        });
        
        debugLog('[EmailService] Email SMTP envoyé:', result.data, 'success');
        
        return {
          success: true,
          ...result.data
        };
      }
    } catch (error) {
      debugLog('[EmailService] Erreur lors de l\'envoi:', error, 'error');
      
      throw new Error(
        error.message || 'Erreur lors de l\'envoi de l\'email'
      );
    }
  }

  /**
   * Envoie un email avec un template prédéfini via le service unifié
   * @param {string} template - Nom du template ('formulaire', 'contrat', 'relance', 'confirmation')
   * @param {Object} templateData - Données pour le template
   * @param {string|Array<string>} to - Email du/des destinataire(s)
   * @param {boolean} [useUnified=true] - Utiliser le service unifié (Brevo/SMTP)
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendTemplatedMail(template, templateData, to, useUnified = true) {
    try {
      const { userId, entrepriseId } = this.getCurrentUserInfo();

      debugLog('[EmailService] Envoi d\'email avec template:', {
        template,
        to,
        templateData,
        useUnified,
        userId,
        entrepriseId
      }, 'info');

      // Utiliser le service unifié par défaut (Brevo avec fallback SMTP)
      if (useUnified) {
        const result = await sendUnifiedEmailFunction({
          templateName: template,
          variables: templateData,
          to,
          userId,
          entrepriseId: entrepriseId
        });
        
        debugLog('[EmailService] Email template unifié envoyé:', result.data, 'success');
        
        return {
          success: true,
          ...result.data
        };
      } else {
        // Fallback sur l'ancien service SMTP pour rétrocompatibilité
        const result = await sendEmailFunction({
          template,
          templateData,
          to,
          userId,
          entrepriseId: entrepriseId
        });
        
        debugLog('[EmailService] Email template SMTP envoyé:', result.data, 'success');
        
        return {
          success: true,
          ...result.data
        };
      }
    } catch (error) {
      debugLog('[EmailService] Erreur lors de l\'envoi avec template:', error, 'error');
      
      throw new Error(
        error.message || 'Erreur lors de l\'envoi de l\'email avec template'
      );
    }
  }

  /**
   * Envoie un email de contrat
   * @param {Object} contratData - Données du contrat
   * @param {string|Array<string>} contratData.to - Email du/des destinataire(s)
   * @param {string} contratData.nomContact - Nom du contact
   * @param {string} contratData.nomDate - Nom de la date
   * @param {string} [contratData.dateSignature] - Date limite de signature
   * @param {Object} [contratData.attachment] - PDF du contrat en pièce jointe
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendContractEmail(contratData) {
    try {
      const { to, nomContact, nomDate, dateSignature, attachment } = contratData;

      // Utiliser le template 'contrat'
      const templateData = {
        nomContact,
        nomDate,
        dateSignature
      };

      // Si on a un PDF en pièce jointe
      const emailData = {
        template: 'contrat',
        templateData,
        to
      };

      if (attachment) {
        // Ajouter la pièce jointe
        emailData.attachments = [{
          filename: `Contrat_${nomDate.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          content: attachment.content,
          encoding: 'base64'
        }];
      }

      return await this.sendTemplatedMail('contrat', templateData, to);
    } catch (error) {
      debugLog('[EmailService] Erreur envoi contrat:', error, 'error');
      throw error;
    }
  }

  /**
   * Envoie un email avec lien vers formulaire
   * @param {Object} formData - Données du formulaire
   * @param {string|Array<string>} formData.to - Email du/des destinataire(s)
   * @param {string} formData.nomContact - Nom du contact
   * @param {string} formData.nomDate - Nom de la date
   * @param {string} formData.lienFormulaire - URL du formulaire
   * @param {string} [formData.dateEcheance] - Date limite
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendFormEmail(formData) {
    try {
      const { to, nomContact, nomDate, lienFormulaire, dateEcheance } = formData;

      const templateData = {
        nomContact,
        nomDate,
        lienFormulaire,
        dateEcheance
      };

      return await this.sendTemplatedMail('formulaire', templateData, to);
    } catch (error) {
      debugLog('[EmailService] Erreur envoi formulaire:', error, 'error');
      throw error;
    }
  }

  /**
   * Envoie un email de relance
   * @param {Object} relanceData - Données de la relance
   * @param {string|Array<string>} relanceData.to - Email du/des destinataire(s)
   * @param {string} relanceData.nomContact - Nom du contact
   * @param {string} relanceData.sujet - Sujet de la relance
   * @param {string} relanceData.message - Message de relance
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendRelanceEmail(relanceData) {
    try {
      const { to, nomContact, sujet, message } = relanceData;

      const templateData = {
        nomContact,
        sujet,
        message
      };

      return await this.sendTemplatedMail('relance', templateData, to);
    } catch (error) {
      debugLog('[EmailService] Erreur envoi relance:', error, 'error');
      throw error;
    }
  }

  /**
   * Envoie un email de test
   * @param {string} to - Email du destinataire
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendTestEmail(to) {
    try {
      return await this.sendMail({
        to,
        subject: 'TourCraft - Email de test',
        html: `
          <h2>Test du service d'email</h2>
          <p>Ceci est un email de test envoyé depuis TourCraft.</p>
          <p>Si vous recevez cet email, le service fonctionne correctement !</p>
          <hr>
          <p><small>Envoyé le ${new Date().toLocaleString('fr-FR')}</small></p>
        `
      });
    } catch (error) {
      debugLog('[EmailService] Erreur envoi test:', error, 'error');
      throw error;
    }
  }

  /**
   * Extrait les emails des contacts d'une date
   * @param {Array<Object>} contacts - Liste des contacts
   * @returns {Array<string>} - Liste des emails valides
   */
  extractContactEmails(contacts) {
    if (!Array.isArray(contacts)) {
      return [];
    }

    return contacts
      .filter(contact => contact && contact.email && this.validateEmail(contact.email))
      .map(contact => contact.email);
  }

  /**
   * Envoie un email à tous les contacts d'une date
   * @param {Array<Object>} contacts - Liste des contacts de la date
   * @param {Object} emailData - Données de l'email (sans le champ 'to')
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendToDateContacts(contacts, emailData) {
    try {
      const emails = this.extractContactEmails(contacts);
      
      if (emails.length === 0) {
        throw new Error('Aucun email valide trouvé dans les contacts');
      }

      debugLog('[EmailService] Envoi à plusieurs contacts:', {
        numberOfContacts: contacts.length,
        validEmails: emails.length,
        emails
      }, 'info');

      return await this.sendMail({
        ...emailData,
        to: emails
      });
    } catch (error) {
      debugLog('[EmailService] Erreur envoi multi-contacts:', error, 'error');
      throw error;
    }
  }

  /**
   * Valide une adresse email
   * @param {string} email - Adresse à valider
   * @returns {boolean} - True si valide
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Formate un nom de fichier pour pièce jointe
   * @param {string} filename - Nom original
   * @returns {string} - Nom formaté
   */
  sanitizeFilename(filename) {
    return filename
      .replace(/[^a-zA-Z0-9.\-_]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 255);
  }

  // ========================================
  // NOUVELLES MÉTHODES BREVO
  // ========================================

  /**
   * Envoie un email formulaire avec template Brevo optimisé
   * @param {Object} date - Données de la date
   * @param {Object} contact - Données du contact
   * @param {string} lienFormulaire - URL du formulaire
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendBrevoFormEmail(date, contact, lienFormulaire) {
    return await brevoTemplateService.sendFormulaireEmail(date, contact, lienFormulaire);
  }

  /**
   * Envoie un email de relance avec template Brevo optimisé
   * @param {Object} date - Données de la date
   * @param {Object} contact - Données du contact
   * @param {Array} documentsManquants - Liste des documents manquants
   * @param {number} nombreRelance - Numéro de la relance
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendBrevoRelanceEmail(date, contact, documentsManquants, nombreRelance = 1) {
    return await brevoTemplateService.sendRelanceEmail(date, contact, documentsManquants, nombreRelance);
  }

  /**
   * Envoie un email contrat avec template Brevo optimisé
   * @param {Object} date - Données de la date
   * @param {Object} contact - Données du contact
   * @param {Object} contrat - Données du contrat
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendBrevoContractEmail(date, contact, contrat) {
    return await brevoTemplateService.sendContratEmail(date, contact, contrat);
  }

  /**
   * Envoie un email de confirmation avec template Brevo optimisé
   * @param {Object} date - Données de la date
   * @param {Object} contact - Données du contact
   * @param {Object} detailsTechniques - Détails techniques de la date
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendBrevoConfirmationEmail(date, contact, detailsTechniques = {}) {
    return await brevoTemplateService.sendConfirmationEmail(date, contact, detailsTechniques);
  }

  /**
   * Envoie un email à plusieurs contacts avec template Brevo
   * @param {string} templateName - Nom du template
   * @param {Array} contacts - Liste des contacts
   * @param {Object} baseData - Données de base (date, etc.)
   * @param {Object} templateSpecificData - Données spécifiques au template
   * @returns {Promise<Object>} - Résultats des envois
   */
  async sendBrevoToMultipleContacts(templateName, contacts, baseData, templateSpecificData = {}) {
    return await brevoTemplateService.sendToMultipleContacts(templateName, contacts, baseData, templateSpecificData);
  }

  /**
   * Valide une clé API Brevo
   * @param {string} apiKey - Clé API à valider
   * @returns {Promise<boolean>} - True si valide
   */
  async validateBrevoApiKey(apiKey) {
    return await brevoTemplateService.validateApiKey(apiKey);
  }

  /**
   * Récupère la liste des templates Brevo
   * @param {string} apiKey - Clé API Brevo
   * @returns {Promise<Array>} - Liste des templates
   */
  async getBrevoTemplates(apiKey) {
    return await brevoTemplateService.getTemplates(apiKey);
  }

  /**
   * Teste un template Brevo avec des données de démo
   * @param {string} templateName - Nom du template à tester
   * @param {string} emailTest - Email de test
   * @returns {Promise<Object>} - Résultat du test
   */
  async testBrevoTemplate(templateName, emailTest) {
    return await brevoTemplateService.testTemplate(templateName, emailTest);
  }

  /**
   * Récupère des données de démo pour les templates
   * @returns {Object} - Données de démo
   */
  getBrevoDemo() {
    return brevoTemplateService.getDemoData();
  }
}

// Export d'une instance unique
const emailService = new EmailService();
export default emailService;

// Export des méthodes individuelles pour plus de flexibilité
export const {
  sendMail,
  sendTemplatedMail,
  sendContractEmail,
  sendFormEmail,
  sendRelanceEmail,
  sendTestEmail,
  sendToDateContacts,
  extractContactEmails,
  validateEmail,
  sanitizeFilename,
  // Nouvelles méthodes Brevo
  sendBrevoFormEmail,
  sendBrevoRelanceEmail,
  sendBrevoContractEmail,
  sendBrevoConfirmationEmail,
  sendBrevoToMultipleContacts,
  validateBrevoApiKey,
  getBrevoTemplates,
  testBrevoTemplate,
  getBrevoDemo
} = emailService;