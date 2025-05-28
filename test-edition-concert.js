#!/usr/bin/env node

/**
 * 🛡️ TEST SPÉCIALISÉ : PAGE D'ÉDITION DE CONCERT
 * MÉTHODOLOGIE SÉCURISÉE appliquée
 * 
 * Ce script teste spécifiquement la page d'édition de concert
 * pour vérifier l'impact des corrections appliquées selon la méthodologie.
 */

const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🛡️ TEST MÉTHODOLOGIE SÉCURISÉE : ÉDITION CONCERT');
console.log('===============================================');
console.log('📋 Objectif : Vérifier l\'impact des corrections sur la page d\'édition');
console.log('📊 Référence : 18 re-renders détectés précédemment');
console.log('');

// Configuration selon la méthodologie
const TEST_CONFIG = {
  APP_URL: 'http://localhost:3000',
  CONCERT_ID: 'con-1747960488398-mwb0vm', // ID de test documenté
  TEST_DURATION: 10000, // 10 secondes d'observation
  INTERACTION_DELAY: 1000, // Délai entre interactions
  EXPECTED_MAX_RENDERS: 5 // Objectif après optimisation
};

// Scénarios de test selon la méthodologie
const TEST_SCENARIOS = [
  {
    name: 'Chargement initial',
    description: 'Chargement de la page d\'édition',
    actions: [
      'wait:2000' // Attendre stabilisation
    ]
  },
  {
    name: 'Modification titre',
    description: 'Modification du champ titre',
    actions: [
      'clear:input[name="titre"]',
      'type:input[name="titre"]:Concert Test Modifié',
      'wait:1000'
    ]
  },
  {
    name: 'Modification date',
    description: 'Modification de la date',
    actions: [
      'click:input[name="date"]',
      'wait:500',
      'type:input[name="date"]:2024-12-25',
      'wait:1000'
    ]
  },
  {
    name: 'Recherche lieu',
    description: 'Test de la recherche de lieu',
    actions: [
      'click:input[placeholder*="lieu"]',
      'type:input[placeholder*="lieu"]:Salle',
      'wait:2000'
    ]
  },
  {
    name: 'Recherche programmateur',
    description: 'Test de la recherche de programmateur',
    actions: [
      'click:input[placeholder*="programmateur"]',
      'type:input[placeholder*="programmateur"]:Test',
      'wait:2000'
    ]
  }
];

// Statistiques de test
const testStats = {
  renderCounts: new Map(),
  hookCalls: new Map(),
  componentMounts: new Map(),
  consoleErrors: [],
  scenarioResults: new Map(),
  startTime: Date.now()
};

let appProcess = null;
let browser = null;
let page = null;

// Fonction d'analyse des logs selon la méthodologie
function analyzeConsoleMessage(msg, currentScenario) {
  const text = msg.text();
  const timestamp = Date.now();
  
  // Détecter les re-renders spécifiques à ConcertView
  if (text.includes('ConcertView') && text.includes('re-render')) {
    const key = `${currentScenario}:ConcertView`;
    testStats.renderCounts.set(key, (testStats.renderCounts.get(key) || 0) + 1);
    console.log(`🔄 [${currentScenario}] ConcertView re-render #${testStats.renderCounts.get(key)}`);
  }
  
  // Détecter les appels de hooks spécifiques
  if (text.includes('[DEBUG][useConcertDetails]')) {
    const key = `${currentScenario}:useConcertDetails`;
    testStats.hookCalls.set(key, (testStats.hookCalls.get(key) || 0) + 1);
    console.log(`🎣 [${currentScenario}] useConcertDetails appelé #${testStats.hookCalls.get(key)}`);
  }
  
  if (text.includes('[DEBUG][useGenericEntityDetails]')) {
    const key = `${currentScenario}:useGenericEntityDetails`;
    testStats.hookCalls.set(key, (testStats.hookCalls.get(key) || 0) + 1);
    console.log(`🎣 [${currentScenario}] useGenericEntityDetails appelé #${testStats.hookCalls.get(key)}`);
  }
  
  // Détecter les montages de ConcertView
  if (text.includes('Montage avec id') && text.includes(TEST_CONFIG.CONCERT_ID)) {
    const key = `${currentScenario}:ConcertView_Mount`;
    testStats.componentMounts.set(key, (testStats.componentMounts.get(key) || 0) + 1);
    console.log(`🏗️ [${currentScenario}] ConcertView monté #${testStats.componentMounts.get(key)}`);
  }
  
  // Détecter les erreurs
  if (msg.type() === 'error') {
    testStats.consoleErrors.push({
      message: text,
      scenario: currentScenario,
      timestamp,
      type: msg.type()
    });
    console.log(`❌ [${currentScenario}] Erreur: ${text.substring(0, 80)}...`);
  }
  
  // Détecter les warnings PropTypes
  if (text.includes('Warning:') && text.includes('PropTypes')) {
    console.log(`⚠️ [${currentScenario}] PropTypes warning détecté`);
  }
}

