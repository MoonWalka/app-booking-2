import React from 'react';
import { getTagColor, getTagCssClass } from '@/config/tagsConfig';
import styles from '../ContactViewTabs.module.css';

/**
 * Section de gestion des tags d'un contact
 * Affiche les tags actuels et permet leur modification
 */
const ContactTagsSection = React.memo(({ tags = [], onRemoveTag }) => {
  return (
    <div className={styles.tagsContent}>
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
                className={styles.removeTag}
                onClick={() => onRemoveTag(tag)}
                title="Supprimer ce tag"
              >
                <i className="bi bi-x"></i>
              </button>
            </span>
          ))
        ) : (
          <div className={styles.noTags}>
            <i className="bi bi-tags" style={{ fontSize: '1.2rem', color: '#6c757d' }}></i>
            <span>Aucun tag défini</span>
          </div>
        )}
      </div>
    </div>
  );
});

ContactTagsSection.displayName = 'ContactTagsSection';

export default ContactTagsSection;