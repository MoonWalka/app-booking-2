#!/usr/bin/env node

/**
 * Script de réparation des relations bidirectionnelles manquantes
 * Corrige les relations entre concerts, artistes, lieux et contacts
 */

const admin = require('firebase-admin');
const path = require('path');

// Configuration Firebase Admin
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
  path.join(__dirname, '../firebase-service-account.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('❌ Erreur: Fichier de compte de service Firebase non trouvé');
  console.error('Assurez-vous que firebase-service-account.json existe ou définissez FIREBASE_SERVICE_ACCOUNT_PATH');
  process.exit(1);
}

const db = admin.firestore();

async function fixBidirectionalRelations(organizationId) {
  console.log('🔧 Réparation des relations bidirectionnelles...\n');
  
  const stats = {
    artistesConcerts: { checked: 0, fixed: 0 },
    lieuxConcerts: { checked: 0, fixed: 0 },
    contactsConcerts: { checked: 0, fixed: 0 },
    total: { checked: 0, fixed: 0 }
  };
  
  try {
    // 1. Récupérer tous les concerts de l'organisation
    console.log('📋 Récupération des concerts...');
    const concertsSnapshot = await db.collection('concerts')
      .where('organizationId', '==', organizationId)
      .get();
    
    console.log(`   Trouvé ${concertsSnapshot.size} concerts\n`);
    
    // 2. Pour chaque concert, vérifier et corriger les relations
    for (const concertDoc of concertsSnapshot.docs) {
      const concert = { id: concertDoc.id, ...concertDoc.data() };
      console.log(`🎵 Concert: ${concert.titre || 'Sans titre'} (${concert.date})`);
      
      // Vérifier relation avec artiste
      if (concert.artisteId) {
        stats.artistesConcerts.checked++;
        stats.total.checked++;
        
        const artisteRef = db.collection('artistes').doc(concert.artisteId);
        const artisteDoc = await artisteRef.get();
        
        if (artisteDoc.exists) {
          const artiste = artisteDoc.data();
          const concertsIds = artiste.concertsIds || [];
          
          if (!concertsIds.includes(concert.id)) {
            console.log(`   ✅ Ajout du concert à l'artiste ${artiste.nom}`);
            await artisteRef.update({
              concertsIds: admin.firestore.FieldValue.arrayUnion(concert.id),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            stats.artistesConcerts.fixed++;
            stats.total.fixed++;
          } else {
            console.log(`   ✓ Relation artiste OK`);
          }
        } else {
          console.log(`   ❌ Artiste ${concert.artisteId} introuvable`);
        }
      }
      
      // Vérifier relation avec lieu
      if (concert.lieuId) {
        stats.lieuxConcerts.checked++;
        stats.total.checked++;
        
        const lieuRef = db.collection('lieux').doc(concert.lieuId);
        const lieuDoc = await lieuRef.get();
        
        if (lieuDoc.exists) {
          const lieu = lieuDoc.data();
          const concertsIds = lieu.concertsIds || [];
          
          if (!concertsIds.includes(concert.id)) {
            console.log(`   ✅ Ajout du concert au lieu ${lieu.nom}`);
            await lieuRef.update({
              concertsIds: admin.firestore.FieldValue.arrayUnion(concert.id),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            stats.lieuxConcerts.fixed++;
            stats.total.fixed++;
          } else {
            console.log(`   ✓ Relation lieu OK`);
          }
        } else {
          console.log(`   ❌ Lieu ${concert.lieuId} introuvable`);
        }
      }
      
      // Vérifier relation avec contact
      if (concert.contactId) {
        stats.contactsConcerts.checked++;
        stats.total.checked++;
        
        const contactRef = db.collection('contacts').doc(concert.contactId);
        const contactDoc = await contactRef.get();
        
        if (contactDoc.exists) {
          const contact = contactDoc.data();
          const concertsIds = contact.concertsIds || [];
          
          if (!concertsIds.includes(concert.id)) {
            console.log(`   ✅ Ajout du concert au contact ${contact.nom}`);
            await contactRef.update({
              concertsIds: admin.firestore.FieldValue.arrayUnion(concert.id),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            stats.contactsConcerts.fixed++;
            stats.total.fixed++;
          } else {
            console.log(`   ✓ Relation contact OK`);
          }
        } else {
          console.log(`   ❌ Contact ${concert.contactId} introuvable`);
        }
      }
      
      console.log(''); // Ligne vide entre chaque concert
    }
    
    // 3. Afficher le résumé
    console.log('\n📊 RÉSUMÉ DES CORRECTIONS');
    console.log('========================');
    console.log(`Relations artistes-concerts : ${stats.artistesConcerts.fixed}/${stats.artistesConcerts.checked} corrigées`);
    console.log(`Relations lieux-concerts    : ${stats.lieuxConcerts.fixed}/${stats.lieuxConcerts.checked} corrigées`);
    console.log(`Relations contacts-concerts : ${stats.contactsConcerts.fixed}/${stats.contactsConcerts.checked} corrigées`);
    console.log(`\nTOTAL : ${stats.total.fixed}/${stats.total.checked} relations corrigées`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la réparation:', error);
  }
}

// Fonction principale
async function main() {
  // Récupérer l'ID d'organisation depuis les arguments ou utiliser celui par défaut
  const organizationId = process.argv[2] || '9LjkCJG04pEzbABdHkSf';
  
  console.log(`🏢 Organisation: ${organizationId}`);
  console.log('================================\n');
  
  await fixBidirectionalRelations(organizationId);
  
  process.exit(0);
}

// Lancer le script
main().catch(error => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});