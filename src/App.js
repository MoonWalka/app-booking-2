import React, { useEffect } from 'react';
import '@styles/index.css';
import './styles/tour.css';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route
} from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { EntrepriseProvider } from '@/context/EntrepriseContext';
import { ParametresProvider } from '@/context/ParametresContext';
import { ModalProvider } from '@/context/ModalContext';
import { ContactModalsProvider } from '@/context/ContactModalsContext';
import { TabsProvider } from '@/context/TabsContext';
import Layout from '@/components/common/Layout';
import DashboardPage from '@/pages/DashboardPage';
import DatesPage from '@/pages/DatesPage';
import ContactsPage from '@/pages/ContactsPage';
import ContratsPage from '@/pages/ContratsPage';
import ArtistesPage from '@/pages/ArtistesPage';
import PublicationsPage from '@/pages/PublicationsPage';
import DevisPage from '@/pages/DevisPage';
import ContratGenerationPage from '@/pages/ContratGenerationPage';
import ContratDetailsPage from '@/pages/ContratDetailsPage';
import ContratRedactionPage from '@/pages/ContratRedactionPage';
import PreContratGenerationPage from '@/pages/PreContratGenerationPage';
import StructuresPage from '@/pages/StructuresPage';
import BookingParametragePage from '@/pages/BookingParametragePage';
import ProjetsPage from '@/pages/ProjetsPage';
import SallesPage from '@/pages/SallesPage';
import TableauDeBordPage from '@/pages/TableauDeBordPage';
import DateCreationPage from '@/pages/DateCreationPage';
import FactureGeneratorPage from '@/pages/FactureGeneratorPage';
import FacturesPage from '@/pages/FacturesPage';
import MesRecherchesPage from '@/pages/MesRecherchesPage';
import MesSelectionsPage from '@/pages/MesSelectionsPage';
import ContactTagsPage from '@/pages/ContactTagsPage';
import ContratPdfViewerExample from '@/components/contrats/ContratPdfViewerExample';
import RouterStabilizer from '@/utils/RouterStabilizer';
import CreateDefaultTemplate from './pages/CreateDefaultTemplate';
import PrivateRoute from '@/components/auth/PrivateRoute';
import LoginPage from '@/pages/LoginPage';
import { OnboardingFlow } from '@/components/entreprise';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { installGlobalFixer } from '@/utils/fixOrganizationIds';
import ContratDownloadDirect from '@/components/api/ContratDownloadDirect';
import InventairePagesPage from '@/pages/InventairePagesPage';
import ComponentPreviewPage from '@/pages/ComponentPreviewPage';
import FestivalsDatesPage from '@/pages/FestivalsDatesPage';
import PreContratFormResponsePage from '@/pages/PreContratFormResponsePage';
import ModuleTourWrapper from '@/components/tour/ModuleTourWrapper';


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
      // Temporairement désactivé - problème de hot-reload
      // installArtistesFixers();
      // initializeFirebaseInterceptor();
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
            <EntrepriseProvider>
              <ParametresProvider>
                <ModalProvider>
                  <ContactModalsProvider>
                  <RouterStabilizer />
                  {/* Bouton de debug temporaire - SUPPRIMÉ */}
                  <Routes>
                      <Route path="/create-default-template" element={<CreateDefaultTemplate />} />
                    
                    <Route path="/login" element={<LoginPage />} />
                    
                    <Route path="/pre-contrat/:dateId/:token" element={<PreContratFormResponsePage />} />
                    
                    <Route path="/onboarding" element={
                      <PrivateRoute>
                        <div style={{ padding: '2rem' }}>
                          <OnboardingFlow onComplete={(entrepriseId) => {
                            console.log('✅ Entreprise créée/rejointe:', entrepriseId);
                            window.location.href = '/';
                          }} />
                        </div>
                      </PrivateRoute>
                    } />
                    
                    
                    {/* Route indépendante pour l'inventaire des pages (hors système d'onglets) */}
                    <Route path="/inventaire-pages" element={
                      <PrivateRoute>
                        <InventairePagesPage />
                      </PrivateRoute>
                    } />
                    
                    {/* Route universelle pour preview de composants */}
                    <Route path="/preview/component/:componentName" element={
                      <PrivateRoute>
                        <ComponentPreviewPage />
                      </PrivateRoute>
                    } />
                    
                    {/* Routes de preview pour l'inventaire (sans Layout ni système d'onglets) */}
                    <Route path="/preview/dashboard" element={
                      <PrivateRoute>
                        <div style={{ padding: '1rem' }}>
                          <DashboardPage />
                        </div>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/preview/contacts" element={
                      <PrivateRoute>
                        <div style={{ padding: '1rem' }}>
                          <ContactsPage />
                        </div>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/preview/dates" element={
                      <PrivateRoute>
                        <div style={{ padding: '1rem' }}>
                          <DatesPage />
                        </div>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/preview/contrats" element={
                      <PrivateRoute>
                        <div style={{ padding: '1rem' }}>
                          <ContratsPage />
                        </div>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/preview/factures" element={
                      <PrivateRoute>
                        <div style={{ padding: '1rem' }}>
                          <FacturesPage />
                        </div>
                      </PrivateRoute>
                    } />
                    
                    
                    <Route path="/preview/artistes" element={
                      <PrivateRoute>
                        <div style={{ padding: '1rem' }}>
                          <ArtistesPage />
                        </div>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/preview/structures" element={
                      <PrivateRoute>
                        <div style={{ padding: '1rem' }}>
                          <StructuresPage />
                        </div>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/preview/projets" element={
                      <PrivateRoute>
                        <div style={{ padding: '1rem' }}>
                          <ProjetsPage />
                        </div>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/preview/salles" element={
                      <PrivateRoute>
                        <div style={{ padding: '1rem' }}>
                          <SallesPage />
                        </div>
                      </PrivateRoute>
                    } />
                    
                      
                      {/* Nouvelles routes pour les fonctionnalités contacts */}
                      <Route path="/contacts/recherches" element={
                        <PrivateRoute>
                          <MesRecherchesPage />
                        </PrivateRoute>
                      } />
                      
                      <Route path="/contacts/selections" element={
                        <PrivateRoute>
                          <MesSelectionsPage />
                        </PrivateRoute>
                      } />
                      
                      <Route path="/contacts/tags" element={
                        <PrivateRoute>
                          <ContactTagsPage />
                        </PrivateRoute>
                      } />
                      
                      
                      <Route path="/structures/*" element={
                        <PrivateRoute>
                          <StructuresPage />
                            </PrivateRoute>
                          } />
                          
                          <Route path="/outils/pdf-viewer-demo" element={
                            <PrivateRoute>
                              <ContratPdfViewerExample />
                            </PrivateRoute>
                          } />
                          
                          <Route path="/booking/parametrage/*" element={
                            <PrivateRoute>
                              <BookingParametragePage />
                            </PrivateRoute>
                          } />
                          
                          <Route path="/booking/nouvelle-date" element={
                            <PrivateRoute>
                              <DateCreationPage />
                            </PrivateRoute>
                          } />
                          
                          <Route path="/festivals/dates" element={
                            <PrivateRoute>
                              <FestivalsDatesPage />
                            </PrivateRoute>
                          } />
                          
                          <Route path="/projets/*" element={
                            <PrivateRoute>
                              <ProjetsPage />
                            </PrivateRoute>
                          } />
                          
                          <Route path="/salles/*" element={
                            <PrivateRoute>
                              <SallesPage />
                            </PrivateRoute>
                          } />
                          
                          <Route path="/tableau-de-bord" element={
                            <PrivateRoute>
                              <TableauDeBordPage />
                            </PrivateRoute>
                          } />
                          
                          <Route path="/contrats" element={
                            <PrivateRoute>
                              <ContratsPage />
                            </PrivateRoute>
                          } />
                          <Route path="/contrats/generate/:dateId" element={
                            <PrivateRoute>
                              <ContratGenerationPage />
                            </PrivateRoute>
                          } />
                          <Route path="/precontrats/generate/:dateId" element={
                            <PrivateRoute>
                              <PreContratGenerationPage />
                            </PrivateRoute>
                          } />
                          <Route path="/contrats/:id/redaction" element={
                            <PrivateRoute>
                              <ContratRedactionPage />
                            </PrivateRoute>
                          } />
                          <Route path="/contrats/:contratId" element={
                            <PrivateRoute>
                              <ContratDetailsPage />
                            </PrivateRoute>
                          } />
                          {/* Route API pour téléchargement direct de contrat */}
                          <Route path="/api/contrats/:contratId/download" element={
                            <PrivateRoute>
                              <ContratDownloadDirect />
                            </PrivateRoute>
                          } />
                          
                          {/* Route legacy pour téléchargement via page contrat */}
                          <Route path="/contrats/:contratId/download" element={
                            <PrivateRoute>
                              <ContratDetailsPage autoDownload={true} />
                            </PrivateRoute>
                          } />
                          
                          <Route path="/artistes/*" element={
                            <PrivateRoute>
                              <ArtistesPage />
                            </PrivateRoute>
                          } />
                          
                          <Route path="/publications/*" element={
                            <PrivateRoute>
                              <PublicationsPage />
                            </PrivateRoute>
                          } />
                          
                          <Route path="/devis/*" element={
                            <PrivateRoute>
                              <DevisPage />
                            </PrivateRoute>
                          } />
                          
                          <Route path="/factures" element={
                            <PrivateRoute>
                              <FacturesPage />
                            </PrivateRoute>
                          } />
                          
                          <Route path="/factures/generate/:dateId" element={
                            <PrivateRoute>
                              <FactureGeneratorPage />
                            </PrivateRoute>
                          } />
                          
                          <Route path="/factures/:factureId" element={
                            <PrivateRoute>
                              <FactureGeneratorPage />
                            </PrivateRoute>
                          } />
                          
                          {/* Routes principales avec Layout et système d'onglets */}
                          <Route path="/*" element={
                            <PrivateRoute>
                              <TabsProvider>
                                <ModuleTourWrapper>
                                  <Layout />
                                </ModuleTourWrapper>
                              </TabsProvider>
                            </PrivateRoute>
                          } />
                          
                  </Routes>
                  </ContactModalsProvider>
                </ModalProvider>
              </ParametresProvider>
                
                {/* 🔍 Panneau de debug flottant - SUPPRIMÉ */}
              </EntrepriseProvider>
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