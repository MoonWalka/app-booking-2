import React, { Suspense, useEffect } from 'react';
import '@styles/index.css';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate
} from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { OrganizationProvider } from '@/context/OrganizationContext';
import { ParametresProvider } from '@/context/ParametresContext';
import { ModalProvider } from '@/context/ModalContext';
import FlexContainer from '@/components/ui/FlexContainer';
import Layout from '@/components/common/Layout';
import DashboardPage from '@/pages/DashboardPage';
import ConcertsPage from '@/pages/ConcertsPage';
import ContactsPage from '@/pages/ContactsPage';
import ContactDetails from '@/components/contacts/ContactDetails';
import ContactForm from '@/components/contacts/ContactForm';
import LieuxPage from '@/pages/LieuxPage';
import ContratsPage from '@/pages/ContratsPage';
import ArtistesPage from '@/pages/ArtistesPage';
import ParametresPage from '@/pages/ParametresPage';
import FormResponsePage from '@/pages/FormResponsePage';
import ContratGenerationPage from '@/pages/ContratGenerationPage';
import ContratDetailsPage from '@/pages/ContratDetailsPage';
import StructuresPage from '@/pages/StructuresPage';
import FactureGenerationPage from '@/pages/FactureGenerationPage';
import FactureDetailsPage from '@/pages/FactureDetailsPage';
import FacturesPage from '@/pages/FacturesPage';
import RouterStabilizer from '@/utils/RouterStabilizer';
import ContactsList from '@/components/contacts/ContactsList';
import ConcertFormWrapper from '@/components/concerts/ConcertForm';
import ConcertsList from '@/components/concerts/ConcertsList';
import ConcertDetails from '@/components/concerts/ConcertDetails';
import CreateDefaultTemplate from './pages/CreateDefaultTemplate';
import PrivateRoute from '@/components/auth/PrivateRoute';
import LoginPage from '@/pages/LoginPage';
import MigrationPage from '@/pages/admin/MigrationPage';
import { OnboardingFlow } from '@/components/organization';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { installGlobalFixer } from '@/utils/fixOrganizationIds';
import { initializeFirebaseInterceptor } from '@/utils/FirebaseInterceptor';
import DebugController from '@/components/debug/DebugController';
import DebugToolsPage from '@/pages/DebugToolsPage';
import DebugButton from '@/components/common/DebugButton';


if (process.env.NODE_ENV === 'development') {
}

if (process.env.REACT_APP_MODE === 'local') {
  import('./utils/seedEmulator').then(({ seedEmulator }) => {
    setTimeout(() => {
      seedEmulator().catch(err => console.error('Erreur lors du peuplement de l\'émulateur:', err));
    }, 2000);
  }).catch(err => console.error('Erreur lors du chargement du script de peuplement:', err));
}

