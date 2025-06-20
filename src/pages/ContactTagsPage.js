import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import HierarchicalTagsManager from '../components/contact/parametrage/HierarchicalTagsManager';
import styles from './CollaborationParametragePage.module.css';

/**
 * Page Tags - Système de navigation à plusieurs niveaux
 */
const ContactTagsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedConfig, setSelectedConfig] = useState('activites');
  const [selectedSubOption, setSelectedSubOption] = useState('');

  // Configuration du menu principal
  const mainSections = [
    {
      id: 'activites',
      label: 'Activités',
      icon: 'bi-music-note-beamed'
    },
    {
      id: 'genres',
      label: 'Genres',
      icon: 'bi-disc'
    },
    {
      id: 'reseaux',
      label: 'Réseaux',
      icon: 'bi-share'
    },
    {
      id: 'mots-cles',
      label: 'Mots-clés',
      icon: 'bi-tags'
    }
  ];

  // Configuration des sous-options pour chaque section
  const subOptionsConfig = {
    'activites': [
      { id: 'spectacle-vivant', label: 'Spectacle vivant', icon: 'bi-theater-masks' },
      { id: 'musique-enregistree', label: 'Musique enregistrée', icon: 'bi-vinyl' },
      { id: 'festivals', label: 'Festivals', icon: 'bi-calendar-event' },
      { id: 'production', label: 'Production', icon: 'bi-camera-video' },
      { id: 'management', label: 'Management', icon: 'bi-person-badge' }
    ],
    'genres': [
      { id: 'rock', label: 'Rock', icon: 'bi-lightning' },
      { id: 'pop', label: 'Pop', icon: 'bi-star' },
      { id: 'jazz', label: 'Jazz', icon: 'bi-music-note' },
      { id: 'electronique', label: 'Électronique', icon: 'bi-soundwave' },
      { id: 'classique', label: 'Classique', icon: 'bi-music-note-list' },
      { id: 'hip-hop', label: 'Hip-Hop', icon: 'bi-mic' },
      { id: 'folk', label: 'Folk', icon: 'bi-tree' },
      { id: 'blues', label: 'Blues', icon: 'bi-vinyl-fill' }
    ],
    'reseaux': [
      { id: 'programmateurs', label: 'Programmateurs', icon: 'bi-calendar3' },
      { id: 'labels', label: 'Labels', icon: 'bi-disc' },
      { id: 'medias', label: 'Médias', icon: 'bi-broadcast' },
      { id: 'distributeurs', label: 'Distributeurs', icon: 'bi-truck' },
      { id: 'institutions', label: 'Institutions', icon: 'bi-building' }
    ],
    'mots-cles': [
      { id: 'priorite', label: 'Priorité', icon: 'bi-exclamation-triangle' },
      { id: 'statut', label: 'Statut', icon: 'bi-check-circle' },
      { id: 'origine', label: 'Origine', icon: 'bi-geo-alt' },
      { id: 'secteur', label: 'Secteur', icon: 'bi-diagram-3' }
    ]
  };

  // Synchronisation avec l'URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const config = searchParams.get('section') || 'activites';
    const subOption = searchParams.get('sub') || '';
    
    setSelectedConfig(config);
    setSelectedSubOption(subOption);
  }, [location]);

  // Gestion de la navigation
  const handleSectionChange = (sectionId) => {
    setSelectedConfig(sectionId);
    setSelectedSubOption('');
    navigate(`/contacts/tags?section=${sectionId}`);
  };

  const handleSubOptionChange = (subOptionId) => {
    setSelectedSubOption(subOptionId);
    navigate(`/contacts/tags?section=${selectedConfig}&sub=${subOptionId}`);
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
    const subOptions = subOptionsConfig[selectedConfig] || [];

    return (
      <div className={styles.subMenu}>
        {subOptions.map(option => (
          <div
            key={option.id}
            className={`${styles.subMenuItem} ${selectedSubOption === option.id ? styles.subMenuItemActive : ''}`}
            onClick={() => handleSubOptionChange(option.id)}
          >
            <i className={`${option.icon} me-2`}></i>
            {option.label}
          </div>
        ))}
      </div>
    );
  };

  // Rendu du contenu principal
  const renderMainContent = () => {
    const currentSection = mainSections.find(s => s.id === selectedConfig);
    const currentSubOption = subOptionsConfig[selectedConfig]?.find(opt => opt.id === selectedSubOption);

    if (selectedSubOption && currentSubOption) {
      return (
        <div className={styles.contentArea}>
          <h3>
            <i className={`${currentSubOption.icon} me-2`}></i>
            {currentSubOption.label}
          </h3>
          <p className="text-muted">Gérez les tags de type "{currentSubOption.label}"</p>
          <div className="mt-4">
            <div className="card">
              <div className="card-body">
                <h5>Configuration des tags</h5>
                <p>Interface de gestion pour les tags "{currentSubOption.label}" en développement...</p>
                <div className="mt-3">
                  <button className="btn btn-primary me-2">
                    <i className="bi bi-plus me-1"></i>
                    Ajouter un tag
                  </button>
                  <button className="btn btn-outline-secondary">
                    <i className="bi bi-pencil me-1"></i>
                    Modifier les tags existants
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentSection) {
      // Afficher le gestionnaire hiérarchique pour les activités
      if (selectedConfig === 'activites') {
        return (
          <div className={styles.contentArea}>
            <HierarchicalTagsManager />
          </div>
        );
      }
      
      // Pour les autres sections, afficher l'interface de navigation
      return (
        <div className={styles.contentArea}>
          <h3>
            <i className={`${currentSection.icon} me-2`}></i>
            {currentSection.label}
          </h3>
          <p className="text-muted">Sélectionnez une sous-catégorie dans le menu de gauche pour gérer les tags correspondants.</p>
          <div className="mt-4">
            <div className="card">
              <div className="card-body">
                <h5>Catégorie : {currentSection.label}</h5>
                <p>Cette section permet de gérer tous les tags liés aux {currentSection.label.toLowerCase()}.</p>
                <div className="row">
                  {subOptionsConfig[selectedConfig]?.map(subOption => (
                    <div key={subOption.id} className="col-md-6 mb-3">
                      <div className="card border-secondary">
                        <div className="card-body text-center">
                          <i className={`${subOption.icon} mb-2`} style={{ fontSize: '2rem', color: '#6c757d' }}></i>
                          <h6>{subOption.label}</h6>
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleSubOptionChange(subOption.id)}
                          >
                            Gérer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.contentArea}>
        <h3>
          <i className="bi bi-tags me-2"></i>
          Tags
        </h3>
        <p className="text-muted">Sélectionnez une catégorie dans le menu de gauche pour commencer.</p>
      </div>
    );
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-0">
            <i className="bi bi-tags me-2"></i>
            Tags
          </h2>
          <p className="text-muted">Gérez vos tags pour catégoriser et organiser vos contacts</p>
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

export default ContactTagsPage;