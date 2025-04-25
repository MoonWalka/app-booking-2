const functions = require('firebase-functions');
const admin = require('firebase-admin');
const puppeteer = require('puppeteer');
const cors = require('cors')({
  origin: true, // Accepte toutes les origines
  methods: ['POST', 'OPTIONS'], // Méthodes autorisées
  allowedHeaders: ['Content-Type', 'Authorization'], // En-têtes autorisés
  maxAge: 86400 // Durée de mise en cache en secondes (24 heures)
});

admin.initializeApp();

// Fonction pour générer un PDF à partir de HTML
exports.generatePdf = functions
  .runWith({
    timeoutSeconds: 300, // Augmenter le timeout pour les opérations complexes
    memory: '1GB', // Allouer plus de mémoire pour Puppeteer
  })
  .https.onRequest((request, response) => {
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
      try {
        // Vérifier la méthode HTTP
        if (request.method !== 'POST') {
          return response.status(405).send('Méthode non autorisée');
        }

        // Récupérer les données de la requête
        const { htmlContent, options = {}, title } = request.body;

        if (!htmlContent) {
          return response.status(400).send('Contenu HTML manquant');
        }

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
                .title {
                  font-size: 16pt;
                  font-weight: bold;
                  text-align: center;
                  margin-bottom: 20px;
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
              </style>
            </head>
            <body>
              ${title ? `<div class="title">${title}</div>` : ''}
              <div class="content">
                ${htmlContent}
              </div>
            </body>
          </html>
        `;

        // Lancer Puppeteer
        const browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ]
        });

        const page = await browser.newPage();
        
        // Définir le contenu HTML
        await page.setContent(fullHtmlContent, {
          waitUntil: 'networkidle0'
        });

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
          ...options
        };

        // Générer le PDF
        const pdf = await page.pdf(pdfOptions);

        // Fermer le navigateur
        await browser.close();

        // Définir les en-têtes de la réponse
        response.set('Access-Control-Allow-Origin', '*');
        response.setHeader('Content-Type', 'application/pdf');
        response.setHeader('Content-Disposition', `attachment; filename="${title || 'contrat'}.pdf"`);
        
        // Envoyer le PDF
        response.send(pdf);
      } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        response.set('Access-Control-Allow-Origin', '*');
        response.status(500).send(`Erreur lors de la génération du PDF: ${error.message}`);
      }
    });
  });
