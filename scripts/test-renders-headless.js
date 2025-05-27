#!/usr/bin/env node

/**
 * Script de test des re-renders en mode headless
 * 
 * Ce script lance l'application en arrière-plan et capture
 * tous les logs de console pour analyser les re-renders
 * sans avoir besoin d'ouvrir l'inspecteur.
 */

const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🤖 Test automatisé des re-renders (mode headless)');
console.log('==================================================');

// Configuration
const TEST_DURATION = 20000; // 20 secondes
const APP_URL = 'http://localhost:3000';
const CONCERT_ID = 'con-1747960488398-mwb0vm'; // ID de test

// Compteurs
const renderCounts = new Map();
const hookCalls = new Map();
const componentMounts = new Map();
const consoleErrors = [];
const timelineEvents = [];

let appProcess = null;
let browser = null;
let page = null;

// Fonction pour analyser les logs de console
function analyzeConsoleMessage(msg) {
  const text = msg.text();
  const timestamp = Date.now();
  
  // Détecter les re-renders de why-did-you-render
  if (text.includes('Re-rendered because of hook changes')) {
    const match = text.match(/(\w+)\s+Re-rendered/);
    if (match) {
      const component = match[1];
      renderCounts.set(component, (renderCounts.get(component) || 0) + 1);
      timelineEvents.push({
        type: 'render',
        component,
        timestamp,
        message: text
      });
      console.log(`🔄 Re-render détecté: ${component} (${renderCounts.get(component)})`);
    }
  }
  
  // Détecter les appels de hooks
  if (text.includes('Hook called') || text.includes('INIT:')) {
    const hookMatch = text.match(/(use\w+)/);
    if (hookMatch) {
      const hook = hookMatch[1];
      hookCalls.set(hook, (hookCalls.get(hook) || 0) + 1);
      timelineEvents.push({
        type: 'hook_call',
        hook,
        timestamp,
        message: text
      });
    }
  }
  
  // Détecter les montages de composants
  if (text.includes('Montage avec id') || text.includes('mounted')) {
    const componentMatch = text.match(/(\w+View|\w+List|\w+Form)/);
    if (componentMatch) {
      const component = componentMatch[1];
      componentMounts.set(component, (componentMounts.get(component) || 0) + 1);
      timelineEvents.push({
        type: 'mount',
        component,
        timestamp,
        message: text
      });
      console.log(`🏗️ Montage détecté: ${component} (${componentMounts.get(component)})`);
    }
  }
  
  // Détecter les erreurs
  if (msg.type() === 'error') {
    consoleErrors.push({
      message: text,
      timestamp,
      type: msg.type()
    });
    console.log(`❌ Erreur console: ${text}`);
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
          setTimeout(resolve, 2000); // Attendre 2s pour être sûr
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
    
    // Timeout de sécurité
    setTimeout(() => {
      if (!appReady) {
        console.log('⚠️ Timeout - on continue avec l\'application existante');
        resolve();
      }
    }, 15000);
  });
}

// Fonction pour lancer le navigateur et tester
async function runBrowserTest() {
  console.log('🌐 Lancement du navigateur headless...');
  
  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  page = await browser.newPage();
  
  // Capturer tous les messages de console
  page.on('console', analyzeConsoleMessage);
  
  // Capturer les erreurs de page
  page.on('pageerror', (error) => {
    console.log(`❌ Erreur de page: ${error.message}`);
    consoleErrors.push({
      message: error.message,
      timestamp: Date.now(),
      type: 'pageerror'
    });
  });
  
  console.log('📱 Navigation vers l\'application...');
  
  try {
    // Aller à la page d'accueil
    await page.goto(APP_URL, { waitUntil: 'networkidle0', timeout: 10000 });
    console.log('✅ Page d\'accueil chargée');
    
    // Attendre un peu
    await page.waitForTimeout(2000);
    
    // Naviguer vers la liste des concerts
    console.log('📋 Navigation vers la liste des concerts...');
    await page.goto(`${APP_URL}/concerts`, { waitUntil: 'networkidle0' });
    console.log('✅ Liste des concerts chargée');
    
    // Attendre un peu
    await page.waitForTimeout(3000);
    
    // Naviguer vers un concert spécifique
    console.log('🎵 Navigation vers un concert spécifique...');
    await page.goto(`${APP_URL}/concerts/${CONCERT_ID}`, { waitUntil: 'networkidle0' });
    console.log('✅ Page de concert chargée');
    
    // Attendre et observer
    console.log(`⏱️ Observation pendant ${TEST_DURATION/1000}s...`);
    await page.waitForTimeout(TEST_DURATION);
    
  } catch (error) {
    console.log(`⚠️ Erreur de navigation: ${error.message}`);
  }
}

// Fonction pour générer le rapport
function generateReport() {
  console.log('\n📊 RAPPORT DE TEST AUTOMATISÉ');
  console.log('==============================');
  
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
  
  // Statistiques des hooks
  console.log('\n🎣 Appels de hooks:');
  if (hookCalls.size === 0) {
    console.log('  ✅ Aucun appel de hook excessif détecté');
  } else {
    for (const [hook, count] of hookCalls.entries()) {
      const status = count > 20 ? '❌ EXCESSIF' : count > 10 ? '⚠️ ÉLEVÉ' : '✅ NORMAL';
      console.log(`  ${hook}: ${count} appels ${status}`);
    }
  }
  
  // Statistiques des montages
  console.log('\n🏗️ Montages de composants:');
  if (componentMounts.size === 0) {
    console.log('  ✅ Aucun montage excessif détecté');
  } else {
    for (const [component, count] of componentMounts.entries()) {
      const status = count > 5 ? '❌ PROBLÉMATIQUE' : count > 2 ? '⚠️ ATTENTION' : '✅ NORMAL';
      console.log(`  ${component}: ${count} montages ${status}`);
    }
  }
  
  // Erreurs
  console.log('\n❌ Erreurs détectées:');
  if (consoleErrors.length === 0) {
    console.log('  ✅ Aucune erreur détectée');
  } else {
    consoleErrors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.message}`);
    });
  }
  
  // Score global
  const totalIssues = 
    Array.from(renderCounts.values()).filter(count => count > 10).length +
    Array.from(hookCalls.values()).filter(count => count > 20).length +
    Array.from(componentMounts.values()).filter(count => count > 5).length +
    consoleErrors.length;
  
  console.log('\n🎯 SCORE GLOBAL:');
  if (totalIssues === 0) {
    console.log('  🟢 EXCELLENT - Application parfaitement optimisée');
  } else if (totalIssues <= 2) {
    console.log('  🟡 BON - Quelques optimisations possibles');
  } else {
    console.log('  🔴 PROBLÉMATIQUE - Optimisations nécessaires');
  }
  
  console.log(`\n📈 Résumé: ${totalIssues} problème(s) détecté(s)`);
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
    
    // Lancer le test du navigateur
    await runBrowserTest();
    
    // Générer le rapport
    generateReport();
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
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