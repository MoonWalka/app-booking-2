import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Alert, Spinner } from 'react-bootstrap';
import { componentRegistry, getComponentConfig } from './componentRegistry';
import './PreviewWrapper.css';

const PreviewWrapper = () => {
  const { componentName } = useParams();
  const [Component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mockData, setMockData] = useState(null);

  useEffect(() => {
    loadComponent();
  }, [componentName]);

  const loadComponent = async () => {
    setLoading(true);
    setError(null);
    setComponent(null);

    try {
      if (!componentName) {
        throw new Error('Aucun nom de composant fourni');
      }

      const componentConfig = getComponentConfig(componentName);
      
      if (!componentConfig) {
        throw new Error(`Composant "${componentName}" non trouvé dans le registre`);
      }

      // Import dynamique du composant
      const module = await componentConfig.path();
      const LoadedComponent = module.default || module[componentName];
      
      if (!LoadedComponent) {
        throw new Error(`Impossible de charger le composant "${componentName}"`);
      }

      // Créer un wrapper pour gérer les props si nécessaire
      const ComponentWrapper = (props) => {
        // Utiliser les props par défaut du registre
        const defaultProps = componentConfig.defaultProps || {};
        return <LoadedComponent {...defaultProps} {...props} />;
      };

      setComponent(() => ComponentWrapper);
      
      // Charger les données mock si nécessaire
      const mockDataForComponent = getMockDataForComponent(componentName);
      if (mockDataForComponent) {
        setMockData(mockDataForComponent);
      }
      
    } catch (err) {
      console.error('Erreur lors du chargement du composant:', err);
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };


  // Fonction pour obtenir des données mock selon le composant
  const getMockDataForComponent = (name) => {
    // Ici on pourrait retourner des données mock spécifiques
    // Pour l'instant on retourne null
    return null;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center p-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p className="mt-3">Chargement du composant {componentName}...</p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="danger">
          <Alert.Heading>Erreur de chargement</Alert.Heading>
          <p>{error}</p>
          <hr />
          <p className="mb-0">
            Vérifiez que le composant est bien ajouté dans le mapping des composants.
          </p>
        </Alert>
      );
    }

    if (!Component) {
      return (
        <Alert variant="warning">
          <Alert.Heading>Composant non trouvé</Alert.Heading>
          <p>Le composant "{componentName}" n'a pas pu être chargé.</p>
        </Alert>
      );
    }

    return (
      <Suspense fallback={
        <div className="text-center p-5">
          <Spinner animation="border" size="sm" />
          <p className="mt-2">Rendu du composant...</p>
        </div>
      }>
        <div className="component-preview-content">
          {mockData ? (
            <Component {...mockData} />
          ) : (
            <Component />
          )}
        </div>
      </Suspense>
    );
  };

  return (
    <div className="preview-wrapper">
      <div className="preview-header">
        <Container>
          <div className="d-flex justify-content-between align-items-center py-3">
            <div>
              <h4 className="mb-0">Aperçu du composant</h4>
              <p className="text-muted mb-0">{componentName}</p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => window.location.reload()}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Recharger
              </button>
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={() => window.history.back()}
              >
                <i className="bi bi-arrow-left me-1"></i>
                Retour
              </button>
            </div>
          </div>
        </Container>
      </div>
      
      <Container fluid className="preview-body">
        {renderContent()}
      </Container>
      
      {/* Panneau d'informations */}
      <div className="preview-info-panel">
        <Container>
          <div className="py-3">
            <h6>Informations du composant</h6>
            <small className="text-muted">
              <strong>Nom:</strong> {componentName}<br/>
              <strong>Chemin:</strong> {componentRegistry[componentName] ? 'Disponible dans le registre' : 'Non mappé'}<br/>
              <strong>Props par défaut:</strong> {JSON.stringify(componentRegistry[componentName]?.defaultProps || {}, null, 2)}
            </small>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default PreviewWrapper;