// src/pages/ContratsPage.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, where } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { Container, Row, Col, Card } from 'react-bootstrap';
import FlexContainer from '@/components/ui/FlexContainer';
import Button from '@/components/ui/Button';
import ContratsTable from '@/components/contrats/sections/ContratsTable';
import ContratGenerationPage from '@pages/ContratGenerationPage.js';
import ContratDetailsPage from '@pages/ContratDetailsPage.js';
// Imports directs au lieu de lazy - SUPPRIMÉS: imports non utilisés
import '@styles/index.css';

// Charger les composants de manière dynamique pour éviter les dépendances circulaires
// LAZY LOADING DÉSACTIVÉ:
// const ContratTemplatesPage = React.lazy(() => import('@pages/contratTemplatesPage.js'));
// const ContratTemplatesEditPage = React.lazy(() => import('@pages/contratTemplatesEditPage.js'));

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
        <ContratsTable contrats={contrats} />
      )}

      <Routes>
        <Route path="/generate/:id" element={<ContratGenerationPage />} />
        <Route path="/:id" element={<ContratDetailsPage />} />
      </Routes>
    </Container>
  );
};

export default ContratsPage;
