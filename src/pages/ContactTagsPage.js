import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import TagsManager from '../components/contact/parametrage/TagsManager';
import styles from './CollaborationParametragePage.module.css';

/**
 * Page Tags - Interface simplifiée de gestion des tags
 */
const ContactTagsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState('activites');

  // Configuration des sections principales
  const sections = [
    {
      id: 'activites',
      label: 'Activités',
      icon: 'bi-music-note-beamed',
      type: 'activites',
      title: 'Activités',
      buttonLabel: 'Ajouter une activité'
    },
    {
      id: 'genres',
      label: 'Genres',
      icon: 'bi-disc',
      type: 'genres',
      title: 'Genres',
      buttonLabel: 'Ajouter un genre'
    },
    {
      id: 'reseaux',
      label: 'Réseaux',
      icon: 'bi-share',
      type: 'reseaux',
      title: 'Réseaux',
      buttonLabel: 'Ajouter un réseau'
    },
    {
      id: 'mots-cles',
      label: 'Mots-clés',
      icon: 'bi-tags',
      type: 'mots-cles',
      title: 'Mots-clés',
      buttonLabel: 'Ajouter un mot-clé'
    }
  ];

  // Synchronisation avec l'URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const section = searchParams.get('section') || 'activites';
    setSelectedSection(section);
  }, [location]);

  // Gestion de la navigation
  const handleSectionChange = (sectionId) => {
    setSelectedSection(sectionId);
    navigate(`/contacts/tags?section=${sectionId}`);
  };

  // Rendu du menu principal
  const renderMainMenu = () => (
    <div className={styles.sidebarMenu}>
      {sections.map(section => (
        <div
          key={section.id}
          className={`${styles.menuItem} ${selectedSection === section.id ? styles.menuItemActive : ''}`}
          onClick={() => handleSectionChange(section.id)}
        >
          <i className={`${section.icon} me-2`}></i>
          {section.label}
        </div>
      ))}
    </div>
  );

  // Rendu du contenu principal
  const renderMainContent = () => {
    const currentSection = sections.find(s => s.id === selectedSection);
    
    if (currentSection) {
      return (
        <div className={styles.contentArea}>
          <TagsManager 
            type={currentSection.type}
            title={currentSection.title}
            buttonLabel={currentSection.buttonLabel}
          />
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
        <Col md={10}>
          {renderMainContent()}
        </Col>
      </Row>
    </Container>
  );
};

export default ContactTagsPage;