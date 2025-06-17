import React from 'react';
import { Form } from 'react-bootstrap';
import { getTagCssClass, getTagColor } from '@/config/tagsConfig';
import styles from './TagsInput.module.css';

/**
 * Composant TagsInput - Gestion des tags avec sélection et suppression
 */
const TagsInput = ({ 
  tags = [], 
  availableTags = [], 
  onChange, 
  label = "Tags",
  placeholder = "Sélectionner un tag...",
  className = ""
}) => {
  
  const handleAddTag = (e) => {
    const newTag = e.target.value;
    if (newTag && !tags.includes(newTag)) {
      onChange([...tags, newTag]);
    }
    e.target.value = '';
  };
  
  const handleRemoveTag = (tagToRemove) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
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
      
      {/* Sélecteur de tags */}
      <Form.Select 
        className={styles.tagSelect}
        onChange={handleAddTag}
        value=""
      >
        <option value="">{placeholder}</option>
        {availableTags
          .filter(tag => !tags.includes(tag))
          .map(tag => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))
        }
      </Form.Select>
    </div>
  );
};

export default TagsInput;