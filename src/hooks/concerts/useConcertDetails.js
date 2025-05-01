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

/**
 * Hook pour gérer les détails d'un concert
 * Gère le chargement des informations du concert, du lieu, du programmateur et de l'artiste
 * Ainsi que les fonctionnalités d'enregistrement, mise à jour et suppression
 */
export const useConcertDetails = (id, location) => {
  const navigate = useNavigate();
  
  // États pour les données
  const [concert, setConcert] = useState(null);
  const [lieu, setLieu] = useState(null);
  const [programmateur, setProgrammateur] = useState(null);
  const [artiste, setArtiste] = useState(null);
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

  // Fonction pour charger les données du concert et des entités associées
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
  const handleSubmit = async (e, selectedLieu, selectedProgrammateur, selectedArtiste) => {
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
          initialProgrammateurId,
          selectedLieu
        );
      }
      
      if (selectedArtiste?.id || initialArtisteId) {
        await updateArtisteAssociation(
          id,
          concertData,
          selectedArtiste?.id || null,
          initialArtisteId,
          selectedLieu
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

  return {
    concert,
    lieu,
    programmateur,
    artiste,
    loading,
    isSubmitting,
    formData,
    showFormGenerator,
    setShowFormGenerator,
    generatedFormLink,
    setGeneratedFormLink,
    isEditMode,
    formState,
    handleChange,
    handleSubmit,
    handleDelete,
    toggleEditMode,
    validateForm,
    handleFormGenerated,
    copyToClipboard
  };
};

export default useConcertDetails;