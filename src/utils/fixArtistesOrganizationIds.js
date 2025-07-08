/**
 * Utilitaire pour corriger les entrepriseIds des artistes
 * Utilisé pour la migration et la maintenance des données
 * Version: 2.0
 */

import { collection, getDocs, updateDoc, doc, where, query } from 'firebase/firestore';
import { db } from '@/services/firebase-service';

/**
 * Corrige les entrepriseIds manquants pour les artistes
 * @param {string} entrepriseId - L'ID de l'organisation
 * @returns {Promise<Object>} Résultat de la correction
 */
export async function fixArtistesEntrepriseIds(entrepriseId) {
  console.log('[fixArtistesEntrepriseIds] Début de la correction pour:', entrepriseId);
  
  try {
    // Chercher les artistes sans entrepriseId
    const artistesQuery = query(
      collection(db, 'artistes'),
      where('entrepriseId', '==', null)
    );
    
    const snapshot = await getDocs(artistesQuery);
    
    if (snapshot.empty) {
      console.log('[fixArtistesEntrepriseIds] Aucun artiste à corriger');
      return {
        success: true,
        count: 0,
        message: 'Aucun artiste à corriger'
      };
    }
    
    let fixed = 0;
    const promises = [];
    
    snapshot.forEach((artisteDoc) => {
      const artisteRef = doc(db, 'artistes', artisteDoc.id);
      promises.push(
        updateDoc(artisteRef, {
          entrepriseId: entrepriseId,
          _fixedAt: new Date().toISOString(),
          _fixedBy: 'fixArtistesEntrepriseIds'
        })
      );
      fixed++;
    });
    
    await Promise.all(promises);
    
    console.log(`[fixArtistesEntrepriseIds] ${fixed} artistes corrigés`);
    
    return {
      success: true,
      count: fixed,
      message: `${fixed} artistes corrigés avec succès`
    };
    
  } catch (error) {
    console.error('[fixArtistesEntrepriseIds] Erreur:', error);
    return {
      success: false,
      count: 0,
      message: error.message,
      error
    };
  }
}

/**
 * Vérifie l'état des entrepriseIds des artistes
 * @returns {Promise<Object>} État des artistes
 */
export async function checkArtistesEntrepriseIds() {
  try {
    const snapshot = await getDocs(collection(db, 'artistes'));
    
    let withOrgId = 0;
    let withoutOrgId = 0;
    const missingOrgIds = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.entrepriseId) {
        withOrgId++;
      } else {
        withoutOrgId++;
        missingOrgIds.push({
          id: doc.id,
          nom: data.nom
        });
      }
    });
    
    return {
      total: snapshot.size,
      withOrgId,
      withoutOrgId,
      missingOrgIds
    };
    
  } catch (error) {
    console.error('[checkArtistesEntrepriseIds] Erreur:', error);
    throw error;
  }
}

/**
 * Installe les fixers pour les artistes
 * Fonction d'initialisation qui peut installer des listeners ou des hooks
 */
export function installArtistesFixers() {
  console.log('[installArtistesFixers] Installation des fixers pour les artistes');
  
  // Pour l'instant, cette fonction ne fait rien de spécial
  // Elle pourrait installer des listeners Firebase ou des hooks React
  // selon les besoins futurs
  
  return {
    checkStatus: checkArtistesEntrepriseIds,
    fix: fixArtistesEntrepriseIds
  };
}