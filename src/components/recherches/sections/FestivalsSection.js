import React, { useState } from 'react';
import { Form, Row, Col, Card } from 'react-bootstrap';
import styles from './Sections.module.css';
import festivalStyles from './FestivalsSection.module.css';

/**
 * Section Festivals pour la recherche multi-critères
 */
const FestivalsSection = ({ onCriteriaChange }) => {
  const [formData, setFormData] = useState({
    nomFestival: { value: '', operator: 'contient' },
    commentaires: { value: '', operator: 'contient' },
    bouclage: [],
    semainesDiffusion: [] // Pour la grille de périodes
  });

  const operators = [
    { value: 'contient', label: 'Contient' },
    { value: 'egal', label: 'Égal à' },
    { value: 'commence', label: 'Commence par' },
    { value: 'termine', label: 'Se termine par' },
    { value: 'different', label: 'Différent de' },
    { value: 'non_renseigne', label: 'Non renseigné' }
  ];

  const mois = [
    { value: 'janvier', label: 'Janvier' },
    { value: 'fevrier', label: 'Février' },
    { value: 'mars', label: 'Mars' },
    { value: 'avril', label: 'Avril' },
    { value: 'mai', label: 'Mai' },
    { value: 'juin', label: 'Juin' },
    { value: 'juillet', label: 'Juillet' },
    { value: 'aout', label: 'Août' },
    { value: 'septembre', label: 'Septembre' },
    { value: 'octobre', label: 'Octobre' },
    { value: 'novembre', label: 'Novembre' },
    { value: 'decembre', label: 'Décembre' }
  ];

  // Noms des mois pour la grille
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  // Fonction pour gérer le clic sur une semaine
  const toggleWeek = (monthIndex, weekIndex) => {
    const weekId = `${monthIndex}-${weekIndex}`;
    const newSemainesDiffusion = formData.semainesDiffusion.includes(weekId)
      ? formData.semainesDiffusion.filter(w => w !== weekId)
      : [...formData.semainesDiffusion, weekId];
    
    setFormData(prev => ({
      ...prev,
      semainesDiffusion: newSemainesDiffusion
    }));

    // Notifier le parent
    if (newSemainesDiffusion.length > 0) {
      // Convertir les semaines sélectionnées en description lisible
      const periodeDescription = getPeriodeDescription(newSemainesDiffusion);
      onCriteriaChange({
        id: 'festivals_semainesDiffusion',
        field: fieldMapping.semainesDiffusion,
        operator: 'contient',
        value: periodeDescription,
        label: 'Période de diffusion',
        displayValue: periodeDescription,
        section: 'festivals'
      });
    } else {
      // Si aucune semaine sélectionnée, supprimer le critère
      onCriteriaChange({
        id: 'festivals_semainesDiffusion',
        remove: true
      });
    }
  };

  // Fonction pour obtenir une description des périodes sélectionnées
  const getPeriodeDescription = (semaines) => {
    const moisAvecSemaines = {};
    
    semaines.forEach(weekId => {
      const [monthIndex, weekIndex] = weekId.split('-').map(Number);
      if (!moisAvecSemaines[monthIndex]) {
        moisAvecSemaines[monthIndex] = [];
      }
      moisAvecSemaines[monthIndex].push(parseInt(weekIndex) + 1);
    });

    const descriptions = Object.entries(moisAvecSemaines).map(([monthIndex, weeks]) => {
      const monthName = months[parseInt(monthIndex)];
      if (weeks.length === 4) {
        return monthName;
      } else {
        return `${monthName} (sem. ${weeks.sort().join(', ')})`;
      }
    });

    return descriptions.join(', ');
  };

  // Mapping des champs vers Firebase
  const fieldMapping = {
    nomFestival: 'nomFestival',
    commentaires: 'diffusionCommentaires1', // ou notes selon la structure
    bouclage: 'bouclage',
    semainesDiffusion: 'periodeFestivalComplete'
  };

  const handleFieldChange = (field, value, operator = null) => {
    const newData = { ...formData };
    
    if (field === 'bouclage') {
      // Gestion spéciale pour les mois de bouclage (multi-sélection)
      newData[field] = value;
    } else if (operator !== null) {
      newData[field] = { ...newData[field], operator };
    } else {
      newData[field] = { ...newData[field], value };
    }
    
    setFormData(newData);
    
    // Notifier le parent uniquement si la valeur est significative
    const hasValue = (field === 'bouclage' && value.length > 0) || 
                     (field !== 'bouclage' && field !== 'semainesDiffusion' && value);
    
    if (hasValue) {
      const mappedField = fieldMapping[field] || field;
      let criteriaValue = value;
      let displayValue = value;
      let criteriaOperator = operator || newData[field]?.operator || 'egal';
      
      if (field === 'bouclage') {
        const selectedLabels = value.map(v => 
          mois.find(m => m.value === v)?.label || v
        );
        displayValue = selectedLabels.join(', ');
        criteriaOperator = 'parmi';
      } else if (field !== 'semainesDiffusion') {
        criteriaValue = newData[field].value;
        criteriaOperator = newData[field].operator;
      }
      
      const criteriaId = `festivals_${field}`;
      onCriteriaChange({
        id: criteriaId,
        field: mappedField,
        operator: criteriaOperator,
        value: criteriaValue,
        label: getFieldLabel(field),
        displayValue: displayValue,
        section: 'festivals'
      });
    } else if (!value || (field === 'bouclage' && value.length === 0)) {
      // Si la valeur est vide, supprimer le critère
      const criteriaId = `festivals_${field}`;
      onCriteriaChange({
        id: criteriaId,
        remove: true
      });
    }
  };

  // Helper pour obtenir un label lisible pour le champ
  const getFieldLabel = (field) => {
    const labels = {
      nomFestival: 'Nom du festival',
      commentaires: 'Commentaires',
      bouclage: 'Bouclage',
      semainesDiffusion: 'Période de diffusion'
    };
    return labels[field] || field;
  };

  const handleMoisToggle = (moisValue) => {
    const newBouclage = formData.bouclage.includes(moisValue)
      ? formData.bouclage.filter(m => m !== moisValue)
      : [...formData.bouclage, moisValue];
    
    handleFieldChange('bouclage', newBouclage);
  };

  const handleSelectAllMois = () => {
    if (formData.bouclage.length === mois.length) {
      // Tout désélectionner
      handleFieldChange('bouclage', []);
    } else {
      // Tout sélectionner
      const allMois = mois.map(m => m.value);
      handleFieldChange('bouclage', allMois);
    }
  };

  const allSelected = formData.bouclage.length === mois.length;
  const someSelected = formData.bouclage.length > 0 && !allSelected;

  return (
    <div className={styles.sectionContent}>
      <h4 className="mb-4">
        <i className="bi bi-calendar-event me-2"></i>
        Festivals
      </h4>

      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-filter me-2"></i>
            Critères de recherche
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            {/* Nom du festival */}
            <Col md={12} className="mb-4">
              <Form.Label>Nom du festival</Form.Label>
              <div className="d-flex gap-2">
                <Form.Select 
                  size="sm"
                  style={{ maxWidth: '150px' }}
                  value={formData.nomFestival.operator}
                  onChange={(e) => handleFieldChange('nomFestival', formData.nomFestival.value, e.target.value)}
                >
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </Form.Select>
                <Form.Control 
                  type="text"
                  value={formData.nomFestival.value}
                  onChange={(e) => handleFieldChange('nomFestival', e.target.value)}
                  placeholder="Ex: Festival des Arts, Jazz Festival..."
                />
              </div>
            </Col>

            {/* Commentaires */}
            <Col md={12} className="mb-4">
              <Form.Label>Commentaires</Form.Label>
              <div className="d-flex gap-2">
                <Form.Select 
                  size="sm"
                  style={{ maxWidth: '150px' }}
                  value={formData.commentaires.operator}
                  onChange={(e) => handleFieldChange('commentaires', formData.commentaires.value, e.target.value)}
                >
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </Form.Select>
                <Form.Control 
                  type="text"
                  value={formData.commentaires.value}
                  onChange={(e) => handleFieldChange('commentaires', e.target.value)}
                  placeholder="Rechercher dans les commentaires..."
                />
              </div>
            </Col>

            {/* Bouclage (mois) */}
            <Col md={12} className="mb-4">
              <Form.Label className="fw-bold">Bouclage</Form.Label>
              <Form.Text className="d-block mb-3 text-muted">
                Filtre : parmi les mois sélectionnés
              </Form.Text>

              {/* Résumé des sélections */}
              {formData.bouclage.length > 0 && (
                <div className="alert alert-info mb-3">
                  <small>
                    <i className="bi bi-check2-circle me-2"></i>
                    {formData.bouclage.length} mois sélectionné(s)
                  </small>
                </div>
              )}

              {/* Sélectionner tout */}
              <div className="mb-3">
                <Form.Check 
                  type="checkbox"
                  id="select-all-mois"
                  label={<strong>Tout sélectionner</strong>}
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={handleSelectAllMois}
                />
              </div>

              <hr className="my-2" />

              {/* Liste des mois */}
              <Row className="g-3">
                {mois.map(m => (
                  <Col md={4} lg={3} key={m.value}>
                    <Form.Check 
                      type="checkbox"
                      id={`mois-${m.value}`}
                      label={m.label}
                      checked={formData.bouclage.includes(m.value)}
                      onChange={() => handleMoisToggle(m.value)}
                    />
                  </Col>
                ))}
              </Row>
            </Col>

            {/* Grille de période de diffusion */}
            <Col md={12}>
              <h6 className="mb-3">Période de diffusion</h6>
              <Form.Text className="d-block mb-3 text-muted">
                Cliquez sur les semaines pour sélectionner les périodes
              </Form.Text>
              
              {/* Résumé des périodes sélectionnées */}
              {formData.semainesDiffusion.length > 0 && (
                <div className="alert alert-info mb-3">
                  <small>
                    <i className="bi bi-calendar-check me-2"></i>
                    {getPeriodeDescription(formData.semainesDiffusion)}
                  </small>
                </div>
              )}

              <div className={festivalStyles.periodGrid}>
                <table className={festivalStyles.weeksTable}>
                  <tbody>
                    {months.map((monthName, monthIndex) => (
                      <tr key={monthIndex} className={festivalStyles.monthRow}>
                        <td className={festivalStyles.monthName}>{monthName}</td>
                        {[1, 2, 3, 4].map((weekNum) => {
                          const weekId = `${monthIndex}-${weekNum - 1}`;
                          return (
                            <td key={weekNum} className={festivalStyles.weekCellWrapper}>
                              <div
                                className={`${festivalStyles.weekCell} ${
                                  formData.semainesDiffusion.includes(weekId) ? festivalStyles.selected : ''
                                }`}
                                onClick={() => toggleWeek(monthIndex, weekNum - 1)}
                                title={`${monthName} - Semaine ${weekNum}`}
                              >
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default FestivalsSection;