#!/usr/bin/env node

const admin = require('firebase-admin');

// Initialiser Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'tourcraft-d7a3e',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkLieuContactRelation() {
  try {
    console.log('🔍 Recherche du contact "contact depuis lieu"...\n');
    
    // Chercher le contact
    const contactsSnapshot = await db.collection('contacts')
      .where('nom', '==', 'contact depuis lieu')
      .limit(1)
      .get();
      
    if (contactsSnapshot.empty) {
      console.log('❌ Contact "contact depuis lieu" non trouvé');
      return;
    }
    
    const contact = contactsSnapshot.docs[0];
    const contactData = contact.data();
    console.log('✅ Contact trouvé:', contact.id);
    console.log('   - lieuxIds:', contactData.lieuxIds || 'NON DÉFINI');
    console.log('   - lieuxAssocies:', contactData.lieuxAssocies || 'NON DÉFINI');
    console.log('   - entrepriseId:', contactData.entrepriseId);
    
    // Chercher les lieux qui référencent ce contact
    console.log('\n🔍 Recherche des lieux qui référencent ce contact...\n');
    
    // Via contactsIds
    const lieuxWithContactsIds = await db.collection('lieux')
      .where('contactsIds', 'array-contains', contact.id)
      .get();
      
    console.log(`📍 Lieux avec contactsIds contenant ${contact.id}: ${lieuxWithContactsIds.size}`);
    
    lieuxWithContactsIds.forEach(doc => {
      const lieu = doc.data();
      console.log(`   - ${doc.id}: ${lieu.nom}`);
      console.log(`     contactsIds: ${JSON.stringify(lieu.contactsIds)}`);
    });
    
    // Via contactId direct
    const lieuxWithContactId = await db.collection('lieux')
      .where('contactId', '==', contact.id)
      .get();
      
    console.log(`\n📍 Lieux avec contactId = ${contact.id}: ${lieuxWithContactId.size}`);
    
    lieuxWithContactId.forEach(doc => {
      const lieu = doc.data();
      console.log(`   - ${doc.id}: ${lieu.nom}`);
    });
    
    // Afficher les lieux récents pour vérifier
    console.log('\n🔍 Lieux créés récemment (pour vérification):\n');
    
    const recentLieux = await db.collection('lieux')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();
      
    recentLieux.forEach(doc => {
      const lieu = doc.data();
      console.log(`📍 ${doc.id}: ${lieu.nom}`);
      console.log(`   - contactsIds: ${JSON.stringify(lieu.contactsIds || [])}`);
      console.log(`   - contactId: ${lieu.contactId || 'NON DÉFINI'}`);
      console.log(`   - entrepriseId: ${lieu.entrepriseId}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await admin.app().delete();
  }
}

checkLieuContactRelation();