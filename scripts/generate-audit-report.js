/**
 * Script pour générer un rapport d'audit CSS complet
 * 
 * Ce script combine les résultats de différents audits (CSS, Bootstrap, Card)
 * pour produire un rapport complet sur l'état de la standardisation CSS
 * 
 * Usage: node generate-audit-report.js [--output=audit-report.md]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const args = process.argv.slice(2);
const outputFileArg = args.find(arg => arg.startsWith('--output='));
const outputFile = outputFileArg ? outputFileArg.split('=')[1] : 'css_audit_report.md';

// Fonction pour exécuter un script et capturer sa sortie
function runScript(command) {
  try {
    console.log(`Exécution de: ${command}`);
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    console.error(`Erreur lors de l'exécution de ${command}:`, error.message);
    return `Erreur: ${error.message}`;
  }
}

// Fonction pour lire un fichier s'il existe
function readFileIfExists(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
    return null;
  } catch (error) {
    console.error(`Erreur lors de la lecture de ${filePath}:`, error.message);
    return null;
  }
}

// Fonction principale
function main() {
  console.log('=== Génération du rapport d\'audit CSS complet ===');
  
  // Exécuter les scripts d'audit si les rapports n'existent pas déjà
  if (!fs.existsSync('bootstrap_audit_report.md')) {
    runScript('node scripts/audit-bootstrap.js');
  }
  
  // Collecter les résultats des différents audits
  const bootstrapReport = readFileIfExists('bootstrap_audit_report.md');
  
  // Exécuter l'audit CSS et capturer sa sortie
  const cssAuditOutput = runScript('node scripts/check-css-vars.js');
  
  // Exécuter l'audit des cartes s'il existe et capturer sa sortie
  let cardAuditOutput = '';
  try {
    cardAuditOutput = runScript('npm run audit:card');
  } catch (error) {
    cardAuditOutput = "Audit des cartes non disponible ou a échoué.";
  }
  
  // Générer le rapport complet
  let report = `# Rapport d'audit CSS - TourCraft\n\n`;
  report += `*Date de génération: ${new Date().toLocaleString()}*\n\n`;
  
  report += `## Table des matières\n\n`;
  report += `1. [Résumé](#résumé)\n`;
  report += `2. [Variables CSS](#variables-css)\n`;
  report += `3. [Classes Bootstrap](#classes-bootstrap)\n`;
  report += `4. [Composants Card](#composants-card)\n`;
  report += `5. [Plan d'action](#plan-daction)\n`;
  
  report += `\n## Résumé\n\n`;
  report += `Ce rapport présente une analyse complète des problèmes CSS identifiés dans l'application TourCraft. `;
  report += `Il couvre trois domaines principaux :\n\n`;
  report += `1. **Variables CSS** : Utilisation des variables CSS standardisées avec le préfixe \`--tc-\`\n`;
  report += `2. **Classes Bootstrap** : Remplacement des classes Bootstrap par des composants UI standardisés\n`;
  report += `3. **Composants Card** : Migration vers le composant Card standardisé\n`;
  
  report += `\n## Variables CSS\n\n`;
  report += `### Résultats de l'audit\n\n`;
  report += `\`\`\`\n${cssAuditOutput}\`\`\`\n\n`;
  
  report += `\n## Classes Bootstrap\n\n`;
  if (bootstrapReport) {
    // Extraire uniquement le contenu après le titre principal (pour éviter la duplication)
    const bootstrapContent = bootstrapReport.split('\n').slice(2).join('\n');
    report += bootstrapContent;
  } else {
    report += `*Rapport d'audit Bootstrap non disponible. Exécutez \`npm run audit:bootstrap\` pour générer le rapport.*\n\n`;
  }
  
  report += `\n## Composants Card\n\n`;
  if (cardAuditOutput) {
    report += `### Résultats de l'audit\n\n`;
    report += `\`\`\`\n${cardAuditOutput}\`\`\`\n\n`;
  } else {
    report += `*Rapport d'audit des composants Card non disponible.*\n\n`;
  }
  
  report += `\n## Plan d'action\n\n`;
  report += `Sur la base des résultats de cet audit, voici les actions prioritaires à mettre en œuvre :\n\n`;
  
  report += `### 1. Standardisation des variables CSS\n\n`;
  report += `- [ ] Remplacer toutes les valeurs codées en dur par des variables CSS\n`;
  report += `- [ ] Ajouter le préfixe \`--tc-\` à toutes les variables CSS\n`;
  report += `- [ ] Supprimer les fallbacks codés en dur dans les fichiers CSS\n`;
  
  report += `### 2. Migration des classes Bootstrap\n\n`;
  report += `- [ ] Migrer les boutons vers les classes \`tc-btn\` et \`tc-btn-*\`\n`;
  report += `- [ ] Remplacer les classes de cartes par le composant Card standardisé\n`;
  report += `- [ ] Évaluer et migrer les autres composants Bootstrap (formulaires, alertes, etc.)\n`;
  
  report += `### 3. Standardisation des composants Card\n\n`;
  report += `- [ ] Identifier tous les composants utilisant des cartes personnalisées\n`;
  report += `- [ ] Migrer vers le composant Card standardisé\n`;
  report += `- [ ] Tester les composants migrés pour assurer la cohérence visuelle\n`;
  
  report += `### 4. Documentation et formation\n\n`;
  report += `- [ ] Mettre à jour la documentation CSS existante\n`;
  report += `- [ ] Former l'équipe aux standards de développement CSS\n`;
  report += `- [ ] Mettre en place un processus de revue code pour assurer le respect des standards\n`;
  
  // Enregistrer le rapport
  fs.writeFileSync(outputFile, report, 'utf8');
  console.log(`Rapport complet généré dans: ${outputFile}`);
}

// Exécution
main();