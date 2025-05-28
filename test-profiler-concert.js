const puppeteer = require('puppeteer');

async function testConcertFormProfiler() {
  console.log('🚀 Démarrage du test avec React Profiler...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Écouter les logs de la console
  const profilerData = [];
  const renderCounts = {};
  
  page.on('console', msg => {
    const text = msg.text();
    
    // Capturer les données du Profiler
    if (text.includes('🎭 Profiler')) {
      profilerData.push({
        time: new Date().toISOString(),
        message: text
      });
      
      // Parser les données
      const match = text.match(/\[([^\]]+)\]/);
      if (match) {
        const componentName = match[1];
        renderCounts[componentName] = (renderCounts[componentName] || 0) + 1;
      }
    }
    
    // Capturer les avertissements de performance
    if (text.includes('⚠️ Rendu lent')) {
      console.log('⚠️ ALERTE PERFORMANCE:', text);
    }
    
    // Afficher tous les logs pour debug
    if (text.includes('ConcertFormDesktop RENDER')) {
      console.log('📊', text);
    }
  });

  try {
    // 1. Aller sur la page de liste des concerts
    console.log('📍 Navigation vers la liste des concerts...');
    await page.goto('http://localhost:3000/concerts', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    await page.waitForTimeout(2000);

    // 2. Cliquer sur le bouton d'ajout
    console.log('➕ Clic sur le bouton d\'ajout de concert...');
    await page.click('button[aria-label="Ajouter un concert"]');
    await page.waitForTimeout(3000);

    // 3. Attendre que le formulaire soit chargé
    console.log('⏳ Attente du chargement du formulaire...');
    await page.waitForSelector('input[name="nom"]', { timeout: 10000 });
    
    // 4. Capturer l'état initial
    console.log('\n📊 ANALYSE DES PERFORMANCES INITIALES:');
    console.log('Nombre de rendus par composant:');
    Object.entries(renderCounts).forEach(([component, count]) => {
      console.log(`  - ${component}: ${count} rendus`);
    });

    // 5. Interagir avec le formulaire pour déclencher des re-renders
    console.log('\n🔄 Test des interactions...');
    
    // Taper dans le champ nom
    console.log('  📝 Saisie dans le champ nom...');
    await page.type('input[name="nom"]', 'Concert Test Profiler', { delay: 100 });
    await page.waitForTimeout(1000);
    
    // Taper dans le champ date
    console.log('  📅 Saisie de la date...');
    const dateInput = await page.$('input[type="date"]');
    if (dateInput) {
      await dateInput.click();
      await page.keyboard.type('2024-12-31');
    }
    await page.waitForTimeout(1000);
    
    // Taper dans le champ lieu de recherche
    console.log('  🔍 Recherche de lieu...');
    const lieuSearch = await page.$('input[placeholder*="lieu"]');
    if (lieuSearch) {
      await lieuSearch.click();
      await page.keyboard.type('Paris', { delay: 150 });
      await page.waitForTimeout(2000);
    }

    // 6. Analyser les résultats finaux
    console.log('\n📊 ANALYSE DES PERFORMANCES FINALES:');
    console.log('Nombre total de rendus par composant:');
    Object.entries(renderCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([component, count]) => {
        const emoji = count > 10 ? '🔴' : count > 5 ? '🟡' : '🟢';
        console.log(`  ${emoji} ${component}: ${count} rendus`);
      });

    // 7. Analyser les données de performance
    console.log('\n📈 DONNÉES DE PERFORMANCE DÉTAILLÉES:');
    const performanceStats = {};
    
    profilerData.forEach(data => {
      if (data.message.includes('actualDuration')) {
        const match = data.message.match(/\[([^\]]+)\].*actualDuration: ([0-9.]+)ms/);
        if (match) {
          const component = match[1];
          const duration = parseFloat(match[2]);
          
          if (!performanceStats[component]) {
            performanceStats[component] = {
              durations: [],
              count: 0
            };
          }
          
          performanceStats[component].durations.push(duration);
          performanceStats[component].count++;
        }
      }
    });

    Object.entries(performanceStats).forEach(([component, stats]) => {
      const avg = stats.durations.reduce((a, b) => a + b, 0) / stats.durations.length;
      const max = Math.max(...stats.durations);
      const min = Math.min(...stats.durations);
      
      console.log(`\n  ${component}:`);
      console.log(`    - Nombre de rendus: ${stats.count}`);
      console.log(`    - Durée moyenne: ${avg.toFixed(2)}ms`);
      console.log(`    - Durée max: ${max.toFixed(2)}ms`);
      console.log(`    - Durée min: ${min.toFixed(2)}ms`);
    });

    // 8. Identifier les composants problématiques
    console.log('\n🔥 COMPOSANTS PROBLÉMATIQUES:');
    const problematicComponents = Object.entries(renderCounts)
      .filter(([_, count]) => count > 10)
      .sort((a, b) => b[1] - a[1]);
    
    if (problematicComponents.length > 0) {
      problematicComponents.forEach(([component, count]) => {
        console.log(`  ❌ ${component}: ${count} rendus (EXCESSIF)`);
      });
    } else {
      console.log('  ✅ Aucun composant avec un nombre excessif de rendus');
    }

    // 9. Attendre un peu pour voir s'il y a d'autres rendus
    console.log('\n⏳ Attente de 5 secondes pour détecter d\'éventuels rendus supplémentaires...');
    await page.waitForTimeout(5000);

    // 10. Rapport final
    console.log('\n📋 RAPPORT FINAL:');
    const totalRenders = Object.values(renderCounts).reduce((a, b) => a + b, 0);
    console.log(`  - Nombre total de rendus: ${totalRenders}`);
    console.log(`  - Nombre de composants profilés: ${Object.keys(renderCounts).length}`);
    console.log(`  - Composant le plus rendu: ${Object.entries(renderCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}`);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    console.log('\n🏁 Test terminé. Fermeture du navigateur dans 5 secondes...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

// Exécuter le test
testConcertFormProfiler().catch(console.error); 