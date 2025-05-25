/**
 * Script pour auditer l'utilisation directe des classes Bootstrap
 * 
 * Ce script détecte les composants qui utilisent directement des classes Bootstrap
 * au lieu des composants UI standardisés de TourCraft (classes tc-*)
 * 
 * Usage: node audit-bootstrap.js [--fix] [--report-file=report.md]
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');
const reportFileArg = args.find(arg => arg.startsWith('--report-file='));
const reportFile = reportFileArg ? reportFileArg.split('=')[1] : 'bootstrap_audit_report.md';

// Patterns à rechercher
const patterns = {
  // Classes de boutons Bootstrap à remplacer par tc-btn
  buttons: {
    pattern: /className="[^"]*\b(btn-(?:primary|secondary|success|danger|warning|info|light|dark|link))\b[^"]*"/g,
    replacement: (match, btnClass) => match.replace(`btn-${btnClass.split('-')[1]}`, `tc-btn-${btnClass.split('-')[1]}`),
    caseStudy: `<button className="btn btn-primary">Enregistrer</button>`,
    recommendation: `<button className="tc-btn tc-btn-primary">Enregistrer</button>`
  },
  
  // Classes de cartes Bootstrap à remplacer par tc-card
  cards: {
    pattern: /className="[^"]*\b(card(?:-(?:header|body|footer|title|text))?)\b[^"]*"/g,
    replacement: (match, cardClass) => match.replace(cardClass, `tc-${cardClass}`),
    caseStudy: `<div className="card"><div className="card-body">Contenu</div></div>`,
    recommendation: `<Card>Contenu</Card>`
  },
  
  // Autres classes Bootstrap à évaluer
  other: {
    pattern: /className="[^"]*\b(badge|alert|modal|form-control|nav|table|dropdown)\b[^"]*"/g,
    replacement: null, // Pas de remplacement automatique
    caseStudy: null,
    recommendation: "Évaluer au cas par cas le remplacement par les composants standardisés"
  }
};

// Statistiques
const stats = {
  filesScanned: 0,
  filesWithIssues: 0,
  totalButtonIssues: 0,
  totalCardIssues: 0,
  totalOtherIssues: 0,
  filesFixed: 0
};

// Résultats détaillés pour le rapport
const results = [];

// Fonction pour vérifier un fichier JS/JSX
function checkFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    let hasIssues = false;
    let fileModified = false;
    
    // Objet pour stocker les résultats de ce fichier
    const fileResult = {
      filePath,
      issues: {
        buttons: [],
        cards: [],
        other: []
      },
      fixed: false
    };
    
    // Vérifier les patterns de boutons
    const buttonMatches = [...content.matchAll(patterns.buttons.pattern)];
    if (buttonMatches.length > 0) {
      hasIssues = true;
      stats.totalButtonIssues += buttonMatches.length;
      fileResult.issues.buttons = buttonMatches.map(match => match[0]);
      
      if (shouldFix && patterns.buttons.replacement) {
        buttonMatches.forEach(match => {
          const original = match[0];
          const fixed = patterns.buttons.replacement(original, match[1]);
          content = content.replace(original, fixed);
        });
        fileModified = true;
      }
    }
    
    // Vérifier les patterns de cartes
    const cardMatches = [...content.matchAll(patterns.cards.pattern)];
    if (cardMatches.length > 0) {
      hasIssues = true;
      stats.totalCardIssues += cardMatches.length;
      fileResult.issues.cards = cardMatches.map(match => match[0]);
      
      if (shouldFix && patterns.cards.replacement) {
        cardMatches.forEach(match => {
          const original = match[0];
          const fixed = patterns.cards.replacement(original, match[1]);
          content = content.replace(original, fixed);
        });
        fileModified = true;
      }
    }
    
    // Vérifier les autres patterns
    const otherMatches = [...content.matchAll(patterns.other.pattern)];
    if (otherMatches.length > 0) {
      hasIssues = true;
      stats.totalOtherIssues += otherMatches.length;
      fileResult.issues.other = otherMatches.map(match => match[0]);
    }
    
    // Mettre à jour le fichier si des modifications ont été effectuées
    if (shouldFix && fileModified) {
      fs.writeFileSync(filePath, content, 'utf8');
      fileResult.fixed = true;
      stats.filesFixed++;
    }
    
    stats.filesScanned++;
    if (hasIssues) {
      stats.filesWithIssues++;
      results.push(fileResult);
    }
    
    return hasIssues;
  } catch (error) {
    console.error(`Erreur lors de l'analyse de ${filePath}:`, error.message);
    return false;
  }
}

// Trouver tous les fichiers JS/JSX
function findFiles() {
  return glob.sync('./src/**/*.{js,jsx}', { ignore: ['**/node_modules/**', '**/build/**', '**/dist/**'] });
}

// Générer un rapport Markdown
function generateReport() {
  let report = `# Rapport d'audit des classes Bootstrap\n\n`;
  report += `*Date de génération: ${new Date().toLocaleString()}*\n\n`;
  
  report += `## Résumé\n\n`;
  report += `- **Fichiers analysés**: ${stats.filesScanned}\n`;
  report += `- **Fichiers avec problèmes**: ${stats.filesWithIssues}\n`;
  report += `- **Problèmes de boutons**: ${stats.totalButtonIssues}\n`;
  report += `- **Problèmes de cartes**: ${stats.totalCardIssues}\n`;
  report += `- **Autres problèmes**: ${stats.totalOtherIssues}\n`;
  
  if (shouldFix) {
    report += `- **Fichiers corrigés automatiquement**: ${stats.filesFixed}\n`;
  }
  
  report += `\n## Recommandations\n\n`;
  
  report += `### Boutons\n\n`;
  report += `Remplacer les classes Bootstrap par les classes standardisées TourCraft :\n\n`;
  report += `**Exemple avant** :\n\`\`\`jsx\n${patterns.buttons.caseStudy}\n\`\`\`\n\n`;
  report += `**Exemple après** :\n\`\`\`jsx\n${patterns.buttons.recommendation}\n\`\`\`\n\n`;
  
  report += `### Cartes\n\n`;
  report += `Utiliser le composant Card standardisé au lieu des classes Bootstrap :\n\n`;
  report += `**Exemple avant** :\n\`\`\`jsx\n${patterns.cards.caseStudy}\n\`\`\`\n\n`;
  report += `**Exemple après** :\n\`\`\`jsx\n${patterns.cards.recommendation}\n\`\`\`\n\n`;
  
  report += `## Fichiers à corriger\n\n`;
  
  // Trier les fichiers par nombre de problèmes (ordre décroissant)
  results.sort((a, b) => {
    const aTotal = a.issues.buttons.length + a.issues.cards.length + a.issues.other.length;
    const bTotal = b.issues.buttons.length + b.issues.cards.length + b.issues.other.length;
    return bTotal - aTotal;
  });
  
  // Prioriser les composants avec le plus de problèmes
  report += `### Priorité haute (plus de 5 occurrences)\n\n`;
  const highPriority = results.filter(r => 
    r.issues.buttons.length + r.issues.cards.length + r.issues.other.length > 5
  );
  
  if (highPriority.length === 0) {
    report += `*Aucun fichier avec plus de 5 occurrences*\n\n`;
  } else {
    highPriority.forEach(result => {
      const total = result.issues.buttons.length + result.issues.cards.length + result.issues.other.length;
      report += `- **${result.filePath}** (${total} occurrences)${result.fixed ? ' ✓' : ''}\n`;
    });
    report += `\n`;
  }
  
  report += `### Priorité moyenne (2-5 occurrences)\n\n`;
  const mediumPriority = results.filter(r => {
    const total = r.issues.buttons.length + r.issues.cards.length + r.issues.other.length;
    return total >= 2 && total <= 5;
  });
  
  if (mediumPriority.length === 0) {
    report += `*Aucun fichier avec 2-5 occurrences*\n\n`;
  } else {
    mediumPriority.forEach(result => {
      const total = result.issues.buttons.length + result.issues.cards.length + result.issues.other.length;
      report += `- **${result.filePath}** (${total} occurrences)${result.fixed ? ' ✓' : ''}\n`;
    });
    report += `\n`;
  }
  
  report += `### Priorité basse (1 occurrence)\n\n`;
  const lowPriority = results.filter(r => {
    const total = r.issues.buttons.length + r.issues.cards.length + r.issues.other.length;
    return total === 1;
  });
  
  if (lowPriority.length === 0) {
    report += `*Aucun fichier avec 1 occurrence*\n\n`;
  } else {
    lowPriority.forEach(result => {
      report += `- **${result.filePath}**${result.fixed ? ' ✓' : ''}\n`;
    });
  }
  
  return report;
}

// Fonction principale
function main() {
  console.log('\x1b[1m\x1b[34m=== Audit des classes Bootstrap ===\x1b[0m');
  console.log(`Mode: ${shouldFix ? 'Correction automatique activée' : 'Analyse uniquement'}`);
  console.log('');
  
  const files = findFiles();
  console.log(`\x1b[1m${files.length} fichiers JS/JSX trouvés.\x1b[0m`);
  console.log('');
  
  // Analyser chaque fichier
  files.forEach(file => {
    const hasIssues = checkFile(file);
    if (hasIssues) {
      console.log(`\x1b[33m⚠ ${file}\x1b[0m`);
    }
  });
  
  // Afficher les statistiques
  console.log('\x1b[1m\x1b[34m=== Résumé ===\x1b[0m');
  console.log(`Fichiers analysés: ${stats.filesScanned}`);
  console.log(`Fichiers avec problèmes: ${stats.filesWithIssues}`);
  console.log(`Occurrences de boutons Bootstrap: ${stats.totalButtonIssues}`);
  console.log(`Occurrences de cartes Bootstrap: ${stats.totalCardIssues}`);
  console.log(`Autres occurrences Bootstrap: ${stats.totalOtherIssues}`);
  
  if (shouldFix) {
    console.log(`Fichiers corrigés: ${stats.filesFixed}`);
  }
  
  // Générer et enregistrer le rapport
  const report = generateReport();
  fs.writeFileSync(reportFile, report, 'utf8');
  console.log(`\nRapport détaillé généré dans: ${reportFile}`);
  
  // Suggestion pour la prochaine étape
  if (stats.filesWithIssues > 0 && !shouldFix) {
    console.log('');
    console.log('\x1b[33mPour corriger automatiquement ces problèmes, exécutez:\x1b[0m');
    console.log('  node audit-bootstrap.js --fix');
  }
}

// Exécution
main();