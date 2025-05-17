// src/components/artistes/sections/ArtisteRow.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button } from 'react-bootstrap';
import styles from './ArtisteRow.module.css';

/**
 * Row component for a single artist in the table
 */
const ArtisteRow = ({ artiste, onDelete }) => {
  // Helper function to get the number of concerts for an artist
  const getNbConcerts = (artiste) => {
    if (!artiste.concertsAssocies) return 0;
    return artiste.concertsAssocies.length;
  };

  return (
    <tr className={artiste.estGroupeFavori ? styles.favoriteArtisteRow : ''}>
      <td className={styles.artisteNameCell}>
        <Link to={`/artistes/${artiste.id}`} className="d-flex align-items-center text-decoration-none">
          <div className={styles.artisteAvatar + " me-3"}>
            {artiste.photoPrincipale ? (
              <img src={artiste.photoPrincipale} alt={artiste.nom} className="img-fluid" />
            ) : (
              <div className={styles.placeholderAvatar}>
                <i className="bi bi-music-note"></i>
              </div>
            )}
          </div>
          <div className="text-truncate">
            <div className="fw-bold d-flex align-items-center text-truncate">
              <span className="text-truncate">{artiste.nom}</span>
              {artiste.estGroupeFavori && (
                <i className="bi bi-star-fill text-warning ms-2 flex-shrink-0"></i>
              )}
            </div>
            {artiste.genre && <div className="small text-muted text-truncate">{artiste.genre}</div>}
          </div>
        </Link>
      </td>
      <td>
        {artiste.ville ? (
          <div className="d-flex align-items-center">
            <i className="bi bi-geo-alt text-muted me-2 flex-shrink-0"></i>
            <span className="text-truncate">{artiste.ville}</span>
          </div>
        ) : (
          <span className="text-muted" aria-label="Pas de lieu spécifié">-</span>
        )}
      </td>
      <td>
        {artiste.cachetMoyen ? (
          <div className="d-flex align-items-center">
            <i className="bi bi-cash text-muted me-2 flex-shrink-0"></i>
            <span className="text-nowrap">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(artiste.cachetMoyen)}</span>
          </div>
        ) : (
          <span className="text-muted" aria-label="Pas de cachet spécifié">-</span>
        )}
      </td>
      <td>
        {getNbConcerts(artiste) > 0 ? (
          <Badge bg="primary" className="px-2 py-1 d-inline-flex align-items-center">
            <i className="bi bi-music-note-beamed me-1"></i>
            {getNbConcerts(artiste)}
          </Badge>
        ) : (
          <Badge bg="secondary" className="px-2 py-1" aria-label="Aucun concert">0</Badge>
        )}
      </td>
      <td>
        <div className="d-flex align-items-center gap-2">
          <Button 
            as={Link} 
            to={`/artistes/${artiste.id}`} 
            variant="outline-primary" 
            size="sm" 
            className="d-flex align-items-center"
          >
            <i className="bi bi-eye me-1"></i>Voir
          </Button>
          <Button 
            as={Link} 
            to={`/artistes/${artiste.id}/modifier`} 
            variant="outline-secondary" 
            size="sm" 
            className="d-flex align-items-center"
          >
            <i className="bi bi-pencil me-1"></i>Modifier
          </Button>
          <Button 
            variant="outline-danger"
            size="sm"
            onClick={(e) => onDelete(artiste.id, e)}
            aria-label="Supprimer l'artiste"
          >
            <i className="bi bi-trash"></i>
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default ArtisteRow;