/**
 * Migration automatique des données RIB
 * S'exécute une seule fois par entreprise pour migrer les données RIB
 */

import { db, doc, getDoc, setDoc } from '@/services/firebase-service';

/**
 * Vérifie si la migration a déjà été effectuée pour cette entreprise
 */
async function isMigrationCompleted(entrepriseId) {
  try {
    const migrationRef = doc(db, 'entreprises', entrepriseId, 'migrations', 'ribMigration');
    const migrationDoc = await getDoc(migrationRef);
    return migrationDoc.exists() && migrationDoc.data().completed === true;
  } catch (error) {
    console.error('Erreur lors de la vérification de la migration:', error);
    return false;
  }
}

/**
 * Marque la migration comme complétée
 */
async function markMigrationCompleted(entrepriseId) {
  try {
    const migrationRef = doc(db, 'entreprises', entrepriseId, 'migrations', 'ribMigration');
    await setDoc(migrationRef, {
      completed: true,
      completedAt: new Date().toISOString(),
      version: '1.0'
    });
  } catch (error) {
    console.error('Erreur lors du marquage de la migration:', error);
  }
}

/**
 * Effectue la migration automatique des données RIB
 */
export async function autoMigrateRIB(entrepriseId) {
  if (!entrepriseId) return;

  try {
    // Vérifier si la migration a déjà été effectuée
    const isCompleted = await isMigrationCompleted(entrepriseId);
    if (isCompleted) {
      console.log('✅ Migration RIB déjà effectuée pour cette entreprise');
      return;
    }

    console.log('🔄 Début de la migration automatique des données RIB...');

    // Récupérer les paramètres de facturation
    const factureParamsRef = doc(db, 'entreprises', entrepriseId, 'settings', 'factureParameters');
    const factureParamsDoc = await getDoc(factureParamsRef);
    
    if (!factureParamsDoc.exists()) {
      console.log('ℹ️  Pas de paramètres de facturation trouvés');
      await markMigrationCompleted(entrepriseId);
      return;
    }
    
    const factureParams = factureParamsDoc.data();
    const parameters = factureParams.parameters || {};
    
    // Vérifier s'il y a des données RIB à migrer
    if (!parameters.iban && !parameters.bic && !parameters.nomBanque) {
      console.log('ℹ️  Pas de données RIB à migrer');
      await markMigrationCompleted(entrepriseId);
      return;
    }
    
    console.log('🔍 Données RIB trouvées dans les paramètres de facturation');
    
    // Récupérer les données d'entreprise existantes
    const entrepriseRef = doc(db, 'entreprises', entrepriseId, 'settings', 'entreprise');
    const entrepriseDoc = await getDoc(entrepriseRef);
    
    let entrepriseData = {};
    if (entrepriseDoc.exists()) {
      entrepriseData = entrepriseDoc.data();
    }
    
    // Ne migrer que si les données n'existent pas déjà dans entreprise
    const needsUpdate = 
      (!entrepriseData.iban && parameters.iban) ||
      (!entrepriseData.bic && parameters.bic) ||
      (!entrepriseData.banque && parameters.nomBanque);
    
    if (!needsUpdate) {
      console.log('ℹ️  Les données RIB existent déjà dans entreprise');
      await markMigrationCompleted(entrepriseId);
      return;
    }
    
    // Ajouter les données RIB aux données d'entreprise
    const updatedData = {
      ...entrepriseData,
      iban: entrepriseData.iban || parameters.iban || '',
      bic: entrepriseData.bic || parameters.bic || '',
      banque: entrepriseData.banque || parameters.nomBanque || '',
      updatedAt: new Date().toISOString(),
      updatedBy: 'auto-migration'
    };
    
    // Sauvegarder les données mises à jour
    await setDoc(entrepriseRef, updatedData, { merge: true });
    
    console.log('✅ Migration RIB effectuée avec succès');
    console.log('   - IBAN:', updatedData.iban ? '✓' : '✗');
    console.log('   - BIC:', updatedData.bic ? '✓' : '✗');
    console.log('   - Banque:', updatedData.banque ? '✓' : '✗');
    
    // Marquer la migration comme complétée
    await markMigrationCompleted(entrepriseId);
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration automatique RIB:', error);
  }
}

/**
 * Réinitialise le flag de migration (utile pour les tests)
 */
export async function resetMigrationFlag(entrepriseId) {
  if (!entrepriseId) return;
  
  try {
    const migrationRef = doc(db, 'entreprises', entrepriseId, 'migrations', 'ribMigration');
    await setDoc(migrationRef, {
      completed: false,
      resetAt: new Date().toISOString()
    });
    console.log('🔄 Flag de migration RIB réinitialisé');
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du flag:', error);
  }
}