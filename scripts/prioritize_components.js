/**
 * Script de priorisation des composants à corriger
 * 
 * Ce script analyse les résultats de l'audit CSS et Bootstrap
 * pour générer une liste prioritaire des fichiers à corriger
 * 
 * Usage: node scripts/prioritize_components.js
 */

const fs = require('fs');
const path = require('path');

// Fonction pour lire un fichier markdown et extraire les informations pertinentes
function extractPrioritiesFromReport(filePath, type) {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`Le fichier ${filePath} n'existe pas.`);
      return [];
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extraction différente selon le type de rapport
    if (type === 'bootstrap') {
      // Pour le rapport Bootstrap, nous voulons extraire les fichiers prioritaires
      const highPrioritySection = content.match(/### Priorité haute \(plus de 5 occurrences\)([\s\S]*?)(?=###|$)/);
      const mediumPrioritySection = content.match(/### Priorité moyenne \(2-5 occurrences\)([\s\S]*?)(?=###|$)/);
      
      const highPriority = highPrioritySection ? extractFilesFromSection(highPrioritySection[1], 3) : [];
      const mediumPriority = mediumPrioritySection ? extractFilesFromSection(mediumPrioritySection[1], 2) : [];
      
      return [...highPriority, ...mediumPriority];
    } else if (type === 'css') {
      // Pour le rapport CSS, nous analysons les statistiques par fichier
      const fileStats = [];
      const fileMatches = content.matchAll(/src\/(.+?\.css):\s*\n\s*- Couleurs codées en dur \((\d+)\): .*?\n\s*- Tailles codées en dur \((\d+)\): /g);
      
      for (const match of fileMatches) {
        fileStats.push({
          file: `src/${match[1]}`,
          colors: parseInt(match[2] || 0),
          sizes: parseInt(match[3] || 0),
          total: parseInt(match[2] || 0) + parseInt(match[3] || 0),
          priority: 0
        });
      }
      
      // Trier par nombre total de problèmes
      fileStats.sort((a, b) => b.total - a.total);
      
      // Assigner les priorités (3 = haute, 2 = moyenne, 1 = basse)
      fileStats.forEach((stat, index) => {
        if (index < 10) stat.priority = 3;  // Top 10 = haute priorité
        else if (index < 30) stat.priority = 2;  // Top 30 = priorité moyenne
        else stat.priority = 1;  // Le reste = basse priorité
      });
      
      return fileStats;
    }
    
    return [];
  } catch (error) {
    console.error(`Erreur lors de la lecture du fichier ${filePath}:`, error.message);
    return [];
  }
}

// Fonction pour extraire les noms de fichiers d'une section de rapport
function extractFilesFromSection(section, priority) {
  const result = [];
  const fileMatches = section.matchAll(/- \*\*(.+?)\*\*/g);
  
  for (const match of fileMatches) {
    result.push({
      file: match[1],
      priority: priority
    });
  }
  
  return result;
}

// Fonction pour déterminer si un fichier est un composant commun/partagé
function isSharedComponent(filePath) {
  // Les composants dans /components/ui/ ou /components/common/ sont considérés comme partagés
  return filePath.includes('/components/ui/') || 
         filePath.includes('/components/common/') || 
         filePath.includes('/styles/components/') ||
         filePath.includes('/styles/base/');
}

// Fonction pour combiner les priorités des différents rapports
function combinePriorities(cssPriorities, bootstrapPriorities) {
  const allFiles = new Map();
  
  // Ajouter les priorités CSS
  cssPriorities.forEach(item => {
    allFiles.set(item.file, {
      file: item.file,
      cssPriority: item.priority,
      bootstrapPriority: 0,
      cssIssues: item.total,
      bootstrapIssues: 0,
      isShared: isSharedComponent(item.file)
    });
  });
  
  // Ajouter ou mettre à jour avec les priorités Bootstrap
  bootstrapPriorities.forEach(item => {
    if (allFiles.has(item.file)) {
      const existing = allFiles.get(item.file);
      existing.bootstrapPriority = item.priority;
      existing.bootstrapIssues = item.issues || 0;
    } else {
      allFiles.set(item.file, {
        file: item.file,
        cssPriority: 0,
        bootstrapPriority: item.priority,
        cssIssues: 0,
        bootstrapIssues: item.issues || 0,
        isShared: isSharedComponent(item.file)
      });
    }
  });
  
  // Calculer la priorité combinée
  const combined = Array.from(allFiles.values()).map(item => {
    // Les composants partagés ont une priorité plus élevée
    const sharedBonus = item.isShared ? 1 : 0;
    
    // Priorité maximale entre CSS et Bootstrap + bonus pour les composants partagés
    const combinedPriority = Math.max(item.cssPriority, item.bootstrapPriority) + sharedBonus;
    
    return {
      ...item,
      combinedPriority
    };
  });
  
  // Trier par priorité combinée (décroissante)
  combined.sort((a, b) => {
    if (b.combinedPriority !== a.combinedPriority) {
      return b.combinedPriority - a.combinedPriority;
    }
    // En cas d'égalité, trier par nombre total de problèmes
    return (b.cssIssues + b.bootstrapIssues) - (a.cssIssues + a.bootstrapIssues);
  });
  
  return combined;
}

