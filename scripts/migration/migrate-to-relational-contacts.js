#!/usr/bin/env node

/**
 * Script de migration : contacts_unified → nouveau modèle relationnel
 * 
 * Transforme le modèle embedded actuel vers un modèle normalisé :
 * - structures (organisations)
 * - personnes (contacts individuels)
 * - liaisons (relations N-à-N)
 * 
 * ATTENTION: Exécuter d'abord le script de setup pour créer les collections et index !
 */

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  writeBatch,
  serverTimestamp 
} = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

console.log('🚀 MIGRATION CONTACTS VERS MODÈLE RELATIONNEL');
console.log('==============================================\n');

// Statistiques globales
const stats = {
  totalProcessed: 0,
  structuresCreated: 0,
  structuresUpdated: 0,
  personnesCreated: 0,
  personnesUpdated: 0,
  liaisonsCreated: 0,
  errors: [],
  duplicates: {
    structures: new Map(), // raisonSociale -> [ids]
    personnes: new Map()   // email -> [ids]
  }
};

/**
 * Nettoyer et normaliser les données d'une structure
 */
function normalizeStructureData(structureData, entrepriseId) {
  const normalized = {
    entrepriseId,
    
    // Informations principales
    raisonSociale: (structureData.raisonSociale || '').trim(),
    type: structureData.type || 'autre',
    source: structureData.source || '',
    
    // Coordonnées
    email: structureData.email || null,
    telephone1: structureData.telephone1 || structureData.telephone || null,
    telephone2: structureData.telephone2 || null,
    fax: structureData.fax || null,
    siteWeb: structureData.siteWeb || null,
    
    // Adresse
    adresse: structureData.adresse || null,
    suiteAdresse: structureData.suiteAdresse || null,
    codePostal: structureData.codePostal || null,
    ville: structureData.ville || null,
    departement: structureData.departement || null,
    region: structureData.region || null,
    pays: structureData.pays || 'France',
    
    // Administratif
    siret: structureData.siret || null,
    codeApe: structureData.codeApe || null,
    licence: structureData.licence || null,
    tvaIntracom: structureData.tvaIntracom || null,
    
    // Réseaux sociaux
    facebook: structureData.facebook || null,
    instagram: structureData.instagram || null,
    twitter: structureData.twitter || null,
    linkedin: structureData.linkedin || null,
    youtube: structureData.youtube || null,
    
    // Qualification
    tags: structureData.tags || [],
    isClient: structureData.isClient || false,
    
    // Métadonnées
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  // Nettoyer les valeurs vides
  Object.keys(normalized).forEach(key => {
    if (normalized[key] === '' || normalized[key] === undefined) {
      normalized[key] = null;
    }
  });

  return normalized;
}

/**
 * Nettoyer et normaliser les données d'une personne
 */
function normalizePersonneData(personneData, entrepriseId, isPersonneLibre = false) {
  // Gérer le cas où nom contient prénom et nom
  let prenom = personneData.prenom || '';
  let nom = personneData.nom || personneData.nomFamille || '';
  
  if (!prenom && nom && nom.includes(' ')) {
    const parts = nom.split(' ');
    prenom = parts[0];
    nom = parts.slice(1).join(' ');
  }

  const normalized = {
    entrepriseId,
    
    // Identité
    civilite: personneData.civilite || null,
    prenom: prenom.trim(),
    nom: nom.trim(),
    
    // Emails
    email: personneData.email || personneData.mailDirect || '',
    mailDirect: personneData.mailDirect || personneData.email || null,
    mailPerso: personneData.mailPerso || null,
    
    // Téléphones
    telephone: personneData.telephone || personneData.telDirect || null,
    telDirect: personneData.telDirect || personneData.telephone || null,
    telPerso: personneData.telPerso || null,
    mobile: personneData.mobile || null,
    fax: personneData.fax || null,
    
    // Adresse
    adresse: personneData.adresse || null,
    suiteAdresse: personneData.suiteAdresse || null,
    codePostal: personneData.codePostal || null,
    ville: personneData.ville || null,
    departement: personneData.departement || null,
    region: personneData.region || null,
    pays: personneData.pays || 'France',
    
    // Qualification
    tags: personneData.tags || [],
    isPersonneLibre,
    
    // Métadonnées
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  // Nettoyer les valeurs vides
  Object.keys(normalized).forEach(key => {
    if (normalized[key] === '' || normalized[key] === undefined) {
      normalized[key] = null;
    }
  });

  return normalized;
}

/**
 * Créer les données d'une liaison
 */
function createLiaisonData(entrepriseId, structureId, personneId, personneData, isFirst = false) {
  return {
    entrepriseId,
    structureId,
    personneId,
    
    // Informations de la relation
    fonction: personneData.fonction || '',
    actif: true,
    prioritaire: isFirst, // Le premier contact devient prioritaire par défaut
    interesse: false,
    
    // Dates
    dateDebut: new Date(),
    dateFin: null,
    
    // Notes
    notes: '',
    
    // Métadonnées
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
}

/**
 * Trouver ou créer une structure
 */
async function upsertStructure(structureData, entrepriseId, userId) {
  try {
    const normalizedData = normalizeStructureData(structureData, entrepriseId);
    
    if (!normalizedData.raisonSociale) {
      throw new Error('Raison sociale manquante');
    }

    // Chercher une structure existante
    const existingQuery = query(
      collection(db, 'structures'),
      where('entrepriseId', '==', entrepriseId),
      where('raisonSociale', '==', normalizedData.raisonSociale)
    );
    
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      // Structure existe déjà
      const existingDoc = existingSnapshot.docs[0];
      stats.structuresUpdated++;
      
      // Détecter les doublons potentiels
      if (existingSnapshot.size > 1) {
        const key = `${entrepriseId}:${normalizedData.raisonSociale}`;
        if (!stats.duplicates.structures.has(key)) {
          stats.duplicates.structures.set(key, []);
        }
        stats.duplicates.structures.get(key).push(...existingSnapshot.docs.map(d => d.id));
      }
      
      return existingDoc.id;
    }

    // Créer une nouvelle structure
    const batch = writeBatch(db);
    const structureRef = doc(collection(db, 'structures'));
    
    batch.set(structureRef, {
      ...normalizedData,
      createdBy: userId,
      updatedBy: userId
    });
    
    await batch.commit();
    stats.structuresCreated++;
    
    return structureRef.id;
  } catch (error) {
    stats.errors.push({
      type: 'structure',
      data: structureData,
      error: error.message
    });
    throw error;
  }
}

/**
 * Trouver ou créer une personne
 */
async function upsertPersonne(personneData, entrepriseId, userId, isPersonneLibre = false) {
  try {
    const normalizedData = normalizePersonneData(personneData, entrepriseId, isPersonneLibre);
    
    if (!normalizedData.email || !normalizedData.prenom || !normalizedData.nom) {
      throw new Error(`Données personne incomplètes: ${JSON.stringify({
        email: normalizedData.email,
        prenom: normalizedData.prenom,
        nom: normalizedData.nom
      })}`);
    }

    // Chercher une personne existante par email
    const existingQuery = query(
      collection(db, 'personnes'),
      where('entrepriseId', '==', entrepriseId),
      where('email', '==', normalizedData.email)
    );
    
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      // Personne existe déjà
      const existingDoc = existingSnapshot.docs[0];
      stats.personnesUpdated++;
      
      // Mettre à jour isPersonneLibre si nécessaire
      if (isPersonneLibre) {
        const batch = writeBatch(db);
        batch.update(existingDoc.ref, { 
          isPersonneLibre: true,
          updatedAt: serverTimestamp(),
          updatedBy: userId
        });
        await batch.commit();
      }
      
      // Détecter les doublons potentiels
      if (existingSnapshot.size > 1) {
        const key = `${entrepriseId}:${normalizedData.email}`;
        if (!stats.duplicates.personnes.has(key)) {
          stats.duplicates.personnes.set(key, []);
        }
        stats.duplicates.personnes.get(key).push(...existingSnapshot.docs.map(d => d.id));
      }
      
      return existingDoc.id;
    }

    // Créer une nouvelle personne
    const batch = writeBatch(db);
    const personneRef = doc(collection(db, 'personnes'));
    
    batch.set(personneRef, {
      ...normalizedData,
      createdBy: userId,
      updatedBy: userId
    });
    
    await batch.commit();
    stats.personnesCreated++;
    
    return personneRef.id;
  } catch (error) {
    stats.errors.push({
      type: 'personne',
      data: personneData,
      error: error.message
    });
    throw error;
  }
}

/**
 * Créer une liaison structure-personne
 */
async function createLiaison(entrepriseId, structureId, personneId, personneData, userId, isFirst = false) {
  try {
    const liaisonData = createLiaisonData(entrepriseId, structureId, personneId, personneData, isFirst);
    
    // Vérifier si la liaison existe déjà
    const existingQuery = query(
      collection(db, 'liaisons'),
      where('entrepriseId', '==', entrepriseId),
      where('structureId', '==', structureId),
      where('personneId', '==', personneId)
    );
    
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      // Liaison existe déjà, la réactiver si nécessaire
      const existingDoc = existingSnapshot.docs[0];
      const existingData = existingDoc.data();
      
      if (!existingData.actif) {
        const batch = writeBatch(db);
        batch.update(existingDoc.ref, {
          actif: true,
          fonction: liaisonData.fonction,
          prioritaire: isFirst,
          updatedAt: serverTimestamp(),
          updatedBy: userId
        });
        await batch.commit();
      }
      
      return existingDoc.id;
    }

    // Créer une nouvelle liaison
    const batch = writeBatch(db);
    const liaisonRef = doc(collection(db, 'liaisons'));
    
    batch.set(liaisonRef, {
      ...liaisonData,
      createdBy: userId,
      updatedBy: userId
    });
    
    await batch.commit();
    stats.liaisonsCreated++;
    
    return liaisonRef.id;
  } catch (error) {
    stats.errors.push({
      type: 'liaison',
      data: { structureId, personneId, personneData },
      error: error.message
    });
    throw error;
  }
}

