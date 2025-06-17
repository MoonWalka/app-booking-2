import React, { useState, useCallback, useMemo } from 'react';
import { Card, Alert, Row, Col, Form, Modal, Tab, Tabs } from 'react-bootstrap';
import { useOrganization } from '@/context/OrganizationContext';
import { decryptSensitiveFields } from '@/utils/cryptoUtils';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * Configurateur visuel pour créer des templates Brevo personnalisés
 * Interface ultra simple pour les utilisateurs non-techniques
 */
const BrevoTemplateCustomizer = () => {
  const { currentOrganization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Configuration Brevo
  const [brevoConfig, setBrevoConfig] = useState(null);
  
  // État du configurateur
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  // Configuration du design
  const [designConfig, setDesignConfig] = useState({
    primaryColor: '#2c3e50',
    secondaryColor: '#3498db',
    backgroundColor: '#ffffff',
    headerColor: '#2c3e50',
    textColor: '#333333',
    organizationName: '',
    logoUrl: '',
    footerText: 'Cet email a été envoyé automatiquement depuis TourCraft'
  });
  
  // Configuration du contenu par type de template
  const [contentConfig, setContentConfig] = useState({
    formulaire: {
      title: 'Demande d\'informations reçue',
      greeting: 'Bonjour {{params.prenom_programmateur}} {{params.nom_programmateur}},',
      mainMessage: 'Nous avons bien reçu votre demande d\'informations concernant votre projet.',
      additionalInfo: 'Pour établir votre contrat, nous avons besoin de quelques informations complémentaires. Merci de prendre quelques minutes pour remplir notre formulaire en ligne.',
      signature: 'Cordialement,\nL\'équipe TourCraft'
    },
    relance: {
      title: 'Documents manquants',
      greeting: 'Bonjour {{params.prenom_programmateur}} {{params.nom_programmateur}},',
      mainMessage: 'Concernant votre projet {{params.titre_concert}}, il nous manque encore quelques documents pour finaliser votre dossier.',
      additionalInfo: 'Merci de nous transmettre ces éléments dans les plus brefs délais.',
      signature: 'Cordialement,\nL\'équipe TourCraft'
    },
    contrat: {
      title: 'Contrat finalisé',
      greeting: 'Bonjour {{params.prenom_programmateur}} {{params.nom_programmateur}},',
      mainMessage: 'Votre contrat concernant {{params.titre_concert}} a été finalisé et est prêt.',
      additionalInfo: 'Vous pouvez le consulter et le télécharger en cliquant sur le lien ci-dessous.',
      signature: 'Cordialement,\nL\'équipe TourCraft'
    },
    confirmation: {
      title: 'Confirmation de réservation',
      greeting: 'Bonjour {{params.prenom_programmateur}} {{params.nom_programmateur}},',
      mainMessage: 'Nous confirmons votre réservation pour {{params.titre_concert}}.',
      additionalInfo: 'Nous vous souhaitons un excellent événement !',
      signature: 'Cordialement,\nL\'équipe TourCraft'
    }
  });
  
  // Types de templates disponibles
  const templateTypes = useMemo(() => ({
    formulaire: {
      name: 'Formulaire Programmateur',
      description: 'Email envoyé après soumission du formulaire',
      icon: '📝',
      subject: 'Votre demande d\'informations - {{params.titre_concert}}',
      variables: ['params.titre_concert', 'params.date_concert', 'params.lieu_nom', 'params.nom_programmateur', 'params.prenom_programmateur', 'params.lien_formulaire']
    },
    relance: {
      name: 'Relance Documents',
      description: 'Email de relance pour documents manquants',
      icon: '📬',
      subject: 'Documents manquants - {{params.titre_concert}}',
      variables: ['params.titre_concert', 'params.nom_programmateur', 'params.prenom_programmateur', 'params.documents_manquants', 'params.nombre_relance']
    },
    contrat: {
      name: 'Envoi de Contrat',
      description: 'Email d\'envoi du contrat signé',
      icon: '📄',
      subject: 'Contrat signé - {{params.titre_concert}}',
      variables: ['params.titre_concert', 'params.nom_programmateur', 'params.prenom_programmateur', 'params.contrat_type', 'params.date_signature']
    },
    confirmation: {
      name: 'Confirmation de Réservation',
      description: 'Email de confirmation de réservation',
      icon: '✅',
      subject: 'Confirmation de réservation - {{params.titre_concert}}',
      variables: ['params.titre_concert', 'params.date_concert', 'params.nom_programmateur', 'params.prenom_programmateur', 'params.statut_reservation']
    }
  }), []);

  // Charger la configuration Brevo
  const loadBrevoConfig = useCallback(async () => {
    if (!currentOrganization?.id) return;
    
    setLoading(true);
    try {
      const parametresDoc = await getDoc(
        doc(db, 'organizations', currentOrganization.id, 'parametres', 'settings')
      );
      
      if (parametresDoc.exists()) {
        const parametresData = parametresDoc.data();
        const emailConfig = parametresData.email;
        
        if (emailConfig?.brevo?.enabled && emailConfig.brevo.apiKey) {
          const decryptedConfig = decryptSensitiveFields(emailConfig.brevo, ['apiKey']);
          setBrevoConfig(decryptedConfig);
          
          // Initialiser le nom de l'organisation
          setDesignConfig(prev => ({
            ...prev,
            organizationName: decryptedConfig.fromName || currentOrganization.name || 'TourCraft'
          }));
        } else {
          setError('Brevo n\'est pas configuré pour cette organisation');
        }
      }
    } catch (err) {
      setError(`Erreur chargement configuration: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [currentOrganization?.id, currentOrganization?.name]);

  // Générer le HTML avec la configuration personnalisée
  const generateCustomHTML = useCallback((templateType, forCreation = false) => {
    const content = contentConfig[templateType];
    const design = designConfig;
    
    // Pour la prévisualisation, utiliser des exemples
    // Mais garder les vraies variables {{}} pour le template final
    const isPreview = !forCreation;
    
    let processedGreeting = content.greeting;
    let processedMainMessage = content.mainMessage;
    let processedAdditionalInfo = content.additionalInfo;
    
    if (isPreview) {
      // Seulement pour la prévisualisation, montrer des exemples
      const previewVariables = {
        'params.prenom_programmateur': 'Jean',
        'params.nom_programmateur': 'Dupont', 
        'params.titre_concert': 'Concert de Jazz - Exemple',
        'params.date_concert': '15 juillet 2024',
        'params.lieu_nom': 'Salle des Fêtes',
        'params.lien_formulaire': '#',
        'params.documents_manquants': 'RIB, Assurance',
        'params.nombre_relance': '2',
        'params.contrat_type': 'Prestation artistique',
        'params.date_signature': '10 juin 2024',
        'params.statut_reservation': 'Confirmée'
      };
      
      Object.entries(previewVariables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        processedGreeting = processedGreeting.replace(regex, `<span style="color: ${design.secondaryColor}; font-weight: bold;">${value}</span>`);
        processedMainMessage = processedMainMessage.replace(regex, `<span style="color: ${design.secondaryColor}; font-weight: bold;">${value}</span>`);
        processedAdditionalInfo = processedAdditionalInfo.replace(regex, `<span style="color: ${design.secondaryColor}; font-weight: bold;">${value}</span>`);
      });
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${content.title}</title>
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f8f9fa;
              color: ${design.textColor};
            }
            .email-container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: ${design.backgroundColor};
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header { 
              background: linear-gradient(135deg, ${design.headerColor} 0%, ${design.primaryColor} 100%);
              color: white; 
              padding: 30px 20px; 
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 300;
            }
            .header p {
              margin: 10px 0 0 0;
              opacity: 0.9;
              font-size: 14px;
            }
            .logo {
              max-width: 150px;
              max-height: 80px;
              margin-bottom: 15px;
            }
            .content { 
              padding: 40px 30px;
              line-height: 1.6;
            }
            .greeting {
              font-size: 18px;
              margin-bottom: 20px;
              color: ${design.textColor};
            }
            .main-message {
              font-size: 16px;
              margin-bottom: 25px;
              color: ${design.textColor};
            }
            .highlight-box {
              background: linear-gradient(135deg, ${design.secondaryColor}15 0%, ${design.primaryColor}15 100%);
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid ${design.secondaryColor};
              margin: 25px 0;
            }
            .additional-info {
              font-size: 15px;
              color: ${design.textColor};
              margin-bottom: 30px;
            }
            .signature {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              font-style: italic;
              color: #666;
              white-space: pre-line;
            }
            .footer { 
              background-color: #f8f9fa;
              padding: 25px 30px; 
              text-align: center; 
              color: #6c757d;
              font-size: 12px;
              border-top: 1px solid #eee;
            }
            .variables-note {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              color: #856404;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
              font-size: 13px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              ${design.logoUrl ? `<img src="${design.logoUrl}" alt="Logo" class="logo" />` : ''}
              <h1>${design.organizationName}</h1>
              <p>${content.title}</p>
            </div>
            <div class="content">
              <div class="greeting">${processedGreeting}</div>
              <div class="main-message">${processedMainMessage}</div>
              
              ${templateType === 'relance' ? `
                <div class="highlight-box">
                  <strong>Documents à fournir :</strong><br>
                  <span style="color: ${design.secondaryColor}; font-weight: bold;">{{params.documents_manquants}}</span>
                  <br><br>
                  <small>Relance n°<span style="color: ${design.secondaryColor}; font-weight: bold;">{{params.nombre_relance}}</span></small>
                </div>
              ` : ''}
              
              ${templateType === 'formulaire' ? `
                <div class="highlight-box">
                  <strong>Votre projet :</strong><br>
                  <span style="color: ${design.secondaryColor}; font-weight: bold;">{{params.titre_concert}}</span><br>
                  <strong>Date :</strong> <span style="color: ${design.secondaryColor}; font-weight: bold;">{{params.date_concert}}</span><br>
                  <strong>Lieu :</strong> <span style="color: ${design.secondaryColor}; font-weight: bold;">{{params.lieu_nom}}</span>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <p style="font-size: 16px; margin-bottom: 20px;">
                    <strong>Pour finaliser votre dossier et établir le contrat, merci de remplir notre formulaire en ligne :</strong>
                  </p>
                  <a href="{{params.lien_formulaire}}" 
                     style="display: inline-block; background: linear-gradient(135deg, ${design.primaryColor} 0%, ${design.secondaryColor} 100%); 
                            color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; 
                            font-weight: bold; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;
                            box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                    📝 Remplir le formulaire
                  </a>
                  <p style="font-size: 14px; color: #666; margin-top: 15px;">
                    Ce formulaire nous permettra de rassembler toutes les informations nécessaires pour votre contrat.
                  </p>
                </div>
              ` : ''}
              
              ${templateType === 'contrat' ? `
                <div class="highlight-box">
                  <strong>Détails du contrat :</strong><br>
                  <strong>Projet :</strong> <span style="color: ${design.secondaryColor}; font-weight: bold;">{{params.titre_concert}}</span><br>
                  <strong>Type :</strong> <span style="color: ${design.secondaryColor}; font-weight: bold;">{{params.type_contrat}}</span><br>
                  <strong>Montant :</strong> <span style="color: ${design.secondaryColor}; font-weight: bold;">{{params.montant_total}}</span><br>
                  <strong>Date limite signature :</strong> <span style="color: ${design.secondaryColor}; font-weight: bold;">{{params.date_signature_limite}}</span>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <p style="font-size: 16px; margin-bottom: 20px;">
                    <strong>Cliquez sur le bouton ci-dessous pour consulter et télécharger votre contrat :</strong>
                  </p>
                  <a href="{{params.lien_contrat}}" 
                     style="display: inline-block; background: linear-gradient(135deg, ${design.primaryColor} 0%, ${design.secondaryColor} 100%); 
                            color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; 
                            font-weight: bold; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;
                            box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                    📄 Consulter le contrat
                  </a>
                  <p style="font-size: 14px; color: #666; margin-top: 15px;">
                    Ce lien vous permettra de visualiser et télécharger le contrat au format PDF.
                  </p>
                </div>
              ` : ''}
              
              ${templateType === 'confirmation' ? `
                <div class="highlight-box">
                  <strong>Détails de la réservation :</strong><br>
                  <strong>Événement :</strong> <span style="color: ${design.secondaryColor}; font-weight: bold;">{{params.titre_concert}}</span><br>
                  <strong>Date :</strong> <span style="color: ${design.secondaryColor}; font-weight: bold;">{{params.date_concert}}</span><br>
                  <strong>Statut :</strong> <span style="color: ${design.secondaryColor}; font-weight: bold;">{{params.statut_reservation}}</span>
                </div>
              ` : ''}
              
              <div class="additional-info">${processedAdditionalInfo}</div>
              <div class="signature">${content.signature}</div>
            </div>
            <div class="footer">
              ${design.footerText}
            </div>
          </div>
        </body>
      </html>
    `;
  }, [contentConfig, designConfig]);

  // Ouvrir le configurateur pour un type de template
  const openCustomizer = (templateType) => {
    setSelectedTemplate(templateType);
    setShowCustomizer(true);
  };

  // Mettre à jour la configuration de design
  const updateDesignConfig = (field, value) => {
    setDesignConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Mettre à jour la configuration de contenu
  const updateContentConfig = (field, value) => {
    if (!selectedTemplate) return;
    
    setContentConfig(prev => ({
      ...prev,
      [selectedTemplate]: {
        ...prev[selectedTemplate],
        [field]: value
      }
    }));
  };

  // Créer un template de debug ultra simple pour tester les variables
  const createSimpleDebugTemplate = async () => {
    if (!brevoConfig?.apiKey) {
      setError('Configuration manquante');
      return;
    }

    setCreating(true);
    setError('');
    setMessage('');

    try {
      const simpleHTML = `
        <!DOCTYPE html>
        <html>
          <head><meta charset="UTF-8"><title>Test Simple</title></head>
          <body style="font-family: Arial; padding: 20px;">
            <h1>Test Variables Simple</h1>
            <p>Nom: {{nom_programmateur}}</p>
            <p>Prénom: {{prenom_programmateur}}</p>
            <p>Concert: {{titre_concert}}</p>
            <p>Email: {{email_programmateur}}</p>
            <p><a href="{{lien_formulaire}}">Lien formulaire</a></p>
            <hr>
            <h2>Test format params</h2>
            <p>params.nom: {{params.nom_programmateur}}</p>
            <p>params.concert: {{params.titre_concert}}</p>
            <p>params.lien: {{params.lien_formulaire}}</p>
            <hr>
            <h2>Test sans préfixe</h2>
            <p>{{nom}}</p>
            <p>{{prenom}}</p>
            <p>{{concert}}</p>
            <p>{{lien}}</p>
          </body>
        </html>
      `;

      const templateData = {
        templateName: '[TourCraft] DEBUG SIMPLE - Variables',
        subject: 'Test Simple: {{nom_programmateur}} - {{titre_concert}}',
        htmlContent: simpleHTML,
        isActive: true,
        tag: 'TourCraft-Debug-Simple',
        sender: {
          name: brevoConfig.fromName || designConfig.organizationName,
          email: brevoConfig.fromEmail
        }
      };

      const response = await fetch('https://api.brevo.com/v3/smtp/templates', {
        method: 'POST',
        headers: {
          'api-key': brevoConfig.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(`✅ Template DEBUG SIMPLE créé ! ID: ${result.id}`);
      } else {
        const errorData = await response.text();
        setError(`Erreur création template simple: ${response.status} - ${errorData}`);
      }
    } catch (err) {
      setError(`Erreur: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  // Créer un template de debug pour tester toutes les variables
  const createDebugTemplate = async () => {
    if (!brevoConfig?.apiKey) {
      setError('Configuration manquante');
      return;
    }

    setCreating(true);
    setError('');
    setMessage('');

    try {
      const debugHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Template Debug TourCraft</title>
            <style>
              body { font-family: Arial; padding: 20px; }
              .variable { background: #f0f0f0; padding: 5px; margin: 2px; }
              .section { border: 1px solid #ccc; margin: 10px 0; padding: 10px; }
            </style>
          </head>
          <body>
            <h1>🔍 Template Debug TourCraft - Test Variables</h1>
            
            <div class="section">
              <h2>Variables Contact</h2>
              <div class="variable">nom_programmateur: {{nom_programmateur}}</div>
              <div class="variable">prenom_programmateur: {{prenom_programmateur}}</div>
              <div class="variable">email_programmateur: {{email_programmateur}}</div>
              <div class="variable">contact_nom: {{contact_nom}}</div>
              <div class="variable">contact_prenom: {{contact_prenom}}</div>
            </div>
            
            <div class="section">
              <h2>Variables Concert</h2>
              <div class="variable">titre_concert: {{titre_concert}}</div>
              <div class="variable">concert_nom: {{concert_nom}}</div>
              <div class="variable">date_concert: {{date_concert}}</div>
              <div class="variable">lieu_nom: {{lieu_nom}}</div>
            </div>
            
            <div class="section">
              <h2>Variables Formulaire</h2>
              <div class="variable">lien_formulaire: {{lien_formulaire}}</div>
              <div class="variable">lienFormulaire: {{lienFormulaire}}</div>
              <div class="variable">lien: {{lien}}</div>
              <div class="variable">formulaire_url: {{formulaire_url}}</div>
            </div>
            
            <div class="section">
              <h2>Test Bouton Formulaire</h2>
              <a href="{{lien_formulaire}}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                📝 Bouton avec lien_formulaire
              </a>
              <br><br>
              <a href="{{lienFormulaire}}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                📝 Bouton avec lienFormulaire
              </a>
            </div>
            
            <div class="section">
              <h2>Variables params (si utilisées)</h2>
              <div class="variable">params.nom: {{params.nom}}</div>
              <div class="variable">params.lienFormulaire: {{params.lienFormulaire}}</div>
              <div class="variable">params.concert: {{params.concert}}</div>
            </div>
            
            <p><em>Ce template de debug permet de voir quelles variables sont correctement remplacées par Brevo.</em></p>
          </body>
        </html>
      `;

      const templateData = {
        templateName: '[TourCraft] DEBUG - Test Variables',
        subject: 'DEBUG: Test Variables TourCraft - {{titre_concert}}',
        htmlContent: debugHTML,
        isActive: true,
        tag: 'TourCraft-Debug',
        sender: {
          name: brevoConfig.fromName || designConfig.organizationName,
          email: brevoConfig.fromEmail
        }
      };

      const response = await fetch('https://api.brevo.com/v3/smtp/templates', {
        method: 'POST',
        headers: {
          'api-key': brevoConfig.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(`✅ Template DEBUG créé avec succès ! ID: ${result.id}. Utilisez cet ID pour tester les variables.`);
      } else {
        const errorData = await response.text();
        setError(`Erreur création template debug: ${response.status} - ${errorData}`);
      }
    } catch (err) {
      setError(`Erreur: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  // Créer le template dans Brevo
  const createCustomTemplate = async () => {
    if (!selectedTemplate || !brevoConfig?.apiKey) {
      setError('Configuration manquante');
      return;
    }

    setCreating(true);
    setError('');
    setMessage('');

    try {
      const templateInfo = templateTypes[selectedTemplate];
      const html = generateCustomHTML(selectedTemplate, true); // true = pour création, pas prévisualisation
      const templateName = `[TourCraft] ${templateInfo.name} - Personnalisé`;

      const templateData = {
        templateName: templateName,
        subject: templateInfo.subject,
        htmlContent: html,
        isActive: true,
        tag: 'TourCraft-Custom',
        sender: {
          name: brevoConfig.fromName || designConfig.organizationName,
          email: brevoConfig.fromEmail
        }
      };

      const response = await fetch('https://api.brevo.com/v3/smtp/templates', {
        method: 'POST',
        headers: {
          'api-key': brevoConfig.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(`✅ Template "${templateInfo.name}" créé avec succès dans Brevo ! ID: ${result.id}`);
        setShowCustomizer(false);
      } else {
        const errorData = await response.text();
        setError(`Erreur création template: ${response.status} - ${errorData}`);
      }
    } catch (err) {
      setError(`Erreur: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  // Charger la config au montage
  React.useEffect(() => {
    loadBrevoConfig();
  }, [loadBrevoConfig]);

  const currentContent = selectedTemplate ? contentConfig[selectedTemplate] : null;
  const currentTemplateInfo = selectedTemplate ? templateTypes[selectedTemplate] : null;

  return (
    <div>
      <Card>
        <Card.Header>
          <h5 className="mb-0">🎨 Configurateur de Templates Brevo</h5>
          <small className="text-muted">
            Créez des templates personnalisés avec une interface simple et visuelle
          </small>
        </Card.Header>
        <Card.Body>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          
          {loading && <LoadingSpinner />}
          
          {!loading && brevoConfig && (
            <>
              <div className="mb-4">
                <h6>📋 Choisissez le type d'email à personnaliser</h6>
                <Row>
                  {Object.entries(templateTypes).map(([type, info]) => (
                    <Col md={6} key={type} className="mb-3">
                      <Card className="h-100 border-primary" style={{ cursor: 'pointer' }} onClick={() => openCustomizer(type)}>
                        <Card.Body className="text-center">
                          <div style={{ fontSize: '2rem' }}>{info.icon}</div>
                          <h6 className="mt-2 mb-1">{info.name}</h6>
                          <p className="text-muted small mb-3">{info.description}</p>
                          <Button variant="primary" size="sm">
                            🎨 Personnaliser
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>

              <Alert variant="info">
                <h6>✨ Avantages du configurateur :</h6>
                <ul className="mb-0">
                  <li><strong>Interface simple</strong> : Pas besoin de connaître le HTML</li>
                  <li><strong>Prévisualisation en temps réel</strong> : Voyez le résultat immédiatement</li>
                  <li><strong>Variables automatiques</strong> : Intégration TourCraft incluse</li>
                  <li><strong>Design professionnel</strong> : Templates responsives et modernes</li>
                </ul>
              </Alert>
              
              <Alert variant="warning">
                <h6>🔍 Diagnostic Variables :</h6>
                <p>Si vos templates n'affichent pas les bonnes données, créez d'abord un template de debug pour identifier quelles variables fonctionnent.</p>
                <div className="d-flex gap-2 flex-wrap">
                  <Button 
                    variant="warning" 
                    size="sm" 
                    onClick={createSimpleDebugTemplate}
                    disabled={creating}
                  >
                    {creating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Création...
                      </>
                    ) : (
                      '🔍 Template Simple'
                    )}
                  </Button>
                  <Button 
                    variant="outline-warning" 
                    size="sm" 
                    onClick={createDebugTemplate}
                    disabled={creating}
                  >
                    {creating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Création...
                      </>
                    ) : (
                      '🔍 Template Complet'
                    )}
                  </Button>
                </div>
              </Alert>
            </>
          )}
          
          {!loading && !brevoConfig && (
            <Alert variant="warning">
              Veuillez configurer Brevo dans les paramètres d'email avant d'utiliser cet outil.
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Modal de personnalisation */}
      <Modal show={showCustomizer} onHide={() => setShowCustomizer(false)} size="xl" className="template-customizer-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            🎨 Personnaliser : {currentTemplateInfo?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentContent && currentTemplateInfo && (
            <Row>
              {/* Configuration à gauche */}
              <Col lg={6}>
                <Tabs defaultActiveKey="design" className="mb-3">
                  <Tab eventKey="design" title="🎨 Design">
                    <Card>
                      <Card.Body>
                        <h6>Couleurs</h6>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Couleur principale</Form.Label>
                              <div className="d-flex align-items-center gap-2">
                                <Form.Control
                                  type="color"
                                  value={designConfig.primaryColor}
                                  onChange={(e) => updateDesignConfig('primaryColor', e.target.value)}
                                  style={{ width: '50px', height: '38px' }}
                                />
                                <Form.Control
                                  type="text"
                                  value={designConfig.primaryColor}
                                  onChange={(e) => updateDesignConfig('primaryColor', e.target.value)}
                                />
                              </div>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Couleur secondaire</Form.Label>
                              <div className="d-flex align-items-center gap-2">
                                <Form.Control
                                  type="color"
                                  value={designConfig.secondaryColor}
                                  onChange={(e) => updateDesignConfig('secondaryColor', e.target.value)}
                                  style={{ width: '50px', height: '38px' }}
                                />
                                <Form.Control
                                  type="text"
                                  value={designConfig.secondaryColor}
                                  onChange={(e) => updateDesignConfig('secondaryColor', e.target.value)}
                                />
                              </div>
                            </Form.Group>
                          </Col>
                        </Row>

                        <h6 className="mt-4">Organisation</h6>
                        <Form.Group className="mb-3">
                          <Form.Label>Nom de l'organisation</Form.Label>
                          <Form.Control
                            type="text"
                            value={designConfig.organizationName}
                            onChange={(e) => updateDesignConfig('organizationName', e.target.value)}
                            placeholder="TourCraft"
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>URL du logo (optionnel)</Form.Label>
                          <Form.Control
                            type="url"
                            value={designConfig.logoUrl}
                            onChange={(e) => updateDesignConfig('logoUrl', e.target.value)}
                            placeholder="https://votre-site.com/logo.png"
                          />
                          <Form.Text className="text-muted">
                            Utilisez une URL publique vers votre logo (PNG, JPG)
                          </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Texte de pied de page</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={designConfig.footerText}
                            onChange={(e) => updateDesignConfig('footerText', e.target.value)}
                          />
                        </Form.Group>
                      </Card.Body>
                    </Card>
                  </Tab>
                  
                  <Tab eventKey="content" title="📝 Contenu">
                    <Card>
                      <Card.Body>
                        <Form.Group className="mb-3">
                          <Form.Label>Titre de l'email</Form.Label>
                          <Form.Control
                            type="text"
                            value={currentContent.title}
                            onChange={(e) => updateContentConfig('title', e.target.value)}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Formule de politesse</Form.Label>
                          <Form.Control
                            type="text"
                            value={currentContent.greeting}
                            onChange={(e) => updateContentConfig('greeting', e.target.value)}
                          />
                          <Form.Text className="text-muted">
                            Utilisez les variables : {currentTemplateInfo.variables.map(v => `{{${v}}}`).join(', ')}
                          </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Message principal</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={currentContent.mainMessage}
                            onChange={(e) => updateContentConfig('mainMessage', e.target.value)}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Informations complémentaires</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={currentContent.additionalInfo}
                            onChange={(e) => updateContentConfig('additionalInfo', e.target.value)}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Signature</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={currentContent.signature}
                            onChange={(e) => updateContentConfig('signature', e.target.value)}
                          />
                        </Form.Group>
                      </Card.Body>
                    </Card>
                  </Tab>
                </Tabs>
              </Col>

              {/* Prévisualisation à droite */}
              <Col lg={6}>
                <div className="sticky-top">
                  <h6>👁️ Prévisualisation en temps réel</h6>
                  <div 
                    className="border rounded p-2" 
                    style={{ 
                      height: '600px', 
                      overflow: 'auto',
                      backgroundColor: '#f8f9fa'
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: generateCustomHTML(selectedTemplate) 
                    }}
                  />
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCustomizer(false)}>
            Annuler
          </Button>
          <Button 
            variant="success" 
            onClick={createCustomTemplate}
            disabled={creating}
          >
            {creating ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Création...
              </>
            ) : (
              '💾 Créer dans Brevo'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BrevoTemplateCustomizer;