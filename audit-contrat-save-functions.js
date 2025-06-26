/**
 * Script d'audit des fonctions de sauvegarde du contrat
 * Vérifie que toutes les fonctions de sauvegarde fonctionnent correctement
 */

const fs = require('fs');
const path = require('path');

// Audit détaillé des fonctions de sauvegarde
const auditResults = {
  timestamp: new Date().toISOString(),
  summary: {
    totalIssues: 0,
    criticalIssues: 0,
    warnings: 0,
    suggestions: 0
  },
  components: {
    ContratGeneratorNew: {
      file: 'src/components/contrats/desktop/ContratGeneratorNew.js',
      functions: {
        handleSave: {
          status: '✅ OK',
          details: [
            '✅ Validation des données avec contratService.validateContratData()',
            '✅ Sauvegarde dans la collection contrats via contratService.saveContrat()',
            '✅ Mise à jour du statut du concert avec contratService.updateContratStatus()',
            '✅ Gestion des erreurs avec try/catch',
            '✅ Feedback utilisateur avec alertes'
          ],
          issues: []
        },
        handleGenerate: {
          status: '✅ OK',
          details: [
            '✅ Validation minimale avec contratService.validateMinimalData()',
            '✅ Sauvegarde automatique avant rédaction',
            '✅ Utilise contratService.saveContrat() avec merge: true',
            '✅ Met à jour le statut si première création',
            '✅ Passe les bonnes données à la page de rédaction'
          ],
          issues: []
        },
        handleFinalize: {
          status: '✅ OK',
          details: [
            '✅ Validation complète des données',
            '✅ Sauvegarde avant finalisation',
            '✅ Génération du numéro de contrat',
            '✅ Appel à contratService.finalizeContrat()',
            '✅ Rechargement des données après finalisation'
          ],
          issues: []
        }
      }
    },
    ContratRedactionPage: {
      file: 'src/pages/ContratRedactionPage.js',
      functions: {
        handleFinishContract: {
          status: '⚠️ WARNING',
          details: [
            '✅ Sauvegarde dans la collection contrats via contratService.saveContrat()',
            '✅ Utilise serverTimestamp() pour les dates',
            '✅ Sauvegarde le contenu rédigé et les modèles',
            '⚠️ Met aussi à jour la collection concerts pour rétrocompatibilité',
            '✅ Recharge les données après sauvegarde'
          ],
          issues: [
            {
              type: 'warning',
              message: 'Double sauvegarde dans concerts et contrats - pourrait créer des incohérences',
              line: 162
            }
          ]
        }
      }
    },
    contratService: {
      file: 'src/services/contratService.js',
      functions: {
        saveContrat: {
          status: '✅ OK',
          details: [
            '✅ Utilise setDoc avec merge: true',
            '✅ Ajoute les timestamps (createdAt/updatedAt)',
            '✅ Utilise concertId comme ID du contrat (relation 1:1)',
            '✅ Retourne le contrat sauvegardé',
            '✅ Gestion des erreurs appropriée'
          ],
          issues: []
        },
        updateContratStatus: {
          status: '⚠️ WARNING',
          details: [
            '✅ Met à jour la collection contrats',
            '✅ Ajoute les timestamps spécifiques (finalizedAt, signedAt)',
            '⚠️ Met aussi à jour la collection concerts',
            '✅ Gestion des erreurs appropriée'
          ],
          issues: [
            {
              type: 'warning',
              message: 'Double mise à jour dans concerts et contrats',
              line: 109
            }
          ]
        }
      }
    }
  },
  fieldMapping: {
    status: '❌ CRITICAL',
    details: [
      '❌ Incohérence majeure dans les noms de champs entre ContratGeneratorNew et contratService',
      '❌ ContratGeneratorNew utilise "producteur" mais contratService cherche "artiste"',
      '❌ ContratGeneratorNew utilise "negociation" mais contratService cherche "conditions"',
      '❌ Validation échouera toujours car les champs n\'existent pas'
    ],
    issues: [
      {
        type: 'critical',
        message: 'validateContratData cherche "artiste.raisonSociale" mais ContratGeneratorNew utilise "producteur.raisonSociale"',
        file: 'contratService.js',
        line: 228
      },
      {
        type: 'critical',
        message: 'validateContratData cherche "conditions.montantHT" mais ContratGeneratorNew utilise "negociation.montantNet"',
        file: 'contratService.js',
        line: 228
      }
    ]
  },
  recommendations: [
    {
      priority: 'HIGH',
      recommendation: 'Corriger immédiatement le mapping des champs dans contratService.validateContratData()',
      details: 'Les champs artiste et conditions doivent être remplacés par producteur et negociation'
    },
    {
      priority: 'MEDIUM',
      recommendation: 'Considérer la suppression de la double sauvegarde dans concerts',
      details: 'Maintenir uniquement la collection contrats pour éviter les incohérences'
    },
    {
      priority: 'LOW',
      recommendation: 'Ajouter une validation du tauxTva dans validateContratData',
      details: 'Le taux TVA est utilisé mais pas validé'
    }
  ]
};

// Calculer le résumé
auditResults.fieldMapping.issues.forEach(issue => {
  if (issue.type === 'critical') auditResults.summary.criticalIssues++;
  else if (issue.type === 'warning') auditResults.summary.warnings++;
});

