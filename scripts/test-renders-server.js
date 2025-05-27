#!/usr/bin/env node

/**
 * Script de test des re-renders via capture des logs serveur
 * 
 * Ce script lance l'application et capture tous les logs
 * du serveur de développement pour analyser les re-renders
 * directement dans le terminal.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📡 Test des re-renders via logs serveur');
console.log('=======================================');

// Configuration
const TEST_DURATION = 30000; // 30 secondes
const LOG_FILE = path.join(__dirname, '..', 'render-analysis.log');

// Compteurs
const renderCounts = new Map();
const hookCalls = new Map();
const componentMounts = new Map();
const errors = [];
const warnings = [];

let appProcess = null;
let testStartTime = Date.now();

// Fonction pour analyser une ligne de log
function analyzeLogLine(line, source = 'stdout') {
  const timestamp = Date.now() - testStartTime;
  
  // Sauvegarder dans le fichier de log
  fs.appendFileSync(LOG_FILE, `[${source}] ${line}\n`);
  
  // Détecter les re-renders de why-did-you-render
  if (line.includes('Re-rendered because of hook changes')) {
    const match = line.match(/(\w+)\s+Re-rendered/);
    if (match) {
      const component = match[1];
      renderCounts.set(component, (renderCounts.get(component) || 0) + 1);
      console.log(`🔄 [${(timestamp/1000).toFixed(1)}s] Re-render: ${component} (${renderCounts.get(component)})`);
    }
  }
  
  // Détecter les appels de hooks
  if (line.includes('Hook called') || line.includes('INIT:')) {
    const hookMatch = line.match(/(use\w+)/);
    if (hookMatch) {
      const hook = hookMatch[1];
      hookCalls.set(hook, (hookCalls.get(hook) || 0) + 1);
      if (hookCalls.get(hook) % 5 === 0) { // Afficher tous les 5 appels
        console.log(`🎣 [${(timestamp/1000).toFixed(1)}s] Hook: ${hook} (${hookCalls.get(hook)} appels)`);
      }
    }
  }
  
  // Détecter les montages de composants
  if (line.includes('Montage avec id') || line.includes('mounted')) {
    const componentMatch = line.match(/(\w+View|\w+List|\w+Form)/);
    if (componentMatch) {
      const component = componentMatch[1];
      componentMounts.set(component, (componentMounts.get(component) || 0) + 1);
      console.log(`🏗️ [${(timestamp/1000).toFixed(1)}s] Montage: ${component} (${componentMounts.get(component)})`);
    }
  }
  
  // Détecter les erreurs
  if (line.includes('Error:') || line.includes('ERROR') || line.includes('Failed')) {
    errors.push({
      message: line,
      timestamp,
      source
    });
    console.log(`❌ [${(timestamp/1000).toFixed(1)}s] Erreur: ${line.substring(0, 100)}...`);
  }
  
  // Détecter les warnings
  if (line.includes('Warning:') || line.includes('WARN')) {
    warnings.push({
      message: line,
      timestamp,
      source
    });
    console.log(`⚠️ [${(timestamp/1000).toFixed(1)}s] Warning: ${line.substring(0, 100)}...`);
  }
  
  // Détecter les compilations
  if (line.includes('webpack compiled') || line.includes('Compiled successfully')) {
    console.log(`✅ [${(timestamp/1000).toFixed(1)}s] Compilation réussie`);
  }
  
  // Détecter les hot reloads
  if (line.includes('Hot Module Replacement') || line.includes('HMR')) {
    console.log(`🔥 [${(timestamp/1000).toFixed(1)}s] Hot reload détecté`);
  }
}

// Fonction pour générer le rapport final
function generateReport() {
  console.log('\n📊 RAPPORT D\'ANALYSE DES LOGS');
  console.log('==============================');
  
  const totalTime = (Date.now() - testStartTime) / 1000;
  console.log(`⏱️ Durée du test: ${totalTime.toFixed(1)}s`);
  
  // Statistiques des re-renders
  console.log('\n🔄 Re-renders détectés:');
  if (renderCounts.size === 0) {
    console.log('  ✅ Aucun re-render détecté');
  } else {
    const sortedRenders = Array.from(renderCounts.entries())
      .sort((a, b) => b[1] - a[1]);
    
    sortedRenders.forEach(([component, count]) => {
      const rate = (count / totalTime).toFixed(1);
      const status = count > 10 ? '❌ PROBLÉMATIQUE' : count > 5 ? '⚠️ ATTENTION' : '✅ NORMAL';
      console.log(`  ${component}: ${count} re-renders (${rate}/s) ${status}`);
    });
  }
  
  // Statistiques des hooks
  console.log('\n🎣 Appels de hooks:');
  if (hookCalls.size === 0) {
    console.log('  ✅ Aucun appel de hook détecté');
  } else {
    const sortedHooks = Array.from(hookCalls.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // Top 10
    
    sortedHooks.forEach(([hook, count]) => {
      const rate = (count / totalTime).toFixed(1);
      const status = count > 50 ? '❌ EXCESSIF' : count > 20 ? '⚠️ ÉLEVÉ' : '✅ NORMAL';
      console.log(`  ${hook}: ${count} appels (${rate}/s) ${status}`);
    });
  }
  
  // Statistiques des montages
  console.log('\n🏗️ Montages de composants:');
  if (componentMounts.size === 0) {
    console.log('  ✅ Aucun montage détecté');
  } else {
    const sortedMounts = Array.from(componentMounts.entries())
      .sort((a, b) => b[1] - a[1]);
    
    sortedMounts.forEach(([component, count]) => {
      const rate = (count / totalTime).toFixed(1);
      const status = count > 5 ? '❌ PROBLÉMATIQUE' : count > 2 ? '⚠️ ATTENTION' : '✅ NORMAL';
      console.log(`  ${component}: ${count} montages (${rate}/s) ${status}`);
    });
  }
  
  // Erreurs et warnings
  console.log('\n❌ Erreurs:');
  if (errors.length === 0) {
    console.log('  ✅ Aucune erreur détectée');
  } else {
    console.log(`  🔴 ${errors.length} erreur(s) détectée(s)`);
    errors.slice(0, 5).forEach((error, index) => {
      console.log(`    ${index + 1}. ${error.message.substring(0, 80)}...`);
    });
  }
  
  console.log('\n⚠️ Warnings:');
  if (warnings.length === 0) {
    console.log('  ✅ Aucun warning détecté');
  } else {
    console.log(`  🟡 ${warnings.length} warning(s) détecté(s)`);
  }
  
  // Score de performance
  const totalIssues = 
    Array.from(renderCounts.values()).filter(count => count > 10).length +
    Array.from(hookCalls.values()).filter(count => count > 50).length +
    Array.from(componentMounts.values()).filter(count => count > 5).length +
    errors.length;
  
  console.log('\n🎯 ÉVALUATION GLOBALE:');
  if (totalIssues === 0) {
    console.log('  🟢 EXCELLENT - Aucun problème de performance détecté');
  } else if (totalIssues <= 2) {
    console.log('  🟡 BON - Quelques optimisations mineures possibles');
  } else if (totalIssues <= 5) {
    console.log('  🟠 MOYEN - Optimisations recommandées');
  } else {
    console.log('  🔴 PROBLÉMATIQUE - Optimisations urgentes nécessaires');
  }
  
  console.log(`\n📈 Score: ${Math.max(0, 100 - totalIssues * 10)}/100`);
  console.log(`📄 Log complet sauvé dans: ${LOG_FILE}`);
}

// Fonction principale
async function runTest() {
  console.log('🚀 Démarrage du test...');
  
  // Supprimer l'ancien fichier de log
  if (fs.existsSync(LOG_FILE)) {
    fs.unlinkSync(LOG_FILE);
  }
  
  // Créer le fichier de log
  fs.writeFileSync(LOG_FILE, `Test démarré à ${new Date().toISOString()}\n`);
  
  console.log('📱 Lancement de l\'application...');
  
  // Démarrer l'application
  appProcess = spawn('npm', ['start'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, BROWSER: 'none' }
  });
  
  // Capturer stdout
  appProcess.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        analyzeLogLine(line.trim(), 'stdout');
      }
    });
  });
  
  // Capturer stderr
  appProcess.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        analyzeLogLine(line.trim(), 'stderr');
      }
    });
  });
  
  // Gérer la fin du processus
  appProcess.on('close', (code) => {
    console.log(`\n📱 Application fermée avec le code: ${code}`);
  });
  
  console.log(`⏱️ Test en cours pendant ${TEST_DURATION/1000}s...`);
  console.log('💡 Naviguez dans votre application pour générer des événements');
  console.log('🔍 Les re-renders et événements seront affichés en temps réel\n');
  
  // Attendre la fin du test
  await new Promise(resolve => setTimeout(resolve, TEST_DURATION));
  
  // Arrêter l'application
  if (appProcess && !appProcess.killed) {
    console.log('\n🛑 Arrêt de l\'application...');
    appProcess.kill('SIGTERM');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Générer le rapport
  generateReport();
}

// Gestion des signaux
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du test...');
  if (appProcess && !appProcess.killed) {
    appProcess.kill('SIGTERM');
  }
  generateReport();
  process.exit(0);
});

// Lancer le test
runTest().catch(error => {
  console.error('❌ Erreur lors du test:', error);
  if (appProcess && !appProcess.killed) {
    appProcess.kill('SIGTERM');
  }
  process.exit(1);
}); 