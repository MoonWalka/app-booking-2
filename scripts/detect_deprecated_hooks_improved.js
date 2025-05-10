#!/usr/bin/env node
/**
 * Script de détection des hooks dépréciés dans le projet TourCraft
 * 
 * Ce script analyse le code source pour identifier l'utilisation des hooks dépréciés
 * et génère un rapport détaillé pour aider à la migration vers les hooks génériques.
 * 
 * Utilisation: node scripts/detect_deprecated_hooks.js [--verbose] [--html] [--csv]
 * 
 * Options:
 *   --verbose: Affiche des informations détaillées sur l'analyse
 *   --html: Génère le rapport au format HTML
 *   --csv: Génère le rapport au format CSV
 * 
 * Créé le: 6 mai 2025
 * Mis à jour le: 9 mai 2025 - Amélioration de la détection pour éviter les faux positifs
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const readline = require('readline');

// Configuration des hooks dépréciés à rechercher
const DEPRECATED_HOOKS = [
  {
    name: 'useResponsiveComponent',
    replacement: 'useResponsive().getResponsiveComponent',
    pattern: /useResponsiveComponent/g,
    severity: 'MEDIUM',
    deadline: '6 août 2025'
  },
  {
    name: 'useTheme (racine)',
    replacement: 'useTheme from \'@/hooks/common\'',
    pattern: /useTheme/g,
    severity: 'LOW',
    deadline: '6 août 2025'
  },
  // Hooks spécifiques d'entité - Details
  {
    name: 'useArtisteDetails',
    replacement: 'useGenericEntityDetails',
    pattern: /useArtisteDetails/g,
    severity: 'HIGH',
    deadline: '6 novembre 2025'
  },
  {
    name: 'useConcertDetails',
    replacement: 'useGenericEntityDetails',
    pattern: /useConcertDetails/g,
    severity: 'HIGH',
    deadline: '6 novembre 2025'
  },
  {
    name: 'useLieuDetails',
    replacement: 'useGenericEntityDetails',
    pattern: /useLieuDetails/g,
    severity: 'HIGH',
    deadline: '6 novembre 2025'
  },
  // Hooks spécifiques d'entité - Search
  {
    name: 'useLieuSearch',
    replacement: 'useGenericEntitySearch',
    pattern: /useLieuSearch/g,
    severity: 'MEDIUM',
    deadline: '6 novembre 2025'
  },
  {
    name: 'useProgrammateurSearch',
    replacement: 'useGenericEntitySearch',
    pattern: /useProgrammateurSearch/g,
    severity: 'MEDIUM',
    deadline: '6 novembre 2025'
  },
  // Hooks spécifiques d'entité - List/Filters
  {
    name: 'useArtistesList',
    replacement: 'useGenericEntityList',
    pattern: /useArtistesList/g,
    severity: 'MEDIUM',
    deadline: '6 novembre 2025'
  },
  {
    name: 'useLieuxFilters',
    replacement: 'useGenericEntityList',
    pattern: /useLieuxFilters/g,
    severity: 'MEDIUM',
    deadline: '6 novembre 2025'
  },
  // Hooks spécifiques d'entité - Form
  {
    name: 'useConcertForm',
    replacement: 'useGenericEntityForm',
    pattern: /useConcertForm/g,
    severity: 'HIGH',
    deadline: '6 novembre 2025'
  },
  {
    name: 'useLieuForm',
    replacement: 'useGenericEntityForm',
    pattern: /useLieuForm/g,
    severity: 'HIGH',
    deadline: '6 novembre 2025'
  }
];

// Options par défaut
const options = {
  verbose: false,
  html: false,
  csv: false
};

// Traitement des arguments
process.argv.slice(2).forEach(arg => {
  if (arg === '--verbose') options.verbose = true;
  if (arg === '--html') options.html = true;
  if (arg === '--csv') options.csv = true;
});

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

/**
 * Fonction pour vérifier si un motif détecté est dans un commentaire ou une chaîne de caractères
 * @param {string} content - Contenu du fichier
 * @param {number} index - Index où le motif a été trouvé
 * @returns {boolean} - True si c'est un faux positif, false sinon
 */
