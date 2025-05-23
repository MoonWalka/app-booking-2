#!/usr/bin/env node

/**
 * Script de test automatisé pour le rendu PDF des contrats TourCraft
 * 
 * Ce script génère automatiquement des PDFs avec différents modèles de contenu
 * pour valider le CSS d'impression amélioré.
 * 
 * Usage: node scripts/test-pdf-rendering.js
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Configuration
const CONFIG = {
  outputDir: './test-results/pdf-render-tests',
  baseUrl: 'http://localhost:3000',
  timeout: 30000,
  viewport: { width: 1200, height: 800 }
};

// Modèles de test
const TEST_MODELS = {
  'test1-listes': {
    title: 'Contrat Simple avec Listes',
    content: `
      <h1>Contrat de Prestation - Concert Printemps 2025</h1>
      
      <h2>Article 1 - Objet du contrat</h2>
      <p>Le présent contrat a pour objet :</p>
      <ul>
        <li>La prestation artistique de l'artiste <strong>The Moonlight Band</strong></li>
        <li>La mise à disposition du lieu <strong>Salle des Fêtes</strong></li>
        <li>Les services techniques associés :
          <ul>
            <li>Sonorisation</li>
            <li>Éclairage</li>
            <li>Sécurité</li>
            <ul>
              <li>Agent de sécurité</li>
              <li>Secours</li>
            </ul>
          </ul>
        </li>
      </ul>
      
      <h2>Article 2 - Modalités financières</h2>
      <ol>
        <li>Montant de la prestation : <strong>2500€</strong></li>
        <li>Modalités de paiement :
          <ol>
            <li>50% à la signature</li>
            <li>50% le jour de la prestation</li>
          </ol>
        </li>
      </ol>
    `
  },
  
  'test2-tableaux': {
    title: 'Contrat avec Tableau Complexe', 
    content: `
      <h1>Contrat Technique - Spécifications</h1>
      
      <h2>Planning de la journée</h2>
      <table>
        <thead>
          <tr>
            <th>Horaire</th>
            <th>Activité</th>
            <th>Responsable</th>
            <th>Matériel requis</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>08h00 - 12h00</td>
            <td>Montage technique</td>
            <td>Équipe technique</td>
            <td>Son, éclairage, scène</td>
          </tr>
          <tr>
            <td>14h00 - 16h00</td>
            <td>Balance</td>
            <td>Artiste + Techniciens</td>
            <td>Instruments, micros</td>
          </tr>
          <tr>
            <td>20h30 - 22h30</td>
            <td>Concert</td>
            <td>Artiste</td>
            <td>Setup complet</td>
          </tr>
        </tbody>
      </table>
      
      <h2>Matériel fourni</h2>
      <table class="borderless" style="border: none;">
        <tr>
          <td style="border: none;"><strong>Sonorisation :</strong></td>
          <td style="border: none;">Console 32 pistes, enceintes 2000W</td>
        </tr>
        <tr>
          <td style="border: none;"><strong>Éclairage :</strong></td>
          <td style="border: none;">24 projecteurs LED, jeu d'orgue</td>
        </tr>
      </table>
    `
  },
  
  'test3-citations': {
    title: 'Contrat avec Citations et Styles',
    content: `
      <h1>Contrat de Résidence Artistique</h1>
      
      <h2>Contexte du projet</h2>
      <p>Le Festival de Musique Contemporaine organise sa 15ème édition.</p>
      
      <blockquote>
      "Notre objectif est de promouvoir les artistes émergents dans un cadre professionnel et bienveillant."
      <br>- Direction artistique du festival
      </blockquote>
      
      <h2>Conditions spéciales</h2>
      <p>L'artiste bénéficiera de <span style="background-color: yellow;">conditions préférentielles</span> durant sa résidence.</p>
      
      <p>Pour plus d'informations, consultez notre site : 
      <a href="https://festival-musique.com">https://festival-musique.com</a></p>
    `
  },
  
  'test4-polices': {
    title: 'Contrat Multi-Polices Google Docs',
    content: `
      <h1 style="font-family: 'Times New Roman';">CONTRAT DE CESSION</h1>
      
      <p style="font-family: 'Calibri'; color: #1a237e;">
      Ce document, rédigé avec différentes polices et couleurs, 
      doit être <span style="font-weight: bold; color: red;">normalisé</span> 
      en impression.
      </p>
      
      <div style="background-color: #e3f2fd; padding: 15px; margin: 10px 0;">
      <p style="font-family: 'Arial Black'; font-size: 14pt;">
      Information importante en encadré coloré
      </p>
      </div>
      
      <p style="font-family: 'Georgia'; font-style: italic;">
      Texte en Georgia italique qui doit devenir Arial normal.
      </p>
      
      <span style="background-color: yellow;">Texte surligné important</span>
      
      <p style="margin: 50px 0; padding: 25px;">
      Paragraphe avec espacements excessifs de Google Docs.
      </p>
    `
  },
  
  'test5-sauts': {
    title: 'Contrat avec Sauts de Page',
    content: `
      <h1>Contrat Complet - Multi-Dates</h1>
      
      <h2>Page 1 - Informations générales</h2>
      <p>Contenu de la première page avec informations de base sur le contrat de prestation artistique.</p>
      <p>L'artiste s'engage à respecter les conditions ci-après détaillées.</p>
      
      <div class="page-break"></div>
      
      <h2>Page 2 - Conditions techniques</h2>
      <p>Spécifications techniques détaillées pour la réalisation de la prestation.</p>
      
      <table>
        <tr><th>Date</th><th>Lieu</th><th>Cachets</th></tr>
        <tr><td>15/06/2025</td><td>Salle A</td><td>1500€</td></tr>
        <tr><td>16/06/2025</td><td>Salle B</td><td>1800€</td></tr>
      </table>
      
      <div style="page-break-before: always;"></div>
      
      <h2>Page 3 - Signatures</h2>
      <div class="signature-section">
        <div class="signature-block-left">
          <p><strong>Pour l'organisateur :</strong></p>
          <p>Jean Dupont</p>
          <div class="signature-line"></div>
        </div>
        
        <div class="signature-block-right">
          <p><strong>Pour l'artiste :</strong></p>
          <p>Marie Martin</p>
          <div class="signature-line"></div>
        </div>
      </div>
    `
  }
};

/**
 * Génère le HTML complet pour un test
 */
