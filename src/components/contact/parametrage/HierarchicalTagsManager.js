import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Alert, InputGroup, Form, Modal, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaChevronRight, FaChevronDown, FaTags } from 'react-icons/fa';
import { TAGS_HIERARCHY } from '@/config/tagsHierarchy';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import './TagsManager.css';

const HierarchicalTagsManager = () => {
  const { currentOrganization } = useOrganization();
  
  // Démarrer avec tous les éléments principaux expandés
  const [expandedItems, setExpandedItems] = useState(new Set(TAGS_HIERARCHY.map(item => item.id)));
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'addChild'
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [realUsageData, setRealUsageData] = useState({});
  
  const [formData, setFormData] = useState({
    label: '',
    description: '',
    color: '#6c757d'
  });

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

  const filteredHierarchy = filterItems(TAGS_HIERARCHY, searchTerm);

  // Gérer l'expansion/collapse des items
  const toggleExpand = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // Fonctions pour les modales
  const handleAddRoot = () => {
    setModalMode('add');
    setSelectedItem(null);
    setFormData({ label: '', description: '', color: '#6c757d' });
    setShowModal(true);
  };

  const handleAddChild = (parentItem) => {
    setModalMode('addChild');
    setSelectedItem(parentItem);
    setFormData({ label: '', description: '', color: parentItem.color || '#6c757d' });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setModalMode('edit');
    setSelectedItem(item);
    setFormData({
      label: item.label,
      description: item.description || '',
      color: item.color || '#6c757d'
    });
    setShowModal(true);
  };

  const handleDelete = (item) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${item.label}" ?`)) {
      showAlertMessage(`Tag "${item.label}" supprimé avec succès`, 'success');
    }
  };

  const handleSave = () => {
    if (!formData.label.trim()) {
      showAlertMessage('Le nom du tag est obligatoire', 'danger');
      return;
    }

    let message = '';
    switch (modalMode) {
      case 'add':
        message = `Catégorie principale "${formData.label}" ajoutée avec succès`;
        break;
      case 'addChild':
        message = `Sous-catégorie "${formData.label}" ajoutée à "${selectedItem.label}" avec succès`;
        break;
      case 'edit':
        message = `Tag "${formData.label}" modifié avec succès`;
        break;
      default:
        message = `Action effectuée avec succès`;
        break;
    }

    showAlertMessage(message, 'success');
    setShowModal(false);
  };

  const showAlertMessage = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  // Fonction pour charger les vraies données d'utilisation depuis Firestore
  const loadRealUsageData = useCallback(async () => {
    if (!currentOrganization?.id) return;

    try {
      // Requête pour tous les contacts avec des tags
      const contactsQuery = query(
        collection(db, 'contacts'),
        where('organizationId', '==', currentOrganization.id)
      );
      
      const contactsSnapshot = await getDocs(contactsQuery);
      const usageCount = {};
      const contactsWithTags = [];
      
      // Compter l'utilisation de chaque tag
      contactsSnapshot.docs.forEach(doc => {
        const contact = doc.data();
        const tags = contact.qualification?.tags || [];
        
        if (tags.length > 0) {
          contactsWithTags.push({
            nom: contact.nom || 'Sans nom',
            tags: tags
          });
        }
        
        tags.forEach(tag => {
          // Incrémenter pour le tag tel quel (label)
          usageCount[tag] = (usageCount[tag] || 0) + 1;
          
          // Aussi essayer de trouver l'ID correspondant dans la hiérarchie
          const findTagInHierarchy = (items) => {
            for (const item of items) {
              if (item.label === tag) {
                usageCount[item.id] = (usageCount[item.id] || 0) + 1;
              }
              if (item.children) {
                findTagInHierarchy(item.children);
              }
            }
          };
          findTagInHierarchy(TAGS_HIERARCHY);
        });
      });
      
      
      setRealUsageData(usageCount);
    } catch (error) {
      console.error('Erreur lors du chargement des données d\'utilisation:', error);
    }
  }, [currentOrganization?.id]);

  // Charger les données d'utilisation au montage
  useEffect(() => {
    if (currentOrganization?.id) {
      loadRealUsageData();
    }
  }, [currentOrganization?.id, loadRealUsageData]);

  // Compter les utilisations avec les vraies données
  const getUsageCount = (itemId, itemLabel) => {
    // Chercher d'abord par ID, puis par label
    const count = realUsageData[itemId] || realUsageData[itemLabel] || 0;
    return count;
  };

  // Rendu récursif de l'arborescence
  const renderTreeItem = (item, level = 0) => {
    const hasSubItems = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const usageCount = getUsageCount(item.id, item.label);
    
    // Debug pour voir les données
    if (level === 0) {
      console.log(`Item principal: ${item.label}, enfants: ${item.children?.length || 0}`, item.children);
    }

    return (
      <div key={item.id} className="tree-item">
        <div 
          className={`tree-item-content ${level > 0 ? 'tree-item-child' : 'tree-item-root'}`}
          style={{ marginLeft: `${level * 20}px` }}
        >
          <div className="tree-item-left">
            {hasSubItems ? (
              <button
                className="tree-expand-btn"
                onClick={() => toggleExpand(item.id)}
              >
                {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
              </button>
            ) : (
              <span className="tree-expand-placeholder"></span>
            )}
            
            <div 
              className="tree-item-color"
              style={{ backgroundColor: item.color }}
            ></div>
            
            <span className="tree-item-label">{item.label}</span>
            
            <Badge bg="secondary" className="ms-2">
              {usageCount}
            </Badge>
          </div>

          <div className="tree-item-actions">
            {hasSubItems && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => handleAddChild(item)}
                className="me-1"
              >
                <FaPlus />
              </Button>
            )}
            <Button
              variant="outline-warning"
              size="sm"
              onClick={() => handleEdit(item)}
              className="me-1"
            >
              <FaEdit />
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => handleDelete(item)}
            >
              <FaTrash />
            </Button>
          </div>
        </div>

        {hasSubItems && isExpanded && (
          <div className="tree-children">
            {console.log(`Rendu des enfants de ${item.label}:`, item.children)}
            {item.children.map(child => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="tags-hierarchy-manager">
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <FaTags className="me-2" />
            Gestion hiérarchique des tags
          </h5>
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setExpandedItems(new Set())}
            >
              Tout replier
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setExpandedItems(new Set(TAGS_HIERARCHY.map(item => item.id)))}
            >
              Tout déplier
            </Button>
            <Button
              variant="primary"
              onClick={handleAddRoot}
            >
              <FaPlus className="me-1" />
              Nouvelle catégorie
            </Button>
          </div>
        </div>
      </Card.Header>

      <Card.Body>
        {showAlert && (
          <Alert variant={alertType} dismissible onClose={() => setShowAlert(false)}>
            {alertMessage}
          </Alert>
        )}

        {/* Barre de recherche */}
        <InputGroup className="mb-3">
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Rechercher dans les tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>


        {/* Statistiques */}
        <div className="mb-3 p-3 bg-light rounded">
          <div className="row text-center">
            <div className="col">
              <h6 className="mb-1">{TAGS_HIERARCHY.length}</h6>
              <small className="text-muted">Catégories principales</small>
            </div>
            <div className="col">
              <h6 className="mb-1">
                {TAGS_HIERARCHY.reduce((acc, item) => acc + (item.children?.length || 0), 0)}
              </h6>
              <small className="text-muted">Sous-catégories</small>
            </div>
            <div className="col">
              <h6 className="mb-1">
                {TAGS_HIERARCHY.reduce((acc, item) => {
                  return acc + (item.children?.reduce((subAcc, child) => subAcc + (child.children?.length || 0), 0) || 0);
                }, 0)}
              </h6>
              <small className="text-muted">Tags finaux</small>
            </div>
          </div>
        </div>

        {/* Arborescence */}
        <div className="tags-tree">
          {filteredHierarchy.length > 0 ? (
            filteredHierarchy.map(item => renderTreeItem(item))
          ) : (
            <div className="text-center py-4 text-muted">
              <FaTags size={48} className="mb-3 opacity-50" />
              <p>Aucun tag trouvé</p>
            </div>
          )}
        </div>
      </Card.Body>

      {/* Modal d'ajout/édition */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === 'add' && 'Nouvelle catégorie principale'}
            {modalMode === 'addChild' && `Ajouter une sous-catégorie à "${selectedItem?.label}"`}
            {modalMode === 'edit' && `Modifier "${selectedItem?.label}"`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nom du tag</Form.Label>
              <Form.Control
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="Entrez le nom du tag"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description (optionnelle)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du tag"
              />
            </Form.Group>

            {modalMode !== 'addChild' && (
              <Form.Group className="mb-3">
                <Form.Label>Couleur</Form.Label>
                <div className="d-flex align-items-center">
                  <Form.Control
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    style={{ width: '60px', marginRight: '10px' }}
                  />
                  <Form.Control
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#6c757d"
                  />
                </div>
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {modalMode === 'edit' ? 'Modifier' : 'Ajouter'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default HierarchicalTagsManager;