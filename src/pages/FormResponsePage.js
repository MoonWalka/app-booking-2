import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, getDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import ProgrammateurForm from '../components/forms/ProgrammateurForm';
import { useLocationIQ } from '../hooks/useLocationIQ';

const PublicFormLayout = ({ children }) => {
  return (
    <div className="form-isolated-container">
      <header className="form-header">
        <div className="form-logo">
          <h2>Label Musical</h2>
        </div>
      </header>
      
      <main className="form-content">
        {children}
      </main>
      
      <footer className="form-footer">
        <p>© {new Date().getFullYear()} Label Musical - Formulaire sécurisé</p>
      </footer>
    </div>
  );
};

const FormResponsePage = () => {
  const { concertId, token, id } = useParams(); // Récupérer concertId, token ou id
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const [formLinkId, setFormLinkId] = useState(null);
  const [concert, setConcert] = useState(null);
  const [lieu, setLieu] = useState(null);
  const [error, setError] = useState(null);
  const [expired, setExpired] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  // États pour l'édition des informations du concert
  const [editingConcert, setEditingConcert] = useState(false);
  const [concertData, setConcertData] = useState({
    titre: '',
    date: '',
    montant: '',
    lieuNom: '',
    lieuAdresse: '',
    lieuCodePostal: '',
    lieuVille: ''
  });

  // États pour la recherche d'entreprise
  const [searchType, setSearchType] = useState('manual'); // 'manual', 'name', 'siret'
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingCompany, setIsSearchingCompany] = useState(false);
  const companySearchTimeoutRef = useRef(null);
  const companySearchResultsRef = useRef(null);
  
  // États pour les suggestions d'adresse du lieu
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const addressTimeoutRef = useRef(null);
  const addressInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  // Utilisation du hook LocationIQ
  const { isLoading: isApiLoading, error: apiError, searchAddress } = useLocationIQ();

  // Déterminer si nous sommes en mode public ou en mode admin
  const isPublicForm = !!concertId && !!token;
  const isAdminValidation = !!id;

  // Effet pour la recherche d'entreprise
  useEffect(() => {
    if (companySearchTimeoutRef.current) {
      clearTimeout(companySearchTimeoutRef.current);
    }
    
    const searchCompany = async () => {
      if (!searchTerm || searchTerm.length < 3) {
        setSearchResults([]);
        return;
      }
      
      setIsSearchingCompany(true);
      
      try {
        // Utiliser l'API Recherche d'Entreprises (publique)
        let apiUrl;
        
        if (searchType === 'name') {
          // Recherche par nom (q est le paramètre de recherche textuelle)
          apiUrl = `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(searchTerm)}&per_page=10`;
        } else if (searchType === 'siret') {
          // Recherche par SIRET
          apiUrl = `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(searchTerm)}&per_page=5`;
        }
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`Erreur lors de la recherche: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transformer les données au format attendu
        const formattedResults = data.results ? data.results.map(company => {
          // Extraire l'adresse complète
          const siege = company.siege;
          const adresseComplete = siege 
            ? `${siege.numero_voie || ''} ${siege.type_voie || ''} ${siege.libelle_voie || ''}`
            : '';
          
          return {
            siret: company.siege?.siret || '',
            siren: company.siren || '',
            nom: company.nom_complet || company.nom_raison_sociale || '',
            adresse: adresseComplete.trim(),
            codePostal: siege?.code_postal || '',
            ville: siege?.libelle_commune || '',
            codeAPE: company.activite_principale?.code || '',
            libelleAPE: company.activite_principale?.libelle || '',
            statutJuridique: company.nature_juridique?.libelle || '',
            active: company.etat_administratif === 'A'
          };
        }) : [];
        
        setSearchResults(formattedResults);
      } catch (error) {
        console.error("Erreur lors de la recherche d'entreprise:", error);
        setSearchResults([]);
      } finally {
        setIsSearchingCompany(false);
      }
    };
    
    if (searchTerm.length >= 3 && (searchType === 'name' || searchType === 'siret')) {
      companySearchTimeoutRef.current = setTimeout(searchCompany, 500);
    } else {
      setSearchResults([]);
    }
    
    return () => {
      if (companySearchTimeoutRef.current) {
        clearTimeout(companySearchTimeoutRef.current);
      }
    };
  }, [searchTerm, searchType]);

  // Effet pour la recherche d'adresse
  useEffect(() => {
    // Nettoyer le timeout précédent
    if (addressTimeoutRef.current) {
      clearTimeout(addressTimeoutRef.current);
    }
    
    const handleSearch = async () => {
      if (!concertData.lieuAdresse || concertData.lieuAdresse.length < 3 || isApiLoading) {
        setAddressSuggestions([]);
        return;
      }
      
      setIsSearchingAddress(true);
      
      try {
        // Appeler la fonction du hook
        const results = await searchAddress(concertData.lieuAdresse);
        setAddressSuggestions(results || []);
      } catch (error) {
        console.error("Erreur lors de la recherche:", error);
        setAddressSuggestions([]);
      } finally {
        setIsSearchingAddress(false);
      }
    };
    
    // N'effectuer la recherche que si l'adresse a au moins 3 caractères
    if (concertData.lieuAdresse && concertData.lieuAdresse.length >= 3 && !isApiLoading && editingConcert) {
      addressTimeoutRef.current = setTimeout(handleSearch, 300);
    } else {
      setAddressSuggestions([]);
    }
    
    return () => {
      if (addressTimeoutRef.current) {
        clearTimeout(addressTimeoutRef.current);
      }
    };
  }, [concertData.lieuAdresse, isApiLoading, searchAddress, editingConcert]);
  
  // Gestionnaire de clic extérieur pour fermer les listes de suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) && 
          addressInputRef.current && !addressInputRef.current.contains(event.target)) {
        setAddressSuggestions([]);
      }
      
      if (companySearchResultsRef.current && !companySearchResultsRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sélectionner une entreprise parmi les résultats
  const handleSelectCompany = (company) => {
    // Mise à jour des données du formulaire avec les informations de l'entreprise
    const updateData = {
      structure: company.nom,
      structureAdresse: company.adresse,
      structureCodePostal: company.codePostal,
      structureVille: company.ville,
      siret: company.siret,
      codeAPE: company.codeAPE
    };
    
    // Si on est en train d'éditer, mettre à jour le formulaire
    // Note: il faudrait adapter cette partie à la structure de votre formulaire
    // et à la façon dont vous gérez l'état du formulaire
    
    setSearchResults([]);
    setSearchTerm('');
    // Basculer vers le mode manuel après sélection
    setSearchType('manual');
  };

  // Sélectionner une adresse parmi les suggestions
  const handleSelectAddress = (address) => {
    let codePostal = '';
    let ville = '';
    let adresse = '';
    
    // Extraire les composants d'adresse
    if (address.address) {
      // Extraire le code postal
      codePostal = address.address.postcode || '';
      
      // Extraire la ville
      ville = address.address.city || address.address.town || address.address.village || '';
      
      // Construire l'adresse de rue
      const houseNumber = address.address.house_number || '';
      const road = address.address.road || '';
      adresse = `${houseNumber} ${road}`.trim();
    }
    
    // Mettre à jour les données du concert
    setConcertData(prev => ({
      ...prev,
      lieuAdresse: adresse || address.display_name.split(',')[0],
      lieuCodePostal: codePostal,
      lieuVille: ville,
      lieuLatitude: address.lat,
      lieuLongitude: address.lon
    }));
    
    // Fermer les suggestions
    setAddressSuggestions([]);
  };

  useEffect(() => {
    // En mode validation admin (route /formulaire/validation/:id)
    if (isAdminValidation) {
      const fetchFormSubmission = async () => {
        try {
          setLoading(true);
          // Logique pour récupérer et afficher les données soumises à valider
          // Cette partie dépend de votre implémentation spécifique
          
          // Exemple simplifié :
          const submissionDoc = await getDoc(doc(db, 'formSubmissions', id));
          if (submissionDoc.exists()) {
            const submissionData = submissionDoc.data();
            setFormData(submissionData);
            
            // Récupérer le concert associé
            if (submissionData.concertId) {
              const concertDoc = await getDoc(doc(db, 'concerts', submissionData.concertId));
              if (concertDoc.exists()) {
                const concertData = concertDoc.data();
                setConcert(concertData);
                
                // Initialiser l'état d'édition du concert
                setConcertData({
                  titre: concertData.titre || '',
                  date: concertData.date ? new Date(concertData.date.seconds * 1000) : '',
                  montant: concertData.montant || '',
                  lieuNom: concertData.lieuNom || '',
                  lieuAdresse: concertData.lieuAdresse || '',
                  lieuCodePostal: concertData.lieuCodePostal || '',
                  lieuVille: concertData.lieuVille || ''
                });
                
                // Récupérer le lieu si nécessaire
                if (concertData.lieuId) {
                  const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
                  if (lieuDoc.exists()) {
                    setLieu(lieuDoc.data());
                  }
                }
              }
            }
          } else {
            setError("La soumission demandée n'existe pas.");
          }
        } catch (error) {
          console.error("Erreur lors de la récupération de la soumission:", error);
          setError("Impossible de charger les données de la soumission.");
        } finally {
          setLoading(false);
        }
      };
      
      fetchFormSubmission();
      return;
    }
    
    // En mode formulaire public (route /formulaire/:concertId/:token)
    if (isPublicForm) {
      const validateToken = async () => {
        setLoading(true);
        try {
          console.log("Validation du token:", token, "pour le concert:", concertId);
          
          // Vérifier si le token existe dans la collection formLinks
          const formsQuery = query(
            collection(db, 'formLinks'),
            where('token', '==', token),
            where('concertId', '==', concertId)
          );
          
          const formsSnapshot = await getDocs(formsQuery);
          
          if (formsSnapshot.empty) {
            console.error("Token non trouvé dans formLinks");
            setError('Formulaire non trouvé. Le lien est peut-être incorrect.');
            setLoading(false);
            return;
          }
          
          const formDoc = formsSnapshot.docs[0];
          const formLinkData = formDoc.data();
          setFormData(formLinkData);
          setFormLinkId(formDoc.id);
          
          console.log("Données du lien trouvées:", formLinkData);
          
          // Vérifier si le formulaire est déjà complété
          if (formLinkData.completed) {
            console.log("Formulaire déjà complété");
            setCompleted(true);
          }
          
          // Vérifier si le token n'est pas expiré
          const now = new Date();
          const expiryDate = formLinkData.expiryDate ? formLinkData.expiryDate.toDate() : null;
          
          if (expiryDate && now > expiryDate) {
            console.log("Lien expiré:", expiryDate);
            setExpired(true);
            setLoading(false);
            return;
          }
          
          console.log("Récupération des données du concert:", concertId);
          
          // Récupérer les données du concert
          const concertDoc = await getDoc(doc(db, 'concerts', concertId));
          if (concertDoc.exists()) {
            const concertData = concertDoc.data();
            setConcert(concertData);
            
            // Initialiser l'état d'édition du concert
            setConcertData({
              titre: concertData.titre || '',
              date: concertData.date ? new Date(concertData.date.seconds * 1000) : '',
              montant: concertData.montant || '',
              lieuNom: concertData.lieuNom || '',
              lieuAdresse: concertData.lieuAdresse || '',
              lieuCodePostal: concertData.lieuCodePostal || '',
              lieuVille: concertData.lieuVille || ''
            });
            
            console.log("Concert trouvé:", concertData);
            
            // Récupérer les données du lieu
            if (concertData.lieuId) {
              const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
              if (lieuDoc.exists()) {
                const lieuData = lieuDoc.data();
                setLieu(lieuData);
                console.log("Lieu trouvé:", lieuData);
              } else {
                console.log("Lieu non trouvé:", concertData.lieuId);
              }
            }
          } else {
            console.error("Concert non trouvé:", concertId);
            setError("Le concert associé à ce formulaire n'existe pas ou a été supprimé.");
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Erreur lors de la validation du token:', error);
          setError(`Une erreur est survenue lors du chargement du formulaire: ${error.message}`);
        } finally {
          setLoading(false);
        }
      };

      validateToken();
    } else {
      setError("Lien de formulaire invalide. Il manque des paramètres nécessaires.");
      setLoading(false);
    }
  }, [concertId, token, id, isPublicForm, isAdminValidation]);

  // Fonction pour mettre à jour les informations du concert
  const handleUpdateConcertInfo = async () => {
    try {
      // Mettre à jour le document concert dans Firestore
      await updateDoc(doc(db, 'concerts', concertId), {
        lieuNom: concertData.lieuNom,
        lieuAdresse: concertData.lieuAdresse,
        lieuCodePostal: concertData.lieuCodePostal,
        lieuVille: concertData.lieuVille,
        updatedAt: serverTimestamp()
      });
      
      // Mettre à jour l'état local
      setConcert(prev => ({
        ...prev,
        lieuNom: concertData.lieuNom,
        lieuAdresse: concertData.lieuAdresse,
        lieuCodePostal: concertData.lieuCodePostal,
        lieuVille: concertData.lieuVille
      }));
      
      // Désactiver le mode édition
      setEditingConcert(false);
      
      // Afficher une notification de succès
      alert("Les informations du concert ont été mises à jour avec succès!");
    } catch (error) {
      console.error("Erreur lors de la mise à jour des informations du concert:", error);
      alert("Une erreur est survenue lors de la mise à jour des informations du concert.");
    }
  };

  // Fonction pour gérer les changements dans le formulaire d'édition du concert
  const handleConcertDataChange = (e) => {
    const { name, value } = e.target;
    setConcertData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fonction pour formater la date
  const formatDate = (dateValue) => {
    if (!dateValue) return 'Date non spécifiée';
    
    // Si c'est un timestamp Firestore
    if (dateValue.seconds) {
      return new Date(dateValue.seconds * 1000).toLocaleDateString('fr-FR');
    }
    
    // Si c'est une chaîne de date
    try {
      return new Date(dateValue).toLocaleDateString('fr-FR');
    } catch (e) {
      return dateValue;
    }
  };

  // Fonction pour formater le montant
  const formatMontant = (montant) => {
    if (!montant) return '0,00 €';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
  };

  // Contenu pour le formulaire public
  const renderPublicForm = () => {
    if (loading) {
      return (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement du formulaire...</span>
          </div>
          <p className="mt-3">Chargement du formulaire...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-danger">
          <h3>Erreur</h3>
          <p>{error}</p>
        </div>
      );
    }

    if (expired) {
      return (
        <div className="alert alert-warning">
          <h3>Lien expiré</h3>
          <p>Ce lien de formulaire a expiré. Veuillez contacter l'organisateur pour obtenir un nouveau lien.</p>
        </div>
      );
    }

    if (completed && !editingConcert) {
      return (
        <div className="alert alert-success">
          <h3>Formulaire déjà complété</h3>
          <p>Vous avez déjà complété ce formulaire. Merci pour votre participation.</p>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => setCompleted(false)} // Permet de revenir au formulaire
          >
            <i className="bi bi-pencil-square me-2"></i>
            Modifier vos informations
          </button>
        </div>
      );
    }
    

    return (
      <>
        <div className="form-header">
          <h1>Formulaire programmateur</h1>
        </div>
        
        {concert && (
          <div className="concert-info card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="mb-0">Informations sur le concert</h3>
              {!editingConcert ? (
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setEditingConcert(true)}
                >
                  <i className="bi bi-pencil me-1"></i> Modifier
                </button>
              ) : (
                <div>
                  <button 
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() => {
                      // Réinitialiser les valeurs et quitter le mode édition
                      if (concert) {
                        setConcertData({
                          titre: concert.titre || '',
                          date: concert.date ? new Date(concert.date.seconds * 1000) : '',
                          montant: concert.montant || '',
                          lieuNom: concert.lieuNom || '',
                          lieuAdresse: concert.lieuAdresse || '',
                          lieuCodePostal: concert.lieuCodePostal || '',
                          lieuVille: concert.lieuVille || ''
                        });
                      }
                      setEditingConcert(false);
                    }}
                  >
                    <i className="bi bi-x me-1"></i> Annuler
                  </button>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={handleUpdateConcertInfo}
                  >
                    <i className="bi bi-check me-1"></i> Enregistrer
                  </button>
                </div>
              )}
            </div>
            <div className="card-body">
              {!editingConcert ? (
                <>
                  <div className="row mb-3">
                    <div className="col-md-3 fw-bold">Date:</div>
                    <div className="col-md-9">{formatDate(concert.date)}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-3 fw-bold">Lieu:</div>
                    <div className="col-md-9">{concert.lieuNom || lieu?.nom || 'Non spécifié'}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-3 fw-bold">Adresse:</div>
                    <div className="col-md-9">
                      {concert.lieuAdresse || lieu?.adresse ? (
                        <>{concert.lieuAdresse || lieu?.adresse}, {concert.lieuCodePostal || lieu?.codePostal} {concert.lieuVille || lieu?.ville}</>
                      ) : (
                        <span className="text-muted">Adresse non spécifiée</span>
                      )}
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-3 fw-bold">Montant:</div>
                    <div className="col-md-9">{formatMontant(concert.montant)}</div>
                  </div>
                </>
              ) : (
                <form>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">Nom du lieu</label>
                        <input
                          type="text"
                          className="form-control"
                          name="lieuNom"
                          value={concertData.lieuNom}
                          onChange={handleConcertDataChange}
                          placeholder="Nom du lieu"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-12">
                      <div className="form-group position-relative">
                        <label className="form-label">Adresse</label>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            name="lieuAdresse"
                            ref={addressInputRef}
                            value={concertData.lieuAdresse}
                            onChange={handleConcertDataChange}
                            placeholder="Commencez à taper une adresse..."
                            autoComplete="off"
                          />
                          <span className="input-group-text">
                            <i className="bi bi-geo-alt"></i>
                          </span>
                        </div>
                        <div className="form-text small">
                          Commencez à taper pour voir des suggestions d'adresses
                        </div>
                        
                        {/* Suggestions d'adresse */}
                        {addressSuggestions && addressSuggestions.length > 0 && (
                          <div 
                            ref={suggestionsRef} 
                            className="address-suggestions"
                            style={{
                              position: 'absolute',
                              width: '100%',
                              maxHeight: '200px',
                              overflow: 'auto',
                              zIndex: 1000,
                              backgroundColor: 'white',
                              border: '1px solid #ced4da',
                              borderRadius: '0 0 4px 4px',
                              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                              marginTop: '-1px'
                            }}
                          >
                            {addressSuggestions.map((suggestion, index) => (
                              <div
                                key={index}
                                className="address-suggestion-item"
                                style={{
                                  padding: '10px 15px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s',
                                  borderBottom: '1px solid #f0f0f0'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}
                                onClick={() => handleSelectAddress(suggestion)}
                              >
                                <div style={{ marginRight: '10px', color: '#007bff' }}>
                                  <i className="bi bi-geo-alt-fill"></i>
                                </div>
                                <div>
                                  <div style={{ fontWeight: 'bold' }}>{suggestion.display_name}</div>
                                  {suggestion.address && suggestion.address.postcode && suggestion.address.city && (
                                    <div style={{ fontSize: '0.85em', color: '#6c757d' }}>
                                      {suggestion.address.postcode} {suggestion.address.city}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Indicateur de recherche */}
                        {isSearchingAddress && (
                          <div style={{ 
                            position: 'absolute', 
                            top: '100%', 
                            width: '100%', 
                            padding: '10px', 
                            backgroundColor: 'white', 
                            borderRadius: '0 0 4px 4px', 
                            border: '1px solid #ced4da', 
                            borderTop: 'none', 
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)', 
                            zIndex: 1000, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px' 
                          }}>
                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                              <span className="visually-hidden">Recherche en cours...</span>
                            </div>
                            <span>Recherche d'adresses...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label">Code postal</label>
                        <input
                          type="text"
                          className="form-control"
                          name="lieuCodePostal"
                          value={concertData.lieuCodePostal}
                          onChange={handleConcertDataChange}
                          placeholder="Code postal"
                        />
                      </div>
                    </div>
                    <div className="col-md-8">
                      <div className="form-group">
                        <label className="form-label">Ville</label>
                        <input
                          type="text"
                          className="form-control"
                          name="lieuVille"
                          value={concertData.lieuVille}
                          onChange={handleConcertDataChange}
                          placeholder="Ville"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
        
        {/* Recherche d'entreprise */}
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <h3 className="mb-0">Recherche d'entreprise</h3>
          </div>
          <div className="card-body">
            <p className="mb-3">Recherchez votre entreprise pour remplir automatiquement le formulaire.</p>
            
            <div className="mb-4">
              <div className="d-flex gap-2 mb-3">
                <button 
                  className={`btn ${searchType === 'manual' ? 'btn-primary' : 'btn-outline-primary'}`} 
                  onClick={() => setSearchType('manual')}
                >
                  <i className="bi bi-pencil-fill me-2"></i>
                  Saisie manuelle
                </button>
                <button 
                  className={`btn ${searchType === 'name' ? 'btn-primary' : 'btn-outline-primary'}`} 
                  onClick={() => setSearchType('name')}
                >
                  <i className="bi bi-search me-2"></i>
                  Rechercher par nom
                </button>
                <button 
                  className={`btn ${searchType === 'siret' ? 'btn-primary' : 'btn-outline-primary'}`} 
                  onClick={() => setSearchType('siret')}
                >
                  <i className="bi bi-upc-scan me-2"></i>
                  Rechercher par SIREN/SIRET
                </button>
              </div>
              
              {/* Champ de recherche si mode nom ou SIRET */}
              {(searchType === 'name' || searchType === 'siret') && (
                <div className="position-relative mb-4">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className={`bi ${searchType === 'name' ? 'bi-building' : 'bi-upc'}`}></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={searchType === 'name' 
                        ? "Entrez le nom de l'entreprise..." 
                        : "Entrez le numéro SIREN ou SIRET..."
                      }
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {isSearchingCompany && (
                      <span className="input-group-text">
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Recherche en cours...</span>
                        </div>
                      </span>
                    )}
                  </div>
                  <div className="form-text small">
                    {searchType === 'name' 
                      ? "Entrez au moins 3 caractères pour lancer la recherche" 
                      : "Entrez un numéro SIREN (9 chiffres) ou SIRET (14 chiffres)"
                    }
                  </div>
                  
                  {/* Résultats de la recherche d'entreprise */}
                  {searchResults.length > 0 && (
                    <div 
                      ref={companySearchResultsRef} 
                      className="company-search-results"
                      style={{
                        position: 'absolute',
                        width: '100%',
                        maxHeight: '300px',
                        overflow: 'auto',
                        zIndex: 1000,
                        backgroundColor: 'white',
                        border: '1px solid #ced4da',
                        borderRadius: '0 0 4px 4px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        marginTop: '-1px'
                      }}
                    >
                      {searchResults.map((company, index) => (
                        <div
                          key={index}
                          className="company-result-item"
                          style={{
                            padding: '10px 15px',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            borderBottom: '1px solid #f0f0f0'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}
                          onClick={() => handleSelectCompany(company)}
                        >
                          <div style={{ marginRight: '10px', color: '#007bff' }}>
                            <i className="bi bi-building-fill"></i>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold' }}>{company.nom}</div>
                            <div style={{ fontSize: '0.85em', color: '#6c757d' }}>
                              {company.adresse && `${company.adresse}, `}{company.codePostal} {company.ville}
                            </div>
                            <div style={{ fontSize: '0.85em', color: '#6c757d' }}>
                              {company.siren && `SIREN: ${company.siren} • `}
                              {company.siret && `SIRET: ${company.siret} • `}
                              {company.codeAPE && `APE: ${company.codeAPE} `}
                              {company.libelleAPE && `(${company.libelleAPE}) • `}
                              {company.statutJuridique}
                            </div>
                          </div>
                          {company.active ? (
                            <span className="badge bg-success">Actif</span>
                          ) : (
                            <span className="badge bg-danger">Fermé</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Message si aucun résultat */}
                  {searchTerm.length >= 3 && searchResults.length === 0 && !isSearchingCompany && (
                    <div className="alert alert-info mt-2">
                      <i className="bi bi-info-circle-fill me-2"></i>
                      Aucune entreprise trouvée. Vérifiez votre saisie ou essayez avec des termes différents.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="form-content card">
          <div className="card-header">
            <h3>Vos informations</h3>
          </div>
          <div className="card-body">
            <p>Veuillez remplir le formulaire ci-dessous avec vos informations de contact.</p>
            <ProgrammateurForm 
              token={token} 
              concertId={concertId} 
              formLinkId={formLinkId} 
              onSubmitSuccess={() => setCompleted(true)}
            />
          </div>
        </div>
        
        <div className="form-footer mt-4">
          <p className="text-muted text-center">
            Les informations recueillies sur ce formulaire sont enregistrées dans un fichier informatisé 
            à des fins de gestion des concerts. Conformément à la loi « informatique et libertés », 
            vous pouvez exercer votre droit d'accès aux données vous concernant et les faire rectifier.
          </p>
        </div>
      </>
    );
  };

  // Contenu pour l'interface admin de validation
  const renderAdminValidation = () => {
    if (loading) {
      return <div className="text-center my-5">Chargement des données...</div>;
    }

    if (error) {
      return (
        <div className="alert alert-danger">
          <h3>Erreur</h3>
          <p>{error}</p>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/concerts')}>
            Retour à la liste des concerts
          </button>
        </div>
      );
    }

    return (
      <>
        <h2>Validation des informations soumises</h2>
        
        {/* Interface d'administration pour la validation des données */}
        {/* Cette partie dépend de votre implémentation spécifique */}
        
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <h3 className="mb-0">Validation du formulaire</h3>
          </div>
          <div className="card-body">
            <p>Cette interface vous permet de valider les informations soumises par le programmateur.</p>
            
            {/* Affichez ici les données à valider selon votre implémentation */}
            {/* ... */}
            
            <div className="mt-4">
              <button className="btn btn-secondary me-2" onClick={() => navigate('/concerts')}>
                Retour
              </button>
              <button className="btn btn-primary">
                Valider les informations
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  // Rendu final basé sur le mode (public ou admin)
  if (isPublicForm) {
    return <PublicFormLayout>{renderPublicForm()}</PublicFormLayout>;
  }
  
  // En mode admin (dans le layout principal)
  return renderAdminValidation();
};

export default FormResponsePage;