/**
 * Migrer un document contacts_unified
 */
async function migrateContact(contactDoc, userId) {
  try {
    const contactData = contactDoc.data();
    const contactId = contactDoc.id;
    
    console.log(`📄 Migration ${contactData.entityType}: ${contactId}`);
    
    if (contactData.entityType === 'structure') {
      // Migrer une structure avec ses personnes
      const structureId = await upsertStructure(
        contactData.structure || {},
        contactData.entrepriseId,
        userId
      );
      
      // Migrer les personnes associées
      const personnes = contactData.personnes || [];
      for (let i = 0; i < personnes.length; i++) {
        const personneData = personnes[i];
        
        try {
          const personneId = await upsertPersonne(
            personneData,
            contactData.entrepriseId,
            userId,
            false // Pas une personne libre
          );
          
          // Créer la liaison
          await createLiaison(
            contactData.entrepriseId,
            structureId,
            personneId,
            personneData,
            userId,
            i === 0 // Le premier contact est prioritaire
          );
          
        } catch (error) {
          console.error(`  ❌ Erreur personne ${personneData.prenom} ${personneData.nom}:`, error.message);
        }
      }
      
    } else if (contactData.entityType === 'personne_libre') {
      // Migrer une personne libre
      await upsertPersonne(
        contactData.personne || {},
        contactData.entrepriseId,
        userId,
        true // Personne libre
      );
    }
    
    stats.totalProcessed++;
    
  } catch (error) {
    console.error(`❌ Erreur migration ${contactDoc.id}:`, error.message);
    stats.errors.push({
      type: 'migration',
      contactId: contactDoc.id,
      error: error.message
    });
  }
}

