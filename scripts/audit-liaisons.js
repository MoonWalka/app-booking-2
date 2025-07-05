#!/usr/bin/env node

/**
 * Script d'audit des liaisons entre composants
 * Vérifie que toutes les entités sont correctement affichées et liées
 */

const fs = require('fs').promises;
const path = require('path');

// Configuration des chemins
const PROJECT_ROOT = path.join(__dirname, '..');
const SRC_PATH = path.join(PROJECT_ROOT, 'src');
const AUDIT_PLAN = path.join(PROJECT_ROOT, 'audit-liaisons-composants.json');

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Résultats de l'audit
const auditResults = {
  timestamp: new Date().toISOString(),
  composantsVerifies: 0,
  liaisonsVerifiees: 0,
  problemes: [],
  avertissements: [],
  suggestions: []
};

/**
 * Lit et parse le plan d'audit
 */
async function loadAuditPlan() {
  try {
    const content = await fs.readFile(AUDIT_PLAN, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`${colors.red}Erreur lors du chargement du plan d'audit:${colors.reset}`, error.message);
    process.exit(1);
  }
}

/**
 * Vérifie l'existence d'un fichier
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Recherche un pattern dans un fichier
 */
async function searchInFile(filePath, patterns) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const results = {};
    
    for (const [key, pattern] of Object.entries(patterns)) {
      results[key] = pattern.test(content);
    }
    
    return results;
  } catch (error) {
    return null;
  }
}

/**
 * Vérifie les composants d'affichage d'une entité
 */
async function verifyEntityComponents(entityName, entityConfig) {
  console.log(`\n${colors.blue}Vérification de l'entité: ${entityName}${colors.reset}`);
  
  for (const [type, components] of Object.entries(entityConfig.composants_affichage)) {
    console.log(`  ${colors.cyan}${type}:${colors.reset}`);
    
    for (const component of components) {
      auditResults.composantsVerifies++;
      
      // Gestion des chemins multiples
      const paths = component.chemins || [component.chemin];
      let foundCount = 0;
      
      for (const componentPath of paths) {
        const fullPath = path.join(PROJECT_ROOT, componentPath);
        const exists = await fileExists(fullPath);
        
        if (exists) {
          foundCount++;
        }
      }
      
      if (foundCount === 0) {
        console.log(`    ${colors.red}✗ ${component.nom} - Aucun fichier trouvé${colors.reset}`);
        auditResults.problemes.push({
          type: 'composant_manquant',
          entite: entityName,
          composant: component.nom,
          chemins: paths
        });
      } else if (foundCount < paths.length) {
        console.log(`    ${colors.yellow}⚠ ${component.nom} - ${foundCount}/${paths.length} fichiers trouvés${colors.reset}`);
        auditResults.avertissements.push({
          type: 'composant_partiel',
          entite: entityName,
          composant: component.nom,
          trouves: foundCount,
          attendus: paths.length
        });
      } else {
        console.log(`    ${colors.green}✓ ${component.nom}${colors.reset}`);
      }
    }
  }
}

/**
 * Vérifie les liaisons sortantes d'une entité
 */
async function verifyEntityRelations(entityName, entityConfig) {
  if (!entityConfig.liaisons_sortantes) return;
  
  console.log(`  ${colors.magenta}Liaisons sortantes:${colors.reset}`);
  
  for (const liaison of entityConfig.liaisons_sortantes) {
    auditResults.liaisonsVerifiees++;
    
    // Vérifier dans au moins un composant principal
    let found = false;
    const componentsToCheck = [];
    
    // Récupérer les composants principaux à vérifier
    if (entityConfig.composants_affichage.listes) {
      componentsToCheck.push(...entityConfig.composants_affichage.listes);
    }
    if (entityConfig.composants_affichage.tableaux) {
      componentsToCheck.push(...entityConfig.composants_affichage.tableaux);
    }
    if (entityConfig.composants_affichage.details) {
      componentsToCheck.push(...entityConfig.composants_affichage.details);
    }
    
    for (const component of componentsToCheck) {
      const paths = component.chemins || [component.chemin];
      
      for (const componentPath of paths) {
        const fullPath = path.join(PROJECT_ROOT, componentPath);
        
        if (await fileExists(fullPath)) {
          // Créer des patterns pour chercher les champs liés
          const patterns = {};
          for (const champ of liaison.champs) {
            patterns[champ] = new RegExp(`\\b${champ}\\b`, 'i');
          }
          
          const results = await searchInFile(fullPath, patterns);
          if (results && Object.values(results).some(r => r)) {
            found = true;
            break;
          }
        }
      }
      
      if (found) break;
    }
    
    if (found) {
      console.log(`    ${colors.green}✓ ${liaison.entite} (${liaison.champs.join(', ')})${colors.reset}`);
    } else {
      console.log(`    ${colors.yellow}⚠ ${liaison.entite} - liaison non vérifiée${colors.reset}`);
      auditResults.avertissements.push({
        type: 'liaison_non_verifiee',
        entite_source: entityName,
        entite_cible: liaison.entite,
        champs: liaison.champs
      });
    }
  }
}

