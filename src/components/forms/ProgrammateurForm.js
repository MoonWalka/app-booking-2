import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import '../../style/programmateurForm.css';

const ProgrammateurForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    contact: {
      nom: '',
      prenom: '',
      fonction: '',
      email: '',
      telephone: ''
    },
    structure: {
      raisonSociale: '',
      type: '',
      adresse: '',
      codePostal: '',
      ville: '',
      pays: 'France',
      siret: '',
      tva: ''
    },
    // Remplacer 'lieu' par 'concertsAssociés'
    concertsAssocies: []
  });

  // États pour la recherche et la gestion des concerts
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchProgrammateur = async () => {
      if (id && id !== 'nouveau') {
        setLoading(true);
        try {
          const docRef = doc(db, 'programmateurs', id);
          const snap = await getDoc(docRef);
          
          if (snap.exists()) {
            // Si le document existe mais n'a pas la structure actuelle,
            // adapter les données existantes à la nouvelle structure
            const data = snap.data();
            const adaptedData = {
              contact: {
                nom: data.nom?.split(' ')[0] || '', // Tentative de séparer nom/prénom
                prenom: data.prenom || (data.nom?.includes(' ') ? data.nom.split(' ').slice(1).join(' ') : ''),
                fonction: data.fonction || '',
                email: data.email || '',
                telephone: data.telephone || ''
              },
              structure: {
                raisonSociale: data.structure || '',
                type: data.structureType || '',
                adresse: data.structureAdresse || '',
                codePostal: data.structureCodePostal || '',
                ville: data.structureVille || '',
                pays: data.structurePays || 'France',
                siret: data.siret || '',
                tva: data.tva || ''
              },
              concertsAssocies: data.concertsAssocies || []
            };
            
            setFormData(adaptedData);
            
            // Récupérer les détails des concerts associés si nécessaire
            if (adaptedData.concertsAssocies && adaptedData.concertsAssocies.length > 0) {
              await fetchConcertsDetails(adaptedData.concertsAssocies);
            }
          } else {
            console.error('Aucun programmateur trouvé avec cet ID');
            navigate('/programmateurs');
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du programmateur:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProgrammateur();
  }, [id, navigate]);

  // Effet pour gérer la recherche de concerts
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (searchTerm.length >= 2) {
      setIsSearching(true);
      
      searchTimeoutRef.current = setTimeout(() => {
        searchConcerts(searchTerm);
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);
  
  // Gestionnaire de clic extérieur pour fermer la liste déroulante
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fonction pour rechercher des concerts dans Firebase - AMÉLIORÉE
  const searchConcerts = async (term) => {
    try {
      setIsSearching(true);
      const termLower = term.toLowerCase();
      const concertsRef = collection(db, 'concerts');
      
      // Créer plusieurs requêtes pour rechercher dans différents champs
      // Nous ne pouvons pas faire OR directement dans Firestore, donc nous devons
      // exécuter plusieurs requêtes et fusionner les résultats
      
      // 1. Recherche par titre
      const titreQuery = query(
        concertsRef,
        orderBy('titre'),
        limit(20)
      );
      
      // 2. Recherche par lieu
      const lieuQuery = query(
        concertsRef,
        orderBy('lieuNom'),
        limit(20)
      );
      
      // 3. Recherche par programmateur
      const progQuery = query(
        concertsRef,
        orderBy('programmateurNom'),
        limit(20)
      );
      
      // Exécuter toutes les requêtes en parallèle
      const [titreSnap, lieuSnap, progSnap] = await Promise.all([
        getDocs(titreQuery),
        getDocs(lieuQuery),
        getDocs(progQuery)
      ]);
      
      // Collecter tous les résultats uniques
      const allResults = new Map(); // Utiliser une Map pour dédupliquer par ID
      
      // Fonction pour ajouter des résultats à la Map s'ils correspondent au terme de recherche
      const addMatchingResults = (snapshot, fieldFilter) => {
        snapshot.forEach(doc => {
          const data = doc.data();
          // Ne vérifier que si le document n'a pas encore été ajouté ou si fieldFilter est true
          if (!allResults.has(doc.id) && fieldFilter(data)) {
            allResults.set(doc.id, {
              id: doc.id,
              ...data
            });
          }
        });
      };
      
      // Ajouter les résultats qui correspondent au terme de recherche
      addMatchingResults(titreSnap, data => 
        data.titre && data.titre.toLowerCase().includes(termLower)
      );
      
      addMatchingResults(lieuSnap, data => 
        data.lieuNom && data.lieuNom.toLowerCase().includes(termLower)
      );
      
      addMatchingResults(progSnap, data => 
        data.programmateurNom && data.programmateurNom.toLowerCase().includes(termLower)
      );
      
      // Convertir la Map en array et filtrer les concerts déjà associés
      const filteredResults = Array.from(allResults.values())
        .filter(concert => !formData.concertsAssocies.some(
          existingConcert => existingConcert.id === concert.id
        ));
      
      // Trier les résultats par pertinence et date
      const sortedResults = filteredResults.sort((a, b) => {
        // Priorité 1: Titre correspond exactement
        if (a.titre?.toLowerCase() === termLower && b.titre?.toLowerCase() !== termLower) return -1;
        if (b.titre?.toLowerCase() === termLower && a.titre?.toLowerCase() !== termLower) return 1;
        
        // Priorité 2: Titre commence par le terme
        if (a.titre?.toLowerCase().startsWith(termLower) && !b.titre?.toLowerCase().startsWith(termLower)) return -1;
        if (b.titre?.toLowerCase().startsWith(termLower) && !a.titre?.toLowerCase().startsWith(termLower)) return 1;
        
        // Priorité 3: Date (plus récent d'abord)
        const dateA = a.date?.seconds || 0;
        const dateB = b.date?.seconds || 0;
        return dateB - dateA;
      });
      
      // Limiter le nombre de résultats pour l'affichage
      setSearchResults(sortedResults.slice(0, 10));
    } catch (error) {
      console.error('Erreur lors de la recherche de concerts:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Fonction pour récupérer les détails complets des concerts associés
  const fetchConcertsDetails = async (concertIds) => {
    try {
      const concertsDetails = [];
      
      for (const concertItem of concertIds) {
        // Si nous avons juste l'ID, récupérer les détails complets
        if (typeof concertItem === 'string') {
          const concertDoc = await getDoc(doc(db, 'concerts', concertItem));
          if (concertDoc.exists()) {
            concertsDetails.push({
              id: concertDoc.id,
              ...concertDoc.data()
            });
          }
        } else {
          // Si nous avons déjà un objet avec des détails, l'utiliser tel quel
          concertsDetails.push(concertItem);
        }
      }
      
      setFormData(prev => ({
        ...prev,
        concertsAssocies: concertsDetails
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des détails des concerts:', error);
    }
  };

  // Fonction pour associer un concert au programmateur
  const handleAssociateConcert = (concert) => {
    setFormData(prev => ({
      ...prev,
      concertsAssocies: [...prev.concertsAssocies, concert]
    }));
    
    setSearchTerm('');
    setSearchResults([]);
  };
  
  // Fonction pour dissocier un concert du programmateur
  const handleRemoveConcert = (concertId) => {
    setFormData(prev => ({
      ...prev,
      concertsAssocies: prev.concertsAssocies.filter(c => c.id !== concertId)
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Gérer les champs imbriqués (ex: contact.nom, structure.adresse, etc.)
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prevState => ({
        ...prevState,
        [section]: {
          ...prevState[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      // Validation des champs obligatoires
      if (!formData.contact.nom || !formData.contact.email) {
        alert('Le nom et l\'email sont obligatoires');
        setIsSubmitting(false);
        return;
      }
  
      const progId = id && id !== 'nouveau'
        ? id
        : doc(collection(db, 'programmateurs')).id;
  
      // Préparer les données en aplatissant la structure pour la compatibilité avec l'affichage liste
      const flattenedData = {
        // Champs principaux pour l'affichage dans la liste
        nom: `${formData.contact.nom} ${formData.contact.prenom}`.trim(),
        structure: formData.structure.raisonSociale,
        email: formData.contact.email,
        telephone: formData.contact.telephone,
        
        // Ajouter tous les champs détaillés
        ...formData.contact,
        ...Object.keys(formData.structure).reduce((acc, key) => {
          acc[`structure${key.charAt(0).toUpperCase() + key.slice(1)}`] = formData.structure[key];
          return acc;
        }, {}),
        
        // Traiter les concerts associés
        // Ne stocker que les ID et les titres des concerts pour éviter de dupliquer trop de données
        concertsAssocies: formData.concertsAssocies.map(concert => ({
          id: concert.id,
          titre: concert.titre,
          date: concert.date,
          lieu: concert.lieu
        })),
        
        // Timestamps
        updatedAt: serverTimestamp()
      };
  
      if (!id || id === 'nouveau') {
        flattenedData.createdAt = serverTimestamp();
      }
  
      await setDoc(doc(db, 'programmateurs', progId), flattenedData, { merge: true });
      
      // Mise à jour réciproque : ajouter le programmateur à chaque concert
      for (const concert of formData.concertsAssocies) {
        const concertRef = doc(db, 'concerts', concert.id);
        await updateDoc(concertRef, {
          programmateurs: arrayUnion({
            id: progId,
            nom: flattenedData.nom
          })
        });
      }
      
      navigate('/programmateurs');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du programmateur:', error);
      alert('Une erreur est survenue lors de l\'enregistrement du programmateur.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/programmateurs');
  };

  if (loading) {
    return <div className="text-center my-5 loading-spinner">Chargement du programmateur...</div>;
  }
  
  // Formatage de la date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return 'Date non spécifiée';
    
    // Si c'est un timestamp Firestore
    if (dateString.seconds) {
      return new Date(dateString.seconds * 1000).toLocaleDateString('fr-FR');
    }
    
    // Si c'est une chaîne de date standard
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch (e) {
      return dateString;
    }
  };

  // Fonction pour obtenir le libellé du statut
  const getStatusLabel = (statut) => {
    switch (statut) {
      case 'contact': return 'Contact établi';
      case 'preaccord': return 'Pré-accord';
      case 'contrat': return 'Contrat signé';
      case 'acompte': return 'Acompte facturé';
      case 'solde': return 'Solde facturé';
      case 'annule': return 'Annulé';
      default: return statut || 'Non défini';
    }
  };
  
  return (
    <div className="programmateur-form-container">
      <div className="form-header-container">
        <h2 className="modern-title">
          {id && id !== 'nouveau' ? 'Modifier le programmateur' : 'Ajouter un programmateur'}
        </h2>
        <div className="breadcrumb-container">
          <span className="breadcrumb-item" onClick={() => navigate('/programmateurs')}>Programmateurs</span>
          <i className="bi bi-chevron-right"></i>
          <span className="breadcrumb-item active">
            {id && id !== 'nouveau' ? formData.contact.nom || 'Édition' : 'Nouveau'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="modern-form">
        {/* Section Informations du contact */}
        <div className="form-card">
          <div className="card-header">
            <i className="bi bi-person-vcard"></i>
            <h3>Informations du contact</h3>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="contact.nom" className="form-label">Nom <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="contact.nom"
                    name="contact.nom"
                    value={formData.contact.nom}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Dupont"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="contact.prenom" className="form-label">Prénom</label>
                  <input
                    type="text"
                    className="form-control"
                    id="contact.prenom"
                    name="contact.prenom"
                    value={formData.contact.prenom}
                    onChange={handleChange}
                    placeholder="Ex: Jean"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contact.fonction" className="form-label">Fonction</label>
              <input
                type="text"
                className="form-control"
                id="contact.fonction"
                name="contact.fonction"
                value={formData.contact.fonction}
                onChange={handleChange}
                placeholder="Ex: Directeur artistique"
              />
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="contact.email" className="form-label">Email <span className="required">*</span></label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                    <input
                      type="email"
                      className="form-control"
                      id="contact.email"
                      name="contact.email"
                      value={formData.contact.email}
                      onChange={handleChange}
                      required
                      placeholder="Ex: jean.dupont@example.com"
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="contact.telephone" className="form-label">Téléphone</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-telephone"></i></span>
                    <input
                      type="tel"
                      className="form-control"
                      id="contact.telephone"
                      name="contact.telephone"
                      value={formData.contact.telephone}
                      onChange={handleChange}
                      placeholder="Ex: 01 23 45 67 89"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Structure juridique */}
        <div className="form-card">
          <div className="card-header">
            <i className="bi bi-building"></i>
            <h3>Structure juridique</h3>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-7">
                <div className="form-group">
                  <label htmlFor="structure.raisonSociale" className="form-label">Raison sociale</label>
                  <input
                    type="text"
                    className="form-control"
                    id="structure.raisonSociale"
                    name="structure.raisonSociale"
                    value={formData.structure.raisonSociale}
                    onChange={handleChange}
                    placeholder="Ex: Association Culturelle XYZ"
                  />
                </div>
              </div>
              <div className="col-md-5">
                <div className="form-group">
                  <label htmlFor="structure.type" className="form-label">Type de structure</label>
                  <select
                    className="form-select"
                    id="structure.type"
                    name="structure.type"
                    value={formData.structure.type}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionnez un type</option>
                    <option value="association">Association</option>
                    <option value="mairie">Mairie / Collectivité</option>
                    <option value="entreprise">Entreprise</option>
                    <option value="auto-entrepreneur">Auto-entrepreneur</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="structure.adresse" className="form-label">Adresse complète</label>
              <input
                type="text"
                className="form-control"
                id="structure.adresse"
                name="structure.adresse"
                value={formData.structure.adresse}
                onChange={handleChange}
                placeholder="Numéro et nom de rue"
              />
            </div>

            <div className="row">
              <div className="col-md-4">
                <div className="form-group">
                  <label htmlFor="structure.codePostal" className="form-label">Code postal</label>
                  <input
                    type="text"
                    className="form-control"
                    id="structure.codePostal"
                    name="structure.codePostal"
                    value={formData.structure.codePostal}
                    onChange={handleChange}
                    placeholder="Ex: 75001"
                  />
                </div>
              </div>
              <div className="col-md-5">
                <div className="form-group">
                  <label htmlFor="structure.ville" className="form-label">Ville</label>
                  <input
                    type="text"
                    className="form-control"
                    id="structure.ville"
                    name="structure.ville"
                    value={formData.structure.ville}
                    onChange={handleChange}
                    placeholder="Ex: Paris"
                  />
                </div>
              </div>
              <div className="col-md-3">
                <div className="form-group">
                  <label htmlFor="structure.pays" className="form-label">Pays</label>
                  <input
                    type="text"
                    className="form-control"
                    id="structure.pays"
                    name="structure.pays"
                    value={formData.structure.pays}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="structure.siret" className="form-label">SIRET</label>
                  <input
                    type="text"
                    className="form-control"
                    id="structure.siret"
                    name="structure.siret"
                    value={formData.structure.siret}
                    onChange={handleChange}
                    placeholder="Ex: 123 456 789 00012"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="structure.tva" className="form-label">N° TVA intracommunautaire <span className="optional">(facultatif)</span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="structure.tva"
                    name="structure.tva"
                    value={formData.structure.tva}
                    onChange={handleChange}
                    placeholder="Ex: FR123456789"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NOUVELLE SECTION: Concerts associés */}
        <div className="form-card">
          <div className="card-header">
            <i className="bi bi-music-note-list"></i>
            <h3>Concerts associés</h3>
          </div>
          <div className="card-body">
            {/* Barre de recherche pour ajouter un concert */}
            <div className="concert-search-container mb-4" ref={dropdownRef}>
              <label className="form-label">Associer un concert</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher un concert par titre, lieu ou programmateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    className="btn btn-outline-secondary clear-search" 
                    onClick={() => setSearchTerm('')}
                    type="button"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}
              </div>
              
              {isSearching && (
                <div className="dropdown-menu show w-100">
                  <div className="dropdown-item text-center">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Recherche en cours...</span>
                    </div>
                  </div>
                </div>
              )}
              
              {searchResults.length > 0 && (
                <div className="dropdown-menu show w-100">
                  {searchResults.map(concert => (
                    <div 
                      key={concert.id} 
                      className="dropdown-item concert-item"
                      onClick={() => handleAssociateConcert(concert)}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="concert-search-info">
                          <div className="concert-title">
                            {concert.titre || "Sans titre"}
                            {concert.statut && (
                              <span className={`concert-status status-${concert.statut}`}>
                                {getStatusLabel(concert.statut)}
                              </span>
                            )}
                          </div>
                          <div className="concert-details">
                            {concert.date && (
                              <span className="concert-date">
                                <i className="bi bi-calendar-event"></i>
                                {formatDate(concert.date)}
                              </span>
                            )}
                            {concert.lieuNom && (
                              <span className="concert-lieu">
                                <i className="bi bi-geo-alt"></i>
                                {concert.lieuNom}
                              </span>
                            )}
                            {concert.programmateurNom && (
                              <span className="concert-prog">
                                <i className="bi bi-person"></i>
                                {concert.programmateurNom}
                              </span>
                            )}
                            {concert.montant && (
                              <span className="concert-montant">
                                <i className="bi bi-currency-euro"></i>
                                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(concert.montant)}
                              </span>
                            )}
                          </div>
                        </div>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssociateConcert(concert);
                          }}
                        >
                          <i className="bi bi-plus-lg"></i> Associer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {searchTerm.length >= 2 && searchResults.length === 0 && !isSearching && (
                <div className="dropdown-menu show w-100">
                  <div className="dropdown-item text-center text-muted">
                    Aucun concert trouvé
                  </div>
                </div>
              )}
              
              <small className="form-text text-muted mt-2">
                Tapez au moins 2 caractères pour rechercher un concert par titre, lieu ou programmateur.
              </small>
            </div>

            {/* Liste des concerts associés */}
            <div className="associated-concerts">
              <h4 className="mb-3 concerts-title">
                {formData.concertsAssocies.length > 0 
                  ? `Concerts associés (${formData.concertsAssocies.length})` 
                  : 'Aucun concert associé'}
              </h4>
              
              {formData.concertsAssocies.length > 0 ? (
                <div className="concert-list">
                  {formData.concertsAssocies.map(concert => (
                    <div key={concert.id} className="concert-card">
                      <div className="concert-card-body">
                        <div className="concert-info">
                          <h5 className="concert-name">
                            <i className="bi bi-music-note me-2"></i>
                            {concert.titre}
                            {concert.statut && (
                              <span className={`concert-status status-${concert.statut}`}>
                                {getStatusLabel(concert.statut)}
                              </span>
                            )}
                          </h5>
                          <div className="concert-details">
                            {concert.date && (
                              <span className="concert-detail">
                                <i className="bi bi-calendar-event"></i>
                                {formatDate(concert.date)}
                              </span>
                            )}
                            {concert.lieuNom && (
                              <span className="concert-detail">
                                <i className="bi bi-geo-alt"></i>
                                {concert.lieuNom}
                              </span>
                            )}
                            {concert.montant && (
                              <span className="concert-detail">
                                <i className="bi bi-currency-euro"></i>
                                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(concert.montant)}
                              </span>
                            )}
                          </div>
                        </div>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-danger" 
                          onClick={() => handleRemoveConcert(concert.id)}
                          aria-label="Retirer ce concert"
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Aucun concert n'est associé à ce programmateur. Utilisez la barre de recherche ci-dessus pour associer des concerts.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <i className="bi bi-x-circle me-2"></i>
            Annuler
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Enregistrement...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                {id && id !== 'nouveau' ? 'Enregistrer les modifications' : 'Créer le programmateur'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProgrammateurForm;
