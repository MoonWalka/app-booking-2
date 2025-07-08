#!/usr/bin/env node

const admin = require('firebase-admin');
const path = require('path');
const { exit } = require('process');

// Configuration Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

// ID de la structure à vérifier
const STRUCTURE_ID = 'structure_1750614430892_trixam2ig';

// Initialiser Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    console.log('✅ Firebase Admin initialisé avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de Firebase Admin:', error.message);
    console.error('Assurez-vous que le fichier de clé de service existe:', serviceAccountPath);
    exit(1);
  }
}

const db = admin.firestore();

// Fonction pour formater la date
function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  if (timestamp._seconds) {
    return new Date(timestamp._seconds * 1000).toLocaleString('fr-FR');
  }
  if (timestamp instanceof Date) {
    return timestamp.toLocaleString('fr-FR');
  }
  return timestamp.toString();
}

// Fonction pour afficher les informations d'un document
function displayDocumentInfo(doc, collection) {
  console.log(`\n📄 Document trouvé dans ${collection}:`);
  console.log(`   ID: ${doc.id}`);
  
  const data = doc.data();
  console.log(`   Type: ${data.type || 'Non spécifié'}`);
  console.log(`   Nom: ${data.nom || 'Non spécifié'}`);
  console.log(`   Email: ${data.email || 'Non spécifié'}`);
  console.log(`   Téléphone: ${data.telephone || 'Non spécifié'}`);
  console.log(`   OrganizationId: ${data.organizationId || 'Non spécifié'}`);
  console.log(`   Date de création: ${formatDate(data.createdAt)}`);
  console.log(`   Dernière modification: ${formatDate(data.updatedAt)}`);
  
  // Afficher les adresses si présentes
  if (data.adresse) {
    console.log(`   Adresse principale: ${data.adresse}`);
  }
  if (data.adresseFacturation) {
    console.log(`   Adresse facturation: ${data.adresseFacturation}`);
  }
  
  // Afficher les infos entreprise si présentes
  if (data.siret) {
    console.log(`   SIRET: ${data.siret}`);
  }
  if (data.numeroIntracommunautaire) {
    console.log(`   N° Intracommunautaire: ${data.numeroIntracommunautaire}`);
  }
  
  // Afficher les relations si présentes
  if (data.personnes && data.personnes.length > 0) {
    console.log(`   Personnes liées: ${data.personnes.length}`);
    data.personnes.forEach((p, i) => {
      console.log(`     - ${i + 1}: ${p.id || p}`);
    });
  }
  
  return data;
}

