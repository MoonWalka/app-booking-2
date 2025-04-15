// Au début de votre fichier ConcertForm.jsx
import '../../style/searchDropdown.css'; // Adaptez le chemin selon votre structure

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebase';
import LieuForm from '../forms/LieuForm';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';

const ConcertForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id && id !== 'nouveau');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lieux, setLieux] = useState([]);
  const [programmateurs, setProgrammateurs] = useState([]);
  const [showLieuForm, setShowLieuForm] = useState(false);
  const [newLieu, setNewLieu] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [initialProgrammateurId, setInitialProgrammateurId] = useState(null);
  const [initialArtisteId, setInitialArtisteId] = useState(null);
  
  // États pour la recherche
  const [lieuSearchTerm, setLieuSearchTerm] = useState('');
  const [progSearchTerm, setProgSearchTerm] = useState('');
  const [lieuResults, setLieuResults] = useState([]);
  const [progResults, setProgResults] = useState([]);
  const [showLieuResults, setShowLieuResults] = useState(false);
  const [showProgResults, setShowProgResults] = useState(false);
  
  // États pour la recherche d'artiste
  const [artisteSearchTerm, setArtisteSearchTerm] = useState('');
  const [artisteResults, setArtisteResults] = useState([]);
  const [showArtisteResults, setShowArtisteResults] = useState(false);
  const [isSearchingArtistes, setIsSearchingArtistes] = useState(false);
  const [selectedArtiste, setSelectedArtiste] = useState(null);
  
  // Refs pour les dropdowns
  const lieuDropdownRef = useRef(null);
  const progDropdownRef = useRef(null);
  const artisteDropdownRef = useRef(null);
  
  // Timeout refs pour la recherche
  const lieuSearchTimeoutRef = useRef(null);
  const progSearchTimeoutRef = useRef(null);
  const artisteSearchTimeoutRef = useRef(null);
  
  const [formData, setFormData] = useState({
    date: '',
    montant: '',
    statut: 'En attente',
    titre: '',
    lieuId: '',
    lieuNom: '',
    lieuAdresse: '',
    lieuCodePostal: '',
    lieuVille: '',
    lieuCapacite: '',
    programmateurId: '',
    programmateurNom: '',
    artisteId: '',
    artisteNom: '',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupération initiale limitée (juste pour avoir quelques résultats par défaut)
        const lieuxRef = collection(db, 'lieux');
        const lieuxQuery = query(lieuxRef, orderBy('nom'), limit(10));
        const lieuxSnapshot = await getDocs(lieuxQuery);
        const lieuxData = lieuxSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLieux(lieuxData);
        
        const progsRef = collection(db, 'programmateurs');
        const progsQuery = query(progsRef, orderBy('nom'), limit(10));
        const programmateursSnapshot = await getDocs(progsQuery);
        const programmateursData = programmateursSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProgrammateurs(programmateursData);
  
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
            
            // Si on a un lieu associé, le récupérer s'il n'est pas dans la liste initiale
            if (concertData.lieuId && !lieuxData.some(l => l.id === concertData.lieuId)) {
              try {
                const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
                if (lieuDoc.exists()) {
                  const lieuData = lieuDoc.data();
                  setLieux(prev => [...prev, { id: concertData.lieuId, ...lieuData }]);
                }
              } catch (error) {
                console.error('Erreur lors de la récupération du lieu:', error);
              }
            }
            
            // Si on a un programmateur associé, le récupérer s'il n'est pas dans la liste initiale
            if (concertData.programmateurId && !programmateursData.some(p => p.id === concertData.programmateurId)) {
              try {
                const progDoc = await getDoc(doc(db, 'programmateurs', concertData.programmateurId));
                if (progDoc.exists()) {
                  const progData = progDoc.data();
                  setProgrammateurs(prev => [...prev, { id: concertData.programmateurId, ...progData }]);
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
                  const artisteData = artisteDoc.data();
                  setSelectedArtiste({
                    id: concertData.artisteId,
                    ...artisteData
                  });
                  setArtisteSearchTerm(concertData.artisteNom || artisteData.nom);
                }
              } catch (error) {
                console.error('Erreur lors de la récupération de l\'artiste:', error);
              }
            }
            
            // Initialiser le lieu et le programmateur dans les champs de recherche
            if (concertData.lieuNom) {
              setLieuSearchTerm(concertData.lieuNom);
            }
            
            if (concertData.programmateurNom) {
              setProgSearchTerm(concertData.programmateurNom);
            }
            
            setFormData({
              ...concertData,
              date: concertData.date || '',
              montant: concertData.montant || '',
              statut: concertData.statut || 'En attente',
              titre: concertData.titre || '',
              lieuId: concertData.lieuId || '',
              lieuNom: concertData.lieuNom || '',
              lieuAdresse: concertData.lieuAdresse || '',
              lieuCodePostal: concertData.lieuCodePostal || '',
              lieuVille: concertData.lieuVille || '',
              lieuCapacite: concertData.lieuCapacite || '',
              programmateurId: concertData.programmateurId || '',
              programmateurNom: concertData.programmateurNom || '',
              artisteId: concertData.artisteId || '',
              artisteNom: concertData.artisteNom || '',
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

  // Effets pour la recherche de lieux
  useEffect(() => {
    if (lieuSearchTimeoutRef.current) {
      clearTimeout(lieuSearchTimeoutRef.current);
    }
    
    if (lieuSearchTerm.length >= 2) {
      lieuSearchTimeoutRef.current = setTimeout(() => {
        searchLieux(lieuSearchTerm);
      }, 300);
    } else if (lieuSearchTerm.length === 0) {
      // Si le champ est vidé, réinitialiser le lieu sélectionné
      if (formData.lieuId) {
        setFormData(prev => ({
          ...prev,
          lieuId: '',
          lieuNom: '',
          lieuAdresse: '',
          lieuCodePostal: '',
          lieuVille: '',
          lieuCapacite: ''
        }));
      }
      setLieuResults([]);
    }
    
    return () => {
      if (lieuSearchTimeoutRef.current) {
        clearTimeout(lieuSearchTimeoutRef.current);
      }
    };
  }, [lieuSearchTerm]);

  // Effets pour la recherche de programmateurs
  useEffect(() => {
    if (progSearchTimeoutRef.current) {
      clearTimeout(progSearchTimeoutRef.current);
    }
    
    if (progSearchTerm.length >= 2) {
      progSearchTimeoutRef.current = setTimeout(() => {
        searchProgrammateurs(progSearchTerm);
      }, 300);
    } else if (progSearchTerm.length === 0) {
      // Si le champ est vidé, réinitialiser le programmateur sélectionné
      if (formData.programmateurId) {
        setFormData(prev => ({
          ...prev,
          programmateurId: '',
          programmateurNom: ''
        }));
      }
      setProgResults([]);
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
    } else if (artisteSearchTerm.length === 0) {
      // Si le champ est vidé, réinitialiser l'artiste sélectionné
      if (formData.artisteId) {
        setFormData(prev => ({
          ...prev,
          artisteId: '',
          artisteNom: ''
        }));
        setSelectedArtiste(null);
      }
      setArtisteResults([]);
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
      
      // D'abord chercher dans les lieux déjà chargés
      const filteredLieux = lieux.filter(lieu => 
        lieu.nom?.toLowerCase().includes(termLower) || 
        lieu.ville?.toLowerCase().includes(termLower)
      );
      
      // Puis faire une requête dans Firestore pour compléter
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
      
      // Fusionner et dédupliquer les résultats
      const allResults = [...filteredLieux];
      
      lieuxData.forEach(lieu => {
        if (!allResults.some(l => l.id === lieu.id)) {
          allResults.push(lieu);
        }
      });
      
      setLieuResults(allResults);
      setShowLieuResults(true);
    } catch (error) {
      console.error('Erreur lors de la recherche de lieux:', error);
    }
  };

  // Fonction pour rechercher des programmateurs
  const searchProgrammateurs = async (term) => {
    try {
      const termLower = term.toLowerCase();
      
      // D'abord chercher dans les programmateurs déjà chargés
      const filteredProgs = programmateurs.filter(prog => 
        prog.nom?.toLowerCase().includes(termLower) || 
        prog.structure?.toLowerCase().includes(termLower)
      );
      
      // Puis faire une requête dans Firestore pour compléter
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
      
      // Fusionner et dédupliquer les résultats
      const allResults = [...filteredProgs];
      
      progsData.forEach(prog => {
        if (!allResults.some(p => p.id === prog.id)) {
          allResults.push(prog);
        }
      });
      
      setProgResults(allResults);
      setShowProgResults(true);
    } catch (error) {
      console.error('Erreur lors de la recherche de programmateurs:', error);
    }
  };

  // Fonction pour rechercher des artistes
  const searchArtistes = async (term) => {
    try {
      const termLower = term.toLowerCase();
      
      // Rechercher les artistes dans Firestore
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectLieu = (lieu) => {
    setLieuSearchTerm(lieu.nom);
    setFormData(prev => ({
      ...prev,
      lieuId: lieu.id,
      lieuNom: lieu.nom || '',
      lieuAdresse: lieu.adresse || '',
      lieuCodePostal: lieu.codePostal || '',
      lieuVille: lieu.ville || '',
      lieuCapacite: lieu.capacite || ''
    }));
    setShowLieuResults(false);
  };

  const handleSelectProgrammateur = (prog) => {
    setProgSearchTerm(prog.nom);
    setFormData(prev => ({
      ...prev,
      programmateurId: prog.id,
      programmateurNom: prog.nom || ''
    }));
    setShowProgResults(false);
  };

  const handleSelectArtiste = (artiste) => {
    setSelectedArtiste(artiste);
    setArtisteSearchTerm(artiste.nom);
    setFormData(prev => ({
      ...prev,
      artisteId: artiste.id,
      artisteNom: artiste.nom || ''
    }));
    setShowArtisteResults(false);
  };

  const handleRemoveArtiste = () => {
    setSelectedArtiste(null);
    setArtisteSearchTerm('');
    setFormData(prev => ({
      ...prev,
      artisteId: '',
      artisteNom: ''
    }));
  };

  const handleLieuCreated = (lieu) => {
    // Ajouter le nouveau lieu à la liste
    const newLieuWithId = { ...lieu, id: newLieu.id };
    setLieux(prev => [...prev, newLieuWithId]);
    
    // Mettre à jour le formulaire avec le nouveau lieu
    setLieuSearchTerm(lieu.nom);
    setFormData(prev => ({
      ...prev,
      lieuId: newLieu.id,
      lieuNom: lieu.nom || '',
      lieuAdresse: lieu.adresse || '',
      lieuCodePostal: lieu.codePostal || '',
      lieuVille: lieu.ville || '',
      lieuCapacite: lieu.capacite || ''
    }));
    
    // Fermer le formulaire de lieu
    setShowLieuForm(false);
  };

  const handleCreateLieu = async () => {
    try {
      // Vérifier qu'un nom de lieu a été saisi
      if (!lieuSearchTerm.trim()) {
        alert('Veuillez saisir un nom de lieu avant de créer un nouveau lieu.');
        return;
      }
      
      // Créer directement un nouveau lieu avec le nom saisi dans la recherche
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
      
      // Ajouter le nouveau lieu à la liste des lieux
      const newLieuWithId = { ...lieuData, id: newLieuRef.id };
      setLieux(prev => [...prev, newLieuWithId]);
      
      // Mettre à jour le formulaire avec le nouveau lieu
      setFormData(prev => ({
        ...prev,
        lieuId: newLieuRef.id,
        lieuNom: lieuData.nom,
        lieuAdresse: '',
        lieuCodePostal: '',
        lieuVille: '',
        lieuCapacite: ''
      }));
      
      // Fermer le dropdown de résultats de recherche
      setShowLieuResults(false);
      
      // Afficher un message de confirmation
      alert(`Le lieu "${lieuData.nom}" a été créé avec succès. Vous pourrez compléter ses détails plus tard.`);
      
    } catch (error) {
      console.error('Erreur lors de la création du lieu:', error);
      alert('Une erreur est survenue lors de la création du lieu.');
    }
  };

  // Fonction pour créer un programmateur
  const handleCreateProgrammateur = async () => {
    try {
      // Vérifier qu'un nom de programmateur a été saisi
      if (!progSearchTerm.trim()) {
        alert('Veuillez saisir un nom de programmateur avant de créer un nouveau programmateur.');
        return;
      }
      
      // Créer directement un nouveau programmateur avec le nom saisi dans la recherche
      const newProgRef = doc(collection(db, 'programmateurs'));
      
      // Construire le nom complet et le prénom (en supposant que le nom est au format "Prénom Nom")
      const nameParts = progSearchTerm.trim().split(' ');
      const nom = nameParts.length > 1 ? nameParts.join(' ') : progSearchTerm.trim();
      const prenom = '';  // Vous pouvez adapter cette logique selon vos besoins
      
      const progData = {
        nom: nom,
        nomLowercase: nom.toLowerCase(),
        prenom: prenom,
        email: '',
        telephone: '',
        structure: '',
        concertsAssocies: [], // Initialiser le tableau de concerts associés
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(newProgRef, progData);
      
      // Ajouter le nouveau programmateur à la liste
      const newProgWithId = { ...progData, id: newProgRef.id };
      setProgrammateurs(prev => [...prev, newProgWithId]);
      
      // Mettre à jour le formulaire avec le nouveau programmateur
      setFormData(prev => ({
        ...prev,
        programmateurId: newProgRef.id,
        programmateurNom: nom
      }));
      
      // Fermer le dropdown de résultats de recherche
      setShowProgResults(false);
      
      // Afficher un message de confirmation
      alert(`Le programmateur "${progData.nom}" a été créé avec succès. Vous pourrez compléter ses détails plus tard.`);
      
    } catch (error) {
      console.error('Erreur lors de la création du programmateur:', error);
      alert('Une erreur est survenue lors de la création du programmateur.');
    }
  };

  // Fonction pour créer un artiste
  const handleCreateArtiste = async () => {
    try {
      // Vérifier qu'un nom d'artiste a été saisi
      if (!artisteSearchTerm.trim()) {
        alert('Veuillez saisir un nom d\'artiste avant de créer un nouvel artiste.');
        return;
      }
      
      // Créer directement un nouvel artiste avec le nom saisi dans la recherche
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
      
      // Créer un objet artiste complet avec l'ID
      const newArtisteWithId = { 
        id: newArtisteRef.id,
        ...artisteData
      };
      
      // Sélectionner automatiquement le nouvel artiste
      handleSelectArtiste(newArtisteWithId);
      
      // Afficher un message de confirmation
      alert(`L'artiste "${artisteData.nom}" a été créé avec succès. Vous pourrez compléter ses détails plus tard.`);
      
    } catch (error) {
      console.error('Erreur lors de la création de l\'artiste:', error);
      alert('Une erreur est survenue lors de la création de l\'artiste.');
    }
  };

  // Nouvelle fonction pour gérer la suppression
  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      
      // Si le concert avait un programmateur, mettre à jour sa liste de concerts associés
      if (formData.programmateurId) {
        try {
          // Récupérer d'abord le programmateur
          const progRef = doc(db, 'programmateurs', formData.programmateurId);
          const progDoc = await getDoc(progRef);
          
          if (progDoc.exists()) {
            // Supprimer le concert de la liste des concerts associés du programmateur
            await updateDoc(progRef, {
              concertsAssocies: arrayRemove({
                id: id,
                titre: formData.titre || 'Sans titre',
                date: formData.date || null,
                lieu: formData.lieuNom || null
              })
            });
            console.log('Concert retiré de la liste des concerts associés du programmateur');
          }
        } catch (error) {
          console.error('Erreur lors de la mise à jour du programmateur:', error);
        }
      }
      
      // Si le concert avait un artiste, mettre à jour sa liste de concerts associés
      if (formData.artisteId) {
        try {
          const artisteRef = doc(db, 'artistes', formData.artisteId);
          const artisteDoc = await getDoc(artisteRef);
          
          if (artisteDoc.exists()) {
            // Supprimer le concert de la liste des concerts de l'artiste
            // Gérer ce cas selon la structure de vos données
            // Cela dépend de comment vous stockez les concerts liés à un artiste
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

  // Fonction pour mettre à jour l'association bidirectionnelle entre concert et programmateur
  const updateProgrammateurAssociation = async (concertId, concertData, newProgrammateurId, oldProgrammateurId) => {
    try {
      // Si un nouveau programmateur est sélectionné
      if (newProgrammateurId) {
        const progRef = doc(db, 'programmateurs', newProgrammateurId);
        const progDoc = await getDoc(progRef);
        
        if (progDoc.exists()) {
          const progData = progDoc.data();
          const concertsAssocies = progData.concertsAssocies || [];
          
          // Vérifier si le concert est déjà associé
          const concertAlreadyAssociated = concertsAssocies.some(c => c.id === concertId);
          
          if (!concertAlreadyAssociated) {
            // Ajouter le concert à la liste des concerts associés du programmateur
            const concertReference = {
              id: concertId,
              titre: concertData.titre || 'Sans titre',
              date: concertData.date || null,
              lieu: concertData.lieuNom || null
            };
            
            await updateDoc(progRef, {
              concertsAssocies: arrayUnion(concertReference)
            });
            console.log('Concert ajouté à la liste des concerts associés du programmateur');
          }
        }
      }
      
      // Si un ancien programmateur était associé et a changé
      if (oldProgrammateurId && oldProgrammateurId !== newProgrammateurId) {
        const oldProgRef = doc(db, 'programmateurs', oldProgrammateurId);
        const oldProgDoc = await getDoc(oldProgRef);
        
        if (oldProgDoc.exists()) {
          // Supprimer le concert de la liste des concerts associés de l'ancien programmateur
          const concertReference = {
            id: concertId,
            titre: concertData.titre || 'Sans titre',
            date: concertData.date || null,
            lieu: concertData.lieuNom || null
          };
          
          // Note: arrayRemove nécessite un objet exactement identique, ce qui peut ne pas fonctionner
          // si les données ont changé. Une approche plus robuste serait de filtrer et reconstruire le tableau.
          const oldProgData = oldProgDoc.data();
          const updatedConcerts = (oldProgData.concertsAssocies || []).filter(c => c.id !== concertId);
          
          await updateDoc(oldProgRef, {
            concertsAssocies: updatedConcerts
          });
          console.log('Concert retiré de la liste des concerts associés de l\'ancien programmateur');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des associations programmateur-concert:', error);
      // Ne pas bloquer la sauvegarde du concert si cette étape échoue
    }
  };

    // Fonction pour mettre à jour l'association entre concert et artiste
    const updateArtisteAssociation = async (concertId, concertData, newArtisteId, oldArtisteId) => {
      try {
        // Si un nouvel artiste est sélectionné
        if (newArtisteId) {
          const artisteRef = doc(db, 'artistes', newArtisteId);
          const artisteDoc = await getDoc(artisteRef);
          
          if (artisteDoc.exists()) {
            // Créer une référence au concert
            const concertReference = {
              id: concertId,
              titre: concertData.titre || 'Sans titre',
              date: concertData.date || null,
              lieu: concertData.lieuNom || null
            };
            
            // Ajouter le concert à la liste des concerts de l'artiste
            // Si "concerts" n'existe pas encore dans le document de l'artiste, il sera créé
            await updateDoc(artisteRef, {
              concerts: arrayUnion(concertReference),
              updatedAt: new Date().toISOString()
            });
            console.log('Concert ajouté à la liste des concerts de l\'artiste');
          }
        }
        
        // Si un ancien artiste était associé et a changé
        if (oldArtisteId && oldArtisteId !== newArtisteId) {
          const oldArtisteRef = doc(db, 'artistes', oldArtisteId);
          const oldArtisteDoc = await getDoc(oldArtisteRef);
          
          if (oldArtisteDoc.exists()) {
            // Supprimer le concert de la liste des concerts de l'ancien artiste
            // Une approche robuste consiste à filtrer et reconstruire le tableau
            const oldArtisteData = oldArtisteDoc.data();
            const concerts = oldArtisteData.concerts || [];
            const updatedConcerts = concerts.filter(c => c.id !== concertId);
            
            await updateDoc(oldArtisteRef, {
              concerts: updatedConcerts,
              updatedAt: new Date().toISOString()
            });
            console.log('Concert retiré de la liste des concerts de l\'ancien artiste');
          }
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour des associations artiste-concert:', error);
        // Ne pas bloquer la sauvegarde du concert si cette étape échoue
      }
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
    
      try {
        // Vérifier que les champs obligatoires sont remplis
        if (!formData.date || !formData.montant || !formData.lieuId) {
          alert('Veuillez remplir tous les champs obligatoires.');
          setIsSubmitting(false);
          return;
        }
    
        // Correction du format de date
        let correctedDate = formData.date;
        if (formData.date.includes('/')) {
          const dateParts = formData.date.split('/');
          if (dateParts.length === 3) {
            correctedDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
          }
        }
    
        const concertData = {
          date: correctedDate,
          montant: formData.montant,
          statut: formData.statut,
          titre: formData.titre || `Concert du ${correctedDate}`, // Ajout d'un titre par défaut
          
          // Infos du lieu
          lieuId: formData.lieuId,
          lieuNom: formData.lieuNom,
          lieuAdresse: formData.lieuAdresse,
          lieuCodePostal: formData.lieuCodePostal,
          lieuVille: formData.lieuVille,
          lieuCapacite: formData.lieuCapacite,
          
          // Infos du programmateur
          programmateurId: formData.programmateurId,
          programmateurNom: formData.programmateurNom,
          
          // Infos de l'artiste
          artisteId: formData.artisteId,
          artisteNom: formData.artisteNom,
          
          notes: formData.notes,
          updatedAt: new Date().toISOString()
        };
        
        console.log('Données à enregistrer:', concertData);
    
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
        
        // Mise à jour bidirectionnelle : associer le concert au programmateur
        if (formData.programmateurId || initialProgrammateurId) {
          await updateProgrammateurAssociation(
            concertId,
            concertData,
            formData.programmateurId,
            initialProgrammateurId
          );
        }
        
        // Mise à jour bidirectionnelle : associer le concert à l'artiste
        if (formData.artisteId || initialArtisteId) {
          await updateArtisteAssociation(
            concertId,
            concertData,
            formData.artisteId,
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
  
    if (loading) {
      return <div>Chargement du concert...</div>;
    }
  
    if (showLieuForm && newLieu) {
      return (
        <div>
          <h2>Créer un nouveau lieu</h2>
          <LieuForm lieu={newLieu} onSave={handleLieuCreated} />
        </div>
      );
    }
  
    return (
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <h2>{id && id !== 'nouveau' ? 'Modifier le concert' : 'Ajouter un concert'}</h2>
        </div>
  
        <div className="mb-3">
          <label htmlFor="titre" className="form-label">Titre du concert</label>
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
  
        <div className="mb-3">
          <label htmlFor="date" className="form-label">Date du concert *</label>
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
        
        <div className="mb-3">
          <label htmlFor="montant" className="form-label">Montant (€) *</label>
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
  
        <div className="mb-3">
          <label htmlFor="statut" className="form-label">Statut</label>
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
  
        {/* Barre de recherche pour les lieux */}
        <div className="mb-3" ref={lieuDropdownRef}>
          <label htmlFor="lieuSearch" className="form-label">Lieu *</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              id="lieuSearch"
              placeholder="Rechercher un lieu..."
              value={lieuSearchTerm}
              onChange={(e) => setLieuSearchTerm(e.target.value)}
              onFocus={() => lieuSearchTerm.length >= 2 && setShowLieuResults(true)}
              required={formData.lieuId === ''}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleCreateLieu}
            >
              Créer un lieu
            </button>
          </div>
          
          {/* Résultats de recherche pour les lieux */}
          {showLieuResults && lieuResults.length > 0 && (
            <div className="dropdown-menu show w-100 mt-1">
              {lieuResults.map(lieu => (
                <div 
                  key={lieu.id} 
                  className="dropdown-item lieu-item"
                  onClick={() => handleSelectLieu(lieu)}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold">{lieu.nom}</div>
                      <div className="small text-muted">
                        {lieu.adresse && lieu.ville ? `${lieu.adresse}, ${lieu.codePostal} ${lieu.ville}` : 'Adresse non spécifiée'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {showLieuResults && lieuResults.length === 0 && lieuSearchTerm.length >= 2 && (
            <div className="dropdown-menu show w-100 mt-1">
              <div className="dropdown-item text-muted">Aucun lieu trouvé</div>
            </div>
          )}
        </div>
  
        {formData.lieuId && (
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Détails du lieu</h5>
              <p><strong>Nom:</strong> {formData.lieuNom}</p>
              <p><strong>Adresse:</strong> {formData.lieuAdresse}</p>
              <p><strong>Code postal:</strong> {formData.lieuCodePostal}</p>
              <p><strong>Ville:</strong> {formData.lieuVille}</p>
              {formData.lieuCapacite && <p><strong>Capacité:</strong> {formData.lieuCapacite}</p>}
            </div>
          </div>
        )}
  
        {/* Barre de recherche pour les programmateurs */}
        <div className="mb-3" ref={progDropdownRef}>
          <label htmlFor="programmateurSearch" className="form-label">Programmateur</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              id="programmateurSearch"
              placeholder="Rechercher un programmateur..."
              value={progSearchTerm}
              onChange={(e) => setProgSearchTerm(e.target.value)}
              onFocus={() => progSearchTerm.length >= 2 && setShowProgResults(true)}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleCreateProgrammateur}
            >
              Créer un programmateur
            </button>
          </div>
          
          {/* Résultats de recherche pour les programmateurs */}
          {showProgResults && progResults.length > 0 && (
            <div className="dropdown-menu show w-100 mt-1">
              {progResults.map(prog => (
                <div 
                  key={prog.id} 
                  className="dropdown-item prog-item"
                  onClick={() => handleSelectProgrammateur(prog)}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold">{prog.nom}</div>
                      {prog.structure && <div className="small text-muted">{prog.structure}</div>}
                      {prog.email && <div className="small text-muted">{prog.email}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {showProgResults && progResults.length === 0 && progSearchTerm.length >= 2 && (
            <div className="dropdown-menu show w-100 mt-1">
              <div className="dropdown-item text-muted">Aucun programmateur trouvé</div>
            </div>
          )}
        </div>
  
        {formData.programmateurId && (
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Programmateur sélectionné</h5>
              <p><strong>Nom:</strong> {formData.programmateurNom}</p>
            </div>
          </div>
        )}
  
        {/* Barre de recherche pour les artistes */}
        <div className="mb-3" ref={artisteDropdownRef}>
          <label htmlFor="artisteSearch" className="form-label">Artiste</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              id="artisteSearch"
              placeholder="Rechercher un artiste..."
              value={artisteSearchTerm}
              onChange={(e) => setArtisteSearchTerm(e.target.value)}
              onFocus={() => artisteSearchTerm.length >= 2 && setShowArtisteResults(true)}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleCreateArtiste}
            >
              Créer un artiste
            </button>
          </div>
          
          {/* Résultats de recherche pour les artistes */}
          {showArtisteResults && (
            <div className="dropdown-menu show w-100 mt-1">
              {isSearchingArtistes ? (
                <div className="dropdown-item text-center">
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                  <span className="ms-2">Recherche en cours...</span>
                </div>
              ) : artisteResults.length > 0 ? (
                artisteResults.map(artiste => (
                  <div 
                    key={artiste.id} 
                    className="dropdown-item artiste-item"
                    onClick={() => handleSelectArtiste(artiste)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold">{artiste.nom}</div>
                        {artiste.genre && <div className="small text-muted">{artiste.genre}</div>}
                      </div>
                    </div>
                  </div>
                ))
              ) : artisteSearchTerm.length >= 2 ? (
                <div className="dropdown-item text-muted">Aucun artiste trouvé</div>
              ) : null}
            </div>
          )}
        </div>
  
        {selectedArtiste && (
          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title mb-1">Artiste sélectionné</h5>
                  <div><strong>Nom:</strong> {selectedArtiste.nom}</div>
                  {selectedArtiste.genre && <div><strong>Genre:</strong> {selectedArtiste.genre}</div>}
                </div>
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-danger"
                  onClick={handleRemoveArtiste}
                >
                  <i className="bi bi-x"></i>
                </button>
              </div>
            </div>
          </div>
        )}
  
        <div className="mb-3">
          <label htmlFor="notes" className="form-label">Notes</label>
          <textarea
            className="form-control"
            id="notes"
            name="notes"
            rows="3"
            value={formData.notes}
            onChange={handleChange}
          ></textarea>
        </div>
  
        <div className="d-flex justify-content-between">
          <div>
            <button
              type="button"
              className="btn btn-secondary me-2"
              onClick={() => navigate('/concerts')}
              disabled={isSubmitting}
            >
              Annuler
            </button>
            
            {/* Bouton de suppression - visible uniquement en mode édition */}
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
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enregistrement...' : id && id !== 'nouveau' ? 'Enregistrer les modifications' : 'Créer le concert'}
          </button>
        </div>
        
        {/* Modale de confirmation de suppression */}
        {showDeleteConfirm && (
          <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div className="modal-confirm" style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              width: '400px',
              maxWidth: '90%',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <div className="modal-header" style={{
                padding: '16px',
                borderBottom: '1px solid #eee'
              }}>
                <h5>Confirmation de suppression</h5>
              </div>
              <div className="modal-body" style={{
                padding: '16px'
              }}>
                <p>Êtes-vous sûr de vouloir supprimer ce concert ? Cette action est irréversible.</p>
              </div>
              <div className="modal-footer" style={{
                padding: '16px',
                borderTop: '1px solid #eee',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px'
              }}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Annuler
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    );
  };
  
  export default ConcertForm;
  