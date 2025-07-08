import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { searchService } from '../../services/searchService';
import MesSelectionsSection from './sections/MesSelectionsSection';
import styles from './RechercheLayout.module.css';

/**
 * Layout principal pour les pages de recherche
 * Inclut un menu latéral permanent et un container principal
 */
const RechercheLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState('identification');
  const [selectedCriteria, setSelectedCriteria] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [resultsCount, setResultsCount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [searchName, setSearchName] = useState('');

  // Configuration du menu de recherche
  const menuItems = [
    {
      id: 'identification',
      label: 'Identification',
      icon: 'bi-person-badge',
    },
    {
      id: 'historique',
      label: 'Historique',
      icon: 'bi-clock-history',
    },
    {
      id: 'personnes',
      label: 'Personnes',
      icon: 'bi-people',
    },
    {
      id: 'activites',
      label: 'Activités',
      icon: 'bi-briefcase',
    },
    {
      id: 'reseaux',
      label: 'Réseaux',
      icon: 'bi-diagram-3',
    },
    {
      id: 'genres',
      label: 'Genres',
      icon: 'bi-music-note-list',
    },
    {
      id: 'mots-cles',
      label: 'Mots-clés',
      icon: 'bi-tags',
    },
    {
      id: 'mes-selections',
      label: 'Mes sélections',
      icon: 'bi-bookmark-star',
    },
    {
      id: 'suivi',
      label: 'Suivi',
      icon: 'bi-eye',
    },
    {
      id: 'geolocalisation',
      label: 'Géolocalisation',
      icon: 'bi-geo-alt',
    },
    {
      id: 'festivals',
      label: 'Festivals',
      icon: 'bi-calendar-event',
    },
    {
      id: 'salles',
      label: 'Salles',
      icon: 'bi-building',
    },
    {
      id: 'docs-promo',
      label: 'Docs promo',
      icon: 'bi-file-earmark-text',
    },
    {
      id: 'infos-artiste',
      label: 'Infos artiste',
      icon: 'bi-info-circle',
    },
    {
      id: 'emailing',
      label: 'eMailing',
      icon: 'bi-envelope',
    },
    {
      id: 'gestion-projets',
      label: 'Gestion de projets',
      icon: 'bi-kanban',
    },
    {
      id: 'dates',
      label: 'Dates',
      icon: 'bi-calendar3',
    }
  ];

  const handleMenuClick = (item) => {
    setActiveSection(item.id);
    setShowResults(false); // Retour aux critères quand on change de section
    setResultsCount(null);
  };

  // Fonction pour ajouter/supprimer des critères
  const addCriteria = (criteria) => {
    if (criteria.remove) {
      // Si c'est une demande de suppression
      removeCriteria(criteria.id);
    } else {
      // Sinon, ajouter ou mettre à jour le critère
      setSelectedCriteria(prev => {
        const existing = prev.findIndex(c => c.id === criteria.id);
        if (existing >= 0) {
          // Mise à jour d'un critère existant
          const updated = [...prev];
          updated[existing] = criteria;
          return updated;
        } else {
          // Ajout d'un nouveau critère
          return [...prev, criteria];
        }
      });
      setResultsCount(null); // Reset le compteur quand on modifie les critères
    }
  };

  const removeCriteria = (criteriaId) => {
    setSelectedCriteria(prev => prev.filter(c => c.id !== criteriaId));
    setResultsCount(null); // Reset le compteur quand on modifie les critères
  };

  const clearCriteria = () => {
    setSelectedCriteria([]);
    setResultsCount(null);
    setSearchResults(null);
    setShowResults(false);
  };

  // Helpers pour formater l'affichage
  const formatOperator = (operator) => {
    const operators = {
      contient: 'contient',
      egal: 'égal à',
      commence: 'commence par',
      termine: 'se termine par',
      different: 'différent de',
      entre: 'entre',
      superieur: 'après le',
      inferieur: 'avant le',
      non_renseigne: 'non renseigné',
      parmi: 'parmi'
    };
    return operators[operator] || operator;
  };

  const formatValue = (value) => {
    if (value === true) return 'Oui';
    if (value === false) return 'Non';
    if (value === null || value === undefined) return '';
    if (typeof value === 'object' && value.min && value.max) {
      return `${value.min} et ${value.max}`;
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value;
  };

  // Fonction pour calculer (compter les résultats)
  const handleCalculate = async () => {
    if (!currentUser?.entrepriseId || selectedCriteria.length === 0) return;

    setIsLoading(true);
    try {
      // Pour l'instant on fait une recherche sur les contacts par défaut
      const results = await searchService.executeSearch({
        entrepriseId: currentUser.entrepriseId,
        criteria: selectedCriteria,
        collection: 'contacts',
        pagination: { limit: 1 } // On veut juste le compte
      });
      
      setResultsCount(results.pagination.total || results.data.length);
    } catch (error) {
      console.error('Erreur lors du calcul:', error);
      alert('Erreur lors du calcul des résultats');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour afficher les résultats
  const handleDisplay = async () => {
    if (!currentUser?.entrepriseId || selectedCriteria.length === 0) return;

    setIsLoading(true);
    try {
      const results = await searchService.executeSearch({
        entrepriseId: currentUser.entrepriseId,
        criteria: selectedCriteria,
        collection: 'contacts', // TODO: permettre de choisir la collection
        pagination: { limit: 50 }
      });
      
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      alert('Erreur lors de la recherche');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour sauvegarder la recherche
  const handleSave = async () => {
    if (!searchName.trim()) {
      alert('Veuillez donner un nom à votre recherche');
      return;
    }

    try {
      await searchService.saveSearch({
        entrepriseId: currentUser.entrepriseId,
        userId: currentUser.uid,
        name: searchName,
        criteria: selectedCriteria,
        description: `${selectedCriteria.length} critère(s)`
      });
      
      setSaveModalOpen(false);
      setSearchName('');
      alert('Recherche sauvegardée avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  // Fonction pour charger une sélection sauvegardée
  const handleLoadSelection = (criteria) => {
    setSelectedCriteria(criteria);
    setResultsCount(null);
    setSearchResults(null);
    setShowResults(false);
    // Retourner à la section identification pour voir les critères
    setActiveSection('identification');
  };

  return (
    <div className={styles.rechercheLayout}>
      {/* Menu latéral permanent */}
      <aside className={styles.sideMenu}>
        <div className={styles.menuHeader}>
          <h5>
            <i className="bi bi-search me-2"></i>
            Recherches
          </h5>
        </div>
        
        <nav className={styles.menuNav}>
          {/* Menu items à ajouter */}
          {menuItems.length === 0 ? (
            <p className="text-muted text-center mt-4">
              <i className="bi bi-list-ul me-2"></i>
              Menu en attente de configuration
            </p>
          ) : (
            menuItems.map(item => (
              <button
                key={item.id}
                className={`${styles.menuItem} ${activeSection === item.id ? styles.active : ''}`}
                onClick={() => handleMenuClick(item)}
              >
                <i className={`${item.icon} me-2`}></i>
                <span>{item.label}</span>
              </button>
            ))
          )}
        </nav>
      </aside>

      {/* Container principal avec colonne de critères */}
      <div className={styles.mainContainer}>
        <div className={styles.contentArea}>
          {/* Zone principale où le contenu change */}
          <div className={styles.content}>
            {showResults ? (
              // Affichage des résultats
              <div className={styles.resultsContainer}>
                <div className={styles.resultsHeader}>
                  <h4>
                    <i className="bi bi-list-check me-2"></i>
                    Résultats de la recherche ({searchResults?.data?.length || 0})
                  </h4>
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowResults(false)}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Retour aux critères
                  </button>
                </div>
                
                <div className={styles.resultsList}>
                  {searchResults?.data?.length === 0 ? (
                    <div className="text-center text-muted py-5">
                      <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                      <p>Aucun résultat trouvé avec ces critères</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Nom</th>
                            <th>Email</th>
                            <th>Téléphone</th>
                            <th>Ville</th>
                            <th>Structure</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {searchResults?.data?.map((contact) => (
                            <tr key={contact.id}>
                              <td>
                                <strong>{contact.prenomNom || `${contact.prenom || ''} ${contact.nom || ''}`}</strong>
                                {contact.fonction && <small className="d-block text-muted">{contact.fonction}</small>}
                              </td>
                              <td>{contact.email || '-'}</td>
                              <td>{contact.telephone || contact.mobile || '-'}</td>
                              <td>{contact.ville || '-'}</td>
                              <td>{contact.structureRaisonSociale || '-'}</td>
                              <td>
                                <button 
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => navigate(`/contacts/${contact.id}`)}
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  {searchResults?.pagination?.hasMore && (
                    <div className="text-center mt-3">
                      <button className="btn btn-outline-primary">
                        <i className="bi bi-arrow-down me-2"></i>
                        Charger plus
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Affichage des critères ou de la section Mes sélections
              activeSection === 'mes-selections' ? (
                <MesSelectionsSection onLoadSelection={handleLoadSelection} />
              ) : (
                React.cloneElement(children, { 
                  activeSection, 
                  onCriteriaChange: addCriteria,
                  selectedCriteria 
                })
              )
            )}
          </div>

          {/* Colonne de critères (toujours visible) */}
          <aside className={styles.criteriaColumn}>
            <div className={styles.criteriaHeader}>
              <h6>
                <i className="bi bi-funnel me-2"></i>
                Critères sélectionnés
              </h6>
            </div>
            
            <div className={styles.criteriaContent}>
              {selectedCriteria.length === 0 ? (
                <p className="text-muted text-center mt-4">
                  <i className="bi bi-info-circle me-2"></i>
                  Aucun critère sélectionné
                </p>
              ) : (
                <div className={styles.criteriaList}>
                  {selectedCriteria.map((criteria) => (
                    <div key={criteria.id} className={styles.criteriaItem}>
                      <span className={styles.criteriaLabel}>
                        <strong>{criteria.label || criteria.field}</strong>
                        <br />
                        <small className="text-muted">
                          {formatOperator(criteria.operator)} {criteria.displayValue || formatValue(criteria.value)}
                        </small>
                      </span>
                      <button
                        className={styles.removeCriteria}
                        onClick={() => removeCriteria(criteria.id)}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Affichage du nombre de résultats après calcul */}
              {resultsCount !== null && (
                <div className="alert alert-info mb-3">
                  <i className="bi bi-info-circle me-2"></i>
                  {resultsCount} résultat{resultsCount > 1 ? 's' : ''} trouvé{resultsCount > 1 ? 's' : ''}
                </div>
              )}
              
              {/* Boutons d'action */}
              <div className={styles.criteriaActions}>
                <button 
                  className="btn btn-primary w-100 mb-2"
                  disabled={selectedCriteria.length === 0 || isLoading}
                  onClick={handleCalculate}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Calcul...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-calculator me-2"></i>
                      Calculer
                    </>
                  )}
                </button>
                <button 
                  className="btn btn-outline-secondary w-100 mb-2"
                  disabled={selectedCriteria.length === 0}
                  onClick={() => setSaveModalOpen(true)}
                >
                  <i className="bi bi-save me-2"></i>
                  Enregistrer
                </button>
                <button 
                  className="btn btn-outline-primary w-100"
                  disabled={selectedCriteria.length === 0 || isLoading}
                  onClick={handleDisplay}
                >
                  <i className="bi bi-eye me-2"></i>
                  Afficher
                </button>
                {selectedCriteria.length > 0 && (
                  <button 
                    className="btn btn-link w-100 mt-2"
                    onClick={clearCriteria}
                  >
                    <i className="bi bi-trash me-2"></i>
                    Effacer tout
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Modal de sauvegarde */}
      {saveModalOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-save me-2"></i>
                  Enregistrer la recherche
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSaveModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nom de la recherche</label>
                  <input
                    type="text"
                    className="form-control"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Ex: Festivals jazz Île-de-France"
                    autoFocus
                  />
                </div>
                <div className="text-muted small">
                  <i className="bi bi-info-circle me-1"></i>
                  Cette recherche contient {selectedCriteria.length} critère{selectedCriteria.length > 1 ? 's' : ''}
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setSaveModalOpen(false)}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleSave}
                  disabled={!searchName.trim()}
                >
                  <i className="bi bi-save me-2"></i>
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RechercheLayout;