// Fonction pour générer un rapport Markdown de priorisation
function generatePrioritizationReport(priorities) {
  let report = `# Plan de correction CSS prioritaire\n\n`;
  report += `*Date de génération: ${new Date().toLocaleString()}*\n\n`;
  
  report += `## Ordre de priorité des composants à corriger\n\n`;
  
  // Ajouter l'explication de la priorisation
  report += `### Critères de priorisation\n\n`;
  report += `- Les composants sont classés par priorité de 1 à 4 (4 étant la plus haute priorité)\n`;
  report += `- Les composants partagés (UI, common, base) reçoivent un bonus de priorité\n`;
  report += `- Les fichiers avec de nombreux problèmes CSS et Bootstrap sont priorisés\n\n`;
  
  // Haute priorité (4)
  report += `### Priorité 4 (Critique - Composants partagés)\n\n`;
  const priority4 = priorities.filter(p => p.combinedPriority >= 4);
  if (priority4.length === 0) {
    report += `*Aucun composant de priorité 4*\n\n`;
  } else {
    priority4.forEach(item => {
      report += `- **${item.file}** - ${item.cssIssues || 0} problèmes CSS, ${item.bootstrapIssues || 0} problèmes Bootstrap ${item.isShared ? '(Partagé)' : ''}\n`;
    });
    report += `\n`;
  }
  
  // Priorité haute (3)
  report += `### Priorité 3 (Haute)\n\n`;
  const priority3 = priorities.filter(p => p.combinedPriority === 3);
  if (priority3.length === 0) {
    report += `*Aucun composant de priorité 3*\n\n`;
  } else {
    priority3.forEach(item => {
      report += `- **${item.file}** - ${item.cssIssues || 0} problèmes CSS, ${item.bootstrapIssues || 0} problèmes Bootstrap ${item.isShared ? '(Partagé)' : ''}\n`;
    });
    report += `\n`;
  }
  
  // Priorité moyenne (2)
  report += `### Priorité 2 (Moyenne)\n\n`;
  const priority2 = priorities.filter(p => p.combinedPriority === 2);
  if (priority2.length === 0) {
    report += `*Aucun composant de priorité 2*\n\n`;
  } else {
    priority2.forEach(item => {
      report += `- **${item.file}** - ${item.cssIssues || 0} problèmes CSS, ${item.bootstrapIssues || 0} problèmes Bootstrap ${item.isShared ? '(Partagé)' : ''}\n`;
    });
    report += `\n`;
  }
  
  // Priorité basse (1)
  report += `### Priorité 1 (Basse)\n\n`;
  const priority1 = priorities.filter(p => p.combinedPriority === 1);
  // Limiter à 20 entrées pour la priorité basse
  const displayedPriority1 = priority1.slice(0, 20);
  
  if (displayedPriority1.length === 0) {
    report += `*Aucun composant de priorité 1*\n\n`;
  } else {
    displayedPriority1.forEach(item => {
      report += `- **${item.file}** - ${item.cssIssues || 0} problèmes CSS, ${item.bootstrapIssues || 0} problèmes Bootstrap\n`;
    });
    
    if (priority1.length > 20) {
      report += `- *...et ${priority1.length - 20} autres fichiers de basse priorité*\n`;
    }
    report += `\n`;
  }
  
  // Ajouter les instructions pour la correction
  report += `## Instructions pour la correction\n\n`;
  report += `### Correction des problèmes CSS\n\n`;
  report += `1. Remplacer les valeurs codées en dur par des variables CSS avec préfixe \`--tc-\`\n`;
  report += `2. Standardiser les breakpoints selon les valeurs dans \`src/styles/mixins/breakpoints.css\`\n`;
  report += `3. Utiliser les utilitaires CSS existants plutôt que de créer des styles dupliqués\n\n`;
  
  report += `### Correction des problèmes Bootstrap\n\n`;
  report += `1. Remplacer les classes \`btn-*\` par \`tc-btn-*\`\n`;
  report += `2. Remplacer les classes \`card\` par le composant \`Card\` standardisé\n`;
  report += `3. Évaluer et remplacer les autres composants Bootstrap par leurs équivalents TourCraft\n\n`;
  
  report += `### Processus de correction\n\n`;
  report += `1. Créer une branche de fonctionnalité pour chaque composant ou groupe de composants liés\n`;
  report += `2. Exécuter les outils de correction automatique quand c'est possible :\n`;
  report += `   - \`npm run audit:css:fix\` pour ajouter automatiquement le préfixe \`--tc-\`\n`;
  report += `   - \`npm run audit:bootstrap:fix\` pour corriger automatiquement certaines classes Bootstrap\n`;
  report += `3. Vérifier visuellement les corrections dans l'environnement de test\n`;
  report += `4. Soumettre une pull request pour chaque groupe de corrections\n`;
  
  return report;
}

// Fonction principale
function main() {
  console.log('=== Priorisation des composants pour la correction CSS ===');
  
  // Extraire les priorités des rapports
  const cssPriorities = extractPrioritiesFromReport('css_audit_report.md', 'css');
  const bootstrapPriorities = extractPrioritiesFromReport('bootstrap_audit_report.md', 'bootstrap');
  
  // Combiner les priorités
  const combinedPriorities = combinePriorities(cssPriorities, bootstrapPriorities);
  
  // Générer le rapport de priorisation
  const report = generatePrioritizationReport(combinedPriorities);
  
  // Enregistrer le rapport
  fs.writeFileSync('card_migration_plan.md', report, 'utf8');
  console.log(`Rapport de priorisation généré dans: card_migration_plan.md`);
}

// Exécution
main();