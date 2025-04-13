#!/bin/bash

echo "Correction de l'application de réservation de concerts..."

# Création des répertoires nécessaires s'ils n'existent pas
mkdir -p src/components/lieux
mkdir -p src/components/programmateurs

# Correction du fichier firebase.js pour utiliser les émulateurs en développement
cat > src/firebase.js << 'EOL'
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDqoNt9vPZ5LvRxhZr8WBzaRlrT9ZmCv3A",
  authDomain: "app-booking-demo.firebaseapp.com",
  projectId: "app-booking-demo",
  storageBucket: "app-booking-demo.appspot.com",
  messagingSenderId: "583694241535",
  appId: "1:583694241535:web:a8e2b9b2e2b9b2e2b9b2e2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Utiliser les émulateurs Firebase en développement
if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
  // Initialiser les émulateurs Firebase
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
  console.log('Utilisation des émulateurs Firebase');
}

// Forcer le mode bypass en développement
const BYPASS_AUTH = process.env.NODE_ENV === 'development' ? true : (process.env.REACT_APP_BYPASS_AUTH === 'true');

export { db, auth, BYPASS_AUTH };
EOL

# Implémentation du formulaire de lieu
cat > src/components/forms/LieuForm.js << 'EOL'
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
EOL

# Implémentation de la liste des lieux
cat > src/components/lieux/LieuxList.js << 'EOL'
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

