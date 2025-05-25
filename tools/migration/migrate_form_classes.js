#!/usr/bin/env node

/**
 * Script de migration automatique des classes Bootstrap form-* vers FormField TourCraft
 * 
 * Usage: node tools/migration/migrate_form_classes.js [--dry-run] [--file=path]
 * 
 * Options:
 * --dry-run : Affiche les changements sans les appliquer
 * --file=path : Migre un fichier spécifique
 * --auto : Mode automatique (sans confirmation)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SRC_DIR = path.join(__dirname, '../../src');
const BACKUP_DIR = path.join(__dirname, '../../backups/form-migration');

// Patterns de migration
const MIGRATION_PATTERNS = [
  // form-control simple
  {
    pattern: /className="form-control"/g,
    replacement: 'className={styles.formField}',
    description: 'form-control simple'
  },
  // form-control avec classes supplémentaires
  {
    pattern: /className="form-control ([^"]+)"/g,
    replacement: 'className={`${styles.formField} $1`}',
    description: 'form-control avec classes'
  },
  // form-control avec template literals
  {
    pattern: /className={`form-control ([^`]+)`}/g,
    replacement: 'className={`${styles.formField} $1`}',
    description: 'form-control template literal'
  },
  // form-select
  {
    pattern: /className="form-select"/g,
    replacement: 'className={styles.formSelect}',
    description: 'form-select simple'
  },
  // form-group
  {
    pattern: /<div className="form-group">/g,
    replacement: '<div className={styles.formGroup}>',
    description: 'form-group div'
  },
  // form-label
  {
    pattern: /className="form-label"/g,
    replacement: 'className={styles.formLabel}',
    description: 'form-label'
  },
  // form-text
  {
    pattern: /className="form-text text-muted"/g,
    replacement: 'className={styles.helpText}',
    description: 'form-text help'
  },
  // form-check
  {
    pattern: /className="form-check"/g,
    replacement: 'className={styles.formCheck}',
    description: 'form-check'
  },
  // form-check-input
  {
    pattern: /className="form-check-input"/g,
    replacement: 'className={styles.formCheckInput}',
    description: 'form-check-input'
  },
  // form-check-label
  {
    pattern: /className="form-check-label"/g,
    replacement: 'className={styles.formCheckLabel}',
    description: 'form-check-label'
  }
];

// Patterns complexes nécessitant une analyse manuelle
const COMPLEX_PATTERNS = [
  /form-control.*is-invalid/,
  /form-control.*is-valid/,
  /formErrors.*form-control/,
  /touched.*form-control/
];

class FormMigrator {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.auto = options.auto || false;
    this.targetFile = options.file;
    this.stats = {
      filesAnalyzed: 0,
      filesModified: 0,
      patternsReplaced: 0,
      complexCases: 0
    };
  }

  // Analyser un fichier
  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const analysis = {
      file: filePath,
      simpleReplacements: [],
      complexCases: [],
      needsFormFieldImport: false,
      needsStylesImport: false
    };

    // Vérifier les patterns simples
    MIGRATION_PATTERNS.forEach(({ pattern, replacement, description }) => {
      const matches = content.match(pattern);
      if (matches) {
        analysis.simpleReplacements.push({
          pattern: pattern.toString(),
          replacement,
          description,
          count: matches.length
        });
        analysis.needsStylesImport = true;
      }
    });

    // Vérifier les patterns complexes
    COMPLEX_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        analysis.complexCases.push({
          pattern: pattern.toString(),
          matches: matches,
          needsManualReview: true
        });
      }
    });

    // Vérifier si FormField import est nécessaire
    if (content.includes('form-control') && !content.includes('FormField')) {
      analysis.needsFormFieldImport = true;
    }

    return analysis;
  }

  // Migrer un fichier
  migrateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    const changes = [];

    // Créer backup
    if (!this.dryRun) {
      this.createBackup(filePath);
    }

    // Appliquer les patterns simples
    MIGRATION_PATTERNS.forEach(({ pattern, replacement, description }) => {
      const originalContent = content;
      content = content.replace(pattern, replacement);
      
      if (content !== originalContent) {
        modified = true;
        const matches = originalContent.match(pattern);
        changes.push({
          description,
          count: matches ? matches.length : 0
        });
        this.stats.patternsReplaced += matches ? matches.length : 0;
      }
    });

    // Ajouter l'import des styles si nécessaire
    if (modified && !content.includes("import styles from")) {
      const importMatch = content.match(/import.*from.*['"]\./);
      if (importMatch) {
        const insertIndex = content.indexOf(importMatch[0]) + importMatch[0].length + 1;
        content = content.slice(0, insertIndex) + 
                 "\nimport styles from './FormField.module.css';" + 
                 content.slice(insertIndex);
      }
    }

    // Écrire le fichier modifié
    if (modified && !this.dryRun) {
      fs.writeFileSync(filePath, content, 'utf8');
      this.stats.filesModified++;
    }

    return { modified, changes, content };
  }

  // Créer un backup
  createBackup(filePath) {
    const relativePath = path.relative(SRC_DIR, filePath);
    const backupPath = path.join(BACKUP_DIR, relativePath);
    const backupDir = path.dirname(backupPath);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    fs.copyFileSync(filePath, backupPath);
  }

  // Obtenir tous les fichiers JS
  getJSFiles() {
    const files = [];
    
    function scanDir(dir) {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.')) {
          scanDir(fullPath);
        } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
          files.push(fullPath);
        }
      });
    }
    
    scanDir(SRC_DIR);
    return files;
  }

  // Analyser tous les fichiers
  analyzeAll() {
    const files = this.targetFile ? [this.targetFile] : this.getJSFiles();
    const results = [];

    console.log(`🔍 Analyse de ${files.length} fichiers...`);

    files.forEach(file => {
      this.stats.filesAnalyzed++;
      const analysis = this.analyzeFile(file);
      
      if (analysis.simpleReplacements.length > 0 || analysis.complexCases.length > 0) {
        results.push(analysis);
      }
    });

    return results;
  }

  // Migrer tous les fichiers
  migrateAll() {
    const analyses = this.analyzeAll();
    
    console.log(`\n📊 Résultats de l'analyse:`);
    console.log(`- ${analyses.length} fichiers nécessitent une migration`);
    
    let totalSimple = 0;
    let totalComplex = 0;
    
    analyses.forEach(analysis => {
      totalSimple += analysis.simpleReplacements.reduce((sum, r) => sum + r.count, 0);
      totalComplex += analysis.complexCases.length;
    });
    
    console.log(`- ${totalSimple} remplacements simples possibles`);
    console.log(`- ${totalComplex} cas complexes nécessitant une révision manuelle`);

    if (this.dryRun) {
      console.log(`\n🔍 MODE DRY-RUN - Aucun fichier ne sera modifié\n`);
    }

    // Afficher les détails
    analyses.forEach(analysis => {
      console.log(`\n📄 ${path.relative(SRC_DIR, analysis.file)}`);
      
      if (analysis.simpleReplacements.length > 0) {
        console.log(`  ✅ Remplacements simples:`);
        analysis.simpleReplacements.forEach(r => {
          console.log(`    - ${r.description}: ${r.count} occurrence(s)`);
        });
      }
      
      if (analysis.complexCases.length > 0) {
        console.log(`  ⚠️  Cas complexes (révision manuelle requise):`);
        analysis.complexCases.forEach(c => {
          console.log(`    - ${c.pattern}`);
        });
        this.stats.complexCases += analysis.complexCases.length;
      }
    });

    // Demander confirmation si pas en mode auto
    if (!this.dryRun && !this.auto && totalSimple > 0) {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      return new Promise((resolve) => {
        rl.question(`\n❓ Voulez-vous appliquer ces ${totalSimple} remplacements ? (y/N): `, (answer) => {
          rl.close();
          
          if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
            this.performMigration(analyses);
          } else {
            console.log('❌ Migration annulée');
          }
          resolve();
        });
      });
    } else if (!this.dryRun && totalSimple > 0) {
      this.performMigration(analyses);
    }
  }

  // Effectuer la migration
  performMigration(analyses) {
    console.log(`\n🚀 Début de la migration...`);

    analyses.forEach(analysis => {
      if (analysis.simpleReplacements.length > 0) {
        const result = this.migrateFile(analysis.file);
        
        if (result.modified) {
          console.log(`✅ ${path.relative(SRC_DIR, analysis.file)} migré`);
          result.changes.forEach(change => {
            console.log(`   - ${change.description}: ${change.count} remplacement(s)`);
          });
        }
      }
    });

    this.printStats();
  }

  // Afficher les statistiques
  printStats() {
    console.log(`\n📊 Statistiques de migration:`);
    console.log(`- Fichiers analysés: ${this.stats.filesAnalyzed}`);
    console.log(`- Fichiers modifiés: ${this.stats.filesModified}`);
    console.log(`- Patterns remplacés: ${this.stats.patternsReplaced}`);
    console.log(`- Cas complexes détectés: ${this.stats.complexCases}`);
    
    if (this.stats.complexCases > 0) {
      console.log(`\n⚠️  ${this.stats.complexCases} cas complexes nécessitent une révision manuelle`);
      console.log(`   Ces cas impliquent généralement des validations ou des états conditionnels`);
    }
  }
}

// CLI
function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    auto: args.includes('--auto'),
    file: args.find(arg => arg.startsWith('--file='))?.split('=')[1]
  };

  if (args.includes('--help')) {
    console.log(`
🛠️  Script de migration des classes Bootstrap form-* vers FormField TourCraft

Usage: node tools/migration/migrate_form_classes.js [options]

Options:
  --dry-run     Affiche les changements sans les appliquer
  --auto        Mode automatique (sans confirmation)
  --file=path   Migre un fichier spécifique
  --help        Affiche cette aide

Exemples:
  node tools/migration/migrate_form_classes.js --dry-run
  node tools/migration/migrate_form_classes.js --file=src/components/test.js
  node tools/migration/migrate_form_classes.js --auto
    `);
    return;
  }

  console.log('🎯 Migration des classes Bootstrap form-* vers FormField TourCraft\n');

  const migrator = new FormMigrator(options);
  migrator.migrateAll();
}

if (require.main === module) {
  main();
}

module.exports = FormMigrator; 