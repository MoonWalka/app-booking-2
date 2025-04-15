#!/bin/bash

# Script d'implémentation de la fonctionnalité Artistes pour app-booking-2
# Ce script ajoute un nouvel onglet "Artistes" à l'application

echo "🚀 Début de l'implémentation de la fonctionnalité Artistes..."

# Vérifier que nous sommes dans le bon répertoire (à la racine du projet)
if [ ! -d "src" ] || [ ! -f "package.json" ]; then
  echo "❌ Erreur: Ce script doit être exécuté à la racine du projet app-booking-2."
  echo "Veuillez vous assurer que vous êtes dans le répertoire qui contient src/ et package.json."
  exit 1
fi

# Vérifier que nous sommes sur la bonne branche
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "refacto-structure-scriptShell" ]; then
  echo "⚠️ Attention: Vous n'êtes pas sur la branche refacto-structure-scriptShell."
  echo "Passage à la branche refacto-structure-scriptShell..."
  git checkout refacto-structure-scriptShell || {
    echo "❌ Erreur: Impossible de passer à la branche refacto-structure-scriptShell."
    exit 1
  }
fi

echo "📂 Sauvegarde des fichiers importants..."
mkdir -p .backup
cp -r src .backup/
cp package.json .backup/

echo "📁 Création des répertoires nécessaires..."
mkdir -p src/components/artistes
mkdir -p src/style
mkdir -p src/pages

echo "🎨 Création des fichiers CSS..."

