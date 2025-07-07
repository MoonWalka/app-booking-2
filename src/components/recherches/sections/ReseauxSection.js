import React, { useState } from 'react';
import { Form, Row, Col, Card } from 'react-bootstrap';
import { RESEAUX_HIERARCHY } from '../../../config/tagsHierarchy';
import styles from './Sections.module.css';

/**
 * Section Réseaux pour la recherche multi-critères
 */
const ReseauxSection = ({ onCriteriaChange }) => {
  const [selectedReseaux, setSelectedReseaux] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Utilisation de la hiérarchie officielle des réseaux
  const reseauxDisponibles = RESEAUX_HIERARCHY;

  // Filtrer les réseaux selon la recherche
  const reseauxFiltres = reseauxDisponibles.filter(reseau =>
    reseau.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReseauToggle = (reseauId) => {
    const newSelected = selectedReseaux.includes(reseauId)
      ? selectedReseaux.filter(id => id !== reseauId)
      : [...selectedReseaux, reseauId];
    
    setSelectedReseaux(newSelected);
    updateCriteria(newSelected);
  };

  const updateCriteria = (selectedIds) => {
    if (selectedIds.length > 0) {
      // Récupérer les labels pour l'affichage
      const selectedInfo = selectedIds.map(id => {
        const reseau = reseauxDisponibles.find(r => r.id === id);
        return {
          id: id,
          label: reseau ? reseau.label : id
        };
      });
      
      onCriteriaChange({
        id: 'reseaux_selection',
        field: 'tags',
        operator: 'parmi',
        value: selectedIds, // Envoyer les IDs pour Firebase
        label: 'Réseaux',
        displayValue: selectedInfo.map(r => r.label).join(', '),
        section: 'reseaux'
      });
    } else {
      // Si aucune sélection, supprimer le critère
      onCriteriaChange({
        id: 'reseaux_selection',
        remove: true
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedReseaux.length === reseauxFiltres.length) {
      // Tout désélectionner
      setSelectedReseaux([]);
      updateCriteria([]);
    } else {
      // Tout sélectionner (seulement les réseaux filtrés)
      const allIds = reseauxFiltres.map(r => r.id);
      setSelectedReseaux(allIds);
      updateCriteria(allIds);
    }
  };

  const allSelected = reseauxFiltres.length > 0 && 
    reseauxFiltres.every(r => selectedReseaux.includes(r.id));
  const someSelected = reseauxFiltres.some(r => selectedReseaux.includes(r.id)) && !allSelected;

  return (
    <div className={styles.sectionContent}>
      <h4 className="mb-4">
        <i className="bi bi-diagram-3 me-2"></i>
        Réseaux
      </h4>

      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-filter me-2"></i>
            Filtres disponibles
          </h5>
        </Card.Header>
        <Card.Body>
          <Form.Label className="fw-bold">Réseaux</Form.Label>
          <Form.Text className="d-block mb-3 text-muted">
            Filtre : parmi les réseaux sélectionnés
          </Form.Text>

          {/* Barre de recherche */}
          <Form.Control 
            type="text"
            placeholder="Rechercher un réseau..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-3"
          />

          {/* Résumé des sélections */}
          {selectedReseaux.length > 0 && (
            <div className="alert alert-info mb-3">
              <small>
                <i className="bi bi-check2-circle me-2"></i>
                {selectedReseaux.length} réseau(x) sélectionné(s)
              </small>
            </div>
          )}

          {/* Sélectionner tout */}
          <div className="mb-3">
            <Form.Check 
              type="checkbox"
              id="select-all-reseaux"
              label={<strong>Tout sélectionner ({reseauxFiltres.length})</strong>}
              checked={allSelected}
              indeterminate={someSelected}
              onChange={handleSelectAll}
            />
          </div>

          <hr className="my-2" />

          {/* Liste des réseaux */}
          <div 
            className="border rounded p-3" 
            style={{ 
              maxHeight: '400px', 
              overflowY: 'auto',
              backgroundColor: 'var(--bs-gray-50)'
            }}
          >
            {reseauxFiltres.length === 0 ? (
              <p className="text-muted text-center mb-0">
                Aucun réseau ne correspond à votre recherche
              </p>
            ) : (
              <Row>
                {reseauxFiltres.map(reseau => (
                  <Col md={6} lg={4} key={reseau.id} className="mb-2">
                    <Form.Check 
                      type="checkbox"
                      id={`reseau-${reseau.id}`}
                      label={reseau.label}
                      checked={selectedReseaux.includes(reseau.id)}
                      onChange={() => handleReseauToggle(reseau.id)}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ReseauxSection;