import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import GroupesPermissionsManager from '../components/parametrage/GroupesPermissionsManager';
import EntreprisesManager from '../components/collaboration/EntreprisesManagerFirebase';
import CollaborateursManagerFirebase from '../components/collaboration/CollaborateursManagerFirebase';
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

  // Rendu de la gestion des entreprises
  const renderEntrepriseConfig = () => (
    <EntreprisesManager />
  );

  // Rendu de la gestion des collaborateurs
  const renderCollaborateursConfig = () => (
    <CollaborateursManagerFirebase />
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
    <GroupesPermissionsManager />
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
        {!['entreprise', 'collaborateurs'].includes(selectedConfig) && (
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
        )}
      </div>
      
      <Row>
        <Col md={2}>
          {renderSidebarMenu()}
        </Col>
        <Col md={10}>
          {renderMainContent()}
        </Col>
      </Row>
    </Container>
  );
};

export default CollaborationParametragePage;