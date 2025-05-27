const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

// Configuration
const APP_URL = 'http://localhost:3000';
const TEST_DURATION = 6000; // 6 secondes par page

// Pages de visualisation à tester
const VIEW_PAGES = [
  // === CONCERTS ===
  {
    name: 'Détail Concert',
    url: '/concerts/con-1747960488398-mwb0vm',
    actions: ['wait:2000']
  },

  // === PROGRAMMATEURS ===
  {
    name: 'Détail Programmateur',
    url: '/programmateurs/prog-1747960488398-test',
    actions: ['wait:2000']
  },

  // === ARTISTES ===
  {
    name: 'Détail Artiste',
    url: '/artistes/art-1747960488398-test',
    actions: ['wait:2000']
  },

  // === LIEUX ===
  {
    name: 'Détail Lieu',
    url: '/lieux/lieu-1747960488398-test',
    actions: ['wait:2000']
  },

  // === STRUCTURES ===
  {
    name: 'Détail Structure',
    url: '/structures/struct-1747960488398-test',
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
    
    // Détecter les erreurs
    if (msg.type() === 'error' || text.includes('Error') || text.includes('Warning')) {
      errorCount++;
      console.log(`⚠️ ${text}`);
    }
  });
  
  try {
    console.log(`📝 Test de: ${pageConfig.name}`);
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
    score = Math.max(0, score);
    
    const status = score >= 80 ? '🟢 EXCELLENT' : score >= 60 ? '🟡 BON' : '🔴 PROBLÈME';
    console.log(`📊 ${status}: ${renderCount} re-renders, ${hookCallCount} hooks, ${errorCount} erreurs`);
    
    results.push({
      name: pageConfig.name,
      url: pageConfig.url,
      renderCount,
      hookCallCount,
      errorCount,
      score,
      status: status.split(' ')[1]
    });
    
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
    results.push({
      name: pageConfig.name,
      url: pageConfig.url,
      renderCount: 999,
      hookCallCount: 999,
      errorCount: 999,
      score: 0,
      status: 'ERREUR'
    });
  } finally {
    await page.close();
  }
}

async function runTests() {
  console.log('👁️ Test spécialisé des pages de visualisation');
  console.log('===============================================');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  console.log('🌐 Lancement du navigateur...');
  
  try {
    for (const pageConfig of VIEW_PAGES) {
      await testPage(browser, pageConfig);
      console.log(''); // Ligne vide pour la lisibilité
    }
  } finally {
    await browser.close();
  }
  
  // Afficher le rapport final
  console.log('📊 RAPPORT DES PAGES DE VISUALISATION');
  console.log('=====================================');
  
  let totalRenders = 0;
  let totalHooks = 0;
  let totalErrors = 0;
  
  results.forEach(result => {
    const statusIcon = result.status === 'EXCELLENT' ? '🟢' : 
                      result.status === 'BON' ? '🟡' : '🔴';
    console.log(`${statusIcon} ${result.name}:`);
    console.log(`  🔄 ${result.renderCount} re-renders`);
    console.log(`  🎣 ${result.hookCallCount} appels de hooks`);
    console.log(`  ❌ ${result.errorCount} erreurs`);
    
    totalRenders += result.renderCount;
    totalHooks += result.hookCallCount;
    totalErrors += result.errorCount;
  });
  
  console.log('');
  console.log('🌍 TOTAL:');
  console.log(`🔄 ${totalRenders} re-renders`);
  console.log(`🎣 ${totalHooks} appels de hooks`);
  console.log(`❌ ${totalErrors} erreurs`);
  
  // Score global
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  console.log('');
  console.log(`🎯 Score: ${Math.round(avgScore)}/100`);
  
  if (avgScore >= 80) {
    console.log('🟢 Pages de visualisation parfaitement optimisées');
  } else if (avgScore >= 60) {
    console.log('🟡 Pages de visualisation correctement optimisées');
  } else {
    console.log('🔴 Pages de visualisation nécessitent des optimisations');
  }
  
  console.log('');
  console.log('💡 Recommandations pour les pages de visualisation:');
  if (totalRenders === 0 && totalErrors === 0) {
    console.log('  🎉 Pages de détails bien optimisées !');
  } else {
    if (totalRenders > 0) {
      console.log('  🔄 Réduire les re-renders inutiles');
    }
    if (totalErrors > 0) {
      console.log('  ❌ Corriger les erreurs détectées');
    }
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