import React from 'react';
import { Button } from 'react-bootstrap';
import { FaMagic } from 'react-icons/fa';

function DevisAutoFillButton({ onAutoFill }) {
  // Générateur de données aléatoires
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomElement = (array) => array[Math.floor(Math.random() * array.length)];

  const handleAutoFill = () => {
    const montantHT = randomInt(1000, 5000);
    const tauxTVA = 5.5; // TVA réduite pour spectacles
    const montantTVA = Math.round(montantHT * tauxTVA / 100);
    const montantTTC = montantHT + montantTVA;

    const autoFillData = {
      // Montants principaux
      montantHT: montantHT,
      tauxTVA: tauxTVA,
      montantTVA: montantTVA,
      montantTTC: montantTTC,
      
      // Ligne principale
      lignes: [{
        description: randomElement([
          'Prestation artistique - Concert acoustique',
          'Spectacle musical - Formation complète',
          'Concert jazz - Quartet',
          'Performance live - Groupe rock',
          'Récital piano - Soliste'
        ]),
        quantite: 1,
        prixUnitaire: montantHT,
        montant: montantHT
      }],
      
      // Options supplémentaires (50% de chance)
      ...(Math.random() > 0.5 && {
        fraisTechniques: randomInt(200, 800),
        fraisDeplacements: randomInt(100, 500),
        fraisHebergement: randomInt(200, 600),
        fraisRestauration: randomInt(50, 200)
      }),
      
      // Informations de paiement
      delaiPaiement: randomElement(['30', '45', '60']),
      modePaiement: randomElement(['Virement', 'Chèque', 'Virement SEPA']),
      
      // Conditions
      conditions: randomElement([
        'Paiement à réception de facture',
        'Acompte de 30% à la signature, solde après prestation',
        'Paiement intégral avant la prestation',
        'Paiement 50% à la signature, 50% le jour J'
      ]),
      
      // Notes
      notes: randomElement([
        'Devis valable 30 jours',
        'Prix incluant la sonorisation',
        'Transport et hébergement inclus',
        'Tarif préférentiel fidélité',
        'Offre spéciale saison culturelle'
      ])
    };

    // Appeler la fonction de callback avec les données
    if (onAutoFill) {
      onAutoFill(autoFillData);
    }
  };

  // Ne s'affiche qu'en développement
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Button
      variant="warning"
      size="sm"
      onClick={handleAutoFill}
      className="d-flex align-items-center"
      style={{ 
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}
    >
      <FaMagic className="me-2" />
      Remplir automatiquement
    </Button>
  );
}

export default DevisAutoFillButton;