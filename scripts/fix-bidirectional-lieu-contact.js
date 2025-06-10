#!/usr/bin/env node

/**
 * Script pour corriger les relations bidirectionnelles lieu-contact
 * Ajoute lieuxIds aux contacts qui sont référencés par des lieux
 */

async function fixBidirectionalLieuContact() {
  try {
    // Importer Firebase côté client
    const { initializeApp } = await import('firebase/app');
    const { 
      getFirestore, 
      collection, 
      query, 
      where, 
      getDocs,
      doc,
      updateDoc,
      arrayUnion
    } = await import('firebase/firestore');
    
    // Configuration Firebase (même config que dans l'app)
    const firebaseConfig = {
      apiKey: "AIzaSyAUIvCj5BIe9hzwH1A4NDEbPiPWlWkHhkQ",
      authDomain: "tourcraft-d7a3e.firebaseapp.com",
      projectId: "tourcraft-d7a3e",
      storageBucket: "tourcraft-d7a3e.appspot.com",
      messagingSenderId: "896763006353",
      appId: "1:896763006353:web:0f2c4e1fc89d960bc19a63",
      measurementId: "G-4RGWWMQ3HK"
    };
    
    // Initialiser Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('🔍 Recherche des lieux avec contactsIds...\n');
    
    // Récupérer tous les lieux qui ont des contacts
    const lieuxSnapshot = await getDocs(collection(db, 'lieux'));
    
    let updatedCount = 0;
    const updates = [];
    
    for (const lieuDoc of lieuxSnapshot.docs) {
      const lieu = lieuDoc.data();
      
      // Si le lieu a des contactsIds
      if (lieu.contactsIds && lieu.contactsIds.length > 0) {
        console.log(`📍 Lieu "${lieu.nom}" (${lieuDoc.id}) a ${lieu.contactsIds.length} contacts`);
        
        // Pour chaque contact
        for (const contactId of lieu.contactsIds) {
          try {
            // Vérifier si le contact existe et récupérer ses données
            const contactRef = doc(db, 'contacts', contactId);
            const contactSnapshot = await getDocs(query(
              collection(db, 'contacts'),
              where('__name__', '==', contactId)
            ));
            
            if (!contactSnapshot.empty) {
              const contactData = contactSnapshot.docs[0].data();
              const currentLieuxIds = contactData.lieuxIds || [];
              
              // Si le lieu n'est pas déjà dans lieuxIds du contact
              if (!currentLieuxIds.includes(lieuDoc.id)) {
                console.log(`   ✅ Ajout du lieu ${lieuDoc.id} au contact ${contactId}`);
                
                updates.push({
                  contactId,
                  lieuId: lieuDoc.id,
                  contactNom: contactData.nom || 'Sans nom'
                });
                
                // Mettre à jour le contact
                await updateDoc(contactRef, {
                  lieuxIds: arrayUnion(lieuDoc.id)
                });
                
                updatedCount++;
              } else {
                console.log(`   ℹ️  Le contact ${contactId} a déjà ce lieu dans lieuxIds`);
              }
            } else {
              console.log(`   ⚠️  Contact ${contactId} introuvable`);
            }
          } catch (error) {
            console.error(`   ❌ Erreur pour le contact ${contactId}:`, error.message);
          }
        }
      }
    }
    
    console.log('\n📊 Résumé:');
    console.log(`✅ ${updatedCount} relations bidirectionnelles corrigées`);
    
    if (updates.length > 0) {
      console.log('\n📝 Détails des mises à jour:');
      updates.forEach(update => {
        console.log(`   - Contact "${update.contactNom}" (${update.contactId}) → Lieu ${update.lieuId}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter le script
fixBidirectionalLieuContact();