import React, { useRef, useState, useEffect, Suspense } from 'react';
import '@styles/index.css';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate
} from 'react-router-dom';

// Import de l'outil de diagnostic en mode développement uniquement
if (process.env.NODE_ENV === 'development') {
  import('./diagnostic').catch(err => console.error('Erreur lors du chargement du diagnostic:', err));
}
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ParametresProvider } from '@/context/ParametresContext';
import { ModalProvider } from '@/context/ModalContext'; // Import du nouveau ModalProvider
import Layout from '@/components/common/Layout';
import DashboardPage from '@/pages/DashboardPage';
import ConcertsPage from '@/pages/ConcertsPage';
import TestButtons from '@/components/debug';
import ProgrammateursPage from '@/pages/ProgrammateursPage';
import ProgrammateurDetails from '@/components/programmateurs/ProgrammateurDetails';
import ProgrammateurForm from '@/components/programmateurs/ProgrammateurForm';
import LieuxPage from '@/pages/LieuxPage';
import ContratsPage from '@/pages/ContratsPage';
import ArtistesPage from '@/pages/ArtistesPage';
import ParametresPage from '@/pages/ParametresPage';
import FormResponsePage from '@/pages/FormResponsePage';
import ContratGenerationPage from '@/pages/ContratGenerationPage';
import ContratDetailsPage from '@/pages/ContratDetailsPage';
import StructuresPage from '@/pages/StructuresPage';
import RouterStabilizer from '@/utils/RouterStabilizer';
import DesktopLayout from '@/components/common/layout/DesktopLayout';
import ProgrammateursList from '@/components/programmateurs/ProgrammateursList';
import ConcertFormWrapper from '@/components/concerts/ConcertForm';
import ConcertsList from '@/components/concerts/ConcertsList';
import ConcertDetails from '@/components/concerts/ConcertDetails';
// Import du moniteur de performances (uniquement en développement)
import PerformanceMonitor from '@/components/debug/PerformanceMonitor';

// Imports CSS gérés dans index.js - ne pas dupliquer ici
// pour éviter les conflits de styles

