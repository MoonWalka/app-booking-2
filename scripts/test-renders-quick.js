#!/usr/bin/env node

/**
 * Script de test rapide des re-renders
 * 
 * Ce script active temporairement des logs de debug
 * dans l'application pour détecter rapidement les re-renders
 * sans avoir besoin d'ouvrir l'inspecteur.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('⚡ Test rapide des re-renders');
console.log('============================');

// Fichiers à modifier temporairement
const filesToModify = [
  {
    path: 'src/hooks/concerts/useConcertDetails.js',
    marker: '// console.log(\'[DEBUG][useConcertDetails] Hook called',
    replacement: 'console.log(\'[DEBUG][useConcertDetails] Hook called'
  },
  {
    path: 'src/hooks/common/useGenericEntityDetails.js',
    marker: '// console.log(\'[DEBUG][useGenericEntityDetails] Hook called',
    replacement: 'console.log(\'[DEBUG][useGenericEntityDetails] Hook called'
  },
  {
    path: 'src/components/concerts/desktop/ConcertView.js',
    marker: '// console.log(\'[DEBUG][ConcertView] Montage',
    replacement: 'console.log(\'[DEBUG][ConcertView] Montage'
  }
];

// Sauvegarde des contenus originaux
const originalContents = new Map();

// Fonction pour activer les logs de debug
function enableDebugLogs() {
  console.log('🔧 Activation des logs de debug...');
  
  filesToModify.forEach(({ path: filePath, marker, replacement }) => {
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      originalContents.set(fullPath, content);
      
      const modifiedContent = content.replace(
        new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        replacement
      );
      
      if (modifiedContent !== content) {
        fs.writeFileSync(fullPath, modifiedContent);
        console.log(`  ✅ ${filePath}`);
      }
    }
  });
}

// Fonction pour désactiver les logs de debug
function disableDebugLogs() {
  console.log('🔧 Désactivation des logs de debug...');
  
  originalContents.forEach((content, fullPath) => {
    fs.writeFileSync(fullPath, content);
    const relativePath = path.relative(path.join(__dirname, '..'), fullPath);
    console.log(`  ✅ ${relativePath}`);
  });
}

// Fonction pour analyser les logs en temps réel
function analyzeRealTimeLogs() {
  const renderCounts = new Map();
  const hookCalls = new Map();
  let lastLogTime = Date.now();
  
  return {
    processLine: (line) => {
      const now = Date.now();
      const timeSinceLastLog = now - lastLogTime;
      
      // Détecter les re-renders
      if (line.includes('Re-rendered because of hook changes')) {
        const match = line.match(/(\w+)\s+Re-rendered/);
        if (match) {
          const component = match[1];
          renderCounts.set(component, (renderCounts.get(component) || 0) + 1);
          console.log(`🔄 ${component} re-rendered (${renderCounts.get(component)})`);
        }
      }
      
      // Détecter les appels de hooks répétés
      if (line.includes('[DEBUG]') && line.includes('Hook called')) {
        const hookMatch = line.match(/\\[DEBUG\\]\\[(\\w+)\\]/);
        if (hookMatch) {
          const hook = hookMatch[1];
          hookCalls.set(hook, (hookCalls.get(hook) || 0) + 1);
          
          // Alerter si trop d'appels rapprochés
          if (timeSinceLastLog < 100 && hookCalls.get(hook) > 5) {
            console.log(`⚠️ ${hook} appelé ${hookCalls.get(hook)} fois rapidement`);
          }
        }
      }
      
      // Détecter les montages répétés
      if (line.includes('Montage avec id')) {
        console.log(`🏗️ Montage de composant détecté`);
      }
      
      lastLogTime = now;
    },
    
    getStats: () => ({
      renderCounts,
      hookCalls,
      totalRenders: Array.from(renderCounts.values()).reduce((a, b) => a + b, 0),
      totalHookCalls: Array.from(hookCalls.values()).reduce((a, b) => a + b, 0)
    })
  };
}

// Fonction principale
async function runQuickTest() {
  const analyzer = analyzeRealTimeLogs();
  let appProcess = null;
  
  try {
    // Activer les logs de debug
    enableDebugLogs();
    
    console.log('🚀 Lancement de l\'application avec logs de debug...');
    
    // Démarrer l'application
    appProcess = spawn('npm', ['start'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, BROWSER: 'none' }
    });
    
    // Capturer et analyser les logs
    appProcess.stdout.on('data', (data) => {
      const lines = data.toString().split('\\n');
      lines.forEach(line => {
        if (line.trim()) {
          analyzer.processLine(line.trim());
        }
      });
    });
    
    appProcess.stderr.on('data', (data) => {
      const lines = data.toString().split('\\n');
      lines.forEach(line => {
        if (line.trim()) {
          analyzer.processLine(line.trim());
        }
      });
    });
    
    console.log('⏱️ Test en cours (15 secondes)...');
    console.log('💡 Ouvrez http://localhost:3000 et naviguez dans l\'application');
    console.log('🔍 Les re-renders seront affichés en temps réel ci-dessous:\\n');
    
    // Attendre 15 secondes
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    // Arrêter l'application
    if (appProcess && !appProcess.killed) {
      appProcess.kill('SIGTERM');
    }
    
    // Générer le rapport
    const stats = analyzer.getStats();
    
    console.log('\\n📊 RAPPORT RAPIDE');
    console.log('==================');
    
    if (stats.totalRenders === 0) {
      console.log('✅ Aucun re-render excessif détecté');
    } else {
      console.log(`🔄 ${stats.totalRenders} re-renders détectés:`);
      stats.renderCounts.forEach((count, component) => {
        const status = count > 5 ? '❌' : count > 2 ? '⚠️' : '✅';
        console.log(`  ${status} ${component}: ${count}`);
      });
    }
    
    if (stats.totalHookCalls > 50) {
      console.log(`🎣 ${stats.totalHookCalls} appels de hooks (élevé)`);
    } else {
      console.log(`🎣 ${stats.totalHookCalls} appels de hooks (normal)`);
    }
    
    // Score simple
    const score = Math.max(0, 100 - stats.totalRenders * 10 - Math.max(0, stats.totalHookCalls - 20));
    console.log(`\\n🎯 Score: ${score}/100`);
    
    if (score >= 90) {
      console.log('🟢 Application bien optimisée');
    } else if (score >= 70) {
      console.log('🟡 Quelques optimisations possibles');
    } else {
      console.log('🔴 Optimisations nécessaires');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    // Toujours désactiver les logs de debug
    disableDebugLogs();
    
    if (appProcess && !appProcess.killed) {
      appProcess.kill('SIGTERM');
    }
  }
}

// Gestion des signaux
process.on('SIGINT', () => {
  console.log('\\n🛑 Arrêt du test...');
  disableDebugLogs();
  process.exit(0);
});

process.on('exit', () => {
  disableDebugLogs();
});

// Lancer le test
runQuickTest().catch(error => {
  console.error('❌ Erreur fatale:', error);
  disableDebugLogs();
  process.exit(1);
}); 