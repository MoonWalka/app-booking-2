const axios = require('axios');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { decryptBrevoApiKey, generateAuditHash } = require('./cryptoUtils');

/**
 * Service d'envoi d'emails via Brevo (ex-Sendinblue)
 * Alternative à SMTP avec templates visuels et variables dynamiques
 */

/**
 * Classe principale pour le service Brevo
 */
class BrevoEmailService {
  constructor() {
    this.api = null;
    this.initialized = false;
  }

  /**
   * Initialise l'API Brevo avec la clé API
   * @param {string} apiKey - Clé API Brevo
   */
  init(apiKey) {
    if (!apiKey) {
      throw new Error('Clé API Brevo manquante');
    }

    this.apiKey = apiKey;
    this.baseURL = 'https://api.brevo.com/v3';
    this.initialized = true;
    
    console.log('Service Brevo initialisé avec succès');
  }

  /**
   * Valide que le service est initialisé
   */
  validateInitialized() {
    if (!this.initialized || !this.apiKey) {
      throw new Error('Service Brevo non initialisé. Appelez init() d\'abord.');
    }
  }

  /**
   * Effectue un appel HTTP à l'API Brevo
   * @param {string} endpoint - Endpoint de l'API
   * @param {string} method - Méthode HTTP
   * @param {Object} data - Données à envoyer
   * @returns {Promise<Object>} - Réponse de l'API
   */
  async makeRequest(endpoint, method = 'GET', data = null) {
    this.validateInitialized();

    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 15000 // 15 seconds timeout
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        config.data = data;
      }

      console.log(`[DEBUG] Making ${method} request to: ${config.url}`);
      console.log(`[DEBUG] Request headers:`, {
        'api-key': this.apiKey?.substring(0, 10) + '...',
        'Content-Type': config.headers['Content-Type']
      });

      const response = await axios(config);
      
      console.log(`[DEBUG] Response received:`, {
        status: response.status,
        statusText: response.statusText,
        dataKeys: response.data ? Object.keys(response.data) : 'null'
      });
      
