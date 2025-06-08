const nodemailer = require('nodemailer');
const functions = require('firebase-functions');
const admin = require('firebase-admin');

/**
 * Service d'envoi d'emails via SMTP
 * Utilise nodemailer pour envoyer des emails transactionnels
 */

// Configuration du transporteur SMTP
const createTransporter = async (userSmtpConfig = null) => {
  let config;

  if (userSmtpConfig && userSmtpConfig.enabled) {
    // Utiliser la configuration SMTP de l'utilisateur
    config = {
      host: userSmtpConfig.host,
      port: parseInt(userSmtpConfig.port || '587'),
      secure: userSmtpConfig.secure || false,
      auth: {
        user: userSmtpConfig.user,
        pass: userSmtpConfig.pass
      }
    };
  } else {
    // Utiliser la configuration par défaut (variables d'environnement)
    config = {
      host: process.env.SMTP_HOST || functions.config().smtp?.host || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || functions.config().smtp?.port || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || functions.config().smtp?.user,
        pass: process.env.SMTP_PASS || functions.config().smtp?.pass
      }
    };
  }

  // Validation de la configuration
  if (!config.auth.user || !config.auth.pass) {
    throw new Error('Configuration SMTP manquante. Veuillez configurer les paramètres SMTP dans les paramètres de l\'application.');
  }

  return nodemailer.createTransporter(config);
};

/**
 * Envoie un email avec retry automatique
 * @param {Object} mailOptions - Options de l'email (to, subject, html, etc.)
 * @param {Object} userSmtpConfig - Configuration SMTP de l'utilisateur (optionnel)
 * @param {number} retries - Nombre de tentatives (défaut: 3)
 * @returns {Promise} - Résultat de l'envoi
 */
const sendMailWithRetry = async (mailOptions, userSmtpConfig = null, retries = 3) => {
  const transporter = await createTransporter(userSmtpConfig);
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Tentative d'envoi ${attempt}/${retries} pour: ${mailOptions.to}`);
      
      const info = await transporter.sendMail(mailOptions);
      
      console.log('Email envoyé avec succès:', {
        messageId: info.messageId,
        to: mailOptions.to,
        subject: mailOptions.subject,
        attempt
      });
      
      return {
        success: true,
        messageId: info.messageId,
        response: info.response
      };
    } catch (error) {
      console.error(`Erreur envoi email (tentative ${attempt}/${retries}):`, error.message);
      
      // Si c'est la dernière tentative, on lance l'erreur
      if (attempt === retries) {
        throw new Error(`Échec de l'envoi après ${retries} tentatives: ${error.message}`);
      }
      
      // Attendre avant de réessayer (backoff exponentiel)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

/**
 * Récupère la configuration SMTP de l'utilisateur depuis Firebase
 * @param {string} userId - ID de l'utilisateur
 * @param {string} organizationId - ID de l'organisation
 * @returns {Promise<Object>} - Configuration SMTP
 */
const getUserSmtpConfig = async (userId, organizationId) => {
  try {
    // Récupérer les paramètres de l'utilisateur
    const userDoc = await admin.firestore()
      .collection('organizations')
      .doc(organizationId)
      .collection('parametres')
      .doc('settings')
      .get();

    if (userDoc.exists) {
      const params = userDoc.data();
      return params.email?.smtp || null;
    }
    return null;
  } catch (error) {
    console.error('Erreur récupération config SMTP:', error);
    return null;
  }
};

/**
 * Fonction principale d'envoi d'email
 * @param {Object} data - Données de l'email
 * @param {string} data.to - Destinataire
 * @param {string} data.subject - Sujet
 * @param {string} data.html - Contenu HTML
 * @param {string} [data.text] - Contenu texte (fallback)
 * @param {string} [data.from] - Expéditeur (optionnel)
 * @param {Array} [data.attachments] - Pièces jointes (optionnel)
 * @param {string} [data.userId] - ID de l'utilisateur (pour récupérer sa config SMTP)
 * @param {string} [data.organizationId] - ID de l'organisation (pour récupérer la config SMTP)
 */
const sendMail = async (data) => {
  // Validation des données requises
  if (!data.to || !data.subject || (!data.html && !data.text)) {
    throw new Error('Paramètres manquants: to, subject et html/text sont requis');
  }

  // Validation de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.to)) {
    throw new Error('Adresse email invalide');
  }

  // Récupérer la configuration SMTP de l'utilisateur si fournie
  let userSmtpConfig = null;
  if (data.userId && data.organizationId) {
    userSmtpConfig = await getUserSmtpConfig(data.userId, data.organizationId);
  }

  // Configuration de l'email
  const mailOptions = {
    from: data.from || 
          (userSmtpConfig?.from ? `"${userSmtpConfig.fromName || 'TourCraft'}" <${userSmtpConfig.from}>` : null) ||
          process.env.SMTP_FROM || 
          functions.config().smtp?.from || 
          '"TourCraft" <noreply@tourcraft.app>',
    to: data.to,
    subject: data.subject,
    html: data.html,
    text: data.text || stripHtml(data.html), // Fallback texte si non fourni
    attachments: data.attachments || []
  };

  // Ajouter les headers pour améliorer la délivrabilité
  mailOptions.headers = {
    'X-Mailer': 'TourCraft App',
    'X-Priority': '3',
    'X-MSMail-Priority': 'Normal'
  };

  try {
    const result = await sendMailWithRetry(mailOptions, userSmtpConfig);
    return result;
  } catch (error) {
    console.error('Erreur finale envoi email:', error);
    throw error;
  }
};

