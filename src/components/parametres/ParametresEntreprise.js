import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Form, Button, Card, InputGroup, Badge } from 'react-bootstrap';
import { useParametres } from '@/context/ParametresContext';
import { useLocationIQ } from '@/hooks/useLocationIQ';

const ParametresEntreprise = () => {
  const { parametres, sauvegarderParametres, loading } = useParametres();
  const [localState, setLocalState] = useState(parametres.entreprise || {
    nom: '',
    adresse: '',
    codePostal: '',
    ville: '',
    telephone: '',
    email: '',
    siteWeb: '',
    siret: '',
    codeAPE: '',
    logo: '',
    mentionsLegales: '',
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
  
  // Utilisation du hook LocationIQ
  const { isLoading: isApiLoading, error: apiError, searchAddress } = useLocationIQ();
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (parametres.entreprise) {
      setLocalState(parametres.entreprise);
    }
  }, [parametres.entreprise]);

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
      if (!localState.adresse || localState.adresse.length < 3 || isApiLoading) {
        setAddressSuggestions([]);
        return;
      }
      
      setIsSearchingAddress(true);
      
      try {
        // Appeler la fonction du hook
        const results = await searchAddress(localState.adresse);
        setAddressSuggestions(results || []);
      } catch (error) {
        console.error("Erreur lors de la recherche:", error);
        setAddressSuggestions([]);
      } finally {
        setIsSearchingAddress(false);
      }
    };
    
    // N'effectuer la recherche que si l'adresse a au moins 3 caractères
    if (localState.adresse && localState.adresse.length >= 3 && !isApiLoading && searchType === 'manual') {
      addressTimeoutRef.current = setTimeout(handleSearch, 300);
    } else {
      setAddressSuggestions([]);
    }
    
    return () => {
      if (addressTimeoutRef.current) {
        clearTimeout(addressTimeoutRef.current);
      }
    };
  }, [localState.adresse, isApiLoading, searchAddress, searchType]);
  
  // Gestionnaire de clic extérieur pour fermer la liste des suggestions
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Sélectionner une entreprise parmi les résultats
  const handleSelectCompany = (company) => {
    setLocalState(prev => ({
      ...prev,
      nom: company.nom,
      adresse: company.adresse,
      codePostal: company.codePostal,
      ville: company.ville,
      siret: company.siret,
      codeAPE: company.codeAPE
    }));
    
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
    
    // Mettre à jour le state avec les informations d'adresse
    setLocalState(prev => ({
      ...prev,
      adresse: adresse || address.display_name.split(',')[0],
      codePostal,
      ville,
      latitude: address.lat,
      longitude: address.lon
    }));
    
    // Fermer les suggestions
    setAddressSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await sauvegarderParametres('entreprise', localState);
    if (success) {
      setSuccess('Informations de l\'entreprise enregistrées avec succès!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  if (loading) {
    return <div className="text-center"><div className="spinner-border" role="status"></div></div>;
  }

  // Styles CSS pour les suggestions
  const suggestionsStyle = {
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
  };

  const suggestionItemStyle = {
    padding: '10px 15px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    borderBottom: '1px solid #f0f0f0'
  };

  const suggestionIconStyle = {
    marginRight: '10px',
    color: '#007bff'
  };

  return (
    <Card>
      <Card.Body>
        <h3 className="mb-3">Informations de l'entreprise</h3>
        <p className="text-muted">Ces informations apparaîtront dans les entêtes et pieds de page des contrats générés.</p>
        
        {success && (
          <div className="alert alert-success" role="alert">
            {success}
          </div>
        )}
        
        {/* Options de recherche d'entreprise */}
        <div className="mb-4">
          <h5>Comment souhaitez-vous renseigner votre entreprise ?</h5>
          <div className="d-flex gap-2 mb-3">
            <Button 
              variant={searchType === 'manual' ? 'primary' : 'outline-primary'} 
              onClick={() => setSearchType('manual')}
            >
              <i className="bi bi-pencil-fill me-2"></i>
              Saisie manuelle
            </Button>
            <Button 
              variant={searchType === 'name' ? 'primary' : 'outline-primary'} 
              onClick={() => setSearchType('name')}
            >
              <i className="bi bi-search me-2"></i>
              Rechercher par nom
            </Button>
            <Button 
              variant={searchType === 'siret' ? 'primary' : 'outline-primary'} 
              onClick={() => setSearchType('siret')}
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
              
              {/* Résultats de la recherche d'entreprise */}
              {searchResults.length > 0 && (
                <div ref={companySearchResultsRef} style={suggestionsStyle}>
                  {searchResults.map((company, index) => (
                    <div
                      key={index}
                      style={suggestionItemStyle}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}
                      onClick={() => handleSelectCompany(company)}
                      className="company-suggestion-item"
                    >
                      <div style={suggestionIconStyle}>
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
        
        <Form onSubmit={handleSubmit}>
          {/* Champs du formulaire (visibles en mode manuel ou après sélection d'une entreprise) */}
          {(searchType === 'manual' || searchType === 'siret' || searchType === 'name') && (
            <>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nom de l'entreprise</Form.Label>
                    <Form.Control
                      type="text"
                      name="nom"
                      value={localState.nom || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Logo (URL)</Form.Label>
                    <Form.Control
                      type="text"
                      name="logo"
                      value={localState.logo || ''}
                      onChange={handleChange}
                      placeholder="https://example.com/logo.png"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3 position-relative">
                <Form.Label>Adresse</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type="text"
                    name="adresse"
                    ref={addressInputRef}
                    value={localState.adresse || ''}
                    onChange={handleChange}
                    placeholder="Commencez à taper une adresse..."
                    autoComplete="off"
                  />
                  <span className="input-group-text">
                    <i className="bi bi-geo-alt"></i>
                  </span>
                </div>
                {searchType === 'manual' && (
                  <Form.Text className="text-muted">
                    Commencez à taper pour voir des suggestions d'adresses
                  </Form.Text>
                )}
                
                {/* Suggestions d'adresse (uniquement en mode manuel) */}
                {searchType === 'manual' && addressSuggestions && addressSuggestions.length > 0 && (
                  <div ref={suggestionsRef} style={suggestionsStyle}>
                    {addressSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        style={suggestionItemStyle}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}
                        onMouseDown={() => handleSelectAddress(suggestion)}
                        className="address-suggestion-item"
                      >
                        <div style={suggestionIconStyle}>
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
                
                {/* Indicateur de recherche d'adresse */}
                {searchType === 'manual' && isSearchingAddress && (
                  <div style={{ position: 'absolute', top: '100%', width: '100%', padding: '10px', backgroundColor: 'white', borderRadius: '0 0 4px 4px', border: '1px solid #ced4da', borderTop: 'none', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Recherche en cours...</span>
                    </div>
                    <span>Recherche d'adresses...</span>
                  </div>
                )}
              </Form.Group>
              
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Code postal</Form.Label>
                    <Form.Control
                      type="text"
                      name="codePostal"
                      value={localState.codePostal || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Ville</Form.Label>
                    <Form.Control
                      type="text"
                      name="ville"
                      value={localState.ville || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Téléphone</Form.Label>
                    <Form.Control
                      type="text"
                      name="telephone"
                      value={localState.telephone || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={localState.email || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Site web</Form.Label>
                <Form.Control
                  type="text"
                  name="siteWeb"
                  value={localState.siteWeb || ''}
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
                      value={localState.siret || ''}
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
                      value={localState.codeAPE || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Mentions légales (pied de page)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="mentionsLegales"
                  value={localState.mentionsLegales || ''}
                  onChange={handleChange}
                  placeholder="Association loi 1901, etc."
                />
              </Form.Group>
              
              <div className="d-flex justify-content-end">
                <Button type="submit" variant="primary">
                  Enregistrer les modifications
                </Button>
              </div>
            </>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ParametresEntreprise;
