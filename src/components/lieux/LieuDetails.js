import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  doc, 
  getDoc, 
  deleteDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit ,
  setDoc
} from 'firebase/firestore';
import { db } from '../../firebase';
import Badge from 'react-bootstrap/Badge';
import '../../style/lieuDetails.css';
import '../../style/lieuForm.css';

const LieuDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lieu, setLieu] = useState(null);
  const [programmateur, setProgrammateur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgrammateur, setLoadingProgrammateur] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // États pour le formulaire en mode édition
  const [formData, setFormData] = useState({
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
  
  // États pour la recherche de programmateurs en mode édition
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProgrammateur, setSelectedProgrammateur] = useState(null);
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchLieu = async () => {
      setLoading(true);
      try {
        const lieuDoc = await getDoc(doc(db, 'lieux', id));
        if (lieuDoc.exists()) {
          const lieuData = {
            id: lieuDoc.id,
            ...lieuDoc.data()
          };
          
          // S'assurer que la propriété contact existe toujours
          const lieuWithDefaults = {
            ...lieuData,
            contact: lieuData.contact || {
              nom: '',
              telephone: '',
              email: ''
            }
          };
          
          setLieu(lieuWithDefaults);
          
          // Initialiser le formulaire avec les données du lieu
          setFormData(lieuWithDefaults);
          
          // Si un programmateur est associé, on le charge
          if (lieuData.programmateurId) {
            fetchProgrammateur(lieuData.programmateurId);
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
    };

    fetchLieu();
  }, [id, navigate]);

  const fetchProgrammateur = async (programmateurId) => {
    setLoadingProgrammateur(true);
    try {
      const programmateurDoc = await getDoc(doc(db, 'programmateurs', programmateurId));
      if (programmateurDoc.exists()) {
        const progData = {
          id: programmateurDoc.id,
          ...programmateurDoc.data()
        };
        setProgrammateur(progData);
        setSelectedProgrammateur(progData);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du programmateur:', error);
    } finally {
      setLoadingProgrammateur(false);
    }
  };

  // Effet pour gérer la recherche de programmateurs
  useEffect(() => {
    if (!isEditing) return;
    
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
  }, [searchTerm, isEditing]);
  
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
    
    // Mettre à jour le formulaire avec le programmateur sélectionné
    setFormData(prev => ({
      ...prev,
      programmateurId: programmateur.id,
      programmateurNom: programmateur.nom
    }));
  };
  
  // Fonction pour supprimer le programmateur sélectionné
  const handleRemoveProgrammateur = () => {
    setSelectedProgrammateur(null);
    setFormData(prev => ({
      ...prev,
      programmateurId: null,
      programmateurNom: null
    }));
  };

  // Fonction pour créer un nouveau programmateur
  const handleCreateProgrammateur = async () => {
    try {
      // Vérifier qu'un nom de programmateur a été saisi
      if (!searchTerm.trim()) {
        alert('Veuillez saisir un nom de programmateur avant de créer un nouveau programmateur.');
        return;
      }
      
      // Créer directement un nouveau programmateur avec le nom saisi dans la recherche
      const newProgRef = doc(collection(db, 'programmateurs'));
      const progData = {
        nom: searchTerm.trim(),
        nomLowercase: searchTerm.trim().toLowerCase(),
        structure: '',
        email: '',
        telephone: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(newProgRef, progData);
      
      // Créer un objet programmateur avec l'ID et les données
      const newProg = { 
        id: newProgRef.id,
        ...progData
      };
      
      // Sélectionner automatiquement le nouveau programmateur
      handleSelectProgrammateur(newProg);
      
      // Afficher un message de confirmation
      alert(`Le programmateur "${progData.nom}" a été créé avec succès. Vous pourrez compléter ses détails plus tard.`);
      
    } catch (error) {
      console.error('Erreur lors de la création du programmateur:', error);
      alert('Une erreur est survenue lors de la création du programmateur.');
    }
  };

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

  // Fonction pour basculer en mode édition
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };
  
  // Gestion du changement des champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}), // Utiliser un objet vide si prev[parent] n'existe pas
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    return formData.nom && formData.adresse && formData.codePostal && formData.ville && formData.pays;
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);
    try {
      const lieuData = {
        ...formData,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'lieux', id), lieuData);
      
      // Mettre à jour l'état local
      setLieu(lieuData);
      // Si le programmateur a changé, le mettre à jour
      if (lieuData.programmateurId && (!programmateur || programmateur.id !== lieuData.programmateurId)) {
        fetchProgrammateur(lieuData.programmateurId);
      } else if (!lieuData.programmateurId) {
        setProgrammateur(null);
      }
      
      // Sortir du mode édition
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du lieu:', error);
      alert('Une erreur est survenue lors de l\'enregistrement du lieu');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Composant pour afficher un badge de type
  const TypeBadge = ({ type }) => {
    if (!type) return null;
    
    let variant = 'secondary';
    
    switch (type.toLowerCase()) {
      case 'bar':
        variant = 'info';
        break;
      case 'festival':
        variant = 'danger';
        break;
      case 'salle':
        variant = 'success';
        break;
      case 'plateau':
        variant = 'warning';
        break;
      default:
        variant = 'secondary';
    }
    
    return <Badge bg={variant} className="type-badge">{type}</Badge>;
  };

  if (loading) {
    return <div className="text-center my-5 loading-spinner">Chargement du lieu...</div>;
  }

  if (!lieu) {
    return (
      <div className="lieu-details-container">
        <div className="alert alert-danger modern-alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Lieu non trouvé
        </div>
        <div className="text-center mt-4">
          <Link to="/lieux" className="btn btn-primary">
            <i className="bi bi-arrow-left me-2"></i>
            Retour à la liste des lieux
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="lieu-details-container">
      <div className="details-header-container">
        <div className="title-container">
          <div className="breadcrumb-container mb-2">
            <span className="breadcrumb-item" onClick={() => navigate('/lieux')}>Lieux</span>
            <i className="bi bi-chevron-right"></i>
            <span className="breadcrumb-item active">{lieu.nom}</span>
          </div>
          <h2 className="modern-title">
            {lieu.nom}
            {lieu.type && <TypeBadge type={lieu.type} />}
          </h2>
        </div>
        <div className="action-buttons">
          <Link to="/lieux" className="btn btn-outline-secondary action-btn">
            <i className="bi bi-arrow-left"></i>
            <span className="btn-text">Retour</span>
          </Link>
          
          {isEditing ? (
            <button 
              onClick={toggleEditMode} 
              className="btn btn-outline-secondary action-btn"
            >
              <i className="bi bi-x-circle"></i>
              <span className="btn-text">Annuler</span>
            </button>
          ) : (
            <>
              <button 
                onClick={toggleEditMode} 
                className="btn btn-outline-primary action-btn"
              >
                <i className="bi bi-pencil"></i>
                <span className="btn-text">Modifier</span>
              </button>
              <button 
                onClick={handleDelete} 
                className="btn btn-outline-danger action-btn"
              >
                <i className="bi bi-trash"></i>
                <span className="btn-text">Supprimer</span>
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        // MODE ÉDITION
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
                  value={formData.nom}
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
                  value={formData.type || ''}
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
                  value={formData.capacite}
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
                <label htmlFor="adresse" className="form-label">Adresse <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  id="adresse"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  required
                  placeholder="Numéro et nom de rue"
                />
              </div>

              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="codePostal" className="form-label">Code postal <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      id="codePostal"
                      name="codePostal"
                      value={formData.codePostal}
                      onChange={handleChange}
                      required
                      placeholder="Ex: 75001"
                    />
                  </div>
                </div>
                <div className="col-md-8">
                  <div className="form-group">
                    <label htmlFor="ville" className="form-label">Ville <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      id="ville"
                      name="ville"
                      value={formData.ville}
                      onChange={handleChange}
                      required
                      placeholder="Ex: Paris"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="pays" className="form-label">Pays <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  id="pays"
                  name="pays"
                  value={formData.pays}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Carte - Programmateur */}
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
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={handleCreateProgrammateur}
                      >
                        Créer un programmateur
                      </button>
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
                  value={formData.contact?.nom || ''}
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
                        value={formData.contact?.telephone || ''}
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
                        value={formData.contact?.email || ''}
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
              onClick={toggleEditMode}
              disabled={isSubmitting}
            >
              <i className="bi bi-x-circle me-2"></i>
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Enregistrement...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Enregistrer les modifications
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        // MODE AFFICHAGE
        <div className="row details-content">
          <div className="col-md-8">
            <div className="detail-card">
              <div className="card-header">
                <i className="bi bi-building"></i>
                <h3>Informations générales</h3>
              </div>
              <div className="card-body">
                <div className="info-row">
                  <div className="info-label">
                    <i className="bi bi-geo-alt text-primary"></i>
                    Adresse
                  </div>
                  <div className="info-value">{lieu.adresse}</div>
                </div>
                
                <div className="info-group">
                  <div className="info-row">
                    <div className="info-label">Code postal</div>
                    <div className="info-value">{lieu.codePostal}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Ville</div>
                    <div className="info-value">{lieu.ville}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Pays</div>
                    <div className="info-value">{lieu.pays}</div>
                  </div>
                </div>
                
                {lieu.capacite && (
                  <div className="info-row">
                    <div className="info-label">
                      <i className="bi bi-people text-primary"></i>
                      Capacité
                    </div>
                    <div className="info-value highlight">
                      {lieu.capacite} personnes
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Carte pour le programmateur */}
            {lieu.programmateurId && (
              <div className="detail-card">
                <div className="card-header">
                  <i className="bi bi-person-badge"></i>
                  <h3>Programmateur</h3>
                </div>
                <div className="card-body">
                  {loadingProgrammateur ? (
                    <div className="text-center py-3">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Chargement du programmateur...</span>
                      </div>
                    </div>
                  ) : programmateur ? (
                    <>
                      <div className="info-row">
                        <div className="info-label">
                          <i className="bi bi-person text-primary"></i>
                          Nom
                        </div>
                        <div className="info-value highlight">
                          <Link to={`/programmateurs/${programmateur.id}`} className="programmateur-link">
                            {programmateur.nom}
                          </Link>
                        </div>
                      </div>
                      
                      {programmateur.structure && (
                        <div className="info-row">
                          <div className="info-label">
                            <i className="bi bi-building text-primary"></i>
                            Structure
                          </div>
                          <div className="info-value">{programmateur.structure}</div>
                        </div>
                      )}
                      
                      {programmateur.telephone && (
                        <div className="info-row">
                          <div className="info-label">
                            <i className="bi bi-telephone text-primary"></i>
                            Téléphone
                          </div>
                          <div className="info-value">
                            <a href={`tel:${programmateur.telephone}`} className="contact-link">
                              {programmateur.telephone}
                            </a>
                          </div>
                        </div>
                      )}
                      
                      {programmateur.email && (
                        <div className="info-row">
                          <div className="info-label">
                            <i className="bi bi-envelope text-primary"></i>
                            Email
                          </div>
                          <div className="info-value">
                            <a href={`mailto:${programmateur.email}`} className="contact-link">
                              {programmateur.email}
                            </a>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="alert alert-warning">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      Le programmateur associé (ID: {lieu.programmateurId}) n'a pas pu être chargé ou n'existe plus.
                      </div>
                  )}
                </div>
              </div>
            )}

            {/* Carte pour les contacts du lieu (conservée si nécessaire) */}
            {lieu.contact && (lieu.contact.nom || lieu.contact.telephone || lieu.contact.email) && (
              <div className="detail-card">
                <div className="card-header">
                  <i className="bi bi-person-lines-fill"></i>
                  <h3>Contact du lieu</h3>
                </div>
                <div className="card-body">
                  {lieu.contact.nom && (
                    <div className="info-row">
                      <div className="info-label">
                        <i className="bi bi-person text-primary"></i>
                        Personne à contacter
                      </div>
                      <div className="info-value">{lieu.contact.nom}</div>
                    </div>
                  )}
                  {lieu.contact.telephone && (
                    <div className="info-row">
                      <div className="info-label">
                        <i className="bi bi-telephone text-primary"></i>
                        Téléphone
                      </div>
                      <div className="info-value">
                        <a href={`tel:${lieu.contact.telephone}`} className="contact-link">
                          {lieu.contact.telephone}
                        </a>
                      </div>
                    </div>
                  )}
                  {lieu.contact.email && (
                    <div className="info-row">
                      <div className="info-label">
                        <i className="bi bi-envelope text-primary"></i>
                        Email
                      </div>
                      <div className="info-value">
                        <a href={`mailto:${lieu.contact.email}`} className="contact-link">
                          {lieu.contact.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="col-md-4">
            <div className="detail-card summary-card">
              <div className="card-header">
                <i className="bi bi-info-circle"></i>
                <h3>Résumé</h3>
              </div>
              <div className="card-body">
                <div className="summary-item">
                  <div className="summary-icon">
                    <i className="bi bi-calendar-check"></i>
                  </div>
                  <div className="summary-details">
                    <div className="summary-label">Créé le</div>
                    <div className="summary-value">
                      {lieu.createdAt ? new Date(lieu.createdAt.seconds * 1000).toLocaleDateString('fr-FR') : 'Non disponible'}
                    </div>
                  </div>
                </div>
                
                <div className="summary-item">
                  <div className="summary-icon">
                    <i className="bi bi-calendar-plus"></i>
                  </div>
                  <div className="summary-details">
                    <div className="summary-label">Dernière modification</div>
                    <div className="summary-value">
                      {lieu.updatedAt ? new Date(lieu.updatedAt.seconds * 1000).toLocaleDateString('fr-FR') : 'Non disponible'}
                    </div>
                  </div>
                </div>
                
                <div className="summary-item">
                  <div className="summary-icon">
                    <i className="bi bi-geo"></i>
                  </div>
                  <div className="summary-details">
                    <div className="summary-label">Localisation</div>
                    <div className="summary-value">
                      {lieu.ville}, {lieu.pays}
                    </div>
                  </div>
                </div>
                
                {lieu.type && (
                  <div className="summary-item">
                    <div className="summary-icon">
                      <i className="bi bi-tag"></i>
                    </div>
                    <div className="summary-details">
                      <div className="summary-label">Type</div>
                      <div className="summary-value">
                        <TypeBadge type={lieu.type} />
                      </div>
                    </div>
                  </div>
                )}
                
                {lieu.programmateurId && programmateur && (
                  <div className="summary-item">
                    <div className="summary-icon">
                      <i className="bi bi-person-badge"></i>
                    </div>
                    <div className="summary-details">
                      <div className="summary-label">Programmateur</div>
                      <div className="summary-value">
                        <Link to={`/programmateurs/${programmateur.id}`}>
                          {programmateur.nom}
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="card-footer">
                <a 
                  href={`https://maps.google.com/maps?q=${encodeURIComponent(`${lieu.adresse}, ${lieu.codePostal} ${lieu.ville}, ${lieu.pays}`)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary btn-sm w-100"
                >
                  <i className="bi bi-map me-2"></i>
                  Voir sur Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LieuDetails;
