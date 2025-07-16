#!/usr/bin/env node

/**
 * Script pour diagnostiquer et corriger les problèmes de recherche d'artistes
 * 
 * Ce script :
 * 1. Vérifie la structure des documents artistes
 * 2. Identifie les artistes sans entrepriseId
 * 3. Peut ajouter l'entrepriseId manquant
 * 4. Détecte les doublons d'artistes
 */

const admin = require('firebase-admin');
const path = require('path');

// Charger les variables d'environnement
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: `https://${process.env.REACT_APP_FIREBASE_PROJECT_ID}.firebaseio.com`
  });
}

const db = admin.firestore();

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function analyzeArtistes() {
  console.log(`${colors.cyan}🔍 Analyse des artistes...${colors.reset}\n`);
  
  const artistesRef = db.collection('artistes');
  const snapshot = await artistesRef.get();
  
  const stats = {
    total: snapshot.size,
    withEntrepriseId: 0,
    withoutEntrepriseId: 0,
    withNom: 0,
    withoutNom: 0,
    duplicates: new Map()
  };
  
  const artistesByName = new Map();
  const artistesWithoutOrgId = [];
  
  snapshot.forEach(doc => {
    const data = doc.data();
    
    // Vérifier entrepriseId
    if (data.entrepriseId) {
      stats.withEntrepriseId++;
    } else {
      stats.withoutEntrepriseId++;
      artistesWithoutOrgId.push({ id: doc.id, data });
    }
    
    // Vérifier nom
    if (data.nom) {
      stats.withNom++;
      
      // Détecter les doublons
      const nomLower = data.nom.toLowerCase().trim();
      if (!artistesByName.has(nomLower)) {
        artistesByName.set(nomLower, []);
      }
      artistesByName.get(nomLower).push({ id: doc.id, ...data });
    } else {
      stats.withoutNom++;
    }
  });
  
  // Identifier les doublons
  artistesByName.forEach((artistes, nom) => {
    if (artistes.length > 1) {
      stats.duplicates.set(nom, artistes);
    }
  });
  
  // Afficher les résultats
  console.log(`${colors.blue}📊 Résumé de l'analyse :${colors.reset}`);
  console.log(`Total d'artistes : ${stats.total}`);
  console.log(`Avec entrepriseId : ${colors.green}${stats.withEntrepriseId}${colors.reset}`);
  console.log(`Sans entrepriseId : ${colors.red}${stats.withoutEntrepriseId}${colors.reset}`);
  console.log(`Avec nom : ${colors.green}${stats.withNom}${colors.reset}`);
  console.log(`Sans nom : ${colors.red}${stats.withoutNom}${colors.reset}`);
  console.log(`Doublons détectés : ${colors.yellow}${stats.duplicates.size}${colors.reset}\n`);
  
  // Afficher les doublons
  if (stats.duplicates.size > 0) {
    console.log(`${colors.yellow}⚠️  Artistes en double :${colors.reset}`);
    stats.duplicates.forEach((artistes, nom) => {
      console.log(`\n"${nom}" (${artistes.length} occurrences) :`);
      artistes.forEach(artiste => {
        console.log(`  - ID: ${artiste.id}`);
        console.log(`    EntrepriseId: ${artiste.entrepriseId || 'MANQUANT'}`);
        console.log(`    Style: ${artiste.style || 'non défini'}`);
        console.log(`    Créé le: ${artiste.createdAt?.toDate?.() || 'date inconnue'}`);
      });
    });
  }
  
  // Afficher les artistes sans entrepriseId
  if (artistesWithoutOrgId.length > 0) {
    console.log(`\n${colors.red}❌ Artistes sans entrepriseId :${colors.reset}`);
    artistesWithoutOrgId.slice(0, 10).forEach(({ id, data }) => {
      console.log(`  - ${data.nom || 'Sans nom'} (ID: ${id})`);
    });
    if (artistesWithoutOrgId.length > 10) {
      console.log(`  ... et ${artistesWithoutOrgId.length - 10} autres`);
    }
  }
  
  return { stats, artistesWithoutOrgId, duplicates: stats.duplicates };
}

