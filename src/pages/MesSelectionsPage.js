import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useTabs } from '@/context/TabsContext';

/**
 * Page Mes sélections - Page d'explication et d'accès aux sélections
 */
const MesSelectionsPage = () => {
  const { openTab } = useTabs();

  const handleNewSelection = () => {
    // Ouvrir l'onglet de recherche
    openTab({
      id: 'contacts-recherches',
      title: 'Mes recherches',
      path: '/contacts/recherches',
      component: 'MesRecherchesPage',
      icon: 'bi-search'
    });
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-0">
            <i className="bi bi-check2-square me-2"></i>
            Mes sélections
          </h2>
          <p className="text-muted">Gérez vos sélections de contacts sauvegardées</p>
        </Col>
      </Row>

      <Row>
        <Col md={8} className="mx-auto">
          <div className="card">
            <div className="card-body text-center py-5">
              <i className="bi bi-check2-square fs-1 text-primary mb-3 d-block"></i>
              <h4>Comment créer une sélection ?</h4>
              <p className="text-muted mb-4">
                Les sélections vous permettent de sauvegarder des groupes spécifiques de contacts pour y accéder rapidement.
              </p>
              
              <div className="text-start mx-auto" style={{ maxWidth: '600px' }}>
                <ol className="mb-4">
                  <li className="mb-2">Effectuez une recherche pour trouver vos contacts</li>
                  <li className="mb-2">Sélectionnez les contacts qui vous intéressent en cochant les cases</li>
                  <li className="mb-2">Cliquez sur "Sauvegarder la sélection" en haut de la liste</li>
                  <li className="mb-2">Donnez un nom à votre sélection</li>
                  <li className="mb-2">Retrouvez vos sélections dans le menu latéral</li>
                </ol>
              </div>

              <Button 
                variant="primary" 
                size="lg"
                onClick={handleNewSelection}
              >
                <i className="bi bi-search me-2"></i>
                Commencer une recherche
              </Button>

              <hr className="my-5" />

              <div className="alert alert-info text-start">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Astuce :</strong> Vos sélections sauvegardées apparaissent automatiquement dans le menu latéral sous "Mes sélections", 
                vous permettant d'y accéder rapidement à tout moment.
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default MesSelectionsPage;