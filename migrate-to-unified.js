#!/usr/bin/env node

/**
 * Script de Migration vers Architecture Unifiée
 * 
 * Consolide les collections séparées en documents unifiés:
 * - contacts (6 personnes) + structures (6 structures) 
 * → contacts_unified (3-4 documents structure+personnes)
 * 
 * Date: 18 juin 2025
 * Compatibilité: Architecture Business-centrée + XLS naturel
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  query, 
  where,
  serverTimestamp 
} = require('firebase/firestore');

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD2nrKWoEBvEbjbopk26rrGbCYZDNpJ8BU",
  authDomain: "app-booking-26571.firebaseapp.com", 
  projectId: "app-booking-26571",
  storageBucket: "app-booking-26571.firebasestorage.app",
  messagingSenderId: "985724562753",
  appId: "1:985724562753:web:253b7e7c678318b69a85c0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Charge toutes les données actuelles
 */
async function loadCurrentData() {
  console.log('📊 Chargement des données actuelles...');
  
  // Charger contacts
  const contactsSnapshot = await getDocs(collection(db, 'contacts'));
  const contacts = contactsSnapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  }));
  
  // Charger structures
  const structuresSnapshot = await getDocs(collection(db, 'structures'));
  const structures = structuresSnapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  }));
  
  console.log(`   Contacts trouvés: ${contacts.length}`);
  console.log(`   Structures trouvées: ${structures.length}`);
  
  return { contacts, structures };
}

/**
 * Groupe les contacts par structure
 */
function groupContactsByStructure(contacts, structures) {
  console.log('🔗 Groupement des contacts par structure...');
  
  const groups = [];
  const processedContacts = new Set();
  
  // Grouper les contacts avec structure
  structures.forEach(structure => {
    const relatedContacts = contacts.filter(contact => 
      contact.structureId === structure.id
    );
    
    // Inclure toutes les structures, même sans contacts
    groups.push({
      type: 'structure',
      structure: structure,
      contacts: relatedContacts
    });
    
    // Marquer les contacts comme traités
    relatedContacts.forEach(contact => {
      processedContacts.add(contact.id);
    });
    
    if (relatedContacts.length === 0) {
      console.log(`   ℹ️ Structure sans contact: ${structure.raisonSociale || structure.id} (sera incluse)`);
    }
  });
  
  // Contacts libres (sans structure)
  const freeContacts = contacts.filter(contact => 
    !processedContacts.has(contact.id)
  );
  
  if (freeContacts.length > 0) {
    groups.push({
      type: 'personnes_libres',
      structure: null,
      contacts: freeContacts
    });
  }
  
  console.log(`   Groupes créés: ${groups.length}`);
  console.log(`   - Avec structure: ${groups.filter(g => g.type === 'structure').length}`);
  console.log(`   - Personnes libres: ${freeContacts.length}`);
  
  return groups;
}

/**
 * Convertit un contact en objet personne unifié
 */
function mapContactToPersonne(contact) {
  return {
    civilite: contact.civilite || "",
    prenom: contact.prenom || "",
    nom: contact.nom || "",
    fonction: contact.fonction || "",
    
    // Emails
    email: contact.email || "",
    mailDirect: contact.mailDirect || "",
    mailPerso: contact.mailPerso || "",
    
    // Téléphones
    telephone: contact.telephone || "",
    telDirect: contact.telDirect || "",
    telPerso: contact.telPerso || "",
    mobile: contact.mobile || "",
    fax: contact.fax || "",
    
    // Adresse (si différente de structure)
    adresse: contact.adresse || "",
    suiteAdresse: contact.suiteAdresse || "",
    codePostal: contact.codePostal || "",
    ville: contact.ville || "",
    departement: contact.departement || "",
    region: contact.region || "",
    pays: contact.pays || "France",
    
    // Commentaires
    commentaires1: contact.commentaires1 || "",
    commentaires2: contact.commentaires2 || "",
    commentaires3: contact.commentaires3 || "",
    
    // Diffusion
    diffusionCommentaires1: contact.diffusionCommentaires1 || "",
    diffusionCommentaires2: contact.diffusionCommentaires2 || "",
    diffusionCommentaires3: contact.diffusionCommentaires3 || ""
  };
}

