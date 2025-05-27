#!/usr/bin/env node

/**
 * Script de test pour vérifier les corrections des boucles de re-renders
 * 
 * Ce script lance l'application en mode test et surveille les re-renders
 * pour s'assurer que les corrections appliquées sont efficaces.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Test des corrections des boucles de re-renders');
console.log('================================================');

// Configuration du test
const TEST_DURATION = 30000; // 30 secondes
const MAX_RENDERS_PER_COMPONENT = 10; // Seuil d'alerte

// Compteurs de renders
const renderCounts = new Map();
let testStartTime = Date.now();

// Fonction pour analyser les logs de renders
function analyzeRenderLogs(logLine) {
  // Rechercher les patterns de comptage de renders
  const renderPatterns = [
    /🎨 \[ARTISTES\] useArtistesList render: (\d+)/,
    /🧪 \[TEST\] TestArtistesList render: (\d+)/,
    /🔄 \[GENERIC\] useGenericEntityList render: (\d+)/,
    /📊 \[DATA\] useGenericDataFetcher render: (\d+)/
  ];

  renderPatterns.forEach(pattern => {
    const match = logLine.match(pattern);
    if (match) {
      const componentName = pattern.source.match(/\[([^\]]+)\]/)[1];
      const renderCount = parseInt(match[1]);
      
      if (!renderCounts.has(componentName)) {
        renderCounts.set(componentName, []);
      }
      
      renderCounts.get(componentName).push({
        count: renderCount,
        timestamp: Date.now() - testStartTime
      });
    }
  });
}

// Fonction pour générer le rapport
function generateReport() {
  console.log('\n📊 RAPPORT DES RE-RENDERS');
  console.log('==========================');
  
  let hasIssues = false;
  
  renderCounts.forEach((renders, componentName) => {
    const maxRenders = Math.max(...renders.map(r => r.count));
    const totalRenders = renders.length;
    const avgInterval = totalRenders > 1 ? 
      (renders[renders.length - 1].timestamp - renders[0].timestamp) / (totalRenders - 1) : 0;
    
    console.log(`\n🔍 ${componentName}:`);
    console.log(`   - Renders maximum: ${maxRenders}`);
    console.log(`   - Total d'événements: ${totalRenders}`);
    console.log(`   - Intervalle moyen: ${avgInterval.toFixed(2)}ms`);
    
    if (maxRenders > MAX_RENDERS_PER_COMPONENT) {
      console.log(`   ⚠️  ALERTE: Trop de re-renders (${maxRenders} > ${MAX_RENDERS_PER_COMPONENT})`);
      hasIssues = true;
    } else {
      console.log(`   ✅ Nombre de re-renders acceptable`);
    }
    
    // Détecter les boucles infinies (renders très rapprochés)
    if (totalRenders > 5) {
      const recentRenders = renders.slice(-5);
      const timeSpan = recentRenders[4].timestamp - recentRenders[0].timestamp;
      if (timeSpan < 1000) { // 5 renders en moins d'1 seconde
        console.log(`   🚨 BOUCLE POTENTIELLE: 5 renders en ${timeSpan}ms`);
        hasIssues = true;
      }
    }
  });
  
  console.log('\n' + '='.repeat(50));
  
  if (hasIssues) {
    console.log('❌ DES PROBLÈMES DE PERFORMANCE ONT ÉTÉ DÉTECTÉS');
    console.log('\nRecommandations:');
    console.log('- Vérifier les dépendances des hooks useEffect et useCallback');
    console.log('- Stabiliser les objets et fonctions passés en props');
    console.log('- Utiliser React.memo pour les composants qui re-rendent souvent');
    console.log('- Vérifier les transformations de données dans les hooks');
    return false;
  } else {
    console.log('✅ AUCUN PROBLÈME DE PERFORMANCE DÉTECTÉ');
    console.log('\nLes corrections appliquées semblent efficaces !');
    return true;
  }
}

// Fonction pour créer un fichier de test temporaire
function createTestFile() {
  const testContent = `
import React from 'react';
import ReactDOM from 'react-dom/client';
import TestArtistesList from './src/components/TestArtistesList';

// Configuration pour les tests
window.REACT_APP_TEST_MODE = true;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TestArtistesList />);
`;

  const testPath = path.join(__dirname, '..', 'src', 'test-renders.js');
  fs.writeFileSync(testPath, testContent);
  return testPath;
}

// Fonction principale de test
async function runTest() {
  console.log('🚀 Démarrage du test...');
  
  // Créer le fichier de test
  const testFilePath = createTestFile();
  
  try {
    // Lancer l'application en mode développement
    const child = spawn('npm', ['start'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        REACT_APP_TEST_MODE: 'true',
        NODE_ENV: 'development'
      }
    });
    
    console.log('⏳ Application en cours de démarrage...');
    
    let appStarted = false;
    
    // Écouter les logs de l'application
    child.stdout.on('data', (data) => {
      const output = data.toString();
      
      if (output.includes('webpack compiled') || output.includes('Local:')) {
        if (!appStarted) {
          appStarted = true;
          console.log('✅ Application démarrée, début du monitoring...');
          testStartTime = Date.now();
          
          // Programmer l'arrêt du test
          setTimeout(() => {
            console.log('\n⏰ Fin du test, génération du rapport...');
            child.kill('SIGTERM');
          }, TEST_DURATION);
        }
      }
      
      // Analyser les logs pour détecter les renders
      output.split('\n').forEach(line => {
        if (appStarted && line.trim()) {
          analyzeRenderLogs(line);
        }
      });
    });
    
    child.stderr.on('data', (data) => {
      const output = data.toString();
      
      // Analyser aussi les erreurs pour les renders
      output.split('\n').forEach(line => {
        if (appStarted && line.trim()) {
          analyzeRenderLogs(line);
        }
      });
    });
    
    child.on('close', (code) => {
      console.log(`\n🏁 Test terminé (code: ${code})`);
      
      // Nettoyer le fichier de test
      try {
        fs.unlinkSync(testFilePath);
      } catch (err) {
        // Ignorer les erreurs de nettoyage
      }
      
      // Générer le rapport final
      const success = generateReport();
      
      process.exit(success ? 0 : 1);
    });
    
    // Gérer l'interruption du script
    process.on('SIGINT', () => {
      console.log('\n🛑 Test interrompu par l\'utilisateur');
      child.kill('SIGTERM');
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    
    // Nettoyer le fichier de test
    try {
      fs.unlinkSync(testFilePath);
    } catch (err) {
      // Ignorer les erreurs de nettoyage
    }
    
    process.exit(1);
  }
}

// Vérifications préliminaires
console.log('🔍 Vérifications préliminaires...');

// Vérifier que les fichiers corrigés existent
const filesToCheck = [
  'src/hooks/artistes/useArtistesList.js',
  'src/hooks/generics/lists/useGenericEntityList.js',
  'src/hooks/generics/data/useGenericDataFetcher.js',
  'src/components/TestArtistesList.js'
];

let allFilesExist = true;
filesToCheck.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Fichier manquant: ${file}`);
    allFilesExist = false;
  } else {
    console.log(`✅ ${file}`);
  }
});

if (!allFilesExist) {
  console.error('\n❌ Des fichiers requis sont manquants. Veuillez appliquer toutes les corrections d\'abord.');
  process.exit(1);
}

console.log('\n✅ Tous les fichiers requis sont présents');

// Lancer le test
runTest().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});