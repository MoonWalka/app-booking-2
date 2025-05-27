#!/usr/bin/env node

/**
 * Script de test complet des re-renders
 * 
 * Ce script teste toutes les pages importantes de l'application,
 * y compris les pages d'édition, pour détecter les re-renders
 * dans tous les scénarios d'usage.
 */

const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Test complet des re-renders (toutes les pages)');
console.log('==================================================');

// Configuration
const TEST_DURATION_PER_PAGE = 5000; // 5 secondes par page
const APP_URL = 'http://localhost:3000';

// Pages à tester
const PAGES_TO_TEST = [
  {
    name: 'Accueil',
    url: '/',
    actions: []
  },
  {
    name: 'Liste des concerts',
    url: '/concerts',
    actions: ['wait:2000']
  },
  {
    name: 'Détail concert',
    url: '/concerts/con-1747960488398-mwb0vm',
    actions: ['wait:3000']
  },
  {
    name: 'Édition concert',
    url: '/concerts/con-1747960488398-mwb0vm/edit',
    actions: [
      'wait:2000',
      'type:input[name="titre"]:Concert Test Modifié',
      'wait:1000'
    ]
  },
  {
    name: 'Liste des programmateurs',
    url: '/programmateurs',
    actions: ['wait:2000']
  },
  {
    name: 'Nouveau programmateur',
    url: '/programmateurs/nouveau',
    actions: [
      'wait:2000',
      'type:input[name="nom"]:Test Programmateur',
      'type:input[name="email"]:test@example.com',
      'wait:1000'
    ]
  },
  {
    name: 'Liste des artistes',
    url: '/artistes',
    actions: ['wait:2000']
  },
  {
    name: 'Nouveau artiste',
    url: '/artistes/nouveau',
    actions: [
      'wait:2000',
      'type:input[name="nom"]:Test Artiste',
      'wait:1000'
    ]
  },
  {
    name: 'Liste des lieux',
    url: '/lieux',
    actions: ['wait:2000']
  },
  {
    name: 'Nouveau lieu',
    url: '/lieux/nouveau',
    actions: [
      'wait:2000',
      'type:input[name="nom"]:Test Lieu',
      'type:input[name="ville"]:Paris',
      'wait:1000'
    ]
  }
];

// Compteurs globaux
const globalStats = {
  renderCounts: new Map(),
  hookCalls: new Map(),
  componentMounts: new Map(),
  consoleErrors: [],
  pageResults: new Map()
};

let appProcess = null;
let browser = null;
let page = null;

// Fonction pour analyser les logs de console
function analyzeConsoleMessage(msg, currentPageName) {
  const text = msg.text();
  const timestamp = Date.now();
  
  // Détecter les re-renders de why-did-you-render
  if (text.includes('Re-rendered because of hook changes')) {
    const match = text.match(/(\w+)\s+Re-rendered/);
    if (match) {
      const component = match[1];
      const key = `${currentPageName}:${component}`;
      globalStats.renderCounts.set(key, (globalStats.renderCounts.get(key) || 0) + 1);
      console.log(`🔄 [${currentPageName}] Re-render: ${component} (${globalStats.renderCounts.get(key)})`);
    }
  }
  
  // Détecter les appels de hooks
  if (text.includes('Hook called') || text.includes('INIT:')) {
    const hookMatch = text.match(/(use\w+)/);
    if (hookMatch) {
      const hook = hookMatch[1];
      const key = `${currentPageName}:${hook}`;
      globalStats.hookCalls.set(key, (globalStats.hookCalls.get(key) || 0) + 1);
    }
  }
  
  // Détecter les montages de composants
  if (text.includes('Montage avec id') || text.includes('mounted')) {
    const componentMatch = text.match(/(\w+View|\w+List|\w+Form)/);
    if (componentMatch) {
      const component = componentMatch[1];
      const key = `${currentPageName}:${component}`;
      globalStats.componentMounts.set(key, (globalStats.componentMounts.get(key) || 0) + 1);
      console.log(`🏗️ [${currentPageName}] Montage: ${component} (${globalStats.componentMounts.get(key)})`);
    }
  }
  
  // Détecter les erreurs
  if (msg.type() === 'error') {
    globalStats.consoleErrors.push({
      message: text,
      page: currentPageName,
      timestamp,
      type: msg.type()
    });
    console.log(`❌ [${currentPageName}] Erreur: ${text.substring(0, 80)}...`);
  }
}

