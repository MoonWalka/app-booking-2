import React, { useState } from 'react';
import { Form, Row, Col, Card, Table, Button, InputGroup } from 'react-bootstrap';
import styles from './Sections.module.css';

/**
 * Section Mes sélections pour la recherche multi-critères
 */
const MesSelectionsSection = ({ onCriteriaChange }) => {
  const [formData, setFormData] = useState({
    type: 'tous',
    selection: '',
    nombre: ''
  });

  // Données factices pour la démonstration
  const [selections] = useState([
    {
      id: 1,
      collaborateur: 'Jean Dupont',
      verrouille: true,
      selection: 'Festivals Jazz 2024',
      nb: 45,
      dateCreation: '15/01/2024',
      dateModification: '20/01/2024'
    },
    {
      id: 2,
      collaborateur: 'Marie Martin',
      verrouille: false,
      selection: 'Salles Paris',
      nb: 23,
      dateCreation: '10/01/2024',
      dateModification: '18/01/2024'
    },
    {
      id: 3,
      collaborateur: 'Pierre Durand',
      verrouille: false,
      selection: 'Artistes émergents',
      nb: 67,
      dateCreation: '05/01/2024',
      dateModification: '22/01/2024'
    }
  ]);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleActualiser = () => {
    // Logique pour actualiser les sélections
    console.log('Actualisation avec:', formData);
    
    // Notifier le parent
    if (formData.selection || formData.nombre) {
      const criteria = [];
      
      if (formData.type !== 'tous') {
        criteria.push({
          id: `type_${Date.now()}`,
          field: 'Type',
          operator: '=',
          value: formData.type === 'structures_independants' ? 'Structures & indépendants' :
                 formData.type === 'structures' ? 'Structures' : 'Personnes'
        });
      }
      
      if (formData.selection) {
        criteria.push({
          id: `selection_${Date.now()}`,
          field: 'Sélection',
          operator: 'contient',
          value: formData.selection
        });
      }
      
      if (formData.nombre) {
        criteria.push({
          id: `nombre_${Date.now()}`,
          field: 'Nombre',
          operator: '>=',
          value: formData.nombre
        });
      }
      
      criteria.forEach(criterion => onCriteriaChange(criterion));
    }
  };

  return (
    <div className={styles.sectionContent}>
      <h4 className="mb-4">
        <i className="bi bi-bookmark-star me-2"></i>
        Mes sélections
      </h4>

      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-filter me-2"></i>
            Filtres et recherche
          </h5>
        </Card.Header>
        <Card.Body>
          <Row className="mb-4">
            {/* Type */}
            <Col md={4}>
              <Form.Label>Type</Form.Label>
              <Form.Select
                value={formData.type}
                onChange={(e) => handleFieldChange('type', e.target.value)}
              >
                <option value="tous">Tous</option>
                <option value="structures_independants">Structures & indépendants</option>
                <option value="structures">Structures</option>
                <option value="personnes">Personnes</option>
              </Form.Select>
            </Col>

            {/* Mes sélections */}
            <Col md={4}>
              <Form.Label>Mes sélections</Form.Label>
              <Form.Control
                type="text"
                value={formData.selection}
                onChange={(e) => handleFieldChange('selection', e.target.value)}
                placeholder="Rechercher une sélection..."
              />
            </Col>

            {/* Nombre et bouton actualiser */}
            <Col md={4}>
              <Form.Label>Nombre minimum</Form.Label>
              <InputGroup>
                <Form.Control
                  type="number"
                  value={formData.nombre}
                  onChange={(e) => handleFieldChange('nombre', e.target.value)}
                  placeholder="Ex: 10"
                  min="0"
                />
                <Button 
                  variant="primary"
                  onClick={handleActualiser}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Actualiser
                </Button>
              </InputGroup>
            </Col>
          </Row>

          {/* Tableau des sélections */}
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead>
                <tr>
                  <th>Collaborateur</th>
                  <th className="text-center">Verrouiller</th>
                  <th>Sélection</th>
                  <th className="text-center">nb</th>
                  <th>Date de création</th>
                  <th>Date de modification</th>
                </tr>
              </thead>
              <tbody>
                {selections.map(selection => (
                  <tr key={selection.id}>
                    <td>
                      <i className="bi bi-person-circle me-2 text-muted"></i>
                      {selection.collaborateur}
                    </td>
                    <td className="text-center">
                      {selection.verrouille ? (
                        <i className="bi bi-lock-fill text-warning" title="Verrouillé"></i>
                      ) : (
                        <i className="bi bi-unlock text-muted" title="Non verrouillé"></i>
                      )}
                    </td>
                    <td>
                      <span className="fw-medium">{selection.selection}</span>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-primary">{selection.nb}</span>
                    </td>
                    <td>
                      <small className="text-muted">{selection.dateCreation}</small>
                    </td>
                    <td>
                      <small className="text-muted">{selection.dateModification}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Message d'information */}
          <div className="alert alert-info mt-3 mb-0">
            <i className="bi bi-info-circle me-2"></i>
            <small>
              Les sélections affichées sont celles partagées par votre équipe. 
              Cliquez sur "Actualiser" pour filtrer les résultats.
            </small>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default MesSelectionsSection;