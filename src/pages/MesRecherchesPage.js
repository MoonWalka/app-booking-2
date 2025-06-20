import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import styles from './CollaborationParametragePage.module.css';

/**
 * Page Mes recherches - Système de navigation à plusieurs niveaux
 */
const MesRecherchesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedConfig, setSelectedConfig] = useState('nouvelle-recherche');
  const [selectedSubOption, setSelectedSubOption] = useState('');

  // Configuration du menu principal
  const mainSections = [
    {
      id: 'nouvelle-recherche',
      label: 'Nouvelle recherche',
      icon: 'bi-search-plus'
    },
    {
      id: 'nouveau-dossier',
      label: 'Nouveau dossier',
      icon: 'bi-folder-plus'
    },
    {
      id: 'dossiers-enregistres',
      label: 'Dossiers enregistrés',
      icon: 'bi-archive',
      hasSubOptions: true
    }
  ];

  // Configuration des sous-options pour chaque section
  const subOptionsConfig = {
    'dossiers-enregistres': [
      {
        id: 'dossier-20062025',
        label: 'Dossier du 20/06/2025 01:12',
        icon: 'bi-folder',
        subItems: [
          { id: 'tous-1', label: 'Tous (1)', count: 1 },
          { id: 'non-localises-0', label: 'Contacts non localisés (0)', count: 0 }
        ]
      }
    ]
  };

  // Synchronisation avec l'URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const config = searchParams.get('section') || 'nouvelle-recherche';
    const subOption = searchParams.get('sub') || '';
    
    setSelectedConfig(config);
    setSelectedSubOption(subOption);
  }, [location]);

  // Gestion de la navigation
  const handleSectionChange = (sectionId) => {
    setSelectedConfig(sectionId);
    setSelectedSubOption('');
    navigate(`/contacts/recherches?section=${sectionId}`);
  };

  const handleSubOptionChange = (subOptionId) => {
    setSelectedSubOption(subOptionId);
    navigate(`/contacts/recherches?section=${selectedConfig}&sub=${subOptionId}`);
  };

  // Rendu du menu principal
  const renderMainMenu = () => (
    <div className={styles.sidebarMenu}>
      {mainSections.map(section => (
        <div
          key={section.id}
          className={`${styles.menuItem} ${selectedConfig === section.id ? styles.menuItemActive : ''}`}
          onClick={() => handleSectionChange(section.id)}
        >
          <i className={`${section.icon} me-2`}></i>
          {section.label}
        </div>
      ))}
    </div>
  );

  // Rendu du sous-menu
  const renderSubMenu = () => {
    const currentSection = mainSections.find(s => s.id === selectedConfig);
    if (!currentSection?.hasSubOptions) return null;

    const subOptions = subOptionsConfig[selectedConfig] || [];

    return (
      <div className={styles.subMenu}>
        {subOptions.map(option => (
          <div key={option.id} className={styles.subMenuSection}>
            <div
              className={`${styles.subMenuItem} ${selectedSubOption === option.id ? styles.subMenuItemActive : ''}`}
              onClick={() => handleSubOptionChange(option.id)}
            >
              <i className={`${option.icon} me-2`}></i>
              {option.label}
            </div>
            {option.subItems && selectedSubOption === option.id && (
              <div className={styles.subMenuItems}>
                {option.subItems.map(subItem => (
                  <div
                    key={subItem.id}
                    className={styles.subMenuSubItem}
                    onClick={() => handleSubOptionChange(subItem.id)}
                  >
                    <span className="ms-3">{subItem.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Rendu du contenu principal
  const renderMainContent = () => {
    switch (selectedConfig) {
      case 'nouvelle-recherche':
        return (
          <div className={styles.contentArea}>
            <h3>
              <i className="bi bi-search-plus me-2"></i>
              Nouvelle recherche
            </h3>
            <p className="text-muted">Interface pour créer une nouvelle recherche de contacts...</p>
            <div className="mt-4">
              <div className="card">
                <div className="card-body">
                  <h5>Critères de recherche</h5>
                  <p>Fonctionnalité en développement...</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'nouveau-dossier':
        return (
          <div className={styles.contentArea}>
            <h3>
              <i className="bi bi-folder-plus me-2"></i>
              Nouveau dossier
            </h3>
            <p className="text-muted">Interface pour créer un nouveau dossier de recherches...</p>
            <div className="mt-4">
              <div className="card">
                <div className="card-body">
                  <h5>Créer un dossier</h5>
                  <p>Fonctionnalité en développement...</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'dossiers-enregistres':
        if (selectedSubOption) {
          const subOption = subOptionsConfig[selectedConfig]?.find(opt => opt.id === selectedSubOption);
          if (subOption) {
            return (
              <div className={styles.contentArea}>
                <h3>
                  <i className="bi bi-folder me-2"></i>
                  {subOption.label}
                </h3>
                <p className="text-muted">Contenu du dossier sélectionné...</p>
                <div className="mt-4">
                  <div className="card">
                    <div className="card-body">
                      <h5>Recherches dans ce dossier</h5>
                      {subOption.subItems?.map(item => (
                        <div key={item.id} className="mb-2">
                          <span className="badge bg-secondary me-2">{item.count}</span>
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          }
        }
        return (
          <div className={styles.contentArea}>
            <h3>
              <i className="bi bi-archive me-2"></i>
              Dossiers enregistrés
            </h3>
            <p className="text-muted">Sélectionnez un dossier dans le menu de gauche pour voir son contenu.</p>
          </div>
        );

      default:
        return (
          <div className={styles.contentArea}>
            <h3>Mes recherches</h3>
            <p className="text-muted">Sélectionnez une option dans le menu de gauche.</p>
          </div>
        );
    }
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-0">
            <i className="bi bi-search me-2"></i>
            Mes recherches
          </h2>
          <p className="text-muted">Gérez vos recherches de contacts sauvegardées</p>
        </Col>
      </Row>

      <Row>
        <Col md={2}>
          {renderMainMenu()}
        </Col>
        <Col md={2}>
          {renderSubMenu()}
        </Col>
        <Col md={8}>
          {renderMainContent()}
        </Col>
      </Row>
    </Container>
  );
};

export default MesRecherchesPage;