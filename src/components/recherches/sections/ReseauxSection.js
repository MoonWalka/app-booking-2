import React, { useState } from 'react';
import { Form, Row, Col, Card } from 'react-bootstrap';
import styles from './Sections.module.css';

/**
 * Section Réseaux pour la recherche multi-critères
 */
const ReseauxSection = ({ onCriteriaChange }) => {
  const [selectedReseaux, setSelectedReseaux] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Liste complète des réseaux
  const reseauxDisponibles = [
    { id: 'actes-if', label: 'Actes IF' },
    { id: 'ajc-jazze-croise', label: 'AJC - Jazzé Croisé' },
    { id: 'apresmai', label: 'AprèsMai' },
    { id: 'atp', label: 'ATP' },
    { id: 'avant-mardi', label: 'Avant-Mardi' },
    { id: 'bretagne-en-scene', label: 'Bretagne en Scène' },
    { id: 'ccr', label: 'CCR' },
    { id: 'cnc', label: 'CNC' },
    { id: 'cnt', label: 'CNT' },
    { id: 'cnv', label: 'CNV' },
    { id: 'collectif-culture-bar-bars', label: 'Collectif Culture Bar-Bars' },
    { id: 'collectif-des-festivals', label: 'Collectif des festivals' },
    { id: 'fedelima', label: 'FEDELIMA' },
    { id: 'federation-de-la-vie', label: 'Fédération De-ci De-là' },
    { id: 'federation-des-suds', label: 'Fédération des Suds' },
    { id: 'ferarock', label: 'FERAROCK' },
    { id: 'ffm', label: 'FFM - Fédération France Musique' },
    { id: 'france-festivals', label: 'France Festivals' },
    { id: 'futurs-composes', label: 'Futurs Composés' },
    { id: 'grand-bureau', label: 'Grand Bureau' },
    { id: 'grabuge', label: 'GRABUGE' },
    { id: 'ici-et-la', label: 'Ici et là' },
    { id: 'irma', label: 'IRMA' },
    { id: 'jazz-en-france', label: 'Jazz en France' },
    { id: 'le-cry', label: 'Le Cry' },
    { id: 'le-maillon', label: 'Le Maillon' },
    { id: 'le-paj', label: 'Le PAJ' },
    { id: 'le-pole', label: 'Le Pôle' },
    { id: 'le-ramdam', label: 'Le RAMDAM' },
    { id: 'le-raoul', label: 'Le RAOUL' },
    { id: 'le-rim', label: 'Le RIM' },
    { id: 'le-rif', label: 'Le RIF' },
    { id: 'les-independances', label: 'Les Indépendances' },
    { id: 'les-trans', label: 'Les Trans' },
    { id: 'map', label: 'MAP - Musiques Actuelles en Pays de la Loire' },
    { id: 'octopus', label: 'Octopus' },
    { id: 'paca-rock', label: 'PACA Rock' },
    { id: 'paz', label: 'PAZ' },
    { id: 'prodiss', label: 'PRODISS' },
    { id: 'profedim', label: 'PROFEDIM' },
    { id: 'reseau-92', label: 'Réseau 92' },
    { id: 'reseau-chanson', label: 'Réseau Chanson' },
    { id: 'reseau-printemps', label: 'Réseau Printemps' },
    { id: 'reseau-ratp', label: 'Réseau RATP' },
    { id: 'sma', label: 'SMA - Syndicat des Musiques Actuelles' },
    { id: 'snsp', label: 'SNSP' },
    { id: 'supermonde', label: 'Supermonde' },
    { id: 'synptac', label: 'SYNPTAC' },
    { id: 'zone-franche', label: 'Zone Franche' }
  ];

  // Filtrer les réseaux selon la recherche
  const reseauxFiltres = reseauxDisponibles.filter(reseau =>
    reseau.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReseauToggle = (reseauId) => {
    const newSelected = selectedReseaux.includes(reseauId)
      ? selectedReseaux.filter(id => id !== reseauId)
      : [...selectedReseaux, reseauId];
    
    setSelectedReseaux(newSelected);
    
    // Notifier le parent
    if (newSelected.length > 0) {
      const selectedLabels = newSelected.map(id => {
        const reseau = reseauxDisponibles.find(r => r.id === id);
        return reseau ? reseau.label : id;
      });
      
      onCriteriaChange({
        id: `reseaux_${Date.now()}`,
        field: 'Réseaux',
        operator: 'parmi',
        value: selectedLabels.join(', ')
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedReseaux.length === reseauxFiltres.length) {
      // Tout désélectionner
      setSelectedReseaux([]);
    } else {
      // Tout sélectionner (seulement les réseaux filtrés)
      const allIds = reseauxFiltres.map(r => r.id);
      setSelectedReseaux(allIds);
      
      // Notifier le parent
      const selectedLabels = reseauxFiltres.map(r => r.label);
      onCriteriaChange({
        id: `reseaux_${Date.now()}`,
        field: 'Réseaux',
        operator: 'parmi',
        value: selectedLabels.join(', ')
      });
    }
  };

  const allSelected = reseauxFiltres.length > 0 && 
    reseauxFiltres.every(r => selectedReseaux.includes(r.id));
  const someSelected = reseauxFiltres.some(r => selectedReseaux.includes(r.id)) && !allSelected;

  return (
    <div className={styles.sectionContent}>
      <h4 className="mb-4">
        <i className="bi bi-diagram-3 me-2"></i>
        Réseaux
      </h4>

      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-filter me-2"></i>
            Filtres disponibles
          </h5>
        </Card.Header>
        <Card.Body>
          <Form.Label className="fw-bold">Réseaux</Form.Label>
          <Form.Text className="d-block mb-3 text-muted">
            Filtre : parmi les réseaux sélectionnés
          </Form.Text>

          {/* Barre de recherche */}
          <Form.Control 
            type="text"
            placeholder="Rechercher un réseau..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-3"
          />

          {/* Résumé des sélections */}
          {selectedReseaux.length > 0 && (
            <div className="alert alert-info mb-3">
              <small>
                <i className="bi bi-check2-circle me-2"></i>
                {selectedReseaux.length} réseau(x) sélectionné(s)
              </small>
            </div>
          )}

          {/* Sélectionner tout */}
          <div className="mb-3">
            <Form.Check 
              type="checkbox"
              id="select-all-reseaux"
              label={<strong>Tout sélectionner ({reseauxFiltres.length})</strong>}
              checked={allSelected}
              indeterminate={someSelected}
              onChange={handleSelectAll}
            />
          </div>

          <hr className="my-2" />

          {/* Liste des réseaux */}
          <div 
            className="border rounded p-3" 
            style={{ 
              maxHeight: '400px', 
              overflowY: 'auto',
              backgroundColor: 'var(--bs-gray-50)'
            }}
          >
            {reseauxFiltres.length === 0 ? (
              <p className="text-muted text-center mb-0">
                Aucun réseau ne correspond à votre recherche
              </p>
            ) : (
              <Row>
                {reseauxFiltres.map(reseau => (
                  <Col md={6} lg={4} key={reseau.id} className="mb-2">
                    <Form.Check 
                      type="checkbox"
                      id={`reseau-${reseau.id}`}
                      label={reseau.label}
                      checked={selectedReseaux.includes(reseau.id)}
                      onChange={() => handleReseauToggle(reseau.id)}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ReseauxSection;