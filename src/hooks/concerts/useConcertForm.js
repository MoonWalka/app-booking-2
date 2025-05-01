import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseInit';

/**
 * Hook personnalisé pour gérer les états du formulaire de concert
 * 
 * @param {string} id - Identifiant du concert (ou 'nouveau' pour un nouveau concert)
 * @returns {Object} États et fonctions pour gérer le formulaire de concert
 */
const useConcertForm = (id) => {
  // État de chargement
  const [loading, setLoading] = useState(!!id && id !== 'nouveau');
  
  // États du formulaire
  const [formData, setFormData] = useState({
    date: '',
    montant: '',
    statut: 'En attente',
    titre: '',
    notes: ''
  });
  
  // Entités sélectionnées
  const [selectedLieu, setSelectedLieu] = useState(null);
  const [selectedProgrammateur, setSelectedProgrammateur] = useState(null);
  const [selectedArtiste, setSelectedArtiste] = useState(null);
  
  // IDs des entités initiales pour gérer les mises à jour des associations
  const [initialProgrammateurId, setInitialProgrammateurId] = useState(null);
  const [initialArtisteId, setInitialArtisteId] = useState(null);

  // Charger les données du concert si on est en mode édition
  useEffect(() => {
    const fetchConcertData = async () => {
      try {
        if (id && id !== 'nouveau') {
          console.log('Chargement du concert:', id);
          const concertRef = doc(db, 'concerts', id);
          const concertDoc = await getDoc(concertRef);
          
          if (concertDoc.exists()) {
            const concertData = concertDoc.data();
            console.log('Données du concert chargées:', concertData);
            
            // Stocker les IDs initiaux pour gérer les associations
            if (concertData.programmateurId) {
              setInitialProgrammateurId(concertData.programmateurId);
            }
            if (concertData.artisteId) {
              setInitialArtisteId(concertData.artisteId);
            }
            
            // Charger les entités associées
            if (concertData.lieuId) {
              try {
                const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
                if (lieuDoc.exists()) {
                  setSelectedLieu({
                    id: concertData.lieuId,
                    ...lieuDoc.data()
                  });
                }
              } catch (error) {
                console.error('Erreur lors de la récupération du lieu:', error);
              }
            }
            
            if (concertData.programmateurId) {
              try {
                const progDoc = await getDoc(doc(db, 'programmateurs', concertData.programmateurId));
                if (progDoc.exists()) {
                  setSelectedProgrammateur({
                    id: concertData.programmateurId,
                    ...progDoc.data()
                  });
                }
              } catch (error) {
                console.error('Erreur lors de la récupération du programmateur:', error);
              }
            }
            
            if (concertData.artisteId) {
              try {
                const artisteDoc = await getDoc(doc(db, 'artistes', concertData.artisteId));
                if (artisteDoc.exists()) {
                  setSelectedArtiste({
                    id: concertData.artisteId,
                    ...artisteDoc.data()
                  });
                }
              } catch (error) {
                console.error('Erreur lors de la récupération de l\'artiste:', error);
              }
            }
            
            // Initialiser le formulaire avec les données du concert
            setFormData({
              date: concertData.date || '',
              montant: concertData.montant || '',
              statut: concertData.statut || 'En attente',
              titre: concertData.titre || '',
              notes: concertData.notes || ''
            });
          } else {
            console.error('Le concert demandé n\'existe pas');
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du concert:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConcertData();
  }, [id]);
  
  // Gestionnaire de changement pour les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  return {
    loading,
    formData,
    setFormData,
    handleChange,
    selectedLieu,
    setSelectedLieu,
    selectedProgrammateur,
    setSelectedProgrammateur,
    selectedArtiste,
    setSelectedArtiste,
    initialProgrammateurId,
    initialArtisteId
  };
};

export default useConcertForm;