// Composant ErrorBoundary pour capturer les erreurs de chargement
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
    // Nombre de tentatives de rechargement
    this.retryCount = 0;
  }

  static getDerivedStateFromError(error) {
    // Mettre à jour l'état pour afficher l'UI de repli
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Vous pouvez aussi enregistrer l'erreur dans un service de rapports d'erreurs
    console.error("Erreur capturée par ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
    
    // Si c'est une erreur de chargement de chunk, on peut essayer de recharger
    if (error.name === 'ChunkLoadError' && this.retryCount < 2) {
      this.retryCount++;
      console.log(`Tentative de rechargement (${this.retryCount}/2)...`);
      // Attendre un peu avant de recharger pour éviter les boucles
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }

  render() {
    if (this.state.hasError) {
      // Si le compteur de tentatives est < 2, afficher un message de rechargement
      if (this.retryCount < 2) {
        return (
          <div className="error-container">
            <h2>Chargement en cours...</h2>
            <p>Nous rencontrons quelques difficultés de connexion. Tentative de rechargement automatique.</p>
            <div className="loading-spinner"></div>
          </div>
        );
      }
      // Sinon afficher un message d'erreur permanent
      return (
        <div className="error-container">
          <h2>Une erreur est survenue</h2>
          <p>Nous n'avons pas pu charger certains composants de l'application.</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Réessayer
          </button>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>
              <summary>Détails de l'erreur (mode développement)</summary>
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Composant de protection des routes amélioré avec mémoire d'état
function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const lastAuthState = useRef(sessionStorage.getItem('wasAuthenticated') === 'true');
  const [redirecting, setRedirecting] = useState(false);
  const redirectAttempts = useRef(parseInt(sessionStorage.getItem('redirectAttempts') || '0', 10));
  
  // Utiliser un effet pour suivre l'état d'authentification
  useEffect(() => {
    if (currentUser) {
      // Si l'utilisateur est authentifié, mémoriser cet état
      sessionStorage.setItem('wasAuthenticated', 'true');
      // Réinitialiser le compteur de tentatives de redirection
      redirectAttempts.current = 0;
      sessionStorage.setItem('redirectAttempts', '0');
    }
  }, [currentUser]);
  
  // Empêcher les redirections en boucle
  useEffect(() => {
    if (!currentUser && !loading && !redirecting) {
      // Si trop de tentatives consécutives (5+), arrêter de rediriger
      if (redirectAttempts.current >= 5) {
        console.warn("Trop de tentatives de redirection consécutives. Arrêt du cycle de redirection.");
        return;
      }
      
      // Incrémenter et enregistrer le nombre de tentatives
      redirectAttempts.current += 1;
      sessionStorage.setItem('redirectAttempts', redirectAttempts.current.toString());
      
      // Pour éviter une boucle de redirection, vérifier si l'utilisateur était authentifié auparavant
      if (lastAuthState.current) {
        console.log("L'utilisateur était authentifié précédemment. Tentative de restauration de session...");
        // Attendre un peu avant de rediriger, pour permettre à la session de se restaurer
        const timer = setTimeout(() => {
          setRedirecting(true);
        }, 2000);
        
        return () => clearTimeout(timer);
      } else {
        setRedirecting(true);
      }
    }
  }, [currentUser, loading, redirecting]);
  
  if (loading) {
    return (
      <div className="loading-container d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Vérification de l'authentification...</span>
          </div>
          <p className="mt-2">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }
  
  if (redirecting) {
    return <Navigate to="/login" replace />;
  }
  
  return currentUser ? children : null;
}

function App() {
  // Définition des futures flags pour stabiliser React Router
  // Ces flags réduisent les rechargements intempestifs
  window.REACT_ROUTER_FUTURE = {
    v7_startTransition: true,  // Utilise React.startTransition pour les mises à jour d'état
    v7_relativeSplatPath: true // Améliore la résolution des chemins
  };

  // Le fallback unifié pour les chargements de routes
  const routeFallback = (
    <div className="loading-container d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement de la page...</span>
        </div>
        <p className="mt-2">Chargement de la page...</p>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ParametresProvider>
            <ModalProvider> {/* Ajout du ModalProvider */}
              {/* Intégration du stabilisateur de routeur */}
              <RouterStabilizer />
              <Routes>
                <Route path="/test-buttons" element={<TestButtons />} />
                {/* Routes publiques pour les formulaires */}
                <Route path="/formulaire/:concertId/:token" element={<FormResponsePage />} />
                
                {/* Routes protégées avec Layout */}
                <Route element={<Layout />}>
                  <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                  
                  {/* Routes pour les concerts */}
                  <Route path="/concerts/*" element={
                    <PrivateRoute>
                      <ConcertsPage />
                    </PrivateRoute>
                  }>
                    <Route index element={<ConcertsList />} />
                    <Route path=":id" element={<ConcertDetails />} />
                    <Route path=":id/edit" element={<ConcertFormWrapper />} />
                  </Route>
                  
                  {/* Routes pour les programmateurs */}
                  <Route path="/programmateurs/*" element={<PrivateRoute><ProgrammateursPage /></PrivateRoute>}>
                    <Route index element={<ProgrammateursList />} />
                    <Route path=":id" element={<ProgrammateurDetails />} />
                    <Route path=":id/edit" element={<ProgrammateurForm />} />
                  </Route>
                  
                  {/* Routes pour les lieux */}
                  <Route path="/lieux/*" element={
                    <PrivateRoute>
                      <LieuxPage />
                    </PrivateRoute>
                  } />
                  
                  {/* Routes pour les structures */}
                  <Route path="/structures/*" element={
                    <PrivateRoute>
                      <StructuresPage />
                    </PrivateRoute>
                  } />
                  
                  {/* Routes pour les contrats */}
                  <Route path="/contrats/*" element={
                    <PrivateRoute>
                      <Routes>
                        <Route index element={<ContratsPage />} />
                        <Route path="generate/:concertId" element={<ContratGenerationPage />} />
                        <Route path=":contratId" element={<ContratDetailsPage />} />
                      </Routes>
                    </PrivateRoute>
                  } />
                  
                  {/* Routes pour les artistes */}
                  <Route path="/artistes/*" element={
                    <PrivateRoute>
                      <ArtistesPage />
                    </PrivateRoute>
                  } />
                  
                  {/* Routes pour les paramètres */}
                  <Route path="/parametres/*" element={
                    <PrivateRoute>
                      <ParametresPage />
                    </PrivateRoute>
                  } />
                  
                  {/* Route pour la validation des formulaires */}
                  <Route path="/formulaire/validation/:id" element={<PrivateRoute><FormResponsePage /></PrivateRoute>} />
                  
                  {/* Redirection par défaut */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Route>
              </Routes>
              {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
            </ModalProvider>
          </ParametresProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