      return response.data;
    } catch (error) {
      console.error('[ERROR] Erreur API Brevo:', {
        endpoint,
        method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        code: error.code
      });
      throw this.handleBrevoError(error);
    }
  }

  /**
   * Envoie un email avec un template Brevo
   * @param {number} templateId - ID du template Brevo
   * @param {string} to - Email du destinataire
   * @param {Object} variables - Variables pour le template
   * @param {Object} options - Options additionnelles (from, replyTo, etc.)
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendTemplateEmail(templateId, to, variables = {}, options = {}) {
    this.validateInitialized();

    // Validation des paramètres
    if (!templateId || !to) {
      throw new Error('templateId et to sont requis');
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new Error('Adresse email invalide');
    }

    const emailData = {
      templateId: parseInt(templateId),
      to: [{ email: to }],
      params: variables
    };

    // Ajouter les options si fournies
    if (options.from) {
      emailData.sender = { email: options.from, name: options.fromName || 'TourCraft' };
    }
    if (options.replyTo) {
      emailData.replyTo = { email: options.replyTo };
    }
    if (options.subject) {
      emailData.subject = options.subject;
    }

    try {
      console.log('Envoi email Brevo:', {
        templateId,
        to,
        variablesCount: Object.keys(variables).length
      });

      const response = await this.makeRequest('/smtp/email', 'POST', emailData);
      
      console.log('Email Brevo envoyé avec succès:', {
        messageId: response.messageId,
        to,
        templateId
      });

      return {
        success: true,
        messageId: response.messageId,
        provider: 'brevo'
      };
    } catch (error) {
      console.error('Erreur envoi email Brevo:', error);
      throw this.handleBrevoError(error);
    }
  }

  /**
   * Envoie un email transactionnel simple (sans template)
   * @param {string} to - Email du destinataire
   * @param {string} subject - Sujet de l'email
   * @param {string} htmlContent - Contenu HTML
   * @param {Object} options - Options additionnelles
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendTransactionalEmail(to, subject, htmlContent, options = {}) {
    this.validateInitialized();

    // Validation des paramètres
    if (!to || !subject || !htmlContent) {
      throw new Error('to, subject et htmlContent sont requis');
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new Error('Adresse email invalide');
    }

    const emailData = {
      to: [{ email: to }],
      subject,
      htmlContent,
      textContent: options.textContent || this.stripHtml(htmlContent)
    };

    // Ajouter les options si fournies
    if (options.from) {
      emailData.sender = { email: options.from, name: options.fromName || 'TourCraft' };
    }
    if (options.replyTo) {
      emailData.replyTo = { email: options.replyTo };
    }

    try {
      console.log('Envoi email transactionnel Brevo:', { to, subject });

      const response = await this.makeRequest('/smtp/email', 'POST', emailData);
      
      console.log('Email transactionnel Brevo envoyé avec succès:', {
        messageId: response.messageId,
        to,
        subject
      });

      return {
        success: true,
        messageId: response.messageId,
        provider: 'brevo'
      };
    } catch (error) {
      console.error('Erreur envoi email transactionnel Brevo:', error);
      throw this.handleBrevoError(error);
    }
  }

  /**
   * Récupère la liste des templates Brevo
   * @returns {Promise<Array>} - Liste des templates
   */
  async getTemplateList() {
    this.validateInitialized();

    try {
      const response = await this.makeRequest('/smtp/templates');
      return response.templates || [];
    } catch (error) {
      console.error('Erreur récupération templates Brevo:', error);
      throw this.handleBrevoError(error);
    }
  }

  /**
   * Valide la clé API Brevo
   * @returns {Promise<boolean>} - True si la clé est valide
   */
  async validateApiKey() {
    this.validateInitialized();

    try {
      console.log(`[DEBUG] Making request to /account endpoint with apiKey: ${this.apiKey?.substring(0, 10)}...`);
      
      // Test simple avec récupération du compte
      const result = await this.makeRequest('/account');
      console.log(`[DEBUG] Account request successful:`, {
        email: result?.email,
        planType: result?.plan?.type,
        companyName: result?.companyName
      });
      
      return true;
    } catch (error) {
      console.error('[ERROR] Validation clé API Brevo échouée:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      return false;
    }
  }

  /**
   * Gère les erreurs spécifiques à Brevo
   * @param {Error} error - Erreur Brevo
   * @returns {Error} - Erreur formatée
   */
  handleBrevoError(error) {
    // Codes d'erreur Brevo communs
    if (error.response && error.response.data) {
      const errorData = error.response.data;
      
      switch (error.response.status) {
        case 400:
          return new Error(`Requête invalide: ${errorData.message || 'Paramètres incorrects'}`);
        case 401:
          return new Error('Clé API Brevo invalide ou expirée');
        case 402:
          return new Error('Quota Brevo dépassé');
        case 404:
          return new Error('Template Brevo non trouvé');
        case 429:
          return new Error('Limite de taux Brevo atteinte');
        default:
          return new Error(`Erreur Brevo ${error.response.status}: ${errorData.message || 'Erreur inconnue'}`);
      }
    }

    // Erreurs de réseau ou autres
    return new Error(`Erreur de communication avec Brevo: ${error.message}`);
  }

  /**
   * Utilitaire pour convertir HTML en texte
   * @param {string} html - Contenu HTML
   * @returns {string} - Texte sans balises
   */
  stripHtml(html) {
    if (!html) return '';
    
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  }
}

/**
 * Service unifié d'email avec support SMTP et Brevo
 */
class UnifiedEmailService {
  constructor() {
    this.brevoService = new BrevoEmailService();
    this.smtpService = require('./sendMail.js');
  }

