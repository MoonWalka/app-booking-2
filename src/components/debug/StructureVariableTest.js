import React, { useState, useEffect } from 'react';
import { db } from '@/services/firebase-service';
import { 
  collection, 
  query, 
  limit,
  getDocs
} from '@/services/firebase-service';
import ContratPDFWrapper from '@/components/pdf/ContratPDFWrapper';
import Button from '@/components/ui/Button';

/**
 * Composant de test pour vérifier le fonctionnement des variables de structure
 * Permet de tester la gestion des adresses en tant qu'objets vs chaînes
 */
const StructureVariableTest = () => {
  const [structures, setStructures] = useState([]);
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Données de test pour simuler un contrat
  const mockConcert = {
    id: 'test-concert-id',
    titre: 'Concert de Test',
    date: new Date(),
    heure: '20:00',
    montant: 800
  };
  
  const mockContact = {
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@test.fr',
    telephone: '01 23 45 67 89',
    structure: 'Structure de Test',
    structureId: null // Sera défini dynamiquement
  };
  
  // Alias pour rétrocompatibilité
  const mockProgrammateur = mockContact;
  
  const mockArtiste = {
    nom: 'Les Artistes de Test',
    genre: 'Rock',
    contact: 'contact@artistes.fr'
  };
  
  const mockLieu = {
    nom: 'Salle de Test',
    adresse: '123 Rue du Test',
    ville: 'Paris',
    codePostal: '75001',
    capacite: '500'
  };

  // Charger quelques structures pour les tests
  useEffect(() => {
    loadStructures();
  }, []);

  const loadStructures = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'structures'), limit(10));
      const snapshot = await getDocs(q);
      const structuresList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('🏢 Structures chargées pour test:', structuresList);
      setStructures(structuresList);
    } catch (error) {
      console.error('Erreur lors du chargement des structures:', error);
    } finally {
      setLoading(false);
    }
  };

  const testStructureVariables = async (structure) => {
    console.log('🧪 Test des variables de structure avec:', structure);
    
    // Mettre à jour le contact de test avec l'ID de structure
    // const testcontact = {
    //   ...mockcontact,
    //   structureId: structure.id
    // };
    
    try {
      // Simuler la préparation des variables comme dans useContratGenerator
      const testVariables = prepareTestVariables(structure);
      
      setTestResults({
        structure,
        variables: testVariables,
        success: true,
        timestamp: new Date().toISOString()
      });
      
      console.log('✅ Test réussi - Variables préparées:', testVariables);
      
    } catch (error) {
      console.error('❌ Erreur lors du test:', error);
      setTestResults({
        structure,
        error: error.message,
        success: false,
        timestamp: new Date().toISOString()
      });
    }
  };

  const prepareTestVariables = (structureData) => {
    console.log('📋 Préparation des variables de test avec structureData:', structureData);
    
    // Fonction helper pour sécuriser les valeurs
    const safeStringValue = (value, fallback = 'Non spécifié') => {
      if (value === null || value === undefined) return fallback;
      if (typeof value === 'string') return value;
      if (typeof value === 'number') return value.toString();
      if (typeof value === 'object') {
        console.warn('⚠️ Tentative d\'affichage d\'un objet comme string:', value);
        return fallback;
      }
      return String(value);
    };

    // Test des variables structure avec les deux formats possibles d'adresse
    const variables = {
      // Test de base
      structure_nom: safeStringValue(structureData?.nom || structureData?.raisonSociale, 'Non spécifiée'),
      structure_siret: safeStringValue(structureData?.siret, 'Non spécifié'),
      structure_email: safeStringValue(structureData?.email, 'Non spécifié'),
      structure_telephone: safeStringValue(structureData?.telephone, 'Non spécifié'),
      structure_type: safeStringValue(structureData?.type, 'Non spécifié'),
      
      // Test spécifique pour les adresses (le point critique)
      structure_adresse: (() => {
        console.log('🏠 Test adresse - Type:', typeof structureData?.adresse, 'Valeur:', structureData?.adresse);
        
        // L'adresse est un objet avec {adresse, codePostal, ville, pays}
        if (structureData?.adresse && typeof structureData.adresse === 'object') {
          const adresseResult = safeStringValue(structureData.adresse.adresse, 'Non spécifiée');
          console.log('✅ Adresse extraite depuis l\'objet:', adresseResult);
          return adresseResult;
        }
        // Fallback si l'adresse est une chaîne directement
        const adresseResult = safeStringValue(structureData?.adresse, 'Non spécifiée');
        console.log('📝 Adresse directe:', adresseResult);
        return adresseResult;
      })(),
      
      structure_code_postal: (() => {
        console.log('📮 Test code postal - Adresse type:', typeof structureData?.adresse);
        
        if (structureData?.adresse && typeof structureData.adresse === 'object') {
          const result = safeStringValue(structureData.adresse.codePostal, 'Non spécifié');
          console.log('✅ Code postal extrait depuis l\'objet:', result);
          return result;
        }
        const result = safeStringValue(structureData?.codePostal, 'Non spécifié');
        console.log('📝 Code postal direct:', result);
        return result;
      })(),
      
      structure_ville: (() => {
        console.log('🏙️ Test ville - Adresse type:', typeof structureData?.adresse);
        
        if (structureData?.adresse && typeof structureData.adresse === 'object') {
          const result = safeStringValue(structureData.adresse.ville, 'Non spécifiée');
          console.log('✅ Ville extraite depuis l\'objet:', result);
          return result;
        }
        const result = safeStringValue(structureData?.ville, 'Non spécifiée');
        console.log('📝 Ville directe:', result);
        return result;
      })(),
      
      structure_pays: (() => {
        console.log('🌍 Test pays - Adresse type:', typeof structureData?.adresse);
        
        if (structureData?.adresse && typeof structureData.adresse === 'object') {
          const result = safeStringValue(structureData.adresse.pays, 'France');
          console.log('✅ Pays extrait depuis l\'objet:', result);
          return result;
        }
        const result = safeStringValue(structureData?.pays, 'France');
        console.log('📝 Pays direct:', result);
        return result;
      })()
    };

    // Vérifier s'il y a des valeurs '[object Object]' (ce qu'on veut éviter)
    const problematicVariables = Object.entries(variables).filter(([key, value]) => 
      typeof value === 'string' && value.includes('[object Object]')
    );

    if (problematicVariables.length > 0) {
      console.error('❌ Variables problématiques détectées:', problematicVariables);
      throw new Error(`Variables avec '[object Object]' détectées: ${problematicVariables.map(([k,v]) => k).join(', ')}`);
    }

    console.log('📊 Variables finales préparées:', variables);
    return variables;
  };

  const testContractGeneration = async (structure) => {
    if (!structure) return;
    
    console.log('📄 Test de génération de contrat avec structure:', structure);
    
    try {
      // Simuler les données pour la génération de contrat
      const contractData = {
        template: {
          id: 'test-template',
          name: 'Template de Test',
          bodyContent: `
            <div>
              <h2>Contrat de Test</h2>
              <p><strong>Structure:</strong> {structure_nom}</p>
              <p><strong>SIRET:</strong> {structure_siret}</p>
              <p><strong>Adresse:</strong> {structure_adresse}</p>
              <p><strong>Code Postal:</strong> {structure_code_postal}</p>
              <p><strong>Ville:</strong> {structure_ville}</p>
              <p><strong>Pays:</strong> {structure_pays}</p>
              <p><strong>Email:</strong> {structure_email}</p>
              <p><strong>Téléphone:</strong> {structure_telephone}</p>
              <p><strong>Type:</strong> {structure_type}</p>
            </div>
          `,
          headerContent: '',
          footerContent: '',
          signatureTemplate: ''
        },
        structure: structure,
        concert: mockConcert,
        contact: { ...mockContact, structureId: structure.id },
        programmateur: { ...mockProgrammateur, structureId: structure.id }, // Rétrocompatibilité
        artiste: mockArtiste,
        lieu: mockLieu
      };

      // Générer le HTML du contrat pour voir le résultat
      const htmlContent = ContratPDFWrapper.getContratHTML(contractData, 'Test de Variables Structure', true);
      
      console.log('📝 HTML généré:', htmlContent.substring(0, 500) + '...');
      
      // Vérifier s'il y a des '[object Object]' dans le HTML
      const hasObjectErrors = htmlContent.includes('[object Object]');
      
      setTestResults(prev => ({
        ...prev,
        contractHtml: htmlContent,
        hasObjectErrors,
        contractGenerated: true
      }));
      
      if (hasObjectErrors) {
        console.error('❌ Le HTML généré contient des "[object Object]"');
      } else {
        console.log('✅ HTML généré sans erreurs d\'objet');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la génération du contrat de test:', error);
      setTestResults(prev => ({
        ...prev,
        contractError: error.message
      }));
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🧪 Test des Variables de Structure</h2>
      <p>Ce test vérifie que les adresses de structure en format objet sont correctement gérées.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <Button 
          onClick={loadStructures}
          disabled={loading}
          style={{ marginRight: '10px' }}
        >
          {loading ? 'Chargement...' : '🔄 Recharger les structures'}
        </Button>
      </div>

      {/* Liste des structures */}
      {structures.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3>📋 Structures disponibles pour test</h3>
          {structures.map(structure => (
            <div key={structure.id} style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '10px', 
              marginBottom: '10px', 
              borderRadius: '5px',
              border: selectedStructure?.id === structure.id ? '2px solid #007bff' : '1px solid #ddd'
            }}>
              <div><strong>ID:</strong> {structure.id}</div>
              <div><strong>Nom:</strong> {structure.nom || structure.raisonSociale || 'N/A'}</div>
              <div><strong>Type d'adresse:</strong> {typeof structure.adresse}</div>
              <div><strong>Adresse:</strong> {
                typeof structure.adresse === 'object' 
                  ? JSON.stringify(structure.adresse).substring(0, 100) + '...'
                  : structure.adresse || 'N/A'
              }</div>
              
              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <Button
                  onClick={() => {
                    setSelectedStructure(structure);
                    testStructureVariables(structure);
                  }}
                  style={{ 
                    backgroundColor: '#28a745', 
                    color: 'white', 
                    fontSize: '12px',
                    padding: '5px 10px'
                  }}
                >
                  🧪 Tester Variables
                </Button>
                
                <Button
                  onClick={() => {
                    setSelectedStructure(structure);
                    testContractGeneration(structure);
                  }}
                  style={{ 
                    backgroundColor: '#007bff', 
                    color: 'white', 
                    fontSize: '12px',
                    padding: '5px 10px'
                  }}
                >
                  📄 Tester Contrat
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Résultats des tests */}
      {testResults && (
        <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px', marginTop: '20px' }}>
          <h3>📊 Résultats du Test</h3>
          <div><strong>Timestamp:</strong> {testResults.timestamp}</div>
          <div><strong>Structure testée:</strong> {testResults.structure.id}</div>
          
          {testResults.success ? (
            <div style={{ color: 'green' }}>✅ Test des variables réussi</div>
          ) : (
            <div style={{ color: 'red' }}>❌ Erreur: {testResults.error}</div>
          )}
          
          {testResults.variables && (
            <div style={{ marginTop: '15px' }}>
              <h4>🔧 Variables extraites:</h4>
              <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '3px', fontSize: '12px' }}>
                {Object.entries(testResults.variables).map(([key, value]) => (
                  <div key={key} style={{ 
                    marginBottom: '5px',
                    color: value.includes('[object Object]') ? 'red' : 'black',
                    fontWeight: value.includes('[object Object]') ? 'bold' : 'normal'
                  }}>
                    <strong>{key}:</strong> {value}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {testResults.contractGenerated && (
            <div style={{ marginTop: '15px' }}>
              <h4>📄 Test de génération de contrat:</h4>
              {testResults.hasObjectErrors ? (
                <div style={{ color: 'red' }}>❌ Le contrat contient des erreurs '[object Object]'</div>
              ) : (
                <div style={{ color: 'green' }}>✅ Contrat généré sans erreurs d'objet</div>
              )}
              
              {testResults.contractError && (
                <div style={{ color: 'red' }}>❌ Erreur de génération: {testResults.contractError}</div>
              )}
            </div>
          )}
          
          {testResults.contractHtml && (
            <div style={{ marginTop: '15px' }}>
              <h4>📝 Aperçu HTML (500 premiers caractères):</h4>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '10px', 
                borderRadius: '3px', 
                fontSize: '11px',
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                <pre>{testResults.contractHtml.substring(0, 500)}...</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StructureVariableTest;