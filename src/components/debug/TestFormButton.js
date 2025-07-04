/**
 * Bouton simple pour remplir un formulaire avec des données de test
 */
import React from 'react';
import { Button } from 'react-bootstrap';
import { FaFlask } from 'react-icons/fa';

function TestFormButton({ onFormFill, variant = 'outline-primary', size = 'sm' }) {
  // Ne pas afficher en production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomElement = (array) => array[Math.floor(Math.random() * array.length)];

  const handleClick = () => {
    const testData = {
      // Structure
      structureRaisonSociale: `[TEST] Association Test ${randomInt(1000, 9999)}`,
      nom: `[TEST] Association Test ${randomInt(1000, 9999)}`,
      structureAdresse: `${randomInt(1, 200)} rue de Test`,
      structureCodePostal: `${randomInt(10, 95)}000`,
      structureVille: randomElement(['Paris', 'Lyon', 'Marseille', 'Toulouse']),
      structureSiret: Array.from({ length: 14 }, () => randomInt(0, 9)).join(''),
      structureNumeroTva: `FR${randomInt(10, 99)}${Array.from({ length: 9 }, () => randomInt(0, 9)).join('')}`,
      
      // Signataire
      personneNom: randomElement(['Dupont', 'Martin', 'Bernard', 'Durand']),
      personnePrenom: randomElement(['Jean', 'Marie', 'Pierre', 'Sophie']),
      personneFonction: randomElement(['Directeur', 'Programmateur', 'Responsable']),
      personneEmail: `test${randomInt(1000, 9999)}@example.com`,
      personneTelephone: `06 ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)}`
    };

    if (onFormFill) {
      onFormFill(testData);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      title="Remplir avec des données de test"
    >
      <FaFlask className="me-1" />
      Données de test
    </Button>
  );
}

export default TestFormButton;