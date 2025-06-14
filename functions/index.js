const { onRequest } = require('firebase-functions/v2/https');
const { defineString } = require('firebase-functions/params');
const admin = require('firebase-admin');
const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const cors = require('cors')({
  origin: true, // Accepte toutes les origines
  methods: ['POST', 'OPTIONS'], // Méthodes autorisées
  allowedHeaders: ['Content-Type', 'Authorization'], // En-têtes autorisés
  maxAge: 86400 // Durée de mise en cache en secondes (24 heures)
});

// Import des services d'email
const { sendMail, sendTemplatedMail } = require('./sendMail');
const { sendEmail: sendUnifiedEmail, validateBrevoApiKey, getBrevoTemplates } = require('./brevoService');

// Définition des paramètres SMTP
const smtpHost = defineString('SMTP_HOST');
const smtpPort = defineString('SMTP_PORT');
const smtpUser = defineString('SMTP_USER');
const smtpPass = defineString('SMTP_PASS');
const smtpFrom = defineString('SMTP_FROM');

admin.initializeApp();

// Fonction utilitaire pour formater la taille du fichier
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
  else return (bytes / 1073741824).toFixed(2) + ' GB';
}

// Fonction pour générer un PDF à partir de HTML
exports.generatePdf = onRequest({ 
  timeoutSeconds: 300, // 300 secondes (5 minutes)
  memory: '4GiB',      // Augmenté à 4GB pour plus de stabilité
  cors: true
}, (request, response) => {
  // Gérer la requête preflight CORS
  if (request.method === 'OPTIONS') {
    // Return response for CORS preflight
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.set('Access-Control-Max-Age', '86400');
    response.status(204).send('');
    return;
  }

  cors(request, response, async () => {
    let browser = null;
    let startTime = Date.now();
    
    try {
      console.log('Début de la génération du PDF');
      // Vérifier la méthode HTTP
      if (request.method !== 'POST') {
        return response.status(405).send('Méthode non autorisée');
      }

      // Récupérer les données de la requête
      const { htmlContent, options = {}, title } = request.body;

      if (!htmlContent) {
        return response.status(400).send('Contenu HTML manquant');
      }

      console.log('Contenu HTML reçu, taille:', htmlContent.length, 'caractères');

      // Créer un HTML complet avec styles intégrés
      const fullHtmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>${title || 'Contrat'}</title>
            <style>
              @page {
                margin: 30px;
                size: A4;
              }
              body {
                font-family: 'Helvetica', Arial, sans-serif;
                font-size: 10pt;
                line-height: 1.4;
                padding: 0;
                margin: 0;
              }
              /* Styles pour ReactQuill */
              .ql-align-center, p[style*="text-align: center"] {
                text-align: center;
              }
              .ql-align-right, p[style*="text-align: right"] {
                text-align: right;
              }
              .ql-align-justify, p[style*="text-align: justify"] {
                text-align: justify;
              }
              /* S'assurer que les paragraphes avec <br> ont un espace vertical */
              p:empty, p:has(br:only-child) {
                margin-bottom: 10px;
                height: 14px;
              }
              /* Assurer que les images ne dépassent pas la largeur de la page */
              img {
                max-width: 100%;
                height: auto;
              }
              /* Améliorer la gestion des sauts de page */
              .page-break,
              div[data-page-break="true"] {
                page-break-after: always !important;
                page-break-before: avoid !important;
                break-after: page !important;
                break-before: avoid !important;
                display: block;
                height: 0;
                margin: 0;
                padding: 0;
                visibility: hidden;
                clear: both;
              }
              
              /* S'assurer que le saut de page fonctionne même dans un div */
              div.page-break {
                page-break-after: always !important;
                break-after: page !important;
                page-break-before: avoid !important;
                break-before: avoid !important;
              }
              
              /* Forcer un nouveau contexte de formatage pour les sauts de page */
              .page-break::before,
              .page-break::after {
                content: "";
                display: table;
                clear: both;
              }
              
              /* Masquer le contenu interne des sauts de page (texte de l'éditeur) */
              .page-break > *,
              div[data-page-break="true"] > * {
                display: none !important;
              }
              
              /* Styles spécifiques pour les divs Quill avec saut de page */
              div[data-page-break="true"] {
                page-break-after: always !important;
                break-after: page !important;
                height: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                visibility: hidden !important;
                clear: both !important;
              }
              
              /* Éviter la coupure des tableaux entre les pages */
              table {
                page-break-inside: avoid;
              }
            </style>
          </head>
          <body>
            <div class="content">
              ${htmlContent}
            </div>
          </body>
        </html>
      `;

      console.log('Démarrage de Puppeteer...');
      
      // Tentative d'obtention du chemin de Chrome depuis chrome-aws-lambda
      let executablePath = await chromium.executablePath;
      
      // Chemins alternatifs de Chrome pour macOS
      const macChromePaths = [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
        '/Applications/Chromium.app/Contents/MacOS/Chromium'
      ];
      
      // S'il n'y a pas de chemin exécutable de Chrome ou si nous sommes sur macOS
      if (!executablePath && process.platform === 'darwin') {
        // Essayer d'utiliser les chemins macOS
        for (const path of macChromePaths) {
          try {
            const fs = require('fs');
            if (fs.existsSync(path)) {
              executablePath = path;
              console.log(`Utilisation du Chrome local sur macOS: ${path}`);
              break;
            }
          } catch (error) {
            console.warn(`Erreur lors de la vérification du chemin Chrome ${path}:`, error);
          }
        }
      }
      
      // Configuration optimisée pour les environnements serverless
      const puppeteerConfig = {
        // Utiliser l'exécutable de chromium quand disponible, sinon null (Puppeteer cherchera lui-même)
        executablePath: executablePath || undefined,
        headless: chromium.headless !== false ? true : chromium.headless,
        args: [
          ...chromium.args,
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--no-first-run',
          '--no-sandbox',
          '--no-zygote',
          '--single-process',
          '--disable-extensions'
        ],
        defaultViewport: chromium.defaultViewport || {
          width: 800,
          height: 1120,
          deviceScaleFactor: 1,
        },
        ignoreHTTPSErrors: true,
      };
      
      console.log('Configuration de Puppeteer:', {
        executablePath: executablePath ? executablePath : 'Non détecté, utilisation de la recherche automatique',
        headless: puppeteerConfig.headless,
        args: 'Args configurés',
        platform: process.platform
      });
      
      try {
        // Lancer Puppeteer avec la configuration
        browser = await puppeteer.launch(puppeteerConfig);
      } catch (browserError) {
        console.error('Erreur lors du lancement du navigateur avec la configuration initiale:', browserError);
        
        // Tenter une configuration de fallback sans chemin d'exécutable spécifique
        console.log('Tentative avec une configuration de secours...');
        const fallbackConfig = {
          ...puppeteerConfig,
          executablePath: undefined,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        };
        
        browser = await puppeteer.launch(fallbackConfig);
        console.log('Navigateur lancé avec configuration de secours');
      }

      console.log('Création d\'une nouvelle page...');
      const page = await browser.newPage();
      
      // Optimiser les performances de la page
      await page.setViewport({
        width: 800,
        height: 1120,
        deviceScaleFactor: 1,
      });
      
      // Ajouter des écouteurs d'événements pour détecter les problèmes
      page.on('error', error => {
        console.error('Erreur dans la page:', error);
      });
      
      page.on('pageerror', error => {
        console.error('Erreur JavaScript dans la page:', error);
      });
      
      page.on('console', msg => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
          console.log(`Console ${msg.type()}: ${msg.text()}`);
        }
      });
      
      console.log('Configuration du contenu HTML...');
      
      // Émuler le média print pour s'assurer que les styles CSS print sont appliqués
      await page.emulateMediaType('print');
      
      // Définir le contenu HTML avec un timeout plus long
      await page.setContent(fullHtmlContent, {
        waitUntil: 'networkidle0',
        timeout: 120000 // 120 secondes maximum pour le chargement
      });

      console.log('Configuration des options PDF...');
      // Options PDF par défaut
      const pdfOptions = {
        format: 'A4',
        printBackground: true,
        margin: {
          top: options.headerTemplate ? '50px' : '30px',
          right: '30px',
          bottom: options.footerTemplate ? '50px' : '30px',
          left: '30px'
        },
        displayHeaderFooter: !!options.headerTemplate || !!options.footerTemplate,
        headerTemplate: options.headerTemplate || '',
        footerTemplate: options.footerTemplate || '<div style="font-size: 8pt; text-align: center; width: 100%"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
        timeout: 180000, // 3 minutes maximum pour la génération PDF
        ...options,
        // S'assurer que ces options sont toujours appliquées même si options les écrase
        preferCSSPageSize: true,
        // Activer l'impression des backgrounds et des styles CSS
        '-webkit-print-color-adjust': 'exact',
        // S'assurer que les media queries print sont respectées
        emulateMediaType: 'print'
      };

      console.log('Génération du PDF...');
      // Générer le PDF
      const pdf = await page.pdf(pdfOptions);
      
      // Mesurer la taille du PDF
      const pdfSize = pdf.length;
      const formattedSize = formatFileSize(pdfSize);
      const processingTime = (Date.now() - startTime) / 1000;
      
      console.log(`PDF généré avec succès - Taille: ${formattedSize}, Temps de traitement: ${processingTime.toFixed(2)}s`);
      
      // Enregistrer les informations sur le PDF dans Firestore pour analyse (optionnel)
      try {
        const db = admin.firestore();
        await db.collection('pdf_metrics').add({
          title: title || 'Sans titre',
          size: pdfSize,
          sizeFormatted: formattedSize,
          contentLength: htmlContent.length,
          processingTime: processingTime,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          // Vous pouvez ajouter d'autres métadonnées utiles ici
        });
        console.log('Métriques PDF enregistrées dans Firestore');
      } catch (metricsError) {
        console.error('Erreur lors de l\'enregistrement des métriques:', metricsError);
        // Ne pas bloquer le processus principal si l'enregistrement des métriques échoue
      }

      console.log('Fermeture du navigateur...');
      // Fermer le navigateur
      if (browser) {
        await browser.close();
        browser = null;
      }

      console.log('Envoi de la réponse PDF...');
      // Définir les en-têtes de la réponse
      response.set('Access-Control-Allow-Origin', '*');
      response.setHeader('Content-Type', 'application/pdf');
      response.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(title || 'contrat')}.pdf"`);
      
      // Envoyer le PDF
      response.send(pdf);
      console.log(`PDF envoyé avec succès - Taille: ${formattedSize}`);
    } catch (error) {
      console.error('Erreur détaillée lors de la génération du PDF:', error);
      // Obtenir plus de détails sur l'erreur
      const errorDetails = {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code,
        syscall: error.syscall,
        path: error.path,
        processingTime: (Date.now() - startTime) / 1000
      };
      console.error('Détails de l\'erreur:', JSON.stringify(errorDetails));
      
      // Assurez-vous que le navigateur est bien fermé en cas d'erreur
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          console.error('Erreur lors de la fermeture du navigateur:', closeError);
        }
      }
      
      // Envoyer une réponse d'erreur détaillée
      response.set('Access-Control-Allow-Origin', '*');
      response.status(500).send({
        error: 'Erreur lors de la génération du PDF',
        message: error.message,
        details: errorDetails
      });
    }
  });
});

