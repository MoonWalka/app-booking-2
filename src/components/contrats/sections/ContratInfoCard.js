// src/components/contrats/sections/ContratInfoCard.js
import React from 'react';
import Card from '@/components/ui/Card';
import styles from './ContratInfoCard.module.css';

/**
 * Component displaying contract and concert information
 */
const ContratInfoCard = ({ contrat, concert, template, lieu }) => {
  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Non spécifiée';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('fr-FR');
  };

  return (
    <Card 
      className="mb-4"
      title="Informations du contrat"
    >
      <div className="row">
        <div className="col-md-6">
          <p><strong>Modèle utilisé :</strong> {template?.name || 'Non spécifié'}</p>
          <p><strong>Date de génération :</strong> {contrat?.dateGeneration ? formatDate(contrat.dateGeneration) : 'Non spécifiée'}</p>
          {contrat?.dateEnvoi && (
            <p><strong>Date d'envoi :</strong> {formatDate(contrat.dateEnvoi)}</p>
          )}
        </div>
        
        <div className="col-md-6">
          <h5>Informations du concert</h5>
          <p><strong>Date :</strong> {concert?.date ? formatDate(concert.date) : 'Non spécifiée'}</p>
          <p><strong>Lieu :</strong> {concert?.lieuNom || lieu?.nom || 'Non spécifié'}</p>
          <p><strong>Programmateur :</strong> {concert?.programmateurNom || 'Non spécifié'}</p>
        </div>
      </div>
    </Card>
  );
};

export default ContratInfoCard;