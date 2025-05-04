import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/firebaseInit';
import structureService from '@/services/structureService';

/**
 * Hook pour gérer les détails d'un programmateur
 * @param {string} id - ID du programmateur
 * @returns {Object} - Données et fonctions pour la gestion du programmateur
 */
const useProgrammateurDetails = (id) => {
  const navigate = useNavigate();
  const [programmateur, setProgrammateur] = useState(null);
  const [structure, setStructure] = useState(null);  // Nouvel état pour stocker la structure associée
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [structureCreated, setStructureCreated] = useState(false);
  
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
    structureId: '',
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
            id,
            ...progData
          });

          // Chargement de la structure associée si elle existe
          if (progData.structureId) {
            try {
              const structureDoc = await getDoc(doc(db, 'structures', progData.structureId));
              if (structureDoc.exists()) {
                setStructure({
                  id: structureDoc.id,
                  ...structureDoc.data()
                });
              } else {
                // La structure référencée n'existe pas, corriger la référence
                console.warn(`Structure ${progData.structureId} référencée mais non trouvée. Correction de la référence.`);
                await updateDoc(doc(db, 'programmateurs', id), {
                  structureId: null,
                  updatedAt: new Date().toISOString()
                });
              }
            } catch (error) {
              console.error('Erreur lors du chargement de la structure associée:', error);
            }
          }
          
          // Mise à jour de l'état du formulaire avec les données du programmateur
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
            structureId: progData.structureId || '', // Récupération de l'ID de la structure
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
        structureId: programmateur.structureId || '', // Réinitialisation de l'ID de la structure
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
  
  /**
   * Utilise le service centralisé pour créer ou mettre à jour une entité Structure
   * @returns {Promise<string|null>} L'ID de la structure créée/mise à jour ou null
   */
  const handleStructureEntity = async () => {
    // Ne rien faire si la raison sociale n'est pas renseignée
    if (!formData.structure.raisonSociale) return null;
    
    const initialStructureId = formData.structureId;
    const hadInitialStructureId = !!initialStructureId;
    
    try {
      console.log("Préparation de la création/mise à jour de structure via service centralisé");
      // Utiliser le service structureService pour gérer l'entité Structure
      const structureId = await structureService.ensureStructureEntity({
        id: id, // ID du programmateur
        structure: formData.structure.raisonSociale,
        structureType: formData.structure.type,
        structureAdresse: formData.structure.adresse,
        structureCodePostal: formData.structure.codePostal,
        structureVille: formData.structure.ville,
        structurePays: formData.structure.pays,
        structureSiret: formData.structure.siret,
        structureTva: formData.structure.tva,
        structureId: formData.structureId // ID existant si disponible
      });
      
      // Mise à jour de l'état local avec l'ID de la structure
      if (structureId) {
        console.log(`Structure ID obtenu: ${structureId}`);
        setFormData(prevState => ({
          ...prevState,
          structureId: structureId
        }));
        
        // Afficher une notification si une nouvelle structure a été créée
        if (!hadInitialStructureId && structureId) {
          console.log("Nouvelle structure créée, affichage de la notification");
          setStructureCreated(true);
          setTimeout(() => {
            setStructureCreated(false);
          }, 3000);
        }
      } else {
        console.warn("Aucun ID de structure n'a été retourné par le service");
      }
      
      return structureId;
    } catch (error) {
      console.error('Erreur lors de la gestion de l\'entité Structure:', error);
      return null;
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
      
      // Créer ou mettre à jour l'entité Structure automatiquement via le service
      let structureId = null;
      if (formData.structure.raisonSociale) {
        structureId = await handleStructureEntity();
        console.log(`Structure ID après handleStructureEntity: ${structureId}`);
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
      
      // Set the structureId
      flattenedData.structureId = structureId;
      console.log(`StructureId sauvegardé dans programmateur: ${flattenedData.structureId}`);
      
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
      
      // Mettre à jour l'état de la structure
      if (structureId) {
        try {
          const structureDoc = await getDoc(doc(db, 'structures', structureId));
          if (structureDoc.exists()) {
            setStructure({
              id: structureId,
              ...structureDoc.data()
            });
          }
        } catch (error) {
          console.error("Erreur lors de la mise à jour de l'état de la structure:", error);
        }
      }
      
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
        // Si une structure est associée, supprimer la référence au programmateur
        if (programmateur.structureId) {
          try {
            const structureRef = doc(db, 'structures', programmateur.structureId);
            const structureDoc = await getDoc(structureRef);
            
            if (structureDoc.exists()) {
              const structureData = structureDoc.data();
              const programmateurs = structureData.programmateursAssocies || [];
              
              // Filtrer ce programmateur de la liste
              await updateDoc(structureRef, {
                programmateursAssocies: programmateurs.filter(progId => progId !== id)
              });
            }
          } catch (error) {
            console.error('Erreur lors de la mise à jour de la structure associée:', error);
          }
        }
        
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
      nom: programmateur.nom,
      prenom: programmateur.prenom,
      fonction: programmateur.fonction,
      email: programmateur.email,
      telephone: programmateur.telephone
    };
    
    const structure = {
      raisonSociale: programmateur.structure,
      type: programmateur.structureType,
      adresse: programmateur.structureAdresse,
      codePostal: programmateur.structureCodePostal,
      ville: programmateur.structureVille,
      pays: programmateur.structurePays,
      siret: programmateur.siret,
      tva: programmateur.tva
    };
    
    return { contact, structure };
  };

  return {
    programmateur,
    structure,  // Exposer la structure récupérée
    loading,
    error,
    isEditing,
    toggleEditMode,
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    handleDelete,
    isSubmitting,
    formatValue,
    extractData,
    structureCreated
  };
};

export default useProgrammateurDetails;
