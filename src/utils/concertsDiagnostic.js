/**
 * Diagnostic pour analyser le problème de chargement des concerts
 */

import { collection, getDocs, query, orderBy } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { getCurrentOrganization } from '@/services/firebase-service';

export const diagnosticConcerts = async () => {
  console.log('🔍 === DIAGNOSTIC CONCERTS ===');
  
  // 1. Vérifier l'organisation courante
  const currentOrg = getCurrentOrganization();
  console.log('1. Organisation courante:', currentOrg);
  
  // 2. Vérifier le mode Firebase
  const mode = process.env.REACT_APP_MODE;
  console.log('2. Mode Firebase:', mode);
  
  // 3. Vérifier la disponibilité de la base de données
  console.log('3. Instance db:', db);
  
  // 4. Tenter de charger la collection concerts directement
  try {
    console.log('4. Test collection concerts directe...');
    const concertsRef = collection(db, 'concerts');
    console.log('   - Collection ref créée:', concertsRef);
    
    const snapshot = await getDocs(concertsRef);
    console.log('   - Snapshot obtenu:', snapshot);
    console.log('   - Nombre de documents:', snapshot.docs?.length || 0);
    
    if (snapshot.docs && snapshot.docs.length > 0) {
      console.log('   - Premier document:', {
        id: snapshot.docs[0].id,
        data: snapshot.docs[0].data()
      });
    }
  } catch (error) {
    console.error('❌ Erreur lors du test collection concerts:', error);
  }
  
  // 5. Tester avec une requête triée (comme dans ListWithFilters)
  try {
    console.log('5. Test requête triée...');
    const concertsRef = collection(db, 'concerts');
    const q = query(concertsRef, orderBy('dateEvenement', 'desc'));
    const snapshot = await getDocs(q);
    console.log('   - Requête triée réussie, documents:', snapshot.docs?.length || 0);
  } catch (error) {
    console.error('❌ Erreur requête triée:', error);
  }
  
  // 6. Vérifier les collections avec contexte organisationnel
  if (currentOrg) {
    try {
      console.log('6. Test collection organisationnelle...');
      const orgCollectionName = `concerts_org_${currentOrg}`;
      console.log('   - Nom collection org:', orgCollectionName);
      
      const orgConcertsRef = collection(db, orgCollectionName);
      const snapshot = await getDocs(orgConcertsRef);
      console.log('   - Documents org:', snapshot.docs?.length || 0);
    } catch (error) {
      console.error('❌ Erreur collection organisationnelle:', error);
    }
  }
  
  console.log('🏁 === FIN DIAGNOSTIC ===');
};

// Diagnostic des données de démonstration
export const diagnosticDemoData = async () => {
  console.log('🎭 === DIAGNOSTIC DONNÉES DÉMO ===');
  
  const collections = ['concerts', 'artistes', 'lieux', 'contacts', 'structures'];
  
  for (const collName of collections) {
    try {
      const collRef = collection(db, collName);
      const snapshot = await getDocs(collRef);
      console.log(`📂 ${collName}: ${snapshot.docs?.length || 0} documents`);
      
      if (snapshot.docs && snapshot.docs.length > 0) {
        const firstDoc = snapshot.docs[0];
        console.log(`   - Exemple: ${firstDoc.id}`, Object.keys(firstDoc.data() || {}));
      }
    } catch (error) {
      console.error(`❌ Erreur ${collName}:`, error);
    }
  }
  
  console.log('🏁 === FIN DIAGNOSTIC DÉMO ===');
};