  /**
   * Récupère la configuration email de l'utilisateur avec déchiffrement sécurisé
   * @param {string} userId - ID de l'utilisateur
   * @param {string} organizationId - ID de l'organisation
   * @returns {Promise<Object>} - Configuration email déchiffrée
   */
  async getEmailConfig(userId, organizationId) {
    try {
      console.log(`[DEBUG] getEmailConfig - userId: ${userId}, organizationId: ${organizationId}`);
      
      const userDoc = await admin.firestore()
        .collection('organizations')
        .doc(organizationId)
        .collection('parametres')
        .doc('settings')
        .get();

      console.log(`[DEBUG] Document exists: ${userDoc.exists}`);
      
      if (userDoc.exists) {
        const params = userDoc.data();
        console.log(`[DEBUG] Params keys: ${Object.keys(params)}`);
        console.log(`[DEBUG] Email config exists: ${!!params.email}`);
        
        const emailConfig = params.email || { provider: 'smtp' };
        console.log(`[DEBUG] Email provider: ${emailConfig.provider}`);
        console.log(`[DEBUG] Brevo enabled: ${emailConfig.brevo?.enabled}`);
        console.log(`[DEBUG] Brevo apiKey exists: ${!!emailConfig.brevo?.apiKey}`);
        
        // Déchiffrer les données sensibles
        if (emailConfig.brevo?.apiKey) {
          try {
            console.log(`[DEBUG] Tentative déchiffrement - apiKey starts with: ${emailConfig.brevo.apiKey.substring(0, 10)}..., userId: ${userId}`);
            const decryptedApiKey = decryptBrevoApiKey(emailConfig.brevo.apiKey, userId);
            console.log(`[DEBUG] Déchiffrement réussi - clé déchiffrée starts with: ${decryptedApiKey?.substring(0, 10) || 'null'}...`);
            emailConfig.brevo.apiKey = decryptedApiKey;
            
            // Audit log (sans révéler la clé)
            const auditHash = generateAuditHash(decryptedApiKey);
            console.info(`[AUDIT] Clé API Brevo utilisée - User: ${userId}, Hash: ${auditHash}`);
          } catch (decryptError) {
            console.error('[ERROR] Erreur déchiffrement clé API Brevo:', {
              message: decryptError.message,
              userId: userId,
              apiKeyPrefix: emailConfig.brevo.apiKey?.substring(0, 10) || 'null',
              stack: decryptError.stack
            });
            
            // Vérifier si la clé est déjà en clair (cas de test/debug)
            if (emailConfig.brevo.apiKey && emailConfig.brevo.apiKey.startsWith('xkeysib-')) {
              console.log('[DEBUG] Clé API semble déjà en clair, utilisation directe');
              // Garder la clé telle quelle
            } else {
              console.error('[ERROR] Impossible de déchiffrer la clé API, fallback vers SMTP');
              // En cas d'erreur de déchiffrement, utiliser SMTP en fallback
              emailConfig.provider = 'smtp';
              emailConfig.brevo.enabled = false;
            }
          }
        }
        
        return emailConfig;
      } else {
        console.log('[DEBUG] Document n\'existe pas - configuration email non trouvée');
      }
      return { provider: 'smtp' };
    } catch (error) {
      console.error('[DEBUG] Erreur récupération config email:', error);
      return { provider: 'smtp' };
    }
  }