if (process.env.NODE_ENV === 'development') {
  import('./utils/fixNumeroIntracommunautaire').catch(err => 
    console.error('Erreur lors du chargement de l\'utilitaire de correction:', err)
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
    this.retryCount = 0;
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Erreur capturée par ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
    
    if (error.name === 'ChunkLoadError' && this.retryCount < 2) {
      this.retryCount++;
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.retryCount < 2) {
        return (
          <div className="error-container">
            <h2>Chargement en cours...</h2>
            <p>Nous rencontrons quelques difficultés de connexion. Tentative de rechargement automatique.</p>
            <div className="loading-spinner"></div>
          </div>
        );
      }
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

function App() {
  // ✅ AJOUT: Installer les outils de debug en développement
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      installGlobalFixer();
      initializeFirebaseInterceptor();
    }
  }, []);

  window.REACT_ROUTER_FUTURE = {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  };

  return (
    <>
      <ErrorBoundary>
        <Router>
          <AuthProvider>
            <OrganizationProvider>
              <ParametresProvider>
                <ModalProvider>
                  <RouterStabilizer />
                  {/* Bouton de debug temporaire */}
                  <DebugButton />
                  <Suspense fallback={
                  <FlexContainer justify="center" align="center" className="loading-container tc-min-h-300">
                    <div className="text-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement de la page...</span>
                      </div>
                      <p className="mt-2">Chargement de la page...</p>
                    </div>
                  </FlexContainer>
                }>
                  <>
                    <Routes>
                      <Route path="/create-default-template" element={<CreateDefaultTemplate />} />
                    
                    <Route path="/login" element={<LoginPage />} />
                    
                    <Route path="/onboarding" element={
                      <PrivateRoute>
                        <div style={{ padding: '2rem' }}>
                          <OnboardingFlow onComplete={(orgId) => {
                            console.log('✅ Organisation créée/rejointe:', orgId);
                            window.location.href = '/';
                          }} />
                        </div>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/formulaire/:concertId/:token" element={<FormResponsePage />} />
                    
                    <Route element={<Layout />}>
                      <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                      
                      <Route path="/concerts/*" element={
                        <PrivateRoute>
                          <Suspense fallback={
                            <FlexContainer justify="center" align="center" className="loading-container tc-min-h-300">
                              <div className="text-center">
                                <div className="spinner-border text-primary" role="status">
                                  <span className="visually-hidden">Chargement de la page...</span>
                                </div>
                                <p className="mt-2">Chargement de la page...</p>
                              </div>
                            </FlexContainer>
                          }>
                            <ConcertsPage />
                          </Suspense>
                        </PrivateRoute>
                      }>
                        <Route index element={<ConcertsList />} />
                        <Route path=":id" element={<ConcertDetails />} />
                        <Route path=":id/edit" element={<ConcertFormWrapper />} />
                      </Route>
                      
                      <Route path="/contacts/*" element={
                        <PrivateRoute>
                          <Suspense fallback={
                            <FlexContainer justify="center" align="center" className="loading-container tc-min-h-300">
                              <div className="text-center">
                                <div className="spinner-border text-primary" role="status">
                                  <span className="visually-hidden">Chargement de la page...</span>
                                </div>
                                <p className="mt-2">Chargement de la page...</p>
                              </div>
                            </FlexContainer>
                          }>
                            <ContactsPage />
                          </Suspense>
                        </PrivateRoute>
                      }>
                        <Route index element={<ContactsList />} />
                        <Route path="nouveau" element={<ContactForm />} />
                        <Route path=":id/edit" element={<ContactForm />} />
                        <Route path=":id" element={<ContactDetails />} />
                      </Route>
                      
                      <Route path="/lieux/*" element={
                        <PrivateRoute>
                          <Suspense fallback={
                            <FlexContainer justify="center" align="center" className="loading-container tc-min-h-300">
                              <div className="text-center">
                                <div className="spinner-border text-primary" role="status">
                                  <span className="visually-hidden">Chargement de la page...</span>
                                </div>
                                <p className="mt-2">Chargement de la page...</p>
                              </div>
                            </FlexContainer>
                          }>
                            <LieuxPage />
                          </Suspense>
                        </PrivateRoute>
                      } />
                      
                      <Route path="/structures/*" element={
                        <PrivateRoute>
                          <Suspense fallback={
                            <FlexContainer justify="center" align="center" className="loading-container tc-min-h-300">
                              <div className="text-center">
                                <div className="spinner-border text-primary" role="status">
                                  <span className="visually-hidden">Chargement de la page...</span>
                                </div>
                                <p className="mt-2">Chargement de la page...</p>
                              </div>
                            </FlexContainer>
                          }>
                                <StructuresPage />
                              </Suspense>
                            </PrivateRoute>
                          } />
                          
                          <Route path="/contrats" element={
                            <PrivateRoute>
                              <Suspense fallback={
                                <FlexContainer justify="center" align="center" className="loading-container tc-min-h-300">
                                  <div className="text-center">
                                    <div className="spinner-border text-primary" role="status">
                                      <span className="visually-hidden">Chargement de la page...</span>
                                    </div>
                                    <p className="mt-2">Chargement de la page...</p>
                                  </div>
                                </FlexContainer>
                              }>
                                <ContratsPage />
                              </Suspense>
                            </PrivateRoute>
                          } />
                          <Route path="/contrats/generate/:concertId" element={
                            <PrivateRoute>
                              <Suspense fallback={
                                <FlexContainer justify="center" align="center" className="loading-container tc-min-h-300">
                                  <div className="text-center">
                                    <div className="spinner-border text-primary" role="status">
                                      <span className="visually-hidden">Chargement de la page...</span>
                                    </div>
                                    <p className="mt-2">Chargement de la page...</p>
                                  </div>
                                </FlexContainer>
                              }>
                                <ContratGenerationPage />
                              </Suspense>
                            </PrivateRoute>
                          } />
                          <Route path="/contrats/:contratId" element={
                            <PrivateRoute>
                              <Suspense fallback={
                                <FlexContainer justify="center" align="center" className="loading-container tc-min-h-300">
                                  <div className="text-center">
                                    <div className="spinner-border text-primary" role="status">
                                      <span className="visually-hidden">Chargement de la page...</span>
                                    </div>
                                    <p className="mt-2">Chargement de la page...</p>
                                  </div>
                                </FlexContainer>
                              }>
                                <ContratDetailsPage />
                              </Suspense>
                            </PrivateRoute>
                          } />
                          
                          <Route path="/artistes/*" element={
                            <PrivateRoute>
                              <Suspense fallback={
                                <FlexContainer justify="center" align="center" className="loading-container tc-min-h-300">
                                  <div className="text-center">
                                    <div className="spinner-border text-primary" role="status">
                                      <span className="visually-hidden">Chargement de la page...</span>
                                    </div>
                                    <p className="mt-2">Chargement de la page...</p>
                                  </div>
                                </FlexContainer>
                              }>
                                <ArtistesPage />
                              </Suspense>
                            </PrivateRoute>
                          } />
                          
                          <Route path="/factures" element={
                            <PrivateRoute>
                              <Suspense fallback={
                                <FlexContainer justify="center" align="center" className="loading-container tc-min-h-300">
                                  <div className="text-center">
                                    <div className="spinner-border text-primary" role="status">
                                      <span className="visually-hidden">Chargement de la page...</span>
                                    </div>
                                    <p className="mt-2">Chargement de la page...</p>
                                  </div>
                                </FlexContainer>
                              }>
                                <FacturesPage />
                              </Suspense>
                            </PrivateRoute>
                          } />
                          
                          <Route path="/factures/generate/:concertId" element={
                            <PrivateRoute>
                              <Suspense fallback={
                                <FlexContainer justify="center" align="center" className="loading-container tc-min-h-300">
                                  <div className="text-center">
                                    <div className="spinner-border text-primary" role="status">
                                      <span className="visually-hidden">Chargement de la page...</span>
                                    </div>
                                    <p className="mt-2">Chargement de la page...</p>
                                  </div>
                                </FlexContainer>
                              }>
                                <FactureGenerationPage />
                              </Suspense>
                            </PrivateRoute>
                          } />
                          
                          <Route path="/factures/:factureId" element={
                            <PrivateRoute>
                              <Suspense fallback={
                                <FlexContainer justify="center" align="center" className="loading-container tc-min-h-300">
                                  <div className="text-center">
                                    <div className="spinner-border text-primary" role="status">
                                      <span className="visually-hidden">Chargement de la page...</span>
                                    </div>
                                    <p className="mt-2">Chargement de la page...</p>
                                  </div>
                                </FlexContainer>
                              }>
                                <FactureDetailsPage />
                              </Suspense>
                            </PrivateRoute>
                          } />
                          
                          <Route path="/parametres/*" element={
                            <PrivateRoute>
                              <Suspense fallback={
                                <FlexContainer justify="center" align="center" className="loading-container tc-min-h-300">
                                  <div className="text-center">
                                    <div className="spinner-border text-primary" role="status">
                                      <span className="visually-hidden">Chargement de la page...</span>
                                    </div>
                                    <p className="mt-2">Chargement de la page...</p>
                                  </div>
                                </FlexContainer>
                              }>
                                <ParametresPage />
                              </Suspense>
                            </PrivateRoute>
                          } />
                          
                          <Route path="/debug-tools" element={
                            <PrivateRoute>
                              <Suspense fallback={
                                <FlexContainer justify="center" align="center" className="loading-container tc-min-h-300">
                                  <div className="text-center">
                                    <div className="spinner-border text-primary" role="status">
                                      <span className="visually-hidden">Chargement de la page...</span>
                                    </div>
                                    <p className="mt-2">Chargement de la page...</p>
                                  </div>
                                </FlexContainer>
                              }>
                                <DebugToolsPage />
                              </Suspense>
                            </PrivateRoute>
                          } />
                          
                          <Route path="/formulaire/validation/:id" element={<PrivateRoute><FormResponsePage /></PrivateRoute>} />
                          
                          
                      <Route path="/admin/migration" element={
                        <PrivateRoute adminOnly={true}>
                          <Suspense fallback={
                            <FlexContainer justify="center" align="center" className="loading-container tc-min-h-300">
                              <div className="text-center">
                                <div className="spinner-border text-primary" role="status">
                                  <span className="visually-hidden">Chargement de la page...</span>
                                </div>
                                <p className="mt-2">Chargement de la page...</p>
                              </div>
                            </FlexContainer>
                          }>
                            <MigrationPage />
                          </Suspense>
                        </PrivateRoute>
                      } />
                      
                          
                          <Route path="*" element={<Navigate to="/concerts" replace />} />
                        </Route>
                      </Routes>
                    </>
                  </Suspense>
                  </ModalProvider>
                </ParametresProvider>
                
                {/* 🔍 Panneau de debug flottant - UNIQUEMENT EN DÉVELOPPEMENT */}
                {process.env.NODE_ENV === 'development' && <DebugController />}
              </OrganizationProvider>
            </AuthProvider>
          </Router>
          
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </ErrorBoundary>
      </>
    );
    }

    export default App; 