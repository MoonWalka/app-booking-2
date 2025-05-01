import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  doc, 
  getDoc, 
  deleteDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/firebaseInit';

const useProgrammateurDetails = (id) => {
  const navigate = useNavigate();
  const [programmateur, setProgrammateur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data state
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
    concertsAssocies: []
  });

  // Fetch programmateur data
  useEffect(() => {
    const fetchProgrammateur = async () => {
      setLoading(true);
      try {
        const progDoc = await getDoc(doc(db, 'programmateurs', id));
        if (progDoc.exists()) {
          const progData = progDoc.data();
          setProgrammateur({
            id: progDoc.id,
            ...progData
          });
          
          // Initialize formData for editing
          setFormData({
            contact: {
              nom: progData.nom?.split(' ')[0] || '',
              prenom: progData.prenom || (progData.nom?.includes(' ') ? progData.nom.split(' ').slice(1).join(' ') : ''),
              fonction: progData.fonction || '',
              email: progData.email || '',
              telephone: progData.telephone || ''
            },
            structure: {
              raisonSociale: progData.structure || '',
              type: progData.structureType || '',
              adresse: progData.structureAdresse || '',
              codePostal: progData.structureCodePostal || '',
              ville: progData.structureVille || '',
              pays: progData.structurePays || 'France',
              siret: progData.siret || '',
              tva: progData.tva || ''
            },
            concertsAssocies: progData.concertsAssocies || []
          });
        } else {
          console.error('Programmateur non trouvé');
          setError('Programmateur non trouvé');
          navigate('/programmateurs');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du programmateur:', error);
        setError('Une erreur est survenue lors de la récupération des données');
      } finally {
        setLoading(false);
      }
    };

    fetchProgrammateur();
  }, [id, navigate]);

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // If exiting edit mode, reset form to current values
      setFormData({
        contact: {
          nom: programmateur.nom?.split(' ')[0] || '',
          prenom: programmateur.prenom || (programmateur.nom?.includes(' ') ? programmateur.nom.split(' ').slice(1).join(' ') : ''),
          fonction: programmateur.fonction || '',
          email: programmateur.email || '',
          telephone: programmateur.telephone || ''
        },
        structure: {
          raisonSociale: programmateur.structure || '',
          type: programmateur.structureType || '',
          adresse: programmateur.structureAdresse || '',
          codePostal: programmateur.structureCodePostal || '',
          ville: programmateur.structureVille || '',
          pays: programmateur.structurePays || 'France',
          siret: programmateur.siret || '',
          tva: programmateur.tva || ''
        },
        concertsAssocies: programmateur.concertsAssocies || []
      });
    }
    setIsEditing(!isEditing);
  };
  
  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
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
  
  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validation
      if (!formData.contact.nom) {
        alert('Le nom est obligatoire');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare data
      const flattenedData = {
        nom: `${formData.contact.nom} ${formData.contact.prenom}`.trim(),
        structure: formData.structure.raisonSociale || '',
        email: formData.contact.email,
        telephone: formData.contact.telephone,
        ...formData.contact,
      };
      
      // Add structure fields with prefix
      Object.keys(formData.structure).forEach(key => {
        flattenedData[`structure${key.charAt(0).toUpperCase() + key.slice(1)}`] = formData.structure[key];
      });
      
      // Add update timestamp
      flattenedData.updatedAt = serverTimestamp();
      
      // Keep associated concerts
      flattenedData.concertsAssocies = formData.concertsAssocies;
      
      // Save changes
      await updateDoc(doc(db, 'programmateurs', id), flattenedData);
      
      // Update local state
      setProgrammateur({
        id,
        ...flattenedData
      });
      
      // Exit edit mode
      setIsEditing(false);
      
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      alert('Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deletion
  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce programmateur ?')) {
      try {
        await deleteDoc(doc(db, 'programmateurs', id));
        navigate('/programmateurs');
      } catch (error) {
        console.error('Erreur lors de la suppression du programmateur:', error);
        alert('Une erreur est survenue lors de la suppression du programmateur');
      }
    }
  };

  // Format display values
  const formatValue = (value) => {
    if (value === undefined || value === null || value === '') {
      return 'Non spécifié';
    }
    return value;
  };

  // Extract and structure data
  const extractData = () => {
    if (!programmateur) return { contact: {}, structure: {} };
    
    // Create contact and structure objects from programmateur data
    const contact = {
      nom: programmateur.nom?.split(' ')[0] || '',
      prenom: programmateur.prenom || (programmateur.nom?.includes(' ') ? programmateur.nom.split(' ').slice(1).join(' ') : ''),
      fonction: programmateur.fonction || '',
      email: programmateur.email || '',
      telephone: programmateur.telephone || ''
    };
    
    const structure = {
      raisonSociale: programmateur.structure || '',
      type: programmateur.structureType || '',
      adresse: programmateur.structureAdresse || '',
      codePostal: programmateur.structureCodePostal || '',
      ville: programmateur.structureVille || '',
      pays: programmateur.structurePays || 'France',
      siret: programmateur.siret || '',
      tva: programmateur.tva || ''
    };
    
    return { contact, structure };
  };

  return {
    programmateur,
    loading,
    error,
    isEditing,
    setIsEditing,
    toggleEditMode,
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    handleDelete,
    isSubmitting,
    formatValue,
    extractData
  };
};

export default useProgrammateurDetails;