// Fonction pour exécuter les actions sur une page
async function executePageActions(page, actions) {
  for (const action of actions) {
    try {
      if (action.startsWith('wait:')) {
        const duration = parseInt(action.split(':')[1]);
        await page.waitForTimeout(duration);
      } else if (action.startsWith('type:')) {
        const [, selector, text] = action.split(':');
        await page.waitForSelector(selector, { timeout: 3000 });
        await page.type(selector, text);
      } else if (action.startsWith('click:')) {
        const selector = action.split(':')[1];
        await page.waitForSelector(selector, { timeout: 3000 });
        await page.click(selector);
      }
    } catch (error) {
      console.log(`⚠️ Action échouée: ${action} - ${error.message}`);
    }
  }
}

// Fonction pour tester une page spécifique
async function testPage(pageConfig) {
  const { name, url, actions } = pageConfig;
  console.log(`\n📄 Test de la page: ${name}`);
  console.log(`🔗 URL: ${url}`);
  
  const pageStats = {
    renders: 0,
    hooks: 0,
    mounts: 0,
    errors: 0
  };
  
  try {
    // Naviguer vers la page
    await page.goto(`${APP_URL}${url}`, { 
      waitUntil: 'networkidle0', 
      timeout: 15000 
    });
    
    console.log(`✅ Page ${name} chargée`);
    
    // Attendre un peu pour la stabilisation
    await page.waitForTimeout(1000);
    
    // Exécuter les actions spécifiques à la page
    if (actions && actions.length > 0) {
      console.log(`🎬 Exécution de ${actions.length} action(s)...`);
      await executePageActions(page, actions);
    }
    
    // Observer pendant la durée définie
    console.log(`⏱️ Observation pendant ${TEST_DURATION_PER_PAGE/1000}s...`);
    await page.waitForTimeout(TEST_DURATION_PER_PAGE);
    
    // Calculer les stats pour cette page
    globalStats.renderCounts.forEach((count, key) => {
      if (key.startsWith(`${name}:`)) {
        pageStats.renders += count;
      }
    });
    
    globalStats.hookCalls.forEach((count, key) => {
      if (key.startsWith(`${name}:`)) {
        pageStats.hooks += count;
      }
    });
    
    globalStats.componentMounts.forEach((count, key) => {
      if (key.startsWith(`${name}:`)) {
        pageStats.mounts += count;
      }
    });
    
    pageStats.errors = globalStats.consoleErrors.filter(e => e.page === name).length;
    
    // Évaluer la page
    let status = '🟢 EXCELLENT';
    if (pageStats.renders > 10 || pageStats.errors > 0) {
      status = '🔴 PROBLÉMATIQUE';
    } else if (pageStats.renders > 5 || pageStats.hooks > 50) {
      status = '🟡 ATTENTION';
    }
    
    console.log(`📊 Résultat: ${status} (${pageStats.renders} re-renders, ${pageStats.hooks} hooks, ${pageStats.errors} erreurs)`);
    
    globalStats.pageResults.set(name, { ...pageStats, status });
    
  } catch (error) {
    console.log(`❌ Erreur lors du test de ${name}: ${error.message}`);
    globalStats.pageResults.set(name, { 
      renders: 0, 
      hooks: 0, 
      mounts: 0, 
      errors: 1, 
      status: '🔴 ERREUR',
      error: error.message 
    });
  }
}

// Fonction pour démarrer l'application
async function startApp() {
  console.log('🚀 Démarrage de l\'application...');
  
  return new Promise((resolve, reject) => {
    appProcess = spawn('npm', ['start'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, BROWSER: 'none' }
    });
    
    let appReady = false;
    
    appProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('webpack compiled') || output.includes('Local:')) {
        if (!appReady) {
          appReady = true;
          console.log('✅ Application prête');
          setTimeout(resolve, 3000); // Attendre 3s pour être sûr
        }
      }
    });
    
    appProcess.stderr.on('data', (data) => {
      const output = data.toString();
      if (output.includes('EADDRINUSE')) {
        console.log('⚠️ Port 3000 déjà utilisé, l\'application semble déjà lancée');
        resolve();
      }
    });
    
    // Timeout de sécurité
    setTimeout(() => {
      if (!appReady) {
        console.log('⚠️ Timeout - on continue avec l\'application existante');
        resolve();
      }
    }, 20000);
  });
}

