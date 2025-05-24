// src/components/artistes/sections/ArtistesListHeader.js
import React from 'react';
import { Button } from 'react-bootstrap';
import styles from './ArtistesListHeader.module.css';

/**
 * Header component for the artists list with title and add button
 * @param {Object} props - Component props
 * @param {Function} props.onAddClick - Function to handle add artist button click
 */
const ArtistesListHeader = ({ onAddClick }) => {
  return (
    <div className={`row mb-4 align-items-center ${styles.header}`}>
      <div className="col">
        <h1 className={`mb-0 ${styles.title}`}>
          <i className="bi bi-music-note-list me-2"></i>
          Gestion des artistes
        </h1>
      </div>
      <div className="col-auto">
        <Button 
          variant="primary"
          onClick={onAddClick}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nouvel artiste
        </Button>
      </div>
    </div>
  );
};

export default ArtistesListHeader;