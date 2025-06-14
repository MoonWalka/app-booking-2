/**
 * Service de gestion des templates Brevo
 * Facilite l'utilisation des templates Brevo avec les données TourCraft
 */

import { httpsCallable } from 'firebase/functions';
import { functions, auth } from './firebase-service';
import { debugLog } from '@/utils/logUtils';
import { 
  formatFormulaireVariables,
  formatRelanceVariables,
  formatContratVariables,
  formatConfirmationVariables,
  validateRequiredVariables,
  applyDefaultVariables
} from '@/utils/templateVariables';
import { RequiredVariables } from '@/types/brevoTypes';

// Référence aux fonctions Cloud
const sendUnifiedEmailFunction = httpsCallable(functions, 'sendUnifiedEmail');
const validateBrevoKeyFunction = httpsCallable(functions, 'validateBrevoKey');
const getBrevoTemplatesFunction = httpsCallable(functions, 'getBrevoTemplates');

/**
 * Service pour gérer les templates Brevo avec TourCraft
 */
class BrevoTemplateService {
  /**
   * Récupère l'ID de l'utilisateur courant et son organisation
   * @returns {Object} - { userId, organizationId }
   */
  getCurrentUserInfo() {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    const organizationId = localStorage.getItem('currentOrganizationId') || 
                          user.organizationId || 
                          'default';

    return {
      userId: user.uid,
      organizationId
    };
  }

