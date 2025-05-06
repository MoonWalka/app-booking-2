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
    pattern: /import\s+[\{\s]*useResponsiveComponent[\s\}]*\s+from\s+['"]@\/hooks\/useResponsiveComponent['"]|import\s+[\{\s]*useResponsiveComponent[\s\}]*\s+from\s+['"]\.\..*\/useResponsiveComponent['"]|const\s+\w+\s*=\s*useResponsiveComponent/g,
    severity: 'MEDIUM',
    deadline: '6 août 2025'
  },
  {
    name: 'useTheme (racine)',
    replacement: 'useTheme from \'@/hooks/common\'',
    pattern: /import\s+[\{\s]*useTheme[\s\}]*\s+from\s+['"]@\/hooks\/useTheme['"]|import\s+[\{\s]*useTheme[\s\}]*\s+from\s+['"]\.\..*\/useTheme['"](?!.*common)/g,
    severity: 'LOW',
    deadline: '6 août 2025'
  },
  // Hooks spécifiques d'entité - Details
  {
    name: 'useArtisteDetails',
    replacement: 'useGenericEntityDetails',
    pattern: /import\s+[\{\s]*useArtisteDetails[\s\}]*|const\s+\w+\s*=\s*useArtisteDetails/g,
    severity: 'HIGH',
    deadline: '6 novembre 2025'
  },
  {
    name: 'useConcertDetails',
    replacement: 'useGenericEntityDetails',
    pattern: /import\s+[\{\s]*useConcertDetails[\s\}]*|const\s+\w+\s*=\s*useConcertDetails/g,
    severity: 'HIGH',
    deadline: '6 novembre 2025'
  },
  {
    name: 'useLieuDetails',
    replacement: 'useGenericEntityDetails',
    pattern: /import\s+[\{\s]*useLieuDetails[\s\}]*|const\s+\w+\s*=\s*useLieuDetails/g,
    severity: 'HIGH',
    deadline: '6 novembre 2025'
  },
  // Hooks spécifiques d'entité - Search
  {
    name: 'useLieuSearch',
    replacement: 'useGenericEntitySearch',
    pattern: /import\s+[\{\s]*useLieuSearch[\s\}]*|const\s+\w+\s*=\s*useLieuSearch/g,
    severity: 'MEDIUM',
    deadline: '6 novembre 2025'
  },
  {
    name: 'useProgrammateurSearch',
    replacement: 'useGenericEntitySearch',
    pattern: /import\s+[\{\s]*useProgrammateurSearch[\s\}]*|const\s+\w+\s*=\s*useProgrammateurSearch/g,
    severity: 'MEDIUM',
    deadline: '6 novembre 2025'
  },
  // Hooks spécifiques d'entité - List/Filters
  {
    name: 'useArtistesList',
    replacement: 'useGenericEntityList',
    pattern: /import\s+[\{\s]*useArtistesList[\s\}]*|const\s+\w+\s*=\s*useArtistesList/g,
    severity: 'MEDIUM',
    deadline: '6 novembre 2025'
  },
  {
    name: 'useLieuxFilters',
    replacement: 'useGenericEntityList',
    pattern: /import\s+[\{\s]*useLieuxFilters[\s\}]*|const\s+\w+\s*=\s*useLieuxFilters/g,
    severity: 'MEDIUM',
    deadline: '6 novembre 2025'
  },
  // Hooks spécifiques d'entité - Form
  {
    name: 'useConcertForm',
    replacement: 'useGenericEntityForm',
    pattern: /import\s+[\{\s]*useConcertForm[\s\}]*|const\s+\w+\s*=\s*useConcertForm/g,
    severity: 'HIGH',
    deadline: '6 novembre 2025'
  },
  {
    name: 'useLieuForm',
    replacement: 'useGenericEntityForm',
    pattern: /import\s+[\{\s]*useLieuForm[\s\}]*|const\s+\w+\s*=\s*useLieuForm/g,
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
        // Obtenir les numéros de ligne pour chaque occurrence
        const lines = content.split('\n');
        for (const match of matches) {
          let lineNumber = -1;
          let lineContent = '';
          
          // Trouver le numéro de ligne de l'occurrence
          let position = 0;
          for (let i = 0; i < lines.length; i++) {
            position += lines[i].length + 1; // +1 pour le caractère de nouvelle ligne
            if (position >= match.index) {
              lineNumber = i + 1;
              lineContent = lines[i].trim();
              break;
            }
          }
          
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
    .summary-box h3 { margin-top: 0; }
    .code { font-family: monospace; background-color: #f5f5f5; padding: 2px 5px; border-radius: 3px; }
    .date { font-style: italic; color: #777; }
  </style>
</head>
<body>
  <h1>Rapport de détection des hooks dépréciés</h1>
  <p class="date">Généré le ${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString()}</p>
  
  <div class="summary">
    <div class="summary-box">
      <h3>Total des occurrences</h3>
      <p><strong>${summary.total}</strong> hooks dépréciés détectés</p>
    </div>
    <div class="summary-box">
      <h3>Par sévérité</h3>
      <p><strong>${summary.bySeverity.HIGH}</strong> haute</p>
      <p><strong>${summary.bySeverity.MEDIUM}</strong> moyenne</p>
      <p><strong>${summary.bySeverity.LOW}</strong> basse</p>
    </div>
    <div class="summary-box">
      <h3>Par hook</h3>
      ${Object.entries(summary.byHook).map(([hook, count]) => 
        `<p><strong>${count}</strong> ${hook}</p>`
      ).join('')}
    </div>
  </div>
  
  <h2>Détails des occurrences</h2>
  <table>
    <thead>
      <tr>
        <th>Sévérité</th>
        <th>Fichier</th>
        <th>Ligne</th>
        <th>Hook déprécié</th>
        <th>Remplacement recommandé</th>
        <th>Échéance</th>
      </tr>
    </thead>
    <tbody>
      ${results.map(result => `
        <tr class="${result.severity.toLowerCase()}">
          <td>${result.severity}</td>
          <td>${result.file}</td>
          <td>${result.line}</td>
          <td><span class="code">${result.hook}</span></td>
          <td><span class="code">${result.replacement}</span></td>
          <td>${result.deadline}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <h2>Recommandations</h2>
  <ul>
    <li>Consultez le <a href="../hooks/PLAN_DEPRECIATION_HOOKS.md">Plan de dépréciation des hooks</a> pour plus d'informations sur les échéances et la stratégie de migration.</li>
    <li>Prioritisez les migrations des hooks avec une sévérité HAUTE et dont l'échéance est proche.</li>
    <li>Utilisez les guides de migration disponibles dans la documentation du projet.</li>
    <li>Pour tout problème ou question, contactez l'équipe responsable de la migration des hooks.</li>
  </ul>
</body>
</html>`;

  fs.writeFileSync(reportPath, html);
  console.log(`${colors.green}Rapport HTML généré:${colors.reset} ${reportPath}`);
}

// Fonction pour générer un rapport CSV
function generateCsvReport(results) {
  const reportPath = path.join(process.cwd(), 'docs', 'hooks', 'rapport_hooks_deprecies.csv');
  
  const header = 'Sévérité,Fichier,Ligne,Hook déprécié,Remplacement recommandé,Échéance\n';
  const rows = results.map(result => 
    `${result.severity},${result.file},${result.line},"${result.hook}","${result.replacement}",${result.deadline}`
  ).join('\n');
  
  fs.writeFileSync(reportPath, header + rows);
  console.log(`${colors.green}Rapport CSV généré:${colors.reset} ${reportPath}`);
}

// Fonction principale
async function main() {
  console.log(`${colors.magenta}=== Détection des hooks dépréciés ===\n${colors.reset}`);
  
  try {
    const results = await findDeprecatedHooks();
    const summary = generateReport(results);
    
    if (summary.total > 0) {
      console.log(`${colors.yellow}Actions recommandées:${colors.reset}`);
      console.log(`1. Consultez le Plan de dépréciation des hooks pour les échéances complètes`);
      console.log(`2. Prioritisez la migration des ${summary.bySeverity.HIGH} hooks à sévérité HAUTE`);
      console.log(`3. Utilisez les guides de migration disponibles dans la documentation\n`);
    } else {
      console.log(`${colors.green}Aucun hook déprécié trouvé. Excellente nouvelle !${colors.reset}\n`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error(`${colors.red}Erreur lors de l'analyse:${colors.reset}`, error);
    process.exit(1);
  }
}

// Exécution du script
main();