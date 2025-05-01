import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/firebaseInit';

/**
 * Hook to manage structure form state and operations
 * 
 * @param {string} id - Structure ID if editing an existing structure, undefined for new structure
 * @returns {Object} - Form state and operations
 */
export const useStructureForm = (id) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validated, setValidated] = useState(false);
  const isEditMode = !!id;

  // Form state
  const [formData, setFormData] = useState({
    nom: '',
    raisonSociale: '',
    type: '',
    adresse: '',
    codePostal: '',
    ville: '',
    pays: 'France',
    siret: '',
    tva: '',
    telephone: '',
    email: '',
    siteWeb: '',
    notes: '',
    contact: {
      nom: '',
      telephone: '',
      email: '',
      fonction: ''
    }
  });

  // Load structure data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchStructure = async () => {
        setLoading(true);
        try {
          const structureDoc = await getDoc(doc(db, 'structures', id));
          if (structureDoc.exists()) {
            const structureData = structureDoc.data();
            setFormData({
              nom: structureData.nom || '',
              raisonSociale: structureData.raisonSociale || '',
              type: structureData.type || '',
              adresse: structureData.adresse || '',
              codePostal: structureData.codePostal || '',
              ville: structureData.ville || '',
              pays: structureData.pays || 'France',
              siret: structureData.siret || '',
              tva: structureData.tva || '',
              telephone: structureData.telephone || '',
              email: structureData.email || '',
              siteWeb: structureData.siteWeb || '',
              notes: structureData.notes || '',
              contact: {
                nom: structureData.contact?.nom || '',
                telephone: structureData.contact?.telephone || '',
                email: structureData.contact?.email || '',
                fonction: structureData.contact?.fonction || ''
              }
            });
          } else {
            setError('Structure non trouvée');
            navigate('/structures');
          }
        } catch (error) {
          console.error('Erreur lors du chargement de la structure:', error);
          setError('Une erreur est survenue lors du chargement des données');
        } finally {
          setLoading(false);
        }
      };

      fetchStructure();
    }
  }, [id, isEditMode, navigate]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested fields (like contact.nom)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Form validation
  const validateForm = (form) => {
    if (form.checkValidity() === false) {
      setValidated(true);
      return false;
    }
    return true;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm(e.currentTarget)) {
      e.stopPropagation();
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const structureData = {
        ...formData,
        updatedAt: Timestamp.now()
      };
      
      if (!isEditMode) {
        // Create new structure
        const newStructureRef = doc(collection(db, 'structures'));
        structureData.createdAt = Timestamp.now();
        structureData.programmateursAssocies = [];
        
        await setDoc(newStructureRef, structureData);
        navigate(`/structures/${newStructureRef.id}`);
      } else {
        // Update existing structure
        await updateDoc(doc(db, 'structures', id), structureData);
        navigate(`/structures/${id}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la structure:', error);
      setError('Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel form and navigate back
  const handleCancel = () => {
    navigate(isEditMode ? `/structures/${id}` : '/structures');
  };

  return {
    id,
    isEditMode,
    loading,
    submitting,
    error,
    validated,
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    handleCancel,
    validateForm,
    setValidated
  };
};

export default useStructureForm;