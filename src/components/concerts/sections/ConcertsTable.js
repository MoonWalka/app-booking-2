import React, { memo, useEffect, useState } from 'react';
import Table from '@/components/ui/Table';
import ConcertStatusBadge from './ConcertStatusBadge';
import ConcertActions from './ConcertActions';
import { formatDateFr } from '@/utils/dateUtils';
import styles from './ConcertsTable.module.css';

// Utilisation du mémoïsation pour éviter des rendus inutiles
const ConcertsTable = memo(({ 
  concerts = [],
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
  // Gestion du tri local (par défaut sur la date, décroissant)
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  // Mesurer le temps de rendu du tableau
  useEffect(() => {
    console.time('⏱️ Rendu ConcertsTable');
    
    return () => {
      console.timeEnd('⏱️ Rendu ConcertsTable');
    };
  }, []);

  // Fonction de tri
  const sortedConcerts = [...concerts].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (sortField === 'date') {
      valA = new Date(a.date);
      valB = new Date(b.date);
    }
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Colonnes du tableau
  const columns = [
    {
      label: 'Date',
      key: 'date',
      sortable: true,
      render: (row) => (
        <span>{formatDateFr(row.date)}</span>
      )
    },
    {
      label: 'Concert',
      key: 'titre',
      sortable: true,
      render: (row) => (
        <div>
          <span className={styles.title}>{row.titre || 'Sans titre'}</span>
          {row.artisteNom && (
            <span className={styles.artistName}>{row.artisteNom}</span>
          )}
        </div>
      )
    },
    {
      label: 'Lieu',
      key: 'lieuNom',
      sortable: true,
      render: (row) => (
        <div>
          <span className={styles.locationName}>{row.lieuNom || 'Lieu non spécifié'}</span>
          {row.lieuVille && (
            <span className={styles.locationCity}>
              {row.lieuVille}
              {row.lieuCodePostal && row.lieuCodePostal.length >= 2 && ` (${row.lieuCodePostal.substring(0, 2)})`}
            </span>
          )}
        </div>
      )
    },
    {
      label: 'Programmateur',
      key: 'programmateurNom',
      sortable: true,
      render: (row) => row.programmateurNom || 'Non spécifié'
    },
    {
      label: 'Statut',
      key: 'statut',
      sortable: true,
      render: (row) => (
        <ConcertStatusBadge 
          concert={row}
          statusDetails={getStatusDetails(row.statut)}
        />
      )
    }
  ];

  // Gestion du tri
  const handleSort = (key) => {
    if (sortField === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(key);
      setSortDirection('asc');
    }
  };

  // Actions par ligne
  const renderActions = (row) => (
    <ConcertActions
      concert={row}
      hasForm={hasForm ? hasForm(row.id) : false}
      hasUnvalidatedForm={hasUnvalidatedForm ? hasUnvalidatedForm(row.id) : false}
      hasContract={hasContract ? hasContract(row.id) : false}
      contractStatus={getContractStatus ? getContractStatus(row.id) : null}
      handleViewConcert={handleViewConcert}
      handleSendForm={handleSendForm}
      handleViewForm={handleViewForm}
      handleGenerateContract={handleGenerateContract}
      handleViewContract={handleViewContract}
    />
  );

  return (
    <div className={styles.tableContainer}>
      <Table
        columns={columns}
        data={sortedConcerts}
        renderActions={renderActions}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        onRowClick={handleViewConcert}
      />
    </div>
  );
});

export default ConcertsTable;