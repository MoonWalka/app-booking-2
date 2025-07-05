#!/usr/bin/env node

/**
 * Script principal pour lancer l'audit complet des liaisons
 * Execute tous les scripts d'audit et génère un rapport consolidé
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');

// Scripts à exécuter
const AUDIT_SCRIPTS = [
  {
    name: 'Audit des liaisons',
    script: 'audit-liaisons.js',
    output: 'audit-liaisons-rapport.json'
  },
  {
    name: 'Analyse des flux de données',
    script: 'analyze-data-flow.js',
    output: 'data-flow-analysis.json'
  },
  {
    name: 'Vérification temps réel',
    script: 'check-realtime-updates.js',
    output: 'realtime-updates-report.json'
  }
];

// Couleurs console
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

/**
 * Execute un script d'audit
 */
function runAuditScript(scriptInfo) {
  return new Promise((resolve, reject) => {
    console.log(`\n${colors.blue}▶ Exécution: ${scriptInfo.name}${colors.reset}`);
    console.log('─'.repeat(50));
    
    const scriptPath = path.join(__dirname, scriptInfo.script);
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit'
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`${colors.green}✓ ${scriptInfo.name} terminé${colors.reset}`);
        resolve();
      } else {
        console.log(`${colors.red}✗ ${scriptInfo.name} échoué (code: ${code})${colors.reset}`);
        reject(new Error(`Script ${scriptInfo.script} failed with code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      console.error(`${colors.red}Erreur lors de l'exécution de ${scriptInfo.script}:${colors.reset}`, error);
      reject(error);
    });
  });
}

/**
 * Charge et fusionne les rapports
 */
async function consolidateReports() {
  console.log(`\n${colors.bright}Consolidation des rapports...${colors.reset}`);
  
  const consolidatedReport = {
    timestamp: new Date().toISOString(),
    audits: {},
    summary: {
      totalIssues: 0,
      criticalIssues: 0,
      warnings: 0,
      recommendations: 0
    },
    keyFindings: [],
    actionItems: []
  };
  
  // Charger chaque rapport
  for (const scriptInfo of AUDIT_SCRIPTS) {
    try {
      const reportPath = path.join(PROJECT_ROOT, scriptInfo.output);
      const reportContent = await fs.readFile(reportPath, 'utf8');
      const report = JSON.parse(reportContent);
      
      consolidatedReport.audits[scriptInfo.name] = report;
      
      // Extraire les métriques clés
      if (report.problemes) {
        consolidatedReport.summary.criticalIssues += report.problemes.length;
      }
      if (report.avertissements) {
        consolidatedReport.summary.warnings += report.avertissements.length;
      }
      if (report.potentialIssues) {
        consolidatedReport.summary.totalIssues += report.potentialIssues.length;
      }
      if (report.recommendations) {
        consolidatedReport.summary.recommendations += report.recommendations.length;
      }
      
    } catch (error) {
      console.error(`${colors.yellow}⚠ Impossible de charger ${scriptInfo.output}${colors.reset}`);
    }
  }
  
  // Générer les conclusions principales
  generateKeyFindings(consolidatedReport);
  generateActionItems(consolidatedReport);
  
  return consolidatedReport;
}

/**
 * Génère les conclusions principales
 */
function generateKeyFindings(report) {
  const findings = [];
  
  // Analyse des liaisons
  if (report.audits['Audit des liaisons']) {
    const audit = report.audits['Audit des liaisons'];
    if (audit.statistiques && audit.statistiques.score_sante < 80) {
      findings.push({
        severity: 'high',
        category: 'structure',
        finding: `Score de santé des composants: ${audit.statistiques.score_sante}%`,
        impact: 'La structure des composants nécessite une attention'
      });
    }
  }
  
  // Analyse des flux
  if (report.audits['Analyse des flux de données']) {
    const flow = report.audits['Analyse des flux de données'];
    if (flow.issues && flow.issues.length > 10) {
      findings.push({
        severity: 'medium',
        category: 'data-flow',
        finding: `${flow.issues.length} problèmes de flux de données détectés`,
        impact: 'Les données peuvent ne pas circuler efficacement'
      });
    }
  }
  
  // Analyse temps réel
  if (report.audits['Vérification temps réel']) {
    const realtime = report.audits['Vérification temps réel'];
    if (realtime.statistics && realtime.statistics.percentageWithRealtime < 50) {
      findings.push({
        severity: 'high',
        category: 'realtime',
        finding: `Seulement ${realtime.statistics.percentageWithRealtime}% des composants ont des mises à jour temps réel`,
        impact: 'Les données peuvent être désynchronisées'
      });
    }
  }
  
  report.keyFindings = findings;
}

/**
 * Génère les actions prioritaires
 */
function generateActionItems(report) {
  const actions = [];
  
  // Actions critiques
  if (report.summary.criticalIssues > 0) {
    actions.push({
      priority: 1,
      category: 'fix-critical',
      action: `Corriger les ${report.summary.criticalIssues} problèmes critiques`,
      effort: 'high',
      impact: 'critical'
    });
  }
  
  // Mise à jour temps réel
  const realtimeAudit = report.audits['Vérification temps réel'];
  if (realtimeAudit && realtimeAudit.recommendations) {
    const criticalRecs = realtimeAudit.recommendations.filter(r => r.priority === 'critical');
    if (criticalRecs.length > 0) {
      actions.push({
        priority: 2,
        category: 'realtime-updates',
        action: 'Implémenter les mises à jour temps réel manquantes',
        effort: 'medium',
        impact: 'high',
        details: criticalRecs[0].description
      });
    }
  }
  
  // Optimisations
  if (report.summary.warnings > 20) {
    actions.push({
      priority: 3,
      category: 'optimization',
      action: 'Optimiser les composants avec trop de dépendances',
      effort: 'medium',
      impact: 'medium'
    });
  }
  
  report.actionItems = actions.sort((a, b) => a.priority - b.priority);
}

