import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import TabNavigation from '../components/common/TabNavigation';
import ModeleContratContent from '../components/parametrage/ModeleContratContent';
import TvaManager from '../components/parametrage/TvaManager';
import UnitesManager from '../components/parametrage/UnitesManager';
import MentionsManager from '../components/parametrage/MentionsManager';
import RolesManager from '../components/parametrage/RolesManager';
import RegimesManager from '../components/parametrage/RegimesManager';
import MetiersManager from '../components/parametrage/MetiersManager';
import ModelesFeuilleRouteManager from '../components/parametrage/ModelesFeuilleRouteManager';
import HorairesManager from '../components/parametrage/HorairesManager';
import MoyensTransportManager from '../components/parametrage/MoyensTransportManager';
import '@styles/index.css';

const AdminParametragePage = () => {
  const [activeSection, setActiveSection] = useState('administration');
  const [activeSubOption, setActiveSubOption] = useState('modeles-contrat');
  const navigate = useNavigate();
  const location = useLocation();

  // Déterminer la section et sous-option actives en fonction de l'URL
  useEffect(() => {
    const path = location.pathname;
    let newActiveSection = 'administration';
    let newActiveSubOption = 'modeles-contrat';
    
    if (path.includes('/admin/parametrage/taux-tva')) {
      newActiveSection = 'administration';
      newActiveSubOption = 'taux-tva';
    } else if (path.includes('/admin/parametrage/unites')) {
      newActiveSection = 'devis';
      newActiveSubOption = 'unites';
    } else if (path.includes('/admin/parametrage/mentions')) {
      newActiveSection = 'devis';
      newActiveSubOption = 'mentions';
    } else if (path.includes('/admin/parametrage/roles')) {
      newActiveSection = 'equipes';
      newActiveSubOption = 'roles';
    } else if (path.includes('/admin/parametrage/regimes')) {
      newActiveSection = 'equipes';
      newActiveSubOption = 'regimes';
    } else if (path.includes('/admin/parametrage/metiers')) {
      newActiveSection = 'equipes';
      newActiveSubOption = 'metiers';
    } else if (path.includes('/admin/parametrage/modeles-feuille-route')) {
      newActiveSection = 'feuilles-route';
      newActiveSubOption = 'modeles-feuille-route';
    } else if (path.includes('/admin/parametrage/horaires')) {
      newActiveSection = 'feuilles-route';
      newActiveSubOption = 'horaires';
    } else if (path.includes('/admin/parametrage/moyens-transport')) {
      newActiveSection = 'feuilles-route';
      newActiveSubOption = 'moyens-transport';
    } else if (path.includes('/admin/parametrage/preferences-generales')) {
      newActiveSection = 'comptabilite';
      newActiveSubOption = 'preferences-generales';
    }
    
    if (newActiveSection !== activeSection) {
      setActiveSection(newActiveSection);
    }
    if (newActiveSubOption !== activeSubOption) {
      setActiveSubOption(newActiveSubOption);
    }
  }, [location.pathname, activeSection, activeSubOption]);

  // Rendu du menu latéral principal (sections)
  const renderSidebarMenu = () => {
    const sections = [
      { label: 'Administration', value: 'administration' },
      { label: 'Devis', value: 'devis' },
      { label: 'Équipes', value: 'equipes' },
      { label: 'Feuilles de route', value: 'feuilles-route' },
      { label: 'Comptabilité', value: 'comptabilite' }
    ];
    
    const activeIndex = sections.findIndex(section => section.value === activeSection);
    
    return (
      <TabNavigation
        tabs={sections.map(section => ({ label: section.label, content: null }))}
        activeTab={activeIndex >= 0 ? activeIndex : 0}
        onTabChange={(index) => {
          const selectedSection = sections[index];
          setActiveSection(selectedSection.value);
          
          // Définir la première sous-option de la section
          const firstSubOption = getSubOptionsForSection(selectedSection.value)[0];
          if (firstSubOption) {
            setActiveSubOption(firstSubOption.value);
            navigate(`/admin/parametrage/${firstSubOption.value}`);
          }
        }}
        vertical={true}
      />
    );
  };

  // Fonction pour obtenir les sous-options d'une section
  const getSubOptionsForSection = (section) => {
    const subOptionsMap = {
      'administration': [
        { label: 'Modèles de contrat', value: 'modeles-contrat' },
        { label: 'Taux de TVA', value: 'taux-tva' }
      ],
      'devis': [
        { label: 'Unités', value: 'unites' },
        { label: 'Mentions', value: 'mentions' }
      ],
      'equipes': [
        { label: 'Rôles', value: 'roles' },
        { label: 'Régimes', value: 'regimes' },
        { label: 'Métiers', value: 'metiers' }
      ],
      'feuilles-route': [
        { label: 'Modèles de feuille de route', value: 'modeles-feuille-route' },
        { label: 'Horaires', value: 'horaires' },
        { label: 'Moyens de transport', value: 'moyens-transport' }
      ],
      'comptabilite': [
        { label: 'Préférences générales', value: 'preferences-generales' }
      ]
    };
    
    return subOptionsMap[section] || [];
  };

  // Rendu du menu latéral des sous-options
  const renderSubOptionsMenu = () => {
    const subOptions = getSubOptionsForSection(activeSection);
    
    return (
      <div>
        {subOptions.length === 0 ? (
          <div className="text-center p-3">
            <i className="bi bi-gear" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
            <p className="small text-muted mt-2">Aucune option</p>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {subOptions.map(option => (
              <button
                key={option.value}
                className={`list-group-item list-group-item-action border-0 ${
                  activeSubOption === option.value ? 'active' : ''
                }`}
                onClick={() => {
                  setActiveSubOption(option.value);
                  navigate(`/admin/parametrage/${option.value}`);
                }}
              >
                <div className="text-start">
                  <h6 className="mb-0 small">{option.label}</h6>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Rendu du contenu principal selon la sous-option active
  const renderMainContent = () => {
    // Cas spécial pour les modèles de contrat - on utilise le composant existant
    if (activeSubOption === 'modeles-contrat') {
      return <ModeleContratContent />;
    }
    
    // Cas spécial pour les taux de TVA - on utilise le composant TvaManager
    if (activeSubOption === 'taux-tva') {
      return <TvaManager />;
    }
    
    // Cas spécial pour les unités - on utilise le composant UnitesManager
    if (activeSubOption === 'unites') {
      return <UnitesManager />;
    }
    
    // Cas spécial pour les mentions - on utilise le composant MentionsManager
    if (activeSubOption === 'mentions') {
      return <MentionsManager />;
    }
    
    // Cas spéciaux pour les composants équipes
    if (activeSubOption === 'roles') {
      return <RolesManager />;
    }
    
    if (activeSubOption === 'regimes') {
      return <RegimesManager />;
    }
    
    if (activeSubOption === 'metiers') {
      return <MetiersManager />;
    }
    
    // Cas spéciaux pour les composants feuilles de route
    if (activeSubOption === 'modeles-feuille-route') {
      return <ModelesFeuilleRouteManager />;
    }
    
    if (activeSubOption === 'horaires') {
      return <HorairesManager />;
    }
    
    if (activeSubOption === 'moyens-transport') {
      return <MoyensTransportManager />;
    }
    
    const contentMap = {
      'modeles-contrat': {
        title: 'Modèles de contrat',
        description: 'Gérez vos modèles de contrats',
        icon: 'bi-file-earmark-text'
      },
      'taux-tva': {
        title: 'Taux de TVA',
        description: 'Configurez les différents taux de TVA',
        icon: 'bi-percent'
      },
      'unites': {
        title: 'Unités',
        description: 'Définissez les unités pour les devis',
        icon: 'bi-rulers'
      },
      'mentions': {
        title: 'Mentions',
        description: 'Gérez les mentions légales et commerciales',
        icon: 'bi-card-text'
      },
      'roles': {
        title: 'Rôles',
        description: 'Définissez les rôles des membres de l\'équipe',
        icon: 'bi-person-badge'
      },
      'regimes': {
        title: 'Régimes',
        description: 'Configurez les régimes de travail',
        icon: 'bi-calendar-check'
      },
      'metiers': {
        title: 'Métiers',
        description: 'Gérez les différents métiers',
        icon: 'bi-tools'
      },
      'modeles-feuille-route': {
        title: 'Modèles de feuille de route',
        description: 'Créez des modèles de feuilles de route',
        icon: 'bi-map'
      },
      'horaires': {
        title: 'Horaires',
        description: 'Définissez les créneaux horaires',
        icon: 'bi-clock'
      },
      'moyens-transport': {
        title: 'Moyens de transport',
        description: 'Gérez les moyens de transport',
        icon: 'bi-truck'
      },
      'preferences-generales': {
        title: 'Préférences générales',
        description: 'Configurez les préférences comptables',
        icon: 'bi-gear'
      }
    };

    const content = contentMap[activeSubOption];
    
    if (!content) {
      return (
        <div className="text-center p-5">
          <i className="bi bi-exclamation-triangle" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
          <h4 className="mt-3">Option non trouvée</h4>
          <p className="text-muted">Cette option n'est pas encore implémentée.</p>
        </div>
      );
    }

    return (
      <div>
        <div className="card">
          <div className="card-body">
            <div className="d-flex align-items-center mb-4">
              <i className={`bi ${content.icon} me-3`} style={{ fontSize: '2rem', color: '#0d6efd' }}></i>
              <div>
                <h4 className="mb-1">{content.title}</h4>
                <p className="text-muted mb-0">{content.description}</p>
              </div>
            </div>
            
            <div className="text-center p-5">
              <i className={`bi ${content.icon}`} style={{ fontSize: '4rem', color: '#6c757d' }}></i>
              <h5 className="mt-3">Section en développement</h5>
              <p className="text-muted">
                Cette section "{content.title}" sera bientôt disponible.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Paramétrage Admin</h2>
      </div>
      
      <Row>
        <Col md={2}>
          {renderSidebarMenu()}
        </Col>
        <Col md={2}>
          {renderSubOptionsMenu()}
        </Col>
        <Col md={8}>
          {renderMainContent()}
        </Col>
      </Row>
    </Container>
  );
};

export default AdminParametragePage;