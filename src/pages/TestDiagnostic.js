import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Card, Button } from 'react-bootstrap';

// Import du hook problématique
import { useGenericEntityDetails } from '@/hooks/common';

/**
 * Page de test isolée pour diagnostiquer les boucles de re-renders
 * Utilise des données mockées pour isoler le problème
 */
const TestDiagnostic = () => {
  // 🔄 DIAGNOSTIC STRUCTUREL: Compteur de re-renders
  console.count(`🔄 [DIAGNOSTIC] TestDiagnostic render`);
  
  const { id } = useParams();
  const testId = id || 'test-concert-123';
  
  // État local pour simuler les données
  const [mockData, setMockData] = useState({
    id: testId,
    titre: 'Concert de test',
    date: new Date().toISOString(),
    montant: 1500,
    statut: 'confirmé'
  });
  
  // Données mockées stables
  const mockTransformData = useCallback((data) => {
    console.count(`🔄 [DIAGNOSTIC] mockTransformData appelé`);
    return {
      ...data,
      transformed: true,
      transformedAt: Date.now()
    };
  }, []);
  
  const mockValidateForm = useCallback((data) => {
    console.count(`🔄 [DIAGNOSTIC] mockValidateForm appelé`);
    return {
      isValid: true,
      errors: {}
    };
  }, []);
  
  // Configuration stabilisée avec useMemo
  const hookConfig = useMemo(() => ({
    entityType: 'concert',
    collectionName: 'concerts',
    id: testId,
    initialMode: 'view',
    relatedEntities: [],
    autoLoadRelated: false,
    transformData: mockTransformData,
    validateFormFn: mockValidateForm,
    formatValue: (field, value) => value,
    checkDeletePermission: async () => true,
    onSaveSuccess: (data) => {
      console.log('🎯 [TEST] onSaveSuccess appelé', data);
    },
    onSaveError: (error) => {
      console.error('🎯 [TEST] onSaveError appelé', error);
    },
    onDeleteSuccess: () => {
      console.log('🎯 [TEST] onDeleteSuccess appelé');
    },
    onDeleteError: (error) => {
      console.error('🎯 [TEST] onDeleteError appelé', error);
    },
    navigate: (path) => {
      console.log('🎯 [TEST] navigate appelé vers:', path);
    },
    returnPath: '/concerts',
    editPath: `/concerts/${testId}/edit`,
    useDeleteModal: true,
    cacheEnabled: false, // Désactiver le cache pour le test
    realtime: false      // Désactiver le temps réel pour le test
  }), [testId, mockTransformData, mockValidateForm]);
  
  // Utilisation du hook générique avec configuration mockée
  const genericDetails = useGenericEntityDetails(hookConfig);
  
  // Log des changements d'état
  useEffect(() => {
    console.log('🔍 [TEST] genericDetails.entity changé:', genericDetails.entity);
  }, [genericDetails.entity]);
  
  useEffect(() => {
    console.log('🔍 [TEST] genericDetails.loading changé:', genericDetails.loading);
  }, [genericDetails.loading]);
  
  useEffect(() => {
    console.log('🔍 [TEST] genericDetails.error changé:', genericDetails.error);
  }, [genericDetails.error]);
  
  // Simulation de données pour tester
  const handleSimulateData = useCallback(() => {
    console.log('🎯 [TEST] Simulation de nouvelles données');
    setMockData(prev => ({
      ...prev,
      titre: `Concert de test ${Date.now()}`,
      updatedAt: new Date().toISOString()
    }));
  }, []);
  
  // Fonction pour forcer un re-render
  const [forceRenderCount, setForceRenderCount] = useState(0);
  const handleForceRender = useCallback(() => {
    console.log('🎯 [TEST] Force re-render');
    setForceRenderCount(prev => prev + 1);
  }, []);
  
  return (
    <div className="container mt-4">
      <h1>🔍 Page de Test - Diagnostic des Boucles</h1>
      
      <Alert variant="info">
        <strong>Test ID:</strong> {testId}<br/>
        <strong>Force Render Count:</strong> {forceRenderCount}<br/>
        <strong>Timestamp:</strong> {new Date().toLocaleTimeString()}
      </Alert>
      
      <div className="row">
        <div className="col-md-6">
          <Card>
            <Card.Header>
              <h5>État du Hook useGenericEntityDetails</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>Loading:</strong> {String(genericDetails.loading)}</p>
              <p><strong>Error:</strong> {genericDetails.error ? String(genericDetails.error) : 'null'}</p>
              <p><strong>Entity:</strong> {genericDetails.entity ? 'Présent' : 'null'}</p>
              <p><strong>Instance ID:</strong> {genericDetails.instanceId}</p>
              <p><strong>Instance Number:</strong> {genericDetails.instanceNumber}</p>
              
              {genericDetails.entity && (
                <div className="mt-3">
                  <h6>Données de l'entité:</h6>
                  <pre className="bg-light p-2 small">
                    {JSON.stringify(genericDetails.entity, null, 2)}
                  </pre>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
        
        <div className="col-md-6">
          <Card>
            <Card.Header>
              <h5>Actions de Test</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  onClick={handleSimulateData}
                >
                  Simuler Nouvelles Données
                </Button>
                
                <Button 
                  variant="secondary" 
                  onClick={handleForceRender}
                >
                  Forcer Re-render
                </Button>
                
                <Button 
                  variant="info" 
                  onClick={() => genericDetails.refresh?.()}
                  disabled={!genericDetails.refresh}
                >
                  Refresh Hook
                </Button>
                
                <Button 
                  variant="warning" 
                  onClick={() => {
                    console.clear();
                    console.log('🧹 Console nettoyée - Compteurs remis à zéro');
                  }}
                >
                  Clear Console
                </Button>
              </div>
              
              <div className="mt-3">
                <h6>Instructions:</h6>
                <ol className="small">
                  <li>Ouvrir la console du navigateur</li>
                  <li>Observer les compteurs de diagnostic</li>
                  <li>Cliquer sur les boutons pour tester</li>
                  <li>Vérifier s'il y a des boucles infinies</li>
                </ol>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-12">
          <Card>
            <Card.Header>
              <h5>Données Mock Actuelles</h5>
            </Card.Header>
            <Card.Body>
              <pre className="bg-light p-3">
                {JSON.stringify(mockData, null, 2)}
              </pre>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestDiagnostic; 