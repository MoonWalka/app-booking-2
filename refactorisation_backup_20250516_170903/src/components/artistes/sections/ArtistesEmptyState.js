// src/components/artistes/sections/ArtistesEmptyState.js
import React from 'react';
import { Card, Button } from 'react-bootstrap';
import styles from './ArtistesEmptyState.module.css';

/**
 * Component to display when there are no artists or no search results
 */
const ArtistesEmptyState = ({ searchTerm, onAddClick }) => {
  return (
    <Card className="text-center py-5">
      <Card.Body>
        <i className="bi bi-music-note-list display-1 text-muted mb-3"></i>
        <h3>Aucun artiste trouvé</h3>
        {searchTerm ? (
          <p>Aucun résultat pour la recherche "{searchTerm}"</p>
        ) : (
          <p>Vous n'avez pas encore ajouté d'artistes</p>
        )}
        <Button
          variant="primary"
          className="mt-3"
          onClick={onAddClick}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Ajouter un artiste
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ArtistesEmptyState;