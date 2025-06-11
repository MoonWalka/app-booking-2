#!/usr/bin/env node

/**
 * Script de diagnostic pour vérifier les relations lieu-contact
 */

const admin = require('firebase-admin');
const serviceAccount = require('./tourcraft-362307-firebase-adminsdk-70tps-bfe75b1eed.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function analyzerLieuContacts() {
  console.log('🔍 Analyse des relations lieu-contact...\n');
  
  try {
    // 1. Chercher tous les lieux
    const lieuxSnapshot = await db.collection('lieux').limit(10).get();
    console.log(`📍 ${lieuxSnapshot.size} lieux trouvés\n`);
    
    for (const doc of lieuxSnapshot.docs) {
      const lieu = doc.data();
      console.log(`\n🏢 Lieu: ${lieu.nom} (ID: ${doc.id})`);
      
      // Afficher tous les champs qui pourraient contenir des contacts
      const possibleContactFields = [
        'contactIds',
        'contactId',
        'contacts',
        'contact',
        'programmateurs',
        'programmateurIds'
      ];
      
      for (const field of possibleContactFields) {
        if (lieu[field] !== undefined) {
          console.log(`  - ${field}: ${JSON.stringify(lieu[field])}`);
        }
      }
      
      // Vérifier les contacts liés via relations bidirectionnelles
      const contactsSnapshot = await db.collection('contacts')
        .where('lieuxIds', 'array-contains', doc.id)
        .get();
        
      if (!contactsSnapshot.empty) {
        console.log(`  - Contacts liés (via lieuxIds): ${contactsSnapshot.size}`);
        contactsSnapshot.forEach(contactDoc => {
          const contact = contactDoc.data();
          console.log(`    • ${contact.nom} (ID: ${contactDoc.id})`);
        });
      }
    }
    
    console.log('\n\n📊 Analyse inverse - Contacts avec lieuxIds:');
    const contactsWithLieux = await db.collection('contacts')
      .where('lieuxIds', '!=', null)
      .limit(10)
      .get();
      
    console.log(`\n👥 ${contactsWithLieux.size} contacts avec lieux trouvés`);
    
    for (const doc of contactsWithLieux.docs) {
      const contact = doc.data();
      console.log(`\n👤 Contact: ${contact.nom} (ID: ${doc.id})`);
      console.log(`  - lieuxIds: ${JSON.stringify(contact.lieuxIds)}`);
      
      // Vérifier que les lieux référencés ont bien ce contact
      if (contact.lieuxIds && contact.lieuxIds.length > 0) {
        for (const lieuId of contact.lieuxIds) {
          const lieuDoc = await db.collection('lieux').doc(lieuId).get();
          if (lieuDoc.exists) {
            const lieu = lieuDoc.data();
            console.log(`  - Lieu ${lieu.nom}: contactIds = ${JSON.stringify(lieu.contactIds || [])}`);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
  
  process.exit(0);
}

analyzerLieuContacts();