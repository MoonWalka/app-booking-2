#!/usr/bin/env node

/**
 * Script pour vérifier qu'il n'y a plus de création de structures imbriquées
 * contact: {} ou structure: {} dans le code
 */

const fs = require('fs');
const path = require('path');

// Chemins à exclure
const excludePaths = [
  'node_modules',
  '.git',
  'build',
  'dist',
  '.next',
  'coverage',
  'scripts/check-nested-structures.js', // Exclure ce script lui-même
  'scripts/fix-nested-contacts.js', // Script de correction
  'backups' // Dossier de sauvegardes
];

// Patterns à rechercher qui indiquent une création de structure imbriquée
const dangerousPatterns = [
  // Création directe d'objets imbriqués
  /contact:\s*\{[^}]*\}/g,
  /structure:\s*\{[^}]*\}/g,
  // Assignations qui créent des structures imbriquées
  /\.contact\s*=\s*\{/g,
  /\.structure\s*=\s*\{/g,
  // Spread avec création d'objet imbriqué
  /contact:\s*\{[\s\S]*?\.\.\..*?\}/g,
  /structure:\s*\{[\s\S]*?\.\.\..*?\}/g
];

// Patterns à ignorer (faux positifs)
const safePatterns = [
  // Configurations de relations
  /relations:\s*\{[\s\S]*?contact:\s*\{/,
  /relations:\s*\{[\s\S]*?structure:\s*\{/,
  // Définitions de types/schemas
  /type:\s*['"]contact['"]/,
  /type:\s*['"]structure['"]/,
  // Commentaires
  /\/\/.*contact:\s*\{/,
  /\/\*[\s\S]*?contact:\s*\{[\s\S]*?\*\//,
  // Strings
  /['"`].*contact:\s*\{.*['"`]/
];

const results = [];

/**
 * Vérifie si un chemin doit être exclu
 */
function shouldExclude(filePath) {
  return excludePaths.some(exclude => filePath.includes(exclude));
}

/**
 * Vérifie si une ligne est un faux positif
 */
function isSafePattern(content, match) {
  // Vérifier si le match est dans un contexte sûr
  const startIndex = match.index;
  const lineStart = content.lastIndexOf('\n', startIndex) + 1;
  const lineEnd = content.indexOf('\n', startIndex);
  const line = content.substring(lineStart, lineEnd > -1 ? lineEnd : content.length);
  
  // Vérifier les patterns sûrs
  return safePatterns.some(pattern => pattern.test(line));
}

/**
 * Analyse un fichier JavaScript
 */
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.relative(process.cwd(), filePath);
    const issues = [];
    
    dangerousPatterns.forEach(pattern => {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match;
      
      while ((match = regex.exec(content)) !== null) {
        if (!isSafePattern(content, match)) {
          const lineNumber = content.substring(0, match.index).split('\n').length;
          const lineStart = content.lastIndexOf('\n', match.index) + 1;
          const lineEnd = content.indexOf('\n', match.index);
          const line = content.substring(lineStart, lineEnd > -1 ? lineEnd : content.length).trim();
          
          issues.push({
            line: lineNumber,
            code: line,
            pattern: pattern.source
          });
        }
      }
    });
    
    if (issues.length > 0) {
      results.push({
        file: fileName,
        issues
      });
    }
  } catch (error) {
    console.error(`Erreur lors de l'analyse de ${filePath}:`, error.message);
  }
}

/**
 * Parcourt récursivement les dossiers
 */
function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    
    if (shouldExclude(filePath)) {
      return;
    }
    
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDirectory(filePath);
    } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.jsx'))) {
      analyzeFile(filePath);
    }
  });
}

// Début de l'analyse
console.log('🔍 Recherche de structures imbriquées contact: {} et structure: {}...\n');

const srcPath = path.join(process.cwd(), 'src');
if (fs.existsSync(srcPath)) {
  walkDirectory(srcPath);
} else {
  console.error('❌ Le dossier src n\'existe pas');
  process.exit(1);
}

// Affichage des résultats
if (results.length === 0) {
  console.log('✅ Aucune structure imbriquée trouvée !');
  console.log('   Toutes les données sont maintenant plates avec préfixes.');
} else {
  console.log(`❌ ${results.length} fichier(s) contiennent encore des structures imbriquées:\n`);
  
  results.forEach(result => {
    console.log(`📄 ${result.file}`);
    result.issues.forEach(issue => {
      console.log(`   Ligne ${issue.line}: ${issue.code}`);
      console.log(`   Pattern détecté: ${issue.pattern}\n`);
    });
  });
  
  console.log('\n💡 Solutions recommandées:');
  console.log('   1. Remplacer contact: { ... } par des champs plats: nom, prenom, email, etc.');
  console.log('   2. Remplacer structure: { ... } par des champs avec préfixe: structureNom, structureType, etc.');
  console.log('   3. Utiliser le script fix-nested-contacts.js pour corriger automatiquement');
  
  process.exit(1);
}