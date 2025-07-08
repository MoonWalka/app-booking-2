import React, { useEffect, useState } from 'react';
import { useEntreprise } from '@/context/EntrepriseContext';
import { useAuth } from '@/context/AuthContext';
import { useEntitySearch } from '@/hooks/common/useEntitySearch';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

/**
 * Composant de diagnostic complet pour le contexte Organisation
 */
const EntrepriseContextDiagnostic = () => {
  const organizationContext = useEntreprise();
  const authContext = useAuth();
  const [diagnosticResults, setDiagnosticResults] = useState({});
  const [searchTest, setSearchTest] = useState(null);
  
  // Hook de recherche pour test
  const {
    setSearchTerm,
    results
  } = useEntitySearch({
    entityType: 'artistes',
    searchField: 'nom',
    maxResults: 5
  });

  useEffect(() => {
    // Diagnostic complet du contexte
    const results = {
      timestamp: new Date().toISOString(),
      auth: {
        currentUser: authContext.currentUser ? {
          uid: authContext.currentUser.uid,
          email: authContext.currentUser.email
        } : null,
        isAuthenticated: !!authContext.currentUser
      },
      organizationContext: {
        rawContext: organizationContext,
        currentEntreprise: organizationContext.currentEntreprise,
        currentEntreprise: organizationContext.currentEntreprise,
        hasCurrentOrg: !!organizationContext.currentEntreprise,
        hasCurrentOrganization: !!organizationContext.currentEntreprise,
        currentEntrepriseId: organizationContext.currentEntreprise?.id,
        currentEntrepriseId: organizationContext.currentEntreprise?.id,
        userEntreprises: organizationContext.userEntreprises?.map(org => ({
          id: org.id,
          name: org.name,
          role: org.userRole
        })),
        loading: organizationContext.loading,
        error: organizationContext.error
      },
      localStorage: {
        currentEntrepriseId: localStorage.getItem('currentEntrepriseId'),
        currentUserId: localStorage.getItem('currentUserId')
      }
    };
    
    setDiagnosticResults(results);
    console.log('🔍 DIAGNOSTIC COMPLET:', results);
  }, [organizationContext, authContext]);

  const testSearch = async () => {
    console.log('🔍 Test de recherche avec terme: "test"');
    setSearchTerm('test');
    
    // Attendre un peu pour voir les résultats
    setTimeout(() => {
      setSearchTest({
        searchTerm: 'test',
        resultsCount: results.length,
        results: results.slice(0, 3).map(r => ({
          id: r.id,
          nom: r.nom,
          entrepriseId: r.entrepriseId
        }))
      });
    }, 1000);
  };

  const refreshContext = () => {
    if (organizationContext.refreshEntreprises) {
      organizationContext.refreshEntreprises();
    }
    window.location.reload();
  };

  return (
    <Card className="mb-4">
      <div className="card-header">
        <h3>🔍 Diagnostic du Contexte Organisation</h3>
      </div>
      <div className="card-body">
        {/* État de l'authentification */}
        <div className="alert alert-info mb-3">
          <h5>🔐 Authentification</h5>
          <ul className="mb-0">
            <li>Utilisateur connecté : <strong>{diagnosticResults.auth?.isAuthenticated ? 'OUI' : 'NON'}</strong></li>
            {diagnosticResults.auth?.currentUser && (
              <>
                <li>Email : <code>{diagnosticResults.auth.currentUser.email}</code></li>
                <li>UID : <code>{diagnosticResults.auth.currentUser.uid}</code></li>
              </>
            )}
          </ul>
        </div>

        {/* État du contexte Organisation */}
        <div className={`alert ${diagnosticResults.organizationContext?.currentEntrepriseId ? 'alert-success' : 'alert-warning'} mb-3`}>
          <h5>🏢 Contexte Organisation</h5>
          <ul className="mb-0">
            <li>Loading : <strong>{diagnosticResults.organizationContext?.loading ? 'OUI' : 'NON'}</strong></li>
            <li>Erreur : <strong>{diagnosticResults.organizationContext?.error || 'Aucune'}</strong></li>
            <li>currentEntreprise présent : <strong>{diagnosticResults.organizationContext?.hasCurrentOrg ? 'OUI' : 'NON'}</strong></li>
            <li>currentEntreprise présent : <strong>{diagnosticResults.organizationContext?.hasCurrentOrganization ? 'OUI' : 'NON'}</strong></li>
            <li>ID via currentEntreprise : <code>{diagnosticResults.organizationContext?.currentEntrepriseId || 'UNDEFINED'}</code></li>
            <li>ID via currentEntreprise : <code>{diagnosticResults.organizationContext?.currentEntrepriseId || 'UNDEFINED'}</code></li>
            <li>Nombre d'organisations : <strong>{diagnosticResults.organizationContext?.userEntreprises?.length || 0}</strong></li>
          </ul>
        </div>

        {/* Organisations disponibles */}
        {diagnosticResults.organizationContext?.userEntreprises?.length > 0 && (
          <div className="alert alert-secondary mb-3">
            <h5>📋 Organisations disponibles</h5>
            <ul className="mb-0">
              {diagnosticResults.organizationContext.userEntreprises.map(org => (
                <li key={org.id}>
                  <strong>{org.name}</strong> (ID: <code>{org.id}</code>, Rôle: {org.role})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* LocalStorage */}
        <div className="alert alert-dark mb-3">
          <h5>💾 LocalStorage</h5>
          <ul className="mb-0">
            <li>currentEntrepriseId : <code>{diagnosticResults.localStorage?.currentEntrepriseId || 'NULL'}</code></li>
            <li>currentUserId : <code>{diagnosticResults.localStorage?.currentUserId || 'NULL'}</code></li>
          </ul>
        </div>

        {/* Test de recherche */}
        <div className="mt-4">
          <h5>🧪 Test de recherche d'artistes</h5>
          <div className="d-flex gap-2 mb-3">
            <Button variant="primary" onClick={testSearch}>
              Tester la recherche
            </Button>
            <Button variant="secondary" onClick={refreshContext}>
              Rafraîchir le contexte
            </Button>
          </div>
          
          {searchTest && (
            <div className="alert alert-warning">
              <p>Recherche pour : <strong>"{searchTest.searchTerm}"</strong></p>
              <p>Résultats trouvés : <strong>{searchTest.resultsCount}</strong></p>
              {searchTest.results.length > 0 && (
                <ul>
                  {searchTest.results.map(r => (
                    <li key={r.id}>
                      {r.nom} (Org: {r.entrepriseId || 'AUCUN'})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Raw JSON pour debug avancé */}
        <details className="mt-4">
          <summary className="cursor-pointer">📄 Données brutes (JSON)</summary>
          <pre className="bg-light p-3 mt-2" style={{ maxHeight: '400px', overflow: 'auto' }}>
            {JSON.stringify(diagnosticResults, null, 2)}
          </pre>
        </details>
      </div>
    </Card>
  );
};

export default EntrepriseContextDiagnostic;