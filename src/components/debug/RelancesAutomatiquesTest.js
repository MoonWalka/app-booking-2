/**
 * @fileoverview Composant de test pour les relances automatiques
 * Permet de tester et valider le bon fonctionnement du système de relances automatiques
 * 
 * @author TourCraft Team
 * @since 2025
 */

import React, { useState } from 'react';
import { useRelancesAutomatiques } from '@/hooks/relances/useRelancesAutomatiques';
import { RELANCE_TYPES } from '@/services/relancesAutomatiquesService';
import { useOrganization } from '@/context/OrganizationContext';
import { diagnosticRelancesAutomatiques, testerCreationRelanceManuelle, afficherRapportDiagnostic } from '@/utils/debugRelancesAutomatiques';
import { fixRelancesConcert } from '@/utils/fixRelancesAutomatiques';
import { cleanupRelancesDoublons, cleanupAllRelancesDoublons } from '@/utils/cleanupRelancesDoublons';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';

/**
 * Composant de test pour les relances automatiques
 * 
 * @returns {JSX.Element} Interface de test
 */
const RelancesAutomatiquesTest = () => {
  const { currentOrganization } = useOrganization();
  const relancesAuto = useRelancesAutomatiques();
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);
  const [concertIdTest, setConcertIdTest] = useState('');
  
  // Concert de test simulé
  const concertTest = {
    id: 'test-concert-' + Date.now(),
    titre: 'Concert de Test Automatique',
    date: { seconds: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) }, // Dans 30 jours
    artisteNom: 'Artiste Test',
    lieuNom: 'Lieu Test'
  };
  
  const addTestResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, {
      id: Date.now() + Math.random(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };
  
  const clearResults = () => {
    setTestResults([]);
  };
  
  /**
   * Test 1: Création d'un concert incomplet (doit créer "Envoyer le formulaire")
   */
  const testConcertIncomplet = async () => {
    addTestResult('🧪 Test: Création concert incomplet', 'info');
    
    try {
      const concertIncomplet = {
        ...concertTest,
        id: 'test-incomplet-' + Date.now(),
        titre: 'Concert Incomplet', // Pas de contactId, artisteId, lieuId
      };
      
      await relancesAuto.onConcertCree(concertIncomplet);
      addTestResult('✅ Relances évaluées pour concert incomplet', 'success');
      
      // Vérifier que la relance "envoyer_formulaire" a été créée
      addTestResult('📋 Vérification: Relance "Envoyer le formulaire" devrait être créée', 'info');
      
    } catch (error) {
      addTestResult(`❌ Erreur test concert incomplet: ${error.message}`, 'error');
    }
  };
  
  /**
   * Test 2: Simulation réception formulaire
   */
  const testFormulaireRecu = async () => {
    addTestResult('🧪 Test: Réception formulaire', 'info');
    
    try {
      const formulaireData = {
        id: 'test-form-' + Date.now(),
        concertId: concertTest.id,
        dateReponse: new Date(),
        statut: 'en_attente'
      };
      
      await relancesAuto.onFormulaireRecu(concertTest, formulaireData);
      addTestResult('✅ Relances évaluées après réception formulaire', 'success');
      addTestResult('📋 Vérification: Relance "Valider le formulaire" devrait être créée', 'info');
      
    } catch (error) {
      addTestResult(`❌ Erreur test formulaire reçu: ${error.message}`, 'error');
    }
  };
  
  /**
   * Test 3: Simulation validation formulaire
   */
  const testFormulaireValide = async () => {
    addTestResult('🧪 Test: Validation formulaire', 'info');
    
    try {
      const formulaireValide = {
        id: 'test-form-valide-' + Date.now(),
        concertId: concertTest.id,
        dateReponse: new Date(),
        statut: 'valide',
        dateValidation: new Date()
      };
      
      await relancesAuto.onFormulaireValide(concertTest, formulaireValide);
      addTestResult('✅ Relances évaluées après validation formulaire', 'success');
      addTestResult('📋 Vérification: Relance "Envoyer le contrat" devrait être créée', 'info');
      
    } catch (error) {
      addTestResult(`❌ Erreur test formulaire validé: ${error.message}`, 'error');
    }
  };
  
  /**
   * Test 4: Simulation génération contrat
   */
  const testContratGenere = async () => {
    addTestResult('🧪 Test: Génération contrat', 'info');
    
    try {
      const contratData = {
        id: 'test-contrat-' + Date.now(),
        concertId: concertTest.id,
        status: 'generated',
        dateGeneration: new Date()
      };
      
      await relancesAuto.onContratGenere(concertTest, contratData);
      addTestResult('✅ Relances évaluées après génération contrat', 'success');
      addTestResult('📋 Vérification: Relances précédentes devraient être terminées', 'info');
      
    } catch (error) {
      addTestResult(`❌ Erreur test contrat généré: ${error.message}`, 'error');
    }
  };
  
  /**
   * Diagnostic d'un concert existant
   */
  const diagnostiquerConcert = async () => {
    if (!concertIdTest.trim()) {
      addTestResult('❌ Veuillez saisir un ID de concert', 'error');
      return;
    }
    
    if (!currentOrganization?.id) {
      addTestResult('❌ Aucune organisation sélectionnée', 'error');
      return;
    }
    
    setTesting(true);
    addTestResult(`🔍 Diagnostic du concert: ${concertIdTest}`, 'info');
    
    try {
      const rapport = await diagnosticRelancesAutomatiques(concertIdTest, currentOrganization.id);
      afficherRapportDiagnostic(rapport);
      
      if (rapport.erreurs.length > 0) {
        rapport.erreurs.forEach(erreur => {
          addTestResult(`❌ ${erreur}`, 'error');
        });
      } else {
        addTestResult(`✅ Diagnostic terminé: ${rapport.recommandations.length} recommandations`, 'success');
        rapport.recommandations.forEach(rec => {
          addTestResult(`💡 ${rec.action.toUpperCase()}: ${rec.nom}`, 'info');
        });
      }
      
    } catch (error) {
      addTestResult(`❌ Erreur diagnostic: ${error.message}`, 'error');
    } finally {
      setTesting(false);
    }
  };
  
  /**
   * Test de création manuelle
   */
  const testerCreationManuelle = async () => {
    if (!concertIdTest.trim()) {
      addTestResult('❌ Veuillez saisir un ID de concert', 'error');
      return;
    }
    
    setTesting(true);
    addTestResult(`🧪 Test création manuelle pour: ${concertIdTest}`, 'info');
    
    try {
      const resultat = await testerCreationRelanceManuelle(concertIdTest, currentOrganization.id);
      
      if (resultat.succes) {
        addTestResult(`✅ ${resultat.message}`, 'success');
      } else {
        addTestResult(`❌ ${resultat.erreur}`, 'error');
      }
      
    } catch (error) {
      addTestResult(`❌ Erreur test: ${error.message}`, 'error');
    } finally {
      setTesting(false);
    }
  };

  /**
   * Correction des relances d'un concert
   */
  const corrigerRelancesConcert = async () => {
    if (!concertIdTest.trim()) {
      addTestResult('❌ Veuillez saisir un ID de concert', 'error');
      return;
    }
    
    setTesting(true);
    addTestResult(`🔧 Correction des relances pour: ${concertIdTest}`, 'info');
    
    try {
      const resultat = await fixRelancesConcert(concertIdTest, currentOrganization.id);
      
      if (resultat.success) {
        addTestResult(`✅ ${resultat.message}`, 'success');
        addTestResult(`📋 Concert: ${resultat.concert}`, 'info');
        addTestResult(`📋 Formulaire: ${resultat.formulaire ? 'Détecté' : 'Non détecté'}`, 'info');
        addTestResult(`📋 Contrat: ${resultat.contrat ? 'Détecté' : 'Non détecté'}`, 'info');
      } else {
        addTestResult(`❌ ${resultat.error}`, 'error');
      }
      
    } catch (error) {
      addTestResult(`❌ Erreur correction: ${error.message}`, 'error');
    } finally {
      setTesting(false);
    }
  };

  /**
   * Nettoyage des doublons pour un concert
   */
  const nettoyerDoublonsConcert = async () => {
    if (!concertIdTest.trim()) {
      addTestResult('❌ Veuillez saisir un ID de concert', 'error');
      return;
    }
    
    setTesting(true);
    addTestResult(`🧹 Nettoyage des doublons pour: ${concertIdTest}`, 'info');
    
    try {
      const resultat = await cleanupRelancesDoublons(concertIdTest, currentOrganization.id);
      
      if (resultat.success) {
        addTestResult(`✅ Nettoyage terminé: ${resultat.doublonesSupprimes} doublons supprimés`, 'success');
        addTestResult(`📋 ${resultat.relancesConservees} relances conservées`, 'info');
        if (resultat.typesNettoyes.length > 0) {
          addTestResult(`🔧 Types nettoyés: ${resultat.typesNettoyes.join(', ')}`, 'info');
        }
      } else {
        addTestResult(`❌ ${resultat.error}`, 'error');
      }
      
    } catch (error) {
      addTestResult(`❌ Erreur nettoyage: ${error.message}`, 'error');
    } finally {
      setTesting(false);
    }
  };

  /**
   * Nettoyage global des doublons
   */
  const nettoyerTousLesDoublons = async () => {
    if (!currentOrganization?.id) {
      addTestResult('❌ Aucune organisation sélectionnée', 'error');
      return;
    }
    
    setTesting(true);
    addTestResult(`🧹 Nettoyage global des doublons pour l'organisation: ${currentOrganization?.nom || 'Organisation'}`, 'info');
    
    try {
      const resultat = await cleanupAllRelancesDoublons(currentOrganization.id);
      
      if (resultat.success) {
        addTestResult(`✅ Nettoyage global terminé: ${resultat.totalDoublonesSupprimes} doublons supprimés`, 'success');
        addTestResult(`📋 ${resultat.concertsNettoyes}/${resultat.totalConcerts} concerts nettoyés`, 'info');
        if (resultat.erreurs.length > 0) {
          addTestResult(`⚠️ ${resultat.erreurs.length} erreurs rencontrées`, 'warning');
        }
      } else {
        addTestResult(`❌ ${resultat.error}`, 'error');
      }
      
    } catch (error) {
      addTestResult(`❌ Erreur nettoyage global: ${error.message}`, 'error');
    } finally {
      setTesting(false);
    }
  };

  /**
   * Test complet du workflow
   */
  const testWorkflowComplet = async () => {
    if (!currentOrganization?.id) {
      addTestResult('❌ Aucune organisation sélectionnée', 'error');
      return;
    }
    
    setTesting(true);
    clearResults();
    
    addTestResult('🚀 Début du test complet du workflow', 'info');
    addTestResult(`🏢 Organisation: ${currentOrganization.nom}`, 'info');
    
    try {
      // Étape 1: Concert incomplet
      await new Promise(resolve => setTimeout(resolve, 500));
      await testConcertIncomplet();
      
      // Étape 2: Formulaire reçu
      await new Promise(resolve => setTimeout(resolve, 1000));
      await testFormulaireRecu();
      
      // Étape 3: Formulaire validé
      await new Promise(resolve => setTimeout(resolve, 1000));
      await testFormulaireValide();
      
      // Étape 4: Contrat généré
      await new Promise(resolve => setTimeout(resolve, 1000));
      await testContratGenere();
      
      addTestResult('🎉 Test complet terminé !', 'success');
      addTestResult('💡 Consultez la liste des relances pour voir les résultats', 'info');
      
    } catch (error) {
      addTestResult(`❌ Erreur durant le test complet: ${error.message}`, 'error');
    } finally {
      setTesting(false);
    }
  };
  
  /**
   * Affichage des types de relances configurés
   */
  const renderTypesRelances = () => (
    <div className="mb-4">
      <h6>Types de relances automatiques configurés :</h6>
      <div className="d-flex flex-wrap gap-2">
        {Object.values(RELANCE_TYPES).map(type => (
          <Badge 
            key={type.id} 
            variant={type.couleur}
            title={type.description}
          >
            {type.nom}
            {type.futur && ' (🚧 Futur)'}
          </Badge>
        ))}
      </div>
    </div>
  );
  
  if (!currentOrganization?.id) {
    return (
      <Card>
        <Alert variant="warning">
          Veuillez sélectionner une organisation pour tester les relances automatiques.
        </Alert>
      </Card>
    );
  }
  
  return (
    <Card title="🤖 Test des Relances Automatiques">
      <div className="mb-4">
        <Alert variant="info">
          Ce composant permet de tester le système de relances automatiques en simulant 
          les différentes étapes du workflow d'un concert.
        </Alert>
      </div>
      
      {renderTypesRelances()}
      
      {/* Section Diagnostic */}
      <div className="mb-4 p-3 border rounded">
        <h6>🔍 Diagnostic d'un concert existant</h6>
        <div className="mb-3">
          <input
            type="text"
            className="form-control mb-2"
            placeholder="ID du concert à analyser"
            value={concertIdTest}
            onChange={(e) => setConcertIdTest(e.target.value)}
            disabled={testing}
          />
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Button 
            variant="info" 
            onClick={diagnostiquerConcert}
            disabled={testing || !concertIdTest.trim()}
          >
            <i className="bi bi-search me-2" />
            Diagnostic
          </Button>
          <Button 
            variant="warning" 
            onClick={testerCreationManuelle}
            disabled={testing || !concertIdTest.trim()}
          >
            <i className="bi bi-tools me-2" />
            Forcer création
          </Button>
          <Button 
            variant="success" 
            onClick={corrigerRelancesConcert}
            disabled={testing || !concertIdTest.trim()}
          >
            <i className="bi bi-wrench me-2" />
            Corriger relances
          </Button>
          <Button 
            variant="warning" 
            onClick={nettoyerDoublonsConcert}
            disabled={testing || !concertIdTest.trim()}
          >
            <i className="bi bi-trash3 me-2" />
            Nettoyer doublons
          </Button>
        </div>
        <small className="text-muted">
          Saisissez l'ID d'un concert existant pour analyser pourquoi les relances automatiques ne se créent pas.
        </small>
      </div>
      
      <div className="d-flex flex-wrap gap-2 mb-4">
        <Button 
          variant="primary" 
          onClick={testWorkflowComplet}
          disabled={testing || relancesAuto.loading}
        >
          {testing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Test en cours...
            </>
          ) : (
            <>
              <i className="bi bi-play-fill me-2" />
              Lancer test complet
            </>
          )}
        </Button>
        
        <Button 
          variant="outline-secondary" 
          onClick={testConcertIncomplet}
          disabled={testing}
        >
          Test concert incomplet
        </Button>
        
        <Button 
          variant="outline-secondary" 
          onClick={testFormulaireRecu}
          disabled={testing}
        >
          Test formulaire reçu
        </Button>
        
        <Button 
          variant="outline-secondary" 
          onClick={testFormulaireValide}
          disabled={testing}
        >
          Test formulaire validé
        </Button>
        
        <Button 
          variant="outline-secondary" 
          onClick={testContratGenere}
          disabled={testing}
        >
          Test contrat généré
        </Button>
        
        <Button 
          variant="outline-danger" 
          onClick={clearResults}
          disabled={testing}
        >
          <i className="bi bi-trash me-2" />
          Effacer résultats
        </Button>
        
        <Button 
          variant="danger" 
          onClick={nettoyerTousLesDoublons}
          disabled={testing}
        >
          <i className="bi bi-exclamation-triangle me-2" />
          Nettoyer TOUS les doublons
        </Button>
      </div>
      
      {relancesAuto.error && (
        <Alert variant="danger">
          Erreur: {relancesAuto.error}
        </Alert>
      )}
      
      {testResults.length > 0 && (
        <div className="mt-4">
          <h6>Résultats des tests :</h6>
          <div className="border rounded p-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {testResults.map(result => (
              <div key={result.id} className="d-flex justify-content-between align-items-start mb-2">
                <span className={`text-${result.type === 'error' ? 'danger' : result.type === 'success' ? 'success' : 'primary'}`}>
                  {result.message}
                </span>
                <small className="text-muted">{result.timestamp}</small>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default RelancesAutomatiquesTest;