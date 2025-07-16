/**
 * Script de diagnostic pour analyser le problème des concerts manquants
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, where } from 'firebase/firestore';

// Configuration Firebase de développement
const firebaseConfig = {
  projectId: "demo-tourcraft-app",
  authDomain: "demo-tourcraft-app.firebaseapp.com",
  storageBucket: "demo-tourcraft-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to emulator
if (window.location.hostname === 'localhost') {
  console.log('🔧 Connexion à l\'émulateur Firestore');
  import('firebase/firestore').then(({ connectFirestoreEmulator }) => {
    try {
      connectFirestoreEmulator(db, 'localhost', 8080);
    } catch (error) {
      console.log('Émulateur déjà connecté');
    }
  });
}

async function diagnosticConcerts() {
  console.log('🔍 === DIAGNOSTIC COMPLET CONCERTS ===');
  
  try {
    // 1. Test de base - charger tous les concerts
    console.log('\n1. Test chargement direct de tous les concerts...');
    const concertsRef = collection(db, 'concerts');
    const allSnapshot = await getDocs(concertsRef);
    console.log(`   ✅ Total concerts: ${allSnapshot.docs.length}`);
    
    if (allSnapshot.docs.length > 0) {
      allSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`   📄 Concert ${index + 1}: ${doc.id}`, {
          titre: data.titre,
          date: data.date,
          dateEvenement: data.dateEvenement,
          statut: data.statut,
          keys: Object.keys(data)
        });
      });
    }
    
    // 2. Test avec tri par dateEvenement (comme dans ListWithFilters)
    console.log('\n2. Test tri par dateEvenement...');
    try {
      const sortedQuery = query(concertsRef, orderBy('dateEvenement', 'desc'));
      const sortedSnapshot = await getDocs(sortedQuery);
      console.log(`   ✅ Concerts triés par dateEvenement: ${sortedSnapshot.docs.length}`);
    } catch (error) {
      console.error('   ❌ Erreur tri dateEvenement:', error.message);
      
      // Test avec tri par 'date' à la place
      console.log('   🔄 Test avec champ "date"...');
      try {
        const dateQuery = query(concertsRef, orderBy('date', 'desc'));
        const dateSnapshot = await getDocs(dateQuery);
        console.log(`   ✅ Concerts triés par date: ${dateSnapshot.docs.length}`);
      } catch (dateError) {
        console.error('   ❌ Erreur tri date:', dateError.message);
      }
    }
    
    // 3. Test avec tri par createdAt (fallback)
    console.log('\n3. Test tri par createdAt...');
    try {
      const createdQuery = query(concertsRef, orderBy('createdAt', 'desc'));
      const createdSnapshot = await getDocs(createdQuery);
      console.log(`   ✅ Concerts triés par createdAt: ${createdSnapshot.docs.length}`);
    } catch (error) {
      console.error('   ❌ Erreur tri createdAt:', error.message);
    }
    
    // 4. Vérifier les index manquants
    console.log('\n4. Analyse des champs de tri disponibles...');
    if (allSnapshot.docs.length > 0) {
      const firstDoc = allSnapshot.docs[0].data();
      const availableFields = Object.keys(firstDoc);
      const sortableFields = availableFields.filter(field => 
        typeof firstDoc[field] === 'string' || 
        typeof firstDoc[field] === 'number' ||
        firstDoc[field] instanceof Date
      );
      console.log('   📊 Champs triables disponibles:', sortableFields);
    }
    
    // 5. Test de requête simple sans tri (comme dans le composant actuel)
    console.log('\n5. Test requête sans tri...');
    const simpleSnapshot = await getDocs(concertsRef);
    console.log(`   ✅ Concerts sans tri: ${simpleSnapshot.docs.length}`);
    
    // 6. Vérifier les collections organisationnelles
    console.log('\n6. Test collections organisationnelles...');
    const orgCollections = ['concerts_org_test', 'concerts_org_default'];
    for (const orgColl of orgCollections) {
      try {
        const orgRef = collection(db, orgColl);
        const orgSnapshot = await getDocs(orgRef);
        console.log(`   📁 ${orgColl}: ${orgSnapshot.docs.length} documents`);
      } catch (error) {
        console.log(`   ⚠️ ${orgColl}: collection non accessible`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur dans le diagnostic:', error);
  }
  
  console.log('\n🏁 === FIN DIAGNOSTIC ===');
}

// Fonction pour corriger les données
async function fixConcertData() {
  console.log('\n🔧 === CORRECTION DES DONNÉES ===');
  
  try {
    const concertsRef = collection(db, 'concerts');
    const snapshot = await getDocs(concertsRef);
    
    console.log(`Correction de ${snapshot.docs.length} concerts...`);
    
    // TODO: Implémenter la correction si nécessaire
    // Par exemple, renommer 'date' en 'dateEvenement'
    
  } catch (error) {
    console.error('❌ Erreur correction:', error);
  }
}

// Exporter les fonctions pour utilisation dans la console
window.diagnosticConcerts = diagnosticConcerts;
window.fixConcertData = fixConcertData;

// Lancer le diagnostic automatiquement
diagnosticConcerts();