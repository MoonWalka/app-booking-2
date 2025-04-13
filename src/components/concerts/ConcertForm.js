import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, doc, getDoc, setDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

const ConcertForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [lieux, setLieux] = useState([]);
  const [programmateurs, setProgrammateurs] = useState([]);
  const [showNewLieu, setShowNewLieu] = useState(false);
  const [concert, setConcert] = useState({
    date: '',
    montant: '',
    statut: 'confirmé',
    lieuId: '',
    programmateurId: '',
    notes: ''
  });
  const [newLieu, setNewLieu] = useState({
    nom: '',
    adresse: '',
    codePostal: '',
    ville: '',
    pays: 'France',
    capacite: ''
  });

  useEffect(() => {
    const fetchConcert = async () => {
      if (id && id !== 'nouveau') {
        setLoading(true);
        try {
          const concertDoc = await getDoc(doc(db, 'concerts', id));
          if (concertDoc.exists()) {
            setConcert(concertDoc.data());
          } else {
            console.error('Concert non trouvé');
            navigate('/concerts');
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du concert:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    const fetchLieux = async () => {
      try {
        const q = query(collection(db, 'lieux'), orderBy('nom'));
        const querySnapshot = await getDocs(q);
        const lieuxData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLieux(lieuxData);
      } catch (error) {
        console.error('Erreur lors de la récupération des lieux:', error);
      }
    };

    const fetchProgrammateurs = async () => {
      try {
        const q = query(collection(db, 'programmateurs'), orderBy('nom'));
        const querySnapshot = await getDocs(q);
        const programmateursData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProgrammateurs(programmateursData);
      } catch (error) {
        console.error('Erreur lors de la récupération des programmateurs:', error);
      }
    };

    fetchConcert();
    fetchLieux();
    fetchProgrammateurs();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConcert(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewLieuChange = (e) => {
    const { name, value } = e.target;
    setNewLieu(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!concert.date) return false;
    if (!concert.montant) return false;
    if (!concert.statut) return false;
    
    // Vérifier si un lieu est sélectionné ou si un nouveau lieu est en cours de création
    if (!concert.lieuId && !showNewLieu) return false;
    
    // Si un nouveau lieu est en cours de création, vérifier qu'il est valide
    if (showNewLieu) {
      if (!newLieu.nom || !newLieu.adresse || !newLieu.codePostal || !newLieu.ville) return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      let lieuId = concert.lieuId;
      
      // Si un nouveau lieu est en cours de création, l'enregistrer d'abord
      if (showNewLieu) {
        const newLieuId = doc(collection(db, 'lieux')).id;
        const lieuData = {
          ...newLieu,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await setDoc(doc(db, 'lieux', newLieuId), lieuData);
        lieuId = newLieuId;
      }
      
      const concertId = id && id !== 'nouveau' ? id : doc(collection(db, 'concerts')).id;
      const concertData = {
        ...concert,
        lieuId: lieuId,
        updatedAt: serverTimestamp(),
        ...(id === 'nouveau' && { createdAt: serverTimestamp() })
      };

      await setDoc(doc(db, 'concerts', concertId), concertData, { merge: true });
      navigate(`/concerts/${concertId}`);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du concert:', error);
      alert('Une erreur est survenue lors de l\'enregistrement du concert');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id !== 'nouveau') {
    return <div className="text-center my-5">Chargement...</div>;
  }

  return (
    <div>
      <h2>{id === 'nouveau' ? 'Créer un nouveau concert' : 'Modifier le concert'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="date" className="form-label">Date *</label>
          <input
            type="date"
            className="form-control"
            id="date"
            name="date"
            value={concert.date}
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
            value={concert.montant}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="statut" className="form-label">Statut *</label>
          <select
            className="form-select"
            id="statut"
            name="statut"
            value={concert.statut}
            onChange={handleChange}
            required
          >
            <option value="confirmé">Confirmé</option>
            <option value="option">Option</option>
            <option value="annulé">Annulé</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="lieuId" className="form-label">Lieu *</label>
          <div className="d-flex gap-2 mb-2">
            <button
              type="button"
              className={`btn ${!showNewLieu ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setShowNewLieu(false)}
            >
              Sélectionner un lieu existant
            </button>
            <button
              type="button"
              className={`btn ${showNewLieu ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setShowNewLieu(true)}
            >
              Créer un nouveau lieu
            </button>
          </div>
          
          {!showNewLieu ? (
            <select
              className="form-select"
              id="lieuId"
              name="lieuId"
              value={concert.lieuId}
              onChange={handleChange}
              required={!showNewLieu}
            >
              <option value="">Sélectionner un lieu</option>
              {lieux.map(lieu => (
                <option key={lieu.id} value={lieu.id}>
                  {lieu.nom} - {lieu.ville}
                </option>
              ))}
            </select>
          ) : (
            <div className="card p-3 mb-3">
              <h4>Nouveau lieu</h4>
              <div className="mb-3">
                <label htmlFor="nom" className="form-label">Nom du lieu *</label>
                <input
                  type="text"
                  className="form-control"
                  id="nom"
                  name="nom"
                  value={newLieu.nom}
                  onChange={handleNewLieuChange}
                  required={showNewLieu}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="adresse" className="form-label">Adresse *</label>
                <input
                  type="text"
                  className="form-control"
                  id="adresse"
                  name="adresse"
                  value={newLieu.adresse}
                  onChange={handleNewLieuChange}
                  required={showNewLieu}
                />
              </div>
              <div className="row mb-3">
                <div className="col">
                  <label htmlFor="codePostal" className="form-label">Code postal *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="codePostal"
                    name="codePostal"
                    value={newLieu.codePostal}
                    onChange={handleNewLieuChange}
                    required={showNewLieu}
                  />
                </div>
                <div className="col">
                  <label htmlFor="ville" className="form-label">Ville *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="ville"
                    name="ville"
                    value={newLieu.ville}
                    onChange={handleNewLieuChange}
                    required={showNewLieu}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="pays" className="form-label">Pays</label>
                <input
                  type="text"
                  className="form-control"
                  id="pays"
                  name="pays"
                  value={newLieu.pays}
                  onChange={handleNewLieuChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="capacite" className="form-label">Capacité</label>
                <input
                  type="number"
                  className="form-control"
                  id="capacite"
                  name="capacite"
                  value={newLieu.capacite}
                  onChange={handleNewLieuChange}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="programmateurId" className="form-label">Programmateur</label>
          <select
            className="form-select"
            id="programmateurId"
            name="programmateurId"
            value={concert.programmateurId}
            onChange={handleChange}
          >
            <option value="">Sélectionner un programmateur</option>
            {programmateurs.map(prog => (
              <option key={prog.id} value={prog.id}>
                {prog.nom} {prog.structure ? `(${prog.structure})` : ''}
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
            value={concert.notes}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/concerts')}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : id === 'nouveau' ? 'Créer le concert' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConcertForm;
