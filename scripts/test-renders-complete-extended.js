#!/usr/bin/env node

/**
 * Script de test COMPLET et ÉTENDU des re-renders
 * 
 * Ce script teste TOUTES les pages de l'application :
 * - Toutes les pages d'édition et de création
 * - Toutes les pages de détails
 * - Toutes les pages de listes
 * - Pages spécialisées (paramètres, contrats, etc.)
 */

const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

console.log('🧪 Test COMPLET et ÉTENDU des re-renders (TOUTES les pages)');
console.log('============================================================');

// Configuration
const TEST_DURATION_PER_PAGE = 6000; // 6 secondes par page
const APP_URL = 'http://localhost:3000';

// TOUTES les pages à tester - COUVERTURE COMPLÈTE
const ALL_PAGES_TO_TEST = [
  // === PAGES PRINCIPALES ===
  {
    name: 'Accueil',
    url: '/',
    actions: ['wait:1000']
  },

  // === CONCERTS ===
  {
    name: 'Liste des concerts',
    url: '/concerts',
    actions: ['wait:2000']
  },
  {
    name: 'Nouveau concert',
    url: '/concerts/nouveau',
    actions: [
      'wait:2000',
      'type:input[name="titre"]:Concert Test Nouveau',
      'wait:1000'
    ]
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

  // === PROGRAMMATEURS ===
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
      'type:input[name="nom"]:Test Programmateur Nouveau',
      'type:input[name="email"]:test@programmateur.com',
      'wait:1000'
    ]
  },
  {
    name: 'Détail programmateur',
    url: '/programmateurs/prog-1747960488398-test',
    actions: ['wait:2000']
  },
  {
    name: 'Édition programmateur',
    url: '/programmateurs/prog-1747960488398-test/edit',
    actions: [
      'wait:2000',
      'type:input[name="nom"]:Programmateur Modifié',
      'wait:1000'
    ]
  },

  // === ARTISTES ===
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
      'type:input[name="nom"]:Artiste Test Nouveau',
      'wait:1000'
    ]
  },
  {
    name: 'Détail artiste',
    url: '/artistes/art-1747960488398-test',
    actions: ['wait:2000']
  },
  {
    name: 'Édition artiste',
    url: '/artistes/art-1747960488398-test/modifier',
    actions: [
      'wait:2000',
      'type:input[name="nom"]:Artiste Modifié',
      'wait:1000'
    ]
  },

  // === LIEUX ===
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
      'type:input[name="nom"]:Lieu Test Nouveau',
      'type:input[name="ville"]:Paris Test',
      'wait:1000'
    ]
  },
  {
    name: 'Détail lieu',
    url: '/lieux/lieu-1747960488398-test',
    actions: ['wait:2000']
  },
  {
    name: 'Édition lieu',
    url: '/lieux/lieu-1747960488398-test/edit',
    actions: [
      'wait:2000',
      'type:input[name="nom"]:Lieu Modifié',
      'wait:1000'
    ]
  },

  // === STRUCTURES ===
  {
    name: 'Liste des structures',
    url: '/structures',
    actions: ['wait:2000']
  },
  {
    name: 'Nouvelle structure',
    url: '/structures/nouveau',
    actions: [
      'wait:2000',
      'type:input[name="raisonSociale"]:Structure Test Nouvelle',
      'wait:1000'
    ]
  },
  {
    name: 'Détail structure',
    url: '/structures/struct-1747960488398-test',
    actions: ['wait:2000']
  },
  {
    name: 'Édition structure',
    url: '/structures/struct-1747960488398-test/edit',
    actions: [
      'wait:2000',
      'type:input[name="raisonSociale"]:Structure Modifiée',
      'wait:1000'
    ]
  },

  // === PARAMÈTRES ===
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
  },

  // === MODÈLES DE CONTRATS ===
  {
    name: 'Modèles de contrats',
    url: '/parametres/contrats',
    actions: [
      'wait:2000',
      'click:button:contains("Créer un modèle")',
      'wait:1000'
    ]
  },
  {
    name: 'Édition modèle de contrat',
    url: '/parametres/contrats/template-test',
    actions: [
      'wait:3000',
      'type:input[name="name"]:Modèle Test Modifié',
      'wait:1000'
    ]
  },

  // === GÉNÉRATION DE CONTRATS ===
  {
    name: 'Génération de contrat',
    url: '/contrats/generation/con-1747960488398-mwb0vm',
    actions: ['wait:3000']
  }
];

