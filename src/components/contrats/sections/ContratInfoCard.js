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
      className={`mb-4 ${styles.infoCard}`}
      title="Informations du contrat"
    >
      <div className={styles.infoGrid}>
        <div className={styles.infoSection}>
          <div className={styles.infoItem}>
            <strong>Modèle utilisé :</strong> {template?.name || 'Non spécifié'}
          </div>
          <div className={styles.infoItem}>
            <strong>Date de génération :</strong> {contrat?.dateGeneration ? formatDate(contrat.dateGeneration) : 'Non spécifiée'}
          </div>
          {contrat?.dateEnvoi && (
            <div className={styles.infoItem}>
              <strong>Date d'envoi :</strong> {formatDate(contrat.dateEnvoi)}
            </div>
          )}
        </div>
        
        <div className={styles.infoSection}>
          <h5>Informations du concert</h5>
          <div className={styles.infoItem}>
            <strong>Date :</strong> {concert?.date ? formatDate(concert.date) : 'Non spécifiée'}
          </div>
          <div className={styles.infoItem}>
            <strong>Lieu :</strong> {concert?.lieuNom || lieu?.nom || 'Non spécifié'}
          </div>
          <div className={styles.infoItem}>
            <strong>Programmateur :</strong> {concert?.programmateurNom || 'Non spécifié'}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ContratInfoCard;