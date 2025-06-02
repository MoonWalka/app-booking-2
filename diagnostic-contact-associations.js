#!/usr/bin/env node

/**
 * Script de diagnostic pour vérifier les associations des contacts (programmateurs)
 * Analyse la structure des données pour identifier pourquoi les lieux et structures ne s'affichent pas
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

// Configuration Firebase (récupérée du projet)
const firebaseConfig = {
  // Configuration sera injectée depuis les variables d'environnement ou config
  // Pour le diagnostic, on utilise l'émulateur si disponible
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function diagnosticContactAssociations() {
  console.log('🔍 DIAGNOSTIC DES ASSOCIATIONS CONTACTS (PROGRAMMATEURS)');
  console.log('=' .repeat(60));

  try {
    // 1. Récupérer quelques contacts pour analyse
    console.log('\n📋 Récupération des contacts...');
    const programmateurSnapshot = await getDocs(collection(db, 'programmateurs'));
    const programmateurs = programmateurSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Nombre de contacts trouvés: ${programmateurs.length}`);

    if (programmateurs.length === 0) {
      console.log('❌ Aucun contact trouvé dans la base de données');
      return;
    }

    // Analyser les 3 premiers contacts
    const contactsToAnalyze = programmateurs.slice(0, 3);

    for (const contact of contactsToAnalyze) {
      console.log('\n' + '='.repeat(40));
      console.log(`📝 ANALYSE DU CONTACT: ${contact.contact?.nom || contact.nom || 'Sans nom'} (ID: ${contact.id})`);
      console.log('='.repeat(40));

      // Structure des données du contact
      console.log('\n📊 Structure des données:');
      console.log('- Contact info:', !!contact.contact);
      console.log('- Structure info:', !!contact.structure);
      console.log('- structureId:', contact.structureId || 'NON DÉFINI');
      console.log('- lieuxIds:', contact.lieuxIds || 'NON DÉFINI');
      console.log('- lieuxAssocies:', contact.lieuxAssocies || 'NON DÉFINI');
      console.log('- concertsIds:', contact.concertsIds || 'NON DÉFINI');

      // Vérifier la structure associée
      if (contact.structureId) {
        console.log('\n🏢 Vérification de la structure associée...');
        try {
          const structureDoc = await getDoc(doc(db, 'structures', contact.structureId));
          if (structureDoc.exists()) {
            const structureData = structureDoc.data();
            console.log('✅ Structure trouvée:', {
              nom: structureData.raisonSociale || structureData.nom,
              type: structureData.type,
              ville: structureData.ville
            });
          } else {
            console.log(`❌ Structure ${contact.structureId} introuvable`);
          }
        } catch (error) {
          console.log(`❌ Erreur lors de la récupération de la structure: ${error.message}`);
        }
      } else {
        console.log('⚠️ Aucune structure associée (structureId manquant)');
      }

      // Vérifier les lieux associés
      console.log('\n🗺️ Vérification des lieux associés...');
      
      // Méthode 1: Via lieuxIds
      if (contact.lieuxIds && contact.lieuxIds.length > 0) {
        console.log(`Recherche via lieuxIds (${contact.lieuxIds.length} IDs)...`);
        for (const lieuId of contact.lieuxIds) {
          try {
            const id = typeof lieuId === 'object' ? lieuId.id : lieuId;
            const lieuDoc = await getDoc(doc(db, 'lieux', id));
            if (lieuDoc.exists()) {
              const lieuData = lieuDoc.data();
              console.log(`✅ Lieu trouvé: ${lieuData.nom} (${lieuData.ville || 'sans ville'})`);
            } else {
              console.log(`❌ Lieu ${id} introuvable`);
            }
          } catch (error) {
            console.log(`❌ Erreur lieu ${lieuId}: ${error.message}`);
          }
        }
      } else {
        console.log('Aucun lieuxIds défini, recherche par référence inverse...');
        
        // Méthode 2: Référence inverse - programmateurs dans lieux
        const { query, where } = require('firebase/firestore');
        try {
          const lieuxQuery = query(
            collection(db, 'lieux'),
            where('programmateurId', '==', contact.id)
          );
          const lieuxSnapshot = await getDocs(lieuxQuery);
          const lieuxAssocies = lieuxSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          if (lieuxAssocies.length > 0) {
            console.log(`✅ ${lieuxAssocies.length} lieux trouvés par référence inverse:`);
            lieuxAssocies.forEach(lieu => {
              console.log(`  - ${lieu.nom} (${lieu.ville || 'sans ville'})`);
            });
          } else {
            console.log('❌ Aucun lieu trouvé par référence inverse');
          }
        } catch (error) {
          console.log(`❌ Erreur recherche lieux: ${error.message}`);
        }
      }

      // Vérifier les concerts associés
      console.log('\n🎵 Vérification des concerts associés...');
      try {
        const { query, where } = require('firebase/firestore');
        const concertsQuery = query(
          collection(db, 'concerts'),
          where('programmateurId', '==', contact.id)
        );
        const concertsSnapshot = await getDocs(concertsQuery);
        const concertsAssocies = concertsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        if (concertsAssocies.length > 0) {
          console.log(`✅ ${concertsAssocies.length} concerts trouvés:`);
          concertsAssocies.forEach(concert => {
            console.log(`  - ${concert.titre || 'Sans titre'} (${concert.date || 'sans date'})`);
          });
        } else {
          console.log('❌ Aucun concert associé');
        }
      } catch (error) {
        console.log(`❌ Erreur recherche concerts: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎯 RÉSUMÉ DU DIAGNOSTIC');
    console.log('='.repeat(60));
    console.log(`Contacts analysés: ${contactsToAnalyze.length}`);
    console.log('Vérifiez les logs ci-dessus pour identifier les problèmes:');
    console.log('- Structures manquantes ou IDs incorrects');
    console.log('- Lieux non référencés ou références cassées');
    console.log('- Concerts sans associations');

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  }
}

// Exécuter le diagnostic si appelé directement
if (require.main === module) {
  diagnosticContactAssociations()
    .then(() => {
      console.log('\n✅ Diagnostic terminé');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { diagnosticContactAssociations };