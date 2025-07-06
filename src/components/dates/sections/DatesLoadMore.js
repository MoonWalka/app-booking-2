// src/components/dates/sections/DatesLoadMore.js
import React from 'react';
import { Button, Spinner } from 'react-bootstrap';

/**
 * Composant pour charger plus de dates (pagination)
 */
const DatesLoadMore = ({ loading, hasMore, onLoadMore }) => {
  if (!hasMore) {
    return (
      <div className="text-center mt-4 mb-4">
        <p className="text-muted">Tous les dates ont été chargés</p>
      </div>
    );
  }

  return (
    <div className="text-center mt-4 mb-4">
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
            <span>Charger plus de dates</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default DatesLoadMore;
