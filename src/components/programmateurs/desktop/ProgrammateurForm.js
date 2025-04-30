import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { collection, addDoc, query, where, getDocs, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/firebaseInit';
import { useLocationIQ } from '@/hooks/useLocationIQ';
import '@styles/index.css';
import { useNavigate } from 'react-router-dom';


const ProgrammateurForm = ({ token, concertId, formLinkId, initialLieuData, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    fonction: '',
    email: '',
    telephone: '',
    structure: '',
    structureType: '',
    structureAdresse: '',
    structureCodePostal: '',
    structureVille: '',
    structurePays: 'France',
    siret: '',
    codeAPE: ''
  });
  
  // États pour les informations du lieu
  const [lieuData, setLieuData] = useState({
    nom: '',
    adresse: '',
    codePostal: '',
    ville: '',
    capacite: '',
    latitude: null,
    longitude: null
  });

  // États pour la recherche d'entreprise
  const [searchType, setSearchType] = useState('manual'); // 'manual', 'name', 'siret'
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingCompany, setIsSearchingCompany] = useState(false);
  const companySearchTimeoutRef = useRef(null);
  const companySearchResultsRef = useRef(null);
  
  // États pour les suggestions d'adresse
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const addressTimeoutRef = useRef(null);
  const addressInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  // États pour l'auto-complétion d'adresse de lieu
  const [lieuAddressSuggestions, setLieuAddressSuggestions] = useState([]);
  const [isSearchingLieuAddress, setIsSearchingLieuAddress] = useState(false);
  const lieuAddressTimeoutRef = useRef(null);
  const lieuAddressInputRef = useRef(null);
  const lieuSuggestionsRef = useRef(null);
  
  // Ajout d'états pour suivre si les champs d'adresse sont actifs
  const [addressFieldActive, setAddressFieldActive] = useState(false);
  const [lieuAddressFieldActive, setLieuAddressFieldActive] = useState(false);
  
  // États pour la gestion du formulaire
  const [existingProgrammId, setExistingProgrammId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Fonction pour gérer l'annulation du formulaire
  const handleCancel = () => {
    if (onSubmitSuccess) {
      onSubmitSuccess();
    } else {
      navigate('/programmateurs');
    }
  };
  
  // Utilisation du hook LocationIQ pour l'autocomplétion d'adresse
  const { isLoading: isApiLoading, error: apiError, searchAddress } = useLocationIQ();

  // Initialiser lieuData avec initialLieuData si fourni
  useEffect(() => {
    if (initialLieuData && Object.keys(initialLieuData).length > 0) {
      setLieuData(prev => ({
        ...prev,
        ...initialLieuData
      }));
    }
  }, [initialLieuData]);
  
  // Chercher si ce formulaire a déjà été rempli pour pré-remplir les données
  useEffect(() => {
    const fetchPreviousData = async () => {
      setLoading(true);
      try {
        // Vérifier si on a déjà une soumission pour ce formulaire
        const submissionsQuery = query(
          collection(db, 'formSubmissions'),
          where('concertId', '==', concertId)
        );
        
        const submissionsSnapshot = await getDocs(submissionsQuery);
        
        if (!submissionsSnapshot.empty) {
          // Prendre la soumission la plus récente pour pré-remplir le formulaire
          const submissions = submissionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Trier par date (plus récent en premier)
          submissions.sort((a, b) => {
            const dateA = a.submittedAt?.toDate() || new Date(0);
            const dateB = b.submittedAt?.toDate() || new Date(0);
            return dateB - dateA;
          });
          
          const latestSubmission = submissions[0];
          
          // Si la soumission contient des données de programmateur, les utiliser
          if (latestSubmission.programmateurData) {
            setFormData(latestSubmission.programmateurData);
          } else if (latestSubmission.data) {
            // Compatibilité avec l'ancien format
            setFormData(latestSubmission.data);
          }
          
          // Si la soumission a un ID de programmateur, le récupérer
          if (latestSubmission.programmId) {
            setExistingProgrammId(latestSubmission.programmId);
          }
          
          // Si la soumission contient des données de lieu, les utiliser
          if (latestSubmission.lieuData) {
            setLieuData(latestSubmission.lieuData);
          }
        }
        
        // Ajouter cette partie pour rechercher les informations de contact par concertId
        if (concertId) {
          const concertDoc = await getDoc(doc(db, 'concerts', concertId));
          if (concertDoc.exists()) {
            const concertData = concertDoc.data();
            
            // Si le concert a un programmateur associé
            if (concertData.programmateurId) {
              const progDoc = await getDoc(doc(db, 'programmateurs', concertData.programmateurId));
              if (progDoc.exists()) {
                const progData = progDoc.data();
                
                // Pré-remplir les champs avec les infos existantes s'ils ne sont pas déjà remplis
                setFormData(prev => ({
                  ...prev,
                  nom: prev.nom || progData.nom || '',
                  prenom: prev.prenom || progData.prenom || '',
                  email: prev.email || progData.email || '',
                  telephone: prev.telephone || progData.telephone || '',
                  fonction: prev.fonction || progData.fonction || ''
                  // Vous pouvez ajouter d'autres champs ici si nécessaire
                }));
                
                // Sauvegarder l'ID du programmateur
                setExistingProgrammId(concertData.programmateurId);
              }
            } else {
              // Si le concert n'a pas de programmateur associé, mais a des informations de contact
              // Par exemple, si ces champs sont stockés directement dans le concert
              if (concertData.programmateurEmail) {
                setFormData(prev => ({
                  ...prev,
                  nom: prev.nom || concertData.programmateurNom || '',
                  prenom: prev.prenom || concertData.programmateurPrenom || '',
                  email: prev.email || concertData.programmateurEmail || '',
                  telephone: prev.telephone || concertData.programmateurTelephone || '',
                  fonction: prev.fonction || concertData.programmateurFonction || ''
                }));
              }
            }
            
            // Si des données du lieu sont disponibles via le concertId, les récupérer également
            if (concertData.lieuId) {
              const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
              if (lieuDoc.exists()) {
                const lieuInfo = lieuDoc.data();
                // Pré-remplir les champs du lieu avec les infos existantes s'ils ne sont pas déjà remplis
                setLieuData(prev => ({
                  nom: prev.nom || lieuInfo.nom || '',
                  adresse: prev.adresse || lieuInfo.adresse || '',
                  codePostal: prev.codePostal || lieuInfo.codePostal || '',
                  ville: prev.ville || lieuInfo.ville || '',
                  capacite: prev.capacite || lieuInfo.capacite || '',
                  latitude: prev.latitude || lieuInfo.latitude || null,
                  longitude: prev.longitude || lieuInfo.longitude || null
                }));
              }
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données existantes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (concertId) {
      fetchPreviousData();
    } else {
      setLoading(false);
    }
  }, [concertId]);

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

  // Effet pour la recherche d'adresse de structure
  useEffect(() => {
    if (addressTimeoutRef.current) {
      clearTimeout(addressTimeoutRef.current);
    }
    
    const handleSearch = async () => {
      if (!formData.structureAdresse || formData.structureAdresse.length < 3 || isApiLoading) {
        setAddressSuggestions([]);
        return;
      }
      
      setIsSearchingAddress(true);
      
      try {
        // Appeler la fonction du hook
        const results = await searchAddress(formData.structureAdresse);
        setAddressSuggestions(results || []);
      } catch (error) {
        console.error("Erreur lors de la recherche d'adresse:", error);
        setAddressSuggestions([]);
      } finally {
        setIsSearchingAddress(false);
      }
    };
    
    // N'effectuer la recherche que si le champ est actif et l'adresse a au moins 3 caractères
    if (addressFieldActive && formData.structureAdresse && formData.structureAdresse.length >= 3 && !isApiLoading && searchType === 'manual') {
      addressTimeoutRef.current = setTimeout(handleSearch, 300);
    } else {
      setAddressSuggestions([]);
    }
    
    return () => {
      if (addressTimeoutRef.current) {
        clearTimeout(addressTimeoutRef.current);
      }
    };
  }, [formData.structureAdresse, isApiLoading, searchAddress, searchType, addressFieldActive]);

  // Effet pour la recherche d'adresse de lieu
  useEffect(() => {
    if (lieuAddressTimeoutRef.current) {
      clearTimeout(lieuAddressTimeoutRef.current);
    }
    
    const searchLieuAddress = async () => {
      if (!lieuData.adresse || lieuData.adresse.length < 3 || isApiLoading) {
        setLieuAddressSuggestions([]);
        return;
      }
      
      setIsSearchingLieuAddress(true);
      
      try {
        // Appeler la fonction du hook
        const results = await searchAddress(lieuData.adresse);
        setLieuAddressSuggestions(results || []);
      } catch (error) {
        console.error("Erreur lors de la recherche d'adresse pour le lieu:", error);
        setLieuAddressSuggestions([]);
      } finally {
        setIsSearchingLieuAddress(false);
      }
    };
    
    // N'effectuer la recherche que si le champ est actif et l'adresse a au moins 3 caractères
    if (lieuAddressFieldActive && lieuData.adresse && lieuData.adresse.length >= 3 && !isApiLoading) {
      lieuAddressTimeoutRef.current = setTimeout(searchLieuAddress, 300);
    } else {
      setLieuAddressSuggestions([]);
    }
    
    return () => {
      if (lieuAddressTimeoutRef.current) {
        clearTimeout(lieuAddressTimeoutRef.current);
      }
    };
  }, [lieuData.adresse, isApiLoading, searchAddress, lieuAddressFieldActive]);

  // Gestionnaire de clic extérieur pour fermer les suggestions d'adresse
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Pour les suggestions d'adresse de structure
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) && 
          addressInputRef.current && !addressInputRef.current.contains(event.target)) {
        setAddressSuggestions([]);
      }
      
      // Pour les suggestions d'adresse de lieu
      if (lieuSuggestionsRef.current && !lieuSuggestionsRef.current.contains(event.target) && 
          lieuAddressInputRef.current && !lieuAddressInputRef.current.contains(event.target)) {
        setLieuAddressSuggestions([]);
      }
      
      // Pour les résultats de recherche d'entreprise
      if (companySearchResultsRef.current && !companySearchResultsRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Gestionnaire de changement de champ
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Réinitialiser l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: null
      }));
    }
  };

  // Sélectionner une entreprise parmi les résultats
  const handleSelectCompany = (company) => {
    setFormData(prev => ({
      ...prev,
      structure: company.nom,
      structureType: company.statutJuridique || '',
      structureAdresse: company.adresse || '',
      structureCodePostal: company.codePostal || '',
      structureVille: company.ville || '',
      siret: company.siret || '',
      codeAPE: company.codeAPE || ''
    }));
    
    setSearchResults([]);
    setSearchTerm('');
    setSearchType('manual'); // Revenir au mode manuel après sélection
  };

  // Sélectionner une adresse pour la structure
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
    
    // Mettre à jour le state avec les informations d'adresse
    setFormData(prev => ({
      ...prev,
      structureAdresse: adresse || address.display_name.split(',')[0],
      structureCodePostal: codePostal,
      structureVille: ville
    }));
    
    // Fermer les suggestions
    setAddressSuggestions([]);
  };

  // Sélectionner une adresse pour le lieu
  const handleSelectLieuAddress = (address) => {
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
    
    // Mettre à jour le state avec les informations d'adresse
    setLieuData(prev => ({
      ...prev,
      adresse: adresse || address.display_name.split(',')[0],
      codePostal,
      ville,
      latitude: address.lat,
      longitude: address.lon
    }));
    
    // Fermer les suggestions
    setLieuAddressSuggestions([]);
  };

  // Valider le formulaire
  const validateForm = () => {
    const newErrors = {};
    
    // Validation des champs requis
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    
    // L'email n'est plus requis, mais on valide quand même son format s'il est fourni
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'adresse email invalide";
    }
    
    if (!formData.structure.trim()) newErrors.structure = 'Le nom de la structure est requis';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      let programmId = existingProgrammId;
      
      // Si nous n'avons pas d'ID de programmateur, essayons de trouver un programmateur existant
      if (!programmId) {
        // Si un email est fourni, rechercher par email
        if (formData.email) {
          const programmateursQuery = query(
            collection(db, 'programmateurs'),
            where('email', '==', formData.email)
          );
          
          const programmateursSnapshot = await getDocs(programmateursQuery);
          
          if (!programmateursSnapshot.empty) {
            // On a trouvé un programmateur existant, on utilise son ID
            programmId = programmateursSnapshot.docs[0].id;
          }
        } else {
          // Si pas d'email, rechercher par nom et prénom
          const programmateursQuery = query(
            collection(db, 'programmateurs'),
            where('nom', '==', formData.nom),
            where('prenom', '==', formData.prenom)
          );
          
          const programmateursSnapshot = await getDocs(programmateursQuery);
          
          if (!programmateursSnapshot.empty) {
            // On a trouvé un programmateur existant, on utilise son ID
            programmId = programmateursSnapshot.docs[0].id;
          }
        }
        
        // Si aucun programmateur existant n'a été trouvé, en créer un nouveau
        if (!programmId) {
          // Créer un nouveau programmateur avec uniquement les informations minimales
          // Les informations complètes seront ajoutées après validation
          const programmateurData = {
            nom: formData.nom,
            prenom: formData.prenom,
            email: formData.email || '', // Utiliser une chaîne vide si pas d'email
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          
          const docRef = await addDoc(collection(db, 'programmateurs'), programmateurData);
          programmId = docRef.id;
        }
      }
      
      // Préparation des données pour la soumission
      const submissionData = {
        concertId,
        programmId,
        programmateurData: { ...formData },
        lieuData: { ...lieuData }, // Ajouter les données du lieu
        submittedAt: serverTimestamp(),
        status: 'submitted' // En attente de validation
      };
      
      // Créer la soumission
      const submissionRef = await addDoc(collection(db, 'formSubmissions'), submissionData);
      
      // Mettre à jour le statut du lien (s'il existe)
      if (formLinkId) {
        await updateDoc(doc(db, 'formLinks', formLinkId), {
          completed: true,
          completedAt: serverTimestamp()
        });
      }
      
      // Notifier le succès
      setSuccess(true);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      setError('Une erreur est survenue lors de la soumission. Veuillez réessayer plus tard.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-4">
  <div className="spinner-border text-primary" role="status">
    <span className="visually-hidden">Chargement...</span>
  </div>
  <p className="mt-2">Chargement du formulaire...</p>
</div>

    );
  }

  if (success) {
    return (
      <div className="form-success text-center my-4">
        <div className="icon-container mb-3">
          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
        </div>
        <h2 className="mb-3">Merci pour votre soumission !</h2>
        <p className="mb-4">Vos informations ont été enregistrées avec succès.</p>
        {!onSubmitSuccess && (
          <Button 
            variant="outline-primary" 
            onClick={() => setSuccess(false)}
          >
            <i className="bi bi-pencil me-2"></i>
            Modifier mes informations
          </Button>
        )}
      </div>
    );
  }

  // Styles pour les suggestions d'adresse
  const suggestionsStyle = {
    position: 'absolute',
    width: '100%',
    maxHeight: '200px',
    overflowY: 'auto',
    zIndex: 1000,
    backgroundColor: 'white',
    border: '1px solid #ced4da',
    borderRadius: '0 0 4px 4px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    marginTop: '-1px'
  };

  const suggestionItemStyle = {
    padding: '10px 15px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    borderBottom: '1px solid #f0f0f0',
    hoverBgColor: '#f8f9fa'
  };

  const suggestionIconStyle = {
    marginRight: '10px',
    color: '#007bff'
  };

  return (
    <Form onSubmit={handleSubmit} className="programmer-form">
      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </Alert>
      )}
      
      {/* Section des informations de contact */}
      <div className="card mb-4">
        <div className="card-header">
          <h3>Informations de contact</h3>
        </div>
        <div className="card-body">
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nom <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  isInvalid={!!errors.nom}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.nom}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Prénom <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  isInvalid={!!errors.prenom}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.prenom}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Fonction</Form.Label>
            <Form.Control
              type="text"
              name="fonction"
              value={formData.fonction}
              onChange={handleChange}
              placeholder="Ex: Directeur artistique, Responsable programmation..."
            />
          </Form.Group>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Facultatif, mais recommandé pour les communications futures.
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Téléphone</Form.Label>
                <Form.Control
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </div>
      </div>
      
      {/* Section Structure juridique avec recherche d'entreprise intégrée */}
      <div className="card mb-4">
        <div className="card-header">
          <h3>Structure juridique</h3>
        </div>
        <div className="card-body">
          {/* Options de recherche d'entreprise */}
          <div className="mb-4">
            <h5>Comment souhaitez-vous renseigner votre structure ?</h5>
            <div className="d-flex gap-2 mb-3">
              <Button 
                variant={searchType === 'manual' ? 'primary' : 'outline-primary'} 
                onClick={() => setSearchType('manual')}
                size="sm"
              >
                <i className="bi bi-pencil-fill me-2"></i>
                Saisie manuelle
              </Button>
              <Button 
                variant={searchType === 'name' ? 'primary' : 'outline-primary'} 
                onClick={() => setSearchType('name')}
                size="sm"
              >
                <i className="bi bi-search me-2"></i>
                Rechercher par nom
              </Button>
              <Button 
                variant={searchType === 'siret' ? 'primary' : 'outline-primary'} 
                onClick={() => setSearchType('siret')}
                size="sm"
              >
                <i className="bi bi-upc-scan me-2"></i>
                Rechercher par SIREN/SIRET
              </Button>
            </div>
            
            {/* Champ de recherche si mode nom ou SIRET */}
            {(searchType === 'name' || searchType === 'siret') && (
              <div className="position-relative mb-4">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className={`bi ${searchType === 'name' ? 'bi-building' : 'bi-upc'}`}></i>
                  </span>
                  <Form.Control
                    type="text"
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
                <small className="form-text text-muted">
                  {searchType === 'name' 
                    ? "Entrez au moins 3 caractères pour lancer la recherche" 
                    : "Entrez un numéro SIREN (9 chiffres) ou SIRET (14 chiffres)"
                  }
                </small>
                
                {/* Résultats de recherche d'entreprise */}
                {searchResults.length > 0 && (
                  <div 
                    ref={companySearchResultsRef} 
                    className="position-absolute w-100 bg-white border rounded shadow-sm"
                    style={{ zIndex: 1000 }}
                  >
                    {searchResults.map((company, index) => (
                      <div
                        key={index}
                        className="p-3 border-bottom"
                        onClick={() => handleSelectCompany(company)}
                        style={{ cursor: 'pointer' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}
                      >
                        <div className="d-flex">
                          <div className="me-2 text-primary">
                            <i className="bi bi-building-fill"></i>
                          </div>
                          <div className="flex-grow-1">
                            <div className="fw-bold">{company.nom}</div>
                            <div className="small text-muted">
                              {company.adresse && `${company.adresse}, `}{company.codePostal} {company.ville}
                            </div>
                            <div className="small text-muted">
                              {company.siren && `SIREN: ${company.siren} • `}
                              {company.siret && `SIRET: ${company.siret} • `}
                              {company.codeAPE && `APE: ${company.codeAPE}`}
                            </div>
                          </div>
                          
                          {company.active ? (
                            <span className="badge bg-success ms-2">Actif</span>
                          ) : (
                            <span className="badge bg-danger ms-2">Fermé</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Message si aucun résultat */}
            {searchTerm.length >= 3 && searchResults.length === 0 && !isSearchingCompany && (
              <div className="alert alert-info mt-2">
                <i className="bi bi-info-circle me-2"></i>
                Aucune entreprise trouvée. Vérifiez votre saisie ou saisissez les informations manuellement.
              </div>
            )}
          </div>
        
          {/* Formulaire de structure juridique */}
          <Form.Group className="mb-3">
            <Form.Label>Raison sociale {/*<span className="text-danger">*</span>*/}</Form.Label>
            <Form.Control
              type="text"
              name="structure"
              value={formData.structure}
              onChange={handleChange}
              //required
              isInvalid={!!errors.structure}
            />
            <Form.Control.Feedback type="invalid">
              {errors.structure}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Type de structure</Form.Label>
            <Form.Select
              name="structureType"
              value={formData.structureType}
              onChange={handleChange}
            >
              <option value="">Sélectionnez...</option>
              <option value="Association">Association</option>
              <option value="SARL">SARL</option>
              <option value="SAS">SAS</option>
              <option value="EURL">EURL</option>
              <option value="Entreprise individuelle">Entreprise individuelle</option>
              <option value="Collectivité territoriale">Collectivité territoriale</option>
              <option value="Autre">Autre</option>
            </Form.Select>
          </Form.Group>
          
          <Form.Group className="mb-3 position-relative">
            <Form.Label>Adresse</Form.Label>
            <div className="input-group">
              <Form.Control
                type="text"
                name="structureAdresse"
                ref={addressInputRef}
                value={formData.structureAdresse}
                onChange={handleChange}
                placeholder="Numéro et nom de la rue"
                onFocus={() => setAddressFieldActive(true)}
                onBlur={() => {
                  // Délai pour permettre le clic sur une suggestion
                  setTimeout(() => setAddressFieldActive(false), 200);
                }}
              />
              <span className="input-group-text">
                <i className="bi bi-geo-alt"></i>
              </span>
            </div>
            
            {/* Suggestions d'adresse pour la structure */}
            {addressSuggestions.length > 0 && (
              <div ref={suggestionsRef} style={suggestionsStyle}>
                {addressSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    style={suggestionItemStyle}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                    onMouseOut={(e) => e.target.style.backgroundColor = ''}
                    onMouseDown={() => handleSelectAddress(suggestion)}
                  >
                    <div style={suggestionIconStyle}>
                      <i className="bi bi-geo-alt-fill"></i>
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{suggestion.display_name}</div>
                      {suggestion.address && (
                        <div style={{ fontSize: '0.85em', color: '#6c757d' }}>
                          {suggestion.address.postcode} {suggestion.address.city}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Form.Group>
          
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Code postal</Form.Label>
                <Form.Control
                  type="text"
                  name="structureCodePostal"
                  value={formData.structureCodePostal}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Ville</Form.Label>
                <Form.Control
                  type="text"
                  name="structureVille"
                  value={formData.structureVille}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Pays</Form.Label>
            <Form.Control
              type="text"
              name="structurePays"
              value={formData.structurePays}
              onChange={handleChange}
            />
          </Form.Group>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>SIRET</Form.Label>
                <Form.Control
                  type="text"
                  name="siret"
                  value={formData.siret}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Code APE</Form.Label>
                <Form.Control
                  type="text"
                  name="codeAPE"
                  value={formData.codeAPE}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </div>
      </div>
      
      {/* Section d'édition des informations du lieu */}
      <div className="card mb-4">
        <div className="card-header">
          <h3>Informations sur le lieu</h3>
        </div>
        <div className="card-body">
          <p className="text-muted mb-3">Si vous disposez d'informations supplémentaires concernant le lieu du concert, vous pouvez les renseigner ici.</p>
          
          <Form.Group className="mb-3">
            <Form.Label>Nom du lieu</Form.Label>
            <Form.Control
              type="text"
              name="nomLieu"
              value={lieuData.nom}
              onChange={(e) => setLieuData({...lieuData, nom: e.target.value})}
              placeholder="Nom du lieu"
            />
          </Form.Group>
          
          <Form.Group className="mb-3 position-relative">
            <Form.Label>Adresse</Form.Label>
            <div className="input-group">
              <Form.Control
                type="text"
                name="adresseLieu"
                ref={lieuAddressInputRef}
                value={lieuData.adresse}
                onChange={(e) => setLieuData({...lieuData, adresse: e.target.value})}
                placeholder="Adresse du lieu"
                onFocus={() => setLieuAddressFieldActive(true)}
                onBlur={() => {
                  // Délai pour permettre le clic sur une suggestion
                  setTimeout(() => setLieuAddressFieldActive(false), 200);
                }}
              />
              <span className="input-group-text">
                <i className="bi bi-geo-alt"></i>
              </span>
            </div>
            
            {/* Suggestions d'adresse pour le lieu */}
            {lieuAddressSuggestions.length > 0 && (
              <div ref={lieuSuggestionsRef} style={suggestionsStyle}>
                {lieuAddressSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    style={suggestionItemStyle}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                    onMouseOut={(e) => e.target.style.backgroundColor = ''}
                    onMouseDown={() => handleSelectLieuAddress(suggestion)}
                  >
                    <div style={suggestionIconStyle}>
                      <i className="bi bi-geo-alt-fill"></i>
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{suggestion.display_name}</div>
                      {suggestion.address && (
                        <div style={{ fontSize: '0.85em', color: '#6c757d' }}>
                          {suggestion.address.postcode} {suggestion.address.city}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Form.Group>
          
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Code postal</Form.Label>
                <Form.Control
                  type="text"
                  name="codePostalLieu"
                  value={lieuData.codePostal}
                  onChange={(e) => setLieuData({...lieuData, codePostal: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Ville</Form.Label>
                <Form.Control
                  type="text"
                  name="villeLieu"
                  value={lieuData.ville}
                  onChange={(e) => setLieuData({...lieuData, ville: e.target.value})}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Capacité</Form.Label>
            <Form.Control
              type="number"
              name="capaciteLieu"
              value={lieuData.capacite}
              onChange={(e) => setLieuData({...lieuData, capacite: e.target.value})}
              placeholder="Nombre de places"
            />
          </Form.Group>
        </div>
      </div>
      
      <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={handleCancel}
          >
            <i className="bi bi-x-circle me-1"></i>
            Annuler
          </button>
          <button 
            type="submit" 
            className="btn btn-primary d-flex align-items-center gap-2"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Enregistrement...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-1"></i>
                Enregistrer
              </>
            )}
          </button>
        </div>
    </Form>
  );
};

export default ProgrammateurForm;
