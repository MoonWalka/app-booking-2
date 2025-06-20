import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, query, orderBy, getDocs, limit, startAfter } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
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
  const [filteredPersonnes, setFilteredPersonnes] = useState([]);
  const [selectedPersonnes, setSelectedPersonnes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' ou 'desc'
  
  const { openTab } = useTabs();
  const { openPersonneModal } = useContactModals();
  const itemsPerPage = 10;

  // Charger les personnes depuis Firestore
  const loadPersonnes = async (page = 1) => {
    setLoading(true);
    try {
      const personnesRef = collection(db, 'contacts_unified');
      const q = query(
        personnesRef,
        limit(itemsPerPage * 5) // Charger plus d'éléments pour compenser le filtrage
      );
      
      const snapshot = await getDocs(q);
      const personnesData = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Nouveau format unifié
        if (data.personne && (data.personne.nom || data.personne.prenom)) {
          personnesData.push({
            id: doc.id,
            nom: `${data.personne.prenom || ''} ${data.personne.nom || ''}`.trim(),
            prenom: data.personne.prenom || '',
            nomFamille: data.personne.nom || '',
            fonction: data.personne.fonction || '',
            email: data.personne.email || '',
            telephone: data.personne.telephone || data.personne.mobile || '',
            structures: [], // TODO: Récupérer les structures associées
            ...data
          });
        }
        // Ancien format (partiellement migré) - personne libre
        else if ((data.type === 'personne' || data.type === 'mixte') && 
                 (data.nom || data.prenom)) {
          personnesData.push({
            id: doc.id,
            nom: `${data.prenom || ''} ${data.nom || ''}`.trim(),
            prenom: data.prenom || '',
            nomFamille: data.nom || '',
            fonction: data.fonction || '',
            email: data.email || data.mailDirect || '',
            telephone: data.telephone || data.mobile || data.telDirect || '',
            structures: [],
            ...data
          });
        }
      });
      
      // Trier par nom après récupération
      personnesData.sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.nomFamille.localeCompare(b.nomFamille);
        } else {
          return b.nomFamille.localeCompare(a.nomFamille);
        }
      });
      
      setPersonnes(personnesData);
      // Calculer le nombre total de pages (approximatif)
      setTotalPages(Math.ceil(personnesData.length / itemsPerPage));
    } catch (error) {
      console.error('Erreur lors du chargement des personnes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les personnes selon le terme de recherche
  const filterPersonnes = useMemo(() => {
    if (!searchTerm) return personnes;
    
    const term = searchTerm.toLowerCase();
    return personnes.filter(personne => 
      personne.nom.toLowerCase().includes(term) ||
      personne.fonction.toLowerCase().includes(term)
    );
  }, [personnes, searchTerm]);

  // Mettre à jour la liste filtrée
  useEffect(() => {
    setFilteredPersonnes(filterPersonnes);
    setCurrentPage(1); // Reset à la première page lors du filtrage
  }, [filterPersonnes]);

  // Charger les données au montage du composant
  useEffect(() => {
    if (isOpen) {
      loadPersonnes();
    }
  }, [isOpen, sortOrder]);

  // Fonction publique pour rafraîchir la liste (utile après création d'une nouvelle personne)
  const refreshPersonnes = useCallback(() => {
    if (isOpen) {
      loadPersonnes(currentPage);
    }
  }, [isOpen, currentPage]);

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

  // Associer les personnes sélectionnées
  const handleAssociate = () => {
    const selectedPersonnesData = filteredPersonnes.filter(p => selectedPersonnes.includes(p.id));
    onAssociate(selectedPersonnesData);
    onClose();
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

  return createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
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
              Chargement...
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
                {paginatedPersonnes.map((personne) => {
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
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              onClick={handleAssociate}
            >
              Suivant &gt;
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default AssociatePersonModal;