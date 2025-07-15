import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useEntreprise } from '../../context/EntrepriseContext';
import { searchService } from '../../services/searchService';
import { selectionsService } from '../../services/selectionsService';
import MesSelectionsSection from './sections/MesSelectionsSection';
import { Modal, Form, Button } from 'react-bootstrap';
import styles from './RechercheLayout.module.css';

/**
 * Layout principal pour les pages de recherche
 * Inclut un menu latéral permanent et un container principal
 */
const RechercheLayout = ({ children, savedSearch }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { currentEntreprise } = useEntreprise();
  const [activeSection, setActiveSection] = useState('identification');
  const [selectedCriteria, setSelectedCriteria] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [resultsCount, setResultsCount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [saveSelectionModalOpen, setSaveSelectionModalOpen] = useState(false);
  const [selectionName, setSelectionName] = useState('');

  // Charger les critères de la recherche sauvegardée si elle existe
  useEffect(() => {
    if (savedSearch && savedSearch.criteria) {
      console.log('Chargement de la recherche sauvegardée:', savedSearch);
      setSelectedCriteria(savedSearch.criteria);
      // Réinitialiser les compteurs quand on charge une nouvelle recherche
      setResultsCount(null);
      setSearchResults(null);
      setShowResults(false);
    }
  }, [savedSearch]);

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
    if (!currentEntreprise?.id || selectedCriteria.length === 0) return;

    setIsLoading(true);
    try {
      // Rechercher dans les structures ET les personnes
      const [structuresResults, personnesResults] = await Promise.all([
        searchService.executeSearch({
          entrepriseId: currentEntreprise.id,
          criteria: selectedCriteria,
          collection: 'structures',
          pagination: { limit: 1 }
        }),
        searchService.executeSearch({
          entrepriseId: currentEntreprise.id,
          criteria: selectedCriteria,
          collection: 'personnes',
          pagination: { limit: 1 }
        })
      ]);
      
      const totalCount = (structuresResults.pagination.total || structuresResults.data.length) +
                        (personnesResults.pagination.total || personnesResults.data.length);
      
      setResultsCount(totalCount);
    } catch (error) {
      console.error('Erreur lors du calcul:', error);
      alert('Erreur lors du calcul des résultats');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour afficher les résultats
  const handleDisplay = async () => {
    if (!currentEntreprise?.id || selectedCriteria.length === 0) return;

    setIsLoading(true);
    try {
      // Rechercher dans les structures ET les personnes
      const [structuresResults, personnesResults] = await Promise.all([
        searchService.executeSearch({
          entrepriseId: currentEntreprise.id,
          criteria: selectedCriteria,
          collection: 'structures',
          pagination: { limit: 50 }
        }),
        searchService.executeSearch({
          entrepriseId: currentEntreprise.id,
          criteria: selectedCriteria,
          collection: 'personnes',
          pagination: { limit: 50 }
        })
      ]);
      
      // Combiner les résultats avec un type pour les distinguer
      const combinedResults = [
        ...structuresResults.data.map(s => ({ ...s, _type: 'structure' })),
        ...personnesResults.data.map(p => ({ ...p, _type: 'personne' }))
      ];
      
      setSearchResults({
        data: combinedResults,
        pagination: {
          hasMore: structuresResults.pagination.hasMore || personnesResults.pagination.hasMore,
          total: combinedResults.length
        }
      });
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
    console.log('💾 RechercheLayout - Début de la sauvegarde de la recherche');
    
    if (!searchName.trim()) {
      alert('Veuillez donner un nom à votre recherche');
      return;
    }

    if (!currentEntreprise?.id) {
      alert('Aucune entreprise sélectionnée');
      return;
    }

    console.log('💾 RechercheLayout - Données à sauvegarder:', {
      entrepriseId: currentEntreprise.id,
      userId: currentUser.uid,
      name: searchName,
      criteriaCount: selectedCriteria.length
    });

    try {
      // D'abord, exécuter la recherche pour obtenir les résultats
      setIsLoading(true);
      const [structuresResults, personnesResults] = await Promise.all([
        searchService.executeSearch({
          entrepriseId: currentEntreprise.id,
          criteria: selectedCriteria,
          collection: 'structures',
          pagination: { limit: 500 } // Augmenter la limite pour sauvegarder plus de résultats
        }),
        searchService.executeSearch({
          entrepriseId: currentEntreprise.id,
          criteria: selectedCriteria,
          collection: 'personnes',
          pagination: { limit: 500 }
        })
      ]);
      
      // Sauvegarder avec les résultats
      await searchService.saveSearch({
        entrepriseId: currentEntreprise.id,
        userId: currentUser.uid,
        name: searchName,
        criteria: selectedCriteria,
        results: {
          structures: structuresResults.data.map(s => ({
            id: s.id,
            raisonSociale: s.raisonSociale || null,
            nom: s.nom || null,
            email: s.email || null,
            telephone: s.telephone || null,
            ville: s.ville || null
          })),
          personnes: personnesResults.data.map(p => ({
            id: p.id,
            nom: p.nom || null,
            prenom: p.prenom || null,
            fonction: p.fonction || null,
            email: p.email || p.mailDirect || null,
            telephone: p.telephone || p.telDirect || p.mobile || null,
            ville: p.ville || null
          }))
        },
        description: `${selectedCriteria.length} critère(s) - ${structuresResults.data.length + personnesResults.data.length} résultat(s)`
      });
      
      setSaveModalOpen(false);
      setSearchName('');
      alert('Recherche sauvegardée avec succès');
      
      // Déclencher un événement pour rafraîchir le menu
      console.log('🔄 RechercheLayout - Déclenchement du rafraîchissement du menu');
      window.dispatchEvent(new Event('refresh-saved-searches'));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
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

  // Fonction pour gérer la sélection/désélection d'un contact
  const handleContactSelection = (contact) => {
    const contactKey = `${contact._type}-${contact.id}`;
    setSelectedContacts(prev => {
      const isSelected = prev.some(c => `${c._type}-${c.id}` === contactKey);
      if (isSelected) {
        return prev.filter(c => `${c._type}-${c.id}` !== contactKey);
      } else {
        return [...prev, contact];
      }
    });
  };

  // Fonction pour sélectionner/désélectionner tous les contacts
  const handleSelectAll = () => {
    if (selectedContacts.length === searchResults?.data?.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(searchResults?.data || []);
    }
  };

  // Fonction pour sauvegarder la sélection
  const handleSaveSelection = async () => {
    if (!selectionName.trim() || selectedContacts.length === 0) {
      alert('Veuillez donner un nom à votre sélection et sélectionner au moins un contact');
      return;
    }

    try {
      const result = await selectionsService.createContactSelection({
        nom: selectionName,
        contacts: selectedContacts,
        description: `${selectedContacts.length} contact(s) sélectionné(s)`,
        userId: currentUser.uid,
        entrepriseId: currentEntreprise.id
      });

      if (result.success) {
        setSaveSelectionModalOpen(false);
        setSelectionName('');
        setSelectedContacts([]);
        alert('Sélection sauvegardée avec succès');
        
        // Déclencher un événement pour rafraîchir le menu
        window.dispatchEvent(new Event('refresh-saved-selections'));
      } else {
        alert('Erreur lors de la sauvegarde de la sélection');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la sélection:', error);
      alert('Erreur lors de la sauvegarde de la sélection');
    }
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
                  <div className="d-flex gap-2">
                    {selectedContacts.length > 0 && (
                      <>
                        <span className="text-muted align-self-center">
                          {selectedContacts.length} sélectionné(s)
                        </span>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => setSaveSelectionModalOpen(true)}
                        >
                          <i className="bi bi-bookmark-plus me-2"></i>
                          Sauvegarder la sélection
                        </button>
                      </>
                    )}
                    <button 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setShowResults(false)}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Retour aux critères
                    </button>
                  </div>
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
                            <th>
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={selectedContacts.length === searchResults?.data?.length && searchResults?.data?.length > 0}
                                onChange={handleSelectAll}
                              />
                            </th>
                            <th>Type</th>
                            <th>Nom</th>
                            <th>Email</th>
                            <th>Téléphone</th>
                            <th>Ville</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {searchResults?.data?.map((result) => {
                            const isSelected = selectedContacts.some(c => `${c._type}-${c.id}` === `${result._type}-${result.id}`);
                            return (
                            <tr key={`${result._type}-${result.id}`}>
                              <td>
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={isSelected}
                                  onChange={() => handleContactSelection(result)}
                                />
                              </td>
                              <td>
                                <span className={`badge ${result._type === 'structure' ? 'bg-primary' : 'bg-info'}`}>
                                  <i className={`bi ${result._type === 'structure' ? 'bi-building' : 'bi-person'} me-1`}></i>
                                  {result._type === 'structure' ? 'Structure' : 'Personne'}
                                </span>
                              </td>
                              <td>
                                <strong>
                                  {result._type === 'structure' 
                                    ? (result.raisonSociale || result.nom || 'Structure sans nom')
                                    : `${result.prenom || ''} ${result.nom || ''}`.trim() || 'Personne sans nom'
                                  }
                                </strong>
                                {result._type === 'personne' && result.fonction && (
                                  <small className="d-block text-muted">{result.fonction}</small>
                                )}
                              </td>
                              <td>{result.email || result.mailDirect || '-'}</td>
                              <td>{result.telephone || result.telDirect || result.mobile || '-'}</td>
                              <td>{result.ville || '-'}</td>
                              <td>
                                <button 
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => {
                                    if (result._type === 'structure') {
                                      navigate(`/structures/${result.id}`);
                                    } else {
                                      navigate(`/contacts/${result.id}`);
                                    }
                                  }}
                                  title="Voir la fiche"
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                              </td>
                            </tr>
                            );
                          })}
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

      {/* Modal de sauvegarde de sélection */}
      <Modal show={saveSelectionModalOpen} onHide={() => setSaveSelectionModalOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-bookmark-plus me-2"></i>
            Sauvegarder la sélection
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nom de la sélection</Form.Label>
              <Form.Control
                type="text"
                value={selectionName}
                onChange={(e) => setSelectionName(e.target.value)}
                placeholder="Ex: Mairies région parisienne"
                autoFocus
              />
            </Form.Group>
            <div className="text-muted small">
              <i className="bi bi-info-circle me-1"></i>
              Cette sélection contient {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''}
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSaveSelectionModalOpen(false)}>
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveSelection}
            disabled={!selectionName.trim() || selectedContacts.length === 0}
          >
            <i className="bi bi-save me-2"></i>
            Enregistrer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RechercheLayout;