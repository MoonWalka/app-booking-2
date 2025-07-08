/**
 * Script de migration pour convertir les concerts avec un seul contact
 * vers le nouveau système de contacts avec rôles
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialiser Firebase Admin
const serviceAccount = require(path.join(__dirname, '../../service-account-key.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateConcerts() {
  console.log('🚀 Début de la migration des concerts vers contacts avec rôles...');
  
  let totalConcerts = 0;
  let migratedConcerts = 0;
  let skippedConcerts = 0;
  let errors = 0;

  try {
    // Récupérer tous les concerts
    const concertsSnapshot = await db.collection('concerts').get();
    totalConcerts = concertsSnapshot.size;
    
    console.log(`📊 ${totalConcerts} concerts trouvés`);

    // Traiter chaque concert
    for (const concertDoc of concertsSnapshot.docs) {
      const concertId = concertDoc.id;
      const concertData = concertDoc.data();
      
      try {
        // Vérifier si le concert a déjà été migré
        if (concertData.contactsWithRoles && Array.isArray(concertData.contactsWithRoles)) {
          console.log(`⏭️  Concert ${concertId} déjà migré`);
          skippedConcerts++;
          continue;
        }
        
        // Si le concert a un contactId, le migrer
        if (concertData.contactId) {
          const contactsWithRoles = [{
            contactId: concertData.contactId,
            role: 'coordinateur',
            isPrincipal: true,
            addedAt: admin.firestore.FieldValue.serverTimestamp()
          }];
          
          // Mettre à jour le concert
          await db.collection('concerts').doc(concertId).update({
            contactsWithRoles: contactsWithRoles,
            // Garder contactId pour compatibilité temporaire
            // contactId: admin.firestore.FieldValue.delete() // Décommenter pour supprimer
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            _migrated: true,
            _migrationDate: new Date().toISOString()
          });
          
          console.log(`✅ Concert ${concertId} migré avec succès`);
          migratedConcerts++;
          
          // Optionnel : Mettre à jour le contact pour ajouter la relation inverse
          try {
            const contactRef = db.collection('contacts').doc(concertData.contactId);
            const contactDoc = await contactRef.get();
            
            if (contactDoc.exists) {
              const contactData = contactDoc.data();
              const concertsIds = contactData.concertsIds || [];
              
              if (!concertsIds.includes(concertId)) {
                await contactRef.update({
                  concertsIds: [...concertsIds, concertId],
                  updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log(`  ↔️  Relation bidirectionnelle mise à jour pour contact ${concertData.contactId}`);
              }
            }
          } catch (err) {
            console.warn(`  ⚠️  Impossible de mettre à jour la relation inverse:`, err.message);
          }
          
        } else {
          console.log(`⏭️  Concert ${concertId} n'a pas de contact`);
          skippedConcerts++;
        }
        
      } catch (error) {
        console.error(`❌ Erreur migration concert ${concertId}:`, error);
        errors++;
      }
    }
    
    // Résumé
    console.log('\n📊 Résumé de la migration:');
    console.log(`- Total concerts: ${totalConcerts}`);
    console.log(`- Concerts migrés: ${migratedConcerts}`);
    console.log(`- Concerts ignorés: ${skippedConcerts}`);
    console.log(`- Erreurs: ${errors}`);
    
    if (errors === 0) {
      console.log('\n✅ Migration terminée avec succès!');
    } else {
      console.log('\n⚠️  Migration terminée avec des erreurs');
    }
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Fonction pour ajouter un contact signataire depuis les données du formulaire public
async function addSignataireToExistingConcerts() {
  console.log('\n🔍 Recherche des concerts avec données de formulaire public...');
  
  try {
    // Rechercher les concerts qui ont des données de formulaire
    const concertsWithForm = await db.collection('concerts')
      .where('hasFormData', '==', true)
      .get();
    
    console.log(`📊 ${concertsWithForm.size} concerts avec formulaire trouvés`);
    
    for (const concertDoc of concertsWithForm.docs) {
      const concertId = concertDoc.id;
      const concertData = concertDoc.data();
      
      // Vérifier s'il y a des données de signataire dans le formulaire
      if (concertData.formData?.signataireData) {
        const signataireData = concertData.formData.signataireData;
        
        console.log(`\n👤 Traitement du signataire pour concert ${concertId}`);
        console.log(`   Nom: ${signataireData.prenom} ${signataireData.nom}`);
        
        // Créer le contact signataire
        const newContactRef = await db.collection('contacts').add({
          nom: `${signataireData.prenom} ${signataireData.nom}`,
          prenom: signataireData.prenom,
          nomLowercase: `${signataireData.prenom} ${signataireData.nom}`.toLowerCase(),
          email: signataireData.email || '',
          telephone: signataireData.telephone || '',
          fonction: signataireData.fonction || '',
          entrepriseId: concertData.entrepriseId,
          concertsIds: [concertId],
          lieuxIds: [],
          structureId: '',
          isFromPublicForm: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Ajouter le signataire aux contacts du concert
        const contactsWithRoles = concertData.contactsWithRoles || [];
        contactsWithRoles.push({
          contactId: newContactRef.id,
          role: 'signataire',
          isPrincipal: false,
          addedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        await db.collection('concerts').doc(concertId).update({
          contactsWithRoles: contactsWithRoles,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`   ✅ Signataire ajouté avec succès (${newContactRef.id})`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur ajout signataires:', error);
  }
}

// Menu principal
async function main() {
  console.log('🎯 Migration des concerts vers le système de contacts avec rôles\n');
  console.log('Que voulez-vous faire ?');
  console.log('1. Migrer tous les concerts (contactId → contactsWithRoles)');
  console.log('2. Ajouter les signataires depuis les formulaires publics');
  console.log('3. Les deux opérations');
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('\nVotre choix (1-3): ', async (answer) => {
    readline.close();
    
    switch(answer) {
      case '1':
        await migrateConcerts();
        break;
      case '2':
        await addSignataireToExistingConcerts();
        break;
      case '3':
        await migrateConcerts();
        await addSignataireToExistingConcerts();
        break;
      default:
        console.log('Choix invalide');
        process.exit(1);
    }
  });
}

// Lancer le script
main();