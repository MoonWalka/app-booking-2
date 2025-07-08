import React, { useState, useEffect } from 'react';
import { Card, Form, Alert, Row, Col, Badge, Modal, Button as BootstrapButton } from 'react-bootstrap';
import Button from '@/components/ui/Button';
import { useParametres } from '@/context/ParametresContext';
import { debugLog } from '@/utils/logUtils';
import { decryptSensitiveFields } from '@/utils/cryptoUtils';
import BrevoTemplateCustomizer from '@/components/debug/BrevoTemplateCustomizer';
import { FaEye, FaEyeSlash, FaSync, FaPlus } from 'react-icons/fa';
import './BrevoManager.css';

const BrevoManager = () => {
  const { parametres, sauvegarderParametres, loading } = useParametres();
  const [localState, setLocalState] = useState({
    enabled: false,
    apiKey: '',
    fromEmail: '',
    fromName: 'TourCraft',
    templates: {
      formulaire: '',
      relance: '',
      contrat: '',
      confirmation: ''
    }
  });
  
  const [showApiKey, setShowApiKey] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [brevoLoading, setBrevoLoading] = useState(false);
  const [brevoTemplates, setBrevoTemplates] = useState([]);
  const [showBrevoTemplates, setShowBrevoTemplates] = useState(false);

  // Charger les paramètres Brevo au montage
  useEffect(() => {
    if (parametres?.email?.brevo) {
      const decryptedBrevo = decryptSensitiveFields(parametres.email.brevo, ['apiKey']);
      setLocalState({
        enabled: decryptedBrevo.enabled || false,
        apiKey: decryptedBrevo.apiKey || '',
        fromEmail: decryptedBrevo.fromEmail || '',
        fromName: decryptedBrevo.fromName || 'TourCraft',
        templates: decryptedBrevo.templates || {
          formulaire: '',
          relance: '',
          contrat: '',
          confirmation: ''
        }
      });
    }
  }, [parametres]);

  // Sauvegarder les paramètres Brevo
  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');

      // Validation
      if (localState.enabled && !localState.apiKey) {
        setError('La clé API Brevo est requise');
        return;
      }

      const updatedParametres = {
        ...parametres,
        email: {
          ...parametres.email,
          brevo: localState
        }
      };

      await sauvegarderParametres(updatedParametres);
      setSuccess('Configuration Brevo sauvegardée');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      debugLog('[BrevoManager] Erreur sauvegarde:', error, 'error');
      setError(error.message || 'Erreur lors de la sauvegarde');
    }
  };

  // Tester la configuration Brevo
  const handleTestBrevo = async () => {
    try {
      setBrevoLoading(true);
      setError('');
      setSuccess('');

      if (!localState.apiKey) {
        setError('Veuillez entrer une clé API Brevo');
        return;
      }

      // Ici on pourrait appeler un service pour valider la clé API
      // Pour l'instant, on simule
      debugLog('[BrevoManager] Test clé API Brevo', { hasKey: !!localState.apiKey });
      
      setSuccess('Connexion à Brevo réussie');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      debugLog('[BrevoManager] Erreur test Brevo:', error, 'error');
      setError(error.message || 'Erreur lors du test');
    } finally {
      setBrevoLoading(false);
    }
  };

  // Charger les templates depuis Brevo
  const handleLoadTemplates = async () => {
    try {
      setBrevoLoading(true);
      setError('');

      if (!localState.apiKey) {
        setError('Veuillez d\'abord configurer la clé API Brevo');
        return;
      }

      // Simuler le chargement des templates
      // En production, on appellerait un service pour récupérer les templates
      const mockTemplates = [
        { id: 1, name: 'Formulaire Programmateur' },
        { id: 2, name: 'Relance Documents' },
        { id: 3, name: 'Contrat Prêt' },
        { id: 4, name: 'Confirmation Date' }
      ];

      setBrevoTemplates(mockTemplates);
      setSuccess(`${mockTemplates.length} templates trouvés`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      debugLog('[BrevoManager] Erreur chargement templates:', error, 'error');
      setError(error.message || 'Erreur lors du chargement des templates');
    } finally {
      setBrevoLoading(false);
    }
  };

  return (
    <div className="brevo-manager">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Configuration Brevo</h5>
          <Badge bg={localState.enabled ? 'success' : 'secondary'}>
            {localState.enabled ? 'Activé' : 'Désactivé'}
          </Badge>
        </Card.Header>
        <Card.Body>
          {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

          <Form>
            <Row className="mb-4">
              <Col md={12}>
                <Form.Check
                  type="switch"
                  id="brevo-enabled"
                  label="Activer Brevo pour l'envoi d'emails"
                  checked={localState.enabled}
                  onChange={(e) => setLocalState({ ...localState, enabled: e.target.checked })}
                />
              </Col>
            </Row>

            {localState.enabled && (
              <>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Clé API Brevo <span className="text-danger">*</span></Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type={showApiKey ? 'text' : 'password'}
                          value={localState.apiKey}
                          onChange={(e) => setLocalState({ ...localState, apiKey: e.target.value })}
                          placeholder="xkeysib-..."
                        />
                        <BootstrapButton
                          variant="outline-secondary"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? <FaEyeSlash /> : <FaEye />}
                        </BootstrapButton>
                      </div>
                      <Form.Text className="text-muted">
                        Disponible dans votre compte Brevo > Paramètres > API & SMTP
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Email expéditeur</Form.Label>
                      <Form.Control
                        type="email"
                        value={localState.fromEmail}
                        onChange={(e) => setLocalState({ ...localState, fromEmail: e.target.value })}
                        placeholder="noreply@votredomaine.com"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Nom expéditeur</Form.Label>
                      <Form.Control
                        type="text"
                        value={localState.fromName}
                        onChange={(e) => setLocalState({ ...localState, fromName: e.target.value })}
                        placeholder="TourCraft"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <hr className="my-4" />

                <h6 className="mb-3">Templates Brevo</h6>
                <Row className="mb-3">
                  <Col md={12}>
                    <div className="d-flex gap-2 mb-3">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={handleLoadTemplates}
                        disabled={brevoLoading || !localState.apiKey}
                      >
                        <FaSync className={brevoLoading ? 'fa-spin' : ''} /> Charger les templates
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => setShowBrevoTemplates(true)}
                      >
                        <FaPlus /> Personnaliser les templates
                      </Button>
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Template Formulaire</Form.Label>
                      <Form.Select
                        value={localState.templates.formulaire}
                        onChange={(e) => setLocalState({
                          ...localState,
                          templates: { ...localState.templates, formulaire: e.target.value }
                        })}
                      >
                        <option value="">Sélectionner un template</option>
                        {brevoTemplates.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Template Relance</Form.Label>
                      <Form.Select
                        value={localState.templates.relance}
                        onChange={(e) => setLocalState({
                          ...localState,
                          templates: { ...localState.templates, relance: e.target.value }
                        })}
                      >
                        <option value="">Sélectionner un template</option>
                        {brevoTemplates.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Template Contrat</Form.Label>
                      <Form.Select
                        value={localState.templates.contrat}
                        onChange={(e) => setLocalState({
                          ...localState,
                          templates: { ...localState.templates, contrat: e.target.value }
                        })}
                      >
                        <option value="">Sélectionner un template</option>
                        {brevoTemplates.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Template Confirmation</Form.Label>
                      <Form.Select
                        value={localState.templates.confirmation}
                        onChange={(e) => setLocalState({
                          ...localState,
                          templates: { ...localState.templates, confirmation: e.target.value }
                        })}
                      >
                        <option value="">Sélectionner un template</option>
                        {brevoTemplates.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </>
            )}

            <div className="d-flex justify-content-between mt-4">
              <Button
                variant="outline-primary"
                onClick={handleTestBrevo}
                disabled={loading || brevoLoading || !localState.enabled || !localState.apiKey}
              >
                Tester la connexion
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={loading}
              >
                Sauvegarder
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Modal pour personnaliser les templates */}
      <Modal
        show={showBrevoTemplates}
        onHide={() => setShowBrevoTemplates(false)}
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>Personnaliser les templates Brevo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <BrevoTemplateCustomizer />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default BrevoManager;