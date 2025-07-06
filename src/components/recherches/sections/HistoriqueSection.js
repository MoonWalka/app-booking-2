import React, { useState } from 'react';
import { Form, Row, Col, Card } from 'react-bootstrap';
import styles from './Sections.module.css';

/**
 * Section Historique pour la recherche multi-critères
 */
const HistoriqueSection = ({ onCriteriaChange }) => {
  const [formData, setFormData] = useState({
    // Bloc Dossiers de suivi
    dossierTitre: { value: '', operator: 'contient' },
    
    // Bloc Notes de suivi
    noteContenu: { value: '', operator: 'contient' },
    noteDateDebut: '',
    noteDateFin: '',
    noteCollaborateur: 'tous',
    noteFanzineBarreaux: false,
    
    // Bloc Historique (suivi de tâches)
    tacheObjet: { value: '', operator: 'contient' },
    tacheAttribueA: [],
    tacheStatuts: {
      aFaire: false,
      enCours: false,
      fait: false
    },
    tacheTags: [],
    tacheCorps: { value: '', operator: 'contient' },
    tacheDateDebut: '',
    tacheDateFin: ''
  });

  const operators = [
    { value: 'contient', label: 'Contient' },
    { value: 'egal', label: 'Égal à' },
    { value: 'commence', label: 'Commence par' },
    { value: 'termine', label: 'Se termine par' },
    { value: 'different', label: 'Différent de' }
  ];

  const collaborateurs = [
    { id: 'tous', label: 'Tous' },
    { id: 'thierry', label: 'Thierry Lenc' },
    { id: 'marie', label: 'Marie Dupont' },
    { id: 'jean', label: 'Jean Martin' }
  ];

  const tags = [
    { id: 'urgent', label: 'Urgent' },
    { id: 'important', label: 'Important' },
    { id: 'rappel', label: 'Rappel' },
    { id: 'rdv', label: 'RDV' },
    { id: 'relance', label: 'Relance' },
    { id: 'projet', label: 'Projet' }
  ];

  const handleFieldChange = (field, value, operator = null) => {
    const newData = { ...formData };
    
    if (field.includes('.')) {
      // Pour les champs imbriqués comme tacheStatuts.aFaire
      const [parent, child] = field.split('.');
      newData[parent] = { ...newData[parent], [child]: value };
    } else if (operator !== null) {
      newData[field] = { ...newData[field], operator };
    } else if (typeof newData[field] === 'object' && 'value' in newData[field]) {
      newData[field] = { ...newData[field], value };
    } else {
      newData[field] = value;
    }
    
    setFormData(newData);
    
    // Notifier le parent du changement
    if (value || (typeof value === 'boolean' && value === true)) {
      const criteriaId = `${field}_${Date.now()}`;
      onCriteriaChange({
        id: criteriaId,
        field: field.replace('.', '_'),
        operator: operator || newData[field]?.operator || '=',
        value: typeof newData[field] === 'object' ? newData[field].value : value
      });
    }
  };

  return (
    <div className={styles.sectionContent}>
      <h4 className="mb-4">
        <i className="bi bi-clock-history me-2"></i>
        Historique
      </h4>

      {/* Bloc Dossiers de suivi */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-folder me-2"></i>
            Dossiers de suivi
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={12}>
              <Form.Label>Titre</Form.Label>
              <div className="d-flex gap-2">
                <Form.Select 
                  size="sm"
                  style={{ maxWidth: '150px' }}
                  value={formData.dossierTitre.operator}
                  onChange={(e) => handleFieldChange('dossierTitre', formData.dossierTitre.value, e.target.value)}
                >
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </Form.Select>
                <Form.Control 
                  type="text"
                  value={formData.dossierTitre.value}
                  onChange={(e) => handleFieldChange('dossierTitre', e.target.value)}
                  placeholder="Rechercher dans les titres de dossiers"
                />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Bloc Notes de suivi */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-journal-text me-2"></i>
            Notes de suivi
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            {/* Contenu */}
            <Col md={12} className="mb-3">
              <Form.Label>Contenu</Form.Label>
              <div className="d-flex gap-2">
                <Form.Select 
                  size="sm"
                  style={{ maxWidth: '150px' }}
                  value={formData.noteContenu.operator}
                  onChange={(e) => handleFieldChange('noteContenu', formData.noteContenu.value, e.target.value)}
                >
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </Form.Select>
                <Form.Control 
                  type="text"
                  value={formData.noteContenu.value}
                  onChange={(e) => handleFieldChange('noteContenu', e.target.value)}
                  placeholder="Rechercher dans les notes"
                />
              </div>
            </Col>

            {/* Date */}
            <Col md={6} className="mb-3">
              <Form.Label>Date</Form.Label>
              <div className="d-flex gap-2 align-items-center">
                <Form.Control 
                  type="date"
                  value={formData.noteDateDebut}
                  onChange={(e) => handleFieldChange('noteDateDebut', e.target.value)}
                />
                <span>à</span>
                <Form.Control 
                  type="date"
                  value={formData.noteDateFin}
                  onChange={(e) => handleFieldChange('noteDateFin', e.target.value)}
                />
              </div>
            </Col>

            {/* Collaborateur */}
            <Col md={6} className="mb-3">
              <Form.Label>Collaborateur</Form.Label>
              <Form.Select
                value={formData.noteCollaborateur}
                onChange={(e) => handleFieldChange('noteCollaborateur', e.target.value)}
              >
                {collaborateurs.map(collab => (
                  <option key={collab.id} value={collab.id}>{collab.label}</option>
                ))}
              </Form.Select>
            </Col>

            {/* Fanzine barreaux */}
            <Col md={12}>
              <Form.Check 
                type="checkbox"
                label="Fanzine barreaux"
                checked={formData.noteFanzineBarreaux}
                onChange={(e) => handleFieldChange('noteFanzineBarreaux', e.target.checked)}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Bloc Historique (suivi de tâches) */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-list-task me-2"></i>
            Historique (suivi de tâches)
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            {/* Objet */}
            <Col md={12} className="mb-3">
              <Form.Label>Objet</Form.Label>
              <div className="d-flex gap-2">
                <Form.Select 
                  size="sm"
                  style={{ maxWidth: '150px' }}
                  value={formData.tacheObjet.operator}
                  onChange={(e) => handleFieldChange('tacheObjet', formData.tacheObjet.value, e.target.value)}
                >
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </Form.Select>
                <Form.Control 
                  type="text"
                  value={formData.tacheObjet.value}
                  onChange={(e) => handleFieldChange('tacheObjet', e.target.value)}
                  placeholder="Objet de la tâche"
                />
              </div>
            </Col>

            {/* Attribué à */}
            <Col md={6} className="mb-3">
              <Form.Label>Attribué à</Form.Label>
              <Form.Select
                multiple
                value={formData.tacheAttribueA}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  handleFieldChange('tacheAttribueA', selected);
                }}
                style={{ height: '80px' }}
              >
                {collaborateurs.filter(c => c.id !== 'tous').map(collab => (
                  <option key={collab.id} value={collab.id}>{collab.label}</option>
                ))}
              </Form.Select>
              <small className="text-muted">Maintenez Ctrl pour sélectionner plusieurs</small>
            </Col>

            {/* Statut */}
            <Col md={6} className="mb-3">
              <Form.Label>Statut</Form.Label>
              <div>
                <Form.Check 
                  type="checkbox"
                  label="À faire"
                  checked={formData.tacheStatuts.aFaire}
                  onChange={(e) => handleFieldChange('tacheStatuts.aFaire', e.target.checked)}
                />
                <Form.Check 
                  type="checkbox"
                  label="En cours"
                  checked={formData.tacheStatuts.enCours}
                  onChange={(e) => handleFieldChange('tacheStatuts.enCours', e.target.checked)}
                />
                <Form.Check 
                  type="checkbox"
                  label="Fait"
                  checked={formData.tacheStatuts.fait}
                  onChange={(e) => handleFieldChange('tacheStatuts.fait', e.target.checked)}
                />
              </div>
            </Col>

            {/* Tags */}
            <Col md={12} className="mb-3">
              <Form.Label>Tags</Form.Label>
              <Form.Select
                multiple
                value={formData.tacheTags}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  handleFieldChange('tacheTags', selected);
                }}
                style={{ height: '100px' }}
              >
                {tags.map(tag => (
                  <option key={tag.id} value={tag.id}>{tag.label}</option>
                ))}
              </Form.Select>
              <small className="text-muted">Maintenez Ctrl pour sélectionner plusieurs tags</small>
            </Col>

            {/* Corps */}
            <Col md={12} className="mb-3">
              <Form.Label>Corps</Form.Label>
              <div className="d-flex gap-2">
                <Form.Select 
                  size="sm"
                  style={{ maxWidth: '150px' }}
                  value={formData.tacheCorps.operator}
                  onChange={(e) => handleFieldChange('tacheCorps', formData.tacheCorps.value, e.target.value)}
                >
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </Form.Select>
                <Form.Control 
                  as="textarea"
                  rows={2}
                  value={formData.tacheCorps.value}
                  onChange={(e) => handleFieldChange('tacheCorps', e.target.value)}
                  placeholder="Rechercher dans le corps des tâches"
                />
              </div>
            </Col>

            {/* Date */}
            <Col md={12}>
              <Form.Label>Date</Form.Label>
              <div className="d-flex gap-2 align-items-center">
                <Form.Control 
                  type="date"
                  value={formData.tacheDateDebut}
                  onChange={(e) => handleFieldChange('tacheDateDebut', e.target.value)}
                />
                <span>à</span>
                <Form.Control 
                  type="date"
                  value={formData.tacheDateFin}
                  onChange={(e) => handleFieldChange('tacheDateFin', e.target.value)}
                />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default HistoriqueSection;