/**
 * Génère le rapport final HTML
 */
async function generateHTMLReport(consolidatedReport) {
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport d'audit des liaisons - ${new Date().toLocaleDateString('fr-FR')}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: #2c3e50;
            color: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            margin: 10px 0;
        }
        .critical { color: #e74c3c; }
        .warning { color: #f39c12; }
        .info { color: #3498db; }
        .success { color: #27ae60; }
        .section {
            background: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .finding {
            padding: 15px;
            margin: 10px 0;
            border-left: 4px solid #3498db;
            background: #ecf0f1;
            border-radius: 4px;
        }
        .action-item {
            padding: 15px;
            margin: 10px 0;
            background: #e8f5e9;
            border-left: 4px solid #4caf50;
            border-radius: 4px;
        }
        .priority-1 { border-left-color: #e74c3c; background: #ffebee; }
        .priority-2 { border-left-color: #ff9800; background: #fff3e0; }
        .priority-3 { border-left-color: #2196f3; background: #e3f2fd; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Rapport d'audit des liaisons entre composants</h1>
        <p>Généré le ${new Date().toLocaleString('fr-FR')}</p>
    </div>
    
    <div class="summary-grid">
        <div class="metric-card">
            <div class="metric-label">Issues critiques</div>
            <div class="metric-value critical">${consolidatedReport.summary.criticalIssues}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Avertissements</div>
            <div class="metric-value warning">${consolidatedReport.summary.warnings}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Recommandations</div>
            <div class="metric-value info">${consolidatedReport.summary.recommendations}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Total problèmes</div>
            <div class="metric-value">${consolidatedReport.summary.totalIssues}</div>
        </div>
    </div>
    
    <div class="section">
        <h2>Conclusions principales</h2>
        ${consolidatedReport.keyFindings.map(finding => `
            <div class="finding">
                <h3>${finding.finding}</h3>
                <p><strong>Impact:</strong> ${finding.impact}</p>
                <p><strong>Catégorie:</strong> ${finding.category}</p>
            </div>
        `).join('')}
    </div>
    
    <div class="section">
        <h2>Actions prioritaires</h2>
        ${consolidatedReport.actionItems.map(action => `
            <div class="action-item priority-${action.priority}">
                <h3>${action.action}</h3>
                <p><strong>Priorité:</strong> ${action.priority} | <strong>Effort:</strong> ${action.effort} | <strong>Impact:</strong> ${action.impact}</p>
                ${action.details ? `<p>${action.details}</p>` : ''}
            </div>
        `).join('')}
    </div>
    
    <div class="section">
        <h2>Détails par audit</h2>
        ${Object.entries(consolidatedReport.audits).map(([name, audit]) => `
            <h3>${name}</h3>
            <pre>${JSON.stringify(audit.statistiques || audit.statistics || {}, null, 2)}</pre>
        `).join('')}
    </div>
</body>
</html>
  `;
  
  const htmlPath = path.join(PROJECT_ROOT, 'audit-report.html');
  await fs.writeFile(htmlPath, html);
  console.log(`${colors.green}✓ Rapport HTML généré: ${htmlPath}${colors.reset}`);
}

/**
 * Fonction principale
 */
async function main() {
  console.log(`${colors.bright}${colors.cyan}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║     Audit complet des liaisons             ║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}╚════════════════════════════════════════════╝${colors.reset}`);
  
  try {
    // Exécuter tous les scripts d'audit
    for (const script of AUDIT_SCRIPTS) {
      await runAuditScript(script);
    }
    
    // Consolider les rapports
    const consolidatedReport = await consolidateReports();
    
    // Sauvegarder le rapport consolidé
    const consolidatedPath = path.join(PROJECT_ROOT, 'audit-consolidated-report.json');
    await fs.writeFile(consolidatedPath, JSON.stringify(consolidatedReport, null, 2));
    console.log(`${colors.green}✓ Rapport consolidé: ${consolidatedPath}${colors.reset}`);
    
    // Générer le rapport HTML
    await generateHTMLReport(consolidatedReport);
    
    // Afficher le résumé
    console.log(`\n${colors.bright}=== Résumé de l'audit ===${colors.reset}`);
    console.log(`${colors.red}Issues critiques: ${consolidatedReport.summary.criticalIssues}${colors.reset}`);
    console.log(`${colors.yellow}Avertissements: ${consolidatedReport.summary.warnings}${colors.reset}`);
    console.log(`${colors.blue}Recommandations: ${consolidatedReport.summary.recommendations}${colors.reset}`);
    
    if (consolidatedReport.actionItems.length > 0) {
      console.log(`\n${colors.bright}Actions prioritaires:${colors.reset}`);
      consolidatedReport.actionItems.slice(0, 3).forEach((action, index) => {
        console.log(`${index + 1}. ${action.action}`);
      });
    }
    
    console.log(`\n${colors.green}${colors.bright}Audit terminé avec succès!${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}Erreur lors de l'audit:${colors.reset}`, error);
    process.exit(1);
  }
}

// Lancer l'audit complet
main().catch(console.error);