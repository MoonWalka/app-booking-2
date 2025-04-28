import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  doc, 
  getDoc, 
  deleteDoc, 
  updateDoc, 
  serverTimestamp, 
  arrayUnion,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/firebase';
import '@styles/index.css';
import Spinner from '@/components/common/Spinner';


const ProgrammateurDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [programmateur, setProgrammateur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    contact: {
      nom: '',
      prenom: '',
      fonction: '',
      email: '',
      telephone: ''
    },
    structure: {
      raisonSociale: '',
      type: '',
      adresse: '',
      codePostal: '',
      ville: '',
      pays: 'France',
      siret: '',
      tva: ''
    },
    concertsAssocies: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Nouveaux états pour la recherche de concerts
  const [showConcertSearch, setShowConcertSearch] = useState(false);
  const [concertSearchTerm, setConcertSearchTerm] = useState('');
  const [concertResults, setConcertResults] = useState([]);
  const [showConcertResults, setShowConcertResults] = useState(false);
  const [isSearchingConcerts, setIsSearchingConcerts] = useState(false);
  const concertSearchRef = useRef(null);
  const concertSearchTimeoutRef = useRef(null);
  
  useEffect(() => {
    const fetchProgrammateur = async () => {
      setLoading(true);
      try {
        const progDoc = await getDoc(doc(db, 'programmateurs', id));
        if (progDoc.exists()) {
          const progData = progDoc.data();
          setProgrammateur({
            id: progDoc.id,
            ...progData
          });
          
          // Initialiser formData pour l'édition
          setFormData({
            contact: {
              nom: progData.nom?.split(' ')[0] || '',
              prenom: progData.prenom || (progData.nom?.includes(' ') ? progData.nom.split(' ').slice(1).join(' ') : ''),
              fonction: progData.fonction || '',
              email: progData.email || '',
              telephone: progData.telephone || ''
            },
            structure: {
              raisonSociale: progData.structure || '',
              type: progData.structureType || '',
              adresse: progData.structureAdresse || '',
              codePostal: progData.structureCodePostal || '',
              ville: progData.structureVille || '',
              pays: progData.structurePays || 'France',
              siret: progData.siret || '',
              tva: progData.tva || ''
            },
            concertsAssocies: progData.concertsAssocies || []
          });
        } else {
          console.error('Programmateur non trouvé');
          setError('Programmateur non trouvé');
          navigate('/programmateurs');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du programmateur:', error);
        setError('Une erreur est survenue lors de la récupération des données');
      } finally {
        setLoading(false);
      }
    };

    fetchProgrammateur();
  }, [id, navigate]);

  // Gestionnaire de clics en dehors du dropdown de recherche de concerts
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (concertSearchRef.current && !concertSearchRef.current.contains(event.target)) {
        setShowConcertResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Effet pour la recherche de concerts
  useEffect(() => {
    if (concertSearchTimeoutRef.current) {
      clearTimeout(concertSearchTimeoutRef.current);
    }
    
    if (concertSearchTerm.length >= 2) {
      concertSearchTimeoutRef.current = setTimeout(() => {
        searchConcerts(concertSearchTerm);
      }, 300);
    } else {
      setConcertResults([]);
    }
    
    return () => {
      if (concertSearchTimeoutRef.current) {
        clearTimeout(concertSearchTimeoutRef.current);
      }
    };
  }, [concertSearchTerm]);

  // Fonction pour rechercher des concerts
  const searchConcerts = async (term) => {
    try {
      setIsSearchingConcerts(true);
      const termLower = term.toLowerCase();
      
      // Recherche par titre ou date
      const concertsRef = collection(db, 'concerts');
      let concertsQuery;
      
      // Si le terme est une date au format YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(term)) {
        concertsQuery = query(
          concertsRef,
          where('date', '==', term),
          limit(10)
        );
      } else {
        // Sinon recherche générale
        concertsQuery = query(
          concertsRef,
          orderBy('date', 'desc'),
          limit(20)
        );
      }
      
      const concertsSnapshot = await getDocs(concertsQuery);
      let concertsData = concertsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filtrer les résultats localement si on n'a pas pu faire un where précis
      if (!/^\d{4}-\d{2}-\d{2}$/.test(term)) {
        concertsData = concertsData.filter(concert => 
          (concert.titre && concert.titre.toLowerCase().includes(termLower)) ||
          (concert.lieuNom && concert.lieuNom.toLowerCase().includes(termLower)) ||
          (concert.date && concert.date.includes(termLower))
        );
      }
      
      // Filtrer pour exclure les concerts déjà associés
      const currentConcertIds = new Set((programmateur.concertsAssocies || []).map(c => c.id));
      concertsData = concertsData.filter(concert => !currentConcertIds.has(concert.id));
      
      setConcertResults(concertsData);
      setShowConcertResults(true);
    } catch (error) {
      console.error('Erreur lors de la recherche de concerts:', error);
    } finally {
      setIsSearchingConcerts(false);
    }
  };

  // Fonction pour sélectionner un concert
  const handleSelectConcert = async (concert) => {
    try {
      // Vérifier si le concert est déjà associé
      const concertAlreadyAssociated = (programmateur.concertsAssocies || []).some(c => c.id === concert.id);
      
      if (!concertAlreadyAssociated) {
        // Créer l'objet de référence de concert à ajouter
        const concertReference = {
          id: concert.id,
          titre: concert.titre || `Concert du ${concert.date}`,
          date: concert.date || null,
          lieu: concert.lieuNom || null
        };
        
        // Mettre à jour le programmateur dans Firestore
        await updateDoc(doc(db, 'programmateurs', id), {
          concertsAssocies: arrayUnion(concertReference),
          updatedAt: serverTimestamp()
        });
        
        // Mettre à jour le concert également avec le programmateur
        await updateDoc(doc(db, 'concerts', concert.id), {
          programmateurId: id,
          programmateurNom: programmateur.nom,
          updatedAt: serverTimestamp()
        });
        
        // Mettre à jour l'état local du programmateur
        setProgrammateur(prev => ({
          ...prev,
          concertsAssocies: [...(prev.concertsAssocies || []), concertReference]
        }));
        
        // Réinitialiser le champ de recherche
        setConcertSearchTerm('');
        setShowConcertResults(false);
        
        // Montrer un message de confirmation
        alert(`Le concert "${concertReference.titre}" a été associé au programmateur.`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'association du concert:', error);
      alert('Une erreur est survenue lors de l\'association du concert.');
    }
  };

  // Fonction pour créer rapidement un nouveau concert
  const handleCreateConcert = () => {
    // Rediriger vers le formulaire de création de concert
    navigate('/concerts/nouveau');
  };

  // Fonction pour afficher/masquer la section de recherche de concerts
  const toggleConcertSearch = () => {
    setShowConcertSearch(!showConcertSearch);
    setConcertSearchTerm('');
    setShowConcertResults(false);
  };

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

  // MODIFICATION: Fonction pour basculer en mode édition (même comportement que LieuDetails)
  const toggleEditMode = () => {
    if (isEditing) {
      // Si on quitte le mode édition, on réinitialise le formulaire aux valeurs actuelles
      setFormData({
        contact: {
          nom: programmateur.nom?.split(' ')[0] || '',
          prenom: programmateur.prenom || (programmateur.nom?.includes(' ') ? programmateur.nom.split(' ').slice(1).join(' ') : ''),
          fonction: programmateur.fonction || '',
          email: programmateur.email || '',
          telephone: programmateur.telephone || ''
        },
        structure: {
          raisonSociale: programmateur.structure || '',
          type: programmateur.structureType || '',
          adresse: programmateur.structureAdresse || '',
          codePostal: programmateur.structureCodePostal || '',
          ville: programmateur.structureVille || '',
          pays: programmateur.structurePays || 'France',
          siret: programmateur.siret || '',
          tva: programmateur.tva || ''
        },
        concertsAssocies: programmateur.concertsAssocies || []
      });
    }
    setIsEditing(!isEditing);
  };
  
  // Fonction pour gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prevState => ({
        ...prevState,
        [section]: {
          ...prevState[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };
  
  // Fonction pour soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validation
      if (!formData.contact.nom) {
        alert('Le nom est obligatoire');
        setIsSubmitting(false);
        return;
      }
      
      // Préparer les données
      const flattenedData = {
        nom: `${formData.contact.nom} ${formData.contact.prenom}`.trim(),
        structure: formData.structure.raisonSociale || '',
        email: formData.contact.email,
        telephone: formData.contact.telephone,
        
        ...formData.contact,
      };
      
      // Ajouter les champs de structure avec préfixe
      Object.keys(formData.structure).forEach(key => {
        flattenedData[`structure${key.charAt(0).toUpperCase() + key.slice(1)}`] = formData.structure[key];
      });
      
      // Ajouter le timestamp de mise à jour
      flattenedData.updatedAt = serverTimestamp();
      
      // Conserver les concerts associés
      flattenedData.concertsAssocies = formData.concertsAssocies;
      
      // Enregistrer les modifications
      await updateDoc(doc(db, 'programmateurs', id), flattenedData);
      
      // Mettre à jour le programmateur dans l'état local
      setProgrammateur({
        id,
        ...flattenedData
      });
      
      // Sortir du mode édition
      setIsEditing(false);
      
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      alert('Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour formater les données pour affichage
  const formatValue = (value) => {
    if (value === undefined || value === null || value === '') {
      return <span className="text-muted">Non spécifié</span>;
    }
    return value;
  };

  if (loading) {
    return <Spinner message="Chargement des données..." contentOnly={true} />;
  }

  if (error) {
    return (
      <div className="alert alert-danger my-5">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
      </div>
    );
  }

  if (!programmateur) {
    return <div className="alert alert-warning my-5">Programmateur non trouvé</div>;
  }
  
  // Extraire les données de contact et structure de l'objet programmateur
  const extractData = () => {
    // Créer les objets contact et structure à partir des données du programmateur
    const contact = {
      nom: programmateur.nom?.split(' ')[0] || '',
      prenom: programmateur.prenom || (programmateur.nom?.includes(' ') ? programmateur.nom.split(' ').slice(1).join(' ') : ''),
      fonction: programmateur.fonction || '',
      email: programmateur.email || '',
      telephone: programmateur.telephone || ''
    };
    
    const structure = {
      raisonSociale: programmateur.structure || '',
      type: programmateur.structureType || '',
      adresse: programmateur.structureAdresse || '',
      codePostal: programmateur.structureCodePostal || '',
      ville: programmateur.structureVille || '',
      pays: programmateur.structurePays || 'France',
      siret: programmateur.siret || '',
      tva: programmateur.tva || ''
    };
    
    return { contact, structure };
  };
  
  const { contact, structure } = extractData();
  
  return (
    <div className="container-fluid p-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <div>
          <nav aria-label="breadcrumb" className="mb-2">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><a href="#" onClick={(e) => { e.preventDefault(); navigate('/programmateurs'); }} className="text-decoration-none">Programmateurs</a></li>
              <li className="breadcrumb-item active" aria-current="page">{programmateur.nom}</li>
            </ol>
          </nav>
          <h2 className="fw-bold mb-0">
            {programmateur.nom}
            {programmateur.structure && <span className="badge bg-light text-dark ms-2 fs-6">{programmateur.structure}</span>}
          </h2>
        </div>
        
        <div className="d-flex gap-2 mt-3 mt-md-0">
          {isEditing ? (
            <>
              {/* Boutons en mode édition */}
              <button 
                onClick={handleSubmit} 
                className="btn btn-primary d-flex align-items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    <span>Enregistrer</span>
                  </>
                )}
              </button>
              
              <button 
                onClick={toggleEditMode} 
                className="btn btn-outline-secondary d-flex align-items-center"
              >
                <i className="bi bi-x-circle me-2"></i>
                <span>Annuler</span>
              </button>
              
              <button 
                onClick={handleDelete} 
                className="btn btn-outline-danger d-flex align-items-center"
              >
                <i className="bi bi-trash me-2"></i>
                <span>Supprimer</span>
              </button>
            </>
          ) : (
            <>
              {/* Boutons en mode affichage */}
              <Link to="/programmateurs" className="btn btn-outline-secondary d-flex align-items-center">
                <i className="bi bi-arrow-left me-2"></i>
                <span>Retour</span>
              </Link>
              
              <button 
                onClick={toggleEditMode} 
                className="btn btn-outline-primary d-flex align-items-center"
              >
                <i className="bi bi-pencil me-2"></i>
                <span>Modifier</span>
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Contenu principal avec mode conditionnellement rendu */}
      {isEditing ? (
        // MODE ÉDITION
        <form onSubmit={handleSubmit}>
          {/* Section Informations du contact */}
          <div className="card mb-4 shadow-sm">
            <div className="card-header bg-light d-flex align-items-center">
              <i className="fa fa-user-circle text-primary" style={{ 
                // Harmonisation : taille standardisée
                fontSize: "var(--tc-font-size-lg)" 
              }}></i>
              <h5 className="mb-0 ms-2">Informations du contact</h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label htmlFor="contact.nom" className="form-label fw-medium">Nom <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      id="contact.nom"
                      name="contact.nom"
                      value={formData.contact.nom}
                      onChange={handleChange}
                      required
                      placeholder="Ex: Dupont"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label htmlFor="contact.prenom" className="form-label fw-medium">Prénom</label>
                    <input
                      type="text"
                      className="form-control"
                      id="contact.prenom"
                      name="contact.prenom"
                      value={formData.contact.prenom}
                      onChange={handleChange}
                      placeholder="Ex: Jean"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group mb-4">
                <label htmlFor="contact.fonction" className="form-label fw-medium">Fonction</label>
                <input
                  type="text"
                  className="form-control"
                  id="contact.fonction"
                  name="contact.fonction"
                  value={formData.contact.fonction}
                  onChange={handleChange}
                  placeholder="Ex: Directeur artistique"
                />
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label htmlFor="contact.email" className="form-label fw-medium">Email</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                      <input
                        type="email"
                        className="form-control"
                        id="contact.email"
                        name="contact.email"
                        value={formData.contact.email}
                        onChange={handleChange}
                        placeholder="Ex: jean.dupont@example.com"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label htmlFor="contact.telephone" className="form-label fw-medium">Téléphone</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-telephone"></i></span>
                      <input
                        type="tel"
                        className="form-control"
                        id="contact.telephone"
                        name="contact.telephone"
                        value={formData.contact.telephone}
                        onChange={handleChange}
                        placeholder="Ex: 01 23 45 67 89"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Structure juridique */}
          <div className="bootstrap-card">
            <div className="card-header">
              <i className="bi bi-building me-2"></i>
              <h5 className="mb-0">Structure juridique</h5>
            </div>
            <div className="card-body">
              {/* Première ligne: Raison sociale et Type */}
              <div className="row mb-4">
                <div className="col-md-7">
                  <div className="mb-3">
                    <label htmlFor="structure.raisonSociale" className="card-label">Raison sociale</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="structure.raisonSociale"
                      name="structure.raisonSociale"
                      value={formData.structure.raisonSociale}
                      onChange={handleChange}
                      placeholder="Ex: Association Culturelle XYZ"
                    />
                  </div>
                </div>
                <div className="col-md-5">
                  <div className="mb-3">
                    <label htmlFor="structure.type" className="card-label">Type de structure</label>
                    <select
                      className="form-select"
                      id="structure.type"
                      name="structure.type"
                      value={formData.structure.type}
                      onChange={handleChange}
                    >
                      <option value="">Sélectionnez un type</option>
                      <option value="association">Association</option>
                      <option value="mairie">Mairie / Collectivité</option>
                      <option value="entreprise">Entreprise</option>
                      <option value="auto-entrepreneur">Auto-entrepreneur</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Adresse complète */}
              <div className="mb-4">
                <label htmlFor="structure.adresse" className="card-label">Adresse complète</label>
                <input
                  type="text"
                  className="form-control"
                  id="structure.adresse"
                  name="structure.adresse"
                  value={formData.structure.adresse}
                  onChange={handleChange}
                  placeholder="Numéro et nom de rue"
                />
              </div>

              {/* Code postal, Ville, Pays */}
              <div className="row mb-4">
                <div className="col-md-4">
                  <div className="mb-0">
                    <label htmlFor="structure.codePostal" className="card-label">Code postal</label>
                    <input
                      type="text"
                      className="form-control"
                      id="structure.codePostal"
                      name="structure.codePostal"
                      value={formData.structure.codePostal}
                      onChange={handleChange}
                      placeholder="Ex: 75001"
                    />
                  </div>
                </div>
                <div className="col-md-5">
                  <div className="mb-0">
                    <label htmlFor="structure.ville" className="card-label">Ville</label>
                    <input
                      type="text"
                      className="form-control"
                      id="structure.ville"
                      name="structure.ville"
                      value={formData.structure.ville}
                      onChange={handleChange}
                      placeholder="Ex: Paris"
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="mb-0">
                    <label htmlFor="structure.pays" className="card-label">Pays</label>
                    <input
                      type="text"
                      className="form-control"
                      id="structure.pays"
                      name="structure.pays"
                      value={formData.structure.pays}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* SIRET et TVA */}
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-md-0 mb-3">
                    <label htmlFor="structure.siret" className="card-label">SIRET</label>
                    <input
                      type="text"
                      className="form-control card-value-code"
                      id="structure.siret"
                      name="structure.siret"
                      value={formData.structure.siret}
                      onChange={handleChange}
                      placeholder="Ex: 123 456 789 00012"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-0">
                    <label htmlFor="structure.tva" className="card-label">
                      N° TVA intracommunautaire <span className="optional-text">(facultatif)</span>
                    </label>
                    <input
                      type="text"
                      className="form-control card-value-code"
                      id="structure.tva"
                      name="structure.tva"
                      value={formData.structure.tva}
                      onChange={handleChange}
                      placeholder="Ex: FR123456789"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Concerts associés en édition (lecture seule) */}
          <div className="card mb-4 shadow-sm">
            <div className="card-header bg-light d-flex align-items-center">
              <i className="bi bi-music-note-list me-2"></i>
              <h5 className="mb-0">Concerts associés</h5>
            </div>
            <div className="card-body p-4">
              <div>
                <h5 className="mb-3">
                  {formData.concertsAssocies?.length > 0 
                    ? `Concerts associés (${formData.concertsAssocies.length})` 
                    : 'Aucun concert associé'}
                </h5>
                
                {formData.concertsAssocies?.length > 0 ? (
                  <div className="list-group">
                    {formData.concertsAssocies.map(concert => (
                      <div key={concert.id} className="list-group-item list-group-item-action p-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">
                              <i className="bi bi-music-note me-2"></i>
                              <Link to={`/concerts/${concert.id}`} className="text-decoration-none">{concert.titre}</Link>
                            </h6>
                            <div className="d-flex gap-3 text-muted small">
                              {concert.date && (
                                <span>
                                  <i className="bi bi-calendar-event me-1"></i>
                                  {typeof concert.date === 'object' && concert.date.seconds
                                    ? new Date(concert.date.seconds * 1000).toLocaleDateString('fr-FR')
                                    : concert.date}
                                </span>
                              )}
                              {concert.lieu && (
                                <span>
                                  <i className="bi bi-geo-alt me-1"></i>
                                  {concert.lieu}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Aucun concert n'est associé à ce programmateur.
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="d-flex justify-content-end gap-3 mb-4">
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
        <>
          {/* Section Informations du contact */}
          <div className="card mb-4 shadow-sm">
            <div className="card-header bg-light d-flex align-items-center">
              <i className="bi bi-person-vcard me-2"></i>
              <h5 className="mb-0">Informations du contact</h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-bold text-secondary fs-6">Nom</label>
                    <p className="mb-0 fs-5">{formatValue(contact.nom)}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-bold text-secondary fs-6">Prénom</label>
                    <p className="mb-0 fs-5">{formatValue(contact.prenom)}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold text-secondary fs-6">Fonction</label>
                <p className="mb-0">{formatValue(contact.fonction)}</p>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-bold text-secondary fs-6">Email</label>
                    <p className="mb-0">
                      {contact.email ? (
                        <a href={`mailto:${contact.email}`} className="text-decoration-none">
                          <i className="bi bi-envelope me-1"></i>
                          {contact.email}
                        </a>
                      ) : (
                        <span className="text-muted">Non spécifié</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-bold text-secondary fs-6">Téléphone</label>
                    <p className="mb-0">
                      {contact.telephone ? (
                        <a href={`tel:${contact.telephone}`} className="text-decoration-none">
                          <i className="bi bi-telephone me-1"></i>
                          {contact.telephone}
                        </a>
                      ) : (
                        <span className="text-muted">Non spécifié</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Structure juridique */}
          <div className="card mb-4 shadow-sm">
            <div className="card-header">
              <i className="fa fa-building text-primary"></i>
              <h5 className="mb-0 ms-2">Structure juridique</h5>
            </div>
            <div className="card-body p-4">
              <div className="row mb-4">
                <div className="col-md-7">
                  <div className="mb-3">
                    <label className="form-label fw-bold text-secondary">Raison sociale</label>
                    <p className="form-control-plaintext">{formatValue(structure.raisonSociale)}</p>
                  </div>
                </div>
                <div className="col-md-5">
                  <div className="mb-3">
                    <label className="form-label fw-bold text-secondary">Type de structure</label>
                    <p className="form-control-plaintext">
                      {formatValue(structure.type ? (
                        <span>
                          {structure.type === 'association' ? 'Association' :
                           structure.type === 'mairie' ? 'Mairie / Collectivité' :
                           structure.type === 'entreprise' ? 'Entreprise' :
                           structure.type === 'auto-entrepreneur' ? 'Auto-entrepreneur' :
                           structure.type}
                        </span>
                      ) : '')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold text-secondary">Adresse complète</label>
                <p className="form-control-plaintext">{formatValue(structure.adresse)}</p>
              </div>

              <div className="row mb-4">
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold text-secondary">Code postal</label>
                    <p className="form-control-plaintext">{formatValue(structure.codePostal)}</p>
                  </div>
                </div>
                <div className="col-md-5">
                  <div className="mb-3">
                    <label className="form-label fw-bold text-secondary">Ville</label>
                    <p className="form-control-plaintext">{formatValue(structure.ville)}</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="mb-3">
                    <label className="form-label fw-bold text-secondary">Pays</label>
                    <p className="form-control-plaintext">{formatValue(structure.pays)}</p>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-bold text-secondary">SIRET</label>
                    <p className="form-control-plaintext">{formatValue(structure.siret)}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-bold text-secondary">N° TVA intracommunautaire</label>
                    <p className="form-control-plaintext">{formatValue(structure.tva)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Concerts associés */}
          <div className="card mb-4 shadow-sm">
            <div className="card-header bg-light d-flex align-items-center">
              <i className="fa fa-music text-primary"></i>
              <h5 className="mb-0 ms-2">Concerts associés</h5>
            </div>
            <div className="card-body p-4">
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">
                    {programmateur.concertsAssocies?.length > 0 
                      ? `Concerts associés (${programmateur.concertsAssocies.length})` 
                      : 'Aucun concert associé'}
                  </h5>
                  
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={toggleConcertSearch}
                  >
                    {showConcertSearch ? (
                      <><i className="bi bi-x-lg me-1"></i> Annuler</>
                    ) : (
                      <><i className="bi bi-plus-circle me-1"></i> Associer un concert</>
                    )}
                  </button>
                </div>
                
                {/* Section de recherche de concerts */}
                {showConcertSearch && (
                  <div className="mb-4" ref={concertSearchRef}>
                    <div className="input-group mb-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Rechercher un concert par titre, lieu ou date..."
                        value={concertSearchTerm}
                        onChange={(e) => setConcertSearchTerm(e.target.value)}
                        onFocus={() => concertSearchTerm.length >= 2 && setShowConcertResults(true)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={handleCreateConcert}
                      >
                        <i className="bi bi-plus-lg me-1"></i>
                        Créer un concert
                      </button>
                    </div>
                    
                    {/* Résultats de recherche pour les concerts */}
                    {showConcertResults && (
                      <div className="dropdown-menu show w-100">
                        {isSearchingConcerts ? (
                          <div className="dropdown-item text-center">
                            <div className="spinner-border spinner-border-sm me-2" role="status">
                              <span className="visually-hidden">Recherche en cours...</span>
                            </div>
                            Recherche en cours...
                          </div>
                        ) : concertResults.length > 0 ? (
                          concertResults.map(concert => (
                            <div 
                              key={concert.id} 
                              className="dropdown-item"
                              onClick={() => handleSelectConcert(concert)}
                            >
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <div className="fw-bold">{concert.titre || `Concert du ${concert.date}`}</div>
                                  <div className="small text-muted">
                                    {concert.date && (
                                      <span className="me-2">
                                        <i className="bi bi-calendar-event me-1"></i>
                                        {new Date(concert.date).toLocaleDateString('fr-FR')}
                                      </span>
                                    )}
                                    {concert.lieuNom && (
                                      <span>
                                        <i className="bi bi-geo-alt me-1"></i>
                                        {concert.lieuNom}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button 
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectConcert(concert);
                                  }}
                                >
                                  <i className="bi bi-plus-lg"></i>
                                </button>
                              </div>
                            </div>
                          ))
                        ) : concertSearchTerm.length >= 2 ? (
                          <div className="dropdown-item text-muted">Aucun concert trouvé</div>
                        ) : (
                          <div className="dropdown-item text-muted">Commencez à taper pour rechercher</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {programmateur.concertsAssocies?.length > 0 ? (
                  <div className="list-group">
                    {programmateur.concertsAssocies.map(concert => (
                      <div key={concert.id} className="list-group-item list-group-item-action p-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">
                              <i className="bi bi-music-note me-2"></i>
                              <Link to={`/concerts/${concert.id}`} className="text-decoration-none">{concert.titre}</Link>
                            </h6>
                            <div className="d-flex gap-3 text-muted small">
                              {concert.date && (
                                <span>
                                  <i className="bi bi-calendar-event me-1"></i>
                                  {typeof concert.date === 'object' && concert.date.seconds
                                    ? new Date(concert.date.seconds * 1000).toLocaleDateString('fr-FR')
                                    : concert.date}
                                </span>
                              )}
                              {concert.lieu && (
                                <span>
                                  <i className="bi bi-geo-alt me-1"></i>
                                  {concert.lieu}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Aucun concert n'est associé à ce programmateur.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProgrammateurDetails;
