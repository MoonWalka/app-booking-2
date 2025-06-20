// src/hooks/contacts/useUnifiedContact.js
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { doc, getDoc } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';

// Cache simple en mémoire pour éviter les rechargements inutiles
const contactCache = new Map();
const CACHE_DURATION = 30000; // 30 secondes

/**
 * Hook optimisé pour charger un contact depuis la collection unifiée contacts_unified
 * Compatible avec les documents structure et personne_libre
 * Inclut un système de cache pour éviter les rechargements excessifs
 */
export const useUnifiedContact = (contactId) => {
  const [data, setData] = useState({
    contact: null,
    loading: true,
    error: null,
    entityType: null
  });
  
  // Ref pour éviter les appels multiples simultanés
  const loadingRef = useRef(false);
  const lastContactIdRef = useRef(null);

  const loadUnifiedContact = useCallback(async (forceReload = false) => {
    if (!contactId) {
      setData({
        contact: null,
        loading: false,
        error: 'ID manquant',
        entityType: null
      });
      return;
    }

    // Éviter les appels multiples simultanés
    if (loadingRef.current && !forceReload) {
      console.log('⏳ [useUnifiedContact] Chargement déjà en cours, ignoré');
      return;
    }

    // Vérifier le cache d'abord
    if (!forceReload) {
      const cached = contactCache.get(contactId);
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        console.log('💾 [useUnifiedContact] Utilisation du cache pour:', contactId);
        setData({
          contact: cached.data,
          loading: false,
          error: null,
          entityType: cached.data.entityType
        });
        return;
      }
    }

    console.log('🔄 [useUnifiedContact] Chargement ID:', contactId, forceReload ? '(forcé)' : '');
    
    try {
      loadingRef.current = true;
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Charger depuis contacts_unified
      const docRef = doc(db, 'contacts_unified', contactId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const unifiedData = { id: docSnap.id, ...docSnap.data() };
        
        // Mettre en cache
        contactCache.set(contactId, {
          data: unifiedData,
          timestamp: Date.now()
        });
        
        console.log('✅ [useUnifiedContact] Document trouvé et mis en cache:', {
          id: unifiedData.id,
          entityType: unifiedData.entityType,
          structureName: unifiedData.structure?.raisonSociale,
          personnesCount: unifiedData.personnes?.length || 0,
          tags: unifiedData.qualification?.tags?.length || 0
        });

        setData({
          contact: unifiedData,
          loading: false,
          error: null,
          entityType: unifiedData.entityType
        });
      } else {
        console.warn('⚠️ [useUnifiedContact] Document non trouvé:', contactId);
        setData({
          contact: null,
          loading: false,
          error: 'Contact non trouvé dans la collection unifiée',
          entityType: null
        });
      }
    } catch (error) {
      console.error('❌ [useUnifiedContact] Erreur:', error);
      setData({
        contact: null,
        loading: false,
        error: error.message,
        entityType: null
      });
    } finally {
      loadingRef.current = false;
    }
  }, [contactId]);

  // Charger seulement si l'ID change réellement
  useEffect(() => {
    if (lastContactIdRef.current !== contactId) {
      lastContactIdRef.current = contactId;
      loadUnifiedContact();
    }
  }, [contactId, loadUnifiedContact]);

  const reload = useCallback(() => {
    console.log('🔄 [useUnifiedContact] Rechargement forcé demandé');
    loadUnifiedContact(true);
  }, [loadUnifiedContact]);

  // Fonction pour invalider le cache
  const invalidateCache = useCallback(() => {
    if (contactId) {
      contactCache.delete(contactId);
      console.log('🗑️ [useUnifiedContact] Cache invalidé pour:', contactId);
    }
  }, [contactId]);

  // Mémoriser le résultat pour éviter les re-renders inutiles
  const result = useMemo(() => ({
    contact: data.contact,
    loading: data.loading,
    error: data.error,
    entityType: data.entityType,
    reload,
    invalidateCache
  }), [data.contact, data.loading, data.error, data.entityType, reload, invalidateCache]);

  return result;
};

// Fonction utilitaire pour nettoyer le cache
export const clearContactCache = () => {
  contactCache.clear();
  console.log('🧹 [useUnifiedContact] Cache entièrement nettoyé');
};