const LieuxList = () => {
  const [lieux, setLieux] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLieux = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchLieux();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce lieu ?')) {
      try {
        await deleteDoc(doc(db, 'lieux', id));
        setLieux(lieux.filter(lieu => lieu.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression du lieu:', error);
        alert('Une erreur est survenue lors de la suppression du lieu');
      }
    }
  };

  if (loading) {
    return <div className="text-center my-5">Chargement des lieux...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Liste des lieux</h2>
        <Link to="/lieux/nouveau" className="btn btn-primary">
          + Ajouter un lieu
        </Link>
      </div>

      {lieux.length === 0 ? (
        <div className="alert alert-info">
          Aucun lieu n'a été ajouté. Cliquez sur "Ajouter un lieu" pour commencer.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Adresse</th>
                <th>Ville</th>
                <th>Capacité</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lieux.map(lieu => (
                <tr key={lieu.id}>
                  <td>{lieu.nom}</td>
                  <td>{lieu.adresse}</td>
                  <td>{lieu.ville}</td>
                  <td>{lieu.capacite || '-'}</td>
                  <td>
                    <div className="btn-group">
                      <Link to={`/lieux/${lieu.id}`} className="btn btn-sm btn-outline-primary">
                        Détails
                      </Link>
                      <Link to={`/lieux/edit/${lieu.id}`} className="btn btn-sm btn-outline-secondary">
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleDelete(lieu.id)}
                        className="btn btn-sm btn-outline-danger"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LieuxList;
EOL

# Implémentation des détails d'un lieu
cat > src/components/lieux/LieuDetails.js << 'EOL'
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const LieuDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lieu, setLieu] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLieu = async () => {
      setLoading(true);
      try {
        const lieuDoc = await getDoc(doc(db, 'lieux', id));
        if (lieuDoc.exists()) {
          setLieu({
            id: lieuDoc.id,
            ...lieuDoc.data()
          });
        } else {
          console.error('Lieu non trouvé');
          navigate('/lieux');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du lieu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLieu();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce lieu ?')) {
      try {
        await deleteDoc(doc(db, 'lieux', id));
        navigate('/lieux');
      } catch (error) {
        console.error('Erreur lors de la suppression du lieu:', error);
        alert('Une erreur est survenue lors de la suppression du lieu');
      }
    }
  };

  if (loading) {
    return <div className="text-center my-5">Chargement...</div>;
  }

  if (!lieu) {
    return <div className="alert alert-danger">Lieu non trouvé</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{lieu.nom}</h2>
        <div>
          <Link to="/lieux" className="btn btn-outline-secondary me-2">
            Retour à la liste
          </Link>
          <Link to={`/lieux/edit/${id}`} className="btn btn-outline-primary me-2">
            Modifier
          </Link>
          <button onClick={handleDelete} className="btn btn-outline-danger">
            Supprimer
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3>Informations générales</h3>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-3 fw-bold">Adresse:</div>
            <div className="col-md-9">{lieu.adresse}</div>
          </div>
          <div className="row mb-3">
            <div className="col-md-3 fw-bold">Code postal:</div>
            <div className="col-md-9">{lieu.codePostal}</div>
          </div>
          <div className="row mb-3">
            <div className="col-md-3 fw-bold">Ville:</div>
            <div className="col-md-9">{lieu.ville}</div>
          </div>
          <div className="row mb-3">
            <div className="col-md-3 fw-bold">Pays:</div>
            <div className="col-md-9">{lieu.pays}</div>
          </div>
          <div className="row mb-3">
            <div className="col-md-3 fw-bold">Capacité:</div>
            <div className="col-md-9">{lieu.capacite || 'Non spécifiée'}</div>
          </div>
        </div>
      </div>

      {lieu.contact && (lieu.contact.nom || lieu.contact.telephone || lieu.contact.email) && (
        <div className="card">
          <div className="card-header">
            <h3>Contact</h3>
          </div>
          <div className="card-body">
            {lieu.contact.nom && (
              <div className="row mb-3">
                <div className="col-md-3 fw-bold">Personne à contacter:</div>
                <div className="col-md-9">{lieu.contact.nom}</div>
              </div>
            )}
            {lieu.contact.telephone && (
              <div className="row mb-3">
                <div className="col-md-3 fw-bold">Téléphone:</div>
                <div className="col-md-9">{lieu.contact.telephone}</div>
              </div>
            )}
            {lieu.contact.email && (
              <div className="row mb-3">
                <div className="col-md-3 fw-bold">Email:</div>
                <div className="col-md-9">{lieu.contact.email}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LieuDetails;
EOL

# Mise à jour de la page des lieux
cat > src/pages/LieuxPage.js << 'EOL'
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LieuxList from '../components/lieux/LieuxList';
import LieuDetails from '../components/lieux/LieuDetails';
import LieuForm from '../components/forms/LieuForm';

const LieuxPage = () => {
  return (
    <div>
      <h1>Lieux</h1>
      <Routes>
        <Route path="/" element={<LieuxList />} />
        <Route path="/nouveau" element={<LieuForm />} />
        <Route path="/edit/:id" element={<LieuForm />} />
        <Route path="/:id" element={<LieuDetails />} />
      </Routes>
    </div>
  );
};

export default LieuxPage;
EOL

# Implémentation de la liste des programmateurs
cat > src/components/programmateurs/ProgrammateursList.js << 'EOL'
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

const ProgrammateursList = () => {
  const [programmateurs, setProgrammateurs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgrammateurs = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchProgrammateurs();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce programmateur ?')) {
      try {
        await deleteDoc(doc(db, 'programmateurs', id));
        setProgrammateurs(programmateurs.filter(prog => prog.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression du programmateur:', error);
        alert('Une erreur est survenue lors de la suppression du programmateur');
      }
    }
  };

  if (loading) {
    return <div className="text-center my-5">Chargement des programmateurs...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Liste des programmateurs</h2>
        <Link to="/programmateurs/nouveau" className="btn btn-primary">
          + Ajouter un programmateur
        </Link>
      </div>

      {programmateurs.length === 0 ? (
        <div className="alert alert-info">
          Aucun programmateur n'a été ajouté. Cliquez sur "Ajouter un programmateur" pour commencer.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Structure</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {programmateurs.map(prog => (
                <tr key={prog.id}>
                  <td>{prog.nom}</td>
                  <td>{prog.structure || '-'}</td>
                  <td>{prog.email || '-'}</td>
                  <td>{prog.telephone || '-'}</td>
                  <td>
                    <div className="btn-group">
                      <Link to={`/programmateurs/${prog.id}`} className="btn btn-sm btn-outline-primary">
                        Détails
                      </Link>
                      <Link to={`/programmateurs/edit/${prog.id}`} className="btn btn-sm btn-outline-secondary">
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleDelete(prog.id)}
                        className="btn btn-sm btn-outline-danger"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProgrammateursList;
EOL

# Implémentation des détails d'un programmateur
cat > src/components/programmateurs/ProgrammateurDetails.js << 'EOL'
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const ProgrammateurDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [programmateur, setProgrammateur] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgrammateur = async () => {
      setLoading(true);
      try {
        const progDoc = await getDoc(doc(db, 'programmateurs', id));
        if (progDoc.exists()) {
          setProgrammateur({
            id: progDoc.id,
            ...progDoc.data()
          });
        } else {
          console.error('Programmateur non trouvé');
          navigate('/programmateurs');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du programmateur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgrammateur();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce programmateur ?')) {
      try {
        await deleteDoc(doc(db, 'programmateurs', id));
        navigate('/programmateurs');
      } catch (error) {
        console.error('Erreur lors de la suppression du programmateur:', error);
        alert('Une erreur est survenue lors de la suppression du programmateur');
      }
    }
  };

  if (loading) {
    return <div className="text-center my-5">Chargement...</div>;
  }

  if (!programmateur) {
    return <div className="alert alert-danger">Programmateur non trouvé</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{programmateur.nom}</h2>
        <div>
          <Link to="/programmateurs" className="btn btn-outline-secondary me-2">
            Retour à la liste
          </Link>
          <Link to={`/programmateurs/edit/${id}`} className="btn btn-outline-primary me-2">
            Modifier
          </Link>
          <button onClick={handleDelete} className="btn btn-outline-danger">
            Supprimer
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3>Informations générales</h3>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-3 fw-bold">Structure:</div>
            <div className="col-md-9">{programmateur.structure || 'Non spécifiée'}</div>
          </div>
          <div className="row mb-3">
            <div className="col-md-3 fw-bold">Email:</div>
            <div className="col-md-9">{programmateur.email || 'Non spécifié'}</div>
          </div>
          <div className="row mb-3">
            <div className="col-md-3 fw-bold">Téléphone:</div>
            <div className="col-md-9">{programmateur.telephone || 'Non spécifié'}</div>
          </div>
          <div className="row mb-3">
            <div className="col-md-3 fw-bold">Adresse:</div>
            <div className="col-md-9">{programmateur.adresse || 'Non spécifiée'}</div>
          </div>
        </div>
      </div>

      {programmateur.notes && (
        <div className="card">
          <div className="card-header">
            <h3>Notes</h3>
          </div>
          <div className="card-body">
            <p>{programmateur.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgrammateurDetails;
EOL

# Mise à jour de la page des programmateurs
cat > src/pages/ProgrammateursPage.js << 'EOL'
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProgrammateursList from '../components/programmateurs/ProgrammateursList';
import ProgrammateurDetails from '../components/programmateurs/ProgrammateurDetails';
import ProgrammateurForm from '../components/forms/ProgrammateurForm';

const ProgrammateursPage = () => {
  return (
    <div>
      <h1>Programmateurs</h1>
      <Routes>
        <Route path="/" element={<ProgrammateursList />} />
        <Route path="/nouveau" element={<ProgrammateurForm />} />
        <Route path="/edit/:id" element={<ProgrammateurForm />} />
        <Route path="/:id" element={<ProgrammateurDetails />} />
      </Routes>
    </div>
  );
};

export default ProgrammateursPage;
EOL

# Correction du formulaire de programmateur
cat > src/components/forms/ProgrammateurForm.js << 'EOL'
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
EOL

# Correction du formulaire de concert
cat > src/components/concerts/ConcertForm.js << 'EOL'
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
EOL

# Implémentation du générateur de formulaire
cat > src/components/forms/FormGenerator.js << 'EOL'
import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { v4 as uuidv4 } from 'uuid';

const FormGenerator = ({ concertId, programmateurId, onFormGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [formLink, setFormLink] = useState('');
  const [copied, setCopied] = useState(false);

  const generateForm = async () => {
    setLoading(true);
    try {
      // Générer un token unique
      const token = uuidv4();
      
      // Calculer la date d'expiration (30 jours à partir de maintenant)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      
      // Créer un document dans la collection forms
      const formRef = await addDoc(collection(db, 'forms'), {
        concertId,
        programmateurId: programmateurId || null,
        token,
        createdAt: serverTimestamp(),
        expiryDate,
        completed: false
      });
      
      // Mettre à jour le concert avec l'ID du formulaire
      await updateDoc(doc(db, 'concerts', concertId), {
        formId: formRef.id,
        updatedAt: serverTimestamp()
      });
      
      // Générer le lien du formulaire
      const baseUrl = window.location.origin;
      const formUrl = `${baseUrl}/form/${token}`;
      
      setFormLink(formUrl);
      
      // Appeler le callback si fourni
      if (onFormGenerated) {
        onFormGenerated(formRef.id, formUrl);
      }
    } catch (error) {
      console.error('Erreur lors de la génération du formulaire:', error);
      alert('Une erreur est survenue lors de la génération du formulaire');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Erreur lors de la copie dans le presse-papiers:', err);
      });
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h3>Formulaire pour le programmateur</h3>
      </div>
      <div className="card-body">
        {!formLink ? (
          <div>
            <p>
              Générez un lien de formulaire à envoyer au programmateur pour qu'il puisse remplir ses informations.
            </p>
            <button
              className="btn btn-primary"
              onClick={generateForm}
              disabled={loading}
            >
              {loading ? 'Génération en cours...' : 'Générer un formulaire'}
            </button>
          </div>
        ) : (
          <div>
            <p>
              Voici le lien du formulaire à envoyer au programmateur :
            </p>
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                value={formLink}
                readOnly
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={copyToClipboard}
              >
                {copied ? 'Copié !' : 'Copier'}
              </button>
            </div>
            <p className="text-muted">
              Ce lien est valable pendant 30 jours. Vous pouvez générer un nouveau lien à tout moment.
            </p>
            <button
              className="btn btn-outline-primary"
              onClick={generateForm}
              disabled={loading}
            >
              {loading ? 'Génération en cours...' : 'Générer un nouveau lien'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormGenerator;
EOL

# Implémentation de la page de réponse au formulaire
cat > src/pages/FormResponsePage.js << 'EOL'
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, getDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import ProgrammateurForm from '../components/forms/ProgrammateurForm';

const FormResponsePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const [concert, setConcert] = useState(null);
  const [lieu, setLieu] = useState(null);
  const [error, setError] = useState(null);
  const [expired, setExpired] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      setLoading(true);
      try {
        // Vérifier si le token existe dans la collection forms
        const formsQuery = query(collection(db, 'forms'), where('token', '==', token));
        const formsSnapshot = await getDocs(formsQuery);
        
        if (formsSnapshot.empty) {
          setError('Formulaire non trouvé. Le lien est peut-être incorrect.');
          return;
        }
        
        const formDoc = formsSnapshot.docs[0];
        const formData = formDoc.data();
        setFormData(formData);
        
        // Vérifier si le formulaire est déjà complété
        if (formData.completed) {
          setCompleted(true);
          return;
        }
        
        // Vérifier si le token n'est pas expiré
        const now = new Date();
        const expiryDate = formData.expiryDate ? formData.expiryDate.toDate() : null;
        
        if (expiryDate && now > expiryDate) {
          setExpired(true);
          return;
        }
        
        // Récupérer les données du concert
        if (formData.concertId) {
          const concertDoc = await getDoc(doc(db, 'concerts', formData.concertId));
          if (concertDoc.exists()) {
            const concertData = concertDoc.data();
            setConcert(concertData);
            
            // Récupérer les données du lieu
            if (concertData.lieuId) {
              const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
              if (lieuDoc.exists()) {
                setLieu(lieuDoc.data());
              }
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors de la validation du token:', error);
        setError('Une erreur est survenue lors du chargement du formulaire.');
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  if (loading) {
    return <div className="text-center my-5">Chargement du formulaire...</div>;
  }

  if (error) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger">
          <h3>Erreur</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="container my-5">
        <div className="alert alert-warning">
          <h3>Lien expiré</h3>
          <p>Ce lien de formulaire a expiré. Veuillez contacter l'organisateur pour obtenir un nouveau lien.</p>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="container my-5">
        <div className="alert alert-success">
          <h3>Formulaire déjà complété</h3>
          <p>Vous avez déjà complété ce formulaire. Merci pour votre participation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h1>Formulaire programmateur</h1>
      
      {concert && lieu && (
        <div className="card mb-4">
          <div className="card-header">
            <h3>Informations sur le concert</h3>
          </div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-3 fw-bold">Date:</div>
              <div className="col-md-9">{concert.date}</div>
            </div>
            <div className="row mb-3">
              <div className="col-md-3 fw-bold">Lieu:</div>
              <div className="col-md-9">{lieu.nom}, {lieu.ville}</div>
            </div>
            <div className="row mb-3">
              <div className="col-md-3 fw-bold">Adresse:</div>
              <div className="col-md-9">{lieu.adresse}, {lieu.codePostal} {lieu.ville}</div>
            </div>
            <div className="row mb-3">
              <div className="col-md-3 fw-bold">Montant:</div>
              <div className="col-md-9">{concert.montant} €</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="card">
        <div className="card-header">
          <h3>Vos informations</h3>
        </div>
        <div className="card-body">
          <p>Veuillez remplir le formulaire ci-dessous avec vos informations de contact.</p>
          <ProgrammateurForm token={token} />
        </div>
      </div>
    </div>
  );
};

export default FormResponsePage;
EOL

# Implémentation des détails d'un concert
cat > src/components/concerts/ConcertDetails.js << 'EOL'
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc, collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import FormGenerator from '../forms/FormGenerator';

const ConcertDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [concert, setConcert] = useState(null);
  const [lieu, setLieu] = useState(null);
  const [programmateur, setProgrammateur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFormGenerator, setShowFormGenerator] = useState(false);

  useEffect(() => {
    const fetchConcert = async () => {
      setLoading(true);
      try {
        const concertDoc = await getDoc(doc(db, 'concerts', id));
        if (concertDoc.exists()) {
          const concertData = {
            id: concertDoc.id,
            ...concertDoc.data()
          };
          setConcert(concertData);
          
          // Récupérer les données du lieu
          if (concertData.lieuId) {
            const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
            if (lieuDoc.exists()) {
              setLieu({
                id: lieuDoc.id,
                ...lieuDoc.data()
              });
            }
          }
          
          // Récupérer les données du programmateur
          if (concertData.programmateurId) {
            const progDoc = await getDoc(doc(db, 'programmateurs', concertData.programmateurId));
            if (progDoc.exists()) {
              setProgrammateur({
                id: progDoc.id,
                ...progDoc.data()
              });
            }
          }
        } else {
          console.error('Concert non trouvé');
          navigate('/concerts');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du concert:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConcert();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce concert ?')) {
      try {
        await deleteDoc(doc(db, 'concerts', id));
        navigate('/concerts');
      } catch (error) {
        console.error('Erreur lors de la suppression du concert:', error);
        alert('Une erreur est survenue lors de la suppression du concert');
      }
    }
  };

  const handleFormGenerated = (formId, formUrl) => {
    console.log('Formulaire généré:', formId, formUrl);
  };

  if (loading) {
    return <div className="text-center my-5">Chargement...</div>;
  }

  if (!concert) {
    return <div className="alert alert-danger">Concert non trouvé</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Concert du {concert.date}</h2>
        <div>
          <Link to="/concerts" className="btn btn-outline-secondary me-2">
            Retour à la liste
          </Link>
          <Link to={`/concerts/edit/${id}`} className="btn btn-outline-primary me-2">
            Modifier
          </Link>
          <button onClick={handleDelete} className="btn btn-outline-danger">
            Supprimer
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3>Informations générales</h3>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-3 fw-bold">Date:</div>
            <div className="col-md-9">{concert.date}</div>
          </div>
          <div className="row mb-3">
            <div className="col-md-3 fw-bold">Montant:</div>
            <div className="col-md-9">{concert.montant} €</div>
          </div>
          <div className="row mb-3">
            <div className="col-md-3 fw-bold">Statut:</div>
            <div className="col-md-9">
              <span className={`badge ${
                concert.statut === 'confirmé' ? 'bg-success' :
                concert.statut === 'option' ? 'bg-warning' :
                'bg-danger'
              }`}>
                {concert.statut}
              </span>
            </div>
          </div>
        </div>
      </div>

      {lieu && (
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3>Lieu</h3>
            <Link to={`/lieux/${lieu.id}`} className="btn btn-sm btn-outline-primary">
              Voir détails
            </Link>
          </div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-3 fw-bold">Nom:</div>
              <div className="col-md-9">{lieu.nom}</div>
            </div>
            <div className="row mb-3">
              <div className="col-md-3 fw-bold">Adresse:</div>
              <div className="col-md-9">{lieu.adresse}, {lieu.codePostal} {lieu.ville}</div>
            </div>
            <div className="row mb-3">
              <div className="col-md-3 fw-bold">Capacité:</div>
              <div className="col-md-9">{lieu.capacite || 'Non spécifiée'}</div>
            </div>
          </div>
        </div>
      )}

      {programmateur ? (
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3>Programmateur</h3>
            <Link to={`/programmateurs/${programmateur.id}`} className="btn btn-sm btn-outline-primary">
              Voir détails
            </Link>
          </div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-3 fw-bold">Nom:</div>
              <div className="col-md-9">{programmateur.nom}</div>
            </div>
            {programmateur.structure && (
              <div className="row mb-3">
                <div className="col-md-3 fw-bold">Structure:</div>
                <div className="col-md-9">{programmateur.structure}</div>
              </div>
            )}
            {programmateur.email && (
              <div className="row mb-3">
                <div className="col-md-3 fw-bold">Email:</div>
                <div className="col-md-9">{programmateur.email}</div>
              </div>
            )}
            {programmateur.telephone && (
              <div className="row mb-3">
                <div className="col-md-3 fw-bold">Téléphone:</div>
                <div className="col-md-9">{programmateur.telephone}</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <FormGenerator
          concertId={id}
          programmateurId={concert.programmateurId}
          onFormGenerated={handleFormGenerated}
        />
      )}

      {concert.notes && (
        <div className="card">
          <div className="card-header">
            <h3>Notes</h3>
          </div>
          <div className="card-body">
            <p>{concert.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConcertDetails;
EOL

# Installation des dépendances nécessaires
npm install uuid --save

echo "Corrections appliquées avec succès !"
echo "Vous pouvez maintenant démarrer l'application avec 'npm start'"