/**
 * Convertit une structure en objet structure unifié
 */
function mapStructureToUnified(structure) {
  return {
    raisonSociale: structure.raisonSociale || "",
    nom: structure.nom || structure.raisonSociale || "",
    
    // Adresse
    adresse: structure.adresse || "",
    suiteAdresse: structure.suiteAdresse1 || "",
    codePostal: structure.codePostal || "",
    ville: structure.ville || "",
    departement: structure.departement || "",
    region: structure.region || "",
    pays: structure.pays || "France",
    
    // Contact
    email: structure.email || "",
    telephone1: structure.telephone1 || "",
    telephone2: structure.telephone2 || "",
    mobile: structure.mobile || "",
    fax: structure.fax || "",
    siteWeb: structure.siteWeb || "",
    
    // Données légales
    siret: structure.siret || "",
    tva: structure.tva || "",
    numeroIntracommunautaire: structure.numeroIntracommunautaire || "",
    type: structure.type || "",
    
    // Commentaires
    commentaires1: structure.commentaires1 || "",
    commentaires2: structure.commentaires2 || "",
    commentaires3: structure.commentaires3 || "",
    commentaires4: structure.commentaires4 || "",
    commentaires5: structure.commentaires5 || "",
    commentaires6: structure.commentaires6 || "",
    
    // Événement
    nomFestival: structure.nomFestival || "",
    periodeFestivalMois: structure.periodeFestivalMois || "",
    periodeFestivalComplete: structure.periodeFestivalComplete || "",
    
    // Salle (données complexes)
    salle: {
      nom: structure.salleNom || "",
      adresse: structure.salleAdresse || "",
      codePostal: structure.salleCodePostal || "",
      ville: structure.salleVille || "",
      departement: structure.salleDepartement || "",
      region: structure.salleRegion || "",
      pays: structure.sallePays || "France",
      telephone: structure.salleTelephone || "",
      jauge1: structure.salleJauge1 || "",
      jauge2: structure.salleJauge2 || "",
      jauge3: structure.salleJauge3 || "",
      hauteur: structure.salleHauteur || "",
      profondeur: structure.salleProfondeur || "",
      ouverture: structure.salleOuverture || ""
    }
  };
}

/**
 * Crée les documents unifiés
 */
