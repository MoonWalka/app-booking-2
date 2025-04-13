#!/bin/bash

# Script de correction complète pour l'application App Booking
# Ce script corrige les problèmes de validation du formulaire de création de concert
# et implémente le parcours utilisateur Option A

echo "🔧 Début des corrections pour App Booking..."

# Vérification que nous sommes dans le bon répertoire
if [ ! -d "src" ]; then
  echo "❌ Erreur: Ce script doit être exécuté à la racine du projet App Booking"
  exit 1
fi

# Création des répertoires nécessaires s'ils n'existent pas
mkdir -p src/components/concerts
mkdir -p src/pages

# 1. Correction du composant ConcertForm.js
echo "📝 Création du composant ConcertForm.js avec correction de la validation..."

cat > src/components/concerts/ConcertForm.js << 'EOL'
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ConcertForm = ({ onCancel, onSubmit }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: '',
    lieu: '',
    programmateur: '',
    montant: '',
    statut: 'Contact établi'
  });
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  
  // Effet pour déboguer les changements de formData
  useEffect(() => {
    console.log('État actuel du formulaire:', formData);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Modification de ${name} avec la valeur: ${value}`);
    
    // Mise à jour de l'état avec la nouvelle valeur
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Effacer l'erreur pour ce champ si elle existe
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: null
      }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.date) newErrors.date = 'La date est requise';
    if (!formData.montant) newErrors.montant = 'Le montant est requis';
    if (!formData.statut) newErrors.statut = 'Le statut est requis';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.lieu) newErrors.lieu = 'Le lieu est requis';
    
    setErrors(newErrors);
    console.log('Validation étape 2:', newErrors, formData.lieu);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.programmateur) newErrors.programmateur = 'Le programmateur est requis';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 3 && validateStep3()) {
      // Simuler l'enregistrement du concert
      console.log('Concert créé:', formData);
      
      // Afficher un message de succès
      alert('Concert créé avec succès! Un formulaire a été envoyé au programmateur.');
      
      // Rediriger vers la liste des concerts
      navigate('/concerts');
    }
  };

  return (
    <div className="concert-form-container">
      <h2>Création d'un concert - Étape {step}/3</h2>
      
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="form-step">
            <h3>Informations de base</h3>
            
            <div className="form-group">
              <label>Date du concert:</label>
              <input 
                type="date" 
                name="date" 
                value={formData.date} 
                onChange={handleChange}
                className={errors.date ? 'error' : ''}
              />
              {errors.date && <span className="error-message">{errors.date}</span>}
            </div>
            
            <div className="form-group">
              <label>Montant (€):</label>
              <input 
                type="number" 
                name="montant" 
                value={formData.montant} 
                onChange={handleChange}
                className={errors.montant ? 'error' : ''}
              />
              {errors.montant && <span className="error-message">{errors.montant}</span>}
            </div>
            
            <div className="form-group">
              <label>Statut:</label>
              <select 
                name="statut" 
                value={formData.statut} 
                onChange={handleChange}
                className={errors.statut ? 'error' : ''}
              >
                <option value="Contact établi">Contact établi</option>
                <option value="Pré-accord">Pré-accord</option>
                <option value="Contrat signé">Contrat signé</option>
                <option value="Acompte facturé">Acompte facturé</option>
                <option value="Solde facturé">Solde facturé</option>
              </select>
              {errors.statut && <span className="error-message">{errors.statut}</span>}
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="form-step">
            <h3>Choix du lieu</h3>
            
            <div className="form-group">
              <label>Lieu:</label>
              <select 
                name="lieu" 
                value={formData.lieu} 
                onChange={handleChange}
                className={errors.lieu ? 'error' : ''}
              >
                <option value="">Sélectionner un lieu</option>
                <option value="Salle de Concert Exemple #1">Salle de Concert Exemple #1</option>
                <option value="Théâtre Exemple #2">Théâtre Exemple #2</option>
                <option value="nouveau">+ Créer un nouveau lieu</option>
              </select>
              {errors.lieu && <span className="error-message">{errors.lieu}</span>}
            </div>
            
            {formData.lieu === 'nouveau' && (
              <div className="form-group">
                <label>Nom du nouveau lieu:</label>
                <input 
                  type="text" 
                  name="nouveauLieu" 
                  onChange={(e) => setFormData({...formData, lieu: e.target.value})}
                />
              </div>
            )}
          </div>
        )}
        
        {step === 3 && (
          <div className="form-step">
            <h3>Choix du programmateur</h3>
            
            <div className="form-group">
              <label>Programmateur:</label>
              <select 
                name="programmateur" 
                value={formData.programmateur} 
                onChange={handleChange}
                className={errors.programmateur ? 'error' : ''}
              >
                <option value="">Sélectionner un programmateur</option>
                <option value="Programmateur Exemple #1">Programmateur Exemple #1</option>
                <option value="Programmateur Exemple #2">Programmateur Exemple #2</option>
                <option value="nouveau">+ Créer un nouveau programmateur</option>
              </select>
              {errors.programmateur && <span className="error-message">{errors.programmateur}</span>}
            </div>
            
            {formData.programmateur === 'nouveau' && (
              <div className="form-group">
                <label>Nom du nouveau programmateur:</label>
                <input 
                  type="text" 
                  name="nouveauProgrammateur" 
                  onChange={(e) => setFormData({...formData, programmateur: e.target.value})}
                />
              </div>
            )}
            
            <div className="form-summary">
              <h4>Résumé du concert</h4>
              <p><strong>Date:</strong> {formData.date}</p>
              <p><strong>Lieu:</strong> {formData.lieu}</p>
              <p><strong>Programmateur:</strong> {formData.programmateur}</p>
              <p><strong>Montant:</strong> {formData.montant} €</p>
              <p><strong>Statut:</strong> {formData.statut}</p>
            </div>
          </div>
        )}
        
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">
            Annuler
          </button>
          
          {step > 1 && (
            <button type="button" onClick={handlePrevStep} className="btn-prev">
              Précédent
            </button>
          )}
          
          {step < 3 ? (
            <button type="button" onClick={handleNextStep} className="btn-next">
              Suivant
            </button>
          ) : (
            <button type="submit" className="btn-submit">
              Créer le concert
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ConcertForm;
EOL

# 2. Création du composant ConcertsList.js
echo "📝 Création du composant ConcertsList.js..."

cat > src/components/concerts/ConcertsList.js << 'EOL'
import React, { useState } from 'react';

const ConcertsList = ({ onAddConcert }) => {
  const [filter, setFilter] = useState({
    statut: 'Tous',
    periode: 'Tous'
  });

  // Données de démonstration pour les concerts
  const concertsData = [
    {
      id: 1,
      date: '15/05/2025',
      lieu: 'Salle de Concert Exemple #1',
      programmateur: 'Programmateur Exemple #1',
      montant: '1500',
      statut: 'Contact établi'
    },
    {
      id: 2,
      date: '20/06/2025',
      lieu: 'Théâtre Exemple #2',
      programmateur: 'Programmateur Exemple #2',
      montant: '2200',
      statut: 'Pré-accord'
    },
    {
      id: 3,
      date: '10/07/2025',
      lieu: 'Salle de Concert Exemple #1',
      programmateur: 'Programmateur Exemple #1',
      montant: '1800',
      statut: 'Contrat signé'
    }
  ];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({
      ...filter,
      [name]: value
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Contact établi': return 'status-contact';
      case 'Pré-accord': return 'status-preaccord';
      case 'Contrat signé': return 'status-signed';
      case 'Acompte facturé': return 'status-deposit';
      case 'Solde facturé': return 'status-paid';
      default: return '';
    }
  };

  return (
    <div className="concerts-list-container">
      <h2>Gestion des Concerts</h2>
      
      <button onClick={onAddConcert} className="btn-add">
        Ajouter un concert
      </button>
      
      <div className="filters-container">
        <h3>Filtres</h3>
        
        <div className="filter-group">
          <label>Statut:</label>
          <select 
            name="statut" 
            value={filter.statut} 
            onChange={handleFilterChange}
          >
            <option value="Tous">Tous</option>
            <option value="Contact établi">Contact établi</option>
            <option value="Pré-accord">Pré-accord</option>
            <option value="Contrat signé">Contrat signé</option>
            <option value="Acompte facturé">Acompte facturé</option>
            <option value="Solde facturé">Solde facturé</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Période:</label>
          <select 
            name="periode" 
            value={filter.periode} 
            onChange={handleFilterChange}
          >
            <option value="Tous">Tous</option>
            <option value="À venir">À venir</option>
            <option value="Passés">Passés</option>
            <option value="Ce mois">Ce mois</option>
            <option value="Ce trimestre">Ce trimestre</option>
          </select>
        </div>
      </div>
      
      <h3>Liste des concerts</h3>
      
      <div className="concerts-list">
        {concertsData.map(concert => (
          <div key={concert.id} className="concert-item">
            <div className="concert-date">{concert.date}</div>
            
            <div className="concert-details">
              <div><strong>Lieu:</strong> {concert.lieu}</div>
              <div><strong>Programmateur:</strong> {concert.programmateur}</div>
              <div><strong>Montant:</strong> {concert.montant} €</div>
            </div>
            
            <div className="concert-status">
              <span className={getStatusClass(concert.statut)}>
                {concert.statut}
              </span>
            </div>
            
            <div className="concert-actions">
              <button className="btn-details">Détails</button>
              <button className="btn-edit">Modifier</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConcertsList;
EOL

# 3. Création de la page ConcertsPage.js
echo "📝 Création de la page ConcertsPage.js..."

cat > src/pages/ConcertsPage.js << 'EOL'
import React, { useState } from 'react';
import ConcertsList from '../components/concerts/ConcertsList';
import ConcertForm from '../components/concerts/ConcertForm';

const ConcertsPage = () => {
  const [showForm, setShowForm] = useState(false);

  const handleAddConcert = () => {
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  const handleSubmitForm = (formData) => {
    console.log('Nouveau concert:', formData);
    setShowForm(false);
    // Ici, vous ajouteriez normalement le concert à votre base de données
  };

  return (
    <div className="concerts-page">
      {showForm ? (
        <ConcertForm 
          onCancel={handleCancelForm} 
          onSubmit={handleSubmitForm} 
        />
      ) : (
        <ConcertsList onAddConcert={handleAddConcert} />
      )}
    </div>
  );
};

export default ConcertsPage;
EOL

# 4. Ajout des styles CSS pour les formulaires
echo "📝 Ajout des styles CSS pour les formulaires..."

cat > src/App.css << 'EOL'
/* Styles généraux */
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Styles de navigation */
.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #34495e;
}

.sidebar-header h1 {
  margin: 0;
  font-size: 24px;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-menu li {
  padding: 0;
}

.sidebar-menu a {
  display: block;
  padding: 15px 20px;
  color: white;
  text-decoration: none;
  transition: background-color 0.3s;
}

.sidebar-menu a:hover,
.sidebar-menu a.active {
  background-color: #34495e;
}

.main-content {
  margin-left: 250px;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
}

/* Styles pour les formulaires */
.form-step {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-group input.error,
.form-group select.error,
.form-group textarea.error {
  border-color: #e74c3c;
}

.error-message {
  color: #e74c3c;
  font-size: 14px;
  margin-top: 5px;
  display: block;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.btn-cancel,
.btn-prev,
.btn-next,
.btn-submit {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.btn-cancel {
  background-color: #95a5a6;
  color: white;
}

.btn-prev {
  background-color: #7f8c8d;
  color: white;
}

.btn-next,
.btn-submit {
  background-color: #3498db;
  color: white;
}

.btn-cancel:hover {
  background-color: #7f8c8d;
}

.btn-prev:hover {
  background-color: #6c7a7d;
}

.btn-next:hover,
.btn-submit:hover {
  background-color: #2980b9;
}

/* Styles pour la liste des concerts */
.concerts-list-container {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.btn-add {
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-bottom: 20px;
}

.btn-add:hover {
  background-color: #27ae60;
}

.filters-container {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.filter-group {
  display: inline-block;
  margin-right: 20px;
}

.concerts-list {
  margin-top: 20px;
}

.concert-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.concert-date {
  width: 100px;
  font-weight: bold;
}

.concert-details {
  flex: 1;
}

.concert-status {
  width: 150px;
  text-align: center;
}

.concert-status span {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 14px;
}

.status-contact {
  background-color: #3498db;
  color: white;
}

.status-preaccord {
  background-color: #f39c12;
  color: white;
}

.status-signed {
  background-color: #2ecc71;
  color: white;
}

.status-deposit {
  background-color: #9b59b6;
  color: white;
}

.status-paid {
  background-color: #27ae60;
  color: white;
}

.concert-actions {
  width: 150px;
  text-align: right;
}

.btn-details,
.btn-edit {
  padding: 5px 10px;
  margin-left: 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-details {
  background-color: #3498db;
  color: white;
}

.btn-edit {
  background-color: #f39c12;
  color: white;
}

.form-summary {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
}

.form-summary h4 {
  margin-top: 0;
  margin-bottom: 10px;
}
EOL

# 5. Mise à jour du fichier App.js pour inclure les routes
echo "📝 Mise à jour du fichier App.js..."

cat > src/App.js << 'EOL'
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Pages
import Dashboard from './pages/Dashboard';
import ConcertsPage from './pages/ConcertsPage';
import ProgrammateursPage from './pages/ProgrammateursPage';
import LieuxPage from './pages/LieuxPage';
import ContratsPage from './pages/ContratsPage';

function App() {
  return (
    <Router>
      <div className="app-container">
        <div className="sidebar">
          <div className="sidebar-header">
            <h1>Label Musical</h1>
            <p>Gestion des concerts et artistes</p>
          </div>
          <ul className="sidebar-menu">
            <li>
              <Link to="/">📊 Tableau de bord</Link>
            </li>
            <li>
              <Link to="/concerts">🎵 Concerts</Link>
            </li>
            <li>
              <Link to="/programmateurs">👥 Programmateurs</Link>
            </li>
            <li>
              <Link to="/lieux">📍 Lieux</Link>
            </li>
            <li>
              <Link to="/contrats">📄 Contrats</Link>
            </li>
          </ul>
        </div>
        
        <div className="main-content">
          <div className="header">
            <h2>Gestion des concerts</h2>
            <div className="user-info">
              Utilisateur Test
            </div>
          </div>
          
          <div className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/concerts" element={<ConcertsPage />} />
              <Route path="/programmateurs" element={<ProgrammateursPage />} />
              <Route path="/lieux" element={<LieuxPage />} />
              <Route path="/contrats" element={<ContratsPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
EOL

# 6. Création des pages placeholder
echo "📝 Création des pages placeholder..."

# Dashboard.js
cat > src/pages/Dashboard.js << 'EOL'
import React from 'react';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <h2>Tableau de bord</h2>
      
      <p>Bienvenue, Utilisateur Test !</p>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Concerts à venir</h3>
          <div className="stat-value">0</div>
        </div>
        
        <div className="stat-card">
          <h3>Contrats en attente</h3>
          <div className="stat-value">0</div>
        </div>
        
        <div className="stat-card">
          <h3>Programmateurs</h3>
          <div className="stat-value">0</div>
        </div>
        
        <div className="stat-card">
          <h3>Lieux</h3>
          <div className="stat-value">0</div>
        </div>
      </div>
      
      <div className="info-panel">
        <p>Cette page est en construction. Les fonctionnalités seront implémentées progressivement.</p>
      </div>
    </div>
  );
};

export default Dashboard;
EOL

# ProgrammateursPage.js
cat > src/pages/ProgrammateursPage.js << 'EOL'
import React from 'react';

const ProgrammateursPage = () => {
  return (
    <div className="programmateurs-page">
      <h2>Gestion des Programmateurs</h2>
      
      <div className="info-panel">
        <p>Cette page est en construction. La gestion des programmateurs sera implémentée prochainement.</p>
      </div>
    </div>
  );
};

export default ProgrammateursPage;
EOL

# LieuxPage.js
cat > src/pages/LieuxPage.js << 'EOL'
import React from 'react';

const LieuxPage = () => {
  return (
    <div className="lieux-page">
      <h2>Gestion des Lieux</h2>
      
      <div className="info-panel">
        <p>Cette page est en construction. La gestion des lieux sera implémentée prochainement.</p>
      </div>
    </div>
  );
};

export default LieuxPage;
EOL

# ContratsPage.js
cat > src/pages/ContratsPage.js << 'EOL'
import React from 'react';

const ContratsPage = () => {
  return (
    <div className="contrats-page">
      <h2>Gestion des Contrats</h2>
      
      <div className="info-panel">
        <p>Cette page est en construction. La génération et la gestion des contrats seront implémentées prochainement.</p>
      </div>
    </div>
  );
};

export default ContratsPage;
EOL

# 7. Mise à jour du fichier index.js
echo "📝 Mise à jour du fichier index.js..."

cat > src/index.js << 'EOL'
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
EOL

# 8. Mise à jour du fichier index.css
echo "📝 Mise à jour du fichier index.css..."

cat > src/index.css << 'EOL'
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

/* Styles pour les messages d'information */
.info-panel {
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
  padding: 15px;
  margin: 20px 0;
  border-radius: 4px;
}

/* Styles pour le tableau de bord */
.dashboard-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin: 20px 0;
}

.stat-card {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  flex: 1;
  min-width: 200px;
  text-align: center;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  color: #3498db;
  margin: 10px 0;
}

/* Styles pour les formulaires multi-étapes */
.concert-form-container {
  max-width: 800px;
  margin: 0 auto;
}

/* Styles pour les erreurs de validation */
input.error, select.error {
  border-color: #e74c3c !important;
  background-color: #fdf7f7;
}

.error-message {
  color: #e74c3c;
  font-size: 14px;
  margin-top: 5px;
}
EOL

# 9. Création du fichier firebase.js pour la configuration Firebase
echo "📝 Création du fichier firebase.js..."

cat > src/firebase.js << 'EOL'
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopment",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "app-booking-dev.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "app-booking-dev",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "app-booking-dev.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-ABCDEFGHIJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Configuration pour le mode développement/test
const BYPASS_AUTH = process.env.REACT_APP_BYPASS_AUTH === "false" ? false : true;

export { db, auth, BYPASS_AUTH };
export default app;
EOL

# 10. Création du fichier .env pour les variables d'environnement
echo "📝 Création du fichier .env..."

cat > .env << 'EOL'
REACT_APP_BYPASS_AUTH=true
REACT_APP_FIREBASE_API_KEY=AIzaSyDummyKeyForDevelopment
REACT_APP_FIREBASE_AUTH_DOMAIN=app-booking-dev.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=app-booking-dev
REACT_APP_FIREBASE_STORAGE_BUCKET=app-booking-dev.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
REACT_APP_FIREBASE_MEASUREMENT_ID=G-ABCDEFGHIJ
EOL

echo "✅ Toutes les corrections ont été appliquées avec succès!"
echo "🚀 Pour démarrer l'application, exécutez: npm start"
echo "🔨 Pour créer un build de production, exécutez: npm run build"
