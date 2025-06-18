import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import styles from './CollaborationParametragePage.module.css';

const CollaborationParametragePage = () => {
  const [activeTab, setActiveTab] = useState('entreprise');
  const [selectedConfig, setSelectedConfig] = useState('entreprise');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentOrganization } = useOrganization();
  
  // Configuration entreprise
  const [entrepriseConfig, setEntrepriseConfig] = useState({
    nomEntreprise: '',
    secteurActivite: '',
    tailleEquipe: 'petit', // petit, moyen, grand
    fuseauHoraire: 'Europe/Paris',
    langueParDefaut: 'fr',
    notificationsGenerales: true,
    sauvegardeDonnees: 'automatique',
    retentionDonnees: 365 // jours
  });

  // Configuration collaborateurs
  const [collaborateursConfig, setCollaborateursConfig] = useState({
    invitationAutomatique: true,
    rolesPersonnalises: [],
    approvalRequired: false,
    sessionTimeout: 480, // minutes
    authentificationDouble: false,
    visibiliteEquipe: 'complete',
    partageCalendrier: true
  });

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

  // Configuration permissions
  const [permissionsConfig, setPermissionsConfig] = useState({
    creationTaches: 'tous', // tous, managers, admin
    suppressionTaches: 'assignees', // assignees, managers, admin
    modificationStatuts: 'tous',
    consultationRapports: 'managers',
    gestionEquipe: 'admin',
    exportDonnees: 'admin',
    parametresGeneraux: 'admin'
  });

  // Déterminer l'onglet actif en fonction de l'URL
  useEffect(() => {
    const path = location.pathname;
    let newActiveTab = 'entreprise';
    
    if (path.includes('/collaboration/parametrage/entreprise') || path === '/collaboration/parametrage') {
      newActiveTab = 'entreprise';
    } else if (path.includes('/collaboration/parametrage/collaborateurs')) {
      newActiveTab = 'collaborateurs';
    } else if (path.includes('/collaboration/parametrage/taches')) {
      newActiveTab = 'taches';
    } else if (path.includes('/collaboration/parametrage/permissions')) {
      newActiveTab = 'permissions';
    }
    
    if (newActiveTab !== activeTab) {
      setActiveTab(newActiveTab);
      setSelectedConfig(newActiveTab);
    }
  }, [location.pathname, activeTab]);

  const loadConfiguration = useCallback(async () => {
    if (!currentOrganization?.id) return;
    
    setLoading(true);
    try {
      const configDoc = await getDoc(doc(db, 'collaborationConfig', currentOrganization.id));
      
      if (configDoc.exists()) {
        const data = configDoc.data();
        if (data.entreprise) setEntrepriseConfig(prev => ({ ...prev, ...data.entreprise }));
        if (data.collaborateurs) setCollaborateursConfig(prev => ({ ...prev, ...data.collaborateurs }));
        if (data.taches) setTachesConfig(prev => ({ ...prev, ...data.taches }));
        if (data.permissions) setPermissionsConfig(prev => ({ ...prev, ...data.permissions }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
    } finally {
      setLoading(false);
    }
  }, [currentOrganization?.id]);

  // Charger la configuration au montage
  useEffect(() => {
    if (currentOrganization?.id) {
      loadConfiguration();
    }
  }, [currentOrganization?.id, loadConfiguration]);

  const saveConfiguration = async () => {
    if (!currentOrganization?.id) return;
    
    setSaving(true);
    try {
      const configData = {
        entreprise: entrepriseConfig,
        collaborateurs: collaborateursConfig,
        taches: tachesConfig,
        permissions: permissionsConfig,
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
      { key: 'entreprise', label: 'Entreprise', icon: 'bi-building' },
      { key: 'collaborateurs', label: 'Collaborateurs', icon: 'bi-people' },
      { key: 'taches', label: 'Tâches', icon: 'bi-check2-square' },
      { key: 'permissions', label: 'Permissions', icon: 'bi-shield-check' }
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

  // Rendu de la configuration entreprise
  const renderEntrepriseConfig = () => (
    <Card>
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-building me-2"></i>
          Configuration Entreprise
        </h5>
      </Card.Header>
      <Card.Body>
        <Form>
          <Row>
            <Col md={6}>
              <h6 className="border-bottom pb-2 mb-3">Informations générales</h6>
              
              <Form.Group className="mb-3">
                <Form.Label>Nom de l'entreprise</Form.Label>
                <Form.Control
                  type="text"
                  value={entrepriseConfig.nomEntreprise}
                  onChange={(e) => setEntrepriseConfig(prev => ({ 
                    ...prev, 
                    nomEntreprise: e.target.value 
                  }))}
                  placeholder="Nom de votre entreprise"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Secteur d'activité</Form.Label>
                <Form.Control
                  type="text"
                  value={entrepriseConfig.secteurActivite}
                  onChange={(e) => setEntrepriseConfig(prev => ({ 
                    ...prev, 
                    secteurActivite: e.target.value 
                  }))}
                  placeholder="Industrie, Services, etc."
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Taille de l'équipe</Form.Label>
                <Form.Select
                  value={entrepriseConfig.tailleEquipe}
                  onChange={(e) => setEntrepriseConfig(prev => ({ 
                    ...prev, 
                    tailleEquipe: e.target.value 
                  }))}
                >
                  <option value="petit">Petite équipe (1-10 personnes)</option>
                  <option value="moyen">Équipe moyenne (11-50 personnes)</option>
                  <option value="grand">Grande équipe (50+ personnes)</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Fuseau horaire</Form.Label>
                <Form.Select
                  value={entrepriseConfig.fuseauHoraire}
                  onChange={(e) => setEntrepriseConfig(prev => ({ 
                    ...prev, 
                    fuseauHoraire: e.target.value 
                  }))}
                >
                  <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="America/New_York">America/New_York (GMT-5)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (GMT-8)</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <h6 className="border-bottom pb-2 mb-3">Paramètres système</h6>
              
              <Form.Group className="mb-3">
                <Form.Label>Langue par défaut</Form.Label>
                <Form.Select
                  value={entrepriseConfig.langueParDefaut}
                  onChange={(e) => setEntrepriseConfig(prev => ({ 
                    ...prev, 
                    langueParDefaut: e.target.value 
                  }))}
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Notifications générales activées"
                  checked={entrepriseConfig.notificationsGenerales}
                  onChange={(e) => setEntrepriseConfig(prev => ({ 
                    ...prev, 
                    notificationsGenerales: e.target.checked 
                  }))}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Sauvegarde des données</Form.Label>
                <Form.Select
                  value={entrepriseConfig.sauvegardeDonnees}
                  onChange={(e) => setEntrepriseConfig(prev => ({ 
                    ...prev, 
                    sauvegardeDonnees: e.target.value 
                  }))}
                >
                  <option value="automatique">Automatique</option>
                  <option value="manuel">Manuel</option>
                  <option value="desactive">Désactivé</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Rétention des données (jours)</Form.Label>
                <Form.Control
                  type="number"
                  min="30"
                  max="3650"
                  value={entrepriseConfig.retentionDonnees}
                  onChange={(e) => setEntrepriseConfig(prev => ({ 
                    ...prev, 
                    retentionDonnees: parseInt(e.target.value) 
                  }))}
                />
                <Form.Text className="text-muted">
                  Durée de conservation des données inactives
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );

  // Rendu de la configuration collaborateurs
  const renderCollaborateursConfig = () => (
    <Card>
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-people me-2"></i>
          Configuration Collaborateurs
        </h5>
      </Card.Header>
      <Card.Body>
        <Form>
          <Row>
            <Col md={6}>
              <h6 className="border-bottom pb-2 mb-3">Gestion des invitations</h6>
              
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Invitation automatique des nouveaux collaborateurs"
                  checked={collaborateursConfig.invitationAutomatique}
                  onChange={(e) => setCollaborateursConfig(prev => ({ 
                    ...prev, 
                    invitationAutomatique: e.target.checked 
                  }))}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Approbation requise pour rejoindre l'équipe"
                  checked={collaborateursConfig.approvalRequired}
                  onChange={(e) => setCollaborateursConfig(prev => ({ 
                    ...prev, 
                    approvalRequired: e.target.checked 
                  }))}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Visibilité de l'équipe</Form.Label>
                <Form.Select
                  value={collaborateursConfig.visibiliteEquipe}
                  onChange={(e) => setCollaborateursConfig(prev => ({ 
                    ...prev, 
                    visibiliteEquipe: e.target.value 
                  }))}
                >
                  <option value="complete">Complète (tous voient tout)</option>
                  <option value="limitee">Limitée (par service/équipe)</option>
                  <option value="prive">Privée (chacun voit ses tâches)</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Partage de calendrier entre collaborateurs"
                  checked={collaborateursConfig.partageCalendrier}
                  onChange={(e) => setCollaborateursConfig(prev => ({ 
                    ...prev, 
                    partageCalendrier: e.target.checked 
                  }))}
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <h6 className="border-bottom pb-2 mb-3">Sécurité et sessions</h6>
              
              <Form.Group className="mb-3">
                <Form.Label>Timeout de session (minutes)</Form.Label>
                <Form.Control
                  type="number"
                  min="30"
                  max="1440"
                  value={collaborateursConfig.sessionTimeout}
                  onChange={(e) => setCollaborateursConfig(prev => ({ 
                    ...prev, 
                    sessionTimeout: parseInt(e.target.value) 
                  }))}
                />
                <Form.Text className="text-muted">
                  Déconnexion automatique après inactivité
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Authentification double facteur"
                  checked={collaborateursConfig.authentificationDouble}
                  onChange={(e) => setCollaborateursConfig(prev => ({ 
                    ...prev, 
                    authentificationDouble: e.target.checked 
                  }))}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Rôles personnalisés (un par ligne)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  value={collaborateursConfig.rolesPersonnalises.join('\n')}
                  onChange={(e) => setCollaborateursConfig(prev => ({ 
                    ...prev, 
                    rolesPersonnalises: e.target.value.split('\n').filter(role => role.trim()) 
                  }))}
                  placeholder="Manager de projet&#10;Responsable commercial&#10;Coordinateur&#10;Assistant"
                />
                <Form.Text className="text-muted">
                  Définissez des rôles spécifiques à votre organisation
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );

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

  // Rendu de la configuration des permissions
  const renderPermissionsConfig = () => (
    <Card>
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-shield-check me-2"></i>
          Configuration des Permissions
        </h5>
      </Card.Header>
      <Card.Body>
        <Form>
          <Row>
            <Col md={6}>
              <h6 className="border-bottom pb-2 mb-3">Gestion des tâches</h6>
              
              <Form.Group className="mb-3">
                <Form.Label>Création de tâches</Form.Label>
                <Form.Select
                  value={permissionsConfig.creationTaches}
                  onChange={(e) => setPermissionsConfig(prev => ({ 
                    ...prev, 
                    creationTaches: e.target.value 
                  }))}
                >
                  <option value="tous">Tous les collaborateurs</option>
                  <option value="managers">Managers uniquement</option>
                  <option value="admin">Administrateurs uniquement</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Suppression de tâches</Form.Label>
                <Form.Select
                  value={permissionsConfig.suppressionTaches}
                  onChange={(e) => setPermissionsConfig(prev => ({ 
                    ...prev, 
                    suppressionTaches: e.target.value 
                  }))}
                >
                  <option value="assignees">Assignés et créateurs</option>
                  <option value="managers">Managers et créateurs</option>
                  <option value="admin">Administrateurs uniquement</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Modification des statuts</Form.Label>
                <Form.Select
                  value={permissionsConfig.modificationStatuts}
                  onChange={(e) => setPermissionsConfig(prev => ({ 
                    ...prev, 
                    modificationStatuts: e.target.value 
                  }))}
                >
                  <option value="tous">Tous les collaborateurs</option>
                  <option value="assignees">Assignés uniquement</option>
                  <option value="managers">Managers uniquement</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Consultation des rapports</Form.Label>
                <Form.Select
                  value={permissionsConfig.consultationRapports}
                  onChange={(e) => setPermissionsConfig(prev => ({ 
                    ...prev, 
                    consultationRapports: e.target.value 
                  }))}
                >
                  <option value="tous">Tous les collaborateurs</option>
                  <option value="managers">Managers et administrateurs</option>
                  <option value="admin">Administrateurs uniquement</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <h6 className="border-bottom pb-2 mb-3">Administration</h6>
              
              <Form.Group className="mb-3">
                <Form.Label>Gestion de l'équipe</Form.Label>
                <Form.Select
                  value={permissionsConfig.gestionEquipe}
                  onChange={(e) => setPermissionsConfig(prev => ({ 
                    ...prev, 
                    gestionEquipe: e.target.value 
                  }))}
                >
                  <option value="managers">Managers et administrateurs</option>
                  <option value="admin">Administrateurs uniquement</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Export des données</Form.Label>
                <Form.Select
                  value={permissionsConfig.exportDonnees}
                  onChange={(e) => setPermissionsConfig(prev => ({ 
                    ...prev, 
                    exportDonnees: e.target.value 
                  }))}
                >
                  <option value="managers">Managers et administrateurs</option>
                  <option value="admin">Administrateurs uniquement</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Paramètres généraux</Form.Label>
                <Form.Select
                  value={permissionsConfig.parametresGeneraux}
                  onChange={(e) => setPermissionsConfig(prev => ({ 
                    ...prev, 
                    parametresGeneraux: e.target.value 
                  }))}
                >
                  <option value="admin">Administrateurs uniquement</option>
                </Form.Select>
              </Form.Group>

              <div className="mt-4 p-3 bg-light rounded">
                <h6 className="text-muted">Niveaux de permissions</h6>
                <small className="text-muted">
                  <strong>Administrateur :</strong> Accès complet à tous les paramètres<br/>
                  <strong>Manager :</strong> Gestion des équipes et tâches<br/>
                  <strong>Collaborateur :</strong> Utilisation standard des fonctionnalités
                </small>
              </div>
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
      case 'entreprise':
        return renderEntrepriseConfig();
      case 'collaborateurs':
        return renderCollaborateursConfig();
      case 'taches':
        return renderTachesConfig();
      case 'permissions':
        return renderPermissionsConfig();
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