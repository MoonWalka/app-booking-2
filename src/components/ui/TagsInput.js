import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { Form, Button } from 'react-bootstrap';
import { getTagCssClass, getTagColor } from '@/config/tagsConfig';
import TagsSelectionModal from './TagsSelectionModal';
import styles from './TagsInput.module.css';

/**
 * Composant TagsInput - Gestion des tags avec sélection et suppression
 */
const TagsInput = forwardRef(({ 
  tags = [], 
  availableTags = [], 
  onChange, 
  label = "Tags",
  placeholder = "Sélectionner un tag...",
  className = ""
}, ref) => {
  const [showModal, setShowModal] = useState(false);
  
  const handleRemoveTag = (tagToRemove) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleTagsChange = (newTags) => {
    onChange(newTags);
  };

  // Exposer la méthode pour ouvrir la modal depuis l'extérieur
  useImperativeHandle(ref, () => ({
    openModal: () => {
      setShowModal(true);
    }
  }));

  return (
    <>
      <div className={`${styles.tagsInputContainer} ${className}`}>
      <Form.Label className={styles.label}>{label}</Form.Label>
      
      {/* Tags actuels */}
      <div className={styles.currentTags}>
        {tags.length > 0 ? (
          tags.map((tag, index) => (
            <span 
              key={index} 
              className={`${styles.tag} ${styles[getTagCssClass(tag)]}`}
              style={{ backgroundColor: getTagColor(tag) }}
            >
              <i className="bi bi-tag"></i>
              {tag}
              <button 
                type="button"
                className={styles.removeTag}
                onClick={() => handleRemoveTag(tag)}
                title="Supprimer ce tag"
              >
                <i className="bi bi-x"></i>
              </button>
            </span>
          ))
        ) : (
          <div className={styles.noTags}>
            <i className="bi bi-tags" style={{ fontSize: '1rem', color: '#6c757d' }}></i>
            <span>Aucun tag défini</span>
          </div>
        )}
      </div>
      
      {/* Bouton pour ouvrir la modale */}
      <Button 
        variant="outline-primary" 
        onClick={handleOpenModal}
        className={styles.addTagButton}
      >
        <i className="bi bi-plus me-2"></i>
        Ajouter des tags
      </Button>
    </div>

      {/* Modale de sélection rendue via portail */}
      {showModal && createPortal(
        <TagsSelectionModal
          show={showModal}
          onHide={() => setShowModal(false)}
          selectedTags={tags}
          onTagsChange={handleTagsChange}
          title="Sélectionner des tags"
        />,
        document.body
      )}
    </>
  );
});

export default TagsInput;