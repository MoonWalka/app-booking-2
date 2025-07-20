import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Alert, Badge, Button } from 'react-bootstrap';
import AddressInput from '@/components/ui/AddressInput';
import AddressInputGoogle from '@/components/ui/AddressInputGoogle';
import styles from './AddressAutocompleteTest.module.css';

const AddressAutocompleteTest = () => {
  const [locationIQAddress, setLocationIQAddress] = useState('');
  const [googleAddress, setGoogleAddress] = useState('');
  const [locationIQData, setLocationIQData] = useState(null);
  const [googleData, setGoogleData] = useState(null);
  const [googleApiError, setGoogleApiError] = useState(null);
  const [testAddresses] = useState([
    'mairie de pomerol',
    '1 rue de la paix paris',
    'tour eiffel',
    'gare de bordeaux',
    '15 avenue des champs elysées',
    'aéroport charles de gaulle'
  ]);

  // Vérifier l'état de l'API Google au chargement
  useEffect(() => {
    const checkGoogleApi = () => {
      const hasApiKey = process.env.REACT_APP_GOOGLE_PLACES_API_KEY || process.env.REACT_APP_FIREBASE_API_KEY;
      if (!hasApiKey) {
        setGoogleApiError('Aucune clé API Google configurée');
      }
    };
    checkGoogleApi();
  }, []);

  const testAddress = (address) => {
    setLocationIQAddress(address);
    setGoogleAddress(address);
  };

  const clearResults = () => {
    setLocationIQAddress('');
    setGoogleAddress('');
    setLocationIQData(null);
    setGoogleData(null);
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">
              <i className="bi bi-geo-alt me-2"></i>
              Test de comparaison LocationIQ vs Google Places
            </h5>
            <small className="text-muted">
              Comparez la précision des deux systèmes d'autocomplétion d'adresses
            </small>
          </div>
          <Button variant="outline-secondary" size="sm" onClick={clearResults}>
            <i className="bi bi-arrow-clockwise me-1"></i>
            Réinitialiser
          </Button>
        </div>
      </Card.Header>
      
      <Card.Body>
        {/* Adresses de test rapide */}
        <div className="mb-4">
          <h6>Tests rapides :</h6>
          <div className="d-flex flex-wrap gap-2">
            {testAddresses.map((address, index) => (
              <Button
                key={index}
                variant="outline-primary"
                size="sm"
                onClick={() => testAddress(address)}
              >
                {address}
              </Button>
            ))}
          </div>
        </div>

        <Row>
          <Col md={6}>
            <div className={styles.testSection}>
              <div className="d-flex align-items-center mb-3">
                <h6 className="mb-0">LocationIQ</h6>
                <Badge bg="info" className="ms-2">Actuel</Badge>
              </div>
              
              <AddressInput
                label="Adresse avec LocationIQ"
                value={locationIQAddress}
                onChange={(e) => setLocationIQAddress(e.target.value)}
                onAddressSelected={(data) => {
                  console.log('LocationIQ data:', data);
                  setLocationIQData(data);
                }}
                placeholder="Tapez une adresse..."
              />
              
              {locationIQData && (
                <div className={styles.resultBox}>
                  <h6>Données récupérées :</h6>
                  <div className={styles.dataGrid}>
                    <div>
                      <strong>Adresse :</strong> {locationIQData.adresse || <span className="text-muted">Non défini</span>}
                    </div>
                    <div>
                      <strong>Code postal :</strong> {locationIQData.codePostal || <span className="text-muted">Non défini</span>}
                    </div>
                    <div>
                      <strong>Ville :</strong> {locationIQData.ville || <span className="text-muted">Non défini</span>}
                    </div>
                    <div>
                      <strong>Département :</strong> {locationIQData.departement || <span className="text-muted">Non défini</span>}
                    </div>
                    <div>
                      <strong>Région :</strong> {locationIQData.region || <span className="text-muted">Non défini</span>}
                    </div>
                    <div>
                      <strong>Pays :</strong> {locationIQData.pays || <span className="text-muted">Non défini</span>}
                    </div>
                  </div>
                  <details className="mt-2">
                    <summary className="text-muted small">Données complètes</summary>
                    <pre className={styles.jsonData}>
                      {JSON.stringify(locationIQData, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          </Col>

          <Col md={6}>
            <div className={styles.testSection}>
              <div className="d-flex align-items-center mb-3">
                <h6 className="mb-0">Google Places</h6>
                <Badge bg="success" className="ms-2">Nouveau</Badge>
              </div>
              
              {googleApiError && (
                <Alert variant="warning" className="mb-3">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <strong>Configuration requise :</strong>
                  <ol className="mb-0 mt-2">
                    <li>✅ Places API (déjà activée)</li>
                    <li>❌ <strong>Maps JavaScript API</strong> (à activer)</li>
                    <li>Erreur actuelle : ApiNotActivatedMapError</li>
                  </ol>
                  <hr />
                  <div className="d-flex gap-2 flex-wrap">
                    <a href="https://console.cloud.google.com/apis/library/maps-backend.googleapis.com" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
                      <i className="bi bi-box-arrow-up-right me-1"></i>
                      Activer Maps JavaScript API
                    </a>
                    <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary">
                      <i className="bi bi-key me-1"></i>
                      Vérifier les restrictions de clé
                    </a>
                  </div>
                </Alert>
              )}
              
              <AddressInputGoogle
                label="Adresse avec Google Places"
                value={googleAddress}
                onChange={(e) => setGoogleAddress(e.target.value)}
                onAddressSelected={(data) => {
                  console.log('Google Places data:', data);
                  setGoogleData(data);
                }}
                placeholder="Tapez une adresse..."
              />
              
              {googleData && (
                <div className={styles.resultBox}>
                  <h6>Données récupérées :</h6>
                  <div className={styles.dataGrid}>
                    <div>
                      <strong>Adresse :</strong> {googleData.adresse || <span className="text-muted">Non défini</span>}
                    </div>
                    <div>
                      <strong>Code postal :</strong> {googleData.codePostal || <span className="text-muted">Non défini</span>}
                    </div>
                    <div>
                      <strong>Ville :</strong> {googleData.ville || <span className="text-muted">Non défini</span>}
                    </div>
                    <div>
                      <strong>Département :</strong> {googleData.departement || <span className="text-muted">Non défini</span>}
                    </div>
                    <div>
                      <strong>Région :</strong> {googleData.region || <span className="text-muted">Non défini</span>}
                    </div>
                    <div>
                      <strong>Pays :</strong> {googleData.pays || <span className="text-muted">Non défini</span>}
                    </div>
                  </div>
                  <details className="mt-2">
                    <summary className="text-muted small">Données complètes</summary>
                    <pre className={styles.jsonData}>
                      {JSON.stringify(googleData, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          </Col>
        </Row>

        {/* Comparaison */}
        {locationIQData && googleData && (
          <Alert variant="info" className="mt-4">
            <h6>Comparaison :</h6>
            <Row>
              <Col md={6}>
                <strong>LocationIQ</strong>
                <ul className="mb-0">
                  <li>Adresse : {locationIQData.adresse ? '✅' : '❌'}</li>
                  <li>Code postal : {locationIQData.codePostal ? '✅' : '❌'}</li>
                  <li>Ville : {locationIQData.ville ? '✅' : '❌'}</li>
                </ul>
              </Col>
              <Col md={6}>
                <strong>Google Places</strong>
                <ul className="mb-0">
                  <li>Adresse : {googleData.adresse ? '✅' : '❌'}</li>
                  <li>Code postal : {googleData.codePostal ? '✅' : '❌'}</li>
                  <li>Ville : {googleData.ville ? '✅' : '❌'}</li>
                </ul>
              </Col>
            </Row>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default AddressAutocompleteTest;