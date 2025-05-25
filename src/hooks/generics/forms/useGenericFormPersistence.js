/**
 * @fileoverview Hook générique pour la persistance de formulaires
 * Hook générique créé lors de la Phase 2 de généralisation - Semaine 3
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 2 - Généralisation - Semaine 3
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';

/**
 * Hook générique pour la persistance de formulaires
 * 
 * @description
 * Fonctionnalités supportées :
 * - auto_save: Sauvegarde automatique avec debounce
 * - version_management: Gestion des versions et historique
 * - recovery: Récupération après crash/fermeture
 * - storage_strategies: Différentes stratégies de stockage
 * 
 * @param {Object} persistenceConfig - Configuration de la persistance
 * @param {string} persistenceConfig.key - Clé unique pour le stockage
 * @param {Object} persistenceConfig.initialData - Données initiales
 * @param {Function} persistenceConfig.onSave - Callback de sauvegarde
 * @param {Function} persistenceConfig.onRestore - Callback de restauration
 * @param {Function} persistenceConfig.onError - Callback d'erreur
 * 
 * @param {Object} options - Options de persistance
 * @param {boolean} options.enableAutoSave - Activer la sauvegarde automatique
 * @param {number} options.autoSaveDelay - Délai de sauvegarde automatique (ms)
 * @param {string} options.storageType - Type de stockage ('localStorage', 'sessionStorage', 'indexedDB')
 * @param {boolean} options.enableVersioning - Activer la gestion des versions
 * @param {number} options.maxVersions - Nombre maximum de versions à conserver
 * @param {boolean} options.enableCompression - Activer la compression des données
 * 
 * @returns {Object} Interface du hook générique
 * @returns {Object} returns.persistedData - Données persistées
 * @returns {Function} returns.saveData - Sauvegarder manuellement
 * @returns {Function} returns.restoreData - Restaurer des données
 * @returns {Function} returns.clearStorage - Effacer le stockage
 * @returns {Function} returns.getVersions - Obtenir les versions disponibles
 * @returns {Function} returns.restoreVersion - Restaurer une version spécifique
 * @returns {string} returns.saveStatus - Statut de sauvegarde
 * @returns {boolean} returns.hasUnsavedChanges - Changements non sauvegardés
 * @returns {Date} returns.lastSaved - Dernière sauvegarde
 * 
 * @example
 * ```javascript
 * // Persistance simple
 * const {
 *   persistedData,
 *   saveData,
 *   saveStatus,
 *   hasUnsavedChanges
 * } = useGenericFormPersistence({
 *   key: 'concert-form',
 *   initialData: formData,
 *   onSave: (data) => console.log('Sauvegardé:', data)
 * }, {
 *   enableAutoSave: true,
 *   autoSaveDelay: 2000
 * });
 * 
 * // Persistance avec versions
 * const {
 *   persistedData,
 *   getVersions,
 *   restoreVersion,
 *   saveStatus
 * } = useGenericFormPersistence({
 *   key: 'complex-form',
 *   initialData: complexData
 * }, {
 *   enableVersioning: true,
 *   maxVersions: 10,
 *   storageType: 'indexedDB'
 * });
 * ```
 * 
 * @complexity HIGH
 * @businessCritical true
 * @generic true
 * @replaces auto-save implementations, form persistence logic
 */