function createUnifiedDocuments(groups) {
  console.log('📝 Création des documents unifiés...');
  
  const unifiedDocs = [];
  
  groups.forEach((group, index) => {
    if (group.type === 'structure') {
      // Document structure + personnes
      const structureData = mapStructureToUnified(group.structure);
      const personnesData = group.contacts.map(mapContactToPersonne);
      
      // Compléter avec des personnes vides pour avoir toujours 3 slots
      while (personnesData.length < 3) {
        personnesData.push({
          civilite: "", prenom: "", nom: "", fonction: "",
          email: "", telephone: "", pays: "France"
        });
      }
      
      const unifiedDoc = {
        id: `unified_structure_${group.structure.id}`,
        entityType: 'structure',
        
        // Données structure
        structure: structureData,
        
        // Personnes associées (max 3)
        personnes: personnesData,
        
        // Métadonnées système
        organizationId: group.structure.organizationId || group.contacts[0]?.organizationId || "default_org",
        statut: "actif",
        client: group.structure.client || false,
        source: "migration",
        tags: group.structure.tags || [],
        
        // Relations business (préservées)
        concertsIds: group.contacts.flatMap(c => c.concertsIds || []),
        lieuxIds: group.contacts.flatMap(c => c.lieuxIds || []),
        artistesIds: group.contacts.flatMap(c => c.artistesIds || []),
        
        // Métadonnées techniques
        createdAt: group.structure.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
        dateDerniereModif: serverTimestamp(),
        
        // Migration
        migrationVersion: "unified-v2",
        migratedFrom: {
          structureId: group.structure.id,
          contactIds: group.contacts.map(c => c.id)
        },
        migrationNote: `Unifié depuis structure ${group.structure.id} + ${group.contacts.length} contacts`,
        migrationDate: serverTimestamp()
      };
      
      unifiedDocs.push(unifiedDoc);
      
      console.log(`   ✅ Structure: ${structureData.raisonSociale} (${group.contacts.length} personnes)`);
      
    } else if (group.type === 'personnes_libres') {
      // Documents personne libre séparés
      group.contacts.forEach(contact => {
        const personneData = mapContactToPersonne(contact);
        
        const unifiedDoc = {
          id: `unified_personne_${contact.id}`,
          entityType: 'personne_libre',
          
          // Données personne
          personne: personneData,
          
          // Pas de structure
          structure: null,
          personnes: [],
          
          // Métadonnées système
          organizationId: contact.organizationId || "default_org",
          statut: contact.statut || "actif",
          client: contact.client || false,
          source: "migration",
          tags: contact.tags || [],
          
          // Relations business
          concertsIds: contact.concertsIds || [],
          lieuxIds: contact.lieuxIds || [],
          artistesIds: contact.artistesIds || [],
          
          // Métadonnées techniques
          createdAt: contact.createdAt || serverTimestamp(),
          updatedAt: serverTimestamp(),
          dateDerniereModif: serverTimestamp(),
          
          // Migration
          migrationVersion: "unified-v2",
          migratedFrom: {
            contactId: contact.id
          },
          migrationNote: `Personne libre migrée depuis contact ${contact.id}`,
          migrationDate: serverTimestamp()
        };
        
        unifiedDocs.push(unifiedDoc);
        
        console.log(`   ✅ Personne libre: ${personneData.prenom} ${personneData.nom}`);
      });
    }
  });
  
  console.log(`📋 Total documents unifiés créés: ${unifiedDocs.length}`);
  return unifiedDocs;
}

/**
 * Sauvegarde les documents unifiés
 */
async function saveUnifiedDocuments(unifiedDocs) {
  console.log('💾 Sauvegarde des documents unifiés...');
  
  for (const unifiedDoc of unifiedDocs) {
    try {
      await setDoc(doc(db, 'contacts_unified', unifiedDoc.id), unifiedDoc);
      console.log(`   ✅ Sauvegardé: ${unifiedDoc.id}`);
    } catch (error) {
      console.error(`   ❌ Erreur sauvegarde ${unifiedDoc.id}:`, error.message);
      throw error;
    }
  }
  
  console.log('✅ Tous les documents unifiés sauvegardés');
}

/**
 * Valide la migration
 */
