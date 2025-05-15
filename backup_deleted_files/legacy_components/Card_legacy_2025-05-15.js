/**
 * @deprecated Ce composant est déprécié en faveur de src/components/ui/Card.js
 * En phase de test de suppression (1-15 juillet 2025)
 * 
 * CE FICHIER EST TEMPORAIREMENT DÉSACTIVÉ POUR TESTER L'IMPACT DE SA SUPPRESSION
 * Pour restaurer temporairement, exécutez: node scripts/migration/restore_legacy_card.js
 */

import React from 'react';

const Card = () => {
  throw new Error(
    "ERREUR DE TEST DE SUPPRESSION: Vous utilisez le composant Card déprécié qui est en cours de suppression. " +
    "Veuillez utiliser @/components/ui/Card à la place. " +
    "Voir docs/standards/components-standardises.md pour plus d'informations."
  );
};

// Sous-composants pour éviter les erreurs pendant le test
Card.Header = () => { throw new Error("Composant Card.Header déprécié"); };
Card.Body = () => { throw new Error("Composant Card.Body déprécié"); };
Card.Footer = () => { throw new Error("Composant Card.Footer déprécié"); };
Card.Media = () => { throw new Error("Composant Card.Media déprécié"); };

export default Card;