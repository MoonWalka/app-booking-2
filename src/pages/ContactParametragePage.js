import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import TabNavigation from '../components/common/TabNavigation';
import TagsManager from '../components/contact/parametrage/TagsManager';
import QualificationsManager from '../components/contact/parametrage/QualificationsManager';
import MessagerieManager from '../components/contact/parametrage/MessagerieManager';
import MessagesTachesManager from '../components/contact/parametrage/MessagesTachesManager';
import '@styles/index.css';

const ContactParametragePage = () => {
  const [activeSection, setActiveSection] = useState('tags');
  const [activeSubOption, setActiveSubOption] = useState('activites');
  const navigate = useNavigate();
  const location = useLocation();

  // Déterminer la section et sous-option actives en fonction de l'URL
  useEffect(() => {
    const path = location.pathname;
    let newActiveSection = 'tags';
    let newActiveSubOption = 'activites';
    
    if (path.includes('/contact/parametrage/activites')) {
      newActiveSection = 'tags';
      newActiveSubOption = 'activites';
    } else if (path.includes('/contact/parametrage/genres')) {
      newActiveSection = 'tags';
      newActiveSubOption = 'genres';
    } else if (path.includes('/contact/parametrage/reseaux')) {
      newActiveSection = 'tags';
      newActiveSubOption = 'reseaux';
    } else if (path.includes('/contact/parametrage/mots-cles')) {
      newActiveSection = 'tags';
      newActiveSubOption = 'mots-cles';
    } else if (path.includes('/contact/parametrage/pays')) {
      newActiveSection = 'qualifications';
      newActiveSubOption = 'pays';
    } else if (path.includes('/contact/parametrage/fonctions')) {
      newActiveSection = 'qualifications';
      newActiveSubOption = 'fonctions';
    } else if (path.includes('/contact/parametrage/sources')) {
      newActiveSection = 'qualifications';
      newActiveSubOption = 'sources';
    } else if (path.includes('/contact/parametrage/comptes-messagerie')) {
      newActiveSection = 'messagerie';
      newActiveSubOption = 'comptes-messagerie';
    } else if (path.includes('/contact/parametrage/serveur-envoi')) {
      newActiveSection = 'messagerie';
      newActiveSubOption = 'serveur-envoi';
    } else if (path.includes('/contact/parametrage/modeles-email')) {
      newActiveSection = 'messages-taches';
      newActiveSubOption = 'modeles-email';
    } else if (path.includes('/contact/parametrage/formules-types')) {
      newActiveSection = 'messages-taches';
      newActiveSubOption = 'formules-types';
    } else if (path.includes('/contact/parametrage/signatures')) {
      newActiveSection = 'messages-taches';
      newActiveSubOption = 'signatures';
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
      { label: 'Tags', value: 'tags' },
      { label: 'Qualifications', value: 'qualifications' },
      { label: 'Messagerie', value: 'messagerie' },
      { label: 'Messages & tâches', value: 'messages-taches' }
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
            navigate(`/contact/parametrage/${firstSubOption.value}`);
          }
        }}
        vertical={true}
      />
    );
  };

  // Fonction pour obtenir les sous-options d'une section
  const getSubOptionsForSection = (section) => {
    const subOptionsMap = {
      'tags': [
        { label: 'Activités', value: 'activites' },
        { label: 'Genres', value: 'genres' },
        { label: 'Réseaux', value: 'reseaux' },
        { label: 'Mots-clés', value: 'mots-cles' }
      ],
      'qualifications': [
        { label: 'Pays', value: 'pays' },
        { label: 'Fonctions', value: 'fonctions' },
        { label: 'Sources', value: 'sources' }
      ],
      'messagerie': [
        { label: 'Comptes de messagerie', value: 'comptes-messagerie' },
        { label: 'Serveur d\'envoi', value: 'serveur-envoi' }
      ],
      'messages-taches': [
        { label: 'Modèles d\'email', value: 'modeles-email' },
        { label: 'Formules types', value: 'formules-types' },
        { label: 'Signatures', value: 'signatures' }
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
                  navigate(`/contact/parametrage/${option.value}`);
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
    // Section Tags
    if (activeSection === 'tags') {
      const tagsConfig = {
        'activites': {
          type: 'activites',
          title: 'Activités',
          buttonLabel: 'Ajouter une activité'
        },
        'genres': {
          type: 'genres',
          title: 'Genres',
          buttonLabel: 'Ajouter un genre'
        },
        'reseaux': {
          type: 'reseaux',
          title: 'Réseaux',
          buttonLabel: 'Ajouter un réseau'
        },
        'mots-cles': {
          type: 'mots-cles',
          title: 'Mots-clés',
          buttonLabel: 'Ajouter un mot-clé'
        }
      };

      const config = tagsConfig[activeSubOption];
      if (config) {
        return <TagsManager {...config} />;
      }
    }

    // Section Qualifications
    if (activeSection === 'qualifications') {
      const qualificationsConfig = {
        'pays': {
          type: 'pays',
          title: 'Pays',
          buttonLabel: 'Ajouter un pays'
        },
        'fonctions': {
          type: 'fonctions',
          title: 'Fonctions',
          buttonLabel: 'Ajouter une fonction'
        },
        'sources': {
          type: 'sources',
          title: 'Sources',
          buttonLabel: 'Ajouter une source'
        }
      };

      const config = qualificationsConfig[activeSubOption];
      if (config) {
        return <QualificationsManager {...config} />;
      }
    }

    // Section Messagerie
    if (activeSection === 'messagerie') {
      const messagerieConfig = {
        'comptes-messagerie': {
          type: 'comptes-messagerie',
          title: 'Comptes de messagerie',
          buttonLabel: 'Ajouter un compte'
        },
        'serveur-envoi': {
          type: 'serveur-envoi',
          title: 'Serveurs d\'envoi',
          buttonLabel: 'Ajouter un serveur'
        }
      };

      const config = messagerieConfig[activeSubOption];
      if (config) {
        return <MessagerieManager {...config} />;
      }
    }

    // Section Messages & Tâches
    if (activeSection === 'messages-taches') {
      const messagesTachesConfig = {
        'modeles-email': {
          type: 'modeles-email',
          title: 'Modèles d\'email',
          buttonLabel: 'Ajouter un modèle'
        },
        'formules-types': {
          type: 'formules-types',
          title: 'Formules types',
          buttonLabel: 'Ajouter une formule'
        },
        'signatures': {
          type: 'signatures',
          title: 'Signatures',
          buttonLabel: 'Ajouter une signature'
        }
      };

      const config = messagesTachesConfig[activeSubOption];
      if (config) {
        return <MessagesTachesManager {...config} />;
      }
    }

    // Placeholder pour sections non implémentées
    const contentMap = {};

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
        <h2 className="mb-0">Paramétrage Contact</h2>
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

export default ContactParametragePage;