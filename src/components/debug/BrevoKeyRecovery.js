import React, { useState } from 'react';
import { Card, Alert, Form } from 'react-bootstrap';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useEntreprise } from '@/context/EntrepriseContext';
import { 
  decryptSensitiveFields, 
  encryptSensitiveFields,
  generateAuditHash 
} from '@/utils/cryptoUtils';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * Outil de récupération de la clé API Brevo après migration
 */
const BrevoKeyRecovery = () => {
  const { currentEntreprise } = useEntreprise();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [recoveryData, setRecoveryData] = useState(null);
  const [newApiKey, setNewApiKey] = useState('');

  // Diagnostiquer le problème de clé API
  const diagnoseApiKey = async () => {
    if (!currentEntreprise?.id) {
      setError('Aucune entreprise sélectionnée');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // 1. Lire les paramètres globaux
      const globalDoc = await getDoc(doc(db, 'parametres', 'global'));
      let globalBrevoConfig = null;
      
      if (globalDoc.exists()) {
        const globalData = globalDoc.data();
        if (globalData.email?.brevo) {
          // Déchiffrer la clé API globale
          const decryptedGlobal = decryptSensitiveFields(globalData.email.brevo, ['apiKey']);
          globalBrevoConfig = decryptedGlobal;
        }
      }

      // 2. Lire les paramètres de l'entreprise
      const orgDoc = await getDoc(
        doc(db, 'entreprises', currentEntreprise.id, 'parametres', 'settings')
      );
      let orgBrevoConfig = null;
      
      if (orgDoc.exists()) {
        const orgData = orgDoc.data();
        if (orgData.email?.brevo) {
          // Déchiffrer la clé API de l'entreprise
          const decryptedOrg = decryptSensitiveFields(orgData.email.brevo, ['apiKey']);
          orgBrevoConfig = decryptedOrg;
        }
      }

      setRecoveryData({
        global: globalBrevoConfig,
        entreprise: orgBrevoConfig,
        globalExists: !!globalBrevoConfig,
        orgExists: !!orgBrevoConfig,
        globalApiKey: globalBrevoConfig?.apiKey || 'Non trouvée',
        orgApiKey: orgBrevoConfig?.apiKey || 'Non trouvée',
        keysMatch: globalBrevoConfig?.apiKey === orgBrevoConfig?.apiKey
      });

      if (globalBrevoConfig?.apiKey && !orgBrevoConfig?.apiKey) {
        setMessage('🔧 Clé API trouvée dans les paramètres globaux mais corrompue dans l\'entreprise');
      } else if (globalBrevoConfig?.apiKey && orgBrevoConfig?.apiKey && globalBrevoConfig.apiKey !== orgBrevoConfig.apiKey) {
        setMessage('⚠️ Les clés API diffèrent entre global et entreprise');
      } else if (!globalBrevoConfig?.apiKey && !orgBrevoConfig?.apiKey) {
        setMessage('❌ Aucune clé API valide trouvée');
      } else {
        setMessage('✅ Clés API identiques - le problème est ailleurs');
      }

    } catch (error) {
      console.error('Erreur diagnostic:', error);
      setError(`Erreur lors du diagnostic: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer la clé API depuis les paramètres globaux
  const recoverFromGlobal = async () => {
    if (!recoveryData?.global?.apiKey || !currentEntreprise?.id) {
      setError('Aucune clé API valide à récupérer');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('Récupération en cours...');

    try {
      // Lire la configuration complète de l'entreprise
      const orgDoc = await getDoc(
        doc(db, 'entreprises', currentEntreprise.id, 'parametres', 'settings')
      );

      if (!orgDoc.exists()) {
        throw new Error('Configuration entreprise introuvable');
      }

      const orgData = orgDoc.data();
      
      // Mettre à jour seulement la clé API Brevo
      const updatedConfig = {
        ...orgData,
        email: {
          ...orgData.email,
          brevo: {
            ...orgData.email.brevo,
            ...encryptSensitiveFields({ apiKey: recoveryData.global.apiKey }, ['apiKey'])
          }
        }
      };

      await setDoc(
        doc(db, 'entreprises', currentEntreprise.id, 'parametres', 'settings'),
        updatedConfig
      );

      // Audit log
      const auditHash = generateAuditHash(recoveryData.global.apiKey);
      console.info(`[AUDIT] Clé API Brevo récupérée - Hash: ${auditHash}`);

      setMessage('✅ Clé API récupérée avec succès ! Rechargement automatique...');
      
      // Forcer un rechargement de la page
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Erreur récupération:', error);
      setError(`Erreur lors de la récupération: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder une nouvelle clé API
  // Test direct de l'API Brevo
  const testApiKeyDirect = async () => {
    if (!recoveryData?.global?.apiKey) {
      setError('Aucune clé API à tester');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('Test direct de l\'API Brevo...');

    try {
      // Test direct avec fetch vers l'API Brevo
      const response = await fetch('https://api.brevo.com/v3/account', {
        method: 'GET',
        headers: {
          'api-key': recoveryData.global.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`✅ Test direct réussi ! Compte: ${data.email}, Plan: ${data.plan?.[0]?.type || 'N/A'}`);
      } else {
        const errorData = await response.json();
        setError(`❌ Test direct échoué: ${response.status} - ${errorData.message || 'Erreur inconnue'}`);
      }

    } catch (error) {
      setError(`❌ Erreur test direct: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const saveNewApiKey = async () => {
    if (!newApiKey.trim() || !currentEntreprise?.id) {
      setError('Veuillez entrer une clé API valide');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('Sauvegarde en cours...');

    try {
      // Lire la configuration complète de l'entreprise
      const orgDoc = await getDoc(
        doc(db, 'entreprises', currentEntreprise.id, 'parametres', 'settings')
      );

      if (!orgDoc.exists()) {
        throw new Error('Configuration entreprise introuvable');
      }

      const orgData = orgDoc.data();
      
      // Mettre à jour la clé API Brevo
      const updatedConfig = {
        ...orgData,
        email: {
          ...orgData.email,
          brevo: {
            ...orgData.email.brevo,
            ...encryptSensitiveFields({ apiKey: newApiKey.trim() }, ['apiKey'])
          }
        }
      };

      await setDoc(
        doc(db, 'entreprises', currentEntreprise.id, 'parametres', 'settings'),
        updatedConfig
      );

      // Audit log
      const auditHash = generateAuditHash(newApiKey.trim());
      console.info(`[AUDIT] Nouvelle clé API Brevo configurée - Hash: ${auditHash}`);

      setMessage('✅ Nouvelle clé API sauvegardée avec succès ! Rechargement automatique...');
      setNewApiKey('');
      
      // Forcer un rechargement de la page
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setError(`Erreur lors de la sauvegarde: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">🔧 Récupération Clé API Brevo</h5>
      </Card.Header>
      <Card.Body>
        {message && <Alert variant="info">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        
        {loading && <LoadingSpinner />}
        
        <div className="mb-3">
          <p>
            <strong>Entreprise :</strong> {currentEntreprise?.name || 'Non sélectionnée'}
          </p>
        </div>

        <div className="mb-4">
          <Button
            variant="outline-primary"
            onClick={diagnoseApiKey}
            disabled={loading || !currentEntreprise?.id}
          >
            🔍 Diagnostiquer le problème
          </Button>
        </div>

        {recoveryData && (
          <div className="mb-4">
            <h6>📊 Résultats du diagnostic :</h6>
            <ul>
              <li>
                <strong>Paramètres globaux :</strong> {recoveryData.globalExists ? '✅ Trouvés' : '❌ Absents'}
                {recoveryData.globalExists && (
                  <div className="text-muted small">
                    Clé API : {recoveryData.globalApiKey.substring(0, 10)}...
                  </div>
                )}
              </li>
              <li>
                <strong>Paramètres entreprise :</strong> {recoveryData.orgExists ? '✅ Trouvés' : '❌ Absents'}
                {recoveryData.orgExists && (
                  <div className="text-muted small">
                    Clé API : {recoveryData.orgApiKey.substring(0, 10)}...
                  </div>
                )}
              </li>
            </ul>

            {recoveryData.global?.apiKey && !recoveryData.keysMatch && (
              <div className="mt-3">
                <Button
                  variant="warning"
                  onClick={recoverFromGlobal}
                  disabled={loading}
                >
                  🔄 Récupérer depuis les paramètres globaux
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="mt-4">
          <h6>🆕 Ou configurer une nouvelle clé API :</h6>
          <Form.Group className="mb-3">
            <Form.Label>Nouvelle clé API Brevo</Form.Label>
            <Form.Control
              type="password"
              placeholder="xkeysib-..."
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
            />
            <Form.Text className="text-muted">
              Entrez votre clé API Brevo pour la configurer directement
            </Form.Text>
          </Form.Group>
          
          <Button
            variant="success"
            onClick={saveNewApiKey}
            disabled={loading || !newApiKey.trim() || !currentEntreprise?.id}
          >
            💾 Sauvegarder la nouvelle clé
          </Button>
        </div>
        
        <div className="mt-4">
          <h6>🧪 Test direct de la clé API :</h6>
          <p className="small text-muted">Testez votre clé API directement avec l'API Brevo</p>
          <Button
            variant="outline-info"
            onClick={testApiKeyDirect}
            disabled={loading || !recoveryData?.global?.apiKey}
          >
            🔬 Test API Brevo direct
          </Button>
        </div>

        <div className="mt-4">
          <h6>📋 Instructions :</h6>
          <ol className="small text-muted">
            <li>Cliquez sur "Diagnostiquer" pour identifier le problème</li>
            <li>Si une clé valide est trouvée, utilisez "Récupérer"</li>
            <li>Sinon, entrez votre clé API Brevo dans le champ et sauvegardez</li>
            <li>Rechargez la page après récupération/sauvegarde</li>
          </ol>
        </div>
      </Card.Body>
    </Card>
  );
};

export default BrevoKeyRecovery;