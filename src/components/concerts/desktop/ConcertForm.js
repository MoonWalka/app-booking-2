import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { db } from '../../../firebaseInit';
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  arrayUnion, arrayRemove, query, where, orderBy, limit, serverTimestamp
} from 'firebase/firestore';
import { handleDelete } from './handlers/deleteHandler';
import styles from './ConcertForm.module.css';


const ConcertForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id && id !== 'nouveau');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [initialProgrammateurId, setInitialProgrammateurId] = useState(null);
  const [initialArtisteId, setInitialArtisteId] = useState(null);
  
  // États pour les entités sélectionnées
  const [selectedLieu, setSelectedLieu] = useState(null);
  const [selectedProgrammateur, setSelectedProgrammateur] = useState(null);
  const [selectedArtiste, setSelectedArtiste] = useState(null);
  
  // États pour la recherche
  const [lieuSearchTerm, setLieuSearchTerm] = useState('');
  const [progSearchTerm, setProgSearchTerm] = useState('');
  const [artisteSearchTerm, setArtisteSearchTerm] = useState('');
  
  const [lieuResults, setLieuResults] = useState([]);
  const [progResults, setProgResults] = useState([]);
  const [artisteResults, setArtisteResults] = useState([]);
  
  const [showLieuResults, setShowLieuResults] = useState(false);
  const [showProgResults, setShowProgResults] = useState(false);
  const [showArtisteResults, setShowArtisteResults] = useState(false);
  
  const [isSearchingLieux, setIsSearchingLieux] = useState(false);
  const [isSearchingProgs, setIsSearchingProgs] = useState(false);
  const [isSearchingArtistes, setIsSearchingArtistes] = useState(false);
  
  // Refs pour les dropdowns
  const lieuDropdownRef = useRef(null);
  const progDropdownRef = useRef(null);
  const artisteDropdownRef = useRef(null);
  
  // Timeout refs pour la recherche
  const lieuSearchTimeoutRef = useRef(null);
  const progSearchTimeoutRef = useRef(null);
  const artisteSearchTimeoutRef = useRef(null);
  
  // Formulaire principal
  const [formData, setFormData] = useState({
    date: '',
    montant: '',
    statut: 'En attente',
    titre: '',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Si c'est une modification, récupérer les détails du concert
        if (id && id !== 'nouveau') {
          const concertRef = doc(db, 'concerts', id);
          const concertDoc = await getDoc(concertRef);
          if (concertDoc.exists()) {
            const concertData = concertDoc.data();
            console.log('Données du concert chargées:', concertData);
            
            // Stocker l'ID du programmateur initial pour gérer la mise à jour
            if (concertData.programmateurId) {
              setInitialProgrammateurId(concertData.programmateurId);
            }

            // Stocker l'ID de l'artiste initial pour gérer la mise à jour
            if (concertData.artisteId) {
              setInitialArtisteId(concertData.artisteId);
            }
            
            // Si on a un lieu associé, le récupérer
            if (concertData.lieuId) {
              try {
                const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
                if (lieuDoc.exists()) {
                  setSelectedLieu({
                    id: concertData.lieuId,
                    ...lieuDoc.data()
                  });
                  setLieuSearchTerm(concertData.lieuNom || lieuDoc.data().nom);
                }
              } catch (error) {
                console.error('Erreur lors de la récupération du lieu:', error);
              }
            }
            
            // Si on a un programmateur associé, le récupérer
            if (concertData.programmateurId) {
              try {
                const progDoc = await getDoc(doc(db, 'programmateurs', concertData.programmateurId));
                if (progDoc.exists()) {
                  setSelectedProgrammateur({
                    id: concertData.programmateurId,
                    ...progDoc.data()
                  });
                  setProgSearchTerm(concertData.programmateurNom || progDoc.data().nom);
                }
              } catch (error) {
                console.error('Erreur lors de la récupération du programmateur:', error);
              }
            }

            // Si on a un artiste associé, le récupérer
            if (concertData.artisteId) {
              try {
                const artisteDoc = await getDoc(doc(db, 'artistes', concertData.artisteId));
                if (artisteDoc.exists()) {
                  setSelectedArtiste({
                    id: concertData.artisteId,
                    ...artisteDoc.data()
                  });
                  setArtisteSearchTerm(concertData.artisteNom || artisteDoc.data().nom);
                }
              } catch (error) {
                console.error('Erreur lors de la récupération de l\'artiste:', error);
              }
            }
            
            // Initialiser le formulaire avec les données du concert
            setFormData({
              date: concertData.date || '',
              montant: concertData.montant || '',
              statut: concertData.statut || 'En attente',
              titre: concertData.titre || '',
              notes: concertData.notes || ''
            });
          } else {
            console.error('Concert non trouvé');
            navigate('/concerts');
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id, navigate]);

  // Gestionnaire de clics en dehors des dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (lieuDropdownRef.current && !lieuDropdownRef.current.contains(event.target)) {
        setShowLieuResults(false);
      }
      if (progDropdownRef.current && !progDropdownRef.current.contains(event.target)) {
        setShowProgResults(false);
      }
      if (artisteDropdownRef.current && !artisteDropdownRef.current.contains(event.target)) {
        setShowArtisteResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Effet pour la recherche de lieux
  useEffect(() => {
    if (lieuSearchTimeoutRef.current) {
      clearTimeout(lieuSearchTimeoutRef.current);
    }
    
    if (lieuSearchTerm.length >= 2) {
      setIsSearchingLieux(true);
      lieuSearchTimeoutRef.current = setTimeout(() => {
        searchLieux(lieuSearchTerm);
      }, 300);
    } else {
      setLieuResults([]);
      setIsSearchingLieux(false);
    }
    
    return () => {
      if (lieuSearchTimeoutRef.current) {
        clearTimeout(lieuSearchTimeoutRef.current);
      }
    };
  }, [lieuSearchTerm]);

  // Effet pour la recherche de programmateurs
  useEffect(() => {
    if (progSearchTimeoutRef.current) {
      clearTimeout(progSearchTimeoutRef.current);
    }
    
    if (progSearchTerm.length >= 2) {
      setIsSearchingProgs(true);
      progSearchTimeoutRef.current = setTimeout(() => {
        searchProgrammateurs(progSearchTerm);
      }, 300);
    } else {
      setProgResults([]);
      setIsSearchingProgs(false);
    }
    
    return () => {
      if (progSearchTimeoutRef.current) {
        clearTimeout(progSearchTimeoutRef.current);
      }
    };
  }, [progSearchTerm]);

  // Effet pour la recherche d'artistes
  useEffect(() => {
    if (artisteSearchTimeoutRef.current) {
      clearTimeout(artisteSearchTimeoutRef.current);
    }
    
    if (artisteSearchTerm.length >= 2) {
      setIsSearchingArtistes(true);
      artisteSearchTimeoutRef.current = setTimeout(() => {
        searchArtistes(artisteSearchTerm);
      }, 300);
    } else {
      setArtisteResults([]);
      setIsSearchingArtistes(false);
    }
    
    return () => {
      if (artisteSearchTimeoutRef.current) {
        clearTimeout(artisteSearchTimeoutRef.current);
      }
    };
  }, [artisteSearchTerm]);

  // Fonction pour rechercher des lieux
  const searchLieux = async (term) => {
    try {
      const termLower = term.toLowerCase();
      
      // Requête Firestore pour les lieux
      const lieuxRef = collection(db, 'lieux');
      const lieuxQuery = query(
        lieuxRef,
        where('nom', '>=', termLower),
        where('nom', '<=', termLower + '\uf8ff'),
        limit(10)
      );
      
      const lieuxSnapshot = await getDocs(lieuxQuery);
      const lieuxData = lieuxSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setLieuResults(lieuxData);
      setShowLieuResults(true);
    } catch (error) {
      console.error('Erreur lors de la recherche de lieux:', error);
    } finally {
      setIsSearchingLieux(false);
    }
  };

  // Fonction pour rechercher des programmateurs
  const searchProgrammateurs = async (term) => {
    try {
      const termLower = term.toLowerCase();
      
      // Requête Firestore pour les programmateurs
      const progsRef = collection(db, 'programmateurs');
      const progsQuery = query(
        progsRef,
        where('nom', '>=', termLower),
        where('nom', '<=', termLower + '\uf8ff'),
        limit(10)
      );
      
      const progsSnapshot = await getDocs(progsQuery);
      const progsData = progsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setProgResults(progsData);
      setShowProgResults(true);
    } catch (error) {
      console.error('Erreur lors de la recherche de programmateurs:', error);
    } finally {
      setIsSearchingProgs(false);
    }
  };

  // Fonction pour rechercher des artistes
  const searchArtistes = async (term) => {
    try {
      const termLower = term.toLowerCase();
      
      // Requête Firestore pour les artistes
      const artistesRef = collection(db, 'artistes');
      const artistesQuery = query(
        artistesRef,
        where('nom', '>=', termLower),
        where('nom', '<=', termLower + '\uf8ff'),
        limit(10)
      );
      
      const artistesSnapshot = await getDocs(artistesQuery);
      const artistesData = artistesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setArtisteResults(artistesData);
      setShowArtisteResults(true);
    } catch (error) {
      console.error('Erreur lors de la recherche d\'artistes:', error);
    } finally {
      setIsSearchingArtistes(false);
    }
  };

  // Gestion de la sélection d'un lieu
  const handleSelectLieu = (lieu) => {
    setSelectedLieu(lieu);
    setLieuSearchTerm(lieu.nom);
    setShowLieuResults(false);
  };

  // Gestion de la sélection d'un programmateur
  const handleSelectProgrammateur = (prog) => {
    setSelectedProgrammateur(prog);
    setProgSearchTerm(prog.nom);
    setShowProgResults(false);
  };

  // Gestion de la sélection d'un artiste
  const handleSelectArtiste = (artiste) => {
    setSelectedArtiste(artiste);
    setArtisteSearchTerm(artiste.nom);
    setShowArtisteResults(false);
  };

  // Suppression des entités sélectionnées
  const handleRemoveLieu = () => {
    setSelectedLieu(null);
    setLieuSearchTerm('');
  };

  const handleRemoveProgrammateur = () => {
    setSelectedProgrammateur(null);
    setProgSearchTerm('');
  };

  const handleRemoveArtiste = () => {
    setSelectedArtiste(null);
    setArtisteSearchTerm('');
  };

  // Création d'un nouveau lieu
  const handleCreateLieu = async () => {
    try {
      if (!lieuSearchTerm.trim()) {
        alert('Veuillez saisir un nom de lieu avant de créer un nouveau lieu.');
        return;
      }
      
      const newLieuRef = doc(collection(db, 'lieux'));
      const lieuData = {
        nom: lieuSearchTerm.trim(),
        nomLowercase: lieuSearchTerm.trim().toLowerCase(),
        adresse: '',
        codePostal: '',
        ville: '',
        capacite: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(newLieuRef, lieuData);
      
      const newLieuWithId = { 
        id: newLieuRef.id,
        ...lieuData
      };
      
      setSelectedLieu(newLieuWithId);
      setShowLieuResults(false);
      
      alert(`Le lieu "${lieuData.nom}" a été créé avec succès. Vous pourrez compléter ses détails plus tard.`);
      
    } catch (error) {
      console.error('Erreur lors de la création du lieu:', error);
      alert('Une erreur est survenue lors de la création du lieu.');
    }
  };

  // Création d'un nouveau programmateur
  const handleCreateProgrammateur = async () => {
    try {
      if (!progSearchTerm.trim()) {
        alert('Veuillez saisir un nom de programmateur avant de créer un nouveau programmateur.');
        return;
      }
      
      const newProgRef = doc(collection(db, 'programmateurs'));
      const progData = {
        nom: progSearchTerm.trim(),
        nomLowercase: progSearchTerm.trim().toLowerCase(),
        email: '',
        telephone: '',
        structure: '',
        concertsAssocies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(newProgRef, progData);
      
      const newProgWithId = { 
        id: newProgRef.id,
        ...progData
      };
      
      setSelectedProgrammateur(newProgWithId);
      setShowProgResults(false);
      
      alert(`Le programmateur "${progData.nom}" a été créé avec succès. Vous pourrez compléter ses détails plus tard.`);
      
    } catch (error) {
      console.error('Erreur lors de la création du programmateur:', error);
      alert('Une erreur est survenue lors de la création du programmateur.');
    }
  };

  // Création d'un nouvel artiste
  const handleCreateArtiste = async () => {
    try {
      if (!artisteSearchTerm.trim()) {
        alert('Veuillez saisir un nom d\'artiste avant de créer un nouvel artiste.');
        return;
      }
      
      const newArtisteRef = doc(collection(db, 'artistes'));
      const artisteData = {
        nom: artisteSearchTerm.trim(),
        description: '',
        genre: '',
        membres: [],
        contacts: {
          email: '',
          telephone: '',
          siteWeb: '',
          instagram: '',
          facebook: ''
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(newArtisteRef, artisteData);
      
      const newArtisteWithId = { 
        id: newArtisteRef.id,
        ...artisteData
      };
      
      setSelectedArtiste(newArtisteWithId);
      setShowArtisteResults(false);
      
      alert(`L'artiste "${artisteData.nom}" a été créé avec succès. Vous pourrez compléter ses détails plus tard.`);
      
    } catch (error) {
      console.error('Erreur lors de la création de l\'artiste:', error);
      alert('Une erreur est survenue lors de la création de l\'artiste.');
    }
  };

  // Gestion du changement de champs de formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Valider le formulaire
  const validateForm = () => {
    return formData.date && formData.montant && selectedLieu;
  };

  // Mise à jour des associations bidirectionnelles
  const updateProgrammateurAssociation = async (concertId, concertData, newProgrammateurId, oldProgrammateurId) => {
    try {
      // Si un nouveau programmateur est sélectionné
      if (newProgrammateurId) {
        const progRef = doc(db, 'programmateurs', newProgrammateurId);
        
        // Ajouter le concert à la liste des concerts associés du programmateur
        const concertReference = {
          id: concertId,
          titre: concertData.titre || 'Sans titre',
          date: concertData.date || null,
          lieu: selectedLieu?.nom || null
        };
        
        await updateDoc(progRef, {
          concertsAssocies: arrayUnion(concertReference),
          updatedAt: new Date().toISOString()
        });
        console.log('Concert ajouté à la liste des concerts associés du programmateur');
      }
      
      // Si un ancien programmateur était associé et a changé
      if (oldProgrammateurId && oldProgrammateurId !== newProgrammateurId) {
        const oldProgRef = doc(db, 'programmateurs', oldProgrammateurId);
        const oldProgDoc = await getDoc(oldProgRef);
        
        if (oldProgDoc.exists()) {
          // Récupérer la liste actuelle et supprimer ce concert
          const oldProgData = oldProgDoc.data();
          const updatedConcerts = (oldProgData.concertsAssocies || [])
            .filter(c => c.id !== concertId);
          
          await updateDoc(oldProgRef, {
            concertsAssocies: updatedConcerts,
            updatedAt: new Date().toISOString()
          });
          console.log('Concert retiré de la liste des concerts associés de l\'ancien programmateur');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des associations programmateur-concert:', error);
    }
  };

  // Mise à jour des associations artiste-concert
  const updateArtisteAssociation = async (concertId, concertData, newArtisteId, oldArtisteId) => {
    try {
      // Si un nouvel artiste est sélectionné
      if (newArtisteId) {
        const artisteRef = doc(db, 'artistes', newArtisteId);
        
        // Ajouter le concert à la liste des concerts de l'artiste
        const concertReference = {
          id: concertId,
          titre: concertData.titre || 'Sans titre',
          date: concertData.date || null,
          lieu: selectedLieu?.nom || null
        };
        
        await updateDoc(artisteRef, {
          concerts: arrayUnion(concertReference),
          updatedAt: new Date().toISOString()
        });
        console.log('Concert ajouté à la liste des concerts de l\'artiste');
      }
      
      // Si un ancien artiste était associé et a changé
      if (oldArtisteId && oldArtisteId !== newArtisteId) {
        const oldArtisteRef = doc(db, 'artistes', oldArtisteId);
        const oldArtisteDoc = await getDoc(oldArtisteRef);
        
        if (oldArtisteDoc.exists()) {
          // Récupérer la liste actuelle et supprimer ce concert
          const oldArtisteData = oldArtisteDoc.data();
          const updatedConcerts = (oldArtisteData.concerts || [])
            .filter(c => c.id !== concertId);
          
          await updateDoc(oldArtisteRef, {
            concerts: updatedConcerts,
            updatedAt: new Date().toISOString()
          });
          console.log('Concert retiré de la liste des concerts de l\'ancien artiste');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des associations artiste-concert:', error);
    }
  };

  // Enregistrement du concert
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Veuillez remplir tous les champs obligatoires (date, montant, lieu).');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Créer l'objet de données du concert
      const concertData = {
        ...formData,
        lieuId: selectedLieu?.id || null,
        lieuNom: selectedLieu?.nom || null,
        lieuAdresse: selectedLieu?.adresse || null,
        lieuCodePostal: selectedLieu?.codePostal || null,
        lieuVille: selectedLieu?.ville || null,
        lieuCapacite: selectedLieu?.capacite || null,
        
        programmateurId: selectedProgrammateur?.id || null,
        programmateurNom: selectedProgrammateur?.nom || null,
        
        artisteId: selectedArtiste?.id || null,
        artisteNom: selectedArtiste?.nom || null,
        
        updatedAt: new Date().toISOString()
      };
      
      let concertId = id;
      
      if (id && id !== 'nouveau') {
        // Mise à jour d'un concert existant
        await updateDoc(doc(db, 'concerts', id), concertData);
      } else {
        // Création d'un nouveau concert
        concertData.createdAt = new Date().toISOString();
        const newConcertRef = doc(collection(db, 'concerts'));
        concertId = newConcertRef.id;
        await setDoc(newConcertRef, concertData);
      }
      
      // Mises à jour bidirectionnelles
      if (selectedProgrammateur?.id || initialProgrammateurId) {
        await updateProgrammateurAssociation(
          concertId,
          concertData,
          selectedProgrammateur?.id || null,
          initialProgrammateurId
        );
      }
      
      if (selectedArtiste?.id || initialArtisteId) {
        await updateArtisteAssociation(
          concertId,
          concertData,
          selectedArtiste?.id || null,
          initialArtisteId
        );
      }
      
      navigate('/concerts');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du concert:', error);
      alert('Une erreur est survenue lors de l\'enregistrement du concert.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Suppression du concert
  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      
      // Mise à jour du programmateur si nécessaire
      if (selectedProgrammateur?.id) {
        try {
          const progRef = doc(db, 'programmateurs', selectedProgrammateur.id);
          const progDoc = await getDoc(progRef);
          
          if (progDoc.exists()) {
            const progData = progDoc.data();
            const updatedConcerts = (progData.concertsAssocies || [])
              .filter(c => c.id !== id);
            
            await updateDoc(progRef, {
              concertsAssocies: updatedConcerts,
              updatedAt: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error('Erreur lors de la mise à jour du programmateur:', error);
        }
      }
      
      // Mise à jour de l'artiste si nécessaire
      if (selectedArtiste?.id) {
        try {
          const artisteRef = doc(db, 'artistes', selectedArtiste.id);
          const artisteDoc = await getDoc(artisteRef);
          
          if (artisteDoc.exists()) {
            const artisteData = artisteDoc.data();
            const updatedConcerts = (artisteData.concerts || [])
              .filter(c => c.id !== id);
            
            await updateDoc(artisteRef, {
              concerts: updatedConcerts,
              updatedAt: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error('Erreur lors de la mise à jour de l\'artiste:', error);
        }
      }
      
      // Supprimer le concert
      await deleteDoc(doc(db, 'concerts', id));
      navigate('/concerts');
    } catch (error) {
      console.error('Erreur lors de la suppression du concert:', error);
      alert('Une erreur est survenue lors de la suppression du concert.');
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return <div className="text-center my-5 loading-spinner">Chargement du concert...</div>;
  }

  return (
    <div className={styles.concertFormContainer}>
      {/* En-tête du formulaire sans les boutons d'action */}
      <div className={styles.formHeaderContainer}>
        <h2 className={styles.modernTitle}>
          {id === 'nouveau' ? 'Créer un nouveau concert' : 'Modifier le concert'}
        </h2>
        <div className={styles.breadcrumbContainer}>
          {/* Correction : ajout accessibilité (role/button + tabIndex) */}
          <span 
            className={styles.breadcrumbItem}
            onClick={() => navigate('/concerts')} 
            role="button" 
            tabIndex={0}
          >Concerts</span>
          <i className="bi bi-chevron-right"></i>
          <span className={`${styles.breadcrumbItem} ${styles.active}`}>
            {id === 'nouveau' ? 'Nouveau concert' : formData.titre || 'Concert'}
          </span>
        </div>
      </div>
  
      {/* Boutons d'action déplacés ici, avant le formulaire */}
      <div className={styles.actionButtons}>
        <Link to="/concerts" className={`btn btn-outline-secondary ${styles.actionBtn}`}>
          <i className="bi bi-arrow-left"></i>
          <span className="btn-text">Retour</span>
        </Link>
        
        {id && id !== 'nouveau' && (
          <button 
            onClick={() => setShowDeleteConfirm(true)} 
            className={`btn btn-outline-danger ${styles.actionBtn}`}
            disabled={isSubmitting}
          >
            <i className="bi bi-trash"></i>
            <span className="btn-text">Supprimer</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className={styles.modernForm}>
        {/* Carte - Informations principales du concert */}
        <div className={styles.formCard}>
          <div className={styles.cardHeader}>
            <i className="bi bi-calendar-event"></i>
            <h3>Informations principales</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.formGroup}>
              <label htmlFor="titre" className={styles.formLabel}>Titre du concert</label>
              <input
                type="text"
                className="form-control"
                id="titre"
                name="titre"
                value={formData.titre || ''}
                onChange={handleChange}
                placeholder="Ex: Concert de jazz, Festival d'été, etc."
              />
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className={styles.formGroup}>
                  <label htmlFor="date" className={styles.formLabel}>Date du concert <span className={styles.required}>*</span></label>
                  <input
                    type="date"
                    className="form-control"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className={styles.formGroup}>
                  <label htmlFor="montant" className={styles.formLabel}>Montant (€) <span className={styles.required}>*</span></label>
                  <input
                    type="number"
                    className="form-control"
                    id="montant"
                    name="montant"
                    value={formData.montant}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="statut" className={styles.formLabel}>Statut</label>
              <select
                className="form-select"
                id="statut"
                name="statut"
                value={formData.statut}
                onChange={handleChange}
              >
                <option value="En attente">En attente</option>
                <option value="Confirmé">Confirmé</option>
                <option value="Annulé">Annulé</option>
                <option value="Terminé">Terminé</option>
              </select>
            </div>
          </div>
        </div>

        {/* Carte - Lieu */}
        <div className={styles.formCard}>
          <div className={styles.cardHeader}>
            <i className="bi bi-geo-alt"></i>
            <h3>Lieu <span className={styles.required}>*</span></h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.formGroup} ref={lieuDropdownRef}>
              <label className={styles.formLabel}>Rechercher un lieu</label>
              
              {!selectedLieu ? (
                <div className={styles.lieuSearchContainer}>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-search"></i></span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Rechercher un lieu par nom..."
                      value={lieuSearchTerm}
                      onChange={(e) => setLieuSearchTerm(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleCreateLieu}
                    >
                      Créer un lieu
                    </button>
                  </div>
                  
                  {isSearchingLieux && (
                    <div className="dropdown-menu show w-100">
                      <div className="dropdown-item text-center">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Recherche en cours...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {showLieuResults && lieuResults.length > 0 && (
                    <div className="dropdown-menu show w-100">
                      {lieuResults.map(lieu => (
                        <div 
                          key={lieu.id} 
                          className={`dropdown-item ${styles.lieuItem}`}
                          onClick={() => handleSelectLieu(lieu)}
                        >
                          <div className={styles.lieuName}>{lieu.nom}</div>
                          <div className={styles.lieuDetails}>
                            {lieu.adresse && lieu.ville && (
                              <span className={styles.lieuAddress}>
                                {lieu.adresse}, {lieu.codePostal} {lieu.ville}
                              </span>
                            )}
                            {lieu.capacite && (
                              <span className={styles.lieuCapacity}>
                                Capacité: {lieu.capacite} personnes
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {showLieuResults && lieuResults.length === 0 && !isSearchingLieux && lieuSearchTerm.length >= 2 && (
                    <div className="dropdown-menu show w-100">
                      <div className="dropdown-item text-center text-muted">
                        Aucun lieu trouvé
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.selectedLieu}>
                  <div className={styles.lieuCard}>
                    <div className={styles.lieuInfo}>
                      <span className={styles.lieuName}>{selectedLieu.nom}</span>
                      {selectedLieu.adresse && (
                        <div className={styles.lieuAddress}>
                          <i className="bi bi-geo-alt-fill"></i> {selectedLieu.adresse}<br />
                          {selectedLieu.codePostal} {selectedLieu.ville}
                        </div>
                      )}
                      {selectedLieu.capacite && (
                        <div className={styles.lieuCapacity}>
                          <i className="bi bi-people-fill"></i> Capacité: {selectedLieu.capacite} personnes
                        </div>
                      )}
                    </div>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-danger" 
                      onClick={handleRemoveLieu}
                      aria-label="Supprimer ce lieu"
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>
                </div>
              )}
              
              <small className="form-text text-muted">
                Tapez au moins 2 caractères pour rechercher un lieu par nom.
              </small>
            </div>
          </div>
        </div>

        {/* Carte - Programmateur */}
        <div className={styles.formCard}>
          <div className={styles.cardHeader}>
            <i className="bi bi-person-badge"></i>
            <h3>Programmateur</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.formGroup} ref={progDropdownRef}>
              <label className={styles.formLabel}>Associer un programmateur</label>
              
              {!selectedProgrammateur ? (
                <div className={styles.programmateurSearchContainer}>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-search"></i></span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Rechercher un programmateur par nom..."
                      value={progSearchTerm}
                      onChange={(e) => setProgSearchTerm(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleCreateProgrammateur}
                    >
                      Créer un programmateur
                    </button>
                  </div>
                  
                  {isSearchingProgs && (
                    <div className="dropdown-menu show w-100">
                      <div className="dropdown-item text-center">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Recherche en cours...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {showProgResults && progResults.length > 0 && (
                    <div className="dropdown-menu show w-100">
                      {progResults.map(prog => (
                        <div 
                          key={prog.id} 
                          className={`dropdown-item ${styles.programmateurItem}`}
                          onClick={() => handleSelectProgrammateur(prog)}
                        >
                          <div className={styles.programmateurName}>{prog.nom}</div>
                          <div className={styles.programmateurDetails}>
                            {prog.structure && <span className={styles.programmateurStructure}>{prog.structure}</span>}
                            {prog.email && <span className={styles.programmateurContactItem}>{prog.email}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {showProgResults && progResults.length === 0 && !isSearchingProgs && progSearchTerm.length >= 2 && (
                    <div className="dropdown-menu show w-100">
                      <div className="dropdown-item text-center text-muted">
                        Aucun programmateur trouvé
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.selectedProgrammateur}>
                  <div className={styles.programmateurCard}>
                    <div className={styles.programmateurInfo}>
                      <span className={styles.programmateurName}>{selectedProgrammateur.nom}</span>
                      {selectedProgrammateur.structure && (
                        <span className={styles.programmateurStructure}>{selectedProgrammateur.structure}</span>
                      )}
                      <div className={styles.programmateurContacts}>
                        {selectedProgrammateur.email && (
                          <span className={styles.programmateurContactItem}>
                            <i className="bi bi-envelope"></i> {selectedProgrammateur.email}
                          </span>
                        )}
                        {selectedProgrammateur.telephone && (
                          <span className={styles.programmateurContactItem}>
                            <i className="bi bi-telephone"></i> {selectedProgrammateur.telephone}
                          </span>
                        )}
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-danger" 
                      onClick={handleRemoveProgrammateur}
                      aria-label="Supprimer ce programmateur"
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>
                </div>
              )}
              
              <small className="form-text text-muted">
                Tapez au moins 2 caractères pour rechercher un programmateur par nom.
              </small>
            </div>
          </div>
        </div>

        {/* Carte - Artiste */}
        <div className={styles.formCard}>
          <div className={styles.cardHeader}>
            <i className="bi bi-music-note-beamed"></i>
            <h3>Artiste</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.formGroup} ref={artisteDropdownRef}>
              <label className={styles.formLabel}>Associer un artiste</label>
              
              {!selectedArtiste ? (
                <div className={styles.artisteSearchContainer}>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-search"></i></span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Rechercher un artiste par nom..."
                      value={artisteSearchTerm}
                      onChange={(e) => setArtisteSearchTerm(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleCreateArtiste}
                    >
                      Créer un artiste
                    </button>
                  </div>
                  
                  {isSearchingArtistes && (
                    <div className="dropdown-menu show w-100">
                      <div className="dropdown-item text-center">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Recherche en cours...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {showArtisteResults && artisteResults.length > 0 && (
                    <div className="dropdown-menu show w-100">
                      {artisteResults.map(artiste => (
                        <div 
                          key={artiste.id} 
                          className={`dropdown-item ${styles.artisteItem}`}
                          onClick={() => handleSelectArtiste(artiste)}
                        >
                          <div className={styles.artisteName}>{artiste.nom}</div>
                          <div className={styles.artisteDetails}>
                            {artiste.genre && <span className={styles.artisteGenre}>{artiste.genre}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {showArtisteResults && artisteResults.length === 0 && !isSearchingArtistes && artisteSearchTerm.length >= 2 && (
                    <div className="dropdown-menu show w-100">
                      <div className="dropdown-item text-center text-muted">
                        Aucun artiste trouvé
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.selectedArtiste}>
                  <div className={styles.artisteCard}>
                    <div className={styles.artisteInfo}>
                      <span className={styles.artisteName}>{selectedArtiste.nom}</span>
                      {selectedArtiste.genre && (
                        <span className={styles.artisteGenre}>Genre: {selectedArtiste.genre}</span>
                      )}
                      {selectedArtiste.description && (
                        <p className={styles.artisteDescription}>{selectedArtiste.description}</p>
                      )}
                    </div>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-danger" 
                      onClick={handleRemoveArtiste}
                      aria-label="Supprimer cet artiste"
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>
                </div>
              )}
              
              <small className="form-text text-muted">
                Tapez au moins 2 caractères pour rechercher un artiste par nom.
              </small>
            </div>
          </div>
        </div>

        {/* Carte - Notes */}
        <div className={styles.formCard}>
          <div className={styles.cardHeader}>
            <i className="bi bi-journal-text"></i>
            <h3>Notes</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.formGroup}>
              <textarea
                className="form-control"
                id="notes"
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Informations complémentaires, remarques..."
              ></textarea>
            </div>
          </div>
        </div>

        {/* Boutons d'action en bas de formulaire */}
        <div className={styles.formActions}>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate('/concerts')}
            disabled={isSubmitting}
          >
            <i className="bi bi-x-circle me-2"></i>
            Annuler
          </button>
          
          {id && id !== 'nouveau' && (
            <button 
              type="button" 
              className="btn btn-outline-danger"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isSubmitting}
            >
              <i className="bi bi-trash me-2"></i>
              Supprimer
            </button>
          )}
          
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
                {id && id !== 'nouveau' ? 'Enregistrer les modifications' : 'Créer le concert'}
              </>
            )}
          </button>
        </div>
      </form>
      
      {/* Modale de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className={styles.tcModalOverlay}>
          <div className={styles.tcModalConfirm}>
            <div className={styles.tcModalHeader}>
              <h5>Confirmation de suppression</h5>
            </div>
            <div className={styles.tcModalBody}>
              <p>Êtes-vous sûr de vouloir supprimer ce concert ? Cette action est irréversible.</p>
            </div>
            <div className={styles.tcModalFooter}>
              <button 
                className="tc-btn tc-btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Annuler
              </button>
              <button 
                className="tc-btn tc-btn-danger" 
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConcertForm;
