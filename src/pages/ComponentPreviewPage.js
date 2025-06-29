import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Container, Alert, Spinner } from 'react-bootstrap';

// Registre des composants disponibles
const componentRegistry = {
  // Pages de templates
  'factureTemplatesPage': () => import('./factureTemplatesPage'),
  'factureTemplatesEditPage': () => import('./factureTemplatesEditPage'),
  'contratTemplatesPage': () => import('./contratTemplatesPage'),
  'contratTemplatesEditPage': () => import('./contratTemplatesEditPage'),
  
  // Composants de paramètres
  'ParametresEntreprise': () => import('../components/parametres/ParametresEntreprise'),
  'ParametresFactures': () => import('../components/parametres/ParametresFactures'),
  'ParametresGeneraux': () => import('../components/parametres/ParametresGeneraux'),
  'ParametresCompte': () => import('../components/parametres/ParametresCompte'),
  'ParametresNotifications': () => import('../components/parametres/ParametresNotifications'),
  'ParametresEmail': () => import('../components/parametres/ParametresEmail'),
  'ParametresApparence': () => import('../components/parametres/ParametresApparence'),
  'ParametresExport': () => import('../components/parametres/ParametresExport'),
  
  // Composants de factures
  'FactureEditor': () => import('../components/factures/FactureEditor'),
  'FacturePreview': () => import('../components/factures/FacturePreview'),
  'ContactFacturesTable': () => import('../components/contacts/ContactFacturesTable'),
  
  // Pages principales
  'FactureGeneratorPage': () => import('./FactureGeneratorPage'),
  // 'FactureDetailsPage': () => import('./FactureDetailsPage'), // Remplacé par FactureGeneratorPage
  'FacturesPage': () => import('./FacturesPage'),
  
  // Ajouter d'autres composants ici au besoin
};

const ComponentPreviewPage = () => {
  const { componentName } = useParams();
  const [searchParams] = useSearchParams();
  const [Component, setComponent] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComponent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!componentName || !componentRegistry[componentName]) {
          throw new Error(`Composant "${componentName}" non trouvé dans le registre`);
        }

        const module = await componentRegistry[componentName]();
        setComponent(() => module.default || module);
      } catch (err) {
        console.error('Erreur lors du chargement du composant:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadComponent();
  }, [componentName]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <Spinner animation="border" role="status" className="mb-3" />
          <p>Chargement du composant...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <Alert.Heading>Erreur de chargement</Alert.Heading>
          <p>{error}</p>
          <hr />
          <p className="mb-0">
            Vérifiez que le composant est bien enregistré dans ComponentPreviewPage.js
          </p>
        </Alert>
      </Container>
    );
  }

  if (!Component) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          Aucun composant à afficher
        </Alert>
      </Container>
    );
  }

  // Extraire les props depuis les paramètres URL si nécessaire
  const props = {};
  searchParams.forEach((value, key) => {
    try {
      // Essayer de parser en JSON pour les objets/arrays
      props[key] = JSON.parse(value);
    } catch {
      // Sinon garder comme string
      props[key] = value;
    }
  });

  return (
    <div style={{ padding: '1rem' }}>
      <Suspense fallback={
        <div className="text-center p-4">
          <Spinner animation="border" />
          <p className="mt-2">Chargement...</p>
        </div>
      }>
        <Component {...props} />
      </Suspense>
    </div>
  );
};

export default ComponentPreviewPage;