import React, { useState, useEffect } from 'react';
import { Card, Form, Row, Col, Badge, Alert } from 'react-bootstrap';
import { db } from '@/services/firebase-service';
import { doc, getDoc } from 'firebase/firestore';
import { useEntreprise } from '@/context/EntrepriseContext';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/services/firebase-service';
import { debugLog } from '@/utils/logUtils';
import { decryptSensitiveFields } from '@/utils/cryptoUtils';
import styles from './BrevoDiagnostic.module.css';

// Références aux fonctions Cloud
const validateBrevoKeyFunction = httpsCallable(functions, 'validateBrevoKey');
const getBrevoTemplatesFunction = httpsCallable(functions, 'getBrevoTemplates');
const sendUnifiedEmailFunction = httpsCallable(functions, 'sendUnifiedEmail');

/**
 * Outil de diagnostic pour l'intégration Brevo
 * Permet de tester la connexion, lister les templates et envoyer des emails de test
 */
const BrevoDiagnostic = () => {
  const { currentEntreprise } = useEntreprise();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  
  // État configuration
  const [brevoConfig, setBrevoConfig] = useState(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isValidKey, setIsValidKey] = useState(null);
  
  // État templates
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  
  // État test email
  const [testEmail, setTestEmail] = useState('');
  const [testVariables, setTestVariables] = useState('{}');
  const [testResults, setTestResults] = useState(null);
  
  // Messages
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Logs de debug intégrés
  const [debugLogs, setDebugLogs] = useState([]);
  
  // Fonction pour ajouter un log
  const addDebugLog = (level, message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp,
      level, // 'info', 'success', 'error', 'warning'
      message,
      data: data ? JSON.stringify(data, null, 2) : null
    };
    
    setDebugLogs(prev => [logEntry, ...prev].slice(0, 50)); // Garder seulement les 50 derniers logs
    
    // Aussi dans la console pour backup
    const consoleMethod = level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'log';
    console[consoleMethod](`[BrevoDiagnostic ${level.toUpperCase()}]`, message, data || '');
  };

  // Charger la configuration Brevo
  const loadBrevoConfig = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    
    addDebugLog('info', 'Chargement configuration Brevo', { organizationId: currentEntreprise?.id });

    try {
      if (!currentEntreprise?.id) {
        setError('Aucune organisation sélectionnée');
        return;
      }

      // Charger les paramètres de l'organisation
      const parametresDoc = await getDoc(
        doc(db, 'organizations', currentEntreprise.id, 'parametres', 'settings')
      );
      
      if (parametresDoc.exists()) {
        const parametresData = parametresDoc.data();
        const emailConfig = parametresData.email;
        
        if (emailConfig?.brevo) {
          // Déchiffrer la configuration Brevo
          let decryptedBrevoConfig = emailConfig.brevo;
          if (emailConfig.brevo.apiKey) {
            try {
              decryptedBrevoConfig = decryptSensitiveFields(emailConfig.brevo, ['apiKey']);
              addDebugLog('info', 'Clé API déchiffrée avec succès', {
                keyPreview: decryptedBrevoConfig.apiKey.substring(0, 10) + '...',
                originalKeyPreview: emailConfig.brevo.apiKey.substring(0, 10) + '...'
              });
            } catch (decryptError) {
              addDebugLog('error', 'Erreur déchiffrement clé API', {
                error: decryptError.message,
                keyPreview: emailConfig.brevo.apiKey.substring(0, 10) + '...'
              });
              setError('Erreur lors du déchiffrement de la clé API');
              return;
            }
          }
          
          setBrevoConfig(decryptedBrevoConfig);
          setHasApiKey(!!decryptedBrevoConfig.apiKey);
          
          // Si Brevo est activé, vérifier la validité de la clé
          if (decryptedBrevoConfig.enabled && decryptedBrevoConfig.apiKey) {
            addDebugLog('success', 'Clé API Brevo trouvée et déchiffrée', {
              keyPreview: decryptedBrevoConfig.apiKey.substring(0, 10) + '...',
              enabled: decryptedBrevoConfig.enabled,
              hasApiKey: !!decryptedBrevoConfig.apiKey,
              fromEmail: decryptedBrevoConfig.fromEmail
            });
            await validateApiKey(decryptedBrevoConfig.apiKey);
          } else {
            addDebugLog('warning', 'Brevo non configuré', {
              enabled: emailConfig.brevo?.enabled,
              hasApiKey: !!emailConfig.brevo?.apiKey
            });
          }
        } else {
          setMessage('Aucune configuration Brevo trouvée');
        }
      }
    } catch (error) {
      console.error('Erreur chargement config:', error);
      setError('Erreur lors du chargement de la configuration');
    } finally {
      setLoading(false);
    }
  };

  // Validation directe de la clé API (contournement Cloud Functions)
  const validateApiKeyDirect = async (apiKey) => {
    try {
      addDebugLog('info', 'Test direct API Brevo', { keyPreview: apiKey.substring(0, 10) + '...' });
      
      const response = await fetch('https://api.brevo.com/v3/account', {
        method: 'GET',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        addDebugLog('success', 'Test direct API réussi', { account: data.email, plan: data.plan?.[0]?.type });
        return true;
      } else {
        const errorData = await response.text();
        addDebugLog('error', 'Test direct API échoué', { status: response.status, error: errorData });
        return false;
      }
    } catch (error) {
      addDebugLog('error', 'Erreur test direct API', { error: error.message });
      return false;
    }
  };

  // Charger templates directement
  const loadTemplatesDirect = async (apiKey) => {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/templates', {
        method: 'GET',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        addDebugLog('success', 'Templates chargés directement', { count: data.templates?.length || 0 });
        setTemplates(data.templates || []);
        return data.templates || [];
      } else {
        addDebugLog('error', 'Erreur chargement templates', { status: response.status });
        return [];
      }
    } catch (error) {
      addDebugLog('error', 'Erreur templates direct', { error: error.message });
      return [];
    }
  };

  // Valider la clé API Brevo
  const validateApiKey = async (apiKey) => {
    if (!apiKey) return;

    setValidating(true);
    try {
      // Essayer d'abord la validation directe
      const directValid = await validateApiKeyDirect(apiKey);
      
      if (directValid) {
        setIsValidKey(true);
        setMessage('✅ Clé API Brevo valide (test direct)');
        // Charger les templates directement
        await loadTemplatesDirect(apiKey);
      } else {
        // Si le test direct échoue, essayer via Cloud Functions
        try {
          const result = await validateBrevoKeyFunction({ apiKey });
          setIsValidKey(result.data.valid);
          
          if (result.data.valid) {
            setMessage('✅ Clé API Brevo valide (Cloud Functions)');
            await loadTemplates(apiKey);
          } else {
            setError('❌ Clé API Brevo invalide');
          }
        } catch (cfError) {
          console.error('Erreur Cloud Functions:', cfError);
          setError('❌ Erreur validation Cloud Functions et test direct');
          setIsValidKey(false);
        }
      }
    } catch (error) {
      console.error('Erreur validation API:', error);
      setError('Erreur lors de la validation de la clé API');
      setIsValidKey(false);
    } finally {
      setValidating(false);
    }
  };

  // Charger les templates Brevo
  const loadTemplates = async (apiKey) => {
    setTemplateLoading(true);
    try {
      const result = await getBrevoTemplatesFunction({ 
        apiKey: apiKey || brevoConfig?.apiKey 
      });
      
      if (result.data.success && result.data.templates) {
        setTemplates(result.data.templates);
        debugLog('[BrevoDiagnostic] Templates chargés:', result.data.templates.length);
      }
    } catch (error) {
      console.error('Erreur chargement templates:', error);
      setError('Erreur lors du chargement des templates');
    } finally {
      setTemplateLoading(false);
    }
  };

  // Envoyer un email de test
  const sendTestEmail = async () => {
    if (!testEmail) {
      setError('Veuillez entrer une adresse email');
      return;
    }

    if (!selectedTemplate) {
      setError('Veuillez sélectionner un template');
      return;
    }

    setTestLoading(true);
    setError('');
    setMessage('');
    setTestResults(null);

    try {
      // Parser les variables JSON
      let variables = {};
      try {
        variables = JSON.parse(testVariables);
      } catch (e) {
        debugLog('[BrevoDiagnostic] Variables JSON invalides, utilisation objet vide');
      }

      // Générer de vraies variables de test avec les fonctions TourCraft
      const testDate = {
        nom: 'Date Test Debug',
        title: 'Date Test Debug',
        date: new Date(),
        heure: '20:30',
        lieu: {
          nom: 'Salle Test',
          adresse: '123 Rue Test',
          codePostal: '75001',
          ville: 'Paris'
        }
      };
      
      const testContact = {
        nom: 'Martin',
        prenom: 'Jean',
        email: testEmail,
        firstName: 'Jean',
        name: 'Martin'
      };
      
      // Utiliser les vraies fonctions de génération
      const { formatFormulaireVariables } = await import('@/utils/templateVariables');
      const realVariables = formatFormulaireVariables(
        testDate,
        testContact,
        'https://app.tourcraft.com/formulaire/test-debug-123'
      );
      
      // Combiner avec les variables JSON du formulaire
      variables = {
        ...realVariables,
        ...variables,
        // Variables simples pour test
        nom: 'Martin',
        prenom: 'Jean',
        concert: 'Date Test Debug',
        lien: 'https://app.tourcraft.com/formulaire/test-debug-123',
        test_mode: true,
        organization_name: currentEntreprise?.name || 'TourCraft',
        date: new Date().toLocaleDateString('fr-FR')
      };
      
      addDebugLog('info', 'Variables générées pour test:', realVariables);
      addDebugLog('info', 'Variables finales envoyées:', variables);

      debugLog('[BrevoDiagnostic] Envoi email test:', {
        to: testEmail,
        templateId: selectedTemplate,
        variables
      });

      // Essayer d'abord l'envoi direct via l'API Brevo (plus fiable)
      let result;
      try {
        addDebugLog('info', 'Tentative envoi direct via API Brevo', {
          templateId: selectedTemplate,
          to: testEmail,
          variablesCount: Object.keys(variables).length
        });

        // Tester différents formats de données pour Brevo
        const emailData = {
          templateId: parseInt(selectedTemplate),
          to: [{ 
            email: testEmail,
            name: testContact.prenom + ' ' + testContact.nom 
          }],
          params: variables,
          // Aussi essayer avec templateData (format alternatif)
          templateData: variables
        };
        
        addDebugLog('info', 'Structure email envoyée à Brevo:', {
          templateId: parseInt(selectedTemplate),
          to: emailData.to,
          paramsKeys: Object.keys(variables),
          paramsValues: variables
        });

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': brevoConfig.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailData)
        });

        if (response.ok) {
          const data = await response.json();
          addDebugLog('success', 'Email envoyé directement via API Brevo', {
            messageId: data.messageId,
            to: testEmail
          });
          
          result = {
            data: {
              messageId: data.messageId,
              provider: 'brevo-direct'
            }
          };
        } else {
          const errorData = await response.text();
          addDebugLog('error', 'Erreur envoi direct API Brevo', {
            status: response.status,
            error: errorData
          });
          throw new Error(`Envoi direct échoué: ${response.status}`);
        }
      } catch (directError) {
        addDebugLog('warning', 'Fallback vers Cloud Functions', {
          directError: directError.message
        });
        
        // Fallback vers la fonction Cloud unifiée avec template Brevo
        result = await sendUnifiedEmailFunction({
          to: testEmail,
          templateId: parseInt(selectedTemplate),
          templateData: variables,
          useBrevo: true,
          organizationId: currentEntreprise?.id
        });
      }

      setTestResults({
        success: true,
        timestamp: new Date().toISOString(),
        provider: result.data.provider,
        messageId: result.data.messageId,
        to: testEmail,
        templateId: selectedTemplate
      });

      setMessage('✅ Email de test envoyé avec succès !');
    } catch (error) {
      console.error('Erreur envoi email test:', error);
      setError(`Erreur: ${error.message}`);
      
      setTestResults({
        success: false,
        timestamp: new Date().toISOString(),
        error: error.message,
        to: testEmail,
        templateId: selectedTemplate
      });
    } finally {
      setTestLoading(false);
    }
  };

  // Recharger tout
  const refreshAll = async () => {
    await loadBrevoConfig();
  };

  useEffect(() => {
    loadBrevoConfig();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEntreprise?.id]);

  return (
    <div className={styles.container}>
      <Card className={styles.header}>
        <h2>📧 Diagnostic Brevo</h2>
        <p>Test de l'intégration avec le service d'email Brevo (ex-Sendinblue)</p>
        
        <div className={styles.actions}>
          <Button onClick={refreshAll} disabled={loading}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Rafraîchir
          </Button>
        </div>
      </Card>

      {(message || error) && (
        <Alert variant={error ? 'danger' : 'success'}>
          {error || message}
        </Alert>
      )}

      {loading && <LoadingSpinner />}

      {!loading && (
        <>
          {/* État de la configuration */}
          <Card className={styles.configCard}>
            <h3>⚙️ Configuration Brevo</h3>
            
            <div className={styles.configStatus}>
              <Row>
                <Col md={6}>
                  <div className={styles.statusItem}>
                    <span className={styles.statusLabel}>Organisation:</span>
                    <strong>{currentEntreprise?.name || 'Non sélectionnée'}</strong>
                  </div>
                  
                  <div className={styles.statusItem}>
                    <span className={styles.statusLabel}>Brevo activé:</span>
                    <Badge bg={brevoConfig?.enabled ? 'success' : 'secondary'}>
                      {brevoConfig?.enabled ? 'Oui' : 'Non'}
                    </Badge>
                  </div>
                  
                  <div className={styles.statusItem}>
                    <span className={styles.statusLabel}>Clé API configurée:</span>
                    <Badge bg={hasApiKey ? 'success' : 'danger'}>
                      {hasApiKey ? 'Oui' : 'Non'}
                    </Badge>
                  </div>
                </Col>
                
                <Col md={6}>
                  <div className={styles.statusItem}>
                    <span className={styles.statusLabel}>Clé API valide:</span>
                    {validating ? (
                      <span className="text-muted">Validation...</span>
                    ) : (
                      <Badge bg={isValidKey === true ? 'success' : isValidKey === false ? 'danger' : 'secondary'}>
                        {isValidKey === true ? 'Valide' : isValidKey === false ? 'Invalide' : 'Non vérifié'}
                      </Badge>
                    )}
                  </div>
                  
                  <div className={styles.statusItem}>
                    <span className={styles.statusLabel}>Email expéditeur:</span>
                    <strong>{brevoConfig?.fromEmail || 'Non configuré'}</strong>
                  </div>
                  
                  <div className={styles.statusItem}>
                    <span className={styles.statusLabel}>Nom expéditeur:</span>
                    <strong>{brevoConfig?.fromName || 'Non configuré'}</strong>
                  </div>
                </Col>
              </Row>
            </div>

            {!brevoConfig?.enabled && (
              <Alert variant="warning" className="mt-3">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Brevo n'est pas activé. Allez dans Paramètres → Email pour le configurer.
              </Alert>
            )}
          </Card>

          {/* Templates disponibles */}
          {brevoConfig?.enabled && isValidKey && (
            <Card className={styles.templatesCard}>
              <h3>📄 Templates Brevo disponibles</h3>
              
              {templateLoading ? (
                <LoadingSpinner />
              ) : templates.length > 0 ? (
                <div className={styles.templatesList}>
                  {templates.map(template => (
                    <div key={template.id} className={styles.templateItem}>
                      <div className={styles.templateInfo}>
                        <strong>{template.name}</strong>
                        <span className={styles.templateId}>ID: {template.id}</span>
                        {template.subject && (
                          <span className={styles.templateSubject}>Sujet: {template.subject}</span>
                        )}
                      </div>
                      <div className={styles.templateMeta}>
                        <Badge bg="info">{template.status || 'active'}</Badge>
                        {template.createdAt && (
                          <small>Créé le: {new Date(template.createdAt).toLocaleDateString()}</small>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert variant="info">
                  Aucun template trouvé. Créez des templates dans votre compte Brevo.
                </Alert>
              )}
              
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => loadTemplates()}
                disabled={templateLoading}
                className="mt-3"
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Recharger les templates
              </Button>
            </Card>
          )}

          {/* Test d'envoi */}
          {brevoConfig?.enabled && isValidKey && templates.length > 0 && (
            <Card className={styles.testCard}>
              <h3>🧪 Test d'envoi d'email</h3>
              
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email destinataire</Form.Label>
                      <Form.Control
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="test@example.com"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Template</Form.Label>
                      <Form.Select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                      >
                        <option value="">Sélectionnez un template</option>
                        {templates.map(template => (
                          <option key={template.id} value={template.id}>
                            {template.name} (ID: {template.id})
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Variables du template (JSON)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={testVariables}
                    onChange={(e) => setTestVariables(e.target.value)}
                    placeholder='{"nom": "Dupont", "prenom": "Jean"}'
                  />
                  <Form.Text className="text-muted">
                    Entrez les variables au format JSON. Des variables par défaut seront ajoutées automatiquement.
                  </Form.Text>
                </Form.Group>
                
                <Button 
                  onClick={sendTestEmail} 
                  disabled={testLoading || !testEmail || !selectedTemplate}
                >
                  {testLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2"></i>
                      Envoyer email de test
                    </>
                  )}
                </Button>
              </Form>

              {/* Résultats du test */}
              {testResults && (
                <div className={`${styles.testResults} mt-4`}>
                  <h4>{testResults.success ? '✅ Test réussi' : '❌ Test échoué'}</h4>
                  
                  <div className={styles.resultDetails}>
                    <div><strong>Date/Heure:</strong> {new Date(testResults.timestamp).toLocaleString()}</div>
                    <div><strong>Destinataire:</strong> {testResults.to}</div>
                    <div><strong>Template ID:</strong> {testResults.templateId}</div>
                    
                    {testResults.success ? (
                      <>
                        <div><strong>Provider:</strong> {testResults.provider}</div>
                        <div><strong>Message ID:</strong> {testResults.messageId}</div>
                      </>
                    ) : (
                      <div className="text-danger">
                        <strong>Erreur:</strong> {testResults.error}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Instructions de configuration */}
          {(!brevoConfig?.enabled || !hasApiKey) && (
            <Card className={styles.helpCard}>
              <h3>📚 Comment configurer Brevo ?</h3>
              
              <ol>
                <li>Créez un compte sur <a href="https://www.brevo.com" target="_blank" rel="noopener noreferrer">Brevo.com</a></li>
                <li>Dans votre compte Brevo, allez dans "SMTP & API" → "API Keys"</li>
                <li>Créez une nouvelle clé API avec les permissions "Transactional emails"</li>
                <li>Dans TourCraft, allez dans Paramètres → Email</li>
                <li>Sélectionnez "Brevo" comme provider</li>
                <li>Collez votre clé API et configurez l'email expéditeur</li>
                <li>Créez des templates dans Brevo pour vos différents types d'emails</li>
              </ol>
              
              <Alert variant="info" className="mt-3">
                <strong>Avantages de Brevo:</strong>
                <ul className="mb-0">
                  <li>Templates visuels avec éditeur drag-and-drop</li>
                  <li>Variables dynamiques pour personnaliser les emails</li>
                  <li>Statistiques détaillées (ouvertures, clics)</li>
                  <li>Meilleure délivrabilité que SMTP classique</li>
                  <li>300 emails gratuits par jour</li>
                </ul>
              </Alert>
            </Card>
          )}

          {/* Logs de debug intégrés */}
          <Card className={styles.debugCard}>
            <div className={styles.debugHeader}>
              <h3>🔍 Logs de Debug</h3>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={() => setDebugLogs([])}
                disabled={debugLogs.length === 0}
              >
                Vider les logs
              </Button>
            </div>
            
            <div className={styles.logsContainer}>
              {debugLogs.length === 0 ? (
                <div className={styles.noLogs}>Aucun log pour le moment</div>
              ) : (
                debugLogs.map(log => (
                  <div key={log.id} className={`${styles.logEntry} ${styles[log.level]}`}>
                    <div className={styles.logHeader}>
                      <span className={styles.timestamp}>{log.timestamp}</span>
                      <span className={`${styles.level} ${styles[log.level]}`}>
                        {log.level.toUpperCase()}
                      </span>
                    </div>
                    <div className={styles.logMessage}>{log.message}</div>
                    {log.data && (
                      <details className={styles.logData}>
                        <summary>Données détaillées</summary>
                        <pre>{log.data}</pre>
                      </details>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default BrevoDiagnostic;