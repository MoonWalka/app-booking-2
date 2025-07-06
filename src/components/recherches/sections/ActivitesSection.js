import React, { useState } from 'react';
import { Form, Row, Col, Card, Accordion, Badge } from 'react-bootstrap';
import styles from './Sections.module.css';

/**
 * Section Activités pour la recherche multi-critères
 */
const ActivitesSection = ({ onCriteriaChange }) => {
  const [selectedActivites, setSelectedActivites] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState([]);

  // Structure hiérarchique des activités
  const categoriesActivites = [
    {
      id: 'organisme-institution',
      label: 'Organisme / institution',
      icon: 'bi-building',
      activites: [
        { id: 'mairie', label: 'Mairie' },
        { id: 'conseil-departemental', label: 'Conseil départemental' },
        { id: 'conseil-regional', label: 'Conseil régional' },
        { id: 'ministere', label: 'Ministère' },
        { id: 'association', label: 'Association' },
        { id: 'fondation', label: 'Fondation' },
        { id: 'syndicat', label: 'Syndicat' }
      ]
    },
    {
      id: 'disque',
      label: 'Disque',
      icon: 'bi-vinyl',
      activites: [
        { id: 'label', label: 'Label' },
        { id: 'distributeur', label: 'Distributeur' },
        { id: 'producteur-phonographique', label: 'Producteur phonographique' },
        { id: 'studio-enregistrement', label: "Studio d'enregistrement" },
        { id: 'mastering', label: 'Mastering' }
      ]
    },
    {
      id: 'ressource-formation',
      label: 'Ressource / Formation',
      icon: 'bi-book',
      activites: [
        { id: 'centre-ressources', label: 'Centre de ressources' },
        { id: 'organisme-formation', label: 'Organisme de formation' },
        { id: 'ecole-musique', label: 'École de musique' },
        { id: 'conservatoire', label: 'Conservatoire' },
        { id: 'universite', label: 'Université' }
      ]
    },
    {
      id: 'media',
      label: 'Média',
      icon: 'bi-newspaper',
      activites: [
        { id: 'radio', label: 'Radio' },
        { id: 'television', label: 'Télévision' },
        { id: 'presse-ecrite', label: 'Presse écrite' },
        { id: 'web-media', label: 'Web média' },
        { id: 'podcast', label: 'Podcast' },
        { id: 'blog', label: 'Blog' }
      ]
    },
    {
      id: 'artiste',
      label: 'Artiste',
      icon: 'bi-music-note-beamed',
      activites: [
        { id: 'musicien', label: 'Musicien' },
        { id: 'chanteur', label: 'Chanteur' },
        { id: 'groupe', label: 'Groupe' },
        { id: 'dj', label: 'DJ' },
        { id: 'compositeur', label: 'Compositeur' },
        { id: 'auteur', label: 'Auteur' }
      ]
    },
    {
      id: 'public',
      label: 'Public',
      icon: 'bi-people',
      activites: [
        { id: 'spectateur', label: 'Spectateur' },
        { id: 'abonne', label: 'Abonné' },
        { id: 'fan', label: 'Fan' },
        { id: 'amateur', label: 'Amateur' }
      ]
    },
    {
      id: 'adherent',
      label: 'Adhérent',
      icon: 'bi-person-check',
      activites: [
        { id: 'membre-actif', label: 'Membre actif' },
        { id: 'membre-bienfaiteur', label: 'Membre bienfaiteur' },
        { id: 'membre-honneur', label: "Membre d'honneur" }
      ]
    },
    {
      id: 'personnel',
      label: 'Personnel',
      icon: 'bi-person-badge',
      activites: [
        { id: 'salarie', label: 'Salarié' },
        { id: 'intermittent', label: 'Intermittent' },
        { id: 'stagiaire', label: 'Stagiaire' },
        { id: 'service-civique', label: 'Service civique' },
        { id: 'benevole', label: 'Bénévole' }
      ]
    },
    {
      id: 'diffuseur',
      label: 'Diffuseur',
      icon: 'bi-broadcast',
      activites: [
        { id: 'salle-spectacle', label: 'Salle de spectacle' },
        { id: 'festival', label: 'Festival' },
        { id: 'cafe-concert', label: 'Café-concert' },
        { id: 'club', label: 'Club' },
        { id: 'theatre', label: 'Théâtre' },
        { id: 'centre-culturel', label: 'Centre culturel' }
      ]
    },
    {
      id: 'agent-entrepreneur',
      label: 'Agent, entrepreneur de spectacles',
      icon: 'bi-briefcase',
      activites: [
        { id: 'agent-artistique', label: 'Agent artistique' },
        { id: 'tourneur', label: 'Tourneur' },
        { id: 'producteur-spectacle', label: 'Producteur de spectacle' },
        { id: 'entrepreneur-spectacle', label: 'Entrepreneur de spectacle' }
      ]
    },
    {
      id: 'prestataire',
      label: 'Prestataire',
      icon: 'bi-tools',
      activites: [
        { id: 'technicien-son', label: 'Technicien son' },
        { id: 'technicien-lumiere', label: 'Technicien lumière' },
        { id: 'location-materiel', label: 'Location de matériel' },
        { id: 'transport', label: 'Transport' },
        { id: 'securite', label: 'Sécurité' },
        { id: 'catering', label: 'Catering' },
        { id: 'graphiste', label: 'Graphiste' },
        { id: 'photographe', label: 'Photographe' },
        { id: 'videaste', label: 'Vidéaste' }
      ]
    }
  ];

  const handleCategoryToggle = (categoryId) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleActivityToggle = (activityId, categoryLabel, activityLabel) => {
    const newSelected = selectedActivites.includes(activityId)
      ? selectedActivites.filter(id => id !== activityId)
      : [...selectedActivites, activityId];
    
    setSelectedActivites(newSelected);
    
    // Notifier le parent
    if (newSelected.length > 0) {
      const selectedLabels = newSelected.map(id => {
        // Retrouver le label de l'activité
        for (const cat of categoriesActivites) {
          const activity = cat.activites.find(a => a.id === id);
          if (activity) return activity.label;
        }
        return id;
      });
      
      onCriteriaChange({
        id: `activites_${Date.now()}`,
        field: 'Activités',
        operator: 'parmi',
        value: selectedLabels.join(', ')
      });
    }
  };

  const handleCategorySelectAll = (category) => {
    const categoryActivityIds = category.activites.map(a => a.id);
    const allSelected = categoryActivityIds.every(id => selectedActivites.includes(id));
    
    let newSelected;
    if (allSelected) {
      // Désélectionner toutes les activités de cette catégorie
      newSelected = selectedActivites.filter(id => !categoryActivityIds.includes(id));
    } else {
      // Sélectionner toutes les activités de cette catégorie
      newSelected = [...new Set([...selectedActivites, ...categoryActivityIds])];
    }
    
    setSelectedActivites(newSelected);
    
    // Notifier le parent
    if (newSelected.length > 0) {
      const selectedLabels = newSelected.map(id => {
        for (const cat of categoriesActivites) {
          const activity = cat.activites.find(a => a.id === id);
          if (activity) return activity.label;
        }
        return id;
      });
      
      onCriteriaChange({
        id: `activites_${Date.now()}`,
        field: 'Activités',
        operator: 'parmi',
        value: selectedLabels.join(', ')
      });
    }
  };

  return (
    <div className={styles.sectionContent}>
      <h4 className="mb-4">
        <i className="bi bi-briefcase me-2"></i>
        Activités
      </h4>

      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-filter me-2"></i>
            Filtres disponibles
          </h5>
        </Card.Header>
        <Card.Body>
          <Form.Label className="fw-bold mb-3">Activité</Form.Label>
          <Form.Text className="d-block mb-3 text-muted">
            Filtre : parmi les activités sélectionnées
          </Form.Text>

          {/* Résumé des sélections */}
          {selectedActivites.length > 0 && (
            <div className="alert alert-info mb-3">
              <small>
                <i className="bi bi-check2-circle me-2"></i>
                {selectedActivites.length} activité(s) sélectionnée(s)
              </small>
            </div>
          )}

          {/* Arborescence des catégories */}
          <Accordion>
            {categoriesActivites.map((category, index) => {
              const categoryActivityIds = category.activites.map(a => a.id);
              const selectedInCategory = categoryActivityIds.filter(id => selectedActivites.includes(id)).length;
              const allSelected = selectedInCategory === category.activites.length;
              const someSelected = selectedInCategory > 0 && !allSelected;

              return (
                <Accordion.Item key={category.id} eventKey={index.toString()}>
                  <Accordion.Header>
                    <div className="d-flex align-items-center w-100">
                      <i className={`${category.icon} me-2`}></i>
                      <span className="flex-grow-1">{category.label}</span>
                      {selectedInCategory > 0 && (
                        <Badge bg="primary" className="me-2">
                          {selectedInCategory}
                        </Badge>
                      )}
                    </div>
                  </Accordion.Header>
                  <Accordion.Body>
                    {/* Sélectionner tout */}
                    <div className="mb-3">
                      <Form.Check 
                        type="checkbox"
                        id={`select-all-${category.id}`}
                        label={<strong>Tout sélectionner</strong>}
                        checked={allSelected}
                        indeterminate={someSelected}
                        onChange={() => handleCategorySelectAll(category)}
                      />
                    </div>
                    
                    <hr className="my-2" />
                    
                    {/* Liste des activités */}
                    <Row>
                      {category.activites.map(activite => (
                        <Col md={6} key={activite.id} className="mb-2">
                          <Form.Check 
                            type="checkbox"
                            id={`activite-${activite.id}`}
                            label={activite.label}
                            checked={selectedActivites.includes(activite.id)}
                            onChange={() => handleActivityToggle(activite.id, category.label, activite.label)}
                          />
                        </Col>
                      ))}
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>
              );
            })}
          </Accordion>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ActivitesSection;