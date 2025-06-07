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
              .page-break {
                page-break-after: always;
                break-after: page; /* Version moderne de page-break-after */
                page-break-before: auto;
                break-before: auto;
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
        preferCSSPageSize: true
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
