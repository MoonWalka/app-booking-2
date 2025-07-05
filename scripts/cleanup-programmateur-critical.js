#!/usr/bin/env node

/**
 * Script de nettoyage des références critiques "programmateur" 
 * Corrige automatiquement les éléments les plus importants
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = '/Users/meltinrecordz/Documents/TourCraft/code/app-booking-2';

// Transformations critiques à appliquer
const CRITICAL_FIXES = [
  {
    file: 'src/utils/idGenerators.js',
    replacements: [
      {
        from: 'export const generateProgrammateurId = () => {',
        to: 'export const generateContactId = () => {'
      },
      {
        from: '* Génère un identifiant unique pour un contact',
        to: '* Génère un identifiant unique pour un contact'
      }
    ]
  },
  {
    file: 'src/utils/validation.js',
    replacements: [
      {
        from: 'export const validateProgrammateurForm = (data) => {',
        to: 'export const validateContactForm = (data) => {'
      }
    ]
  },
  {
    file: 'src/components/forms/PublicProgrammateurForm.js',
    newName: 'src/components/forms/PublicContactForm.js'
  },
  {
    file: 'src/components/concerts/sections/ConcertSearchBar.js',
    replacements: [
      {
        from: 'placeholder="Rechercher un concert par titre, lieu, programmateur..."',
        to: 'placeholder="Rechercher un concert par titre, lieu, contact..."'
      }
    ]
  },
  {
    file: 'src/components/concerts/ConcertsList.js',
    replacements: [
      {
        from: "id: 'programmateur',",
        to: "id: 'contact',"
      },
      {
        from: "label: 'Programmateur',",
        to: "label: 'Contact',"
      },
      {
        from: "placeholder: 'Nom du programmateur'",
        to: "placeholder: 'Nom du contact'"
      },
      {
        from: "status: 'no_programmateur',",
        to: "status: 'no_contact',"
      },
      {
        from: "tooltip: 'Aucun programmateur associé',",
        to: "tooltip: 'Aucun contact associé',"
      },
      {
        from: "tooltip: 'Envoyer formulaire au programmateur',",
        to: "tooltip: 'Envoyer formulaire au contact',"
      }
    ]
  },
  {
    file: 'src/components/concerts/sections/ConcertRow.js',
    replacements: [
      {
        from: '{concert.programmateurNom || \'Non spécifié\'}',
        to: '{concert.contactNom || \'Non spécifié\'}'
      }
    ]
  },
  {
    file: 'src/components/concerts/desktop/ConcertsListSimplified.js',
    replacements: [
      {
        from: 'concert.programmateur?.nom',
        to: 'concert.contact?.nom'
      }
    ]
  },
  {
    file: 'src/hooks/generics/index.js',
    replacements: [
      {
        from: "'artiste', 'concert', 'lieu', 'programmateur',",
        to: "'artiste', 'concert', 'lieu', 'contact',"
      }
    ]
  }
];

// CSS Classes à renommer
const CSS_CLASS_FIXES = [
  {
    file: 'src/components/concerts/sections/ContactSearchSection.module.css',
    replacements: [
      {
        from: '.programmateursList {',
        to: '.contactsList {'
      },
      {
        from: '.programmateurItem {',
        to: '.contactItem {'
      }
    ]
  },
  {
    file: 'src/components/concerts/desktop/ConcertOrganizerSection.module.css',
    replacements: [
      {
        from: '.programmateurSearchContainer {',
        to: '.contactSearchContainer {'
      },
      {
        from: '.selectedProgrammateur {',
        to: '.selectedContact {'
      },
      {
        from: '.programmateurCard {',
        to: '.contactCard {'
      },
      {
        from: '.programmateurInfo {',
        to: '.contactInfo {'
      },
      {
        from: '.programmateurName {',
        to: '.contactName {'
      },
      {
        from: '.programmateurStructure {',
        to: '.contactStructure {'
      },
      {
        from: '.programmateurContacts {',
        to: '.contactContacts {'
      },
      {
        from: '.programmateurContactItem {',
        to: '.contactContactItem {'
      },
      {
        from: '.programmateurContactItem i {',
        to: '.contactContactItem i {'
      },
      {
        from: '.programmateurItem {',
        to: '.contactItem {'
      },
      {
        from: '.programmateurItem:hover {',
        to: '.contactItem:hover {'
      },
      {
        from: '.programmateurDetails {',
        to: '.contactDetails {'
      }
    ]
  }
];

class CriticalCleanup {
  constructor() {
    this.processedFiles = [];
    this.errors = [];
  }

  /**
   * Lance le nettoyage critique
   */
  async run() {
    console.log('🧹 Début du nettoyage critique des références "programmateur"...\n');

    // 1. Corrections de code JavaScript
    this.processJavaScriptFixes();
    
    // 2. Corrections des classes CSS
    this.processCSSFixes();

    // 3. Résumé
    this.printSummary();

    console.log('\n✅ Nettoyage critique terminé!');
  }

  /**
   * Traite les corrections JavaScript
   */
  processJavaScriptFixes() {
    console.log('⚙️ Correction des fichiers JavaScript critiques...');

    CRITICAL_FIXES.forEach(fix => {
      const filePath = path.join(PROJECT_ROOT, fix.file);
      
      try {
        if (!fs.existsSync(filePath)) {
          console.log(`⚠️  Fichier non trouvé: ${fix.file}`);
          return;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        if (fix.replacements) {
          fix.replacements.forEach(replacement => {
            if (content.includes(replacement.from)) {
              content = content.replace(new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement.to);
              modified = true;
              console.log(`  ✓ ${fix.file}: "${replacement.from}" → "${replacement.to}"`);
            }
          });

          if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            this.processedFiles.push(fix.file);
          }
        }

        // Renommage de fichier si spécifié
        if (fix.newName) {
          const newPath = path.join(PROJECT_ROOT, fix.newName);
          const newDir = path.dirname(newPath);
          
          if (!fs.existsSync(newDir)) {
            fs.mkdirSync(newDir, { recursive: true });
          }
          
          fs.renameSync(filePath, newPath);
          console.log(`  🔄 Renommé: ${fix.file} → ${fix.newName}`);
          this.processedFiles.push(`${fix.file} → ${fix.newName}`);
        }

      } catch (error) {
        console.error(`❌ Erreur avec ${fix.file}:`, error.message);
        this.errors.push({ file: fix.file, error: error.message });
      }
    });
  }

  /**
   * Traite les corrections CSS
   */
  processCSSFixes() {
    console.log('\n🎨 Correction des classes CSS critiques...');

    CSS_CLASS_FIXES.forEach(fix => {
      const filePath = path.join(PROJECT_ROOT, fix.file);
      
      try {
        if (!fs.existsSync(filePath)) {
          console.log(`⚠️  Fichier CSS non trouvé: ${fix.file}`);
          return;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        fix.replacements.forEach(replacement => {
          if (content.includes(replacement.from)) {
            content = content.replace(new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement.to);
            modified = true;
            console.log(`  ✓ ${fix.file}: "${replacement.from}" → "${replacement.to}"`);
          }
        });

        if (modified) {
          fs.writeFileSync(filePath, content, 'utf8');
          if (!this.processedFiles.includes(fix.file)) {
            this.processedFiles.push(fix.file);
          }
        }

      } catch (error) {
        console.error(`❌ Erreur CSS avec ${fix.file}:`, error.message);
        this.errors.push({ file: fix.file, error: error.message });
      }
    });
  }

  /**
   * Affiche le résumé des modifications
   */
  printSummary() {
    console.log('\n📊 RÉSUMÉ DES MODIFICATIONS:');
    console.log(`✅ Fichiers traités: ${this.processedFiles.length}`);
    
    if (this.processedFiles.length > 0) {
      console.log('\n📝 Fichiers modifiés:');
      this.processedFiles.forEach(file => {
        console.log(`  - ${file}`);
      });
    }

    if (this.errors.length > 0) {
      console.log(`\n❌ Erreurs: ${this.errors.length}`);
      this.errors.forEach(error => {
        console.log(`  - ${error.file}: ${error.error}`);
      });
    }

    console.log('\n🎯 PROCHAINES ÉTAPES:');
    console.log('1. Vérifier que l\'application compile sans erreur');
    console.log('2. Tester les fonctionnalités modifiées');
    console.log('3. Mettre à jour les références aux classes CSS renommées dans les composants');
    console.log('4. Traiter les éléments non-critiques restants si souhaité');
  }
}

// Exécution du script
if (require.main === module) {
  const cleanup = new CriticalCleanup();
  cleanup.run().catch(console.error);
}

module.exports = CriticalCleanup;