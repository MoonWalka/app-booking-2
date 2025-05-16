import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/firebaseInit';
import { doc, getDoc, setDoc, updateDoc, collection, Timestamp } from '@/firebaseInit';
import { debugLog } from '@/utils/logUtils';

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
 * @param {Function} options.onError - Callback à exécuter après une erreur
 * @param {Function} options.generateId - Fonction pour générer un ID
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
  onError = () => {},
  generateId,
  relatedEntities = []
}) => {
  // Guard to avoid running fetch twice (e.g. in StrictMode)
  const hasFetchedRef = useRef(false);
  console.log("[useGenericEntityForm] Hook appelé. entityType:", entityType, "entityId:", entityId, 
    "mode:", entityId && entityId !== 'nouveau' ? 'édition' : 'création');
  console.log("[useGenericEntityForm] Valeur initiale de entityId:", entityId, "type:", typeof entityId);
  
  debugLog('Hook exécuté !', 'trace', 'useGenericEntityForm');
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(!!entityId && entityId !== 'nouveau');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [relatedData, setRelatedData] = useState({});
  const [changedFields, setChangedFields] = useState({});
  const [initialEntityData, setInitialEntityData] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const isNew = !entityId || entityId === 'nouveau';

  console.log("[useGenericEntityForm] État initial: isNew:", isNew, "loading:", loading, "initialData:", initialData);

  // Charger les données de l'entité et des entités liées
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    console.log("[useGenericEntityForm] useEffect [entityId, collectionName]. entityId:", entityId, 
      "isNew:", !entityId || entityId === 'nouveau');
      
    const fetchEntityData = async () => {
      if (!entityId || entityId === 'nouveau' || !collectionName) {
        console.log("[useGenericEntityForm] Pas de chargement de données - nouveau ou pas d'ID");
        return;
      }
      
      try {
        console.log("[useGenericEntityForm] Début du chargement des données pour entityId:", entityId);
        setLoading(true);
        
        // Charger les données principales de l'entité
        const entityRef = doc(db, collectionName, entityId);
        console.log("[useGenericEntityForm] Référence de document créée:", entityRef);
        
        const entityDoc = await getDoc(entityRef);
        console.log("[useGenericEntityForm] Document récupéré, existe:", entityDoc.exists());
        
        if (entityDoc.exists()) {
          const data = entityDoc.data();
          console.log("[useGenericEntityForm] Données d'entité chargées:", data);
          debugLog(`Données de ${entityType} chargées`, 'info', 'useGenericEntityForm', data);
          
          // Stocker les données initiales pour comparaison ultérieure
          setInitialEntityData(data);
          
          // Initialiser le formulaire avec les données chargées
          setFormData(prev => {
            console.log("[useGenericEntityForm] Mise à jour des données du formulaire avec:", data);
            return {
              ...prev,
              ...data
            };
          });
          
          // Charger les entités liées si nécessaire
          const relatedDataResults = {};
          
          for (const entity of relatedEntities) {
            console.log("[useGenericEntityForm] Chargement d'entité liée:", entity.name, "ID field:", entity.idField);
            if (data[entity.idField]) {
              try {
                console.log("[useGenericEntityForm] Chargement de", entity.name, "avec ID:", data[entity.idField]);
                const relatedRef = doc(db, entity.collection, data[entity.idField]);
                const relatedDoc = await getDoc(relatedRef);
                
                if (relatedDoc.exists()) {
                  relatedDataResults[entity.name] = {
                    id: data[entity.idField],
                    ...relatedDoc.data()
                  };
                  console.log("[useGenericEntityForm] Entité liée chargée:", entity.name, ":", relatedDataResults[entity.name]);
                } else {
                  console.log("[useGenericEntityForm] L'entité liée n'existe pas:", entity.name, "ID:", data[entity.idField]);
                }
              } catch (err) {
                console.error("[useGenericEntityForm] Erreur chargement entité liée:", err);
                debugLog(`Erreur lors du chargement de ${entity.name}`, 'error', 'useGenericEntityForm', err);
              }
            } else {
              console.log("[useGenericEntityForm] Pas d'ID pour l'entité liée:", entity.name);
            }
          }
          
          setRelatedData(relatedDataResults);
          console.log("[useGenericEntityForm] Données liées définies:", relatedDataResults);
        } else {
          console.error("[useGenericEntityForm] Entité non trouvée pour ID:", entityId);
          debugLog(`Le ${entityType} demandé n'existe pas`, 'error', 'useGenericEntityForm');
          setError(`Le ${entityType} demandé n'existe pas`);
          onError({ status: 404, message: 'Entité non trouvée' });
        }
      } catch (error) {
        console.error("[useGenericEntityForm] Erreur lors de la récupération:", error);
        debugLog(`Erreur lors de la récupération du ${entityType}`, 'error', 'useGenericEntityForm', error);
        setError(`Une erreur est survenue lors du chargement des données. (${error.message})`);
        onError(error);
      } finally {
        console.log("[useGenericEntityForm] Chargement terminé");
        setLoading(false);
      }
    };
    
    fetchEntityData();
  }, [entityId, collectionName, entityType, relatedEntities, onError]);

  // Gestionnaire de changement pour les champs du formulaire
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    console.log("[useGenericEntityForm] handleChange:", name, "=", value);
    
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

  // Fonction pour charger explicitement une entité liée
  const loadRelatedEntity = useCallback(async (entityName, entityId) => {
    console.log("[useGenericEntityForm] loadRelatedEntity appelé pour:", entityName, "ID:", entityId);
    
    if (!entityId) {
      console.log("[useGenericEntityForm] loadRelatedEntity - pas d'ID fourni");
      return;
    }
    
    // Trouver la configuration de cette entité
    const entityConfig = relatedEntities.find(e => e.name === entityName);
    if (!entityConfig) {
      console.error("[useGenericEntityForm] Configuration d'entité non trouvée pour:", entityName);
      return;
    }
    
    try {
      const relatedRef = doc(db, entityConfig.collection, entityId);
      const relatedDoc = await getDoc(relatedRef);
      
      if (relatedDoc.exists()) {
        const relatedData = {
          id: entityId,
          ...relatedDoc.data()
        };
        
        console.log("[useGenericEntityForm] Entité liée chargée:", entityName, ":", relatedData);
        
        // Mettre à jour relatedData avec la nouvelle entité
        setRelatedData(prev => ({
          ...prev,
          [entityName]: relatedData
        }));
        
        return relatedData;
      } else {
        console.log("[useGenericEntityForm] Entité liée non trouvée:", entityName, "ID:", entityId);
        return null;
      }
    } catch (error) {
      console.error("[useGenericEntityForm] Erreur lors du chargement de l'entité liée:", error);
      return null;
    }
  }, [relatedEntities]);

  // Sélectionner une entité liée
  const handleSelectRelatedEntity = useCallback((entityName, entity) => {
    console.log("[useGenericEntityForm] handleSelectRelatedEntity:", entityName, entity?.id);
    
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

  // Méthode pour mettre à jour les données du formulaire directement
  const updateFormData = useCallback((updaterFn) => {
    console.log("[useGenericEntityForm] updateFormData appelé");
    setFormData(updaterFn);
  }, []);

  // Valider et soumettre le formulaire
  const handleSubmit = useCallback(async (e) => {
    console.log("[useGenericEntityForm] handleSubmit START: entityId=", entityId, "isNew=", isNew);
    if (e) e.preventDefault();
    
    console.log("[useGenericEntityForm] handleSubmit appelé, entityId:", entityId, "isNew:", isNew);
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Valider le formulaire
      const validation = validateForm(formData);
      if (!validation.isValid) {
        setFormErrors(validation.errors || {});
        setError(validation.message || 'Le formulaire contient des erreurs.');
        debugLog('Validation du formulaire échouée', 'warn', 'useGenericEntityForm', validation.errors);
        console.log("[useGenericEntityForm] Validation échouée:", validation.errors);
        setSubmitting(false);
        return;
      }
      
      // Transformer les données si nécessaire
      const transformedData = transformData(formData);
      console.log("[useGenericEntityForm] Données transformées:", transformedData);
      
      // Ajouter les timestamps
      const dataToSave = {
        ...transformedData,
        updatedAt: Timestamp.now()
      };
      
      // Créer ou mettre à jour l'entité
      let savedEntityId = entityId;
      
      if (!entityId || entityId === 'nouveau') {
        // Création d'une nouvelle entité
        console.log("[useGenericEntityForm] Création d'une nouvelle entité");
        
        dataToSave.createdAt = Timestamp.now();
        
        // Utiliser un ID généré si disponible
        if (generateId) {
          try {
            savedEntityId = await generateId(dataToSave);
            console.log("[useGenericEntityForm] ID généré:", savedEntityId);
          } catch (err) {
            console.error("[useGenericEntityForm] Erreur lors de la génération d'ID:", err);
          }
        }
        
        // Si on a un ID généré, l'utiliser, sinon laisser Firestore en créer un
        if (savedEntityId && savedEntityId !== 'nouveau') {
          console.log("[useGenericEntityForm] Utilisation de l'ID généré:", savedEntityId);
          await setDoc(doc(db, collectionName, savedEntityId), dataToSave);
        } else {
          console.log("[useGenericEntityForm] Création d'une référence Firestore auto-générée");
          const newDocRef = doc(collection(db, collectionName));
          await setDoc(newDocRef, dataToSave);
          savedEntityId = newDocRef.id;
        }
        
        console.log("[useGenericEntityForm] Nouvelle entité créée avec ID:", savedEntityId);
        debugLog(`Nouvelle entité ${entityType} créée`, 'info', 'useGenericEntityForm', { id: savedEntityId });
      } else {
        // Mise à jour d'une entité existante
        console.log("[useGenericEntityForm] Mise à jour de l'entité existante, ID:", entityId);
        await updateDoc(doc(db, collectionName, entityId), dataToSave);
        debugLog(`Entité ${entityType} mise à jour`, 'info', 'useGenericEntityForm', { id: entityId });
      }
      
      // Appeler le callback onSuccess
      console.log("[useGenericEntityForm] handleSubmit SUCCESS before onSuccess");
      onSuccess(savedEntityId, dataToSave, initialEntityData);
      console.log("[useGenericEntityForm] onSuccess callback executed, no automatic navigate");
      
    } catch (error) {
      console.error("[useGenericEntityForm] handleSubmit ERROR:", error);
      debugLog('Erreur lors de la soumission du formulaire', 'error', 'useGenericEntityForm', error);
      setError(`Une erreur est survenue lors de l'enregistrement. ${error.message}`);
      onError(error);
    } finally {
      setSubmitting(false);
      console.log("[useGenericEntityForm] handleSubmit END: submitting reset to false");
    }
  }, [formData, entityId, isNew, collectionName, validateForm, transformData, onSuccess, onError, navigate, initialEntityData, entityType, generateId]);

  // Réinitialiser le formulaire
  const resetForm = useCallback(() => {
    console.log("[useGenericEntityForm] resetForm appelé");
    setFormData(initialData);
    setChangedFields({});
    setFormErrors({});
  }, [initialData]);

  // Détecter les changements par rapport aux données initiales
  const hasChanges = useCallback(() => {
    return Object.keys(changedFields).length > 0;
  }, [changedFields]);

  // Log avant de retourner l'état du hook
  console.log("[useGenericEntityForm] Retourne. formData:", formData, "entityId:", entityId, "isNew:", isNew,
    "loading:", loading, "error:", error, "relatedData:", relatedData);
  
  return {
    formData,
    setFormData,
    updateFormData,
    loading,
    submitting,
    error,
    formErrors,
    handleChange,
    handleSubmit,
    resetForm,
    relatedData,
    handleSelectRelatedEntity,
    loadRelatedEntity,
    hasChanges,
    initialEntityData,
    entityId,
    isNew
  };
};

export default useGenericEntityForm;