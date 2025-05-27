#!/usr/bin/env node

/**
 * Script de test spécialisé pour les pages de paramètres
 * Vérifie si les boucles infinies sont résolues
 */

const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

console.log('🔧 Test spécialisé des pages de paramètres');
console.log('==========================================');

// Configuration
const TEST_DURATION_PER_PAGE = 8000; // 8 secondes par page
const APP_URL = 'http://localhost:3000';

// Pages de paramètres à tester
const PARAMETRES_PAGES = [
  {
    name: 'Paramètres - Entreprise',
    url: '/parametres',
    actions: ['wait:2000']
  },
  {
    name: 'Paramètres - Généraux',
    url: '/parametres/generaux',
    actions: ['wait:2000']
  },
  {
    name: 'Paramètres - Compte',
    url: '/parametres/compte',
    actions: ['wait:2000']
  },
  {
    name: 'Paramètres - Notifications',
    url: '/parametres/notifications',
    actions: ['wait:2000']
  },
  {
    name: 'Paramètres - Apparence',
    url: '/parametres/apparence',
    actions: ['wait:2000']
  },
  {
    name: 'Paramètres - Export',
    url: '/parametres/export',
    actions: ['wait:2000']
  },
  {
    name: 'Paramètres - Synchronisation',
    url: '/parametres/sync',
    actions: ['wait:2000']
  }
];

let appProcess = null;
let results = [];

async function startApp() {
  console.log('🚀 Démarrage de l\'application...');
  
  return new Promise((resolve) => {
    appProcess = spawn('npm', ['start'], {
      stdio: 'pipe',
      env: { ...process.env, BROWSER: 'none' }
    });

    let appReady = false;
    const timeout = setTimeout(() => {
      if (!appReady) {
        console.log('⚠️ Timeout - on continue avec l\'application existante');
        resolve();
      }
    }, 10000);

    appProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('webpack compiled') || output.includes('Local:')) {
        if (!appReady) {
          appReady = true;
          clearTimeout(timeout);
          console.log('✅ Application prête');
          setTimeout(resolve, 2000);
        }
      }
    });
  });
}

async function executePageActions(page, actions) {
  for (const action of actions) {
    try {
      if (action.startsWith('wait:')) {
        const duration = parseInt(action.split(':')[1]);
        await new Promise(resolve => setTimeout(resolve, duration));
      }
    } catch (error) {
      console.log(`⚠️ Erreur lors de l'action ${action}:`, error.message);
    }
  }
}

