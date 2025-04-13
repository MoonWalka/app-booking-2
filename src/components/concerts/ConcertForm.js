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
  const { id } = useParams();
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
    programmateurNom: '', // Ajouté pour stocker le nom du programmateur
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
        console.log('Lieux chargés:', lieuxData);
  
        // Récupérer les programmateurs
        const progsRef = collection(db, 'programmateurs');
        const programmateursSnapshot = await getDocs(progsRef);
        const programmateursData = programmateursSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProgrammateurs(programmateursData);
        console.log('Programmateurs chargés:', programmateursData);
  
        // Si c'est une modification, récupérer les détails du concert
        if (id && id !== 'nouveau') {
          const concertRef = doc(db, 'concerts', id);
          const concertDoc = await getDoc(concertRef);
          if (concertDoc.exists()) {
            const concertData = concertDoc.data();
            console.log('Données du concert chargées:', concertData);
            
            // Si le lieu existe dans les données du concert mais pas dans la liste des lieux
            if (concertData.lieuId && !lieuxData.some(l => l.id === concertData.lieuId)) {
              try {
                const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
                if (lieuDoc.exists()) {
                  const lieuData = lieuDoc.data();
                  setLieux(prev => [...prev, { id: concertData.lieuId, ...lieuData }]);
                }
              } catch (error) {
                console.error('Erreur lors de la récupération du lieu:', error);
              }
            }
            
            // Si le programmateur existe dans les données du concert mais pas dans la liste des programmateurs
            if (concertData.programmateurId && !programmateursData.some(p => p.id === concertData.programmateurId)) {
              try {
                const progDoc = await getDoc(doc(db, 'programmateurs', concertData.programmateurId));
                if (progDoc.exists()) {
                  const progData = progDoc.data();
                  setProgrammateurs(prev => [...prev, { id: concertData.programmateurId, ...progData }]);
                }
              } catch (error) {
                console.error('Erreur lors de la récupération du programmateur:', error);
              }
            }
            
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
              programmateurNom: concertData.programmateurNom || '',
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
    console.log(`Champ modifié: ${name}, nouvelle valeur: ${value}`);
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Si on sélectionne un lieu, mettre à jour les informations du lieu
    if (name === 'lieuId' && value) {
      const selectedLieu = lieux.find(lieu => lieu.id === value);
      console.log('Lieu sélectionné:', selectedLieu);
      
      if (selectedLieu) {
        setFormData(prev => ({
          ...prev,
          lieuId: selectedLieu.id,
          lieuNom: selectedLieu.nom || '',
          lieuAdresse: selectedLieu.adresse || '',
          lieuCodePostal: selectedLieu.codePostal || '',
          lieuVille: selectedLieu.ville || '',
          lieuCapacite: selectedLieu.capacite || ''
        }));
      }
    }
    
    // Si on sélectionne un programmateur, mettre à jour le nom du programmateur
    if (name === 'programmateurId' && value) {
      const selectedProg = programmateurs.find(prog => prog.id === value);
      console.log('Programmateur sélectionné:', selectedProg);
      
      if (selectedProg) {
        setFormData(prev => ({
          ...prev,
          programmateurId: selectedProg.id,
          programmateurNom: selectedProg.nom || ''
        }));
      }
    }
  };

  const handleLieuCreated = (lieu) => {
    // Ajouter le nouveau lieu à la liste
    const newLieuWithId = { ...lieu, id: newLieu.id };
    setLieux([...lieux, newLieuWithId]);
    
    // Mettre à jour le formulaire avec le nouveau lieu
    setFormData(prev => ({
      ...prev,
      lieuId: newLieu.id,
      lieuNom: lieu.nom || '',
      lieuAdresse: lieu.adresse || '',
      lieuCodePostal: lieu.codePostal || '',
      lieuVille: lieu.ville || '',
      lieuCapacite: lieu.capacite || ''
    }));
    
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
      
      // Si on a un programmateur sélectionné, assurons-nous d'avoir son nom
      let programmateurNom = formData.programmateurNom || '';
      if (formData.programmateurId && !programmateurNom) {
        const selectedProg = programmateurs.find(p => p.id === formData.programmateurId);
        if (selectedProg) {
          programmateurNom = selectedProg.nom || '';
        }
      }
  
      const concertData = {
        date: correctedDate,
        montant: formData.montant,
        statut: formData.statut,
        
        // Infos du lieu
        lieuId: formData.lieuId,
        lieuNom: formData.lieuNom,
        lieuAdresse: formData.lieuAdresse,
        lieuCodePostal: formData.lieuCodePostal,
        lieuVille: formData.lieuVille,
        lieuCapacite: formData.lieuCapacite,
        
        // Infos du programmateur
        programmateurId: formData.programmateurId,
        programmateurNom: programmateurNom,
        
        notes: formData.notes,
        updatedAt: new Date().toISOString()
      };
      
      console.log('Données à enregistrer:', concertData);
  
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

      <div className="mb-3">
        <label htmlFor="statut" className="form-label">Statut</label>
        <select
          className="form-select"
          id="statut"
          name="statut"
          value={formData.statut}
          onChange={handleChange}
        >
          <option value="En attente">En attente</option>
          <option value="Confirmé">Confirmé</option>
          <option value="Annulé">Annulé</option>
          <option value="Terminé">Terminé</option>
        </select>
      </div>

      <div className="mb-3">
        <label htmlFor="lieuId" className="form-label">Lieu *</label>
        <div className="input-group">
          <select
            className="form-select"
            id="lieuId"
            name="lieuId"
            value={formData.lieuId}
            onChange={handleChange}
            required
          >
            <option value="">Sélectionner un lieu</option>
            {lieux.map(lieu => (
              <option key={lieu.id} value={lieu.id}>
                {lieu.nom} - {lieu.ville}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleCreateLieu}
          >
            Créer un lieu
          </button>
        </div>
      </div>

      {formData.lieuId && (
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">Détails du lieu</h5>
            <p><strong>Nom:</strong> {formData.lieuNom}</p>
            <p><strong>Adresse:</strong> {formData.lieuAdresse}</p>
            <p><strong>Code postal:</strong> {formData.lieuCodePostal}</p>
            <p><strong>Ville:</strong> {formData.lieuVille}</p>
            {formData.lieuCapacite && <p><strong>Capacité:</strong> {formData.lieuCapacite}</p>}
          </div>
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="programmateurId" className="form-label">Programmateur</label>
        <select
          className="form-select"
          id="programmateurId"
          name="programmateurId"
          value={formData.programmateurId}
          onChange={handleChange}
        >
          <option value="">Sélectionner un programmateur</option>
          {programmateurs.map(prog => (
            <option key={prog.id} value={prog.id}>
              {prog.nom}
            </option>
          ))}
        </select>
        {formData.programmateurId && (
          <div className="mt-2">
            <p><strong>Programmateur sélectionné:</strong> {formData.programmateurNom}</p>
          </div>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="notes" className="form-label">Notes</label>
        <textarea
          className="form-control"
          id="notes"
          name="notes"
          rows="3"
          value={formData.notes}
          onChange={handleChange}
        ></textarea>
      </div>

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
