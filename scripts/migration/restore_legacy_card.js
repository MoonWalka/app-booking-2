/**
 * Script pour restaurer l'ancien composant Card
 * À utiliser pendant la phase de test de suppression (1-15 juillet 2025)
 * si des problèmes sont détectés
 * 
 * Ce script:
 * 1. Vérifie si une sauvegarde du composant Card existe
 * 2. Restaure le fichier original à partir de la sauvegarde
 */

const fs = require('fs');
const path = require('path');

// Chemins des fichiers
const LEGACY_CARD_PATH = path.resolve(__dirname, '../../src/components/common/ui/Card.js');
const BACKUP_PATH = path.resolve(__dirname, '../../src/components/common/ui/Card.js.bak');

// Fonction principale
function main() {
  console.log('Restauration du composant Card legacy...');

  try {
    // Vérifier si le fichier de sauvegarde existe
    if (!fs.existsSync(BACKUP_PATH)) {
      console.error('❌ Aucun fichier de sauvegarde trouvé à l\'emplacement attendu.');
      console.error('Assurez-vous que le script disable_legacy_card.js a été exécuté auparavant.');
      return;
    }

    // Restaurer le fichier legacy
    console.log('🔄 Restauration du fichier legacy...');
    fs.copyFileSync(BACKUP_PATH, LEGACY_CARD_PATH);
    console.log(`✅ Fichier Card legacy restauré avec succès`);
    
    console.log('\n⚠️ Remarque: Le fichier de sauvegarde (.bak) a été conservé au cas où.');
    console.log('Si la phase de test est terminée, vous pouvez le supprimer manuellement.');
  } catch (error) {
    console.error(`❌ Une erreur est survenue: ${error.message}`);
  }
}

main();