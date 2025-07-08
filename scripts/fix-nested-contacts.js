#!/usr/bin/env node

/**
 * Script pour corriger la structure imbriquée des contacts dans Firebase
 * 
 * Corrige les contacts qui ont été sauvegardés avec une structure imbriquée :
 * {
 *   contact: { nom, prenom, email... },
 *   structure: { ... },
 *   entrepriseId: "..."
 * }
 * 
 * Vers une structure aplatie :
 * {
 *   nom: "...",
 *   prenom: "...",
 *   email: "...",
 *   entrepriseId: "..."
 * }
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialiser Firebase Admin
const serviceAccount = require(path.join(__dirname, '../serviceAccount.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixNestedContacts() {
  console.log('🔍 Recherche des contacts avec structure imbriquée...');
  
  try {
    const contactsRef = db.collection('contacts');
    const snapshot = await contactsRef.get();
    
    let totalContacts = 0;
    let nestedContacts = 0;
    let fixedContacts = 0;
    let errors = 0;
    
    for (const doc of snapshot.docs) {
      totalContacts++;
      const data = doc.data();
      
      // Vérifier si le contact a une structure imbriquée
      if (data.contact && typeof data.contact === 'object') {
        nestedContacts++;
        console.log(`\n📋 Contact trouvé avec structure imbriquée: ${doc.id}`);
        console.log('  Structure actuelle:', JSON.stringify(data, null, 2));
        
        try {
          // Créer la nouvelle structure aplatie
          const flattenedData = {
            // Extraire les champs du contact au niveau racine
            nom: data.contact.nom || '',
            prenom: data.contact.prenom || '',
            fonction: data.contact.fonction || '',
            email: data.contact.email || '',
            telephone: data.contact.telephone || '',
            
            // Conserver les informations de structure
            structureId: data.structureId || '',
            structureNom: data.structureNom || data.structure?.raisonSociale || '',
            
            // Conserver les autres champs existants
            entrepriseId: data.entrepriseId,
            concertsAssocies: data.concertsAssocies || [],
            createdAt: data.createdAt,
            updatedAt: data.updatedAt || new Date()
          };
          
          // Si une structure était imbriquée et qu'il n'y a pas de structureId, conserver les infos
          if (!data.structureId && data.structure && typeof data.structure === 'object') {
            flattenedData.structureInfo = {
              raisonSociale: data.structure.raisonSociale || '',
              type: data.structure.type || '',
              adresse: data.structure.adresse || '',
              codePostal: data.structure.codePostal || '',
              ville: data.structure.ville || '',
              pays: data.structure.pays || 'France',
              siret: data.structure.siret || '',
              tva: data.structure.tva || ''
            };
          }
          
          // Ajouter d'autres champs existants qui ne sont pas dans les objets imbriqués
          const fieldsToPreserve = ['notes', 'adresse', 'ville', 'codePostal', 'pays'];
          fieldsToPreserve.forEach(field => {
            if (data[field] !== undefined && flattenedData[field] === undefined) {
              flattenedData[field] = data[field];
            }
          });
          
          console.log('  ✅ Nouvelle structure:', JSON.stringify(flattenedData, null, 2));
          
          // Mettre à jour le document
          await doc.ref.update(flattenedData);
          
          // Supprimer les champs imbriqués
          await doc.ref.update({
            contact: admin.firestore.FieldValue.delete(),
            structure: admin.firestore.FieldValue.delete()
          });
          
          fixedContacts++;
          console.log(`  ✨ Contact ${doc.id} corrigé avec succès`);
          
        } catch (error) {
          errors++;
          console.error(`  ❌ Erreur lors de la correction du contact ${doc.id}:`, error);
        }
      }
    }
    
    console.log('\n📊 Résumé de la migration:');
    console.log(`  - Total des contacts: ${totalContacts}`);
    console.log(`  - Contacts avec structure imbriquée: ${nestedContacts}`);
    console.log(`  - Contacts corrigés: ${fixedContacts}`);
    console.log(`  - Erreurs: ${errors}`);
    
    if (fixedContacts > 0) {
      console.log('\n✅ Migration terminée avec succès!');
    } else {
      console.log('\n✨ Aucun contact à migrer.');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Exécuter la migration
fixNestedContacts();