import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Ajout de useParams
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
  const [loading, setLoading] = useState(!!id && id !== 'nouveau');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lieux, setLieux] = useState([]);
  const [programmateurs, setProgrammateurs] = useState([]);
  const [showLieuForm, setShowLieuForm] = useState(false);
  const [newLieu, setNewLieu] = useState(null);
  
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
        // Récupérer les lieux
        const lieuxRef = collection(db, 'lieux');
        const lieuxSnapshot = await getDocs(lieuxRef);
        const lieuxData = lieuxSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLieux(lieuxData);
  
        // Récupérer les programmateurs
        const progsRef = collection(db, 'programmateurs');
        const programmateursSnapshot = await getDocs(progsRef);
        const programmateursData = programmateursSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProgrammateurs(programmateursData);
  
        // Si c'est une modification, récupérer les détails du concert
        if (id && id !== 'nouveau') {
          const concertRef = doc(db, 'concerts', id);
          const concertDoc = await getDoc(concertRef);
          if (concertDoc.exists()) {
            const concertData = concertDoc.data();
            setFormData({
              ...concertData,
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Si on sélectionne un lieu, mettre à jour les informations du lieu
    if (name === 'lieuId' && value) {
      const selectedLieu = lieux.find(lieu => lieu.id === value);
      if (selectedLieu) {
        setFormData(prev => ({
          ...prev,
          lieuId: selectedLieu.id,
          lieuNom: selectedLieu.nom,
          lieuAdresse: selectedLieu.adresse,
          lieuCodePostal: selectedLieu.codePostal,
          lieuVille: selectedLieu.ville,
          lieuCapacite: selectedLieu.capacite
        }));
      }
    }
  };

  const handleLieuCreated = (lieu) => {
    // Ajouter le nouveau lieu à la liste
    const newLieuWithId = { ...lieu, id: newLieu.id };
    setLieux([...lieux, newLieuWithId]);
    
    // Mettre à jour le formulaire avec le nouveau lieu
    setFormData({
      ...formData,
      lieuId: newLieu.id,
      lieuNom: lieu.nom,
      lieuAdresse: lieu.adresse,
      lieuCodePostal: lieu.codePostal,
      lieuVille: lieu.ville,
      lieuCapacite: lieu.capacite
    });
    
    // Fermer le formulaire de lieu
    setShowLieuForm(false);
  };

  const handleCreateLieu = async () => {
    try {
      // Créer un document vide avec un ID généré
      const newLieuRef = doc(collection(db, 'lieux'));
      await setDoc(newLieuRef, {
        nom: 'Nouveau lieu',
        createdAt: new Date().toISOString()
      });
  
      setNewLieu({ id: newLieuRef.id });
      setShowLieuForm(true);
    } catch (error) {
      console.error('Erreur lors de la création du lieu:', error);
      alert('Une erreur est survenue lors de la création du lieu.');
    }
  };

  // Assurez-vous que cette fonction existe et est correctement définie
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      // Vérifier que les champs obligatoires sont remplis
      if (!formData.date || !formData.montant || !formData.lieuId) {
        alert('Veuillez remplir tous les champs obligatoires.');
        setIsSubmitting(false);
        return;
      }
  
      // Correction du format de date - s'assurer que la date est au format YYYY-MM-DD
      let correctedDate = formData.date;
      if (formData.date.includes('/')) {
        const dateParts = formData.date.split('/');
        if (dateParts.length === 3) {
          correctedDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
        }
      }
  
      console.log('Date corrigée:', correctedDate);
  
      const concertData = {
        date: correctedDate,
        montant: formData.montant,
        statut: formData.statut,
        lieuId: formData.lieuId,
        lieuNom: formData.lieuNom,
        lieuAdresse: formData.lieuAdresse,
        lieuCodePostal: formData.lieuCodePostal,
        lieuVille: formData.lieuVille,
        lieuCapacite: formData.lieuCapacite,
        programmateurId: formData.programmateurId,
        notes: formData.notes,
        updatedAt: new Date().toISOString()
      };
  
      if (id && id !== 'nouveau') {
        // Mise à jour d'un concert existant
        await updateDoc(doc(db, 'concerts', id), concertData);
      } else {
        // Création d'un nouveau concert
        concertData.createdAt = new Date().toISOString();
        const newConcertRef = doc(collection(db, 'concerts'));
        await setDoc(newConcertRef, concertData);
      }
  
      navigate('/concerts');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du concert:', error);
      alert('Une erreur est survenue lors de l\'enregistrement du concert.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div>Chargement du concert...</div>;
  }

  if (showLieuForm && newLieu) {
    return (
      <div>
        <h2>Créer un nouveau lieu</h2>
        <LieuForm lieu={newLieu} onSave={handleLieuCreated} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <h2>{id && id !== 'nouveau' ? 'Modifier le concert' : 'Ajouter un concert'}</h2>
      </div>

      <div className="mb-3">
        <label htmlFor="date" className="form-label">Date du concert *</label>
        <input
          type="date"
          className="form-control"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>

      {/* Le reste du formulaire reste inchangé */}
      
      <div className="mb-3">
        <label htmlFor="montant" className="form-label">Montant (€) *</label>
        <input
          type="number"
          className="form-control"
          id="montant"
          name="montant"
          value={formData.montant}
          onChange={handleChange}
          required
        />
      </div>

      {/* ... reste du formulaire ... */}

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
