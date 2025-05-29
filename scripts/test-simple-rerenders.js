const puppeteer = require('puppeteer');

async function testSimpleRerenders() {
  console.log('🔍 Test simple des re-renders...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    devtools: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  let renderCount = 0;
  
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('ConcertFormDesktop RENDER')) {
      renderCount++;
      if (renderCount % 100 === 0) {
        console.log(`📊 ${renderCount} rendus...`);
      }
    }
  });

  try {
    console.log('📍 Navigation vers /concerts...');
    await page.goto('http://localhost:3000/concerts', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    await page.waitForTimeout(1000);
    renderCount = 0;

    console.log('➕ Ouverture du formulaire...');
    await page.click('button[aria-label="Ajouter un concert"]');
    
    console.log('⏳ Attente de 5 secondes...');
    await page.waitForTimeout(5000);
    
    console.log(`\n📊 RÉSULTAT FINAL: ${renderCount} rendus`);
    
    // Test rapide d'interaction
    console.log('\n📝 Test de saisie...');
    const beforeTyping = renderCount;
    await page.type('input[name="nom"]', 'Test', { delay: 100 });
    await page.waitForTimeout(1000);
    const afterTyping = renderCount;
    
    console.log(`   Rendus pendant la saisie: ${afterTyping - beforeTyping}`);
    
    // Vérifier ProfilerMonitor
    const stats = await page.evaluate(() => {
      if (window.PROFILER_STATS) {
        const data = {};
        Object.keys(window.PROFILER_STATS.renders || {}).forEach(key => {
          data[key] = window.PROFILER_STATS.renders[key];
        });
        return data;
      }
      return null;
    });
    
    if (stats) {
      console.log('\n📊 Données du ProfilerMonitor:');
      Object.entries(stats).forEach(([component, count]) => {
        console.log(`   ${component}: ${count}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    console.log('\n✅ Test terminé');
    await browser.close();
  }
}

testSimpleRerenders().catch(console.error); 