  /**
   * Envoie un email avec retry automatique et fallback
   * @param {Object} emailData - Données de l'email
   * @param {number} retries - Nombre de tentatives (défaut: 3)
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendEmailWithFallback(emailData, retries = 3) {
    console.log('[DEBUG] === DÉBUT sendEmailWithFallback ===');
    console.log('[DEBUG] emailData reçu:', JSON.stringify(emailData, null, 2));
    
    const { userId, organizationId } = emailData;
    console.log(`[DEBUG] sendEmailWithFallback - userId: ${userId}, organizationId: ${organizationId}`);
    console.log(`[DEBUG] emailData keys: ${Object.keys(emailData)}`);
    console.log(`[DEBUG] emailData.to: ${emailData.to}, templateName: ${emailData.templateName}`);
    
    // Validation des paramètres critiques
    if (!emailData.to) {
      throw new Error('Adresse email destinataire manquante');
    }
    
    if (!userId || !organizationId) {
      throw new Error('userId et organizationId sont requis');
    }
    
    console.log('[DEBUG] Récupération config email...');
    const config = await this.getEmailConfig(userId, organizationId);
    console.log(`[DEBUG] Config récupérée:`, {
      provider: config.provider,
      brevoEnabled: config.brevo?.enabled,
      hasBrevoApiKey: !!config.brevo?.apiKey,
      smtpConfigured: !!config.smtp
    });

    // Tentative avec le provider principal
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        if (config.provider === 'brevo' && config.brevo?.enabled && config.brevo?.apiKey) {
          console.log(`Tentative Brevo ${attempt}/${retries}`);
          return await this.sendWithBrevo(emailData, config.brevo);
        } else {
          console.log(`Tentative SMTP ${attempt}/${retries}`);
          return await this.sendWithSMTP(emailData, config.smtp);
        }
      } catch (error) {
        console.error(`Échec tentative ${attempt}/${retries} avec ${config.provider}:`, error.message);
        
        if (attempt === retries) {
          // Dernière tentative - essayer fallback si possible
          if (config.provider === 'brevo') {
            console.log('Fallback vers SMTP...');
            try {
              return await this.sendWithSMTP(emailData, config.smtp);
            } catch (fallbackError) {
              console.error('Fallback SMTP échoué:', fallbackError.message);
              throw new Error(`Échec Brevo et SMTP: ${error.message}`);
            }
          } else {
            throw error;
          }
        }

        // Attendre avant de réessayer (backoff exponentiel)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  /**
   * Envoie un email via Brevo
   * @param {Object} emailData - Données de l'email
   * @param {Object} brevoConfig - Configuration Brevo
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendWithBrevo(emailData, brevoConfig) {
    this.brevoService.init(brevoConfig.apiKey);

    const options = {
      from: brevoConfig.fromEmail,
      fromName: brevoConfig.fromName || 'TourCraft'
    };

    if (emailData.templateName && brevoConfig.templates?.[emailData.templateName]) {
      // Envoi avec template Brevo
      const templateId = brevoConfig.templates[emailData.templateName];
      return await this.brevoService.sendTemplateEmail(
        templateId,
        emailData.to,
        emailData.variables || {},
        options
      );
    } else {
      // Envoi transactionnel simple
      return await this.brevoService.sendTransactionalEmail(
        emailData.to,
        emailData.subject,
        emailData.html,
        options
      );
    }
  }

  /**
   * Envoie un email via SMTP
   * @param {Object} emailData - Données de l'email
   * @param {Object} smtpConfig - Configuration SMTP
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendWithSMTP(emailData, smtpConfig) {
    if (emailData.templateName) {
      // Utiliser le template SMTP existant
      return await this.smtpService.sendTemplatedMail(
        emailData.templateName,
        emailData.variables || {},
        emailData.to,
        emailData.userId,
        emailData.organizationId
      );
    } else {
      // Envoi SMTP simple
      return await this.smtpService.sendMail({
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        attachments: emailData.attachments,
        userId: emailData.userId,
        organizationId: emailData.organizationId
      });
    }
  }
}

// Instance singleton
const unifiedEmailService = new UnifiedEmailService();

module.exports = {
  BrevoEmailService,
  UnifiedEmailService,
  sendEmail: (emailData, retries = 3) => unifiedEmailService.sendEmailWithFallback(emailData, retries),
  validateBrevoApiKey: async (apiKey) => {
    // Pas de déchiffrement ici car la clé API est déjà en clair lors de la validation côté client
    console.log(`[DEBUG] validateBrevoApiKey called with apiKey length: ${apiKey?.length || 0}`);
    console.log(`[DEBUG] apiKey starts with: ${apiKey?.substring(0, 10) || 'N/A'}...`);
    
    try {
      const service = new BrevoEmailService();
      service.init(apiKey);
      
      // Audit log de la validation
      const auditHash = generateAuditHash(apiKey);
      console.info(`[AUDIT] Validation clé API Brevo - Hash: ${auditHash}`);
      
      const result = await service.validateApiKey();
      console.log(`[DEBUG] validateApiKey result: ${result}`);
      
      return result;
    } catch (error) {
      console.error(`[ERROR] validateBrevoApiKey failed:`, error);
      return false;
    }
  },
  getBrevoTemplates: async (apiKey) => {
    // Pas de déchiffrement ici car la clé API est déjà en clair lors de la récupération des templates côté client
    const service = new BrevoEmailService();
    service.init(apiKey);
    
    // Audit log de l'accès aux templates
    const auditHash = generateAuditHash(apiKey);
    console.info(`[AUDIT] Récupération templates Brevo - Hash: ${auditHash}`);
    
    return await service.getTemplateList();
  }
};