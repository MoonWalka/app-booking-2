import React from 'react';
import { useNavigate } from 'react-router-dom';
import LieuxTableRow from './LieuxTableRow';
import styles from './LieuxResultsTable.module.css';

/**
 * Component for displaying the table of lieux
 */
const LieuxResultsTable = ({ lieux, onDeleteLieu }) => {
  const navigate = useNavigate();

  const handleRowClick = (lieuId) => {
    navigate(`/lieux/${lieuId}`);
  };

  return (
    <div className={styles.tableContainer}>
      <table className={`table table-hover ${styles.modernTable}`}>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Type</th>
            <th>Ville / Code postal</th>
            <th>Jauge</th>
            <th>Concerts</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {lieux.map(lieu => (
            <LieuxTableRow 
              key={lieu.id} 
              lieu={lieu} 
              onRowClick={handleRowClick}
              onDelete={onDeleteLieu}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LieuxResultsTable;