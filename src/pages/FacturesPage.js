// src/pages/FacturesPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { Container, Row, Col, Card } from 'react-bootstrap';
import FlexContainer from '@/components/ui/FlexContainer';
import Button from '@/components/ui/Button';
import ContratsTable from '@/components/contrats/sections/ContratsTable';
import { useResponsive } from '@/hooks/common';
import '@styles/index.css';

const FacturesPage = () => {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isMobile } = useResponsive();

  useEffect(() => {
    const fetchFactures = async () => {
      setLoading(true);
      try {
        // Récupérer les factures depuis la collection
        const facturesQuery = query(
          collection(db, 'factures'), 
          orderBy('dateFacture', 'desc')
        );
        const facturesSnapshot = await getDocs(facturesQuery);
        
        const facturesData = facturesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setFactures(facturesData);
      } catch (error) {
        console.error('Erreur lors de la récupération des factures:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFactures();
  }, []);

  const handleUpdateFacture = (factureUpdated) => {
    // Callback pour mettre à jour une facture localement
    setFactures(prev => 
      prev.map(facture => 
        facture.id === factureUpdated.id ? factureUpdated : facture
      )
    );
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
              Les factures apparaîtront ici une fois créées depuis les concerts ou manuellement.
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
                          {facture.ref || 'N/A'}
                        </h6>
                        <small className="text-muted">
                          {facture.destinataire && `${facture.destinataire} • `}
                          {facture.dateFacture ? 
                            new Date(facture.dateFacture).toLocaleDateString('fr-FR') : 
                            '-'
                          }
                        </small>
                      </div>
                    </div>
                    
                    <div className="small text-muted mb-2">
                      <i className="bi bi-cash me-1"></i>
                      {facture.montantTTC ? `${facture.montantTTC} ${facture.devise || 'EUR'}` : 'N/A'}
                    </div>
                    
                    <div className="small text-muted mb-3">
                      <i className="bi bi-building me-1"></i>
                      {facture.emetteur || 'N/A'}
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            <ContratsTable 
              factures={factures} 
              onUpdateFacture={handleUpdateFacture}
            />
          )}
        </>
      )}
    </Container>
  );
};

export default FacturesPage;