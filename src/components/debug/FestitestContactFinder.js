import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

/**
 * Composant pour rechercher et consolider toutes les données liées à "festitest"
 */
const FestitestContactFinder = () => {
  const { currentOrganization } = useOrganization();
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [, setConsolidatedData] = useState(null);
  const [error, setError] = useState(null);
  const [searchComplete, setSearchComplete] = useState(false);

  const searchFestitest = useCallback(async () => {
    setSearching(true);
    setError(null);
    setResults([]);
    setConsolidatedData(null);
    setSearchComplete(false);

    try {
      console.log('🔍 Recherche complète des données "festitest"...');
      
      const allData = {
        contacts: [],
        structures: [],
        concerts: [],
        lieux: [],
        contrats: [],
        factures: [],
        artistes: []
      };

      // Collections à rechercher
      const collections = ['contacts', 'structures', 'concerts', 'lieux', 'contrats', 'factures', 'artistes'];
      
      // Ajouter les collections organisationnelles
      if (currentOrganization?.id) {
        collections.push(
          ...collections.map(col => `${col}_org_${currentOrganization.id}`)
        );
      }

      // Rechercher "festitest" dans toutes les collections
      for (const collectionName of collections) {
        try {
          console.log(`🔍 Recherche dans ${collectionName}...`);
          
          // Rechercher "jean fons" dans les collections de contacts
          if (collectionName.includes('contact')) {
            // Recherche par nom "fons"
            try {
              const q = query(
                collection(db, collectionName),
                where('nom', '>=', 'fons'),
                where('nom', '<=', 'fons\uf8ff')
              );
              const snapshot = await getDocs(q);
              
              if (!snapshot.empty) {
                console.log(`✅ ${snapshot.size} contact(s) "fons" trouvé(s)`);
                
                snapshot.forEach(docSnapshot => {
                  const data = docSnapshot.data();
                  allData.contacts.push({
                    id: docSnapshot.id,
                    collection: collectionName,
                    searchField: 'nom (fons)',
                    data: data
                  });
                });
              }
            } catch (fonsError) {
              console.warn('Erreur recherche fons:', fonsError.message);
            }

            // Recherche par prénom "jean"  
            try {
              const jeanQuery = query(
                collection(db, collectionName),
                where('prenom', '>=', 'jean'),
                where('prenom', '<=', 'jean\uf8ff')
              );
              const jeanSnapshot = await getDocs(jeanQuery);
              
              if (!jeanSnapshot.empty) {
                console.log(`✅ ${jeanSnapshot.size} contact(s) "jean" trouvé(s)`);
                
                jeanSnapshot.forEach(docSnapshot => {
                  const data = docSnapshot.data();
                  allData.contacts.push({
                    id: docSnapshot.id,
                    collection: collectionName,
                    searchField: 'prenom (jean)',
                    data: data
                  });
                });
              }
            } catch (jeanError) {
              console.warn('Erreur recherche jean:', jeanError.message);
            }
          }
          
          // Rechercher aussi "meltin recordz" dans les structures
          if (collectionName.includes('structure')) {
            try {
              const meltinQuery = query(
                collection(db, collectionName),
                where('raisonSociale', '>=', 'meltin'),
                where('raisonSociale', '<=', 'meltin\uf8ff')
              );
              const meltinSnapshot = await getDocs(meltinQuery);
              
              if (!meltinSnapshot.empty) {
                console.log(`✅ ${meltinSnapshot.size} structure(s) "meltin" trouvée(s)`);
                
                meltinSnapshot.forEach(docSnapshot => {
                  const data = docSnapshot.data();
                  allData.structures.push({
                    id: docSnapshot.id,
                    collection: collectionName,
                    searchField: 'raisonSociale (meltin)',
                    data: data
                  });
                });
              }
            } catch (meltinError) {
              console.warn('Erreur recherche meltin:', meltinError.message);
            }
          }
          
        } catch (collectionError) {
          console.warn(`⚠️ Erreur avec collection ${collectionName}:`, collectionError.message);
        }
      }

      // Consolider les données
      const consolidated = {
        jeanFonsContact: allData.contacts.find(c => 
          (c.data.nom?.toLowerCase().includes('fons') && c.data.prenom?.toLowerCase().includes('jean')) ||
          c.data.nom?.toLowerCase() === 'fons' ||
          c.data.prenom?.toLowerCase() === 'jean'
        ),
        meltinStructure: allData.structures.find(s => 
          s.data.raisonSociale?.toLowerCase().includes('meltin')
        ),
        relatedData: {
          allContacts: allData.contacts,
          allStructures: allData.structures,
          allDates: allData.concerts,
          allLieux: allData.lieux,
          allContrats: allData.contrats,
          allFactures: allData.factures,
          allArtistes: allData.artistes
        }
      };

      setResults(allData.contacts);
      setConsolidatedData(consolidated);
      
      console.log('🎉 Recherche complète terminée:', consolidated);

    } catch (err) {
      console.error('❌ Erreur lors de la recherche:', err);
      setError(err.message);
    } finally {
      setSearching(false);
      setSearchComplete(true);
    }
  }, [currentOrganization]);

  // Recherche automatique au chargement du composant
  useEffect(() => {
    if (currentOrganization?.id) {
      searchFestitest();
    }
  }, [currentOrganization, searchFestitest]);

  const formatContactData = (contact) => {
    const data = contact.data;
    return {
      'ID': contact.id,
      'Collection': contact.collection,
      'Méthode de recherche': contact.searchMethod,
      'Nom': data.nom || 'N/A',
      'Prénom': data.prenom || 'N/A',
      'Email': data.email || 'N/A',
      'Téléphone': data.telephone || 'N/A',
      'Structure ID': data.structureId || 'N/A',
      'Structure Nom': data.structureNom || 'N/A',
      'Organization ID': data.organizationId || 'N/A',
      'Créé le': data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toLocaleString() : data.createdAt.toString()) : 'N/A',
      'Modifié le': data.updatedAt ? (data.updatedAt.toDate ? data.updatedAt.toDate().toLocaleString() : data.updatedAt.toString()) : 'N/A',
      'Tags': Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || 'N/A'),
      'Adresse': data.adresse || 'N/A',
      'Ville': data.ville || 'N/A',
      'Code Postal': data.codePostal || 'N/A',
      'Notes': data.notes || 'N/A'
    };
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card>
        <div style={{ marginBottom: '20px' }}>
          <h2>🔍 Recherche du contact "jean fons" (lié à festitest)</h2>
          <p>
            Cet outil recherche le contact "jean fons" lié au date festitest et la structure "meltin recordz"
            pour préparer la migration des métadonnées.
          </p>
          
          {currentOrganization?.id && (
            <p><strong>Organisation courante:</strong> {currentOrganization.name} (ID: {currentOrganization.id})</p>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <Button 
            onClick={searchFestitest} 
            disabled={searching}
            variant="primary"
          >
            {searching ? 'Recherche en cours...' : 'Rechercher "jean fons" et données liées'}
          </Button>
        </div>

        {error && (
          <Alert type="error" style={{ marginBottom: '20px' }}>
            <strong>Erreur:</strong> {error}
          </Alert>
        )}

        {searchComplete && results.length === 0 && (
          <Alert type="warning" style={{ marginBottom: '20px' }}>
            <strong>Aucun contact "festitest" trouvé</strong>
            <p>
              Le contact "festitest" n'existe pas dans la base de données. 
              Vous devrez peut-être le créer manuellement via l'interface de l'application.
            </p>
          </Alert>
        )}

        {results.length > 0 && (
          <div>
            <h3>📋 Résultats de la recherche ({results.length} contact(s) trouvé(s))</h3>
            
            {results.map((contact, index) => (
              <div key={index} style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
                {contact.isSimilar && (
                  <Alert type="info" style={{ marginBottom: '10px' }}>
                    Contact similaire trouvé (contient "test")
                  </Alert>
                )}
                
                <h4>📄 Contact #{index + 1}</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px', marginBottom: '15px' }}>
                  {Object.entries(formatContactData(contact)).map(([key, value]) => (
                    <div key={key} style={{ padding: '8px', background: '#f5f5f5', borderRadius: '3px' }}>
                      <strong>{key}:</strong> {value}
                    </div>
                  ))}
                </div>

                <details style={{ marginTop: '15px' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                    🔍 Métadonnées complètes (JSON)
                  </summary>
                  <pre style={{ 
                    background: '#f8f8f8', 
                    padding: '10px', 
                    borderRadius: '5px', 
                    overflow: 'auto',
                    fontSize: '12px',
                    marginTop: '10px'
                  }}>
                    {JSON.stringify(contact.data, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '5px' }}>
          <h4>💡 Instructions pour utiliser ces données</h4>
          <ul>
            <li>
              <strong>Structure des métadonnées:</strong> Les champs affichés ci-dessus montrent 
              la structure exacte utilisée par l'application pour les contacts.
            </li>
            <li>
              <strong>Modification via l'interface:</strong> Vous pouvez modifier ce contact 
              en allant dans /contacts/{'{'}id{'}'}/edit dans l'application.
            </li>
            <li>
              <strong>Tests:</strong> Utilisez ces métadonnées pour comprendre comment 
              les contacts sont structurés lors de vos tests de refactoring.
            </li>
            <li>
              <strong>Collection organisationnelle:</strong> Si le contact est trouvé dans une 
              collection organisationnelle (contacts_org_*), cela signifie qu'il utilise 
              le système multi-organisation.
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default FestitestContactFinder;