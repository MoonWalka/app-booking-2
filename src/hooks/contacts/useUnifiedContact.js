// src/hooks/contacts/useUnifiedContact.js
import { useState, useEffect } from 'react';
import { doc, getDoc } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';

/**
 * Hook pour charger un contact depuis la collection unifiée contacts_unified
 * Compatible avec les documents structure et personne_libre
 */
export const useUnifiedContact = (contactId) => {
  const [data, setData] = useState({
    contact: null,
    loading: true,
    error: null,
    entityType: null
  });

  useEffect(() => {
    if (!contactId) {
      setData({
        contact: null,
        loading: false,
        error: 'ID manquant',
        entityType: null
      });
      return;
    }

    const loadUnifiedContact = async () => {
      console.log('🔄 [useUnifiedContact] Chargement ID:', contactId);
      
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        // Charger depuis contacts_unified
        const docRef = doc(db, 'contacts_unified', contactId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const unifiedData = { id: docSnap.id, ...docSnap.data() };
          
          console.log('✅ [useUnifiedContact] Document trouvé:', {
            id: unifiedData.id,
            entityType: unifiedData.entityType,
            structureName: unifiedData.structure?.raisonSociale,
            personnesCount: unifiedData.personnes?.length || 0
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
      }
    };

    loadUnifiedContact();
  }, [contactId]);

  return data;
};