const puppeteer = require('puppeteer');

async function diagnosticProfiler() {
  console.log('🔍 Diagnostic du React Profiler...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Capturer TOUS les logs de la console
  let profilerFound = false;
  let profileDataCaptured = false;
  const allLogs = [];
  
  page.on('console', msg => {
    const text = msg.text();
    allLogs.push(text);
    
    // Vérifier si le Profiler est actif
    if (text.includes('🎭 Profiler')) {
      profilerFound = true;
      profileDataCaptured = true;
      console.log('✅ Profiler actif:', text.substring(0, 100) + '...');
    }
    
    // Vérifier les logs de rendu
    if (text.includes('ConcertFormDesktop RENDER')) {
      console.log('📊 Render détecté:', text);
    }
    
    // Vérifier si recordProfilerData est appelé
    if (text.includes('recordProfilerData') || text.includes('PROFILER_STATS')) {
      console.log('📈 Appel de recordProfilerData détecté');
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

    // 2. Vérifier si le ProfilerMonitor est visible
    console.log('\n🔍 Recherche du ProfilerMonitor...');
    const profilerMonitor = await page.$('.profiler-monitor');
    if (profilerMonitor) {
      console.log('✅ ProfilerMonitor trouvé dans le DOM');
      
      // Vérifier son contenu
      const content = await page.evaluate(() => {
        const monitor = document.querySelector('.profiler-monitor');
        return monitor ? monitor.textContent : null;
      });
      console.log('📝 Contenu du ProfilerMonitor:', content);
    } else {
      console.log('❌ ProfilerMonitor non trouvé dans le DOM');
    }

    // 3. Vérifier les données globales
    console.log('\n🔍 Vérification des données globales...');
    const globalData = await page.evaluate(() => {
      return {
        hasProfilerStats: typeof window.PROFILER_STATS !== 'undefined',
        profilerStats: window.PROFILER_STATS || null,
        profilerDataLength: window.PROFILER_STATS ? Object.keys(window.PROFILER_STATS.renders || {}).length : 0
      };
    });
    console.log('📊 Données globales:', globalData);

    // 4. Naviguer vers le formulaire
    console.log('\n📍 Navigation vers le formulaire de concert...');
    await page.click('button[aria-label="Ajouter un concert"]');
    await page.waitForTimeout(3000);

    // 5. Vérifier que le formulaire est chargé
    const formLoaded = await page.$('input[name="nom"]');
    if (formLoaded) {
      console.log('✅ Formulaire chargé');
    } else {
      console.log('❌ Formulaire non trouvé');
    }

    // 6. Re-vérifier les données après navigation
    console.log('\n🔍 Re-vérification après navigation...');
    const dataAfterNav = await page.evaluate(() => {
      return {
        hasProfilerStats: typeof window.PROFILER_STATS !== 'undefined',
        profilerStats: window.PROFILER_STATS || null,
        profilerDataLength: window.PROFILER_STATS ? Object.keys(window.PROFILER_STATS.renders || {}).length : 0
      };
    });
    console.log('📊 Données après navigation:', dataAfterNav);

    // 7. Tester un appel direct à recordProfilerData
    console.log('\n🔍 Test d\'appel direct à recordProfilerData...');
    const testResult = await page.evaluate(() => {
      if (typeof window.recordProfilerData === 'function') {
        window.recordProfilerData('Test-Component', 'update', 25.5);
        return { success: true, data: window.PROFILER_STATS };
      }
      return { success: false, error: 'recordProfilerData non trouvé' };
    });
    console.log('📊 Résultat du test:', testResult);

    // 8. Analyser les logs
    console.log('\n📋 ANALYSE DES LOGS:');
    console.log(`  - Total de logs capturés: ${allLogs.length}`);
    console.log(`  - Profiler trouvé: ${profilerFound ? '✅ OUI' : '❌ NON'}`);
    console.log(`  - Données capturées: ${profileDataCaptured ? '✅ OUI' : '❌ NON'}`);

    // 9. Suggestions
    console.log('\n💡 DIAGNOSTIC:');
    if (!profilerFound) {
      console.log('❌ Le Profiler ne semble pas être actif. Vérifiez que:');
      console.log('   1. Le composant ConcertForm utilise bien les <Profiler>');
      console.log('   2. L\'import de recordProfilerData est correct');
      console.log('   3. Le bon composant est chargé (Desktop vs Mobile)');
    } else if (!profileDataCaptured) {
      console.log('⚠️ Le Profiler est actif mais les données ne sont pas enregistrées');
      console.log('   Vérifiez que recordProfilerData est bien appelé dans onRenderCallback');
    } else {
      console.log('✅ Le système semble fonctionner correctement');
    }

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  } finally {
    console.log('\n🏁 Diagnostic terminé. Fermeture dans 10 secondes...');
    await page.waitForTimeout(10000);
    await browser.close();
  }
}

// Exécuter le diagnostic
diagnosticProfiler().catch(console.error); 