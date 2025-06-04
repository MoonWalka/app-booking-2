/**
 * Script de migration vers le modèle multi-organisation
 * 
 * Ce script :
 * 1. Crée une organisation par défaut pour les données existantes
 * 2. Migre toutes les collections vers des collections organisationnelles
 * 3. Met à jour les références entre documents
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  writeBatch,
  serverTimestamp,
  db
} from '@/services/firebase-service';

// Configuration de la migration
const DEFAULT_ORG_NAME = "Organisation principale";
const DEFAULT_ORG_SLUG = "organisation-principale";
const DEFAULT_ADMIN_EMAIL = process.env.REACT_APP_DEFAULT_ADMIN_EMAIL || "admin@tourcraft.fr";

// Collections à migrer
const COLLECTIONS_TO_MIGRATE = [
  'contacts',
  'concerts',
  'lieux',
  'artistes',
  'structures',
  'contrats'
];

// Créer l'organisation par défaut
async function createDefaultOrganization(adminUserId) {
  console.log('🏢 Création de l\'organisation par défaut...');
  
  const orgRef = doc(collection(db, 'organizations'));
  const orgId = orgRef.id;
  
  const organizationData = {
    name: DEFAULT_ORG_NAME,
    slug: DEFAULT_ORG_SLUG,
    type: 'venue', // Type par défaut
    ownerId: adminUserId,
    members: {
      [adminUserId]: {
        role: 'owner',
        joinedAt: serverTimestamp(),
        permissions: ['all']
      }
    },
    settings: {
      timezone: 'Europe/Paris',
      currency: 'EUR'
    },
    createdAt: serverTimestamp(),
    isActive: true
  };
  
  await setDoc(orgRef, organizationData);
  
  // Ajouter l'organisation à l'index utilisateur
  const userOrgRef = doc(db, 'user_organizations', adminUserId);
  await setDoc(userOrgRef, {
    organizations: {
      [orgId]: {
        role: 'owner',
        joinedAt: serverTimestamp()
      }
    },
    defaultOrganization: orgId
  });
  
  console.log('✅ Organisation créée avec l\'ID:', orgId);
  return orgId;
}

// Migrer une collection
async function migrateCollection(collectionName, orgId) {
  console.log(`📋 Migration de la collection: ${collectionName}...`);
  
  try {
    const oldCollection = collection(db, collectionName);
    const snapshot = await getDocs(oldCollection);
    
    if (snapshot.empty) {
      console.log(`ℹ️ Collection ${collectionName} vide, rien à migrer`);
      return 0;
    }
    
    const newCollectionName = `${collectionName}_org_${orgId}`;
    const batch = writeBatch(db);
    let count = 0;
    
    snapshot.forEach((docSnapshot) => {
      const docData = docSnapshot.data();
      const newDocRef = doc(db, newCollectionName, docSnapshot.id);
      
      // Ajouter l'ID de l'organisation aux données
      batch.set(newDocRef, {
        ...docData,
        organizationId: orgId,
        migratedAt: serverTimestamp()
      });
      
      count++;
      
      // Firebase limite à 500 opérations par batch
      if (count % 500 === 0) {
        console.log(`  Traitement en cours... ${count} documents`);
      }
    });
    
    // Exécuter le batch
    await batch.commit();
    console.log(`✅ ${count} documents migrés pour ${collectionName}`);
    
    return count;
  } catch (error) {
    console.error(`❌ Erreur lors de la migration de ${collectionName}:`, error);
    throw error;
  }
}

// Obtenir l'ID de l'utilisateur admin
async function getAdminUserId() {
  // D'abord, essayer de trouver un utilisateur avec l'email admin par défaut
  const usersSnapshot = await getDocs(collection(db, 'users'));
  
  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    if (userData.email === DEFAULT_ADMIN_EMAIL) {
      return userDoc.id;
    }
  }
  
  // Si aucun admin trouvé, retourner le premier utilisateur
  if (!usersSnapshot.empty) {
    console.warn(`⚠️ Aucun utilisateur admin trouvé avec l'email ${DEFAULT_ADMIN_EMAIL}`);
    console.log('Utilisation du premier utilisateur trouvé');
    return usersSnapshot.docs[0].id;
  }
  
  throw new Error('Aucun utilisateur trouvé dans la base de données');
}

// Fonction principale de migration
export async function migrateToMultiOrg() {
  console.log('🚀 Début de la migration vers le modèle multi-organisation');
  console.log('================================================');
  
  try {
    // 1. Obtenir l'ID de l'utilisateur admin
    const adminUserId = await getAdminUserId();
    console.log('👤 Utilisateur admin identifié:', adminUserId);
    
    // 2. Créer l'organisation par défaut
    const orgId = await createDefaultOrganization(adminUserId);
    
    // 3. Migrer chaque collection
    console.log('\n📦 Migration des collections...');
    const migrationStats = {};
    
    for (const collectionName of COLLECTIONS_TO_MIGRATE) {
      const count = await migrateCollection(collectionName, orgId);
      migrationStats[collectionName] = count;
    }
    
    // 4. Afficher le résumé
    console.log('\n✅ Migration terminée avec succès !');
    console.log('================================================');
    console.log('📊 Résumé de la migration :');
    
    Object.entries(migrationStats).forEach(([collection, count]) => {
      console.log(`   - ${collection}: ${count} documents`);
    });
    
    console.log('\n🎉 Votre application est maintenant multi-organisation !');
    console.log(`   Organisation créée: ${DEFAULT_ORG_NAME} (ID: ${orgId})`);
    
    return {
      success: true,
      orgId,
      stats: migrationStats
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Script exécutable
if (require.main === module) {
  migrateToMultiOrg()
    .then(result => {
      if (result.success) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Erreur fatale:', error);
      process.exit(1);
    });
} 