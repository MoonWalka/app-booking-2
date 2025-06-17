/**
 * Service de gestion des templates Brevo
 * Facilite l'utilisation des templates Brevo avec les données TourCraft
 * 
 * IMPORTANT: L'envoi d'email de contrat est temporairement désactivé
 * La fonction sendContratEmail est conservée mais non utilisée actuellement
 * TODO: Réactiver une fois la solution API stable trouvée
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
    debugLog('[BrevoTemplateService] getCurrentUserInfo - user:', {
      exists: !!user,
      uid: user?.uid,
      email: user?.email
    }, 'info');
    
    if (!user) {
      debugLog('[BrevoTemplateService] Utilisateur non authentifié', null, 'error');
      throw new Error('Utilisateur non authentifié');
    }

    const organizationId = localStorage.getItem('currentOrganizationId') || 
                          user.organizationId || 
                          'default';

    debugLog('[BrevoTemplateService] getCurrentUserInfo - result:', {
      userId: user.uid,
      organizationId,
      source: localStorage.getItem('currentOrganizationId') ? 'localStorage' : (user.organizationId ? 'user.organizationId' : 'default')
    }, 'info');

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
        concert: concert?.nom || concert?.titre || concert?.title || 'nom non trouvé',
        concertKeys: concert ? Object.keys(concert) : 'concert null'
      }, 'info');

      // Essayer d'abord l'envoi direct via Brevo (plus fiable)
      try {
        debugLog('[BrevoTemplateService] Tentative envoi direct via Brevo API');
        const directResult = await this.sendTemplateDirectly('formulaire', contact.email, finalVariables);
        debugLog('[BrevoTemplateService] Email formulaire envoyé via Brevo direct:', directResult);
        return {
          success: true,
          messageId: directResult.messageId,
          provider: 'brevo-direct'
        };
      } catch (directError) {
        debugLog('[BrevoTemplateService] Fallback vers Cloud Functions', directError.message, 'warning');
        
        // Fallback vers Cloud Functions
        const result = await sendUnifiedEmailFunction({
          templateName: 'formulaire',
          to: contact.email,
          variables: finalVariables,
          userId,
          organizationId
        });
        
        debugLog('[BrevoTemplateService] Email formulaire envoyé via Cloud Functions:', result.data, 'success');
        
        return {
          success: true,
          ...result.data
        };
      }
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
   * 
   * TEMPORAIREMENT DÉSACTIVÉ: Cette fonction n'est pas appelée actuellement
   * Conservée pour réactivation future avec une solution API stable
   * 
   * @param {Object} concert - Données du concert
   * @param {Object} contact - Données du contact
   * @param {Object} contrat - Données du contrat
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendContratEmail(concert, contact, contrat) {
    try {
      debugLog('[BrevoTemplateService] === DÉBUT SEND CONTRAT EMAIL ===');
      debugLog('[BrevoTemplateService] 1. Récupération userInfo...');
      const { userId, organizationId } = this.getCurrentUserInfo();
      debugLog('[BrevoTemplateService] 2. UserInfo récupéré:', { userId, organizationId });

      debugLog('[BrevoTemplateService] 3. Formatage variables contrat...');
      const variables = formatContratVariables(concert, contact, contrat);
      debugLog('[BrevoTemplateService] 4. Variables formatées:', variables);
      
      const finalVariables = applyDefaultVariables(variables);
      debugLog('[BrevoTemplateService] 5. Variables finales après défauts:', finalVariables);

      debugLog('[BrevoTemplateService] 6. Validation variables requises...');
      const validation = validateRequiredVariables(finalVariables, RequiredVariables.contrat);
      debugLog('[BrevoTemplateService] 7. Résultat validation:', validation);
      
      if (!validation.valid) {
        throw new Error(`Variables manquantes pour le template contrat: ${validation.missing.join(', ')}`);
      }

      debugLog('[BrevoTemplateService] Envoi email contrat:', {
        to: contact.email,
        variables: finalVariables,
        contrat: contrat?.type,
        contratData: contrat,
        concertData: concert,
        contactData: contact
      }, 'info');

      debugLog('[BrevoTemplateService] 8. Tentative envoi direct via API Brevo...');
      
      try {
        const result = await this.sendTemplateDirectly('contrat', contact.email, finalVariables);
        debugLog('[BrevoTemplateService] 9. Email contrat envoyé via API directe:', result);
        
        return {
          success: true,
          messageId: result.messageId,
          provider: 'brevo-direct'
        };
      } catch (directError) {
        debugLog('[BrevoTemplateService] 10. Échec envoi direct, fallback vers Cloud Functions:', directError.message);
        
        // Fallback vers Cloud Functions si l'envoi direct échoue
        const cloudFunctionParams = {
          templateName: 'contrat',
          to: contact.email,
          variables: finalVariables,
          userId,
          organizationId
        };
        
        debugLog('[BrevoTemplateService] 11. Fallback - Paramètres pour Cloud Function:', cloudFunctionParams);
        
        try {
          const result = await sendUnifiedEmailFunction(cloudFunctionParams);
          debugLog('[BrevoTemplateService] 12. Résultat fallback Cloud Function:', result);
          
          return {
            success: true,
            ...result.data
          };
        } catch (cloudError) {
          debugLog('[BrevoTemplateService] 13. ERREUR finale:', {
            directError: directError.message,
            cloudError: cloudError.message
          });
          throw new Error(`Échec envoi direct (${directError.message}) et Cloud Function (${cloudError.message})`);
        }
      }
    } catch (error) {
      debugLog('[BrevoTemplateService] 12. ERREUR GÉNÉRALE sendContratEmail:', {
        message: error.message,
        code: error.code,
        details: error.details,
        stack: error.stack
      });
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
   * Valide une clé API Brevo avec fallback direct
   * @param {string} apiKey - Clé API à valider
   * @returns {Promise<boolean>} - True si valide
   */
  async validateApiKey(apiKey) {
    try {
      if (!apiKey) {
        debugLog('[BrevoTemplateService] Clé API manquante', null, 'error');
        return false;
      }

      if (apiKey.length < 10) {
        debugLog('[BrevoTemplateService] Clé API trop courte', { length: apiKey.length }, 'error');
        return false;
      }

      debugLog('[BrevoTemplateService] Début validation clé API Brevo', { 
        apiKey: apiKey.substring(0, 10) + '...',
        length: apiKey.length,
        startsWithXkeysib: apiKey.startsWith('xkeysib-')
      }, 'info');

      // Essayer d'abord la validation directe (plus fiable)
      try {
        debugLog('[BrevoTemplateService] Test direct API Brevo', { keyPreview: apiKey.substring(0, 10) + '...' }, 'info');
        
        const response = await fetch('https://api.brevo.com/v3/account', {
          method: 'GET',
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          debugLog('[BrevoTemplateService] Test direct API réussi', { account: data.email, plan: data.plan?.[0]?.type }, 'success');
          return true;
        } else {
          const errorData = await response.text();
          debugLog('[BrevoTemplateService] Test direct API échoué', { status: response.status, error: errorData }, 'error');
        }
      } catch (directError) {
        debugLog('[BrevoTemplateService] Erreur test direct API', { error: directError.message }, 'error');
      }

      // Fallback vers Cloud Functions si le test direct échoue
      try {
        const result = await validateBrevoKeyFunction({ apiKey });
        
        debugLog('[BrevoTemplateService] Résultat validation Cloud Function:', {
          success: !!result,
          dataKeys: result?.data ? Object.keys(result.data) : 'null',
          valid: result?.data?.valid,
          message: result?.data?.message
        }, 'info');
        
        const isValid = result.data.valid === true;
        debugLog(`[BrevoTemplateService] Validation Cloud Function: ${isValid ? 'VALIDE' : 'INVALIDE'}`, null, isValid ? 'success' : 'warn');
        
        return isValid;
      } catch (cfError) {
        debugLog('[BrevoTemplateService] Erreur Cloud Function', { error: cfError.message }, 'error');
        return false;
      }
    } catch (error) {
      debugLog('[BrevoTemplateService] Erreur validation clé API:', {
        message: error.message,
        code: error.code,
        details: error.details,
        stack: error.stack?.substring(0, 200) + '...'
      }, 'error');
      return false;
    }
  }

  /**
   * Récupère la liste des templates Brevo avec fallback direct
   * @param {string} apiKey - Clé API Brevo
   * @returns {Promise<Array>} - Liste des templates
   */
  async getTemplates(apiKey) {
    try {
      if (!apiKey) {
        throw new Error('Clé API Brevo manquante');
      }

      debugLog('[BrevoTemplateService] Récupération templates Brevo', { apiKey: apiKey.substring(0, 10) + '...' }, 'info');

      // Essayer d'abord l'appel direct à l'API Brevo
      try {
        const response = await fetch('https://api.brevo.com/v3/smtp/templates', {
          method: 'GET',
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          debugLog('[BrevoTemplateService] Templates récupérés directement', { count: data.templates?.length || 0 }, 'success');
          return data.templates || [];
        } else {
          debugLog('[BrevoTemplateService] Erreur appel direct templates', { status: response.status }, 'error');
        }
      } catch (directError) {
        debugLog('[BrevoTemplateService] Erreur directe templates', { error: directError.message }, 'error');
      }

      // Fallback vers Cloud Functions
      try {
        const result = await getBrevoTemplatesFunction({ apiKey });
        
        debugLog('[BrevoTemplateService] Templates récupérés via Cloud Functions:', {
          count: result.data.templates?.length || 0
        }, 'success');
        
        return result.data.templates || [];
      } catch (cfError) {
        debugLog('[BrevoTemplateService] Erreur Cloud Functions templates:', cfError, 'error');
        throw new Error('Impossible de récupérer les templates Brevo');
      }
    } catch (error) {
      debugLog('[BrevoTemplateService] Erreur récupération templates:', error, 'error');
      throw new Error(error.message || 'Erreur lors de la récupération des templates');
    }
  }

  /**
   * Envoie un template directement via l'API Brevo (contourne les Cloud Functions)
   * @param {string} templateName - Nom du template
   * @param {string} to - Email destinataire
   * @param {Object} variables - Variables du template
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendTemplateDirectly(templateName, to, variables) {
    try {
      // Récupérer la configuration Brevo de l'organisation
      const { organizationId } = this.getCurrentUserInfo();
      const config = await this.getBrevoConfig(organizationId);
      
      debugLog('[BrevoTemplateService] Configuration récupérée:', {
        hasApiKey: !!config.apiKey,
        templates: config.templates,
        templateName,
        templateExists: !!config.templates[templateName],
        templateValue: config.templates[templateName]
      }, 'info');

      if (!config.apiKey) {
        throw new Error('Clé API Brevo manquante dans la configuration');
      }
      
      if (!config.templates[templateName]) {
        throw new Error(`Template ${templateName} non associé. Templates configurés: ${Object.keys(config.templates).join(', ')}`);
      }

      const templateId = config.templates[templateName];
      
      const emailData = {
        templateId: parseInt(templateId),
        to: [{ email: to }],
        params: variables,
        // Désactiver le tracking des liens pour les emails de contrat
        disableUrlTracking: templateName === 'contrat'
      };

      debugLog('[BrevoTemplateService] Envoi direct template:', {
        templateName,
        templateId,
        to,
        variablesCount: Object.keys(variables).length
      }, 'info');

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': config.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Erreur Brevo ${response.status}: ${errorData}`);
      }

      const result = await response.json();
      debugLog('[BrevoTemplateService] Template envoyé directement:', { 
        messageId: result.messageId,
        templateName 
      }, 'success');

      return result;
    } catch (error) {
      debugLog('[BrevoTemplateService] Erreur envoi direct template:', error, 'error');
      throw error;
    }
  }

  /**
   * Récupère la configuration Brevo de l'organisation
   * @param {string} organizationId - ID de l'organisation
   * @returns {Promise<Object>} - Configuration Brevo déchiffrée
   */
  async getBrevoConfig(organizationId) {
    const { getDoc, doc } = await import('firebase/firestore');
    const { db } = await import('./firebase-service');
    const { decryptSensitiveFields } = await import('@/utils/cryptoUtils');

    const parametresDoc = await getDoc(
      doc(db, 'organizations', organizationId, 'parametres', 'settings')
    );

    if (!parametresDoc.exists()) {
      throw new Error('Configuration organisation introuvable');
    }

    const parametresData = parametresDoc.data();
    const emailConfig = parametresData.email;

    if (!emailConfig?.brevo?.enabled) {
      throw new Error('Brevo non configuré pour cette organisation');
    }

    // Déchiffrer la clé API
    const decryptedConfig = decryptSensitiveFields(emailConfig.brevo, ['apiKey']);
    
    return decryptedConfig;
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

      // Essayer d'abord l'envoi direct via Brevo
      try {
        const result = await this.sendTemplateDirectly(templateName, emailTest, finalVariables);
        return {
          success: true,
          messageId: result.messageId,
          provider: 'brevo-direct'
        };
      } catch (directError) {
        debugLog('[BrevoTemplateService] Fallback vers Cloud Functions pour test template', { error: directError.message }, 'warning');
        
        // Fallback vers Cloud Functions
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
      }
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