import React, { useEffect } from 'react';
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
import { ContactModalsProvider } from '@/context/ContactModalsContext';
import { TabsProvider } from '@/context/TabsContext';
import Layout from '@/components/common/Layout';
import DashboardPage from '@/pages/DashboardPage';
import DatesPage from '@/pages/DatesPage';
import ContactsPage from '@/pages/ContactsPage';
import LieuxPage from '@/pages/LieuxPage';
import ContratsPage from '@/pages/ContratsPage';
import ArtistesPage from '@/pages/ArtistesPage';
import PublicationsPage from '@/pages/PublicationsPage';
import DevisPage from '@/pages/DevisPage';
import ParametresPage from '@/pages/ParametresPage';
import FormResponsePage from '@/pages/FormResponsePage';
import PreContratFormResponsePage from '@/pages/PreContratFormResponsePage';
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
import TachesPage from '@/pages/TachesPage';
import CollaborationParametragePage from '@/pages/CollaborationParametragePage';
import AdminParametragePage from '@/pages/AdminParametragePage';
import FactureGeneratorPage from '@/pages/FactureGeneratorPage';
// import FactureDetailsPage from '@/pages/FactureDetailsPage'; // Remplacé par FactureGeneratorPage
import FacturesPage from '@/pages/FacturesPage';
import MesRecherchesPage from '@/pages/MesRecherchesPage';
import NouveauDossierPage from '@/pages/NouveauDossierPage';
import DossiersEnregistresPage from '@/pages/DossiersEnregistresPage';
import MesSelectionsPage from '@/pages/MesSelectionsPage';
import ContactTagsPage from '@/pages/ContactTagsPage';
import RouterStabilizer from '@/utils/RouterStabilizer';
// import DateFormWrapper from '@/components/dates/DateForm';
// import DatesList from '@/components/dates/DatesList';
// import DateDetails from '@/components/dates/DateDetails';
import CreateDefaultTemplate from './pages/CreateDefaultTemplate';
import PrivateRoute from '@/components/auth/PrivateRoute';
import LoginPage from '@/pages/LoginPage';
import MigrationPage from '@/pages/admin/MigrationPage';
import { OnboardingFlow } from '@/components/organization';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { installGlobalFixer } from '@/utils/fixOrganizationIds';
import { installArtistesFixers } from '@/utils/fixArtistesOrganizationIds';
import { initializeFirebaseInterceptor } from '@/utils/FirebaseInterceptor';
import DebugController from '@/components/debug/DebugController';
import DebugToolsPage from '@/pages/DebugToolsPage';
import DebugButton from '@/components/common/DebugButton';
// import DateLieuDebug from '@/components/debug/DateLieuDebug';
import ContratDownloadDirect from '@/components/api/ContratDownloadDirect';
import TabsTestPage from '@/pages/TabsTestPage';
import InventairePagesPage from '@/pages/InventairePagesPage';
import ComponentPreviewPage from '@/pages/ComponentPreviewPage';
import PreviewWrapper from '@/components/preview/PreviewWrapper';
import FestivalsDatesPage from '@/pages/FestivalsDatesPage';


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
            <OrganizationProvider>
              <ParametresProvider>
                <ModalProvider>
                  <ContactModalsProvider>
                  <RouterStabilizer />
                  {/* Bouton de debug temporaire */}
                  <DebugButton />
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
                    
                    <Route path="/formulaire/:dateId/:token" element={<FormResponsePage />} />
                    <Route path="/pre-contrat/:dateId/:token" element={<PreContratFormResponsePage />} />
                    
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
                    
                    <Route path="/preview/lieux" element={
                      <PrivateRoute>
                        <div style={{ padding: '1rem' }}>
                          <LieuxPage />
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
                    
                    <Route path="/preview/parametres" element={
                      <PrivateRoute>
                        <div style={{ padding: '1rem' }}>
                          <ParametresPage />
                        </div>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/preview/tableau-de-bord" element={
                      <PrivateRoute>
                        <div style={{ padding: '1rem' }}>
                          <TableauDeBordPage />
                        </div>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/preview/taches" element={
                      <PrivateRoute>
                        <div style={{ padding: '1rem' }}>
                          <TachesPage />
                        </div>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/preview/debug-tools" element={
                      <PrivateRoute>
                        <div style={{ padding: '1rem' }}>
                          <DebugToolsPage />
                        </div>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/preview/booking/parametrage" element={
                      <PrivateRoute>
                        <div style={{ padding: '1rem' }}>
                          <BookingParametragePage />
                        </div>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/preview/collaboration/parametrage" element={
                      <PrivateRoute>
                        <div style={{ padding: '1rem' }}>
                          <CollaborationParametragePage />
                        </div>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/preview/admin/parametrage" element={
                      <PrivateRoute>
                        <div style={{ padding: '1rem' }}>
                          <AdminParametragePage />
                        </div>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/preview/booking/nouvelle-date" element={
                      <PrivateRoute>
                        <div style={{ padding: '1rem' }}>
                          <DateCreationPage />
                        </div>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/preview/festivals/dates" element={
                      <PrivateRoute>
                        <div style={{ padding: '1rem' }}>
                          <FestivalsDatesPage />
                        </div>
                      </PrivateRoute>
                    } />
                    
                    {/* Route universelle pour preview de composants */}
                    <Route path="/preview/component/:componentName" element={
                      <PrivateRoute>
                        <PreviewWrapper />
                      </PrivateRoute>
                    } />
                    
                    {/* Routes principales avec système d'onglets */}
                    <Route element={
                      <TabsProvider>
                        <Layout />
                      </TabsProvider>
                    }>
                      <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                      
                      <Route path="/dates/*" element={
                        <PrivateRoute>
                          <DatesPage />
                        </PrivateRoute>
                      } />
                      
                      {/* Redirection temporaire de /concerts vers /dates */}
                      <Route path="/dates/*" element={<Navigate to="/dates" replace />} />
                      
                      <Route path="/contacts/*" element={
                        <PrivateRoute>
                          <ContactsPage />
                        </PrivateRoute>
                      }>
                        {/* Routes gérées en interne par ContactsPage */}
                      </Route>
                      
                      {/* Nouvelles routes pour les fonctionnalités contacts */}
                      <Route path="/contacts/recherches" element={
                        <PrivateRoute>
                          <MesRecherchesPage />
                        </PrivateRoute>
                      } />
                      
                      <Route path="/contacts/recherches/nouveau-dossier" element={
                        <PrivateRoute>
                          <NouveauDossierPage />
                        </PrivateRoute>
                      } />
                      
                      <Route path="/contacts/recherches/dossiers" element={
                        <PrivateRoute>
                          <DossiersEnregistresPage />
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
                      
                      <Route path="/lieux/*" element={
                        <PrivateRoute>
                          <LieuxPage />
                        </PrivateRoute>
                      } />
                      
                      <Route path="/structures/*" element={
                        <PrivateRoute>
                          <StructuresPage />
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
                          
                          <Route path="/parametres/*" element={
                            <PrivateRoute>
                              <ParametresPage />
                            </PrivateRoute>
                          } />
                          
                          <Route path="/debug-tools" element={
                            <PrivateRoute>
                              <DebugToolsPage />
                            </PrivateRoute>
                          } />
                          
                          <Route path="/tabs-test" element={
                            <PrivateRoute>
                              <TabsTestPage />
                            </PrivateRoute>
                          } />
                          
                          <Route path="/taches" element={
                            <PrivateRoute>
                              <TachesPage />
                            </PrivateRoute>
                          } />
                          
                          <Route path="/collaboration/parametrage/*" element={
                            <PrivateRoute>
                              <CollaborationParametragePage />
                            </PrivateRoute>
                          } />
                          
                          <Route path="/admin/parametrage/*" element={
                            <PrivateRoute>
                              <AdminParametragePage />
                            </PrivateRoute>
                          } />
                          
                          <Route path="/formulaire/validation/:id" element={<PrivateRoute><FormResponsePage /></PrivateRoute>} />
                          
                          
                      <Route path="/admin/migration" element={
                        <PrivateRoute adminOnly={true}>
                          <MigrationPage />
                        </PrivateRoute>
                      } />
                      
                          
                          <Route path="*" element={<Navigate to="/dates" replace />} />
                        </Route>
                  </Routes>
                  </ContactModalsProvider>
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