async function validateMigration(originalData, unifiedDocs) {
  console.log('🔍 Validation de la migration...');
  
  const { contacts, structures } = originalData;
  
  console.log('\n📊 RAPPORT DE MIGRATION:');
  console.log('========================');
  
  // Compteurs originaux
  console.log(`Données originales:`);
  console.log(`   - Contacts: ${contacts.length}`);
  console.log(`   - Structures: ${structures.length}`);
  console.log(`   - Total documents: ${contacts.length + structures.length}`);
  
  // Compteurs unifiés
  const structureDocs = unifiedDocs.filter(d => d.entityType === 'structure');
  const personnesLibres = unifiedDocs.filter(d => d.entityType === 'personne_libre');
  const totalPersonnes = structureDocs.reduce((sum, doc) => {
    return sum + doc.personnes.filter(p => p.prenom && p.nom).length;
  }, 0) + personnesLibres.length;
  
  console.log(`\nDonnées unifiées:`);
  console.log(`   - Documents structure: ${structureDocs.length}`);
  console.log(`   - Documents personne libre: ${personnesLibres.length}`);
  console.log(`   - Total documents: ${unifiedDocs.length}`);
  console.log(`   - Total personnes: ${totalPersonnes}`);
  
  // Validation
  const expectedPersonnes = contacts.length;
  const expectedStructures = structures.length;
  
  console.log(`\n✅ VALIDATION:`);
  console.log(`   - Personnes conservées: ${totalPersonnes}/${expectedPersonnes} ${totalPersonnes === expectedPersonnes ? '✅' : '❌'}`);
  console.log(`   - Structures conservées: ${structureDocs.length}/${expectedStructures} ${structureDocs.length === expectedStructures ? '✅' : '❌'}`);
  console.log(`   - Compression: ${contacts.length + structures.length} → ${unifiedDocs.length} documents (-${((contacts.length + structures.length - unifiedDocs.length) / (contacts.length + structures.length) * 100).toFixed(1)}%)`);
  
  // Vérifier relations business
  const originalConcerts = contacts.flatMap(c => c.concertsIds || []);
  const unifiedConcerts = unifiedDocs.flatMap(d => d.concertsIds || []);
  console.log(`   - Relations concerts: ${unifiedConcerts.length}/${originalConcerts.length} ${unifiedConcerts.length === originalConcerts.length ? '✅' : '❌'}`);
  
  if (totalPersonnes === expectedPersonnes && structureDocs.length === expectedStructures) {
    console.log('\n🎉 MIGRATION RÉUSSIE - Toutes les données sont préservées !');
    return true;
  } else {
    console.log('\n❌ MIGRATION ÉCHOUÉE - Données manquantes !');
    return false;
  }
}

/**
 * Fonction principale de migration
 */
async function migrateToUnified() {
  console.log('🚀 MIGRATION VERS ARCHITECTURE UNIFIÉE');
  console.log('======================================\n');
  
  try {
    // 1. Charger données actuelles
    const originalData = await loadCurrentData();
    
    // 2. Grouper par structure
    const groups = groupContactsByStructure(originalData.contacts, originalData.structures);
    
    // 3. Créer documents unifiés
    const unifiedDocs = createUnifiedDocuments(groups);
    
    // 4. Sauvegarder
    await saveUnifiedDocuments(unifiedDocs);
    
    // 5. Valider
    const isValid = await validateMigration(originalData, unifiedDocs);
    
    if (isValid) {
      console.log('\n🎯 MIGRATION TERMINÉE AVEC SUCCÈS !');
      console.log('Architecture unifiée opérationnelle.');
      console.log('Prochaines étapes:');
      console.log('   1. Adapter ContactsList pour contacts_unified');
      console.log('   2. Créer les hooks useUnifiedContact');
      console.log('   3. Tester l\'interface');
    } else {
      console.log('\n⚠️ MIGRATION PARTIELLEMENT ÉCHOUÉE');
      console.log('Vérifiez les données et relancez si nécessaire.');
    }
    
  } catch (error) {
    console.error('\n💥 ERREUR FATALE:', error.message);
    console.log('Migration interrompue. Données originales préservées.');
    process.exit(1);
  }
}

// Exécution avec confirmation
async function main() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log('🚨 ATTENTION: Migration vers architecture unifiée');
  console.log('Cette opération va:');
  console.log('   - Créer une nouvelle collection contacts_unified');
  console.log('   - Consolider 6 contacts + 6 structures en documents unifiés');
  console.log('   - Préserver toutes les données et relations');
  console.log('   - Permettre import/export XLS naturel\n');
  
  const confirm = await new Promise(resolve => {
    rl.question('Confirmez-vous la migration ? (oui/non): ', answer => {
      resolve(answer.toLowerCase().trim());
    });
  });
  
  rl.close();
  
  if (confirm === 'oui' || confirm === 'o' || confirm === 'y' || confirm === 'yes') {
    await migrateToUnified();
  } else {
    console.log('❌ Migration annulée');
  }
}

// Point d'entrée
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = {
  migrateToUnified,
  loadCurrentData,
  groupContactsByStructure,
  mapContactToPersonne,
  mapStructureToUnified,
  createUnifiedDocuments
};