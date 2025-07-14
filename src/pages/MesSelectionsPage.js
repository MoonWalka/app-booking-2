import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import styles from './CollaborationParametragePage.module.css';

/**
 * Page Mes sélections - Système de navigation à plusieurs niveaux
 */
const MesSelectionsPage = () => {
  const [selectedConfig, setSelectedConfig] = useState('nouvelle-selection');
  const [selectedSubOption, setSelectedSubOption] = useState('');

  // Configuration du menu principal
  const mainSections = [
    {
      id: 'nouvelle-selection',
      label: 'Nouvelle sélection',
      icon: 'bi-check-square'
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
        id: 'dossier-17062025',
        label: 'Dossier du 17/06/2025 14:53',
        icon: 'bi-folder',
        subItems: [
          { id: 'selection-1', label: 'Sélection du 17/06/2025 14:53', count: null },
          { id: 'selection-2', label: 'Sélection du 17/06/2025 14:53 (2)', count: 2 }
        ]
      }
    ]
  };


  // Gestion de la navigation interne (sans changer l'URL)
  const handleSectionChange = (sectionId) => {
    setSelectedConfig(sectionId);
    setSelectedSubOption('');
    // Ne pas utiliser navigate() pour rester dans le système d'onglets
  };

  const handleSubOptionChange = (subOptionId) => {
    setSelectedSubOption(subOptionId);
    // Ne pas utiliser navigate() pour rester dans le système d'onglets
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
      case 'nouvelle-selection':
        return (
          <div className={styles.contentArea}>
            <h3>
              <i className="bi bi-check-square me-2"></i>
              Nouvelle sélection
            </h3>
            <p className="text-muted">Interface pour créer une nouvelle sélection de contacts...</p>
            <div className="mt-4">
              <div className="card">
                <div className="card-body">
                  <h5>Créer une sélection</h5>
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
            <p className="text-muted">Interface pour créer un nouveau dossier de sélections...</p>
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
                      <h5>Sélections dans ce dossier</h5>
                      {subOption.subItems?.map(item => (
                        <div key={item.id} className="mb-2">
                          {item.count && <span className="badge bg-primary me-2">{item.count}</span>}
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
            <h3>Mes sélections</h3>
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
            <i className="bi bi-check2-square me-2"></i>
            Mes sélections
          </h2>
          <p className="text-muted">Gérez vos sélections de contacts sauvegardées</p>
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

export default MesSelectionsPage;