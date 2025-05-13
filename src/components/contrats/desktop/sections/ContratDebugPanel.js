// src/components/contrats/desktop/sections/ContratDebugPanel.js
import React from 'react';
import { Button } from 'react-bootstrap';
import styles from './ContratDebugPanel.module.css';
import Card from '@/components/ui/Card';

const ContratDebugPanel = ({
  showDebugInfo,
  toggleDebugInfo,
  selectedTemplate,
  concert,
  programmateur,
  artiste,
  lieu,
  entrepriseInfo
}) => {
  return (
    <>
      {/* Bouton de débogage */}
      <div className={styles.debugToggle}>
        <Button 
          variant="outline-secondary" 
          size="sm"
          onClick={toggleDebugInfo}
        >
          <i className={`bi bi-${showDebugInfo ? 'eye-slash' : 'bug'} me-2`}></i>
          {showDebugInfo ? "Masquer les infos de débogage" : "Afficher les infos de débogage"}
        </Button>
      </div>
      
      {/* Section de débogage */}
      {showDebugInfo && (
        <Card 
          title="Informations de débogage" 
          className={styles.debugCard}
          variant="info"
          headerActions={
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={toggleDebugInfo}
            >
              <i className="bi bi-x"></i>
            </button>
          }
        >
          <h6>Modèle sélectionné</h6>
          <pre className={styles.debugPre}>
            {JSON.stringify(selectedTemplate, null, 2)}
          </pre>
          
          <h6>Données du concert</h6>
          <pre className={styles.debugPre}>
            {JSON.stringify(concert, null, 2)}
          </pre>
          
          <h6>Données du programmateur</h6>
          <pre className={styles.debugPre}>
            {JSON.stringify(programmateur, null, 2)}
          </pre>
          
          <h6>Données de l'artiste</h6>
          <pre className={styles.debugPre}>
            {JSON.stringify(artiste, null, 2)}
          </pre>
          
          <h6>Données du lieu</h6>
          <pre className={styles.debugPre}>
            {JSON.stringify(lieu, null, 2)}
          </pre>
          
          <h6>Informations d'entreprise</h6>
          <pre className={styles.debugPre}>
            {JSON.stringify(entrepriseInfo, null, 2)}
          </pre>
        </Card>
      )}
    </>
  );
};

export default ContratDebugPanel;