// Compteurs globaux étendus
const globalStats = {
  renderCounts: new Map(),
  hookCalls: new Map(),
  componentMounts: new Map(),
  consoleErrors: [],
  pageResults: new Map(),
  categoryStats: new Map()
};

let appProcess = null;
let browser = null;
let page = null;

// Fonction pour analyser les logs de console (améliorée)
function analyzeConsoleMessage(msg, currentPageName) {
  const text = msg.text();
  const timestamp = Date.now();
  
  // Détecter les re-renders de why-did-you-render
  if (text.includes('Re-rendered because of hook changes') || text.includes('Re-rendered because')) {
    const match = text.match(/(\w+)\s+Re-rendered/);
    if (match) {
      const component = match[1];
      const key = `${currentPageName}:${component}`;
      globalStats.renderCounts.set(key, (globalStats.renderCounts.get(key) || 0) + 1);
      console.log(`🔄 [${currentPageName}] Re-render: ${component} (${globalStats.renderCounts.get(key)})`);
    }
  }
  
  // Détecter les appels de hooks
  if (text.includes('Hook called') || text.includes('INIT:') || text.includes('useEffect')) {
    const hookMatch = text.match(/(use\w+)/);
    if (hookMatch) {
      const hook = hookMatch[1];
      const key = `${currentPageName}:${hook}`;
      globalStats.hookCalls.set(key, (globalStats.hookCalls.get(key) || 0) + 1);
    }
  }
  
  // Détecter les montages de composants
  if (text.includes('Montage avec id') || text.includes('mounted') || text.includes('Component mounted')) {
    const componentMatch = text.match(/(\w+View|\w+List|\w+Form|\w+Details|\w+Page)/);
    if (componentMatch) {
      const component = componentMatch[1];
      const key = `${currentPageName}:${component}`;
      globalStats.componentMounts.set(key, (globalStats.componentMounts.get(key) || 0) + 1);
      console.log(`🏗️ [${currentPageName}] Montage: ${component} (${globalStats.componentMounts.get(key)})`);
    }
  }
  
  // Détecter les erreurs et warnings
  if (msg.type() === 'error' || msg.type() === 'warning') {
    globalStats.consoleErrors.push({
      message: text,
      page: currentPageName,
      timestamp,
      type: msg.type()
    });
    const icon = msg.type() === 'error' ? '❌' : '⚠️';
    console.log(`${icon} [${currentPageName}] ${msg.type()}: ${text.substring(0, 60)}...`);
  }
}

// Fonction pour exécuter les actions sur une page (améliorée)
async function executePageActions(page, actions) {
  for (const action of actions) {
    try {
      if (action.startsWith('wait:')) {
        const duration = parseInt(action.split(':')[1]);
        await new Promise(resolve => setTimeout(resolve, duration));
      } else if (action.startsWith('type:')) {
        const parts = action.split(':');
        const selector = parts[1];
        const text = parts[2];
        
        const element = await page.$(selector);
        if (element) {
          await element.click({ clickCount: 3 }); // Sélectionner tout
          await element.type(text);
        }
      } else if (action.startsWith('click:')) {
        const selector = action.split(':')[1];
        
        if (selector.includes('contains')) {
          // Gérer les sélecteurs avec :contains()
          const textMatch = selector.match(/contains\("([^"]+)"\)/);
          if (textMatch) {
            const buttonText = textMatch[1];
            await page.evaluate((text) => {
              const buttons = Array.from(document.querySelectorAll('button'));
              const button = buttons.find(b => b.textContent.includes(text));
              if (button) button.click();
            }, buttonText);
          }
        } else {
          const element = await page.$(selector);
          if (element) {
            await element.click();
          }
        }
      }
    } catch (error) {
      console.log(`⚠️ Action échouée: ${action} - ${error.message}`);
    }
  }
}

// Fonction pour déterminer la catégorie d'une page
function getPageCategory(pageName) {
  if (pageName.includes('Concert')) return 'Concerts';
  if (pageName.includes('Programmateur')) return 'Programmateurs';
  if (pageName.includes('Artiste')) return 'Artistes';
  if (pageName.includes('Lieu')) return 'Lieux';
  if (pageName.includes('Structure')) return 'Structures';
  if (pageName.includes('Paramètres')) return 'Paramètres';
  if (pageName.includes('Modèle') || pageName.includes('Contrat')) return 'Contrats';
  return 'Autres';
}