function generateTestHTML(model) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${model.title}</title>
  <link rel="stylesheet" href="/src/styles/components/contrat-print.css">
  <style>
    /* Styles additionnels pour le test */
    body { margin: 0; padding: 0; }
    .test-container {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: white;
    }
  </style>
</head>
<body class="contrat-print-mode">
  <div class="test-container">
    <div class="contrat-container">
      ${model.content}
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Fonction principale de test
 */
async function runPDFTests() {
  console.log('🚀 Démarrage des tests de rendu PDF...');
  
  // Créer le dossier de sortie
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
  
  let browser;
  try {
    // Lancer Puppeteer
    console.log('🌐 Lancement de Puppeteer...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const testResults = {};
    
    // Exécuter chaque test
    for (const [testId, model] of Object.entries(TEST_MODELS)) {
      console.log(`\n📄 Test: ${model.title}`);
      
      try {
        const page = await browser.newPage();
        await page.setViewport(CONFIG.viewport);
        
        // Générer le HTML et l'injecter
        const html = generateTestHTML(model);
        const htmlFile = path.join(CONFIG.outputDir, `${testId}.html`);
        fs.writeFileSync(htmlFile, html);
        
        // Charger la page
        await page.goto(`file://${path.resolve(htmlFile)}`, {
          waitUntil: 'networkidle0',
          timeout: CONFIG.timeout
        });
        
        // Générer le PDF
        const pdfFile = path.join(CONFIG.outputDir, `${testId}.pdf`);
        await page.pdf({
          path: pdfFile,
          format: 'A4',
          margin: {
            top: '25mm',
            right: '20mm',
            bottom: '25mm',
            left: '20mm'
          },
          printBackground: true
        });
        
        // Prendre une capture d'écran
        const screenshotFile = path.join(CONFIG.outputDir, `${testId}.png`);
        await page.screenshot({
          path: screenshotFile,
          fullPage: true
        });
        
        await page.close();
        
        testResults[testId] = {
          title: model.title,
          status: 'success',
          files: {
            html: htmlFile,
            pdf: pdfFile,
            screenshot: screenshotFile
          }
        };
        
        console.log(`  ✅ PDF généré: ${pdfFile}`);
        console.log(`  📸 Capture: ${screenshotFile}`);
        
      } catch (error) {
        console.error(`  ❌ Erreur pour ${testId}:`, error.message);
        testResults[testId] = {
          title: model.title,
          status: 'error',
          error: error.message
        };
      }
    }
    
    // Générer le rapport
    const reportFile = path.join(CONFIG.outputDir, 'test-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(testResults, null, 2));
    
    // Générer le rapport HTML
    const htmlReport = generateHTMLReport(testResults);
    const htmlReportFile = path.join(CONFIG.outputDir, 'test-report.html');
    fs.writeFileSync(htmlReportFile, htmlReport);
    
    console.log('\n🎉 Tests terminés !');
    console.log(`📊 Rapport JSON: ${reportFile}`);
    console.log(`🌐 Rapport HTML: ${htmlReportFile}`);
    
    // Statistiques
    const successCount = Object.values(testResults).filter(r => r.status === 'success').length;
    const totalCount = Object.keys(testResults).length;
    console.log(`📈 Résultats: ${successCount}/${totalCount} tests réussis`);
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Génère un rapport HTML des résultats
 */
function generateHTMLReport(testResults) {
  const resultRows = Object.entries(testResults).map(([testId, result]) => {
    if (result.status === 'success') {
      return `
        <tr class="success">
          <td>${testId}</td>
          <td>${result.title}</td>
          <td>✅ Succès</td>
          <td>
            <a href="${path.basename(result.files.pdf)}" target="_blank">PDF</a> |
            <a href="${path.basename(result.files.screenshot)}" target="_blank">Capture</a> |
            <a href="${path.basename(result.files.html)}" target="_blank">HTML</a>
          </td>
        </tr>
      `;
    } else {
      return `
        <tr class="error">
          <td>${testId}</td>
          <td>${result.title}</td>
          <td>❌ Erreur</td>
          <td>${result.error}</td>
        </tr>
      `;
    }
  }).join('');
  
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport de Tests PDF - TourCraft</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #f2f2f2; }
    .success { background-color: #f9fff9; }
    .error { background-color: #fff9f9; }
    .timestamp { color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>🖨️ Rapport de Tests PDF - TourCraft</h1>
  <p class="timestamp">Généré le: ${new Date().toLocaleString('fr-FR')}</p>
  
  <h2>Résultats des Tests</h2>
  <table>
    <thead>
      <tr>
        <th>ID Test</th>
        <th>Titre</th>
        <th>Statut</th>
        <th>Fichiers/Erreur</th>
      </tr>
    </thead>
    <tbody>
      ${resultRows}
    </tbody>
  </table>
  
  <h2>Instructions</h2>
  <ol>
    <li>Ouvrez chaque PDF généré pour vérifier le rendu</li>
    <li>Comparez avec les modèles attendus dans MODELES_TEST_CSS.md</li>
    <li>Vérifiez que les polices, couleurs, espacements sont corrects</li>
    <li>Notez les problèmes éventuels pour corrections</li>
  </ol>
</body>
</html>
  `;
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runPDFTests().catch(console.error);
}

module.exports = { runPDFTests, generateTestHTML }; 