#!/usr/bin/env node

/**
 * Script de correction des relations bidirectionnelles concert-contact
 * 
 * Ce script parcourt tous les concerts et s'assure que leurs contacts
 * ont bien le concertId dans leur tableau concertsIds
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialisation Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

async function fixBidirectionalRelations() {
  console.log(`${colors.cyan}${colors.bright}=== Correction des relations bidirectionnelles Concert-Contact ===${colors.reset}\n`);

  try {
    // Récupérer tous les concerts
    const concertsSnapshot = await db.collection('concerts').get();
    console.log(`${colors.blue}Nombre total de concerts:${colors.reset} ${concertsSnapshot.size}`);

    let fixedCount = 0;
    let errorCount = 0;
    const contactsToUpdate = new Map(); // Map pour regrouper les mises à jour par contact

    // Analyser tous les concerts
    for (const concertDoc of concertsSnapshot.docs) {
      const concert = concertDoc.data();
      const concertId = concertDoc.id;

      // Vérifier si le concert a un contact associé
      if (concert.contactId) {
        console.log(`\n${colors.yellow}Concert "${concert.titre}" (${concertId}):${colors.reset}`);
        console.log(`  - Contact associé: ${concert.contactId}`);

        // Ajouter ce concert à la liste des concerts du contact
        if (!contactsToUpdate.has(concert.contactId)) {
          contactsToUpdate.set(concert.contactId, new Set());
        }
        contactsToUpdate.get(concert.contactId).add(concertId);
      }
    }

    // Mettre à jour tous les contacts
    console.log(`\n${colors.cyan}${colors.bright}Mise à jour des contacts...${colors.reset}`);
    
    for (const [contactId, concertIds] of contactsToUpdate) {
      try {
        // Récupérer le contact
        const contactRef = db.collection('contacts').doc(contactId);
        const contactDoc = await contactRef.get();

        if (!contactDoc.exists) {
          console.log(`${colors.red}  ❌ Contact ${contactId} introuvable${colors.reset}`);
          errorCount++;
          continue;
        }

        const contact = contactDoc.data();
        const existingConcertIds = contact.concertsIds || [];
        
        // Fusionner les IDs existants avec les nouveaux (éviter les doublons)
        const allConcertIds = [...new Set([...existingConcertIds, ...concertIds])];
        
        // Mettre à jour le contact si nécessaire
        if (allConcertIds.length !== existingConcertIds.length) {
          await contactRef.update({
            concertsIds: allConcertIds,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          const addedCount = allConcertIds.length - existingConcertIds.length;
          console.log(`${colors.green}  ✅ Contact ${contact.nom || contactId}: ${addedCount} concert(s) ajouté(s)${colors.reset}`);
          console.log(`     Total concerts: ${allConcertIds.length}`);
          fixedCount++;
        } else {
          console.log(`${colors.blue}  ℹ️  Contact ${contact.nom || contactId}: déjà à jour${colors.reset}`);
        }

      } catch (error) {
        console.error(`${colors.red}  ❌ Erreur pour le contact ${contactId}:${colors.reset}`, error.message);
        errorCount++;
      }
    }

    // Résumé
    console.log(`\n${colors.cyan}${colors.bright}=== Résumé ===${colors.reset}`);
    console.log(`${colors.green}✅ Contacts corrigés:${colors.reset} ${fixedCount}`);
    console.log(`${colors.red}❌ Erreurs rencontrées:${colors.reset} ${errorCount}`);
    console.log(`${colors.blue}ℹ️  Total contacts traités:${colors.reset} ${contactsToUpdate.size}`);

    // Vérification finale : rechercher les contacts orphelins
    console.log(`\n${colors.cyan}${colors.bright}Recherche de contacts avec des concerts orphelins...${colors.reset}`);
    
    const contactsSnapshot = await db.collection('contacts').get();
    let orphanCount = 0;
    
    for (const contactDoc of contactsSnapshot.docs) {
      const contact = contactDoc.data();
      if (contact.concertsIds && contact.concertsIds.length > 0) {
        const validConcertIds = [];
        
        for (const concertId of contact.concertsIds) {
          const concertDoc = await db.collection('concerts').doc(concertId).get();
          if (concertDoc.exists) {
            validConcertIds.push(concertId);
          } else {
            console.log(`${colors.yellow}  ⚠️  Concert orphelin ${concertId} dans contact ${contact.nom || contactDoc.id}${colors.reset}`);
            orphanCount++;
          }
        }
        
        // Nettoyer les concerts orphelins si nécessaire
        if (validConcertIds.length !== contact.concertsIds.length) {
          await contactDoc.ref.update({
            concertsIds: validConcertIds,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log(`${colors.green}    → Nettoyé${colors.reset}`);
        }
      }
    }
    
    if (orphanCount > 0) {
      console.log(`${colors.yellow}\n⚠️  ${orphanCount} références de concerts orphelins nettoyées${colors.reset}`);
    }

    console.log(`\n${colors.green}${colors.bright}✅ Script terminé avec succès!${colors.reset}`);

  } catch (error) {
    console.error(`${colors.red}${colors.bright}❌ Erreur fatale:${colors.reset}`, error);
    process.exit(1);
  }
}

// Exécuter le script
fixBidirectionalRelations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erreur:', error);
    process.exit(1);
  });