import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebase';
import LieuForm from '../forms/LieuForm';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc
} from 'firebase/firestore';

const ConcertForm = () => {
  const { id } = useParams(); // Récupérer l'ID de la route
  const navigate = useNavigate();
  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(!!id); // Si on a un ID, on charge des données
  const [isSubmitting, setIsSubmitting] = useState(false);
  // ...reste des états...
  
  const [formData, setFormData] = useState({
    date: '',
    montant: '',
    statut: 'En attente',
    lieuId: '',
    lieuNom: '',
    lieuAdresse: '',
    lieuCodePostal: '',
    lieuVille: '',
    lieuCapacite: '',
    programmateurId: '',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les lieux et programmateurs comme avant...
        
        // Si on a un ID, charger le concert
        if (id && id !== 'nouveau') {
          const concertRef = doc(db, 'concerts', id);
          const concertDoc = await getDoc(concertRef);
          if (concertDoc.exists()) {
            const concertData = concertDoc.data();
            setConcert({ id, ...concertData });
            setFormData({
              date: concertData.date || '',
              montant: concertData.montant || '',
              statut: concertData.statut || 'En attente',
              lieuId: concertData.lieuId || '',
              lieuNom: concertData.lieuNom || '',
              lieuAdresse: concertData.lieuAdresse || '',
              lieuCodePostal: concertData.lieuCodePostal || '',
              lieuVille: concertData.lieuVille || '',
              lieuCapacite: concertData.lieuCapacite || '',
              programmateurId: concertData.programmateurId || '',
              notes: concertData.notes || ''
            });
          } else {
            console.error('Concert non trouvé');
            navigate('/concerts');
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id, navigate]);

  // ...reste du code...

  if (loading) {
    return <div>Chargement du concert...</div>;
  }

  // ...reste du code...

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <h2>{id && id !== 'nouveau' ? 'Modifier le concert' : 'Ajouter un concert'}</h2>
      </div>
      
      {/* ...reste du formulaire... */}
      
      <div className="d-flex justify-content-between">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/concerts')}
          disabled={isSubmitting}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enregistrement...' : id && id !== 'nouveau' ? 'Enregistrer les modifications' : 'Créer le concert'}
        </button>
      </div>
    </form>
  );
};

export default ConcertForm;
