import React, { useState, useEffect, Suspense } from 'react';
import '@styles/index.css';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate
} from 'react-router-dom';
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
import ProgrammateursList from '@/components/programmateurs/ProgrammateursList';
import ConcertFormWrapper from '@/components/concerts/ConcertForm';
import ConcertsList from '@/components/concerts/ConcertsList';
import ConcertDetails from '@/components/concerts/ConcertDetails';
// Import du dashboard de debug unifié (uniquement en développement)
import UnifiedDebugDashboard from '@/components/debug/UnifiedDebugDashboard';

// Import de l'outil de diagnostic en mode développement uniquement
if (process.env.NODE_ENV === 'development') {
  import('./diagnostic').catch(err => console.error('Erreur lors du chargement du diagnostic:', err));
}

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

// Composant de protection des routes simplifié
function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);
  
  // 🎯 SIMPLIFICATION : Logique de redirection simplifiée
  useEffect(() => {
    if (!loading && !currentUser && !redirecting) {
      // Délai court pour éviter les redirections trop rapides
      const timer = setTimeout(() => {
        setRedirecting(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [currentUser, loading, redirecting]);
  
  if (loading) {
    return (
      <div className="loading-container d-flex justify-content-center align-items-center tc-min-h-300">
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

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ParametresProvider>
            <ModalProvider> {/* Ajout du ModalProvider */}
              {/* Intégration du stabilisateur de routeur */}
              <RouterStabilizer />
              <Suspense fallback={
                <div className="loading-container d-flex justify-content-center align-items-center tc-min-h-300">
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Chargement de la page...</span>
                    </div>
                    <p className="mt-2">Chargement de la page...</p>
                  </div>
                </div>
              }>
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
                        <Suspense fallback={
                          <div className="loading-container d-flex justify-content-center align-items-center tc-min-h-300">
                            <div className="text-center">
                              <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Chargement de la page...</span>
                              </div>
                              <p className="mt-2">Chargement de la page...</p>
                            </div>
                          </div>
                        }>
                          <ConcertsPage />
                        </Suspense>
                      </PrivateRoute>
                    }>
                      <Route index element={<ConcertsList />} />
                      <Route path=":id" element={<ConcertDetails />} />
                      <Route path=":id/edit" element={<ConcertFormWrapper />} />
                    </Route>
                    
                    {/* Routes pour les programmateurs */}
                    <Route path="/programmateurs/*" element={
                      <PrivateRoute>
                        <Suspense fallback={
                          <div className="loading-container d-flex justify-content-center align-items-center tc-min-h-300">
                            <div className="text-center">
                              <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Chargement de la page...</span>
                              </div>
                              <p className="mt-2">Chargement de la page...</p>
                            </div>
                          </div>
                        }>
                          <ProgrammateursPage />
                        </Suspense>
                      </PrivateRoute>
                    }>
                      <Route index element={<ProgrammateursList />} />
                      <Route path="nouveau" element={<ProgrammateurForm />} />
                      <Route path=":id/edit" element={<ProgrammateurForm />} />
                      <Route path=":id" element={<ProgrammateurDetails />} />
                    </Route>
                    
                    {/* Routes pour les lieux */}
                    <Route path="/lieux/*" element={
                      <PrivateRoute>
                        <Suspense fallback={
                          <div className="loading-container d-flex justify-content-center align-items-center tc-min-h-300">
                            <div className="text-center">
                              <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Chargement de la page...</span>
                              </div>
                              <p className="mt-2">Chargement de la page...</p>
                            </div>
                          </div>
                        }>
                          <LieuxPage />
                        </Suspense>
                      </PrivateRoute>
                    } />
                    
                    {/* Routes pour les structures */}
                    <Route path="/structures/*" element={
                      <PrivateRoute>
                        <Suspense fallback={
                          <div className="loading-container d-flex justify-content-center align-items-center tc-min-h-300">
                            <div className="text-center">
                              <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Chargement de la page...</span>
                              </div>
                              <p className="mt-2">Chargement de la page...</p>
                            </div>
                          </div>
                        }>
                          <StructuresPage />
                        </Suspense>
                      </PrivateRoute>
                    } />
                    
                    {/* Routes pour les contrats */}
                    <Route path="/contrats/*" element={
                      <PrivateRoute>
                        <Suspense fallback={
                          <div className="loading-container d-flex justify-content-center align-items-center tc-min-h-300">
                            <div className="text-center">
                              <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Chargement de la page...</span>
                              </div>
                              <p className="mt-2">Chargement de la page...</p>
                            </div>
                          </div>
                        }>
                          <Routes>
                            <Route index element={<ContratsPage />} />
                            <Route path="generate/:concertId" element={<ContratGenerationPage />} />
                            <Route path=":contratId" element={<ContratDetailsPage />} />
                          </Routes>
                        </Suspense>
                      </PrivateRoute>
                    } />
                    
                    {/* Routes pour les artistes */}
                    <Route path="/artistes/*" element={
                      <PrivateRoute>
                        <Suspense fallback={
                          <div className="loading-container d-flex justify-content-center align-items-center tc-min-h-300">
                            <div className="text-center">
                              <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Chargement de la page...</span>
                              </div>
                              <p className="mt-2">Chargement de la page...</p>
                            </div>
                          </div>
                        }>
                          <ArtistesPage />
                        </Suspense>
                      </PrivateRoute>
                    } />
                    
                    {/* Routes pour les paramètres */}
                    <Route path="/parametres/*" element={
                      <PrivateRoute>
                        <Suspense fallback={
                          <div className="loading-container d-flex justify-content-center align-items-center tc-min-h-300">
                            <div className="text-center">
                              <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Chargement de la page...</span>
                              </div>
                              <p className="mt-2">Chargement de la page...</p>
                            </div>
                          </div>
                        }>
                          <ParametresPage />
                        </Suspense>
                      </PrivateRoute>
                    } />
                    
                    {/* Route pour la validation des formulaires */}
                    <Route path="/formulaire/validation/:id" element={<PrivateRoute><FormResponsePage /></PrivateRoute>} />
                    
                    {/* Redirection par défaut */}
                    <Route path="*" element={<Navigate to="/" />} />
                  </Route>
                </Routes>
              </Suspense>
              {process.env.NODE_ENV === 'development' && <UnifiedDebugDashboard />}
            </ModalProvider>
          </ParametresProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
