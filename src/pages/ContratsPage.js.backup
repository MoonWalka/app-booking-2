// src/pages/ContratsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, where } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { Container, Row, Col, Card } from 'react-bootstrap';
import FlexContainer from '@/components/ui/FlexContainer';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import { useResponsive } from '@/hooks/common';
import '@styles/index.css';

const ContratsPage = () => {
  const [contrats, setContrats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isMobile } = useResponsive();

  useEffect(() => {
    const fetchContrats = async () => {
      setLoading(true);
      try {
        const contratsQuery = query(
          collection(db, 'contrats'), 
          orderBy('dateGeneration', 'desc')
        );
        const contratsSnapshot = await getDocs(contratsQuery);
        
        const contratsPromises = contratsSnapshot.docs.map(async (doc) => {
          const contratData = doc.data();
          
          // Récupérer les données du concert associé
          let concertData = null;
          if (contratData.concertId) {
            try {
              const concertDoc = await getDocs(query(
                collection(db, 'concerts'),
                where('__name__', '==', contratData.concertId)
              ));
              
              if (!concertDoc.empty) {
                concertData = {
                  id: concertDoc.docs[0].id,
                  ...concertDoc.docs[0].data()
                };
                
                // 🔧 CORRECTION: Charger les noms des entités liées si manquants
                const promises = [];
                
                // Charger le nom du lieu si manquant
                if (concertData.lieuId && !concertData.lieuNom) {
                  promises.push(
                    getDocs(query(collection(db, 'lieux'), where('__name__', '==', concertData.lieuId)))
                      .then(snapshot => {
                        if (!snapshot.empty) {
                          concertData.lieuNom = snapshot.docs[0].data().nom;
                        }
                      })
                      .catch(err => console.error('Erreur chargement lieu:', err))
                  );
                }
                
                // Charger le nom du programmateur si manquant
                if (concertData.programmateurId && !concertData.programmateurNom) {
                  promises.push(
                    getDocs(query(collection(db, 'programmateurs'), where('__name__', '==', concertData.programmateurId)))
                      .then(snapshot => {
                        if (!snapshot.empty) {
                          concertData.programmateurNom = snapshot.docs[0].data().nom;
                        }
                      })
                      .catch(err => console.error('Erreur chargement programmateur:', err))
                  );
                }
                
                // Charger le nom de l'artiste si manquant
                if (concertData.artisteId && !concertData.artisteNom) {
                  promises.push(
                    getDocs(query(collection(db, 'artistes'), where('__name__', '==', concertData.artisteId)))
                      .then(snapshot => {
                        if (!snapshot.empty) {
                          concertData.artisteNom = snapshot.docs[0].data().nom;
                        }
                      })
                      .catch(err => console.error('Erreur chargement artiste:', err))
                  );
                }
                
                // Attendre que tous les chargements soient terminés
                await Promise.all(promises);
              }
            } catch (err) {
              console.error('Erreur lors de la récupération du concert:', err);
            }
          }
          
          return {
            id: doc.id,
            ...contratData,
            concert: concertData
          };
        });
        
        const contratsWithData = await Promise.all(contratsPromises);
        setContrats(contratsWithData);
      } catch (error) {
        console.error('Erreur lors de la récupération des contrats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContrats();
  }, []);

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <FlexContainer justify="space-between" align="center">
            <h2 className="mb-0"><i className="bi bi-file-earmark-text me-2"></i>Contrats</h2>
            <Button 
              variant="primary" 
              onClick={() => navigate('/parametres/contrats')}
            >
              <i className="bi bi-gear me-2"></i>
              Gérer les modèles
            </Button>
          </FlexContainer>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : contrats.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-5 text-center">
            <i className="bi bi-file-earmark-text fs-1 mb-3 text-muted"></i>
            <p className="fs-5">Aucun contrat n'a été généré.</p>
            <p className="text-muted">
              Rendez-vous sur la page de détail d'un concert pour générer un contrat.
            </p>
            <Button 
              variant="outline-primary" 
              className="mt-3"
              onClick={() => navigate('/parametres/contrats')}
            >
              <i className="bi bi-file-earmark-text me-2"></i>
              Gérer les modèles de contrats
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          {isMobile ? (
            <div className="mobile-list">
              {contrats.map(contrat => (
                <Card key={contrat.id} className="mb-3 border-0 shadow-sm">
                  <Card.Body 
                    className="p-3" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/contrats/${contrat.id}`)}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="mb-1 fw-bold">
                          {contrat.concert?.titre || 'N/A'}
                        </h6>
                        <small className="text-muted">
                          {contrat.concert?.artisteNom && `${contrat.concert.artisteNom} • `}
                          {(() => {
                            if (!contrat.dateGeneration) return '-';
                            try {
                              if (contrat.dateGeneration.seconds) {
                                return new Date(contrat.dateGeneration.seconds * 1000).toLocaleDateString('fr-FR');
                              }
                              return new Date(contrat.dateGeneration).toLocaleDateString('fr-FR');
                            } catch (error) {
                              return '-';
                            }
                          })()}
                        </small>
                      </div>
                      {(() => {
                        const getStatusBadge = (status) => {
                          switch (status) {
                            case 'signed':
                              return <Badge variant="green">Signé</Badge>;
                            case 'sent':
                              return <Badge variant="blue">Envoyé</Badge>;
                            case 'generated':
                              return <Badge variant="yellow">Généré</Badge>;
                            default:
                              return <Badge variant="gray">Inconnu</Badge>;
                          }
                        };
                        return getStatusBadge(contrat.status);
                      })()}
                    </div>
                    
                    <div className="small text-muted mb-2">
                      <i className="bi bi-geo-alt me-1"></i>
                      {contrat.concert?.lieuNom || 'N/A'}
                    </div>
                    
                    <div className="small text-muted mb-3">
                      <i className="bi bi-person me-1"></i>
                      {contrat.concert?.programmateurNom || 'N/A'}
                    </div>
                    
                    <div className="d-flex gap-2" onClick={e => e.stopPropagation()}>
                      <button 
                        className="btn btn-sm btn-outline-primary flex-fill"
                        onClick={() => navigate(`/contrats/${contrat.id}`)}
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => navigate(`/contrats/${contrat.id}?preview=web`)}
                      >
                        <i className="bi bi-globe"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => navigate(`/contrats/${contrat.id}/edit`)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-success"
                        onClick={() => window.open(`/contrats/${contrat.id}/download`, '_blank')}
                      >
                        <i className="bi bi-download"></i>
                      </button>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            <Table
              columns={[
                {
                  label: 'Date',
                  key: 'dateGeneration',
                  sortable: true,
                  render: (contrat) => {
                    if (!contrat.dateGeneration) return '-';
                    try {
                      if (contrat.dateGeneration.seconds) {
                        return new Date(contrat.dateGeneration.seconds * 1000).toLocaleDateString('fr-FR');
                      }
                      return new Date(contrat.dateGeneration).toLocaleDateString('fr-FR');
                    } catch (error) {
                      return '-';
                    }
                  }
                },
                {
                  label: 'Concert',
                  key: 'concert.titre',
                  sortable: true,
                  render: (contrat) => (
                    <div>
                      <div style={{ fontWeight: '500' }}>
                        {contrat.concert?.titre || 'N/A'}
                      </div>
                      {contrat.concert?.artisteNom && (
                        <div style={{ fontSize: '0.875rem', color: 'var(--tc-color-text-light)' }}>
                          {contrat.concert.artisteNom}
                        </div>
                      )}
                    </div>
                  )
                },
                {
                  label: 'Lieu',
                  key: 'concert.lieuNom',
                  sortable: true,
                  render: (contrat) => (
                    <div>
                      <i className="bi bi-geo-alt me-2"></i>
                      {contrat.concert?.lieuNom || 'N/A'}
                    </div>
                  )
                },
                {
                  label: 'Programmateur',
                  key: 'concert.programmateurNom',
                  sortable: true,
                  render: (contrat) => (
                    <div>
                      <i className="bi bi-person me-2"></i>
                      {contrat.concert?.programmateurNom || 'N/A'}
                    </div>
                  )
                },
                {
                  label: 'Statut',
                  key: 'status',
                  sortable: true,
                  render: (contrat) => {
                    const getStatusBadge = (status) => {
                      switch (status) {
                        case 'signed':
                          return <Badge variant="green">Signé</Badge>;
                        case 'sent':
                          return <Badge variant="blue">Envoyé</Badge>;
                        case 'generated':
                          return <Badge variant="yellow">Généré</Badge>;
                        default:
                          return <Badge variant="gray">Inconnu</Badge>;
                      }
                    };
                    return getStatusBadge(contrat.status);
                  }
                }
              ]}
              data={contrats}
              renderActions={(contrat) => (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => navigate(`/contrats/${contrat.id}`)} 
                    title="Voir le contrat"
                  >
                    <i className="bi bi-eye"></i>
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => navigate(`/contrats/${contrat.id}?preview=web`)} 
                    title="Aperçu web"
                  >
                    <i className="bi bi-globe"></i>
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-warning"
                    onClick={() => navigate(`/contrats/${contrat.id}/edit`)} 
                    title="Éditer le contrat"
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-success"
                    onClick={() => window.open(`/contrats/${contrat.id}/download`, '_blank')} 
                    title="Télécharger"
                  >
                    <i className="bi bi-download"></i>
                  </button>
                </div>
              )}
              onRowClick={(contratId) => navigate(`/contrats/${contratId}`)}
            />
          )}
        </>
      )}
    </Container>
  );
};

export default ContratsPage;
