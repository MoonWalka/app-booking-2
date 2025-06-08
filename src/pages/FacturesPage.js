// src/pages/FacturesPage.js
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
import { useOrganization } from '@/context/OrganizationContext';
import '@styles/index.css';

const FacturesPage = () => {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const { currentOrganization } = useOrganization();

  useEffect(() => {
    const fetchFactures = async () => {
      if (!currentOrganization?.id) return;
      
      setLoading(true);
      try {
        const facturesQuery = query(
          collection(db, 'organizations', currentOrganization.id, 'factures'), 
          orderBy('dateFacture', 'desc')
        );
        const facturesSnapshot = await getDocs(facturesQuery);
        
        const facturesPromises = facturesSnapshot.docs.map(async (doc) => {
          const factureData = doc.data();
          
          // Récupérer les données du concert associé
          let concertData = null;
          if (factureData.concertId) {
            try {
              const concertDoc = await getDocs(query(
                collection(db, 'concerts'),
                where('__name__', '==', factureData.concertId)
              ));
              
              if (!concertDoc.empty) {
                concertData = {
                  id: concertDoc.docs[0].id,
                  ...concertDoc.docs[0].data()
                };
                
                // Charger les noms des entités liées si manquants
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
                
                // Charger le nom du contact si manquant
                if (concertData.contactId && !concertData.contactNom) {
                  promises.push(
                    getDocs(query(collection(db, 'contacts'), where('__name__', '==', concertData.contactId)))
                      .then(snapshot => {
                        if (!snapshot.empty) {
                          concertData.contactNom = snapshot.docs[0].data().nom;
                        }
                      })
                      .catch(err => console.error('Erreur chargement contact:', err))
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
          
          // Récupérer les données de la structure si elle existe
          let structureData = null;
          if (factureData.structureId) {
            try {
              const structureDoc = await getDocs(query(
                collection(db, 'structures'),
                where('__name__', '==', factureData.structureId)
              ));
              
              if (!structureDoc.empty) {
                structureData = {
                  id: structureDoc.docs[0].id,
                  ...structureDoc.docs[0].data()
                };
              }
            } catch (err) {
              console.error('Erreur lors de la récupération de la structure:', err);
            }
          }
          
          return {
            id: doc.id,
            ...factureData,
            concert: concertData,
            structure: structureData
          };
        });
        
        const facturesWithData = await Promise.all(facturesPromises);
        setFactures(facturesWithData);
      } catch (error) {
        console.error('Erreur lors de la récupération des factures:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFactures();
  }, [currentOrganization]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge variant="green">Payée</Badge>;
      case 'sent':
        return <Badge variant="blue">Envoyée</Badge>;
      case 'generated':
        return <Badge variant="yellow">Générée</Badge>;
      default:
        return <Badge variant="gray">Inconnu</Badge>;
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      if (date.seconds) {
        return new Date(date.seconds * 1000).toLocaleDateString('fr-FR');
      } else if (date.toDate) {
        return date.toDate().toLocaleDateString('fr-FR');
      }
      return new Date(date).toLocaleDateString('fr-FR');
    } catch (error) {
      return '-';
    }
  };

  const formatMontant = (montant) => {
    if (!montant && montant !== 0) return '-';
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(montant);
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <FlexContainer justify="space-between" align="center">
            <h2 className="mb-0"><i className="bi bi-receipt me-2"></i>Factures</h2>
            <Button 
              variant="primary" 
              onClick={() => navigate('/parametres/factures')}
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
      ) : factures.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-5 text-center">
            <i className="bi bi-receipt fs-1 mb-3 text-muted"></i>
            <p className="fs-5">Aucune facture n'a été générée.</p>
            <p className="text-muted">
              Rendez-vous sur la page d'un concert pour générer une facture.
            </p>
            <Button 
              variant="outline-primary" 
              className="mt-3"
              onClick={() => navigate('/parametres/factures')}
            >
              <i className="bi bi-receipt me-2"></i>
              Gérer les modèles de factures
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          {isMobile ? (
            <div className="mobile-list">
              {factures.map(facture => (
                <Card key={facture.id} className="mb-3 border-0 shadow-sm">
                  <Card.Body 
                    className="p-3" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/factures/${facture.id}`)}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="mb-1 fw-bold">
                          {facture.numeroFacture || 'N/A'}
                        </h6>
                        <small className="text-muted">
                          {facture.concert?.titre || facture.concert?.nom || 'Concert non spécifié'}
                          {facture.dateFacture && ` • ${formatDate(facture.dateFacture)}`}
                        </small>
                      </div>
                      {getStatusBadge(facture.status)}
                    </div>
                    
                    <div className="small text-muted mb-2">
                      <i className="bi bi-building me-1"></i>
                      {facture.structure?.nom || 'Structure non spécifiée'}
                    </div>
                    
                    <div className="small mb-3">
                      <strong>Montant TTC:</strong> {formatMontant(facture.montantTTC)}
                    </div>
                    
                    <div className="d-flex gap-2" onClick={e => e.stopPropagation()}>
                      <button 
                        className="btn btn-sm btn-outline-primary flex-fill"
                        onClick={() => navigate(`/factures/${facture.id}`)}
                      >
                        <i className="bi bi-eye"></i> Voir
                      </button>
                      {facture.status === 'generated' && (
                        <button 
                          className="btn btn-sm btn-outline-info"
                          title="Marquer comme envoyée"
                        >
                          <i className="bi bi-send"></i>
                        </button>
                      )}
                      {(facture.status === 'generated' || facture.status === 'sent') && (
                        <button 
                          className="btn btn-sm btn-outline-success"
                          title="Marquer comme payée"
                        >
                          <i className="bi bi-check-circle"></i>
                        </button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            <Table
              columns={[
                {
                  label: 'Numéro',
                  key: 'numeroFacture',
                  sortable: true,
                  render: (facture) => (
                    <div style={{ fontWeight: '500' }}>
                      {facture.numeroFacture || 'N/A'}
                    </div>
                  )
                },
                {
                  label: 'Date',
                  key: 'dateFacture',
                  sortable: true,
                  render: (facture) => formatDate(facture.dateFacture)
                },
                {
                  label: 'Concert',
                  key: 'concert.titre',
                  sortable: true,
                  render: (facture) => (
                    <div>
                      <div style={{ fontWeight: '500' }}>
                        {facture.concert?.titre || facture.concert?.nom || 'N/A'}
                      </div>
                      {facture.concert?.artisteNom && (
                        <div style={{ fontSize: '0.875rem', color: 'var(--tc-color-text-light)' }}>
                          {facture.concert.artisteNom}
                        </div>
                      )}
                    </div>
                  )
                },
                {
                  label: 'Client',
                  key: 'structure.nom',
                  sortable: true,
                  render: (facture) => (
                    <div>
                      <i className="bi bi-building me-2"></i>
                      {facture.structure?.nom || 'N/A'}
                    </div>
                  )
                },
                {
                  label: 'Montant TTC',
                  key: 'montantTTC',
                  sortable: true,
                  render: (facture) => (
                    <div style={{ fontWeight: '500' }}>
                      {formatMontant(facture.montantTTC)}
                    </div>
                  )
                },
                {
                  label: 'Statut',
                  key: 'status',
                  sortable: true,
                  render: (facture) => getStatusBadge(facture.status)
                }
              ]}
              data={factures}
              renderActions={(facture) => (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => navigate(`/factures/${facture.id}`)} 
                    title="Voir la facture"
                  >
                    <i className="bi bi-eye"></i>
                  </button>
                  {facture.concertId && (
                    <button 
                      className="btn btn-sm btn-outline-success"
                      onClick={() => navigate(`/factures/generate/${facture.concertId}`)} 
                      title="Régénérer"
                    >
                      <i className="bi bi-arrow-clockwise"></i>
                    </button>
                  )}
                  {facture.status === 'generated' && (
                    <button 
                      className="btn btn-sm btn-outline-info"
                      title="Marquer comme envoyée"
                    >
                      <i className="bi bi-send"></i>
                    </button>
                  )}
                  {(facture.status === 'generated' || facture.status === 'sent') && (
                    <button 
                      className="btn btn-sm btn-outline-success"
                      title="Marquer comme payée"
                    >
                      <i className="bi bi-check-circle"></i>
                    </button>
                  )}
                </div>
              )}
              onRowClick={(facture) => navigate(`/factures/${facture.id}`)}
            />
          )}
        </>
      )}
    </Container>
  );
};

export default FacturesPage;