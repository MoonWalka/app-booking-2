import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '@/firebaseInit';

/**
 * Custom hook pour gérer les détails d'un lieu
 * Déplacé depuis components/lieux/desktop/hooks vers hooks/lieux pour standardisation
 * 
 * @param {string} lieuId - Identifiant du lieu à gérer
 * @returns {Object} - État et méthodes pour gérer les détails du lieu
 */
const useLieuDetails = (lieuId) => {
  const navigate = useNavigate();
  const [lieu, setLieu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [programmateur, setProgrammateur] = useState(null);
  const [loadingProgrammateur, setLoadingProgrammateur] = useState(false);

  // Récupération des détails du lieu
  useEffect(() => {
    const fetchLieu = async () => {
      if (!lieuId) {
        setLoading(false);
        return;
      }

      try {
        const lieuDoc = await getDoc(doc(db, 'lieux', lieuId));
        
        if (lieuDoc.exists()) {
          const lieuData = {
            id: lieuDoc.id,
            ...lieuDoc.data()
          };
          setLieu(lieuData);
          setFormData(lieuData);
          
          // Si le lieu a un programmateur associé, récupérer ses détails
          if (lieuData.programmateurId) {
            fetchProgrammateur(lieuData.programmateurId);
          }
        } else {
          setError('Le lieu demandé n\'existe pas.');
        }
      } catch (err) {
        console.error('Erreur lors du chargement du lieu:', err);
        setError('Une erreur est survenue lors du chargement des données.');
      } finally {
        setLoading(false);
      }
    };

    fetchLieu();
  }, [lieuId]);
  
  // Récupération des détails du programmateur associé au lieu
  const fetchProgrammateur = async (programmateurId) => {
    if (!programmateurId) return;
    
    setLoadingProgrammateur(true);
    
    try {
      const programmateurDoc = await getDoc(doc(db, 'programmateurs', programmateurId));
      if (programmateurDoc.exists()) {
        setProgrammateur({
          id: programmateurDoc.id,
          ...programmateurDoc.data()
        });
      }
    } catch (err) {
      console.error('Erreur lors du chargement du programmateur:', err);
    } finally {
      setLoadingProgrammateur(false);
    }
  };

  // Gestion des changements de champs du formulaire
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Gestion des propriétés imbriquées (comme contact.email)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  }, []);

  // Activer le mode édition
  const handleEdit = () => {
    setIsEditing(true);
    setFormData(lieu);
  };

  // Annuler le mode édition et réinitialiser le formulaire
  const handleCancel = () => {
    setIsEditing(false);
    setFormData(lieu);
  };

  // Sauvegarder les modifications
  const handleSave = async () => {
    // Validation
    if (!formData.nom?.trim()) {
      toast.error('Le nom du lieu est obligatoire.');
      return;
    }
    
    if (!formData.adresse?.trim() || !formData.codePostal?.trim() || !formData.ville?.trim() || !formData.pays?.trim()) {
      toast.error('L\'adresse complète est obligatoire (rue, code postal, ville et pays).');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const lieuRef = doc(db, 'lieux', lieuId);
      const updatedLieu = {
        ...formData,
        updatedAt: serverTimestamp()
      };
      
      await setDoc(lieuRef, updatedLieu, { merge: true });
      
      // Mise à jour de l'état local avec les nouvelles données
      setLieu({
        ...updatedLieu,
        id: lieuId
      });
      
      setIsEditing(false);
      toast.success('Lieu mis à jour avec succès');
    } catch (err) {
      console.error('Erreur lors de la mise à jour du lieu:', err);
      toast.error('Une erreur est survenue lors de l\'enregistrement des modifications.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ouvrir la modale de confirmation de suppression
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  // Fermer la modale de confirmation de suppression
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  // Confirmer et effectuer la suppression
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    
    try {
      await deleteDoc(doc(db, 'lieux', lieuId));
      toast.success('Lieu supprimé avec succès');
      navigate('/lieux');
    } catch (err) {
      console.error('Erreur lors de la suppression du lieu:', err);
      toast.error('Une erreur est survenue lors de la suppression du lieu.');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Vérifier si le lieu a des concerts associés
  const hasAssociatedConcerts = lieu?.concertsAssocies?.length > 0;

  return {
    lieu,
    loading,
    error,
    isEditing,
    isSubmitting,
    formData,
    isDeleting,
    showDeleteModal,
    hasAssociatedConcerts,
    programmateur,
    loadingProgrammateur,
    setFormData,
    handleChange,
    handleEdit,
    handleCancel,
    handleSave,
    handleDeleteClick,
    handleCloseDeleteModal,
    handleConfirmDelete
  };
};

export default useLieuDetails;