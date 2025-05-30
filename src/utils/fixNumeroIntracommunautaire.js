/**
 * Utilitaire pour corriger le numéro intracommunautaire manquant
 * dans les soumissions existantes
 */

import { db, doc, getDoc, updateDoc } from '@/services/firebase-service';

/**
 * Met à jour le champ numeroIntracommunautaire dans structureData
 * si il existe dans rawData mais pas dans structureData
 * 
 * @param {string} submissionId - L'ID de la soumission à corriger
 * @returns {Promise<boolean>} - true si la mise à jour a réussi
 */
export async function fixNumeroIntracommunautaire(submissionId) {
  try {
    console.log(`Correction de la soumission ${submissionId}...`);
    
    // Récupérer la soumission
    const submissionRef = doc(db, 'formSubmissions', submissionId);
    const submissionDoc = await getDoc(submissionRef);
    
    if (!submissionDoc.exists()) {
      console.error('Soumission non trouvée');
      return false;
    }
    
    const data = submissionDoc.data();
    
    // Vérifier si rawData contient structureNumeroIntracommunautaire
    if (data.rawData?.structureNumeroIntracommunautaire) {
      console.log('Numéro intracommunautaire trouvé dans rawData:', data.rawData.structureNumeroIntracommunautaire);
      
      // Mettre à jour structureData
      await updateDoc(submissionRef, {
        'structureData.numeroIntracommunautaire': data.rawData.structureNumeroIntracommunautaire
      });
      
      console.log('✓ Soumission mise à jour avec succès');
      return true;
    } else {
      console.log('Aucun numéro intracommunautaire trouvé dans rawData');
      return false;
    }
  } catch (error) {
    console.error('Erreur lors de la correction:', error);
    return false;
  }
}

// Fonction pour utilisation directe dans la console
window.fixNumeroIntracommunautaire = fixNumeroIntracommunautaire;

// Instructions pour l'utilisation
console.log(`
Pour corriger une soumission, exécutez dans la console :
fixNumeroIntracommunautaire('ID_DE_LA_SOUMISSION')

Par exemple :
fixNumeroIntracommunautaire('VttXFnMWefZUPRXJbOPN')
`); 