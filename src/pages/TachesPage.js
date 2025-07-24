import React, { useState, useMemo, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { collection, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useEntreprise } from '@/context/EntrepriseContext';
import { useAuth } from '@/context/AuthContext';
import { useTaches } from '@/hooks/taches/useTaches';
import { useInteractiveTour } from '@/hooks/useInteractiveTour';
import Modal from '@/components/common/Modal';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import styles from './TachesPage.module.css';

/**
 * Page principale de gestion des tâches
 * Affiche un tableau complet des tâches avec possibilité de création, modification et suppression
 */
function TachesPage() {
  const { currentEntreprise } = useEntreprise();
  const { currentUser } = useAuth();
  const { taches, loading, error, refreshTaches } = useTaches();
  const { startInteractiveTour } = useInteractiveTour();
  
  const [showModal, setShowModal] = useState(false);
  const [selectedTache, setSelectedTache] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filters, setFilters] = useState({
    statut: 'en_cours',
    important: '',
    search: ''
  });

  // Formulaire pour créer/modifier une tâche
  const [formData, setFormData] = useState({
    titre: '',
    commentaire: '',
    tag: '',
    assigneA: '',
    deadline: '',
    contactId: '',
    contactNom: '',
    dossierId: '',
    dossierNom: '',
    statut: 'a_faire',
    important: false
  });

  // Filtrer les tâches selon les critères
  const filteredTaches = useMemo(() => {
    if (!taches) return [];
    
    return taches.filter(tache => {
      const matchesSearch = !filters.search || 
        (tache.titre && tache.titre.toLowerCase().includes(filters.search.toLowerCase())) ||
        (tache.commentaire && tache.commentaire.toLowerCase().includes(filters.search.toLowerCase())) ||
        (tache.tag && tache.tag.toLowerCase().includes(filters.search.toLowerCase()));
      
      const matchesStatut = !filters.statut || tache.statut === filters.statut;
      const matchesImportant = !filters.important || 
        (filters.important === 'true' && tache.important === true) ||
        (filters.important === 'false' && tache.important !== true);
      
      return matchesSearch && matchesStatut && matchesImportant;
    });
  }, [taches, filters]);

  // Fonction pour lancer le tour général de l'app
  const launchAppTour = () => {
    // Fonction pour déployer un menu
    const expandMenu = (menuName) => {
      const menuElement = document.querySelector(`[data-menu="${menuName}"]`);
      if (menuElement) {
        menuElement.click();
        return new Promise(resolve => setTimeout(resolve, 300));
      }
      return Promise.resolve();
    };

    const tourSteps = [
      {
        intro: `
          <div class="tour-welcome">
            <h2>👋 Bienvenue dans TourCraft !</h2>
            <p>Découvrons ensemble comment utiliser l'application pour gérer vos concerts et événements.</p>
            <p class="tour-subtitle">Ce tour va vous montrer les fonctionnalités principales.</p>
          </div>
        `
      },
      {
        element: '[data-menu="contact"]',
        intro: '<strong>📋 Contact</strong><br/>Gérez tous vos contacts : structures, personnes, salles...',
        position: 'right',
        beforeShow: async () => {
          await expandMenu('contact');
        }
      },
      {
        element: '[data-menu="booking"]',
        intro: '<strong>🎵 Booking</strong><br/>Le cœur de l\'application : créez et gérez vos dates de concerts',
        position: 'right',
        beforeShow: async () => {
          await expandMenu('booking');
        }
      },
      {
        element: '[data-menu="collaboration"]',
        intro: '<strong>🤝 Collaboration</strong><br/>Ici vous trouvez vos tâches, mails et notes. Cliquez pour ouvrir le menu.',
        position: 'right',
        beforeShow: async () => {
          await expandMenu('collaboration');
        }
      },
      {
        element: '[data-menu="admin"]',
        intro: '<strong>📊 Admin</strong><br/>Tableau de bord, contrats, factures et devis',
        position: 'right', 
        beforeShow: async () => {
          await expandMenu('admin');
        }
      },
      {
        intro: `
          <div style="text-align: center; padding: 20px;">
            <h3>🎯 Le workflow TourCraft</h3>
            <div style="margin: 20px 0; text-align: left; max-width: 400px; margin: 0 auto;">
              <p><strong>1.</strong> Créez une date dans <strong>Booking > Nouvelle date</strong></p>
              <p><strong>2.</strong> Générez un devis → niveau passe automatiquement à "Option"</p>
              <p><strong>3.</strong> Envoyez le pré-contrat → niveau passe à "Confirmé"</p>
              <p><strong>4.</strong> Rédigez le contrat final</p>
              <p><strong>5.</strong> Créez la facture</p>
            </div>
            <p style="color: #28a745; font-weight: bold; margin-top: 20px;">✅ Les tâches se créent automatiquement à chaque étape !</p>
          </div>
        `
      },
      {
        intro: `
          <div style="text-align: center; padding: 20px;">
            <h3>💡 Conseils</h3>
            <div style="text-align: left; max-width: 400px; margin: 20px auto;">
              <p>• Les <strong>tâches</strong> sont dans <strong>Collaboration > Tâches</strong></p>
              <p>• Le <strong>tableau de bord</strong> est dans <strong>Admin > Tableau de bord</strong></p>
              <p>• Certaines fonctionnalités marquées 🚧 sont en développement</p>
            </div>
            <p style="margin-top: 30px;">Bonne utilisation de TourCraft ! 🎵</p>
          </div>
        `
      }
    ];

    startInteractiveTour(tourSteps);
  };

  // Calculer les statistiques
  const stats = useMemo(() => {
    if (!taches) return { total: 0, aFaire: 0, enCours: 0, termine: 0, overdue: 0, important: 0 };
    
    const now = new Date();
    const aFaire = taches.filter(t => t.statut === 'a_faire');
    const enCours = taches.filter(t => t.statut === 'en_cours');
    const termine = taches.filter(t => t.statut === 'termine');
    const important = taches.filter(t => t.important === true);
    const overdue = [...aFaire, ...enCours].filter(t => {
      if (!t.deadline) return false;
      const dueDate = new Date(t.deadline);
      return dueDate < now;
    });
    
    return {
      total: taches.length,
      aFaire: aFaire.length,
      enCours: enCours.length,
      termine: termine.length,
      overdue: overdue.length,
      important: important.length
    };
  }, [taches]);

  const handleCreateTache = () => {
    setIsEditing(false);
    setSelectedTache(null);
    setFormData({
      titre: '',
      commentaire: '',
      tag: '',
      assigneA: '',
      deadline: '',
      contactId: '',
      contactNom: '',
      dossierId: '',
      dossierNom: '',
      statut: 'a_faire',
      important: false
    });
    setShowModal(true);
  };

  const handleEditTache = (tache) => {
    setIsEditing(true);
    setSelectedTache(tache);
    setFormData({
      titre: tache.titre || '',
      commentaire: tache.commentaire || '',
      tag: tache.tag || '',
      assigneA: tache.assigneA || '',
      deadline: tache.deadline || '',
      contactId: tache.contactId || '',
      contactNom: tache.contactNom || '',
      dossierId: tache.dossierId || '',
      dossierNom: tache.dossierNom || '',
      statut: tache.statut || 'a_faire',
      important: tache.important || false
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titre.trim()) {
      alert('Le titre est obligatoire');
      return;
    }

    if (!currentEntreprise?.id) {
      alert('Aucune organisation sélectionnée');
      return;
    }

    try {
      const tacheData = {
        ...formData,
        entrepriseId: currentEntreprise.id,
        updatedAt: serverTimestamp()
      };

      if (isEditing && selectedTache) {
        // Mise à jour
        await updateDoc(doc(db, 'taches', selectedTache.id), tacheData);
      } else {
        // Création - ajouter les champs de création
        tacheData.createdAt = serverTimestamp();
        tacheData.creePar = currentUser?.email || 'Utilisateur inconnu';
        await addDoc(collection(db, 'taches'), tacheData);
      }

      setShowModal(false);
      // refreshTaches() supprimé - onSnapshot détecte automatiquement les changements
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
      // Ne pas appeler refreshTaches car onSnapshot détecte automatiquement la suppression
      // refreshTaches met loading à true sans jamais le remettre à false
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la tâche');
    }
  };

  const handleToggleStatut = async (tache) => {
    const newStatut = tache.statut === 'termine' ? 'a_faire' : 'termine';
    
    try {
      await updateDoc(doc(db, 'taches', tache.id), {
        statut: newStatut,
        dateTerminee: newStatut === 'termine' ? serverTimestamp() : null,
        updatedAt: serverTimestamp()
      });
      // refreshTaches() supprimé - onSnapshot détecte automatiquement les changements
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleToggleImportant = async (tache) => {
    try {
      await updateDoc(doc(db, 'taches', tache.id), {
        important: !tache.important,
        updatedAt: serverTimestamp()
      });
      // refreshTaches() supprimé - onSnapshot détecte automatiquement les changements
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'importance:', error);
      alert('Erreur lors de la mise à jour de l\'importance');
    }
  };

  const getStatutLabel = (statut) => {
    switch (statut) {
      case 'a_faire': return 'À faire';
      case 'en_cours': return 'En cours';
      case 'termine': return 'Terminé';
      case 'annule': return 'Annulé';
      default: return statut;
    }
  };

  const getStatutVariant = (statut) => {
    switch (statut) {
      case 'a_faire': return 'secondary';
      case 'en_cours': return 'warning';
      case 'termine': return 'success';
      case 'annule': return 'danger';
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
      <div className={styles.pageHeader} data-tour="taches-header">
        <div>
          <h1 className={styles.pageTitle}>
            <i className="bi bi-check2-square me-3"></i>
            Gestion des Tâches
          </h1>
          <p className={styles.pageSubtitle}>
            Organisez et suivez vos tâches et projets
          </p>
        </div>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={launchAppTour}
          title="Lancer le tour guidé de l'application"
        >
          <i className="bi bi-question-circle me-2"></i>
          Aide
        </Button>
      </div>

      {/* Statistiques */}
      <div className={styles.statsRow} data-tour="taches-stats">
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
            <div className={`${styles.statIcon} ${styles.aFaire}`}>
              <i className="bi bi-circle"></i>
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.aFaire}</div>
              <div className={styles.statLabel}>À faire</div>
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={`${styles.statIcon} ${styles.enCours}`}>
              <i className="bi bi-hourglass-split"></i>
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.enCours}</div>
              <div className={styles.statLabel}>En cours</div>
            </div>
          </div>
        </Card>
        
        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={`${styles.statIcon} ${styles.termine}`}>
              <i className="bi bi-check-circle"></i>
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.termine}</div>
              <div className={styles.statLabel}>Terminées</div>
            </div>
          </div>
        </Card>

        {stats.important > 0 && (
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={`${styles.statIcon} ${styles.important}`}>
                <i className="bi bi-flag-fill"></i>
              </div>
              <div className={styles.statInfo}>
                <div className={styles.statValue}>{stats.important}</div>
                <div className={styles.statLabel}>Importantes</div>
              </div>
            </div>
          </Card>
        )}
        
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
      <Card className={styles.filtersCard} data-tour="taches-filters">
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
              <option value="a_faire">À faire</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
              <option value="annule">Annulé</option>
            </Form.Select>
          </div>
          
          <div className={styles.filterGroup}>
            <Form.Select
              value={filters.important}
              onChange={(e) => setFilters(prev => ({ ...prev, important: e.target.value }))}
            >
              <option value="">Toutes</option>
              <option value="true">Importantes seulement</option>
              <option value="false">Non importantes</option>
            </Form.Select>
          </div>
          
          <div className={styles.actionGroup}>
            {filters.statut && (
              <Button 
                variant="outline-secondary" 
                onClick={() => setFilters(prev => ({ ...prev, statut: '' }))}
                className="me-2"
              >
                <i className="bi bi-list me-2"></i>
                Voir toutes
              </Button>
            )}
            <Button variant="primary" onClick={handleCreateTache}>
              <i className="bi bi-plus-lg me-2"></i>
              Nouvelle tâche
            </Button>
          </div>
        </div>
      </Card>

      {/* Tableau des tâches */}
      <Card className={styles.tableCard} data-tour="taches-table">
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Statut</th>
                <th>Tâche</th>
                <th>Commentaire</th>
                <th>Tag</th>
                <th>Assigné à</th>
                <th>Deadline</th>
                <th>Contact</th>
                <th>Dossier</th>
                <th>Créé par</th>
                <th>Créé le</th>
                <th>Important</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTaches.length === 0 ? (
                <tr>
                  <td colSpan="12" className={styles.emptyMessage}>
                    Aucune tâche trouvée
                  </td>
                </tr>
              ) : (
                filteredTaches.map(tache => {
                  const isOverdue = tache.deadline && 
                    new Date(tache.deadline) < new Date() && 
                    tache.statut !== 'termine';
                  
                  return (
                    <tr 
                      key={tache.id} 
                      className={`${isOverdue ? styles.overdueRow : ''} ${tache.statut === 'termine' ? styles.completedRow : ''} ${tache.important ? styles.importantRow : ''}`}
                    >
                      <td>
                        <div className={styles.statutCell}>
                          <input
                            type="checkbox"
                            checked={tache.statut === 'termine'}
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
                        </div>
                      </td>
                      <td>
                        <div className={styles.commentCell}>
                          {tache.commentaire || '-'}
                        </div>
                      </td>
                      <td>
                        <div className={styles.tagCell}>
                          {tache.tag ? (
                            <Badge variant="info" size="sm">{tache.tag}</Badge>
                          ) : '-'}
                        </div>
                      </td>
                      <td>
                        <div className={styles.assigneeCell}>
                          {tache.assigneA || '-'}
                        </div>
                      </td>
                      <td>
                        <div className={styles.dateCell}>
                          {formatDate(tache.deadline)}
                          {isOverdue && (
                            <div className={styles.overdueIndicator}>
                              <i className="bi bi-exclamation-triangle"></i> En retard
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className={styles.contactCell}>
                          {tache.contactNom || '-'}
                        </div>
                      </td>
                      <td>
                        <div className={styles.dossierCell}>
                          {tache.dossierNom || '-'}
                        </div>
                      </td>
                      <td>
                        <div className={styles.createdByCell}>
                          {tache.creePar || '-'}
                        </div>
                      </td>
                      <td>
                        <div className={styles.createdAtCell}>
                          {formatDate(tache.createdAt)}
                        </div>
                      </td>
                      <td>
                        <div className={styles.importantCell}>
                          <button
                            className={`${styles.flagButton} ${tache.important ? styles.flagActive : ''}`}
                            onClick={() => handleToggleImportant(tache)}
                            title={tache.important ? 'Marquer comme non important' : 'Marquer comme important'}
                          >
                            <i className={`bi ${tache.important ? 'bi-flag-fill' : 'bi-flag'}`}></i>
                          </button>
                        </div>
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
            <Form.Label>Tâche *</Form.Label>
            <Form.Control
              type="text"
              value={formData.titre}
              onChange={(e) => setFormData(prev => ({ ...prev, titre: e.target.value }))}
              placeholder="Nom de la tâche"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Commentaire</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.commentaire}
              onChange={(e) => setFormData(prev => ({ ...prev, commentaire: e.target.value }))}
              placeholder="Description ou commentaire sur la tâche"
            />
          </Form.Group>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Tag</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.tag}
                  onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value }))}
                  placeholder="Catégorie ou tag"
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Assigné à</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.assigneA}
                  onChange={(e) => setFormData(prev => ({ ...prev, assigneA: e.target.value }))}
                  placeholder="Personne assignée"
                />
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Deadline</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Statut</Form.Label>
                <Form.Select
                  value={formData.statut}
                  onChange={(e) => setFormData(prev => ({ ...prev, statut: e.target.value }))}
                >
                  <option value="a_faire">À faire</option>
                  <option value="en_cours">En cours</option>
                  <option value="termine">Terminé</option>
                  <option value="annule">Annulé</option>
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Contact</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.contactNom}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactNom: e.target.value }))}
                  placeholder="Contact lié à la tâche"
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Dossier</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.dossierNom}
                  onChange={(e) => setFormData(prev => ({ ...prev, dossierNom: e.target.value }))}
                  placeholder="Dossier ou projet lié"
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Marquer comme important"
              checked={formData.important}
              onChange={(e) => setFormData(prev => ({ ...prev, important: e.target.checked }))}
            />
          </Form.Group>

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