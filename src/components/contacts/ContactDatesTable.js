import React from 'react';
import { useNavigate } from 'react-router-dom';
import ConcertsTableView from '@/components/concerts/ConcertsTableView';
import useConcertDelete from '@/hooks/concerts/useConcertDelete';
import { useConcertListData } from '@/hooks/concerts/useConcertListData';
import { useConcertActions } from '@/hooks/concerts/useConcertActions';

/**
 * Tableau des dates de concerts associées à un contact
 * Utilise le même composant que le tableau de bord pour garantir la cohérence
 */
const ContactDatesTable = ({ contactId, concerts = [], onAddClick = null, onDeleteSuccess = null }) => {
  const navigate = useNavigate();
  
  console.log(`[ContactDatesTable] Rendu avec ${concerts.length} concerts pour contact ${contactId}`);

  // Hooks pour les données et actions des concerts
  const {
    hasContract,
    getContractStatus,
    getContractData,
    hasFacture,
    getFactureStatus,
    getFactureData
  } = useConcertListData();
  
  const {
    handleViewFacture,
    handleGenerateFacture
  } = useConcertActions();

  // Hook pour la suppression des concerts
  const { handleDeleteConcert: deleteConcert } = useConcertDelete(() => {
    console.log('[ContactDatesTable] Concert supprimé avec succès');
    if (onDeleteSuccess) {
      onDeleteSuccess();
    }
  });

  // Fonction pour supprimer un concert avec confirmation
  const handleDeleteConcert = (concert) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le concert "${concert.titre || concert.artisteNom || 'sans titre'}" du ${concert.date ? new Date(concert.date).toLocaleDateString('fr-FR') : 'date inconnue'} ?`)) {
      console.log('[ContactDatesTable] Suppression du concert:', concert.id);
      deleteConcert(concert.id);
    }
  };

  // Fonction pour éditer un concert
  const handleEditConcert = (concert) => {
    navigate(`/concerts/${concert.id}/edit`);
  };

  // Utiliser le composant commun ConcertsTableView
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
      
      <ConcertsTableView
        concerts={concerts}
        loading={false}
        error={null}
        onDelete={handleDeleteConcert}
        onEdit={handleEditConcert}
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