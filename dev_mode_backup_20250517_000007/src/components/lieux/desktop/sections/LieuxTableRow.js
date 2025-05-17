import React from 'react';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import styles from './LieuxTableRow.module.css';

/**
 * Component for a single row in the lieux table
 */
const LieuxTableRow = ({ lieu, onRowClick, onDelete }) => {
  // Helper functions for getting badge colors and labels
  const getJaugeColor = (jauge) => {
    if (!jauge) return 'secondary';
    if (jauge < 200) return 'info';
    if (jauge < 500) return 'success';
    if (jauge < 1000) return 'warning';
    return 'danger';
  };
  
  const getJaugeLabel = (jauge) => {
    if (!jauge) return 'Non spécifiée';
    if (jauge < 200) return 'Petite';
    if (jauge < 500) return 'Moyenne';
    if (jauge < 1000) return 'Grande';
    return 'Très grande';
  };
  
  const getTypeBadgeColor = (type) => {
    switch(type) {
      case 'festival': return 'danger';
      case 'salle': return 'success';
      case 'bar': return 'info';
      case 'plateau': return 'warning';
      default: return 'secondary';
    }
  };
  
  const formatType = (type) => {
    if (!type) return 'Non spécifié';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Prevent the click on links and buttons from navigating to the row
  const handleActionClick = (e) => {
    e.stopPropagation();
  };

  return (
    <tr 
      className={`${styles.tableRow} ${styles.clickableRow} ${styles.tableRowAnimate}`}
      onClick={() => onRowClick(lieu.id)}
    >
      <td className="fw-medium">
        <div className="d-flex align-items-center">
          <i className="bi bi-geo-alt me-2 text-primary"></i>
          {lieu.nom || <span className="text-muted">Sans nom</span>}
        </div>
      </td>
      <td>
        {lieu.type ? (
          <span className={`${styles.typeBadge} bg-${getTypeBadgeColor(lieu.type)}`}>
            {formatType(lieu.type)}
          </span>
        ) : (
          <span className="text-muted">Non spécifié</span>
        )}
      </td>
      <td>
        {lieu.ville ? (
          <span className={styles.villeBadge}>
            {lieu.ville}
            {lieu.codePostal && ` (${lieu.codePostal})`}
          </span>
        ) : (
          <span className="text-muted">-</span>
        )}
      </td>
      <td>
        {lieu.jauge ? (
          <span className={`${styles.jaugeBadge} bg-${getJaugeColor(lieu.jauge)}`}>
            {lieu.jauge} places <span className={styles.jaugeType}>({getJaugeLabel(lieu.jauge)})</span>
          </span>
        ) : (
          <span className="text-muted">Non spécifiée</span>
        )}
      </td>
      <td>
        {lieu.concertsAssocies && lieu.concertsAssocies.length > 0 ? (
          <span className={styles.concertCount}>
            <i className="bi bi-music-note-beamed me-1"></i>
            {lieu.concertsAssocies.length} concert{lieu.concertsAssocies.length > 1 ? 's' : ''}
          </span>
        ) : (
          <span className="text-muted">Aucun concert</span>
        )}
      </td>
      <td className="text-end">
        <div className={styles.actionButtons}>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Voir le lieu</Tooltip>}
          >
            <Link 
              to={`/lieux/${lieu.id}`} 
              className={`btn btn-secondary ${styles.actionButton}`}
              onClick={handleActionClick}
            >
              <i className="bi bi-eye"></i>
            </Link>
          </OverlayTrigger>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Modifier le lieu</Tooltip>}
          >
            <Link 
              to={`/lieux/edit/${lieu.id}`} 
              className={`btn btn-outline-primary ${styles.actionButton}`}
              onClick={handleActionClick}
            >
              <i className="bi bi-pencil"></i>
            </Link>
          </OverlayTrigger>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Supprimer le lieu</Tooltip>}
          >
            <button 
              onClick={(e) => { onDelete(lieu.id, e); handleActionClick(e); }} 
              className={`btn btn-danger ${styles.actionButton}`}
            >
              <i className="bi bi-trash"></i>
            </button>
          </OverlayTrigger>
        </div>
      </td>
    </tr>
  );
};

export default LieuxTableRow;