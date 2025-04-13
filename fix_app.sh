# 1. Rendez le script exécutable
chmod +x fix_app.sh

# 2. Créez une nouvelle branche pour les corrections
git checkout -b corrections-fonctionnalites

# 3. Exécutez le script de correction
./fix_app.sh

# 4. Testez l'application
npm start

# 5. Si tout fonctionne correctement, committez et poussez les changements
git add .
git commit -m "Implémentation des fonctionnalités manquantes et correction des bugs"
git push origin corrections-fonctionnalites
#!/bin/bash

# Script de correction pour l'application app-booking-2
# Ce script implémente les fonctionnalités manquantes et corrige les bugs identifiés

echo "Début des corrections de l'application app-booking-2..."

# Création du répertoire components/lieux s'il n'existe pas
mkdir -p src/components/lieux

# Création du répertoire components/programmateurs s'il n'existe pas
mkdir -p src/components/programmateurs

# Implémentation de la fonctionnalité des lieux
echo "Implémentation de la fonctionnalité des lieux..."

# Création du formulaire de lieu
cat > src/components/forms/LieuForm.js << 'EOL'
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';

function LieuForm({ onLieuCreated, isModal = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    codePostal: '',
    ville: '',
    pays: 'France',
    capacite: '',
    contact: '',
    telephone: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      const fetchLieu = async () => {
        try {
          const lieuDoc = await getDoc(doc(db, 'lieux', id));
          if (lieuDoc.exists()) {
            setFormData({ ...lieuDoc.data() });
          } else {
            console.error("Ce lieu n'existe pas");
            if (!isModal) navigate('/lieux');
          }
        } catch (error) {
          console.error("Erreur lors du chargement du lieu:", error);
        }
      };
      fetchLieu();
    }
  }, [id, navigate, isModal]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nom) newErrors.nom = "Le nom du lieu est requis";
    if (!formData.adresse) newErrors.adresse = "L'adresse est requise";
    if (!formData.codePostal) newErrors.codePostal = "Le code postal est requis";
    if (!formData.ville) newErrors.ville = "La ville est requise";
    if (!formData.pays) newErrors.pays = "Le pays est requis";
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      if (isEditing) {
        // Mettre à jour le lieu existant
        await updateDoc(doc(db, 'lieux', id), formData);
        if (!isModal) navigate(`/lieux/${id}`);
      } else {
        // Créer un nouveau lieu
        const lieuRef = await addDoc(collection(db, 'lieux'), {
          ...formData,
          createdAt: new Date()
        });
        
        if (onLieuCreated) {
          onLieuCreated({
            id: lieuRef.id,
            nom: formData.nom
          });
        } else if (!isModal) {
          navigate(`/lieux/${lieuRef.id}`);
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du lieu:", error);
      setErrors({ submit: "Erreur lors de l'enregistrement du lieu. Veuillez réessayer." });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isModal) {
      // Si c'est un modal, on ferme simplement le formulaire
      if (onLieuCreated) onLieuCreated(null);
    } else {
      // Sinon, on retourne à la liste des lieux
      navigate('/lieux');
    }
  };

  return (
    <div className={`lieu-form-container ${isModal ? 'modal-form' : ''}`}>
      <h2>{isEditing ? 'Modifier le lieu' : 'Créer un nouveau lieu'}</h2>
      
      {errors.submit && <div className="error-message global">{errors.submit}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nom">Nom du lieu *</label>
          <input
            type="text"
            id="nom"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            className={errors.nom ? 'error' : ''}
          />
          {errors.nom && <div className="error-message">{errors.nom}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="adresse">Adresse *</label>
          <input
            type="text"
            id="adresse"
            name="adresse"
            value={formData.adresse}
            onChange={handleChange}
            className={errors.adresse ? 'error' : ''}
          />
          {errors.adresse && <div className="error-message">{errors.adresse}</div>}
        </div>
        
        <div className="form-row">
          <div className="form-group half">
            <label htmlFor="codePostal">Code postal *</label>
            <input
              type="text"
              id="codePostal"
              name="codePostal"
              value={formData.codePostal}
              onChange={handleChange}
              className={errors.codePostal ? 'error' : ''}
            />
            {errors.codePostal && <div className="error-message">{errors.codePostal}</div>}
          </div>
          
          <div className="form-group half">
            <label htmlFor="ville">Ville *</label>
            <input
              type="text"
              id="ville"
              name="ville"
              value={formData.ville}
              onChange={handleChange}
              className={errors.ville ? 'error' : ''}
            />
            {errors.ville && <div className="error-message">{errors.ville}</div>}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="pays">Pays *</label>
          <input
            type="text"
            id="pays"
            name="pays"
            value={formData.pays}
            onChange={handleChange}
            className={errors.pays ? 'error' : ''}
          />
          {errors.pays && <div className="error-message">{errors.pays}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="capacite">Capacité</label>
          <input
            type="number"
            id="capacite"
            name="capacite"
            value={formData.capacite}
            onChange={handleChange}
          />
        </div>
        
        <h3>Informations de contact</h3>
        
        <div className="form-group">
          <label htmlFor="contact">Personne à contacter</label>
          <input
            type="text"
            id="contact"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="telephone">Téléphone</label>
          <input
            type="tel"
            id="telephone"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={handleCancel} className="btn-secondary">
            Annuler
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Enregistrement...' : (isEditing ? 'Mettre à jour' : 'Créer le lieu')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default LieuForm;
EOL

# Création de la liste des lieux
cat > src/components/lieux/LieuxList.js << 'EOL'
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

function LieuxList() {
  const [lieux, setLieux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLieux = async () => {
      try {
        const q = query(collection(db, 'lieux'), orderBy('nom'));
        const querySnapshot = await getDocs(q);
        
        const lieuxData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setLieux(lieuxData);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des lieux:", err);
        setError("Une erreur est survenue lors du chargement des lieux.");
        setLoading(false);
      }
    };

    fetchLieux();
  }, []);

  if (loading) {
    return <div className="loading">Chargement des lieux...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="lieux-list">
      <div className="list-header">
        <h2>Liste des lieux</h2>
        <Link to="/lieux/nouveau" className="btn-primary">
          + Nouveau lieu
        </Link>
      </div>
      
      {lieux.length === 0 ? (
        <div className="empty-list">
          <p>Aucun lieu n'a été créé pour le moment.</p>
          <Link to="/lieux/nouveau" className="btn-secondary">
            Créer votre premier lieu
          </Link>
        </div>
      ) : (
        <div className="list-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Ville</th>
                <th>Pays</th>
                <th>Capacité</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {lieux.map(lieu => (
                <tr key={lieu.id}>
                  <td>
                    <Link to={`/lieux/${lieu.id}`} className="item-link">
                      {lieu.nom}
                    </Link>
                  </td>
                  <td>{lieu.ville}</td>
                  <td>{lieu.pays}</td>
                  <td>{lieu.capacite || '-'}</td>
                  <td>{lieu.contact || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default LieuxList;
EOL

# Création de la page de détails d'un lieu
cat > src/components/lieux/LieuDetails.js << 'EOL'
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';

function LieuDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lieu, setLieu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [concertsAssocies, setConcertsAssocies] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchLieu = async () => {
      try {
        const lieuDoc = await getDoc(doc(db, 'lieux', id));
        
        if (lieuDoc.exists()) {
          setLieu({
            id: lieuDoc.id,
            ...lieuDoc.data()
          });
        } else {
          setError("Ce lieu n'existe pas.");
        }
        
        // Récupérer les concerts associés à ce lieu
        const concertsQuery = query(
          collection(db, 'concerts'),
          where('lieuId', '==', id)
        );
        
        const concertsSnapshot = await getDocs(concertsQuery);
        const concertsData = concertsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setConcertsAssocies(concertsData);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement du lieu:", err);
        setError("Une erreur est survenue lors du chargement du lieu.");
        setLoading(false);
      }
    };

    fetchLieu();
  }, [id]);

  const handleDelete = async () => {
    if (concertsAssocies.length > 0) {
      setError("Impossible de supprimer ce lieu car il est associé à des concerts.");
      setShowDeleteConfirm(false);
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'lieux', id));
      navigate('/lieux');
    } catch (err) {
      console.error("Erreur lors de la suppression du lieu:", err);
      setError("Une erreur est survenue lors de la suppression du lieu.");
    }
  };

  if (loading) {
    return <div className="loading">Chargement du lieu...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!lieu) {
    return <div className="not-found">Lieu non trouvé.</div>;
  }

  return (
    <div className="lieu-details">
      <div className="details-header">
        <h2>{lieu.nom}</h2>
        <div className="actions">
          <Link to={`/lieux/${id}/modifier`} className="btn-secondary">
            Modifier
          </Link>
          <button 
            className="btn-danger" 
            onClick={() => setShowDeleteConfirm(true)}
            disabled={concertsAssocies.length > 0}
          >
            Supprimer
          </button>
        </div>
      </div>
      
      <div className="details-content">
        <div className="details-section">
          <h3>Informations générales</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="label">Adresse</span>
              <span className="value">{lieu.adresse}</span>
            </div>
            <div className="detail-item">
              <span className="label">Code postal</span>
              <span className="value">{lieu.codePostal}</span>
            </div>
            <div className="detail-item">
              <span className="label">Ville</span>
              <span className="value">{lieu.ville}</span>
            </div>
            <div className="detail-item">
              <span className="label">Pays</span>
              <span className="value">{lieu.pays}</span>
            </div>
            <div className="detail-item">
              <span className="label">Capacité</span>
              <span className="value">{lieu.capacite || 'Non spécifiée'}</span>
            </div>
          </div>
        </div>
        
        <div className="details-section">
          <h3>Contact</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="label">Personne à contacter</span>
              <span className="value">{lieu.contact || 'Non spécifié'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Téléphone</span>
              <span className="value">{lieu.telephone || 'Non spécifié'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Email</span>
              <span className="value">{lieu.email || 'Non spécifié'}</span>
            </div>
          </div>
        </div>
        
        <div className="details-section">
          <h3>Concerts associés ({concertsAssocies.length})</h3>
          {concertsAssocies.length === 0 ? (
            <p>Aucun concert n'est associé à ce lieu.</p>
          ) : (
            <ul className="associated-items">
              {concertsAssocies.map(concert => (
                <li key={concert.id}>
                  <Link to={`/concerts/${concert.id}`}>
                    {new Date(concert.date).toLocaleDateString()} - {concert.programmateurNom || 'Programmateur non spécifié'}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {showDeleteConfirm && (
        <div className="delete-confirmation-modal">
          <div className="modal-content">
            <h3>Confirmer la suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer ce lieu ? Cette action est irréversible.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                Annuler
              </button>
              <button className="btn-danger" onClick={handleDelete}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LieuDetails;
EOL

# Mise à jour de la page des lieux
cat > src/pages/LieuxPage.js << 'EOL'
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LieuxList from '../components/lieux/LieuxList';
import LieuDetails from '../components/lieux/LieuDetails';
import LieuForm from '../components/forms/LieuForm';

function LieuxPage() {
  return (
    <div className="lieux-page">
      <h2>Lieux</h2>
      <Routes>
        <Route path="/" element={<LieuxList />} />
        <Route path="/nouveau" element={<LieuForm />} />
        <Route path="/:id" element={<LieuDetails />} />
        <Route path="/:id/modifier" element={<LieuForm />} />
      </Routes>
    </div>
  );
}

export default LieuxPage;
EOL

echo "Implémentation de la fonctionnalité des programmateurs..."

# Création de la liste des programmateurs
cat > src/components/programmateurs/ProgrammateursList.js << 'EOL'
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

function ProgrammateursList() {
  const [programmateurs, setProgrammateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgrammateurs = async () => {
      try {
        const q = query(collection(db, 'programmateurs'), orderBy('raisonSociale'));
        const querySnapshot = await getDocs(q);
        
        const programmateursData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setProgrammateurs(programmateursData);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des programmateurs:", err);
        setError("Une erreur est survenue lors du chargement des programmateurs.");
        setLoading(false);
      }
    };

    fetchProgrammateurs();
  }, []);

  if (loading) {
    return <div className="loading">Chargement des programmateurs...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="programmateurs-list">
      <div className="list-header">
        <h2>Liste des programmateurs</h2>
        <Link to="/programmateurs/nouveau" className="btn-primary">
          + Nouveau programmateur
        </Link>
      </div>
      
      {programmateurs.length === 0 ? (
        <div className="empty-list">
          <p>Aucun programmateur n'a été créé pour le moment.</p>
          <Link to="/programmateurs/nouveau" className="btn-secondary">
            Créer votre premier programmateur
          </Link>
        </div>
      ) : (
        <div className="list-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Raison sociale</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Ville</th>
              </tr>
            </thead>
            <tbody>
              {programmateurs.map(programmateur => (
                <tr key={programmateur.id}>
                  <td>
                    <Link to={`/programmateurs/${programmateur.id}`} className="item-link">
                      {programmateur.raisonSociale}
                    </Link>
                  </td>
                  <td>{programmateur.nom && programmateur.prenom ? `${programmateur.prenom} ${programmateur.nom}` : '-'}</td>
                  <td>{programmateur.email || '-'}</td>
                  <td>{programmateur.telephone || '-'}</td>
                  <td>{programmateur.ville || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ProgrammateursList;
EOL

# Création de la page de détails d'un programmateur
cat > src/components/programmateurs/ProgrammateurDetails.js << 'EOL'
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';

function ProgrammateurDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [programmateur, setProgrammateur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [concertsAssocies, setConcertsAssocies] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchProgrammateur = async () => {
      try {
        const programmateurDoc = await getDoc(doc(db, 'programmateurs', id));
        
        if (programmateurDoc.exists()) {
          setProgrammateur({
            id: programmateurDoc.id,
            ...programmateurDoc.data()
          });
        } else {
          setError("Ce programmateur n'existe pas.");
        }
        
        // Récupérer les concerts associés à ce programmateur
        const concertsQuery = query(
          collection(db, 'concerts'),
          where('programmateurId', '==', id)
        );
        
        const concertsSnapshot = await getDocs(concertsQuery);
        const concertsData = concertsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setConcertsAssocies(concertsData);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement du programmateur:", err);
        setError("Une erreur est survenue lors du chargement du programmateur.");
        setLoading(false);
      }
    };

    fetchProgrammateur();
  }, [id]);

  const handleDelete = async () => {
    if (concertsAssocies.length > 0) {
      setError("Impossible de supprimer ce programmateur car il est associé à des concerts.");
      setShowDeleteConfirm(false);
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'programmateurs', id));
      navigate('/programmateurs');
    } catch (err) {
      console.error("Erreur lors de la suppression du programmateur:", err);
      setError("Une erreur est survenue lors de la suppression du programmateur.");
    }
  };

  if (loading) {
    return <div className="loading">Chargement du programmateur...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!programmateur) {
    return <div className="not-found">Programmateur non trouvé.</div>;
  }

  return (
    <div className="programmateur-details">
      <div className="details-header">
        <h2>{programmateur.raisonSociale}</h2>
        <div className="actions">
          <Link to={`/programmateurs/${id}/modifier`} className="btn-secondary">
            Modifier
          </Link>
          <button 
            className="btn-danger" 
            onClick={() => setShowDeleteConfirm(true)}
            disabled={concertsAssocies.length > 0}
          >
            Supprimer
          </button>
        </div>
      </div>
      
      <div className="details-content">
        <div className="details-section">
          <h3>Informations générales</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="label">Type de structure</span>
              <span className="value">{programmateur.typeStructure || 'Non spécifié'}</span>
            </div>
            <div className="detail-item">
              <span className="label">SIRET</span>
              <span className="value">{programmateur.siret || 'Non spécifié'}</span>
            </div>
            <div className="detail-item">
              <span className="label">N° TVA intracommunautaire</span>
              <span className="value">{programmateur.tvaIntra || 'Non spécifié'}</span>
            </div>
          </div>
        </div>
        
        <div className="details-section">
          <h3>Adresse</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="label">Adresse</span>
              <span className="value">{programmateur.adresse || 'Non spécifiée'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Code postal</span>
              <span className="value">{programmateur.codePostal || 'Non spécifié'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Ville</span>
              <span className="value">{programmateur.ville || 'Non spécifiée'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Pays</span>
              <span className="value">{programmateur.pays || 'Non spécifié'}</span>
            </div>
          </div>
        </div>
        
        <div className="details-section">
          <h3>Contact</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="label">Nom</span>
              <span className="value">{programmateur.nom || 'Non spécifié'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Prénom</span>
              <span className="value">{programmateur.prenom || 'Non spécifié'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Fonction</span>
              <span className="value">{programmateur.fonction || 'Non spécifiée'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Email</span>
              <span className="value">{programmateur.email || 'Non spécifié'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Téléphone</span>
              <span className="value">{programmateur.telephone || 'Non spécifié'}</span>
            </div>
          </div>
        </div>
        
        <div className="details-section">
          <h3>Paiement</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="label">Mode de paiement</span>
              <span className="value">{programmateur.modePaiement || 'Non spécifié'}</span>
            </div>
            <div className="detail-item">
              <span className="label">IBAN</span>
              <span className="value">{programmateur.iban || 'Non spécifié'}</span>
            </div>
            <div className="detail-item">
              <span className="label">BIC</span>
              <span className="value">{programmateur.bic || 'Non spécifié'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Titulaire du compte</span>
              <span className="value">{programmateur.titulaire || 'Non spécifié'}</span>
            </div>
          </div>
        </div>
        
        <div className="details-section">
          <h3>Concerts associés ({concertsAssocies.length})</h3>
          {concertsAssocies.length === 0 ? (
            <p>Aucun concert n'est associé à ce programmateur.</p>
          ) : (
            <ul className="associated-items">
              {concertsAssocies.map(concert => (
                <li key={concert.id}>
                  <Link to={`/concerts/${concert.id}`}>
                    {new Date(concert.date).toLocaleDateString()} - {concert.lieuNom || 'Lieu non spécifié'}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {showDeleteConfirm && (
        <div className="delete-confirmation-modal">
          <div className="modal-content">
            <h3>Confirmer la suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer ce programmateur ? Cette action est irréversible.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                Annuler
              </button>
              <button className="btn-danger" onClick={handleDelete}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgrammateurDetails;
EOL

# Mise à jour de la page des programmateurs
cat > src/pages/ProgrammateursPage.js << 'EOL'
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProgrammateursList from '../components/programmateurs/ProgrammateursList';
import ProgrammateurDetails from '../components/programmateurs/ProgrammateurDetails';
import ProgrammateurForm from '../components/forms/ProgrammateurForm';

function ProgrammateursPage() {
  return (
    <div className="programmateurs-page">
      <h2>Programmateurs</h2>
      <Routes>
        <Route path="/" element={<ProgrammateursList />} />
        <Route path="/nouveau" element={<ProgrammateurForm />} />
        <Route path="/:id" element={<ProgrammateurDetails />} />
        <Route path="/:id/modifier" element={<ProgrammateurForm />} />
      </Routes>
    </div>
  );
}

export default ProgrammateursPage;
EOL

echo "Correction du formulaire d'ajout de concert..."

# Mise à jour du formulaire d'ajout de concert
cat > src/components/concerts/ConcertForm.js << 'EOL'
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import LieuForm from '../forms/LieuForm';
import ProgrammateurForm from '../forms/ProgrammateurForm';

function ConcertForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    date: '',
    montant: '',
    statut: 'option',
    lieuId: '',
    lieuNom: '',
    programmateurId: '',
    programmateurNom: ''
  });
  const [errors, setErrors] = useState({});
  const [lieux, setLieux] = useState([]);
  const [programmateurs, setProgrammateurs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLieuForm, setShowLieuForm] = useState(false);
  const [showProgrammateurForm, setShowProgrammateurForm] = useState(false);

  // Charger les lieux et programmateurs existants
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger les lieux
        const lieuxSnapshot = await getDocs(collection(db, 'lieux'));
        const lieuxData = lieuxSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLieux([
          { id: 'new', nom: '+ Créer un nouveau lieu' },
          ...lieuxData
        ]);

        // Charger les programmateurs
        const programmateursSnapshot = await getDocs(collection(db, 'programmateurs'));
        const programmateursData = programmateursSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProgrammateurs([
          { id: 'new', nom: '+ Créer un nouveau programmateur' },
          ...programmateursData
        ]);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };

    fetchData();
  }, []);

  // Surveiller les changements dans formData pour mettre à jour les erreurs
  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const newErrors = {};
    
    // Validation étape 1
    if (step === 1) {
      if (!formData.date) newErrors.date = "La date est requise";
      if (!formData.montant) newErrors.montant = "Le montant est requis";
      if (!formData.statut) newErrors.statut = "Le statut est requis";
    }
    
    // Validation étape 2
    if (step === 2) {
      if (!formData.lieuId) newErrors.lieuId = "Le lieu est requis";
    }
    
    // Validation étape 3
    if (step === 3) {
      if (!formData.programmateurId) newErrors.programmateurId = "Le programmateur est requis";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'lieuId') {
      if (value === 'new') {
        setShowLieuForm(true);
      } else {
        const selectedLieu = lieux.find(lieu => lieu.id === value);
        setFormData({
          ...formData,
          lieuId: value,
          lieuNom: selectedLieu ? selectedLieu.nom : ''
        });
      }
    } else if (name === 'programmateurId') {
      if (value === 'new') {
        setShowProgrammateurForm(true);
      } else {
        const selectedProgrammateur = programmateurs.find(prog => prog.id === value);
        setFormData({
          ...formData,
          programmateurId: value,
          programmateurNom: selectedProgrammateur ? (selectedProgrammateur.raisonSociale || selectedProgrammateur.nom) : ''
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleLieuCreated = (newLieu) => {
    if (newLieu) {
      // Ajouter le nouveau lieu à la liste
      setLieux(prevLieux => [
        { id: 'new', nom: '+ Créer un nouveau lieu' },
        { id: newLieu.id, nom: newLieu.nom },
        ...prevLieux.filter(lieu => lieu.id !== 'new')
      ]);
      
      // Sélectionner le nouveau lieu
      setFormData({
        ...formData,
        lieuId: newLieu.id,
        lieuNom: newLieu.nom
      });
    }
    
    setShowLieuForm(false);
  };

  const handleProgrammateurCreated = (newProgrammateur) => {
    if (newProgrammateur) {
      // Ajouter le nouveau programmateur à la liste
      setProgrammateurs(prevProgrammateurs => [
        { id: 'new', nom: '+ Créer un nouveau programmateur' },
        { id: newProgrammateur.id, nom: newProgrammateur.raisonSociale || newProgrammateur.nom },
        ...prevProgrammateurs.filter(prog => prog.id !== 'new')
      ]);
      
      // Sélectionner le nouveau programmateur
      setFormData({
        ...formData,
        programmateurId: newProgrammateur.id,
        programmateurNom: newProgrammateur.raisonSociale || newProgrammateur.nom
      });
    }
    
    setShowProgrammateurForm(false);
  };

  const nextStep = () => {
    if (validateForm()) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Ajouter le concert à Firestore
      const concertRef = await addDoc(collection(db, 'concerts'), {
        date: formData.date,
        montant: parseFloat(formData.montant),
        statut: formData.statut,
        lieuId: formData.lieuId,
        lieuNom: formData.lieuNom,
        programmateurId: formData.programmateurId,
        programmateurNom: formData.programmateurNom,
        createdAt: new Date(),
        formulaireEnvoye: false
      });
      
      // Rediriger vers la page de détails du concert
      navigate(`/concerts/${concertRef.id}`);
    } catch (error) {
      console.error("Erreur lors de la création du concert:", error);
      setErrors({ submit: "Erreur lors de la création du concert. Veuillez réessayer." });
    } finally {
      setLoading(false);
    }
  };

  // Rendu de l'étape 1 : Informations de base
  const renderStep1 = () => (
    <div className="form-step">
      <h3>Informations de base</h3>
      
      <div className="form-group">
        <label htmlFor="date">Date du concert *</label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={errors.date ? 'error' : ''}
        />
        {errors.date && <div className="error-message">{errors.date}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="montant">Montant (€) *</label>
        <input
          type="number"
          id="montant"
          name="montant"
          value={formData.montant}
          onChange={handleChange}
          className={errors.montant ? 'error' : ''}
        />
        {errors.montant && <div className="error-message">{errors.montant}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="statut">Statut *</label>
        <select
          id="statut"
          name="statut"
          value={formData.statut}
          onChange={handleChange}
          className={errors.statut ? 'error' : ''}
        >
          <option value="option">Option</option>
          <option value="confirme">Confirmé</option>
          <option value="annule">Annulé</option>
        </select>
        {errors.statut && <div className="error-message">{errors.statut}</div>}
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={nextStep} className="btn-primary">
          Suivant
        </button>
      </div>
    </div>
  );

  // Rendu de l'étape 2 : Choix du lieu
  const renderStep2 = () => (
    <div className="form-step">
      <h3>Lieu du concert</h3>
      
      <div className="form-group">
        <label htmlFor="lieuId">Sélectionner un lieu *</label>
        <select
          id="lieuId"
          name="lieuId"
          value={formData.lieuId}
          onChange={handleChange}
          className={errors.lieuId ? 'error' : ''}
        >
          <option value="">Sélectionner</option>
          {lieux.map(lieu => (
            <option key={lieu.id} value={lieu.id}>
              {lieu.nom}
            </option>
          ))}
        </select>
        {errors.lieuId && <div className="error-message">{errors.lieuId}</div>}
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={prevStep} className="btn-secondary">
          Précédent
        </button>
        <button type="button" onClick={nextStep} className="btn-primary">
          Suivant
        </button>
      </div>
    </div>
  );

  // Rendu de l'étape 3 : Choix du programmateur
  const renderStep3 = () => (
    <div className="form-step">
      <h3>Programmateur</h3>
      
      <div className="form-group">
        <label htmlFor="programmateurId">Sélectionner un programmateur *</label>
        <select
          id="programmateurId"
          name="programmateurId"
          value={formData.programmateurId}
          onChange={handleChange}
          className={errors.programmateurId ? 'error' : ''}
        >
          <option value="">Sélectionner</option>
          {programmateurs.map(programmateur => (
            <option key={programmateur.id} value={programmateur.id}>
              {programmateur.raisonSociale || programmateur.nom}
            </option>
          ))}
        </select>
        {errors.programmateurId && <div className="error-message">{errors.programmateurId}</div>}
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={prevStep} className="btn-secondary">
          Précédent
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Création en cours...' : 'Créer le concert'}
        </button>
      </div>
    </div>
  );

  if (showLieuForm) {
    return (
      <div className="modal-container">
        <div className="modal-content">
          <h2>Créer un nouveau lieu</h2>
          <LieuForm onLieuCreated={handleLieuCreated} isModal={true} />
        </div>
      </div>
    );
  }

  if (showProgrammateurForm) {
    return (
      <div className="modal-container">
        <div className="modal-content">
          <h2>Créer un nouveau programmateur</h2>
          <ProgrammateurForm onProgrammateurCreated={handleProgrammateurCreated} isModal={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="concert-form-container">
      <h2>Création d'un nouveau concert</h2>
      
      <div className="form-progress">
        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1. Informations</div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2. Lieu</div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3. Programmateur</div>
      </div>
      
      {errors.submit && <div className="error-message global">{errors.submit}</div>}
      
      <form onSubmit={handleSubmit}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </form>
    </div>
  );
}

export default ConcertForm;
EOL

echo "Implémentation de la génération de formulaire..."

# Création du composant de génération de formulaire
cat > src/components/forms/FormGenerator.js << 'EOL'
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, addDoc, collection, updateDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

function FormGenerator() {
  const { concertId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formLink, setFormLink] = useState('');
  const [concert, setConcert] = useState(null);

  // Charger les détails du concert
  React.useEffect(() => {
    const fetchConcert = async () => {
      try {
        const concertDoc = await getDoc(doc(db, 'concerts', concertId));
        if (concertDoc.exists()) {
          setConcert({
            id: concertDoc.id,
            ...concertDoc.data()
          });
        } else {
          setError("Ce concert n'existe pas.");
        }
      } catch (err) {
        console.error("Erreur lors du chargement du concert:", err);
        setError("Une erreur est survenue lors du chargement du concert.");
      }
    };

    fetchConcert();
  }, [concertId]);

  const generateForm = async () => {
    if (!concert) {
      setError("Impossible de générer le formulaire: concert non trouvé.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Générer un token unique
      const token = uuidv4();
      
      // Créer un document de formulaire dans Firestore
      const formData = {
        concertId: concertId,
        token: token,
        dateCreation: new Date(),
        statut: 'en_attente', // en_attente, soumis, valide
        reponses: null
      };
      
      const formRef = await addDoc(collection(db, 'formulaires'), formData);
      
      // Mettre à jour le concert avec l'ID du formulaire
      await updateDoc(doc(db, 'concerts', concertId), {
        formulaireId: formRef.id,
        formulaireEnvoye: true,
        formulaireToken: token
      });
      
      // Construire le lien du formulaire
      const baseUrl = window.location.origin;
      const formLink = `${baseUrl}/formulaire/${concertId}/${token}`;
      
      setFormLink(formLink);
      setSuccess(true);
    } catch (err) {
      console.error("Erreur lors de la génération du formulaire:", err);
      setError("Une erreur est survenue lors de la génération du formulaire.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formLink)
      .then(() => {
        alert("Lien copié dans le presse-papier !");
      })
      .catch(err => {
        console.error("Erreur lors de la copie du lien:", err);
        alert("Impossible de copier le lien. Veuillez le sélectionner manuellement.");
      });
  };

  if (!concert) {
    return <div className="loading">Chargement du concert...</div>;
  }

  return (
    <div className="form-generator">
      <h2>Générer un formulaire pour le programmateur</h2>
      
      <div className="concert-info">
        <h3>Informations du concert</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Date</span>
            <span className="value">{new Date(concert.date).toLocaleDateString()}</span>
          </div>
          <div className="info-item">
            <span className="label">Lieu</span>
            <span className="value">{concert.lieuNom || 'Non spécifié'}</span>
          </div>
          <div className="info-item">
            <span className="label">Programmateur</span>
            <span className="value">{concert.programmateurNom || 'Non spécifié'}</span>
          </div>
          <div className="info-item">
            <span className="label">Montant</span>
            <span className="value">{concert.montant} €</span>
          </div>
          <div className="info-item">
            <span className="label">Statut</span>
            <span className="value">{
              concert.statut === 'option' ? 'Option' :
              concert.statut === 'confirme' ? 'Confirmé' :
              concert.statut === 'annule' ? 'Annulé' : concert.statut
            }</span>
          </div>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {success ? (
        <div className="success-container">
          <div className="success-message">
            <p>Le formulaire a été généré avec succès !</p>
            <p>Envoyez ce lien au programmateur pour qu'il puisse remplir les informations nécessaires :</p>
          </div>
          
          <div className="form-link-container">
            <input 
              type="text" 
              value={formLink} 
              readOnly 
              className="form-link-input"
              onClick={(e) => e.target.select()}
            />
            <button onClick={copyToClipboard} className="btn-secondary">
              Copier le lien
            </button>
          </div>
          
          <div className="form-actions">
            <button onClick={() => navigate(`/concerts/${concertId}`)} className="btn-primary">
              Retour au concert
            </button>
          </div>
        </div>
      ) : (
        <div className="generator-actions">
          <p>
            Générer un formulaire à envoyer au programmateur pour recueillir les informations nécessaires 
            à la contractualisation et à la facturation.
          </p>
          
          {concert.formulaireEnvoye ? (
            <div className="warning-message">
              <p>Un formulaire a déjà été généré pour ce concert.</p>
              <p>Générer un nouveau formulaire remplacera l'ancien.</p>
            </div>
          ) : null}
          
          <button 
            onClick={generateForm} 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Génération en cours...' : 'Générer le formulaire'}
          </button>
          
          <button 
            onClick={() => navigate(`/concerts/${concertId}`)} 
            className="btn-secondary"
          >
            Annuler
          </button>
        </div>
      )}
    </div>
  );
}

export default FormGenerator;
EOL

# Mise à jour de la page de réponse au formulaire
cat > src/pages/FormResponsePage.js << 'EOL'
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

function FormResponsePage() {
  const { concertId, token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState(null);
  const [concert, setConcert] = useState(null);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Vérifier si le concert existe
        const concertDoc = await getDoc(doc(db, 'concerts', concertId));
        if (!concertDoc.exists()) {
          setError("Ce concert n'existe pas.");
          setLoading(false);
          return;
        }

        setConcert({
          id: concertDoc.id,
          ...concertDoc.data()
        });

        // Vérifier si le token correspond
        if (concertDoc.data().formulaireToken !== token) {
          setError("Ce lien de formulaire n'est pas valide.");
          setLoading(false);
          return;
        }

        setTokenValid(true);

        // Récupérer le formulaire
        if (concertDoc.data().formulaireId) {
          const formDoc = await getDoc(doc(db, 'formulaires', concertDoc.data().formulaireId));
          if (formDoc.exists()) {
            setFormData({
              id: formDoc.id,
              ...formDoc.data()
            });

            // Vérifier si le formulaire a déjà été soumis
            if (formDoc.data().statut === 'soumis' || formDoc.data().statut === 'valide') {
              setSuccess(true);
            }
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Une erreur est survenue lors du chargement du formulaire.");
        setLoading(false);
      }
    };

    fetchData();
  }, [concertId, token]);

  if (loading) {
    return <div className="loading">Chargement du formulaire...</div>;
  }

  if (error) {
    return (
      <div className="form-response-error">
        <h2>Erreur</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="form-response-success">
        <h2>Formulaire déjà soumis</h2>
        <p>Vous avez déjà soumis ce formulaire. Merci pour votre participation !</p>
        <p>L'organisateur du concert a bien reçu vos informations.</p>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="form-response-error">
        <h2>Lien invalide</h2>
        <p>Ce lien de formulaire n'est pas valide ou a expiré.</p>
        <p>Veuillez contacter l'organisateur pour obtenir un nouveau lien.</p>
      </div>
    );
  }

  return (
    <div className="form-response-page">
      <h2>Formulaire programmateur</h2>
      <p>Ce formulaire est en cours d'implémentation. Veuillez revenir ultérieurement.</p>
      
      {concert && (
        <div className="concert-info">
          <h3>Informations du concert</h3>
          <p><strong>Date:</strong> {new Date(concert.date).toLocaleDateString()}</p>
          <p><strong>Lieu:</strong> {concert.lieuNom || 'À déterminer'}</p>
          <p><strong>Montant:</strong> {concert.montant} €</p>
        </div>
      )}
    </div>
  );
}

export default FormResponsePage;
EOL

# Mise à jour de la page de détails d'un concert
cat > src/components/concerts/ConcertDetails.js << 'EOL'
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import FormGenerator from '../forms/FormGenerator';

function ConcertDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lieu, setLieu] = useState(null);
  const [programmateur, setProgrammateur] = useState(null);
  const [showFormGenerator, setShowFormGenerator] = useState(false);

  useEffect(() => {
    const fetchConcert = async () => {
      try {
        const concertDoc = await getDoc(doc(db, 'concerts', id));
        
        if (concertDoc.exists()) {
          const concertData = {
            id: concertDoc.id,
            ...concertDoc.data()
          };
          
          setConcert(concertData);
          
          // Récupérer les détails du lieu
          if (concertData.lieuId) {
            try {
              const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
              if (lieuDoc.exists()) {
                setLieu({
                  id: lieuDoc.id,
                  ...lieuDoc.data()
                });
              }
            } catch (err) {
              console.error("Erreur lors du chargement du lieu:", err);
            }
          }
          
          // Récupérer les détails du programmateur
          if (concertData.programmateurId) {
            try {
              const programmateurDoc = await getDoc(doc(db, 'programmateurs', concertData.programmateurId));
              if (programmateurDoc.exists()) {
                setProgrammateur({
                  id: programmateurDoc.id,
                  ...programmateurDoc.data()
                });
              }
            } catch (err) {
              console.error("Erreur lors du chargement du programmateur:", err);
            }
          }
        } else {
          setError("Ce concert n'existe pas.");
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement du concert:", err);
        setError("Une erreur est survenue lors du chargement du concert.");
        setLoading(false);
      }
    };

    fetchConcert();
  }, [id]);

  if (loading) {
    return <div className="loading">Chargement du concert...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!concert) {
    return <div className="not-found">Concert non trouvé.</div>;
  }

  if (showFormGenerator) {
    return <FormGenerator />;
  }

  return (
    <div className="concert-details">
      <div className="details-header">
        <h2>Concert du {new Date(concert.date).toLocaleDateString()}</h2>
        <div className="actions">
          <Link to={`/concerts/${id}/modifier`} className="btn-secondary">
            Modifier
          </Link>
          <button 
            className="btn-primary" 
            onClick={() => navigate(`/concerts/${id}/formulaire`)}
            disabled={!concert.programmateurId}
          >
            {concert.formulaireEnvoye ? 'Regénérer le formulaire' : 'Générer le formulaire'}
          </button>
        </div>
      </div>
      
      <div className="details-content">
        <div className="details-section">
          <h3>Informations générales</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="label">Date</span>
              <span className="value">{new Date(concert.date).toLocaleDateString()}</span>
            </div>
            <div className="detail-item">
              <span className="label">Montant</span>
              <span className="value">{concert.montant} €</span>
            </div>
            <div className="detail-item">
              <span className="label">Statut</span>
              <span className="value">
                {concert.statut === 'option' ? 'Option' :
                 concert.statut === 'confirme' ? 'Confirmé' :
                 concert.statut === 'annule' ? 'Annulé' : concert.statut}
              </span>
            </div>
          </div>
        </div>
        
        <div className="details-section">
          <h3>Lieu</h3>
          {lieu ? (
            <div className="details-grid">
              <div className="detail-item">
                <span className="label">Nom</span>
                <span className="value">
                  <Link to={`/lieux/${lieu.id}`}>{lieu.nom}</Link>
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Adresse</span>
                <span className="value">{lieu.adresse}</span>
              </div>
              <div className="detail-item">
                <span className="label">Ville</span>
                <span className="value">{lieu.codePostal} {lieu.ville}</span>
              </div>
              <div className="detail-item">
                <span className="label">Pays</span>
                <span className="value">{lieu.pays}</span>
              </div>
            </div>
          ) : (
            <p>Aucun lieu spécifié. <Link to={`/concerts/${id}/modifier`}>Ajouter un lieu</Link></p>
          )}
        </div>
        
        <div className="details-section">
          <h3>Programmateur</h3>
          {programmateur ? (
            <div className="details-grid">
              <div className="detail-item">
                <span className="label">Structure</span>
                <span className="value">
                  <Link to={`/programmateurs/${programmateur.id}`}>
                    {programmateur.raisonSociale}
                  </Link>
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Contact</span>
                <span className="value">
                  {programmateur.prenom} {programmateur.nom}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Email</span>
                <span className="value">{programmateur.email}</span>
              </div>
              <div className="detail-item">
                <span className="label">Téléphone</span>
                <span className="value">{programmateur.telephone}</span>
              </div>
            </div>
          ) : (
            <p>Aucun programmateur spécifié. <Link to={`/concerts/${id}/modifier`}>Ajouter un programmateur</Link></p>
          )}
        </div>
        
        <div className="details-section">
          <h3>Formulaire</h3>
          {concert.formulaireEnvoye ? (
            <div>
              <p>Un formulaire a été généré pour ce concert.</p>
              {concert.formulaireToken && (
                <div className="form-link-container">
                  <p>Lien du formulaire :</p>
                  <input 
                    type="text" 
                    value={`${window.location.origin}/formulaire/${concert.id}/${concert.formulaireToken}`} 
                    readOnly 
                    className="form-link-input"
                    onClick={(e) => e.target.select()}
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/formulaire/${concert.id}/${concert.formulaireToken}`);
                      alert("Lien copié dans le presse-papier !");
                    }} 
                    className="btn-secondary"
                  >
                    Copier le lien
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p>
              Aucun formulaire n'a été généré pour ce concert. 
              <button 
                onClick={() => navigate(`/concerts/${id}/formulaire`)} 
                className="btn-link"
                disabled={!concert.programmateurId}
              >
                Générer un formulaire
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConcertDetails;
EOL

# Installation des dépendances nécessaires
echo "Installation des dépendances nécessaires..."
npm install uuid --save

echo "Toutes les corrections ont été appliquées avec succès !"
echo "Vous pouvez maintenant démarrer l'application avec 'npm start'"
