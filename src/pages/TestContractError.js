import React, { useState } from 'react';
import ContratGenerator from '@/components/contrats/desktop/ContratGenerator';

const TestContractError = () => {
  const [showGenerator, setShowGenerator] = useState(false);
  
  // Données de test minimales
  const testConcert = {
    id: 'test-concert',
    titre: 'Concert Test',
    date: { seconds: Date.now() / 1000 },
    heure: '20h00',
    montant: 1000
  };
  
  const testArtiste = {
    nom: 'Artiste Test',
    genre: 'Rock',
    contact: 'test@test.com'
  };
  
  return (
    <div className="container mt-5">
      <h1>Test Erreur Contrat</h1>
      
      <button 
        className="btn btn-primary mb-4"
        onClick={() => setShowGenerator(!showGenerator)}
      >
        {showGenerator ? 'Masquer' : 'Afficher'} le générateur
      </button>
      
      {showGenerator && (
        <div>
          <h2>Générateur de contrat</h2>
          <ContratGenerator 
            concert={testConcert}
            programmateur={null}
            artiste={testArtiste}
            lieu={null}
          />
        </div>
      )}
    </div>
  );
};

export default TestContractError; 