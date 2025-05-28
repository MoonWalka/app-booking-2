const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

// Configuration
const APP_URL = 'http://localhost:3000';
const TEST_DURATION = 6000; // 6 secondes par page

// TOUTES LES PAGES À TESTER
const ALL_PAGES = [
  // === PAGES D'ÉDITION ===
  {
    name: 'Nouveau Concert',
    url: '/concerts/nouveau',
    category: 'ÉDITION',
    actions: ['wait:2000']
  },
  {
    name: 'Édition Concert',
    url: '/concerts/con-1747960488398-mwb0vm/edit',
    category: 'ÉDITION',
    actions: ['wait:2000']
  },
  {
    name: 'Nouveau Programmateur',
    url: '/programmateurs/nouveau',
    category: 'ÉDITION',
    actions: ['wait:2000']
  },
  {
    name: 'Édition Programmateur',
    url: '/programmateurs/prog-1747960488398-test/edit',
    category: 'ÉDITION',
    actions: ['wait:2000']
  },
  {
    name: 'Nouveau Artiste',
    url: '/artistes/nouveau',
    category: 'ÉDITION',
    actions: ['wait:2000']
  },
  {
    name: 'Édition Artiste',
    url: '/artistes/art-1747960488398-test/edit',
    category: 'ÉDITION',
    actions: ['wait:2000']
  },
  {
    name: 'Nouveau Lieu',
    url: '/lieux/nouveau',
    category: 'ÉDITION',
    actions: ['wait:2000']
  },
  {
    name: 'Édition Lieu',
    url: '/lieux/lieu-1747960488398-test/edit',
    category: 'ÉDITION',
    actions: ['wait:2000']
  },
  {
    name: 'Nouvelle Structure',
    url: '/structures/nouveau',
    category: 'ÉDITION',
    actions: ['wait:2000']
  },
  {
    name: 'Édition Structure',
    url: '/structures/struct-1747960488398-test/edit',
    category: 'ÉDITION',
    actions: ['wait:2000']
  },

  // === PAGES DE VISUALISATION ===
  {
    name: 'Détail Concert (OPTIMISÉ)',
    url: '/concerts/con-1747960488398-mwb0vm',
    category: 'VISUALISATION',
    actions: ['wait:2000']
  },
  {
    name: 'Détail Programmateur',
    url: '/programmateurs/prog-1747960488398-test',
    category: 'VISUALISATION',
    actions: ['wait:2000']
  },
  {
    name: 'Détail Artiste',
    url: '/artistes/art-1747960488398-test',
    category: 'VISUALISATION',
    actions: ['wait:2000']
  },
  {
    name: 'Détail Lieu',
    url: '/lieux/lieu-1747960488398-test',
    category: 'VISUALISATION',
    actions: ['wait:2000']
  },
  {
    name: 'Détail Structure',
    url: '/structures/struct-1747960488398-test',
    category: 'VISUALISATION',
    actions: ['wait:2000']
  },

  // === PAGES DE PARAMÈTRES ===
  {
    name: 'Paramètres Entreprise',
    url: '/parametres/entreprise',
    category: 'PARAMÈTRES',
    actions: ['wait:2000']
  },
  {
    name: 'Paramètres Généraux',
    url: '/parametres/generaux',
    category: 'PARAMÈTRES',
    actions: ['wait:2000']
  },
  {
    name: 'Paramètres Compte',
    url: '/parametres/compte',
    category: 'PARAMÈTRES',
    actions: ['wait:2000']
  },
  {
    name: 'Paramètres Notifications',
    url: '/parametres/notifications',
    category: 'PARAMÈTRES',
    actions: ['wait:2000']
  },
  {
    name: 'Paramètres Apparence',
    url: '/parametres/apparence',
    category: 'PARAMÈTRES',
    actions: ['wait:2000']
  },

  // === PAGES DE LISTES ===
  {
    name: 'Liste Concerts',
    url: '/concerts',
    category: 'LISTES',
    actions: ['wait:2000']
  },
  {
    name: 'Liste Programmateurs',
    url: '/programmateurs',
    category: 'LISTES',
    actions: ['wait:2000']
  },
  {
    name: 'Liste Artistes',
    url: '/artistes',
    category: 'LISTES',
    actions: ['wait:2000']
  },
  {
    name: 'Liste Lieux',
    url: '/lieux',
    category: 'LISTES',
    actions: ['wait:2000']
  },
  {
    name: 'Liste Structures',
    url: '/structures',
    category: 'LISTES',
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

async function testPage(browser, pageConfig) {
  const page = await browser.newPage();
  
  // Métriques de performance
  let renderCount = 0;
  let hookCallCount = 0;
  let errorCount = 0;
  let infiniteLoopCount = 0;
  
  // Intercepter les logs de console pour détecter les re-renders et erreurs
  page.on('console', (msg) => {
    const text = msg.text();
    
    // Détecter les re-renders
    if (text.includes('render') || text.includes('Re-render') || text.includes('RENDER')) {
      renderCount++;
    }
    
    // Détecter les appels de hooks excessifs
    if (text.includes('useEffect') || text.includes('useState') || text.includes('useCallback')) {
      hookCallCount++;
    }
    
    // Détecter les boucles infinies
    if (text.includes('Maximum update depth') || text.includes('infinite loop') || text.includes('RENDER_LOOP')) {
      infiniteLoopCount++;
      errorCount++;
    }
    
    // Détecter les erreurs
    if (msg.type() === 'error' || text.includes('Error') || text.includes('Warning')) {
      errorCount++;
      console.log(`⚠️ ${pageConfig.name}: ${text}`);
    }
  });
  
  try {
    console.log(`📝 Test de: ${pageConfig.name} (${pageConfig.category})`);
    console.log(`🔗 ${pageConfig.url}`);
    
    console.log('🚀 Navigation...');
    await page.goto(`${APP_URL}${pageConfig.url}`, { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    console.log('✅ Page chargée (DOM)');
    
    // Exécuter les actions spécifiées
    if (pageConfig.actions && pageConfig.actions.length > 0) {
      console.log(`🎬 Exécution de ${pageConfig.actions.length} actions...`);
      
      for (const action of pageConfig.actions) {
        if (action.startsWith('wait:')) {
          const waitTime = parseInt(action.split(':')[1]);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    // Observer la page pendant la durée spécifiée
    console.log(`⏱️ Observation pendant ${TEST_DURATION/1000}s...`);
    await new Promise(resolve => setTimeout(resolve, TEST_DURATION));
    
    // Calculer le score de performance
    let score = 100;
    if (renderCount > 5) score -= Math.min(30, renderCount * 2);
    if (hookCallCount > 10) score -= Math.min(20, hookCallCount);
    if (errorCount > 0) score -= Math.min(50, errorCount * 10);
    if (infiniteLoopCount > 0) score -= 50; // Pénalité sévère pour les boucles infinies
    score = Math.max(0, score);
    
    const status = score >= 80 ? '🟢 EXCELLENT' : score >= 60 ? '🟡 BON' : '🔴 PROBLÈME';
    console.log(`📊 ${status}: ${renderCount} re-renders, ${hookCallCount} hooks, ${errorCount} erreurs, ${infiniteLoopCount} boucles`);
    
    results.push({
      name: pageConfig.name,
      category: pageConfig.category,
      url: pageConfig.url,
      renderCount,
      hookCallCount,
      errorCount,
      infiniteLoopCount,
      score,
      status: status.split(' ')[1]
    });
    
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
    results.push({
      name: pageConfig.name,
      category: pageConfig.category,
      url: pageConfig.url,
      renderCount: 999,
      hookCallCount: 999,
      errorCount: 999,
      infiniteLoopCount: 999,
      score: 0,
      status: 'ERREUR'
    });
  } finally {
    await page.close();
  }
}

async function runTests() {
  console.log('🎯 TEST COMPLET DE TOUTES LES PAGES OPTIMISÉES');
  console.log('===============================================');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  console.log('🌐 Lancement du navigateur...');
  
  try {
    for (const pageConfig of ALL_PAGES) {
      await testPage(browser, pageConfig);
      console.log(''); // Ligne vide pour la lisibilité
    }
  } finally {
    await browser.close();
  }
  
  // Afficher le rapport final par catégorie
  console.log('📊 RAPPORT COMPLET PAR CATÉGORIE');
  console.log('=================================');
  
  const categories = ['ÉDITION', 'VISUALISATION', 'PARAMÈTRES', 'LISTES'];
  
  categories.forEach(category => {
    const categoryResults = results.filter(r => r.category === category);
    if (categoryResults.length === 0) return;
    
    console.log(`\n🏷️ ${category}:`);
    console.log('─'.repeat(40));
    
    let totalRenders = 0;
    let totalHooks = 0;
    let totalErrors = 0;
    let totalLoops = 0;
    
    categoryResults.forEach(result => {
      const statusIcon = result.status === 'EXCELLENT' ? '🟢' : 
                        result.status === 'BON' ? '🟡' : '🔴';
      console.log(`${statusIcon} ${result.name}:`);
      console.log(`  🔄 ${result.renderCount} re-renders`);
      console.log(`  🎣 ${result.hookCallCount} hooks`);
      console.log(`  ❌ ${result.errorCount} erreurs`);
      console.log(`  🔁 ${result.infiniteLoopCount} boucles infinies`);
      console.log(`  📊 Score: ${result.score}/100`);
      
      totalRenders += result.renderCount;
      totalHooks += result.hookCallCount;
      totalErrors += result.errorCount;
      totalLoops += result.infiniteLoopCount;
    });
    
    const avgScore = categoryResults.reduce((sum, r) => sum + r.score, 0) / categoryResults.length;
    console.log(`\n📈 TOTAL ${category}:`);
    console.log(`🔄 ${totalRenders} re-renders | 🎣 ${totalHooks} hooks | ❌ ${totalErrors} erreurs | 🔁 ${totalLoops} boucles`);
    console.log(`🎯 Score moyen: ${Math.round(avgScore)}/100`);
  });
  
  // Score global
  const globalAvgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  const totalPages = results.length;
  const excellentPages = results.filter(r => r.status === 'EXCELLENT').length;
  const problemPages = results.filter(r => r.status === 'PROBLÈME' || r.status === 'ERREUR').length;
  
  console.log('\n🌍 RÉSULTATS GLOBAUX:');
  console.log('=====================');
  console.log(`📊 Score global: ${Math.round(globalAvgScore)}/100`);
  console.log(`📈 Pages testées: ${totalPages}`);
  console.log(`🟢 Pages excellentes: ${excellentPages}/${totalPages} (${Math.round(excellentPages/totalPages*100)}%)`);
  console.log(`🔴 Pages problématiques: ${problemPages}/${totalPages} (${Math.round(problemPages/totalPages*100)}%)`);
  
  if (globalAvgScore >= 90) {
    console.log('\n🎉 APPLICATION PARFAITEMENT OPTIMISÉE !');
  } else if (globalAvgScore >= 80) {
    console.log('\n🟢 Application bien optimisée');
  } else if (globalAvgScore >= 60) {
    console.log('\n🟡 Application correctement optimisée');
  } else {
    console.log('\n🔴 Application nécessite des optimisations');
  }
  
  // Recommandations spécifiques
  console.log('\n💡 RECOMMANDATIONS:');
  const problemResults = results.filter(r => r.score < 80);
  if (problemResults.length === 0) {
    console.log('  🎊 Toutes les pages sont parfaitement optimisées !');
  } else {
    problemResults.forEach(result => {
      console.log(`  🔧 ${result.name}: ${result.score}/100`);
      if (result.renderCount > 5) console.log(`    - Réduire les ${result.renderCount} re-renders`);
      if (result.errorCount > 0) console.log(`    - Corriger les ${result.errorCount} erreurs`);
      if (result.infiniteLoopCount > 0) console.log(`    - URGENT: Corriger les ${result.infiniteLoopCount} boucles infinies`);
    });
  }
}

async function main() {
  try {
    await startApp();
    await runTests();
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  } finally {
    if (appProcess) {
      appProcess.kill();
    }
    process.exit(0);
  }
}

main(); 