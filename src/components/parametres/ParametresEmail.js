import React, { useState, useEffect } from 'react';
import { Form, Card, Alert, Row, Col, Badge, Modal } from 'react-bootstrap';
import Button from '@/components/ui/Button';
import { useParametres } from '@/context/ParametresContext';
import emailService from '@/services/emailService';
import { debugLog } from '@/utils/logUtils';
import { decryptSensitiveFields } from '@/utils/cryptoUtils';
import BrevoTemplateCustomizer from '@/components/debug/BrevoTemplateCustomizer';

const ParametresEmail = () => {
  const { parametres, sauvegarderParametres, loading } = useParametres();
  const [localState, setLocalState] = useState({
    provider: 'smtp', // 'smtp' ou 'brevo'
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
    brevo: {
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
    },
    templates: {
      useCustomTemplates: false,
      signatureName: '',
      signatureTitle: '',
      footerText: ''
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [brevoLoading, setBrevoLoading] = useState(false);
  const [brevoTemplates, setBrevoTemplates] = useState([]);
  const [validatingApiKey, setValidatingApiKey] = useState(false);
  
  // État pour la modal du configurateur de templates
  const [showTemplateCreator, setShowTemplateCreator] = useState(false);

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

  // Charger automatiquement les templates Brevo si la clé API est configurée
  useEffect(() => {
    const loadTemplatesIfConfigured = async () => {
      if (localState.provider === 'brevo' && 
          localState.brevo.enabled && 
          localState.brevo.apiKey &&
          brevoTemplates.length === 0) {
        
        // Charger les templates automatiquement
        try {
          await loadBrevoTemplates();
        } catch (err) {
          // En cas d'erreur, ne pas bloquer l'interface
          debugLog('[ParametresEmail] Erreur chargement auto templates:', err, 'error');
        }
      }
    };

    loadTemplatesIfConfigured();
  // eslint-disable-next-line react-hooks/exhaustive-deps  
  }, [localState.provider, localState.brevo.enabled, localState.brevo.apiKey, brevoTemplates.length]);

  const handleChange = (section, field, value) => {
    setLocalState(prev => {
      if (section === '') {
        // Pour les champs racine comme 'provider'
        return {
          ...prev,
          [field]: value
        };
      } else if (field.includes('.')) {
        // Pour les objets imbriqués comme 'templates.formulaire'
        const [subSection, subField] = field.split('.');
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [subSection]: {
              ...prev[section][subSection],
              [subField]: value
            }
          }
        };
      } else {
        // Pour les champs normaux
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
      }
    });
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
      // Si Brevo est configuré, utiliser l'envoi direct
      if (localState.provider === 'brevo' && localState.brevo.enabled && localState.brevo.apiKey) {
        await sendTestEmailDirect(testEmail);
      } else {
        // Sinon utiliser le service standard (SMTP)
        await emailService.sendTestEmail(testEmail);
      }
      setSuccess('Email de test envoyé avec succès !');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(`Erreur lors de l'envoi: ${err.message}`);
      debugLog('[ParametresEmail] Erreur test email:', err, 'error');
    } finally {
      setTestLoading(false);
    }
  };

  // Fonction d'envoi direct via Brevo (contourne les Cloud Functions)
  const sendTestEmailDirect = async (email) => {
    // Déchiffrer la clé API si nécessaire
    let apiKeyToUse = localState.brevo.apiKey;
    if (localState.brevo.apiKey.startsWith('ENC:')) {
      const decryptedData = decryptSensitiveFields({ apiKey: localState.brevo.apiKey }, ['apiKey']);
      apiKeyToUse = decryptedData.apiKey;
    }

    const emailData = {
      to: [{ email }],
      subject: 'TourCraft - Email de test',
      htmlContent: `
        <h2>Test du service d'email Brevo</h2>
        <p>Ceci est un email de test envoyé depuis TourCraft via Brevo.</p>
        <p>Si vous recevez cet email, le service fonctionne correctement !</p>
        <hr>
        <p><small>Envoyé le ${new Date().toLocaleString('fr-FR')}</small></p>
      `,
      sender: {
        email: localState.brevo.fromEmail,
        name: localState.brevo.fromName || 'TourCraft'
      }
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKeyToUse,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Erreur Brevo: ${response.status} - ${errorData}`);
    }

    const result = await response.json();
    debugLog('[ParametresEmail] Email test Brevo envoyé:', { messageId: result.messageId }, 'success');
    
    return result;
  };

  const handleValidateBrevoApiKey = async () => {
    if (!localState.brevo.apiKey) {
      setError('Veuillez entrer une clé API Brevo');
      return;
    }

    setValidatingApiKey(true);
    setError('');
    setSuccess('');

    try {
      // Déchiffrer la clé API si nécessaire
      let apiKeyToUse = localState.brevo.apiKey;
      if (localState.brevo.apiKey.startsWith('ENC:')) {
        const decryptedData = decryptSensitiveFields({ apiKey: localState.brevo.apiKey }, ['apiKey']);
        apiKeyToUse = decryptedData.apiKey;
        debugLog('[ParametresEmail] Clé API déchiffrée pour validation', { 
          keyPreview: apiKeyToUse.substring(0, 10) + '...' 
        }, 'info');
      }

      const isValid = await emailService.validateBrevoApiKey(apiKeyToUse);
      if (isValid) {
        setSuccess('Clé API Brevo valide ! Récupération des templates...');
        await loadBrevoTemplates();
      } else {
        setError('Clé API Brevo invalide');
      }
    } catch (err) {
      setError(`Erreur validation Brevo: ${err.message}`);
      debugLog('[ParametresEmail] Erreur validation Brevo:', err, 'error');
    } finally {
      setValidatingApiKey(false);
    }
  };

  const loadBrevoTemplates = async () => {
    if (!localState.brevo.apiKey) return;

    setBrevoLoading(true);
    try {
      // Déchiffrer la clé API si nécessaire
      let apiKeyToUse = localState.brevo.apiKey;
      if (localState.brevo.apiKey.startsWith('ENC:')) {
        const decryptedData = decryptSensitiveFields({ apiKey: localState.brevo.apiKey }, ['apiKey']);
        apiKeyToUse = decryptedData.apiKey;
        debugLog('[ParametresEmail] Clé API déchiffrée pour chargement templates', { 
          keyPreview: apiKeyToUse.substring(0, 10) + '...' 
        }, 'info');
      }

      const templates = await emailService.getBrevoTemplates(apiKeyToUse);
      setBrevoTemplates(templates);
      debugLog('[ParametresEmail] Templates Brevo chargés:', templates, 'info');
    } catch (err) {
      setError(`Erreur chargement templates: ${err.message}`);
      debugLog('[ParametresEmail] Erreur templates Brevo:', err, 'error');
    } finally {
      setBrevoLoading(false);
    }
  };

  const handleTestBrevoTemplate = async (templateName) => {
    if (!testEmail || !emailService.validateEmail(testEmail)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    setTestLoading(true);
    setError('');
    setSuccess('');

    try {
      await emailService.testBrevoTemplate(templateName, testEmail);
      setSuccess(`Test template "${templateName}" envoyé avec succès !`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(`Erreur test template: ${err.message}`);
      debugLog('[ParametresEmail] Erreur test template Brevo:', err, 'error');
    } finally {
      setTestLoading(false);
    }
  };

  // Ces fonctions ne sont plus nécessaires avec le nouveau configurateur
  /*
  // Analyser les templates TourCraft existants
  const analyzeExistingTourCraftTemplates = (templates) => {
    const tourCraftExisting = templates.filter(t => 
      t.name && t.name.startsWith('[TourCraft]')
    );
    
    const available = Object.keys(templateTypes).map(type => {
      const existing = tourCraftExisting.find(t => 
        t.name.includes(templateTypes[type].name)
      );
      
      return {
        type,
        ...templateTypes[type],
        exists: !!existing,
        existingTemplate: existing
      };
    });
    
    setExistingTourCraftTemplates(available);
  };

  // Générer le HTML pour un template (version simplifiée)
  const generateTemplateHTML = (type) => {
    const baseStyles = `
      <style>
        .email-container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #ffffff; }
        .footer { background: #ecf0f1; padding: 20px; text-align: center; color: #7f8c8d; }
        .highlight { background: #f8f9fa; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0; }
        .variable { color: #e74c3c; font-weight: bold; }
      </style>
    `;

    const templates = {
      formulaire: `${baseStyles}
        <div class="email-container">
          <div class="header">
            <h1>TourCraft</h1>
            <p>Demande d'informations reçue</p>
          </div>
          <div class="content">
            <h2>Bonjour <span class="variable">{{contact_prenom}} {{contact_nom}}</span>,</h2>
            <p>Nous avons bien reçu votre demande d'informations concernant :</p>
            <div class="highlight">
              <h3><span class="variable">{{date_nom}}</span></h3>
              <p><strong>Date :</strong> <span class="variable">{{date_date}}</span></p>
            </div>
            <p>Nous reviendrons vers vous dans les plus brefs délais.</p>
          </div>
          <div class="footer">
            <p>Email automatique - TourCraft</p>
          </div>
        </div>`,
      relance: `${baseStyles}
        <div class="email-container">
          <div class="header">
            <h1>TourCraft</h1>
            <p>Documents manquants</p>
          </div>
          <div class="content">
            <h2>Bonjour <span class="variable">{{contact_prenom}} {{contact_nom}}</span>,</h2>
            <p>Concernant <strong><span class="variable">{{date_nom}}</span></strong>, il nous manque :</p>
            <div class="highlight">
              <p><span class="variable">{{documents_manquants}}</span></p>
            </div>
            <p>Merci de nous transmettre ces éléments rapidement.</p>
          </div>
          <div class="footer">
            <p>Relance automatique - TourCraft</p>
          </div>
        </div>`,
      contrat: `${baseStyles}
        <div class="email-container">
          <div class="header">
            <h1>TourCraft</h1>
            <p>Contrat signé</p>
          </div>
          <div class="content">
            <h2>Bonjour <span class="variable">{{contact_prenom}} {{contact_nom}}</span>,</h2>
            <p>Votre contrat pour <strong><span class="variable">{{date_nom}}</span></strong> est finalisé.</p>
            <p>Vous trouverez le contrat signé en pièce jointe.</p>
          </div>
          <div class="footer">
            <p>Contrat automatique - TourCraft</p>
          </div>
        </div>`,
      confirmation: `${baseStyles}
        <div class="email-container">
          <div class="header">
            <h1>TourCraft</h1>
            <p>Confirmation de réservation</p>
          </div>
          <div class="content">
            <h2>Bonjour <span class="variable">{{contact_prenom}} {{contact_nom}}</span>,</h2>
            <p>Nous confirmons votre réservation :</p>
            <div class="highlight">
              <h3><span class="variable">{{date_nom}}</span></h3>
              <p><strong>Date :</strong> <span class="variable">{{date_date}}</span></p>
            </div>
            <p>Nous vous souhaitons un excellent événement !</p>
          </div>
          <div class="footer">
            <p>Confirmation automatique - TourCraft</p>
          </div>
        </div>`
    };

    return templates[type] || '';
  };

  // Créer un template dans Brevo
  const createTemplateInBrevo = async (type) => {
    if (!localState.brevo.apiKey) {
      setError('Configuration Brevo manquante');
      return;
    }

    setTemplateCreating(true);
    setError('');
    setSuccess('');

    try {
      // Déchiffrer la clé API si nécessaire
      let apiKeyToUse = localState.brevo.apiKey;
      if (localState.brevo.apiKey.startsWith('ENC:')) {
        const decryptedData = decryptSensitiveFields({ apiKey: localState.brevo.apiKey }, ['apiKey']);
        apiKeyToUse = decryptedData.apiKey;
      }

      const config = templateTypes[type];
      const html = generateTemplateHTML(type);
      const templateName = `[TourCraft] ${config.name}`;

      const templateData = {
        templateName: templateName,
        subject: config.subject,
        htmlContent: html,
        isActive: true,
        tag: 'TourCraft',
        sender: {
          name: localState.brevo.fromName || 'TourCraft',
          email: localState.brevo.fromEmail
        }
      };

      const response = await fetch('https://api.brevo.com/v3/smtp/templates', {
        method: 'POST',
        headers: {
          'api-key': apiKeyToUse,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      });

      if (response.ok) {
        await response.json(); // Récupérer la réponse mais pas besoin de la stocker
        setSuccess(`Template "${config.name}" créé avec succès ! Rechargement des templates...`);
        
        // Recharger la liste des templates
        await loadBrevoTemplates();
        setShowTemplateCreator(false);
      } else {
        const errorData = await response.text();
        setError(`Erreur création template: ${response.status} - ${errorData}`);
      }
    } catch (err) {
      setError(`Erreur: ${err.message}`);
    } finally {
      setTemplateCreating(false);
    }
  };
  */

  // Ouvrir le configurateur de templates
  const openTemplateCreator = () => {
    setShowTemplateCreator(true);
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <>
      <Card>
        <Card.Body>
        <h3 className="mb-4">Configuration Email</h3>
        
        {success && <Alert variant="success">{success}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          {/* Sélection du provider */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Fournisseur d'email</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Choisir le service d'envoi d'emails</Form.Label>
                <div className="d-flex gap-3">
                  <Form.Check
                    type="radio"
                    id="provider-smtp"
                    name="emailProvider"
                    label="SMTP Classique"
                    checked={localState.provider === 'smtp'}
                    onChange={() => handleChange('', 'provider', 'smtp')}
                  />
                  <Form.Check
                    type="radio"
                    id="provider-brevo"
                    name="emailProvider"
                    label="Brevo (recommandé)"
                    checked={localState.provider === 'brevo'}
                    onChange={() => handleChange('', 'provider', 'brevo')}
                  />
                </div>
                <Form.Text className="text-muted">
                  {localState.provider === 'brevo' 
                    ? 'Brevo offre des templates visuels, de meilleures statistiques et un taux de délivrance optimal'
                    : 'Configuration SMTP traditionnelle avec votre propre serveur email'
                  }
                </Form.Text>
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Configuration Brevo */}
          {localState.provider === 'brevo' && (
            <Card className="mb-4">
              <Card.Header className="d-flex align-items-center">
                <h5 className="mb-0">Configuration Brevo</h5>
                <span className="badge bg-success ms-2">Recommandé</span>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Check 
                    type="switch"
                    id="brevo-enabled"
                    label="Activer l'envoi d'emails via Brevo"
                    checked={localState.brevo.enabled}
                    onChange={(e) => handleChange('brevo', 'enabled', e.target.checked)}
                  />
                  <Form.Text className="text-muted">
                    Service d'emailing professionnel avec templates visuels et analytics
                  </Form.Text>
                </Form.Group>

                {localState.brevo.enabled && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label className="d-flex align-items-center gap-2">
                        Clé API Brevo
                        <Badge bg="success" className="d-flex align-items-center gap-1">
                          <i className="bi bi-shield-check"></i>
                          Chiffrée
                        </Badge>
                      </Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type={showApiKey ? 'text' : 'password'}
                          placeholder="xkeysib-..."
                          value={localState.brevo.apiKey}
                          onChange={(e) => handleChange('brevo', 'apiKey', e.target.value)}
                          required={localState.brevo.enabled}
                        />
                        <Button
                          variant="outline-secondary"
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          <i className={`bi bi-eye${showApiKey ? '-slash' : ''}`}></i>
                        </Button>
                        <Button
                          variant="outline-primary"
                          type="button"
                          onClick={handleValidateBrevoApiKey}
                          disabled={validatingApiKey || !localState.brevo.apiKey}
                        >
                          {validatingApiKey ? 'Validation...' : 'Valider'}
                        </Button>
                      </div>
                      <Form.Text className="text-muted d-flex align-items-center gap-2">
                        <i className="bi bi-info-circle"></i>
                        Récupérez votre clé API dans votre compte Brevo → SMTP & API → API Keys
                      </Form.Text>
                      <Form.Text className="text-success d-flex align-items-center gap-1 mt-1">
                        <i className="bi bi-lock-fill"></i>
                        Votre clé API est automatiquement chiffrée avant stockage
                      </Form.Text>
                    </Form.Group>

                    <Row>
                      <Col md={8}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email d'expédition</Form.Label>
                          <Form.Control
                            type="email"
                            placeholder="noreply@votredomaine.com"
                            value={localState.brevo.fromEmail}
                            onChange={(e) => handleChange('brevo', 'fromEmail', e.target.value)}
                            required={localState.brevo.enabled}
                          />
                          <Form.Text className="text-muted">
                            Email configuré et vérifié dans votre compte Brevo
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Nom d'expédition</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="TourCraft"
                            value={localState.brevo.fromName}
                            onChange={(e) => handleChange('brevo', 'fromName', e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Création de templates TourCraft */}
                    {brevoTemplates.length > 0 && (
                      <div className="mt-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6>Templates TourCraft</h6>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={openTemplateCreator}
                          >
                            <i className="bi bi-palette me-2"></i>
                            Personnaliser les templates
                          </Button>
                        </div>
                        <p className="text-muted small">
                          Créez automatiquement vos templates TourCraft dans Brevo avec le bon design et les bonnes variables
                        </p>
                      </div>
                    )}

                    {/* Configuration des templates */}
                    {brevoTemplates.length > 0 && (
                      <div className="mt-4">
                        <h6>Association des templates</h6>
                        <p className="text-muted small">
                          Associez vos templates Brevo créés aux types d'emails TourCraft
                        </p>
                        
                        {Object.keys(localState.brevo.templates).map(templateType => (
                          <Form.Group key={templateType} className="mb-3">
                            <Form.Label className="text-capitalize">
                              Template {templateType}
                              {templateType === 'formulaire' && ' (demande infos)'}
                              {templateType === 'relance' && ' (documents manquants)'}
                              {templateType === 'contrat' && ' (contrat prêt)'}
                              {templateType === 'confirmation' && ' (confirmation finale)'}
                            </Form.Label>
                            <div className="d-flex gap-2">
                              <Form.Select
                                value={localState.brevo.templates[templateType]}
                                onChange={(e) => handleChange('brevo', `templates.${templateType}`, e.target.value)}
                              >
                                <option value="">-- Choisir un template --</option>
                                {brevoTemplates.map(template => (
                                  <option key={template.id} value={template.id}>
                                    {template.name} (ID: {template.id})
                                  </option>
                                ))}
                              </Form.Select>
                              {localState.brevo.templates[templateType] && (
                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  type="button"
                                  onClick={() => handleTestBrevoTemplate(templateType)}
                                  disabled={testLoading || !testEmail}
                                  title={`Tester le template ${templateType}`}
                                >
                                  <i className="bi bi-send"></i>
                                </Button>
                              )}
                            </div>
                          </Form.Group>
                        ))}

                        {brevoLoading && (
                          <div className="text-center text-muted">
                            <i className="bi bi-hourglass-split"></i> Chargement des templates...
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Configuration SMTP */}
          {localState.provider === 'smtp' && (
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
          )}

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
          {((localState.provider === 'smtp' && localState.smtp.enabled) || 
            (localState.provider === 'brevo' && localState.brevo.enabled)) && (
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
                  <Form.Text className="text-muted">
                    {localState.provider === 'brevo' 
                      ? 'Test avec un email transactionnel simple (pas de template)'
                      : 'Test de la configuration SMTP'
                    }
                  </Form.Text>
                </Form.Group>

                {/* Tests spécifiques Brevo */}
                {localState.provider === 'brevo' && brevoTemplates.length > 0 && (
                  <div className="mt-3">
                    <h6>Test des templates Brevo</h6>
                    <p className="text-muted small">
                      Testez vos templates avec des données de démonstration
                    </p>
                    <div className="d-flex flex-wrap gap-2">
                      {Object.entries(localState.brevo.templates)
                        .filter(([, templateId]) => templateId)
                        .map(([templateType]) => (
                          <Button
                            key={templateType}
                            variant="outline-info"
                            size="sm"
                            type="button"
                            onClick={() => handleTestBrevoTemplate(templateType)}
                            disabled={testLoading || !testEmail}
                          >
                            Test {templateType}
                          </Button>
                        ))
                      }
                    </div>
                  </div>
                )}
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

      {/* Modal du configurateur de templates */}
    <Modal show={showTemplateCreator} onHide={() => setShowTemplateCreator(false)} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>🎨 Personnaliser les templates Brevo</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <BrevoTemplateCustomizer />
      </Modal.Body>
    </Modal>
    </>
  );
};

export default ParametresEmail;