/**
 * Migrer tous les contacts d'une organisation
 */
async function migrateOrganizationContacts(entrepriseId, userId) {
  console.log(`🏢 Migration organisation: ${entrepriseId}\n`);
  
  try {
    // Récupérer tous les contacts de l'organisation
    const contactsQuery = query(
      collection(db, 'contacts_unified'),
      where('entrepriseId', '==', entrepriseId)
    );
    
    const contactsSnapshot = await getDocs(contactsQuery);
    console.log(`📊 ${contactsSnapshot.size} contacts à migrer\n`);
    
    // Traiter par batch
    const batchSize = 50;
    const contacts = contactsSnapshot.docs;
    
    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize);
      console.log(`🔄 Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(contacts.length / batchSize)} (${batch.length} contacts)`);
      
      // Traiter les contacts du batch en parallèle
      await Promise.all(batch.map(contact => migrateContact(contact, userId)));
      
      console.log(`✅ Batch terminé\n`);
    }
    
  } catch (error) {
    console.error(`❌ Erreur migration organisation ${entrepriseId}:`, error.message);
    throw error;
  }
}

/**
 * Générer le rapport de migration
 */
function generateReport() {
  console.log('\n📊 RAPPORT DE MIGRATION');
  console.log('=======================\n');
  
  console.log(`✅ Documents traités: ${stats.totalProcessed}`);
  console.log(`🏢 Structures créées: ${stats.structuresCreated}`);
  console.log(`🏢 Structures mises à jour: ${stats.structuresUpdated}`);
  console.log(`👤 Personnes créées: ${stats.personnesCreated}`);
  console.log(`👤 Personnes mises à jour: ${stats.personnesUpdated}`);
  console.log(`🔗 Liaisons créées: ${stats.liaisonsCreated}`);
  console.log(`❌ Erreurs: ${stats.errors.length}\n`);
  
  // Rapport des doublons
  if (stats.duplicates.structures.size > 0) {
    console.log('⚠️  DOUBLONS STRUCTURES DÉTECTÉS:');
    stats.duplicates.structures.forEach((ids, key) => {
      console.log(`  - ${key}: ${ids.length} doublons (${ids.join(', ')})`);
    });
    console.log();
  }
  
  if (stats.duplicates.personnes.size > 0) {
    console.log('⚠️  DOUBLONS PERSONNES DÉTECTÉS:');
    stats.duplicates.personnes.forEach((ids, key) => {
      console.log(`  - ${key}: ${ids.length} doublons (${ids.join(', ')})`);
    });
    console.log();
  }
  
  // Détail des erreurs
  if (stats.errors.length > 0) {
    console.log('❌ DÉTAIL DES ERREURS:');
    stats.errors.slice(0, 10).forEach((error, index) => {
      console.log(`  ${index + 1}. [${error.type}] ${error.error}`);
      if (error.data) {
        console.log(`     Data: ${JSON.stringify(error.data).substring(0, 100)}...`);
      }
    });
    
    if (stats.errors.length > 10) {
      console.log(`     ... et ${stats.errors.length - 10} autres erreurs`);
    }
    console.log();
  }
  
  // Taux de réussite
  const successRate = stats.totalProcessed > 0 
    ? ((stats.totalProcessed - stats.errors.length) / stats.totalProcessed * 100).toFixed(1)
    : 0;
  
  console.log(`📈 Taux de réussite: ${successRate}%`);
  
  if (stats.errors.length === 0) {
    console.log('\n🎉 Migration réussie sans erreur!');
  } else {
    console.log('\n⚠️  Migration terminée avec des erreurs. Vérifiez les détails ci-dessus.');
  }
}

