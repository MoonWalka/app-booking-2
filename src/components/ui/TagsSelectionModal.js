import React, { useState, useEffect } from 'react';
import { Modal, Card, Badge, Form, Button } from 'react-bootstrap';
import { FaChevronRight, FaChevronDown, FaCheck } from 'react-icons/fa';
import { TAGS_HIERARCHY, GENRES_HIERARCHY, RESEAUX_HIERARCHY, MOTS_CLES_HIERARCHY } from '@/config/tagsHierarchy';
import styles from './TagsSelectionModal.module.css';

/**
 * Modale de sélection hiérarchique des tags
 * Affiche 4 colonnes avec les hiérarchies de chaque type
 */
const TagsSelectionModal = ({ 
  show, 
  onHide, 
  selectedTags = [], 
  onTagsChange,
  title = "Sélectionner des tags"
}) => {
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [localSelectedTags, setLocalSelectedTags] = useState([]);
  const [showOnlyUsed, setShowOnlyUsed] = useState(false);

  // Initialiser les tags locaux quand la modale s'ouvre
  useEffect(() => {
    if (show) {
      setLocalSelectedTags([...selectedTags]);
      // Déplier les éléments principaux par défaut
      const defaultExpanded = new Set();
      [TAGS_HIERARCHY, GENRES_HIERARCHY, RESEAUX_HIERARCHY, MOTS_CLES_HIERARCHY].forEach(hierarchy => {
        hierarchy.forEach(item => defaultExpanded.add(item.id));
      });
      setExpandedItems(defaultExpanded);
    }
  }, [show, selectedTags]);

  // Configuration des colonnes
  const columns = [
    {
      id: 'activites',
      title: 'Activités',
      icon: 'bi-music-note-beamed',
      hierarchy: TAGS_HIERARCHY,
      color: '#6f42c1'
    },
    {
      id: 'genres',
      title: 'Genres',
      icon: 'bi-disc',
      hierarchy: GENRES_HIERARCHY,
      color: '#e91e63'
    },
    {
      id: 'reseaux',
      title: 'Réseaux',
      icon: 'bi-share',
      hierarchy: RESEAUX_HIERARCHY,
      color: '#2196f3'
    },
    {
      id: 'mots-cles',
      title: 'Mots-clés',
      icon: 'bi-tags',
      hierarchy: MOTS_CLES_HIERARCHY,
      color: '#9c27b0'
    }
  ];

  // Gestion de l'expansion/collapse
  const toggleExpand = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // Gestion de la sélection/désélection des tags
  const toggleTagSelection = (tagLabel) => {
    const newSelection = [...localSelectedTags];
    const index = newSelection.indexOf(tagLabel);
    
    if (index > -1) {
      newSelection.splice(index, 1);
    } else {
      newSelection.push(tagLabel);
    }
    
    setLocalSelectedTags(newSelection);
  };

  // Vérifier si un tag est sélectionné
  const isTagSelected = (tagLabel) => {
    return localSelectedTags.includes(tagLabel);
  };

  // Filtrer les items selon le terme de recherche
  const filterItems = (items, term) => {
    if (!term) return items;
    
    return items.filter(item => {
      const matchesLabel = item.label.toLowerCase().includes(term.toLowerCase());
      const hasMatchingChildren = item.children && 
        item.children.some(child => filterItems([child], term).length > 0);
      return matchesLabel || hasMatchingChildren;
    });
  };

  // Filtrer pour n'afficher que les tags utilisés (sélectionnés)
  const filterUsedItems = (items) => {
    return items.filter(item => {
      const isUsed = localSelectedTags.includes(item.label);
      const hasUsedChildren = item.children && 
        item.children.some(child => filterUsedItems([child]).length > 0);
      
      if (isUsed || hasUsedChildren) {
        if (item.children) {
          // Retourner l'item avec seulement les enfants utilisés
          return {
            ...item,
            children: filterUsedItems(item.children)
          };
        }
        return item;
      }
      return false;
    }).filter(Boolean);
  };

  // Rendu récursif de l'arborescence pour une colonne
  const renderTreeItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isSelected = isTagSelected(item.label);

    return (
      <div key={item.id} className={styles.treeItem}>
        <div 
          className={`${styles.treeItemContent} ${isSelected ? styles.selected : ''}`}
          style={{ marginLeft: `${level * 15}px` }}
          onClick={() => toggleTagSelection(item.label)}
        >
          <div className={styles.treeItemLeft}>
            {hasChildren ? (
              <button
                className={styles.expandButton}
                onClick={(e) => {
                  e.stopPropagation(); // Empêcher la sélection du tag
                  toggleExpand(item.id);
                }}
                type="button"
              >
                {isExpanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
              </button>
            ) : (
              <span style={{ width: '14px', display: 'inline-block' }}></span>
            )}
            
            <div 
              className={styles.tagColor}
              style={{ backgroundColor: item.color || '#6c757d' }}
            ></div>
            
            <span 
              className={`${styles.tagLabel} ${level === 0 ? styles.mainCategory : ''}`}
            >
              {item.label}
            </span>
          </div>

          <div className={styles.treeItemRight}>
            {isSelected && (
              <FaCheck className={styles.selectedIcon} />
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className={styles.treeChildren}>
            {item.children.map(child => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Rendu d'une colonne
  const renderColumn = (column) => {
    let hierarchyToShow = column.hierarchy;
    
    // Appliquer le filtre de recherche
    if (searchTerm) {
      hierarchyToShow = filterItems(hierarchyToShow, searchTerm);
    }
    
    // Appliquer le filtre "utilisés seulement" si activé
    if (showOnlyUsed) {
      hierarchyToShow = filterUsedItems(hierarchyToShow);
    }

    return (
      <div key={column.id} className={styles.column}>
        <Card className={styles.columnCard}>
          <Card.Header className={styles.columnHeader} style={{ borderColor: column.color }}>
            <div className={styles.columnTitle}>
              <div className={styles.titleSection}>
                <i className={`${column.icon} me-2`} style={{ color: column.color }}></i>
                <strong>{column.title}</strong>
              </div>
              <Button
                variant="outline-secondary"
                size="sm"
                className={styles.filterButton}
                active={showOnlyUsed}
                onClick={() => setShowOnlyUsed(!showOnlyUsed)}
                title={showOnlyUsed ? 'Afficher tous les tags' : 'Afficher seulement les tags utilisés'}
              >
                <i className={showOnlyUsed ? 'bi bi-eye' : 'bi bi-funnel'}></i>
              </Button>
            </div>
          </Card.Header>
          <Card.Body className={styles.columnBody}>
            <div className={styles.treeContainer}>
              {hierarchyToShow.length > 0 ? (
                hierarchyToShow.map(item => renderTreeItem(item))
              ) : (
                <div className={styles.emptyState}>
                  <i className={showOnlyUsed ? 'bi bi-tags' : 'bi bi-search'}></i>
                  <p>{showOnlyUsed ? 'Aucun tag utilisé' : 'Aucun résultat'}</p>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  };

  // Sauvegarder et fermer
  const handleSave = () => {
    onTagsChange(localSelectedTags);
    onHide();
  };

  // Annuler et fermer
  const handleCancel = () => {
    setLocalSelectedTags([...selectedTags]);
    onHide();
  };

  return (
    <Modal 
      show={show} 
      onHide={handleCancel}
      size="xl"
      className={styles.tagsModal}
      centered
    >
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title>
          <i className="bi bi-tags me-2"></i>
          {title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className={styles.modalBody}>
        {/* Barre de recherche */}
        <div className={styles.searchContainer}>
          <Form.Control
            type="text"
            placeholder="Rechercher dans tous les tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Tags sélectionnés */}
        {localSelectedTags.length > 0 && (
          <div className={styles.selectedTagsContainer}>
            <strong>Tags sélectionnés ({localSelectedTags.length}) :</strong>
            <div className={styles.selectedTags}>
              {localSelectedTags.map((tag, index) => (
                <Badge 
                  key={index}
                  bg="primary" 
                  className={styles.selectedTag}
                  onClick={() => toggleTagSelection(tag)}
                >
                  {tag}
                  <i className="bi bi-x ms-1"></i>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Colonnes des hiérarchies */}
        <div className={styles.columnsContainer}>
          {columns.map(column => renderColumn(column))}
        </div>
      </Modal.Body>

      <Modal.Footer className={styles.modalFooter}>
        <Button variant="secondary" onClick={handleCancel}>
          Annuler
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Confirmer ({localSelectedTags.length} tag{localSelectedTags.length > 1 ? 's' : ''})
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TagsSelectionModal;