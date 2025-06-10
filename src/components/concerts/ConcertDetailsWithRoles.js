import React from 'react';
import { useParams } from 'react-router-dom';
import useConcertDetailsWithRoles from '@/hooks/concerts/useConcertDetailsWithRoles';
import ConcertViewWithRelancesWithRoles from './desktop/ConcertViewWithRelancesWithRoles';
import ConcertViewWithRelances from './desktop/ConcertViewWithRelances';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorDisplay from '@/components/common/ErrorDisplay';

/**
 * Version améliorée de ConcertDetails qui gère l'affichage de tous les contacts avec leurs rôles
 */
const ConcertDetailsWithRoles = () => {
  const { id } = useParams();
  
  // Utiliser le hook enrichi qui gère les contacts avec rôles
  const {
    entity,
    relatedData,
    isLoading,
    error,
    handleEdit,
    concertStatus,
    navigateToEntity,
    // Nouvelles propriétés pour les contacts avec rôles
    allContacts,
    getRoleLabel,
    hasMultipleContacts
  } = useConcertDetailsWithRoles(id);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!entity) {
    return <ErrorDisplay error="Concert non trouvé" />;
  }

  // Props communes pour les vues
  const commonProps = {
    concert: entity,
    entity: entity,
    contractId: entity.contractId,
    factureId: entity.factureId,
    lieu: relatedData?.lieu,
    artiste: relatedData?.artiste,
    contact: relatedData?.contact,
    structure: relatedData?.structure,
    onEdit: handleEdit,
    concertStatus,
    navigateToEntity
  };

  // Utiliser la vue avec rôles si on a plusieurs contacts ou des contacts avec rôles
  if (hasMultipleContacts || (allContacts && allContacts.length > 0)) {
    return (
      <ConcertViewWithRelancesWithRoles
        {...commonProps}
        allContacts={allContacts}
        getRoleLabel={getRoleLabel}
      />
    );
  }

  // Sinon, utiliser la vue classique pour la compatibilité
  return <ConcertViewWithRelances {...commonProps} />;
};

export default ConcertDetailsWithRoles;