import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/services/firebase-service';
import { debugLog } from '@/utils/logUtils';
import axios from 'axios';

/**
 * Composant de diagnostic pour tester les clés API Brevo
 * Compare les appels directs vs Cloud Functions
 */
const BrevoKeyDiagnostic = () => {
  const [apiKey, setApiKey] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (message, data = null, level = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, data, level }]);
    debugLog(`[BrevoKeyDiagnostic] ${message}`, data, level);
  };

  // Test 1: Appel direct à l'API Brevo
  const testDirectAPI = async () => {
    addLog('🔑 Début test API Brevo directe', { apiKey: apiKey.substring(0, 10) + '...' });
    
    try {
      const response = await axios.get('https://api.brevo.com/v3/account', {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      const result = {
        success: true,
        email: response.data.email,
        plan: response.data.plan?.type,
        status: response.status,
        statusText: response.statusText
      };

      addLog('✅ Test direct réussi !', result, 'success');
      return result;
    } catch (error) {
      const result = {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      };

      addLog('❌ Test direct échoué', result, 'error');
      return result;
    }
  };

  // Test 2: Appel via Cloud Function
  const testCloudFunction = async () => {
    addLog('☁️ Début test Cloud Function validateBrevoKey', { apiKey: apiKey.substring(0, 10) + '...' });
    
    try {
      const validateBrevoKeyFunction = httpsCallable(functions, 'validateBrevoKey');
      const response = await validateBrevoKeyFunction({ apiKey });

      const result = {
        success: true,
        valid: response.data.valid,
        message: response.data.message,
        cloudFunctionData: response.data
      };

      addLog('✅ Cloud Function réussie !', result, 'success');
      return result;
    } catch (error) {
      const result = {
        success: false,
        error: error.message,
        code: error.code,
        details: error.details
      };

      addLog('❌ Cloud Function échouée', result, 'error');
      return result;
    }
  };

  // Test 3: Récupération des templates
  const testTemplates = async () => {
    addLog('🎨 Début test récupération templates', { apiKey: apiKey.substring(0, 10) + '...' });
    
    try {
      const getBrevoTemplatesFunction = httpsCallable(functions, 'getBrevoTemplates');
      const response = await getBrevoTemplatesFunction({ apiKey });

      const result = {
        success: true,
        templates: response.data.templates,
        count: response.data.templates?.length || 0
      };

      addLog('✅ Templates récupérés !', result, 'success');
      return result;
    } catch (error) {
      const result = {
        success: false,
        error: error.message,
        code: error.code
      };

      addLog('❌ Récupération templates échouée', result, 'error');
      return result;
    }
  };

  // Lancer tous les tests
  const runAllTests = async () => {
    if (!apiKey || apiKey.length < 10) {
      addLog('❌ Clé API manquante ou trop courte', null, 'error');
      return;
    }

    setLoading(true);
    setResults({});
    setLogs([]);

    addLog('🚀 Début diagnostic complet Brevo', { timestamp: new Date().toISOString() });

    try {
      // Test en parallèle pour identifier les différences de timing
      const [directResult, cloudResult, templatesResult] = await Promise.allSettled([
        testDirectAPI(),
        testCloudFunction(),
        testTemplates()
      ]);

      const finalResults = {
        direct: directResult.status === 'fulfilled' ? directResult.value : { success: false, error: directResult.reason },
        cloudFunction: cloudResult.status === 'fulfilled' ? cloudResult.value : { success: false, error: cloudResult.reason },
        templates: templatesResult.status === 'fulfilled' ? templatesResult.value : { success: false, error: templatesResult.reason }
      };

      setResults(finalResults);

      // Analyser les différences
      analyzeResults(finalResults);
    } catch (error) {
      addLog('❌ Erreur globale du diagnostic', error, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Analyser les résultats pour identifier les problèmes
  const analyzeResults = (results) => {
    addLog('📊 Analyse des résultats', results);

    const { direct, cloudFunction, templates } = results;

    if (direct.success && cloudFunction.success && cloudFunction.valid) {
      addLog('✅ COHÉRENT: API directe et Cloud Function valident la clé', null, 'success');
    } else if (direct.success && cloudFunction.success && !cloudFunction.valid) {
      addLog('⚠️ INCOHÉRENCE: API directe OK mais Cloud Function dit invalide', {
        directEmail: direct.email,
        cloudMessage: cloudFunction.message
      }, 'warn');
    } else if (direct.success && !cloudFunction.success) {
      addLog('🔍 PROBLÈME CLOUD FUNCTION: API directe OK, Cloud Function échoue', {
        directStatus: direct.status,
        cloudError: cloudFunction.error
      }, 'error');
    } else if (!direct.success) {
      addLog('🔑 PROBLÈME CLÉ API: Échec de l\'API directe', {
        directError: direct.error,
        status: direct.status
      }, 'error');
    }

    // Analyser les templates
    if (templates.success && templates.count > 0) {
      addLog('📋 Templates disponibles', { count: templates.count }, 'success');
    } else if (templates.success && templates.count === 0) {
      addLog('📋 Aucun template trouvé', null, 'warn');
    } else {
      addLog('📋 Erreur récupération templates', templates.error, 'error');
    }
  };

  // Copier les logs dans le presse-papiers
  const copyLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}${log.data ? '\n' + JSON.stringify(log.data, null, 2) : ''}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(logText);
    addLog('📋 Logs copiés dans le presse-papiers', null, 'info');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <Card>
        <Card.Header>
          <h3>🔍 Diagnostic Clé API Brevo</h3>
          <p className="mb-0">Compare l'API directe vs les Cloud Functions pour identifier les problèmes</p>
        </Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Clé API Brevo</Form.Label>
            <Form.Control
              type="password"
              placeholder="xkeysib-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <Form.Text className="text-muted">
              Votre clé API ne sera pas sauvegardée, seulement utilisée pour le test
            </Form.Text>
          </Form.Group>

          <div className="d-flex gap-2 mb-4">
            <Button
              variant="primary"
              onClick={runAllTests}
              disabled={loading || !apiKey}
            >
              {loading ? 'Test en cours...' : '🧪 Lancer le diagnostic'}
            </Button>
            
            {logs.length > 0 && (
              <Button variant="outline-secondary" onClick={copyLogs}>
                📋 Copier logs
              </Button>
            )}
          </div>

          {/* Résultats */}
          {Object.keys(results).length > 0 && (
            <div className="mb-4">
              <h5>📊 Résultats</h5>
              <div className="row">
                <div className="col-md-4">
                  <Card border={results.direct?.success ? 'success' : 'danger'}>
                    <Card.Header>🔑 API Directe</Card.Header>
                    <Card.Body>
                      {results.direct?.success ? (
                        <>
                          <p className="text-success">✅ Succès</p>
                          <small>Email: {results.direct.email}<br/>Plan: {results.direct.plan}</small>
                        </>
                      ) : (
                        <>
                          <p className="text-danger">❌ Échec</p>
                          <small>{results.direct?.error}</small>
                        </>
                      )}
                    </Card.Body>
                  </Card>
                </div>
                
                <div className="col-md-4">
                  <Card border={results.cloudFunction?.success && results.cloudFunction?.valid ? 'success' : 'danger'}>
                    <Card.Header>☁️ Cloud Function</Card.Header>
                    <Card.Body>
                      {results.cloudFunction?.success ? (
                        <>
                          <p className={results.cloudFunction.valid ? 'text-success' : 'text-warning'}>
                            {results.cloudFunction.valid ? '✅ Valide' : '⚠️ Invalide'}
                          </p>
                          <small>{results.cloudFunction.message}</small>
                        </>
                      ) : (
                        <>
                          <p className="text-danger">❌ Erreur</p>
                          <small>{results.cloudFunction?.error}</small>
                        </>
                      )}
                    </Card.Body>
                  </Card>
                </div>
                
                <div className="col-md-4">
                  <Card border={results.templates?.success ? 'success' : 'danger'}>
                    <Card.Header>🎨 Templates</Card.Header>
                    <Card.Body>
                      {results.templates?.success ? (
                        <>
                          <p className="text-success">✅ OK</p>
                          <small>{results.templates.count} templates</small>
                        </>
                      ) : (
                        <>
                          <p className="text-danger">❌ Échec</p>
                          <small>{results.templates?.error}</small>
                        </>
                      )}
                    </Card.Body>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Logs détaillés */}
          {logs.length > 0 && (
            <div>
              <h5>📝 Logs détaillés</h5>
              <div style={{ maxHeight: '400px', overflow: 'auto', border: '1px solid #ddd', padding: '10px', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                {logs.map((log, index) => (
                  <div key={index} className={`mb-2 ${
                    log.level === 'error' ? 'text-danger' : 
                    log.level === 'success' ? 'text-success' : 
                    log.level === 'warn' ? 'text-warning' : 
                    'text-dark'
                  }`}>
                    <strong>[{log.timestamp}]</strong> {log.message}
                    {log.data && (
                      <pre style={{ fontSize: '12px', marginTop: '5px', padding: '5px', backgroundColor: '#e9ecef', borderRadius: '3px' }}>
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guide de résolution */}
          <Alert variant="info" className="mt-4">
            <Alert.Heading>💡 Comment utiliser ce diagnostic</Alert.Heading>
            <ol>
              <li><strong>Entrez votre vraie clé API Brevo</strong> (commençant par xkeysib-)</li>
              <li><strong>Lancez le diagnostic</strong> pour comparer API directe vs Cloud Functions</li>
              <li><strong>Analysez les résultats</strong> :
                <ul>
                  <li>Si l'API directe réussit mais pas la Cloud Function → Problème de transmission/traitement</li>
                  <li>Si les deux échouent → Problème de clé API ou réseau</li>
                  <li>Si validation Cloud Function dit "invalide" mais API directe OK → Bug dans le service</li>
                </ul>
              </li>
              <li><strong>Copiez les logs</strong> pour investigation plus approfondie</li>
            </ol>
          </Alert>
        </Card.Body>
      </Card>
    </div>
  );
};

export default BrevoKeyDiagnostic;