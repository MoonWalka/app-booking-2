import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase-service';

/**
 * Hook simple pour un contact - inspiré du pattern de ContactsList qui fonctionne
 * Utilise onSnapshot pour le temps réel, pas de cache complexe
 */
export const useContactDirect = (contactId) => {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(false); // Pas de loading initial
  const [error, setError] = useState(null);
  const [entityType, setEntityType] = useState(null);

  useEffect(() => {
    if (!contactId) {
      setContact(null);
      setLoading(false);
      setError('ID manquant');
      return;
    }

    console.log('🔄 [useContactDirect] Connexion temps réel pour:', contactId);
    
    const docRef = doc(db, 'contacts_unified', contactId);
    
    // TEMPS RÉEL avec onSnapshot (comme ContactsList)
    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          const data = { id: doc.id, ...doc.data() };
          
          // Déterminer le type d'entité
          const isStructure = !data.prenom || data.entityType === 'structure';
          setEntityType(isStructure ? 'structure' : 'contact');
          
          setContact(data);
          setError(null);
          console.log('✅ [useContactDirect] Contact mis à jour:', data.id);
        } else {
          setContact(null);
          setError('Contact non trouvé');
          console.log('❌ [useContactDirect] Contact introuvable:', contactId);
        }
        setLoading(false);
      },
      (err) => {
        console.error('❌ [useContactDirect] Erreur:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Cleanup : déconnexion du listener temps réel
    return () => {
      console.log('🔌 [useContactDirect] Déconnexion temps réel pour:', contactId);
      unsubscribe();
    };
  }, [contactId]); // UNE SEULE dépendance stable

  return { 
    contact, 
    loading, 
    error, 
    entityType 
  };
};