// Fonction pour tester une page spécifique (améliorée)
async function testPage(pageConfig) {
  const { name, url, actions } = pageConfig;
  console.log(`\n📄 Test de la page: ${name}`);
  console.log(`🔗 URL: ${url}`);
  
  const pageStats = {
    renders: 0,
    hooks: 0,
    mounts: 0,
    errors: 0,
    warnings: 0
  };
  
  try {
    // Naviguer vers la page
    console.log('🚀 Navigation...');
    await page.goto(`${APP_URL}${url}`, { 
      waitUntil: 'domcontentloaded', 
      timeout: 15000 
    });
    
    console.log('✅ Page chargée');
    
    // Attendre la stabilisation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Exécuter les actions spécifiques à la page
    if (actions && actions.length > 0) {
      console.log(`🎬 Exécution de ${actions.length} action(s)...`);
      await executePageActions(page, actions);
    }
    
    // Observer pendant la durée définie
    console.log(`⏱️ Observation pendant ${TEST_DURATION_PER_PAGE/1000}s...`);
    await new Promise(resolve => setTimeout(resolve, TEST_DURATION_PER_PAGE));
    
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
    
    const pageErrors = globalStats.consoleErrors.filter(e => e.page === name);
    pageStats.errors = pageErrors.filter(e => e.type === 'error').length;
    pageStats.warnings = pageErrors.filter(e => e.type === 'warning').length;
    
    // Évaluer la page
    let status = '🟢 EXCELLENT';
    if (pageStats.renders > 15 || pageStats.errors > 0) {
      status = '🔴 PROBLÉMATIQUE';
    } else if (pageStats.renders > 8 || pageStats.warnings > 2) {
      status = '🟡 ATTENTION';
    }
    
    console.log(`📊 Résultat: ${status} (${pageStats.renders} re-renders, ${pageStats.hooks} hooks, ${pageStats.errors} erreurs, ${pageStats.warnings} warnings)`);
    
    globalStats.pageResults.set(name, { ...pageStats, status });
    
    // Mettre à jour les stats par catégorie
    const category = getPageCategory(name);
    if (!globalStats.categoryStats.has(category)) {
      globalStats.categoryStats.set(category, { renders: 0, errors: 0, warnings: 0, pages: 0 });
    }
    const catStats = globalStats.categoryStats.get(category);
    catStats.renders += pageStats.renders;
    catStats.errors += pageStats.errors;
    catStats.warnings += pageStats.warnings;
    catStats.pages += 1;
    
  } catch (error) {
    console.log(`❌ Erreur lors du test de ${name}: ${error.message}`);
    globalStats.pageResults.set(name, { 
      renders: 0, 
      hooks: 0, 
      mounts: 0, 
      errors: 1, 
      warnings: 0,
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
    }, 25000);
  });
}

