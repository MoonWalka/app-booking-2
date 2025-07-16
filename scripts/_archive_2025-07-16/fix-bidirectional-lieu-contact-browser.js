/**
 * Script à exécuter dans la console du navigateur pour corriger les relations bidirectionnelles
 * Copier-coller ce code dans la console après s'être connecté à l'application
 */

async function fixBidirectionalLieuContact() {
  try {
    // Récupérer Firebase depuis l'app
    const { db } = await import('/src/services/firebase-service.js');
    const { collection, query, where, getDocs, doc, updateDoc, arrayUnion } = await import('firebase/firestore');
    
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
            // Vérifier si le contact existe
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
                  contactNom: contactData.nom || 'Sans nom',
                  lieuNom: lieu.nom
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
        console.log(`   - Contact "${update.contactNom}" (${update.contactId}) → Lieu "${update.lieuNom}" (${update.lieuId})`);
      });
    }
    
    return { updatedCount, updates };
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  }
}

// Exécuter directement
fixBidirectionalLieuContact();