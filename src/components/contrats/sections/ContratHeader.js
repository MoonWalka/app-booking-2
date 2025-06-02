// src/components/contrats/sections/ContratHeader.js
import React from 'react';
import FormHeader from '@/components/ui/FormHeader';
import { formatDateFr } from '@/utils/dateUtils';

/**
 * Header component for contract details page with title and metadata
 * Harmonisé avec FormHeader pour un style cohérent avec les autres entités
 */
const ContratHeader = ({ contrat, concert, artiste, lieu }) => {
  // Formater la date de création
  const creationDate = contrat?.dateGeneration 
    ? formatDateFr(contrat.dateGeneration) 
    : 'Date inconnue';

  // Construire le titre du contrat
  const contractTitle = concert?.titre 
    ? `Contrat de Spectacle - ${concert.titre}`
    : 'Contrat de Spectacle';

  // Construire le sous-titre avec les métadonnées
  const metadataItems = [
    `Créé le ${creationDate}`,
    artiste?.nom && artiste.nom,
    lieu?.nom && lieu.nom
  ].filter(Boolean);

  const subtitle = metadataItems.join(' • ');

  // Icône spécifique aux contrats
  const icon = <i className="bi bi-file-earmark-text"></i>;

  return (
    <FormHeader
      title={contractTitle}
      subtitle={subtitle}
      icon={icon}
      roundedTop={true}
    />
  );
};

export default ContratHeader;