const useGenericFormPersistence = (persistenceConfig = {}, options = {}) => {
  const {
    key,
    initialData = {},
    onSave,
    onRestore,
    onError,
    validateData = null
  } = persistenceConfig;
  
  const {
    enableAutoSave = true,
    autoSaveDelay = 3000,
    storageType = 'localStorage',
    enableVersioning = false,
    maxVersions = 5,
    enableCompression = false,
    enableEncryption = false,
    enableConflictResolution = false
  } = options;
  
  // États de persistance
  const [persistedData, setPersistedData] = useState(initialData);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [versions, setVersions] = useState([]);
  const [storageError, setStorageError] = useState(null);
  
  // Références
  const autoSaveTimeoutRef = useRef(null);
  const lastDataRef = useRef(initialData);
  const saveCounterRef = useRef(0);
  
  // Utilitaires de stockage
  const storageUtils = useMemo(() => ({
    // Compression des données
    compress: (data) => {
      if (!enableCompression) return data;
      try {
        return btoa(JSON.stringify(data));
      } catch (error) {
        console.warn('⚠️ Erreur compression:', error);
        return data;
      }
    },
    
    // Décompression des données
    decompress: (data) => {
      if (!enableCompression || typeof data !== 'string') return data;
      try {
        return JSON.parse(atob(data));
      } catch (error) {
        console.warn('⚠️ Erreur décompression:', error);
        return data;
      }
    },
    
    // Chiffrement simple (pour demo - utiliser une vraie lib en prod)
    encrypt: (data) => {
      if (!enableEncryption) return data;
      // Implémentation basique - remplacer par une vraie solution
      return btoa(JSON.stringify(data));
    },
    
    // Déchiffrement
    decrypt: (data) => {
      if (!enableEncryption || typeof data !== 'string') return data;
      try {
        return JSON.parse(atob(data));
      } catch (error) {
        console.warn('⚠️ Erreur déchiffrement:', error);
        return data;
      }
    }
  }), [enableCompression, enableEncryption]);
  
  // Obtenir l'interface de stockage
  const getStorage = useCallback(() => {
    switch (storageType) {
      case 'sessionStorage':
        return sessionStorage;
      case 'localStorage':
        return localStorage;
      case 'indexedDB':
        // Pour IndexedDB, on utiliserait une implémentation plus complexe
        console.warn('IndexedDB non implémenté, utilisation de localStorage');
        return localStorage;
      default:
        return localStorage;
    }
  }, [storageType]);
  
  // Générer une clé de stockage
  const getStorageKey = useCallback((suffix = '') => {
    return `form_persistence_${key}${suffix}`;
  }, [key]);
  
  // Sauvegarder les données
  const saveData = useCallback(async (data = persistedData, options = {}) => {
    if (!key) {
      console.warn('⚠️ Clé de persistance manquante');
      return false;
    }
    
    setSaveStatus('saving');
    setStorageError(null);
    
    try {
      // Validation des données
      if (validateData && typeof validateData === 'function') {
        const isValid = validateData(data);
        if (!isValid) {
          throw new Error('Données invalides pour la sauvegarde');
        }
      }
      
      // Préparer les métadonnées
      const saveMetadata = {
        timestamp: new Date().toISOString(),
        version: saveCounterRef.current++,
        dataSize: JSON.stringify(data).length,
        userAgent: navigator.userAgent,
        ...options.metadata
      };
      
      // Préparer l'objet de sauvegarde
      const saveObject = {
        data: storageUtils.encrypt(storageUtils.compress(data)),
        metadata: saveMetadata
      };
      
      const storage = getStorage();
      const storageKey = getStorageKey();
      
      // Sauvegarder les données principales
      storage.setItem(storageKey, JSON.stringify(saveObject));
      
      // Gestion des versions
      if (enableVersioning) {
        const versionKey = getStorageKey(`_version_${saveMetadata.version}`);
        storage.setItem(versionKey, JSON.stringify(saveObject));
        
        // Mettre à jour la liste des versions
        const versionsKey = getStorageKey('_versions');
        const existingVersions = JSON.parse(storage.getItem(versionsKey) || '[]');
        const newVersions = [...existingVersions, saveMetadata].slice(-maxVersions);
        storage.setItem(versionsKey, JSON.stringify(newVersions));
        setVersions(newVersions);
      }
      
      // Mettre à jour les états
      setPersistedData(data);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      setSaveStatus('saved');
      lastDataRef.current = data;
      
      // Callback de sauvegarde
      if (onSave) {
        onSave(data, saveMetadata);
      }
      
      console.log('💾 Données sauvegardées:', storageKey);
      return true;
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      setStorageError(error.message);
      setSaveStatus('error');
      
      if (onError) {
        onError(error, 'save');
      }
      
      return false;
    }
  }, [persistedData, key, validateData, storageUtils, getStorage, getStorageKey, enableVersioning, maxVersions, onSave, onError]);
  
  // Restaurer les données
  const restoreData = useCallback(async (storageKey = null) => {
    if (!key && !storageKey) {
      console.warn('⚠️ Clé de persistance manquante');
      return null;
    }
    
    try {
      const storage = getStorage();
      const keyToUse = storageKey || getStorageKey();
      const savedData = storage.getItem(keyToUse);
      
      if (!savedData) {
        console.log('ℹ️ Aucune donnée sauvegardée trouvée');
        return null;
      }
      
      const saveObject = JSON.parse(savedData);
      const restoredData = storageUtils.decrypt(storageUtils.decompress(saveObject.data));
      
      // Validation des données restaurées
      if (validateData && typeof validateData === 'function') {
        const isValid = validateData(restoredData);
        if (!isValid) {
          throw new Error('Données restaurées invalides');
        }
      }
      
      setPersistedData(restoredData);
      setHasUnsavedChanges(false);
      setLastSaved(new Date(saveObject.metadata.timestamp));
      lastDataRef.current = restoredData;
      
      // Callback de restauration
      if (onRestore) {
        onRestore(restoredData, saveObject.metadata);
      }
      
      console.log('📥 Données restaurées:', keyToUse);
      return restoredData;
      
    } catch (error) {
      console.error('❌ Erreur restauration:', error);
      setStorageError(error.message);
      
      if (onError) {
        onError(error, 'restore');
      }
      
      return null;
    }
  }, [key, getStorage, getStorageKey, storageUtils, validateData, onRestore, onError]);
  
  // Obtenir les versions disponibles
  const getVersions = useCallback(() => {
    if (!enableVersioning || !key) return [];
    
    try {
      const storage = getStorage();
      const versionsKey = getStorageKey('_versions');
      const versionsData = storage.getItem(versionsKey);
      
      if (versionsData) {
        const versionsList = JSON.parse(versionsData);
        setVersions(versionsList);
        return versionsList;
      }
      
      return [];
    } catch (error) {
      console.error('❌ Erreur récupération versions:', error);
      return [];
    }
  }, [enableVersioning, key, getStorage, getStorageKey]);
  
  // Restaurer une version spécifique
  const restoreVersion = useCallback(async (version) => {
    if (!enableVersioning || !key) return null;
    
    const versionKey = getStorageKey(`_version_${version}`);
    return await restoreData(versionKey);
  }, [enableVersioning, key, getStorageKey, restoreData]);
  
  // Effacer le stockage
  const clearStorage = useCallback(() => {
    if (!key) return;
    
    try {
      const storage = getStorage();
      
      // Effacer les données principales
      storage.removeItem(getStorageKey());
      
      // Effacer les versions
      if (enableVersioning) {
        const versionsKey = getStorageKey('_versions');
        const versionsData = storage.getItem(versionsKey);
        
        if (versionsData) {
          const versionsList = JSON.parse(versionsData);
          versionsList.forEach(version => {
            storage.removeItem(getStorageKey(`_version_${version.version}`));
          });
          storage.removeItem(versionsKey);
        }
      }
      
      // Réinitialiser les états
      setPersistedData(initialData);
      setHasUnsavedChanges(false);
      setLastSaved(null);
      setVersions([]);
      setStorageError(null);
      setSaveStatus('idle');
      lastDataRef.current = initialData;
      
      console.log('🗑️ Stockage effacé');
    } catch (error) {
      console.error('❌ Erreur effacement stockage:', error);
      setStorageError(error.message);
    }
  }, [key, getStorage, getStorageKey, enableVersioning, initialData]);
  
  // Auto-save avec debounce
  const triggerAutoSave = useCallback((data) => {
    if (!enableAutoSave) return;
    
    // Annuler le timeout précédent
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Vérifier s'il y a des changements
    const hasChanges = JSON.stringify(data) !== JSON.stringify(lastDataRef.current);
    if (!hasChanges) return;
    
    setHasUnsavedChanges(true);
    
    // Programmer la sauvegarde
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveData(data);
    }, autoSaveDelay);
  }, [enableAutoSave, autoSaveDelay, saveData]);
  
  // Mettre à jour les données avec auto-save
  const updateData = useCallback((newData) => {
    setPersistedData(newData);
    triggerAutoSave(newData);
  }, [triggerAutoSave]);
  
  // Chargement initial
  useEffect(() => {
    if (key) {
      restoreData();
      if (enableVersioning) {
        getVersions();
      }
    }
  }, [key, restoreData, enableVersioning, getVersions]);
  
  // Sauvegarde avant fermeture de page
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (hasUnsavedChanges && enableAutoSave) {
        // Sauvegarde synchrone avant fermeture
        saveData(persistedData);
        
        // Afficher un avertissement
        event.preventDefault();
        event.returnValue = 'Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter ?';
        return event.returnValue;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Nettoyage du timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, enableAutoSave, saveData, persistedData]);
  
  // Détection de conflits (si plusieurs onglets)
  useEffect(() => {
    if (!enableConflictResolution || !key) return;
    
    const handleStorageChange = (event) => {
      if (event.key === getStorageKey() && event.newValue) {
        console.warn('⚠️ Conflit détecté - données modifiées dans un autre onglet');
        // Ici on pourrait implémenter une résolution de conflit
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [enableConflictResolution, key, getStorageKey]);
  
  return {
    // Données
    persistedData,
    updateData,
    
    // Actions
    saveData,
    restoreData,
    clearStorage,
    
    // Versions
    getVersions,
    restoreVersion,
    versions,
    
    // États
    saveStatus,
    hasUnsavedChanges,
    lastSaved,
    storageError,
    
    // Utilitaires
    triggerAutoSave,
    isAutoSaveEnabled: enableAutoSave,
    storageType,
    
    // Statistiques
    stats: {
      saveCount: saveCounterRef.current,
      dataSize: JSON.stringify(persistedData).length,
      versionsCount: versions.length,
      lastSavedTimestamp: lastSaved?.getTime(),
      hasStorageSupport: !!getStorage()
    }
  };
};

export default useGenericFormPersistence; 