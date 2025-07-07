import React, { useState } from 'react';
import { Form, Row, Col, Card, Accordion, Badge } from 'react-bootstrap';
import { GENRES_HIERARCHY } from '../../../config/tagsHierarchy';
import styles from './Sections.module.css';

/**
 * Section Genres pour la recherche multi-critères
 */
const GenresSection = ({ onCriteriaChange }) => {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState([]);

  // Utilisation de la hiérarchie officielle des genres
  const categoriesGenres = GENRES_HIERARCHY.map(category => ({
    ...category,
    // Mapper les icônes appropriées
    icon: getIconForGenre(category.id),
    // Aplatir la hiérarchie pour les sous-catégories
    genres: flattenGenres(category)
  }));

  // Helper pour obtenir l'icône appropriée pour chaque catégorie de genre
  function getIconForGenre(categoryId) {
    const icons = {
      'musique': 'bi-music-note-beamed',
      'arts-vivants': 'bi-people',
      'pluridisciplinaire': 'bi-diagram-3',
      'arts-plastiques': 'bi-palette',
      'cinema': 'bi-film',
      'expositions': 'bi-easel',
      'video-arts-numeriques': 'bi-camera-video',
      'jeune-public': 'bi-balloon'
    };
    return icons[categoryId] || 'bi-tag';
  }

  // Helper pour aplatir les genres avec leurs sous-catégories
  function flattenGenres(category) {
    const genres = [];
    
    function traverse(items, parentId = '') {
      items.forEach(item => {
        const fullId = parentId ? `${parentId}.${item.id}` : item.id;
        genres.push({
          id: fullId,
          label: item.label,
          level: parentId ? 2 : 1
        });
        
        if (item.children && item.children.length > 0) {
          traverse(item.children, fullId);
        }
      });
    }
    
    if (category.children) {
      traverse(category.children, category.id);
    } else {
      // Si pas d'enfants, ajouter la catégorie elle-même comme genre
      genres.push({
        id: category.id,
        label: category.label,
        level: 0
      });
    }
    
    return genres;
  }

  const handleCategoryToggle = (categoryId) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleGenreToggle = (genreId) => {
    const newSelected = selectedGenres.includes(genreId)
      ? selectedGenres.filter(id => id !== genreId)
      : [...selectedGenres, genreId];
    
    setSelectedGenres(newSelected);
    updateCriteria(newSelected);
  };

  const updateCriteria = (selectedIds) => {
    if (selectedIds.length > 0) {
      // Récupérer les labels pour l'affichage
      const selectedInfo = selectedIds.map(id => {
        for (const cat of categoriesGenres) {
          const genre = cat.genres.find(g => g.id === id);
          if (genre) {
            return {
              id: id,
              label: genre.label
            };
          }
        }
        return { id: id, label: id };
      });
      
      onCriteriaChange({
        id: 'genres_selection',
        field: 'tags', // Utiliser tags comme pour les activités
        operator: 'parmi',
        value: selectedIds, // Envoyer les IDs pour Firebase
        label: 'Genres',
        displayValue: selectedInfo.map(g => g.label).join(', '),
        section: 'genres'
      });
    } else {
      // Si aucune sélection, supprimer le critère
      onCriteriaChange({
        id: 'genres_selection',
        remove: true
      });
    }
  };

  const handleCategorySelectAll = (category) => {
    const categoryGenreIds = category.genres.map(g => g.id);
    const allSelected = categoryGenreIds.every(id => selectedGenres.includes(id));
    
    let newSelected;
    if (allSelected) {
      // Désélectionner tous les genres de cette catégorie
      newSelected = selectedGenres.filter(id => !categoryGenreIds.includes(id));
    } else {
      // Sélectionner tous les genres de cette catégorie
      newSelected = [...new Set([...selectedGenres, ...categoryGenreIds])];
    }
    
    setSelectedGenres(newSelected);
    updateCriteria(newSelected);
  };

  return (
    <div className={styles.sectionContent}>
      <h4 className="mb-4">
        <i className="bi bi-music-note-list me-2"></i>
        Genres
      </h4>

      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-filter me-2"></i>
            Filtres disponibles
          </h5>
        </Card.Header>
        <Card.Body>
          <Form.Label className="fw-bold mb-3">Genres</Form.Label>
          <Form.Text className="d-block mb-3 text-muted">
            Filtre : parmi les genres sélectionnés
          </Form.Text>

          {/* Résumé des sélections */}
          {selectedGenres.length > 0 && (
            <div className="alert alert-info mb-3">
              <small>
                <i className="bi bi-check2-circle me-2"></i>
                {selectedGenres.length} genre(s) sélectionné(s)
              </small>
            </div>
          )}

          {/* Arborescence des catégories */}
          <Accordion>
            {categoriesGenres.map((category, index) => {
              const categoryGenreIds = category.genres.map(g => g.id);
              const selectedInCategory = categoryGenreIds.filter(id => selectedGenres.includes(id)).length;
              const allSelected = selectedInCategory === category.genres.length;
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
                    {category.genres.length > 1 && (
                      <>
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
                      </>
                    )}
                    
                    {/* Liste des genres */}
                    <Row>
                      {category.genres.map(genre => (
                        <Col md={6} key={genre.id} className="mb-2">
                          <Form.Check 
                            type="checkbox"
                            id={`genre-${genre.id}`}
                            label={genre.label}
                            checked={selectedGenres.includes(genre.id)}
                            onChange={() => handleGenreToggle(genre.id)}
                            style={{ paddingLeft: genre.level > 0 ? `${genre.level * 20}px` : 0 }}
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

export default GenresSection;