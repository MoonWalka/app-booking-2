import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Form, Button, Card } from 'react-bootstrap';
import { useParametres } from '../../contexts/ParametresContext';
import { useLocationIQ } from '@hooks/useLocationIQ';

const ParametresEntreprise = () => {
  const { parametres, sauvegarderParametres, loading } = useParametres();
  const [localState, setLocalState] = useState(parametres.entreprise || {});
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingCompany, setIsSearchingCompany] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  
  const companySearchTimeoutRef = useRef(null);
  const addressTimeoutRef = useRef(null);
  const addressInputRef = useRef(null);
  const { searchAddress } = useLocationIQ();

  useEffect(() => {
    if (parametres.entreprise) {
      setLocalState(parametres.entreprise);
    }
  }, [parametres.entreprise]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await sauvegarderParametres('entreprise', localState);
    if (success) {
      alert('Paramètres de l\'entreprise sauvegardés avec succès');
    }
  };

  const handleAddressSearch = async (query) => {
    if (addressTimeoutRef.current) {
      clearTimeout(addressTimeoutRef.current);
    }

    if (!query) {
      setAddressSuggestions([]);
      return;
    }

    setIsSearchingAddress(true);
    addressTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchAddress(query);
        setAddressSuggestions(results);
      } catch (error) {
        console.error('Erreur lors de la recherche d\'adresse:', error);
      } finally {
        setIsSearchingAddress(false);
      }
    }, 500);
  };

  const handleAddressSelect = (address) => {
    setLocalState(prev => ({
      ...prev,
      adresse: address.street,
      codePostal: address.postcode,
      ville: address.city,
      latitude: address.lat,
      longitude: address.lon
    }));
    setAddressSuggestions([]);
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <Card>
      <Card.Body>
        <h3 className="mb-3">Informations de l'entreprise</h3>
        <Form onSubmit={handleSubmit}>
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
                <Form.Label>Adresse</Form.Label>
                <Form.Control
                  type="text"
                  name="adresse"
                  value={localState.adresse || ''}
                  onChange={(e) => {
                    handleChange(e);
                    handleAddressSearch(e.target.value);
                  }}
                  ref={addressInputRef}
                />
                {isSearchingAddress && <div>Recherche...</div>}
                {addressSuggestions.length > 0 && (
                  <div className="address-suggestions">
                    {addressSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="suggestion-item"
                        onClick={() => handleAddressSelect(suggestion)}
                      >
                        {suggestion.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Code Postal</Form.Label>
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
                  type="tel"
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
            <Form.Label>Site Web</Form.Label>
            <Form.Control
              type="url"
              name="siteWeb"
              value={localState.siteWeb || ''}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Logo (URL)</Form.Label>
            <Form.Control
              type="url"
              name="logo"
              value={localState.logo || ''}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mentions Légales</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="mentionsLegales"
              value={localState.mentionsLegales || ''}
              onChange={handleChange}
            />
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button type="submit" variant="primary">
              Enregistrer les modifications
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ParametresEntreprise;