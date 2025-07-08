// src/components/devis/DevisList.js
import React, { useState, useEffect } from 'react';
import { useEntreprise } from '@/context/EntrepriseContext';
import { useTabs } from '@/context/TabsContext';
import { collection, getDocs, query, where } from '@/services/firebase-service';
import { db } from '@services/firebase-service';
import { Container, Row, Col, Card } from 'react-bootstrap';
import FlexContainer from '@/components/ui/FlexContainer';
import Button from '@/components/ui/Button';
import DevisTable from './sections/DevisTable';
import { useResponsive } from '@/hooks/common';
import '@styles/index.css';

/**
 * Liste des devis
 */
function DevisList() {
  const { currentEntreprise } = useEntreprise();
  const { openNewDevisTab, openDevisTab } = useTabs();
  const { isMobile } = useResponsive();
  
  const [devis, setDevis] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les données Firebase
  useEffect(() => {
    const loadData = async () => {
      if (!currentEntreprise?.id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Requête simplifiée pour éviter l'index composite
        const devisQuery = query(
          collection(db, 'devis'),
          where('entrepriseId', '==', currentEntreprise.id)
        );
        
        const devisSnapshot = await getDocs(devisQuery);
        const devisData = devisSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Trier localement par date de création (descendant)
        devisData.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        
        setDevis(devisData);
      } catch (err) {
        console.error('Erreur lors du chargement des devis:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentEntreprise?.id]);

  // Fonction handleUpdateDevis retirée car non utilisée actuellement

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <FlexContainer justify="space-between" align="center">
            <h2 className="mb-0"><i className="bi bi-file-earmark-text me-2"></i>Devis</h2>
            <Button 
              variant="primary" 
              onClick={() => openNewDevisTab()}
            >
              <i className="bi bi-plus me-2"></i>
              Nouveau devis
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
      ) : devis.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-5 text-center">
            <i className="bi bi-file-earmark-text fs-1 mb-3 text-muted"></i>
            <p className="fs-5">Aucun devis n'a été créé.</p>
            <p className="text-muted">
              Créez votre premier devis pour commencer à proposer vos services.
            </p>
            <Button 
              variant="outline-primary" 
              className="mt-3"
              onClick={() => openNewDevisTab()}
            >
              <i className="bi bi-plus me-2"></i>
              Créer un devis
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          {isMobile ? (
            <div className="mobile-list">
              {devis.map(devisItem => (
                <Card key={devisItem.id} className="mb-3 border-0 shadow-sm">
                  <Card.Body 
                    className="p-3" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      const title = `${devisItem.ref || 'Devis'} - ${devisItem.structure || ''}`;
                      openDevisTab(devisItem.id, title.trim());
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="mb-1 fw-bold">
                          {devisItem.ref || `DEV-${devisItem.id?.substring(0, 6)}`}
                        </h6>
                        <small className="text-muted">
                          {devisItem.structure && `${devisItem.structure} • `}
                          {devisItem.createdAt ? 
                            (devisItem.createdAt.toDate ? devisItem.createdAt.toDate() : new Date(devisItem.createdAt)).toLocaleDateString('fr-FR') : 
                            '-'
                          }
                        </small>
                      </div>
                    </div>
                    
                    <div className="small text-muted mb-2">
                      <i className="bi bi-building me-1"></i>
                      {devisItem.projet || 'N/A'}
                    </div>
                    
                    <div className="small text-muted mb-3">
                      <i className="bi bi-cash me-1"></i>
                      {devisItem.montantTTC ? `${devisItem.montantTTC} ${devisItem.devise || 'EUR'}` : 'N/A'}
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            <DevisTable 
              devis={devis} 
              // onUpdateDevis prop retirée car handleUpdateDevis n'est pas défini
            />
          )}
        </>
      )}
    </Container>
  );
}

export default DevisList;