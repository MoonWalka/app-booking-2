import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, doc, getDoc, setDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import '../../style/lieuForm.css';

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
    type: '',
    contact: {
      nom: '',
      telephone: '',
      email: ''
    },
    programmateurId: null,
    programmateurNom: null
  });
  
  // États pour la recherche de programmateurs
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProgrammateur, setSelectedProgrammateur] = useState(null);
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const fetchLieu = async () => {
      if (id && id !== 'nouveau') {
        setLoading(true);
        try {
          const lieuDoc = await getDoc(doc(db, 'lieux', id));
          if (lieuDoc.exists()) {
            const lieuData = lieuDoc.data();
            setLieu(lieuData);
            
            // Si un programmateur est associé, le récupérer
            if (lieuData.programmateurId) {
              try {
                const programmateurDoc = await getDoc(doc(db, 'programmateurs', lieuData.programmateurId));
                if (programmateurDoc.exists()) {
                  setSelectedProgrammateur({
                    id: programmateurDoc.id,
                    ...programmateurDoc.data()
                  });
                }
              } catch (error) {
                console.error('Erreur lors de la récupération du programmateur:', error);
              }
            }
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

  // Effet pour gérer la recherche de programmateurs
  useEffect(() => {
    // Nettoyer le timeout précédent si une nouvelle recherche est lancée
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // N'effectuer la recherche que si le terme a au moins 2 caractères
    if (searchTerm.length >= 2) {
      setIsSearching(true);
      
      // Ajouter un délai pour éviter trop de requêtes
      searchTimeoutRef.current = setTimeout(() => {
        searchProgrammateurs(searchTerm);
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
    
    // Nettoyage du timeout à la destruction du composant
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);
  
  // Gestionnaire de clic extérieur pour fermer la liste déroulante
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fonction pour rechercher des programmateurs dans Firebase
  const searchProgrammateurs = async (term) => {
    try {
      // Créer une requête pour chercher les programmateurs dont le nom contient le terme
      const q = query(
        collection(db, 'programmateurs'),
        where('nom', '>=', term),
        where('nom', '<=', term + '\uf8ff'),
        orderBy('nom'),
        limit(5)
      );
      
      const querySnapshot = await getDocs(q);
      const results = [];
      
      querySnapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setSearchResults(results);
    } catch (error) {
      console.error('Erreur lors de la recherche de programmateurs:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Fonction pour sélectionner un programmateur
  const handleSelectProgrammateur = (programmateur) => {
    setSelectedProgrammateur(programmateur);
    setSearchTerm('');
    setSearchResults([]);
    
    // Mettre à jour le lieu avec le programmateur sélectionné (juste l'ID et le nom)
    setLieu(prev => ({
      ...prev,
      programmateurId: programmateur.id,
      programmateurNom: programmateur.nom
    }));
  };
  
  // Fonction pour supprimer le programmateur sélectionné
  const handleRemoveProgrammateur = () => {
    setSelectedProgrammateur(null);
    setLieu(prev => ({
      ...prev,
      programmateurId: null,
      programmateurNom: null
    }));
  };

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
    return <div className="text-center my-5 loading-spinner">Chargement du lieu...</div>;
  }

  return (
    <div className="lieu-form-container">
      <div className="form-header-container">
        <h2 className="modern-title">
          {id === 'nouveau' ? 'Créer un nouveau lieu' : 'Modifier le lieu'}
        </h2>
        <div className="breadcrumb-container">
          <span className="breadcrumb-item" onClick={() => navigate('/lieux')}>Lieux</span>
          <i className="bi bi-chevron-right"></i>
          <span className="breadcrumb-item active">
            {id === 'nouveau' ? 'Nouveau lieu' : lieu.nom}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="modern-form">
        {/* Première carte - Informations principales */}
        <div className="form-card">
          <div className="card-header">
            <i className="bi bi-building"></i>
            <h3>Informations principales</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="nom" className="form-label">Nom du lieu <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                id="nom"
                name="nom"
                value={lieu.nom}
                onChange={handleChange}
                required
                placeholder="Ex: Le Café des Artistes"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="type" className="form-label">Type de lieu</label>
              <select
                className="form-select"
                id="type"
                name="type"
                value={lieu.type || ''}
                onChange={handleChange}
              >
                <option value="">Sélectionnez un type</option>
                <option value="bar">Bar</option>
                <option value="festival">Festival</option>
                <option value="salle">Salle</option>
                <option value="plateau">Plateau</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="capacite" className="form-label">Capacité</label>
              <input
                type="number"
                className="form-control"
                id="capacite"
                name="capacite"
                value={lieu.capacite}
                onChange={handleChange}
                placeholder="Nombre de personnes"
              />
              <small className="form-text text-muted">Nombre maximum de personnes que le lieu peut accueillir</small>
            </div>
          </div>
        </div>

        {/* Deuxième carte - Adresse */}
        <div className="form-card">
          <div className="card-header">
            <i className="bi bi-geo-alt"></i>
            <h3>Adresse</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="adresse" className="form-label">Adresse {/* <span className="required">*</span> */}</label>
              <input
                type="text"
                className="form-control"
                id="adresse"
                name="adresse"
                value={lieu.adresse}
                onChange={handleChange}
                //required
                placeholder="Numéro et nom de rue"
              />
            </div>

            <div className="row">
              <div className="col-md-4">
                <div className="form-group">
                  <label htmlFor="codePostal" className="form-label">Code postal {/* <span className="required">*</span> */}</label>
                  <input
                    type="text"
                    className="form-control"
                    id="codePostal"
                    name="codePostal"
                    value={lieu.codePostal}
                    onChange={handleChange}
                    //required
                    placeholder="Ex: 75001"
                  />
                </div>
              </div>
              <div className="col-md-8">
                <div className="form-group">
                  <label htmlFor="ville" className="form-label">Ville {/* <span className="required">*</span> */}</label>
                  <input
                    type="text"
                    className="form-control"
                    id="ville"
                    name="ville"
                    value={lieu.ville}
                    onChange={handleChange}
                    //required
                    placeholder="Ex: Paris"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="pays" className="form-label">Pays {/* <span className="required">*</span> */}</label>
              <input
                type="text"
                className="form-control"
                id="pays"
                name="pays"
                value={lieu.pays}
                onChange={handleChange}
                //required
              />
            </div>
          </div>
        </div>

        {/* Nouvelle carte - Programmateur */}
        <div className="form-card">
          <div className="card-header">
            <i className="bi bi-person-badge"></i>
            <h3>Programmateur</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Associer un programmateur</label>
              
              {!selectedProgrammateur ? (
                <div className="programmateur-search-container" ref={dropdownRef}>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-search"></i></span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Rechercher un programmateur par nom..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  {isSearching && (
                    <div className="dropdown-menu show w-100">
                      <div className="dropdown-item text-center">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Recherche en cours...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {searchResults.length > 0 && (
                    <div className="dropdown-menu show w-100">
                      {searchResults.map(prog => (
                        <div 
                          key={prog.id} 
                          className="dropdown-item programmateur-item"
                          onClick={() => handleSelectProgrammateur(prog)}
                        >
                          <div className="programmateur-name">{prog.nom}</div>
                          <div className="programmateur-details">
                            {prog.structure && <span className="programmateur-structure">{prog.structure}</span>}
                            {prog.email && <span className="programmateur-email">{prog.email}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {searchTerm.length >= 2 && searchResults.length === 0 && !isSearching && (
                    <div className="dropdown-menu show w-100">
                      <div className="dropdown-item text-center text-muted">
                        Aucun programmateur trouvé
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="selected-programmateur">
                  <div className="programmateur-card">
                    <div className="programmateur-info">
                      <span className="programmateur-name">{selectedProgrammateur.nom}</span>
                      {selectedProgrammateur.structure && (
                        <span className="programmateur-structure">{selectedProgrammateur.structure}</span>
                      )}
                      <div className="programmateur-contacts">
                        {selectedProgrammateur.email && (
                          <span className="programmateur-contact-item">
                            <i className="bi bi-envelope"></i> {selectedProgrammateur.email}
                          </span>
                        )}
                        {selectedProgrammateur.telephone && (
                          <span className="programmateur-contact-item">
                            <i className="bi bi-telephone"></i> {selectedProgrammateur.telephone}
                          </span>
                        )}
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-danger" 
                      onClick={handleRemoveProgrammateur}
                      aria-label="Supprimer ce programmateur"
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>
                </div>
              )}
              
              <small className="form-text text-muted">
                Tapez au moins 2 caractères pour rechercher un programmateur par nom.
              </small>
            </div>
          </div>
        </div>

        {/* Carte - Informations de contact */}
        <div className="form-card">
          <div className="card-header">
            <i className="bi bi-person-lines-fill"></i>
            <h3>Informations de contact</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="contact.nom" className="form-label">Personne à contacter</label>
              <input
                type="text"
                className="form-control"
                id="contact.nom"
                name="contact.nom"
                value={lieu.contact.nom}
                onChange={handleChange}
                placeholder="Nom et prénom du contact"
              />
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="contact.telephone" className="form-label">Téléphone</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-telephone"></i></span>
                    <input
                      type="tel"
                      className="form-control"
                      id="contact.telephone"
                      name="contact.telephone"
                      value={lieu.contact.telephone}
                      onChange={handleChange}
                      placeholder="Ex: 01 23 45 67 89"
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="contact.email" className="form-label">Email</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                    <input
                      type="email"
                      className="form-control"
                      id="contact.email"
                      name="contact.email"
                      value={lieu.contact.email}
                      onChange={handleChange}
                      placeholder="Ex: contact@exemple.fr"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate('/lieux')}
          >
            <i className="bi bi-x-circle me-2"></i>
            Annuler
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Enregistrement...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                {id === 'nouveau' ? 'Créer le lieu' : 'Enregistrer les modifications'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LieuForm;
