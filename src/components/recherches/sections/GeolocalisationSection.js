import React, { useState } from 'react';
import { Form, Row, Col, Card, Button } from 'react-bootstrap';
import styles from './Sections.module.css';

/**
 * Section Géolocalisation pour la recherche multi-critères
 */
const GeolocalisationSection = ({ onCriteriaChange }) => {
  const [formData, setFormData] = useState({
    geolocalisationOperator: 'parmi',
    codePostal: { value: '', operator: 'commence' },
    ville: { value: '', operator: 'contient' },
    pays: { value: '', operator: 'egal' }, // Pas de valeur par défaut
    region: { value: '', operator: 'egal' },
    departement: { value: '', operator: 'egal' }
  });

  const operators = [
    { value: 'contient', label: 'Contient' },
    { value: 'egal', label: 'Égal à' },
    { value: 'commence', label: 'Commence par' },
    { value: 'termine', label: 'Se termine par' },
    { value: 'different', label: 'Différent de' }
  ];

  const pays = [
    { value: 'france', label: 'France' },
    { value: 'belgique', label: 'Belgique' },
    { value: 'suisse', label: 'Suisse' },
    { value: 'luxembourg', label: 'Luxembourg' },
    { value: 'allemagne', label: 'Allemagne' },
    { value: 'espagne', label: 'Espagne' },
    { value: 'italie', label: 'Italie' },
    { value: 'royaume-uni', label: 'Royaume-Uni' },
    { value: 'autre', label: 'Autre' }
  ];

  const regions = [
    { value: 'auvergne-rhone-alpes', label: 'Auvergne-Rhône-Alpes' },
    { value: 'bourgogne-franche-comte', label: 'Bourgogne-Franche-Comté' },
    { value: 'bretagne', label: 'Bretagne' },
    { value: 'centre-val-de-loire', label: 'Centre-Val de Loire' },
    { value: 'corse', label: 'Corse' },
    { value: 'grand-est', label: 'Grand Est' },
    { value: 'hauts-de-france', label: 'Hauts-de-France' },
    { value: 'ile-de-france', label: 'Île-de-France' },
    { value: 'normandie', label: 'Normandie' },
    { value: 'nouvelle-aquitaine', label: 'Nouvelle-Aquitaine' },
    { value: 'occitanie', label: 'Occitanie' },
    { value: 'pays-de-la-loire', label: 'Pays de la Loire' },
    { value: 'provence-alpes-cote-azur', label: "Provence-Alpes-Côte d'Azur" },
    { value: 'guadeloupe', label: 'Guadeloupe' },
    { value: 'martinique', label: 'Martinique' },
    { value: 'guyane', label: 'Guyane' },
    { value: 'la-reunion', label: 'La Réunion' },
    { value: 'mayotte', label: 'Mayotte' }
  ];

  const departements = [
    { value: '01', label: '01 - Ain' },
    { value: '02', label: '02 - Aisne' },
    { value: '03', label: '03 - Allier' },
    { value: '04', label: '04 - Alpes-de-Haute-Provence' },
    { value: '05', label: '05 - Hautes-Alpes' },
    { value: '06', label: '06 - Alpes-Maritimes' },
    { value: '07', label: '07 - Ardèche' },
    { value: '08', label: '08 - Ardennes' },
    { value: '09', label: '09 - Ariège' },
    { value: '10', label: '10 - Aube' },
    { value: '11', label: '11 - Aude' },
    { value: '12', label: '12 - Aveyron' },
    { value: '13', label: '13 - Bouches-du-Rhône' },
    { value: '14', label: '14 - Calvados' },
    { value: '15', label: '15 - Cantal' },
    { value: '16', label: '16 - Charente' },
    { value: '17', label: '17 - Charente-Maritime' },
    { value: '18', label: '18 - Cher' },
    { value: '19', label: '19 - Corrèze' },
    { value: '2A', label: '2A - Corse-du-Sud' },
    { value: '2B', label: '2B - Haute-Corse' },
    { value: '21', label: '21 - Côte-d\'Or' },
    { value: '22', label: '22 - Côtes-d\'Armor' },
    { value: '23', label: '23 - Creuse' },
    { value: '24', label: '24 - Dordogne' },
    { value: '25', label: '25 - Doubs' },
    { value: '26', label: '26 - Drôme' },
    { value: '27', label: '27 - Eure' },
    { value: '28', label: '28 - Eure-et-Loir' },
    { value: '29', label: '29 - Finistère' },
    { value: '30', label: '30 - Gard' },
    { value: '31', label: '31 - Haute-Garonne' },
    { value: '32', label: '32 - Gers' },
    { value: '33', label: '33 - Gironde' },
    { value: '34', label: '34 - Hérault' },
    { value: '35', label: '35 - Ille-et-Vilaine' },
    { value: '36', label: '36 - Indre' },
    { value: '37', label: '37 - Indre-et-Loire' },
    { value: '38', label: '38 - Isère' },
    { value: '39', label: '39 - Jura' },
    { value: '40', label: '40 - Landes' },
    { value: '41', label: '41 - Loir-et-Cher' },
    { value: '42', label: '42 - Loire' },
    { value: '43', label: '43 - Haute-Loire' },
    { value: '44', label: '44 - Loire-Atlantique' },
    { value: '45', label: '45 - Loiret' },
    { value: '46', label: '46 - Lot' },
    { value: '47', label: '47 - Lot-et-Garonne' },
    { value: '48', label: '48 - Lozère' },
    { value: '49', label: '49 - Maine-et-Loire' },
    { value: '50', label: '50 - Manche' },
    { value: '51', label: '51 - Marne' },
    { value: '52', label: '52 - Haute-Marne' },
    { value: '53', label: '53 - Mayenne' },
    { value: '54', label: '54 - Meurthe-et-Moselle' },
    { value: '55', label: '55 - Meuse' },
    { value: '56', label: '56 - Morbihan' },
    { value: '57', label: '57 - Moselle' },
    { value: '58', label: '58 - Nièvre' },
    { value: '59', label: '59 - Nord' },
    { value: '60', label: '60 - Oise' },
    { value: '61', label: '61 - Orne' },
    { value: '62', label: '62 - Pas-de-Calais' },
    { value: '63', label: '63 - Puy-de-Dôme' },
    { value: '64', label: '64 - Pyrénées-Atlantiques' },
    { value: '65', label: '65 - Hautes-Pyrénées' },
    { value: '66', label: '66 - Pyrénées-Orientales' },
    { value: '67', label: '67 - Bas-Rhin' },
    { value: '68', label: '68 - Haut-Rhin' },
    { value: '69', label: '69 - Rhône' },
    { value: '70', label: '70 - Haute-Saône' },
    { value: '71', label: '71 - Saône-et-Loire' },
    { value: '72', label: '72 - Sarthe' },
    { value: '73', label: '73 - Savoie' },
    { value: '74', label: '74 - Haute-Savoie' },
    { value: '75', label: '75 - Paris' },
    { value: '76', label: '76 - Seine-Maritime' },
    { value: '77', label: '77 - Seine-et-Marne' },
    { value: '78', label: '78 - Yvelines' },
    { value: '79', label: '79 - Deux-Sèvres' },
    { value: '80', label: '80 - Somme' },
    { value: '81', label: '81 - Tarn' },
    { value: '82', label: '82 - Tarn-et-Garonne' },
    { value: '83', label: '83 - Var' },
    { value: '84', label: '84 - Vaucluse' },
    { value: '85', label: '85 - Vendée' },
    { value: '86', label: '86 - Vienne' },
    { value: '87', label: '87 - Haute-Vienne' },
    { value: '88', label: '88 - Vosges' },
    { value: '89', label: '89 - Yonne' },
    { value: '90', label: '90 - Territoire de Belfort' },
    { value: '91', label: '91 - Essonne' },
    { value: '92', label: '92 - Hauts-de-Seine' },
    { value: '93', label: '93 - Seine-Saint-Denis' },
    { value: '94', label: '94 - Val-de-Marne' },
    { value: '95', label: '95 - Val-d\'Oise' }
  ];

  // Mapping des champs vers Firebase
  const fieldMapping = {
    codePostal: 'codePostal',
    ville: 'ville',
    pays: 'pays',
    region: 'region',
    departement: 'departement'
  };

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
    
    // Notifier le parent uniquement si la valeur est significative
    const hasValue = value && value !== '';
    
    if (hasValue) {
      const mappedField = fieldMapping[field] || field;
      let criteriaValue = typeof newData[field] === 'object' ? newData[field].value : value;
      let criteriaOperator = operator || newData[field]?.operator || 'egal';
      let displayValue = criteriaValue;
      
      // Pour les sélections, récupérer le label pour l'affichage
      if (field === 'pays') {
        const paysObj = pays.find(p => p.value === criteriaValue);
        displayValue = paysObj ? paysObj.label : criteriaValue;
      } else if (field === 'region') {
        const regionObj = regions.find(r => r.value === criteriaValue);
        displayValue = regionObj ? regionObj.label : criteriaValue;
      } else if (field === 'departement') {
        const deptObj = departements.find(d => d.value === criteriaValue);
        displayValue = deptObj ? deptObj.label : criteriaValue;
      }
      
      const criteriaId = `geolocalisation_${field}`;
      onCriteriaChange({
        id: criteriaId,
        field: mappedField,
        operator: criteriaOperator,
        value: criteriaValue, // Valeur réelle pour Firebase
        label: getFieldLabel(field),
        displayValue: displayValue, // Label pour l'affichage
        section: 'geolocalisation'
      });
    } else {
      // Si la valeur est vide, supprimer le critère
      const criteriaId = `geolocalisation_${field}`;
      onCriteriaChange({
        id: criteriaId,
        remove: true
      });
    }
  };

  // Helper pour obtenir un label lisible pour le champ
  const getFieldLabel = (field) => {
    const labels = {
      codePostal: 'Code postal',
      ville: 'Ville',
      pays: 'Pays',
      region: 'Région',
      departement: 'Département',
      geolocalisationOperator: 'Géolocalisation'
    };
    return labels[field] || field;
  };

  return (
    <div className={styles.sectionContent}>
      <h4 className="mb-4">
        <i className="bi bi-geo-alt me-2"></i>
        Géolocalisation
      </h4>

      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-map me-2"></i>
            Recherche géographique
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            {/* Opérateur principal */}
            <Col md={12} className="mb-3">
              <Form.Label className="fw-bold">Géolocalisation</Form.Label>
              <Form.Select
                value={formData.geolocalisationOperator}
                onChange={(e) => handleFieldChange('geolocalisationOperator', e.target.value)}
              >
                <option value="parmi">Parmi</option>
                <option value="sauf">Sauf</option>
                <option value="proche">Proche de</option>
              </Form.Select>
            </Col>

            {/* Carte interactive (placeholder) */}
            <Col md={12} className="mb-4">
              <div 
                className="border rounded position-relative" 
                style={{ 
                  height: '300px', 
                  backgroundColor: '#f8f9fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div className="text-center text-muted">
                  <i className="bi bi-map display-1"></i>
                  <p className="mt-2">Carte interactive</p>
                  <small>Cliquez pour sélectionner des zones géographiques</small>
                </div>
                <Button 
                  variant="primary" 
                  size="sm"
                  className="position-absolute top-0 end-0 m-2"
                  title="Rechercher sur la carte"
                >
                  <i className="bi bi-search"></i>
                </Button>
              </div>
            </Col>

            {/* Filtres complémentaires */}
            <Col md={12}>
              <h6 className="mb-3">Filtres complémentaires</h6>
            </Col>

            {/* Code postal */}
            <Col md={6} className="mb-3">
              <Form.Label>Code postal</Form.Label>
              <div className="d-flex gap-2">
                <Form.Select 
                  size="sm"
                  style={{ maxWidth: '150px' }}
                  value={formData.codePostal.operator}
                  onChange={(e) => handleFieldChange('codePostal', formData.codePostal.value, e.target.value)}
                >
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </Form.Select>
                <Form.Control 
                  type="text"
                  value={formData.codePostal.value}
                  onChange={(e) => handleFieldChange('codePostal', e.target.value)}
                  placeholder="Ex: 75001"
                  maxLength="5"
                />
              </div>
            </Col>

            {/* Ville */}
            <Col md={6} className="mb-3">
              <Form.Label>Ville</Form.Label>
              <div className="d-flex gap-2">
                <Form.Select 
                  size="sm"
                  style={{ maxWidth: '150px' }}
                  value={formData.ville.operator}
                  onChange={(e) => handleFieldChange('ville', formData.ville.value, e.target.value)}
                >
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </Form.Select>
                <Form.Control 
                  type="text"
                  value={formData.ville.value}
                  onChange={(e) => handleFieldChange('ville', e.target.value)}
                  placeholder="Nom de la ville"
                />
              </div>
            </Col>

            {/* Pays */}
            <Col md={4} className="mb-3">
              <Form.Label>Pays</Form.Label>
              <div className="d-flex gap-2">
                <Form.Select 
                  size="sm"
                  style={{ maxWidth: '150px' }}
                  value={formData.pays.operator}
                  onChange={(e) => handleFieldChange('pays', formData.pays.value, e.target.value)}
                >
                  <option value="egal">Égal à</option>
                  <option value="different">Différent de</option>
                </Form.Select>
                <Form.Select
                  value={formData.pays.value}
                  onChange={(e) => handleFieldChange('pays', e.target.value)}
                >
                  <option value="">-- Sélectionner --</option>
                  {pays.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </Form.Select>
              </div>
            </Col>

            {/* Région */}
            <Col md={4} className="mb-3">
              <Form.Label>Région</Form.Label>
              <div className="d-flex gap-2">
                <Form.Select 
                  size="sm"
                  style={{ maxWidth: '150px' }}
                  value={formData.region.operator}
                  onChange={(e) => handleFieldChange('region', formData.region.value, e.target.value)}
                >
                  <option value="egal">Égal à</option>
                  <option value="different">Différent de</option>
                </Form.Select>
                <Form.Select
                  value={formData.region.value}
                  onChange={(e) => handleFieldChange('region', e.target.value)}
                >
                  <option value="">-- Sélectionner --</option>
                  {regions.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </Form.Select>
              </div>
            </Col>

            {/* Département */}
            <Col md={4} className="mb-3">
              <Form.Label>Département</Form.Label>
              <div className="d-flex gap-2">
                <Form.Select 
                  size="sm"
                  style={{ maxWidth: '150px' }}
                  value={formData.departement.operator}
                  onChange={(e) => handleFieldChange('departement', formData.departement.value, e.target.value)}
                >
                  <option value="egal">Égal à</option>
                  <option value="different">Différent de</option>
                </Form.Select>
                <Form.Select
                  value={formData.departement.value}
                  onChange={(e) => handleFieldChange('departement', e.target.value)}
                >
                  <option value="">-- Sélectionner --</option>
                  {departements.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </Form.Select>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default GeolocalisationSection;