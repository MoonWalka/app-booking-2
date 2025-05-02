import React from 'react';
import { formatDateFr } from '@/utils/dateUtils';
import ConcertStatusBadge from './ConcertStatusBadge';
import ConcertActions from './ConcertActions';
import styles from './ConcertRow.module.css';

const ConcertRow = ({ 
  concert, 
  getStatusDetails, 
  hasForm, 
  hasUnvalidatedForm, 
  hasContract, 
  getContractStatus,
  isDatePassed,
  handleViewConcert,
  handleSendForm,
  handleViewForm,
  handleGenerateContract,
  handleViewContract
}) => {
  if (!concert) return null;
  
  const statusDetails = getStatusDetails(concert.statut);
  const contractStatus = getContractStatus ? getContractStatus(concert.id) : null;
  const displayDate = formatDateFr(concert.date);
  const isPastDate = isDatePassed(concert.date);
  
  return (
    <tr 
      className={`${styles.concertRow} ${isPastDate ? styles.pastDate : ''}`} 
      onClick={() => handleViewConcert(concert.id)}
    >
      <td className={styles.dateColumn}>
        <div className={styles.dateContainer}>
          <span className={styles.date}>{displayDate}</span>
          {isPastDate && <span className={styles.pastDateIndicator}>Passé</span>}
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
        {concert.programmateurNom || 'Non spécifié'}
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
          handleViewConcert={handleViewConcert}
          handleSendForm={handleSendForm}
          handleViewForm={handleViewForm}
          handleGenerateContract={handleGenerateContract}
          handleViewContract={handleViewContract}
        />
      </td>
    </tr>
  );
};

export default ConcertRow;