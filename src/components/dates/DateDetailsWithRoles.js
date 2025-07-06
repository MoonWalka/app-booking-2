import React from 'react';
import { useParams } from 'react-router-dom';
import useDateDetailsWithRoles from '@/hooks/dates/useDateDetailsWithRoles';
import DateView from './desktop/DateView';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorDisplay from '@/components/common/ErrorDisplay';

/**
 * Version améliorée de DateDetails qui gère l'affichage de tous les contacts avec leurs rôles
 */
const DateDetailsWithRoles = () => {
  const { id } = useParams();
  
  // Utiliser le hook enrichi qui gère les contacts avec rôles
  const {
    entity,
    relatedData,
    isLoading,
    error,
    handleEdit,
    dateStatus,
    navigateToEntity,
    // Nouvelles propriétés pour les contacts avec rôles
    allContacts,
    getRoleLabel,
    hasMultipleContacts
  } = useDateDetailsWithRoles(id);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!entity) {
    return <ErrorDisplay error="Date non trouvé" />;
  }

  // Props communes pour les vues
  const commonProps = {
    date: entity,
    entity: entity,
    contractId: entity.contractId,
    factureId: entity.factureId,
    lieu: relatedData?.lieu,
    artiste: relatedData?.artiste,
    contact: relatedData?.contact,
    structure: relatedData?.structure,
    onEdit: handleEdit,
    dateStatus,
    navigateToEntity
  };

  // Utiliser la vue avec rôles si on a plusieurs contacts ou des contacts avec rôles
  if (hasMultipleContacts || (allContacts && allContacts.length > 0)) {
    return (
      <DateView
        {...commonProps}
        allContacts={allContacts}
        getRoleLabel={getRoleLabel}
      />
    );
  }

  // Sinon, utiliser la vue classique pour la compatibilité
  return <DateView {...commonProps} />;
};

export default DateDetailsWithRoles;