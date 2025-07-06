import React, { useState } from 'react';
import { Form, Row, Col, Card } from 'react-bootstrap';
import styles from './Sections.module.css';

/**
 * Section Identification pour la recherche multi-critères
 */
const IdentificationSection = ({ onCriteriaChange }) => {
  const [formData, setFormData] = useState({
    // Bloc Contact
    nom: { value: '', operator: 'contient' },
    codeClient: { value: '', operator: 'contient' },
    email: { value: '', operator: 'contient' },
    telephone: { value: '', operator: 'contient' },
    estActive: 'indifferent',
    estClient: 'indifferent',
    source: { value: '', operator: 'contient' },
    dateModificationDebut: '',
    dateModificationFin: '',
    dateCreationDebut: '',
    dateCreationFin: '',
    creePar: { value: '', operator: 'egal' },
    modifiePar: { value: '', operator: 'egal' },
    
    // Bloc Commentaires
    commentaireContenu: { value: '', operator: 'contient' },
    commentaireDateDebut: '',
    commentaireDateFin: '',
    commentaireCollaborateurs: [],
    fanzineBarreaux: false
  });

  const operators = [
    { value: 'contient', label: 'Contient' },
    { value: 'egal', label: 'Égal à' },
    { value: 'commence', label: 'Commence par' },
    { value: 'termine', label: 'Se termine par' },
    { value: 'different', label: 'Différent de' }
  ];

  const collaborateurs = [
    { id: 'all', label: 'Tous' },
    { id: 'thierry', label: 'Thierry Lenc' },
    { id: 'marie', label: 'Marie Dupont' },
    { id: 'jean', label: 'Jean Martin' }
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
    
    // Notifier le parent du changement
    if (value || (typeof value === 'boolean' && value === true)) {
      const criteriaId = `${field}_${Date.now()}`;
      onCriteriaChange({
        id: criteriaId,
        field: field,
        operator: operator || newData[field]?.operator || '=',
        value: typeof newData[field] === 'object' ? newData[field].value : value
      });
    }
  };

  return (
    <div className={styles.sectionContent}>
      <h4 className="mb-4">
        <i className="bi bi-person-badge me-2"></i>
        Identification
      </h4>

      {/* Bloc Contact */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-person me-2"></i>
            Contact
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            {/* Nom */}
            <Col md={6} className="mb-3">
              <Form.Label>Nom</Form.Label>
              <div className="d-flex gap-2">
                <Form.Select 
                  size="sm"
                  style={{ maxWidth: '150px' }}
                  value={formData.nom.operator}
                  onChange={(e) => handleFieldChange('nom', formData.nom.value, e.target.value)}
                >
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </Form.Select>
                <Form.Control 
                  type="text"
                  value={formData.nom.value}
                  onChange={(e) => handleFieldChange('nom', e.target.value)}
                  placeholder="Entrez un nom"
                />
              </div>
            </Col>

            {/* Code client */}
            <Col md={6} className="mb-3">
              <Form.Label>Code client</Form.Label>
              <div className="d-flex gap-2">
                <Form.Select 
                  size="sm"
                  style={{ maxWidth: '150px' }}
                  value={formData.codeClient.operator}
                  onChange={(e) => handleFieldChange('codeClient', formData.codeClient.value, e.target.value)}
                >
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </Form.Select>
                <Form.Control 
                  type="text"
                  value={formData.codeClient.value}
                  onChange={(e) => handleFieldChange('codeClient', e.target.value)}
                  placeholder="Code client"
                />
              </div>
            </Col>

            {/* Email */}
            <Col md={6} className="mb-3">
              <Form.Label>E-mail</Form.Label>
              <div className="d-flex gap-2">
                <Form.Select 
                  size="sm"
                  style={{ maxWidth: '150px' }}
                  value={formData.email.operator}
                  onChange={(e) => handleFieldChange('email', formData.email.value, e.target.value)}
                >
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </Form.Select>
                <Form.Control 
                  type="email"
                  value={formData.email.value}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  placeholder="email@exemple.com"
                />
              </div>
            </Col>

            {/* Téléphone */}
            <Col md={6} className="mb-3">
              <Form.Label>Tél.</Form.Label>
              <div className="d-flex gap-2">
                <Form.Select 
                  size="sm"
                  style={{ maxWidth: '150px' }}
                  value={formData.telephone.operator}
                  onChange={(e) => handleFieldChange('telephone', formData.telephone.value, e.target.value)}
                >
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </Form.Select>
                <Form.Control 
                  type="tel"
                  value={formData.telephone.value}
                  onChange={(e) => handleFieldChange('telephone', e.target.value)}
                  placeholder="Numéro de téléphone"
                />
              </div>
            </Col>

            {/* Est active */}
            <Col md={6} className="mb-3">
              <Form.Label>Est active</Form.Label>
              <div>
                <Form.Check 
                  type="radio"
                  inline
                  label="Oui"
                  name="estActive"
                  value="oui"
                  checked={formData.estActive === 'oui'}
                  onChange={(e) => handleFieldChange('estActive', e.target.value)}
                />
                <Form.Check 
                  type="radio"
                  inline
                  label="Non"
                  name="estActive"
                  value="non"
                  checked={formData.estActive === 'non'}
                  onChange={(e) => handleFieldChange('estActive', e.target.value)}
                />
                <Form.Check 
                  type="radio"
                  inline
                  label="Indifférent"
                  name="estActive"
                  value="indifferent"
                  checked={formData.estActive === 'indifferent'}
                  onChange={(e) => handleFieldChange('estActive', e.target.value)}
                />
              </div>
            </Col>

            {/* Est client */}
            <Col md={6} className="mb-3">
              <Form.Label>Est client</Form.Label>
              <div>
                <Form.Check 
                  type="radio"
                  inline
                  label="Oui"
                  name="estClient"
                  value="oui"
                  checked={formData.estClient === 'oui'}
                  onChange={(e) => handleFieldChange('estClient', e.target.value)}
                />
                <Form.Check 
                  type="radio"
                  inline
                  label="Non"
                  name="estClient"
                  value="non"
                  checked={formData.estClient === 'non'}
                  onChange={(e) => handleFieldChange('estClient', e.target.value)}
                />
                <Form.Check 
                  type="radio"
                  inline
                  label="Indifférent"
                  name="estClient"
                  value="indifferent"
                  checked={formData.estClient === 'indifferent'}
                  onChange={(e) => handleFieldChange('estClient', e.target.value)}
                />
              </div>
            </Col>

            {/* Source */}
            <Col md={6} className="mb-3">
              <Form.Label>Source</Form.Label>
              <div className="d-flex gap-2">
                <Form.Select 
                  size="sm"
                  style={{ maxWidth: '150px' }}
                  value={formData.source.operator}
                  onChange={(e) => handleFieldChange('source', formData.source.value, e.target.value)}
                >
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </Form.Select>
                <Form.Control 
                  type="text"
                  value={formData.source.value}
                  onChange={(e) => handleFieldChange('source', e.target.value)}
                  placeholder="Source du contact"
                />
              </div>
            </Col>

            {/* Date de modification */}
            <Col md={6} className="mb-3">
              <Form.Label>Modification</Form.Label>
              <div className="d-flex gap-2 align-items-center">
                <Form.Control 
                  type="date"
                  value={formData.dateModificationDebut}
                  onChange={(e) => handleFieldChange('dateModificationDebut', e.target.value)}
                />
                <span>à</span>
                <Form.Control 
                  type="date"
                  value={formData.dateModificationFin}
                  onChange={(e) => handleFieldChange('dateModificationFin', e.target.value)}
                />
              </div>
            </Col>

            {/* Date de création */}
            <Col md={6} className="mb-3">
              <Form.Label>Création</Form.Label>
              <div className="d-flex gap-2 align-items-center">
                <Form.Control 
                  type="date"
                  value={formData.dateCreationDebut}
                  onChange={(e) => handleFieldChange('dateCreationDebut', e.target.value)}
                />
                <span>à</span>
                <Form.Control 
                  type="date"
                  value={formData.dateCreationFin}
                  onChange={(e) => handleFieldChange('dateCreationFin', e.target.value)}
                />
              </div>
            </Col>

            {/* Créé par */}
            <Col md={6} className="mb-3">
              <Form.Label>Créé par</Form.Label>
              <div className="d-flex gap-2">
                <Form.Select 
                  size="sm"
                  style={{ maxWidth: '150px' }}
                  value={formData.creePar.operator}
                  onChange={(e) => handleFieldChange('creePar', formData.creePar.value, e.target.value)}
                >
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </Form.Select>
                <Form.Control 
                  type="text"
                  value={formData.creePar.value}
                  onChange={(e) => handleFieldChange('creePar', e.target.value)}
                  placeholder="Nom de l'utilisateur"
                />
              </div>
            </Col>

            {/* Modifié par */}
            <Col md={6} className="mb-3">
              <Form.Label>Modifié par</Form.Label>
              <div className="d-flex gap-2">
                <Form.Select 
                  size="sm"
                  style={{ maxWidth: '150px' }}
                  value={formData.modifiePar.operator}
                  onChange={(e) => handleFieldChange('modifiePar', formData.modifiePar.value, e.target.value)}
                >
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </Form.Select>
                <Form.Control 
                  type="text"
                  value={formData.modifiePar.value}
                  onChange={(e) => handleFieldChange('modifiePar', e.target.value)}
                  placeholder="Nom de l'utilisateur"
                />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Bloc Commentaires */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-chat-text me-2"></i>
            Commentaires
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
                  value={formData.commentaireContenu.operator}
                  onChange={(e) => handleFieldChange('commentaireContenu', formData.commentaireContenu.value, e.target.value)}
                >
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </Form.Select>
                <Form.Control 
                  type="text"
                  value={formData.commentaireContenu.value}
                  onChange={(e) => handleFieldChange('commentaireContenu', e.target.value)}
                  placeholder="Rechercher dans les commentaires"
                />
              </div>
            </Col>

            {/* Date commentaire */}
            <Col md={6} className="mb-3">
              <Form.Label>Date</Form.Label>
              <div className="d-flex gap-2 align-items-center">
                <Form.Control 
                  type="date"
                  value={formData.commentaireDateDebut}
                  onChange={(e) => handleFieldChange('commentaireDateDebut', e.target.value)}
                />
                <span>à</span>
                <Form.Control 
                  type="date"
                  value={formData.commentaireDateFin}
                  onChange={(e) => handleFieldChange('commentaireDateFin', e.target.value)}
                />
              </div>
            </Col>

            {/* Collaborateur */}
            <Col md={6} className="mb-3">
              <Form.Label>Collaborateur</Form.Label>
              <Form.Select
                multiple
                value={formData.commentaireCollaborateurs}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  handleFieldChange('commentaireCollaborateurs', selected);
                }}
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
                checked={formData.fanzineBarreaux}
                onChange={(e) => handleFieldChange('fanzineBarreaux', e.target.checked)}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default IdentificationSection;