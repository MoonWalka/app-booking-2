import React, { useState } from 'react';
import { Button, Alert, Card, Form, Table, Badge } from 'react-bootstrap';
import { useEntitySearch } from '@/hooks/common/useEntitySearch';
import { useEntreprise } from '@/context/EntrepriseContext';
import { useAuth } from '@/context/AuthContext';

const ArtisteSearchLiveDebug = () => {
  const { currentUser } = useAuth();
  const { currentEntreprise } = useEntreprise();
  const [manualSearchTerm, setManualSearchTerm] = useState('');
  
  // Utiliser exactement le même hook que dans DateForm
  const {
    searchTerm: artisteSearchTerm,
    setSearchTerm: setArtisteSearchTerm,
    results: artisteResults,
    showResults: showArtisteResults,
    setShowResults: setShowArtisteResults,
    isSearching: isSearchingArtistes
  } = useEntitySearch({
    entityType: 'artistes',
    searchField: 'nom',
    additionalSearchFields: ['style'],
    maxResults: 10
  });

  const handleManualSearch = () => {
    console.log('🔍 Recherche manuelle lancée pour:', manualSearchTerm);
    setArtisteSearchTerm(manualSearchTerm);
  };

  const handleClear = () => {
    setManualSearchTerm('');
    setArtisteSearchTerm('');
    setShowArtisteResults(false);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h4>🔍 Debug Recherche Artistes - En Direct</h4>
        <p className="text-muted">
          Test de la recherche d'artistes exactement comme dans le formulaire de concert
        </p>
      </div>

      {/* Informations contextuelles */}
      <Card className="mb-4">
        <Card.Header>
          <h6>📋 Contexte utilisateur</h6>
        </Card.Header>
        <Card.Body>
          <div className="row">
            <div className="col-md-6">
              <strong>Utilisateur:</strong> {currentUser?.email || 'Non connecté'}
            </div>
            <div className="col-md-6">
              <strong>Organisation:</strong> {currentEntreprise?.name || 'Aucune'}
              {currentEntreprise?.id && (
                <code className="ms-2">({currentEntreprise.id})</code>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Interface de test */}
      <Card className="mb-4">
        <Card.Header>
          <h6>🧪 Test de recherche</h6>
        </Card.Header>
        <Card.Body>
          <div className="row">
            <div className="col-md-8">
              <Form.Control
                type="text"
                placeholder="Tapez le nom d'un artiste (ex: m'dezoen)"
                value={manualSearchTerm}
                onChange={(e) => setManualSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
              />
            </div>
            <div className="col-md-4">
              <Button 
                variant="primary" 
                onClick={handleManualSearch} 
                disabled={!manualSearchTerm.trim()}
                className="me-2"
              >
                🔍 Rechercher
              </Button>
              <Button variant="outline-secondary" onClick={handleClear}>
                Effacer
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* État de la recherche */}
      <Card className="mb-4">
        <Card.Header>
          <h6>📊 État de la recherche</h6>
        </Card.Header>
        <Card.Body>
          <div className="row">
            <div className="col-md-3">
              <div className="text-center">
                <Badge bg={artisteSearchTerm ? 'primary' : 'secondary'}>
                  Terme: "{artisteSearchTerm}"
                </Badge>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center">
                <Badge bg={isSearchingArtistes ? 'warning' : 'secondary'}>
                  {isSearchingArtistes ? '🔄 Recherche...' : '⏸️ Arrêt'}
                </Badge>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center">
                <Badge bg={artisteResults.length > 0 ? 'success' : 'danger'}>
                  {artisteResults.length} résultat(s)
                </Badge>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center">
                <Badge bg={showArtisteResults ? 'info' : 'secondary'}>
                  {showArtisteResults ? '👁️ Visible' : '🙈 Caché'}
                </Badge>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Résultats */}
      {artisteSearchTerm && (
        <Card>
          <Card.Header>
            <h6>📋 Résultats de recherche pour "{artisteSearchTerm}"</h6>
          </Card.Header>
          <Card.Body>
            {isSearchingArtistes && (
              <Alert variant="info">
                <i className="bi bi-hourglass-split me-2"></i>
                Recherche en cours...
              </Alert>
            )}

            {!isSearchingArtistes && artisteResults.length === 0 && (
              <Alert variant="warning">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <strong>Aucun résultat trouvé</strong>
                <br />
                <small>
                  Vérifiez que l'artiste existe et appartient à votre organisation "{currentEntreprise?.name}"
                </small>
              </Alert>
            )}

            {!isSearchingArtistes && artisteResults.length > 0 && (
              <div>
                <Alert variant="success">
                  <i className="bi bi-check-circle me-2"></i>
                  <strong>{artisteResults.length} artiste(s) trouvé(s)</strong>
                </Alert>
                
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Style</th>
                      <th>Email</th>
                      <th>Organization ID</th>
                      <th>ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {artisteResults.map((artiste) => (
                      <tr key={artiste.id}>
                        <td><strong>{artiste.nom}</strong></td>
                        <td>{artiste.style || '-'}</td>
                        <td>{artiste.email || '-'}</td>
                        <td>
                          <code className="small">
                            {artiste.organizationId || 'MANQUANT'}
                          </code>
                        </td>
                        <td>
                          <code className="small">{artiste.id}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Conseils de debug */}
      <Alert variant="info" className="mt-4">
        <h6>💡 Conseils de debug :</h6>
        <ul className="mb-0">
          <li>Tapez exactement le même terme que dans le formulaire de concert</li>
          <li>Vérifiez que vous êtes dans la bonne organisation</li>
          <li>Si aucun résultat : l'artiste existe-t-il vraiment ? Avec le bon organizationId ?</li>
          <li>Regardez les logs de la console pour plus d'informations</li>
        </ul>
      </Alert>
    </div>
  );
};

export default ArtisteSearchLiveDebug; 