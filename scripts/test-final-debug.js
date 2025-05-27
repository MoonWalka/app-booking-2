#!/usr/bin/env node

/**
 * Script de test final pour analyser les boucles de re-renders
 * 
 * Ce script lance l'application et analyse les logs de debug
 * pour identifier les causes exactes des re-renders persistants.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Analyse finale des boucles de re-renders');
console.log('============================================');

// Configuration du test
const TEST_DURATION = 30000; // 30 secondes
const LOG_FILE = path.join(__dirname, '..', 'debug-logs.txt');

// Compteurs et analyseurs
const renderCounts = new Map();
const hookCalls = new Map();
const stateChanges = new Map();
const timelineEvents = [];

let testStartTime = Date.now();
let appProcess = null;

// Fonction pour analyser une ligne de log
function analyzeLogLine(line) {
  const timestamp = Date.now() - testStartTime;
  
  // Détecter les re-renders de why-did-you-render
  if (line.includes('Re-rendered because of hook changes')) {
    const match = line.match(/(\w+)\s+Re-rendered/);
    if (match) {
      const component = match[1];
      renderCounts.set(component, (renderCounts.get(component) || 0) + 1);
      timelineEvents.push({
        type: 'render',
        component,
        timestamp,
        reason: 'hook changes'
      });
    }
  }
  
  // Détecter les appels de hooks
  if (line.includes('[DEBUG][useGenericEntityDetails] Hook called')) {
    const match = line.match(/entityType:\s*"?([^",]+)"?/);
    if (match) {
      const entityType = match[1];
      hookCalls.set(`useGenericEntityDetails-${entityType}`, 
        (hookCalls.get(`useGenericEntityDetails-${entityType}`) || 0) + 1);
      timelineEvents.push({
        type: 'hook_call',
        hook: 'useGenericEntityDetails',
        entityType,
        timestamp
      });
    }
  }
  
  if (line.includes('[DEBUG][useConcertDetails] Hook called')) {
    hookCalls.set('useConcertDetails', (hookCalls.get('useConcertDetails') || 0) + 1);
    timelineEvents.push({
      type: 'hook_call',
      hook: 'useConcertDetails',
      timestamp
    });
  }
  
  // Détecter les changements d'état
  if (line.includes('[DEBUG][useGenericEntityDetails] State changed')) {
    const match = line.match(/hasEntity:\s*(\w+),\s*loading:\s*(\w+)/);
    if (match) {
      const hasEntity = match[1];
      const loading = match[2];
      const stateKey = `entity:${hasEntity}-loading:${loading}`;
      stateChanges.set(stateKey, (stateChanges.get(stateKey) || 0) + 1);
      timelineEvents.push({
        type: 'state_change',
        hasEntity,
        loading,
        timestamp
      });
    }
  }
  
  // Détecter les montages de composants
  if (line.includes('[DEBUG][ConcertView] Montage avec id')) {
    timelineEvents.push({
      type: 'component_mount',
      component: 'ConcertView',
      timestamp
    });
  }
}

// Fonction pour générer le rapport d'analyse
function generateReport() {
  console.log('\n📊 RAPPORT D\'ANALYSE FINALE');
  console.log('============================');
  
  // Statistiques des re-renders
  console.log('\n🔄 Re-renders détectés:');
  if (renderCounts.size === 0) {
    console.log('  ✅ Aucun re-render excessif détecté');
  } else {
    for (const [component, count] of renderCounts.entries()) {
      const status = count > 10 ? '❌ PROBLÉMATIQUE' : count > 5 ? '⚠️ ATTENTION' : '✅ NORMAL';
      console.log(`  ${component}: ${count} re-renders ${status}`);
    }
  }
  
  // Statistiques des appels de hooks
  console.log('\n🎣 Appels de hooks:');
  for (const [hook, count] of hookCalls.entries()) {
    const status = count > 20 ? '❌ EXCESSIF' : count > 10 ? '⚠️ ÉLEVÉ' : '✅ NORMAL';
    console.log(`  ${hook}: ${count} appels ${status}`);
  }
  
  // Analyse de la timeline
  console.log('\n⏱️ Analyse temporelle:');
  const recentEvents = timelineEvents.slice(-10);
  recentEvents.forEach(event => {
    const time = (event.timestamp / 1000).toFixed(1);
    switch (event.type) {
      case 'render':
        console.log(`  ${time}s: 🔄 ${event.component} re-rendered (${event.reason})`);
        break;
      case 'hook_call':
        console.log(`  ${time}s: 🎣 ${event.hook} called${event.entityType ? ` (${event.entityType})` : ''}`);
        break;
      case 'state_change':
        console.log(`  ${time}s: 📊 State: entity=${event.hasEntity}, loading=${event.loading}`);
        break;
      case 'component_mount':
        console.log(`  ${time}s: 🏗️ ${event.component} mounted`);
        break;
    }
  });
  
  // Détection de patterns problématiques
  console.log('\n🔍 Patterns détectés:');
  
  // Vérifier les boucles de montage/démontage
  const mountEvents = timelineEvents.filter(e => e.type === 'component_mount');
  if (mountEvents.length > 5) {
    console.log('  ❌ PROBLÈME: Montages répétés de composants détectés');
    console.log(`     ${mountEvents.length} montages en ${TEST_DURATION/1000}s`);
  }
  
  // Vérifier les appels de hooks excessifs
  const hookCallEvents = timelineEvents.filter(e => e.type === 'hook_call');
  if (hookCallEvents.length > 50) {
    console.log('  ❌ PROBLÈME: Appels de hooks excessifs détectés');
    console.log(`     ${hookCallEvents.length} appels en ${TEST_DURATION/1000}s`);
  }
  
  // Recommandations
  console.log('\n💡 Recommandations:');
  
  if (renderCounts.size === 0 && hookCalls.size < 5) {
    console.log('  ✅ Application stable - pas de problèmes de performance détectés');
  } else {
    if (Array.from(renderCounts.values()).some(count => count > 10)) {
      console.log('  🔧 Stabiliser les dépendances des hooks problématiques');
    }
    if (Array.from(hookCalls.values()).some(count => count > 20)) {
      console.log('  🔧 Optimiser les conditions d\'appel des hooks');
    }
    if (mountEvents.length > 5) {
      console.log('  🔧 Vérifier la navigation et les conditions de montage');
    }
  }
  
  console.log('\n🎯 Test terminé');
}

// Fonction principale
async function runTest() {
  console.log('🚀 Démarrage de l\'application...');
  
  // Supprimer l'ancien fichier de log s'il existe
  if (fs.existsSync(LOG_FILE)) {
    fs.unlinkSync(LOG_FILE);
  }
  
  // Démarrer l'application
  appProcess = spawn('npm', ['start'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, BROWSER: 'none' }
  });
  
  // Capturer les logs
  appProcess.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        analyzeLogLine(line);
        fs.appendFileSync(LOG_FILE, line + '\n');
      }
    });
  });
  
  appProcess.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        analyzeLogLine(line);
        fs.appendFileSync(LOG_FILE, line + '\n');
      }
    });
  });
  
  console.log(`⏱️ Test en cours (${TEST_DURATION/1000}s)...`);
  
  // Attendre la fin du test
  await new Promise(resolve => setTimeout(resolve, TEST_DURATION));
  
  // Arrêter l'application
  if (appProcess) {
    appProcess.kill('SIGTERM');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Générer le rapport
  generateReport();
}

// Gestion des signaux pour nettoyer proprement
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du test...');
  if (appProcess) {
    appProcess.kill('SIGTERM');
  }
  generateReport();
  process.exit(0);
});

// Lancer le test
runTest().catch(error => {
  console.error('❌ Erreur lors du test:', error);
  if (appProcess) {
    appProcess.kill('SIGTERM');
  }
  process.exit(1);
}); 