// Fonction pour exécuter les actions d'un scénario
async function executeScenarioActions(page, actions) {
  for (const action of actions) {
    try {
      if (action.startsWith('wait:')) {
        const duration = parseInt(action.split(':')[1]);
        await page.waitForTimeout(duration);
      } else if (action.startsWith('type:')) {
        const [, selector, text] = action.split(':');
        await page.waitForSelector(selector, { timeout: 5000 });
        await page.type(selector, text);
      } else if (action.startsWith('click:')) {
        const selector = action.split(':')[1];
        await page.waitForSelector(selector, { timeout: 5000 });
        await page.click(selector);
      } else if (action.startsWith('clear:')) {
        const selector = action.split(':')[1];
        await page.waitForSelector(selector, { timeout: 5000 });
        await page.evaluate((sel) => {
          const element = document.querySelector(sel);
          if (element) {
            element.value = '';
            element.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }, selector);
      }
    } catch (error) {
      console.log(`⚠️ Action échouée: ${action} - ${error.message}`);
    }
  }
}

// Fonction pour tester un scénario
async function testScenario(scenario) {
  const { name, description, actions } = scenario;
  console.log(`\n📋 Scénario: ${name}`);
  console.log(`📝 ${description}`);
  
  const scenarioStats = {
    renders: 0,
    hooks: 0,
    mounts: 0,
    errors: 0,
    startTime: Date.now()
  };
  
  try {
    // Configurer l'écoute pour ce scénario
    page.removeAllListeners('console');
    page.on('console', (msg) => analyzeConsoleMessage(msg, name));
    
    // Exécuter les actions
    console.log(`🎬 Exécution de ${actions.length} action(s)...`);
    await executeScenarioActions(page, actions);
    
    // Observer pendant un délai
    console.log(`⏱️ Observation pendant ${TEST_CONFIG.INTERACTION_DELAY}ms...`);
    await page.waitForTimeout(TEST_CONFIG.INTERACTION_DELAY);
    
    // Calculer les stats pour ce scénario
    testStats.renderCounts.forEach((count, key) => {
      if (key.startsWith(`${name}:`)) {
        scenarioStats.renders += count;
      }
    });
    
    testStats.hookCalls.forEach((count, key) => {
      if (key.startsWith(`${name}:`)) {
        scenarioStats.hooks += count;
      }
    });
    
    testStats.componentMounts.forEach((count, key) => {
      if (key.startsWith(`${name}:`)) {
        scenarioStats.mounts += count;
      }
    });
    
    scenarioStats.errors = testStats.consoleErrors.filter(e => e.scenario === name).length;
    scenarioStats.duration = Date.now() - scenarioStats.startTime;
    
    // Évaluer le scénario
    let status = '🟢 EXCELLENT';
    if (scenarioStats.renders > TEST_CONFIG.EXPECTED_MAX_RENDERS || scenarioStats.errors > 0) {
      status = '🔴 PROBLÉMATIQUE';
    } else if (scenarioStats.renders > 2) {
      status = '🟡 ATTENTION';
    }
    
    console.log(`📊 Résultat: ${status}`);
    console.log(`   🔄 ${scenarioStats.renders} re-renders`);
    console.log(`   🎣 ${scenarioStats.hooks} appels hooks`);
    console.log(`   ❌ ${scenarioStats.errors} erreurs`);
    console.log(`   ⏱️ ${scenarioStats.duration}ms`);
    
    testStats.scenarioResults.set(name, { ...scenarioStats, status });
    
  } catch (error) {
    console.log(`❌ Erreur lors du scénario ${name}: ${error.message}`);
    testStats.scenarioResults.set(name, { 
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
          setTimeout(resolve, 3000);
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
    
    setTimeout(() => {
      if (!appReady) {
        console.log('⚠️ Timeout - on continue avec l\'application existante');
        resolve();
      }
    }, 20000);
  });
}

// Fonction pour générer le rapport selon la méthodologie
function generateMethodologyReport() {
  console.log('\n🛡️ RAPPORT MÉTHODOLOGIE SÉCURISÉE');
  console.log('==================================');
  
  // Résumé par scénario
  console.log('\n📋 Résultats par scénario:');
  testStats.scenarioResults.forEach((stats, scenarioName) => {
    console.log(`  ${stats.status} ${scenarioName}:`);
    console.log(`    🔄 ${stats.renders} re-renders`);
    console.log(`    🎣 ${stats.hooks} appels hooks`);
    console.log(`    ❌ ${stats.errors} erreurs`);
    if (stats.error) {
      console.log(`    💬 ${stats.error}`);
    }
  });
  
  // Statistiques globales
  const totalRenders = Array.from(testStats.renderCounts.values()).reduce((a, b) => a + b, 0);
  const totalHooks = Array.from(testStats.hookCalls.values()).reduce((a, b) => a + b, 0);
  const totalErrors = testStats.consoleErrors.length;
  
  console.log('\n📊 Statistiques globales:');
  console.log(`  🔄 Total re-renders: ${totalRenders}`);
  console.log(`  🎣 Total appels hooks: ${totalHooks}`);
  console.log(`  ❌ Total erreurs: ${totalErrors}`);
  console.log(`  ⏱️ Durée totale: ${Date.now() - testStats.startTime}ms`);
  
  // Comparaison avec l'objectif
  console.log('\n🎯 ÉVALUATION MÉTHODOLOGIQUE:');
  console.log(`📈 Re-renders détectés: ${totalRenders}`);
  console.log(`🎯 Objectif fixé: ≤ ${TEST_CONFIG.EXPECTED_MAX_RENDERS} par scénario`);
  console.log(`📊 Référence précédente: 18 re-renders`);
  
  // Score d'amélioration
  const improvementScore = Math.max(0, ((18 - totalRenders) / 18) * 100);
  console.log(`📈 Amélioration: ${improvementScore.toFixed(1)}%`);
  
  // Verdict final
  if (totalRenders <= TEST_CONFIG.EXPECTED_MAX_RENDERS) {
    console.log('🟢 SUCCÈS MÉTHODOLOGIQUE - Objectif atteint !');
  } else if (totalRenders < 18) {
    console.log('🟡 PROGRÈS MÉTHODOLOGIQUE - Amélioration significative');
  } else {
    console.log('🔴 ÉCHEC MÉTHODOLOGIQUE - Aucune amélioration détectée');
  }
  
  // Recommandations
  console.log('\n💡 Recommandations méthodologiques:');
  if (totalRenders <= TEST_CONFIG.EXPECTED_MAX_RENDERS) {
    console.log('  🎉 Les corrections appliquées sont efficaces !');
    console.log('  📋 Documenter cette réussite dans le rapport de session');
  } else {
    console.log('  🔧 Appliquer les corrections supplémentaires documentées');
    console.log('  🔍 Investiguer les composants enfants (ConcertHeader, etc.)');
    console.log('  📊 Considérer la version ultra-simplifiée pour le mode visualisation');
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
    
    // Naviguer vers la page d'édition
    const editUrl = `${TEST_CONFIG.APP_URL}/concerts/${TEST_CONFIG.CONCERT_ID}/edit`;
    console.log(`🔗 Navigation vers: ${editUrl}`);
    
    await page.goto(editUrl, { 
      waitUntil: 'networkidle0', 
      timeout: 15000 
    });
    
    console.log('✅ Page d\'édition chargée');
    
    // Tester chaque scénario
    for (const scenario of TEST_SCENARIOS) {
      await testScenario(scenario);
    }
    
    // Générer le rapport final
    generateMethodologyReport();
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
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