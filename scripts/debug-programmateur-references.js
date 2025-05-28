import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc 
} from 'firebase/firestore';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "***REMOVED***",
  authDomain: "tourcraft-booking.firebaseapp.com", 
  projectId: "tourcraft-booking",
  storageBucket: "tourcraft-booking.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Script de diagnostic pour identifier toutes les références à un programmateur
 * Usage: node scripts/debug-programmateur-references.js [PROGRAMMATEUR_ID]
 */

const PROGRAMMATEUR_ID = process.argv[2] || 'wH1GzFXf6W0GIFczbQyG';

console.log(`🔍 Diagnostic des références pour le programmateur: ${PROGRAMMATEUR_ID}`);
console.log('=' * 70);

async function checkProgrammateurExists() {
  console.log('\n📋 1. Vérification de l\'existence du programmateur...');
  
  try {
    const progDoc = await getDoc(doc(db, 'programmateurs', PROGRAMMATEUR_ID));
    
    if (progDoc.exists()) {
      const data = progDoc.data();
      console.log('✅ Programmateur trouvé:');
      console.log(`   - Nom: ${data.prenom} ${data.nom}`);
      console.log(`   - Email: ${data.email}`);
      console.log(`   - Structure ID: ${data.structureId || 'Aucune'}`);
      return data;
    } else {
      console.log('❌ Programmateur introuvable');
      return null;
    }
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
    return null;
  }
}

async function checkStructureReferences() {
  console.log('\n🏢 2. Recherche des structures qui référencent ce programmateur...');
  
  try {
    // Rechercher par champ programmateurIds (array)
    const structuresQuery1 = query(
      collection(db, 'structures'),
      where('programmateurIds', 'array-contains', PROGRAMMATEUR_ID)
    );
    
    const structuresSnapshot1 = await getDocs(structuresQuery1);
    
    if (!structuresSnapshot1.empty) {
      console.log(`🔍 Trouvé ${structuresSnapshot1.size} structure(s) avec programmateurIds:`);
      structuresSnapshot1.forEach(doc => {
        const data = doc.data();
        console.log(`   📍 Structure ${doc.id}:`);
        console.log(`      - Raison sociale: ${data.raisonSociale || 'N/A'}`);
        console.log(`      - Type: ${data.type || 'N/A'}`);
        console.log(`      - ProgrammateurIds: [${(data.programmateurIds || []).join(', ')}]`);
      });
    }
    
    // Rechercher par champ programmateursAssocies (ancien format)
    const structuresQuery2 = query(
      collection(db, 'structures'),
      where('programmateursAssocies', 'array-contains', PROGRAMMATEUR_ID)
    );
    
    const structuresSnapshot2 = await getDocs(structuresQuery2);
    
    if (!structuresSnapshot2.empty) {
      console.log(`🔍 Trouvé ${structuresSnapshot2.size} structure(s) avec programmateursAssocies:`);
      structuresSnapshot2.forEach(doc => {
        const data = doc.data();
        console.log(`   📍 Structure ${doc.id}:`);
        console.log(`      - Raison sociale: ${data.raisonSociale || data.nom || 'N/A'}`);
        console.log(`      - Type: ${data.type || 'N/A'}`);
        console.log(`      - ProgrammateursAssocies: [${(data.programmateursAssocies || []).join(', ')}]`);
      });
    }
    
    if (structuresSnapshot1.empty && structuresSnapshot2.empty) {
      console.log('✅ Aucune structure ne référence ce programmateur');
    }
    
    return {
      count1: structuresSnapshot1.size,
      count2: structuresSnapshot2.size,
      structures1: structuresSnapshot1.docs,
      structures2: structuresSnapshot2.docs
    };
    
  } catch (error) {
    console.log(`❌ Erreur lors de la recherche: ${error.message}`);
    return { count1: 0, count2: 0, structures1: [], structures2: [] };
  }
}