// Fonction principale de vérification
async function checkStructureMigrationStatus() {
  console.log('🔍 Début de la vérification de l\'état de migration');
  console.log(`📌 Structure ID: ${STRUCTURE_ID}`);
  console.log('═'.repeat(60));

  const report = {
    structureId: STRUCTURE_ID,
    existsInContactsUnified: false,
    existsInStructures: false,
    liaisons: [],
    migrationStatus: 'NOT_MIGRATED',
    recommendations: []
  };

  try {
    // 1. Vérifier dans contacts_unified
    console.log('\n1️⃣ Vérification dans la collection "contacts_unified"...');
    const unifiedDoc = await db.collection('contacts_unified').doc(STRUCTURE_ID).get();
    
    if (unifiedDoc.exists) {
      report.existsInContactsUnified = true;
      report.unifiedData = displayDocumentInfo(unifiedDoc, 'contacts_unified');
    } else {
      console.log('   ❌ Document non trouvé dans contacts_unified');
    }

    // 2. Vérifier dans structures
    console.log('\n2️⃣ Vérification dans la collection "structures"...');
    const structureDoc = await db.collection('structures').doc(STRUCTURE_ID).get();
    
    if (structureDoc.exists) {
      report.existsInStructures = true;
      report.structureData = displayDocumentInfo(structureDoc, 'structures');
    } else {
      console.log('   ❌ Document non trouvé dans structures');
    }

    // 3. Rechercher les liaisons (contacts qui référencent cette structure)
    console.log('\n3️⃣ Recherche des liaisons avec d\'autres entités...');
    
    // Rechercher dans contacts_unified
    console.log('   Recherche dans contacts_unified...');
    const contactsQuery = await db.collection('contacts_unified')
      .where('structures', 'array-contains', STRUCTURE_ID)
      .get();
    
    if (!contactsQuery.empty) {
      console.log(`   ✅ ${contactsQuery.size} contact(s) lié(s) trouvé(s):`);
      contactsQuery.forEach(doc => {
        const data = doc.data();
        console.log(`     - ${doc.id}: ${data.nom || 'Sans nom'} (${data.type || 'Type inconnu'})`);
        report.liaisons.push({
          collection: 'contacts_unified',
          documentId: doc.id,
          nom: data.nom,
          type: data.type
        });
      });
    } else {
      console.log('   Aucun contact lié trouvé dans contacts_unified');
    }

    // Rechercher dans contacts (ancienne collection)
    console.log('   Recherche dans contacts (ancienne collection)...');
    const oldContactsQuery = await db.collection('contacts')
      .where('structures', 'array-contains', STRUCTURE_ID)
      .get();
    
    if (!oldContactsQuery.empty) {
      console.log(`   ✅ ${oldContactsQuery.size} contact(s) lié(s) trouvé(s) dans l'ancienne collection:`);
      oldContactsQuery.forEach(doc => {
        const data = doc.data();
        console.log(`     - ${doc.id}: ${data.nom || 'Sans nom'} (${data.type || 'Type inconnu'})`);
        report.liaisons.push({
          collection: 'contacts',
          documentId: doc.id,
          nom: data.nom,
          type: data.type
        });
      });
    } else {
      console.log('   Aucun contact lié trouvé dans contacts');
    }

    // Rechercher dans personnes
    console.log('   Recherche dans personnes...');
    const personnesQuery = await db.collection('personnes')
      .where('structures', 'array-contains', STRUCTURE_ID)
      .get();
    
    if (!personnesQuery.empty) {
      console.log(`   ✅ ${personnesQuery.size} personne(s) liée(s) trouvée(s):`);
      personnesQuery.forEach(doc => {
        const data = doc.data();
        console.log(`     - ${doc.id}: ${data.nom || 'Sans nom'}`);
        report.liaisons.push({
          collection: 'personnes',
          documentId: doc.id,
          nom: data.nom,
          type: 'personne'
        });
      });
    } else {
      console.log('   Aucune personne liée trouvée');
    }

    // 4. Déterminer le statut de migration
    console.log('\n4️⃣ Analyse du statut de migration...');
    
    if (report.existsInStructures && !report.existsInContactsUnified) {
      report.migrationStatus = 'MIGRATED';
      console.log('   ✅ Structure complètement migrée vers la nouvelle collection');
    } else if (report.existsInStructures && report.existsInContactsUnified) {
      report.migrationStatus = 'DUPLICATED';
      console.log('   ⚠️  Structure existe dans les deux collections (duplication)');
      report.recommendations.push('Supprimer le document de contacts_unified');
      report.recommendations.push('Vérifier que toutes les références pointent vers la collection structures');
    } else if (!report.existsInStructures && report.existsInContactsUnified) {
      report.migrationStatus = 'NOT_MIGRATED';
      console.log('   ❌ Structure non migrée (existe seulement dans contacts_unified)');
      report.recommendations.push('Migrer la structure vers la collection structures');
      report.recommendations.push('Mettre à jour toutes les références');
    } else {
      report.migrationStatus = 'NOT_FOUND';
      console.log('   ❌ Structure introuvable dans les deux collections');
      report.recommendations.push('Vérifier l\'ID de la structure');
      report.recommendations.push('La structure a peut-être été supprimée');
    }

    // 5. Afficher le rapport final
    console.log('\n' + '═'.repeat(60));
    console.log('📊 RAPPORT FINAL');
    console.log('═'.repeat(60));
    console.log(`Structure ID: ${report.structureId}`);
    console.log(`Statut de migration: ${report.migrationStatus}`);
    console.log(`Existe dans contacts_unified: ${report.existsInContactsUnified ? '✅' : '❌'}`);
    console.log(`Existe dans structures: ${report.existsInStructures ? '✅' : '❌'}`);
    console.log(`Nombre de liaisons trouvées: ${report.liaisons.length}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommandations:');
      report.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
    }

    // Sauvegarder le rapport
    const reportPath = path.join(__dirname, `migration-status-${STRUCTURE_ID}-${Date.now()}.json`);
    const fs = require('fs');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📁 Rapport détaillé sauvegardé dans: ${reportPath}`);

  } catch (error) {
    console.error('\n❌ Erreur lors de la vérification:', error);
    report.error = error.message;
  }

  console.log('\n✅ Vérification terminée');
  process.exit(0);
}

// Exécuter la vérification
checkStructureMigrationStatus();