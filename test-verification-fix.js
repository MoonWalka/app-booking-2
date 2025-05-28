const puppeteer = require('puppeteer');

async function verifyFix() {
  console.log('🔍 Vérification de la correction des re-renders...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  let renderCount = 0;
  let lastRenderTime = Date.now();
  const renderTimes = [];
  
  page.on('console', msg => {
    const text = msg.text();
    
    // Compter les rendus
    if (text.includes('ConcertFormDesktop RENDER')) {
      renderCount++;
      const now = Date.now();
      const timeSinceLastRender = now - lastRenderTime;
      renderTimes.push(timeSinceLastRender);
      lastRenderTime = now;
      
      // Afficher les 10 premiers rendus
      if (renderCount <= 10) {
        console.log(`🔄 Render #${renderCount} (${timeSinceLastRender}ms depuis le dernier)`);
      }
    }
    
    // Capturer les données du Profiler
    if (text.includes('🎭 Profiler') && renderCount <= 5) {
      console.log('📊', text.substring(0, 150) + '...');
    }
  });

  try {
    // 1. Aller sur la page
    console.log('📍 Navigation vers /concerts...');
    await page.goto('http://localhost:3000/concerts', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    await page.waitForTimeout(2000);

    // Réinitialiser les compteurs
    renderCount = 0;
    lastRenderTime = Date.now();
    renderTimes.length = 0;

    // 2. Naviguer vers le formulaire
    console.log('\n📍 Ouverture du formulaire de concert...');
    await page.click('button[aria-label="Ajouter un concert"]');
    
    // Attendre que le formulaire soit chargé
    await page.waitForSelector('input[name="nom"]', { timeout: 10000 });
    
    // 3. Attendre 3 secondes pour capturer les rendus initiaux
    console.log('\n⏳ Capture des rendus pendant 3 secondes...');
    await page.waitForTimeout(3000);
    
    // 4. Analyser les résultats
    console.log('\n📊 RÉSULTATS DE LA VÉRIFICATION:');
    console.log(`  - Nombre total de rendus: ${renderCount}`);
    
    if (renderCount < 50) {
      console.log(`  ✅ SUCCÈS! Le nombre de rendus est maintenant raisonnable (${renderCount} < 50)`);
    } else if (renderCount < 100) {
      console.log(`  🟡 AMÉLIORATION! Le nombre de rendus a diminué mais reste élevé (${renderCount})`);
    } else {
      console.log(`  ❌ PROBLÈME PERSISTANT! Le nombre de rendus est toujours excessif (${renderCount})`);
    }
    
    // 5. Analyser le pattern des rendus
    if (renderTimes.length > 10) {
      const avgTime = renderTimes.slice(1).reduce((a, b) => a + b, 0) / (renderTimes.length - 1);
      console.log(`\n  - Temps moyen entre rendus: ${avgTime.toFixed(2)}ms`);
      
      // Détecter les rafales de rendus
      const bursts = renderTimes.filter(t => t < 10).length;
      if (bursts > renderTimes.length * 0.5) {
        console.log(`  ⚠️ Détection de rafales de rendus (${bursts} rendus < 10ms)`);
      }
    }
    
    // 6. Test d'interaction
    console.log('\n🔄 Test d\'interaction...');
    const rendersBefore = renderCount;
    
    // Taper dans un champ
    await page.type('input[name="nom"]', 'Test', { delay: 100 });
    await page.waitForTimeout(1000);
    
    const rendersAfter = renderCount;
    const rendersFromTyping = rendersAfter - rendersBefore;
    
    console.log(`  - Rendus causés par la saisie: ${rendersFromTyping}`);
    if (rendersFromTyping <= 10) {
      console.log(`  ✅ Les interactions causent un nombre raisonnable de rendus`);
    } else {
      console.log(`  ⚠️ Les interactions causent trop de rendus (${rendersFromTyping})`);
    }
    
    // 7. Vérifier les données du ProfilerMonitor
    console.log('\n📊 Vérification du ProfilerMonitor...');
    const profilerData = await page.evaluate(() => {
      return window.PROFILER_STATS ? {
        hasData: Object.keys(window.PROFILER_STATS.renders || {}).length > 0,
        components: Object.keys(window.PROFILER_STATS.renders || {})
      } : null;
    });
    
    if (profilerData?.hasData) {
      console.log('  ✅ Le ProfilerMonitor capture des données');
      console.log(`  - Composants trackés: ${profilerData.components.join(', ')}`);
    } else {
      console.log('  ⚠️ Le ProfilerMonitor ne capture pas de données');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    console.log('\n🏁 Vérification terminée. Fermeture dans 5 secondes...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

// Exécuter la vérification
verifyFix().catch(console.error); 