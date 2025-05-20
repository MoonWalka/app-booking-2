#!/usr/bin/env node

/**
 * Outil d'audit pour les fichiers CSS des pages Paramètres
 * Vérifie l'utilisation des variables CSS standard TourCraft
 * 
 * Exécuter avec: node audit_parameters_css.js
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Couleurs standard TourCraft
const standardVariables = [
  // Text colors
  '--tc-text-color',
  '--tc-text-muted',
  '--tc-gray-700',
  
  // Background colors
  '--tc-bg-color',
  '--tc-gray-100',
  '--tc-hover-bg',
  
  // State colors
  '--tc-primary-color',
  '--tc-primary-dark',
  '--tc-primary-light',
  '--tc-success-color',
  '--tc-success-dark',
  '--tc-success-light',
  '--tc-danger-color',
  '--tc-danger-dark',
  '--tc-danger-light',
  '--tc-warning-color',
  '--tc-warning-dark',
  '--tc-warning-light',
  
  // Border colors
  '--tc-border-color',
];

// Répertoire des fichiers CSS des pages de paramètres
const parametersDir = path.resolve(__dirname, 'src/components/parametres');

// Recherche de tous les fichiers CSS dans le répertoire des paramètres
async function runAudit() {
  try {
    const files = await glob(`${parametersDir}/**/*.css`);
    
    console.log(`\n🔍 Audit des fichiers CSS dans ${parametersDir}\n`);
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Recherche les définitions de couleur (var(--, #, rgb, rgba, hsl, etc.)
      const colorDefinitions = content.match(/(?:color|background|border).*?:.*?(?:var\(--(?!tc-)[^)]+\)|#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\)|hsl[a]?\([^)]+\))/g);
      
      if (colorDefinitions && colorDefinitions.length > 0) {
        console.log(`\n📄 ${path.relative(__dirname, file)}`);
        console.log('   Variables non standard ou couleurs codées en dur détectées:');
        
        colorDefinitions.forEach(def => {
          // Afficher la ligne avec quelques espaces pour la lisibilité
          console.log(`   - ${def.trim()}`);
        });
        
        console.log('\n   ⚠️  Actions recommandées:');
        console.log('   - Remplacer par les variables standard TourCraft');
        console.log('   - Vérifier les états (hover, active, focus)');
      }
    });
    
    console.log('\n✅ Audit terminé.');
    console.log('\nVariables standard recommandées:');
    console.log('-------------------------------');
    standardVariables.forEach(variable => {
      console.log(`var(${variable})`);
    });
  } catch (err) {
    console.error('Erreur lors de la recherche de fichiers:', err);
  }
}

// Exécuter l'audit
runAudit();
