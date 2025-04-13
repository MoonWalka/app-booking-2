import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import LieuForm from '../forms/LieuForm';

const ConcertForm = ({ concert }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lieux, setLieux] = useState([]);
  const [programmateurs, setProgrammateurs] = useState([]);
  const [showLieuForm, setShowLieuForm] = useState(false);
  const [newLieu, setNewLieu] = useState(null);
  
  const [formData, setFormData] = useState({
    date: concert?.date || '',
    montant: concert?.montant || '',
    statut: concert?.statut || 'En attente',
    lieuId: concert?.lieuId || '',
    lieuNom: concert?.lieuNom || '',
    lieuAdresse: concert?.lieuAdresse || '',
    lieuCodePostal: concert?.lieuCodePostal || '',
    lieuVille: concert?.lieuVille || '',
    lieuCapacite: concert?.lieuCapacite || '',
    programmateurId: concert?.programmateurId || '',
    notes: concert?.notes || ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les lieux
        const lieuxSnapshot = await db.collection('lieux').get();
        const lieuxData = lieuxSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLieux(lieuxData);
        
        // Récupérer les programmateurs
        const programmateursSnapshot = await db.collection('programmateurs').get();
        const programmateursData = programmateursSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProgrammateurs(programmateursData);
        
        // Si c'est une modification, récupérer les détails du concert
        if (concert?.id) {
          const concertDoc = await db.collection('concerts').doc(concert.id).get();
          if (concertDoc.exists) {
            const concertData = concertDoc.data();
            setFormData({
              ...concertData,
              date: concertData.date || '',
              montant: concertData.montant || '',
              statut: concertData.statut || 'En attente',
              lieuId: concertData.lieuId || '',
              programmateurId: concertData.programmateurId || '',
              notes: concertData.notes || ''
            });
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
    };
    
    fetchData();
  }, [concert?.id]);

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
      // Créer un document vide pour obtenir un ID
      const newLieuRef = await db.collection('lieux').add({
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
      // Si la date est au format MM/DD/YYYY ou similaire, la convertir
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

      if (concert?.id) {
        // Mise à jour d'un concert existant
        await db.collection('concerts').doc(concert.id).update(concertData);
      } else {
        // Création d'un nouveau concert
        concertData.createdAt = new Date().toISOString();
        await db.collection('concerts').add(concertData);
      }

      navigate('/concerts');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du concert:', error);
      alert('Une erreur est survenue lors de l\'enregistrement du concert.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <h2>{concert?.id ? 'Modifier le concert' : 'Ajouter un concert'}</h2>
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
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </div>
    </form>
  );
};

export default ConcertForm;
