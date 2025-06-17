import React, { useState, useMemo } from 'react';
import { Button, Form } from 'react-bootstrap';
import { collection, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import { useTaches } from '@/hooks/taches/useTaches';
import Modal from '@/components/common/Modal';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import styles from './TachesPage.module.css';

/**
 * Page principale de gestion des tâches
 * Affiche un tableau complet des tâches avec possibilité de création, modification et suppression
 */
function TachesPage() {
  const { currentOrganization } = useOrganization();
  const { taches, loading, error, refreshTaches } = useTaches();
  
  const [showModal, setShowModal] = useState(false);
  const [selectedTache, setSelectedTache] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filters, setFilters] = useState({
    statut: '',
    priorite: '',
    search: ''
  });

  // Formulaire pour créer/modifier une tâche
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    priorite: 'medium',
    statut: 'pending',
    dateEcheance: '',
    entityType: '',
    entityId: '',
    entityName: ''
  });

  // Filtrer les tâches selon les critères
  const filteredTaches = useMemo(() => {
    if (!taches) return [];
    
    return taches.filter(tache => {
      const matchesSearch = !filters.search || 
        (tache.titre && tache.titre.toLowerCase().includes(filters.search.toLowerCase())) ||
        (tache.description && tache.description.toLowerCase().includes(filters.search.toLowerCase()));
      
      const matchesStatut = !filters.statut || tache.statut === filters.statut;
      const matchesPriorite = !filters.priorite || tache.priorite === filters.priorite;
      
      return matchesSearch && matchesStatut && matchesPriorite;
    });
  }, [taches, filters]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    if (!taches) return { total: 0, pending: 0, completed: 0, overdue: 0 };
    
    const now = new Date();
    const pending = taches.filter(t => t.statut === 'pending');
    const completed = taches.filter(t => t.statut === 'completed');
    const overdue = pending.filter(t => {
      if (!t.dateEcheance) return false;
      const dueDate = new Date(t.dateEcheance);
      return dueDate < now;
    });
    
    return {
      total: taches.length,
      pending: pending.length,
      completed: completed.length,
      overdue: overdue.length
    };
  }, [taches]);

  const handleCreateTache = () => {
    setIsEditing(false);
    setSelectedTache(null);
    setFormData({
      titre: '',
      description: '',
      priorite: 'medium',
      statut: 'pending',
      dateEcheance: '',
      entityType: '',
      entityId: '',
      entityName: ''
    });
    setShowModal(true);
  };

  const handleEditTache = (tache) => {
    setIsEditing(true);
    setSelectedTache(tache);
    setFormData({
      titre: tache.titre || '',
      description: tache.description || '',
      priorite: tache.priorite || 'medium',
      statut: tache.statut || 'pending',
      dateEcheance: tache.dateEcheance || '',
      entityType: tache.entityType || '',
      entityId: tache.entityId || '',
      entityName: tache.entityName || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titre.trim()) {
      alert('Le titre est obligatoire');
      return;
    }

    if (!currentOrganization?.id) {
      alert('Aucune organisation sélectionnée');
      return;
    }

    try {
      const tacheData = {
        ...formData,
        organizationId: currentOrganization.id,
        updatedAt: serverTimestamp()
      };

      if (isEditing && selectedTache) {
        // Mise à jour
        await updateDoc(doc(db, 'taches', selectedTache.id), tacheData);
      } else {
        // Création
        tacheData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'taches'), tacheData);
      }

      setShowModal(false);
      refreshTaches();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la tâche');
    }
  };

  const handleDeleteTache = async (tacheId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'taches', tacheId));
      refreshTaches();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la tâche');
    }
  };

  const handleToggleStatut = async (tache) => {
    const newStatut = tache.statut === 'completed' ? 'pending' : 'completed';
    
    try {
      await updateDoc(doc(db, 'taches', tache.id), {
        statut: newStatut,
        dateTerminee: newStatut === 'completed' ? serverTimestamp() : null,
        updatedAt: serverTimestamp()
      });
      refreshTaches();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Basse';
      default: return priority;
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  const getStatutLabel = (statut) => {
    switch (statut) {
      case 'pending': return 'En cours';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return statut;
    }
  };

  const getStatutVariant = (statut) => {
    switch (statut) {
      case 'pending': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Chargement des tâches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h4>Erreur de chargement</h4>
          <p>{error.message}</p>
          <Button onClick={refreshTaches}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header de la page */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <i className="bi bi-check2-square me-3"></i>
          Gestion des Tâches
        </h1>
        <p className={styles.pageSubtitle}>
          Organisez et suivez vos tâches et projets
        </p>
      </div>

      {/* Statistiques */}
      <div className={styles.statsRow}>
        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statIcon}>
              <i className="bi bi-list-task"></i>
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.total}</div>
              <div className={styles.statLabel}>Total</div>
            </div>
          </div>
        </Card>
        
        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={`${styles.statIcon} ${styles.pending}`}>
              <i className="bi bi-hourglass-split"></i>
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.pending}</div>
              <div className={styles.statLabel}>En cours</div>
            </div>
          </div>
        </Card>
        
        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={`${styles.statIcon} ${styles.completed}`}>
              <i className="bi bi-check-circle"></i>
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.completed}</div>
              <div className={styles.statLabel}>Terminées</div>
            </div>
          </div>
        </Card>
        
        {stats.overdue > 0 && (
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={`${styles.statIcon} ${styles.overdue}`}>
                <i className="bi bi-exclamation-triangle"></i>
              </div>
              <div className={styles.statInfo}>
                <div className={styles.statValue}>{stats.overdue}</div>
                <div className={styles.statLabel}>En retard</div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Filters et actions */}
      <Card className={styles.filtersCard}>
        <div className={styles.filtersRow}>
          <div className={styles.filterGroup}>
            <Form.Control
              type="text"
              placeholder="Rechercher une tâche..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.filterGroup}>
            <Form.Select
              value={filters.statut}
              onChange={(e) => setFilters(prev => ({ ...prev, statut: e.target.value }))}
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En cours</option>
              <option value="completed">Terminées</option>
              <option value="cancelled">Annulées</option>
            </Form.Select>
          </div>
          
          <div className={styles.filterGroup}>
            <Form.Select
              value={filters.priorite}
              onChange={(e) => setFilters(prev => ({ ...prev, priorite: e.target.value }))}
            >
              <option value="">Toutes les priorités</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </Form.Select>
          </div>
          
          <div className={styles.actionGroup}>
            <Button variant="primary" onClick={handleCreateTache}>
              <i className="bi bi-plus-lg me-2"></i>
              Nouvelle tâche
            </Button>
          </div>
        </div>
      </Card>

      {/* Tableau des tâches */}
      <Card className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Statut</th>
                <th>Titre</th>
                <th>Priorité</th>
                <th>Échéance</th>
                <th>Liée à</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTaches.length === 0 ? (
                <tr>
                  <td colSpan="6" className={styles.emptyMessage}>
                    Aucune tâche trouvée
                  </td>
                </tr>
              ) : (
                filteredTaches.map(tache => {
                  const isOverdue = tache.dateEcheance && 
                    new Date(tache.dateEcheance) < new Date() && 
                    tache.statut === 'pending';
                  
                  return (
                    <tr 
                      key={tache.id} 
                      className={`${isOverdue ? styles.overdueRow : ''} ${tache.statut === 'completed' ? styles.completedRow : ''}`}
                    >
                      <td>
                        <div className={styles.statutCell}>
                          <input
                            type="checkbox"
                            checked={tache.statut === 'completed'}
                            onChange={() => handleToggleStatut(tache)}
                            className={styles.checkbox}
                          />
                          <Badge variant={getStatutVariant(tache.statut)}>
                            {getStatutLabel(tache.statut)}
                          </Badge>
                        </div>
                      </td>
                      <td>
                        <div className={styles.titleCell}>
                          <strong className={styles.title}>{tache.titre}</strong>
                          {tache.description && (
                            <div className={styles.description}>{tache.description}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <Badge variant={getPriorityVariant(tache.priorite)}>
                          {getPriorityLabel(tache.priorite)}
                        </Badge>
                      </td>
                      <td>
                        <div className={styles.dateCell}>
                          {formatDate(tache.dateEcheance)}
                          {isOverdue && (
                            <div className={styles.overdueIndicator}>
                              <i className="bi bi-exclamation-triangle"></i> En retard
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        {tache.entityName ? (
                          <div className={styles.entityCell}>
                            <div className={styles.entityName}>{tache.entityName}</div>
                            <div className={styles.entityType}>{tache.entityType}</div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <div className={styles.actionsCell}>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEditTache(tache)}
                            className="me-2"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteTache(tache.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de création/édition */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? 'Modifier la tâche' : 'Nouvelle tâche'}
      >
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Titre *</Form.Label>
            <Form.Control
              type="text"
              value={formData.titre}
              onChange={(e) => setFormData(prev => ({ ...prev, titre: e.target.value }))}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </Form.Group>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Priorité</Form.Label>
                <Form.Select
                  value={formData.priorite}
                  onChange={(e) => setFormData(prev => ({ ...prev, priorite: e.target.value }))}
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Statut</Form.Label>
                <Form.Select
                  value={formData.statut}
                  onChange={(e) => setFormData(prev => ({ ...prev, statut: e.target.value }))}
                >
                  <option value="pending">En cours</option>
                  <option value="completed">Terminée</option>
                  <option value="cancelled">Annulée</option>
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Date d'échéance</Form.Label>
            <Form.Control
              type="date"
              value={formData.dateEcheance}
              onChange={(e) => setFormData(prev => ({ ...prev, dateEcheance: e.target.value }))}
            />
          </Form.Group>

          <div className="row">
            <div className="col-md-4">
              <Form.Group className="mb-3">
                <Form.Label>Type d'entité liée</Form.Label>
                <Form.Select
                  value={formData.entityType}
                  onChange={(e) => setFormData(prev => ({ ...prev, entityType: e.target.value }))}
                >
                  <option value="">Aucune</option>
                  <option value="concert">Concert</option>
                  <option value="contact">Contact</option>
                  <option value="contrat">Contrat</option>
                  <option value="lieu">Lieu</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group className="mb-3">
                <Form.Label>ID entité</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.entityId}
                  onChange={(e) => setFormData(prev => ({ ...prev, entityId: e.target.value }))}
                  placeholder="ID de l'entité"
                />
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group className="mb-3">
                <Form.Label>Nom entité</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.entityName}
                  onChange={(e) => setFormData(prev => ({ ...prev, entityName: e.target.value }))}
                  placeholder="Nom de l'entité"
                />
              </Form.Group>
            </div>
          </div>

          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
              Annuler
            </Button>
            <Button variant="primary" type="submit">
              {isEditing ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default TachesPage;