// Outil pour inspecter les données d'un concert existant
// Usage: node inspect-concert-data.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function inspectConcertData() {
  console.log('🔍 Inspection des données de concerts\n');
  
  try {
    // 1. Chercher un concert du 01/10/2025
    console.log('1️⃣ RECHERCHE DU CONCERT DU 01/10/2025');
    console.log('=====================================\n');
    
    const targetDate = '2025-10-01';
    const concertsQuery = query(
      collection(db, 'concerts'),
      where('date', '==', targetDate),
      limit(5)
    );
    
    const snapshot = await getDocs(concertsQuery);
    
    if (snapshot.empty) {
      console.log(`❌ Aucun concert trouvé pour la date ${targetDate}`);
      
      // Chercher les 5 derniers concerts pour voir la structure
      console.log('\n2️⃣ AFFICHAGE DES 5 DERNIERS CONCERTS');
      console.log('====================================\n');
      
      const recentQuery = query(
        collection(db, 'concerts'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      
      const recentSnapshot = await getDocs(recentQuery);
      
      recentSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n📅 Concert ${index + 1} (ID: ${doc.id})`);
        console.log('Date:', data.date || 'Non définie');
        console.log('Structure complète:');
        console.log(JSON.stringify(data, null, 2));
        console.log('\n---');
      });
      
    } else {
      console.log(`✅ ${snapshot.size} concert(s) trouvé(s) pour le ${targetDate}\n`);
      
      snapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n📅 Concert ${index + 1} (ID: ${doc.id})`);
        console.log('=====================================');
        
        // Afficher tous les champs
        console.log('\n📊 TOUS LES CHAMPS:');
        Object.entries(data).forEach(([key, value]) => {
          if (value && typeof value === 'object' && value.toDate) {
            console.log(`${key}:`, value.toDate().toLocaleString('fr-FR'));
          } else {
            console.log(`${key}:`, value);
          }
        });
        
        // Analyser les champs structure/organisateur
        console.log('\n🏢 ANALYSE STRUCTURE/ORGANISATEUR:');
        console.log('- organisateurId:', data.organisateurId || 'NON DÉFINI');
        console.log('- organisateurNom:', data.organisateurNom || 'NON DÉFINI');
        console.log('- structureId:', data.structureId || 'NON DÉFINI');
        console.log('- structureNom:', data.structureNom || 'NON DÉFINI');
        console.log('- structureRaisonSociale:', data.structureRaisonSociale || 'NON DÉFINI');
        console.log('- structure (objet):', data.structure || 'NON DÉFINI');
        
        // Analyser les champs artiste/projet
        console.log('\n🎤 ANALYSE ARTISTE/PROJET:');
        console.log('- artisteId:', data.artisteId || 'NON DÉFINI');
        console.log('- artisteNom:', data.artisteNom || 'NON DÉFINI');
        console.log('- projet:', data.projet || 'NON DÉFINI');
        console.log('- projetNom:', data.projetNom || 'NON DÉFINI');
        console.log('- formule:', data.formule || 'NON DÉFINI');
        
        console.log('\n---');
      });
    }
    
    // 3. Analyser la cohérence des données
    console.log('\n\n3️⃣ ANALYSE DE COHÉRENCE');
    console.log('=======================\n');
    
    const allConcertsQuery = query(
      collection(db, 'concerts'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    const allSnapshot = await getDocs(allConcertsQuery);
    const stats = {
      total: allSnapshot.size,
      avecOrganisateurId: 0,
      avecStructureId: 0,
      avecLesDeuxIds: 0,
      sansAucunId: 0,
      avecProjetNom: 0,
      avecFormule: 0
    };
    
    allSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.organisateurId) stats.avecOrganisateurId++;
      if (data.structureId) stats.avecStructureId++;
      if (data.organisateurId && data.structureId) stats.avecLesDeuxIds++;
      if (!data.organisateurId && !data.structureId) stats.sansAucunId++;
      if (data.projetNom) stats.avecProjetNom++;
      if (data.formule) stats.avecFormule++;
    });
    
    console.log('📊 Statistiques sur les 20 derniers concerts:');
    console.log(`- Total analysé: ${stats.total}`);
    console.log(`- Avec organisateurId: ${stats.avecOrganisateurId} (${Math.round(stats.avecOrganisateurId/stats.total*100)}%)`);
    console.log(`- Avec structureId: ${stats.avecStructureId} (${Math.round(stats.avecStructureId/stats.total*100)}%)`);
    console.log(`- Avec les deux IDs: ${stats.avecLesDeuxIds} (${Math.round(stats.avecLesDeuxIds/stats.total*100)}%)`);
    console.log(`- Sans aucun ID: ${stats.sansAucunId} (${Math.round(stats.sansAucunId/stats.total*100)}%)`);
    console.log(`- Avec projetNom: ${stats.avecProjetNom} (${Math.round(stats.avecProjetNom/stats.total*100)}%)`);
    console.log(`- Avec formule: ${stats.avecFormule} (${Math.round(stats.avecFormule/stats.total*100)}%)`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter l'inspection
inspectConcertData();