import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useEntreprise } from '@/context/EntrepriseContext';
import { personnesService } from '@/services/contacts/personnesService';
import { fonctionsService } from '@/services/fonctionsService';
import { useTabs } from '@/context/TabsContext';
import { useContactModals } from '@/context/ContactModalsContext';
import { createPortal } from 'react-dom';
import styles from './AssociatePersonModal.module.css';

/**
 * Modal pour associer une personne existante à une structure
 */
function AssociatePersonModal({ isOpen, onClose, onAssociate, structureId, allowMultiple = true, existingPersonIds = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [personnes, setPersonnes] = useState([]);
  // État supprimé - on utilise directement le useMemo
  const [selectedPersonnes, setSelectedPersonnes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' ou 'desc'
  const [currentStep, setCurrentStep] = useState(1); // 1 = sélection, 2 = infos liaison
  const [fonctions, setFonctions] = useState([]); // Liste des fonctions depuis Firebase
  
  // États pour les infos de liaison
  const [liaisonInfo, setLiaisonInfo] = useState({
    fonction: '',
    actif: true,
    prioritaire: false,
    email: '',
    telPro: '',
    mobile: ''
  });
  
  const { currentEntreprise } = useEntreprise();
  const { openTab } = useTabs();
  const { openPersonneModal } = useContactModals();
  const itemsPerPage = 10;

  // Charger les personnes depuis le modèle relationnel
  const loadPersonnes = useCallback(async (page = 1) => {
    if (!currentEntreprise?.id) {
      console.warn('❌ [AssociatePersonModal] Organisation manquante pour charger les personnes');
      setError('Aucune organisation sélectionnée');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('🔄 [AssociatePersonModal] Chargement des personnes pour organisation:', currentEntreprise.id);
      console.log('📊 [AssociatePersonModal] Organisation complète:', currentEntreprise);
      
      // Charger toutes les personnes de l'organisation
      const result = await personnesService.listPersonnes(currentEntreprise.id);
      
      console.log('📋 [AssociatePersonModal] Résultat complet:', result);
      console.log('📋 [AssociatePersonModal] Personnes trouvées:', result.data?.length || 0);
      
      // Log des premières personnes pour debug
      if (result.data && result.data.length > 0) {
        console.log('👥 [AssociatePersonModal] Exemple de personnes:', result.data.slice(0, 3));
      }
      
      // Vérifier si la requête a réussi
      if (!result.success) {
        console.error('❌ [AssociatePersonModal] Erreur dans la requête:', result.error);
        throw new Error(result.error || 'Erreur lors du chargement des personnes');
      }
      
      const allPersonnes = result.data || [];
      
      // Transformer les données pour l'affichage
      const personnesData = allPersonnes.map(personne => ({
        id: personne.id,
        nom: `${personne.prenom || ''} ${personne.nom || ''}`.trim() || 'Personne sans nom',
        prenom: personne.prenom || '',
        nomFamille: personne.nom || '',
        fonction: personne.fonction || '',
        email: personne.email || '',
        telephone: personne.telephone || personne.telephone2 || '',
        ville: personne.ville || '',
        tags: personne.tags || [],
        // Données complètes pour référence
        _originalData: personne
      }));
      
      // Trier par nom après récupération
      personnesData.sort((a, b) => {
        const nomA = a.nomFamille || '';
        const nomB = b.nomFamille || '';
        if (sortOrder === 'asc') {
          return nomA.localeCompare(nomB);
        } else {
          return nomB.localeCompare(nomA);
        }
      });
      
      setPersonnes(personnesData);
      setTotalPages(Math.ceil(personnesData.length / itemsPerPage));
      
      console.log('✅ [AssociatePersonModal] Personnes chargées avec succès');
      console.log('📊 [AssociatePersonModal] Total personnes affichées:', personnesData.length);
    } catch (error) {
      console.error('❌ [AssociatePersonModal] Erreur lors du chargement des personnes:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [currentEntreprise, sortOrder]);

  // Filtrer les personnes selon le terme de recherche
  const filteredPersonnes = useMemo(() => {
    if (!searchTerm) return personnes;
    
    const term = searchTerm.toLowerCase();
    return personnes.filter(personne => 
      personne.nom.toLowerCase().includes(term) ||
      personne.fonction.toLowerCase().includes(term)
    );
  }, [personnes, searchTerm]);

  // Reset à la première page lors du changement de recherche
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Charger les fonctions depuis Firebase
  useEffect(() => {
    const loadFonctions = async () => {
      if (currentEntreprise?.id) {
        try {
          const fonctionsList = await fonctionsService.getActiveFonctions(currentEntreprise.id);
          setFonctions(fonctionsList);
        } catch (error) {
          console.error('Erreur lors du chargement des fonctions:', error);
        }
      }
    };
    loadFonctions();
  }, [currentEntreprise?.id]);

  // Charger les données au montage du composant
  useEffect(() => {
    if (isOpen && currentEntreprise?.id) {
      console.log('🔍 [DEBUG AssociatePersonModal] - Ouverture modal');
      console.log('📋 Organisation courante:', currentEntreprise.id);
      console.log('📋 existingPersonIds à l\'ouverture:', existingPersonIds);
      loadPersonnes();
    } else if (!isOpen) {
      // Reset des états quand la modale se ferme
      setCurrentStep(1);
      setSelectedPersonnes([]);
      setLiaisonInfo({
        fonction: '',
        actif: true,
        prioritaire: false,
        email: '',
        telPro: '',
        mobile: ''
      });
    }
  }, [isOpen, currentEntreprise?.id, loadPersonnes]);
  
  // Note: existingPersonIds est volontairement omis des dépendances pour éviter de recharger
  // les personnes à chaque changement. Les personnes déjà associées sont gérées visuellement
  // avec l'état disabled dans le rendu.
  // eslint-disable-next-line react-hooks/exhaustive-deps


  // Gérer la sélection des personnes
  const handlePersonSelection = (personneId) => {
    setSelectedPersonnes(prev => {
      if (prev.includes(personneId)) {
        // Désélectionner
        return prev.filter(id => id !== personneId);
      } else {
        // Sélectionner
        if (allowMultiple) {
          return [...prev, personneId];
        } else {
          return [personneId]; // Une seule sélection autorisée
        }
      }
    });
  };

  // Ouvrir la fiche d'une personne
  const handleViewDetails = () => {
    if (selectedPersonnes.length === 1) {
      const personneId = selectedPersonnes[0];
      openTab({
        id: `contact-${personneId}`,
        title: filteredPersonnes.find(p => p.id === personneId)?.nom || 'Personne',
        path: `/contacts/${personneId}`,
        component: 'ContactViewTabs',
        params: { id: personneId }
      });
    }
  };

  // Ouvrir le formulaire de création de nouvelle personne
  const handleNewPerson = () => {
    // Ouvrir la modal de création de personne
    openPersonneModal();
    
    // Optionnel: fermer la modal d'association
    // onClose();
  };

  // Changer l'ordre de tri
  const handleSortToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Passer à l'étape suivante ou associer
  const handleNext = () => {
    if (currentStep === 1) {
      // Passer à l'étape 2
      setCurrentStep(2);
    } else {
      // Étape 2 : associer avec les infos de liaison
      const selectedPersonnesData = filteredPersonnes.filter(p => selectedPersonnes.includes(p.id));
      
      // Ajouter les infos de liaison aux données
      const personnesWithLiaison = selectedPersonnesData.map(personne => ({
        ...personne,
        liaisonInfo: { ...liaisonInfo }
      }));
      
      console.log('🔍 [DEBUG AssociatePersonModal] - Envoi association avec infos de liaison');
      console.log('📋 Personnes avec liaison:', personnesWithLiaison);
      
      onAssociate(personnesWithLiaison);
      onClose();
      // Reset pour la prochaine ouverture
      setCurrentStep(1);
      setLiaisonInfo({
        fonction: '',
        actif: true,
        prioritaire: false,
        email: '',
        telPro: '',
        mobile: ''
      });
    }
  };
  
  // Retour à l'étape précédente
  const handleBack = () => {
    setCurrentStep(1);
  };

  // Pagination
  const paginatedPersonnes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPersonnes.slice(startIndex, endIndex);
  }, [filteredPersonnes, currentPage]);

  const totalItems = filteredPersonnes.length;
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(startItem + itemsPerPage - 1, totalItems);

  if (!isOpen) return null;


  // Rendu de l'étape 2 : Infos de liaison
  const renderStep2 = () => {
    const selectedPersonne = filteredPersonnes.find(p => selectedPersonnes.includes(p.id));
    
    return (
      <>
        {/* En-tête */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Associer une personne existante</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <i className="bi bi-x"></i>
          </button>
        </div>

        {/* Corps de l'étape 2 */}
        <div className={styles.modalBody}>
          <div className={styles.stepIndicator}>
            <span className={styles.stepCompleted}>1. Sélection</span>
            <i className="bi bi-chevron-right"></i>
            <span className={styles.stepActive}>2. Informations de liaison</span>
          </div>

          {selectedPersonne && (
            <div className={styles.selectedPersonneInfo}>
              <i className="bi bi-person-fill"></i>
              <strong>{selectedPersonne.nom}</strong>
              {selectedPersonne.fonction && <span> - {selectedPersonne.fonction}</span>}
            </div>
          )}

          <div className={styles.liaisonForm}>
            <h3>Infos de la personne dans la structure</h3>
            
            <div className={styles.formGroup}>
              <label>
                Fonction <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWithButton}>
                <select
                  value={liaisonInfo.fonction}
                  onChange={(e) => setLiaisonInfo({...liaisonInfo, fonction: e.target.value})}
                  required
                >
                  <option value="">Sélectionner une fonction</option>
                  {fonctions.map(fonction => (
                    <option key={fonction.id} value={fonction.nom}>
                      {fonction.nom}
                    </option>
                  ))}
                  <option value="_autre">Autre...</option>
                </select>
                <button 
                  type="button" 
                  className={styles.addButton}
                  title="Ajouter une nouvelle fonction"
                  onClick={() => {
                    const newFonction = prompt("Nouvelle fonction :");
                    if (newFonction) {
                      setLiaisonInfo({...liaisonInfo, fonction: newFonction});
                    }
                  }}
                >
                  <i className="bi bi-plus"></i>
                </button>
              </div>
            </div>

            <div className={styles.checkboxGroup}>
              <label>
                <input
                  type="checkbox"
                  checked={liaisonInfo.actif}
                  onChange={(e) => setLiaisonInfo({...liaisonInfo, actif: e.target.checked})}
                />
                Actif
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={liaisonInfo.prioritaire}
                  onChange={(e) => setLiaisonInfo({...liaisonInfo, prioritaire: e.target.checked})}
                />
                Prioritaire
              </label>
            </div>

            <div className={styles.formGroup}>
              <label>E-mail</label>
              <input
                type="email"
                value={liaisonInfo.email}
                onChange={(e) => setLiaisonInfo({...liaisonInfo, email: e.target.value})}
                placeholder="email@exemple.com"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Tél pro</label>
              <input
                type="tel"
                value={liaisonInfo.telPro}
                onChange={(e) => setLiaisonInfo({...liaisonInfo, telPro: e.target.value})}
                placeholder="01 23 45 67 89"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Mobile</label>
              <input
                type="tel"
                value={liaisonInfo.mobile}
                onChange={(e) => setLiaisonInfo({...liaisonInfo, mobile: e.target.value})}
                placeholder="06 12 34 56 78"
              />
            </div>
          </div>
        </div>

        {/* Pied de modal */}
        <div className={styles.modalFooter}>
          <div className={styles.actionButtons} style={{ width: '100%', justifyContent: 'space-between' }}>
            <button className={styles.backButton} onClick={handleBack}>
              &lt; Précédent
            </button>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className={styles.cancelButton} onClick={onClose}>
                Annuler
              </button>
              <button 
                className={styles.associateButton}
                disabled={!liaisonInfo.fonction}
                onClick={handleNext}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  return createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        {currentStep === 2 ? renderStep2() : (
          <>
            {/* En-tête */}
            <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Associer une personne existante</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <i className="bi bi-x"></i>
          </button>
        </div>

        {/* Bloc de sélection */}
        <div className={styles.selectionBlock}>
          <label className={styles.searchLabel}>Sélectionnez une personne :</label>
          <div className={styles.searchRow}>
            <div className={styles.searchInput}>
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Rechercher par nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              className={styles.detailsButton}
              disabled={selectedPersonnes.length !== 1}
              onClick={handleViewDetails}
            >
              Détails
            </button>
            <button 
              className={styles.newPersonButton}
              onClick={handleNewPerson}
            >
              + Nouvelle personne
            </button>
          </div>
        </div>

        {/* Tableau des résultats */}
        <div className={styles.tableContainer}>
          {loading ? (
            <div className={styles.loading}>
              <i className="bi bi-arrow-clockwise spinning"></i>
              Chargement des personnes...
            </div>
          ) : error ? (
            <div className={styles.error}>
              <i className="bi bi-exclamation-triangle"></i>
              Erreur: {error}
              <button onClick={() => loadPersonnes()} className={styles.retryButton}>
                <i className="bi bi-arrow-clockwise"></i> Réessayer
              </button>
            </div>
          ) : (
            <table className={styles.resultsTable}>
              <thead>
                <tr>
                  <th className={styles.checkboxColumn}>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPersonnes(paginatedPersonnes.map(p => p.id));
                        } else {
                          setSelectedPersonnes([]);
                        }
                      }}
                      checked={paginatedPersonnes.length > 0 && paginatedPersonnes.every(p => selectedPersonnes.includes(p.id))}
                    />
                  </th>
                  <th className={styles.nameColumn} onClick={handleSortToggle}>
                    Nom
                    <i className={`bi bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
                  </th>
                  <th className={styles.contactsColumn}>Contacts liés</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPersonnes.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '40px' }}>
                      <div>
                        <i className="bi bi-people" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                        <p style={{ marginTop: '10px', color: '#666' }}>
                          {searchTerm ? 
                            'Aucune personne ne correspond à votre recherche' : 
                            'Aucune personne disponible dans votre organisation'}
                        </p>
                        {!searchTerm && (
                          <p style={{ fontSize: '0.9rem', color: '#999' }}>
                            Cliquez sur "Nouvelle personne" pour créer votre première personne
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedPersonnes.map((personne) => {
                    const isAlreadyAssociated = existingPersonIds.includes(personne.id);
                    return (
                      <tr 
                        key={personne.id}
                        className={`${selectedPersonnes.includes(personne.id) ? styles.selectedRow : ''} ${isAlreadyAssociated ? styles.disabledRow : ''}`}
                        onClick={() => !isAlreadyAssociated && handlePersonSelection(personne.id)}
                        style={{ cursor: isAlreadyAssociated ? 'not-allowed' : 'pointer' }}
                      >
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedPersonnes.includes(personne.id)}
                            onChange={() => handlePersonSelection(personne.id)}
                            disabled={isAlreadyAssociated}
                          />
                        </td>
                        <td>
                          <div className={styles.personInfo}>
                            <strong>{personne.nom}</strong>
                            {personne.fonction && <div className={styles.fonction}>{personne.fonction}</div>}
                            {personne.ville && <div className={styles.ville}><i className="bi bi-geo-alt"></i> {personne.ville}</div>}
                            {isAlreadyAssociated && (
                              <div className={styles.alreadyAssociated}>
                                <i className="bi bi-check-circle-fill"></i> Déjà associée
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className={styles.contactsInfo}>
                            {personne.email && <div><i className="bi bi-envelope"></i> {personne.email}</div>}
                            {personne.telephone && <div><i className="bi bi-telephone"></i> {personne.telephone}</div>}
                            {personne.tags && personne.tags.length > 0 && (
                              <div className={styles.tags}>
                                {personne.tags.slice(0, 2).map((tag, idx) => (
                                  <span key={idx} className={styles.tag}>{tag}</span>
                                ))}
                                {personne.tags.length > 2 && <span className={styles.moreTags}>+{personne.tags.length - 2}</span>}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pied de modal */}
        <div className={styles.modalFooter}>
          {/* Pagination (gauche) */}
          <div className={styles.pagination}>
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
            >
              <i className="bi bi-chevron-double-left"></i>
            </button>
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              <i className="bi bi-chevron-double-right"></i>
            </button>
            <span className={styles.pageInfo}>
              Page {currentPage} sur {totalPages}
            </span>
            <button onClick={() => loadPersonnes(currentPage)}>
              <i className="bi bi-arrow-clockwise"></i>
            </button>
            <span className={styles.itemsInfo}>
              {startItem} à {endItem} sur {totalItems}
            </span>
          </div>

          {/* Boutons d'action (droite) */}
          <div className={styles.actionButtons}>
            <button className={styles.cancelButton} onClick={onClose}>
              Annuler
            </button>
            <button 
              className={styles.associateButton}
              disabled={selectedPersonnes.length === 0}
              onClick={handleNext}
            >
              Suivant &gt;
            </button>
          </div>
        </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

export default AssociatePersonModal;