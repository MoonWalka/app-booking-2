#!/usr/bin/env node
/**
 * Script pour remplacer les imports firebaseInit par firebase-service
 * Élimine la couche d'abstraction excessive
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class FirebaseImportReplacer {
  constructor() {
    this.replacements = 0;
    this.filesModified = 0;
  }

  // Patterns de remplacement
  getReplacementPatterns() {
    return [
      // Import depuis @/firebaseInit
      {
        pattern: /from\s+['"]@\/firebaseInit['"];?/g,
        replacement: "from '@/services/firebase-service';"
      },
      // Import depuis ../firebaseInit (relatif)
      {
        pattern: /from\s+['"]\.\.\/firebaseInit['"];?/g,
        replacement: "from '../services/firebase-service';"
      },
      // Import depuis ../../firebaseInit (relatif)
      {
        pattern: /from\s+['"]\.\.\/\.\.\/firebaseInit['"];?/g,
        replacement: "from '../../services/firebase-service';"
      },
      // Import depuis ../../../firebaseInit (relatif)
      {
        pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/firebaseInit['"];?/g,
        replacement: "from '../../../services/firebase-service';"
      },
      // Import depuis ../../../../firebaseInit (relatif)
      {
        pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/firebaseInit['"];?/g,
        replacement: "from '../../../../services/firebase-service';"
      },
      // Import depuis ./firebaseInit (même dossier)
      {
        pattern: /from\s+['"]\.\/firebaseInit['"];?/g,
        replacement: "from './services/firebase-service';"
      }
    ];
  }

  // Traiter un fichier
  processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let newContent = content;
      let fileModified = false;

      const patterns = this.getReplacementPatterns();
      
      patterns.forEach(({ pattern, replacement }) => {
        const matches = newContent.match(pattern);
        if (matches) {
          newContent = newContent.replace(pattern, replacement);
          this.replacements += matches.length;
          fileModified = true;
        }
      });

      if (fileModified) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        this.filesModified++;
        console.log(`✅ ${filePath} - ${this.replacements} remplacements`);
      }

    } catch (error) {
      console.error(`❌ Erreur traitement ${filePath}:`, error.message);
    }
  }

  // Exécuter le remplacement
  run() {
    console.log('🚀 Démarrage du remplacement des imports firebaseInit...\n');

    // Patterns de fichiers à traiter
    const patterns = [
      'src/**/*.js',
      'src/**/*.jsx'
    ];

    let allFiles = [];
    patterns.forEach(pattern => {
      const files = glob.sync(pattern, { 
        ignore: [
          'src/services/firebase-service.js', // Exclure le fichier source
          'node_modules/**',
          'build/**',
          'dist/**'
        ]
      });
      allFiles = allFiles.concat(files);
    });

    // Supprimer les doublons
    allFiles = [...new Set(allFiles)];

    console.log(`📁 ${allFiles.length} fichiers à traiter...\n`);

    // Traiter chaque fichier
    allFiles.forEach(file => {
      this.processFile(file);
    });

    // Rapport final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RAPPORT FINAL');
    console.log('='.repeat(60));
    console.log(`✅ Fichiers modifiés: ${this.filesModified}`);
    console.log(`🔄 Remplacements totaux: ${this.replacements}`);
    
    if (this.filesModified > 0) {
      console.log('\n🎯 SUCCÈS: Tous les imports firebaseInit ont été remplacés !');
      console.log('📝 Prochaine étape: Supprimer src/firebaseInit.js');
    } else {
      console.log('\n✨ Aucun import firebaseInit trouvé');
    }
  }
}

// Exécution
if (require.main === module) {
  const replacer = new FirebaseImportReplacer();
  replacer.run();
}

module.exports = FirebaseImportReplacer; 