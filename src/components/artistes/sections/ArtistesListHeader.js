// src/components/artistes/sections/ArtistesListHeader.js
import React from 'react';
import usePermissions from '@/hooks/usePermissions';
import styles from './ArtistesListHeader.module.css';

/**
 * Header component for the artists list with title and add button
 * @param {Object} props - Component props
 * @param {Function} props.onAddClick - Function to handle add artist button click
 */
const ArtistesListHeader = ({ onAddClick }) => {
  const { canCreate } = usePermissions();
  return (
    <div className={`row mb-4 align-items-center ${styles.header}`}>
      <div className="col">
        <h1 className={`mb-0 ${styles.title}`}>
          <i className="bi bi-music-note-list me-2"></i>
          Gestion des artistes
        </h1>
      </div>
      <div className="col-auto">
        {canCreate('artistes') && (
          <button 
            className={styles.addButton}
            onClick={onAddClick}
          >
            <i className="bi bi-plus-lg"></i>
            Ajouter un artiste
          </button>
        )}
      </div>
    </div>
  );
};

export default ArtistesListHeader;