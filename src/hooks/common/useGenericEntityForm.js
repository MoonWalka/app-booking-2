import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/firebaseInit';
import { doc, getDoc, setDoc, updateDoc, collection, Timestamp } from 'firebase/firestore';

/**
 * Hook générique pour la gestion des formulaires d'entités
 * 
 * @param {Object} options - Options du hook
 * @param {string} options.entityType - Type d'entité (pour les chemins de redirection)
 * @param {string} options.entityId - ID de l'entité (ou 'nouveau' pour une nouvelle entité)
 * @param {Object} options.initialData - Données initiales du formulaire
 * @param {string} options.collectionName - Nom de la collection Firestore
 * @param {Function} options.validateForm - Fonction de validation du formulaire
 * @param {Function} options.transformData - Fonction de transformation des données avant sauvegarde
 * @param {Function} options.onSuccess - Callback à exécuter après sauvegarde réussie
 * @param {Array} options.relatedEntities - Entités liées à charger
 * @returns {Object} États et fonctions pour gérer le formulaire
 */
export const useGenericEntityForm = ({
  entityType,
  entityId,
  initialData = {},
  collectionName,
  validateForm = () => ({ isValid: true }),
  transformData = (data) => data,
  onSuccess = () => {},
  relatedEntities = []
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(!!entityId && entityId !== 'nouveau');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [relatedData, setRelatedData] = useState({});
  const [changedFields, setChangedFields] = useState({});
  const [initialEntityData, setInitialEntityData] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Charger les données de l'entité et des entités liées
  useEffect(() => {
    const fetchEntityData = async () => {
      if (!entityId || entityId === 'nouveau' || !collectionName) return;
      
      try {
        setLoading(true);
        
        // Charger les données principales de l'entité
        const entityRef = doc(db, collectionName, entityId);
        const entityDoc = await getDoc(entityRef);
        
        if (entityDoc.exists()) {
          const data = entityDoc.data();
          console.log(`Données de ${entityType} chargées:`, data);
          
          // Stocker les données initiales pour comparaison ultérieure
          setInitialEntityData(data);
          
          // Initialiser le formulaire avec les données chargées
          setFormData(prev => ({
            ...prev,
            ...data
          }));
          
          // Charger les entités liées si nécessaire
          const relatedDataResults = {};
          
          for (const entity of relatedEntities) {
            if (data[entity.idField]) {
              try {
                const relatedRef = doc(db, entity.collection, data[entity.idField]);
                const relatedDoc = await getDoc(relatedRef);
                
                if (relatedDoc.exists()) {
                  relatedDataResults[entity.name] = {
                    id: data[entity.idField],
                    ...relatedDoc.data()
                  };
                }
              } catch (err) {
                console.error(`Erreur lors du chargement de ${entity.name}:`, err);
              }
            }
          }
          
          setRelatedData(relatedDataResults);
        } else {
          console.error(`Le ${entityType} demandé n'existe pas`);
          setError(`Le ${entityType} demandé n'existe pas`);
        }
      } catch (error) {
        console.error(`Erreur lors de la récupération du ${entityType}:`, error);
        setError(`Une erreur est survenue lors du chargement des données. (${error.message})`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEntityData();
  }, [entityId, collectionName, entityType, relatedEntities]);

  // Gestionnaire de changement pour les champs du formulaire
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Gérer les champs imbriqués (comme contact.nom)
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
    
    // Marquer ce champ comme modifié
    setChangedFields(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Effacer l'erreur pour ce champ si elle existe
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }, [formErrors]);

  // Sélectionner une entité liée
  const handleSelectRelatedEntity = useCallback((entityName, entity) => {
    // Trouver la configuration de cette entité
    const entityConfig = relatedEntities.find(e => e.name === entityName);
    
    if (entityConfig) {
      // Mettre à jour l'ID dans les données du formulaire
      setFormData(prev => ({
        ...prev,
        [entityConfig.idField]: entity ? entity.id : null,
        ...(entityConfig.nameField && entity ? { [entityConfig.nameField]: entity.nom } : {})
      }));
      
      // Stocker l'entité complète dans relatedData
      setRelatedData(prev => ({
        ...prev,
        [entityName]: entity
      }));
    }
  }, [relatedEntities]);

  // Valider et soumettre le formulaire
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Valider le formulaire
      const validation = validateForm(formData);
      if (!validation.isValid) {
        setFormErrors(validation.errors || {});
        setError(validation.message || 'Le formulaire contient des erreurs.');
        setSubmitting(false);
        return;
      }
      
      // Transformer les données si nécessaire
      const transformedData = transformData(formData);
      
      // Ajouter les timestamps
      const dataToSave = {
        ...transformedData,
        updatedAt: Timestamp.now()
      };
      
      // Créer ou mettre à jour l'entité
      let savedEntityId = entityId;
      
      if (!entityId || entityId === 'nouveau') {
        // Création d'une nouvelle entité
        dataToSave.createdAt = Timestamp.now();
        const newDocRef = doc(collection(db, collectionName));
        await setDoc(newDocRef, dataToSave);
        savedEntityId = newDocRef.id;
      } else {
        // Mise à jour d'une entité existante
        await updateDoc(doc(db, collectionName, entityId), dataToSave);
      }
      
      // Appeler le callback onSuccess
      onSuccess(savedEntityId, dataToSave, initialEntityData);
      
      // Rediriger vers la page de détail de l'entité
      navigate(`/${entityType}/${savedEntityId}`);
      
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      setError(`Une erreur est survenue lors de l'enregistrement. ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }, [formData, entityId, collectionName, validateForm, transformData, onSuccess, navigate, initialEntityData, entityType]);

  // Réinitialiser le formulaire
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setChangedFields({});
    setFormErrors({});
  }, [initialData]);

  // Détecter les changements par rapport aux données initiales
  const hasChanges = useCallback(() => {
    return Object.keys(changedFields).length > 0;
  }, [changedFields]);

  return {
    formData,
    setFormData,
    loading,
    submitting,
    error,
    formErrors,
    handleChange,
    handleSubmit,
    resetForm,
    relatedData,
    handleSelectRelatedEntity,
    hasChanges,
    initialEntityData
  };
};

export default useGenericEntityForm;