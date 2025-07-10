import React, { useState } from 'react';
import { Form, Row, Col, Card, Accordion } from 'react-bootstrap';
import styles from './Sections.module.css';

/**
 * Section Infos artiste pour la recherche multi-critères
 */
const InfosArtisteSection = ({ onCriteriaChange }) => {
  const [formData, setFormData] = useState({
    // Informations générales
    nom: { value: '', operator: 'contient' },
    formations: { value: '', operator: 'contient' },
    anneeCreation: { value: '', operator: 'egal' },
    manager: 'indifferent',
    structureGestion: { value: '', operator: 'contient' },
    lieuRepetition: { value: '', operator: 'contient' },
    
    // Disque
    label: { value: '', operator: 'contient' },
    editeurPhono: { value: '', operator: 'contient' },
    environnementDisque: { value: '', operator: 'contient' },
    supportAudio: { value: '', operator: 'contient' },
    discographie: { value: '', operator: 'contient' },
    nombreDates: { value: '', operator: 'superieur' },
    
    // Scène
    environnementScene: { value: '', operator: 'contient' },
    referencesScene: { value: '', operator: 'contient' },
    tourneur: 'indifferent',
    
    // Image / Média
    attachePresse: { value: '', operator: 'contient' },
    supportVideo: { value: '', operator: 'contient' },
    webmaster: { value: '', operator: 'contient' },
    environnementMedia: { value: '', operator: 'contient' },
    referencesMedia: { value: '', operator: 'contient' }
  });

  const operators = [
    { value: 'contient', label: 'Contient' },
    { value: 'egal', label: 'Égal à' },
    { value: 'commence', label: 'Commence par' },
    { value: 'termine', label: 'Se termine par' },
    { value: 'different', label: 'Différent de' },
    { value: 'superieur', label: 'Supérieur à' },
    { value: 'inferieur', label: 'Inférieur à' }
  ];

  const handleFieldChange = (field, value, operator = null) => {
    const newData = { ...formData };
    
    if (operator !== null) {
      newData[field] = { ...newData[field], operator };
    } else if (typeof newData[field] === 'object' && 'value' in newData[field]) {
      newData[field] = { ...newData[field], value };
    } else {
      newData[field] = value;
    }
    
    setFormData(newData);
    
    // Notifier le parent
    if (value) {
      const displayField = getDisplayFieldName(field);
      const displayValue = typeof newData[field] === 'object' ? newData[field].value : value;
      const displayOperator = typeof newData[field] === 'object' ? newData[field].operator : '=';
      
      onCriteriaChange({
        id: `${field}_${Date.now()}`,
        field: displayField,
        operator: displayOperator,
        value: displayValue
      });
    }
  };

  const getDisplayFieldName = (field) => {
    const fieldMap = {
      nom: 'Nom artiste',
      formations: 'Formations/Projets',
      anneeCreation: 'Année de création',
      manager: 'Manager',
      structureGestion: 'Structure de gestion',
      lieuRepetition: 'Lieu de répétition',
      label: 'Label',
      editeurPhono: 'Éditeur phonographique',
      environnementDisque: 'Environnement disque',
      supportAudio: 'Support audio',
      discographie: 'Discographie',
      nombreDates: 'Nombre de dates (12 mois)',
      environnementScene: 'Environnement scène',
      referencesScene: 'Références scène',
      tourneur: 'Tourneur/Booker',
      attachePresse: 'Attaché·e de presse',
      supportVideo: 'Support vidéo',
      webmaster: 'Webmaster',
      environnementMedia: 'Environnement média',
      referencesMedia: 'Références média'
    };
    return fieldMap[field] || field;
  };

  const renderTextField = (field, label, placeholder = '') => {
    return (
      <Col md={6} className="mb-3">
        <Form.Label>{label}</Form.Label>
        <div className="d-flex gap-2">
          <Form.Select 
            size="sm"
            style={{ maxWidth: '150px' }}
            value={formData[field].operator}
            onChange={(e) => handleFieldChange(field, formData[field].value, e.target.value)}
          >
            {operators.map(op => (
              <option key={op.value} value={op.value}>{op.label}</option>
            ))}
          </Form.Select>
          <Form.Control 
            type="text"
            value={formData[field].value}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            placeholder={placeholder}
          />
        </div>
      </Col>
    );
  };

  return (
    <div className={styles.sectionContent}>
      <h4 className="mb-4">
        <i className="bi bi-music-note-beamed me-2"></i>
        Infos artiste
      </h4>

      <Accordion defaultActiveKey="0">
        {/* Informations générales */}
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <i className="bi bi-info-circle me-2"></i>
            Informations générales
          </Accordion.Header>
          <Accordion.Body>
            <Row>
              {renderTextField('nom', 'Nom', 'Nom de l\'artiste ou du groupe')}
              {renderTextField('formations', 'Formations / Projets', 'Ex: Trio, Quartet...')}
              
              <Col md={6} className="mb-3">
                <Form.Label>Année de création</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Select 
                    size="sm"
                    style={{ maxWidth: '150px' }}
                    value={formData.anneeCreation.operator}
                    onChange={(e) => handleFieldChange('anneeCreation', formData.anneeCreation.value, e.target.value)}
                  >
                    <option value="egal">Égal à</option>
                    <option value="superieur">Après</option>
                    <option value="inferieur">Avant</option>
                  </Form.Select>
                  <Form.Control 
                    type="number"
                    value={formData.anneeCreation.value}
                    onChange={(e) => handleFieldChange('anneeCreation', e.target.value)}
                    placeholder="Ex: 2020"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </Col>
              
              <Col md={6} className="mb-3">
                <Form.Label>Manager</Form.Label>
                <Form.Select
                  value={formData.manager}
                  onChange={(e) => handleFieldChange('manager', e.target.value)}
                >
                  <option value="indifferent">Indifférent</option>
                  <option value="oui">Oui</option>
                  <option value="non">Non</option>
                </Form.Select>
              </Col>
              
              {renderTextField('structureGestion', 'Structure de gestion', 'Nom de la structure')}
              {renderTextField('lieuRepetition', 'Lieu de répétition', 'Ville, studio...')}
            </Row>
          </Accordion.Body>
        </Accordion.Item>

        {/* Disque */}
        <Accordion.Item eventKey="1">
          <Accordion.Header>
            <i className="bi bi-vinyl me-2"></i>
            Disque
          </Accordion.Header>
          <Accordion.Body>
            <Row>
              {renderTextField('label', 'Label', 'Nom du label')}
              {renderTextField('editeurPhono', 'Éditeur phonographique', 'Nom de l\'éditeur')}
              {renderTextField('environnementDisque', 'Environnement disque', 'Description')}
              {renderTextField('supportAudio', 'Support audio', 'CD, Vinyle, Digital...')}
              {renderTextField('discographie', 'Discographie', 'Albums, EPs...')}
              
              <Col md={6} className="mb-3">
                <Form.Label>Nombre de dates depuis 12 mois</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Select 
                    size="sm"
                    style={{ maxWidth: '150px' }}
                    value={formData.nombreDates.operator}
                    onChange={(e) => handleFieldChange('nombreDates', formData.nombreDates.value, e.target.value)}
                  >
                    <option value="superieur">Supérieur à</option>
                    <option value="egal">Égal à</option>
                    <option value="inferieur">Inférieur à</option>
                  </Form.Select>
                  <Form.Control 
                    type="number"
                    value={formData.nombreDates.value}
                    onChange={(e) => handleFieldChange('nombreDates', e.target.value)}
                    placeholder="Ex: 50"
                    min="0"
                  />
                </div>
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>

        {/* Scène */}
        <Accordion.Item eventKey="2">
          <Accordion.Header>
            <i className="bi bi-mic me-2"></i>
            Scène
          </Accordion.Header>
          <Accordion.Body>
            <Row>
              {renderTextField('environnementScene', 'Environnement scène', 'Description')}
              {renderTextField('referencesScene', 'Références scène', 'Salles, festivals...')}
              
              <Col md={6} className="mb-3">
                <Form.Label>Tourneur / Booker</Form.Label>
                <Form.Select
                  value={formData.tourneur}
                  onChange={(e) => handleFieldChange('tourneur', e.target.value)}
                >
                  <option value="indifferent">Indifférent</option>
                  <option value="oui">Oui</option>
                  <option value="non">Non</option>
                </Form.Select>
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>

        {/* Image / Média */}
        <Accordion.Item eventKey="3">
          <Accordion.Header>
            <i className="bi bi-camera-video me-2"></i>
            Image / Média
          </Accordion.Header>
          <Accordion.Body>
            <Row>
              {renderTextField('attachePresse', 'Attaché·e de presse', 'Nom ou agence')}
              {renderTextField('supportVideo', 'Support vidéo', 'YouTube, clips...')}
              {renderTextField('webmaster', 'Webmaster', 'Nom ou agence')}
              {renderTextField('environnementMedia', 'Environnement', 'Description')}
              {renderTextField('referencesMedia', 'Références', 'Médias, presse...')}
            </Row>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default InfosArtisteSection;