/**
 * Vérifie les patterns communs de problèmes
 */
async function checkCommonPatterns() {
  console.log(`\n${colors.bright}Vérification des patterns communs:${colors.reset}`);
  
  // Vérifier l'utilisation de useEffect pour les mises à jour
  const componentsWithHooks = [];
  const componentsWithoutCleanup = [];
  
  async function checkDirectory(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !entry.name.includes('node_modules')) {
        await checkDirectory(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
        const content = await fs.readFile(fullPath, 'utf8');
        
        if (content.includes('useEffect')) {
          componentsWithHooks.push(entry.name);
          
          // Vérifier si le useEffect a un cleanup
          if (!content.includes('return () =>')) {
            componentsWithoutCleanup.push(entry.name);
          }
        }
      }
    }
  }
  
  await checkDirectory(path.join(SRC_PATH, 'components'));
  
  console.log(`  ${colors.cyan}Composants avec hooks: ${componentsWithHooks.length}${colors.reset}`);
  console.log(`  ${colors.yellow}Composants sans cleanup: ${componentsWithoutCleanup.length}${colors.reset}`);
  
  if (componentsWithoutCleanup.length > 0) {
    auditResults.suggestions.push({
      type: 'cleanup_manquant',
      description: 'Certains composants utilisent useEffect sans cleanup',
      composants: componentsWithoutCleanup.slice(0, 5) // Limiter à 5 exemples
    });
  }
}

/**
 * Génère le rapport d'audit
 */
async function generateReport() {
  const reportPath = path.join(PROJECT_ROOT, 'audit-liaisons-rapport.json');
  
  // Calculer les statistiques
  auditResults.statistiques = {
    total_composants: auditResults.composantsVerifies,
    total_liaisons: auditResults.liaisonsVerifiees,
    problemes_critiques: auditResults.problemes.length,
    avertissements: auditResults.avertissements.length,
    suggestions: auditResults.suggestions.length,
    score_sante: Math.round(
      ((auditResults.composantsVerifies - auditResults.problemes.length) / 
       auditResults.composantsVerifies) * 100
    )
  };
  
  await fs.writeFile(reportPath, JSON.stringify(auditResults, null, 2));
  
  console.log(`\n${colors.bright}=== Résumé de l'audit ===${colors.reset}`);
  console.log(`${colors.cyan}Composants vérifiés: ${auditResults.composantsVerifies}${colors.reset}`);
  console.log(`${colors.cyan}Liaisons vérifiées: ${auditResults.liaisonsVerifiees}${colors.reset}`);
  console.log(`${colors.red}Problèmes critiques: ${auditResults.problemes.length}${colors.reset}`);
  console.log(`${colors.yellow}Avertissements: ${auditResults.avertissements.length}${colors.reset}`);
  console.log(`${colors.blue}Suggestions: ${auditResults.suggestions.length}${colors.reset}`);
  console.log(`${colors.green}Score de santé: ${auditResults.statistiques.score_sante}%${colors.reset}`);
  console.log(`\nRapport détaillé généré: ${reportPath}`);
}

/**
 * Fonction principale
 */
async function main() {
  console.log(`${colors.bright}Audit des liaisons entre composants${colors.reset}`);
  console.log('='.repeat(50));
  
  try {
    // Charger le plan d'audit
    const auditPlan = await loadAuditPlan();
    
    // Vérifier chaque entité
    for (const [entityName, entityConfig] of Object.entries(auditPlan.entites_principales)) {
      await verifyEntityComponents(entityName, entityConfig);
      await verifyEntityRelations(entityName, entityConfig);
    }
    
    // Vérifications supplémentaires
    await checkCommonPatterns();
    
    // Générer le rapport
    await generateReport();
    
  } catch (error) {
    console.error(`${colors.red}Erreur lors de l'audit:${colors.reset}`, error);
    process.exit(1);
  }
}

// Lancer l'audit
main().catch(console.error);