  /**
   * Envoie un email formulaire programmateur avec template Brevo
   * @param {Object} concert - Données du concert
   * @param {Object} contact - Données du contact
   * @param {string} lienFormulaire - URL du formulaire
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendFormulaireEmail(concert, contact, lienFormulaire) {
    try {
      const { userId, organizationId } = this.getCurrentUserInfo();

      // Transformer les données TourCraft en variables Brevo
      const variables = formatFormulaireVariables(concert, contact, lienFormulaire);
      
      // Appliquer les valeurs par défaut
      const finalVariables = applyDefaultVariables(variables);

      // Valider les variables requises
      const validation = validateRequiredVariables(finalVariables, RequiredVariables.formulaire);
      if (!validation.valid) {
        throw new Error(`Variables manquantes pour le template formulaire: ${validation.missing.join(', ')}`);
      }

      debugLog('[BrevoTemplateService] Envoi email formulaire:', {
        to: contact.email,
        variables: finalVariables,
        concert: concert.nom
      }, 'info');

      const result = await sendUnifiedEmailFunction({
        templateName: 'formulaire',
        to: contact.email,
        variables: finalVariables,
        userId,
        organizationId
      });
      
      debugLog('[BrevoTemplateService] Email formulaire envoyé:', result.data, 'success');
      
      return {
        success: true,
        ...result.data
      };
    } catch (error) {
      debugLog('[BrevoTemplateService] Erreur envoi formulaire:', error, 'error');
      throw new Error(error.message || 'Erreur lors de l\'envoi de l\'email formulaire');
    }
  }

  /**
   * Envoie un email de relance documents avec template Brevo
   * @param {Object} concert - Données du concert
   * @param {Object} contact - Données du contact
   * @param {Array} documentsManquants - Liste des documents manquants
   * @param {number} nombreRelance - Numéro de la relance
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendRelanceEmail(concert, contact, documentsManquants = [], nombreRelance = 1) {
    try {
      const { userId, organizationId } = this.getCurrentUserInfo();

      const variables = formatRelanceVariables(concert, contact, documentsManquants, nombreRelance);
      const finalVariables = applyDefaultVariables(variables);

      const validation = validateRequiredVariables(finalVariables, RequiredVariables.relance);
      if (!validation.valid) {
        throw new Error(`Variables manquantes pour le template relance: ${validation.missing.join(', ')}`);
      }

      debugLog('[BrevoTemplateService] Envoi email relance:', {
        to: contact.email,
        variables: finalVariables,
        documentsManquants,
        nombreRelance
      }, 'info');

      const result = await sendUnifiedEmailFunction({
        templateName: 'relance',
        to: contact.email,
        variables: finalVariables,
        userId,
        organizationId
      });
      
      debugLog('[BrevoTemplateService] Email relance envoyé:', result.data, 'success');
      
      return {
        success: true,
        ...result.data
      };
    } catch (error) {
      debugLog('[BrevoTemplateService] Erreur envoi relance:', error, 'error');
      throw new Error(error.message || 'Erreur lors de l\'envoi de l\'email de relance');
    }
  }

  /**
   * Envoie un email contrat prêt avec template Brevo
   * @param {Object} concert - Données du concert
   * @param {Object} contact - Données du contact
   * @param {Object} contrat - Données du contrat
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendContratEmail(concert, contact, contrat) {
    try {
      const { userId, organizationId } = this.getCurrentUserInfo();

      const variables = formatContratVariables(concert, contact, contrat);
      const finalVariables = applyDefaultVariables(variables);

      const validation = validateRequiredVariables(finalVariables, RequiredVariables.contrat);
      if (!validation.valid) {
        throw new Error(`Variables manquantes pour le template contrat: ${validation.missing.join(', ')}`);
      }

      debugLog('[BrevoTemplateService] Envoi email contrat:', {
        to: contact.email,
        variables: finalVariables,
        contrat: contrat.type
      }, 'info');

      const result = await sendUnifiedEmailFunction({
        templateName: 'contrat',
        to: contact.email,
        variables: finalVariables,
        userId,
        organizationId
      });
      
      debugLog('[BrevoTemplateService] Email contrat envoyé:', result.data, 'success');
      
      return {
        success: true,
        ...result.data
      };
    } catch (error) {
      debugLog('[BrevoTemplateService] Erreur envoi contrat:', error, 'error');
      throw new Error(error.message || 'Erreur lors de l\'envoi de l\'email contrat');
    }
  }

  /**
   * Envoie un email de confirmation concert avec template Brevo
   * @param {Object} concert - Données du concert
   * @param {Object} contact - Données du contact
   * @param {Object} detailsTechniques - Détails techniques du concert
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendConfirmationEmail(concert, contact, detailsTechniques = {}) {
    try {
      const { userId, organizationId } = this.getCurrentUserInfo();

      const variables = formatConfirmationVariables(concert, contact, detailsTechniques);
      const finalVariables = applyDefaultVariables(variables);

      const validation = validateRequiredVariables(finalVariables, RequiredVariables.confirmation);
      if (!validation.valid) {
        throw new Error(`Variables manquantes pour le template confirmation: ${validation.missing.join(', ')}`);
      }

      debugLog('[BrevoTemplateService] Envoi email confirmation:', {
        to: contact.email,
        variables: finalVariables,
        concert: concert.nom
      }, 'info');

      const result = await sendUnifiedEmailFunction({
        templateName: 'confirmation',
        to: contact.email,
        variables: finalVariables,
        userId,
        organizationId
      });
      
      debugLog('[BrevoTemplateService] Email confirmation envoyé:', result.data, 'success');
      
      return {
        success: true,
        ...result.data
      };
    } catch (error) {
      debugLog('[BrevoTemplateService] Erreur envoi confirmation:', error, 'error');
      throw new Error(error.message || 'Erreur lors de l\'envoi de l\'email de confirmation');
    }
  }

  /**
   * Envoie un email à plusieurs contacts avec le même template
   * @param {string} templateName - Nom du template ('formulaire', 'relance', 'contrat', 'confirmation')
   * @param {Array} contacts - Liste des contacts
   * @param {Object} baseData - Données de base (concert, etc.)
   * @param {Object} templateSpecificData - Données spécifiques au template
   * @returns {Promise<Array>} - Résultats des envois
   */
  async sendToMultipleContacts(templateName, contacts, baseData, templateSpecificData = {}) {
    try {
      if (!Array.isArray(contacts) || contacts.length === 0) {
        throw new Error('Liste de contacts vide ou invalide');
      }

      debugLog('[BrevoTemplateService] Envoi multiple:', {
        templateName,
        contactCount: contacts.length,
        baseData
      }, 'info');

      const results = [];
      
      for (const contact of contacts) {
        try {
          let result;
          
          switch (templateName) {
            case 'formulaire':
              result = await this.sendFormulaireEmail(
                baseData.concert, 
                contact, 
                templateSpecificData.lienFormulaire
              );
              break;
              
            case 'relance':
              result = await this.sendRelanceEmail(
                baseData.concert,
                contact,
                templateSpecificData.documentsManquants,
                templateSpecificData.nombreRelance
              );
              break;
              
            case 'contrat':
              result = await this.sendContratEmail(
                baseData.concert,
                contact,
                templateSpecificData.contrat
              );
              break;
              
            case 'confirmation':
              result = await this.sendConfirmationEmail(
                baseData.concert,
                contact,
                templateSpecificData.detailsTechniques
              );
              break;
              
            default:
              throw new Error(`Template '${templateName}' non supporté`);
          }
          
          results.push({
            contact: contact.email,
            success: true,
            ...result
          });
          
        } catch (contactError) {
          debugLog(`[BrevoTemplateService] Erreur pour ${contact.email}:`, contactError, 'error');
          results.push({
            contact: contact.email,
            success: false,
            error: contactError.message
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;

      debugLog('[BrevoTemplateService] Envoi multiple terminé:', {
        total: results.length,
        success: successCount,
        errors: errorCount
      }, successCount > 0 ? 'success' : 'error');

      return {
        success: errorCount === 0,
        total: results.length,
        successCount,
        errorCount,
        results
      };
      
    } catch (error) {
      debugLog('[BrevoTemplateService] Erreur envoi multiple:', error, 'error');
      throw new Error(error.message || 'Erreur lors de l\'envoi multiple');
    }
  }

  /**
   * Valide une clé API Brevo
   * @param {string} apiKey - Clé API à valider
   * @returns {Promise<boolean>} - True si valide
   */
  async validateApiKey(apiKey) {
    try {
      if (!apiKey) {
        return false;
      }

      debugLog('[BrevoTemplateService] Validation clé API Brevo', { apiKey: apiKey.substring(0, 10) + '...' }, 'info');

      const result = await validateBrevoKeyFunction({ apiKey });
      
      debugLog('[BrevoTemplateService] Résultat validation:', result.data, 'info');
      
      return result.data.valid === true;
    } catch (error) {
      debugLog('[BrevoTemplateService] Erreur validation clé API:', error, 'error');
      return false;
    }
  }

  /**
   * Récupère la liste des templates Brevo
   * @param {string} apiKey - Clé API Brevo
   * @returns {Promise<Array>} - Liste des templates
   */
  async getTemplates(apiKey) {
    try {
      if (!apiKey) {
        throw new Error('Clé API Brevo manquante');
      }

      debugLog('[BrevoTemplateService] Récupération templates Brevo', { apiKey: apiKey.substring(0, 10) + '...' }, 'info');

      const result = await getBrevoTemplatesFunction({ apiKey });
      
      debugLog('[BrevoTemplateService] Templates récupérés:', {
        count: result.data.templates?.length || 0
      }, 'success');
      
      return result.data.templates || [];
    } catch (error) {
      debugLog('[BrevoTemplateService] Erreur récupération templates:', error, 'error');
      throw new Error(error.message || 'Erreur lors de la récupération des templates');
    }
  }

  /**
   * Teste l'envoi d'un template avec des données de démo
   * @param {string} templateName - Nom du template à tester
   * @param {string} emailTest - Email de test
   * @returns {Promise<Object>} - Résultat du test
   */
  async testTemplate(templateName, emailTest) {
    try {
      const { userId, organizationId } = this.getCurrentUserInfo();

      // Données de démo pour le test
      const demoData = this.getDemoData();

      let variables;
      switch (templateName) {
        case 'formulaire':
          variables = formatFormulaireVariables(
            demoData.concert, 
            { ...demoData.contact, email: emailTest }, 
            demoData.lienFormulaire
          );
          break;
          
        case 'relance':
          variables = formatRelanceVariables(
            demoData.concert,
            { ...demoData.contact, email: emailTest },
            demoData.documentsManquants,
            1
          );
          break;
          
        case 'contrat':
          variables = formatContratVariables(
            demoData.concert,
            { ...demoData.contact, email: emailTest },
            demoData.contrat
          );
          break;
          
        case 'confirmation':
          variables = formatConfirmationVariables(
            demoData.concert,
            { ...demoData.contact, email: emailTest },
            demoData.detailsTechniques
          );
          break;
          
        default:
          throw new Error(`Template '${templateName}' non supporté pour le test`);
      }

      const finalVariables = applyDefaultVariables(variables);

      debugLog('[BrevoTemplateService] Test template:', {
        templateName,
        emailTest,
        variables: finalVariables
      }, 'info');

      const result = await sendUnifiedEmailFunction({
        templateName,
        to: emailTest,
        variables: finalVariables,
        userId,
        organizationId
      });
      
      return {
        success: true,
        ...result.data
      };
    } catch (error) {
      debugLog('[BrevoTemplateService] Erreur test template:', error, 'error');
      throw new Error(error.message || 'Erreur lors du test du template');
    }
  }

  /**
   * Génère des données de démo pour les tests
   * @returns {Object} - Données de démo
   */
  getDemoData() {
    const today = new Date();
    const futureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 jours

    return {
      concert: {
        nom: 'Festival Rock Démo 2025',
        date: futureDate,
        heure: '20:30',
        lieu: {
          nom: 'Salle Pleyel',
          adresse: '252 rue du Faubourg Saint-Honoré',
          codePostal: '75008',
          ville: 'Paris'
        }
      },
      contact: {
        nom: 'Martin Dupont',
        prenom: 'Martin',
        email: 'demo@example.com'
      },
      lienFormulaire: 'https://app.tourcraft.com/formulaire/demo123',
      documentsManquants: ['Fiche technique', 'Assurance', 'SACEM'],
      contrat: {
        type: 'Cession',
        montantTotal: 1500,
        dateLimiteSignature: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        conditionsParticulieres: 'Paiement 30% à la signature'
      },
      detailsTechniques: {
        heureArrivee: '18:00',
        contactTechnique: 'Tom Technicien - 06 12 34 56 78',
        materielFourni: 'Sonorisation, éclairage',
        parkingInfo: 'Parking souterrain disponible',
        consignesSpeciales: 'Accès artistes par l\'entrée service'
      }
    };
  }
}

// Export d'une instance unique
const brevoTemplateService = new BrevoTemplateService();
export default brevoTemplateService;

// Export des méthodes individuelles
export const {
  sendFormulaireEmail,
  sendRelanceEmail,
  sendContratEmail,
  sendConfirmationEmail,
  sendToMultipleContacts,
  validateApiKey,
  getTemplates,
  testTemplate,
  getDemoData
} = brevoTemplateService;