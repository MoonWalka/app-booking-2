import { useState, useEffect } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/firebaseInit';

/**
 * Hook to fetch and validate form submissions as an admin
 */
export const useAdminFormValidation = (submissionId) => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const [concert, setConcert] = useState(null);
  const [lieu, setLieu] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!submissionId) {
      setError("ID de soumission manquant");
      setLoading(false);
      return;
    }

    const fetchFormSubmission = async () => {
      try {
        setLoading(true);
        
        // Récupérer les données de la soumission
        const submissionDoc = await getDoc(doc(db, 'formSubmissions', submissionId));
        if (submissionDoc.exists()) {
          const submissionData = submissionDoc.data();
          setFormData(submissionData);
          
          // Récupérer le concert associé
          if (submissionData.concertId) {
            const concertDoc = await getDoc(doc(db, 'concerts', submissionData.concertId));
            if (concertDoc.exists()) {
              const concertData = concertDoc.data();
              setConcert(concertData);
              
              // Récupérer le lieu si nécessaire
              if (concertData.lieuId) {
                const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
                if (lieuDoc.exists()) {
                  setLieu(lieuDoc.data());
                }
              }
            }
          }
        } else {
          setError("La soumission demandée n'existe pas.");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la soumission:", error);
        setError("Impossible de charger les données de la soumission.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchFormSubmission();
  }, [submissionId]);

  return {
    loading,
    formData,
    concert,
    lieu,
    error
  };
};

export default useAdminFormValidation;