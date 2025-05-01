import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '@/firebaseInit';

/**
 * Custom hook to manage venue details 
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

  // Fetch venue details
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

  // Handle form field changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Handle nested properties (like contact.email)
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

  // Toggle edit mode
  const handleEdit = () => {
    setIsEditing(true);
    setFormData(lieu);
  };

  // Cancel edit mode and reset form
  const handleCancel = () => {
    setIsEditing(false);
    setFormData(lieu);
  };

  // Save changes
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

  // Open delete confirmation modal
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  // Close delete confirmation modal
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  // Confirm and process deletion
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

  // Check if the venue has associated concerts
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