// src/components/contrats/sections/ContratHeader.js
import React from 'react';
import { Badge } from 'react-bootstrap';
import styles from './ContratHeader.module.css';

/**
 * Header component for contract details page with title and status badge
 */
const ContratHeader = ({ contrat }) => {
  const getStatusBadge = () => {
    if (!contrat) return null;
    
    switch (contrat.status) {
      case 'signed':
        return <Badge bg="success">Signé</Badge>;
      case 'sent':
        return <Badge bg="info">Envoyé</Badge>;
      case 'generated':
        return <Badge bg="warning">Généré</Badge>;
      default:
        return <Badge bg="secondary">Inconnu</Badge>;
    }
  };

  return (
    <div className={styles.contratHeaderContainer}>
      <h2 className={styles.contratTitle}>
        Détails du contrat {getStatusBadge()}
      </h2>
    </div>
  );
};

export default ContratHeader;