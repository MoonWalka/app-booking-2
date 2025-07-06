import React, { useState } from 'react';
import { Form, Row, Col, Card, Accordion, InputGroup } from 'react-bootstrap';
import styles from './Sections.module.css';

/**
 * Section Dates pour la recherche multi-critères
 */
const DatesSection = ({ onCriteriaChange }) => {
  const [formData, setFormData] = useState({
    // Dates et niveaux
    niveauDate: [],
    dateDebut: { from: '', to: '' },
    statut: [],
    
    // Artistes et projets
    projet: '',
    artistes: { value: '', operator: 'contient' },
    
    // Chiffre d'affaire
    montantHT: { min: '', max: '' },
    cachetSource: 'contrat',
    cachetType: 'representation',
    caGlobal: false,
    
    // Types d'événements
    typesEvenements: [],
    marqueurs: '',
    
    // Types de contrats
    typesContrats: [],
    
    // Général
    priseOption: { from: '', to: '' },
    collaborateur: { value: '', operator: 'contient' },
    filtreFanzine: false
  });

  const niveauxDate = [
    { value: 'option', label: 'Option' },
    { value: 'confirme', label: 'Confirmé' },
    { value: 'interesse', label: 'Intéressé' },
    { value: 'proposition', label: 'Proposition' }
  ];

  const statuts = [
    { value: 'incomplete', label: 'Incomplète' },
    { value: 'interet', label: 'Intérêt' },
    { value: 'option', label: 'Option' },
    { value: 'confirmee', label: 'Confirmée' },
    { value: 'annulee', label: 'Annulée' },
    { value: 'reportee', label: 'Reportée' }
  ];

  const typesEvenements = [
    { value: 'concert', label: 'Concert' },
    { value: 'conference', label: 'Conférence' },
    { value: 'atelier', label: 'Atelier' },
    { value: 'masterclass', label: 'Masterclass' },
    { value: 'showcase', label: 'Showcase' },
    { value: 'festival', label: 'Festival' },
    { value: 'residence', label: 'Résidence' },
    { value: 'rencontre', label: 'Rencontre' }
  ];

  const typesContrats = [
    { value: 'cession', label: 'Cession' },
    { value: 'corealisation', label: 'Co-réalisation' },
    { value: 'promo_locale', label: 'Promo locale' },
    { value: 'location', label: 'Location' },
    { value: 'prestation', label: 'Prestation' },
    { value: 'partenariat', label: 'Partenariat' }
  ];

  const operators = [
    { value: 'contient', label: 'Contient' },
    { value: 'egal', label: 'Égal à' },
    { value: 'commence', label: 'Commence par' },
    { value: 'termine', label: 'Se termine par' },
    { value: 'different', label: 'Différent de' }
  ];

  const handleFieldChange = (field, value, subField = null) => {
    const newData = { ...formData };
    
    if (subField) {
      newData[field] = { ...newData[field], [subField]: value };
    } else if (typeof newData[field] === 'object' && 'value' in newData[field]) {
      newData[field] = { ...newData[field], value };
    } else {
      newData[field] = value;
    }
    
    setFormData(newData);
    
    // Logique de notification selon le type de champ
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
    // Logique de notification simplifiée - à adapter selon les besoins
    if (!value || (Array.isArray(value) && value.length === 0)) return;
    
    let displayField = '';
    let displayValue = '';
    let operator = '=';
    
    switch(field) {
      case 'niveauDate':
        displayField = 'Niveau de date';
        displayValue = value.map(v => niveauxDate.find(n => n.value === v)?.label).join(', ');
        operator = 'parmi';
        break;
      case 'statut':
        displayField = 'Statut';
        displayValue = value.map(v => statuts.find(s => s.value === v)?.label).join(', ');
        operator = 'parmi';
        break;
      case 'typesEvenements':
        displayField = 'Types d\'événements';
        displayValue = value.map(v => typesEvenements.find(t => t.value === v)?.label).join(', ');
        operator = 'parmi';
        break;
      case 'typesContrats':
        displayField = 'Types de contrats';
        displayValue = value.map(v => typesContrats.find(t => t.value === v)?.label).join(', ');
        operator = 'parmi';
        break;
      case 'dateDebut':
        if (value.from && value.to) {
          displayField = 'Date début';
          displayValue = `${value.from} à ${value.to}`;
          operator = 'entre';
        }
        break;
      case 'montantHT':
        if (value.min && value.max) {
          displayField = 'Montant HT';
          displayValue = `${value.min}€ et ${value.max}€`;
          operator = 'entre';
        }
        break;
      default:
        return;
    }
    
    if (displayValue) {
      onCriteriaChange({
        id: `${field}_${Date.now()}`,
        field: displayField,
        operator: operator,
        value: displayValue
      });
    }
  };

  return (
    <div className={styles.sectionContent}>
      <h4 className="mb-4">
        <i className="bi bi-calendar3 me-2"></i>
        Dates
      </h4>

      <Accordion defaultActiveKey="0">
        {/* Dates et niveaux */}
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <i className="bi bi-calendar-check me-2"></i>
            Dates et niveaux
          </Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col md={12} className="mb-3">
                <Form.Label className="fw-bold">Niveau de la date</Form.Label>
                <Row>
                  {niveauxDate.map(niveau => (
                    <Col md={3} key={niveau.value} className="mb-2">
                      <Form.Check 
                        type="checkbox"
                        id={`niveau-${niveau.value}`}
                        label={niveau.label}
                        checked={formData.niveauDate.includes(niveau.value)}
                        onChange={() => handleMultiSelect('niveauDate', niveau.value)}
                      />
                    </Col>
                  ))}
                </Row>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Date début (période)</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="date"
                    value={formData.dateDebut.from}
                    onChange={(e) => handleFieldChange('dateDebut', e.target.value, 'from')}
                  />
                  <InputGroup.Text>à</InputGroup.Text>
                  <Form.Control
                    type="date"
                    value={formData.dateDebut.to}
                    onChange={(e) => handleFieldChange('dateDebut', e.target.value, 'to')}
                  />
                </InputGroup>
              </Col>

              <Col md={12} className="mb-3">
                <Form.Label className="fw-bold">Statut</Form.Label>
                <Row>
                  {statuts.map(statut => (
                    <Col md={4} lg={2} key={statut.value} className="mb-2">
                      <Form.Check 
                        type="checkbox"
                        id={`statut-${statut.value}`}
                        label={statut.label}
                        checked={formData.statut.includes(statut.value)}
                        onChange={() => handleMultiSelect('statut', statut.value)}
                      />
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>

        {/* Artistes et projets */}
        <Accordion.Item eventKey="1">
          <Accordion.Header>
            <i className="bi bi-people me-2"></i>
            Artistes et projets
          </Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>Projet</Form.Label>
                <Form.Select
                  value={formData.projet}
                  onChange={(e) => handleFieldChange('projet', e.target.value)}
                >
                  <option value="">-- Sélectionner un projet --</option>
                  <option value="projet1">Projet 1</option>
                  <option value="projet2">Projet 2</option>
                  <option value="projet3">Projet 3</option>
                </Form.Select>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Artistes et projets liés</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Select 
                    size="sm"
                    style={{ maxWidth: '150px' }}
                    value={formData.artistes.operator}
                    onChange={(e) => handleFieldChange('artistes', formData.artistes.value, 'operator')}
                  >
                    {operators.map(op => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </Form.Select>
                  <Form.Control 
                    type="text"
                    value={formData.artistes.value}
                    onChange={(e) => handleFieldChange('artistes', e.target.value, 'value')}
                    placeholder="Rechercher..."
                  />
                </div>
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>

        {/* Chiffre d'affaire */}
        <Accordion.Item eventKey="2">
          <Accordion.Header>
            <i className="bi bi-currency-euro me-2"></i>
            Chiffre d'affaire
          </Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>Montants HT</Form.Label>
                <InputGroup>
                  <InputGroup.Text>Entre</InputGroup.Text>
                  <Form.Control
                    type="number"
                    value={formData.montantHT.min}
                    onChange={(e) => handleFieldChange('montantHT', e.target.value, 'min')}
                    placeholder="0"
                    min="0"
                  />
                  <InputGroup.Text>et</InputGroup.Text>
                  <Form.Control
                    type="number"
                    value={formData.montantHT.max}
                    onChange={(e) => handleFieldChange('montantHT', e.target.value, 'max')}
                    placeholder="50000"
                    min="0"
                  />
                  <InputGroup.Text>€</InputGroup.Text>
                </InputGroup>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Cachet</Form.Label>
                <div className="mb-2">
                  <Form.Check
                    type="radio"
                    id="cachet-contrat"
                    name="cachetSource"
                    label="Issu du contrat"
                    value="contrat"
                    checked={formData.cachetSource === 'contrat'}
                    onChange={(e) => handleFieldChange('cachetSource', e.target.value)}
                  />
                  <Form.Check
                    type="radio"
                    id="cachet-date"
                    name="cachetSource"
                    label="Sinon de la date"
                    value="date"
                    checked={formData.cachetSource === 'date'}
                    onChange={(e) => handleFieldChange('cachetSource', e.target.value)}
                  />
                </div>
                <div>
                  <Form.Check
                    type="radio"
                    id="cachet-representation"
                    name="cachetType"
                    label="Par représentation"
                    value="representation"
                    checked={formData.cachetType === 'representation'}
                    onChange={(e) => handleFieldChange('cachetType', e.target.value)}
                  />
                  <Form.Check
                    type="radio"
                    id="cachet-date-type"
                    name="cachetType"
                    label="Par date"
                    value="date"
                    checked={formData.cachetType === 'date'}
                    onChange={(e) => handleFieldChange('cachetType', e.target.value)}
                  />
                </div>
              </Col>

              <Col md={12} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="ca-global"
                  label="Chiffre d'affaire global par organisateur"
                  checked={formData.caGlobal}
                  onChange={(e) => handleFieldChange('caGlobal', e.target.checked)}
                />
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>

        {/* Types d'événements */}
        <Accordion.Item eventKey="3">
          <Accordion.Header>
            <i className="bi bi-tags me-2"></i>
            Types d'événements
          </Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col md={12} className="mb-3">
                <Form.Label className="fw-bold">Types d'événements</Form.Label>
                <Row>
                  {typesEvenements.map(type => (
                    <Col md={4} lg={3} key={type.value} className="mb-2">
                      <Form.Check 
                        type="checkbox"
                        id={`type-event-${type.value}`}
                        label={type.label}
                        checked={formData.typesEvenements.includes(type.value)}
                        onChange={() => handleMultiSelect('typesEvenements', type.value)}
                      />
                    </Col>
                  ))}
                </Row>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Marqueurs</Form.Label>
                <Form.Select
                  value={formData.marqueurs}
                  onChange={(e) => handleFieldChange('marqueurs', e.target.value)}
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="marqueur1">Marqueur 1</option>
                  <option value="marqueur2">Marqueur 2</option>
                  <option value="marqueur3">Marqueur 3</option>
                </Form.Select>
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>

        {/* Types de contrats */}
        <Accordion.Item eventKey="4">
          <Accordion.Header>
            <i className="bi bi-file-text me-2"></i>
            Types de contrats
          </Accordion.Header>
          <Accordion.Body>
            <Row>
              {typesContrats.map(type => (
                <Col md={4} key={type.value} className="mb-2">
                  <Form.Check 
                    type="checkbox"
                    id={`type-contrat-${type.value}`}
                    label={type.label}
                    checked={formData.typesContrats.includes(type.value)}
                    onChange={() => handleMultiSelect('typesContrats', type.value)}
                  />
                </Col>
              ))}
            </Row>
          </Accordion.Body>
        </Accordion.Item>

        {/* Général */}
        <Accordion.Item eventKey="5">
          <Accordion.Header>
            <i className="bi bi-gear me-2"></i>
            Général
          </Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>Prise d'option (période)</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="date"
                    value={formData.priseOption.from}
                    onChange={(e) => handleFieldChange('priseOption', e.target.value, 'from')}
                  />
                  <InputGroup.Text>à</InputGroup.Text>
                  <Form.Control
                    type="date"
                    value={formData.priseOption.to}
                    onChange={(e) => handleFieldChange('priseOption', e.target.value, 'to')}
                  />
                </InputGroup>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Collaborateur</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Select 
                    size="sm"
                    style={{ maxWidth: '150px' }}
                    value={formData.collaborateur.operator}
                    onChange={(e) => handleFieldChange('collaborateur', formData.collaborateur.value, 'operator')}
                  >
                    {operators.map(op => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </Form.Select>
                  <Form.Control 
                    type="text"
                    value={formData.collaborateur.value}
                    onChange={(e) => handleFieldChange('collaborateur', e.target.value, 'value')}
                    placeholder="Nom du collaborateur"
                  />
                </div>
              </Col>

              <Col md={12} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="filtre-fanzine"
                  label="Filtre 'fanzine barreaux'"
                  checked={formData.filtreFanzine}
                  onChange={(e) => handleFieldChange('filtreFanzine', e.target.checked)}
                />
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default DatesSection;