/**
 * Utilitaire pour convertir HTML en texte
 * @param {string} html - Contenu HTML
 * @returns {string} - Texte sans balises
 */
const stripHtml = (html) => {
  if (!html) return '';
  
  // Remplacer les balises courantes
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
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Supprimer les lignes vides multiples
    .trim();
};

/**
 * Templates d'emails prédéfinis
 */
const emailTemplates = {
  /**
   * Template pour l'envoi de formulaire
   */
  formulaire: (data) => {
    const { nomContact, nomConcert, lienFormulaire, dateEcheance } = data;
    
    return {
      subject: `TourCraft - Formulaire à compléter pour ${nomConcert}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #213547; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>TourCraft</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${nomContact},</h2>
              
              <p>Nous vous remercions pour votre intérêt concernant le concert <strong>${nomConcert}</strong>.</p>
              
              <p>Afin de finaliser l'organisation, nous vous invitons à compléter le formulaire en ligne en cliquant sur le bouton ci-dessous :</p>
              
              <div style="text-align: center;">
                <a href="${lienFormulaire}" class="button">Compléter le formulaire</a>
              </div>
              
              ${dateEcheance ? `<p><strong>Date limite :</strong> ${dateEcheance}</p>` : ''}
              
              <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
              
              <p>Cordialement,<br>L'équipe TourCraft</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement via TourCraft</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  },

  /**
   * Template pour l'envoi de contrat
   */
  contrat: (data) => {
    const { nomContact, nomConcert, dateSignature } = data;
    
    return {
      subject: `TourCraft - Contrat pour ${nomConcert}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #213547; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>TourCraft</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${nomContact},</h2>
              
              <p>Veuillez trouver ci-joint le contrat pour le concert <strong>${nomConcert}</strong>.</p>
              
              ${dateSignature ? `<p>Merci de nous retourner le contrat signé avant le <strong>${dateSignature}</strong>.</p>` : ''}
              
              <p>Si vous avez des questions concernant ce contrat, n'hésitez pas à nous contacter.</p>
              
              <p>Cordialement,<br>L'équipe TourCraft</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement via TourCraft</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  },

  /**
   * Template pour les relances
   */
  relance: (data) => {
    const { nomContact, sujet, message } = data;
    
    return {
      subject: `TourCraft - Relance : ${sujet}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #213547; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>TourCraft</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${nomContact},</h2>
              
              <div>${message}</div>
              
              <p>Cordialement,<br>L'équipe TourCraft</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement via TourCraft</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }
};

/**
 * Envoie un email avec un template prédéfini
 * @param {string} templateName - Nom du template
 * @param {Object} data - Données pour le template
 * @param {string} to - Email du destinataire
 * @param {string} [userId] - ID de l'utilisateur (pour récupérer sa config SMTP)
 * @param {string} [organizationId] - ID de l'organisation
 */
const sendTemplatedMail = async (templateName, data, to, userId = null, organizationId = null) => {
  if (!emailTemplates[templateName]) {
    throw new Error(`Template '${templateName}' non trouvé`);
  }

  const template = emailTemplates[templateName](data);
  
  return sendMail({
    to,
    subject: template.subject,
    html: template.html,
    userId,
    organizationId
  });
};

module.exports = {
  sendMail,
  sendTemplatedMail,
  emailTemplates
};