import React, { useState } from 'react';
import { Form, Row, Col, Card } from 'react-bootstrap';
import styles from './Sections.module.css';

/**
 * Section Personnes pour la recherche multi-critères
 */
const PersonnesSection = ({ onCriteriaChange }) => {
  const [formData, setFormData] = useState({
    estActif: 'indifferent',
    estPrioritaire: 'indifferent',
    fonctions: [],
    fonctionRecherche: ''
  });

  // Liste des fonctions disponibles
  const fonctionsDisponibles = [
    { id: 'directeur', label: 'Directeur' },
    { id: 'directeur-artistique', label: 'Directeur artistique' },
    { id: 'programmateur', label: 'Programmateur' },
    { id: 'assistant-programmation', label: 'Assistant programmation' },
    { id: 'charge-production', label: 'Chargé de production' },
    { id: 'charge-communication', label: 'Chargé de communication' },
    { id: 'regisseur', label: 'Régisseur' },
    { id: 'technicien', label: 'Technicien' },
    { id: 'comptable', label: 'Comptable' },
    { id: 'secretaire', label: 'Secrétaire' },
    { id: 'benevole', label: 'Bénévole' },
    { id: 'president', label: 'Président' },
    { id: 'vice-president', label: 'Vice-président' },
    { id: 'tresorier', label: 'Trésorier' },
    { id: 'secretaire-general', label: 'Secrétaire général' },
    { id: 'membre-ca', label: 'Membre du CA' },
    { id: 'autre', label: 'Autre' }
  ];

  // Filtrer les fonctions selon la recherche
  const fonctionsFiltrees = fonctionsDisponibles.filter(f => 
    f.label.toLowerCase().includes(formData.fonctionRecherche.toLowerCase())
  );

  const handleFieldChange = (field, value) => {
    const newData = { ...formData };
    newData[field] = value;
    setFormData(newData);
    
    // Notifier le parent du changement
    if (value && value !== 'indifferent') {
      const criteriaId = `${field}_${Date.now()}`;
      let displayValue = value;
      
      // Pour les fonctions, afficher les labels
      if (field === 'fonctions' && Array.isArray(value)) {
        displayValue = value.map(id => {
          const fonction = fonctionsDisponibles.find(f => f.id === id);
          return fonction ? fonction.label : id;
        }).join(', ');
      }
      
      if ((Array.isArray(value) && value.length > 0) || (!Array.isArray(value) && value !== 'indifferent')) {
        onCriteriaChange({
          id: criteriaId,
          field: field === 'estPrioritaire' ? 'Est prioritaire' : 
                 field === 'estActif' ? 'Est actif' : 'Fonctions',
          operator: field === 'fonctions' ? 'parmi' : '=',
          value: displayValue
        });
      }
    }
  };

  const handleFonctionToggle = (fonctionId) => {
    const newFonctions = formData.fonctions.includes(fonctionId)
      ? formData.fonctions.filter(id => id !== fonctionId)
      : [...formData.fonctions, fonctionId];
    
    handleFieldChange('fonctions', newFonctions);
  };

  return (
    <div className={styles.sectionContent}>
      <h4 className="mb-4">
        <i className="bi bi-people me-2"></i>
        Personnes
      </h4>

      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-filter me-2"></i>
            Filtres disponibles
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            {/* Est actif */}
            <Col md={12} className="mb-4">
              <Form.Label className="fw-bold">Est actif</Form.Label>
              <div className="d-flex gap-4">
                <Form.Check 
                  type="radio"
                  inline
                  label="Oui"
                  name="estActif"
                  value="oui"
                  checked={formData.estActif === 'oui'}
                  onChange={(e) => handleFieldChange('estActif', e.target.value)}
                />
                <Form.Check 
                  type="radio"
                  inline
                  label="Non"
                  name="estActif"
                  value="non"
                  checked={formData.estActif === 'non'}
                  onChange={(e) => handleFieldChange('estActif', e.target.value)}
                />
                <Form.Check 
                  type="radio"
                  inline
                  label="Indifférent"
                  name="estActif"
                  value="indifferent"
                  checked={formData.estActif === 'indifferent'}
                  onChange={(e) => handleFieldChange('estActif', e.target.value)}
                />
              </div>
            </Col>

            {/* Est prioritaire */}
            <Col md={12} className="mb-4">
              <Form.Label className="fw-bold">Est prioritaire</Form.Label>
              <div className="d-flex gap-4">
                <Form.Check 
                  type="radio"
                  inline
                  label="Oui"
                  name="estPrioritaire"
                  value="oui"
                  checked={formData.estPrioritaire === 'oui'}
                  onChange={(e) => handleFieldChange('estPrioritaire', e.target.value)}
                />
                <Form.Check 
                  type="radio"
                  inline
                  label="Non"
                  name="estPrioritaire"
                  value="non"
                  checked={formData.estPrioritaire === 'non'}
                  onChange={(e) => handleFieldChange('estPrioritaire', e.target.value)}
                />
                <Form.Check 
                  type="radio"
                  inline
                  label="Indifférent"
                  name="estPrioritaire"
                  value="indifferent"
                  checked={formData.estPrioritaire === 'indifferent'}
                  onChange={(e) => handleFieldChange('estPrioritaire', e.target.value)}
                />
              </div>
            </Col>

            {/* Fonctions */}
            <Col md={12}>
              <Form.Label className="fw-bold">Fonctions</Form.Label>
              <Form.Text className="d-block mb-2 text-muted">
                Filtre : parmi les fonctions sélectionnées
              </Form.Text>
              
              {/* Barre de recherche pour les fonctions */}
              <Form.Control 
                type="text"
                placeholder="Rechercher une fonction..."
                value={formData.fonctionRecherche}
                onChange={(e) => handleFieldChange('fonctionRecherche', e.target.value)}
                className="mb-3"
              />

              {/* Liste des fonctions avec checkboxes */}
              <div 
                className="border rounded p-3" 
                style={{ 
                  maxHeight: '300px', 
                  overflowY: 'auto',
                  backgroundColor: 'var(--bs-gray-50)'
                }}
              >
                {fonctionsFiltrees.length === 0 ? (
                  <p className="text-muted text-center mb-0">
                    Aucune fonction ne correspond à votre recherche
                  </p>
                ) : (
                  <Row>
                    {fonctionsFiltrees.map(fonction => (
                      <Col md={6} key={fonction.id} className="mb-2">
                        <Form.Check 
                          type="checkbox"
                          id={`fonction-${fonction.id}`}
                          label={fonction.label}
                          checked={formData.fonctions.includes(fonction.id)}
                          onChange={() => handleFonctionToggle(fonction.id)}
                        />
                      </Col>
                    ))}
                  </Row>
                )}
              </div>

              {/* Résumé des sélections */}
              {formData.fonctions.length > 0 && (
                <div className="mt-2">
                  <small className="text-muted">
                    {formData.fonctions.length} fonction(s) sélectionnée(s)
                  </small>
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PersonnesSection;