function isFalsePositive(content, index) {
  // Extraire une portion du code autour de l'index
  // Utiliser une fenêtre suffisamment large pour capturer le contexte
  const start = Math.max(0, index - 500);
  const contextSize = Math.min(1000, content.length - start);
  const context = content.substr(start, contextSize);
  
  // Position relative dans le context
  const relativeIndex = index - start;
  
  // Vérification pour les commentaires mono-ligne (//)
  const commentLineStart = context.lastIndexOf('\n', relativeIndex) + 1;
  const lineBeforeMatch = context.substring(commentLineStart, relativeIndex);
  if (lineBeforeMatch.includes('//')) {
    return true;
  }
  
  // Vérification pour les commentaires multi-lignes (/* */)
  let commentStart = -1;
  let commentEnd = -1;
  let searchIndex = 0;
  
  while (searchIndex < relativeIndex) {
    const nextStart = context.indexOf('/*', searchIndex);
    if (nextStart === -1 || nextStart > relativeIndex) break;
    
    commentStart = nextStart;
    commentEnd = context.indexOf('*/', commentStart);
    
    if (commentEnd === -1 || commentEnd > relativeIndex) {
      // Dans un commentaire multi-ligne non fermé ou qui contient notre match
      return true;
    }
    
    // Continuer la recherche après ce commentaire
    searchIndex = commentEnd + 2;
  }
  
  // Vérification pour les commentaires JSDoc (/** */)
  searchIndex = 0;
  while (searchIndex < relativeIndex) {
    const nextStart = context.indexOf('/**', searchIndex);
    if (nextStart === -1 || nextStart > relativeIndex) break;
    
    commentStart = nextStart;
    commentEnd = context.indexOf('*/', commentStart);
    
    if (commentEnd === -1 || commentEnd > relativeIndex) {
      // Dans un commentaire JSDoc non fermé ou qui contient notre match
      return true;
    }
    
    // Continuer la recherche après ce commentaire
    searchIndex = commentEnd + 2;
  }
  
  // Vérifier si nous sommes dans une chaîne de caractères
  // On compte les guillemets simples et doubles avant la position
  let inSingleQuote = false;
  let inDoubleQuote = false;
  
  for (let i = 0; i < relativeIndex; i++) {
    const char = context.charAt(i);
    
    // Ignorer les guillemets échappés
    if (i > 0 && context.charAt(i - 1) === '\\') {
      continue;
    }
    
    if (char === "'") {
      inSingleQuote = !inSingleQuote;
    } else if (char === '"') {
      inDoubleQuote = !inDoubleQuote;
    } else if (char === '`') {
      // Template literals
      inTemplateLiteral = !inTemplateLiteral;
    }
  }
  
  return inSingleQuote || inDoubleQuote || inTemplateLiteral;
}

/**
 * Vérifie si le hook est réellement utilisé (pas juste mentionné)
 * @param {string} content - Contenu du fichier autour du match
 * @param {number} relativeIndex - Index relatif du match dans le contenu
 * @returns {boolean} - True si c'est une utilisation réelle
 */