# Création du fichier CSS pour la liste des artistes
cat > src/style/artistesList.css << 'EOL'
.artistes-list-container {
  padding: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.search-filter-container {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.search-input {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.search-input input {
  padding-left: 35px;
}

.filter-select {
  width: 200px;
}

.artistes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.artiste-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  background-color: #fff;
}

.artiste-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.artiste-photo {
  height: 180px;
  overflow: hidden;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.artiste-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-photo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #e9ecef;
  color: #6c757d;
}

.placeholder-photo i {
  font-size: 3rem;
}

.artiste-content {
  padding: 15px;
}

.artiste-name {
  margin: 0 0 5px 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.artiste-genre {
  color: #6c757d;
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.artiste-stats {
  display: flex;
  gap: 15px;
  font-size: 0.85rem;
  color: #495057;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.artiste-actions {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  background-color: #f8f9fa;
  border-top: 1px solid #e0e0e0;
}

.artiste-actions .btn {
  padding: 0.25rem 0.5rem;
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}
EOL

# Création du fichier CSS pour le formulaire d'artiste
cat > src/style/artisteForm.css << 'EOL'
.artiste-form-container {
  padding: 20px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.breadcrumb-item {
  color: #007bff;
  cursor: pointer;
}

.breadcrumb-separator {
  margin: 0 8px;
  color: #6c757d;
}

.breadcrumb-current {
  color: #6c757d;
  font-weight: 500;
}

.artiste-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.card-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.card-header i {
  font-size: 1.2rem;
  color: #6c757d;
}

.card-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  font-weight: 500;
  margin-bottom: 8px;
  display: block;
}

.required {
  color: #dc3545;
}

.membres-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.membre-item {
  display: flex;
  align-items: center;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.photo-preview {
  display: flex;
  justify-content: center;
}
EOL

# Création du fichier CSS pour les détails d'artiste
cat > src/style/artisteDetail.css << 'EOL'
.artiste-detail-container {
  padding: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  gap: 20px;
}

.header-image {
  width: 150px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
}

.header-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-photo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #e9ecef;
  color: #6c757d;
}

.placeholder-photo i {
  font-size: 3rem;
}

.header-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.artiste-name {
  margin: 0 0 5px 0;
  font-size: 2rem;
  font-weight: 600;
}

.artiste-genre {
  color: #6c757d;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.artiste-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  color: #495057;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.detail-tabs {
  display: flex;
  border-bottom: 1px solid #dee2e6;
  margin-bottom: 20px;
}

.tab-item {
  padding: 12px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
}

.tab-item:hover {
  background-color: #f8f9fa;
}

.tab-item.active {
  border-bottom-color: #007bff;
  color: #007bff;
  font-weight: 500;
}

.detail-content {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
}

.tab-content {
  padding: 20px;
}

.info-section {
  margin-bottom: 30px;
}

.info-section h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.membres-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.membres-list li {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.membres-list li:last-child {
  border-bottom: none;
}

.contacts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.contact-item i {
  font-size: 1.2rem;
  color: #6c757d;
}

.contact-item a {
  text-decoration: none;
  color: #007bff;
}

.contact-item a:hover {
  text-decoration: underline;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  text-align: center;
}

.empty-state i {
  font-size: 3rem;
  color: #dee2e6;
  margin-bottom: 15px;
}

.empty-state p {
  color: #6c757d;
  margin-bottom: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.list-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.stats-container {
  padding: 10px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 2rem;
  color: #007bff;
}

.stat-content h4 {
  margin: 0 0 5px 0;
  font-size: 0.9rem;
  color: #6c757d;
}

.stat-value {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.stats-sections {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.stats-section h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}
EOL

echo "🧩 Création des composants..."

# Création du composant ArtistesList.jsx
cat > src/components/artistes/ArtistesList.jsx << 'EOL'
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import '../../style/artistesList.css';

const ArtistesList = () => {
  const [artistes, setArtistes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('tous');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtistes = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'artistes'), orderBy('nom'));
        const querySnapshot = await getDocs(q);
        const artistes = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setArtistes(artistes);
      } catch (error) {
        console.error('Erreur lors de la récupération des artistes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistes();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet artiste ?')) {
      try {
        await deleteDoc(doc(db, 'artistes', id));
        setArtistes(artistes.filter(artiste => artiste.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'artiste:', error);
      }
    }
  };

  const filteredArtistes = artistes.filter(artiste => {
    // Appliquer filtre de recherche
    const matchesSearch = artiste.nom.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Appliquer filtres spécifiques si nécessaire
    if (filter === 'tous') return matchesSearch;
    if (filter === 'avecConcerts') return matchesSearch && artiste.concertsAssocies?.length > 0;
    if (filter === 'sansConcerts') return matchesSearch && (!artiste.concertsAssocies || artiste.concertsAssocies.length === 0);
    
    return matchesSearch;
  });

  if (loading) {
    return <div className="loading-container">Chargement des artistes...</div>;
  }

  return (
    <div className="artistes-list-container">
      <div className="list-header">
        <h2 className="page-title">Artistes</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/artistes/nouveau')}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Ajouter un artiste
        </button>
      </div>

      <div className="search-filter-container">
        <div className="search-input">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Rechercher un artiste..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>
        
        <div className="filter-select">
          <select 
            className="form-select" 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="tous">Tous les artistes</option>
            <option value="avecConcerts">Avec concerts</option>
            <option value="sansConcerts">Sans concerts</option>
          </select>
        </div>
      </div>

      {filteredArtistes.length === 0 ? (
        <div className="no-results">
          <p>Aucun artiste trouvé</p>
        </div>
      ) : (
        <div className="artistes-grid">
          {filteredArtistes.map(artiste => (
            <div className="artiste-card" key={artiste.id}>
              <div className="artiste-photo">
                {artiste.photoPrincipale ? (
                  <img src={artiste.photoPrincipale} alt={artiste.nom} />
                ) : (
                  <div className="placeholder-photo">
                    <i className="bi bi-music-note"></i>
                  </div>
                )}
              </div>
              <div className="artiste-content">
                <h3 className="artiste-name">{artiste.nom}</h3>
                {artiste.genre && <p className="artiste-genre">{artiste.genre}</p>}
                <div className="artiste-stats">
                  <span className="stat-item">
                    <i className="bi bi-calendar-event"></i>
                    {artiste.concertsAssocies?.length || 0} concerts
                  </span>
                  {artiste.cachetMoyen && (
                    <span className="stat-item">
                      <i className="bi bi-cash"></i>
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(artiste.cachetMoyen)}
                    </span>
                  )}
                </div>
              </div>
              <div className="artiste-actions">
                <Link to={`/artistes/${artiste.id}`} className="btn btn-outline-primary">
                  <i className="bi bi-eye"></i>
                </Link>
                <Link to={`/artistes/${artiste.id}/modifier`} className="btn btn-outline-secondary">
                  <i className="bi bi-pencil"></i>
                </Link>
                <button 
                  className="btn btn-outline-danger"
                  onClick={() => handleDelete(artiste.id)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArtistesList;
EOL

# Création du composant ArtisteForm.jsx
cat > src/components/artistes/ArtisteForm.jsx << 'EOL'
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import '../../style/artisteForm.css';

const ArtisteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [artiste, setArtiste] = useState({
    nom: '',
    description: '',
    genre: '',
    membres: [],
    contacts: {
      email: '',
      telephone: '',
      siteWeb: '',
      instagram: '',
      facebook: ''
    },
    cachetMoyen: '',
    photoPrincipale: '',
    dateCreation: '',
    concertsAssocies: [],
    contrats: [],
    stats: {
      nombreConcerts: 0,
      montantTotal: 0,
      programmateursFrequents: [],
      lieuxFrequents: []
    }
  });

  useEffect(() => {
    if (id && id !== 'nouveau') {
      setLoading(true);
      const fetchArtiste = async () => {
        try {
          const artisteDoc = await getDoc(doc(db, 'artistes', id));
          if (artisteDoc.exists()) {
            setArtiste({
              ...artiste,
              ...artisteDoc.data()
            });
          } else {
            navigate('/artistes');
          }
        } catch (error) {
          console.error('Erreur lors de la récupération de l\'artiste:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchArtiste();
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setArtiste(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setArtiste(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleMembresChange = (e, index) => {
    const newMembres = [...artiste.membres];
    newMembres[index] = e.target.value;
    setArtiste(prev => ({
      ...prev,
      membres: newMembres
    }));
  };

  const addMembre = () => {
    setArtiste(prev => ({
      ...prev,
      membres: [...prev.membres, '']
    }));
  };

  const removeMembre = (index) => {
    const newMembres = [...artiste.membres];
    newMembres.splice(index, 1);
    setArtiste(prev => ({
      ...prev,
      membres: newMembres
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!artiste.nom) {
      alert('Le nom de l\'artiste est obligatoire');
      return;
    }

    setSaving(true);
    try {
      const artisteId = id && id !== 'nouveau' ? id : doc(collection(db, 'artistes')).id;
      const artisteData = {
        ...artiste,
        updatedAt: serverTimestamp(),
        ...(id === 'nouveau' && { createdAt: serverTimestamp() })
      };

      // Convertir cachetMoyen en nombre si c'est une chaîne
      if (artisteData.cachetMoyen && typeof artisteData.cachetMoyen === 'string') {
        artisteData.cachetMoyen = parseInt(artisteData.cachetMoyen, 10) || 0;
      }

      await setDoc(doc(db, 'artistes', artisteId), artisteData, { merge: true });
      navigate('/artistes');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'artiste:', error);
      alert('Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Chargement de l'artiste...</div>;
  }

  return (
    <div className="artiste-form-container">
      <div className="form-header">
        <h2 className="page-title">
          {id === 'nouveau' ? 'Créer un nouvel artiste' : 'Modifier l\'artiste'}
        </h2>
        <div className="breadcrumb">
          <span className="breadcrumb-item" onClick={() => navigate('/artistes')}>Artistes</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">
            {id === 'nouveau' ? 'Nouveau' : artiste.nom}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="artiste-form">
        {/* Carte - Informations principales */}
        <div className="form-card">
          <div className="card-header">
            <i className="bi bi-music-note"></i>
            <h3>Informations principales</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="nom" className="form-label">Nom de l'artiste <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                id="nom"
                name="nom"
                value={artiste.nom}
                onChange={handleChange}
                required
                placeholder="Nom de l'artiste ou du groupe"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">Description / Biographie</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={artiste.description || ''}
                onChange={handleChange}
                rows="3"
                placeholder="Description courte ou biographie de l'artiste"
              ></textarea>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="genre" className="form-label">Genre musical</label>
                  <input
                    type="text"
                    className="form-control"
                    id="genre"
                    name="genre"
                    value={artiste.genre || ''}
                    onChange={handleChange}
                    placeholder="Ex: Rock, Jazz, Électro..."
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="cachetMoyen" className="form-label">Cachet moyen (€)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="cachetMoyen"
                    name="cachetMoyen"
                    value={artiste.cachetMoyen || ''}
                    onChange={handleChange}
                    placeholder="Montant moyen du cachet"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="photoPrincipale" className="form-label">Photo principale (URL)</label>
              <input
                type="url"
                className="form-control"
                id="photoPrincipale"
                name="photoPrincipale"
                value={artiste.photoPrincipale || ''}
                onChange={handleChange}
                placeholder="URL de la photo principale"
              />
              {artiste.photoPrincipale && (
                <div className="photo-preview mt-2">
                  <img 
                    src={artiste.photoPrincipale} 
                    alt="Aperçu" 
                    className="img-thumbnail" 
                    style={{ maxHeight: '150px' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Carte - Membres du groupe */}
        <div className="form-card">
          <div className="card-header">
            <i className="bi bi-people"></i>
            <h3>Membres</h3>
          </div>
          <div className="card-body">
            <div className="membres-list">
              {artiste.membres && artiste.membres.map((membre, index) => (
                <div className="membre-item" key={index}>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={membre}
                      onChange={(e) => handleMembresChange(e, index)}
                      placeholder="Nom du membre"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => removeMembre(index)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-outline-primary mt-2"
              onClick={addMembre}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Ajouter un membre
            </button>
          </div>
        </div>

        {/* Carte - Informations de contact */}
        <div className="form-card">
          <div className="card-header">
            <i className="bi bi-envelope"></i>
            <h3>Informations de contact</h3>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="contacts.email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="contacts.email"
                    name="contacts.email"
                    value={artiste.contacts?.email || ''}
                    onChange={handleChange}
                    placeholder="Email de contact"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="contacts.telephone" className="form-label">Téléphone</label>
                  <input
                    type="tel"
                    className="form-control"
                    id="contacts.telephone"
                    name="contacts.telephone"
                    value={artiste.contacts?.telephone || ''}
                    onChange={handleChange}
                    placeholder="Numéro de téléphone"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contacts.siteWeb" className="form-label">Site web</label>
              <input
                type="url"
                className="form-control"
                id="contacts.siteWeb"
                name="contacts.siteWeb"
                value={artiste.contacts?.siteWeb || ''}
                onChange={handleChange}
                placeholder="URL du site web"
              />
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="contacts.instagram" className="form-label">Instagram</label>
                  <div className="input-group">
                    <span className="input-group-text">@</span>
                    <input
                      type="text"
                      className="form-control"
                      id="contacts.instagram"
                      name="contacts.instagram"
                      value={artiste.contacts?.instagram || ''}
                      onChange={handleChange}
                      placeholder="Nom d'utilisateur Instagram"
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="contacts.facebook" className="form-label">Facebook</label>
                  <input
                    type="text"
                    className="form-control"
                    id="contacts.facebook"
                    name="contacts.facebook"
                    value={artiste.contacts?.facebook || ''}
                    onChange={handleChange}
                    placeholder="Nom de la page Facebook"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate('/artistes')}
            disabled={saving}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Enregistrement...
              </>
            ) : (
              'Enregistrer'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArtisteForm;
EOL

# Création du composant ArtisteDetail.jsx
cat > src/components/artistes/ArtisteDetail.jsx << 'EOL'
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import '../../style/artisteDetail.css';

const ArtisteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artiste, setArtiste] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('infos');

  useEffect(() => {
    const fetchArtiste = async () => {
      try {
        const artisteDoc = await getDoc(doc(db, 'artistes', id));
        if (artisteDoc.exists()) {
          setArtiste({
            id: artisteDoc.id,
            ...artisteDoc.data()
          });
        } else {
          navigate('/artistes');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'artiste:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArtiste();
    }
  }, [id, navigate]);

  if (loading) {
    return <div className="loading-container">Chargement des détails de l'artiste...</div>;
  }

  if (!artiste) {
    return <div className="error-container">Artiste non trouvé</div>;
  }

  return (
    <div className="artiste-detail-container">
      <div className="detail-header">
        <div className="header-content">
          <div className="header-image">
            {artiste.photoPrincipale ? (
              <img src={artiste.photoPrincipale} alt={artiste.nom} />
            ) : (
              <div className="placeholder-photo">
                <i className="bi bi-music-note-beamed"></i>
              </div>
            )}
          </div>
          <div className="header-info">
            <h1 className="artiste-name">{artiste.nom}</h1>
            {artiste.genre && <p className="artiste-genre">{artiste.genre}</p>}
            <div className="artiste-stats">
              <div className="stat-item">
                <i className="bi bi-calendar-event"></i>
                <span>{artiste.concertsAssocies?.length || 0} concerts</span>
              </div>
              {artiste.cachetMoyen && (
                <div className="stat-item">
                  <i className="bi bi-cash"></i>
                  <span>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(artiste.cachetMoyen)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="header-actions">
          <Link to={`/artistes/${id}/modifier`} className="btn btn-primary">
            <i className="bi bi-pencil me-2"></i>
            Modifier
          </Link>
          <button 
            className="btn btn-outline-primary"
            onClick={() => window.print()}
          >
            <i className="bi bi-printer me-2"></i>
            Imprimer
          </button>
        </div>
      </div>

      <div className="detail-tabs">
        <div 
          className={`tab-item ${activeTab === 'infos' ? 'active' : ''}`}
          onClick={() => setActiveTab('infos')}
        >
          <i className="bi bi-info-circle"></i>
          <span>Informations</span>
        </div>
        <div 
          className={`tab-item ${activeTab === 'concerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('concerts')}
        >
          <i className="bi bi-calendar-event"></i>
          <span>Concerts</span>
        </div>
        <div 
          className={`tab-item ${activeTab === 'contrats' ? 'active' : ''}`}
          onClick={() => setActiveTab('contrats')}
        >
          <i className="bi bi-file-earmark-text"></i>
          <span>Contrats</span>
        </div>
        <div 
          className={`tab-item ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <i className="bi bi-graph-up"></i>
          <span>Statistiques</span>
        </div>
      </div>

      <div className="detail-content">
        {activeTab === 'infos' && (
          <div className="tab-content">
            <div className="info-section">
              <h3>Description</h3>
              <p>{artiste.description || 'Aucune description disponible'}</p>
            </div>

            {artiste.membres && artiste.membres.length > 0 && (
              <div className="info-section">
                <h3>Membres</h3>
                <ul className="membres-list">
                  {artiste.membres.map((membre, index) => (
                    <li key={index}>{membre}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="info-section">
              <h3>Contacts</h3>
              <div className="contacts-grid">
                {artiste.contacts?.email && (
                  <div className="contact-item">
                    <i className="bi bi-envelope"></i>
                    <a href={`mailto:${artiste.contacts.email}`}>{artiste.contacts.email}</a>
                  </div>
                )}
                {artiste.contacts?.telephone && (
                  <div className="contact-item">
                    <i className="bi bi-telephone"></i>
                    <a href={`tel:${artiste.contacts.telephone}`}>{artiste.contacts.telephone}</a>
                  </div>
                )}
                {artiste.contacts?.siteWeb && (
                  <div className="contact-item">
                    <i className="bi bi-globe"></i>
                    <a href={artiste.contacts.siteWeb} target="_blank" rel="noopener noreferrer">
                      {artiste.contacts.siteWeb}
                    </a>
                  </div>
                )}
                {artiste.contacts?.instagram && (
                  <div className="contact-item">
                    <i className="bi bi-instagram"></i>
                    <a href={`https://instagram.com/${artiste.contacts.instagram}`} target="_blank" rel="noopener noreferrer">
                      @{artiste.contacts.instagram}
                    </a>
                  </div>
                )}
                {artiste.contacts?.facebook && (
                  <div className="contact-item">
                    <i className="bi bi-facebook"></i>
                    <a href={`https://facebook.com/${artiste.contacts.facebook}`} target="_blank" rel="noopener noreferrer">
                      {artiste.contacts.facebook}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'concerts' && (
          <div className="tab-content">
            <ArtisteConcertsList artiste={artiste} />
          </div>
        )}

        {activeTab === 'contrats' && (
          <div className="tab-content">
            <ArtisteContratsList artiste={artiste} />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="tab-content">
            <ArtisteStats artiste={artiste} />
          </div>
        )}
      </div>
    </div>
  );
};

// Composant pour afficher la liste des concerts d'un artiste
const ArtisteConcertsList = ({ artiste }) => {
  const navigate = useNavigate();

  if (!artiste.concertsAssocies || artiste.concertsAssocies.length === 0) {
    return (
      <div className="empty-state">
        <i className="bi bi-calendar-x"></i>
        <p>Aucun concert associé à cet artiste</p>
        <button 
          className="btn btn-outline-primary"
          onClick={() => navigate('/concerts/nouveau')}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Créer un concert
        </button>
      </div>
    );
  }

  return (
    <div className="concerts-list">
      <div className="list-header">
        <h3>Concerts ({artiste.concertsAssocies.length})</h3>
        <button 
          className="btn btn-outline-primary"
          onClick={() => navigate('/concerts/nouveau')}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Ajouter
        </button>
      </div>
      <div className="table-responsive">
        <table className="table table-hover">
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
            {artiste.concertsAssocies.map(concert => (
              <tr key={concert.id}>
                <td>{new Date(concert.date).toLocaleDateString('fr-FR')}</td>
                <td>{concert.lieu}</td>
                <td>{concert.programmateurNom}</td>
                <td>{concert.montant ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(concert.montant) : '-'}</td>
                <td>
                  <span className={`badge bg-${getStatusColor(concert.statut)}`}>
                    {concert.statut}
                  </span>
                </td>
                <td>
                  <Link to={`/concerts/${concert.id}`} className="btn btn-sm btn-outline-primary me-1">
                    <i className="bi bi-eye"></i>
                  </Link>
                  <Link to={`/concerts/${concert.id}/edit`} className="btn btn-sm btn-outline-secondary">
                    <i className="bi bi-pencil"></i>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Composant pour afficher la liste des contrats d'un artiste
const ArtisteContratsList = ({ artiste }) => {
  if (!artiste.contrats || artiste.contrats.length === 0) {
    return (
      <div className="empty-state">
        <i className="bi bi-file-earmark-x"></i>
        <p>Aucun contrat associé à cet artiste</p>
      </div>
    );
  }

  return (
    <div className="contrats-list">
      <div className="list-header">
        <h3>Contrats ({artiste.contrats.length})</h3>
      </div>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Date de signature</th>
              <th>Concert</th>
              <th>Montant</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {artiste.contrats.map(contrat => (
              <tr key={contrat.id}>
                <td>{new Date(contrat.dateSignature).toLocaleDateString('fr-FR')}</td>
                <td>
                  <Link to={`/concerts/${contrat.concertId}`}>
                    {artiste.concertsAssocies?.find(c => c.id === contrat.concertId)?.lieu || 'Concert inconnu'}
                  </Link>
                </td>
                <td>{contrat.montant ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(contrat.montant) : '-'}</td>
                <td>
                  {contrat.url ? (
                    <a href={contrat.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                      <i className="bi bi-file-earmark-pdf me-1"></i>
                      Voir
                    </a>
                  ) : (
                    <span className="text-muted">Pas de PDF</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Composant pour afficher les statistiques d'un artiste
const ArtisteStats = ({ artiste }) => {
  return (
    <div className="stats-container">
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-calendar-check"></i>
          </div>
          <div className="stat-content">
            <h4>Concerts</h4>
            <p className="stat-value">{artiste.stats?.nombreConcerts || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-cash-stack"></i>
          </div>
          <div className="stat-content">
            <h4>Montant total</h4>
            <p className="stat-value">
              {artiste.stats?.montantTotal 
                ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(artiste.stats.montantTotal) 
                : '0 €'}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-cash"></i>
          </div>
          <div className="stat-content">
            <h4>Cachet moyen</h4>
            <p className="stat-value">
              {artiste.cachetMoyen 
                ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(artiste.cachetMoyen) 
                : '0 €'}
            </p>
          </div>
        </div>
      </div>

      <div className="stats-sections">
        {artiste.stats?.programmateursFrequents && artiste.stats.programmateursFrequents.length > 0 && (
          <div className="stats-section">
            <h3>Programmateurs fréquents</h3>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Programmateur</th>
                    <th>Nombre de concerts</th>
                  </tr>
                </thead>
                <tbody>
                  {artiste.stats.programmateursFrequents.map((prog, index) => (
                    <tr key={index}>
                      <td>{prog.nom}</td>
                      <td>{prog.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {artiste.stats?.lieuxFrequents && artiste.stats.lieuxFrequents.length > 0 && (
          <div className="stats-section">
            <h3>Lieux fréquents</h3>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Lieu</th>
                    <th>Nombre de concerts</th>
                  </tr>
                </thead>
                <tbody>
                  {artiste.stats.lieuxFrequents.map((lieu, index) => (
                    <tr key={index}>
                      <td>{lieu.nom}</td>
                      <td>{lieu.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Fonction utilitaire pour obtenir la couleur du statut
const getStatusColor = (statut) => {
  switch (statut?.toLowerCase()) {
    case 'terminé':
      return 'success';
    case 'confirmé':
      return 'primary';
    case 'en attente':
      return 'warning';
    case 'annulé':
      return 'danger';
    default:
      return 'secondary';
  }
};

export default ArtisteDetail;
EOL

# Création du composant ArtistesPage.jsx
cat > src/pages/ArtistesPage.jsx << 'EOL'
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ArtistesList from '../components/artistes/ArtistesList';
import ArtisteForm from '../components/artistes/ArtisteForm';
import ArtisteDetail from '../components/artistes/ArtisteDetail';

function ArtistesPage() {
  return (
    <div className="artistes-page">
      <Routes>
        <Route path="/" element={<ArtistesList />} />
        <Route path="/nouveau" element={<ArtisteForm />} />
        <Route path="/:id" element={<ArtisteDetail />} />
        <Route path="/:id/modifier" element={<ArtisteForm />} />
      </Routes>
    </div>
  );
}

export default ArtistesPage;
EOL

echo "🔄 Mise à jour de App.js pour inclure la route vers les artistes..."

# Créer un fichier temporaire avec les modifications
cat > src/App.js.new << 'EOL'
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/common/Layout';
import DashboardPage from './pages/DashboardPage';
import ConcertsPage from './pages/ConcertsPage';
import ProgrammateursPage from './pages/ProgrammateursPage';
import LieuxPage from './pages/LieuxPage';
import ContratsPage from './pages/ContratsPage';
import ArtistesPage from './pages/ArtistesPage';
import FormResponsePage from './pages/FormResponsePage';
import './App.css';

// Composant de protection des routes
function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Chargement...</div>;
  }
  
  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Routes publiques pour les formulaires */}
          <Route path="/formulaire/:concertId/:token" element={<FormResponsePage />} />
          
          {/* Routes protégées avec Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="/concerts/*" element={<PrivateRoute><ConcertsPage /></PrivateRoute>} />
            <Route path="/programmateurs/*" element={<PrivateRoute><ProgrammateursPage /></PrivateRoute>} />
            <Route path="/lieux/*" element={<PrivateRoute><LieuxPage /></PrivateRoute>} />
            <Route path="/contrats/*" element={<PrivateRoute><ContratsPage /></PrivateRoute>} />
            <Route path="/artistes/*" element={<PrivateRoute><ArtistesPage /></PrivateRoute>} />
            <Route path="/formulaire/validation/:id" element={<PrivateRoute><FormResponsePage /></PrivateRoute>} />
            
            {/* Redirection par défaut */}
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
EOL

# Remplacer le fichier original par le fichier modifié
mv src/App.js.new src/App.js

echo "🔄 Mise à jour du composant Layout pour inclure le lien vers les artistes..."

# Vérifier si le fichier Layout.js existe
if [ -f "src/components/common/Layout.js" ]; then
  # Créer un fichier temporaire avec les modifications
  cat > src/components/common/Layout.js.new << 'EOL'
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../style/layout.css';

function Layout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="layout-container">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h3>App Booking</h3>
        </div>
        <div className="sidebar-content">
          <ul className="nav-links">
            <li>
              <NavLink to="/" end>
                <i className="bi bi-speedometer2"></i>
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/concerts">
                <i className="bi bi-calendar-event"></i>
                <span>Concerts</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/programmateurs">
                <i className="bi bi-person-badge"></i>
                <span>Programmateurs</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/lieux">
                <i className="bi bi-geo-alt"></i>
                <span>Lieux</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/contrats">
                <i className="bi bi-file-earmark-text"></i>
                <span>Contrats</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/artistes">
                <i className="bi bi-music-note-beamed"></i>
                <span>Artistes</span>
              </NavLink>
            </li>
          </ul>
        </div>
        <div className="sidebar-footer">
          {currentUser && (
            <div className="user-info">
              <div className="user-email">{currentUser.email}</div>
              <button onClick={handleLogout} className="btn btn-sm btn-outline-light">
                <i className="bi bi-box-arrow-right me-2"></i>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </nav>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
EOL

  # Remplacer le fichier original par le fichier modifié
  mv src/components/common/Layout.js.new src/components/common/Layout.js
  echo "  ✅ Layout.js mis à jour avec succès"
else
  echo "  ⚠️ Le fichier Layout.js n'a pas été trouvé, vérifiez le chemin"
fi

echo "✅ Implémentation terminée avec succès !"
echo "📋 Résumé des modifications effectuées :"
echo "  - Création des composants pour la gestion des artistes"
echo "  - Ajout des styles CSS pour les nouveaux composants"
echo "  - Mise à jour de App.js pour inclure la route vers les artistes"
echo "  - Mise à jour du composant Layout pour inclure le lien vers les artistes"
echo ""
echo "🚀 Vous pouvez maintenant accéder à la nouvelle fonctionnalité Artistes dans l'application."