async function testPage(browser, pageConfig) {
  const { name, url, actions = [] } = pageConfig;
  
  console.log(`\n📄 Test de la page: ${name}`);
  console.log(`🔗 URL: ${url}`);
  
  const page = await browser.newPage();
  
  // Capturer les erreurs et logs
  const logs = {
    rerenders: 0,
    hooks: 0,
    errors: 0,
    warnings: 0,
    details: []
  };
  
  page.on('console', (msg) => {
    const text = msg.text();
    const type = msg.type();
    
    if (text.includes('Re-render') || text.includes('re-render')) {
      logs.rerenders++;
      logs.details.push(`🔄 [${name}] Re-render: ${text}`);
    } else if (text.includes('Hook called') || text.includes('hook')) {
      logs.hooks++;
      logs.details.push(`🎣 [${name}] Hook: ${text}`);
    } else if (type === 'error') {
      logs.errors++;
      logs.details.push(`❌ [${name}] error: ${text}`);
      
      // Arrêter le test si on détecte "Maximum update depth exceeded"
      if (text.includes('Maximum update depth exceeded')) {
        console.log('🚨 BOUCLE INFINIE DÉTECTÉE - Arrêt du test');
        return { ...logs, status: 'INFINITE_LOOP' };
      }
    } else if (type === 'warning') {
      logs.warnings++;
      logs.details.push(`⚠️ [${name}] warning: ${text}`);
    }
  });
  
  try {
    console.log('🚀 Navigation...');
    await page.goto(`${APP_URL}${url}`, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    console.log('✅ Page chargée');
    
    // Attendre la stabilisation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Exécuter les actions spécifiques à la page
    if (actions && actions.length > 0) {
      console.log(`🎬 Exécution de ${actions.length} action(s)...`);
      await executePageActions(page, actions);
    }
    
    // Observer pendant la durée définie
    console.log(`⏱️ Observation pendant ${TEST_DURATION_PER_PAGE/1000}s...`);
    await new Promise(resolve => setTimeout(resolve, TEST_DURATION_PER_PAGE));
    
    // Afficher les logs en temps réel
    logs.details.forEach(detail => console.log(detail));
    
  } catch (error) {
    console.log(`❌ Erreur lors du test: ${error.message}`);
    logs.errors++;
  } finally {
    await page.close();
  }
  
  // Évaluer le résultat
  let status = '🟢 EXCELLENT';
  if (logs.errors > 0 || logs.rerenders > 10) {
    status = '🔴 PROBLÉMATIQUE';
  } else if (logs.rerenders > 0 || logs.warnings > 0) {
    status = '🟡 ACCEPTABLE';
  }
  
  console.log(`📊 Résultat: ${status} (${logs.rerenders} re-renders, ${logs.hooks} hooks, ${logs.errors} erreurs, ${logs.warnings} warnings)`);
  
  return { ...logs, status, name };
}

async function runTests() {
  await startApp();
  
  console.log('🌐 Lancement du navigateur headless...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  console.log(`\n🎯 Test de ${PARAMETRES_PAGES.length} pages de paramètres`);
  console.log('⏱️ Durée estimée: 1 minute\n');
  
  for (let i = 0; i < PARAMETRES_PAGES.length; i++) {
    const pageConfig = PARAMETRES_PAGES[i];
    console.log(`[${i+1}/${PARAMETRES_PAGES.length}] ==================`);
    
    const result = await testPage(browser, pageConfig);
    results.push(result);
    
    // Arrêter si on détecte une boucle infinie
    if (result.status === 'INFINITE_LOOP') {
      console.log('\n🚨 ARRÊT DU TEST - Boucle infinie détectée');
      break;
    }
  }
  
  await browser.close();
  
  // Rapport final
  console.log('\n📊 RAPPORT SPÉCIALISÉ PARAMÈTRES');
  console.log('=================================');
  
  const totalRerenders = results.reduce((sum, r) => sum + r.rerenders, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings, 0);
  
  console.log(`📄 Pages testées: ${results.length}/${PARAMETRES_PAGES.length}`);
  console.log(`🔄 Total re-renders: ${totalRerenders}`);
  console.log(`❌ Total erreurs: ${totalErrors}`);
  console.log(`⚠️ Total warnings: ${totalWarnings}`);
  
  // Pages problématiques
  const problematicPages = results.filter(r => r.status === '🔴 PROBLÉMATIQUE' || r.status === 'INFINITE_LOOP');
  if (problematicPages.length > 0) {
    console.log('\n🔴 Pages problématiques:');
    problematicPages.forEach(page => {
      console.log(`  - ${page.name}: ${page.rerenders} re-renders, ${page.errors} erreurs`);
    });
  }
  
  // Score global
  let globalScore = 100;
  if (totalErrors > 0) globalScore -= Math.min(50, totalErrors * 5);
  if (totalRerenders > 0) globalScore -= Math.min(30, totalRerenders * 2);
  if (totalWarnings > 0) globalScore -= Math.min(20, totalWarnings);
  
  console.log(`\n🎯 SCORE PARAMÈTRES: ${Math.max(0, globalScore)}/100`);
  
  if (globalScore >= 90) {
    console.log('🟢 EXCELLENT - Pages de paramètres parfaitement optimisées');
  } else if (globalScore >= 70) {
    console.log('🟡 ACCEPTABLE - Quelques optimisations mineures nécessaires');
  } else {
    console.log('🔴 PROBLÉMATIQUE - Corrections urgentes nécessaires');
  }
  
  console.log('\n🧹 Nettoyage...');
  
  // Arrêter l'application
  if (appProcess) {
    appProcess.kill();
  }
  
  process.exit(0);
}

// Gestion des signaux pour nettoyer proprement
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt demandé...');
  if (appProcess) {
    appProcess.kill();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (appProcess) {
    appProcess.kill();
  }
  process.exit(0);
});

runTests().catch(console.error); 