import React from 'react';
import { Table } from 'react-bootstrap';
import ConcertRow from './ConcertRow';
import styles from './ConcertsTable.module.css';

const ConcertsTable = ({ 
  concerts, 
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
  return (
    <div className={styles.tableContainer}>
      {concerts && concerts.length > 0 ? (
        <Table hover responsive className={styles.concertsTable}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Concert</th>
              <th>Lieu</th>
              <th>Programmateur</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {concerts.map(concert => (
              <ConcertRow
                key={concert.id}
                concert={concert}
                getStatusDetails={getStatusDetails}
                hasForm={hasForm ? hasForm(concert.id) : false}
                hasUnvalidatedForm={hasUnvalidatedForm ? hasUnvalidatedForm(concert.id) : false}
                hasContract={hasContract ? hasContract(concert.id) : false}
                getContractStatus={getContractStatus}
                isDatePassed={isDatePassed}
                handleViewConcert={handleViewConcert}
                handleSendForm={handleSendForm}
                handleViewForm={handleViewForm}
                handleGenerateContract={handleGenerateContract}
                handleViewContract={handleViewContract}
              />
            ))}
          </tbody>
        </Table>
      ) : (
        <div className={styles.noResults}>Aucun concert trouvé</div>
      )}
    </div>
  );
};

export default ConcertsTable;