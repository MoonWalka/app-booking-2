import React, { useState } from 'react';
import { Form, Row, Col, Card, InputGroup } from 'react-bootstrap';
import styles from './Sections.module.css';

/**
 * Section Salles pour la recherche multi-critères
 */
const SallesSection = ({ onCriteriaChange }) => {
  const [formData, setFormData] = useState({
    jauge: { min: '', max: '' },
    largeur: { min: '', max: '' },
    hauteur: { min: '', max: '' },
    profondeur: { min: '', max: '' }
  });

  // Mapping des champs vers Firebase
  const fieldMapping = {
    jauge: ['salleJauge1', 'salleJauge2', 'salleJauge3'], // Plusieurs champs possibles
    largeur: 'salleOuverture',
    hauteur: 'salleHauteur',
    profondeur: 'salleProfondeur'
  };

  const handleRangeChange = (field, type, value) => {
    const newData = { ...formData };
    newData[field][type] = value;
    setFormData(newData);
    
    // Notifier le parent si au moins une valeur est remplie
    const hasMinOrMax = newData[field].min || newData[field].max;
    
    if (hasMinOrMax) {
      let mappedField = fieldMapping[field];
      let criteriaOperator = 'entre';
      let criteriaValue = { min: null, max: null };
      let displayValue = '';
      
      // Gestion des cas où on n'a qu'une valeur
      if (newData[field].min && !newData[field].max) {
        criteriaOperator = 'superieur';
        criteriaValue = parseFloat(newData[field].min);
        displayValue = `≥ ${newData[field].min}`;
      } else if (!newData[field].min && newData[field].max) {
        criteriaOperator = 'inferieur';
        criteriaValue = parseFloat(newData[field].max);
        displayValue = `≤ ${newData[field].max}`;
      } else if (newData[field].min && newData[field].max) {
        criteriaValue = {
          min: parseFloat(newData[field].min),
          max: parseFloat(newData[field].max)
        };
        displayValue = `${newData[field].min} - ${newData[field].max}`;
      }
      
      // Pour la jauge, on cherchera dans les 3 champs possibles
      if (field === 'jauge' && Array.isArray(mappedField)) {
        mappedField = mappedField[0]; // On utilisera le premier champ comme référence
      }
      
      const criteriaId = `salles_${field}`;
      onCriteriaChange({
        id: criteriaId,
        field: mappedField,
        operator: criteriaOperator,
        value: criteriaValue,
        label: getFieldLabel(field),
        displayValue: displayValue + getFieldUnit(field),
        section: 'salles'
      });
    } else {
      // Si les deux valeurs sont vides, supprimer le critère
      const criteriaId = `salles_${field}`;
      onCriteriaChange({
        id: criteriaId,
        remove: true
      });
    }
  };

  // Helper pour obtenir un label lisible pour le champ
  const getFieldLabel = (field) => {
    const labels = {
      jauge: 'Jauge',
      largeur: 'Largeur de scène',
      hauteur: 'Hauteur de scène',
      profondeur: 'Profondeur de scène'
    };
    return labels[field] || field;
  };

  // Helper pour obtenir l'unité du champ
  const getFieldUnit = (field) => {
    const units = {
      jauge: ' places',
      largeur: ' m',
      hauteur: ' m',
      profondeur: ' m'
    };
    return units[field] || '';
  };

  const renderRangeInput = (field, label, placeholder, unit) => {
    return (
      <Col md={6} className="mb-4">
        <Form.Label>{label}</Form.Label>
        <InputGroup>
          <InputGroup.Text>Entre</InputGroup.Text>
          <Form.Control
            type="number"
            value={formData[field].min}
            onChange={(e) => handleRangeChange(field, 'min', e.target.value)}
            placeholder={placeholder.min}
            min="0"
          />
          <InputGroup.Text>et</InputGroup.Text>
          <Form.Control
            type="number"
            value={formData[field].max}
            onChange={(e) => handleRangeChange(field, 'max', e.target.value)}
            placeholder={placeholder.max}
            min="0"
          />
          {unit && <InputGroup.Text>{unit}</InputGroup.Text>}
        </InputGroup>
        {field === 'jauge' && (
          <Form.Text className="text-muted">
            Capacité d'accueil de la salle
          </Form.Text>
        )}
        {field !== 'jauge' && (
          <Form.Text className="text-muted">
            Dimensions de la scène en mètres
          </Form.Text>
        )}
      </Col>
    );
  };

  return (
    <div className={styles.sectionContent}>
      <h4 className="mb-4">
        <i className="bi bi-building me-2"></i>
        Salles
      </h4>

      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-filter me-2"></i>
            Critères techniques
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            {/* Jauge */}
            {renderRangeInput(
              'jauge', 
              'Jauge', 
              { min: '100', max: '5000' },
              'places'
            )}

            {/* Largeur */}
            {renderRangeInput(
              'largeur', 
              'Largeur de scène', 
              { min: '5', max: '20' },
              'm'
            )}

            {/* Hauteur */}
            {renderRangeInput(
              'hauteur', 
              'Hauteur de scène', 
              { min: '3', max: '10' },
              'm'
            )}

            {/* Profondeur */}
            {renderRangeInput(
              'profondeur', 
              'Profondeur de scène', 
              { min: '4', max: '15' },
              'm'
            )}
          </Row>

          {/* Informations complémentaires */}
          <div className="alert alert-light border mt-4">
            <h6 className="alert-heading">
              <i className="bi bi-info-circle me-2"></i>
              Informations sur les critères
            </h6>
            <hr />
            <div className="row small">
              <div className="col-md-6">
                <p className="mb-2">
                  <strong>Jauge :</strong> Nombre de places assises et/ou debout
                </p>
                <p className="mb-0">
                  <strong>Dimensions :</strong> Mesures de l'espace scénique utilisable
                </p>
              </div>
              <div className="col-md-6">
                <p className="mb-2">
                  <strong>Largeur :</strong> Distance entre jardin et cour
                </p>
                <p className="mb-2">
                  <strong>Hauteur :</strong> Hauteur sous perches ou plafond technique
                </p>
                <p className="mb-0">
                  <strong>Profondeur :</strong> Distance entre l'avant-scène et le lointain
                </p>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SallesSection;