/**
 * @fileoverview Script de migration pour ajouter le champ status aux relances automatiques existantes
 * Ce script corrige les relances automatiques qui n'ont pas le champ status nécessaire pour le filtrage
 * 
 * @author TourCraft Team
 * @since 2025
 */

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc 
} from '@/services/firebase-service';
import { db } from '@/services/firebase-service';

/**
 * Migre les relances automatiques pour ajouter le champ status manquant
 * 
 * @param {string} organizationId - ID de l'organisation
 * @returns {Promise<Object>} Résultat de la migration
 */
export const migrateRelancesAutomatiques = async (organizationId) => {
  try {
    console.log(`🔄 Migration des relances automatiques pour l'organisation: ${organizationId}`);
    
    // 1. Récupérer toutes les relances automatiques de l'organisation
    const relancesQuery = query(
      collection(db, 'relances'),
      where('organizationId', '==', organizationId),
      where('automatique', '==', true)
    );
    
    const snapshot = await getDocs(relancesQuery);
    console.log(`📊 ${snapshot.size} relances automatiques trouvées`);
    
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    // 2. Pour chaque relance automatique
    for (const relanceDoc of snapshot.docs) {
      try {
        const relanceData = relanceDoc.data();
        const relanceId = relanceDoc.id;
        
        // 3. Vérifier si le champ status existe déjà
        if (relanceData.status) {
          console.log(`⏩ Relance ${relanceId} déjà migrée (status: ${relanceData.status})`);
          skipped++;
          continue;
        }
        
        // 4. Déterminer le status basé sur le champ terminee
        const status = relanceData.terminee === true ? 'completed' : 'pending';
        
        // 5. Mettre à jour la relance avec le champ status
        await updateDoc(doc(db, 'relances', relanceId), {
          status: status,
          migratedAt: new Date().toISOString()
        });
        
        console.log(`✅ Relance ${relanceId} migrée: terminee=${relanceData.terminee} -> status=${status}`);
        updated++;
        
      } catch (error) {
        console.error(`❌ Erreur lors de la migration de la relance ${relanceDoc.id}:`, error);
        errors++;
      }
    }
    
    const result = {
      total: snapshot.size,
      updated,
      skipped,
      errors
    };
    
    console.log('\n' + '═'.repeat(50));
    console.log('📊 RÉSULTAT DE LA MIGRATION:');
    console.log(`  • Total des relances automatiques: ${result.total}`);
    console.log(`  • Mises à jour: ${result.updated}`);
    console.log(`  • Ignorées (déjà migrées): ${result.skipped}`);
    console.log(`  • Erreurs: ${result.errors}`);
    
    if (result.updated > 0) {
      console.log(`\n✅ Migration réussie! ${result.updated} relances automatiques ont été mises à jour avec le champ status.`);
    }
    
    if (result.errors > 0) {
      console.log(`\n⚠️  ${result.errors} erreurs rencontrées pendant la migration.`);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration des relances automatiques:', error);
    throw error;
  }
};

/**
 * Vérifie l'état de migration des relances automatiques
 * 
 * @param {string} organizationId - ID de l'organisation
 * @returns {Promise<Object>} État de la migration
 */
export const checkMigrationStatus = async (organizationId) => {
  try {
    console.log(`🔍 Vérification de l'état de migration pour l'organisation: ${organizationId}`);
    
    const relancesQuery = query(
      collection(db, 'relances'),
      where('organizationId', '==', organizationId),
      where('automatique', '==', true)
    );
    
    const snapshot = await getDocs(relancesQuery);
    
    let withStatus = 0;
    let withoutStatus = 0;
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.status) {
        withStatus++;
      } else {
        withoutStatus++;
      }
    });
    
    const status = {
      total: snapshot.size,
      withStatus,
      withoutStatus,
      migrationNeeded: withoutStatus > 0,
      migrationComplete: withoutStatus === 0
    };
    
    console.log('\n📊 ÉTAT DE LA MIGRATION:');
    console.log(`  • Total des relances automatiques: ${status.total}`);
    console.log(`  • Avec champ status: ${status.withStatus}`);
    console.log(`  • Sans champ status: ${status.withoutStatus}`);
    console.log(`  • Migration nécessaire: ${status.migrationNeeded ? 'OUI' : 'NON'}`);
    
    if (status.migrationNeeded) {
      console.log(`\n💡 Pour migrer les relances manquantes, exécuter:`);
      console.log(`migrateRelancesAutomatiques('${organizationId}')`);
    }
    
    return status;
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    throw error;
  }
};

// Rendre disponible dans la console
if (typeof window !== 'undefined') {
  window.migrateRelancesAutomatiques = migrateRelancesAutomatiques;
  window.checkMigrationStatus = checkMigrationStatus;
  
  console.log(`
🔧 Outils de migration des relances automatiques disponibles:

• checkMigrationStatus('org-id') - Vérifier l'état de migration
• migrateRelancesAutomatiques('org-id') - Migrer les relances automatiques

Exemple:
checkMigrationStatus('tTvA6fzQpi6u3kx8wZO8')
migrateRelancesAutomatiques('tTvA6fzQpi6u3kx8wZO8')
  `);
}

const migrationUtils = {
  migrateRelancesAutomatiques,
  checkMigrationStatus
};

export default migrationUtils;