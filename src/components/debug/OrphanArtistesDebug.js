import React, { useState } from 'react';
import { Button, Alert, Card, Badge, Spinner } from 'react-bootstrap';
import { diagnoseOrphanArtistes } from '@/utils/diagnoseOrphanArtistes';

const OrphanArtistesDebug = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDiagnose = async () => {
    setLoading(true);
    setError(null);
    try {
      const diagReport = await diagnoseOrphanArtistes();
      setReport(diagReport);
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4>🔍 Diagnostic des Artistes Orphelins</h4>
          <p className="text-muted mb-0">
            Identifier les artistes sans organizationId qui créent des problèmes de recherche
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleDiagnose}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner as="span" animation="border" size="sm" className="me-2" />
              Analyse...
            </>
          ) : (
            <>
              <i className="bi bi-search me-2"></i>
              Lancer le diagnostic
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Erreur lors du diagnostic : {error}
        </Alert>
      )}

      {report && (
        <div>
          {/* Résumé */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">📊 Résumé du diagnostic</h5>
            </Card.Header>
            <Card.Body>
              <div className="row text-center">
                <div className="col-md-3">
                  <div className="border rounded p-3">
                    <h3 className="text-primary">{report.totalArtistes}</h3>
                    <small className="text-muted">Total artistes</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border rounded p-3">
                    <h3 className="text-success">{report.validArtistes}</h3>
                    <small className="text-muted">Artistes valides</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border rounded p-3">
                    <h3 className="text-warning">{report.orphanArtistes}</h3>
                    <small className="text-muted">Artistes orphelins</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border rounded p-3">
                    <h3 className="text-danger">{report.potentialDuplicates}</h3>
                    <small className="text-muted">Doublons potentiels</small>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Alerte si problèmes détectés */}
          {report.orphanArtistes > 0 && (
            <Alert variant="warning">
              <h6>⚠️ Problème détecté</h6>
              <p className="mb-2">
                <strong>{report.orphanArtistes} artistes orphelins</strong> trouvés sans organizationId.
                Cela explique pourquoi la recherche d'artistes ne fonctionne pas correctement.
              </p>
              {report.potentialDuplicates > 0 && (
                <p className="mb-0">
                  <strong>{report.potentialDuplicates} doublons potentiels</strong> identifiés.
                  Ces artistes ont probablement été recréés car ils n'étaient pas trouvés dans la recherche.
                </p>
              )}
            </Alert>
          )}

          {/* Liste détaillée */}
          {report.orphanList.length > 0 && (
            <Card>
              <Card.Header>
                <h5 className="mb-0">📋 Liste des artistes orphelins</h5>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Date création</th>
                        <th>Statut</th>
                        <th>ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.orphanList.map((artiste, index) => (
                        <tr key={artiste.id}>
                          <td>
                            <strong>{artiste.nom || 'Sans nom'}</strong>
                          </td>
                          <td>{artiste.email || '-'}</td>
                          <td>{formatDate(artiste.createdAt)}</td>
                          <td>
                            {artiste.isPotentialDuplicate ? (
                              <Badge bg="danger">🔄 Doublon possible</Badge>
                            ) : (
                              <Badge bg="warning">⚠️ Orphelin</Badge>
                            )}
                          </td>
                          <td>
                            <code className="small">{artiste.id}</code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Recommandations */}
          {report.orphanArtistes > 0 && (
            <Alert variant="info" className="mt-4">
              <h6>💡 Recommandations :</h6>
              <ul className="mb-0">
                <li><strong>Solution immédiate :</strong> Utiliser le système de fallback pour récupérer ces artistes</li>
                <li><strong>Solution à long terme :</strong> Migrer ces artistes vers votre organisation</li>
                <li><strong>Nettoyage :</strong> Supprimer les vrais doublons une fois la migration effectuée</li>
              </ul>
            </Alert>
          )}

          {report.orphanArtistes === 0 && (
            <Alert variant="success">
              <i className="bi bi-check-circle me-2"></i>
              <strong>Parfait !</strong> Aucun artiste orphelin détecté. 
              Tous vos artistes ont un organizationId valide.
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};

export default OrphanArtistesDebug; 