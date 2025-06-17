/**
 * Script de migration des paramètres globaux vers l'organisation
 * Migre les données de parametres/global vers organizations/{id}/parametres/settings
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuration Firebase (utilisez votre config)
const firebaseConfig = {
  // Copiez votre configuration Firebase ici
  // ou importez-la depuis votre fichier de config
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/**
 * Migre les paramètres globaux vers une organisation spécifique
 * @param {string} organizationId - ID de l'organisation cible
 */
export async function migrateParametersToOrganization(organizationId) {
  if (!organizationId) {
    throw new Error('ID d\'organisation requis');
  }

  console.log('🔄 Début de la migration des paramètres...');
  console.log('📋 Organisation cible:', organizationId);

  try {
    // 1. Charger les paramètres globaux existants
    console.log('📖 Lecture des paramètres globaux...');
    const globalDoc = await getDoc(doc(db, 'parametres', 'global'));
    
    if (!globalDoc.exists()) {
      console.log('ℹ️ Aucun paramètre global trouvé à migrer');
      return { success: true, message: 'Aucune donnée à migrer' };
    }

    const globalData = globalDoc.data();
    console.log('✅ Paramètres globaux chargés:', Object.keys(globalData));

    // 2. Vérifier si l'organisation existe
    console.log('🏢 Vérification de l\'organisation...');
    const orgDoc = await getDoc(doc(db, 'organizations', organizationId));
    
    if (!orgDoc.exists()) {
      throw new Error(`Organisation ${organizationId} introuvable`);
    }

    console.log('✅ Organisation trouvée:', orgDoc.data().name || 'Sans nom');

    // 3. Vérifier si des paramètres existent déjà pour cette organisation
    const orgParamsDoc = await getDoc(
      doc(db, 'organizations', organizationId, 'parametres', 'settings')
    );

    if (orgParamsDoc.exists()) {
      console.log('⚠️ Des paramètres existent déjà pour cette organisation');
      
      // Fusion intelligente : garder les paramètres existants et ajouter ceux manquants
      const existingData = orgParamsDoc.data();
      const mergedData = { ...globalData };
      
      // Pour chaque section existante, garder les données de l'organisation
      Object.keys(existingData).forEach(section => {
        if (existingData[section] && typeof existingData[section] === 'object') {
          mergedData[section] = {
            ...globalData[section],
            ...existingData[section]
          };
        }
      });

      console.log('🔄 Fusion des paramètres existants et globaux...');
      await setDoc(
        doc(db, 'organizations', organizationId, 'parametres', 'settings'),
        mergedData,
        { merge: true }
      );
    } else {
      // 4. Copier tous les paramètres globaux vers l'organisation
      console.log('💾 Copie des paramètres vers l\'organisation...');
      await setDoc(
        doc(db, 'organizations', organizationId, 'parametres', 'settings'),
        globalData
      );
    }

    console.log('✅ Migration terminée avec succès !');
    
    // 5. Vérification de la migration
    const migratedDoc = await getDoc(
      doc(db, 'organizations', organizationId, 'parametres', 'settings')
    );
    
    if (migratedDoc.exists()) {
      const migratedData = migratedDoc.data();
      console.log('🔍 Vérification: paramètres migrés:', Object.keys(migratedData));
      
      // Vérifier spécifiquement les données sensibles (email)
      if (migratedData.email?.brevo?.apiKey) {
        console.log('🔐 Configuration Brevo migrée (clé API chiffrée)');
      }
      if (migratedData.email?.smtp?.pass) {
        console.log('🔐 Configuration SMTP migrée (mot de passe chiffré)');
      }
    }

    return {
      success: true,
      message: 'Migration réussie',
      organizationId,
      sectionsCount: Object.keys(globalData).length
    };

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  }
}

/**
 * Fonction de migration automatique pour l'utilisateur actuel
 * Utilise la première organisation de l'utilisateur comme cible
 */
export async function autoMigrateCurrentUser() {
  console.log('🚀 Migration automatique pour l\'utilisateur actuel...');
  
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Utilisateur non connecté');
  }

  try {
    // Récupérer les organisations de l'utilisateur
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      throw new Error('Profil utilisateur introuvable');
    }

    const userData = userDoc.data();
    const organizations = userData.organizations || [];
    
    if (organizations.length === 0) {
      throw new Error('Aucune organisation trouvée pour cet utilisateur');
    }

    // Utiliser la première organisation (ou celle par défaut)
    const targetOrgId = userData.defaultOrganization || organizations[0];
    console.log('🎯 Organisation cible automatique:', targetOrgId);

    return await migrateParametersToOrganization(targetOrgId);

  } catch (error) {
    console.error('❌ Erreur migration automatique:', error);
    throw error;
  }
}

// Utilitaire pour lancer la migration depuis la console du navigateur
if (typeof window !== 'undefined') {
  window.migrateParametersToOrganization = migrateParametersToOrganization;
  window.autoMigrateCurrentUser = autoMigrateCurrentUser;
  
  console.log('🛠️ Fonctions de migration disponibles dans la console :');
  console.log('   migrateParametersToOrganization(organizationId)');
  console.log('   autoMigrateCurrentUser()');
}

export default {
  migrateParametersToOrganization,
  autoMigrateCurrentUser
};