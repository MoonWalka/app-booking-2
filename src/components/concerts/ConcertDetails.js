import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  doc, getDoc, deleteDoc, updateDoc, collection, getDocs, 
  query, where, serverTimestamp, arrayUnion, arrayRemove, setDoc, limit
} from 'firebase/firestore';
import { db } from '../../firebase';
import FormGenerator from '../forms/FormGenerator';
import '../../style/concertDetails.css';


const ConcertDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // État pour le basculement entre mode vue et édition
  const [isEditMode, setIsEditMode] = useState(false);
  
  // États pour les données
  const [concert, setConcert] = useState(null);
  const [lieu, setLieu] = useState(null);
  const [programmateur, setProgrammateur] = useState(null);
  const [artiste, setArtiste] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // États pour le formulaire
  const [showFormGenerator, setShowFormGenerator] = useState(false);
  const [formData, setFormData] = useState(null);
  const [generatedFormLink, setGeneratedFormLink] = useState(null);
  
  // États pour la recherche lors de l'édition
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
  
  // États pour le formulaire d'édition
  const [formState, setFormState] = useState({
    date: '',
    montant: '',
    statut: 'En attente',
    titre: '',
    notes: ''
  });
  
  // États pour les entités sélectionnées (pour l'édition)
  const [selectedLieu, setSelectedLieu] = useState(null);
  const [selectedProgrammateur, setSelectedProgrammateur] = useState(null);
  const [selectedArtiste, setSelectedArtiste] = useState(null);
  const [initialProgrammateurId, setInitialProgrammateurId] = useState(null);
  const [initialArtisteId, setInitialArtisteId] = useState(null);
  
  // Refs pour les dropdowns
  const lieuDropdownRef = useRef(null);
  const progDropdownRef = useRef(null);
  const artisteDropdownRef = useRef(null);
  
  // Timeout refs pour la recherche
  const lieuSearchTimeoutRef = useRef(null);
  const progSearchTimeoutRef = useRef(null);
  const artisteSearchTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchConcert = async () => {
      setLoading(true);
      try {
        const concertDoc = await getDoc(doc(db, 'concerts', id));
        if (concertDoc.exists()) {
          const concertData = {
            id: concertDoc.id,
            ...concertDoc.data()
          };
          setConcert(concertData);
          
          // Initialiser le formulaire d'édition avec les données du concert
          setFormState({
            date: concertData.date || '',
            montant: concertData.montant || '',
            statut: concertData.statut || 'En attente',
            titre: concertData.titre || '',
            notes: concertData.notes || ''
          });
          
          // Stocker les IDs initiaux pour la gestion des relations bidirectionnelles
          if (concertData.programmateurId) {
            setInitialProgrammateurId(concertData.programmateurId);
          }
          
          if (concertData.artisteId) {
            setInitialArtisteId(concertData.artisteId);
          }
          
          // Récupérer les données du lieu
          if (concertData.lieuId) {
            const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
            if (lieuDoc.exists()) {
              const lieuData = {
                id: lieuDoc.id,
                ...lieuDoc.data()
              };
              setLieu(lieuData);
              setSelectedLieu(lieuData);
              setLieuSearchTerm(lieuData.nom);
            }
          }
          
          // Récupérer les données du programmateur
          if (concertData.programmateurId) {
            const progDoc = await getDoc(doc(db, 'programmateurs', concertData.programmateurId));
            if (progDoc.exists()) {
              const progData = {
                id: progDoc.id,
                ...progDoc.data()
              };
              setProgrammateur(progData);
              setSelectedProgrammateur(progData);
              setProgSearchTerm(progData.nom);
            }
          }
          
          // Récupérer les données de l'artiste
          if (concertData.artisteId) {
            const artisteDoc = await getDoc(doc(db, 'artistes', concertData.artisteId));
            if (artisteDoc.exists()) {
              const artisteData = {
                id: artisteDoc.id,
                ...artisteDoc.data()
              };
              setArtiste(artisteData);
              setSelectedArtiste(artisteData);
              setArtisteSearchTerm(artisteData.nom);
            }
          }
          
          // Vérifier si un formulaire existe déjà pour ce concert
          if (concertData.formId) {
            try {
              const formDoc = await getDoc(doc(db, 'formulaires', concertData.formId));
              if (formDoc.exists()) {
                setFormData({
                  id: formDoc.id,
                  ...formDoc.data()
                });
              }
            } catch (error) {
              console.error('Erreur lors de la récupération du formulaire:', error);
            }
          } else {
            // Si pas de formId, chercher dans la collection formulaires
            const formsQuery = query(
              collection(db, 'formulaires'), 
              where('concertId', '==', id)
            );
            const formsSnapshot = await getDocs(formsQuery);
            
            if (!formsSnapshot.empty) {
              const formDoc = formsSnapshot.docs[0];
              setFormData({
                id: formDoc.id,
                ...formDoc.data()
              });
              
              // Mettre à jour le concert avec l'ID du formulaire
              await updateDoc(doc(db, 'concerts', id), {
                formId: formDoc.id
              });
            }
          }
        } else {
          console.error('Concert non trouvé');
          navigate('/concerts');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du concert:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConcert();
    
    // Vérifier si on doit afficher le générateur de formulaire
    const queryParams = new URLSearchParams(location.search);
    const shouldOpenFormGenerator = queryParams.get('openFormGenerator') === 'true';
    
    if (shouldOpenFormGenerator) {
      setShowFormGenerator(true);
    }
  }, [id, navigate, location.search]);

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

  // Effets pour la recherche de programmateurs
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

  // Effets pour la recherche d'artistes
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
  
  // Sélection d'un lieu depuis les résultats
  const handleSelectLieu = (lieu) => {
    setSelectedLieu(lieu);
    setLieuSearchTerm(lieu.nom);
    setShowLieuResults(false);
  };

  // Sélection d'un programmateur depuis les résultats
  const handleSelectProgrammateur = (prog) => {
    setSelectedProgrammateur(prog);
    setProgSearchTerm(prog.nom);
    setShowProgResults(false);
  };

  // Sélection d'un artiste depuis les résultats
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

  // Changement de valeur dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Mise à jour des associations programmateur-concert
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
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des associations artiste-concert:', error);
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    return formState.date && formState.montant && selectedLieu;
  };

  // Sauvegarde des modifications
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
        ...formState,
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
      
      // Mise à jour du concert
      await updateDoc(doc(db, 'concerts', id), concertData);
      
      // Mises à jour bidirectionnelles
      if (selectedProgrammateur?.id || initialProgrammateurId) {
        await updateProgrammateurAssociation(
          id,
          concertData,
          selectedProgrammateur?.id || null,
          initialProgrammateurId
        );
      }
      
      if (selectedArtiste?.id || initialArtisteId) {
        await updateArtisteAssociation(
          id,
          concertData,
          selectedArtiste?.id || null,
          initialArtisteId
        );
      }
      
      // Mettre à jour les données locales
      setConcert({
        ...concert,
        ...concertData
      });
      
      setLieu(selectedLieu);
      setProgrammateur(selectedProgrammateur);
      setArtiste(selectedArtiste);
      
      // Retour au mode vue
      setIsEditMode(false);
      
      // Mettre à jour les IDs initiaux pour la prochaine édition
      setInitialProgrammateurId(selectedProgrammateur?.id || null);
      setInitialArtisteId(selectedArtiste?.id || null);
      
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
      
      // Mise à jour du programmateur
      if (programmateur?.id) {
        const progRef = doc(db, 'programmateurs', programmateur.id);
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
      }
      
      // Mise à jour de l'artiste
      if (artiste?.id) {
        const artisteRef = doc(db, 'artistes', artiste.id);
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

  // Fonction pour basculer en mode édition
  const toggleEditMode = () => {
    if (isEditMode) {
      // Annuler les modifications et revenir au mode vue
      setFormState({
        date: concert.date || '',
        montant: concert.montant || '',
        statut: concert.statut || 'En attente',
        titre: concert.titre || '',
        notes: concert.notes || ''
      });
      
      setSelectedLieu(lieu);
      setSelectedProgrammateur(programmateur);
      setSelectedArtiste(artiste);
      
      setLieuSearchTerm(lieu?.nom || '');
      setProgSearchTerm(programmateur?.nom || '');
      setArtisteSearchTerm(artiste?.nom || '');
    }
    
    setIsEditMode(!isEditMode);
  };

  const handleFormGenerated = async (formId, formUrl) => {
    console.log('Formulaire généré:', formId, formUrl);
    
    // Stocker le lien généré
    setGeneratedFormLink(formUrl);
    
    // Mettre à jour le concert avec l'ID du formulaire
    try {
      await updateDoc(doc(db, 'concerts', id), {
        formId: formId
      });
      
      // Recharger les données du formulaire
      const formDoc = await getDoc(doc(db, 'formulaires', formId));
      if (formDoc.exists()) {
        setFormData({
          id: formDoc.id,
          ...formDoc.data()
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du concert:', error);
    }
  };

  // Fonction pour copier le lien dans le presse-papiers
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Lien copié dans le presse-papiers !');
      })
      .catch(err => {
        console.error('Erreur lors de la copie dans le presse-papiers:', err);
      });
  };

  // Formater la date pour l'affichage
  const formatDate = (dateValue) => {
    if (!dateValue) return 'Date non spécifiée';
    
    // Si c'est un timestamp Firestore
    if (dateValue.seconds) {
      return new Date(dateValue.seconds * 1000).toLocaleDateString('fr-FR');
    }
    
    // Si c'est une chaîne de date
    try {
      return new Date(dateValue).toLocaleDateString('fr-FR');
    } catch (e) {
      return dateValue;
    }
  };

    // Formater le montant
    const formatMontant = (montant) => {
      if (!montant) return '0,00 €';
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
    };
  
    // Vérifier si la date est passée
    const isDatePassed = (dateValue) => {
      if (!dateValue) return false;
      
      const today = new Date();
      const concertDate = dateValue.seconds ? 
        new Date(dateValue.seconds * 1000) : 
        new Date(dateValue);
      
      return concertDate < today;
    };
  
    // Fonction pour obtenir les informations sur le statut et les actions requises
    const getStatusInfo = () => {
      if (!concert) return { message: '', actionNeeded: false };
      
      const isPastDate = isDatePassed(concert.date);
      
      switch (concert.statut) {
        case 'contact':
          if (!formData) return { message: 'Formulaire à envoyer', actionNeeded: true, action: 'form' };
          return { message: 'Contact établi', actionNeeded: false };
          
        case 'preaccord':
          return { message: 'Contrat à préparer', actionNeeded: true, action: 'contract' };
          
        case 'contrat':
          return { message: 'Facture acompte à envoyer', actionNeeded: true, action: 'invoice' };
          
        case 'acompte':
          return { message: 'En attente du concert', actionNeeded: false };
          
        case 'solde':
          if (isPastDate) return { message: 'Concert terminé', actionNeeded: false };
          return { message: 'Facture solde envoyée', actionNeeded: false };
          
        default:
          return { message: 'Statut non défini', actionNeeded: false };
      }
    };
  
    if (loading) {
      return <div className="text-center my-5 loading-spinner">Chargement du concert...</div>;
    }
  
    if (!concert) {
      return <div className="alert alert-danger">Concert non trouvé</div>;
    }
  
    const statusInfo = getStatusInfo();
  
    return (
      <div className="concert-details-container">
        {/* En-tête du formulaire */}
        <div className="form-header-container">
          <h2 className="modern-title">
            {concert.titre || `Concert du ${formatDate(concert.date)}`}
          </h2>
          <div className="breadcrumb-container">
            <span className="breadcrumb-item" onClick={() => navigate('/concerts')}>Concerts</span>
            <i className="bi bi-chevron-right"></i>
            <span className="breadcrumb-item active">
              {concert.titre || formatDate(concert.date)}
            </span>
          </div>
        </div>
    
        {/* Boutons d'action */}
        <div className="action-buttons">
          <Link to="/concerts" className="btn btn-outline-secondary action-btn">
            <i className="bi bi-arrow-left"></i>
            <span className="btn-text">Retour</span>
          </Link>
          
          <button
            onClick={toggleEditMode}
            className={`btn btn-outline-${isEditMode ? 'warning' : 'primary'} action-btn`}
          >
            <i className={`bi bi-${isEditMode ? 'x-circle' : 'pencil'}`}></i>
            <span className="btn-text">{isEditMode ? 'Annuler' : 'Modifier'}</span>
          </button>
          
          {isEditMode ? (
            <button
              type="button"
              className="btn btn-primary action-btn"
              onClick={handleSubmit}
              disabled={isSubmitting || !validateForm()}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  <span className="btn-text">Enregistrement...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle"></i>
                  <span className="btn-text">Enregistrer</span>
                </>
              )}
            </button>
          ) : (
            <button 
              onClick={() => setShowDeleteConfirm(true)} 
              className="btn btn-outline-danger action-btn"
            >
              <i className="bi bi-trash"></i>
              <span className="btn-text">Supprimer</span>
            </button>
          )}
        </div>
  
        {isEditMode ? (
          /* Mode édition */
          <form className="modern-form">
            {/* Carte - Informations principales du concert */}
            <div className="form-card">
              <div className="card-header">
                <i className="bi bi-info-circle"></i>
                <h3>Informations générales</h3>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label htmlFor="titre" className="form-label">Titre du concert</label>
                  <input
                    type="text"
                    className="form-control"
                    id="titre"
                    name="titre"
                    value={formState.titre || ''}
                    onChange={handleChange}
                    placeholder="Ex: Concert de jazz, Festival d'été, etc."
                  />
                </div>
  
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="date" className="form-label">Date du concert <span className="required">*</span></label>
                      <input
                        type="date"
                        className="form-control"
                        id="date"
                        name="date"
                        value={formState.date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="montant" className="form-label">Montant (€) <span className="required">*</span></label>
                      <input
                        type="number"
                        className="form-control"
                        id="montant"
                        name="montant"
                        value={formState.montant}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
  
                <div className="form-group">
                  <label htmlFor="statut" className="form-label">Statut</label>
                  <select
                    className="form-select"
                    id="statut"
                    name="statut"
                    value={formState.statut}
                    onChange={handleChange}
                  >
                    <option value="En attente">En attente</option>
                    <option value="Confirmé">Confirmé</option>
                    <option value="Annulé">Annulé</option>
                    <option value="Terminé">Terminé</option>
                    <option value="contact">Contact</option>
                    <option value="preaccord">Pré-accord</option>
                    <option value="contrat">Contrat</option>
                    <option value="acompte">Acompte</option>
                    <option value="solde">Solde</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="notes" className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    id="notes"
                    name="notes"
                    rows="3"
                    value={formState.notes || ''}
                    onChange={handleChange}
                    placeholder="Informations complémentaires, remarques..."
                  ></textarea>
                </div>
              </div>
            </div>
  
            {/* Carte - Lieu */}
            <div className="form-card">
              <div className="card-header">
                <i className="bi bi-geo-alt"></i>
                <h3>Lieu <span className="required">*</span></h3>
              </div>
              <div className="card-body">
                <div className="form-group" ref={lieuDropdownRef}>
                  <label className="form-label">Rechercher un lieu</label>
                  
                  {!selectedLieu ? (
                    <div className="lieu-search-container">
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
                              className="dropdown-item lieu-item"
                              onClick={() => handleSelectLieu(lieu)}
                            >
                              <div className="lieu-name">{lieu.nom}</div>
                              <div className="lieu-details">
                                {lieu.adresse && lieu.ville && (
                                  <span className="lieu-address">
                                    {lieu.adresse}, {lieu.codePostal} {lieu.ville}
                                  </span>
                                )}
                                {lieu.capacite && (
                                  <span className="lieu-capacity">
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
                    <div className="selected-lieu">
                      <div className="lieu-card">
                        <div className="lieu-info">
                          <span className="lieu-name">{selectedLieu.nom}</span>
                          {selectedLieu.adresse && (
                            <div className="lieu-address">
                              <i className="bi bi-geo-alt-fill"></i> {selectedLieu.adresse}<br />
                              {selectedLieu.codePostal} {selectedLieu.ville}
                            </div>
                          )}
                          {selectedLieu.capacite && (
                            <div className="lieu-capacity">
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
            <div className="form-card">
              <div className="card-header">
                <i className="bi bi-person-badge"></i>
                <h3>Programmateur</h3>
              </div>
              <div className="card-body">
                <div className="form-group" ref={progDropdownRef}>
                  <label className="form-label">Associer un programmateur</label>
                  
                  {!selectedProgrammateur ? (
                    <div className="programmateur-search-container">
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
                              className="dropdown-item programmateur-item"
                              onClick={() => handleSelectProgrammateur(prog)}
                            >
                              <div className="programmateur-name">{prog.nom}</div>
                              <div className="programmateur-details">
                                {prog.structure && <span className="programmateur-structure">{prog.structure}</span>}
                                {prog.email && <span className="programmateur-email">{prog.email}</span>}
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
                    <div className="selected-programmateur">
                      <div className="programmateur-card">
                        <div className="programmateur-info">
                          <span className="programmateur-name">{selectedProgrammateur.nom}</span>
                          {selectedProgrammateur.structure && (
                            <span className="programmateur-structure">{selectedProgrammateur.structure}</span>
                          )}
                          <div className="programmateur-contacts">
                            {selectedProgrammateur.email && (
                              <span className="programmateur-contact-item">
                                <i className="bi bi-envelope"></i> {selectedProgrammateur.email}
                              </span>
                            )}
                            {selectedProgrammateur.telephone && (
                              <span className="programmateur-contact-item">
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
            <div className="form-card">
              <div className="card-header">
                <i className="bi bi-music-note-beamed"></i>
                <h3>Artiste</h3>
              </div>
              <div className="card-body">
                <div className="form-group" ref={artisteDropdownRef}>
                  <label className="form-label">Associer un artiste</label>
                  
                  {!selectedArtiste ? (
                    <div className="artiste-search-container">
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
                              className="dropdown-item artiste-item"
                              onClick={() => handleSelectArtiste(artiste)}
                            >
                              <div className="artiste-name">{artiste.nom}</div>
                              <div className="artiste-details">
                                {artiste.genre && <span className="artiste-genre">{artiste.genre}</span>}
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
                    <div className="selected-artiste">
                      <div className="artiste-card">
                        <div className="artiste-info">
                          <span className="artiste-name">{selectedArtiste.nom}</span>
                          {selectedArtiste.genre && (
                            <span className="artiste-genre">Genre: {selectedArtiste.genre}</span>
                          )}
                          {selectedArtiste.description && (
                            <p className="artiste-description">{selectedArtiste.description}</p>
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
          </form>
        ) : (
          /* Mode vue */
          <>
            {/* Carte - Informations principales */}
            <div className="form-card">
              <div className="card-header">
                <i className="bi bi-info-circle"></i>
                <h3>Informations générales</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <div className="fw-bold">Titre:</div>
                      <div>{concert.titre || "Sans titre"}</div>
                    </div>
                    <div className="mb-3">
                      <div className="fw-bold">Date:</div>
                      <div className={isDatePassed(concert.date) ? "text-muted" : ""}>
                        {formatDate(concert.date)}
                        {isDatePassed(concert.date) && <span className="badge bg-secondary ms-2">Passé</span>}
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="fw-bold">Montant:</div>
                      <div>{formatMontant(concert.montant)}</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <div className="fw-bold">Artiste:</div>
                      <div>
                        {artiste ? (
                          <Link to={`/artistes/${artiste.id}`} className="artiste-link">
                            <i className="bi bi-music-note me-1"></i>
                            {artiste.nom}
                          </Link>
                        ) : (
                          concert.artisteNom ? concert.artisteNom : <span className="text-muted">Non spécifié</span>
                        )}
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="fw-bold">Statut:</div>
                      <div className="status-display d-flex align-items-center">
                        <span className={`badge ${
                          concert.statut === 'contrat' ? 'bg-success' :
                          concert.statut === 'preaccord' ? 'bg-primary' :
                          concert.statut === 'acompte' ? 'bg-warning' :
                          concert.statut === 'solde' ? 'bg-info' :
                          concert.statut === 'annule' ? 'bg-danger' :
                          'bg-secondary'
                        } me-2`}>
                          {concert.statut || 'Non défini'}
                        </span>
                        {statusInfo.actionNeeded && (
                          <div className="action-needed ms-2">
                            <i className="bi bi-exclamation-circle text-warning me-1"></i>
                            {statusInfo.message}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="fw-bold">Formulaire:</div>
                      <div>
                        {formData ? (
                          <span className="badge bg-success me-2">
                            <i className="bi bi-check-circle me-1"></i>
                            Envoyé
                          </span>
                        ) : (
                          <span className="badge bg-warning me-2">
                            <i className="bi bi-exclamation-triangle me-1"></i>
                            Non envoyé
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {concert.notes && (
                  <div className="row mt-3">
                    <div className="col-12">
                      <div className="mb-3">
                        <div className="fw-bold">Notes:</div>
                        <div className="mt-2 p-2 bg-light rounded notes-content">
                          {concert.notes}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
  
            {/* Carte - Lieu */}
            {lieu && (
              <div className="form-card">
                <div className="card-header">
                  <i className="bi bi-geo-alt"></i>
                  <h3>Lieu</h3>
                  <Link to={`/lieux/${lieu.id}`} className="btn btn-sm btn-outline-primary card-header-action">
                    <i className="bi bi-eye"></i>
                    <span>Voir détails</span>
                  </Link>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <div className="fw-bold">Nom:</div>
                        <div>{lieu.nom}</div>
                      </div>
                      <div className="mb-3">
                        <div className="fw-bold">Adresse:</div>
                        <div>{lieu.adresse}</div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <div className="fw-bold">Ville:</div>
                        <div>{lieu.codePostal} {lieu.ville}</div>
                      </div>
                      {lieu.capacite && (
                        <div className="mb-3">
                          <div className="fw-bold">Capacité:</div>
                          <div>{lieu.capacite} personnes</div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Intégration de la carte Google Maps */}
                  <div className="mt-3">
                    <div className="map-container mb-3">
                      <iframe 
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(`${lieu.adresse}, ${lieu.codePostal} ${lieu.ville}`)}&z=6&output=embed`}
                        width="100%" 
                        height="250" 
                        style={{border: '1px solid #ddd', borderRadius: '4px'}}
                        allowFullScreen="" 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    </div>
                    <a 
                      href={`https://maps.google.com/maps?q=${encodeURIComponent(`${lieu.adresse}, ${lieu.codePostal} ${lieu.ville}`)}`}
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="btn btn-sm btn-outline-info"
                    >
                      <i className="bi bi-map me-1"></i>
                      Voir en plein écran
                    </a>
                  </div>
                </div>
              </div>
            )}
  
            {/* Carte - Programmateur */}
            <div className="form-card">
              <div className="card-header">
                <i className="bi bi-person-badge"></i>
                <h3>Programmateur</h3>
                {programmateur && (
                  <Link to={`/programmateurs/${programmateur.id}`} className="btn btn-sm btn-outline-primary card-header-action">
                    <i className="bi bi-eye"></i>
                    <span>Voir détails</span>
                  </Link>
                )}
              </div>
              <div className="card-body">
                {programmateur ? (
                  <>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <div className="fw-bold">Nom:</div>
                          <div>{programmateur.nom}</div>
                        </div>
                        {programmateur.structure && (
                          <div className="mb-3">
                            <div className="fw-bold">Structure:</div>
                            <div>{programmateur.structure}</div>
                          </div>
                        )}
                      </div>
                      <div className="col-md-6">
                        {programmateur.email && (
                          <div className="mb-3">
                            <div className="fw-bold">Email:</div>
                            <div>
                              <a href={`mailto:${programmateur.email}`} className="contact-link">
                                <i className="bi bi-envelope me-1"></i>
                                {programmateur.email}
                              </a>
                            </div>
                          </div>
                        )}
                        {programmateur.telephone && (
                          <div className="mb-3">
                            <div className="fw-bold">Téléphone:</div>
                            <div>
                              <a href={`tel:${programmateur.telephone}`} className="contact-link">
                                <i className="bi bi-telephone me-1"></i>
                                {programmateur.telephone}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Section pour le formulaire */}
                    <div className="row mt-4">
                      <div className="col-12">
                        {formData && !showFormGenerator ? (
                          <div className="alert alert-info">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <i className="bi bi-info-circle me-2"></i>
                                Un formulaire a été envoyé au programmateur 
                                {formData.dateCreation && (
                                  <span> le {formatDate(formData.dateCreation)}</span>
                                )}
                              </div>
                              <div>
                                {formData.statut === 'valide' ? (
                                  <span className="badge bg-success me-2">Validé</span>
                                ) : (
                                  <Link to={`/concerts/${id}/form`} className="btn btn-sm btn-primary">
                                    {formData.reponses ? 'Voir les réponses' : 'Voir le formulaire'}
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : null}
  
  {(showFormGenerator || generatedFormLink) ? (
  <div className="p-3 border rounded mb-3">
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h4 className="mb-0">
        {generatedFormLink ? 'Formulaire généré avec succès' : 'Envoyer un formulaire au programmateur'}
      </h4>
      <button
        className="btn btn-sm btn-outline-secondary"
        onClick={() => {
          setShowFormGenerator(false);
          setGeneratedFormLink(null);
        }}
      >
        <i className="bi bi-x-lg"></i>
      </button>
    </div>

                            
                            {generatedFormLink ? (
                              <div>
                                <p>Voici le lien du formulaire à envoyer au programmateur :</p>
                                <div className="input-group mb-3">
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={generatedFormLink}
                                    readOnly
                                  />
                                  <button
                                    className="btn btn-outline-primary"
                                    type="button"
                                    onClick={() => copyToClipboard(generatedFormLink)}
                                  >
                                    <i className="bi bi-clipboard me-1"></i> Copier
                                  </button>
                                </div>
                                <div className="form-sharing-options mt-3 mb-3">
                                  <div className="d-flex gap-2">
                                    <a 
                                      href={`mailto:${programmateur?.email || ''}?subject=Formulaire pour le concert du ${formatDate(concert.date)}&body=Bonjour,%0D%0A%0D%0AVeuillez remplir le formulaire pour le concert prévu le ${formatDate(concert.date)} en cliquant sur ce lien : ${generatedFormLink}%0D%0A%0D%0AMerci.`} 
                                      className="btn btn-outline-secondary"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <i className="bi bi-envelope"></i> Envoyer par email
                                    </a>
                                    <a 
                                      href={`https://wa.me/?text=Formulaire pour le concert du ${formatDate(concert.date)} : ${generatedFormLink}`} 
                                      className="btn btn-outline-success"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <i className="bi bi-whatsapp"></i> WhatsApp
                                    </a>
                                  </div>
                                </div>
                                <p className="text-muted">
                                  Ce lien est valable pendant 30 jours. Une fois que le programmateur aura rempli le formulaire, 
                                  vous pourrez valider les informations depuis la fiche du concert.
                                </p>
                                <div className="d-flex justify-content-between mt-3">
                                  <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => {
                                      setShowFormGenerator(false);
                                      setGeneratedFormLink(null);
                                    }}
                                  >
                                    Fermer
                                  </button>
                                  <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                      setGeneratedFormLink(null);
                                      setShowFormGenerator(true);
                                    }}
                                  >
                                    Générer un nouveau lien
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <FormGenerator
                                concertId={id}
                                programmateurId={concert.programmateurId}
                                onFormGenerated={handleFormGenerated}
                              />
                            )}
                          </div>
                        ) : (
                          !formData && (
                            <button
                              className="btn btn-primary mt-3"
                              onClick={() => setShowFormGenerator(true)}
                            >
                              <i className="bi bi-envelope me-2"></i>
                              Envoyer un formulaire au programmateur
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Aucun programmateur n'est associé à ce concert.
                  </div>
                )}
              </div>
            </div>
  
            {/* Carte - Artiste */}
            {artiste && (
              <div className="form-card">
                <div className="card-header">
                  <i className="bi bi-music-note-beamed"></i>
                  <h3>Artiste</h3>
                  <Link to={`/artistes/${artiste.id}`} className="btn btn-sm btn-outline-primary card-header-action">
                    <i className="bi bi-eye"></i>
                    <span>Voir détails</span>
                  </Link>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <div className="fw-bold">Nom:</div>
                        <div>{artiste.nom}</div>
                      </div>
                      {artiste.genre && (
                        <div className="mb-3">
                          <div className="fw-bold">Genre:</div>
                          <div>{artiste.genre}</div>
                        </div>
                      )}
                      {artiste.description && (
                        <div className="mb-3">
                          <div className="fw-bold">Description:</div>
                          <div className="mt-2 p-2 bg-light rounded">
                            {artiste.description}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      {artiste.contacts && (
                        <>
                          {artiste.contacts.email && (
                            <div className="mb-3">
                              <div className="fw-bold">Email:</div>
                              <div>
                                <a href={`mailto:${artiste.contacts.email}`} className="contact-link">
                                  <i className="bi bi-envelope me-1"></i>
                                  {artiste.contacts.email}
                                </a>
                              </div>
                            </div>
                          )}
                          {artiste.contacts.telephone && (
                            <div className="mb-3">
                              <div className="fw-bold">Téléphone:</div>
                              <div>
                                <a href={`tel:${artiste.contacts.telephone}`} className="contact-link">
                                  <i className="bi bi-telephone me-1"></i>
                                  {artiste.contacts.telephone}
                                </a>
                              </div>
                            </div>
                          )}
                          {(artiste.contacts.instagram || artiste.contacts.facebook || artiste.contacts.siteWeb) && (
                            <div className="mb-3">
                              <div className="fw-bold">Réseaux sociaux:</div>
                              <div className="mt-2 d-flex gap-2">
                                {artiste.contacts.siteWeb && (
                                  <a href={artiste.contacts.siteWeb} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                                    <i className="bi bi-globe me-1"></i>
                                    Site web
                                  </a>
                                )}
                                {artiste.contacts.instagram && (
                                  <a href={`https://instagram.com/${artiste.contacts.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-danger">
                                    <i className="bi bi-instagram me-1"></i>
                                    Instagram
                                  </a>
                                )}
                                {artiste.contacts.facebook && (
                                  <a href={artiste.contacts.facebook} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                                    <i className="bi bi-facebook me-1"></i>
                                    Facebook
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
  
        {/* Modale de confirmation de suppression */}
        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal-confirm">
              <div className="modal-header">
                <h5>Confirmation de suppression</h5>
              </div>
              <div className="modal-body">
                <p>Êtes-vous sûr de vouloir supprimer ce concert ? Cette action est irréversible.</p>
              </div>
              <div className="modal-footer">
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
  
       
      </div>
      
    );
  };
  
  export default ConcertDetails;
  