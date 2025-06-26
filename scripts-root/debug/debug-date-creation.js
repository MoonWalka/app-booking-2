// Outil de debug pour vérifier la création de dates
// Usage: node debug-date-creation.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
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

async function debugDateCreation() {
  console.log('🔍 Debug de la création de dates (concerts)\n');
  
  try {
    // 1. Vérifier les dernières dates créées
    console.log('1️⃣ DERNIÈRES DATES CRÉÉES');
    console.log('================================\n');
    
    const concertsQuery = query(
      collection(db, 'concerts'), 
      orderBy('createdAt', 'desc'), 
      limit(10)
    );
    
    const concertsSnapshot = await getDocs(concertsQuery);
    
    if (concertsSnapshot.empty) {
      console.log('❌ Aucune date trouvée dans la collection "concerts"');
      return;
    }
    
    console.log(`✅ ${concertsSnapshot.size} dernières dates trouvées:\n`);
    
    const dates = [];
    concertsSnapshot.forEach((doc) => {
      const data = doc.data();
      dates.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
      });
    });
    
    // Afficher chaque date avec détails
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      console.log(`📅 Date ${i + 1}: ${date.date || 'Sans date'}`);
      console.log(`   ID: ${date.id}`);
      console.log(`   Créée le: ${date.createdAt ? new Date(date.createdAt).toLocaleString('fr-FR') : 'Date inconnue'}`);
      console.log(`   Artiste: ${date.artisteNom || 'Non défini'} (ID: ${date.artisteId || 'N/A'})`);
      console.log(`   Projet: ${date.projetNom || 'Non défini'}`);
      console.log(`   Organisateur: ${date.organisateurNom || 'Non défini'} (ID: ${date.organisateurId || 'N/A'})`);
      console.log(`   Lieu: ${date.lieuNom || 'Non défini'}${date.lieuVille ? ' - ' + date.lieuVille : ''}`);
      console.log(`   Libellé: ${date.libelle || 'Non défini'}`);
      console.log(`   Statut: ${date.statut || 'Non défini'}`);
      console.log(`   Organization: ${date.organizationId || 'Non définie'}`);
      console.log('');
    }
    
    // 2. Vérifier la structure des données
    console.log('\n2️⃣ ANALYSE DE LA STRUCTURE');
    console.log('================================\n');
    
    if (dates.length > 0) {
      const latestDate = dates[0];
      console.log('Structure de la dernière date créée:');
      console.log(JSON.stringify(latestDate, null, 2));
      
      // Vérifier les champs requis
      console.log('\n✅ Vérification des champs requis:');
      const requiredFields = ['date', 'artisteId', 'artisteNom', 'organisateurId', 'organisateurNom', 'organizationId'];
      requiredFields.forEach(field => {
        const hasField = latestDate[field] !== undefined && latestDate[field] !== null && latestDate[field] !== '';
        console.log(`   ${field}: ${hasField ? '✅' : '❌'} ${hasField ? `(${latestDate[field]})` : 'MANQUANT'}`);
      });
    }
    
    // 3. Vérifier les références
    console.log('\n\n3️⃣ VÉRIFICATION DES RÉFÉRENCES');
    console.log('================================\n');
    
    if (dates.length > 0) {
      const latestDate = dates[0];
      
      // Vérifier l'artiste
      if (latestDate.artisteId) {
        try {
          const artisteDoc = await getDoc(doc(db, 'artistes', latestDate.artisteId));
          if (artisteDoc.exists()) {
            console.log(`✅ Artiste trouvé: ${artisteDoc.data().nom || artisteDoc.data().nomArtiste}`);
          } else {
            console.log(`❌ Artiste introuvable (ID: ${latestDate.artisteId})`);
          }
        } catch (error) {
          console.log(`❌ Erreur lors de la vérification de l'artiste: ${error.message}`);
        }
      }
      
      // Vérifier l'organisateur
      if (latestDate.organisateurId) {
        try {
          const structureDoc = await getDoc(doc(db, 'structures', latestDate.organisateurId));
          if (structureDoc.exists()) {
            console.log(`✅ Structure trouvée: ${structureDoc.data().structureRaisonSociale || structureDoc.data().nom}`);
          } else {
            console.log(`❌ Structure introuvable (ID: ${latestDate.organisateurId})`);
          }
        } catch (error) {
          console.log(`❌ Erreur lors de la vérification de la structure: ${error.message}`);
        }
      }
      
      // Vérifier le lieu
      if (latestDate.lieuId) {
        try {
          const lieuDoc = await getDoc(doc(db, 'lieux', latestDate.lieuId));
          if (lieuDoc.exists()) {
            console.log(`✅ Lieu trouvé: ${lieuDoc.data().nom}`);
          } else {
            console.log(`❌ Lieu introuvable (ID: ${latestDate.lieuId})`);
          }
        } catch (error) {
          console.log(`❌ Erreur lors de la vérification du lieu: ${error.message}`);
        }
      }
    }
    
    // 4. Statistiques
    console.log('\n\n4️⃣ STATISTIQUES');
    console.log('================================\n');
    
    const stats = {
      total: dates.length,
      avecLieu: dates.filter(d => d.lieuId).length,
      avecLibelle: dates.filter(d => d.libelle).length,
      statutEnCours: dates.filter(d => d.statut === 'En cours').length
    };
    
    console.log(`📊 Sur les ${stats.total} dernières dates:`);
    console.log(`   - ${stats.avecLieu} ont un lieu défini (${Math.round(stats.avecLieu / stats.total * 100)}%)`);
    console.log(`   - ${stats.avecLibelle} ont un libellé (${Math.round(stats.avecLibelle / stats.total * 100)}%)`);
    console.log(`   - ${stats.statutEnCours} sont "En cours" (${Math.round(stats.statutEnCours / stats.total * 100)}%)`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter le debug
debugDateCreation();