async function checkConcertReferences() {
  console.log('\n🎵 3. Recherche des concerts qui référencent ce programmateur...');
  
  try {
    const concertsQuery = query(
      collection(db, 'concerts'),
      where('programmateurId', '==', PROGRAMMATEUR_ID)
    );
    
    const concertsSnapshot = await getDocs(concertsQuery);
    
    if (!concertsSnapshot.empty) {
      console.log(`🔍 Trouvé ${concertsSnapshot.size} concert(s):`);
      concertsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   🎵 Concert ${doc.id}:`);
        console.log(`      - Titre: ${data.titre || 'N/A'}`);
        console.log(`      - Date: ${data.date ? new Date(data.date.seconds * 1000).toLocaleDateString() : 'N/A'}`);
        console.log(`      - Lieu: ${data.lieuNom || 'N/A'}`);
      });
    } else {
      console.log('✅ Aucun concert ne référence ce programmateur');
    }
    
    return concertsSnapshot.size;
    
  } catch (error) {
    console.log(`❌ Erreur lors de la recherche: ${error.message}`);
    return 0;
  }
}

async function checkLieuReferences() {
  console.log('\n📍 4. Recherche des lieux qui référencent ce programmateur...');
  
  try {
    const lieuxQuery = query(
      collection(db, 'lieux'),
      where('programmateurId', '==', PROGRAMMATEUR_ID)
    );
    
    const lieuxSnapshot = await getDocs(lieuxQuery);
    
    if (!lieuxSnapshot.empty) {
      console.log(`🔍 Trouvé ${lieuxSnapshot.size} lieu(x):`);
      lieuxSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   📍 Lieu ${doc.id}:`);
        console.log(`      - Nom: ${data.nom || 'N/A'}`);
        console.log(`      - Ville: ${data.ville || 'N/A'}`);
      });
    } else {
      console.log('✅ Aucun lieu ne référence ce programmateur');
    }
    
    return lieuxSnapshot.size;
    
  } catch (error) {
    console.log(`❌ Erreur lors de la recherche: ${error.message}`);
    return 0;
  }
}

async function generateCleanupScript(structureResults) {
  if (structureResults.count1 > 0 || structureResults.count2 > 0) {
    console.log('\n🧹 5. Script de nettoyage généré:');
    console.log('=' * 50);
    console.log('// Pour nettoyer les références orphelines, exécutez:');
    
    // Pour programmateurIds
    structureResults.structures1.forEach(doc => {
      console.log(`
// Structure: ${doc.id}
const structureRef = doc(db, 'structures', '${doc.id}');
await updateDoc(structureRef, {
  programmateurIds: arrayRemove('${PROGRAMMATEUR_ID}')
});`);
    });
    
    // Pour programmateursAssocies
    structureResults.structures2.forEach(doc => {
      console.log(`
// Structure: ${doc.id}
const structureRef = doc(db, 'structures', '${doc.id}');
await updateDoc(structureRef, {
  programmateursAssocies: arrayRemove('${PROGRAMMATEUR_ID}')
});`);
    });
  }
}

// Exécution principale
async function main() {
  try {
    const programmateur = await checkProgrammateurExists();
    
    if (programmateur) {
      const structureResults = await checkStructureReferences();
      const concertCount = await checkConcertReferences();
      const lieuCount = await checkLieuReferences();
      
      console.log('\n📊 Résumé:');
      console.log(`   - Structures (programmateurIds): ${structureResults.count1}`);
      console.log(`   - Structures (programmateursAssocies): ${structureResults.count2}`);
      console.log(`   - Concerts: ${concertCount}`);
      console.log(`   - Lieux: ${lieuCount}`);
      
      const totalReferences = structureResults.count1 + structureResults.count2 + concertCount + lieuCount;
      
      if (totalReferences === 0) {
        console.log('\n✅ Ce programmateur peut être supprimé en toute sécurité !');
      } else {
        console.log(`\n⚠️  Ce programmateur a ${totalReferences} référence(s) qui empêchent sa suppression.`);
        await generateCleanupScript(structureResults);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
  }
  
  process.exit(0);
}

main(); 