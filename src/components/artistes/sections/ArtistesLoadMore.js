// src/components/artistes/sections/ArtistesLoadMore.js
import React from 'react';
import { Button, Spinner } from 'react-bootstrap';

/**
 * Component to load more artists (pagination)
 */
const ArtistesLoadMore = ({ loading, onLoadMore }) => {
  return (
    <div className="text-center mt-4">
      <Button 
        variant="outline-primary"
        onClick={onLoadMore}
        disabled={loading}
        className="px-4 py-2 d-inline-flex align-items-center"
      >
        {loading ? (
          <>
            <Spinner animation="border" size="sm" className="me-2" />
            <span>Chargement...</span>
          </>
        ) : (
          <>
            <i className="bi bi-plus-circle me-2"></i>
            <span>Charger plus d'artistes</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default ArtistesLoadMore;