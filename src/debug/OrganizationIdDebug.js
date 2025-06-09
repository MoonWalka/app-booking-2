import React, { useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';

export default function OrganizationIdDebug() {
  const { currentOrganization } = useOrganization();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const runGlobalDiagnostic = async () => {
    if (!currentOrganization?.id) {
      console.error('Pas d\'organisation actuelle');
      return;
    }

    setIsLoading(true);
    const diagnosticResults = [];
    
    try {
      console.log('🔍 === DIAGNOSTIC GLOBAL ===');
      console.log(`Organization ID: ${currentOrganization.id}`);
      
      // 1. Compter TOUS les contacts (sans filtre)
      const allContactsQuery = query(collection(db, 'contacts'));
      const allContactsSnapshot = await getDocs(allContactsQuery);
      console.log(`Total contacts (tous): ${allContactsSnapshot.size}`);
      
      // 2. Compter les contacts avec le bon organizationId
      const contactsWithOrgQuery = query(
        collection(db, 'contacts'),
        where('organizationId', '==', currentOrganization.id)
      );
      const contactsWithOrgSnapshot = await getDocs(contactsWithOrgQuery);
      console.log(`Contacts avec organizationId correct: ${contactsWithOrgSnapshot.size}`);
      
      // 3. Compter TOUS les lieux (sans filtre)
      const allLieuxQuery = query(collection(db, 'lieux'));
      const allLieuxSnapshot = await getDocs(allLieuxQuery);
      console.log(`Total lieux (tous): ${allLieuxSnapshot.size}`);
      
      // 4. Compter les lieux avec le bon organizationId
      const lieuxWithOrgQuery = query(
        collection(db, 'lieux'),
        where('organizationId', '==', currentOrganization.id)
      );
      const lieuxWithOrgSnapshot = await getDocs(lieuxWithOrgQuery);
      console.log(`Lieux avec organizationId correct: ${lieuxWithOrgSnapshot.size}`);
      
      // 5. Ajouter les résultats pour l'affichage
      diagnosticResults.push({
        type: 'Résumé Global',
        status: '📊 Statistiques',
        data: {
          contactsTotal: allContactsSnapshot.size,
          contactsWithOrg: contactsWithOrgSnapshot.size,
          lieuxTotal: allLieuxSnapshot.size,
          lieuxWithOrg: lieuxWithOrgSnapshot.size
        }
      });
      
      // 6. Lister quelques contacts sans organizationId pour debug
      console.log('\n🔍 === EXEMPLES CONTACTS SANS ORGANIZATIONID ===');
      let contactsSansOrg = 0;
      allContactsSnapshot.forEach(doc => {
        const data = doc.data();
        if (!data.organizationId) {
          contactsSansOrg++;
          if (contactsSansOrg <= 3) { // Montrer seulement les 3 premiers
            console.log(`Contact sans organizationId: ${doc.id} - ${data.nom} ${data.prenom}`);
            diagnosticResults.push({
              type: 'Contact sans organizationId',
              id: doc.id,
              nom: `${data.prenom || ''} ${data.nom || ''}`,
              status: '❌ Pas d\'organizationId'
            });
          }
        }
      });
      
      // 7. Lister quelques lieux sans organizationId pour debug
      console.log('\n🔍 === EXEMPLES LIEUX SANS ORGANIZATIONID ===');
      let lieuxSansOrg = 0;
      allLieuxSnapshot.forEach(doc => {
        const data = doc.data();
        if (!data.organizationId) {
          lieuxSansOrg++;
          if (lieuxSansOrg <= 3) { // Montrer seulement les 3 premiers
            console.log(`Lieu sans organizationId: ${doc.id} - ${data.nom}`);
            diagnosticResults.push({
              type: 'Lieu sans organizationId',
              id: doc.id,
              nom: data.nom || 'Sans nom',
              status: '❌ Pas d\'organizationId'
            });
          }
        }
      });
      
      console.log(`\n📊 RÉSUMÉ: ${contactsSansOrg} contacts et ${lieuxSansOrg} lieux sans organizationId`);
      
      setResults(diagnosticResults);
      
    } catch (error) {
      console.error('Erreur lors du diagnostic global:', error);
      diagnosticResults.push({
        type: 'Erreur',
        status: '❌ Erreur',
        error: error.message
      });
      setResults(diagnosticResults);
    } finally {
      setIsLoading(false);
    }
  };

  const runDetailedDiagnostic = async () => {
    if (!currentOrganization?.id) {
      console.error('Pas d\'organisation actuelle');
      return;
    }

    setIsLoading(true);
    const diagnosticResults = [];
    
    try {
      const contactId = 'ma4zcYfy56wpVbAUp5V7'; // L'ID du contact problématique
      
      console.log('🔍 === DIAGNOSTIC DÉTAILLÉ POUR LE CONTACT ===');
      console.log(`Contact ID: ${contactId}`);
      console.log(`Organization ID: ${currentOrganization.id}`);
      
      // 1. Vérifier le contact lui-même
      const contactDoc = await getDoc(doc(db, 'contacts', contactId));
      if (contactDoc.exists()) {
        const contactData = contactDoc.data();
        console.log('✅ Contact trouvé:', contactData);
        diagnosticResults.push({
          type: 'Contact',
          status: '✅ Trouvé',
          data: contactData,
          organizationId: contactData.organizationId,
          matchesCurrentOrg: contactData.organizationId === currentOrganization.id
        });
      } else {
        console.log('❌ Contact non trouvé');
        diagnosticResults.push({
          type: 'Contact',
          status: '❌ Non trouvé'
        });
      }

      // 2. Chercher TOUS les lieux qui référencent ce contact (sans filtre organizationId)
      console.log('\n🔍 === RECHERCHE LIEUX RÉFÉRENÇANT CE CONTACT ===');
      
      // Méthode 1: contacts array-contains
      const lieuxQuery1 = query(
        collection(db, 'lieux'),
        where('contacts', 'array-contains', contactId)
      );
      const lieuxSnapshot1 = await getDocs(lieuxQuery1);
      console.log(`Lieux avec contacts array-contains ${contactId}:`, lieuxSnapshot1.size);
      
      lieuxSnapshot1.forEach(doc => {
        const data = doc.data();
        console.log(`  - Lieu ${doc.id}: ${data.nom}, organizationId: ${data.organizationId}`);
        diagnosticResults.push({
          type: 'Lieu (contacts array)',
          id: doc.id,
          nom: data.nom,
          organizationId: data.organizationId,
          matchesCurrentOrg: data.organizationId === currentOrganization.id,
          status: data.organizationId === currentOrganization.id ? '✅ Match' : '❌ Différent'
        });
      });

      // Méthode 2: contactId direct
      const lieuxQuery2 = query(
        collection(db, 'lieux'),
        where('contactId', '==', contactId)
      );
      const lieuxSnapshot2 = await getDocs(lieuxQuery2);
      console.log(`Lieux avec contactId ${contactId}:`, lieuxSnapshot2.size);
      
      lieuxSnapshot2.forEach(doc => {
        const data = doc.data();
        console.log(`  - Lieu ${doc.id}: ${data.nom}, organizationId: ${data.organizationId}`);
        diagnosticResults.push({
          type: 'Lieu (contactId)',
          id: doc.id,
          nom: data.nom,
          organizationId: data.organizationId,
          matchesCurrentOrg: data.organizationId === currentOrganization.id,
          status: data.organizationId === currentOrganization.id ? '✅ Match' : '❌ Différent'
        });
      });

      // 3. Chercher TOUS les concerts qui référencent ce contact
      console.log('\n🔍 === RECHERCHE CONCERTS RÉFÉRENÇANT CE CONTACT ===');
      
      // Méthode 1: contactId direct
      const concertsQuery1 = query(
        collection(db, 'concerts'),
        where('contactId', '==', contactId)
      );
      const concertsSnapshot1 = await getDocs(concertsQuery1);
      console.log(`Concerts avec contactId ${contactId}:`, concertsSnapshot1.size);
      
      concertsSnapshot1.forEach(doc => {
        const data = doc.data();
        console.log(`  - Concert ${doc.id}: ${data.titre}, organizationId: ${data.organizationId}`);
        diagnosticResults.push({
          type: 'Concert (contactId)',
          id: doc.id,
          titre: data.titre,
          organizationId: data.organizationId,
          matchesCurrentOrg: data.organizationId === currentOrganization.id,
          status: data.organizationId === currentOrganization.id ? '✅ Match' : '❌ Différent'
        });
      });

      // Méthode 2: contacts array-contains
      const concertsQuery2 = query(
        collection(db, 'concerts'),
        where('contacts', 'array-contains', contactId)
      );
      const concertsSnapshot2 = await getDocs(concertsQuery2);
      console.log(`Concerts avec contacts array-contains ${contactId}:`, concertsSnapshot2.size);
      
      concertsSnapshot2.forEach(doc => {
        const data = doc.data();
        console.log(`  - Concert ${doc.id}: ${data.titre}, organizationId: ${data.organizationId}`);
        diagnosticResults.push({
          type: 'Concert (contacts array)',
          id: doc.id,
          titre: data.titre,
          organizationId: data.organizationId,
          matchesCurrentOrg: data.organizationId === currentOrganization.id,
          status: data.organizationId === currentOrganization.id ? '✅ Match' : '❌ Différent'
        });
      });

      // 4. Test avec filtre organizationId (comme le fait le hook actuel)
      console.log('\n🔍 === TEST AVEC FILTRE ORGANIZATIONID ===');
      
      const lieuxQueryFiltered = query(
        collection(db, 'lieux'),
        where('contacts', 'array-contains', contactId),
        where('organizationId', '==', currentOrganization.id)
      );
      const lieuxSnapshotFiltered = await getDocs(lieuxQueryFiltered);
      console.log(`Lieux avec filtre organizationId: ${lieuxSnapshotFiltered.size}`);
      
      const concertsQueryFiltered = query(
        collection(db, 'concerts'),
        where('contactId', '==', contactId),
        where('organizationId', '==', currentOrganization.id)
      );
      const concertsSnapshotFiltered = await getDocs(concertsQueryFiltered);
      console.log(`Concerts avec filtre organizationId: ${concertsSnapshotFiltered.size}`);

      console.log('\n🎯 === RÉSUMÉ DU DIAGNOSTIC ===');
      console.log(`Total résultats trouvés: ${diagnosticResults.length}`);
      const matchingOrg = diagnosticResults.filter(r => r.matchesCurrentOrg).length;
      const nonMatchingOrg = diagnosticResults.filter(r => r.matchesCurrentOrg === false).length;
      console.log(`Résultats avec organizationId correct: ${matchingOrg}`);
      console.log(`Résultats avec organizationId différent: ${nonMatchingOrg}`);
      
      setResults(diagnosticResults);
      
    } catch (error) {
      console.error('Erreur lors du diagnostic:', error);
      diagnosticResults.push({
        type: 'Erreur',
        status: '❌ Erreur',
        error: error.message
      });
      setResults(diagnosticResults);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '2px solid #ff6b6b', margin: '20px' }}>
      <h2>🔍 Debug Associations Contact</h2>
      <p>Organisation actuelle: {currentOrganization?.nom} ({currentOrganization?.id})</p>
      
      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={runGlobalDiagnostic}
          disabled={isLoading}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {isLoading ? 'Diagnostic en cours...' : 'Diagnostic Global (Compter toutes les entités)'}
        </button>
        
        <button 
          onClick={runDetailedDiagnostic}
          disabled={isLoading}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#ff6b6b', 
            color: 'white', 
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Diagnostic en cours...' : 'Diagnostic contact spécifique'}
        </button>
      </div>
      
      {results.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Résultats du diagnostic:</h3>
          <div style={{ maxHeight: '400px', overflow: 'auto' }}>
            {results.map((result, index) => (
              <div 
                key={index}
                style={{ 
                  padding: '10px', 
                  margin: '5px 0',
                  backgroundColor: result.matchesCurrentOrg === true ? '#d4edda' : 
                                 result.matchesCurrentOrg === false ? '#f8d7da' : '#f8f9fa',
                  border: '1px solid #ccc',
                  borderRadius: '3px'
                }}
              >
                <strong>{result.type}</strong> - {result.status}
                {result.id && <div>ID: {result.id}</div>}
                {result.nom && <div>Nom: {result.nom}</div>}
                {result.titre && <div>Titre: {result.titre}</div>}
                {result.data && (
                  <div>
                    <div>Contacts total: {result.data.contactsTotal}, avec organizationId: {result.data.contactsWithOrg}</div>
                    <div>Lieux total: {result.data.lieuxTotal}, avec organizationId: {result.data.lieuxWithOrg}</div>
                  </div>
                )}
                {result.organizationId && (
                  <div>
                    OrganizationId: {result.organizationId} 
                    {result.matchesCurrentOrg !== undefined && (
                      <span style={{ marginLeft: '10px' }}>
                        {result.matchesCurrentOrg ? '✅ Match' : '❌ Différent'}
                      </span>
                    )}
                  </div>
                )}
                {result.error && <div style={{ color: 'red' }}>Erreur: {result.error}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 