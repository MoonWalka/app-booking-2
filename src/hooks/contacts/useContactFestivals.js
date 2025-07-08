import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useEntreprise } from '@/context/EntrepriseContext';

/**
 * Hook pour récupérer les festivals d'un contact/structure
 * @param {string} contactId - ID du contact/structure
 * @returns {Object} { festivals, loading, error }
 */
export const useContactFestivals = (contactId) => {
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentEntreprise } = useEntreprise();

  useEffect(() => {
    if (!contactId || !currentEntreprise?.id) {
      setFestivals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    console.log('[useContactFestivals] Recherche des festivals pour:', {
      contactId,
      entrepriseId: currentEntreprise.id
    });

    try {
      // Requête pour récupérer les festivals du contact
      const festivalsQuery = query(
        collection(db, 'festivals'),
        where('entrepriseId', '==', currentEntreprise.id),
        where('contactId', '==', contactId),
        orderBy('createdAt', 'desc')
      );

      // Écoute en temps réel des changements
      const unsubscribe = onSnapshot(
        festivalsQuery,
        (snapshot) => {
          const festivalsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          console.log(`[useContactFestivals] ${festivalsData.length} festivals trouvés pour le contact ${contactId}`);
          setFestivals(festivalsData);
          setLoading(false);
        },
        (err) => {
          console.error('[useContactFestivals] Erreur lors de la récupération des festivals:', err);
          console.error('[useContactFestivals] Détail de l\'erreur:', {
            code: err.code,
            message: err.message,
            details: err
          });
          
          // Si c'est une erreur d'index, afficher un message spécifique
          if (err.code === 'failed-precondition' && err.message.includes('index')) {
            console.error('[useContactFestivals] Index Firestore manquant. Créez l\'index en suivant le lien dans la console.');
          }
          
          setError(err);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('[useContactFestivals] Erreur lors de la configuration de la requête:', err);
      setError(err);
      setLoading(false);
    }
  }, [contactId, currentEntreprise?.id]);

  return { festivals, loading, error };
};