import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, doc, getDoc, setDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const ProgrammateurForm = () => {
  const { id, token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [programmateur, setProgrammateur] = useState({
    nom: '',
    structure: '',
    email: '',
    telephone: '',
    adresse: '',
    notes: ''
  });
  const [concertId, setConcertId] = useState(null);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    const fetchProgrammateur = async () => {
      if (id && id !== 'nouveau') {
        setLoading(true);
        try {
          const progDoc = await getDoc(doc(db, 'programmateurs', id));
          if (progDoc.exists()) {
            setProgrammateur(progDoc.data());
          } else {
            console.error('Programmateur non trouvé');
            navigate('/programmateurs');
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du programmateur:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    const validateToken = async () => {
      if (token) {
        setLoading(true);
        try {
          // Vérifier si le token existe dans la collection forms
          const formsQuery = query(collection(db, 'forms'), where('token', '==', token));
          const formsSnapshot = await getDocs(formsQuery);
          
          if (!formsSnapshot.empty) {
            const formData = formsSnapshot.docs[0].data();
            
            // Vérifier si le token n'est pas expiré
            const now = new Date();
            const expiryDate = formData.expiryDate ? formData.expiryDate.toDate() : null;
            
            if (expiryDate && now > expiryDate) {
              setTokenExpired(true);
            } else {
              // Token valide, récupérer les données du concert
              setConcertId(formData.concertId);
              setTokenValid(true);
              
              // Si un programmateur est déjà associé, récupérer ses données
              if (formData.programmateurId) {
                const progDoc = await getDoc(doc(db, 'programmateurs', formData.programmateurId));
                if (progDoc.exists()) {
                  setProgrammateur(progDoc.data());
                }
              }
            }
          }
        } catch (error) {
          console.error('Erreur lors de la validation du token:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProgrammateur();
    validateToken();
  }, [id, token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProgrammateur(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    return programmateur.nom && programmateur.email;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      const progId = id && id !== 'nouveau' ? id : doc(collection(db, 'programmateurs')).id;
      const progData = {
        ...programmateur,
        updatedAt: serverTimestamp(),
        ...(id === 'nouveau' && { createdAt: serverTimestamp() })
      };

      await setDoc(doc(db, 'programmateurs', progId), progData, { merge: true });
      
      // Si nous avons un concertId (via token), mettre à jour le concert avec l'ID du programmateur
      if (concertId) {
        const concertRef = doc(db, 'concerts', concertId);
        await setDoc(concertRef, {
          programmateurId: progId,
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        // Mettre à jour le document form pour marquer comme complété
        const formsQuery = query(collection(db, 'forms'), where('token', '==', token));
        const formsSnapshot = await getDocs(formsQuery);
        if (!formsSnapshot.empty) {
          const formDoc = formsSnapshot.docs[0];
          await setDoc(doc(db, 'forms', formDoc.id), {
            programmateurId: progId,
            completed: true,
            completedAt: serverTimestamp()
          }, { merge: true });
        }
        
        // Rediriger vers une page de confirmation
        navigate('/form/confirmation');
      } else {
        navigate('/programmateurs');
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du programmateur:', error);
      alert('Une erreur est survenue lors de l\'enregistrement du programmateur');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id !== 'nouveau') {
    return <div className="text-center my-5">Chargement...</div>;
  }

  return (
    <div>
      <h2>{id === 'nouveau' ? 'Créer un nouveau programmateur' : 'Modifier le programmateur'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="nom" className="form-label">Nom *</label>
          <input
            type="text"
            className="form-control"
            id="nom"
            name="nom"
            value={programmateur.nom}
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
            value={programmateur.structure}
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
            value={programmateur.email}
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
            value={programmateur.telephone}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="adresse" className="form-label">Adresse</label>
          <input
            type="text"
            className="form-control"
            id="adresse"
            name="adresse"
            value={programmateur.adresse}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="notes" className="form-label">Notes</label>
          <textarea
            className="form-control"
            id="notes"
            name="notes"
            rows="3"
            value={programmateur.notes}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="d-flex justify-content-end gap-2">
          {!token && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/programmateurs')}
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : id === 'nouveau' ? 'Créer le programmateur' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProgrammateurForm;