function isRealUsage(content, relativeIndex) {
  // Extraire la ligne contenant le hook
  const lineStart = content.lastIndexOf('\n', relativeIndex) + 1;
  const lineEnd = content.indexOf('\n', relativeIndex);
  const line = content.substring(lineStart, lineEnd !== -1 ? lineEnd : content.length);
  
  // Vérifier s'il s'agit d'un import ou d'un usage comme hook
  const isImport = /import\s+.*\{.*\b(\w+)\b.*\}.*from/.test(line);
  const isHookUsage = /\b(\w+)\s*=\s*use\w+\(/.test(line) || /const\s+.*=\s*use\w+\(/.test(line);
  
  // Si c'est un import ou une utilisation d'un hook, c'est une utilisation réelle
  return isImport || isHookUsage;
}

// Fonction pour rechercher les hooks dépréciés dans les fichiers
async function findDeprecatedHooks() {
  const srcDir = path.join(process.cwd(), 'src');
  const results = [];
  
  console.log(`${colors.cyan}Recherche de hooks dépréciés dans ${srcDir}...${colors.reset}`);
  
  // Trouver tous les fichiers JS et JSX
  const { stdout: filesOutput } = await exec(`find ${srcDir} -type f -name "*.js" -o -name "*.jsx" | grep -v "node_modules" | grep -v ".test.js"`);
  const files = filesOutput.split('\n').filter(Boolean);
  
  let totalFiles = files.length;
  let processedFiles = 0;
  
  console.log(`${colors.green}Analyse de ${totalFiles} fichiers...${colors.reset}`);
  
  // Créer une barre de progression
  const updateProgress = () => {
    const percent = Math.floor((processedFiles / totalFiles) * 100);
    process.stdout.write(`\r[${colors.green}${'='.repeat(percent / 2)}${' '.repeat(50 - percent / 2)}${colors.reset}] ${percent}% (${processedFiles}/${totalFiles})`);
  };
  
  // Analyser chaque fichier
  for (const file of files) {
    processedFiles++;
    
    if (options.verbose) {
      console.log(`\nAnalyse de ${file}...`);
    } else if (processedFiles % 10 === 0 || processedFiles === totalFiles) {
      updateProgress();
    }
    
    const content = fs.readFileSync(file, 'utf8');
    
    // Vérifier chaque hook déprécié
    for (const hook of DEPRECATED_HOOKS) {
      const matches = [...content.matchAll(hook.pattern)];
      
      if (matches.length > 0) {
        // Filtrer les matches pour éliminer les faux positifs
        const validMatches = matches.filter(match => 
          !isFalsePositive(content, match.index)
        );
        
        // Obtenir les numéros de ligne pour chaque occurrence valide
        for (const match of validMatches) {
          let lineNumber = -1;
          let lineContent = '';
          
          // Trouver le numéro de ligne de l'occurrence
          let position = 0;
          const lines = content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (position <= match.index && match.index < position + lines[i].length + 1) {
              lineNumber = i + 1;
              lineContent = lines[i].trim();
              break;
            }
            position += lines[i].length + 1; // +1 pour le caractère de nouvelle ligne
          }
          
          // Vérifier si c'est une utilisation réelle (import ou déclaration)
          // Extraire une portion du code autour de l'index pour analyse contextuelle
          const start = Math.max(0, match.index - 200);
          const contextSize = Math.min(400, content.length - start);
          const context = content.substr(start, contextSize);
          const relativeIndex = match.index - start;
          
          if (isRealUsage(context, relativeIndex)) {
            results.push({
              file: path.relative(process.cwd(), file),
              hook: hook.name,
              replacement: hook.replacement,
              line: lineNumber,
              lineContent,
              severity: hook.severity,
              deadline: hook.deadline
            });
            
            if (options.verbose) {
              console.log(`${colors.yellow}Trouvé: ${hook.name}${colors.reset} dans ${file}:${lineNumber}`);
              console.log(`  ${colors.magenta}→ Remplacer par: ${hook.replacement}${colors.reset}`);
            }
          }
        }
      }
    }
  }
  
  console.log('\n');
  return results;
}

// Fonction pour générer le rapport
function generateReport(results) {
  // Trier les résultats par sévérité, puis par fichier
  results.sort((a, b) => {
    const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return a.file.localeCompare(b.file);
  });
  
  // Résumé des résultats
  const summary = {
    total: results.length,
    bySeverity: {
      HIGH: results.filter(r => r.severity === 'HIGH').length,
      MEDIUM: results.filter(r => r.severity === 'MEDIUM').length,
      LOW: results.filter(r => r.severity === 'LOW').length
    },
    byHook: {}
  };
  
  // Compter les occurrences par hook
  results.forEach(result => {
    if (!summary.byHook[result.hook]) {
      summary.byHook[result.hook] = 0;
    }
    summary.byHook[result.hook]++;
  });
  
  // Afficher le résumé
  console.log(`${colors.green}=== Rapport de détection des hooks dépréciés ===${colors.reset}`);
  console.log(`${colors.cyan}Total des occurrences trouvées:${colors.reset} ${summary.total}`);
  console.log(`${colors.red}Sévérité HAUTE:${colors.reset} ${summary.bySeverity.HIGH}`);
  console.log(`${colors.yellow}Sévérité MOYENNE:${colors.reset} ${summary.bySeverity.MEDIUM}`);
  console.log(`${colors.blue}Sévérité BASSE:${colors.reset} ${summary.bySeverity.LOW}\n`);
  
  console.log(`${colors.green}=== Détail par hook ===${colors.reset}`);
  Object.entries(summary.byHook).forEach(([hook, count]) => {
    const foundHook = DEPRECATED_HOOKS.find(h => h.name === hook);
    const deadlineColor = new Date(foundHook.deadline) < new Date() ? colors.red : colors.yellow;
    console.log(`${colors.cyan}${hook}:${colors.reset} ${count} occurrence(s) - Échéance: ${deadlineColor}${foundHook.deadline}${colors.reset}`);
  });
  console.log();
  
  // Afficher les détails si demandé
  if (options.verbose) {
    console.log(`${colors.green}=== Détails des occurrences ===${colors.reset}`);
    results.forEach(result => {
      const severityColor = result.severity === 'HIGH' ? colors.red : 
                            result.severity === 'MEDIUM' ? colors.yellow : colors.blue;
      
      console.log(`${severityColor}[${result.severity}]${colors.reset} ${colors.cyan}${result.file}:${result.line}${colors.reset}`);
      console.log(`  Hook: ${result.hook}`);
      console.log(`  Ligne: ${result.lineContent}`);
      console.log(`  Remplacer par: ${result.replacement}`);
      console.log(`  Échéance: ${result.deadline}\n`);
    });
  }
  
  // Générer rapport HTML si demandé
  if (options.html) {
    generateHtmlReport(results, summary);
  }
  
  // Générer rapport CSV si demandé
  if (options.csv) {
    generateCsvReport(results);
  }
  
  return summary;
}

// Fonction pour générer un rapport HTML
function generateHtmlReport(results, summary) {
  const reportPath = path.join(process.cwd(), 'docs', 'hooks', 'RAPPORT_HOOKS_DEPRECIES.html');
  
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport de détection des hooks dépréciés</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px; }
    h2 { color: #3498db; margin-top: 30px; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background-color: #f5f5f5; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .high { background-color: #ffdddd; }
    .medium { background-color: #ffffdd; }
    .low { background-color: #ddffdd; }
    .summary { display: flex; justify-content: space-between; margin-bottom: 20px; }
    .summary-box { border: 1px solid #ddd; padding: 15px; border-radius: 5px; flex: 1; margin: 0 10px; background-color: #f9f9f9; }