/**
 * Fonction Cloud pour l'envoi d'emails via SMTP
 * Utilise nodemailer pour envoyer des emails transactionnels
 */
exports.sendEmail = onRequest({
  timeoutSeconds: 60,
  memory: '256MiB',
  cors: true
}, (request, response) => {
  // Gérer la requête preflight CORS
  if (request.method === 'OPTIONS') {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.set('Access-Control-Max-Age', '86400');
    response.status(204).send('');
    return;
  }

  cors(request, response, async () => {
    try {
      console.log('Début de l\'envoi d\'email');
      
      // Vérifier la méthode HTTP
      if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Méthode non autorisée' });
      }

      const { to, subject, html, text, from, attachments, template, templateData, userId, organizationId } = request.body;

      // Si un template est spécifié, utiliser sendTemplatedMail
      if (template) {
        if (!to || !templateData) {
          return response.status(400).json({ 
            error: 'Paramètres manquants pour l\'envoi avec template' 
          });
        }

        console.log(`Envoi d'email avec template: ${template} à ${to}`);
        const result = await sendTemplatedMail(template, templateData, to, userId, organizationId);
        
        response.set('Access-Control-Allow-Origin', '*');
        return response.status(200).json({
          success: true,
          message: 'Email envoyé avec succès',
          messageId: result.messageId
        });
      }

      // Sinon, utiliser sendMail standard
      if (!to || !subject || (!html && !text)) {
        return response.status(400).json({ 
          error: 'Paramètres manquants: to, subject et html/text sont requis' 
        });
      }

      console.log(`Envoi d'email standard à ${to}`);
      const result = await sendMail({
        to,
        subject,
        html,
        text,
        from,
        attachments,
        userId,
        organizationId
      });

      response.set('Access-Control-Allow-Origin', '*');
      response.status(200).json({
        success: true,
        message: 'Email envoyé avec succès',
        messageId: result.messageId
      });

    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      
      response.set('Access-Control-Allow-Origin', '*');
      response.status(500).json({
        error: 'Erreur lors de l\'envoi de l\'email',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });
});

/**
 * Fonction Cloud pour l'envoi d'emails unifié (SMTP + Brevo)
 * Gère automatiquement le fallback et le retry
 */
exports.sendUnifiedEmail = onRequest({
  timeoutSeconds: 60,
  memory: '256MiB',
  cors: true
}, (request, response) => {
  // Gérer la requête preflight CORS
  if (request.method === 'OPTIONS') {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.set('Access-Control-Max-Age', '86400');
    response.status(204).send('');
    return;
  }

  cors(request, response, async () => {
    try {
      console.log('Début de l\'envoi d\'email unifié');
      
      // Vérifier la méthode HTTP
      if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Méthode non autorisée' });
      }

      const emailData = request.body;

      // Validation des données requises
      if (!emailData.to) {
        return response.status(400).json({ 
          error: 'Adresse email destinataire manquante' 
        });
      }

      console.log(`Envoi d'email unifié à ${emailData.to}`);
      const result = await sendUnifiedEmail(emailData);
      
      response.set('Access-Control-Allow-Origin', '*');
      response.status(200).json({
        success: true,
        message: 'Email envoyé avec succès',
        messageId: result.messageId,
        provider: result.provider
      });

    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email unifié:', error);
      
      response.set('Access-Control-Allow-Origin', '*');
      response.status(500).json({
        error: 'Erreur lors de l\'envoi de l\'email',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });
});

/**
 * Fonction Cloud pour valider une clé API Brevo
 */
exports.validateBrevoKey = onRequest({
  timeoutSeconds: 30,
  memory: '128MiB',
  cors: true
}, (request, response) => {
  // Gérer la requête preflight CORS
  if (request.method === 'OPTIONS') {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.set('Access-Control-Max-Age', '86400');
    response.status(204).send('');
    return;
  }

  cors(request, response, async () => {
    try {
      // Vérifier la méthode HTTP
      if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Méthode non autorisée' });
      }

      const { apiKey } = request.body;

      if (!apiKey) {
        return response.status(400).json({ 
          error: 'Clé API Brevo manquante' 
        });
      }

      console.log('Validation de la clé API Brevo');
      const isValid = await validateBrevoApiKey(apiKey);
      
      response.set('Access-Control-Allow-Origin', '*');
      response.status(200).json({
        valid: isValid,
        message: isValid ? 'Clé API valide' : 'Clé API invalide'
      });

    } catch (error) {
      console.error('Erreur lors de la validation de la clé API Brevo:', error);
      
      response.set('Access-Control-Allow-Origin', '*');
      response.status(500).json({
        error: 'Erreur lors de la validation de la clé API',
        message: error.message
      });
    }
  });
});

/**
 * Fonction Cloud pour récupérer les templates Brevo
 */
exports.getBrevoTemplates = onRequest({
  timeoutSeconds: 30,
  memory: '128MiB',
  cors: true
}, (request, response) => {
  // Gérer la requête preflight CORS
  if (request.method === 'OPTIONS') {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.set('Access-Control-Max-Age', '86400');
    response.status(204).send('');
    return;
  }

  cors(request, response, async () => {
    try {
      // Vérifier la méthode HTTP
      if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Méthode non autorisée' });
      }

      const { apiKey } = request.body;

      if (!apiKey) {
        return response.status(400).json({ 
          error: 'Clé API Brevo manquante' 
        });
      }

      console.log('Récupération des templates Brevo');
      const templates = await getBrevoTemplates(apiKey);
      
      response.set('Access-Control-Allow-Origin', '*');
      response.status(200).json({
        success: true,
        templates: templates
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des templates Brevo:', error);
      
      response.set('Access-Control-Allow-Origin', '*');
      response.status(500).json({
        error: 'Erreur lors de la récupération des templates',
        message: error.message
      });
    }
  });
});
