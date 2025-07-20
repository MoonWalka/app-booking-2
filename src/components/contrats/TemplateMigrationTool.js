import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useEntreprise } from '@/context/EntrepriseContext';
import { migrateTemplate, getAllVariables } from '@/hooks/contrats/contractVariablesUnified';

/**
 * Outil simple pour migrer les templates vers le nouveau système
 */
const TemplateMigrationTool = () => {
  const { currentEntreprise } = useEntreprise();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Charger les templates depuis Firebase
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        // Les templates sont stockés au niveau global dans 'contratTemplates'
        const templatesRef = collection(db, 'contratTemplates');
        const snapshot = await getDocs(templatesRef);
        
        const templatesList = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Template data:', { id: doc.id, data });
          return {
            id: doc.id,
            ...data
          };
        });
        
        console.log('Templates trouvés:', templatesList.length);
        console.log('Templates:', templatesList);
        setTemplates(templatesList);
      } catch (error) {
        console.error('Erreur chargement templates:', error);
        setErrorMessage('Erreur lors du chargement des templates');
      } finally {
        setLoading(false);
      }
    };
    
    loadTemplates();
  }, []);

  const handleSelectTemplate = (e) => {
    const templateId = e.target.value;
    const template = templates.find(t => t.id === templateId);
    setSelectedTemplate(template);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleMigrate = async () => {
    if (!selectedTemplate) return;
    
    try {
      setMigrating(true);
      setErrorMessage('');
      
      // Migrer le contenu
      const migratedBody = migrateTemplate(selectedTemplate.body || '');
      const migratedHeader = migrateTemplate(selectedTemplate.header || '');
      const migratedFooter = migrateTemplate(selectedTemplate.footer || '');
      const migratedSignature = migrateTemplate(selectedTemplate.signature || '');
      
      // Mettre à jour dans Firebase (collection globale contratTemplates)
      const templateRef = doc(db, 'contratTemplates', selectedTemplate.id);
      await updateDoc(templateRef, {
        body: migratedBody,
        header: migratedHeader,
        footer: migratedFooter,
        signature: migratedSignature,
        migrated: true,
        migratedAt: new Date(),
        updatedAt: new Date()
      });
      
      // Mettre à jour l'état local
      const updatedTemplate = {
        ...selectedTemplate,
        body: migratedBody,
        header: migratedHeader,
        footer: migratedFooter,
        signature: migratedSignature,
        migrated: true
      };
      
      setSelectedTemplate(updatedTemplate);
      setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? updatedTemplate : t));
      
      setSuccessMessage('Template migré avec succès !');
    } catch (error) {
      console.error('Erreur migration:', error);
      setErrorMessage('Erreur lors de la migration du template');
    } finally {
      setMigrating(false);
    }
  };

  const variables = getAllVariables();

  return (
    <div>
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Migration des templates de contrat</h5>
        </Card.Header>
        <Card.Body>
          {successMessage && (
            <Alert variant="success" dismissible onClose={() => setSuccessMessage('')}>
              {successMessage}
            </Alert>
          )}
          
          {errorMessage && (
            <Alert variant="danger" dismissible onClose={() => setErrorMessage('')}>
              {errorMessage}
            </Alert>
          )}

          <Alert variant="info">
            <strong>Migration automatique :</strong>
            <ul className="mb-0 mt-2">
              <li>Sélectionnez un template dans la liste</li>
              <li>Visualisez les changements qui seront appliqués</li>
              <li>Cliquez sur "Migrer" pour appliquer les modifications</li>
              <li>Les <code>[variables]</code> deviennent <code>{`{variables}`}</code></li>
              <li>Les anciennes variables sont remplacées par les nouvelles</li>
            </ul>
          </Alert>

          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Chargement...</span>
              </Spinner>
            </div>
          ) : (
            <>
              <Form.Group className="mb-4">
                <Form.Label>Sélectionner un template</Form.Label>
                <Form.Select 
                  onChange={handleSelectTemplate} 
                  value={selectedTemplate?.id || ''}
                  style={{ backgroundColor: 'white', color: 'black' }}
                >
                  <option value="">-- Choisir un template --</option>
                  {templates.length === 0 ? (
                    <option disabled>Aucun template trouvé</option>
                  ) : (
                    templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name || template.nom || `Template ${template.id}`} {template.migrated && '✓'}
                      </option>
                    ))
                  )}
                </Form.Select>
                {templates.length > 0 && (
                  <small className="text-muted mt-1 d-block">
                    {templates.length} template(s) trouvé(s)
                  </small>
                )}
              </Form.Group>

              {selectedTemplate && (
                <>
                  <Row>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>
                          Template actuel
                          {selectedTemplate.migrated && (
                            <span className="text-success ms-2">
                              <i className="bi bi-check-circle"></i> Déjà migré
                            </span>
                          )}
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={15}
                          value={selectedTemplate.body || ''}
                          readOnly
                          style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Aperçu après migration</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={15}
                          value={migrateTemplate(selectedTemplate.body || '')}
                          readOnly
                          style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex gap-2 mt-3">
                    <Button 
                      variant="primary" 
                      onClick={handleMigrate}
                      disabled={migrating || selectedTemplate.migrated}
                    >
                      {migrating ? (
                        <>
                          <Spinner size="sm" animation="border" className="me-2" />
                          Migration en cours...
                        </>
                      ) : (
                        'Migrer ce template'
                      )}
                    </Button>
                    {selectedTemplate.migrated && (
                      <span className="text-muted align-self-center">
                        Ce template a déjà été migré
                      </span>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <h5 className="mb-0">Variables disponibles</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            {['Organisateur', 'Producteur', 'Informations générales'].map(category => (
              <Col md={4} key={category}>
                <h6>{category}</h6>
                <ul className="small">
                  {variables
                    .filter(v => v.category === category)
                    .map(v => (
                      <li key={v.value}>
                        <code>{v.value}</code>
                        <br />
                        <span className="text-muted">{v.label}</span>
                      </li>
                    ))
                  }
                </ul>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default TemplateMigrationTool;