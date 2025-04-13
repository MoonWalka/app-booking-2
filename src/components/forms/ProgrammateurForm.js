import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection
} from 'firebase/firestore';

const ProgrammateurForm = ({ id }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    structure: '',
    email: '',
    telephone: ''
  });

  useEffect(() => {
    const fetchProgrammateur = async () => {
      if (id && id !== 'nouveau') {
        try {
          const docRef = doc(db, 'programmateurs', id);
          const snap = await getDoc(docRef); //modif par chat gpt
          
          if (doc.exists) {
            setFormData(doc.data());
          } else {
            console.error('Aucun programmateur trouvé avec cet ID');
            navigate('/programmateurs');
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du programmateur:', error);
        }
      }
    };

    fetchProgrammateur();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      // Validation des champs obligatoires
      if (!formData.nom) {
        alert('Le nom est obligatoire');
        setIsSubmitting(false);
        return;
      }
  
      // 🔧 À MODIFIER : création de l'ID via la nouvelle syntaxe modulaire
      const progId = id && id !== 'nouveau'
        ? id
        : doc(collection(db, 'programmateurs')).id;
  
      const progData = {
        ...formData,
        updatedAt: new Date().toISOString()
      };
  
      if (!id || id === 'nouveau') {
        progData.createdAt = new Date().toISOString();
      }
  
      // 🔧 À MODIFIER : écriture du document avec setDoc et doc()
      await setDoc(doc(db, 'programmateurs', progId), progData, { merge: true });
  
      navigate('/programmateurs');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du programmateur:', error);
      alert('Une erreur est survenue lors de l\'enregistrement du programmateur.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/programmateurs');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <h2>{id && id !== 'nouveau' ? 'Modifier le programmateur' : 'Ajouter un programmateur'}</h2>
      </div>

      <div className="mb-3">
        <label htmlFor="nom" className="form-label">Nom *</label>
        <input
          type="text"
          className="form-control"
          id="nom"
          name="nom"
          value={formData.nom}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="structure" className="form-label">Structure</label>
        <input
          type="text"
          className="form-control"
          id="structure"
          name="structure"
          value={formData.structure}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="email" className="form-label">Email *</label>
        <input
          type="email"
          className="form-control"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="telephone" className="form-label">Téléphone</label>
        <input
          type="tel"
          className="form-control"
          id="telephone"
          name="telephone"
          value={formData.telephone}
          onChange={handleChange}
        />
      </div>

      <div className="d-flex justify-content-between">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleCancel}
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

export default ProgrammateurForm;
