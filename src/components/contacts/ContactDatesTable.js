import React from 'react';
import { useNavigate } from 'react-router-dom';
import DatesTableView from '@/components/dates/DatesTableView';
import useDateDelete from '@/hooks/dates/useDateDelete';
import { useDateListData } from '@/hooks/dates/useDateListData';
import { useDateActions } from '@/hooks/dates/useDateActions';

/**
 * Tableau des dates de concerts associées à un contact
 * Utilise le même composant que le tableau de bord pour garantir la cohérence
 */
const ContactDatesTable = ({ contactId, dates = [], onAddClick = null, onDeleteSuccess = null }) => {
  const navigate = useNavigate();
  
  console.log(`[ContactDatesTable] Rendu avec ${dates.length} dates pour contact ${contactId}`);

  // Hooks pour les données et actions des concerts
  const {
    hasContract,
    getContractStatus,
    getContractData,
    hasFacture,
    getFactureStatus,
    getFactureData
  } = useDateListData();
  
  const {
    handleViewFacture,
    handleGenerateFacture
  } = useDateActions();

  // Hook pour la suppression des concerts
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
    <div style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h5>
          <i className="bi bi-calendar-event" style={{ color: '#dc3545', marginRight: '8px' }}></i>
          Dates de concerts
        </h5>
        {onAddClick && (
          <button
            className="btn btn-primary btn-sm"
            onClick={onAddClick}
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <i className="bi bi-plus-circle"></i>
            Nouvelle date
          </button>
        )}
      </div>
      
      <DatesTableView
        dates={dates}
        loading={false}
        error={null}
        onDelete={handleDeleteDate}
        onEdit={handleEditDate}
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
    </div>
  );
};

export default ContactDatesTable;