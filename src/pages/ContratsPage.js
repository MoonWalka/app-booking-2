// src/pages/ContratsPage.js
import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, where } from '@/firebase';
import { db } from '@/firebase';
import { Table, Badge, Button, Container, Row, Col, Card } from 'react-bootstrap';
import ContratGenerationPage from '@pages/ContratGenerationPage.js';
import ContratDetailsPage from '@pages/ContratDetailsPage.js';
import '@styles/index.css';

// Charger les composants de manière dynamique pour éviter les dépendances circulaires
const ContratTemplatesPage = React.lazy(() => import('@pages/contratTemplatesPage.js'));
const ContratTemplatesEditPage = React.lazy(() => import('@pages/contratTemplatesEditPage.js'));

const ContratsPage = () => {
  const [contrats, setContrats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const formatDate = (dateValue) => {
    if (!dateValue) return '-';
    
    try {
      if (dateValue.seconds) {
        return new Date(dateValue.seconds * 1000).toLocaleDateString('fr-FR');
      }
      
      return new Date(dateValue).toLocaleDateString('fr-FR');
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return '-';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'signed':
        return <Badge bg="success">Signé</Badge>;
      case 'sent':
        return <Badge bg="info">Envoyé</Badge>;
      case 'generated':
        return <Badge bg="warning">Généré</Badge>;
      default:
        return <Badge bg="secondary">Inconnu</Badge>;
    }
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0"><i className="bi bi-file-earmark-text me-2"></i>Contrats</h2>
            <Button 
              variant="primary" 
              onClick={() => navigate('/parametres/contrats')}
            >
              <i className="bi bi-gear me-2"></i>
              Gérer les modèles
            </Button>
          </div>
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
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <Table hover responsive className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-3" style={{ width: '12%' }}>Date</th>
                  <th style={{ width: '25%' }}>Concert</th>
                  <th style={{ width: '20%' }}>Lieu</th>
                  <th style={{ width: '20%' }}>Programmateur</th>
                  <th style={{ width: '10%' }}>Statut</th>
                  <th className="pe-3" style={{ width: '13%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contrats.map(contrat => (
                  <tr 
                    key={contrat.id} 
                    onClick={() => navigate(`/contrats/${contrat.id}`)}
                    style={{ cursor: 'pointer' }}
                    className="contrat-row"
                  >
                    <td className="align-middle ps-3">{formatDate(contrat.dateGeneration)}</td>
                    <td className="align-middle fw-medium">{contrat.concert?.titre || 'N/A'}</td>
                    <td className="align-middle">
                      {contrat.concert?.lieuNom ? (
                        <div className="d-flex align-items-center">
                          <i className="bi bi-geo-alt text-muted me-2"></i>
                          {contrat.concert.lieuNom}
                        </div>
                      ) : 'N/A'}
                    </td>
                    <td className="align-middle">
                      {contrat.concert?.programmateurNom ? (
                        <div className="d-flex align-items-center">
                          <i className="bi bi-person text-muted me-2"></i>
                          {contrat.concert.programmateurNom}
                        </div>
                      ) : 'N/A'}
                    </td>
                    <td className="align-middle">{getStatusBadge(contrat.status)}</td>
                    <td className="align-middle pe-3">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/contrats/${contrat.id}`);
                        }}
                      >
                        <i className="bi bi-eye me-1"></i> Voir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      <Routes>
        <Route path="/generate/:id" element={<ContratGenerationPage />} />
        <Route path="/:id" element={<ContratDetailsPage />} />
      </Routes>
    </Container>
  );
};

export default ContratsPage;
