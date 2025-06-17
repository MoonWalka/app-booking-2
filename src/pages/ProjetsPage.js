import React, { useState } from 'react';
import { Container, Row, Col, Table, Button } from 'react-bootstrap';
import useGenericEntityList from '../hooks/generics/lists/useGenericEntityList';
import '@styles/index.css';

const ProjetsPage = () => {
  console.log('📂 ProjetsPage - Composant chargé');
  const [refreshKey] = useState(0);
  
  // Récupérer la liste des projets
  const { items: projets, loading, error } = useGenericEntityList('projets', {
    sort: { field: 'nom', direction: 'asc' },
    refreshKey
  });

  const handleCreateDate = (projetId) => {
    // TODO: Implémenter la création d'une date pour le projet
    console.log('Créer une date pour le projet:', projetId);
  };

  const handleEdit = (projetId) => {
    // TODO: Implémenter la modification du projet
    console.log('Modifier le projet:', projetId);
  };

  const handleDelete = (projetId) => {
    // TODO: Implémenter la suppression du projet
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      console.log('Supprimer le projet:', projetId);
    }
  };

  const handleCreateProjet = () => {
    // TODO: Implémenter la création d'un nouveau projet
    console.log('Créer un nouveau projet');
  };

  if (loading) {
    return (
      <Container fluid className="p-4">
        <div className="text-center p-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-2">Chargement des projets...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="p-4">
        <div className="alert alert-danger">
          <h4>Erreur</h4>
          <p>Impossible de charger les projets : {error.message}</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-folder me-2"></i>
          Projets
        </h2>
        <Button 
          variant="primary"
          onClick={handleCreateProjet}
        >
          <i className="bi bi-plus me-1"></i>
          Nouveau projet
        </Button>
      </div>
      
      <Row>
        <Col>
          {projets.length === 0 ? (
            <div className="text-center p-5">
              <i className="bi bi-folder" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
              <h4 className="mt-3">Aucun projet</h4>
              <p className="text-muted">Commencez par créer votre premier projet.</p>
              <Button 
                variant="primary"
                onClick={handleCreateProjet}
              >
                <i className="bi bi-plus me-1"></i>
                Créer un projet
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded shadow-sm">
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Projet</th>
                    <th>Artiste</th>
                    <th>Genre</th>
                    <th>Prix de vente</th>
                    <th style={{ width: '200px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projets.map((projet) => (
                    <tr key={projet.id}>
                      <td>
                        <div>
                          <strong>{projet.nom || 'Sans nom'}</strong>
                          {projet.description && (
                            <div className="text-muted small">{projet.description}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        {projet.artiste ? (
                          <span>{projet.artiste.prenom} {projet.artiste.nom}</span>
                        ) : (
                          <span className="text-muted">Non assigné</span>
                        )}
                      </td>
                      <td>
                        {projet.genre || <span className="text-muted">Non défini</span>}
                      </td>
                      <td>
                        {projet.prixVente ? (
                          <span className="fw-bold">{projet.prixVente}€</span>
                        ) : (
                          <span className="text-muted">Non défini</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleCreateDate(projet.id)}
                            title="Créer une date"
                          >
                            <i className="bi bi-calendar-plus"></i>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleEdit(projet.id)}
                            title="Modifier"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(projet.id)}
                            title="Supprimer"
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              {projets.length > 0 && (
                <div className="p-3 border-top bg-light">
                  <small className="text-muted">
                    {projets.length} projet{projets.length > 1 ? 's' : ''} trouvé{projets.length > 1 ? 's' : ''}
                  </small>
                </div>
              )}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProjetsPage; 