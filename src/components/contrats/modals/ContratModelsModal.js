import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Form, Button, Table, Badge } from 'react-bootstrap';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import styles from './ContratModelsModal.module.css';

/**
 * Modale de sélection des modèles de contrat
 */
const ContratModelsModal = ({ show, onHide, onValidate, selectedModels = [], required = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModelIds, setSelectedModelIds] = useState(new Set(selectedModels.map(m => m.id)));
  const [sortConfig, setSortConfig] = useState({ key: 'nom', direction: 'asc' });
  const [availableModels, setAvailableModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentOrganization } = useOrganization();

  // Charger les modèles depuis Firebase
  useEffect(() => {
    const loadTemplates = async () => {
      if (!currentOrganization?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Temporairement, charger tous les modèles pour debug
        console.log('[ContratModelsModal] Organization ID actuel:', currentOrganization.id);
        const templatesQuery = query(
          collection(db, 'contratTemplates')
          // where('organizationId', '==', currentOrganization.id) // Désactivé temporairement
        );
        
        const snapshot = await getDocs(templatesQuery);
        const templates = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('[ContratModelsModal] Modèle trouvé:', {
            id: doc.id,
            name: data.name,
            organizationId: data.organizationId
          });
          return {
            id: doc.id,
            nom: data.name,
            type: data.templateType || 'Standard',
            bodyContent: data.bodyContent,
            isDefault: data.isDefault || false
          };
        });
        
        // Trier par nom en JavaScript
        templates.sort((a, b) => a.nom.localeCompare(b.nom));
        
        setAvailableModels(templates);
      } catch (error) {
        console.error('Erreur lors du chargement des modèles:', error);
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      loadTemplates();
    }
  }, [show, currentOrganization?.id]);

  // Anciens modèles codés en dur (remplacés par Firebase)
  const oldHardcodedModels = [
    {
      id: 1,
      nom: 'Cession – date unique',
      langue: 'Français',
      type: 'Cession'
    },
    {
      id: 2,
      nom: 'Cession – dates multiples',
      langue: 'Français canadien',
      type: 'Cession'
    },
    {
      id: 3,
      nom: 'Coréalisation avec seuil',
      langue: 'Français',
      type: 'Coréo'
    },
    {
      id: 4,
      nom: 'Promo locale – date unique',
      langue: 'Français',
      type: 'Promo'
    },
    {
      id: 5,
      nom: 'Contrat résidence artistique',
      langue: 'Français',
      type: 'Résidence'
    },
    {
      id: 6,
      nom: 'Convention de partenariat',
      langue: 'Français',
      type: 'Partenariat'
    }
  ];

  // Synchroniser les modèles sélectionnés au changement des props
  useEffect(() => {
    setSelectedModelIds(new Set(selectedModels.map(m => m.id)));
  }, [selectedModels]);

  // Filtrage et tri des modèles
  const filteredAndSortedModels = useMemo(() => {
    let filtered = availableModels;

    // Filtrage par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(model =>
        model.nom.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Tri
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (sortConfig.direction === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return filtered;
  }, [availableModels, searchTerm, sortConfig]);

  // Modèles sélectionnés dans l'ordre de sélection
  const orderedSelectedModels = useMemo(() => {
    return availableModels.filter(model => selectedModelIds.has(model.id));
  }, [availableModels, selectedModelIds]);

  // Gestion de la sélection/désélection d'un modèle
  const toggleModel = (modelId) => {
    const newSelected = new Set(selectedModelIds);
    if (newSelected.has(modelId)) {
      newSelected.delete(modelId);
    } else {
      newSelected.add(modelId);
    }
    setSelectedModelIds(newSelected);
  };

  // Sélection/désélection de tous les modèles visibles
  const toggleAllModels = () => {
    const visibleModelIds = filteredAndSortedModels.map(m => m.id);
    const allVisible = visibleModelIds.every(id => selectedModelIds.has(id));
    
    const newSelected = new Set(selectedModelIds);
    if (allVisible) {
      // Désélectionner tous les visibles
      visibleModelIds.forEach(id => newSelected.delete(id));
    } else {
      // Sélectionner tous les visibles
      visibleModelIds.forEach(id => newSelected.add(id));
    }
    setSelectedModelIds(newSelected);
  };

  // Gestion du tri
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Validation et fermeture
  const handleValidate = () => {
    const selectedModelsList = availableModels.filter(model => 
      selectedModelIds.has(model.id)
    );
    onValidate(selectedModelsList);
    onHide();
  };

  // Reset à la fermeture (seulement si pas obligatoire ou si au moins un modèle sélectionné)
  const handleClose = () => {
    if (required && selectedModelIds.size === 0) {
      // Empêcher la fermeture si aucun modèle sélectionné et que c'est obligatoire
      return;
    }
    setSearchTerm('');
    setSelectedModelIds(new Set(selectedModels.map(m => m.id)));
    onHide();
  };

  const allVisibleSelected = filteredAndSortedModels.length > 0 && 
    filteredAndSortedModels.every(model => selectedModelIds.has(model.id));

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      size="xl" 
      className={styles.modal}
      backdrop={required ? "static" : true}
      keyboard={!required}
    >
      <Modal.Header closeButton={!required || selectedModelIds.size > 0} className={styles.header}>
        <Modal.Title className={styles.title}>Modifier</Modal.Title>
      </Modal.Header>
      
      <Modal.Body className={styles.body}>
        <div className={styles.subtitle}>
          <h5>Choisissez quel(s) modèle(s) de contrat associer à ce projet</h5>
          <p className={styles.instructions}>
            Chaque projet peut être associé à un ou plusieurs modèles de contrat. 
            Choisissez-les parmi la liste, ou créez un nouveau modèle de contrat 
            depuis les paramètres de l'application.
          </p>
        </div>

        <div className={styles.content}>
          {/* Zone de sélection (gauche) */}
          <div className={styles.selectionZone}>
            <div className={styles.selectionHeader}>
              <Form.Check
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleAllModels}
                className={styles.masterCheckbox}
              />
              <Form.Control
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              <i className="bi bi-search"></i>
            </div>

            <div className={styles.tableContainer}>
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                  <p className="text-muted mt-2">Chargement des modèles...</p>
                </div>
              ) : availableModels.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-file-earmark-text text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-2">Aucun modèle de contrat disponible</p>
                  <p className="small text-muted">Créez des modèles depuis Admin {'>'} Paramétrage {'>'} Modèles de contrat</p>
                </div>
              ) : (
                <Table hover className={styles.table}>
                  <thead>
                    <tr>
                      <th width="50"></th>
                      <th 
                        className={styles.sortableHeader}
                        onClick={() => handleSort('nom')}
                      >
                        Nom
                        {sortConfig.key === 'nom' && (
                          <i className={`bi bi-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                      </th>
                      <th>Type</th>
                      <th>Défaut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedModels.map(model => (
                      <tr key={model.id}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedModelIds.has(model.id)}
                            onChange={() => toggleModel(model.id)}
                          />
                        </td>
                        <td>{model.nom}</td>
                        <td>
                          <Badge variant="secondary">{model.type}</Badge>
                        </td>
                        <td>
                          {model.isDefault && (
                            <Badge bg="success">
                              <i className="bi bi-star-fill me-1"></i>
                              Par défaut
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          </div>

          {/* Panneau modèles sélectionnés (droite) */}
          <div className={styles.selectedPanel}>
            <h6 className={styles.selectedTitle}>Modèles sélectionnés</h6>
            <div className={styles.selectedList}>
              {orderedSelectedModels.length === 0 ? (
                <div className={styles.emptyMessage}>—</div>
              ) : (
                orderedSelectedModels.map(model => (
                  <div key={model.id} className={styles.selectedItem}>
                    <span className={styles.selectedName}>{model.nom}</span>
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => toggleModel(model.id)}
                      title="Retirer"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className={styles.footer}>
        <Button
          variant="primary"
          onClick={handleValidate}
          disabled={selectedModelIds.size === 0}
          className={styles.validateButton}
        >
          Valider
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ContratModelsModal;