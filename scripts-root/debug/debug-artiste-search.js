// Outil de debug pour la recherche d'artiste dans DateCreationPage
// Usage: node debug-artiste-search.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Configuration Firebase (à adapter selon votre config)
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
const auth = getAuth(app);

async function debugArtisteSearch() {
  console.log('🔍 Debug de la recherche d\'artiste\n');
  
  try {
    // Se connecter (remplacez par vos identifiants de test)
    console.log('📱 Connexion à Firebase...');
    // await signInWithEmailAndPassword(auth, 'test@example.com', 'password');
    
    // 1. Vérifier les artistes
    console.log('\n1️⃣ VÉRIFICATION DES ARTISTES');
    console.log('================================');
    
    const artistesQuery = query(collection(db, 'artistes'));
    const artistesSnapshot = await getDocs(artistesQuery);
    
    console.log(`✅ Nombre total d'artistes: ${artistesSnapshot.size}`);
    
    const artistes = [];
    artistesSnapshot.forEach((doc) => {
      const data = doc.data();
      artistes.push({
        id: doc.id,
        nom: data.nom || data.nomArtiste,
        organizationId: data.organizationId,
        projets: data.projets
      });
    });
    
    // Afficher les 5 premiers artistes
    console.log('\n📋 Premiers artistes:');
    artistes.slice(0, 5).forEach((a, i) => {
      console.log(`  ${i + 1}. ${a.nom || 'Sans nom'} (ID: ${a.id})`);
      console.log(`     - Organization: ${a.organizationId || 'Non définie'}`);
      console.log(`     - Projets intégrés: ${a.projets ? a.projets.length : 0}`);
    });
    
    // 2. Vérifier les projets
    console.log('\n\n2️⃣ VÉRIFICATION DES PROJETS');
    console.log('================================');
    
    const projetsQuery = query(collection(db, 'projets'));
    const projetsSnapshot = await getDocs(projetsQuery);
    
    console.log(`✅ Nombre total de projets: ${projetsSnapshot.size}`);
    
    const projets = [];
    const projetsByArtiste = {};
    
    projetsSnapshot.forEach((doc) => {
      const data = doc.data();
      projets.push({
        id: doc.id,
        intitule: data.intitule,
        artistesSelectionnes: data.artistesSelectionnes || [],
        organizationId: data.organizationId
      });
      
      // Grouper par artiste
      if (data.artistesSelectionnes && data.artistesSelectionnes.length > 0) {
        data.artistesSelectionnes.forEach(artisteId => {
          if (!projetsByArtiste[artisteId]) {
            projetsByArtiste[artisteId] = [];
          }
          projetsByArtiste[artisteId].push({
            id: doc.id,
            nom: data.intitule || 'Sans nom'
          });
        });
      }
    });
    
    // Afficher les 5 premiers projets
    console.log('\n📋 Premiers projets:');
    projets.slice(0, 5).forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.intitule || 'Sans nom'} (ID: ${p.id})`);
      console.log(`     - Artistes: ${p.artistesSelectionnes.join(', ') || 'Aucun'}`);
      console.log(`     - Organization: ${p.organizationId || 'Non définie'}`);
    });
    
    // 3. Vérifier les associations
    console.log('\n\n3️⃣ ASSOCIATIONS ARTISTES-PROJETS');
    console.log('================================');
    
    let totalAssociations = 0;
    Object.entries(projetsByArtiste).forEach(([artisteId, projetsArtiste]) => {
      const artiste = artistes.find(a => a.id === artisteId);
      if (artiste) {
        console.log(`\n🎤 ${artiste.nom} (${artisteId}):`);
        projetsArtiste.forEach(p => {
          console.log(`   - ${p.nom} (${p.id})`);
          totalAssociations++;
        });
      }
    });
    
    console.log(`\n✅ Total d'associations: ${totalAssociations}`);
    
    // 4. Simulation de la recherche
    console.log('\n\n4️⃣ SIMULATION DE RECHERCHE');
    console.log('================================');
    
    // Simuler ce que fait loadArtistes()
    const searchResults = [];
    
    artistes.forEach((artiste) => {
      const artisteNom = artiste.nom || '';
      
      // Projets de la nouvelle collection
      const projetsFromCollection = projetsByArtiste[artiste.id] || [];
      
      if (projetsFromCollection.length > 0) {
        projetsFromCollection.forEach(projet => {
          searchResults.push({
            id: artiste.id,
            nom: artisteNom,
            projet: projet.nom,
            projetId: projet.id,
            searchText: `${artisteNom} ${projet.nom}`.toLowerCase()
          });
        });
      } else {
        // Artiste sans projet
        searchResults.push({
          id: artiste.id,
          nom: artisteNom,
          projet: '',
          projetId: null,
          searchText: artisteNom.toLowerCase()
        });
      }
    });
    
    console.log(`\n✅ Résultats de recherche générés: ${searchResults.length}`);
    console.log('\n📋 Exemples de résultats:');
    searchResults.slice(0, 5).forEach((r, i) => {
      console.log(`  ${i + 1}. "${r.nom}${r.projet ? ' - ' + r.projet : ''}" (searchText: "${r.searchText}")`);
    });
    
    // 5. Test de filtrage
    console.log('\n\n5️⃣ TEST DE FILTRAGE');
    console.log('================================');
    
    const testSearches = ['', 'a', 'test', 'projet'];
    
    testSearches.forEach(search => {
      const filtered = searchResults.filter(r => 
        r.searchText.includes(search.toLowerCase())
      );
      console.log(`\n🔍 Recherche "${search}": ${filtered.length} résultats`);
      if (filtered.length > 0 && filtered.length <= 3) {
        filtered.forEach(r => {
          console.log(`   - ${r.nom}${r.projet ? ' - ' + r.projet : ''}`);
        });
      }
    });
    
    // 6. Recommandations
    console.log('\n\n6️⃣ RECOMMANDATIONS');
    console.log('================================');
    
    if (artistesSnapshot.size === 0) {
      console.log('❌ Aucun artiste dans la base de données');
    }
    
    if (projetsSnapshot.size === 0) {
      console.log('⚠️  Aucun projet dans la nouvelle collection');
    }
    
    if (searchResults.length === 0) {
      console.log('❌ Aucun résultat de recherche généré');
    } else {
      console.log('✅ Les données semblent correctes');
      console.log('\n🔧 Vérifiez dans le navigateur:');
      console.log('   1. Ouvrez les DevTools (F12)');
      console.log('   2. Dans la console, après avoir cliqué sur le champ artiste, tapez:');
      console.log('      - Pour voir si showArtisteDropdown est true');
      console.log('      - Pour voir combien d\'artistes sont chargés');
      console.log('   3. Dans l\'onglet Elements, cherchez un div avec class="dropdown"');
      console.log('   4. Vérifiez que le Form.Group parent a position: relative');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter le debug
debugArtisteSearch();