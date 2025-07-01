// src/pages/FacturesPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { Container, Row, Col, Card } from 'react-bootstrap';
import FlexContainer from '@/components/ui/FlexContainer';
import Button from '@/components/ui/Button';
import FacturesTableView from '@/components/factures/FacturesTableView';
import factureService from '@/services/factureService';
// useResponsive retiré car isMobile non utilisé
import { useOrganization } from '@/context/OrganizationContext';
import '@styles/index.css';

const FacturesPage = () => {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  // isMobile retiré car non utilisé
  const { currentOrganization } = useOrganization();

  useEffect(() => {
    const fetchFactures = async () => {
      if (!currentOrganization?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Récupérer les factures depuis la collection de l'organisation
        const facturesQuery = query(
          collection(db, 'organizations', currentOrganization.id, 'factures'), 
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
        setError('Erreur lors du chargement des factures');
      } finally {
        setLoading(false);
      }
    };

    fetchFactures();
  }, [currentOrganization?.id]);

  // Fonction retirée car non utilisée

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
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <FacturesTableView
              factures={factures}
              loading={loading}
              error={error}
              onDelete={async (facture) => {
                if (window.confirm(`Êtes-vous sûr de vouloir supprimer la facture ${facture.reference || facture.numeroFacture} ?`)) {
                  try {
                    await factureService.deleteFacture(facture.id, currentOrganization.id);
                    // Mettre à jour l'état local immédiatement
                    setFactures(prev => prev.filter(f => f.id !== facture.id));
                  } catch (error) {
                    console.error('Erreur lors de la suppression:', error);
                    alert('Erreur lors de la suppression de la facture');
                  }
                }
              }}
              showSearch={true}
              showFilters={true}
            />
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default FacturesPage;