import React, { useState } from 'react';
import { Form, Row, Col, Card, Accordion, Badge } from 'react-bootstrap';
import { TAGS_HIERARCHY } from '../../../config/tagsHierarchy';
import styles from './Sections.module.css';

/**
 * Section Activités pour la recherche multi-critères
 */
const ActivitesSection = ({ onCriteriaChange }) => {
  const [selectedActivites, setSelectedActivites] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState([]);

  // Utilisation de la hiérarchie officielle des tags
  // Filtrer seulement les catégories d'activités (exclure genres, réseaux, mots-clés)
  const categoriesActivites = TAGS_HIERARCHY.filter(cat => 
    ['organisme-institution', 'disque', 'ressource-formation', 'media', 'artiste', 
     'public', 'adherent', 'personnel', 'diffuseur', 'agent-entrepreneur', 'prestataire'].includes(cat.id)
  ).map(category => ({
    ...category,
    // Mapper les icônes appropriées
    icon: getIconForCategory(category.id),
    // Aplatir la hiérarchie pour les sous-catégories imbriquées
    activites: flattenActivities(category)
  }));

  // Helper pour obtenir l'icône appropriée pour chaque catégorie
  function getIconForCategory(categoryId) {
    const icons = {
      'organisme-institution': 'bi-building',
      'disque': 'bi-vinyl',
      'ressource-formation': 'bi-book',
      'media': 'bi-newspaper',
      'artiste': 'bi-music-note-beamed',
      'public': 'bi-people',
      'adherent': 'bi-person-check',
      'personnel': 'bi-person-badge',
      'diffuseur': 'bi-broadcast',
      'agent-entrepreneur': 'bi-briefcase',
      'prestataire': 'bi-tools'
    };
    return icons[categoryId] || 'bi-tag';
  }

  // Helper pour aplatir les activités avec leurs sous-catégories
  function flattenActivities(category) {
    const activities = [];
    
    function traverse(items, parentId = '') {
      items.forEach(item => {
        // Ajouter l'activité avec son chemin complet pour l'identifiant
        const fullId = parentId ? `${parentId}.${item.id}` : item.id;
        activities.push({
          id: fullId,
          label: item.label,
          level: parentId ? 2 : 1
        });
        
        // Si l'item a des enfants, les parcourir récursivement
        if (item.children && item.children.length > 0) {
          traverse(item.children, fullId);
        }
      });
    }
    
    if (category.children) {
      traverse(category.children, category.id);
    }
    
    return activities;
  }

  const handleCategoryToggle = (categoryId) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleActivityToggle = (activityId) => {
    const newSelected = selectedActivites.includes(activityId)
      ? selectedActivites.filter(id => id !== activityId)
      : [...selectedActivites, activityId];
    
    setSelectedActivites(newSelected);
    updateCriteria(newSelected);
  };

  const updateCriteria = (selectedIds) => {
    if (selectedIds.length > 0) {
      // Récupérer les labels pour l'affichage
      const selectedInfo = selectedIds.map(id => {
        for (const cat of categoriesActivites) {
          const activity = cat.activites.find(a => a.id === id);
          if (activity) {
            return {
              id: id,
              label: activity.label
            };
          }
        }
        return { id: id, label: id };
      });
      
      onCriteriaChange({
        id: 'activites_selection',
        field: 'tags',
        operator: 'parmi',
        value: selectedIds, // Envoyer les IDs pour Firebase
        label: 'Activités',
        displayValue: selectedInfo.map(a => a.label).join(', '),
        section: 'activites'
      });
    } else {
      // Si aucune sélection, supprimer le critère
      onCriteriaChange({
        id: 'activites_selection',
        remove: true
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
    updateCriteria(newSelected);
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
                            onChange={() => handleActivityToggle(activite.id)}
                            style={{ paddingLeft: activite.level > 1 ? `${(activite.level - 1) * 20}px` : 0 }}
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