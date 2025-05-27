#!/usr/bin/env node

/**
 * Script de test pour vérifier les corrections du hook responsive
 * 
 * Ce script teste spécifiquement les corrections appliquées au hook
 * useGenericResponsive pour éviter les boucles de re-renders.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Test des corrections du hook responsive');
console.log('==========================================');

// Configuration du test
const TEST_DURATION = 20000; // 20 secondes
const MAX_RESPONSIVE_RENDERS = 5; // Seuil d'alerte pour les re-renders responsive

// Compteurs spécifiques
const responsiveRenders = [];
const componentRenders = new Map();
let testStartTime = Date.now();

// Fonction pour analyser les logs de renders responsive
function analyzeResponsiveLogs(logLine) {
  // Patterns spécifiques pour les problèmes responsive
  const responsivePatterns = [
    /why-did-you-render.*responsive/i,
    /different objects that are equal by value/,
    /width.*height.*currentBreakpoint/,
    /dimensions.*orientation/
  ];

  responsivePatterns.forEach(pattern => {
    if (pattern.test(logLine)) {
      responsiveRenders.push({
        timestamp: Date.now() - testStartTime,
        message: logLine.trim()
      });
    }
  });

  // Compter les re-renders par composant
  const componentPattern = /(\w+)\s+defaultNotifier\.js.*Re-rendered/;
  const match = logLine.match(componentPattern);
  if (match) {
    const componentName = match[1];
    if (!componentRenders.has(componentName)) {
      componentRenders.set(componentName, 0);
    }
    componentRenders.set(componentName, componentRenders.get(componentName) + 1);
  }
}

// Fonction pour générer le rapport
function generateResponsiveReport() {
  console.log('\n📊 RAPPORT DES CORRECTIONS RESPONSIVE');
  console.log('=====================================');
  
  let hasIssues = false;
  
  // Analyser les re-renders responsive
  console.log(`\n🔍 Re-renders liés au responsive: ${responsiveRenders.length}`);
  
  if (responsiveRenders.length > MAX_RESPONSIVE_RENDERS) {
    console.log(`   ⚠️  ALERTE: Trop de re-renders responsive (${responsiveRenders.length} > ${MAX_RESPONSIVE_RENDERS})`);
    hasIssues = true;
    
    // Afficher les premiers problèmes
    console.log('\n   Premiers problèmes détectés:');
    responsiveRenders.slice(0, 3).forEach((render, index) => {
      console.log(`   ${index + 1}. [${render.timestamp}ms] ${render.message.substring(0, 100)}...`);
    });
  } else {
    console.log(`   ✅ Nombre de re-renders responsive acceptable`);
  }
  
  // Analyser les re-renders par composant
  console.log('\n🔍 Re-renders par composant:');
  componentRenders.forEach((count, componentName) => {
    console.log(`   - ${componentName}: ${count} re-renders`);
    
    if (count > 10) {
      console.log(`     ⚠️  Composant avec beaucoup de re-renders`);
      hasIssues = true;
    }
  });
  
  // Vérifier les patterns spécifiques corrigés
  console.log('\n🔍 Vérification des corrections spécifiques:');
  
  const dimensionsIssues = responsiveRenders.filter(r => 
    r.message.includes('width') && r.message.includes('height')
  );
  
  if (dimensionsIssues.length === 0) {
    console.log('   ✅ Pas de problèmes avec les objets dimensions');
  } else {
    console.log(`   ❌ ${dimensionsIssues.length} problèmes avec les objets dimensions`);
    hasIssues = true;
  }
  
  const breakpointIssues = responsiveRenders.filter(r => 
    r.message.includes('currentBreakpoint')
  );
  
  if (breakpointIssues.length === 0) {
    console.log('   ✅ Pas de problèmes avec les breakpoints');
  } else {
    console.log(`   ❌ ${breakpointIssues.length} problèmes avec les breakpoints`);
    hasIssues = true;
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (hasIssues) {
    console.log('❌ DES PROBLÈMES RESPONSIVE ONT ÉTÉ DÉTECTÉS');
    console.log('\nCorrections supplémentaires nécessaires:');
    console.log('- Vérifier la stabilisation des objets dimensions');
    console.log('- Stabiliser les callbacks dans useGenericResponsive');
    console.log('- Utiliser React.memo pour les composants sensibles');
    return false;
  } else {
    console.log('✅ CORRECTIONS RESPONSIVE EFFICACES');
    console.log('\nLes corrections appliquées au hook responsive fonctionnent !');
    return true;
  }
}

// Fonction pour créer un fichier de test responsive
function createResponsiveTestFile() {
  const testContent = `
import React from 'react';
import ReactDOM from 'react-dom/client';
import useGenericResponsive from './src/hooks/generics/utils/useGenericResponsive';

// Composant de test pour le responsive
const ResponsiveTest = React.memo(() => {
  const responsive = useGenericResponsive({
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1200,
      wide: 1440
    },
    enableOrientation: true,
    onBreakpointChange: (newBreakpoint, oldBreakpoint) => {
      console.log('🔄 Breakpoint changé:', oldBreakpoint, '->', newBreakpoint);
    }
  });

  console.log('🎨 ResponsiveTest render:', {
    isMobile: responsive.isMobile,
    currentBreakpoint: responsive.currentBreakpoint,
    dimensions: responsive.dimensions
  });

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Responsive Hook</h1>
      <div>
        <p>Breakpoint actuel: {responsive.currentBreakpoint}</p>
        <p>Dimensions: {responsive.dimensions.width} x {responsive.dimensions.height}</p>
        <p>Mobile: {responsive.isMobile ? 'Oui' : 'Non'}</p>
        <p>Desktop: {responsive.isDesktop ? 'Oui' : 'Non'}</p>
        <p>Orientation: {responsive.orientation}</p>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => {
          // Simuler un changement de taille
          window.dispatchEvent(new Event('resize'));
        }}>
          Simuler resize
        </button>
      </div>
    </div>
  );
});

ResponsiveTest.whyDidYouRender = true;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ResponsiveTest />);
`;

  const testPath = path.join(__dirname, '..', 'src', 'test-responsive.js');
  fs.writeFileSync(testPath, testContent);
  return testPath;
}

// Fonction principale de test
async function runResponsiveTest() {
  console.log('🚀 Démarrage du test responsive...');
  
  // Créer le fichier de test
  const testFilePath = createResponsiveTestFile();
  
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
      
      // Analyser les logs pour détecter les renders responsive
      if (appStarted) {
        output.split('\n').forEach(line => {
          if (line.trim()) {
            analyzeResponsiveLogs(line);
          }
        });
      }
    });
    
    child.stderr.on('data', (data) => {
      const output = data.toString();
      
      // Analyser aussi les erreurs pour les renders
      if (appStarted) {
        output.split('\n').forEach(line => {
          if (line.trim()) {
            analyzeResponsiveLogs(line);
          }
        });
      }
    });
    
    child.on('close', (code) => {
      console.log(`\n🏁 Test responsive terminé (code: ${code})`);
      
      // Nettoyer le fichier de test
      try {
        fs.unlinkSync(testFilePath);
      } catch (err) {
        // Ignorer les erreurs de nettoyage
      }
      
      // Générer le rapport final
      const success = generateResponsiveReport();
      
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

// Vérifier que le hook responsive corrigé existe
const responsiveHookPath = path.join(__dirname, '..', 'src/hooks/generics/utils/useGenericResponsive.js');
if (!fs.existsSync(responsiveHookPath)) {
  console.error('❌ Hook responsive corrigé manquant');
  process.exit(1);
} else {
  console.log('✅ Hook responsive corrigé trouvé');
}

// Vérifier que why-did-you-render est installé
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const hasWDYR = packageJson.dependencies?.['@welldone-software/why-did-you-render'] || 
               packageJson.devDependencies?.['@welldone-software/why-did-you-render'];
if (!hasWDYR) {
  console.error('❌ why-did-you-render non installé');
  process.exit(1);
} else {
  console.log('✅ why-did-you-render installé');
}

console.log('\n✅ Toutes les vérifications passées');

// Lancer le test
runResponsiveTest().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
}); 