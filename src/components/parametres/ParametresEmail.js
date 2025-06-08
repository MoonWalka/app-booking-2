import React, { useState, useEffect } from 'react';
import { Form, Card, Alert, Row, Col } from 'react-bootstrap';
import Button from '@/components/ui/Button';
import { useParametres } from '@/context/ParametresContext';
import emailService from '@/services/emailService';
import { debugLog } from '@/utils/logUtils';

const ParametresEmail = () => {
  const { parametres, sauvegarderParametres, loading } = useParametres();
  const [localState, setLocalState] = useState({
    smtp: {
      enabled: false,
      host: '',
      port: '587',
      secure: false,
      user: '',
      pass: '',
      from: '',
      fromName: 'TourCraft'
    },
    templates: {
      useCustomTemplates: false,
      signatureName: '',
      signatureTitle: '',
      footerText: ''
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [testLoading, setTestLoading] = useState(false);

  // Providers SMTP prédéfinis
  const smtpProviders = [
    { name: 'Gmail', host: 'smtp.gmail.com', port: '587', secure: false },
    { name: 'Outlook/Office365', host: 'smtp.office365.com', port: '587', secure: false },
    { name: 'SendGrid', host: 'smtp.sendgrid.net', port: '587', secure: false },
    { name: 'Mailgun', host: 'smtp.mailgun.org', port: '587', secure: false },
    { name: 'OVH', host: 'ssl0.ovh.net', port: '587', secure: false },
    { name: 'Custom', host: '', port: '587', secure: false }
  ];

  useEffect(() => {
    if (parametres.email) {
      setLocalState(prev => ({
        ...prev,
        ...parametres.email
      }));
    }
  }, [parametres.email]);

  const handleChange = (section, field, value) => {
    setLocalState(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleProviderSelect = (provider) => {
    if (provider.name !== 'Custom') {
      setLocalState(prev => ({
        ...prev,
        smtp: {
          ...prev.smtp,
          host: provider.host,
          port: provider.port,
          secure: provider.secure
        }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const success = await sauvegarderParametres('email', localState);
      if (success) {
        setSuccess('Paramètres email sauvegardés avec succès');
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      setError('Erreur lors de la sauvegarde des paramètres');
      debugLog('[ParametresEmail] Erreur sauvegarde:', err, 'error');
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail || !emailService.validateEmail(testEmail)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    setTestLoading(true);
    setError('');
    setSuccess('');

    try {
      await emailService.sendTestEmail(testEmail);
      setSuccess('Email de test envoyé avec succès !');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(`Erreur lors de l'envoi: ${err.message}`);
      debugLog('[ParametresEmail] Erreur test email:', err, 'error');
    } finally {
      setTestLoading(false);
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <Card>
      <Card.Body>
        <h3 className="mb-4">Configuration Email</h3>
        
        {success && <Alert variant="success">{success}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          {/* Configuration SMTP */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Serveur SMTP</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Check 
                  type="switch"
                  id="smtp-enabled"
                  label="Activer l'envoi d'emails via SMTP"
                  checked={localState.smtp.enabled}
                  onChange={(e) => handleChange('smtp', 'enabled', e.target.checked)}
                />
                <Form.Text className="text-muted">
                  Permet d'envoyer des emails depuis l'application (contrats, formulaires, relances)
                </Form.Text>
              </Form.Group>

              {localState.smtp.enabled && (
                <>
                  {/* Sélection rapide du provider */}
                  <Form.Group className="mb-3">
                    <Form.Label>Fournisseur</Form.Label>
                    <div className="d-flex flex-wrap gap-2">
                      {smtpProviders.map(provider => (
                        <Button
                          key={provider.name}
                          variant={localState.smtp.host === provider.host ? 'primary' : 'outline-primary'}
                          size="sm"
                          type="button"
                          onClick={() => handleProviderSelect(provider)}
                        >
                          {provider.name}
                        </Button>
                      ))}
                    </div>
                  </Form.Group>

                  <Row>
                    <Col md={8}>
                      <Form.Group className="mb-3">
                        <Form.Label>Serveur SMTP</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="smtp.gmail.com"
                          value={localState.smtp.host}
                          onChange={(e) => handleChange('smtp', 'host', e.target.value)}
                          required={localState.smtp.enabled}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Port</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="587"
                          value={localState.smtp.port}
                          onChange={(e) => handleChange('smtp', 'port', e.target.value)}
                          required={localState.smtp.enabled}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Email d'authentification</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="votre-email@gmail.com"
                      value={localState.smtp.user}
                      onChange={(e) => handleChange('smtp', 'user', e.target.value)}
                      required={localState.smtp.enabled}
                    />
                    <Form.Text className="text-muted">
                      L'adresse email utilisée pour s'authentifier au serveur SMTP
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Mot de passe</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mot de passe d'application"
                        value={localState.smtp.pass}
                        onChange={(e) => handleChange('smtp', 'pass', e.target.value)}
                        required={localState.smtp.enabled}
                      />
                      <Button
                        variant="outline-secondary"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                      </Button>
                    </div>
                    <Form.Text className="text-muted">
                      Pour Gmail: utilisez un mot de passe d'application (pas votre mot de passe habituel)
                    </Form.Text>
                  </Form.Group>

                  <Row>
                    <Col md={8}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email d'expédition</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="noreply@votredomaine.com"
                          value={localState.smtp.from}
                          onChange={(e) => handleChange('smtp', 'from', e.target.value)}
                          required={localState.smtp.enabled}
                        />
                        <Form.Text className="text-muted">
                          L'adresse qui apparaîtra comme expéditeur
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nom d'expédition</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="TourCraft"
                          value={localState.smtp.fromName}
                          onChange={(e) => handleChange('smtp', 'fromName', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Check 
                      type="switch"
                      id="smtp-secure"
                      label="Connexion sécurisée (SSL/TLS)"
                      checked={localState.smtp.secure}
                      onChange={(e) => handleChange('smtp', 'secure', e.target.checked)}
                    />
                  </Form.Group>
                </>
              )}
            </Card.Body>
          </Card>

          {/* Templates d'email */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Personnalisation des emails</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Check 
                  type="switch"
                  id="use-custom-templates"
                  label="Utiliser des templates personnalisés"
                  checked={localState.templates.useCustomTemplates}
                  onChange={(e) => handleChange('templates', 'useCustomTemplates', e.target.checked)}
                />
              </Form.Group>

              {localState.templates.useCustomTemplates && (
                <>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nom du signataire</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Jean Dupont"
                          value={localState.templates.signatureName}
                          onChange={(e) => handleChange('templates', 'signatureName', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Titre du signataire</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Directeur de production"
                          value={localState.templates.signatureTitle}
                          onChange={(e) => handleChange('templates', 'signatureTitle', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Texte de pied de page</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Ce message a été envoyé automatiquement..."
                      value={localState.templates.footerText}
                      onChange={(e) => handleChange('templates', 'footerText', e.target.value)}
                    />
                  </Form.Group>
                </>
              )}
            </Card.Body>
          </Card>

          {/* Test d'envoi */}
          {localState.smtp.enabled && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Test de configuration</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Envoyer un email de test à :</Form.Label>
                  <div className="input-group">
                    <Form.Control
                      type="email"
                      placeholder="test@example.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                    />
                    <Button
                      variant="outline-primary"
                      type="button"
                      onClick={handleTestEmail}
                      disabled={testLoading}
                      icon={<i className="bi bi-send"></i>}
                    >
                      {testLoading ? 'Envoi...' : 'Envoyer'}
                    </Button>
                  </div>
                </Form.Group>
              </Card.Body>
            </Card>
          )}

          <div className="d-flex gap-2">
            <Button 
              type="submit" 
              variant="primary"
              icon={<i className="bi bi-save"></i>}
            >
              Enregistrer les paramètres
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ParametresEmail;