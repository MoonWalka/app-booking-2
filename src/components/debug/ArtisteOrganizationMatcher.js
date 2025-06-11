import React, { useState } from 'react';
import { Button, Alert, Card, Form, Table, Badge } from 'react-bootstrap';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';

const ArtisteOrganizationMatcher = () => {
  const { currentOrganization } = useOrganization();
  const [artisteName, setArtisteName] = useState('m\'dezoen');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const searchArtiste = async () => {
    if (!artisteName.trim()) return;
    
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Chercher TOUS les artistes avec ce nom (sans filtre organization)
      const artistesRef = collection(db, 'artistes');
      const q = query(artistesRef, where('nom', '==', artisteName.trim()));
      const snapshot = await getDocs(q);

      const foundArtistes = [];
      for (const docSnap of snapshot.docs) {
        const artisteData = { id: docSnap.id, ...docSnap.data() };
        
        // Récupérer les infos de l'organisation si elle existe
        let organizationInfo = null;
        if (artisteData.organizationId) {
          try {
            const orgDoc = await getDoc(doc(db, 'organizations', artisteData.organizationId));
            if (orgDoc.exists()) {
              organizationInfo = { id: orgDoc.id, ...orgDoc.data() };
            }
          } catch (orgError) {
            console.warn('Erreur récupération organisation:', orgError);
          }
        }

        foundArtistes.push({
          ...artisteData,
          organizationInfo
        });
      }

      setResults({
        searchTerm: artisteName,
        currentOrgId: currentOrganization?.id,
        currentOrgName: currentOrganization?.name,
        artistes: foundArtistes,
        inCurrentOrg: foundArtistes.filter(a => a.organizationId === currentOrganization?.id),
        inOtherOrgs: foundArtistes.filter(a => a.organizationId && a.organizationId !== currentOrganization?.id),
        orphans: foundArtistes.filter(a => !a.organizationId)
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    if (date.toDate) return date.toDate().toLocaleDateString('fr-FR');
    if (date instanceof Date) return date.toLocaleDateString('fr-FR');
    return String(date);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h4>🔍 Vérificateur d'Organisation d'Artiste</h4>
        <p className="text-muted">
          Trouve à quelle organisation appartient un artiste spécifique
        </p>
      </div>

      {/* Contexte */}
      <Card className="mb-4">
        <Card.Header>
          <h6>📋 Votre contexte actuel</h6>
        </Card.Header>
        <Card.Body>
          <strong>Organisation actuelle :</strong> {currentOrganization?.name || 'Aucune'}
          {currentOrganization?.id && (
            <code className="ms-2">({currentOrganization.id})</code>
          )}
        </Card.Body>
      </Card>

      {/* Interface de recherche */}
      <Card className="mb-4">
        <Card.Header>
          <h6>🔍 Recherche d'artiste</h6>
        </Card.Header>
        <Card.Body>
          <div className="row">
            <div className="col-md-8">
              <Form.Control
                type="text"
                placeholder="Nom exact de l'artiste"
                value={artisteName}
                onChange={(e) => setArtisteName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchArtiste()}
              />
            </div>
            <div className="col-md-4">
              <Button 
                variant="primary" 
                onClick={searchArtiste} 
                disabled={loading || !artisteName.trim()}
              >
                {loading ? 'Recherche...' : '🔍 Chercher'}
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Erreurs */}
      {error && (
        <Alert variant="danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Erreur : {error}
        </Alert>
      )}

      {/* Résultats */}
      {results && (
        <div>
          {/* Résumé */}
          <Card className="mb-4">
            <Card.Header>
              <h6>📊 Résumé pour "{results.searchTerm}"</h6>
            </Card.Header>
            <Card.Body>
              <div className="row text-center">
                <div className="col-md-3">
                  <div className="border rounded p-3">
                    <h4 className="text-primary">{results.artistes.length}</h4>
                    <small>Total trouvé</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border rounded p-3">
                    <h4 className="text-success">{results.inCurrentOrg.length}</h4>
                    <small>Dans votre org</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border rounded p-3">
                    <h4 className="text-warning">{results.inOtherOrgs.length}</h4>
                    <small>Autres organisations</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border rounded p-3">
                    <h4 className="text-danger">{results.orphans.length}</h4>
                    <small>Sans organisation</small>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Diagnostic */}
          {results.artistes.length === 0 && (
            <Alert variant="warning">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <strong>Aucun artiste trouvé</strong> avec le nom exact "{results.searchTerm}".
              <br />
              <small>Vérifiez l'orthographe exacte du nom.</small>
            </Alert>
          )}

          {results.inCurrentOrg.length === 0 && results.artistes.length > 0 && (
            <Alert variant="danger">
              <i className="bi bi-x-circle me-2"></i>
              <strong>Problème identifié !</strong> L'artiste "{results.searchTerm}" existe mais 
              n'appartient PAS à votre organisation "{results.currentOrgName}".
              <br />
              <strong>Solution :</strong> L'artiste doit être migré vers votre organisation ou 
              vous devez utiliser un système de fallback.
            </Alert>
          )}

          {results.inCurrentOrg.length > 0 && (
            <Alert variant="success">
              <i className="bi bi-check-circle me-2"></i>
              L'artiste est bien dans votre organisation. Le problème de recherche vient d'ailleurs.
            </Alert>
          )}

          {/* Liste détaillée */}
          {results.artistes.length > 0 && (
            <Card>
              <Card.Header>
                <h6>📋 Détails des artistes trouvés</h6>
              </Card.Header>
              <Card.Body>
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Organisation</th>
                      <th>Date création</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.artistes.map((artiste) => (
                      <tr key={artiste.id}>
                        <td><strong>{artiste.nom}</strong></td>
                        <td>{artiste.email || '-'}</td>
                        <td>
                          {artiste.organizationInfo ? (
                            <div>
                              <strong>{artiste.organizationInfo.name}</strong>
                              <br />
                              <code className="small">{artiste.organizationId}</code>
                            </div>
                          ) : artiste.organizationId ? (
                            <div>
                              <span className="text-warning">Organisation inconnue</span>
                              <br />
                              <code className="small">{artiste.organizationId}</code>
                            </div>
                          ) : (
                            <span className="text-danger">Aucune</span>
                          )}
                        </td>
                        <td>{formatDate(artiste.createdAt)}</td>
                        <td>
                          {artiste.organizationId === results.currentOrgId ? (
                            <Badge bg="success">✅ Votre org</Badge>
                          ) : artiste.organizationId ? (
                            <Badge bg="warning">⚠️ Autre org</Badge>
                          ) : (
                            <Badge bg="danger">❌ Orphelin</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ArtisteOrganizationMatcher; 