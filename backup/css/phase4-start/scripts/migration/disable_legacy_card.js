/**
 * Script pour désactiver temporairement l'ancien composant Card
 * À utiliser pendant la phase de test de suppression (1-15 juillet 2025)
 * 
 * Ce script:
 * 1. Renomme le fichier legacy Card avec une extension .bak
 * 2. Créer un fichier de remplacement qui lance une erreur visible
 */

const fs = require('fs');
const path = require('path');

// Chemins des fichiers
const LEGACY_CARD_PATH = path.resolve(__dirname, '../../src/components/common/ui/Card.js');
const BACKUP_PATH = path.resolve(__dirname, '../../src/components/common/ui/Card.js.bak');
const REPLACEMENT_PATH = path.resolve(__dirname, '../../src/components/common/ui/Card.js');

// Fonction principale
function main() {
  console.log('Désactivation temporaire du composant Card legacy...');

  try {
    // Vérifier si le fichier legacy existe
    if (!fs.existsSync(LEGACY_CARD_PATH)) {
      console.error('❌ Le fichier legacy Card.js n\'existe pas à l\'emplacement attendu.');
      return;
    }

    // Sauvegarder le fichier legacy
    console.log('📦 Sauvegarde du fichier legacy...');
    fs.copyFileSync(LEGACY_CARD_PATH, BACKUP_PATH);
    console.log(`✅ Sauvegarde créée: ${BACKUP_PATH}`);

    // Créer un fichier de remplacement
    const replacementContent = `/**
 * @deprecated Ce composant est déprécié en faveur de src/components/ui/Card.js
 * En phase de test de suppression (1-15 juillet 2025)
 * 
 * CE FICHIER EST TEMPORAIREMENT DÉSACTIVÉ POUR TESTER L'IMPACT DE SA SUPPRESSION
 * Pour restaurer temporairement, exécutez: node scripts/migration/restore_legacy_card.js
 */

import React from 'react';

const Card = () => {
  throw new Error(
    'ERREUR DE TEST DE SUPPRESSION: Vous utilisez le composant Card déprécié qui est en cours de suppression. ' +
    'Veuillez utiliser @/components/ui/Card à la place. ' +
    'Voir docs/standards/components-standardises.md pour plus d\'informations.'
  );
};

// Sous-composants pour éviter les erreurs pendant le test
Card.Header = () => { throw new Error('Composant Card.Header déprécié'); };
Card.Body = () => { throw new Error('Composant Card.Body déprécié'); };
Card.Footer = () => { throw new Error('Composant Card.Footer déprécié'); };
Card.Media = () => { throw new Error('Composant Card.Media déprécié'); };

export default Card;`;

    fs.writeFileSync(REPLACEMENT_PATH, replacementContent);
    console.log('✅ Fichier de remplacement créé avec succès');
    console.log('\n⚠️ Le composant Card legacy est maintenant désactivé pour la phase de test de suppression');
    console.log('Pour le réactiver, exécutez: node scripts/migration/restore_legacy_card.js');
  } catch (error) {
    console.error(`❌ Une erreur est survenue: ${error.message}`);
  }
}

main();