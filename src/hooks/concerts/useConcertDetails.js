import { useState, useEffect } from 'react';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  updateDoc,
  deleteDoc,
  arrayUnion
} from 'firebase/firestore';
import { db } from '@/firebaseInit';
import { useNavigate } from 'react-router-dom';
import { formatDateFr } from '@/utils/dateUtils';
import { useEntitySearch } from '@/hooks/common/useEntitySearch';

/**
 * Fonctions utilitaires
 */

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

/**
 * Hook pour gérer les détails d'un concert
 * Gère le chargement des informations du concert, du lieu, du programmateur et de l'artiste
 * Ainsi que les fonctionnalités d'enregistrement, mise à jour et suppression
 */
export const useConcertDetails = (id, location) => {
  const navigate = useNavigate();
  
  // États pour les données
  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // États pour le formulaire
  const [formData, setFormData] = useState(null);
  const [showFormGenerator, setShowFormGenerator] = useState(false);
  const [generatedFormLink, setGeneratedFormLink] = useState(null);
  
  // États pour le mode d'édition
  const [isEditMode, setIsEditMode] = useState(false);

  // Gestion des entités associées (pour la mise à jour des relations)
  const [initialProgrammateurId, setInitialProgrammateurId] = useState(null);
  const [initialArtisteId, setInitialArtisteId] = useState(null);

  // État pour le formulaire d'édition
  const [formState, setFormState] = useState({
    date: '',
    montant: '',
    statut: 'En attente',
    titre: '',
    notes: ''
  });

  // État pour le statut du formulaire
  const [formDataStatus, setFormDataStatus] = useState({
    exists: false,
    isValidated: false
  });

  /**
   * Utilisation des hooks communs pour la recherche d'entités
   */
  
  // Hook pour la recherche de lieux
  const lieuSearch = useEntitySearch({
    entityType: 'lieux',
    searchField: 'nom',
    additionalSearchFields: ['ville', 'codePostal', 'adresse']
  });

  // Hook pour la recherche de programmateurs
  const programmateurSearch = useEntitySearch({
    entityType: 'programmateurs',
    searchField: 'nom',
    additionalSearchFields: ['structure', 'email']
  });

  // Hook pour la recherche d'artistes
  const artisteSearch = useEntitySearch({
    entityType: 'artistes',
    searchField: 'nom',
    additionalSearchFields: ['genre', 'description']
  });

  // Accesseurs pour les entités sélectionnées
  const lieu = lieuSearch.selectedEntity;
  const programmateur = programmateurSearch.selectedEntity;
  const artiste = artisteSearch.selectedEntity;
  
  // Setters pour les entités sélectionnées
  const setLieu = lieuSearch.setSelectedEntity;
  const setProgrammateur = programmateurSearch.setSelectedEntity;
  const setArtiste = artisteSearch.setSelectedEntity;

  /**
   * Sous-fonctions pour la récupération des données
   */

  // Récupération des données de base du concert
  const fetchConcertData = async () => {
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
        
        return concertData;
      } else {
        console.error('Concert non trouvé');
        navigate('/concerts');
        return null;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données du concert:', error);
      return null;
    }
  };

  // Récupération des données du lieu associé
  const fetchLieuData = async (concertData) => {
    if (!concertData || !concertData.lieuId) return;
    
    try {
      const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
      if (lieuDoc.exists()) {
        const lieuData = {
          id: lieuDoc.id,
          ...lieuDoc.data()
        };
        setLieu(lieuData);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données du lieu:', error);
    }
  };

  // Récupération des données du programmateur associé
  const fetchProgrammateurData = async (concertData) => {
    if (!concertData || !concertData.programmateurId) return;
    
    try {
      const progDoc = await getDoc(doc(db, 'programmateurs', concertData.programmateurId));
      if (progDoc.exists()) {
        const progData = {
          id: progDoc.id,
          ...progDoc.data()
        };
        setProgrammateur(progData);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données du programmateur:', error);
    }
  };

  // Récupération des données de l'artiste associé
  const fetchArtisteData = async (concertData) => {
    if (!concertData || !concertData.artisteId) return;
    
    try {
      const artisteDoc = await getDoc(doc(db, 'artistes', concertData.artisteId));
      if (artisteDoc.exists()) {
        const artisteData = {
          id: artisteDoc.id,
          ...artisteDoc.data()
        };
        setArtiste(artisteData);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données de l\'artiste:', error);
    }
  };

  // Récupération des données du formulaire associé
  const fetchFormData = async (concertData) => {
    try {
      if (concertData.formId) {
        // Cas 1: Le concert a un formId référencé
        const formDoc = await getDoc(doc(db, 'formulaires', concertData.formId));
        if (formDoc.exists()) {
          updateFormDataState(formDoc);
        }
      } else {
        // Cas 2: Recherche d'un formulaire associé au concert par son ID
        const formsQuery = query(
          collection(db, 'formulaires'), 
          where('concertId', '==', id)
        );
        const formsSnapshot = await getDocs(formsQuery);
        
        if (!formsSnapshot.empty) {
          const formDoc = formsSnapshot.docs[0];
          updateFormDataState(formDoc);
          
          // Mise à jour du concert avec l'ID du formulaire
          await updateDoc(doc(db, 'concerts', id), {
            formId: formDoc.id
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données du formulaire:', error);
    }
  };

  // Mise à jour des états liés au formulaire
  const updateFormDataState = (formDoc) => {
    const formDataObj = {
      id: formDoc.id,
      ...formDoc.data()
    };
    setFormData(formDataObj);
    
    // Déterminer si le formulaire contient des données
    const hasData = formDataObj.programmateurData || 
      (formDataObj.data && Object.keys(formDataObj.data).length > 0);
    
    setFormDataStatus({
      exists: true,
      isValidated: formDataObj.status === 'validated',
      hasData: hasData
    });
  };

  // Fonction principale pour charger toutes les données
  const fetchConcert = async () => {
    setLoading(true);
    try {
      const concertData = await fetchConcertData();
      if (!concertData) return;
      
      // Chargement parallèle des données associées
      await Promise.all([
        fetchLieuData(concertData),
        fetchProgrammateurData(concertData),
        fetchArtisteData(concertData),
        fetchFormData(concertData)
      ]);
      
    } catch (error) {
      console.error('Erreur lors de la récupération du concert:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gestion du formulaire et des modifications
   */

  // Changement de valeur dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Mise à jour des associations programmateur-concert
  const updateProgrammateurAssociation = async (concertId, concertData, newProgrammateurId, oldProgrammateurId, currentLieu) => {
    try {
      // Si un nouveau programmateur est sélectionné
      if (newProgrammateurId) {
        const progRef = doc(db, 'programmateurs', newProgrammateurId);
        
        // Ajouter le concert à la liste des concerts associés du programmateur
        const concertReference = {
          id: concertId,
          titre: concertData.titre || 'Sans titre',
          date: concertData.date || null,
          lieu: currentLieu?.nom || null
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
  const updateArtisteAssociation = async (concertId, concertData, newArtisteId, oldArtisteId, currentLieu) => {
    try {
      // Si un nouvel artiste est sélectionné
      if (newArtisteId) {
        const artisteRef = doc(db, 'artistes', newArtisteId);
        
        // Ajouter le concert à la liste des concerts de l'artiste
        const concertReference = {
          id: concertId,
          titre: concertData.titre || 'Sans titre',
          date: concertData.date || null,
          lieu: currentLieu?.nom || null
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
    return formState.date && formState.montant && lieu;
  };

  // Sauvegarde des modifications
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
      alert('Veuillez remplir tous les champs obligatoires (date, montant, lieu).');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Créer l'objet de données du concert
      const concertData = {
        ...formState,
        lieuId: lieu?.id || null,
        lieuNom: lieu?.nom || null,
        lieuAdresse: lieu?.adresse || null,
        lieuCodePostal: lieu?.codePostal || null,
        lieuVille: lieu?.ville || null,
        lieuCapacite: lieu?.capacite || null,
        
        programmateurId: programmateur?.id || null,
        programmateurNom: programmateur?.nom || null,
        
        artisteId: artiste?.id || null,
        artisteNom: artiste?.nom || null,
        
        updatedAt: new Date().toISOString()
      };
      
      // Mise à jour du concert
      await updateDoc(doc(db, 'concerts', id), concertData);
      
      // Mises à jour bidirectionnelles
      if (programmateur?.id || initialProgrammateurId) {
        await updateProgrammateurAssociation(
          id,
          concertData,
          programmateur?.id || null,
          initialProgrammateurId,
          lieu
        );
      }
      
      if (artiste?.id || initialArtisteId) {
        await updateArtisteAssociation(
          id,
          concertData,
          artiste?.id || null,
          initialArtisteId,
          lieu
        );
      }
      
      // Mettre à jour les données locales
      setConcert({
        ...concert,
        ...concertData
      });
      
      // Retour au mode vue
      setIsEditMode(false);
      
      // Mettre à jour les IDs initiaux pour la prochaine édition
      setInitialProgrammateurId(programmateur?.id || null);
      setInitialArtisteId(artiste?.id || null);
      
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
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du concert:', error);
      alert('Une erreur est survenue lors de la suppression du concert.');
      return false;
    } finally {
      setIsSubmitting(false);
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
    }
    
    setIsEditMode(!isEditMode);
  };

  /**
   * Gestion du formulaire externe
   */

  // Gestionnaire pour le formulaire généré
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
        updateFormDataState(formDoc);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du concert:', error);
    }
  };

  // Fonction pour obtenir les informations sur le statut et les actions requises
  const getStatusInfo = () => {
    if (!concert) return { message: '', actionNeeded: false };
    
    const isPastDate = isDatePassed(concert.date);
    
    switch (concert.statut) {
      case 'contact':
        if (!formData) return { message: 'Formulaire à envoyer', actionNeeded: true, action: 'form' };
        if (formData && (!formData.programmateurData && (!formData.data || Object.keys(formData.data).length === 0))) 
          return { message: 'Formulaire envoyé, en attente de réponse', actionNeeded: false };
        if (formData && (formData.programmateurData || (formData.data && Object.keys(formData.data).length > 0)) && formData.status !== 'validated') 
          return { message: 'Formulaire à valider', actionNeeded: true, action: 'validate_form' };
        if (formData && formData.status === 'validated')
          return { message: 'Contrat à préparer', actionNeeded: true, action: 'prepare_contract' };
        return { message: 'Contact établi', actionNeeded: false };
        
      case 'preaccord':
        if (formData && formData.status === 'validated')
          return { message: 'Contrat à envoyer', actionNeeded: true, action: 'send_contract' };
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

  // Effet pour charger les données initiales
  useEffect(() => {
    fetchConcert();
    
    // Vérifier si on doit afficher le générateur de formulaire
    const queryParams = new URLSearchParams(location.search);
    const shouldOpenFormGenerator = queryParams.get('openFormGenerator') === 'true';
    
    if (shouldOpenFormGenerator) {
      setShowFormGenerator(true);
    }
  }, [id, navigate, location.search]);

  // API publique du hook
  return {
    // Données principales
    concert,
    lieu,
    programmateur,
    artiste,
    loading,
    isSubmitting,
    
    // États du formulaire
    formData,
    formDataStatus,
    showFormGenerator,
    setShowFormGenerator,
    generatedFormLink,
    setGeneratedFormLink,
    
    // Mode d'édition
    isEditMode,
    formState,
    
    // Recherche d'entités
    lieuSearch,
    programmateurSearch,
    artisteSearch,
    
    // Fonctions de gestion
    handleChange,
    handleSubmit,
    handleDelete,
    toggleEditMode,
    validateForm,
    handleFormGenerated,
    
    // Fonctions utilitaires
    copyToClipboard,
    formatDate,
    formatMontant,
    isDatePassed,
    getStatusInfo
  };
};

export default useConcertDetails;