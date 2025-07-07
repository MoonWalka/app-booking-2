import React, { useState } from 'react';
import { Form, Row, Col, Card, Accordion, InputGroup } from 'react-bootstrap';
import styles from './Sections.module.css';

/**
 * Section Dates pour la recherche multi-critères
 */
const DatesSection = ({ onCriteriaChange }) => {
  // Mapping des champs vers Firebase
  const fieldMapping = {
    niveau: 'niveau',
    date: 'date',
    titre: 'titre',
    montant: 'montant',
    artisteNom: 'artisteNom',
    lieuNom: 'lieuNom',
    type: 'type',
    notes: 'notes'
  };

  const [formData, setFormData] = useState({
    // Dates et niveaux
    niveau: [],
    dateDebut: { from: '', to: '' },
    
    // Titre et recherche
    titre: { value: '', operator: 'contient' },
    
    // Artistes et lieux
    artisteNom: { value: '', operator: 'contient' },
    lieuNom: { value: '', operator: 'contient' },
    
    // Montant
    montant: { min: '', max: '' },
    
    // Notes
    notes: { value: '', operator: 'contient' }
  });

  const niveaux = [
    { value: 'incomplete', label: 'Incomplète' },
    { value: 'interet', label: 'Intérêt' },
    { value: 'option', label: 'Option' },
    { value: 'confirme', label: 'Confirmé' },
    { value: 'annule', label: 'Annulé' },
    { value: 'reporte', label: 'Reporté' }
  ];


  const operators = [
    { value: 'contient', label: 'Contient' },
    { value: 'egal', label: 'Égal à' },
    { value: 'commence', label: 'Commence par' },
    { value: 'termine', label: 'Se termine par' },
    { value: 'different', label: 'Différent de' },
    { value: 'non_renseigne', label: 'Non renseigné' }
  ];

  const handleFieldChange = (field, value, subField = null, operator = null) => {
    const newData = { ...formData };
    
    if (subField) {
      newData[field] = { ...newData[field], [subField]: value };
    } else if (operator !== null) {
      newData[field] = { ...newData[field], operator };
    } else if (typeof newData[field] === 'object' && 'value' in newData[field]) {
      newData[field] = { ...newData[field], value };
    } else {
      newData[field] = value;
    }
    
    setFormData(newData);
    
    // Notifier le parent selon le type de champ
    notifyChange(field, newData[field]);
  };

  const handleMultiSelect = (field, value) => {
    const newData = { ...formData };
    const currentValues = newData[field];
    
    if (currentValues.includes(value)) {
      newData[field] = currentValues.filter(v => v !== value);
    } else {
      newData[field] = [...currentValues, value];
    }
    
    setFormData(newData);
    notifyChange(field, newData[field]);
  };

  const notifyChange = (field, value) => {
    const mappedField = fieldMapping[field] || field;
    let criteriaValue = value;
    let displayValue = '';
    let criteriaOperator = 'egal';
    let label = '';
    
    // Gestion selon le type de champ
    if (field === 'niveau') {
      if (!value || value.length === 0) {
        onCriteriaChange({
          id: `dates_${field}`,
          remove: true
        });
        return;
      }
      
      const selectedLabels = value.map(v => 
        niveaux.find(opt => opt.value === v)?.label || v
      );
      
      criteriaOperator = 'parmi';
      displayValue = selectedLabels.join(', ');
      label = 'Niveau';
      
    } else if (field === 'dateDebut') {
      if (!value.from && !value.to) {
        onCriteriaChange({
          id: `dates_${field}`,
          remove: true
        });
        return;
      }
      
      if (value.from && value.to) {
        criteriaOperator = 'entre';
        criteriaValue = {
          min: value.from,
          max: value.to
        };
        displayValue = `du ${value.from} au ${value.to}`;
      } else if (value.from) {
        criteriaOperator = 'superieur';
        criteriaValue = value.from;
        displayValue = `après le ${value.from}`;
      } else if (value.to) {
        criteriaOperator = 'inferieur';
        criteriaValue = value.to;
        displayValue = `avant le ${value.to}`;
      }
      
      label = 'Date';
      mappedField = 'date';
      
    } else if (field === 'montant') {
      if (!value.min && !value.max) {
        onCriteriaChange({
          id: `dates_${field}`,
          remove: true
        });
        return;
      }
      
      if (value.min && value.max) {
        criteriaOperator = 'entre';
        criteriaValue = {
          min: parseFloat(value.min),
          max: parseFloat(value.max)
        };
        displayValue = `${value.min}€ - ${value.max}€`;
      } else if (value.min) {
        criteriaOperator = 'superieur';
        criteriaValue = parseFloat(value.min);
        displayValue = `≥ ${value.min}€`;
      } else if (value.max) {
        criteriaOperator = 'inferieur';
        criteriaValue = parseFloat(value.max);
        displayValue = `≤ ${value.max}€`;
      }
      
      label = 'Montant';
      
    } else if (typeof value === 'object' && 'value' in value && 'operator' in value) {
      // Champs texte avec opérateur
      if (!value.value) {
        onCriteriaChange({
          id: `dates_${field}`,
          remove: true
        });
        return;
      }
      
      criteriaOperator = value.operator;
      criteriaValue = value.value;
      displayValue = value.value;
      
      const labels = {
        titre: 'Titre',
        artisteNom: 'Artiste',
        lieuNom: 'Lieu',
        notes: 'Notes'
      };
      label = labels[field] || field;
    } else {
      return; // Ne rien faire pour les autres cas
    }
    
    // Envoyer le critère
    onCriteriaChange({
      id: `dates_${field}`,
      field: mappedField,
      operator: criteriaOperator,
      value: criteriaValue,
      label: label,
      displayValue: displayValue,
      section: 'dates'
    });
  };

  const handleSelectAll = () => {
    const allValues = niveaux.map(opt => opt.value);
    const currentValues = formData.niveau;
    
    if (currentValues.length === allValues.length) {
      // Tout désélectionner
      setFormData(prev => ({ ...prev, niveau: [] }));
      onCriteriaChange({
        id: `dates_niveau`,
        remove: true
      });
    } else {
      // Tout sélectionner
      setFormData(prev => ({ ...prev, niveau: allValues }));
      notifyChange('niveau', allValues);
    }
  };

  return (
    <div className={styles.sectionContent}>
      <h4 className="mb-4">
        <i className="bi bi-calendar3 me-2"></i>
        Dates
      </h4>

      <Accordion defaultActiveKey="0">
        {/* Informations principales */}
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <i className="bi bi-info-circle me-2"></i>
            Informations principales
          </Accordion.Header>
          <Accordion.Body>
            <Row>
              {/* Titre */}
              <Col md={12} className="mb-4">
                <Form.Label>Titre</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Select 
                    size="sm"
                    style={{ maxWidth: '150px' }}
                    value={formData.titre.operator}
                    onChange={(e) => handleFieldChange('titre', formData.titre.value, null, e.target.value)}
                  >
                    {operators.map(op => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </Form.Select>
                  <Form.Control 
                    type="text"
                    value={formData.titre.value}
                    onChange={(e) => handleFieldChange('titre', e.target.value)}
                    placeholder="Rechercher dans le titre..."
                  />
                </div>
              </Col>

              {/* Niveau */}
              <Col md={12} className="mb-4">
                <Form.Label className="fw-bold">Niveau de la date</Form.Label>
                <Form.Text className="d-block mb-3 text-muted">
                  Filtre : parmi les niveaux sélectionnés
                </Form.Text>

                {/* Sélectionner tout */}
                <div className="mb-3">
                  <Form.Check 
                    type="checkbox"
                    id="select-all-niveau"
                    label={<strong>Tout sélectionner</strong>}
                    checked={formData.niveau.length === niveaux.length}
                    onChange={handleSelectAll}
                  />
                </div>

                <Row>
                  {niveaux.map(niveau => (
                    <Col md={3} key={niveau.value} className="mb-2">
                      <Form.Check 
                        type="checkbox"
                        id={`niveau-${niveau.value}`}
                        label={niveau.label}
                        checked={formData.niveau.includes(niveau.value)}
                        onChange={() => handleMultiSelect('niveau', niveau.value)}
                      />
                    </Col>
                  ))}
                </Row>
              </Col>


              {/* Plage de dates */}
              <Col md={12} className="mb-4">
                <Form.Label>Période</Form.Label>
                <Row>
                  <Col md={6}>
                    <InputGroup>
                      <InputGroup.Text>Du</InputGroup.Text>
                      <Form.Control
                        type="date"
                        value={formData.dateDebut.from}
                        onChange={(e) => handleFieldChange('dateDebut', e.target.value, 'from')}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={6}>
                    <InputGroup>
                      <InputGroup.Text>Au</InputGroup.Text>
                      <Form.Control
                        type="date"
                        value={formData.dateDebut.to}
                        onChange={(e) => handleFieldChange('dateDebut', e.target.value, 'to')}
                      />
                    </InputGroup>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>

        {/* Relations */}
        <Accordion.Item eventKey="1">
          <Accordion.Header>
            <i className="bi bi-link-45deg me-2"></i>
            Relations
          </Accordion.Header>
          <Accordion.Body>
            <Row>
              {/* Artiste */}
              <Col md={12} className="mb-4">
                <Form.Label>Artiste</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Select 
                    size="sm"
                    style={{ maxWidth: '150px' }}
                    value={formData.artisteNom.operator}
                    onChange={(e) => handleFieldChange('artisteNom', formData.artisteNom.value, null, e.target.value)}
                  >
                    {operators.map(op => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </Form.Select>
                  <Form.Control 
                    type="text"
                    value={formData.artisteNom.value}
                    onChange={(e) => handleFieldChange('artisteNom', e.target.value)}
                    placeholder="Nom de l'artiste..."
                  />
                </div>
              </Col>

              {/* Lieu */}
              <Col md={12} className="mb-4">
                <Form.Label>Lieu</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Select 
                    size="sm"
                    style={{ maxWidth: '150px' }}
                    value={formData.lieuNom.operator}
                    onChange={(e) => handleFieldChange('lieuNom', formData.lieuNom.value, null, e.target.value)}
                  >
                    {operators.map(op => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </Form.Select>
                  <Form.Control 
                    type="text"
                    value={formData.lieuNom.value}
                    onChange={(e) => handleFieldChange('lieuNom', e.target.value)}
                    placeholder="Nom du lieu..."
                  />
                </div>
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>

        {/* Informations financières */}
        <Accordion.Item eventKey="2">
          <Accordion.Header>
            <i className="bi bi-currency-euro me-2"></i>
            Informations financières
          </Accordion.Header>
          <Accordion.Body>
            <Row>
              {/* Montant */}
              <Col md={12} className="mb-4">
                <Form.Label>Montant</Form.Label>
                <InputGroup>
                  <InputGroup.Text>Entre</InputGroup.Text>
                  <Form.Control
                    type="number"
                    value={formData.montant.min}
                    onChange={(e) => handleFieldChange('montant', e.target.value, 'min')}
                    placeholder="Min"
                    min="0"
                    step="0.01"
                  />
                  <InputGroup.Text>et</InputGroup.Text>
                  <Form.Control
                    type="number"
                    value={formData.montant.max}
                    onChange={(e) => handleFieldChange('montant', e.target.value, 'max')}
                    placeholder="Max"
                    min="0"
                    step="0.01"
                  />
                  <InputGroup.Text>€</InputGroup.Text>
                </InputGroup>
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>

        {/* Notes */}
        <Accordion.Item eventKey="3">
          <Accordion.Header>
            <i className="bi bi-sticky me-2"></i>
            Notes
          </Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col md={12}>
                <Form.Label>Notes</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Select 
                    size="sm"
                    style={{ maxWidth: '150px' }}
                    value={formData.notes.operator}
                    onChange={(e) => handleFieldChange('notes', formData.notes.value, null, e.target.value)}
                  >
                    {operators.map(op => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </Form.Select>
                  <Form.Control 
                    type="text"
                    value={formData.notes.value}
                    onChange={(e) => handleFieldChange('notes', e.target.value)}
                    placeholder="Rechercher dans les notes..."
                  />
                </div>
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default DatesSection;