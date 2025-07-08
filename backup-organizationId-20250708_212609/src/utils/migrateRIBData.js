/**
 * Utilitaire de migration des données RIB
 * Migre les données RIB depuis les paramètres de facturation vers les données d'entreprise
 * Version navigateur pour test et débogage
 */

import { db, doc, getDoc, setDoc } from '@/services/firebase-service';

export async function migrateRIBDataForOrganization(organizationId) {
  console.log('🏦 Migration des données RIB pour l\'organisation:', organizationId);
  
  try {
    // Récupérer les paramètres de facturation
    const factureParamsRef = doc(db, 'organizations', organizationId, 'settings', 'factureParameters');
    const factureParamsDoc = await getDoc(factureParamsRef);
    
    if (!factureParamsDoc.exists()) {
      console.log('⚠️  Pas de paramètres de facturation trouvés');
      return { success: false, message: 'Pas de paramètres de facturation trouvés' };
    }
    
    const factureParams = factureParamsDoc.data();
    const parameters = factureParams.parameters || {};
    
    // Vérifier s'il y a des données RIB à migrer
    if (!parameters.iban && !parameters.bic && !parameters.nomBanque) {
      console.log('ℹ️  Pas de données RIB à migrer');
      return { success: false, message: 'Pas de données RIB à migrer' };
    }
    
    console.log('🔍 Données RIB trouvées:');
    console.log('   - IBAN:', parameters.iban || 'Non défini');
    console.log('   - BIC:', parameters.bic || 'Non défini');
    console.log('   - Banque:', parameters.nomBanque || 'Non défini');
    
    // Récupérer les données d'entreprise existantes
    const entrepriseRef = doc(db, 'organizations', organizationId, 'settings', 'entreprise');
    const entrepriseDoc = await getDoc(entrepriseRef);
    
    let entrepriseData = {};
    if (entrepriseDoc.exists()) {
      entrepriseData = entrepriseDoc.data();
    }
    
    // Ajouter les données RIB aux données d'entreprise
    const updatedData = {
      ...entrepriseData,
      iban: parameters.iban || entrepriseData.iban || '',
      bic: parameters.bic || entrepriseData.bic || '',
      banque: parameters.nomBanque || entrepriseData.banque || '',
      updatedAt: new Date().toISOString(),
      updatedBy: 'migration-utility'
    };
    
    // Sauvegarder les données mises à jour
    await setDoc(entrepriseRef, updatedData, { merge: true });
    
    console.log('✅ Données RIB migrées avec succès');
    
    return { 
      success: true, 
      message: 'Données RIB migrées avec succès',
      data: {
        iban: updatedData.iban,
        bic: updatedData.bic,
        banque: updatedData.banque
      }
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    return { success: false, message: error.message };
  }
}

// Fonction de test pour vérifier les données RIB
export async function checkRIBData(organizationId) {
  console.log('🔍 Vérification des données RIB pour l\'organisation:', organizationId);
  
  try {
    // Vérifier dans les paramètres de facturation
    const factureParamsRef = doc(db, 'organizations', organizationId, 'settings', 'factureParameters');
    const factureParamsDoc = await getDoc(factureParamsRef);
    
    let factureRIB = {};
    if (factureParamsDoc.exists()) {
      const parameters = factureParamsDoc.data().parameters || {};
      factureRIB = {
        iban: parameters.iban,
        bic: parameters.bic,
        banque: parameters.nomBanque
      };
    }
    
    // Vérifier dans les données d'entreprise
    const entrepriseRef = doc(db, 'organizations', organizationId, 'settings', 'entreprise');
    const entrepriseDoc = await getDoc(entrepriseRef);
    
    let entrepriseRIB = {};
    if (entrepriseDoc.exists()) {
      const data = entrepriseDoc.data();
      entrepriseRIB = {
        iban: data.iban,
        bic: data.bic,
        banque: data.banque
      };
    }
    
    console.log('📊 Résultat de la vérification:');
    console.log('   Paramètres de facturation:', factureRIB);
    console.log('   Données entreprise:', entrepriseRIB);
    
    return {
      factureParameters: factureRIB,
      entrepriseData: entrepriseRIB
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    return null;
  }
}