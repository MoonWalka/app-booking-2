import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, getDoc, doc } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';

/**
 * Hook to validate a form token and fetch related concert data
 * Used in public form access scenarios
 */
export const useFormTokenValidation = (concertId, token) => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const [formLinkId, setFormLinkId] = useState(null);
  const [concert, setConcert] = useState(null);
  const [lieu, setLieu] = useState(null);
  const [error, setError] = useState(null);
  const [expired, setExpired] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    // Skip if no concertId or token
    if (!concertId || !token) {
      setError("Lien de formulaire invalide. Il manque des paramètres nécessaires.");
      setLoading(false);
      return;
    }

    const validateToken = async () => {
      setLoading(true);
      try {
        console.log("Validation du token:", token, "pour le concert:", concertId);
        
        // Vérifier si le token existe dans la collection formLinks
        const formsQuery = query(
          collection(db, 'formLinks'),
          where('token', '==', token),
          where('concertId', '==', concertId)
        );
        
        const formsSnapshot = await getDocs(formsQuery);
        
        if (formsSnapshot.empty) {
          console.error("Token non trouvé dans formLinks");
          setError('Formulaire non trouvé. Le lien est peut-être incorrect.');
          setLoading(false);
          return;
        }
        
        const formDoc = formsSnapshot.docs[0];
        const formLinkData = formDoc.data();
        setFormData(formLinkData);
        setFormLinkId(formDoc.id);
        
        console.log("Données du lien trouvées:", formLinkData);
        
        // Vérifier si le formulaire est déjà complété
        if (formLinkData.completed) {
          console.log("Formulaire déjà complété");
          setCompleted(true);
          setLoading(false);
          return;
        }
        
        // Vérifier si le token n'est pas expiré
        const now = new Date();
        const expiryDate = formLinkData.expiryDate ? formLinkData.expiryDate.toDate() : null;
        
        if (expiryDate && now > expiryDate) {
          console.log("Lien expiré:", expiryDate);
          setExpired(true);
          setLoading(false);
          return;
        }
        
        console.log("Récupération des données du concert:", concertId);
        
        // Récupérer les données du concert
        const concertDoc = await getDoc(doc(db, 'concerts', concertId));
        if (concertDoc.exists()) {
          const concertData = concertDoc.data();
          setConcert(concertData);
          
          console.log("Concert trouvé:", concertData);
          
          // Récupérer les données du lieu
          if (concertData.lieuId) {
            const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
            if (lieuDoc.exists()) {
              const lieuData = lieuDoc.data();
              setLieu(lieuData);
              console.log("Lieu trouvé:", lieuData);
            } else {
              console.log("Lieu non trouvé:", concertData.lieuId);
            }
          }
        } else {
          console.error("Concert non trouvé:", concertId);
          setError("Le concert associé à ce formulaire n'existe pas ou a été supprimé.");
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Erreur lors de la validation du token:', error);
        setError(`Une erreur est survenue lors du chargement du formulaire: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [concertId, token]);

  // Function to toggle completed state (used when user wants to edit after completion)
  const toggleCompleted = (value) => setCompleted(value);

  return {
    loading,
    formData,
    formLinkId,
    concert,
    lieu,
    error,
    expired,
    completed,
    toggleCompleted
  };
};

export default useFormTokenValidation;