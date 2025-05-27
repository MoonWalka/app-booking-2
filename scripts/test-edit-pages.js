#!/usr/bin/env node

/**
 * Script de test spécialisé pour les pages d'édition
 * 
 * Ce script teste spécifiquement les pages d'édition
 * en supposant que l'application est déjà lancée.
 */

const puppeteer = require('puppeteer');

console.log('✏️ Test spécialisé des pages d\'édition');
console.log('======================================');

// Configuration
const APP_URL = 'http://localhost:3000';
const TEST_DURATION = 8000; // 8 secondes par page

// Pages d'édition à tester - COUVERTURE COMPLÈTE
const EDIT_PAGES = [
  // === CONCERTS ===
  {
    name: 'Nouveau Concert',
    url: '/concerts/nouveau',
    actions: [
      'wait:2000',
      'type:input[name="titre"], input#titre:Nouveau Concert Test',
      'wait:1000'
    ]
  },
  {
    name: 'Édition Concert',
    url: '/concerts/con-1747960488398-mwb0vm/edit',
    actions: [
      'wait:2000',
      'type:input[name="titre"], input#titre:Concert Modifié Test',
      'wait:1000',
      'type:textarea[name="notes"], textarea#notes:Description modifiée pour les notes',
      'wait:1000'
    ]
  },

  // === PROGRAMMATEURS ===
  {
    name: 'Nouveau Programmateur',
    url: '/programmateurs/nouveau',
    actions: [
      'wait:2000',
      'type:input#nom:Nouveau Programmateur Test',
      'type:input#email:test@programmateur.com',
      'wait:1000'
    ]
  },
  {
    name: 'Édition Programmateur',
    url: '/programmateurs/prog-1747960488398-test/edit',
    actions: [
      'wait:2000',
      'type:input#nom:Programmateur Modifié Test',
      'wait:1000'
    ]
  },

  // === ARTISTES ===
  {
    name: 'Nouveau Artiste',
    url: '/artistes/nouveau',
    actions: [
      'wait:2000',
      'type:input[name="nom"], input#nom:Nouvel Artiste Test',
      'wait:1000'
    ]
  },
  {
    name: 'Édition Artiste',
    url: '/artistes/art-1747960488398-test/modifier',
    actions: [
      'wait:2000',
      'type:input[name="nom"], input#nom:Artiste Modifié Test',
      'wait:1000'
    ]
  },

  // === LIEUX ===
  {
    name: 'Nouveau Lieu',
    url: '/lieux/nouveau',
    actions: [
      'wait:2000',
      'type:input[name="nom"]:Nouveau Lieu Test',
      'type:input[name="ville"]:Paris Test',
      'wait:1000'
    ]
  },
  {
    name: 'Édition Lieu',
    url: '/lieux/lieu-1747960488398-test/edit',
    actions: [
      'wait:2000',
      'type:input[name="nom"]:Lieu Modifié Test',
      'wait:1000'
    ]
  },

  // === STRUCTURES ===
  {
    name: 'Nouvelle Structure',
    url: '/structures/nouveau',
    actions: [
      'wait:2000',
      'type:input[name="raisonSociale"], input#raisonSociale:Nouvelle Structure Test',
      'wait:1000'
    ]
  },
  {
    name: 'Édition Structure',
    url: '/structures/struct-1747960488398-test/edit',
    actions: [
      'wait:2000',
      'type:input[name="raisonSociale"], input#raisonSociale:Structure Modifiée Test',
      'wait:1000'
    ]
  }
];

// Compteurs
const pageStats = new Map();
let browser = null;
let page = null;

// Fonction pour analyser les logs
function analyzeConsoleMessage(msg, pageName) {
  const text = msg.text();
  
  if (!pageStats.has(pageName)) {
    pageStats.set(pageName, {
      renders: 0,
      hooks: 0,
      mounts: 0,
      errors: 0,
      details: []
    });
  }
  
  const stats = pageStats.get(pageName);
  
  // Re-renders
  if (text.includes('Re-rendered because of hook changes')) {
    const match = text.match(/(\w+)\s+Re-rendered/);
    if (match) {
      const component = match[1];
      stats.renders++;
      stats.details.push(`Re-render: ${component}`);
      console.log(`🔄 [${pageName}] ${component} re-rendered (${stats.renders})`);
    }
  }
  
  // Hooks
  if (text.includes('Hook called') || text.includes('INIT:')) {
    stats.hooks++;
    if (stats.hooks % 5 === 0) {
      console.log(`🎣 [${pageName}] ${stats.hooks} appels de hooks`);
    }
  }
  
  // Montages
  if (text.includes('Montage avec id') || text.includes('mounted')) {
    stats.mounts++;
    console.log(`🏗️ [${pageName}] Montage détecté (${stats.mounts})`);
  }
  
  // Erreurs
  if (msg.type() === 'error') {
    stats.errors++;
    console.log(`❌ [${pageName}] Erreur: ${text.substring(0, 60)}...`);
  }
}

