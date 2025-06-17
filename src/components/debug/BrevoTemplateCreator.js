import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Alert, Row, Col, Badge, Modal } from 'react-bootstrap';
import { useOrganization } from '@/context/OrganizationContext';
import { decryptSensitiveFields } from '@/utils/cryptoUtils';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * Créateur sécurisé de templates Brevo depuis TourCraft
 * Ne peut que créer de nouveaux templates avec préfixe [TourCraft]
 */
const BrevoTemplateCreator = () => {
  const { currentOrganization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // État de la configuration Brevo
  const [brevoConfig, setBrevoConfig] = useState(null);
  const [existingTemplates, setExistingTemplates] = useState([]);
  
  // Templates TourCraft disponibles
  const [tourCraftTemplates, setTourCraftTemplates] = useState([]);
  
  // Modal de prévisualisation
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  
  // Types de templates TourCraft (memoized pour éviter les re-renders)
  const templateTypes = useMemo(() => ({
    formulaire: {
      name: 'Formulaire Programmateur',
      description: 'Email envoyé après soumission du formulaire de demande d\'infos',
      subject: 'Votre demande d\'informations - {{concert_nom}}',
      variables: ['concert_nom', 'concert_date', 'concert_lieu', 'contact_nom', 'contact_prenom', 'lien_formulaire']
    },
    relance: {
      name: 'Relance Documents',
      description: 'Email de relance pour documents manquants',
      subject: 'Documents manquants - {{concert_nom}}',
      variables: ['concert_nom', 'contact_nom', 'contact_prenom', 'documents_manquants', 'nombre_relance']
    },
    contrat: {
      name: 'Envoi de Contrat',
      description: 'Email d\'envoi du contrat signé',
      subject: 'Contrat signé - {{concert_nom}}',
      variables: ['concert_nom', 'contact_nom', 'contact_prenom', 'contrat_type', 'date_signature']
    },
    confirmation: {
      name: 'Confirmation de Réservation',
      description: 'Email de confirmation de réservation',
      subject: 'Confirmation de réservation - {{concert_nom}}',
      variables: ['concert_nom', 'concert_date', 'contact_nom', 'contact_prenom', 'statut_reservation']
    }
  }), []);

  // Charger les templates existants depuis Brevo
  const loadExistingTemplates = useCallback(async (apiKey) => {
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
        const templates = data.templates || [];
        
        // Filtrer les templates TourCraft existants
        const tourCraftExisting = templates.filter(t => 
          t.name && t.name.startsWith('[TourCraft]')
        );
        
        setExistingTemplates(tourCraftExisting);
        
        // Analyser quels templates TourCraft sont disponibles à créer
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
        
        setTourCraftTemplates(available);
      }
    } catch (err) {
      setError(`Erreur chargement templates: ${err.message}`);
    }
  }, [templateTypes]);

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
          await loadExistingTemplates(decryptedConfig.apiKey);
        } else {
          setError('Brevo n\'est pas configuré pour cette organisation');
        }
      }
    } catch (err) {
      setError(`Erreur chargement configuration: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [currentOrganization?.id, loadExistingTemplates]);

  // Générer le HTML pour un template
  const generateTemplateHTML = (type) => {
    
    const baseStyles = `
      <style>
        .email-container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #ffffff; }
        .footer { background: #ecf0f1; padding: 20px; text-align: center; color: #7f8c8d; }
        .button { background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
        .highlight { background: #f8f9fa; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0; }
        .variable { color: #e74c3c; font-weight: bold; }
      </style>
    `;

    let htmlContent = '';
    
    switch (type) {
      case 'formulaire':
        htmlContent = `
          ${baseStyles}
          <div class="email-container">
            <div class="header">
              <h1>TourCraft</h1>
              <p>Demande d'informations reçue</p>
            </div>
            <div class="content">
              <h2>Bonjour <span class="variable">{{contact_prenom}} {{contact_nom}}</span>,</h2>
              <p>Nous avons bien reçu votre demande d'informations concernant :</p>
              <div class="highlight">
                <h3><span class="variable">{{concert_nom}}</span></h3>
                <p><strong>Date :</strong> <span class="variable">{{concert_date}}</span></p>
                <p><strong>Lieu :</strong> <span class="variable">{{concert_lieu}}</span></p>
              </div>
              <p>Pour établir votre contrat, nous avons besoin de quelques informations complémentaires.</p>
              <p>Merci de prendre quelques minutes pour remplir notre formulaire en ligne :</p>
              <a href="{{lien_formulaire}}" class="button">📝 Remplir le formulaire</a>
              <p style="font-size: 14px; color: #666; margin-top: 15px;">Ce formulaire nous permettra de rassembler toutes les informations nécessaires pour votre contrat.</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement depuis TourCraft</p>
            </div>
          </div>
        `;
        break;
        
      case 'relance':
        htmlContent = `
          ${baseStyles}
          <div class="email-container">
            <div class="header">
              <h1>TourCraft</h1>
              <p>Documents manquants</p>
            </div>
            <div class="content">
              <h2>Bonjour <span class="variable">{{contact_prenom}} {{contact_nom}}</span>,</h2>
              <p>Concernant votre projet <strong><span class="variable">{{concert_nom}}</span></strong>, il nous manque encore quelques documents pour finaliser votre dossier :</p>
              <div class="highlight">
                <h3>Documents à fournir :</h3>
                <p><span class="variable">{{documents_manquants}}</span></p>
              </div>
              <p>Il s'agit de la <span class="variable">{{nombre_relance}}e</span> relance concernant ces documents.</p>
              <p>Merci de nous transmettre ces éléments dans les plus brefs délais pour que nous puissions traiter votre demande.</p>
            </div>
            <div class="footer">
              <p>Relance automatique #{<span class="variable">{{nombre_relance}}</span>} - TourCraft</p>
            </div>
          </div>
        `;
        break;
        
      case 'contrat':
        htmlContent = `
          ${baseStyles}
          <div class="email-container">
            <div class="header">
              <h1>TourCraft</h1>
              <p>Contrat signé</p>
            </div>
            <div class="content">
              <h2>Bonjour <span class="variable">{{contact_prenom}} {{contact_nom}}</span>,</h2>
              <p>Votre contrat concernant <strong><span class="variable">{{concert_nom}}</span></strong> a été finalisé et signé.</p>
              <div class="highlight">
                <h3>Détails du contrat :</h3>
                <p><strong>Type :</strong> <span class="variable">{{contrat_type}}</span></p>
                <p><strong>Date de signature :</strong> <span class="variable">{{date_signature}}</span></p>
              </div>
              <p>Vous trouverez le contrat signé en pièce jointe de cet email.</p>
              <p>Nous vous remercions pour votre confiance et restons à votre disposition pour toute question.</p>
            </div>
            <div class="footer">
              <p>Contrat généré automatiquement par TourCraft</p>
            </div>
          </div>
        `;
        break;
        
      case 'confirmation':
        htmlContent = `
          ${baseStyles}
          <div class="email-container">
            <div class="header">
              <h1>TourCraft</h1>
              <p>Confirmation de réservation</p>
            </div>
            <div class="content">
              <h2>Bonjour <span class="variable">{{contact_prenom}} {{contact_nom}}</span>,</h2>
              <p>Nous confirmons votre réservation pour :</p>
              <div class="highlight">
                <h3><span class="variable">{{concert_nom}}</span></h3>
                <p><strong>Date :</strong> <span class="variable">{{concert_date}}</span></p>
                <p><strong>Statut :</strong> <span class="variable">{{statut_reservation}}</span></p>
              </div>
              <p>Toutes les modalités ont été finalisées selon nos accords.</p>
              <p>Nous vous souhaitons un excellent événement !</p>
            </div>
            <div class="footer">
              <p>Confirmation automatique - TourCraft</p>
            </div>
          </div>
        `;
        break;
      default:
        htmlContent = '';
        break;
    }
    
    return htmlContent;
  };

  // Prévisualiser un template
  const handlePreviewTemplate = (type) => {
    const template = {
      type,
      ...templateTypes[type],
      html: generateTemplateHTML(type)
    };
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  // Créer un template dans Brevo
  const createTemplateInBrevo = useCallback(async (type) => {
    if (!brevoConfig?.apiKey) {
      setError('Configuration Brevo manquante');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
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
          name: brevoConfig.fromName || 'TourCraft',
          email: brevoConfig.fromEmail || 'noreply@tourcraft.com'
        }
      };

      console.log('Template data being sent:', {
        templateName,
        hasTemplateName: !!templateData.templateName,
        hasSubject: !!templateData.subject,
        hasHtml: !!templateData.htmlContent,
        senderName: templateData.sender.name,
        senderEmail: templateData.sender.email
      });

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
        setMessage(`✅ Template "${templateName}" créé avec succès ! ID: ${result.id}`);
        
        // Recharger la liste des templates
        await loadExistingTemplates(brevoConfig.apiKey);
      } else {
        const errorData = await response.text();
        setError(`Erreur création template: ${response.status} - ${errorData}`);
      }
    } catch (err) {
      setError(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [brevoConfig?.apiKey, brevoConfig?.fromEmail, brevoConfig?.fromName, templateTypes, loadExistingTemplates]);

  useEffect(() => {
    loadBrevoConfig();
  }, [loadBrevoConfig]);

  return (
    <div>
      <Card>
        <Card.Header>
          <h5 className="mb-0">🎨 Créateur de Templates Brevo</h5>
          <small className="text-muted">
            Créez vos templates TourCraft directement dans Brevo de manière sécurisée
          </small>
        </Card.Header>
        <Card.Body>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          
          {loading && <LoadingSpinner />}
          
          {!loading && brevoConfig && (
            <>
              <div className="mb-4">
                <h6>📊 État des templates TourCraft dans Brevo</h6>
                <p className="text-muted small">
                  Seuls les templates avec le préfixe [TourCraft] sont gérés par cet outil
                </p>
                
                {existingTemplates.length > 0 && (
                  <div className="mb-3">
                    <strong>Templates TourCraft existants :</strong>
                    <ul className="mt-2">
                      {existingTemplates.map(template => (
                        <li key={template.id} className="mb-1">
                          <Badge bg="info" className="me-2">ID: {template.id}</Badge>
                          {template.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h6>🛠️ Templates TourCraft disponibles</h6>
                <Row>
                  {tourCraftTemplates.map(template => (
                    <Col md={6} key={template.type} className="mb-3">
                      <Card className={template.exists ? 'border-success' : 'border-warning'}>
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="mb-0">{template.name}</h6>
                            <Badge bg={template.exists ? 'success' : 'warning'}>
                              {template.exists ? 'Existe' : 'À créer'}
                            </Badge>
                          </div>
                          
                          <p className="text-muted small mb-2">{template.description}</p>
                          
                          <div className="small mb-3">
                            <strong>Variables :</strong> {template.variables.join(', ')}
                          </div>
                          
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handlePreviewTemplate(template.type)}
                            >
                              👁️ Prévisualiser
                            </Button>
                            
                            {!template.exists && (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => createTemplateInBrevo(template.type)}
                                disabled={loading}
                              >
                                ➕ Créer dans Brevo
                              </Button>
                            )}
                            
                            {template.exists && (
                              <Button
                                variant="warning"
                                size="sm"
                                onClick={() => createTemplateInBrevo(template.type)}
                                disabled={loading}
                              >
                                🔄 Créer nouvelle version
                              </Button>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>

              <Alert variant="info">
                <h6>🔒 Sécurité garantie :</h6>
                <ul className="mb-0">
                  <li>Seuls les templates avec préfixe [TourCraft] sont gérés</li>
                  <li>Aucun template existant ne sera modifié ou supprimé</li>
                  <li>Création de nouvelles versions si un template existe déjà</li>
                  <li>Prévisualisation complète avant création</li>
                </ul>
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

      {/* Modal de prévisualisation */}
      <Modal show={showPreview} onHide={() => setShowPreview(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Prévisualisation : {previewTemplate?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {previewTemplate && (
            <>
              <div className="mb-3">
                <strong>Sujet :</strong> {previewTemplate.subject}
              </div>
              <div className="mb-3">
                <strong>Variables disponibles :</strong><br />
                <code>{previewTemplate.variables.join(', ')}</code>
              </div>
              <div className="border" style={{ height: '400px', overflow: 'auto' }}>
                <div dangerouslySetInnerHTML={{ __html: previewTemplate.html }} />
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            Fermer
          </Button>
          {previewTemplate && (
            <Button
              variant="success"
              onClick={() => {
                setShowPreview(false);
                createTemplateInBrevo(previewTemplate.type);
              }}
            >
              Créer ce template dans Brevo
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BrevoTemplateCreator;