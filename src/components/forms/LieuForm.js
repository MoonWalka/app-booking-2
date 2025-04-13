import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

const LieuForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [lieu, setLieu] = useState({
    nom: '',
    adresse: '',
    codePostal: '',
    ville: '',
    pays: 'France',
    capacite: '',
    contact: {
      nom: '',
      telephone: '',
      email: ''
    }
  });

  useEffect(() => {
    const fetchLieu = async () => {
      if (id && id !== 'nouveau') {
        setLoading(true);
        try {
          const lieuDoc = await getDoc(doc(db, 'lieux', id));
          if (lieuDoc.exists()) {
            setLieu(lieuDoc.data());
          } else {
            console.error('Lieu non trouvé');
            navigate('/lieux');
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du lieu:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLieu();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setLieu(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setLieu(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    return lieu.nom && lieu.adresse && lieu.codePostal && lieu.ville && lieu.pays;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      const lieuId = id && id !== 'nouveau' ? id : doc(collection(db, 'lieux')).id;
      const lieuData = {
        ...lieu,
        updatedAt: serverTimestamp(),
        ...(id === 'nouveau' && { createdAt: serverTimestamp() })
      };

      await setDoc(doc(db, 'lieux', lieuId), lieuData, { merge: true });
      navigate('/lieux');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du lieu:', error);
      alert('Une erreur est survenue lors de l\'enregistrement du lieu');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id !== 'nouveau') {
    return <div className="text-center my-5">Chargement...</div>;
  }

  return (
    <div>
      <h2>{id === 'nouveau' ? 'Créer un nouveau lieu' : 'Modifier le lieu'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="nom" className="form-label">Nom du lieu *</label>
          <input
            type="text"
            className="form-control"
            id="nom"
            name="nom"
            value={lieu.nom}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="adresse" className="form-label">Adresse *</label>
          <input
            type="text"
            className="form-control"
            id="adresse"
            name="adresse"
            value={lieu.adresse}
            onChange={handleChange}
            required
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
              value={lieu.codePostal}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col">
            <label htmlFor="ville" className="form-label">Ville *</label>
            <input
              type="text"
              className="form-control"
              id="ville"
              name="ville"
              value={lieu.ville}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="pays" className="form-label">Pays *</label>
          <input
            type="text"
            className="form-control"
            id="pays"
            name="pays"
            value={lieu.pays}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="capacite" className="form-label">Capacité</label>
          <input
            type="number"
            className="form-control"
            id="capacite"
            name="capacite"
            value={lieu.capacite}
            onChange={handleChange}
          />
        </div>

        <h3>Informations de contact</h3>

        <div className="mb-3">
          <label htmlFor="contact.nom" className="form-label">Personne à contacter</label>
          <input
            type="text"
            className="form-control"
            id="contact.nom"
            name="contact.nom"
            value={lieu.contact.nom}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="contact.telephone" className="form-label">Téléphone</label>
          <input
            type="tel"
            className="form-control"
            id="contact.telephone"
            name="contact.telephone"
            value={lieu.contact.telephone}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="contact.email" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="contact.email"
            name="contact.email"
            value={lieu.contact.email}
            onChange={handleChange}
          />
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/lieux')}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : id === 'nouveau' ? 'Créer le lieu' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LieuForm;