async function fixEntrepriseIds(artistesWithoutOrgId, entrepriseId) {
  if (!entrepriseId) {
    console.log(`${colors.red}❌ Aucun entrepriseId fourni${colors.reset}`);
    return;
  }
  
  console.log(`\n${colors.cyan}🔧 Correction des entrepriseId manquants...${colors.reset}`);
  console.log(`EntrepriseId à appliquer : ${entrepriseId}`);
  
  let updated = 0;
  const batch = db.batch();
  
  for (const { id } of artistesWithoutOrgId) {
    const ref = db.collection('artistes').doc(id);
    batch.update(ref, {
      entrepriseId: entrepriseId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    updated++;
    
    // Firestore limite à 500 opérations par batch
    if (updated % 500 === 0) {
      await batch.commit();
      console.log(`  ✓ ${updated} artistes mis à jour...`);
    }
  }
  
  if (updated % 500 !== 0) {
    await batch.commit();
  }
  
  console.log(`${colors.green}✅ ${updated} artistes mis à jour avec entrepriseId${colors.reset}`);
}

async function detectAndMergeDuplicates(duplicates) {
  console.log(`\n${colors.cyan}🔍 Analyse des doublons pour fusion potentielle...${colors.reset}`);
  
  const mergeRecommendations = [];
  
  duplicates.forEach((artistes, nom) => {
    // Trouver l'artiste "principal" (le plus ancien avec le plus de données)
    const sorted = artistes.sort((a, b) => {
      // Priorité à celui qui a un entrepriseId
      if (a.entrepriseId && !b.entrepriseId) return -1;
      if (!a.entrepriseId && b.entrepriseId) return 1;
      
      // Puis par date de création
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      return dateA - dateB;
    });
    
    const principal = sorted[0];
    const doublons = sorted.slice(1);
    
    console.log(`\n"${nom}" :`);
    console.log(`  Principal : ${principal.id} (org: ${principal.entrepriseId || 'AUCUN'})`);
    console.log(`  Doublons : ${doublons.map(d => d.id).join(', ')}`);
    
    mergeRecommendations.push({
      nom,
      principal,
      doublons
    });
  });
  
  return mergeRecommendations;
}

// Script principal
async function main() {
  const args = process.argv.slice(2);
  const fix = args.includes('--fix');
  const entrepriseId = args.find(arg => arg.startsWith('--org='))?.split('=')[1];
  
  console.log(`${colors.blue}🎵 Diagnostic des artistes${colors.reset}`);
  console.log(`Mode : ${fix ? 'CORRECTION' : 'ANALYSE SEULE'}`);
  if (entrepriseId) {
    console.log(`EntrepriseId : ${entrepriseId}`);
  }
  console.log('----------------------------\n');
  
  try {
    // Analyser les artistes
    const { stats, artistesWithoutOrgId, duplicates } = await analyzeArtistes();
    
    // Proposer des corrections
    if (artistesWithoutOrgId.length > 0 && fix) {
      if (!entrepriseId) {
        console.log(`\n${colors.yellow}⚠️  Pour corriger les entrepriseId manquants, utilisez :${colors.reset}`);
        console.log(`   node fix-artistes-search.js --fix --org=VOTRE_ENTREPRISE_ID`);
      } else {
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const answer = await new Promise(resolve => {
          readline.question(`\nVoulez-vous ajouter entrepriseId="${entrepriseId}" aux ${artistesWithoutOrgId.length} artistes ? (oui/non) `, resolve);
        });
        
        if (answer.toLowerCase() === 'oui') {
          await fixEntrepriseIds(artistesWithoutOrgId, entrepriseId);
        }
        
        readline.close();
      }
    }
    
    // Analyser les doublons
    if (duplicates.size > 0) {
      const recommendations = await detectAndMergeDuplicates(duplicates);
      
      console.log(`\n${colors.yellow}💡 Recommandations pour les doublons :${colors.reset}`);
      console.log('Pour fusionner les doublons, vous devrez :');
      console.log('1. Mettre à jour toutes les références (concerts, etc.)');
      console.log('2. Fusionner les données des doublons');
      console.log('3. Supprimer les doublons');
      console.log('\nUn script de fusion automatique peut être créé si nécessaire.');
    }
    
    console.log(`\n${colors.green}✅ Analyse terminée${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Erreur :${colors.reset}`, error);
    process.exit(1);
  }
}

// Exécuter le script
main();