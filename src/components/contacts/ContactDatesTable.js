import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DatesTableView from '@/components/dates/DatesTableView';
import useDateDelete from '@/hooks/dates/useDateDelete';
import { useDateActions } from '@/hooks/dates/useDateActions';

/**
 * Tableau des dates associées à un contact
 * Utilise le même composant que le tableau de bord pour garantir la cohérence
 */
const ContactDatesTable = ({ contactId, dates = [], onAddClick = null, onDeleteSuccess = null }) => {
  const navigate = useNavigate();
  
  console.log(`[ContactDatesTable] Rendu avec ${dates.length} dates pour contact ${contactId}`);

  // Hooks pour les actions des dates
  const {
    handleViewFacture,
    handleGenerateFacture
  } = useDateActions();
  
  // Fonctions locales pour gérer les données des dates passées en props
  const hasContract = useCallback((dateId) => {
    const date = dates.find(d => d.id === dateId);
    return date && (date.contratId || date.contratStatus);
  }, [dates]);
  
  const getContractStatus = useCallback((dateId) => {
    const date = dates.find(d => d.id === dateId);
    return date ? date.contratStatus : null;
  }, [dates]);
  
  const getContractData = useCallback((dateId) => {
    const date = dates.find(d => d.id === dateId);
    if (!date || !date.contratId) return null;
    return {
      id: date.contratId,
      status: date.contratStatus,
      factureId: date.factureId,
      factureStatus: date.factureStatus
    };
  }, [dates]);
  
  const hasFacture = useCallback((dateId) => {
    const date = dates.find(d => d.id === dateId);
    return date && (date.factureId || date.hasFacture);
  }, [dates]);
  
  const getFactureStatus = useCallback((dateId) => {
    const date = dates.find(d => d.id === dateId);
    return date ? date.factureStatus : null;
  }, [dates]);
  
  const getFactureData = useCallback((dateId) => {
    const date = dates.find(d => d.id === dateId);
    if (!date || !date.factureId) return null;
    return {
      id: date.factureId,
      status: date.factureStatus
    };
  }, [dates]);

  // Hook pour la suppression des dates
  const { handleDeleteDate: deleteDate } = useDateDelete(() => {
    console.log('[ContactDatesTable] Date supprimé avec succès');
    if (onDeleteSuccess) {
      onDeleteSuccess();
    }
  });

  // Fonction pour supprimer une date avec confirmation
  const handleDeleteDate = (dateItem) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la date "${dateItem.titre || dateItem.artisteNom || 'sans titre'}" du ${dateItem.date ? new Date(dateItem.date).toLocaleDateString('fr-FR') : 'date inconnue'} ?`)) {
      console.log('[ContactDatesTable] Suppression de la date:', dateItem.id);
      deleteDate(dateItem.id);
    }
  };

  // Fonction pour éditer une date
  const handleEditDate = (dateItem) => {
    navigate(`/dates/${dateItem.id}/edit`);
  };

  // Utiliser le composant commun DatesTableView
  return (
    <DatesTableView
        dates={dates}
        loading={false}
        error={null}
        onDelete={handleDeleteDate}
        onEdit={handleEditDate}
        onRefresh={onDeleteSuccess}
        onAddClick={onAddClick}
        showSearch={false}
        // Props pour gérer les contrats et factures
        hasContractFunc={hasContract}
        getContractStatus={getContractStatus}
        getContractData={getContractData}
        hasFacture={hasFacture}
        getFactureStatus={getFactureStatus}
        getFactureData={getFactureData}
        handleViewFacture={handleViewFacture}
        handleGenerateFacture={handleGenerateFacture}
    />
  );
};

export default ContactDatesTable;