#!/bin/bash

# Script pour appliquer toutes les corrections à l'application App-Booking
# et pousser les modifications vers le dépôt git

echo "Début de l'application des corrections..."

# 1. Correction de ProgrammateurForm.js
echo "Correction de ProgrammateurForm.js..."
cat > ./src/components/forms/ProgrammateurForm.js << 'EOL'
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';

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
          const docRef = db.collection('programmateurs').doc(id);
          const doc = await docRef.get();
          
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

      const progId = id && id !== 'nouveau' ? id : db.collection('programmateurs').doc().id;
      
      const progData = {
        ...formData,
        updatedAt: new Date().toISOString()
      };

      if (!id || id === 'nouveau') {
        progData.createdAt = new Date().toISOString();
      }

      await db.collection('programmateurs').doc(progId).set(progData, { merge: true });
      
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
EOL

# 2. Correction de ConcertsList.js
echo "Correction de ConcertsList.js..."
cat > ./src/components/concerts/ConcertsList.js << 'EOL'
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../firebase';
import { formatDate } from '../../utils/dateUtils';

const ConcertsList = () => {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConcerts = async () => {
      try {
        const querySnapshot = await db.collection('concerts').orderBy('date', 'desc').get();
        
        const concertsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setConcerts(concertsData);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des concerts:', error);
        setError('Impossible de charger les concerts. Veuillez réessayer plus tard.');
        setLoading(false);
      }
    };

    fetchConcerts();
  }, []);

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  }

  if (error) {
    return <div className="alert alert-danger mt-3">{error}</div>;
  }

  if (concerts.length === 0) {
    return (
      <div className="text-center mt-4">
        <p>Aucun concert n'a été créé pour le moment.</p>
        <Link to="/concerts/nouveau" className="btn btn-primary">
          Créer votre premier concert
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Date</th>
              <th>Lieu</th>
              <th>Programmateur</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {concerts.map(concert => (
              <tr key={concert.id}>
                <td>{formatDate(concert.date)}</td>
                <td>{concert.lieuNom}</td>
                <td>{concert.programmateurNom}</td>
                <td>{concert.montant} €</td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(concert.statut)}`}>
                    {concert.statut}
                  </span>
                </td>
                <td>
                  <div className="btn-group">
                    <Link to={`/concerts/${concert.id}`} className="btn btn-sm btn-outline-primary">
                      Détails
                    </Link>
                    <Link to={`/concerts/${concert.id}/edit`} className="btn btn-sm btn-outline-secondary">
                      Modifier
                    </Link>
                    <Link to={`/concerts/${concert.id}/form`} className="btn btn-sm btn-outline-info">
                      Formulaire
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Fonction utilitaire pour obtenir la classe de badge en fonction du statut
const getStatusBadgeClass = (statut) => {
  switch (statut) {
    case 'Confirmé':
      return 'bg-success';
    case 'En attente':
      return 'bg-warning text-dark';
    case 'Annulé':
      return 'bg-danger';
    case 'Terminé':
      return 'bg-secondary';
    default:
      return 'bg-light text-dark';
  }
};

export default ConcertsList;
EOL

# 3. Correction de ConcertForm.js
echo "Correction de ConcertForm.js..."
cat > ./src/components/concerts/ConcertForm.js << 'EOL'
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
EOL

# 4. Création des composants manquants
echo "Création des composants manquants..."

# 4.1 Navbar.js
echo "Création de Navbar.js..."
mkdir -p ./src/components/layout
cat > ./src/components/layout/Navbar.js << 'EOL'
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">App Booking</Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/concerts">Concerts</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/programmateurs">Programmateurs</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/lieux">Lieux</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contrats">Contrats</Link>
            </li>
          </ul>
          <div className="d-flex">
            <span className="navbar-text me-3">Utilisateur test</span>
            <Link className="btn btn-outline-light btn-sm" to="/login">Déconnexion</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
EOL

# 4.2 Sidebar.js
echo "Création de Sidebar.js..."
cat > ./src/components/layout/Sidebar.js << 'EOL'
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="bg-dark text-white p-3 sidebar">
      <h5 className="mb-3">App Booking</h5>
      <ul className="nav flex-column">
        <li className="nav-item">
          <Link className="nav-link text-white" to="/">
            <i className="bi bi-speedometer2 me-2"></i>
            Dashboard
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-white" to="/concerts">
            <i className="bi bi-music-note-list me-2"></i>
            Concerts
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-white" to="/programmateurs">
            <i className="bi bi-person-lines-fill me-2"></i>
            Programmateurs
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-white" to="/lieux">
            <i className="bi bi-geo-alt-fill me-2"></i>
            Lieux
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-white" to="/contrats">
            <i className="bi bi-file-earmark-text me-2"></i>
            Contrats
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
EOL

# 4.3 DashboardPage.js
echo "Création de DashboardPage.js..."
mkdir -p ./src/pages
cat > ./src/pages/DashboardPage.js << 'EOL'
import React from 'react';

const DashboardPage = () => {
  return (
    <div className="container mt-4">
      <h1>Dashboard</h1>
      <div className="row mt-4">
        <div className="col-md-3 mb-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Concerts</h5>
              <p className="card-text display-4">0</p>
              <p className="card-text">Concerts à venir</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Programmateurs</h5>
              <p className="card-text display-4">1</p>
              <p className="card-text">Programmateurs actifs</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">Lieux</h5>
              <p className="card-text display-4">1</p>
              <p className="card-text">Lieux disponibles</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <h5 className="card-title">Contrats</h5>
              <p className="card-text display-4">0</p>
              <p className="card-text">Contrats en cours</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              Concerts à venir
            </div>
            <div className="card-body">
              <p className="text-center">Aucun concert à venir</p>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              Activité récente
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item">Création du lieu "La Cigale"</li>
                <li className="list-group-item">Création du programmateur "Jean Dupont"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
EOL

# 4.4 LoginPage.js
echo "Création de LoginPage.js..."
cat > ./src/pages/LoginPage.js << 'EOL'
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulation d'authentification
      if (email === 'test@example.com' && password === 'password') {
        // Redirection vers le dashboard après connexion réussie
        navigate('/');
      } else {
        setError('Email ou mot de passe incorrect');
      }
    } catch (error) {
      setError('Une erreur est survenue lors de la connexion');
      console.error('Erreur de connexion:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center mt-5">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Connexion</h4>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Mot de passe</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Connexion en cours...' : 'Se connecter'}
                  </button>
                </div>
              </form>
              <div className="mt-3 text-center">
                <small className="text-muted">
                  Pour les tests, utilisez: test@example.com / password
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
EOL

# 5. Copie de la documentation
echo "Copie de la documentation..."
cat > ./DOCUMENTATION_CORRECTIONS.md << 'EOL'
# Documentation des corrections apportées à l'application App-Booking

## Résumé des problèmes identifiés et des corrections

L'application de gestion de booking pour concerts présentait plusieurs problèmes qui empêchaient son bon fonctionnement. Voici un résumé des problèmes identifiés et des corrections apportées :

### 1. Problèmes avec les imports Firebase directs

**Problème** : Plusieurs composants utilisaient directement les imports de Firebase au lieu d'utiliser l'interface `db` exportée par `firebase.js` qui est compatible avec le système de stockage local (mockStorage).

**Composants corrigés** :
- `ProgrammateurForm.js` : Utilisait directement les imports Firebase (`collection`, `doc`, `getDoc`, `setDoc`, etc.)
- `ConcertsList.js` : Utilisait directement les imports Firebase (`collection`, `getDocs`, `query`, `orderBy`)

**Solution** : Modification des composants pour utiliser l'interface `db` exportée par `firebase.js` au lieu des imports directs de Firebase.

### 2. Problème de format de date dans la création de concerts

**Problème** : Le format de date était incorrectement traité lors de la soumission du formulaire de création de concert, ce qui empêchait la création de concerts.

**Composant corrigé** : `ConcertForm.js`

**Solution** : Ajout d'une logique de correction du format de date dans la fonction `handleSubmit` pour s'assurer que la date est au format YYYY-MM-DD avant d'être envoyée au système de stockage.

### 3. Composants manquants dans l'application

**Problème** : Certains composants essentiels étaient manquants dans le projet, ce qui provoquait des erreurs de compilation.

**Composants créés** :
- `Navbar.js`
- `Sidebar.js`
- `DashboardPage.js`
- `LoginPage.js`

**Solution** : Création des composants manquants avec des fonctionnalités de base pour permettre à l'application de démarrer correctement.

## État actuel de l'application

### Fonctionnalités opérationnelles

1. **Navigation** : L'application démarre correctement et la navigation entre les différentes pages fonctionne.
2. **Création de lieux** : La fonctionnalité de création de lieux fonctionne correctement. Les lieux créés sont correctement enregistrés et apparaissent dans la liste des lieux.
3. **Création de programmateurs** : Après correction, la fonctionnalité de création de programmateurs fonctionne correctement. Les programmateurs créés sont correctement enregistrés et apparaissent dans la liste des programmateurs.
4. **Affichage des listes** : Les listes de lieux et de programmateurs s'affichent correctement.

### Problèmes restants

1. **Création de concerts** : Malgré les corrections apportées au format de date dans `ConcertForm.js`, la création de concerts ne fonctionne toujours pas complètement. Les concerts créés ne s'affichent pas dans la liste des concerts.

2. **Génération de formulaires** : La fonctionnalité de génération de formulaires n'a pas pu être testée en raison des problèmes avec la création de concerts.

## Modifications détaillées

### 1. Correction de ProgrammateurForm.js

```javascript
// Avant
import { collection, doc, getDoc, setDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
// ...
const progId = id && id !== 'nouveau' ? id : doc(collection(db, 'programmateurs')).id;
await setDoc(doc(db, 'programmateurs', progId), progData, { merge: true });

// Après
// Suppression des imports directs de Firebase
// ...
const progId = id && id !== 'nouveau' ? id : db.collection('programmateurs').doc().id;
await db.collection('programmateurs').doc(progId).set(progData, { merge: true });
```

### 2. Correction de ConcertsList.js

```javascript
// Avant
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
// ...
const q = query(collection(db, 'concerts'), orderBy('date', 'desc'));
const querySnapshot = await getDocs(q);

// Après
// Suppression des imports directs de Firebase
// ...
const querySnapshot = await db.collection('concerts').orderBy('date', 'desc').get();
```

### 3. Correction de ConcertForm.js pour le format de date

```javascript
// Ajout dans la fonction handleSubmit
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
  // autres propriétés...
};
```

## Recommandations pour les corrections futures

1. **Débogage de la création de concerts** : Investiguer pourquoi les concerts créés ne s'affichent pas dans la liste malgré la correction du format de date. Vérifier si d'autres problèmes existent dans le composant `ConcertForm.js` ou dans la façon dont les données sont stockées et récupérées.

2. **Amélioration du système de stockage local** : Vérifier si le système de stockage local (mockStorage) fonctionne correctement pour toutes les collections et opérations.

3. **Tests unitaires** : Ajouter des tests unitaires pour chaque composant afin de détecter rapidement les problèmes similaires à l'avenir.

4. **Gestion des erreurs** : Améliorer la gestion des erreurs dans l'application pour faciliter le débogage.

## Conclusion

L'application a été partiellement corrigée et est maintenant fonctionnelle pour la création de lieux et de programmateurs. Cependant, des problèmes persistent avec la création de concerts, ce qui empêche de tester complètement le flux de travail. Les corrections apportées ont permis de résoudre les problèmes d'imports Firebase directs et d'améliorer la gestion du format de date, mais d'autres investigations sont nécessaires pour résoudre tous les problèmes.
EOL

# Rendre le script exécutable
chmod +x ./fix_all_and_push.sh

# Ajouter les commandes git
echo "
# Commandes git pour ajouter, commiter et pousser les modifications
echo \"Ajout des fichiers modifiés à git...\"
git add .

echo \"Commit des modifications...\"
git commit -m \"Correction des problèmes d'imports Firebase et de format de date\"

echo \"Push des modifications vers le dépôt distant...\"
git push

echo \"Toutes les corrections ont été appliquées et poussées vers le dépôt git.\"
" >> ./fix_all_and_push.sh

echo "Script de correction créé avec succès : fix_all_and_push.sh"
echo "Pour l'exécuter, utilisez la commande : ./fix_all_and_push.sh"
echo "Les modifications seront appliquées, puis ajoutées, commitées et poussées vers votre dépôt git."

# Commandes git pour ajouter, commiter et pousser les modifications
echo "Ajout des fichiers modifiés à git..."
git add .

echo "Commit des modifications..."
git commit -m "Correction des problèmes d'imports Firebase et de format de date"

echo "Push des modifications vers le dépôt distant..."
git push

echo "Toutes les corrections ont été appliquées et poussées vers le dépôt git."