/**
 * Script principal
 */
async function main() {
  try {
    // Vérifier les arguments
    if (process.argv.length < 5) {
      console.log('Usage: node migrate-to-relational-contacts.js <email> <password> <entrepriseId> [--dry-run]');
      console.log('Example: node migrate-to-relational-contacts.js admin@example.com password123 org-123');
      console.log('\nOptions:');
      console.log('  --dry-run    Simuler la migration sans écrire dans Firestore');
      process.exit(1);
    }
    
    const [,, email, password, entrepriseId] = process.argv;
    const isDryRun = process.argv.includes('--dry-run');
    
    if (isDryRun) {
      console.log('🧪 MODE SIMULATION - Aucune donnée ne sera écrite\n');
    }
    
    // Se connecter
    console.log('🔐 Connexion à Firebase...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;
    console.log(`✅ Connecté en tant que: ${userCredential.user.email}\n`);
    
    // Vérifier que les collections cibles existent
    console.log('🔍 Vérification des collections cibles...');
    const testQuery = query(collection(db, 'structures'), where('entrepriseId', '==', 'test'));
    await getDocs(testQuery);
    console.log('✅ Collections cibles accessibles\n');
    
    if (!isDryRun) {
      // Lancer la migration
      await migrateOrganizationContacts(entrepriseId, userId);
    } else {
      console.log('🧪 Simulation terminée - utilisez sans --dry-run pour migrer');
    }
    
    // Générer le rapport
    generateReport();
    
  } catch (error) {
    console.error('\n❌ ERREUR FATALE:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
  
  process.exit(0);
}

// Exécuter le script
main();