// Fonction pour générer le rapport final étendu
function generateExtendedReport() {
  console.log('\n📊 RAPPORT COMPLET ÉTENDU - TOUTES LES PAGES');
  console.log('=============================================');
  
  // Résumé par catégorie
  console.log('\n📂 Résultats par catégorie:');
  globalStats.categoryStats.forEach((stats, category) => {
    const avgRenders = (stats.renders / stats.pages).toFixed(1);
    let categoryStatus = '🟢';
    if (stats.errors > 0 || stats.renders > 30) {
      categoryStatus = '🔴';
    } else if (stats.warnings > 3 || stats.renders > 15) {
      categoryStatus = '🟡';
    }
    
    console.log(`  ${categoryStatus} ${category} (${stats.pages} pages):`);
    console.log(`    🔄 ${stats.renders} re-renders (moy: ${avgRenders})`);
    console.log(`    ❌ ${stats.errors} erreurs`);
    console.log(`    ⚠️ ${stats.warnings} warnings`);
  });
  
  // Résumé par page (top 10 problématiques)
  console.log('\n📄 Top 10 des pages les plus problématiques:');
  const sortedPages = Array.from(globalStats.pageResults.entries())
    .sort((a, b) => (b[1].renders + b[1].errors * 20 + b[1].warnings * 5) - (a[1].renders + a[1].errors * 20 + a[1].warnings * 5))
    .slice(0, 10);
  
  sortedPages.forEach(([pageName, stats], index) => {
    const score = stats.renders + stats.errors * 20 + stats.warnings * 5;
    if (score > 0) {
      console.log(`  ${index + 1}. ${pageName}: ${score} points`);
      console.log(`     🔄 ${stats.renders} re-renders, ❌ ${stats.errors} erreurs, ⚠️ ${stats.warnings} warnings`);
    }
  });
  
  if (sortedPages.every(([, stats]) => stats.renders + stats.errors * 20 + stats.warnings * 5 === 0)) {
    console.log('  ✅ Aucune page problématique détectée');
  }
  
  // Statistiques globales
  const totalRenders = Array.from(globalStats.renderCounts.values()).reduce((a, b) => a + b, 0);
  const totalHooks = Array.from(globalStats.hookCalls.values()).reduce((a, b) => a + b, 0);
  const totalMounts = Array.from(globalStats.componentMounts.values()).reduce((a, b) => a + b, 0);
  const totalErrors = globalStats.consoleErrors.filter(e => e.type === 'error').length;
  const totalWarnings = globalStats.consoleErrors.filter(e => e.type === 'warning').length;
  const totalPages = ALL_PAGES_TO_TEST.length;
  
  console.log('\n🌍 Statistiques globales:');
  console.log(`  📄 Pages testées: ${totalPages}`);
  console.log(`  🔄 Total re-renders: ${totalRenders} (moy: ${(totalRenders/totalPages).toFixed(1)} par page)`);
  console.log(`  🎣 Total appels hooks: ${totalHooks}`);
  console.log(`  🏗️ Total montages: ${totalMounts}`);
  console.log(`  ❌ Total erreurs: ${totalErrors}`);
  console.log(`  ⚠️ Total warnings: ${totalWarnings}`);
  
  // Score global étendu
  const globalScore = Math.max(0, 100 - totalRenders * 1.5 - totalErrors * 15 - totalWarnings * 3);
  console.log('\n🎯 SCORE GLOBAL ÉTENDU:');
  console.log(`📈 ${globalScore.toFixed(1)}/100`);
  
  if (globalScore >= 95) {
    console.log('🟢 EXCELLENT - Application parfaitement optimisée sur TOUTES les pages');
  } else if (globalScore >= 85) {
    console.log('🟡 TRÈS BON - Application bien optimisée avec quelques améliorations mineures');
  } else if (globalScore >= 70) {
    console.log('🟠 BON - Application correctement optimisée avec quelques points d\'attention');
  } else if (globalScore >= 50) {
    console.log('🟠 MOYEN - Optimisations recommandées sur plusieurs pages');
  } else {
    console.log('🔴 PROBLÉMATIQUE - Optimisations urgentes nécessaires');
  }
  
  // Recommandations étendues
  console.log('\n💡 Recommandations détaillées:');
  if (totalRenders > 50) {
    console.log('  🔧 Optimiser les hooks avec trop de re-renders');
    console.log('  🔧 Vérifier les dépendances des useEffect et useMemo');
  }
  if (totalErrors > 0) {
    console.log('  🐛 Corriger les erreurs JavaScript détectées');
  }
  if (totalWarnings > 5) {
    console.log('  ⚠️ Examiner et corriger les warnings React');
  }
  if (globalScore >= 95) {
    console.log('  🎉 Félicitations ! Application excellemment optimisée sur toutes les pages');
  }
  
  // Couverture des tests
  console.log('\n📋 Couverture des tests:');
  console.log('  ✅ Pages de listes: Complète');
  console.log('  ✅ Pages de création: Complète');
  console.log('  ✅ Pages d\'édition: Complète');
  console.log('  ✅ Pages de détails: Complète');
  console.log('  ✅ Pages de paramètres: Complète');
  console.log('  ✅ Pages de contrats: Complète');
  console.log(`  📊 Total: ${totalPages} pages testées`);
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
    
    console.log(`\n🎯 Test de ${ALL_PAGES_TO_TEST.length} pages au total`);
    console.log('⏱️ Durée estimée: ' + Math.ceil(ALL_PAGES_TO_TEST.length * TEST_DURATION_PER_PAGE / 1000 / 60) + ' minutes');
    
    // Tester chaque page
    for (let i = 0; i < ALL_PAGES_TO_TEST.length; i++) {
      const pageConfig = ALL_PAGES_TO_TEST[i];
      console.log(`\n[${i + 1}/${ALL_PAGES_TO_TEST.length}] ==================`);
      
      // Configurer l'écoute des logs pour cette page
      page.removeAllListeners('console');
      page.on('console', (msg) => analyzeConsoleMessage(msg, pageConfig.name));
      
      await testPage(pageConfig);
    }
    
    // Générer le rapport final étendu
    generateExtendedReport();
    
  } catch (error) {
    console.error('❌ Erreur lors du test complet étendu:', error);
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