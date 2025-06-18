import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import TabNavigation from '../components/common/TabNavigation';
import styles from './CollaborationParametragePage.module.css';

const CollaborationParametragePage = () => {
  const [activeTab, setActiveTab] = useState('taches');
  const [selectedConfig, setSelectedConfig] = useState('taches');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentOrganization } = useOrganization();
  
  // Configuration des tâches
  const [tachesConfig, setTachesConfig] = useState({
    statutsPersonnalises: [],
    tagsParDefaut: [],
    assignationAutomatique: false,
    notificationsEmail: true,
    rappelsDeadline: true,
    delaiRappel: 1, // jours
    couleursPriorite: {
      basse: '#28a745',
      moyenne: '#ffc107',
      haute: '#dc3545'
    }
  });

  // Configuration des mails
  const [mailsConfig, setMailsConfig] = useState({
    signaturesAutomatiques: true,
    modelesPredefinies: [],
    archivageAutomatique: false,
    delaiArchivage: 30, // jours
    categoriesPersonnalisees: [],
    notificationsNouveauxMails: true
  });

  // Configuration des notes
  const [notesConfig, setNotesConfig] = useState({
    partageParDefaut: 'prive',
    categoriesPersonnalisees: [],
    versionning: true,
    commentairesActives: true,
    notificationsModifications: true,
    formatParDefaut: 'markdown'
  });

  // Déterminer l'onglet actif en fonction de l'URL
  useEffect(() => {
    const path = location.pathname;
    let newActiveTab = 'taches';
    
    if (path.includes('/collaboration/parametrage/taches') || path === '/collaboration/parametrage') {
      newActiveTab = 'taches';
    } else if (path.includes('/collaboration/parametrage/mails')) {
      newActiveTab = 'mails';
    } else if (path.includes('/collaboration/parametrage/notes')) {
      newActiveTab = 'notes';
    }
    
    if (newActiveTab !== activeTab) {
      setActiveTab(newActiveTab);
      setSelectedConfig(newActiveTab);
    }
  }, [location.pathname, activeTab]);

  // Charger la configuration au montage
  useEffect(() => {
    if (currentOrganization?.id) {
      loadConfiguration();
    }
  }, [currentOrganization?.id]);

  const loadConfiguration = async () => {
    if (!currentOrganization?.id) return;
    
    setLoading(true);
    try {
      const configDoc = await getDoc(doc(db, 'collaborationConfig', currentOrganization.id));
      
      if (configDoc.exists()) {
        const data = configDoc.data();
        if (data.taches) setTachesConfig(prev => ({ ...prev, ...data.taches }));
        if (data.mails) setMailsConfig(prev => ({ ...prev, ...data.mails }));
        if (data.notes) setNotesConfig(prev => ({ ...prev, ...data.notes }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async () => {
    if (!currentOrganization?.id) return;
    
    setSaving(true);
    try {
      const configData = {
        taches: tachesConfig,
        mails: mailsConfig,
        notes: notesConfig,
        updatedAt: new Date(),
        organizationId: currentOrganization.id
      };

      await setDoc(doc(db, 'collaborationConfig', currentOrganization.id), configData, { merge: true });
      
      // Afficher un message de succès
      alert('Configuration sauvegardée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la configuration');
    } finally {
      setSaving(false);
    }
  };

  // Gestionnaires pour les onglets
  const handleTabSelect = useCallback((tabKey) => {
    setActiveTab(tabKey);
    setSelectedConfig(tabKey);
    navigate(`/collaboration/parametrage/${tabKey}`);
  }, [navigate]);

  // Rendu du menu latéral
  const renderSidebarMenu = () => {
    const tabs = [
      { key: 'taches', label: 'Tâches', icon: 'bi-check2-square' },
      { key: 'mails', label: 'Échanges de mails', icon: 'bi-envelope' },
      { key: 'notes', label: 'Notes & Commentaires', icon: 'bi-journal-text' }
    ];

    return (
      <div className={styles.sidebar}>
        <h6 className={styles.sidebarTitle}>Modules</h6>
        <div className="list-group list-group-flush">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`list-group-item list-group-item-action border-0 ${
                selectedConfig === tab.key ? 'active' : ''
              }`}
              onClick={() => handleTabSelect(tab.key)}
            >
              <i className={`${tab.icon} me-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Rendu de la configuration des tâches
  const renderTachesConfig = () => (
    <Card>
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-check2-square me-2"></i>
          Configuration des Tâches
        </h5>
      </Card.Header>
      <Card.Body>
        <Form>
          <Row>
            <Col md={6}>
              <h6 className="border-bottom pb-2 mb-3">Paramètres généraux</h6>
              
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Assignation automatique au créateur"
                  checked={tachesConfig.assignationAutomatique}
                  onChange={(e) => setTachesConfig(prev => ({ 
                    ...prev, 
                    assignationAutomatique: e.target.checked 
                  }))}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Notifications email pour les nouvelles tâches"
                  checked={tachesConfig.notificationsEmail}
                  onChange={(e) => setTachesConfig(prev => ({ 
                    ...prev, 
                    notificationsEmail: e.target.checked 
                  }))}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Rappels automatiques avant deadline"
                  checked={tachesConfig.rappelsDeadline}
                  onChange={(e) => setTachesConfig(prev => ({ 
                    ...prev, 
                    rappelsDeadline: e.target.checked 
                  }))}
                />
              </Form.Group>

              {tachesConfig.rappelsDeadline && (
                <Form.Group className="mb-3">
                  <Form.Label>Délai de rappel (jours avant deadline)</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="30"
                    value={tachesConfig.delaiRappel}
                    onChange={(e) => setTachesConfig(prev => ({ 
                      ...prev, 
                      delaiRappel: parseInt(e.target.value) 
                    }))}
                  />
                </Form.Group>
              )}
            </Col>
            
            <Col md={6}>
              <h6 className="border-bottom pb-2 mb-3">Tags par défaut</h6>
              <Form.Group className="mb-3">
                <Form.Label>Tags prédéfinis (un par ligne)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  value={tachesConfig.tagsParDefaut.join('\n')}
                  onChange={(e) => setTachesConfig(prev => ({ 
                    ...prev, 
                    tagsParDefaut: e.target.value.split('\n').filter(tag => tag.trim()) 
                  }))}
                  placeholder="Urgent&#10;Routine&#10;Projet&#10;Client&#10;Interne"
                />
                <Form.Text className="text-muted">
                  Ces tags seront proposés lors de la création de tâches
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );

  // Rendu de la configuration des mails
  const renderMailsConfig = () => (
    <Card>
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-envelope me-2"></i>
          Configuration des Échanges de mails
        </h5>
      </Card.Header>
      <Card.Body>
        <Form>
          <Row>
            <Col md={6}>
              <h6 className="border-bottom pb-2 mb-3">Paramètres généraux</h6>
              
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Signatures automatiques"
                  checked={mailsConfig.signaturesAutomatiques}
                  onChange={(e) => setMailsConfig(prev => ({ 
                    ...prev, 
                    signaturesAutomatiques: e.target.checked 
                  }))}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Archivage automatique des anciens mails"
                  checked={mailsConfig.archivageAutomatique}
                  onChange={(e) => setMailsConfig(prev => ({ 
                    ...prev, 
                    archivageAutomatique: e.target.checked 
                  }))}
                />
              </Form.Group>

              {mailsConfig.archivageAutomatique && (
                <Form.Group className="mb-3">
                  <Form.Label>Délai d'archivage (jours)</Form.Label>
                  <Form.Control
                    type="number"
                    min="7"
                    max="365"
                    value={mailsConfig.delaiArchivage}
                    onChange={(e) => setMailsConfig(prev => ({ 
                      ...prev, 
                      delaiArchivage: parseInt(e.target.value) 
                    }))}
                  />
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Notifications pour nouveaux mails"
                  checked={mailsConfig.notificationsNouveauxMails}
                  onChange={(e) => setMailsConfig(prev => ({ 
                    ...prev, 
                    notificationsNouveauxMails: e.target.checked 
                  }))}
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <h6 className="border-bottom pb-2 mb-3">Catégories personnalisées</h6>
              <Form.Group className="mb-3">
                <Form.Label>Catégories d'emails (une par ligne)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  value={mailsConfig.categoriesPersonnalisees.join('\n')}
                  onChange={(e) => setMailsConfig(prev => ({ 
                    ...prev, 
                    categoriesPersonnalisees: e.target.value.split('\n').filter(cat => cat.trim()) 
                  }))}
                  placeholder="Commercial&#10;Technique&#10;Administration&#10;Partenaires&#10;Artistes"
                />
                <Form.Text className="text-muted">
                  Ces catégories permettront de classer vos échanges
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );

  // Rendu de la configuration des notes
  const renderNotesConfig = () => (
    <Card>
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-journal-text me-2"></i>
          Configuration des Notes & Commentaires
        </h5>
      </Card.Header>
      <Card.Body>
        <Form>
          <Row>
            <Col md={6}>
              <h6 className="border-bottom pb-2 mb-3">Paramètres généraux</h6>
              
              <Form.Group className="mb-3">
                <Form.Label>Partage par défaut</Form.Label>
                <Form.Select
                  value={notesConfig.partageParDefaut}
                  onChange={(e) => setNotesConfig(prev => ({ 
                    ...prev, 
                    partageParDefaut: e.target.value 
                  }))}
                >
                  <option value="prive">Privé</option>
                  <option value="equipe">Équipe</option>
                  <option value="organisation">Organisation</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Format par défaut</Form.Label>
                <Form.Select
                  value={notesConfig.formatParDefaut}
                  onChange={(e) => setNotesConfig(prev => ({ 
                    ...prev, 
                    formatParDefaut: e.target.value 
                  }))}
                >
                  <option value="texte">Texte simple</option>
                  <option value="markdown">Markdown</option>
                  <option value="html">HTML</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Activer le versioning des notes"
                  checked={notesConfig.versionning}
                  onChange={(e) => setNotesConfig(prev => ({ 
                    ...prev, 
                    versionning: e.target.checked 
                  }))}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Activer les commentaires"
                  checked={notesConfig.commentairesActives}
                  onChange={(e) => setNotesConfig(prev => ({ 
                    ...prev, 
                    commentairesActives: e.target.checked 
                  }))}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Notifications lors de modifications"
                  checked={notesConfig.notificationsModifications}
                  onChange={(e) => setNotesConfig(prev => ({ 
                    ...prev, 
                    notificationsModifications: e.target.checked 
                  }))}
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <h6 className="border-bottom pb-2 mb-3">Catégories de notes</h6>
              <Form.Group className="mb-3">
                <Form.Label>Catégories personnalisées (une par ligne)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  value={notesConfig.categoriesPersonnalisees.join('\n')}
                  onChange={(e) => setNotesConfig(prev => ({ 
                    ...prev, 
                    categoriesPersonnalisees: e.target.value.split('\n').filter(cat => cat.trim()) 
                  }))}
                  placeholder="Réunions&#10;Idées&#10;Procédures&#10;Contacts&#10;Projets"
                />
                <Form.Text className="text-muted">
                  Ces catégories aideront à organiser vos notes
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );

  const renderMainContent = () => {
    if (loading) {
      return (
        <div className="text-center p-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3">Chargement de la configuration...</p>
        </div>
      );
    }

    switch (selectedConfig) {
      case 'taches':
        return renderTachesConfig();
      case 'mails':
        return renderMailsConfig();
      case 'notes':
        return renderNotesConfig();
      default:
        return (
          <div className="text-center p-5">
            <i className="bi bi-gear" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
            <h4 className="mt-3">Sélectionnez un module</h4>
            <p className="text-muted">Choisissez un module dans le menu de gauche pour configurer ses paramètres.</p>
          </div>
        );
    }
  };

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-gear me-2"></i>
          Paramétrage Collaboration
        </h2>
        <Button 
          variant="primary"
          onClick={saveConfiguration}
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Sauvegarde...
            </>
          ) : (
            <>
              <i className="bi bi-check-lg me-2"></i>
              Sauvegarder
            </>
          )}
        </Button>
      </div>
      
      <Row>
        <Col md={3}>
          {renderSidebarMenu()}
        </Col>
        <Col md={9}>
          {renderMainContent()}
        </Col>
      </Row>
    </Container>
  );
};

export default CollaborationParametragePage;