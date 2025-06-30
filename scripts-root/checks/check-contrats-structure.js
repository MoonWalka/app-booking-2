#!/usr/bin/env node

/**
 * Script pour vérifier la structure des contrats dans Firestore
 * et identifier les propriétés manquantes
 */

const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Initialiser Firebase Admin avec les credentials du fichier .env
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

if (!serviceAccount.project_id) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT non trouvé dans .env');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();

async function checkContratsStructure() {
  console.log('=== VÉRIFICATION DE LA STRUCTURE DES CONTRATS ===\n');
  
  try {
    // Récupérer tous les contrats
    const contratsSnapshot = await db.collection('contrats').limit(10).get();
    
    if (contratsSnapshot.empty) {
      console.log('❌ Aucun contrat trouvé dans la collection');
      return;
    }
    
    console.log(`📊 Analyse de ${contratsSnapshot.size} contrats...\n`);
    
    // Analyser la structure de chaque contrat
    const fieldsStats = {};
    const statusStats = {};
    const missingFields = {
      ref: [],
      entrepriseCode: [],
      collaborateurCode: [],
      type: [],
      raisonSociale: [],
      dateGeneration: [],
      status: []
    };
    
    contratsSnapshot.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;
      
      // Collecter les statistiques sur les champs
      Object.keys(data).forEach(field => {
        fieldsStats[field] = (fieldsStats[field] || 0) + 1;
      });
      
      // Statistiques sur les statuts
      if (data.status) {
        statusStats[data.status] = (statusStats[data.status] || 0) + 1;
      } else {
        statusStats['(aucun)'] = (statusStats['(aucun)'] || 0) + 1;
      }
      
      // Vérifier les champs manquants
      Object.keys(missingFields).forEach(field => {
        if (!data[field]) {
          missingFields[field].push(id);
        }
      });
      
      // Afficher un exemple de structure
      if (doc === contratsSnapshot.docs[0]) {
        console.log('📋 Exemple de structure (premier contrat):');
        console.log('ID:', id);
        console.log('Champs présents:');
        Object.keys(data).sort().forEach(field => {
          const value = data[field];
          const type = typeof value;
          console.log(`  - ${field}: ${type}${value === null ? ' (null)' : ''}`);
        });
        console.log('\n');
      }
    });
    
    // Afficher les statistiques des champs
    console.log('📊 STATISTIQUES DES CHAMPS:');
    console.log('---------------------------');
    const sortedFields = Object.entries(fieldsStats)
      .sort((a, b) => b[1] - a[1]);
    
    sortedFields.forEach(([field, count]) => {
      const percentage = (count / contratsSnapshot.size * 100).toFixed(0);
      console.log(`${field}: ${count}/${contratsSnapshot.size} (${percentage}%)`);
    });
    
    // Afficher les statistiques des statuts
    console.log('\n📊 RÉPARTITION DES STATUTS:');
    console.log('---------------------------');
    Object.entries(statusStats).forEach(([status, count]) => {
      const percentage = (count / contratsSnapshot.size * 100).toFixed(0);
      console.log(`${status}: ${count} (${percentage}%)`);
    });
    
    // Afficher les champs manquants critiques
    console.log('\n⚠️  CHAMPS MANQUANTS CRITIQUES:');
    console.log('--------------------------------');
    Object.entries(missingFields).forEach(([field, ids]) => {
      if (ids.length > 0) {
        console.log(`\n❌ ${field}: manquant dans ${ids.length} contrat(s)`);
        if (ids.length <= 3) {
          console.log(`   IDs: ${ids.join(', ')}`);
        } else {
          console.log(`   IDs: ${ids.slice(0, 3).join(', ')}... (et ${ids.length - 3} autres)`);
        }
      } else {
        console.log(`✅ ${field}: présent dans tous les contrats`);
      }
    });
    
    // Recommandations
    console.log('\n💡 RECOMMANDATIONS:');
    console.log('-------------------');
    
    if (missingFields.ref.length > 0) {
      console.log('\n1. Générer une référence pour les contrats qui n\'en ont pas:');
      console.log('   - Utiliser contratNumber si disponible');
      console.log('   - Sinon générer: CONT-YYYY-XXXX');
    }
    
    if (missingFields.entrepriseCode.length > 0) {
      console.log('\n2. Définir entrepriseCode (code de l\'entreprise émettrice):');
      console.log('   - Utiliser "MR" pour Meltin Recordz par défaut');
      console.log('   - Ou récupérer depuis les paramètres de l\'organisation');
    }
    
    if (missingFields.status.length > 0) {
      console.log('\n3. Migrer les anciens statuts vers le nouveau système:');
      console.log('   - Si contratGenere === true → status = "draft"');
      console.log('   - Si contratRedige === true → status = "generated"');
      console.log('   - Si contratFinalise === true → status = "finalized"');
    }
    
    if (!fieldsStats.updatedAt) {
      console.log('\n4. Ajouter updatedAt à tous les contrats pour un tri fiable');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    console.log('\n=== FIN DE LA VÉRIFICATION ===\n');
    process.exit(0);
  }
}

// Exécuter la vérification
checkContratsStructure();