// Fonction pour générer le rapport final
function generateFinalReport() {
  console.log('\n📊 RAPPORT COMPLET DE TOUS LES TESTS');
  console.log('====================================');
  
  // Résumé par page
  console.log('\n📄 Résultats par page:');
  globalStats.pageResults.forEach((stats, pageName) => {
    console.log(`  ${stats.status} ${pageName}:`);
    console.log(`    🔄 ${stats.renders} re-renders`);
    console.log(`    🎣 ${stats.hooks} appels de hooks`);
    console.log(`    🏗️ ${stats.mounts} montages`);
    console.log(`    ❌ ${stats.errors} erreurs`);
    if (stats.error) {
      console.log(`    💬 ${stats.error}`);
    }
  });
  
  // Statistiques globales
  const totalRenders = Array.from(globalStats.renderCounts.values()).reduce((a, b) => a + b, 0);
  const totalHooks = Array.from(globalStats.hookCalls.values()).reduce((a, b) => a + b, 0);
  const totalMounts = Array.from(globalStats.componentMounts.values()).reduce((a, b) => a + b, 0);
  const totalErrors = globalStats.consoleErrors.length;
  
  console.log('\n🌍 Statistiques globales:');
  console.log(`  🔄 Total re-renders: ${totalRenders}`);
  console.log(`  🎣 Total appels hooks: ${totalHooks}`);
  console.log(`  🏗️ Total montages: ${totalMounts}`);
  console.log(`  ❌ Total erreurs: ${totalErrors}`);
  
  // Pages les plus problématiques
  console.log('\n🔥 Pages les plus problématiques:');
  const sortedPages = Array.from(globalStats.pageResults.entries())
    .sort((a, b) => (b[1].renders + b[1].errors * 10) - (a[1].renders + a[1].errors * 10))
    .slice(0, 3);
  
  sortedPages.forEach(([pageName, stats], index) => {
    const score = stats.renders + stats.errors * 10;
    if (score > 0) {
      console.log(`  ${index + 1}. ${pageName}: ${score} points (${stats.renders} re-renders, ${stats.errors} erreurs)`);
    }
  });
  
  if (sortedPages.every(([, stats]) => stats.renders + stats.errors * 10 === 0)) {
    console.log('  ✅ Aucune page problématique détectée');
  }
  
  // Score global
  const globalScore = Math.max(0, 100 - totalRenders * 2 - totalErrors * 20);
  console.log('\n🎯 SCORE GLOBAL:');
  console.log(`📈 ${globalScore}/100`);
  
  if (globalScore >= 95) {
    console.log('🟢 EXCELLENT - Application parfaitement optimisée sur toutes les pages');
  } else if (globalScore >= 80) {
    console.log('🟡 BON - Quelques optimisations mineures possibles');
  } else if (globalScore >= 60) {
    console.log('🟠 MOYEN - Optimisations recommandées sur certaines pages');
  } else {
    console.log('🔴 PROBLÉMATIQUE - Optimisations urgentes nécessaires');
  }
  
  // Recommandations
  console.log('\n💡 Recommandations:');
  if (totalRenders > 20) {
    console.log('  🔧 Optimiser les hooks avec trop de re-renders');
  }
  if (totalErrors > 0) {
    console.log('  🐛 Corriger les erreurs JavaScript détectées');
  }
  if (globalScore >= 95) {
    console.log('  🎉 Continuez le bon travail ! Application très bien optimisée');
  }
}

// Fonction de nettoyage
async function cleanup() {
  console.log('\n🧹 Nettoyage...');
  
  if (page) {
    await page.close();
  }
  
  if (browser) {
    await browser.close();
  }
  
  if (appProcess && !appProcess.killed) {
    appProcess.kill('SIGTERM');
  }
}

// Fonction principale
async function main() {
  try {
    // Démarrer l'application
    await startApp();
    
    // Lancer le navigateur
    console.log('🌐 Lancement du navigateur headless...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    
    // Tester chaque page
    for (const pageConfig of PAGES_TO_TEST) {
      // Configurer l'écoute des logs pour cette page
      page.removeAllListeners('console');
      page.on('console', (msg) => analyzeConsoleMessage(msg, pageConfig.name));
      
      await testPage(pageConfig);
    }
    
    // Générer le rapport final
    generateFinalReport();
    
  } catch (error) {
    console.error('❌ Erreur lors du test complet:', error);
  } finally {
    await cleanup();
  }
}

// Gestion des signaux
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du test...');
  await cleanup();
  process.exit(0);
});

// Lancer le test
main().catch(async (error) => {
  console.error('❌ Erreur fatale:', error);
  await cleanup();
  process.exit(1);
}); 