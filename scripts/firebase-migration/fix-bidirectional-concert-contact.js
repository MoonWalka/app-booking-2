#!/usr/bin/env node

/**
 * Script de correction des relations bidirectionnelles concert-contact
 * 
 * Ce script parcourt tous les concerts et s'assure que leurs contacts
 * ont bien le concertId dans leur tableau concertsIds
 */

const { db, collection, getDocs, doc, getDoc, updateDoc, Timestamp } = require('./firebase-node');

async function fixBidirectionalRelations() {
  console.log('🔄 Début de la correction des relations bidirectionnelles concert-contact...\n');
  
  try {
    
    // Récupérer tous les concerts
    console.log('📋 Récupération de tous les concerts...');
    const concertsSnapshot = await getDocs(collection(db, 'concerts'));
    console.log(`✅ ${concertsSnapshot.size} concerts trouvés\n`);
    
    let updatedContacts = 0;
    let errors = 0;
    
    // Parcourir chaque concert
    for (const concertDoc of concertsSnapshot.docs) {
      const concert = concertDoc.data();
      const concertId = concertDoc.id;
      
      // Vérifier si le concert a un contact associé
      if (concert.contactId) {
        console.log(`\n🎵 Concert "${concert.titre}" (${concertId})`);
        console.log(`   👤 Contact associé: ${concert.contactId}`);
        
        try {
          // Récupérer le contact
          const contactRef = doc(db, 'contacts', concert.contactId);
          const contactDoc = await getDoc(contactRef);
          
          if (contactDoc.exists) {
            const contact = contactDoc.data();
            const currentConcertsIds = contact.concertsIds || [];
            
            // Vérifier si le concert est déjà dans la liste
            if (!currentConcertsIds.includes(concertId)) {
              console.log(`   ⚠️  Le concert n'est pas dans concertsIds du contact`);
              
              // Ajouter le concert à la liste
              const updatedConcertsIds = [...currentConcertsIds, concertId];
              await updateDoc(contactRef, {
                concertsIds: updatedConcertsIds,
                updatedAt: Timestamp.now()
              });
              
              console.log(`   ✅ Concert ajouté à concertsIds du contact`);
              updatedContacts++;
            } else {
              console.log(`   ✅ Relation déjà correcte`);
            }
          } else {
            console.log(`   ❌ Contact ${concert.contactId} introuvable!`);
            errors++;
          }
        } catch (error) {
          console.error(`   ❌ Erreur lors de la mise à jour du contact:`, error.message);
          errors++;
        }
      }
    }
    
    // Nettoyer les références orphelines
    console.log('\n\n🧹 Nettoyage des références orphelines...');
    const contactsSnapshot = await getDocs(collection(db, 'contacts'));
    let cleanedContacts = 0;
    
    for (const contactDoc of contactsSnapshot.docs) {
      const contact = contactDoc.data();
      const contactId = contactDoc.id;
      
      if (contact.concertsIds && contact.concertsIds.length > 0) {
        const validConcertIds = [];
        let hasOrphans = false;
        
        // Vérifier chaque concert référencé
        for (const concertId of contact.concertsIds) {
          const concertDocRef = doc(db, 'concerts', concertId);
          const concertDoc = await getDoc(concertDocRef);
          
          if (concertDoc.exists && concertDoc.data().contactId === contactId) {
            validConcertIds.push(concertId);
          } else {
            hasOrphans = true;
            console.log(`   🗑️  Référence orpheline trouvée: Concert ${concertId} dans Contact ${contactId}`);
          }
        }
        
        // Mettre à jour si nécessaire
        if (hasOrphans) {
          await updateDoc(doc(db, 'contacts', contactId), {
            concertsIds: validConcertIds,
            updatedAt: Timestamp.now()
          });
          cleanedContacts++;
        }
      }
    }
    
    // Résumé
    console.log('\n\n📊 Résumé de la migration:');
    console.log(`   ✅ Contacts mis à jour: ${updatedContacts}`);
    console.log(`   🧹 Contacts nettoyés: ${cleanedContacts}`);
    console.log(`   ❌ Erreurs: ${errors}`);
    console.log('\n✅ Migration terminée!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

// Exécuter la migration
fixBidirectionalRelations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });