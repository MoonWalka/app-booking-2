import React, { memo } from 'react';
import { formatDateFr } from '@/utils/dateUtils';
import ConcertStatusBadge from './ConcertStatusBadge';
import ConcertActions from './ConcertActions';
import styles from './ConcertRow.module.css';

// Mémoïsation du composant pour éviter des rendus inutiles
const ConcertRow = memo(({ 
  concert, 
  getStatusDetails, 
  hasForm, 
  hasUnvalidatedForm, 
  hasContract, 
  getContractStatus,
  getContractData, // Nouvelle prop pour obtenir les données du contrat
  hasFacture,
  getFactureStatus,
  getFactureData, // Nouvelle prop pour obtenir les données de la facture
  isDatePassed,
  handleViewConcert,
  handleSendForm,
  handleViewForm,
  handleGenerateContract,
  handleViewContract,
  handleGenerateFacture,
  handleViewFacture
}) => {
  if (!concert) return null;
  
  const statusDetails = getStatusDetails(concert.statut);
  const contractStatus = getContractStatus ? getContractStatus(concert.id) : null;
  const contractData = getContractData ? getContractData(concert.id) : null; // Récupérer les données du contrat
  const factureStatus = getFactureStatus ? getFactureStatus(concert.id) : null;
  const factureData = getFactureData ? getFactureData(concert.id) : null; // Récupérer les données de la facture
  const displayDate = formatDateFr(concert.date);
  const isPastDate = isDatePassed(concert.date);
  
  // Générer la date complète pour le tooltip
  const fullDate = concert.date ? new Date(concert.date).toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) : '';
  
  return (
    <tr 
      className={`${styles.concertRow} ${isPastDate ? styles.pastDate : ''}`} 
      onClick={() => handleViewConcert(concert.id)}
    >
      <td className={styles.dateColumn}>
        <div className={styles.dateContainer}>
          <span className={styles.date} title={fullDate}>{displayDate}</span>
        </div>
      </td>
      
      <td className={styles.titleColumn}>
        <div>
          <span className={styles.title}>{concert.titre || 'Sans titre'}</span>
          {concert.artisteNom && (
            <span className={styles.artistName}>{concert.artisteNom}</span>
          )}
        </div>
      </td>
      
      <td className={styles.locationColumn}>
        <div>
          <span className={styles.locationName}>{concert.lieuNom || 'Lieu non spécifié'}</span>
          {concert.lieuVille && (
            <span className={styles.locationCity}>
              {concert.lieuVille}
              {concert.lieuCodePostal && concert.lieuCodePostal.length >= 2 && ` (${concert.lieuCodePostal.substring(0, 2)})`}
            </span>
          )}
        </div>
      </td>
      
      <td className={styles.organizerColumn}>
        {concert.contactNom || 'Non spécifié'}
      </td>
      
      <td className={styles.statusColumn}>
        <ConcertStatusBadge 
          concert={concert}
          statusDetails={statusDetails} 
        />
      </td>
      
      <td className={styles.actionsColumn}>
        <ConcertActions
          concert={concert}
          hasForm={hasForm}
          hasUnvalidatedForm={hasUnvalidatedForm}
          hasContract={hasContract}
          contractStatus={contractStatus}
          contractData={contractData} // Passer les données du contrat
          hasFacture={hasFacture}
          factureStatus={factureStatus}
          factureData={factureData} // Passer les données de la facture
          handleViewConcert={handleViewConcert}
          handleSendForm={handleSendForm}
          handleViewForm={handleViewForm}
          handleGenerateContract={handleGenerateContract}
          handleViewContract={handleViewContract}
          handleGenerateFacture={handleGenerateFacture}
          handleViewFacture={handleViewFacture}
        />
      </td>
    </tr>
  );
});

export default ConcertRow;