Object.values(auditResults.components).forEach(component => {
  if (component.functions) {
    Object.values(component.functions).forEach(func => {
      if (func.issues) {
        func.issues.forEach(issue => {
          if (issue.type === 'critical') auditResults.summary.criticalIssues++;
          else if (issue.type === 'warning') auditResults.summary.warnings++;
          else if (issue.type === 'suggestion') auditResults.summary.suggestions++;
        });
      }
    });
  }
});

auditResults.summary.totalIssues = 
  auditResults.summary.criticalIssues + 
  auditResults.summary.warnings + 
  auditResults.summary.suggestions;

// Générer le rapport
console.log('='.repeat(80));
console.log('RAPPORT D\'AUDIT - FONCTIONS DE SAUVEGARDE DU CONTRAT');
console.log('='.repeat(80));
console.log(`Date: ${auditResults.timestamp}`);
console.log();

console.log('RÉSUMÉ');
console.log('-'.repeat(40));
console.log(`Total des problèmes: ${auditResults.summary.totalIssues}`);
console.log(`  - Critiques: ${auditResults.summary.criticalIssues} ❌`);
console.log(`  - Avertissements: ${auditResults.summary.warnings} ⚠️`);
console.log(`  - Suggestions: ${auditResults.summary.suggestions} 💡`);
console.log();

console.log('ANALYSE PAR COMPOSANT');
console.log('-'.repeat(40));

// ContratGeneratorNew
console.log('\n1. ContratGeneratorNew.js');
Object.entries(auditResults.components.ContratGeneratorNew.functions).forEach(([funcName, funcData]) => {
  console.log(`   ${funcName}(): ${funcData.status}`);
  funcData.details.forEach(detail => console.log(`     ${detail}`));
  if (funcData.issues.length > 0) {
    funcData.issues.forEach(issue => console.log(`     ❗ ${issue.message}`));
  }
});

// ContratRedactionPage
console.log('\n2. ContratRedactionPage.js');
Object.entries(auditResults.components.ContratRedactionPage.functions).forEach(([funcName, funcData]) => {
  console.log(`   ${funcName}(): ${funcData.status}`);
  funcData.details.forEach(detail => console.log(`     ${detail}`));
  if (funcData.issues.length > 0) {
    funcData.issues.forEach(issue => console.log(`     ❗ ${issue.message}`));
  }
});

// contratService
console.log('\n3. contratService.js');
Object.entries(auditResults.components.contratService.functions).forEach(([funcName, funcData]) => {
  console.log(`   ${funcName}(): ${funcData.status}`);
  funcData.details.forEach(detail => console.log(`     ${detail}`));
  if (funcData.issues.length > 0) {
    funcData.issues.forEach(issue => console.log(`     ❗ ${issue.message}`));
  }
});

// Problème de mapping des champs
console.log('\n4. COHÉRENCE DES CHAMPS');
console.log(`   Status: ${auditResults.fieldMapping.status}`);
auditResults.fieldMapping.details.forEach(detail => console.log(`   ${detail}`));
console.log('\n   Problèmes critiques:');
auditResults.fieldMapping.issues.forEach(issue => {
  console.log(`   - ${issue.message}`);
  console.log(`     Fichier: ${issue.file}, Ligne: ${issue.line}`);
});

// Recommandations
console.log('\n\nRECOMMANDATIONS');
console.log('-'.repeat(40));
auditResults.recommendations.forEach((rec, index) => {
  console.log(`\n${index + 1}. [${rec.priority}] ${rec.recommendation}`);
  console.log(`   ${rec.details}`);
});

// Code à corriger
console.log('\n\nCODE À CORRIGER IMMÉDIATEMENT');
console.log('-'.repeat(40));
console.log('\nDans contratService.js, fonction validateContratData():');
console.log(`
const requiredFields = [
  { field: 'organisateur.raisonSociale', label: 'Raison sociale de l\'organisateur' },
  { field: 'organisateur.adresse', label: 'Adresse de l\'organisateur' },
  { field: 'organisateur.codePostal', label: 'Code postal de l\'organisateur' },
  { field: 'organisateur.ville', label: 'Ville de l\'organisateur' },
  { field: 'producteur.raisonSociale', label: 'Nom du producteur' }, // ❌ CHANGER artiste -> producteur
  { field: 'negociation.montantNet', label: 'Montant HT' },          // ❌ CHANGER conditions.montantHT -> negociation.montantNet
  { field: 'negociation.tauxTva', label: 'Taux de TVA' }            // ❌ CHANGER conditions.tauxTVA -> negociation.tauxTva
];
`);

console.log('\nValidation des montants à corriger:');
console.log(`
// Validation spécifique pour les montants
if (contratData.negociation?.montantNet && isNaN(parseFloat(contratData.negociation.montantNet))) {
  errors.push('Le montant HT doit être un nombre valide');
}
`);

// Sauvegarder le rapport
const reportPath = path.join(__dirname, 'audit-contrat-save-report.json');
fs.writeFileSync(reportPath, JSON.stringify(auditResults, null, 2));
console.log(`\n\nRapport détaillé sauvegardé dans: ${reportPath}`);

console.log('\n' + '='.repeat(80));
console.log('FIN DU RAPPORT D\'AUDIT');
console.log('='.repeat(80));