// Fonction pour exécuter les actions
async function executeActions(page, actions) {
  for (const action of actions) {
    try {
      if (action.startsWith('wait:')) {
        const duration = parseInt(action.split(':')[1]);
        await new Promise(resolve => setTimeout(resolve, duration));
      } else if (action.startsWith('type:')) {
        const parts = action.split(':');
        const selector = parts[1];
        const text = parts[2];
        
        // ✅ AJOUT: Attendre que le sélecteur soit visible
        try {
          await page.waitForSelector(selector, { visible: true, timeout: 7000 }); // Timeout augmenté
        } catch (waitError) {
          console.log(`⚠️ Sélecteur non trouvé après attente: ${selector} - ${waitError.message}`);
          continue; // Passer à l'action suivante si le sélecteur n'est pas trouvé
        }

        const element = await page.$(selector);
        if (element) {
          await element.click({ clickCount: 3 });
          await element.type(text);
          console.log(`⌨️ Tapé "${text}" dans ${selector}`);
        } else {
          // Ce cas ne devrait plus se produire grâce à waitForSelector
          console.log(`⚠️ Élément non trouvé (après waitForSelector): ${selector}`);
        }
      } else if (action.startsWith('click:')) {
        const selector = action.split(':')[1];

        // ✅ AJOUT: Attendre que le sélecteur soit visible
        try {
          await page.waitForSelector(selector, { visible: true, timeout: 7000 }); // Timeout augmenté
        } catch (waitError) {
          console.log(`⚠️ Sélecteur non trouvé après attente: ${selector} - ${waitError.message}`);
          continue; // Passer à l'action suivante si le sélecteur n'est pas trouvé
        }

        const element = await page.$(selector);
        if (element) {
          await element.click();
          console.log(`🖱️ Cliqué sur ${selector}`);
        } else {
          // Ce cas ne devrait plus se produire grâce à waitForSelector
          console.log(`⚠️ Élément non trouvé (après waitForSelector): ${selector}`);
        }
      }
    } catch (error) {
      console.log(`⚠️ Action échouée: ${action} - ${error.message}`);
    }
  }
}

// Fonction pour tester une page d'édition
async function testEditPage(pageConfig) {
  const { name, url, actions } = pageConfig;
  
  console.log(`\n📝 Test de: ${name}`);
  console.log(`🔗 ${url}`);
  
  try {
    page.removeAllListeners('console');
    page.on('console', (msg) => analyzeConsoleMessage(msg, name));
    
    console.log('🚀 Navigation...');
    await page.goto(`${APP_URL}${url}`, { 
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });
    
    console.log('✅ Page chargée (DOM)');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    if (actions && actions.length > 0) {
      console.log(`🎬 Exécution de ${actions.length} actions...`);
      await executeActions(page, actions);
    }
    
    console.log(`⏱️ Observation pendant ${TEST_DURATION/1000}s...`);
    await new Promise(resolve => setTimeout(resolve, TEST_DURATION));
    
    const stats = pageStats.get(name) || { renders: 0, hooks: 0, mounts: 0, errors: 0 };
    
    let status = '🟢 EXCELLENT';
    if (stats.renders > 10 || stats.errors > 0) {
      status = '🔴 PROBLÉMATIQUE';
    } else if (stats.renders > 5) {
      status = '🟡 ATTENTION';
    }
    
    console.log(`📊 ${status}: ${stats.renders} re-renders, ${stats.hooks} hooks, ${stats.errors} erreurs`);
    
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
    pageStats.set(name, { renders: 0, hooks: 0, mounts: 0, errors: 1, error: error.message });
  }
}

// Fonction pour générer le rapport
function generateReport() {
  console.log('\n📊 RAPPORT DES PAGES D\'ÉDITION');
  console.log('===============================');
  
  let totalRenders = 0;
  let totalHooks = 0;
  let totalErrors = 0;
  
  pageStats.forEach((stats, pageName) => {
    totalRenders += stats.renders;
    totalHooks += stats.hooks;
    totalErrors += stats.errors;
    
    let status = '🟢';
    if (stats.renders > 10 || stats.errors > 0) {
      status = '🔴';
    } else if (stats.renders > 5) {
      status = '🟡';
    }
    
    console.log(`${status} ${pageName}:`);
    console.log(`  🔄 ${stats.renders} re-renders`);
    console.log(`  🎣 ${stats.hooks} appels de hooks`);
    console.log(`  ❌ ${stats.errors} erreurs`);
    
    if (stats.error) {
      console.log(`  💬 ${stats.error}`);
    }
  });
  
  console.log('\n🌍 TOTAL:');
  console.log(`🔄 ${totalRenders} re-renders`);
  console.log(`🎣 ${totalHooks} appels de hooks`);
  console.log(`❌ ${totalErrors} erreurs`);
  
  // Score
  const score = Math.max(0, 100 - totalRenders * 3 - totalErrors * 25);
  console.log(`\n🎯 Score: ${score}/100`);
  
  if (score >= 90) {
    console.log('🟢 Pages d\'édition parfaitement optimisées');
  } else if (score >= 70) {
    console.log('🟡 Pages d\'édition correctement optimisées');
  } else {
    console.log('🔴 Pages d\'édition nécessitent des optimisations');
  }
  
  // Recommandations spécifiques
  console.log('\n💡 Recommandations pour les pages d\'édition:');
  if (totalRenders > 20) {
    console.log('  🔧 Optimiser les hooks de formulaires');
    console.log('  🔧 Vérifier les dépendances des useEffect');
  }
  if (totalErrors > 0) {
    console.log('  🐛 Corriger les erreurs de validation');
  }
  if (score >= 90) {
    console.log('  🎉 Formulaires bien optimisés !');
  }
}

// Fonction principale
async function main() {
  try {
    console.log('🌐 Lancement du navigateur...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    
    // Tester chaque page d'édition
    for (const pageConfig of EDIT_PAGES) {
      await testEditPage(pageConfig);
    }
    
    // Générer le rapport
    generateReport();
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Lancer le test
main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
}); 